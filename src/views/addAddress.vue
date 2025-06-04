<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import addressService from "../services/client/addressService";
import authService from "../services/authService";

const router = useRouter();
const route = useRoute();

// สถานะการโหลดและข้อผิดพลาด
const isLoading = ref(true);
const error = ref(null);
const isSaving = ref(false);

// ข้อมูลสำหรับที่อยู่
const contact = ref({
  name: "",
  lastname: "",
  phone: "",
});

const address = ref({
  label: "บ้าน",
  province: "",
  district: "",
  subdistrict: "",
  zipcode: "",
  detail: "",
});

const isDefault = ref(false);
const isEditing = ref(false);
const addressId = ref(null);

// โหลดข้อมูลที่อยู่ที่ต้องการแก้ไข
const fetchAddressForEdit = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // ตรวจสอบการเข้าสู่ระบบ
    if (!authService.isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    // ดึง addressId จาก query parameters
    if (route.query.addressId) {
      addressId.value = route.query.addressId;
      isEditing.value = true;
      
      // ดึงข้อมูลที่อยู่จาก API
      const addressData = await addressService.getAddressById(addressId.value);
      
      // นำข้อมูลมากรอกในฟอร์ม
      contact.value.name = addressData.name || '';
      contact.value.lastname = addressData.lastname || '';
      contact.value.phone = addressData.phone || '';
      
      address.value.label = addressData.label || 'บ้าน';
      address.value.province = addressData.province || '';
      address.value.district = addressData.district || '';
      address.value.subdistrict = addressData.subdistrict || '';
      address.value.zipcode = addressData.zipCode || '';
      address.value.detail = addressData.address || '';
      
      isDefault.value = addressData.isDefault || false;
    }
  } catch (err) {
    console.error('Error fetching address for edit:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลที่อยู่ได้';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAddressForEdit();
});

const goBack = () => {
  router.back();
};

const saveAddress = async () => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!contact.value.name || !contact.value.phone ||
        !address.value.province || !address.value.district ||
        !address.value.zipcode || !address.value.detail) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // ตรวจสอบรูปแบบเบอร์โทรศัพท์
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contact.value.phone)) {
      alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)');
      return;
    }
    
    isSaving.value = true;
    
    // เตรียมข้อมูลสำหรับส่งไป API
    const addressData = {
      label: address.value.label,
      name: contact.value.name,
      lastname: contact.value.lastname,
      phone: contact.value.phone,
      province: address.value.province,
      district: address.value.district,
      subdistrict: address.value.subdistrict,
      zipcode: address.value.zipcode,
      detail: address.value.detail,
      isDefault: isDefault.value
    };
    
    // บันทึกข้อมูล
    if (isEditing.value) {
      await addressService.updateAddress(addressId.value, addressData);
    } else {
      await addressService.addAddress(addressData);
    }
    
    // กลับไปหน้ารายการที่อยู่
    router.back();
  } catch (err) {
    console.error('Error saving address:', err);
    alert('ไม่สามารถบันทึกที่อยู่ได้: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <div class="relative flex items-center justify-center pt-8 pl-4">
      <button @click="goBack" class="btn btn-ghost absolute left-5">
        <i class="fa-solid fa-chevron-left text-xl text-[#0c3a5b]"></i>
      </button>
      <h1 class="text-xl font-bold">{{ isEditing ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่" }}</h1>
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
        <button @click="fetchAddressForEdit" class="btn btn-primary mt-4">
          <i class="fa-solid fa-refresh mr-2"></i> ลองใหม่
        </button>
      </div>
    </div>

    <!-- เนื้อหาหลัก -->
    <div v-else class="flex-grow w-full max-w-full mx-auto p-6">
      <h2 class="text-base font-semibold text-[#005a9a]">ข้อมูลติดต่อ</h2>
      <div class="card bg-white shadow-md p-4 mt-2">
        <div class="text-[#005a9a] font-semibold">
          <input
            v-model="contact.name"
            type="text"
            placeholder="ชื่อจริง"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full placeholder:text-[#83a9c4]"
            required
          />
          <input
            v-model="contact.lastname"
            type="text"
            placeholder="นามสกุล (ถ้ามี)"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
          />
          <input
            v-model="contact.phone"
            type="tel"
            placeholder="โทรศัพท์ (10 หลัก)"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
            maxlength="10"
            pattern="[0-9]{10}"
            required
          />
        </div>
      </div>

      <h2 class="text-base font-semibold text-[#005a9a] mt-4">ข้อมูลที่อยู่</h2>
      <div class="card bg-white shadow-md p-4 mt-2">
        <div class="rounded-lg mt-1 text-[#005a9a] font-semibold">
          <input
            v-model="address.label"
            type="text"
            placeholder="ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full placeholder:text-[#83a9c4]"
          />
          <input
            v-model="address.province"
            type="text"
            placeholder="จังหวัด"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
            required
          />
          <input
            v-model="address.district"
            type="text"
            placeholder="เขต/อำเภอ"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
            required
          />
          <input
            v-model="address.subdistrict"
            type="text"
            placeholder="แขวง/ตำบล"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
          />
          <input
            v-model="address.zipcode"
            type="text"
            placeholder="รหัสไปรษณีย์"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
            maxlength="5"
            pattern="[0-9]{5}"
            required
          />
          <textarea
            v-model="address.detail"
            placeholder="รายละเอียดที่อยู่ (บ้านเลขที่ ซอย ถนน)"
            class="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2 w-full mt-3 placeholder:text-[#83a9c4]"
            rows="2"
            required
          ></textarea>
        </div>
      </div>

      <h2 class="text-base font-semibold text-[#005a9a] mt-4">การตั้งค่า</h2>
      <div class="card bg-white shadow-md p-4 mt-2">
        <div class="flex items-center justify-between">
          <span class="text-[#005a9a] font-semibold">ตั้งเป็นค่าเริ่มต้น</span>
          <input
            v-model="isDefault"
            type="checkbox"
            class="toggle border border-white bg-white [--tglbg:#b2b2b2] checked:bg-white checked:[--tglbg:#00d54f]"
          />
        </div>
      </div>
    </div>
    <!-- ปุ่มบันทึก -->
    <div class="px-4 shadow-md flex justify-center">
      
      <button
        @click="saveAddress"
        :disabled="isSaving"
        class="btn bg-[#c40c00] w-1/2 rounded-full text-white"
      >
        <span v-if="isSaving">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i>กำลังบันทึก...
        </span>
        <span v-else>
          {{ isEditing ? "บันทึกการแก้ไข" : "บันทึก" }}
        </span>
      </button>
    </div>

  </div>
</template>