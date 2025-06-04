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

// ฟังก์ชันเพื่อสร้าง URL ของรูปภาพที่ถูกต้อง
const getImageUrl = (product) => {
  // ตรวจสอบว่า product เป็น object หรือไม่
  if (typeof product !== 'object' || product === null) {
    return 'https://via.placeholder.com/80';
  }

  // ตรวจสอบหลายกรณีของรูปภาพ
  if (product.imageUrl) {
    // กรณีที่ชื่อรูปภาพอยู่ในฟิลด์ imageUrl (ต้องสร้าง URL เต็ม)
    return `${apiUrl}/uploads/${product.imageUrl}`;
  } else if (product.image) {
    // กรณีที่มี URL รูปภาพอยู่ในฟิลด์ image แล้ว
    return product.image;
  } else {
    // กรณีไม่พบรูปภาพ
    return 'https://via.placeholder.com/80';
  }
};

const orderService = {
  // ดึงคำสั่งซื้อทั้งหมดของผู้ใช้
  async getUserOrders() {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      console.log("Fetching orders for user ID:", userProfile.id);
      
      // ดึงข้อมูลออเดอร์จาก API
      const response = await apiClient.get(`/orders/user/${userProfile.id}`);
      console.log("Raw orders data:", response.data);
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการใช้
      const formattedOrders = Array.isArray(response.data) ? response.data.map(order => {
        console.log("Processing order:", order);
        
        // ข้อมูลที่อยู่
        const addressInfo = order.addressId || {};
        console.log("Address info:", addressInfo);
        
        // รายการสินค้า
        const items = order.items || [];
        const formattedItems = items.map(item => {
          // ข้อมูลสินค้า
          const product = item.productId || {};
          console.log("Processing product:", product);
          
          // ดึงข้อมูลราคา
          // 1. ตรวจสอบว่ามีราคาที่ item หรือไม่
          let price = 0;
          if (item.price !== undefined && item.price !== null) {
            price = item.price;
          } 
          // 2. ถ้าไม่มี ให้หาจาก options ของสินค้า
          else if (typeof product === 'object' && product.options && Array.isArray(product.options)) {
            const selectedOption = product.options.find(opt => opt.size === item.size);
            if (selectedOption && selectedOption.price !== undefined) {
              price = selectedOption.price;
            }
          }
          
          // สร้าง URL รูปภาพ
          const imageUrl = getImageUrl(product);
          console.log("Image URL:", imageUrl);
          
          return {
            id: typeof product === 'object' ? (product._id || '') : (product || ''),
            name: typeof product === 'object' ? (product.name || 'สินค้า') : 'สินค้า',
            price: price,
            option: `Size: ${item.size || ''}`,
            quantity: item.quantity || 1,
            image: imageUrl
          };
        });
        
        return {
          id: order._id || '',
          orderCode: order.orderCode || order._id || '',
          date: new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString('th-TH'),
          customer: `${addressInfo.name || ''} ${addressInfo.lastname || ''}`.trim() || 'ไม่ระบุชื่อ',
          phone: addressInfo.phone || 'ไม่ระบุเบอร์',
          status: order.status || 'Pending',
          trackingNumber: order.trackingNumber || '',
          isReviewed: order.isReviewed || false,
          items: formattedItems,
          total: order.totalPrice || 0,
          shipping: order.shipping || 20,
          discount: order.discount || 0,
          updatedAt: new Date(order.updatedAt || Date.now()).toLocaleString('th-TH'),
          createdAt: new Date(order.createdAt || Date.now()).toLocaleString('th-TH')
        };
      }) : [];
      
      console.log("Formatted orders:", formattedOrders);
      return formattedOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return []; // ส่งค่า array ว่างกลับไปหากเกิดข้อผิดพลาด
    }
  },
  
  // ดึงคำสั่งซื้อตาม ID
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      console.log(`Order ${orderId} data:`, response.data);
      
      const order = response.data;
      
      // ข้อมูลที่อยู่
      const addressInfo = order.addressId || {};
      
      // รายการสินค้า
      const items = order.items || [];
      const formattedItems = items.map(item => {
        // ข้อมูลสินค้า
        const product = item.productId || {};
        
        // ดึงข้อมูลราคา
        // 1. ตรวจสอบว่ามีราคาที่ item หรือไม่
        let price = 0;
        if (item.price !== undefined && item.price !== null) {
          price = item.price;
        } 
        // 2. ถ้าไม่มี ให้หาจาก options ของสินค้า
        else if (typeof product === 'object' && product.options && Array.isArray(product.options)) {
          const selectedOption = product.options.find(opt => opt.size === item.size);
          if (selectedOption && selectedOption.price !== undefined) {
            price = selectedOption.price;
          }
        }
        
        // สร้าง URL รูปภาพ
        const imageUrl = getImageUrl(product);
        
        return {
          id: typeof product === 'object' ? (product._id || '') : (product || ''),
          name: typeof product === 'object' ? (product.name || 'สินค้า') : 'สินค้า',
          price: price,
          option: `Size: ${item.size || ''}`,
          quantity: item.quantity || 1,
          image: imageUrl
        };
      });
      
      return {
        id: order._id || '',
        orderCode: order.orderCode || order._id || '',
        date: new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString('th-TH'),
        customer: `${addressInfo.name || ''} ${addressInfo.lastname || ''}`.trim() || 'ไม่ระบุชื่อ',
        phone: addressInfo.phone || 'ไม่ระบุเบอร์',
        status: order.status || 'Pending',
        trackingNumber: order.trackingNumber || '',
        isReviewed: order.isReviewed || false,
        items: formattedItems,
        total: order.totalPrice || 0,
        shipping: order.shipping || 20,
        discount: order.discount || 0,
        updatedAt: new Date(order.updatedAt || Date.now()).toLocaleString('th-TH'),
        createdAt: new Date(order.createdAt || Date.now()).toLocaleString('th-TH')
      };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  // อัปเดตสถานะคำสั่งซื้อ
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },
  
  // อัปเดตเลขติดตามพัสดุ
  async updateTrackingNumber(orderId, trackingNumber) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, { 
        trackingNumber,
        status: 'Shipped' // ตั้งค่าสถานะเป็น Shipped เมื่อใส่เลขติดตามพัสดุ
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating tracking number for order ${orderId}:`, error);
      throw error;
    }
  },
  
  // อัปเดตทั้งสถานะและเลขติดตามพัสดุ
  async updateOrderWithTracking(orderId, updateData) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },
  
  // ส่งรีวิวสินค้าจากออเดอร์
  async submitReview(orderId, rating, comment) {
    try { 
      const userProfile = await authService.getUserProfile();
    
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้ ไม่สามารถส่งรีวิวได้');
      }
      // ส่งข้อมูลการรีวิว
      const response = await apiClient.post(`/reviews`, {
        orderId,
        rating,
        comment,
        userId: userProfile.id
      });
      
      // อัปเดตสถานะการรีวิวของออเดอร์
      await apiClient.patch(`/orders/${orderId}`, { 
        isReviewed: true 
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error submitting review for order ${orderId}:`, error);
      throw error;
    }
  },
  
  // ดึงข้อมูลรีวิวของผู้ใช้
  async getUserReviews() {
    try {
      const response = await apiClient.get('/reviews/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  },
  
  // ดึงข้อมูลรีวิวตามออเดอร์
  async getReviewByOrderId(orderId) {
    try {
      const response = await apiClient.get(`/reviews/order/${orderId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // กรณีไม่พบรีวิว
        return null;
      }
      console.error(`Error fetching review for order ${orderId}:`, error);
      return null;
    }
  }
};

export default orderService;