<script setup>
 import { ref, onMounted } from 'vue';
 import { useRouter, useRoute } from 'vue-router';
 import authService from '@/services/authService';
 import Logo from '@/assets/logo/petshopLogo.svg';
 
 const router = useRouter();
 const route = useRoute();
 const error = ref('');
 
 onMounted(() => {
  // ตรวจสอบว่ามี error ส่งมาจาก query หรือไม่ (กรณี redirect กลับมาจาก login ที่ล้มเหลว)
  if (route.query.error) {
    error.value = decodeURIComponent(route.query.error);
  }
 });
 
 const lineLogin = async () => {
  try {
    // เรียกใช้ authService เพื่อเริ่ม LINE Login
    const success = await authService.initiateLineLogin();
    
    if (!success) {
      error.value = 'ไม่สามารถเริ่มการเข้าสู่ระบบได้ กรุณาลองอีกครั้ง';
    }
  } catch (err) {
    console.error('Error starting LINE login:', err);
    error.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
  }
 };
 </script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200 p-4">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <img :src="Logo" alt="LINE" class="w-28 h-28 ml-6" />
        <h2 class="card-title text-2xl mb-6">กรุณาเข้าสู่ระบบ</h2>
        
        <!-- ส่วนของการเข้าสู่ระบบแบบปกติ (ถ้ามี) -->
        
        <!-- แสดงข้อความ error ถ้ามี -->
        <div v-if="error" class="alert alert-error shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ error }}</span>
        </div>
        
        <!-- ปุ่ม LINE Login -->
        <div class="w-full mt-6">
          
          <button @click="lineLogin" class="btn w-full" style="background-color: #00B900; color: white;">
            
            เข้าสู่ระบบด้วย LINE
          </button>
        </div>
      </div>
    </div>
  </div>
 </template>
 
 