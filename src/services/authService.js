import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// เพิ่ม interceptor สำหรับแนบ token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  getAuthToken() {
    return localStorage.getItem('auth_token');
  },
  // เริ่มกระบวนการ LINE Login
  async initiateLineLogin() {
    try {
      // เรียก backend เพื่อขอ URL สำหรับ LINE Login
      const response = await apiClient.get('/auth/line');
      
      if (response.data && response.data.url) {
        // Redirect ไปยัง LINE Login page
        window.location.href = response.data.url;
        return true;
      }
      
      console.error('Failed to get LINE Login URL');
      return false;
    } catch (error) {
      console.error('Error initiating LINE Login:', error);
      return false;
    }
  },
  
  // จัดการกับ token ที่ได้รับจาก redirect
  async handleLineLoginCallback(token) {
    try {
      // บันทึก token
      localStorage.setItem('auth_token', token);
      
      // ดึงข้อมูลผู้ใช้
      const response = await apiClient.get('/auth/profile');
      
      if (response.data) {
        // บันทึกข้อมูลผู้ใช้
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('lineId', response.data.lineId);
        localStorage.setItem('displayName', response.data.displayName);
        localStorage.setItem('pictureUrl', response.data.pictureUrl || '');
        
        return {
          success: true,
          user: response.data
        };
      }
      
      return {
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      };
    } catch (error) {
      console.error('Error handling token:', error);
      localStorage.removeItem('auth_token');
      
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      };
    }
  },
  
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  isLoggedIn() {
    return !!localStorage.getItem('auth_token');
  },
  
  // ดึงข้อมูลผู้ใช้
  async getUserProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.logout();
      throw error;
    }
  },
  
  // ออกจากระบบ
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('lineId');
    localStorage.removeItem('displayName');
    localStorage.removeItem('pictureUrl');
  }
};

export default authService;