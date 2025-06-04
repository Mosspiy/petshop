<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);
const router = useRouter();

// สร้างการ์ดแยกตาม options
const productOptions = computed(() => {
  const options = [];
  
  if (!props.product.options || props.product.options.length === 0) {
    // ถ้าไม่มี options ให้สร้างการ์ดเดียว
    options.push({
      id: props.product._id,
      name: props.product.name,
      description: props.product.description,
      image: props.product.images?.[0] || null,
      price: 0,
      optionName: 'ไม่ระบุ',
      optionIndex: -1
    });
  } else {
    // ถ้ามี options ให้สร้างการ์ดแยกตาม option
    props.product.options.forEach((option, index) => {
      options.push({
        id: props.product._id,
        name: props.product.name,
        description: props.product.description,
        image: props.product.images?.[0] || null,
        price: option.price,
        optionName: option.size,
        stock: option.stock,
        optionIndex: index
      });
    });
  }
  
  return options;
});

// จัดการการโหลดรูปภาพไม่สำเร็จ
const handleImageError = (event) => {
  event.target.src = null;
  // จะแสดงไอคอน placeholder แทน
};

// ปุ่มเพิ่มลงตะกร้า (ที่อยู่ในการ์ด)
const addToCartFromCard = (event, productOption) => {
  // ป้องกันการกระจายอีเวนท์ (event bubbling)
  event.stopPropagation();
  
  // เรียกหน้ารายละเอียดสินค้าพร้อมแสดง bottom sheet เพื่อให้เลือกตัวเลือก
  router.push({
    name: 'ProductDetail',
    params: { id: productOption.id },
    query: { 
      option: productOption.optionIndex >= 0 ? productOption.optionIndex : undefined,
      showOptions: 'true'
    }
  });
};

// นำทางไปยังหน้ารายละเอียดสินค้า
const navigateToProduct = (productOption) => {
  router.push({
    name: 'ProductDetail',
    params: { id: productOption.id },
    query: { option: productOption.optionIndex >= 0 ? productOption.optionIndex : undefined }
  });
};

// ตรวจสอบว่ามีสินค้าในสต็อกหรือไม่
const isInStock = (stock) => {
  return stock > 0;
};
</script>

<template>
  <div v-for="option in productOptions" :key="`${option.id}-${option.optionIndex}`">
    <div
      class="card shadow-md bg-base-100 rounded-lg h-full"
      @click="navigateToProduct(option)"
    >
      <!-- รูปสินค้า -->
      <figure class="p-4">
        <img
          v-if="option.image"
          :src="option.image"
          :alt="option.name"
          class="w-full h-36 object-contain"
          @error="handleImageError"
        />
        <div v-else class="w-full h-36 flex items-center justify-center bg-gray-100">
          <i class="fa-solid fa-image text-gray-400 text-2xl"></i>
        </div>

        
      </figure>
      
      <!-- เนื้อหา Card -->
      <div class="card-body p-4">
        <h2 class="text-sm font-semibold text-gray-700 line-clamp-2" :title="option.name">
          {{ option.name }}
        </h2>
        <!-- แสดง option แทน description -->
        <p class="text-xs text-[#005a9a] font-semibold mt-1">
          <span class="bg-[#f0f7ff] px-2 py-1 rounded-lg inline-block">
            {{ option.optionName }}
          </span>
        </p>
        <div class="flex justify-between items-center mt-3">
          <span class="text-lg font-semibold text-[#44842d]">
            ฿{{ option.price.toLocaleString() }}
          </span>
          <button
            class="btn btn-circle btn-sm bg-[#44842d] text-white"
            @click="addToCartFromCard($event, option)"
          >
            <i class="fa-solid fa-plus text"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ตัดข้อความที่ยาวเกินไป */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>