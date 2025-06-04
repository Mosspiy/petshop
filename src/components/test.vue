<template>
  <div>
    <button @click="loginWithLine">Login กับ Line</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  methods: {
    async loginWithLine() {
      // เรียก Line Login SDK
      liff.init({ liffId: 'YOUR_LIFF_ID' })
      
      try {
        // ขอ Access Token จาก Line
        const accessToken = await liff.getAccessToken()
        
        // ส่ง Token ไปยัง Backend
        const response = await axios.post('https://petshop-api-6gix.onrender.com/auth/line-login', {
          accessToken: accessToken
        })
        
        // จัดการหลังจาก Login สำเร็จ
        console.log(response.data)
      } catch (error) {
        console.error('Login failed', error)
      }
    }
  }
}
</script>