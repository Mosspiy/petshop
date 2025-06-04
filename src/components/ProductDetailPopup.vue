<script setup>
  import { ref } from 'vue';
  
  const isModalVisible = ref(false); // ควบคุมสถานะการแสดง Modal
  const isClosing = ref(false); // สถานะอนิเมชั่นปิด Modal
  
  const openModal = () => {
    isModalVisible.value = true; // เปิด Modal
    isClosing.value = false; // รีเซ็ตสถานะการปิด
  };
  
  const closeModal = () => {
    isClosing.value = true; // เริ่มอนิเมชั่นปิด Modal
  };
  
  const handleAnimationEnd = () => {
    if (isClosing.value) {
      isModalVisible.value = false; // ซ่อน Modal หลังอนิเมชั่นปิดเสร็จ
    }
  };
  
  const confirmOrder = () => {
    alert("คุณได้สั่งซื้อสินค้าเรียบร้อยแล้ว!");
    closeModal(); // ปิด Modal หลังยืนยัน
  };
  </script>


<template>
    <div>
      <!-- ปุ่มเปิด Modal -->
      <button @click="openModal" class="btn btn-primary">เลือกสินค้า</button>
  
      <!-- Modal -->
      <div
        v-if="isModalVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end"
        @click.self="closeModal"
      >
        <!-- Modal Content -->
        <div
          class="bg-white w-full sm:w-96 p-6 rounded-t-lg shadow-lg animate__animated"
          :class="{ 
            'animate__slideInUp': isModalVisible && !isClosing, 
            'animate__slideOutDown': isClosing 
          }"
          style="--animate-duration: 0.6s;"
          @animationend="handleAnimationEnd"
        >
          <h2 class="text-xl font-semibold mb-4">รายละเอียดสินค้า</h2>
          <p class="mb-4">นี่คือข้อมูลสินค้า เช่น ราคา, คุณสมบัติ และตัวเลือก.</p>
          <div class="flex justify-end gap-2">
            <button @click="closeModal" class="btn btn-secondary">ปิด</button>
            <button @click="confirmOrder" class="btn btn-primary">สั่งซื้อ</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  
  <style scoped>
  /* ปรับแต่ง CSS */
  .fixed {
    z-index: 50; /* ให้ modal อยู่ข้างบน */
  }
  </style>
  