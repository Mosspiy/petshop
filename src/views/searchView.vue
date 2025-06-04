<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import SearchBar from '@/components/searchbar.vue';
import ProductCard from '@/components/ProductCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

const allProducts = ref([]);
const searchResults = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Fetch initial data
const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    const productsResponse = await axios.get(`${apiUrl}/products`);
    allProducts.value = productsResponse.data.map(product => ({
      ...product,
      images: product.imageUrl 
        ? [`${apiUrl}/uploads/${decodeURIComponent(product.imageUrl)}`] 
        : []
    }));

    searchResults.value = [...allProducts.value];
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลได้';
    isLoading.value = false;
  }
};

// Search method triggered by searchbar
const handleSearch = (searchData) => {
  console.log('Search Data Received:', searchData);

  let results = [...allProducts.value];

  // Search query filter
  if (searchData.q && searchData.q.trim()) {
    const query = searchData.q.toLowerCase().trim();
    results = results.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (searchData.category && searchData.category !== 'ทั้งหมด') {
    results = results.filter(product => 
      product.category === searchData.category
    );
  }

  // Animal type filter
  if (searchData.animalType && searchData.animalType !== 'ทั้งหมด') {
    results = results.filter(product => 
      product.animalType === searchData.animalType
    );
  }

  // Price filter
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

  searchResults.value = results;
};

// Lifecycle
onMounted(fetchInitialData);
</script>


<template>
  <div class="pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between w-full px-4 py-3 gap-2 pt-8">
      <!-- ปุ่มย้อนกลับ -->
      <button @click="router.back()" class="btn btn-ghost min-h-0 h-auto">
        <i class="fa-solid fa-chevron-left text-xl"></i>
      </button>
      
      <!-- ช่องค้นหา -->
      <div class="flex-grow">
        <SearchBar @search="handleSearch" />
      </div>
    </div>
    


    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <LoadingSpinner />
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="p-4 text-center text-red-500">
      {{ error }}
    </div>
    
    <!-- No Results -->
    <div v-else-if="searchResults.length === 0" class="p-4">
      <EmptyState
        title="ไม่พบสินค้า"
        description="ไม่มีสินค้าตรงกับการค้นหาของคุณ"
        icon="fa-solid fa-search"
      />
    </div>
    
    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      <ProductCard 
        v-for="product in searchResults" 
        :key="product._id"
        :product="product" 
      />
    </div>
  </div>
</template>