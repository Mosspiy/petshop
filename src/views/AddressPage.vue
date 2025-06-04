<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import addressService from "../services/client/addressService";
import authService from '@/services/authService';

const router = useRouter();

// สถานะการโหลดและข้อผิดพลาด
const isLoading = ref(true);
const error = ref(null);

// ข้อมูลที่อยู่
const addresses = ref([]);

// เก็บค่าการเลือกที่อยู่
const selectedAddressId = ref(null);

// จัดเก็บค่าการเลื่อน (swipe)
const slidePositions = ref({});
const touchStartX = ref({});
const touchStartY = ref({});

// โหลดข้อมูลที่อยู่จาก API
const fetchAddresses = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // ตรวจสอบการเข้าสู่ระบบ
    if (!authService.isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    // ดึงข้อมูลที่อยู่จาก API
    const addressList = await addressService.getAddresses();
    addresses.value = addressList;
    
    // กำหนดค่าเริ่มต้นของ slidePositions
    addresses.value.forEach((_, index) => {
      slidePositions.value[index] = 0;
    });
    
    // เลือกที่อยู่ที่เป็นค่าเริ่มต้น
    const defaultAddress = addresses.value.find(addr => addr.isDefault);
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress._id;
    }
    
  } catch (err) {
    console.error('Error fetching addresses:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลที่อยู่ได้';
  } finally {
    isLoading.value = false;
  }
};

// โหลดข้อมูลเมื่อ component ถูกเรียกใช้
onMounted(() => {
  fetchAddresses();
});

// ฟังก์ชันเพิ่มที่อยู่ใหม่
const goToAddAddress = () => {
  router.push({ name: "addAddress" });
};

// ฟังก์ชันแก้ไขที่อยู่
const editAddress = (event, addressId) => {
  event.stopPropagation(); // ป้องกันการเลือกที่อยู่
  router.push({
    name: "addAddress",
    query: { addressId: addressId },
  });
};

// ฟังก์ชันลบที่อยู่
const removeAddress = async (addressId) => {
  try {
    // เรียกใช้ API ลบที่อยู่
    await addressService.deleteAddress(addressId);
    
    // อัปเดตรายการที่อยู่
    addresses.value = addresses.value.filter(addr => addr._id !== addressId);
    
    // รีเซ็ตค่าหากลบที่อยู่ที่ถูกเลือก
    if (selectedAddressId.value === addressId) {
      selectedAddressId.value = null;
      
      // เลือกที่อยู่ที่เป็นค่าเริ่มต้นถ้ามี
      const defaultAddress = addresses.value.find(addr => addr.isDefault);
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress._id;
      }
    }
  } catch (err) {
    console.error('Error removing address:', err);
    alert('ไม่สามารถลบที่อยู่ได้');
  }
};

// ฟังก์ชันเลือกที่อยู่
const selectAddress = (addressId) => {
  selectedAddressId.value = addressId;
};

// ฟังก์ชันสำหรับ Swipe
const handleTouchStart = (index, event) => {
  touchStartX.value[index] = event.touches[0].clientX;
  touchStartY.value[index] = event.touches[0].clientY;
};

const handleTouchMove = (index, event) => {
  const touchCurrentX = event.touches[0].clientX;
  const touchCurrentY = event.touches[0].clientY;
  const deltaX = touchCurrentX - touchStartX.value[index];
  const deltaY = touchCurrentY - touchStartY.value[index];

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    event.preventDefault(); // ป้องกันการเลื่อนหน้าเว็บ
    slidePositions.value[index] = Math.min(0, deltaX);
  }
};

