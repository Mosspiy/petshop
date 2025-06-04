<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import all from "@/assets/categories/all.png";
import Animalfood from "@/assets/categories/food.png";
import Bath from "@/assets/categories/bath.png";
import Bed from '@/assets/categories/bed.png';
import Toy from '@/assets/categories/toy.png';
import Sand from '@/assets/categories/saicat.png';

const router = useRouter();

// กำหนดข้อมูล categories ด้วย ref
const categories = ref([
  { name: "ทั้งหมด", icon: all },
  { name: "อาหารสัตว์", icon: Animalfood },
  { name: "อาบน้ำ ดูแลขน", icon: Bath },
  { name: "กรง ที่นอน", icon: Bed  },
  { name: "ของเล่นสัตว์", icon: Toy  },
  { name: "ทรายแมว", icon: Sand },
]);

function goBack() {
  if (window.history.length > 1) {
    router.back(); // ย้อนกลับไปยังหน้าก่อนหน้า
  } else {
    router.push("/"); // กรณีไม่มีหน้าก่อนหน้า ให้พากลับหน้าแรก
  }
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
</script>

<template>
  <div class="flex flex-col items-center px-4 py-6 min-h-screen">
    <div class="card bg-white shadow-md rounded-lg w-full max-w-md sm:max-w-lg lg:max-w-2xl pb-8">
      <!-- Header -->
      <div class="card-header p-4 flex justify-between items-center">
        <!-- Icon ซ้ายสุด -->
        <button class="relative items-center justify-center btn btn-ghost z-10" @click="goBack">
          <i class="fa-solid fa-chevron-left text-xl"></i>
        </button>

        <!-- หัวข้ออยู่ตรงกลาง -->
        <h2 class="absolute inset-x-0 text-center font-bold text-base sm:text-lg lg:text-xl z-0">
          หมวดหมู่
        </h2>

        <!-- ช่องว่างด้านขวา -->
        <div></div>
      </div>

      <!-- Categories -->
      <div class="card-body grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="flex flex-col items-center space-y-2"
        >
          <button
            class="btn btn-ghost w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center p-0"
            @click="handleCategoryClick(category)"
          >
            <img
              :src="category.icon"
              alt="icon"
              class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
            />
          </button>
          <span class="text-sm sm:text-base lg:text-lg font-medium">
            {{ category.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Tailwind CSS utilities are used. Custom styles can be added here if needed. */
</style>