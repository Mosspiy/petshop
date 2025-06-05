<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '@/services/authService';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref('');
const success = ref(false);
const userName = ref('');

onMounted(async () => {
  try {
    // ดึง token จาก URL query parameter
    const token = route.query.token;
    
    if (!token) {
      error.value = 'ไม่พบข้อมูลการยืนยันตัวตน';
      loading.value = false;
      return;
    }
    localStorage.setItem('auth_token', token);
    // ส่ง token ไปให้ authService ประมวลผล
    const result = await authService.handleLineLoginCallback(token);
    
    if (result.success) {
      success.value = true;
      userName.value = result.user.displayName || localStorage.getItem('displayName') || 'ผู้ใช้';
      
      // รอสักครู่แล้วนำทางไปหน้าหลัก
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      error.value = result.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    }
  } catch (err) {
    console.error('Error processing login success:', err);
    error.value = 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลการเข้าสู่ระบบ';
  } finally {
    loading.value = false;
  }
});

const goToLogin = () => {
  router.push('/login');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200 p-4">
    <div v-if="loading" class="card w-96 bg-base-100 shadow-xl p-6 text-center">
      <div class="flex justify-center mb-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <h2 class="text-xl font-semibold mb-2">กำลังเข้าสู่ระบบ</h2>
      <p class="text-gray-600">กรุณารอสักครู่...</p>
    </div>

    <div v-else-if="error" class="card w-96 bg-base-100 shadow-xl p-6 text-center">
      <div class="flex justify-center mb-4 text-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button @click="goToLogin" class="btn btn-primary">กลับไปยังหน้าเข้าสู่ระบบ</button>
    </div>

    <div v-else class="card w-96 bg-base-100 shadow-xl p-6 text-center">
      <div class="flex justify-center mb-4 text-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold mb-2">เข้าสู่ระบบสำเร็จ</h2>
      <p class="text-gray-600 mb-4">ยินดีต้อนรับ, {{ userName }}</p>
      <button @click="goToHome" class="btn bg-[#0c3a5b] text-white">ไปยังหน้าหลัก</button>
    </div>
  </div>
</template>

