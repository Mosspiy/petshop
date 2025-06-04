<script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    categories: {
      type: Array,
      required: true
    },
    animalTypes: {
      type: Array,
      default: () => []
    },
    filteredCount: {
      type: Number,
      default: 0
    }
  })
  
  const emit = defineEmits(['filter', 'reset'])
  
  // สถานะการค้นหาและกรอง
  const searchQuery = ref('')
  const categoryFilter = ref('all')
  const animalTypeFilter = ref('all')
  const statusFilter = ref('all')
  
  // อัปเดตตัวกรอง
  const updateFilters = () => {
    emit('filter', {
      search: searchQuery.value,
      category: categoryFilter.value,
      animalType: animalTypeFilter.value,
      status: statusFilter.value
    })
  }
  
  // รีเซ็ตตัวกรอง
  const resetFilters = () => {
    searchQuery.value = ''
    categoryFilter.value = 'all'
    animalTypeFilter.value = 'all'
    statusFilter.value = 'all'
    emit('reset')
  }
  
  // เมื่อได้รับค่าใหม่จากภายนอก
  watch(() => props.categories, () => {
    // ทำอะไรก็ได้ถ้าต้องการ เช่น ตรวจสอบว่าหมวดหมู่ที่เลือกยังมีอยู่ไหม
  }, { deep: true })
  
  watch(() => props.animalTypes, () => {
    // ทำอะไรก็ได้ถ้าต้องการ เช่น ตรวจสอบว่าชนิดสัตว์ที่เลือกยังมีอยู่ไหม
  }, { deep: true })
  </script>
  
<template>
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <!-- ช่องค้นหา -->
        <div class="md:col-span-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาสินค้า..."
              class="input input-bordered w-full pl-10"
              @input="updateFilters"
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <i class="fa-solid fa-search"></i>
            </span>
          </div>
        </div>
        
        <!-- ตัวกรองหมวดหมู่ -->
        <div class="md:col-span-2">
          <select 
            v-model="categoryFilter" 
            class="select select-bordered w-full"
            @change="updateFilters"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <!-- ตัวกรองชนิดของสัตว์ -->
        <div class="md:col-span-2">
          <select 
            v-model="animalTypeFilter" 
            class="select select-bordered w-full"
            @change="updateFilters"
          >
            <option value="all">ทุกชนิดสัตว์</option>
            <option v-for="animalType in animalTypes" :key="animalType" :value="animalType">
              {{ animalType }}
            </option>
          </select>
        </div>
        
        <!-- ตัวกรองสถานะ -->
        <div class="md:col-span-2">
          <select 
            v-model="statusFilter" 
            class="select select-bordered w-full"
            @change="updateFilters"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="Active">ใช้งาน</option>
            <option value="Inactive">ไม่ใช้งาน</option>
          </select>
        </div>
        
        <!-- ปุ่มรีเซ็ตตัวกรอง -->
        <div class="md:col-span-2 flex justify-end">
          <button @click="resetFilters" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-filter-circle-xmark mr-1"></i> รีเซ็ต
          </button>
        </div>
      </div>
      
      <!-- ผลลัพธ์การค้นหา -->
      <div class="text-sm text-gray-500">
        พบสินค้า {{ filteredCount }} รายการ
      </div>
    </div>
  </template>