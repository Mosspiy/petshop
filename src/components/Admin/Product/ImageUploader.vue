<script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    images: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['update:images', 'upload-image', 'remove-image'])
  
  // สถานะสำหรับรูปภาพแบบเต็มหน้าจอ
  const fullscreenImage = ref(null)
  
  // การจัดการรูปภาพแบบเต็มหน้าจอ
  const openFullscreen = (img) => {
    fullscreenImage.value = img
  }
  
  const closeFullscreen = () => {
    fullscreenImage.value = null
  }
  
  // การลบรูปภาพออกจากฟอร์ม
  const removeImage = (index) => {
    emit('remove-image', index)
  }
  
  // จัดการการอัปโหลดรูปภาพ
  const handleImageUpload = (event) => {
    const files = event.target.files
    if (files.length) {
      const file = files[0]
      
      // แสดงตัวอย่างรูปภาพ
      const reader = new FileReader()
      reader.onload = (e) => {
        emit('upload-image', {
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }
  </script>
  
<template>
    <div>
      <div class="mb-4">
        <div v-if="images.length" class="flex flex-col items-center">
          <img 
            :src="images[images.length - 1]" 
            class="w-64 h-64 object-cover rounded-lg mb-2 cursor-pointer"
            @click="openFullscreen(images[images.length - 1])"
          />
  
          <!-- รูปภาพก่อนหน้า -->
          <div class="flex gap-2 flex-wrap max-w-full overflow-x-auto p-2">
            <div v-for="(img, index) in images.slice(0, 6)" :key="index" class="relative w-16 h-16">
              <img 
                :src="img" 
                class="w-full h-full object-cover rounded-lg border border-gray-300 cursor-pointer"
                @click="openFullscreen(img)"
              />
              <button 
                @click.stop="removeImage(index)" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center z-50">
                ✖
              </button>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg">
          <p class="text-gray-500">ไม่มีรูปภาพ</p>
        </div>
      </div>
  
      <!-- อินพุตอัปโหลดรูปภาพ -->
      <div class="form-control mt-4">
        <label class="label"><span class="label-text">อัปโหลดรูปสินค้า</span></label>
        <input 
          type="file" 
          @change="handleImageUpload" 
          class="input input-bordered w-full file-input custom-file-input" 
          accept="image/*"
        />
      </div>
  
      <!-- การดูรูปภาพแบบเต็มหน้าจอ -->
      <div v-if="fullscreenImage" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" @click="closeFullscreen">
        <img :src="fullscreenImage" class="max-w-full max-h-full object-contain"/>
      </div>
    </div>
  </template>
  
  