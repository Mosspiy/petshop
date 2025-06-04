<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'fa-solid fa-box-open'
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <i :class="icon" class="text-5xl text-gray-300 mb-4"></i>
    <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-gray-500 max-w-md mx-auto mb-4">{{ description }}</p>
    <slot></slot>
  </div>
</template>