<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  sortBy: {
    type: String,
    default: 'updatedAt'
  },
  sortDirection: {
    type: String,
    default: 'desc'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'open-detail-modal', 
  'print-receipt', 
  'toggle-sort'
])

const toggleSortDirection = (column) => {
  emit('toggle-sort', column)
}

const openDetailModal = (order) => {
  emit('open-detail-modal', order)
}

const printReceipt = (orderId) => {
  emit('print-receipt', orderId)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Pending': return 'badge-warning'
    case 'Processing': return 'badge-info'
    case 'Shipped': return 'badge-primary'
    case 'Completed': return 'badge-success'
    case 'Cancelled': return 'badge-error'
    default: return 'badge-ghost'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'Pending': return 'รอดำเนินการ'
    case 'Processing': return 'กำลังดำเนินการ'
    case 'Shipped': return 'จัดส่งแล้ว'
    case 'Completed': return 'เสร็จสิ้น'
    case 'Cancelled': return 'ยกเลิก'
    default: return status
  }
}

const formatPhoneNumber = (phone) => {
  if (!phone) return '-'
  
  // ตรวจสอบว่าเป็นเบอร์โทรศัพท์ไทยหรือไม่
  const thaiPattern = /^(0\d{9})$/  // เบอร์ไทย: 0xxxxxxxxx (10 หลัก)
  
  if (thaiPattern.test(phone)) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}

</script>

<template>
  <div class="overflow-x-auto w-full mb-8 bg-white rounded-xl shadow pb-24">
    <table class="table w-full card bg-base-100">
      <thead>
        <tr class="bg-gray-50">
          <th @click="toggleSortDirection('id')" class="cursor-pointer">
            เลขออเดอร์
            <i v-if="sortBy === 'id'" 
              :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="ml-1 text-xs"></i>
          </th>
          <th @click="toggleSortDirection('customer')" class="cursor-pointer">
            ลูกค้า
            <i v-if="sortBy === 'customer'" 
              :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="ml-1 text-xs"></i>
          </th>
          <th>เบอร์โทรศัพท์</th>
          <th @click="toggleSortDirection('status')" class="cursor-pointer">
            สถานะ
            <i v-if="sortBy === 'status'" 
              :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="ml-1 text-xs"></i>
          </th>
          <th>เลขติดตามพัสดุ</th>
          <th @click="toggleSortDirection('total')" class="cursor-pointer">
            ยอดรวมสุทธิ
            <i v-if="sortBy === 'total'" 
              :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="ml-1 text-xs"></i>
          </th>
          <th @click="toggleSortDirection('updatedAt')" class="cursor-pointer">
            อัปเดตล่าสุด
            <i v-if="sortBy === 'updatedAt'" 
              :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="ml-1 text-xs"></i>
          </th>
          <th>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="isLoading">
          <!-- แสดง skeleton loader เมื่อกำลังโหลดข้อมูล -->
          <tr v-for="i in 5" :key="`skeleton-${i}`" class="animate-pulse">
            <td><div class="h-4 bg-gray-200 rounded w-16"></div></td>
            <td><div class="h-4 bg-gray-200 rounded w-32"></div></td>
            <td><div class="h-4 bg-gray-200 rounded w-24"></div></td>
            <td><div class="h-6 bg-gray-200 rounded w-20"></div></td>
            <td><div class="h-4 bg-gray-200 rounded w-28"></div></td>
            <td><div class="h-4 bg-gray-200 rounded w-20"></div></td>
            <td><div class="h-4 bg-gray-200 rounded w-28"></div></td>
            <td><div class="h-8 bg-gray-200 rounded w-20"></div></td>
          </tr>
        </template>
        <template v-else-if="orders.length > 0">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td>
              <div class="font-medium">{{ order.orderCode || order.id }}</div>
            </td>
            <td>
              <div class="text-sm">{{ order.customer }}</div>
            </td>
            <td>
              <div class="text-sm">{{ formatPhoneNumber(order.phone) }}</div>
            </td>
            <td>
              <span :class="{
                'badge': true,
                [getStatusClass(order.status)]: true
              }">{{ getStatusLabel(order.status) }}</span>
            </td>
            <td>
              <div class="text-sm">
                <span v-if="order.trackingNumber && order.trackingNumber.trim() !== '-'">
                  {{ order.trackingNumber }}
                </span>
                <span v-else class="text-gray-400">ไม่มีข้อมูล</span>
              </div>
            </td>
            <td>
              <div class="text-sm font-medium text-green-600">{{ order.total.toFixed(2) }} บาท</div>
            </td>
            <td>
              <div class="text-sm">{{ order.updatedAt }}</div>
            </td>
            <td>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-sm bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200">
                  จัดการ <i class="fa-solid fa-chevron-down ml-1"></i>
                </label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                  <li>
                    <a @click="openDetailModal(order)">
                      <i class="fa-solid fa-eye mr-2"></i> ดูรายละเอียด
                    </a>
                  </li>
                  <li>
                    <a @click="printReceipt(order.id)">
                      <i class="fa-solid fa-print mr-2"></i> พิมพ์ใบเสร็จ
                    </a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </template>
        <tr v-else>
          <td colspan="8" class="text-center py-8 text-gray-500">
            <div class="flex flex-col items-center justify-center py-10">
              <i class="fa-solid fa-box-open text-4xl mb-2"></i>
              <p>ไม่พบออเดอร์ กรุณาเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>