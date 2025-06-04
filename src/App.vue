<script setup>
import { RouterLink, RouterView } from 'vue-router'
import menubar from '@/layout/menu.vue';


</script>

<template>
  <div class="min-h-screen w-full bg-[#eaf1f6]">
    <RouterView/>
    <menubar />

</div>
</template>

