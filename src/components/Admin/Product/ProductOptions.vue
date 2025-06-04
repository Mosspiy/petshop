<script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    modelValue: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  // สร้างตัวแปรภายในเพื่อจัดการตัวเลือก
  const options = ref(props.modelValue)
  
  // ใช้ watch เพื่ออัปเดตค่าเมื่อ options ภายในเปลี่ยน
  watch(options, (newValue) => {
    emit('update:modelValue', newValue)
  }, { deep: true })
  
  // ใช้ watch เพื่ออัปเดตค่าเมื่อ modelValue จากภายนอกเปลี่ยน
  watch(() => props.modelValue, (newValue) => {
    options.value = newValue
  }, { deep: true })
  
  // เพิ่มตัวเลือกสินค้าใหม่
  const addOption = () => {
    options.value.push({ size: '', price: 0, stock: 0 })
  }
  
  // ลบตัวเลือกสินค้า
  const removeOption = (index) => {
    options.value.splice(index, 1)
    
    // เพิ่มตัวเลือกเปล่าถ้าไม่มีตัวเลือกเหลือ
    if (options.value.length === 0) {
      options.value.push({ size: '', price: 0, stock: 0 })
    }
  }
  </script>
  
<template>
    <div class="form-control mb-4">
      <label class="label flex justify-between">
        <span class="label-text text-lg font-semibold">ตัวเลือกสินค้า</span>
        <button type="button" @click="addOption" class="btn btn-sm bg-[#2b7deb] text-white hover:bg-[#1a68d0]">
          <i class="fa-solid fa-plus mr-1"></i> เพิ่มตัวเลือก
        </button>
      </label>
      
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="grid grid-cols-12 gap-4 mb-2 font-semibold text-gray-700 pb-2 border-b border-gray-200">
          <div class="col-span-4">ขนาด</div>
          <div class="col-span-4">ราคา (บาท)</div>
          <div class="col-span-3">คลังสินค้า</div>
          <div class="col-span-1 text-right"></div>
        </div>
        
        <div v-for="(option, index) in options" :key="index" 
          class="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 items-center"
          :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
          <div class="col-span-4">
            <input 
              v-model="option.size" 
              type="text" 
              class="input input-bordered w-full bg-white" 
              placeholder="ขนาด (เช่น 1kg)" 
              required 
            />
          </div>
          <div class="col-span-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">฿</span>
              <input 
                v-model="option.price" 
                type="number" 
                class="input input-bordered w-full pl-8 bg-white" 
                placeholder="0.00" 
                required 
              />
            </div>
          </div>
          <div class="col-span-3">
            <input 
              v-model="option.stock" 
              type="number" 
              class="input input-bordered w-full bg-white" 
              placeholder="0" 
              required 
            />
          </div>
          <div class="col-span-1 text-right">
            <button 
              type="button" 
              @click="removeOption(index)" 
              class="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
              :disabled="options.length === 1"
              :class="options.length === 1 ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        
        <div v-if="options.length === 0" class="py-4 text-center text-gray-500">
          ยังไม่มีตัวเลือก คลิก "เพิ่มตัวเลือก" เพื่อเพิ่มตัวเลือกสินค้า
        </div>
      </div>
    </div>
  </template>
  
  