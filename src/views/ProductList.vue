<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import menubar from "@/layout/menu.vue";
import ProductCard from "@/components/ProductCard.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue"; 
import EmptyState from "@/components/EmptyState.vue"; 
import SearchBar from "@/components/searchbar.vue";
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สถานะต่างๆ
const allProducts = ref([]);
const filteredProducts = ref([]);
const isLoading = ref(true);
const error = ref(null);
const categories = ref(['ทั้งหมด']);
const animalTypes = ref(['ทั้งหมด']);

// รับค่า category จาก query parameter
const category = computed(() => route.query.category || "all");

const categoryTitle = computed(() => {
  return category.value === "all" ? "สินค้าทั้งหมด" : category.value;
});

// ดึงข้อมูลสินค้า
const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // ดึงสินค้า
    const productsResponse = await axios.get(`${apiUrl}/products`);
    allProducts.value = productsResponse.data.map(product => ({
      ...product,
      images: product.imageUrl 
        ? [`${apiUrl}/uploads/${decodeURIComponent(product.imageUrl)}`] 
        : []
    }));

    // กรองตามหมวดหมู่
    if (category.value !== "all") {
      allProducts.value = allProducts.value.filter(
        prod => prod.category === category.value
      );
    }

    // คัดลอกข้อมูลเริ่มต้น
    filteredProducts.value = [...allProducts.value];

    // ดึงหมวดหมู่และประเภทสัตว์
    const [categoriesResponse, animalTypesResponse] = await Promise.all([
      axios.get(`${apiUrl}/products/categories/list`),
      axios.get(`${apiUrl}/products/animal-types/list`)
    ]);

    categories.value = ['ทั้งหมด', ...categoriesResponse.data];
    animalTypes.value = ['ทั้งหมด', ...animalTypesResponse.data];

    isLoading.value = false;
  } catch (err) {
    console.error("Error fetching products:", err);
    error.value = "ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง";
    isLoading.value = false;
  }
};

// จัดการการค้นหา
const handleSearch = (searchData) => {
  let results = [...allProducts.value];

  // กรองตามคำค้นหา
  if (searchData.q && searchData.q.trim()) {
    const query = searchData.q.toLowerCase().trim();
    results = results.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  // กรองตามประเภทสัตว์
  if (searchData.animalType && searchData.animalType !== 'ทั้งหมด') {
    results = results.filter(product => 
      product.animalType === searchData.animalType
    );
  }

  // กรองตามราคา
  if (searchData.price) {
    results = results.filter(product => {
      const minPrice = Math.min(...product.options.map(option => option.price));
      switch(searchData.price) {
        case '฿': return minPrice < 100;
        case '฿฿': return minPrice >= 100 && minPrice < 500;
        case '฿฿฿': return minPrice >= 500 && minPrice < 1000;
        case '฿฿฿฿': return minPrice >= 1000;
        default: return true;
      }
    });
  }

  filteredProducts.value = results;
};

// รีเซ็ตการค้นหา
const resetSearch = () => {
  filteredProducts.value = [...allProducts.value];
};

// เมื่อคอมโพเนนต์ถูกโหลด
onMounted(fetchProducts);

// ไปยังหน้ารายละเอียดสินค้า
const goToProductDetail = (productId) => {
  router.push({
    name: 'ProductDetail', 
    params: { id: productId }
  });
};

// ย้อนกลับ
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="pb-20">
    <!-- Header -->
    <div class="z-10">
      <div class="flex items-center justify-between w-full px-4 py-3 gap-2 pt-8">
        <!-- ปุ่มย้อนกลับ -->
        <button @click="goBack" class="btn btn-ghost min-h-0 h-auto">
          <i class="fa-solid fa-chevron-left text-xl"></i>
        </button>
        
        <!-- ช่องค้นหา -->
        <div class="flex-grow">
          <SearchBar 
            :categoryName="category === 'all' ? '' : category" 
            @search="handleSearch"
            @reset="resetSearch"
          />
        </div>
      </div>
    </div>
    
    <!-- หัวข้อหมวดหมู่ -->
    <div class="px-4 py-2 mb-2">
      <h2 class="text-lg font-semibold">
        {{ categoryTitle }}
      </h2>
    </div>
    
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <LoadingSpinner />
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="p-4 text-center text-red-500">
      {{ error }}
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredProducts.length === 0" class="p-4">
      <EmptyState
        title="ไม่พบสินค้า"
        description="ไม่พบสินค้าในหมวดหมู่นี้หรือตามเงื่อนไขที่เลือก"
        icon="fa-solid fa-box-open"
      >
      </EmptyState>
    </div>
    
    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product._id"
        :product="product"
        @click="goToProductDetail(product._id)"
      />
    </div>
    
    <!-- Menu bar -->
    <menubar />
  </div>
</template>