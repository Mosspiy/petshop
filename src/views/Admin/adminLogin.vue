<script setup>
import { ref } from 'vue'

import Logo from '@/assets/logo/petshopLogo.svg'

// การประกาศ state ของ email และ password
const email = ref('')
const password = ref('')

// ฟังก์ชันสำหรับส่งข้อมูลเมื่อกด login
const submitLogin = () => {
  if (email.value && password.value) {
    console.log('Logging in with', email.value, password.value)
    // Logic สำหรับการตรวจสอบ หรือ request ไปยัง API
  } else {
    alert('Please fill in both email and password.')
  }
}
</script>

<template>
    <div class="min-h-screen bg-[#eaf1f6] flex items-center justify-center">
      <div class="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-2">
        <div class="flex flex-col items-center justify-center">
        <img :src="Logo"
        alt="Logo"
        class="w-32 h-32 mb-4 ml-6">
        <h1 class="text-2xl font-bold text-center">Admin Login</h1>
        </div>
        
        <form @submit.prevent="submitLogin" class="space-y-3">
          <!-- Email Field -->
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="input input-bordered w-full"
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <!-- Password Field -->
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              id="password"
              class="input input-bordered w-full"
              placeholder="••••••••"
              required
            />
          </div>
  
          <!-- Submit Button -->
          <div class="form-control mt-4">
            <button class="btn bg-[#2b7deb] w-full text-white" type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
 
  
  <style scoped>
  /* ปรับแต่งสไตล์เพิ่มเติมถ้าจำเป็น */
  </style>
  