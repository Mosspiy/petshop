<!-- PopularProducts.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// ค่า API URL
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// ตัวแปรสถานะ
const isLoading = ref(true);
const products = ref([]);
const router = useRouter();

// ฟังก์ชันสำหรับดึงข้อมูลสินค้ายอดนิยม
const fetchPopularProducts = async () => {
  isLoading.value = true;
  
  try {
    // เรียก API เพื่อดึงข้อมูลสินค้า
    const response = await fetch(`${apiUrl}/admin/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('ไม่สามารถโหลดข้อมูลสินค้าได้');
    }
    
    const data = await response.json();
    
    // กรองเฉพาะสินค้าที่ active
    products.value = data
      .filter(product => product.status === true || product.status === 'Active')
      .map(product => ({
        ...product,
        image: product.imageUrl 
          ? `${apiUrl}/uploads/${product.imageUrl}` 
          : null,
        // แปลง options เป็น Options (รูปแบบที่ต้องการแสดงใน template)
        Options: product.options 
          ? product.options.map(opt => ({
              name: opt.size,
              price: opt.price,
              stock: opt.stock
            })) 
          : []
      }));
  } catch (error) {
    console.error('Error fetching popular products:', error);
  } finally {
    isLoading.value = false;
  }
};

// สร้าง product cards โดยแยกตาม options
const productCards = computed(() => {
  const cards = [];
  
  products.value.forEach(product => {
    // ถ้าไม่มี options จะสร้าง card เดียว
    if (!product.options || product.options.length === 0) {
      cards.push({
        ...product,
        id: product._id,
        optionIndex: -1
      });
    } else {
      // ถ้ามี options จะสร้าง card แยกตาม option
      product.options.forEach((option, index) => {
        cards.push({
          ...product,
          id: product._id,
          name: `${product.name}`,
          Options: [{ name: option.size, price: option.price, stock: option.stock }],
          optionIndex: index
        });
      });
    }
  });
  
  // จำกัดแค่ 8 รายการแรก
  return cards.slice(0, 8);
});

// จัดการกรณีโหลดรูปภาพไม่สำเร็จ
const handleImageError = (product) => {
  product.image = null;
};

// นำทางไปยังหน้ารายละเอียดสินค้า พร้อมส่งข้อมูล option ที่เลือก
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

// นำทางไปยังหน้าสินค้าทั้งหมด
const goToAllProducts = () => {
  router.push('/products');
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกเรียกใช้
onMounted(() => {
  fetchPopularProducts();
});
</script>

<template>
  <!-- แสดงสถานะกำลังโหลด -->
  <div v-if="isLoading" class="flex justify-center items-center py-4">
    <div class="loading loading-spinner loading-md"></div>
  </div>

  <!-- แสดงข้อความเมื่อไม่พบสินค้า -->
  <div v-else-if="productCards.length === 0" class="text-center py-4">
    <div class="flex flex-col items-center justify-center">
      <i class="fa-solid fa-box-open text-4xl mb-2 text-gray-400"></i>
      <p class="text-gray-600">ไม่พบสินค้า</p>
    </div>
  </div>

  <!-- แสดงรายการสินค้ายอดนิยม -->
  <div v-else class="pt-5">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="product in productCards"
        :key="`${product.id}-${product.optionIndex}`"
        class="card shadow-md bg-base-100 rounded-lg"
        @click="navigateToProduct(product)"
      >
        <!-- รูปสินค้า -->
        <figure class="p-4">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-36 object-contain"
            @error="handleImageError(product)"
          />
          <div v-else class="w-full h-36 flex items-center justify-center bg-gray-100">
            <i class="fa-solid fa-image text-gray-400 text-2xl"></i>
          </div>
        </figure>
        
        <!-- เนื้อหา Card -->
        <div class="card-body p-4">
          <h2 class="text-sm font-semibold text-gray-700 line-clamp-2" :title="product.name">
            {{ product.name }}
          </h2>
          <p class="text-xs text-[#005a9a] line-clamp-2" :title="product.Options[0]?.name">
            <span class="bg-[#f0f7ff] px-2 py-1 rounded-lg inline-block">
            {{ product.currentOption || product.Options[0]?.name || 'ไม่ระบุ' }}
          </span>
          </p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-lg font-semibold text-[#44842d]">
              ฿{{ product.Options[0]?.price || 0 }}
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

    <!-- ปุ่มดูสินค้าทั้งหมด -->
    <div class="flex justify-center mt-6">
      <button 
        @click="goToAllProducts" 
        class="btn btn-outline text-[#2b7deb] border-[#2b7deb] hover:bg-[#2b7deb] hover:border-[#2b7deb]"
      >
        ดูสินค้าทั้งหมด
      </button>
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