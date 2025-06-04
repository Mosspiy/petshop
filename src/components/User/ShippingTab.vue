<script setup>
import { ref, onMounted, computed } from 'vue';
import userOrderService from '@/services/client/userOrderService';
import authService from '@/services/authService';

// ตัวแปรเก็บข้อมูลออเดอร์
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// ฟังก์ชันสำหรับดึงข้อมูลออเดอร์
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // ตรวจสอบว่ามีการล็อกอินหรือไม่
    if (!authService.isLoggedIn()) {
      error.value = 'กรุณาเข้าสู่ระบบเพื่อดูรายการสั่งซื้อ';
      return;
    }
    
    // ดึงข้อมูลออเดอร์ของผู้ใช้
    const userOrders = await userOrderService.getUserOrders();
    console.log('All orders data:', userOrders);
    
    // กรองเฉพาะออเดอร์ที่มีสถานะ "Processing"
    orders.value = userOrders.filter(order => order.status === 'Processing');
    console.log('Processing orders:', orders.value);
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = 'ไม่สามารถโหลดรายการสั่งซื้อได้';
  } finally {
    isLoading.value = false;
  }
};

// ฟังก์ชันจัดการกรณีโหลดรูปภาพไม่สำเร็จ
const handleImageError = (event) => {
  console.log('Image load error, replacing with placeholder');
  event.target.src = 'https://via.placeholder.com/80';
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="p-4 max-w-md mx-auto md:max-w-full flex justify-center items-center">
    <div class="loading loading-spinner loading-md text-[#005a9a]"></div>
  </div>
  
  <!-- Error State -->
  <div v-else-if="error" class="p-4 max-w-md mx-auto md:max-w-full">
    <div class="alert alert-error">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>{{ error }}</span>
    </div>
  </div>
  
  <!-- Empty State -->
  <div v-else-if="orders.length === 0" class="p-4 max-w-md mx-auto md:max-w-full">
    <div class="card bg-white shadow-md rounded-xl p-8 text-center">
      <i class="fa-solid fa-box-open text-gray-400 text-4xl mb-2"></i>
      <p class="text-gray-600">ยังไม่มีคำสั่งซื้อที่รอจัดส่ง</p>
    </div>
  </div>
  
  <!-- Orders List -->
  <div v-else class="p-4 max-w-md mx-auto md:max-w-full">
    <div v-for="order in orders" :key="order.id" class="card bg-white shadow-md rounded-xl mb-4">
      <div class="card p-4">
        <h2 class="card-title text-lg font-semibold mb-2">รายการสั่งซื้อ #{{ order.orderCode || order.id }}</h2>
        
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
            <!-- แสดงราคาสินค้า พร้อมตรวจสอบค่า -->
            <p v-if="item.price > 0" class="text-sm font-bold">{{ item.price.toFixed(2) }} บาท</p>
            <p v-else class="text-sm font-bold text-gray-500">ไม่ระบุราคา</p>
          </div>
          <div class="ml-4 relative">
            <span class="text-gray-700 text-sm absolute bottom-0 right-0">x{{ item.quantity }}</span>
          </div>
        </div>
        
        <div class="pt-2">
          <p class="text-sm text-right w-full">{{ (order.items || []).length }} รายการ : {{ (order.total || 0).toFixed(2) }} บาท</p>
          <p class="text-sm text-right w-full pt-1">กำลังจัดเตรียมสินค้า</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* คุณสามารถเพิ่ม CSS เพิ่มเติมในนี้ */
</style>