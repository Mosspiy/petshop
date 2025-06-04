import axios from 'axios';

// ค่า API URL จาก .env
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance สำหรับเรียก API
const apiClient = axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// เพิ่ม interceptor สำหรับแนบ token ในทุก request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const productService = {
  /**
   * ดึงรายการสินค้าทั้งหมด
   */
  async getAll() {
    try {
      const response = await axios.get(`${apiUrl}/admin/products`, {
        params: {
          // ส่งพารามิเตอร์เพิ่มเติมหากต้องการ
          includeImages: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * ดึงรายการสินค้าตามชนิดของสัตว์
   * @param {string} animalType - ชนิดของสัตว์
   */
  async getByAnimalType(animalType) {
    try {
      const response = await axios.get(`${apiUrl}/admin/products/by-animal/${animalType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for animal type ${animalType}:`, error);
      throw error;
    }
  },

  /**
   * ดึงสินค้าตาม ID
   * @param {string} id - ID ของสินค้า
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/admin/products/${id}`);
      console.log("Product data received:", response.data); // ตรวจสอบว่ามี animalType ในข้อมูลที่ได้รับหรือไม่
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * เพิ่มสินค้าใหม่
   * @param {Object} productData - ข้อมูลสินค้า
   * @param {File} imageFile - ไฟล์รูปภาพ
   */
  async create(productData, imageFile) {
    try {
      // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
      const formData = new FormData();
      
      // เพิ่มข้อมูลสินค้า
      formData.append('name', productData.name);
      formData.append('about', productData.about);
      formData.append('description', productData.description);
      formData.append('category', productData.category);
      
      // เพิ่มชนิดของสัตว์
      if (productData.animalType) {
        formData.append('animalType', productData.animalType);
      }
      
      formData.append('status', String(productData.status));
      formData.append('updateAt', new Date().toISOString());
      
      // แปลง options เป็น JSON string
      formData.append('options', JSON.stringify(productData.options));
      
      // เพิ่มรูปภาพ
      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }
      
      // ส่ง request ด้วย axios และ FormData
      const response = await axios.post(`${apiUrl}/admin/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * อัปเดตสินค้าที่มีอยู่
   * @param {string} id - ID ของสินค้า
   * @param {Object} productData - ข้อมูลสินค้าที่ต้องการอัปเดต
   * @param {File} [imageFile] - ไฟล์รูปภาพใหม่ (ถ้ามี)
   */
  async update(id, productData, imageFile = null) {
    try {
      const formData = new FormData();
      
      formData.append('name', productData.name);
      formData.append('about', productData.about || '');
      formData.append('description', productData.description);
      formData.append('category', productData.category);
      
      // เพิ่มชนิดของสัตว์
      if (productData.animalType) {
        formData.append('animalType', productData.animalType);
      }
      
      formData.append('status', String(productData.status));
      formData.append('updateAt', new Date().toISOString());
      
      formData.append('options', JSON.stringify(productData.options));
      
      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }
      
      const response = await axios.patch(`${apiUrl}/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * ลบสินค้า
   * @param {string} id - ID ของสินค้า
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * ดึงรายการชนิดของสัตว์ทั้งหมดที่มีในฐานข้อมูล
   */
  async getAllAnimalTypes() {
    try {
      console.log('Getting all animal types...');
      const response = await axios.get(`${apiUrl}/admin/products`);
      console.log('Products for animal types:', response.data);
      
      // ดึงค่าที่ไม่ซ้ำกัน
      const animalTypes = [...new Set(response.data
        .filter(product => product.animalType && product.animalType.trim() !== '')
        .map(product => product.animalType))];
      
      console.log('Extracted animal types:', animalTypes);
      return animalTypes;
    } catch (error) {
      console.error('Error fetching animal types:', error);
      return []; // คืนค่า array ว่างแทนที่จะโยน error
    }
  }
};

// Export object admin ที่มี property เป็น productService
export const admin = {
  productService
};

// Export default เป็น admin 
export default admin;