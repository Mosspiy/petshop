<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  totalOrders: {
    type: Number,
    required: true
  }
})

const emit = defineEmits([
  'search', 
  'filter', 
  'reset', 
  'export'
])

const searchQuery = ref('')
const statusFilter = ref('all')
const dateRange = ref({ start: '', end: '' })

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleStatusFilter = () => {
  emit('filter', { status: statusFilter.value })
}

const handleDateRangeFilter = () => {
  emit('filter', { 
    start: dateRange.value.start, 
    end: dateRange.value.end 
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  dateRange.value = { start: '', end: '' }
  emit('reset')
}

const exportData = (format) => {
  emit('export', format)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
      <!-- ช่องค้นหา -->
      <div class="md:col-span-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="ค้นหาตาม ID, ชื่อลูกค้า หรือเบอร์โทร..."
            class="input input-bordered w-full pl-10"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fa-solid fa-search"></i>
          </span>
        </div>
      </div>
      
      <!-- ตัวกรองสถานะ -->
      <div class="md:col-span-2">
        <select 
          v-model="statusFilter" 
          @change="handleStatusFilter"
          class="select select-bordered w-full"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="Pending">รอดำเนินการ</option>
          <option value="Processing">กำลังดำเนินการ</option>
          <option value="Shipped">จัดส่งแล้ว</option>
          <option value="Completed">เสร็จสิ้น</option>
          <option value="Cancelled">ยกเลิก</option>
        </select>
      </div>
      
      <!-- ตัวกรองวันที่ - จาก -->
      <div class="md:col-span-2">
        <div class="form-control">
          <input
            v-model="dateRange.start"
            @change="handleDateRangeFilter"
            type="date"
            class="input input-bordered w-full"
            placeholder="From Date"
          />
        </div>
      </div>
      
      <!-- ตัวกรองวันที่ - ถึง -->
      <div class="md:col-span-2">
        <div class="form-control">
          <input
            v-model="dateRange.end"
            @change="handleDateRangeFilter"
            type="date"
            class="input input-bordered w-full"
            placeholder="To Date"
          />
        </div>
      </div>
      
      <!-- ปุ่มรีเซ็ตตัวกรอง -->
      <div class="md:col-span-2 flex justify-end">
        <button @click="resetFilters" class="btn btn-outline btn-sm">
          <i class="fa-solid fa-filter-circle-xmark mr-1"></i> รีเซ็ต
        </button>
      </div>
    </div>
    
    <!-- ผลลัพธ์การค้นหาและปุ่มส่งออก -->
    <div class="flex justify-between items-center">
      <div class="text-sm text-gray-500">
        พบออเดอร์ {{ totalOrders }} รายการ
      </div>
      
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-sm btn-outline">
          <i class="fa-solid fa-file-export mr-1"></i> ส่งออก
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><a @click="exportData('csv')">ส่งออกเป็น CSV</a></li>
          <li><a @click="exportData('json')">ส่งออกเป็น JSON</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>