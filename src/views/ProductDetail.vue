<!-- ProductDetail.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import favoriteService from '@/services/favoriteService';
import authService from '@/services/authService';
import cartService from '../services/client/cartService';

// ค่า API URL
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// ตัวแปรสถานะ
const isLoading = ref(true);
const errorMessage = ref('');
const isFavorite = ref(false);

// อ้างอิงเส้นทาง
const route = useRoute();
const router = useRouter();

// ข้อมูลสินค้า
const product = ref(null);
const selectedOption = ref(null);
const quantity = ref(1);

// สถานะ Bottom Sheet
const isBottomSheetVisible = ref(false);
const animationClass = ref('');

// ตรวจสอบว่ามีตัวเลือกที่เลือกหรือไม่
const isOptionSelected = computed(() => selectedOption.value !== null);
// เพิ่มฟังก์ชันตรวจสอบสถานะรายการโปรด
const checkFavoriteStatus = async (productId) => {
  if (!authService.isLoggedIn()) {
    return false;
  }
  
  try {
    const isInFavorite = await favoriteService.isProductInFavorite(productId);
    isFavorite.value = isInFavorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
  }
};
// คำนวณราคาที่แสดง
const selectedPrice = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.price;
  } else if (product.value && product.value.options && product.value.options.length > 0) {
    // ถ้าไม่มีตัวเลือกที่เลือก แต่มีตัวเลือก ให้แสดงราคาต่ำสุด
    const prices = product.value.options.map(option => option.price);
    return Math.min(...prices);
  } else {
    return 0;
  }
});

