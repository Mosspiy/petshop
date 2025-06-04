<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService from "../services/authService";

import OrderTab from "../components/User/OrdersTab.vue";
import ShippingTab from "../components/User/ShippingTab.vue";
import DeliveredTab from "../components/User/DeliveredTab.vue";
import RatingTab from "../components/User/RatingTab.vue";

const router = useRouter();
const activeTab = ref("คำสั่งซื้อ"); // ค่าเริ่มต้นของหัวข้อที่เลือก
const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};
const user = ref({
  displayName: '',
  pictureUrl: 'https://th.bing.com/th/id/R.e2047627dfa0adc6daf0826d4467043c?rik=NgFEj56kGKncQg&pid=ImgRaw&r=0'
});

const loading = ref(true);

const fetchUserProfile = async () => {
  try {
    loading.value = true;
    const userProfile = await authService.getUserProfile();
    
    user.value = {
      displayName: userProfile.displayName || 'ผู้ใช้',
      pictureUrl: userProfile.pictureUrl || user.value.pictureUrl // ใช้รูปเดิมถ้าไม่มีรูปจาก LINE
    };
    
    console.log('Loaded User:', user.value);
  } catch (error) {
    console.error('Error loading user profile:', error);
  } finally {
    loading.value = false;
  }
};

// ข้อมูลของแท็บทั้งหมด
const tabs = [
  { name: 'คำสั่งซื้อ', label: 'คำสั่งซื้อ', iconClass: 'fa-solid fa-clipboard-list text-3xl' },
  { name: 'ที่ต้องจัดส่ง', label: 'ที่ต้องจัดส่ง', iconClass: 'fa-solid fa-box text-3xl' },
  { name: 'จัดส่งแล้ว', label: 'จัดส่งแล้ว', iconClass: 'fa-solid fa-truck-fast text-3xl' },
  { name: 'ให้คะแนน', label: 'ให้คะแนน', iconClass: 'fa-solid fa-comment-dots text-3xl' }
];

const getActiveTabComponent = () => {
  switch (activeTab.value) {
    case "คำสั่งซื้อ":
      return OrderTab;
    case "ที่ต้องจัดส่ง":
      return ShippingTab;
    case "จัดส่งแล้ว":
      return DeliveredTab;
    case "ให้คะแนน":
      return RatingTab;
    default :
      return ; // กำหนดค่าเริ่มต้น
  }
};

// ฟังก์ชันคืนค่าสไตล์ของปุ่ม
const getButtonStyle = (tabName) => {
  return activeTab.value === tabName ? { color: '#005a9a' } : { color: '#83a9c4' };
};

// ฟังก์ชันคืนค่าสไตล์ของข้อความ
const getTextStyle = (tabName) => {
  return activeTab.value === tabName
    ? { color: '#005a9a', fontWeight: 'bold' }
    : { color: '#83a9c4' };
};
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchUserProfile();
});

</script>

<template>
  <div class="w-full h-full">
    <!-- Header -->
    <div class="relative flex items-center justify-center pt-8 pl-4">
      <!-- ปุ่มย้อนกลับ -->
      <button @click="goBack" class="btn btn-ghost absolute left-5">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <!-- หัวข้อกลางจอ -->
      <h1 class="text-xl font-bold">บัญชีของฉัน</h1>
    </div>

    <!-- ข้อมูลบัญชี -->
    <div class="flex flex-col items-center mt-8">
      <!-- รูปโปรไฟล์ -->
      <div class="avatar">
        <div class="w-16 rounded-full ring ring-[#83a9c4] ring-offset-base-100 ring-offset-2">
          <img v-if="loading" src="https://th.bing.com/th/id/R.e2047627dfa0adc6daf0826d4467043c?rik=NgFEj56kGKncQg&pid=ImgRaw&r=0" alt="Loading..." />
          <img v-else :src="user.pictureUrl" alt="Profile Image" />  
        </div>
      </div>
      <!-- ชื่อผู้ใช้ -->
      <p class="mt-4 font-bold text-lg text-[#005a9a]">{{ user.displayName}}</p>
    </div>

    <!-- Tabs -->
    <div class="flex justify-between mt-8 px-4 md:px-6">
      <div
        class="tabs">
        <a class="tab tab-bordered font-bold text-[#005a9a] pointer-events-none">การซื้อของฉัน</a>
      </div>
      <div
        class="tabs">
        <a
        @click="router.push('/orderhistory')" 
        class="tab tab-bordered text-[#2b7deb]">ประวัติคำสั่งซื้อ</a>
      </div>
    </div>
      <!--divider-->
    <div class="divider my-0"></div>

    <!-- Icon Menu -->
    <div class="grid grid-cols-4 gap-4 mt-1 px-4 text-center mb-2">
    <div v-for="tab in tabs" :key="tab.name" @click="setActiveTab(tab.name)">
      <button
        class="btn btn-ghost w-16 h-16 mx-auto flex items-center justify-center"
        :style="getButtonStyle(tab.name)"
      >
        <i :class="tab.iconClass"></i>
      </button>
      <p class="text-sm" :style="getTextStyle(tab.name)">{{ tab.label }}</p>
    </div>
  </div>
  
  <!--divider-->
    <div class="divider my-0"></div>

    <!-- Tab Content -->
    <div class="p-4">
      <component
        :is="getActiveTabComponent()"
      ></component>
    </div>
  </div>
</template>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
</style>
