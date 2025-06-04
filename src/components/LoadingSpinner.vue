<script setup>
defineProps({
  size: {
    type: String,
    default: 'lg' // 'xs', 'sm', 'md', 'lg', 'xl'
  },
  text: {
    type: String,
    default: 'กำลังโหลด...'
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8">
    <div 
      class="loading loading-spinner text-[#2b7deb]"
      :class="{
        'loading-xs': size === 'xs',
        'loading-sm': size === 'sm',
        'loading-md': size === 'md',
        'loading-lg': size === 'lg',
        'loading-xl': size === 'xl'
      }"
    ></div>
    <p v-if="text" class="mt-4 text-gray-500">{{ text }}</p>
  </div>
</template>