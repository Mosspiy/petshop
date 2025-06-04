import axios from 'axios';
import authService from './authService';

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

const orderService = {
  // สร้างคำสั่งซื้อใหม่
  async createOrder(orderData) {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // เตรียมข้อมูลสำหรับส่งไป API
      const createOrderDto = {
        userId: userProfile.id,
        items: orderData.items,
        status: 'Pending',
        addressId: orderData.addressId,
        totalPrice: orderData.totalPrice,
        totalQuantity: orderData.totalQuantity,
        orderDate: new Date(),
        discount: orderData.discount || 0,
        shipping: orderData.shipping || 20
      };
      
      const response = await apiClient.post('/orders', createOrderDto);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // ดึงคำสั่งซื้อทั้งหมดของผู้ใช้
  async getUserOrders() {
    try {
      const userProfile = await authService.getUserProfile();
      
      if (!userProfile || !userProfile.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // ดึงข้อมูลออเดอร์จาก API โดยตรง
      const response = await apiClient.get(`/orders/user/${userProfile.id}`);
      
      // ตรวจสอบและ log ข้อมูลที่ได้รับ
      console.log('Orders data from API:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }
      
      // แปลงข้อมูลออเดอร์ให้พร้อมใช้งานใน frontend
      const formattedOrders = response.data.map(order => ({
        id: order._id,
        orderCode: order.orderCode || `ORD${order._id.substring(0, 5)}`, // ใช้ orderCode ถ้ามี หรือสร้างรหัสชั่วคราว
        customer: order.customer || 'ไม่ระบุชื่อ',
        phone: order.phone || '-',
        status: order.status || 'Pending',
        trackingNumber: order.trackingNumber || '-',
        total: order.totalPrice || 0,
        items: Array.isArray(order.items) ? order.items : [],
        customerAddress: order.address || '-',
        updatedAt: new Date(order.updatedAt || Date.now()).toLocaleString('th-TH'),
        createdAt: new Date(order.createdAt || Date.now()).toLocaleString('th-TH')
      }));
      
      console.log('Formatted orders:', formattedOrders);
      
      return formattedOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
  
  // ดึงคำสั่งซื้อตาม ID
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      
      // ตรวจสอบและ log ข้อมูลที่ได้รับ
      console.log(`Order ${orderId} data:`, response.data);
      
      const order = response.data;
      
      // แปลงข้อมูลให้พร้อมใช้งาน
      return {
        id: order._id,
        orderCode: order.orderCode || `ORD${order._id.substring(0, 5)}`, // ใช้ orderCode ถ้ามี
        customer: order.customer || 'ไม่ระบุชื่อ',
        phone: order.phone || '-',
        status: order.status || 'Pending',
        trackingNumber: order.trackingNumber || '-',
        total: order.totalPrice || 0,
        items: Array.isArray(order.items) ? order.items : [],
        customerAddress: order.address || '-',
        updatedAt: new Date(order.updatedAt || Date.now()).toLocaleString('th-TH'),
        createdAt: new Date(order.createdAt || Date.now()).toLocaleString('th-TH')
      };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  // อัปเดตสถานะคำสั่งซื้อ
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },
  
  // อัปเดตสถานะและเลขติดตามพัสดุของคำสั่งซื้อ
  async updateOrderWithTracking(orderId, updateData) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }
};

export default orderService;