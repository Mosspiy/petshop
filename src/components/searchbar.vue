<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// รับค่า props จาก parent component
const props = defineProps({
  defaultSearchTerm: {
    type: String,
    default: ''
  },
  categoryName: {
    type: String,
    default: ''
  }
});

// รีแอคทีฟสำหรับเก็บสถานะการค้นหา
const searchTerm = ref(props.defaultSearchTerm || props.categoryName || '');
const selectedCategory = ref('ทั้งหมด');
const selectedPetType = ref('ทั้งหมด');
const selectedPrice = ref('');
const isSearching = ref(false);

// รายการหมวดหมู่และประเภทสัตว์
const categories = ref(['ทั้งหมด']);
const animalTypes = ref(['ทั้งหมด']);

// ตัวจัดการ Router
const router = useRouter();

// emit events
const emit = defineEmits(['search']);

// โหลดหมวดหมู่และประเภทสัตว์
const loadFilters = async () => {
  try {
    const [categoriesResponse, animalTypesResponse] = await Promise.all([
      axios.get('/products/categories/list'),
      axios.get('/products/animal-types/list')
    ]);
    
    categories.value = ['ทั้งหมด', ...categoriesResponse.data];
    animalTypes.value = ['ทั้งหมด', ...animalTypesResponse.data];
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดฟิลเตอร์:', error);
  }
};

// ฟังก์ชันค้นหา
const handleSearch = async () => {
  const hasSearchParams = 
    searchTerm.value.trim() || 
    selectedCategory.value !== 'ทั้งหมด' || 
    selectedPetType.value !== 'ทั้งหมด' || 
    selectedPrice.value;

  if (!hasSearchParams) return;

  try {
    isSearching.value = true;

    // เตรียมพารามิเตอร์การค้นหา
    const searchParams = {
      q: searchTerm.value,
      category: selectedCategory.value,
      animalType: selectedPetType.value,
      price: selectedPrice.value
    };

    console.log('Search Parameters:', searchParams);

    // ส่ง emit event
    emit('search', searchParams);

    // ปิด Bottom Sheet
    closeBottomSheet();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการค้นหา:', error);
  } finally {
    isSearching.value = false;
  }
};
// ฟังก์ชันล้างค่าฟิลเตอร์
const clearFilters = () => {
  searchTerm.value = '';
  selectedCategory.value = 'ทั้งหมด';
  selectedPetType.value = 'ทั้งหมด';
  selectedPrice.value = '';

  // ส่ง event ล้างการค้นหา
  emit('search', {
    q: '',
    category: 'ทั้งหมด',
    animalType: 'ทั้งหมด',
    price: ''
  });

  // ปิด Bottom Sheet
  closeBottomSheet();
};

// การจัดการ Bottom Sheet
const isBottomSheetVisible = ref(false);
const animationClass = ref('');

const openBottomSheet = () => {
  animationClass.value = 'animate__animated animate__slideInUp';
  isBottomSheetVisible.value = true;
};

const closeBottomSheet = () => {
  animationClass.value = 'animate__animated animate__slideOutDown';
};

const handleAnimationEnd = () => {
  if (animationClass.value === 'animate__animated animate__slideOutDown') {
    isBottomSheetVisible.value = false;
  }
};

const closeOnClickOutside = (event) => {
  if (event.target === event.currentTarget) {
    closeBottomSheet();
  }
};

// เพิ่มการกดปุ่ม Enter เพื่อค้นหา
const handleEnterKey = () => {
  if (searchTerm.value.trim()) {
    handleSearch();
  }
};

