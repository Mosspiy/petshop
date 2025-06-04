<template>
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 h-screen bg-[#0c3a5b] text-white flex flex-col p-4 sticky top-0">
      <h2 class="text-xl font-bold mb-4">Admin Panel</h2>
      <RouterLink to="/admin/products" class="py-2 px-4 rounded hover:bg-gray-500" active-class="bg-white text-gray-800">Products</RouterLink>
      <RouterLink to="/admin/orders" class="py-2 px-4 rounded hover:bg-gray-500" active-class="bg-white text-gray-800">Orders</RouterLink>
      
      <RouterLink to="/admin" class="py-2 px-4 rounded hover:bg-red-700 mt-auto">Logout</RouterLink>
    </div>

    <!-- Content -->
    <div class="flex-1 p-8">
      <slot></slot>
    </div>
  </div>
</template>