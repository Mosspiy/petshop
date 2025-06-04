<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import cartService from '../services/client/cartService';
import authService from '../services/authService';
import addressService from '../services/client/addressService';
import axios from 'axios';
import orderService from '../services/orderService';

const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';
const isCheckingOut = ref(false);
// สร้าง axios instance สำหรับเรียก API โดยตรง
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม interceptor สำหรับแนบ token
apiClient.interceptors.request.use(config => {
  const token = authService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// สถานะโหลดและข้อผิดพลาด
const isLoading = ref(true);
const error = ref(null);

// ข้อมูลผู้ใช้และที่อยู่
const user = ref(null);
const addresses = ref([]);
const selectedAddress = ref(null);

// ข้อมูลตะกร้า
const cartItems = ref([]);
const slidePositions = ref({});
const startX = ref({});
const discountCode = ref('');
const discountAmount = ref(0);

// ค่า threshold สำหรับ swipe
const SWIPE_THRESHOLD = 70;

// คำนวณยอดรวม
const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// สถานะ Bottom Sheet
const isBottomSheetVisible = ref(false);
const animationClass = ref('');

// ดึงข้อมูลผู้ใช้
const fetchUserProfile = async () => {
  try {
    // ดึงข้อมูลผู้ใช้
    const userProfile = await authService.getUserProfile();
    user.value = userProfile;
    console.log("User profile:", userProfile);
    
    // ใช้ที่อยู่จาก user profile โดยตรง
    if (userProfile.addresses && userProfile.addresses.length > 0) {
      addresses.value = userProfile.addresses;
      
      // เลือกที่อยู่ที่เป็นค่าเริ่มต้น หรือที่อยู่แรกหากไม่มีค่าเริ่มต้น
      selectedAddress.value = addresses.value.find(address => address.isDefault) || addresses.value[0];
      
      console.log("ที่อยู่ทั้งหมด:", addresses.value);
      console.log("ที่อยู่ที่ถูกเลือก:", selectedAddress.value);
    } else {
      // หากไม่มีที่อยู่ใน user profile ให้ลองดึงจาก addressService
      try {
        const addressList = await addressService.getAddresses();
        addresses.value = addressList;
        
        // เลือกที่อยู่ที่เป็นค่าเริ่มต้น หรือที่อยู่แรกหากไม่มีค่าเริ่มต้น
        selectedAddress.value = addresses.value.find(address => address.isDefault) || 
                              (addresses.value.length > 0 ? addresses.value[0] : null);
        
        console.log("ที่อยู่จาก API:", addresses.value);
        console.log("ที่อยู่ที่ถูกเลือก (API):", selectedAddress.value);
      } catch (addressError) {
        console.error('Error fetching addresses:', addressError);
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    error.value = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
  }
};

// ดึงข้อมูลตะกร้า
const fetchCart = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log("Fetching cart data...");
    const cart = await cartService.getCart();
    console.log("Cart data received:", cart);
    
    // ตรวจสอบข้อมูลว่าถูกต้องหรือไม่
    if (!cart || !cart.items) {
      console.error("Cart data format is invalid:", cart);
      error.value = 'รูปแบบข้อมูลตะกร้าไม่ถูกต้อง';
      cartItems.value = [];
      isLoading.value = false;
      return;
    }
    
    cartItems.value = cart.items;
    
    // กำหนดค่าเริ่มต้นของ slidePositions
    cartItems.value.forEach((_, index) => {
      slidePositions.value[index] = 0;
    });
    
    console.log("Cart items:", cartItems.value);
  } catch (error) {
    console.error('Error fetching cart:', error);
    error.value = 'ไม่สามารถโหลดสินค้าในตะกร้าได้: ' + (error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    cartItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

// เพิ่มจำนวนสินค้า
const incrementQuantity = async (index) => {
  try {
    const item = cartItems.value[index];
    
    // ตรวจสอบจำนวนสินค้าในสต็อกก่อนเพิ่ม
    try {
      const productResponse = await apiClient.get(`/admin/products/${item.productId}`);
      const product = productResponse.data;
      
      // หาตัวเลือกที่เลือก
      const selectedOption = product.options.find(option => option.size === item.size);
      
      if (!selectedOption) {
        throw new Error('ไม่พบตัวเลือกสินค้าที่ระบุ');
      }
      
      // ตรวจสอบสต็อก
      if (item.quantity >= selectedOption.stock) {
        alert(`ไม่สามารถเพิ่มจำนวนได้ เนื่องจากมีสินค้าในสต็อกเพียง ${selectedOption.stock} ชิ้น`);
        return;
      }
    } catch (stockCheckError) {
      console.error('Error checking stock:', stockCheckError);
      // ถ้าตรวจสอบไม่ได้ ให้ทำงานต่อไป (ซึ่ง API จะตรวจสอบอีกครั้ง)
    }
    
    await cartService.updateQuantity(
      item.productId, 
      item.size, 
      item.quantity + 1
    );
    cartItems.value[index].quantity++;
  } catch (error) {
    console.error('Error increasing quantity:', error);
    
    // แสดงข้อความแจ้งเตือนหากเป็นปัญหาเกี่ยวกับสต็อก
    if (error.message && (
        error.message.includes('out of stock') || 
        error.message.includes('ไม่เพียงพอ') || 
        error.message.includes('สต็อก'))) {
      alert('สินค้าหมด หรือมีไม่เพียงพอในสต็อก');
    } else {
      alert('เกิดข้อผิดพลาดในการเพิ่มจำนวนสินค้า');
    }
  }
};

// ลดจำนวนสินค้า
const decrementQuantity = async (index) => {
  try {
    const item = cartItems.value[index];
    if (item.quantity > 1) {
      await cartService.updateQuantity(
        item.productId, 
        item.size, 
        item.quantity - 1
      );
      cartItems.value[index].quantity--;
    }
  } catch (error) {
    console.error('Error decreasing quantity:', error);
    alert('เกิดข้อผิดพลาดในการลดจำนวนสินค้า');
  }
};

// ลบสินค้าออกจากตะกร้า
const removeItem = async (index) => {
  try {
    const item = cartItems.value[index];
    await cartService.removeFromCart(item.productId, item.size);
    cartItems.value.splice(index, 1);
    // อัปเดต slidePositions หลังจากลบรายการ
    const newSlidePositions = {};
    Object.keys(slidePositions.value).forEach(key => {
      if (parseInt(key) < index) {
        newSlidePositions[key] = slidePositions.value[key];
      } else if (parseInt(key) > index) {
        newSlidePositions[parseInt(key) - 1] = slidePositions.value[key];
      }
    });
    slidePositions.value = newSlidePositions;
  } catch (error) {
    console.error('Error removing item:', error);
    alert('เกิดข้อผิดพลาดในการลบสินค้า');
  }
};

// จัดการ touch events
const handleTouchStart = (index, event) => {
  startX.value[index] = event.touches[0].clientX;
};

const handleTouchMove = (index, event) => {
  if (!startX.value[index]) return;
  
  const currentX = event.touches[0].clientX;
  const diff = currentX - startX.value[index];
  
  // จำกัดระยะการเลื่อน
  const newPosition = Math.max(-SWIPE_THRESHOLD * 1.5, Math.min(0, diff));
  
  // อัปเดตตำแหน่ง
  slidePositions.value[index] = newPosition;
};

const handleTouchEnd = (index) => {
  if (slidePositions.value[index] <= -SWIPE_THRESHOLD) {
    // ถ้าเลื่อนเกินกว่า threshold ให้แสดงปุ่มลบ
    slidePositions.value[index] = -SWIPE_THRESHOLD * 1.5;
  } else {
    // ถ้าไม่เกิน ให้กลับไปตำแหน่งเดิม
    slidePositions.value[index] = 0;
  }
  
  // รีเซ็ตค่าเริ่มต้น
  startX.value[index] = null;
};

// ฟังก์ชันเปิด Bottom Sheet
const openBottomSheet = () => {
  console.log("Opening bottom sheet...");
  
  animationClass.value = 'animate__animated animate__slideInUp';
  isBottomSheetVisible.value = true;
  console.log("Bottom sheet visibility:", isBottomSheetVisible.value);
};

// ฟังก์ชันปิด Bottom Sheet
const closeBottomSheet = () => {
  console.log("Closing bottom sheet...");
  animationClass.value = 'animate__animated animate__slideOutDown';
};

// ฟังก์ชันเรียกหลังจบแอนิเมชัน
const handleAnimationEnd = () => {
  console.log("Animation ended, class:", animationClass.value);
  if (animationClass.value === 'animate__animated animate__slideOutDown') {
    isBottomSheetVisible.value = false;
    console.log("Bottom sheet hidden");
  }
};

// ฟังก์ชันสำหรับปิดเมื่อคลิกนอก modal
const closeOnClickOutside = (event) => {
  if (event.target === event.currentTarget) {
    closeBottomSheet();
  }
};

// ไปยังหน้าที่อยู่
const goToAddressPage = () => {
  closeBottomSheet(); // ปิด Bottom Sheet ก่อนนำทางไปหน้าที่อยู่
  router.push('/address');
};

// ใช้โค้ดส่วนลด
const applyDiscount = () => {
  if (!discountCode.value) return;
  
  // ตัวอย่างโค้ดส่วนลด "FIRST10" ลด 10%
  if (discountCode.value.toUpperCase() === 'SAVE20') {
    discountAmount.value = 20;
  } else {
    discountAmount.value = 0;
    alert('โค้ดส่วนลดไม่ถูกต้อง');
  }
};

// ชำระเงิน
const checkout = async () => {
  try {
    console.log("Checkout process started");
    
    if (!selectedAddress.value) {
      alert('กรุณาเลือกที่อยู่จัดส่ง');
      return;
    }
    
    if (cartItems.value.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า');
      return;
    }
    
    // แสดงสถานะกำลังประมวลผล
    isCheckingOut.value = true;
    
    console.log("Discount amount:", discountAmount.value);
    
    // คำนวณยอดรวมและข้อมูลอื่นๆ
    const subtotal = cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    const shipping = 20; // ค่าจัดส่ง
    const discount = discountAmount.value; // ส่วนลด
    const finalTotal = subtotal + shipping - discount;
    
    console.log("Calculated totals:", {
      subtotal, 
      shipping, 
      discount, 
      finalTotal
    });
    
    // เก็บข้อมูลส่วนลดใน localStorage
    localStorage.setItem('petHubDiscount', discount.toString());
    
    // เตรียมข้อมูลสำหรับสร้างออเดอร์
    const orderData = {
      items: cartItems.value.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      addressId: selectedAddress.value.id,
      totalPrice: finalTotal,
      totalQuantity: cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
      discount: discount,
      shipping: shipping
    };
    
    console.log("Order data to be created:", orderData);
    
    try {
      // วิธีที่ 1: ใช้ cartService.checkout ที่แก้ไขให้รับค่าส่วนลด
      const result = await cartService.checkout(discount);
      
      console.log("Checkout result:", result);
      
      // วิธีที่ 2: ถ้า result มี ID แต่ไม่มีการบันทึกส่วนลด ให้อัปเดตเพิ่มเติม
      if (result && result._id && discount > 0) {
        try {
          console.log('Updating discount for new order:', result._id);
          await axios.patch(`${apiUrl}/orders/${result._id}`, {
            discount: discount
          }, {
            headers: {
              'Authorization': `Bearer ${authService.getAuthToken()}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Discount updated successfully');
        } catch (updateError) {
          console.error('Error updating discount:', updateError);
        }
      }
      
      // แสดงข้อความสำเร็จ
      alert('สั่งซื้อสำเร็จ!');
      
      // ปิด Bottom Sheet
      closeBottomSheet();
      
      // นำทางไปหน้าประวัติการสั่งซื้อ
      router.push('/profile');
    } catch (checkoutError) {
      console.error('Initial checkout failed, trying alternative method:', checkoutError);
      
      // วิธีที่ 3: ถ้า cartService.checkout ไม่สำเร็จ ให้ลองใช้ orderService.createOrder แทน
      try {
        const orderResult = await orderService.createOrder(orderData);
        console.log("Order created directly:", orderResult);
        
        // ล้างตะกร้า
        cartItems.value = [];
        localStorage.removeItem('petHubCart');
        localStorage.removeItem('petHubDiscount');
        
        // แสดงข้อความสำเร็จ
        alert('สั่งซื้อสำเร็จ!');
        
        // ปิด Bottom Sheet
        closeBottomSheet();
        
        // นำทางไปหน้าประวัติการสั่งซื้อ
        router.push('/profile');
      } catch (orderError) {
        console.error('Failed to create order directly:', orderError);
        throw orderError; // ส่งต่อข้อผิดพลาดเพื่อให้ถูกจัดการในบล็อค catch ด้านนอก
      }
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
  } finally {
    isCheckingOut.value = false;
  }
};

// โหลดข้อมูลเมื่อ component ถูกโหลด
onMounted(async () => {
  // ตรวจสอบการ login
  if (!authService.isLoggedIn()) {
    router.push('/login');
    return;
  }
  
  // ดึงข้อมูลผู้ใช้และตะกร้า
  await fetchUserProfile();
  await fetchCart();
});
</script>

<template>
  <div class="relative flex items-center justify-center pt-8 pl-4 mb-6">
    <!-- ปุ่มย้อนกลับ -->
    <button @click="$router.back()" class="btn btn-ghost absolute left-5">
      <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
    </button>

    <!-- หัวข้อกลางจอ -->
    <h1 class="text-xl font-bold text-[#0c3a5b]">รถเข็นสินค้า</h1>
  </div>

  <div class="p-5 min-h-screen flex flex-col pb-24">
    <!-- สถานะกำลังโหลด -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="loading loading-spinner loading-lg text-[#005a9a]"></div>
    </div>
    
    <!-- แสดงข้อความเมื่อเกิดข้อผิดพลาด -->
    <div v-else-if="error" class="text-center py-16 px-4">
      <div class="flex flex-col items-center justify-center">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-2 text-red-500"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-500 max-w-md">{{ error }}</p>
        <button @click="fetchCart" class="btn btn-primary mt-4">
          <i class="fa-solid fa-refresh mr-2"></i> ลองใหม่
        </button>
      </div>
    </div>
    
    <!-- แสดงข้อความเมื่อไม่มีสินค้า -->
    <div v-else-if="cartItems.length === 0" class="text-center py-16 px-4">
      <div class="flex flex-col items-center justify-center">
        <i class="fa-solid fa-shopping-cart text-4xl mb-2 text-gray-400"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">ตะกร้าว่างเปล่า</h3>
        <p class="text-gray-500 max-w-md">เพิ่มสินค้าที่คุณต้องการลงในตะกร้าเพื่อสั่งซื้อ</p>
      </div>
    </div>

    <!-- ส่วนรายการสินค้า -->
    <div v-else class="flex-1 overflow-y-auto space-y-4">
      <!-- การ์ดสินค้าแต่ละรายการ -->
      <div
        v-for="(item, index) in cartItems"
        :key="index"
        class="relative bg-white shadow-md rounded-lg overflow-hidden"
        @touchstart="handleTouchStart(index, $event)"
        @touchmove="handleTouchMove(index, $event)"
        @touchend="handleTouchEnd(index)"
      >
        <!-- ปุ่มถังขยะ (ปรากฏเมื่อเลื่อนไปทางซ้าย) -->
        <button
          @click="removeItem(index)"
          class="absolute right-0 top-0 bottom-0 w-20 bg-[#ffcfcc] text-white flex items-center justify-center transition-transform duration-300"
          :class="{ 'translate-x-0': slidePositions[index] <= -SWIPE_THRESHOLD, 'translate-x-full': slidePositions[index] > -SWIPE_THRESHOLD }"
        >
          <i class="fa-regular fa-trash-can text-[#c40c00] text-2xl"></i>
        </button>

        <!-- รายละเอียดสินค้า -->
        <div
          class="flex p-4 transform transition-transform duration-300"
          :style="{ transform: `translateX(${slidePositions[index]}px)` }"
        >
          <!-- รูปภาพ -->
          <div class="w-20 h-20 flex-shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              alt="product image"
              class="w-full h-full object-cover rounded-md"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
              <i class="fa-solid fa-image text-gray-400 text-2xl"></i>
            </div>
          </div>

          <!-- รายละเอียดสินค้า -->
          <div class="ml-4 flex-1">
            <h2 class="text-sm font-bold text-[#0c3a5b] break-words">
              {{ item.name }}
            </h2>
            <p class="text-xs text-[#005a9a] mt-1">
              <span class="bg-[#f0f7ff] px-2 py-1 rounded-lg inline-block">
                {{ item.size }}
              </span>
            </p>
            <p class="text-lg font-bold mt-2 text-[#44842d]">{{ item.price * item.quantity }} บาท</p>
          </div>

          <!-- ตัวเพิ่ม/ลดจำนวน -->
          <div class="flex items-end space-x-2">
            <button @click="decrementQuantity(index)" class="btn btn-sm btn-ghost">
              <i class="fa-solid fa-minus text-base"></i>
            </button>
            <div class="flex items-center mb-1 mr-2">
              <span class="text-md font-semibold">{{ item.quantity }}</span>
            </div>
            <button @click="incrementQuantity(index)" class="btn btn-sm btn-ghost">
              <i class="fa-solid fa-plus text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ปุ่มสั่งซื้อ -->
  <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-5 flex justify-between items-center">
    <div>
      <p class="text-gray-600 text-sm">รวม</p>
      <p class="text-xl font-bold text-[#005a9a]">{{ totalAmount }} บาท</p>
    </div>
    <button class="btn bg-[#44842d] text-white font-bold px-8 py-2 rounded-lg" @click="openBottomSheet">
      ชำระเงิน
    </button>
  </div>

  <!-- Bottom Sheet -->
  <div 
    v-if="isBottomSheetVisible" 
    class="fixed inset-0 z-50 flex items-end bg-gray-900 bg-opacity-50" 
    @click="closeOnClickOutside"
  >
    <div 
      :class="['modal-box w-full min-w-full bg-white p-0 rounded-t-xl', animationClass]" 
      style="--animate-duration: 0.3s" 
      @animationend="handleAnimationEnd" 
      role="dialog"
    >
      <!-- ปิด Bottom Sheet -->
      <button class="btn btn-sm btn-ghost btn-circle absolute right-3 top-3" @click="closeBottomSheet">
        <i class="fa-solid fa-xmark text-[#0c3a5b] text-2xl"></i>
      </button>

      <!-- เนื้อหาของ Modal -->
      <div class="px-6 py-6">
        <h2 class="text-base font-bold text-[#005a9a] mb-3">ที่อยู่จัดส่ง</h2>

        <!-- ถ้ามีที่อยู่ แสดงที่อยู่ -->
        <div v-if="selectedAddress" class="bg-[#eaf1f6] rounded-lg p-3 mb-4 cursor-pointer" @click="goToAddressPage">
          <div class="flex justify-between">
            <span class="font-medium text-[#0c3a5b]">
              {{ selectedAddress.name || 'บ้าน: ' + (selectedAddress.name || '') }}
            </span>
            <span class="text-[#c40c00]">แก้ไข</span>
          </div>
          <div class="text-[#83a9c4] text-sm mt-1">
            <p>{{ selectedAddress.phone || '' }}</p>
            <p class="mt-1">{{ 
              selectedAddress.address || selectedAddress.detail || '' }}, 
              {{ selectedAddress.district || '' }}, 
              {{ selectedAddress.province || '' }} 
              {{ selectedAddress.zipCode || selectedAddress.zipcode || '' }}
            </p>
          </div>
          <div v-if="selectedAddress.isDefault" class="mt-2 bg-[#83a9c4] text-white text-xs font-medium px-2 py-1 rounded-lg inline-block">
            ค่าเริ่มต้น
          </div>
        </div>

        <!-- ถ้าไม่มีที่อยู่ ให้แสดงปุ่มเพิ่มที่อยู่ -->
        <div v-else class="bg-[#eaf1f6] rounded-lg flex flex-col items-center justify-center py-6 mb-4 cursor-pointer" @click="goToAddressPage">
          <div class="text-[#005a9a] text-center">
            <i class="fa-solid fa-plus text-xl mb-2"></i>
            <p class="font-medium">เพิ่มที่อยู่จัดส่ง</p>
          </div>
        </div>

        <h2 class="text-base font-bold text-[#005a9a] mb-3">เพิ่มโค้ดส่วนลด</h2>
        <div class="flex space-x-2 mb-4">
          <input type="text" v-model="discountCode" class="input flex-1 uppercase text-[#83a9c4] bg-[#eaf1f6] placeholder:text-[#83a9c4] focus:outline-1 focus:ring-1" placeholder="ป้อนรหัส" />
          <button class="btn bg-[#c40c00] text-white rounded-lg px-4" @click="applyDiscount">ใช้</button>
        </div>

        <h2 class="text-base font-bold text-[#005a9a] mb-3">สรุปคำสั่งซื้อ</h2>
        <div class="text-[#005a9a] font-medium">
          <div class="flex justify-between mb-2">
            <span>รวม</span>
            <span>{{ totalAmount }} บาท</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>ค่าจัดส่ง</span>
            <span>20 บาท</span>
          </div>
          <div class="flex justify-between mb-2 text-[#c40c00]">
            <span>ส่วนลด</span>
            <span>{{ discountAmount }} บาท</span>
          </div>
          <div class="border-t border-dashed my-2 pt-2"></div>
          <div class="flex justify-between font-bold text-[#0c3a5b]">
            <span>ยอดสุทธิ</span>
            <span>{{ totalAmount - discountAmount + 20 }} บาท</span>
          </div>
        </div>

        <button 
  class="btn bg-[#44842d] text-white w-full rounded-lg mt-6" 
  @click="checkout"
  :disabled="isCheckingOut"
>
  <span v-if="isCheckingOut">
    <i class="fa-solid fa-spinner fa-spin mr-2"></i>กำลังประมวลผล...
  </span>
  <span v-else>
    ชำระเงิน
  </span>
</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-ghost {
  @apply hover:bg-transparent;
}

/* Animation */
.animate__animated {
  animation-duration: 0.3s !important;
}

.animate__slideInUp {
  animation-name: slideInUp !important;
}

.animate__slideOutDown {
  animation-name: slideOutDown !important;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

/* ปรับขนาดกล่อง Modal ให้เหมาะสม */
.modal-box {
  max-height: 90vh;
  overflow-y: auto;
}
</style>