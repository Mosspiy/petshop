<script setup>
import { ref, watchEffect, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import cartService from '../services/client/cartService'; // เพิ่ม import cartService

// ✅ ใช้ Vue Router
const router = useRouter();
const route = useRoute();
const cartItemCount = ref(0); // เริ่มต้นที่ 0

// ฟังก์ชันดึงจำนวนสินค้าในตะกร้า
const fetchCartItemCount = async () => {
  try {
    const cart = await cartService.getCart();
    if (cart && cart.items && Array.isArray(cart.items)) {
      // นับจำนวนชิ้นทั้งหมดในตะกร้า
      cartItemCount.value = cart.items.reduce((total, item) => total + item.quantity, 0);
    } else {
      cartItemCount.value = 0;
    }
    console.log('Current cart items count:', cartItemCount.value);
  } catch (error) {
    console.error('Error fetching cart data:', error);
    cartItemCount.value = 0;
  }
};

const cartItemDisplay = computed(() => {
  return cartItemCount.value > 99 ? '99+' : cartItemCount.value;
});

// ✅ กำหนดเมนูใน Navbar
const menuItems = [
  { id: 1, name: "Home", icon: "fas fa-home", to: "/" },
  { id: 2, name: "Favorite", icon: "fas fa-heart", to: "/favorite" },
  { id: 3, name: "Cart", icon: "fas fa-shopping-cart", to: "/cart" },
  { id: 4, name: "Profile", icon: "fas fa-user", to: "/profile" },
];

// ✅ ระบุเมนูที่เปิดอยู่ตอนนี้ (อัปเดตอัตโนมัติ)
const activeMenu = ref(1);

// ✅ ควบคุมการแสดง/ซ่อนแถบเมนูเมื่อเลื่อน
const isMenuVisible = ref(true);
let lastScrollY = 0;

// ✅ ฟังก์ชันเปลี่ยนเมนูที่เลือก
const setActiveMenu = (id) => {
  activeMenu.value = id;
  const menuItem = menuItems.find((item) => item.id === id);
  if (menuItem) {
    router.push(menuItem.to);
  }
};

// ✅ ตรวจจับเส้นทางปัจจุบันและอัปเดต activeMenu อัตโนมัติ
watchEffect(() => {
  const currentPath = route.path;
  const matchedMenu = menuItems.find(item => item.to === currentPath);
  if (matchedMenu) {
    activeMenu.value = matchedMenu.id;
  }
});

// ✅ ฟังก์ชันตรวจจับการเลื่อนหน้าจอ
const handleScroll = () => {
  isMenuVisible.value = window.scrollY <= lastScrollY;
  lastScrollY = window.scrollY;
};

// ✅ หน้าที่ยกเว้น ไม่ให้แสดง Navbar
const hideNavbar = computed(() => {
  const hiddenPages = ['ProductDetail', 'cart', 'addAddress', 'AddressView', 'adminLogin', 'adminProducts', 'adminOrders','LoginPage', 'LoginSuccess'];
  return hiddenPages.includes(route.name) || route.matched.some(record => hiddenPages.includes(record.components?.default?.name));
});

// สร้าง event listener เพื่อรับการอัปเดตตะกร้า
const updateCartCount = () => {
  console.log('Cart updated event received, updating count...');
  fetchCartItemCount();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  // ดึงจำนวนสินค้าในตะกร้าเมื่อ component ถูกโหลด
  fetchCartItemCount();
  
  // เพิ่ม event listener สำหรับการอัปเดตตะกร้า
  window.addEventListener('cart-updated', updateCartCount);
  
  // เพิ่ม event listener สำหรับการนำทางเสร็จสิ้น (เพื่ออัปเดตหลังการนำทาง)
  router.afterEach(() => {
    fetchCartItemCount();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('cart-updated', updateCartCount);
});
</script>

<template>
  <div>
    <!-- ✅ Navbar -->
    <div
      v-if="!hideNavbar"
      :class="[
        'fixed bottom-0 w-full bg-white shadow-lg h-18 transition-transform duration-300',
        isMenuVisible ? 'translate-y-0' : 'translate-y-full'
      ]"
    >
      <nav class="flex justify-around items-center py-2">
        <div
  v-for="item in menuItems"
  :key="item.id"
  class="relative text-center cursor-pointer"
  @click="setActiveMenu(item.id)"
>
  <div
    class="transition-transform duration-300 relative"
    :class="{
      'scale-125 text-[#0c3a5b]': activeMenu === item.id,
      'text-[#bccad4]': activeMenu !== item.id
    }"
  >
    <i :class="[item.icon, 'text-2xl']"></i>

    <!-- ✅ Indicator เฉพาะเมนู Cart -->
    <span
      v-if="item.id === 3 && cartItemCount > 0"
      class="absolute top-0 right-0 -mt-1 -mr-2 bg-[#2b7deb] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
    >
      {{ cartItemDisplay }}
    </span>
  </div>
  <p
    class="text-xs mt-1 transition-colors duration-300"
    :class="{
      'text-[#0c3a5b]': activeMenu === item.id,
      'text-[#bccad4]': activeMenu !== item.id
    }"
  >
    {{ item.name }}
  </p>
</div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.transition-transform {
  transition: transform 0.3s ease;
}
</style>
