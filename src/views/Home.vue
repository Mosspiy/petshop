<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import swiper from "../components/swiper.vue";
import menubar from "@/layout/menu.vue";
import authService from "../services/authService";



import all from "@/assets/categories/all.png";
import Animalfood from "@/assets/categories/food.png";
import Bath from "@/assets/categories/bath.png";
import Bed from '@/assets/categories/bed.png';
import Toy from '@/assets/categories/toy.png';
import Sand from '@/assets/categories/saicat.png';

import searchbar from "@/components/searchbar.vue";
import PopularProduct from "../components/PopularProduct.vue";

const user = ref(null);
const router = useRouter();

const categories = [
  { name: "ทั้งหมด", image: all },
  { name: "อาหารสัตว์", image: Animalfood },
  { name: "อาบน้ำ ดูแลขน", image: Bath },
  { name: "กรง ที่นอน", image: Bed },
  { name: "ของเล่นสัตว์", image: Toy },
  { name: "ทรายแมว", image: Sand },
];

const displayedCategories = ref(categories);
const displayedCount = ref(4); // จำนวนเริ่มต้นแสดงผลที่ 4 อัน

function showAllCategories() {
  router.push({ name: "categories" }); // เปลี่ยนเส้นทางไปยังหน้าหมวดหมู่ทั้งหมด
}

// เพิ่มฟังก์ชันจัดการคลิกที่หมวดหมู่
const handleCategoryClick = (category) => {
  // ถ้าเป็นหมวดหมู่ "ทั้งหมด" ให้แสดงสินค้าทั้งหมด
  if (category.name === "ทั้งหมด") {
    router.push({ 
      name: "products",
      query: { category: "all" }
    });
  } else {
    // กรณีเป็นหมวดหมู่อื่นๆ
    router.push({ 
      name: "products", 
      query: { category: category.name }
    });
  }
};

onMounted(async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      user.value = await authService.getUserProfile();
      console.log('Loaded User:', user.value); // Debug log
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้', error);
    router.push('/login');
  }
});
</script>

<template>
  <!-- header-->
  <header class="flex items-center justify-between px-8 pt-8">
    <div class="flex items-center justify-start">
      <div v-if="user" class="user-profile flex items-center">
        <div v-if="user.pictureUrl" class="avatar w-12 h-12 mr-2">
          <img 
            :src="user.pictureUrl" 
            :alt="user.displayName" 
            class="mask mask-circle"
          />
        </div>
        <div v-else class="avatar placeholder mr-2">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
            <span>{{ user.displayName?.[0] || 'U' }}</span>
          </div>
        </div>
        <div>
          <p>สวัสดี, คุณ</p>
          <p class="pl-1 font-bold">{{ user.displayName }}</p>
        </div>
      </div>
      <div v-else>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  </header>

  <!-- Searchbar -->
   <button 
   @click="router.push({ name: 'search' })"
   class="w-full px-8 pt-3">
  <searchbar />
</button>  

  <!-- Banner Section -->
  <div class="px-8 py-3 flex items-center justify-center h-64 lg:mb-20 lg:mt-5">
    <swiper />
  </div>

  <!-- Category Section -->
  <div class="px-8 lg:py-5 md:py-6">
    <div class="flex items-center justify-between">
      <p class="text-[#0c3a5b] text-base font-semibold">หมวดหมู่สินค้า</p>
      <p
        @click="showAllCategories"
        class="text-[#2b7deb] font-semibold text-sm cursor-pointer hover:text-[#0c3a5b]"
      >
        ดูทั้งหมด
      </p>
    </div>

    <!-- Category Grid -->
    <div class="grid gap-4 mt-4 grid-cols-4">
      <div
        v-for="(category, index) in displayedCategories"
        :key="index"
        v-show="index < displayedCount"
        class="flex flex-col items-center p-2 rounded-lg"
      >
        <!-- Button Picture Category -->
        <button 
          class="btn btn-ghost p-0 w-14 h-14"
          @click="handleCategoryClick(category)"
        >
          <img
            :src="category.image"
            class="w-12 h-12 object-cover"
            :alt="category.name"
          />
        </button>
        <!-- Category Name -->
        <p class="text-sm text-center mt-2">{{ category.name }}</p>
      </div>
    </div>
  </div>

  <!-- Product Section -->
  <div class="px-4 pb-20">
    <p class="text-[#0c3a5b] text-base font-semibold">สินค้ายอดนิยม</p>
    <PopularProduct />
  </div>

<menubar />

</template>

<style scoped>

</style>