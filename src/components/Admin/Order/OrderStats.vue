<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div>
    <!-- แดชบอร์ดสรุปออเดอร์ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">ออเดอร์ทั้งหมด</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>

      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">ออเดอร์ที่ยกเลิก</div>
        <div class="stat-value text-error">{{ stats.cancelled }}</div>
      </div>

      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">รายได้ทั้งหมด</div>
        <div class="stat-value">฿{{ stats.revenue }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">รอดำเนินการ</div>
        <div class="stat-value text-warning">{{ stats.pending }}</div>
      </div>

      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">กำลังดำเนินการ</div>
        <div class="stat-value text-info">{{ stats.processing }}</div>
      </div>
      
      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">จัดส่งแล้ว</div>
        <div class="stat-value text-primary">{{ stats.shipped }}</div>
      </div>
      
      <div class="stat bg-white rounded-lg shadow-md">
        <div class="stat-title">เสร็จสิ้น</div>
        <div class="stat-value text-success">{{ stats.completed }}</div>
      </div>
    </div>
  </div>
</template>