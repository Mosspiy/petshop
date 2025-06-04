<!-- ToastNotification.vue -->
<template>
    <div>
      <transition-group 
        name="toast" 
        tag="div" 
        class="fixed top-5 right-5 z-50 flex flex-col gap-3"
      >
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item shadow-lg rounded-lg p-4 min-w-[300px] max-w-md flex items-center"
          :class="getToastClass(toast.type)"
        >
          <div class="mr-3 text-xl">
            <i class="fa-solid" :class="getToastIcon(toast.type)"></i>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-sm">{{ toast.title }}</div>
            <div class="text-sm">{{ toast.message }}</div>
          </div>
          <button @click="removeToast(toast.id)" class="ml-2 text-lg opacity-70 hover:opacity-100">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  // สถานะ toasts
  const toasts = ref([])
  let toastCounter = 0
  
  // เพิ่ม toast
  const addToast = (message, type = 'success', title = '', duration = 5000) => {
    const id = toastCounter++
    
    // กำหนดหัวข้อตามประเภทหากไม่ระบุ
    if (!title) {
      switch (type) {
        case 'success':
          title = 'สำเร็จ'
          break
        case 'error':
          title = 'ข้อผิดพลาด'
          break
        case 'warning':
          title = 'คำเตือน'
          break
        case 'info':
          title = 'ข้อมูล'
          break
      }
    }
    
    // เพิ่ม toast ใหม่
    toasts.value.push({ id, message, type, title })
    
    // ตั้งเวลาลบ toast
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  // ลบ toast
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // ลบ toast ทั้งหมด
  const clearToasts = () => {
    toasts.value = []
  }
  
  // กำหนด CSS class ตามประเภท toast
  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500'
      case 'error':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500'
    }
  }
  
  // กำหนดไอคอนตามประเภท toast
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fa-circle-check'
      case 'error':
        return 'fa-circle-exclamation'
      case 'warning':
        return 'fa-triangle-exclamation'
      case 'info':
        return 'fa-circle-info'
      default:
        return 'fa-bell'
    }
  }
  
  // สร้าง Event Bus สำหรับเรียกใช้ toast จาก component อื่น
  const useToast = () => {
    return {
      success: (message, title = '', duration = 5000) => addToast(message, 'success', title, duration),
      error: (message, title = '', duration = 5000) => addToast(message, 'error', title, duration),
      warning: (message, title = '', duration = 5000) => addToast(message, 'warning', title, duration),
      info: (message, title = '', duration = 5000) => addToast(message, 'info', title, duration),
      clear: clearToasts
    }
  }
  
  // Export ความสามารถของ toast ออกไป
  defineExpose({
    addToast,
    removeToast,
    clearToasts,
    useToast
  })
  </script>
  
  <style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  .toast-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  </style>