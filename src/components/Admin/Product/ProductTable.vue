<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-status', 'sort'])

// สถานะการเรียงลำดับ
const sortBy = ref('name')
const sortDirection = ref('asc')

// สลับทิศทางการเรียงลำดับ
const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortDirection.value = 'asc'
  }
  
  emit('sort', { sortBy: sortBy.value, sortDirection: sortDirection.value })
}

// คำนวณช่วงราคาสินค้า
const getProductPriceRange = (product) => {
  if (!product.options || product.options.length === 0) {
    return '-'
  }
  
  const prices = product.options.map(option => option.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  if (minPrice === maxPrice) {
    return `฿${minPrice}`
  }
  
  return `฿${minPrice} - ฿${maxPrice}`
}

// คำนวณสต็อกสินค้าทั้งหมด
const getTotalStock = (product) => {
  if (!product.options || product.options.length === 0) {
    return 0
  }
  
  return product.options.reduce((total, option) => total + option.stock, 0)
}

// จัดการกรณีโหลดรูปภาพไม่สำเร็จ
const handleImageError = (product) => {
  console.error('Image load error for product:', product.name)
  if (product.images && product.images.length) {
    console.error('Image URL that failed:', product.images[0])
  }
  // ล้าง images หากโหลดไม่สำเร็จ
  product.images = []
}
</script>

<template>
    <div class="overflow-x-auto w-full mb-8">
      <div class="bg-white rounded-lg shadow-xs">
        <table class="table w-full">
          <thead>
            <tr>
              <th class="w-20">รูปภาพ</th>
              <th @click="toggleSort('name')" class="cursor-pointer w-48">
                ชื่อสินค้า
                <i v-if="sortBy === 'name'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th @click="toggleSort('category')" class="cursor-pointer w-32">
                หมวดหมู่
                <i v-if="sortBy === 'category'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th @click="toggleSort('animalType')" class="cursor-pointer w-32">
                ชนิดของสัตว์
                <i v-if="sortBy === 'animalType'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th @click="toggleSort('price')" class="cursor-pointer w-32">
                ราคา
                <i v-if="sortBy === 'price'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th @click="toggleSort('stock')" class="cursor-pointer w-24">
                คลังสินค้า
                <i v-if="sortBy === 'stock'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th class="w-40">ตัวเลือก</th>
              <th class="w-64">คำอธิบาย</th>
              <th @click="toggleSort('status')" class="cursor-pointer w-28">
                สถานะ
                <i v-if="sortBy === 'status'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th @click="toggleSort('updatedAt')" class="cursor-pointer w-40">
                อัปเดตล่าสุด
                <i v-if="sortBy === 'updatedAt'" 
                  :class="sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
                  class="ml-1 text-xs"></i>
              </th>
              <th class="w-24">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product._id">
              <td class="w-20">
                <div v-if="product.images && product.images.length" class="w-16 h-16 flex items-center justify-center">
                  <img 
                  :src="product.images[0]" 
                  alt="รูปสินค้า" 
                  class="w-16 h-16 object-cover rounded-lg" 
                  @error="handleImageError(product)"/>
                </div>
                <div v-else class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <i class="fa-solid fa-image text-gray-400 text-xl"></i>
                </div>
              </td>
              <td class="w-48">
                <div class="truncate max-w-[180px]" :title="product.name">{{ product.name }}</div>
              </td>
              <td class="w-32">
                <span class="inline-block bg-gray-200 px-2 py-1 rounded text-xs truncate max-w-[100px]">
                  {{ product.category }}
                </span>
              </td>
              <td class="w-32">
                <span v-if="product.animalType" class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs truncate max-w-[100px]">
                  {{ product.animalType }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="w-32">{{ getProductPriceRange(product) }}</td>
              <td class="w-24">{{ getTotalStock(product) }}</td>
              <td class="w-40">
                <div v-if="product.options && product.options.length" class="flex flex-col">
                  <div v-for="(option, vIndex) in product.options" :key="vIndex" class="mb-1">
                    <span class="inline-block text-xs px-2 py-1 rounded w-[150px]"
                      :class="{
                        'bg-red-100 text-red-800': option.stock === 0,
                        'bg-yellow-100 text-yellow-800': option.stock > 0 && option.stock <= 5,
                        'bg-green-100 text-green-800': option.stock > 5 && option.stock <= 20,
                        'bg-blue-100 text-blue-800': option.stock > 20
                      }">
                      {{ option.size }}: ฿{{ option.price }} (คงเหลือ: {{ option.stock }})
                    </span>
                  </div>
                </div>
                <span v-else>-</span>
              </td>
              <td class="w-64">
                <div class="truncate max-w-[220px]" :title="product.description">{{ product.description }}</div>
              </td>
              <td class="w-28">
                <button 
                  @click="$emit('toggle-status', product)" 
                  class="btn btn-sm w-20 text-white"
                  :class="product.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
                >
                  {{ product.status === 'Active' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </button>
              </td>
              <td class="w-40">{{ product.updatedAt }}</td>
              <td class="w-24">
                <div class="flex gap-2">
                  <button @click="$emit('edit', product)" class="btn btn-sm btn-warning tooltip" data-tip="แก้ไข">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button @click="$emit('delete', product)" class="btn btn-sm btn-error tooltip" data-tip="ลบ">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="11" class="text-center py-8 text-gray-500">
                <div class="flex flex-col items-center justify-center py-10">
                  <i class="fa-solid fa-box-open text-4xl mb-2"></i>
                  <p>ไม่พบสินค้า กรุณาเปลี่ยนเงื่อนไขการค้นหาหรือเพิ่มสินค้าใหม่</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  
  
  <style scoped>
  .table { /* สำคัญ: ทำให้ความกว้างคอลัมน์คงที่ */
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .table th, .table td {
    white-space: nowrap;
    padding: 0.75rem 1rem;
    overflow: hidden;
  }
  
  /* กำหนด width สำหรับคอลัมน์ต่างๆ */
  .table th {
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  /* สไตล์สำหรับเซลล์ที่มีข้อความยาว */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* สไตล์สำหรับหัวข้อตารางที่สามารถเรียงลำดับได้ */
  th.cursor-pointer {
    position: relative;
  }
  
  th.cursor-pointer:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  /* สไตล์สำหรับแถวในตาราง */
  .table tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  /* สไตล์สำหรับ hover ในแถวตาราง */
  .table tbody tr:hover {
    background-color: rgba(43, 125, 235, 0.05);
  }
  
  /* สไตล์สำหรับเซลล์ที่มีเนื้อหาหลายบรรทัด */
  .table td.multi-line {
    white-space: normal;
    word-wrap: break-word;
  }
  
  /* สไตล์สำหรับ tooltip */
  .tooltip {
    position: relative;
  }
  
  .tooltip:hover::before {
    content: attr(data-tip);
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #333;
    color: white;
    font-size: 12px;
    white-space: nowrap;
    z-index: 20;
  }
  
  .tooltip:hover::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
  </style>