import axios from 'axios';
import authService from '@/services/authService';

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// เพิ่ม interceptor สำหรับแนบ token
apiClient.interceptors.request.use(config => {
  const token = authService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// สร้างตะกร้าหากยังไม่มี
const ensureCartExists = async (userId) => {
  try {
    // ตรวจสอบว่าผู้ใช้มีตะกร้าหรือไม่
    const userResponse = await apiClient.get(`/users/${userId}`);
    
    // หากไม่มีตะกร้า ให้สร้างใหม่
    if (!userResponse.data.cart) {
      await apiClient.post('/cart/create', { userId });
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring cart exists:', error);
    return false;
  }
};

// สร้างข้อมูลตะกร้าสำรองเมื่อไม่สามารถเชื่อมต่อกับ API ได้
const getLocalCartData = () => {
  const cartData = localStorage.getItem('petHubCart');
  if (cartData) {
    try {
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error parsing cart data from localStorage:', error);
      return [];
    }
  }
  return [];
};

// บันทึกข้อมูลตะกร้าลง localStorage
const saveLocalCartData = (cartItems) => {
  localStorage.setItem('petHubCart', JSON.stringify(cartItems));
};

const cartService = {
  // ดึงข้อมูลตะกร้าสินค้า
async getCart() {
    try {
      if (!authService.isLoggedIn()) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      }
  
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      console.log("User ID for cart:", userProfile.id);
      
      // ดึงข้อมูลผู้ใช้แบบละเอียด
      const userResponse = await apiClient.get(`/users/${userProfile.id}`);
      console.log("User data:", userResponse.data);
      
      // ถ้าผู้ใช้ไม่มีตะกร้า
      if (!userResponse.data.cart) {
        console.log("User has no cart");
        return { items: [] };
      }
      
      // ดึง cart ID - อาจจะเป็น object หรือ string
      let cartId;
      let cartItems = [];
      
      if (typeof userResponse.data.cart === 'object') {
        cartId = userResponse.data.cart._id;
        console.log("Cart is object, cart ID:", cartId);
        
        // ถ้า cart เป็น object และมี items โดยตรง
        if (userResponse.data.cart.items && Array.isArray(userResponse.data.cart.items)) {
          console.log("Cart has direct items array:", userResponse.data.cart.items);
          
          const items = [];
          for (const item of userResponse.data.cart.items) {
            try {
              let productId;
              
              // ตรวจสอบว่า productId เป็น object หรือ string
              if (typeof item.productId === 'object') {
                productId = item.productId._id || item.productId.id;
              } else {
                productId = item.productId;
              }
              
              console.log("Processing product with ID:", productId);
              
              if (!productId) {
                console.warn("Invalid productId found:", item.productId);
                continue;
              }
              
              // ดึงข้อมูลสินค้า
              const productResponse = await apiClient.get(`/admin/products/${productId}`);
              const product = productResponse.data;
              
              // หาข้อมูล option ที่เลือก
              const selectedOption = product.options.find(option => option.size === item.size);
              
              items.push({
                productId: productId,
                name: product.name,
                details: product.description || '',
                size: item.size,
                price: selectedOption ? selectedOption.price : 0,
                quantity: item.quantity,
                image: product.imageUrl ? `${apiUrl}/uploads/${product.imageUrl}` : null
              });
            } catch (productError) {
              console.error(`Error fetching product details:`, productError);
            }
          }
          
          return { items };
        }
      } else {
        cartId = userResponse.data.cart;
        console.log("Cart is string, cart ID:", cartId);
      }
      
      if (!cartId) {
        console.log("No valid cart ID found");
        return { items: [] };
      }
      
      // ใช้ localStorage แทนเนื่องจากยังไม่มี API endpoint ที่เหมาะสม
      const localCartItems = getLocalCartData();
      const items = localCartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        details: item.description || '',
        size: item.option || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || null
      }));
      
      console.log("Returning items from local storage:", items);
      return { items };
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      // ใช้ข้อมูลจาก localStorage แม้จะเกิดข้อผิดพลาด
      const localCartItems = getLocalCartData();
      const items = localCartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        details: item.description || '',
        size: item.option || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || null
      }));
      
      return { 
        items: items,
        isLocal: true // flag บอกว่าข้อมูลมาจาก localStorage
      };
    }
  },

  // เพิ่มสินค้าลงตะกร้า
  async addToCart(productId, size, quantity = 1) {
    try {
      if (!authService.isLoggedIn()) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      }
  
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
  
      // ตรวจสอบข้อมูลสินค้าและสต็อก
      const productResponse = await apiClient.get(`/admin/products/${productId}`);
      const product = productResponse.data;
      
      // หาตัวเลือกที่เลือก
      const selectedOption = product.options.find(option => option.size === size);
      
      if (!selectedOption) {
        throw new Error('ไม่พบตัวเลือกสินค้าที่ระบุ');
      }
      
      // ตรวจสอบสต็อก
      if (selectedOption.stock < quantity) {
        throw new Error(`สินค้า ${product.name} (${size}) มีในสต็อกเพียง ${selectedOption.stock} ชิ้น ไม่เพียงพอกับจำนวนที่ต้องการ ${quantity} ชิ้น`);
      }
  
      // ตรวจสอบว่าผู้ใช้มีตะกร้าหรือไม่
      await ensureCartExists(userProfile.id);
      
      // ดึงข้อมูลสินค้าในตะกร้าปัจจุบัน (ถ้ามี)
      // เพื่อตรวจสอบว่าจำนวนรวมเกินสต็อกหรือไม่
      try {
        const cart = await this.getCart();
        const existingItem = cart.items.find(item => 
          item.productId === productId && item.size === size
        );
        
        if (existingItem) {
          const totalQuantity = existingItem.quantity + quantity;
          
          if (totalQuantity > selectedOption.stock) {
            throw new Error(`คุณมีสินค้านี้ในตะกร้าแล้ว ${existingItem.quantity} ชิ้น การเพิ่มอีก ${quantity} ชิ้นจะเกินจำนวนในสต็อก (${selectedOption.stock} ชิ้น)`);
          }
        }
      } catch (cartError) {
        console.warn('ไม่สามารถตรวจสอบสินค้าในตะกร้าปัจจุบันได้:', cartError);
        // ดำเนินการต่อแม้จะตรวจสอบไม่ได้
      }
      
      // เรียกใช้งาน API เพิ่มสินค้าลงตะกร้า
      for (let i = 0; i < quantity; i++) {
        try {
          await apiClient.post(`/cart/${userProfile.id}/add`, {
            productId,
            size
          });
        } catch (addError) {
          // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับสต็อกหรือไม่
          if (addError.response && 
              addError.response.data && 
              (addError.response.data.message === 'Product out of stock' || 
               addError.response.data.message.includes('out of stock'))) {
            throw new Error('สินค้าหมดหรือมีไม่เพียงพอในสต็อก');
          }
          throw addError; // ส่งต่อข้อผิดพลาดอื่นๆ
        }
      }
      
      // สร้างตะกร้าสำรองใน localStorage
      try {
        const localCartItems = getLocalCartData();
        const existingItemIndex = localCartItems.findIndex(item => 
          item.productId === productId && item.option === size
        );
        
        if (existingItemIndex !== -1) {
          localCartItems[existingItemIndex].quantity += quantity;
        } else {
          localCartItems.push({
            productId,
            name: product.name,
            description: product.description,
            option: size,
            price: selectedOption ? selectedOption.price : 0,
            quantity,
            image: product.imageUrl ? `${apiUrl}/uploads/${product.imageUrl}` : null
          });
        }
        
        saveLocalCartData(localCartItems);
      } catch (localError) {
        console.error('Error updating local cart:', localError);
        // ไม่ throw error เพื่อให้ยังคงทำงานต่อได้แม้ localStorage จะมีปัญหา
      }
      
      return 'สินค้าถูกเพิ่มลงในตะกร้าแล้ว';
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error; // ส่งต่อข้อผิดพลาดเพื่อให้ component จัดการต่อ
    }
  },

  // อัปเดตจำนวนสินค้าในตะกร้า
  async updateQuantity(productId, size, quantity) {
    try {
      if (!authService.isLoggedIn()) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      }
  
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
  
      // ดึงข้อมูลตะกร้าปัจจุบัน
      const cartData = await this.getCart();
      const currentItem = cartData.items.find(item => 
        item.productId === productId && item.size === size
      );
      
      if (!currentItem) {
        throw new Error('ไม่พบสินค้าในตะกร้า');
      }
      
      const currentQuantity = currentItem.quantity;
      
      if (quantity === currentQuantity) {
        // ไม่มีการเปลี่ยนแปลง
        return "ไม่มีการเปลี่ยนแปลงจำนวนสินค้า";
      } else if (quantity > currentQuantity) {
        // เพิ่มจำนวน - ต้องตรวจสอบสต็อก
        // ดึงข้อมูลสินค้าและตรวจสอบสต็อก
        const productResponse = await apiClient.get(`/admin/products/${productId}`);
        const product = productResponse.data;
        
        const selectedOption = product.options.find(option => option.size === size);
        
        if (!selectedOption) {
          throw new Error('ไม่พบตัวเลือกสินค้าที่ระบุ');
        }
        
        if (quantity > selectedOption.stock) {
          throw new Error(`สินค้า ${product.name} (${size}) มีในสต็อกเพียง ${selectedOption.stock} ชิ้น ไม่เพียงพอกับจำนวนที่ต้องการ ${quantity} ชิ้น`);
        }
        
        // เพิ่มจำนวน
        const diff = quantity - currentQuantity;
        
        // เพิ่มทีละ 1 หน่วย
        for (let i = 0; i < diff; i++) {
          await apiClient.post(`/cart/${userProfile.id}/add`, {
            productId,
            size
          });
        }
      } else {
        // ลดจำนวน
        const diff = currentQuantity - quantity;
        
        // ลดจำนวนทีละ 1 หน่วย ตามจำนวนที่ต้องลด
        if (diff === currentQuantity) {
          // ลบทั้งหมด
          await apiClient.post(`/cart/${userProfile.id}/reduce`, {
            productId,
            size,
            removeAll: true
          });
        } else {
          // ลดทีละชิ้น
          for (let i = 0; i < diff; i++) {
            await apiClient.post(`/cart/${userProfile.id}/reduce`, {
              productId,
              size,
              removeAll: false
            });
          }
        }
      }
      
      // อัปเดตข้อมูลใน localStorage ด้วย
      const localCartItems = getLocalCartData();
      const existingItemIndex = localCartItems.findIndex(item => 
        item.productId === productId && item.option === size
      );
      
      if (existingItemIndex !== -1) {
        if (quantity === 0) {
          // ลบรายการ
          localCartItems.splice(existingItemIndex, 1);
        } else {
          localCartItems[existingItemIndex].quantity = quantity;
        }
        saveLocalCartData(localCartItems);
      }
      
      return "อัปเดตจำนวนสินค้าเรียบร้อย";
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error; // ส่งต่อข้อผิดพลาดเพื่อให้ component จัดการต่อ
    }
  },
  
  // ลบสินค้าออกจากตะกร้า
  async removeFromCart(productId, size) {
    try {
      if (!authService.isLoggedIn()) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      }

      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      // เรียกใช้ API ลบสินค้า
      await apiClient.post(`/cart/${userProfile.id}/reduce`, {
        productId,
        size,
        removeAll: true
      });

      // อัปเดตข้อมูลใน localStorage ด้วย
      const localCartItems = getLocalCartData();
      const updatedItems = localCartItems.filter(item => 
        !(item.productId === productId && item.option === size)
      );
      
      saveLocalCartData(updatedItems);
      
      return 'ลบสินค้าออกจากตะกร้าแล้ว';
    } catch (error) {
      console.error('Error removing item from cart:', error);
      
      // อัปเดตข้อมูลใน localStorage กรณี API มีปัญหา
      const localCartItems = getLocalCartData();
      const updatedItems = localCartItems.filter(item => 
        !(item.productId === productId && item.option === size)
      );
      
      saveLocalCartData(updatedItems);
      
      return 'ลบสินค้าออกจากตะกร้าแล้ว (โหมดออฟไลน์)';
    }
  },

  // ดำเนินการสั่งซื้อ (checkout)
