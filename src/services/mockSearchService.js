// src/services/mockSearchService.js
// ไฟล์บริการจำลองที่เรียกใช้ข้อมูลจาก mockData.js
import mockData from '@/data/mockData';

/**
 * ดึงข้อมูลสินค้าทั้งหมด
 * @returns {Promise<Object>} สินค้าทั้งหมด
 */
const getProducts = async () => {
  try {
    const data = await mockData.getAll();
    return {
      status: 'success',
      data: data
    };
  } catch (error) {
    console.error('Error in getProducts:', error);
    return {
      status: 'error',
      message: error.message,
      data: []
    };
  }
};

/**
 * ดึงข้อมูลสินค้าตามหมวดหมู่
 * @param {string} category ชื่อหมวดหมู่
 * @returns {Promise<Object>} สินค้าในหมวดหมู่ที่กำหนด
 */
const getProductsByCategory = async (category) => {
  try {
    const data = await mockData.getProductsByCategory(category);
    return {
      status: 'success',
      data: data
    };
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return {
      status: 'error',
      message: error.message,
      data: []
    };
  }
};

/**
 * ดึงข้อมูลสินค้าตาม ID
 * @param {string} id รหัสสินค้า
 * @returns {Promise<Object>} ข้อมูลสินค้า
 */
const getProductById = async (id) => {
  try {
    const product = await mockData.getProductById(id);
    return {
      status: 'success',
      data: product
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    return {
      status: 'error',
      message: error.message,
      data: null
    };
  }
};

/**
 * ดึงข้อมูลประเภทสัตว์ทั้งหมด
 * @returns {Promise<Object>} ประเภทสัตว์ทั้งหมด
 */
const getAnimalTypes = async () => {
  return {
    status: 'success',
    data: mockData.animalTypes
  };
};

/**
 * ดึงข้อมูลหมวดหมู่ทั้งหมด
 * @returns {Promise<Object>} หมวดหมู่ทั้งหมด
 */
const getCategories = async () => {
  return {
    status: 'success',
    data: mockData.categories
  };
};

/**
 * ค้นหาสินค้า
 * @param {string} query คำค้นหา
 * @param {Object} filters ตัวกรอง (category, animalType, price)
 * @returns {Promise<Object>} ผลลัพธ์การค้นหา
 */
const searchProducts = async (query, filters = {}) => {
  try {
    const results = await mockData.searchProducts(query, filters);
    return {
      status: 'success',
      data: results
    };
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return {
      status: 'error',
      message: error.message,
      data: []
    };
  }
};

/**
 * ดึงข้อมูลสินค้าที่ถูกใจ (favorites)
 * @returns {Promise<Object>} สินค้าที่ถูกใจ
 */
const getFavoriteProducts = async () => {
  try {
    const favorites = await mockData.getFavoriteProducts();
    return {
      status: 'success',
      data: favorites
    };
  } catch (error) {
    console.error('Error in getFavoriteProducts:', error);
    return {
      status: 'error',
      message: error.message,
      data: []
    };
  }
};

/**
 * เพิ่ม/ลบ สินค้าที่ถูกใจ
 * @param {string} productId รหัสสินค้า
 * @returns {Promise<Object>} ผลลัพธ์การดำเนินการ
 */
const toggleFavorite = async (productId) => {
  try {
    const result = await mockData.toggleFavorite(productId);
    if (result.success) {
      return {
        status: 'success',
        data: result.product
      };
    } else {
      return {
        status: 'error',
        message: result.message,
        data: null
      };
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    return {
      status: 'error',
      message: error.message,
      data: null
    };
  }
};

// ส่งออกฟังก์ชันทั้งหมด
export default {
  getProducts,
  getProductsByCategory,
  getProductById,
  getAnimalTypes,
  getCategories,
  searchProducts,
  getFavoriteProducts,
  toggleFavorite
};