// โหลดฟิลเตอร์เมื่อคอมโพเนนต์ถูกสร้าง
onMounted(loadFilters);
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="relative w-full">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="ค้นหาสินค้า"
        class="px-4 py-3 rounded-full w-full pl-10 pr-4 placeholder:text-[#bccad4] focus:outline-none focus:ring focus:ring-[#0c3a5b] focus:ring-opacity-50"
        @keyup.enter="handleEnterKey"
      />
      <i
        class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bccad4]"
      ></i>
    </div>

    <!-- ปุ่มฟิลเตอร์ -->
    <div class="ml-4">
      <button
        @click="openBottomSheet"
        class="flex items-center btn btn-ghost justify-center bg-[#0c3a5b] mask mask-circle w-12 h-12"
      >
        <i class="fas fa-sliders text-white text-l"></i>
      </button>
      
      <!-- Bottom Sheet -->
      <div
        v-if="isBottomSheetVisible"
        class="fixed inset-0 z-50 flex items-end bg-gray-900 bg-opacity-50"
        @click="closeOnClickOutside" 
      >
        <div
          :class="['modal-box w-full min-w-full bg-white p-0', animationClass]"
          style="--animate-duration: 0.3s"
          @animationend="handleAnimationEnd"
          role="dialog"
        >
          <!-- ปุ่มปิด Bottom Sheet -->
          <button class="btn btn-sm btn-ghost btn-circle absolute right-3 top-3" @click="closeBottomSheet">
            <i class="fa-solid fa-xmark text-[#0c3a5b] text-2xl"></i>
          </button>

          <!-- หัวข้อ -->
          <div class="flex flex-row items-left px-6 pt-2">
            <p class="text-xl font-bold m-2 text-[#005a9a]">ตัวกรอง</p>
          </div>
          <div class="divider my-0"></div>


          <!-- ตัวเลือกตัวกรอง -->
          <div class="mt-3 px-6 h-c">
            <p class="font-semibold mb-2 text-[#005a9a]">ราคา</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="priceLevel in ['฿', '฿฿', '฿฿฿', '฿฿฿฿']"
                :key="priceLevel"
                class="btn btn-sm text-[#83a9c4] bg-white border border-[#83a9c4]"
                :class="{'bg-[#2b7deb!important] text-[#ffffff] border border-[#2b7deb]': selectedPrice === priceLevel}"
                @click="selectedPrice = priceLevel"
              >
                {{ priceLevel }}
              </button>
            </div>

            <p class="font-semibold mb-2 text-[#005a9a] mt-4">หมวดหมู่</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="category in ['ทั้งหมด', 'อาหารสัตว์', 'อาบน้ำ ดูแลขน', 'กรง ที่นอน', 'ของเล่นสัตว์', 'ทรายแมว']"
                :key="category"
                class="btn btn-sm text-[#83a9c4] bg-white border border-[#83a9c4]"
                :class="{'bg-[#2b7deb!important] text-[#ffffff] border border-[#2b7deb]': selectedCategory === category}"
                @click="selectedCategory = category"
              >
                {{ category }}
              </button>
            </div>

            <p class="font-semibold mb-2 text-[#005a9a] mt-4">ชนิดของสัตว์</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="petType in ['สุนัข', 'แมว', 'ปลา', 'นก', 'กระต่าย']"
                :key="petType"
                class="btn btn-sm text-[#83a9c4] bg-white border border-[#83a9c4]"
                :class="{'bg-[#2b7deb!important] text-[#ffffff] border border-[#2b7deb]': selectedPetType === petType}"
                @click="selectedPetType = petType"
              >
                {{ petType }}
              </button>
            </div>
          </div>

          <!-- ปุ่มล้างค่าและค้นหา -->
          <div class="flex flex-row justify-between p-6 gap-2">
            <button class="btn btn-sm bg-[#d5e5f3] w-1/2" @click="clearFilters">
              ล้างค่า
            </button>
            <button 
              class="btn btn-sm bg-[#2b7deb] text-white w-1/2" 
              @click="handleSearch"
              :disabled="isSearching"
            >
              {{ isSearching ? 'กำลังค้นหา...' : 'ค้นหา' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-c {
  height: 25rem;
}
</style>