// ปรับปรุงเฉพาะฟังก์ชัน checkout ใน cartService.js

// ดำเนินการสั่งซื้อ (checkout)
async checkout(discount = 0) {
  try {
    if (!authService.isLoggedIn()) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }

    const userProfile = await authService.getUserProfile();
    
    if (!userProfile || !userProfile.id) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }
    
    // ดึงข้อมูลตะกร้า
    const cart = await this.getCart();
    
    if (!cart.items || cart.items.length === 0) {
      throw new Error('ไม่มีสินค้าในตะกร้า');
    }
    
    // คำนวณยอดรวม
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // ค่าส่ง
    const shipping = 20;
    
    // แปลงส่วนลดเป็นตัวเลข
    const discountAmount = parseFloat(discount) || 0;
    
    // คำนวณยอดสุทธิ
    const finalTotal = subtotal + shipping - discountAmount;
    
    // เตรียมข้อมูลรายการสินค้า
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      price: item.price
    }));
    
    console.log(`ดำเนินการชำระเงินสำหรับผู้ใช้: ${userProfile.id}`);
    console.log(`ยอดรวม: ${subtotal}, ส่วนลด: ${discountAmount}, ค่าส่ง: ${shipping}, ยอดสุทธิ: ${finalTotal}`);
    
    // เรียกใช้ API checkout
    const response = await apiClient.post(`/cart/${userProfile.id}/checkout`, {
      discount: discountAmount,
      subtotal: subtotal,
      shipping: shipping,
      items: orderItems
    });
    
    // ล้างข้อมูลใน localStorage
    saveLocalCartData([]);
    localStorage.removeItem('petHubDiscount');
    
    return response.data;
  } catch (error) {
    console.error('Error checking out:', error);
    throw error;
  }
},
  
  // สร้างตะกร้าใหม่สำหรับผู้ใช้
  async createCart(userId) {
    try {
      const response = await apiClient.post('/cart', { userId });
      return response.data;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },
  
  // ซิงค์ข้อมูลระหว่าง localStorage กับฐานข้อมูล
  async syncLocalCartWithDatabase() {
    try {
      if (!authService.isLoggedIn()) {
        return false; // ยังไม่ได้ล็อกอิน ไม่ต้องซิงค์
      }
      
      const userProfile = await authService.getUserProfile();
      if (!userProfile || !userProfile.id) {
        return false;
      }
      
      // ตรวจสอบว่ามีของในตะกร้าท้องถิ่นหรือไม่
      const localCartItems = getLocalCartData();
      if (localCartItems.length === 0) {
        return true; // ไม่มีอะไรต้องซิงค์
      }
      
      console.log("Syncing local cart with database...");
      
      // ตรวจสอบว่าผู้ใช้มีตะกร้าหรือไม่
      await ensureCartExists(userProfile.id);
      
      // เพิ่มสินค้าจาก localStorage เข้าไปในฐานข้อมูล
      for (const item of localCartItems) {
        try {
          // เพิ่มสินค้าพร้อมระบุจำนวน
          console.log(`Adding ${item.quantity} of product ${item.productId} (${item.option}) to database cart`);
          
          // เรียกใช้ API เพิ่มสินค้าจำนวนหลายชิ้น
          for (let i = 0; i < item.quantity; i++) {
            await apiClient.post(`/cart/${userProfile.id}/add`, {
              productId: item.productId,
              size: item.option
            });
          }
        } catch (itemError) {
          console.error(`Error syncing item ${item.productId}:`, itemError);
          // ข้ามรายการที่มีปัญหาและทำรายการต่อไป
        }
      }
      
      // ล้างตะกร้าท้องถิ่น
      console.log("Local cart synced successfully, clearing local data");
      saveLocalCartData([]);
      
      return true;
    } catch (error) {
      console.error('Error syncing local cart with database:', error);
      return false;
    }
  }
};

export default cartService;