<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const calculateSubtotal = () => {
  if (
    !localOrder.value ||
    !localOrder.value.items ||
    !Array.isArray(localOrder.value.items)
  ) {
    return 0;
  }

  return localOrder.value.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

const emit = defineEmits(["close", "update", "print-receipt"]);

const localOrder = ref({ ...props.order });
const isUpdating = ref(false);
const updateSuccess = ref(false);
const updateError = ref(null);
const showCancelConfirm = ref(false);
const originalStatus = ref('');

// คำนวณว่าสถานะปัจจุบันหรือสถานะเดิมเป็น Cancelled หรือไม่
const isCurrentlyOrWasCancelled = computed(() => {
  return localOrder.value.status === 'Cancelled' || originalStatus.value === 'Cancelled';
});

// ติดตามการเปลี่ยนแปลงของ props.order
watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      localOrder.value = { ...newOrder };
      originalStatus.value = newOrder.status;
    }
  },
  { deep: true }
);

// ติดตามการเปลี่ยนแปลงของ isOpen
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      updateSuccess.value = false;
      updateError.value = null;
      showCancelConfirm.value = false;
      originalStatus.value = props.order.status;
    }
  }
);

// ติดตามการเปลี่ยนแปลงของ status เพื่อแสดงคำเตือนเมื่อเปลี่ยนเป็น Cancelled
watch(
  () => localOrder.value.status,
  (newStatus) => {
    // ถ้าสถานะเดิมเป็น Cancelled แล้ว ไม่ให้เปลี่ยนไปเป็นสถานะอื่น
    if (originalStatus.value === 'Cancelled' && newStatus !== 'Cancelled') {
      localOrder.value.status = 'Cancelled';
      updateError.value = 'ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากออเดอร์นี้ถูกยกเลิกไปแล้ว';
      return;
    }
    
    // แสดงคำเตือนเมื่อเปลี่ยนเป็น Cancelled
    if (newStatus === 'Cancelled' && originalStatus.value !== 'Cancelled') {
      showCancelConfirm.value = true;
    } else {
      showCancelConfirm.value = false;
    }
  }
);

const isTrackingDisabled = computed(() => {
  // ถ้าเป็นสถานะ Cancelled ให้ disabled
  if (localOrder.value.status === 'Cancelled') {
    return true;
  }
  // ถ้าไม่ใช่สถานะ Shipped ให้ disabled
  return localOrder.value.status !== "Shipped";
});

const statusColors = computed(() => ({
  Pending: "text-yellow-600 bg-yellow-100",
  Processing: "text-blue-600 bg-blue-100",
  Shipped: "text-indigo-600 bg-indigo-100",
  Completed: "text-green-600 bg-green-100",
  Cancelled: "text-red-600 bg-red-100",
}));

const closeModal = () => {
  emit("close");
};

const updateOrder = async () => {
  try {
    isUpdating.value = true;
    updateError.value = null;

    // ตรวจสอบว่าออเดอร์เดิมเป็น Cancelled หรือไม่
    if (originalStatus.value === 'Cancelled' && localOrder.value.status !== 'Cancelled') {
      updateError.value = 'ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากออเดอร์นี้ถูกยกเลิกไปแล้ว';
      isUpdating.value = false;
      return;
    }

    // ตรวจสอบเลขติดตามเมื่อสถานะเป็น Shipped
    if (
      localOrder.value.status === "Shipped" &&
      !localOrder.value.trackingNumber
    ) {
      updateError.value = 'กรุณากรอกเลขติดตามเมื่อสถานะเป็น "จัดส่งแล้ว"';
      isUpdating.value = false;
      return;
    }

    // ส่งข้อมูลไปอัปเดตที่ parent component
    emit("update", localOrder.value);

    // แสดงข้อความสำเร็จ
    updateSuccess.value = true;

    // ปิด modal หลังจาก 1.5 วินาที
    setTimeout(() => {
      closeModal();
    }, 1500);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตออเดอร์:", error);
    updateError.value = "ไม่สามารถอัปเดตออเดอร์ได้ กรุณาลองใหม่อีกครั้ง";
  } finally {
    isUpdating.value = false;
  }
};

const revertStatusChange = () => {
  localOrder.value.status = originalStatus.value;
  showCancelConfirm.value = false;
};

