import axios from 'axios';

// ค่า API URL จาก .env
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance สำหรับเรียก API
const apiClient = axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // timeout 10 วินาที
});

const clientProductService = {
  searchProducts(query, filters = {}) {
    console.log('Frontend Search Parameters:', { 
      query, 
      filters 
    });
    
    const searchUrl ='/products/search';
    console.log('Search URL:', searchUrl);
    const safeQuery = query ? encodeURIComponent(query) : '';
    
    return apiClient.get('/products/search', { 
      params: {
        q: query || '', 
        category: filters.category || 'ทั้งหมด',
        animalType: filters.animalType || 'ทั้งหมด',
        price: filters.price || ''
      }
    });
  },

  getProducts(params = {}) {
    return apiClient.get('/products', { params });
  },
  
  getProductById(id) {
    return apiClient.get(`/products/${id}`);
  },
  
  getProductsByCategory(category, params = {}) {
    return apiClient.get(`/products/category/${category}`, { params });
  },
  
  getProductsByAnimalType(animalType, params = {}) {
    return apiClient.get(`/products/animal-type/${animalType}`, { params });
  },
  
  getCategories() {
    return apiClient.get('/products/categories/list');
  },
  
  getAnimalTypes() {
    return apiClient.get('/products/animal-types/list');
  }
};

export default clientProductService;