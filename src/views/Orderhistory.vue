<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import userOrderService from "../services/client/userOrderService";
import authService from "../services/authService";

const router = useRouter();
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// ฟังก์ชันดึงข้อมูลคำสั่งซื้อที่มีการรีวิวแล้ว
const fetchReviewedOrders = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // ตรวจสอบว่ามีการล็อกอินหรือไม่
    if (!authService.isLoggedIn()) {
      error.value = 'กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ';
      return;
    }
    
    // ดึงข้อมูลออเดอร์ทั้งหมดของผู้ใช้
    const userOrders = await userOrderService.getUserOrders();
    console.log('All orders:', userOrders);
    
    // กรองเฉพาะออเดอร์ที่มีการรีวิวแล้ว
    orders.value = userOrders.filter(order => order.isReviewed === true);

    // จัดเรียงตามวันที่ล่าสุด
    orders.value.sort((a, b) => {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
    
    console.log('Reviewed orders:', orders.value);
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลประวัติคำสั่งซื้อได้';
  } finally {
    isLoading.value = false;
  }
};

// ฟังก์ชันจัดการกรณีโหลดรูปภาพไม่สำเร็จ
const handleImageError = (event) => {
  console.log('Image load error, replacing with placeholder');
  event.target.src = 'https://via.placeholder.com/80';
};

// คำนวณราคารวมของออเดอร์
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// ย้อนกลับไปหน้าก่อนหน้า
const goBack = () => {
  router.back();
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  fetchReviewedOrders();
});
</script>

<template>
  <div class="w-full h-full">
    <!-- Header -->
    <div class="relative flex items-center justify-center pt-8 pl-4">
      <!-- ปุ่มย้อนกลับ -->
      <button @click="goBack" class="btn btn-ghost absolute left-5">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <!-- หัวข้อกลางจอ -->
      <h1 class="text-xl font-bold">ประวัติคำสั่งซื้อ</h1>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="p-4 max-w-3xl mx-auto flex justify-center items-center py-16">
      <div class="loading loading-spinner loading-lg text-[#005a9a]"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="p-4 max-w-3xl mx-auto">
      <div class="alert alert-error shadow-lg">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ error }}</span>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="p-4 max-w-3xl mx-auto">
      <div class="bg-white p-8 rounded-2xl shadow-md text-center">
        <i class="fa-solid fa-shopping-bag text-gray-400 text-4xl mb-2"></i>
        <p class="text-gray-600">ยังไม่มีประวัติการสั่งซื้อที่ได้รับการรีวิวแล้ว</p>
        <p class="text-gray-500 mt-2">กรุณารีวิวสินค้าที่คุณได้รับเพื่อดูประวัติในหน้านี้</p>
      </div>
    </div>
    
    <!-- Orders List -->
    <div v-else class="p-4 max-w-3xl mx-auto">
      <div v-for="order in orders" :key="order.id" class="bg-white p-4 rounded-2xl shadow-md mb-4">
        <h2 class="text-lg font-semibold">รายการสั่งซื้อ #{{ order.orderCode || order.id }}</h2>
        
        <!-- แสดงเฉพาะสรุปรายการสินค้า ไม่แสดงรายละเอียดทั้งหมด -->
        <div v-for="(item, index) in order.items" :key="index" class="flex py-2 border-b last:border-none">
          <img 
            :src="item.image" 
            alt="รูปสินค้า" 
            class="w-16 h-16 object-cover rounded-md" 
            @error="handleImageError"
          />
          <div class="ml-2 flex-1">
            <h3 class="text-sm font-medium">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ item.option }}</p>
            <p v-if="item.price > 0" class="text-sm font-bold">{{ item.price.toFixed(2) }} บาท</p>
            <p v-else class="text-sm font-bold text-gray-500">ไม่ระบุราคา</p>
          </div>
          <div class="ml-4 relative">
            <span class="text-gray-700 text-sm absolute bottom-0 right-0">x{{ item.quantity }}</span>
          </div>
        </div>
        
        <!-- สรุปจำนวนรายการและราคารวม -->
        <p class="text-right text-sm font-bold mt-2">
          {{ order.items.length }} รายการ : {{ order.total.toFixed(2) }} บาท
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* คุณสามารถเพิ่ม CSS เพิ่มเติมในนี้ */
</style>