const printReceipt = () => {
  emit("print-receipt", localOrder.value.id);
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 overflow-y-auto"
  >
    <div
      class="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto relative"
    >
      <button
        @click="closeModal()"
        class="absolute top-2 right-4 text-gray-600 hover:text-gray-900"
      >
        <i class="fa-solid fa-xmark text-2xl"></i>
      </button>

      <div class="flex  items-center mb-6">
        <h2 class="text-xl font-semibold">รายละเอียดออเดอร์</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ข้อมูลลูกค้า -->
        <div class="p-4 rounded-lg border">
          <h3 class="text-lg font-semibold mb-2">ข้อมูลลูกค้า</h3>
          <p>
            <strong>หมายเลขออเดอร์:</strong>
            {{ localOrder.orderCode || localOrder.id }}
          </p>
          <p><strong>ชื่อลูกค้า:</strong> {{ localOrder.customer }}</p>
          <p><strong>เบอร์โทรศัพท์:</strong> {{ localOrder.phone }}</p>
          <p>
            <strong>ที่อยู่จัดส่ง:</strong> {{ localOrder.customerAddress }}
          </p>
        </div>

        <!-- รายการสินค้า -->
        <div class="p-4 rounded-lg flex flex-col border">
          <h3 class="text-lg font-semibold mb-2">รายการสินค้า</h3>

          <!-- เพิ่ม Scroll Bar -->
          <div class="overflow-y-auto" style="max-height: 400px">
            <div
              v-for="(item, index) in localOrder.items"
              :key="index"
              class="flex items-center justify-between py-2"
            >
              <div class="flex items-center space-x-4">
                <img
                  :src="item.image"
                  alt="รูปภาพสินค้า"
                  class="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p>
                    <strong>{{ item.name }}</strong>
                  </p>
                  <p class="text-gray-600 text-sm">{{ item.option }}</p>
                  <p>ราคา: {{ item.price.toFixed(2) }} บาท</p>
                </div>
              </div>
              <p class="text-lg font-semibold">{{ item.quantity }}x</p>
            </div>
          </div>

          <!-- ยอดรวมสินค้าและค่าใช้จ่ายอื่นๆ -->
          <div class="mt-4 border-t pt-3">
            <div
              class="flex justify-between items-center text-sm text-gray-600 mb-1"
            >
              <span>ยอดรวมสินค้า:</span>
              <span>{{ calculateSubtotal().toFixed(2) }} บาท</span>
            </div>
            <div
              class="flex justify-between items-center text-sm text-gray-600 mb-1"
            >
              <span>ค่าจัดส่ง:</span>
              <span>{{ localOrder.shipping || "20.00" }} บาท</span>
            </div>
            <div
              v-if="localOrder.discount && localOrder.discount > 0"
              class="flex justify-between items-center text-sm text-red-500 mb-1"
            >
              <span>ส่วนลด:</span>
              <span>-{{ localOrder.discount.toFixed(2) }} บาท</span>
            </div>
            <div
              class="flex justify-between items-center text-xl font-bold mt-2"
            >
              <span>ยอดรวมทั้งสิ้น:</span>
              <span>{{ (calculateSubtotal() + parseFloat(localOrder.shipping || 20) -(localOrder.discount || 0)).toFixed(2) }} บาท</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ปุ่มพิมพ์ใบเสร็จ -->
      <div class="flex justify-end mt-4">
        <button @click="printReceipt()" class="btn btn-sm">
          <i class="fa-solid fa-print mr-2"></i> พิมพ์ใบเสร็จ
        </button>
      </div>


      <!-- แก้ไขข้อมูล: สถานะออเดอร์ และ เลขติดตามพัสดุ -->
      <div class="space-y-4 mt-6">
        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold">สถานะ</span></label
          >
          <select
            v-model="localOrder.status"
            class="select select-bordered w-full"
            :disabled="originalStatus === 'Cancelled'"
          >
            <option value="Pending">รอดำเนินการ</option>
            <option value="Processing">กำลังดำเนินการ</option>
            <option value="Shipped">จัดส่งแล้ว</option>
            <option value="Completed">เสร็จสิ้น</option>
            <option value="Cancelled">ยกเลิก</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">เลขติดตามพัสดุ</span>
            <span
              v-if="isTrackingDisabled"
              class="label-text-alt text-gray-500"
            >
              {{ localOrder.status === 'Cancelled' ? 
                '(* ไม่สามารถแก้ไขได้เนื่องจากออเดอร์ถูกยกเลิก)' : 
                '(* ต้องตั้งค่าสถานะเป็น "จัดส่งแล้ว" ก่อน)' }}
            </span>
            <span v-else class="label-text-alt text-red-500">* จำเป็น</span>
          </label>
          <input
            v-model="localOrder.trackingNumber"
            type="text"
            class="input input-bordered w-full"
            :class="{
              'input-error':
                localOrder.status === 'Shipped' && !localOrder.trackingNumber,
            }"
            :disabled="isTrackingDisabled"
            placeholder="กรอกเลขติดตามพัสดุ"
          />
        </div>

        <!-- ข้อความแจ้งเตือนหรือข้อผิดพลาด -->
        <div v-if="updateSuccess" class="alert alert-success shadow-lg">
          <div>
            <i class="fa-solid fa-circle-check"></i>
            <span>อัปเดตข้อมูลเรียบร้อยแล้ว!</span>
          </div>
        </div>

        <div v-if="updateError" class="alert alert-error shadow-lg">
          <div>
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ updateError }}</span>
          </div>
        </div>

        <button
          @click="updateOrder"
          class="btn bg-[#2b7deb] text-white w-full text-lg font-semibold py-3 rounded-lg"
          :disabled="isUpdating || originalStatus === 'Cancelled'"
        >
          <span v-if="isUpdating">
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>กำลังอัปเดต...
          </span>
          <span v-else-if="originalStatus === 'Cancelled'">
            <i class="fa-solid fa-ban mr-2"></i>ไม่สามารถอัปเดตได้ (ออเดอร์ถูกยกเลิก)
          </span>
          <span v-else>อัปเดต</span>
        </button>
      </div>
    </div>
  </div>
</template>