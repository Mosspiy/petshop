<!-- ConfirmDialog.vue -->
<template>
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50">
          <!-- พื้นหลังทึบแสง -->
          <div class="absolute inset-0 bg-black bg-opacity-40" @click="cancel"></div>
          
          <!-- กล่องยืนยัน -->
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative z-10 overflow-hidden">
            <!-- หัวข้อ -->
            <div class="bg-gray-50 px-6 py-4 border-b">
              <h3 class="text-lg font-medium" :class="getHeaderClass">
                <i :class="getHeaderIcon" class="mr-2"></i>
                {{ title }}
              </h3>
            </div>
            
            <!-- เนื้อหา -->
            <div class="p-6">
              <p>{{ message }}</p>
            </div>
            
            <!-- ปุ่มดำเนินการ -->
            <div class="bg-gray-50 px-4 py-3 flex justify-end gap-2">
              <button
                @click="cancel"
                type="button"
                class="btn btn-outline"
              >
                {{ cancelText }}
              </button>
              <button
                @click="confirm"
                type="button"
                :class="getConfirmButtonClass"
                class="btn"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // สถานะการแสดงผล
  const isOpen = ref(false)
  
  // ข้อมูลกล่องโต้ตอบ
  const title = ref('ยืนยันการดำเนินการ')
  const message = ref('คุณแน่ใจหรือไม่ที่ต้องการดำเนินการนี้?')
  const dialogType = ref('info') // info, warning, danger, success
  const confirmText = ref('ยืนยัน')
  const cancelText = ref('ยกเลิก')
  
  // ตัวแปรสำหรับเก็บ callback เมื่อกดยืนยัน
  let resolvePromise = null
  
  // คำนวณ CSS class ของหัวข้อตามประเภทกล่องโต้ตอบ
  const getHeaderClass = computed(() => {
    switch (dialogType.value) {
      case 'warning':
        return 'text-yellow-700'
      case 'danger':
        return 'text-red-700'
      case 'success':
        return 'text-green-700'
      case 'info':
      default:
        return 'text-blue-700'
    }
  })
  
  // คำนวณ CSS class ของปุ่มยืนยันตามประเภทกล่องโต้ตอบ
  const getConfirmButtonClass = computed(() => {
    switch (dialogType.value) {
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white'
      case 'info':
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  })
  
  // คำนวณไอคอนของหัวข้อตามประเภทกล่องโต้ตอบ
  const getHeaderIcon = computed(() => {
    switch (dialogType.value) {
      case 'warning':
        return 'fa-solid fa-triangle-exclamation'
      case 'danger':
        return 'fa-solid fa-circle-exclamation'
      case 'success':
        return 'fa-solid fa-circle-check'
      case 'info':
      default:
        return 'fa-solid fa-circle-info'
    }
  })
  
  // ฟังก์ชันเปิดกล่องโต้ตอบและรอคำตอบ
  const open = ({ title: newTitle, message: newMessage, type = 'info', confirm = 'ยืนยัน', cancel = 'ยกเลิก' } = {}) => {
    // กำหนดค่าข้อมูลกล่องโต้ตอบ
    title.value = newTitle || 'ยืนยันการดำเนินการ'
    message.value = newMessage || 'คุณแน่ใจหรือไม่ที่ต้องการดำเนินการนี้?'
    dialogType.value = type
    confirmText.value = confirm
    cancelText.value = cancel
    
    // เปิดกล่องโต้ตอบ
    isOpen.value = true
    
    // สร้าง Promise และรอการตอบกลับ
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }
  
  // ฟังก์ชันเมื่อกดยืนยัน
  const confirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }
  
  // ฟังก์ชันเมื่อกดยกเลิก
  const cancel = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }
  
  // Export ความสามารถของกล่องโต้ตอบออกไป
  defineExpose({
    open
  })
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>