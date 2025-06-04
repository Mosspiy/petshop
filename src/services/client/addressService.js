import axios from 'axios';
import authService from '@/services/authService';

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// เพิ่ม interceptor สำหรับแนบ token
apiClient.interceptors.request.use(config => {
  const token = authService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const addressService = {
  // ดึงข้อมูลที่อยู่ทั้งหมดของผู้ใช้
  async getAddresses() {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      // API ไม่มี endpoint เฉพาะสำหรับดึงที่อยู่ทั้งหมด จึงดึงผ่านข้อมูลผู้ใช้
      const response = await apiClient.get(`/users/${userProfile.id}`);
      
      if (response.data && response.data.addresses) {
        return response.data.addresses;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // เพิ่มที่อยู่ใหม่
  async addAddress(addressData) {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // เตรียมข้อมูลให้ตรงกับ DTO ที่ backend ต้องการ
      const createAddressDto = {
        userId: userProfile.id,
        label: addressData.label || 'บ้าน', // กำหนดค่าเริ่มต้นถ้าไม่ได้ระบุ
        name: addressData.name,
        lastname: addressData.lastname || '',
        phone: addressData.phone,
        address: addressData.detail,
        zipCode: addressData.zipcode,
        province: addressData.province,
        district: addressData.district,
        isDefault: addressData.isDefault
      };
      
      const response = await apiClient.post('/addresses', createAddressDto);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // แก้ไขที่อยู่
  async updateAddress(addressId, addressData) {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // เตรียมข้อมูลให้ตรงกับ DTO ที่ backend ต้องการ
      const updateAddressDto = {
        userId: userProfile.id,
        label: addressData.label || 'บ้าน',
        name: addressData.name,
        lastname: addressData.lastname || '',
        phone: addressData.phone,
        address: addressData.detail,
        zipCode: addressData.zipcode,
        province: addressData.province,
        district: addressData.district,
        isDefault: addressData.isDefault
      };
      
      const response = await apiClient.patch(`/addresses/${addressId}`, updateAddressDto);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // ลบที่อยู่
  async deleteAddress(addressId) {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      const response = await apiClient.delete(`/addresses/${addressId}`, {
        data: { userId: userProfile.id }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // ดึงข้อมูลที่อยู่จาก ID
  async getAddressById(addressId) {
    try {
      const response = await apiClient.get(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching address by ID:', error);
      throw error;
    }
  }
};

export default addressService;