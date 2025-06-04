import axios from 'axios';
import authService from './authService';

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม interceptor สำหรับแนบ token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// สำหรับเก็บค่า favoriteId ไว้ใช้ในครั้งต่อไป
let cachedUserInfo = {
  userId: null,
  favoriteId: null
};

const favoriteService = {
  // ดึงข้อมูลผู้ใช้และรายการโปรด
  async getUserInfo() {
    try {
      // ถ้ามีค่าแคชแล้วให้ใช้ค่านั้น
      if (cachedUserInfo.userId && cachedUserInfo.favoriteId) {
        return cachedUserInfo;
      }
      
      // ดึงข้อมูลผู้ใช้
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // ดึงข้อมูลผู้ใช้แบบละเอียด
      const response = await apiClient.get(`/users/${userProfile.id}`);
      
      // ตรวจสอบข้อมูล favorites
      let favoriteId;
      if (response.data.favorites) {
        if (typeof response.data.favorites === 'object' && response.data.favorites._id) {
          favoriteId = response.data.favorites._id;
        } else if (typeof response.data.favorites === 'string') {
          favoriteId = response.data.favorites;
        } else {
          console.error('Invalid favorites format:', response.data.favorites);
          throw new Error('รูปแบบข้อมูล favorites ไม่ถูกต้อง');
        }
      } else {
        throw new Error('ไม่พบข้อมูล favorites');
      }
      
      // เก็บค่าไว้ใน cache
      cachedUserInfo = {
        userId: userProfile.id,
        favoriteId: favoriteId
      };
      
      return cachedUserInfo;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  },
  
  // ดึงรายการสินค้าโปรดของผู้ใช้
  async getFavoriteItems() {
    try {
      // ดึงข้อมูลผู้ใช้และรายการโปรด
      const { favoriteId } = await this.getUserInfo();
      
      // ดึงข้อมูล favorite
      const response = await apiClient.get(`/favorites/${favoriteId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite items:', error);
      return { items: [] };
    }
  },

  // เพิ่มสินค้าลงในรายการโปรด
  async addToFavorite(productId) {
    try {
      // ดึงข้อมูลผู้ใช้และรายการโปรด
      const { userId, favoriteId } = await this.getUserInfo();
      
      // ถ้าได้ favoriteId แล้ว ให้ลองใช้ endpoint แบบใหม่ที่มี userId
      try {
        console.log(`Adding product ${productId} to favorite for user ${userId}`);
        const response = await apiClient.post(`/favorites/user/${userId}/add`, {
          productId
        });
        return response.data;
      } catch (error) {
        // ถ้าใช้ endpoint แบบใหม่ไม่ได้ ให้ใช้แบบเดิม
        console.warn('New endpoint failed, trying old endpoint:', error);
        
        console.log(`Adding product ${productId} to favorite ${favoriteId}`);
        const response = await apiClient.post(`/favorites/${favoriteId}/add`, {
          productId,
          userId // เพิ่ม userId เข้าไปในการส่งข้อมูล
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error adding item to favorite:', error);
      throw error;
    }
  },

  // ลบสินค้าออกจากรายการโปรด
  async removeFromFavorite(productId) {
    try {
      // ดึงข้อมูลผู้ใช้และรายการโปรด
      const { userId, favoriteId } = await this.getUserInfo();
      
      // ถ้าได้ favoriteId แล้ว ให้ลองใช้ endpoint แบบใหม่ที่มี userId
      try {
        console.log(`Removing product ${productId} from favorite for user ${userId}`);
        const response = await apiClient.post(`/favorites/user/${userId}/remove`, {
          productId
        });
        return response.data;
      } catch (error) {
        // ถ้าใช้ endpoint แบบใหม่ไม่ได้ ให้ใช้แบบเดิม
        console.warn('New endpoint failed, trying old endpoint:', error);
        
        console.log(`Removing product ${productId} from favorite ${favoriteId}`);
        
        // ลองใช้วิธีที่ตรงกับ removeItemsFromFavorite ใน backend
        try {
          const response = await apiClient.post(`/favorites/${favoriteId}/remove`, {
            productId,
            userId // เพิ่ม userId เข้าไปในการส่งข้อมูล
          });
          return response.data;
        } catch (innerError) {
          // หากยังเกิด error อีก ลองใช้วิธี force-remove
          console.warn('Standard remove failed, trying force-remove:', innerError);
          
          const response = await apiClient.post(`/favorites/${favoriteId}/force-remove`, {
            productId
          });
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error removing item from favorite:', error);
      
      // เพื่อไม่ให้ UI ค้าง ควรอัพเดทสถานะในฝั่ง frontend ถึงแม้จะมี error
      // ลบ cache เพื่อให้โหลดข้อมูลใหม่ในครั้งถัดไป
      this.clearCache();
      
      throw error;
    }
  },

  // ตรวจสอบว่าสินค้าอยู่ในรายการโปรดหรือไม่
  async isProductInFavorite(productId) {
    try {
      const favorites = await this.getFavoriteItems();
      
      // ตรวจสอบว่าสินค้าอยู่ในรายการโปรดหรือไม่
      const isInFavorite = Array.isArray(favorites.items) && favorites.items.some(item => {
        // ตรวจสอบกรณีต่างๆ ของ productId
        if (!item) return false;
        
        // กรณี productId เป็น String ธรรมดา
        if (item.productId === productId) return true;
        
        // กรณี productId เป็น Object ที่มี _id
        if (item.productId && item.productId._id === productId) return true;
        
        // กรณี productId เป็น Object ที่มี id
        if (item.productId && item.productId.id === productId) return true;
        
        // กรณี item เป็น Object ที่มี _id โดยตรง
        if (item._id === productId) return true;
        
        // กรณี item เป็น Object ที่มี id โดยตรง
        if (item.id === productId) return true;
        
        return false;
      });
      
      return isInFavorite;
    } catch (error) {
      console.error('Error checking product in favorite:', error);
      return false;
    }
  },
  
  // ล้าง cache
  clearCache() {
    cachedUserInfo = {
      userId: null,
      favoriteId: null
    };
  },
  
};

export default favoriteService;