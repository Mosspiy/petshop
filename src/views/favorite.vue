<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import favoriteService from "../services/favoriteService";
import authService from "../services/authService";

const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';
const isLoading = ref(true);
const error = ref(null);
const favorites = ref([]);
const user = ref({
  displayName: '',
  pictureUrl: ''
});

// ฟังก์ชันย้อนกลับ
const goBack = () => {
  router.back();
};

// ดึงข้อมูลผู้ใช้
const fetchUserProfile = async () => {
  try {
    isLoading.value = true;
    const userProfile = await authService.getUserProfile();
    user.value = userProfile;
    return userProfile;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
    return null;
  }
};

// ดึงข้อมูลรายการโปรด
const fetchFavorites = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // ดึงข้อมูลผู้ใช้
    const userProfile = await fetchUserProfile();
    if (!userProfile || !userProfile.id) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }
    
    // ดึงข้อมูลรายการโปรด
    const favoritesData = await favoriteService.getFavoriteItems();
    console.log('Favorites data:', favoritesData);
    
    // ดึงข้อมูลสินค้าแต่ละรายการ
    const productsWithDetails = [];
    
    if (favoritesData && favoritesData.items && Array.isArray(favoritesData.items)) {
      for (const item of favoritesData.items) {
        try {
          // ตรวจสอบว่า productId เป็น object หรือไม่
          const productId = typeof item.productId === 'object' 
            ? (item.productId._id || item.productId.id) 
            : item.productId;
            
          console.log('Processing product ID:', productId);
          
          if (!productId) {
            console.warn('Invalid product ID:', item.productId);
            continue;
          }
          
          const response = await fetch(`${apiUrl}/admin/products/${productId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const product = await response.json();
            productsWithDetails.push({
              ...product,
              favoriteId: favoritesData._id
            });
          }
        } catch (productErr) {
          console.error(`Error fetching product:`, productErr);
        }
      }
    } else {
      console.warn('Invalid favorites data structure:', favoritesData);
    }
    
    favorites.value = productsWithDetails;
    console.log('Processed favorites:', favorites.value);
   
  } catch (err) {
    console.error('Error fetching favorites:', err);
    error.value = 'ไม่สามารถโหลดรายการสินค้าที่ถูกใจได้';
  } finally {
    isLoading.value = false;
  }
};

// ลบสินค้าออกจากรายการโปรด
const removeFromFavorites = async (event, product) => {
  event.stopPropagation();
  
  try {
    await favoriteService.removeFromFavorite(product._id);
    
    // อัปเดตรายการโปรดในหน้าจอ
    favorites.value = favorites.value.filter(item => item._id !== product._id);
    
  } catch (err) {
    console.error('Error removing from favorites:', err);
    alert('ไม่สามารถลบสินค้าออกจากรายการที่ถูกใจได้');
  }
};

// แปลงรายการสินค้าให้เป็นการ์ด
const productCards = computed(() => {
  const cards = [];
  
  favorites.value.forEach(product => {
    // ถ้าไม่มี options จะสร้าง card เดียว
    if (!product.options || product.options.length === 0) {
      cards.push({
        ...product,
        id: product._id,
        optionIndex: -1,
        price: 0,
        optionName: 'ไม่ระบุ'
      });
    } else {
      // ถ้ามี options จะสร้าง card แยกตาม option
      product.options.forEach((option, index) => {
        cards.push({
          ...product,
          id: product._id,
          name: product.name,
          price: option.price,
          optionIndex: index,
          optionName: option.size,
          stock: option.stock
        });
      });
    }
  });
  
  return cards;
});

// นำทางไปยังหน้ารายละเอียดสินค้า
const navigateToProduct = (product) => {
  router.push({
    name: 'ProductDetail',
    params: { id: product.id },
    query: { option: product.optionIndex >= 0 ? product.optionIndex : undefined }
  });
};

// ปุ่มเพิ่มลงตะกร้า (ที่อยู่ในการ์ด)
const addToCartFromCard = (event, product) => {
  // ป้องกันการกระจายอีเวนท์ (event bubbling)
  event.stopPropagation();
  
  // เรียกหน้ารายละเอียดสินค้าพร้อมแสดง bottom sheet เพื่อให้เลือกตัวเลือก
  router.push({
    name: 'ProductDetail',
    params: { id: product.id },
    query: { 
      option: product.optionIndex >= 0 ? product.optionIndex : undefined,
      showOptions: 'true'
    }
  });
};

// จัดการการโหลดรูปภาพไม่สำเร็จ
const handleImageError = (event) => {
  event.target.src = null;
  // จะแสดงไอคอน placeholder แทน
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกเรียกใช้
onMounted(() => {
  fetchFavorites();
});
</script>

<template>
  <div class="pb-20">
    <!-- Header -->
    <div class="relative flex items-center justify-center pt-8 pl-4 mb-6">
      <!-- ปุ่มย้อนกลับ -->
      <button @click="goBack" class="btn btn-ghost absolute left-5">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <!-- หัวข้อกลางจอ -->
      <h1 class="text-xl font-bold text-[#0c3a5b]">สินค้าที่ถูกใจ</h1>
    </div>
    
    
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
        <button @click="fetchFavorites" class="btn btn-primary mt-4">
          <i class="fa-solid fa-refresh mr-2"></i> ลองใหม่
        </button>
      </div>
    </div>
    
    <!-- แสดงข้อความเมื่อไม่มีสินค้า -->
    <div v-else-if="productCards.length === 0" class="text-center py-16 px-4">
      <div class="flex flex-col items-center justify-center">
        <i class="fa-regular fa-heart text-4xl mb-2 text-gray-400"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีสินค้าที่ถูกใจ</h3>
        <p class="text-gray-500 max-w-md">เพิ่มสินค้าที่คุณชื่นชอบลงในรายการโปรดเพื่อเข้าถึงได้ง่ายขึ้น</p>
      </div>
    </div>
    
    <!-- แสดงรายการสินค้า -->
    <div v-else class="grid grid-cols-2 gap-4 px-4">
      <!-- แสดงการ์ดสินค้าตามรูปแบบใน ProductCard.vue -->
      <div 
        v-for="product in productCards" 
        :key="`${product.id}-${product.optionIndex}`"
        class="card shadow-md bg-base-100 rounded-lg h-full cursor-pointer"
        @click="navigateToProduct(product)"
      >
        <!-- รูปสินค้า -->
        <figure class="p-4 relative">
          <img
            v-if="product.imageUrl"
            :src="`${apiUrl}/uploads/${product.imageUrl}`"
            :alt="product.name"
            class="w-full h-36 object-contain"
            @error="handleImageError"
          />
          <div v-else class="w-full h-36 flex items-center justify-center bg-gray-100">
            <i class="fa-solid fa-image text-gray-400 text-2xl"></i>
          </div>
          
          <!-- ปุ่มลบออกจากรายการโปรด -->
          <button 
            @click.stop="removeFromFavorites($event, product)"
            class="absolute top-2 right-2 btn btn-circle btn-sm bg-white border-none shadow-md text-[#44842d] hover:bg-[#44842d] hover:text-white"
          >
            <i class="fa-solid fa-heart text-lg"></i>
          </button>
        </figure>
        
        <!-- เนื้อหา Card -->
        <div class="card-body p-4">
          <h2 class="text-sm font-semibold text-gray-700 line-clamp-2" :title="product.name">
            {{ product.name }}
          </h2>
          <!-- แสดง option แทน description -->
          <p class="text-xs text-[#005a9a] font-semibold mt-1">
            <span class="bg-[#f0f7ff] px-2 py-1 rounded-lg inline-block">
              {{ product.optionName }}
            </span>
          </p>
          <div class="flex justify-between items-center mt-3">
            <span class="text-lg font-semibold text-[#44842d]">
              ฿{{ product.price.toLocaleString() }}
            </span>
            <button
              class="btn btn-circle btn-sm bg-[#44842d] text-white"
              @click="addToCartFromCard($event, product)"
            >
              <i class="fa-solid fa-plus text"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ตัดข้อความที่ยาวเกินไป */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>