// ฟังก์ชันสำหรับดึงข้อมูลสินค้า
const fetchProduct = async (productId) => {
  isLoading.value = true;
  
  try {
    // เรียก API เพื่อดึงข้อมูลสินค้า
    const response = await fetch(`${apiUrl}/admin/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('ไม่สามารถโหลดข้อมูลสินค้าได้');
    }
    
    const data = await response.json();
    
    // แปลงข้อมูลสินค้า
    product.value = {
      ...data,
      image: data.imageUrl ? `${apiUrl}/uploads/${data.imageUrl}` : null
    };
    await checkFavoriteStatus(productId);
    
    // กำหนดตัวเลือกเริ่มต้น ถ้ามี
    if (product.value.options && product.value.options.length > 0) {
      product.value.Options = product.value.options.map(option => ({
        name: option.size,
        price: option.price,
        stock: option.stock
      }));
      
      // เลือกตัวเลือกแรกที่มีสินค้าในสต็อก
      const optionIndex = route.query.option ? parseInt(route.query.option) : -1;
      
      if (optionIndex >= 0 && optionIndex < product.value.Options.length) {
        // ถ้ามี query parameter และเป็นค่าที่ถูกต้อง ใช้ตัวเลือกนั้น
        selectedOption.value = product.value.Options[optionIndex];
      } else {
        // ถ้าไม่มี query parameter ใช้ตัวเลือกแรกที่มีสินค้าในสต็อก
        const inStockOption = product.value.Options.find(option => option.stock > 0);
        selectedOption.value = inStockOption || product.value.Options[0];
      }
      
      // ตรวจสอบว่ามี query parameter showOptions หรือไม่
      if (route.query.showOptions === 'true') {
        // เปิด Bottom Sheet อัตโนมัติ
        setTimeout(() => {
          openBottomSheet();
        }, 500); // รอให้ component render ก่อน
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    product.value = null;
  } finally {
    isLoading.value = false;
  }
};

// ฟังก์ชันเพิ่มลดจำนวนสินค้า
const increaseQuantity = () => {
  if (selectedOption.value) {
    if (quantity.value < selectedOption.value.stock) {
      quantity.value++;
    } else {
      // แสดงข้อความแจ้งเตือนเมื่อเลือกเกินจำนวนในสต็อก
      alert(`ไม่สามารถเพิ่มจำนวนได้ เนื่องจากมีสินค้าในสต็อกเพียง ${selectedOption.value.stock} ชิ้น`);
    }
  } else {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};


// ฟังก์ชันสลับสถานะชื่นชอบ
const toggleFavorite = async () => {
  try {
    // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
    if (!authService.isLoggedIn()) {
      // ถ้ายังไม่ได้ล็อกอิน ให้นำทางไปหน้า login
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
      return;
    }

    if (isFavorite.value) {
      // ถ้าเป็น favorite อยู่แล้ว ให้ลบออก
      await favoriteService.removeFromFavorite(product.value._id);
    } else {
      // ถ้ายังไม่เป็น favorite ให้เพิ่มเข้าไป
      await favoriteService.addToFavorite(product.value._id);
    }
    
    // สลับสถานะหลังจากดำเนินการเสร็จ
    isFavorite.value = !isFavorite.value;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    alert('เกิดข้อผิดพลาดในการจัดการรายการโปรด กรุณาลองใหม่อีกครั้ง');
  }
};

// ฟังก์ชันเปิด Bottom Sheet
const openBottomSheet = () => {
  animationClass.value = 'animate__animated animate__slideInUp';
  isBottomSheetVisible.value = true;
};

// ฟังก์ชันปิด Bottom Sheet
const closeBottomSheet = () => {
  animationClass.value = 'animate__animated animate__slideOutDown';
};

// ฟังก์ชันเรียกหลังจบแอนิเมชัน
const handleAnimationEnd = () => {
  if (animationClass.value === 'animate__animated animate__slideOutDown') {
    isBottomSheetVisible.value = false;
  }
};

// ฟังก์ชันสำหรับปิดเมื่อคลิกนอก modal
const closeOnClickOutside = (event) => {
  if (event.target === event.currentTarget) {
    closeBottomSheet();
  }
};

// ฟังก์ชันเลือก Option
const selectOption = (option) => {
  selectedOption.value = option;
};

// ฟังก์ชันเพิ่มสินค้าลงในตะกร้า
const addToCart = async () => {
  if (!isOptionSelected.value) {
    openBottomSheet(); // เปิด Bottom Sheet ให้เลือก Option
  } else {
    try {
      // ตรวจสอบจำนวนสินค้าในสต็อก
      if (selectedOption.value.stock < quantity.value) {
        alert(`ขออภัย สินค้าในสต็อกมีเพียง ${selectedOption.value.stock} ชิ้นเท่านั้น`);
        return;
      }

      // ข้อมูลสินค้าที่จะเพิ่มลงตะกร้า
      const cartItem = {
        productId: product.value._id,
        name: product.value.name,
        option: selectedOption.value.name,
        price: selectedOption.value.price,
        quantity: quantity.value,
        image: product.value.image
      };
      
      // เช็คว่าผู้ใช้ล็อกอินแล้วหรือไม่
      if (!authService.isLoggedIn()) {
        // ถ้ายังไม่ได้ล็อกอิน ให้เก็บไว้ใน localStorage ชั่วคราวก่อน
        // แล้วนำทางไปหน้า login
        localStorage.setItem('pendingCartItem', JSON.stringify(cartItem));
        
        // นำทางไปหน้า login
        router.push('/login?redirect=cart');
        return;
      }
      
      // แสดงรายละเอียดใน log
      console.log(`
        📦 เพิ่มสินค้าเข้าตะกร้า
        🛍️ ชื่อสินค้า: ${product.value.name}
        📌 ตัวเลือกที่เลือก: ${selectedOption.value.name}
        💰 ราคา: ${selectedOption.value.price} บาท
        🔢 จำนวน: ${quantity.value}
        📊 สต็อกคงเหลือ: ${selectedOption.value.stock} ชิ้น
        🛒 -----------------------
      `);
      
      // ถ้าล็อกอินแล้ว ให้เรียกใช้ API เพิ่มลงตะกร้า
      const result = await cartService.addToCart(
        product.value._id,
        selectedOption.value.name,
        quantity.value  // ส่งจำนวนสินค้าไปด้วย
      );
      
      // แสดงข้อความหรือ notification แจ้งเตือนว่าเพิ่มสินค้าสำเร็จ
      alert('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
      
      closeBottomSheet();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // ตรวจสอบข้อความข้อผิดพลาด
      if (error.message && error.message.includes('out of stock')) {
        alert('สินค้าหมด หรือมีไม่เพียงพอในสต็อก');
      } else {
        alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
      }
    }
  }
};

// จัดการกรณีโหลดรูปภาพไม่สำเร็จ
const handleImageError = () => {
  if (product.value) {
    product.value.image = null;
  }
};

// เมื่อมีการเปลี่ยนแปลง route
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchProduct(newId);
    checkFavoriteStatus(newId);
  }
}, { immediate: true });

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกเรียกใช้
onMounted(() => {
  if (route.params.id) {
    fetchProduct(route.params.id);
    checkFavoriteStatus(route.params.id);
  }
});
// ฟังก์ชันแสดงสถานะสินค้าคงเหลือ
const getStockStatus = (stock) => {
  if (stock <= 0) {
    return {
      class: 'text-red-600',
      text: 'สินค้าหมด'
    };
  } else if (stock <= 5) {
    return {
      class: 'text-amber-600',
      text: `เหลือเพียง ${stock} ชิ้น`
    };
  } else {
    return {
      class: 'text-green-600',
      text: `คงเหลือ ${stock} ชิ้น`
    };
  }
};
</script>

<template>
  <div class="page-container">
    <!-- Navbar -->
    <nav class="navbar fixed top-0 left-0 w-full bg-white shadow-md z-50 px-5 py-3 flex items-center">
      <button @click="$router.back()" class="btn btn-ghost">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <h1 class="text-lg font-semibold text-[#0c3a5b] mx-20">รายละเอียดสินค้า</h1>
    </nav>
    
    <!-- แสดงสถานะกำลังโหลด -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- แสดงข้อความเมื่อไม่พบสินค้า -->
    <div v-else-if="!product" class="text-center py-16">
      <div class="flex flex-col items-center justify-center">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-2 text-gray-400"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">ไม่พบสินค้า</h3>
        <p class="text-gray-500 max-w-md px-4">ไม่พบสินค้าที่คุณต้องการ หรือสินค้าอาจถูกลบออกจากระบบแล้ว</p>
        <button @click="$router.back()" class="btn btn-primary mt-4">
          <i class="fa-solid fa-arrow-left mr-2"></i> กลับ
        </button>
      </div>
    </div>

    <!-- แสดงรายละเอียดสินค้า -->
    <div v-else class="container px-5 mx-auto">
      <div class="flex flex-col card shadow-md bg-base-100 rounded-lg">
        <!-- รูปภาพสินค้า -->
        <div class="flex items-center justify-center w-64 h-64 mx-auto bg-gray-100 overflow-hidden">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="object-contain w-full h-full"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <i class="fa-solid fa-image text-gray-400 text-4xl"></i>
          </div>
        </div>
        
        <div class="flex flex-col px-4">
          <p class="text-[#44842d] text-lg mt-4 font-bold">
            {{ selectedPrice }} บาท
          </p>
          <div class="flex justify-between items-center">
            <h1 class="text-lg font-semibold text-[#0c3a5b]">
              {{ product.name }}
            </h1>
            <!-- ไอคอนรูปหัวใจ -->
            <button
              class="text-gray-400 hover:text-[#44842d] transition-colors"
              @click="toggleFavorite"
            >
              <i
                :class="[ 
                  isFavorite 
                    ? 'fa-solid fa-heart text-[#44842d] text-xl' 
                    : 'fa-regular fa-heart text-xl' 
                ]"
              ></i>
            </button>
          </div>
          <p class="text-sm text-[#005a9a] mb-4">{{ product.description }}</p>
        </div>
      </div>

      <!-- Option -->
      <div
        @click="openBottomSheet"
        class="flex flex-col card shadow-md bg-base-100 rounded-lg mt-2 px-4 hover:cursor-pointer"
      >
        <div class="flex justify-between items-center py-2">
          <div class="text-[#0c3a5b] font-bold">เลือกตัวเลือก</div>
          <div><i class="fa-solid fa-chevron-right"></i></div>
        </div>
        <div
          v-if="product.Options && product.Options.length > 0"
          class="flex flex-wrap gap-2"
        >
          <div
            v-for="(option, index) in product.Options"
            :key="index"
            :class="['w-auto border rounded py-1 px-1 mb-4 text-center', 
                     { 'bg-[#d5e5f3] text-[#005a9a] border-[#83a9c4]': selectedOption === option }]"
          >
            {{ option.name }}
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="flex flex-col card shadow-md bg-base-100 rounded-lg mt-2 px-4">
        <div class="py-3">
          <div class="text-[#0c3a5b] font-bold">เกี่ยวกับสินค้า</div>
          <p class="text-sm mt-2">{{ product.about }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Bottom Sheet -->
    <div
      v-if="isBottomSheetVisible"
      class="fixed inset-0 z-50 flex items-end bg-gray-900 bg-opacity-50 pb-c"
      @click="closeOnClickOutside"
    >
      <div
        :class="['modal-box w-full min-w-full bg-white rounded-t-xl p-0', animationClass]"
        style="--animate-duration: 0.3s"
        @animationend="handleAnimationEnd"
        role="dialog"
      >
        <button class="btn btn-sm btn-ghost btn-circle absolute right-3 top-3" @click="closeBottomSheet">
          <i class="fa-solid fa-xmark text-[#0c3a5b] text-2xl"></i>
        </button>

        <div class="flex flex-row items-left px-6 py-6">
          <img 
            v-if="product.image" 
            :src="product.image" 
            alt="product" 
            class="w-32 h-32 rounded object-contain" 
          />
          <div v-else class="w-32 h-32 flex items-center justify-center bg-gray-100 rounded">
            <i class="fa-solid fa-image text-gray-400 text-2xl"></i>
          </div>
          <div class="flex flex-col ml-4 mt-3">
          <p class="text-xl font-bold text-[#0c3a5b]">{{ selectedPrice }} บาท</p>
          <p class="text-sm mt-2" v-if="selectedOption">
            <span :class="getStockStatus(selectedOption.stock).class">
              {{ getStockStatus(selectedOption.stock).text }}
            </span>
          </p>
          </div>
        </div>
        <div class="divider my-0"></div>

        <!-- ตัวเลือก -->
        <div class="mt-3 px-6 h-c">
          <p class="font-semibold mb-2 text-[#0c3a5b]">เลือกตัวเลือก</p>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="(option, index) in product.Options"
              :key="index"
              :class="['btn btn-sm', 
                      { 'bg-[#d5e5f3] text-[#005a9a] border-[#83a9c4]': selectedOption === option }]"
              @click="selectOption(option)"
            >
              {{ option.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar fixed bottom-0 w-full bg-white text-white shadow-lg">
      <div class="flex items-center border-t-2">
        <div class="container mx-auto flex items-center justify-between px-4 py-2">
          <div class="flex items-center border border-[#44842d] rounded-full h-12 px-2">
            <button
              class="btn btn-sm btn-circle bg-[#44842d] flex items-center justify-evenly"
              @click="decreaseQuantity"
            >
              <i class="fa-solid fa-minus text-xl text-white"></i>
            </button>
            <span class="mx-10 text-lg font-bold text-black">{{ quantity }}</span>
            <button
              class="btn btn-sm btn-circle bg-[#44842d] flex items-center justify-center"
              @click="increaseQuantity"
            >
              <i class="fa-solid fa-plus text-lg text-white"></i>
            </button>
          </div>
        </div>

        <button
          class="btn bg-[#44842d] text-white px-6 h-12 rounded-full ml-4"
          @click="addToCart"
        >
          Add to cart
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.page-container {
  padding-bottom: 80px;
  padding-top: 70px;
}

.bottom-bar {
  z-index: 50;
}

.pb-c {
  padding-bottom: 50px;
}

.h-c {
  height: 25rem;
}

.w-auto {
  cursor: pointer;
}

.navbar {
  height: 56px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 50;
}
</style>