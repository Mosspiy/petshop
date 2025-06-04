<script setup>
import { ref, onMounted } from 'vue';
import userOrderService from '@/services/client/userOrderService';
import authService from '../../services/authService';

// ตัวแปรเก็บข้อมูลออเดอร์
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// ใช้เพื่อควบคุมการเปิดปิด modal
const showModal = ref(false);
const rating = ref(0); // คะแนนที่เลือก (0-5)
const reviewText = ref(""); // ข้อความรีวิว
const selectedOrder = ref(null); // ออเดอร์ที่กำลังรีวิว

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
    
    // กรองเฉพาะออเดอร์ที่มีสถานะ "Completed" และยังไม่ได้รีวิว
    orders.value = userOrders.filter(order => 
      order.status === 'Completed' && 
      (!order.isReviewed || order.isReviewed === false)
    );
    
    console.log('Orders to review:', orders.value);
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

// ฟังก์ชันสำหรับเปิด/ปิด modal
const openModal = (order) => {
  selectedOrder.value = order;
  rating.value = 0;
  reviewText.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};

// ฟังก์ชันเพื่อจัดการการเลือกดาว
const selectRating = (ratingValue) => {
  rating.value = ratingValue;
};

// ฟังก์ชันสำหรับส่งรีวิว
const submitReview = async () => {
  if (!selectedOrder.value) return;
  if (rating.value === 0) {
    alert('กรุณาให้คะแนนสินค้า');
    return;
  }
  
  try {
    console.log('ส่งรีวิว:', {
      orderId: selectedOrder.value.id,
      rating: rating.value,
      comment: reviewText.value
    });
    
    // ส่งรีวิวไปยัง backend
    await userOrderService.submitReview(selectedOrder.value.id, rating.value, reviewText.value);
    
    // เอาออเดอร์นี้ออกจากรายการที่ต้องรีวิว
    orders.value = orders.value.filter(order => order.id !== selectedOrder.value.id);
    
    alert('ขอบคุณสำหรับการรีวิว!');
    closeModal();
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง');
  }
};
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
      <i class="fa-solid fa-star text-gray-400 text-4xl mb-2"></i>
      <p class="text-gray-600">ไม่มีรายการที่ต้องให้คะแนน</p>
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
          <p class="text-sm text-right w-full">{{ order.items.length || 0 }} รายการ : {{ (order.total || 0).toFixed(2) }} บาท</p>
          
          <!-- เลขพัสดุ (ถ้ามี) -->
          <p v-if="order.trackingNumber && order.trackingNumber !== '-'" class="text-sm text-left mt-2">
            <span>หมายเลขพัสดุ: {{ order.trackingNumber }}</span>
          </p>

          <div class="flex justify-end pt-2">
            <!-- ปุ่มให้คะแนน -->
            <button
              @click="openModal(order)"
              class="btn btn-sm bg-[#c40c00] text-white rounded-3xl"
            >
              ให้คะแนน
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal สำหรับการให้คะแนน -->
  <div
    v-if="showModal && selectedOrder"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <!-- กำหนดให้ modal เป็น relative เพื่ออ้างอิงตำแหน่งของปุ่ม -->
    <div class="bg-white p-6 rounded-xl w-80 md:w-96 relative">
      <!-- ปุ่มย้อนกลับที่มุมบนซ้าย -->
      <button
        @click="closeModal"
        class="btn btn-ghost absolute left-4 top-4"
      >
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>

      <!-- หัวข้อ modal ที่อยู่ตรงกลาง -->
      <div class="flex items-center justify-center mb-4">
        <h3 class="text-lg font-semibold">ให้คะแนนสินค้า</h3>
      </div>

      <!-- การเลือกคะแนนโดยใช้ DaisyUI rating -->
      <div class="mb-4 flex justify-center items-center">
        <div class="rating">
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 bg-yellow-400"
            :checked="rating >= 1"
            @click="selectRating(1)"
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 bg-yellow-400"
            :checked="rating >= 2"
            @click="selectRating(2)"
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 bg-yellow-400"
            :checked="rating >= 3"
            @click="selectRating(3)"
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 bg-yellow-400"
            :checked="rating >= 4"
            @click="selectRating(4)"
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 bg-yellow-400"
            :checked="rating >= 5"
            @click="selectRating(5)"
          />
        </div>
      </div>

      <!-- ข้อความเพิ่มเติม -->
      <textarea
        v-model="reviewText"
        class="w-full h-32 p-2 border border-gray-300 rounded bg-[#ededed]"
        placeholder="กรุณาใส่ความคิดเห็นของคุณ"
      ></textarea>

      <div class="flex justify-end mt-4">
        <button
         @click="submitReview"
         class="btn btn-sm bg-[#c40c00] text-white rounded-3xl">
          ส่งความคิดเห็น
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* คุณสามารถเพิ่ม CSS เพิ่มเติมในนี้ */
</style>