const handleTouchEnd = (index) => {
  if (slidePositions.value[index] < -40) {
    slidePositions.value[index] = -80; // แสดงปุ่มถังขยะ
  } else {
    slidePositions.value[index] = 0; // กลับที่เดิม
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="w-full h-full">
    <!-- Header -->
    <div class="relative flex items-center justify-center pt-8 pl-4">
      <button @click="goBack" class="btn btn-ghost absolute left-5">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <h1 class="text-xl font-bold">ที่อยู่ของคุณ</h1>
    </div>
    
    <!-- สถานะกำลังโหลด -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="loading loading-spinner loading-lg text-[#005a9a]"></div>
    </div>
    
    <!-- แสดงข้อความเมื่อเกิดข้อผิดพลาด -->
    <div v-else-if="error" class="text-center py-16 px-4">
      <div class="flex flex-col items-center justify-center">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-2 text-red-500"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-500 max-w-md">{{ error }}</p>
        <button @click="fetchAddresses" class="btn btn-primary mt-4">
          <i class="fa-solid fa-refresh mr-2"></i> ลองใหม่
        </button>
      </div>
    </div>

    <!-- เนื้อหาหลัก -->
    <div v-else>
      <!-- ปุ่มเพิ่มที่อยู่ -->
      <div class="pt-4">
        <div
          @click="goToAddAddress"
          class="border-y border-[#bccad4] px-6 py-2 flex items-center justify-between"
        >
          <button class="flex items-center text-[#005a9a] font-semibold">
            <i class="fa-solid fa-plus font-bold"></i>
            <span class="ml-2">เพิ่มที่อยู่</span>
          </button>
          <i class="fa-solid fa-chevron-right text-[#0c3a5b]"></i>
        </div>

        <!-- ไม่มีที่อยู่ -->
        <div v-if="addresses.length === 0" class="text-center py-16 px-4">
          <div class="flex flex-col items-center justify-center">
            <i class="fa-solid fa-map-marker-alt text-4xl mb-2 text-gray-400"></i>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีที่อยู่</h3>
            <p class="text-gray-500 max-w-md">เพิ่มที่อยู่เพื่อใช้ในการจัดส่งสินค้า</p>
          </div>
        </div>

        <!-- รายการที่อยู่ -->
        <div
          v-for="(address, index) in addresses"
          :key="address._id"
          class="relative overflow-hidden"
        >
          <div
            class="py-4 px-6 border-b border-[#bccad4] relative transition-transform duration-300 cursor-pointer rounded-lg"
            :style="{ transform: `translateX(${slidePositions[index]}px)` }"
            :class="{
              'bg-[#e6f7ff] shadow-md border-[#83a9c4] scale-105':
                selectedAddressId === address._id,
            }"
            @click="selectAddress(address._id)"
            @touchstart="handleTouchStart(index, $event)"
            @touchmove="handleTouchMove(index, $event)"
            @touchend="handleTouchEnd(index)"
          >
            <div class="flex justify-between items-center">
              <span class="font-semibold text-[#005a9a]">{{ address.label || 'บ้าน' }}: {{ address.name }}</span>
              <button
                @click="(e) => editAddress(e, address._id)"
                class="text-[#c40c00] font-semibold"
              >
                แก้ไข
              </button>
            </div>
            <p class="text-[#83a9c4]">{{ address.phone }}</p>
            <p class="text-[#83a9c4]">{{ address.address }}, {{ address.district }}, {{ address.province }} {{ address.zipCode }}</p>
            <button
              v-if="address.isDefault"
              class="mt-2 px-3 py-1 bg-[#83a9c4] text-[#0c3a5b] font-semibold rounded-xl"
            >
              ค่าเริ่มต้น
            </button>
          </div>

          <!-- ปุ่มถังขยะ -->
          <button
            @click="removeAddress(address._id)"
            class="absolute right-0 top-0 bottom-0 w-20 bg-[#ffcfcc] text-white flex items-center justify-center transition-transform duration-300"
            :class="{
              'translate-x-0': slidePositions[index] <= -70,
              'translate-x-full': slidePositions[index] > -70,
            }"
          >
            <i class="fa-regular fa-trash-can text-[#c40c00] text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>