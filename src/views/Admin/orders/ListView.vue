<script setup>
import { ref, computed, onMounted } from 'vue';
import adminView from '@/views/Admin/adminView.vue';
import OrderTable from '@/components/Admin/Order/OrderTable.vue';
import OrderDetailModal from '@/components/Admin/Order/OrderDetailModal.vue';
import OrderStats from '@/components/Admin/Order/OrderStats.vue';
import OrderFilter from '@/components/Admin/Order/OrderFilter.vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com';

// สร้าง axios instance สำหรับเรียก API
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ข้อมูลออเดอร์
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// States for filtering and sorting
const searchQuery = ref('');
const statusFilter = ref('all');
const dateRange = ref({ start: '', end: '' });
const sortBy = ref('updatedAt');
const sortDirection = ref('desc');

// Modal state
const isDetailModalOpen = ref(false);
const selectedOrder = ref(null);

// ดึงข้อมูลออเดอร์ทั้งหมดจาก API
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await apiClient.get('/orders');
    
    // แปลงข้อมูลจาก API ให้อยู่ในรูปแบบที่ต้องการ
    const formattedOrders = response.data.map(order => formatOrderData(order));
    orders.value = formattedOrders;
    
    console.log('Orders data:', orders.value);
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = 'ไม่สามารถโหลดข้อมูลออเดอร์ได้';
  } finally {
    isLoading.value = false;
  }
};

// แปลงข้อมูลออเดอร์จาก API ให้อยู่ในรูปแบบที่ต้องการแสดงผล
const formatOrderData = (order) => {
  console.log('Raw order data:', order); // ดูข้อมูลที่ได้รับจาก API
  
  // ดึงข้อมูลที่อยู่
  const addressInfo = order.addressId || {};
  
  // แปลงข้อมูลรายการสินค้า
  const formattedItems = order.items.map(item => {
    const product = item.productId || {};
    
    // หาตัวเลือกที่ตรงกับ size
    const option = product.options ? 
      product.options.find(opt => opt.size === item.size) : 
      null;
    
    return {
      name: product.name || 'สินค้า',
      option: `Size: ${item.size}`,
      quantity: item.quantity,
      price: option ? option.price : 0,
      image: product.imageUrl ? `${apiUrl}/uploads/${product.imageUrl}` : 'https://via.placeholder.com/80'
    };
  });
  
  // คำนวณยอดรวมสินค้า (subtotal)
  const subtotal = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // คำนวณหรือดึงค่าส่ง (shipping) จาก API
  const shipping = order.shipping || 20; // ถ้า API ไม่ส่งค่า shipping มา กำหนดค่าเริ่มต้นเป็น 20 บาท
  
  // คำนวณหรือดึงส่วนลด (discount) จาก API
  const discount = typeof order.discount === 'string' 
  ? parseFloat(order.discount) || 0 
  : (order.discount || 0);
  
  // คำนวณยอดสุทธิหลังหักส่วนลด
  const finalTotal = subtotal + shipping - discount;
  
  // สร้าง object ในรูปแบบที่ต้องการ
  return {
    id: order._id || 'ORD000',
    orderCode: order.orderCode || order._id, // ใช้ orderCode ถ้ามี
    customer: `${addressInfo.name || ''} ${addressInfo.lastname || ''}`.trim() || 'ไม่ระบุชื่อ',
    phone: addressInfo.phone || 'ไม่ระบุเบอร์',
    customerAddress: `${addressInfo.address || ''}, ${addressInfo.district || ''}, ${addressInfo.province || ''} ${addressInfo.zipCode || ''}`.trim() || 'ไม่ระบุที่อยู่',
    items: formattedItems,
    subtotal: subtotal,
    shipping: shipping,
    discount: discount,
    total: order.totalPrice || finalTotal, // ใช้ค่าจาก API หรือคำนวณยอดสุทธิเอง
    status: order.status || 'Pending',
    trackingNumber: order.trackingNumber || '',
    updatedAt: new Date(order.updatedAt || order.orderDate).toLocaleString() || new Date().toLocaleString()
  };
};

// Computed: Filtered and Sorted Orders
const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(order => 
      order.id.toLowerCase().includes(query) || 
      order.customer.toLowerCase().includes(query) ||
      order.phone.includes(query)
    );
  }
  
  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter(order => order.status === statusFilter.value);
  }
  
  // Filter by date range
  if (dateRange.value.start && dateRange.value.end) {
    const startDate = new Date(dateRange.value.start);
    const endDate = new Date(dateRange.value.end);
    endDate.setHours(23, 59, 59);
    
    result = result.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  // Sort orders
  result.sort((a, b) => {
    let valA = a[sortBy.value];
    let valB = b[sortBy.value];
    
    // Handle date sorting
    if (sortBy.value === 'updatedAt') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    
    // Handle total sorting
    if (sortBy.value === 'total') {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    }
    
    if (sortDirection.value === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });
  
  return result;
});

// Order Stats
const orderStats = computed(() => {
  return {
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'Pending').length,
    processing: orders.value.filter(o => o.status === 'Processing').length,
    shipped: orders.value.filter(o => o.status === 'Shipped').length,
    completed: orders.value.filter(o => o.status === 'Completed').length,
    cancelled: orders.value.filter(o => o.status === 'Cancelled').length,
    revenue: orders.value
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.total, 0)
      .toFixed(2)
  };
});

// Event Handlers
const openDetailModal = (order) => {
  selectedOrder.value = { ...order };
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
};

// อัปเดตสถานะออเดอร์
const updateOrder = async (updatedOrder) => {
  try {
    // อัปเดตสถานะและเลขติดตามพัสดุผ่าน API
    await apiClient.patch(`/orders/${updatedOrder.id}`, { 
      status: updatedOrder.status,
      trackingNumber: updatedOrder.trackingNumber || ''
    });
    
    // อัปเดตข้อมูลในหน้าจอ
    const index = orders.value.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      orders.value[index] = {
        ...updatedOrder,
        updatedAt: new Date().toLocaleString()
      };
    }
    
    closeDetailModal();
  } catch (error) {
    console.error('Error updating order:', error);
    alert('ไม่สามารถอัปเดตออเดอร์ได้');
  }
};

const updateOrderDiscount = async (orderId, discountAmount) => {
  try {
    console.log(`Updating discount for order ${orderId} to ${discountAmount}`);
    const response = await apiClient.patch(`/orders/${orderId}`, { 
      discount: discountAmount 
    });
    console.log('Order updated successfully:', response.data);
    
    // โหลดข้อมูลออเดอร์ใหม่เพื่อแสดงผลที่อัปเดตแล้ว
    await fetchOrders();
    
    return true;
  } catch (error) {
    console.error('Error updating order discount:', error);
    return false;
  }
};

const printReceipt = (orderId) => {
  const order = orders.value.find(o => o.id === orderId);
  if (!order) return;

  // คำนวณ subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Template ใบเสร็จแบบใหม่
  const receipt = document.createElement('div');
  receipt.innerHTML = `
    <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333;">
      <!-- ส่วนหัว -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #44842d; padding-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #44842d; font-size: 28px;">BPM PET SHOP</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">สินค้าคุณภาพสำหรับสัตว์เลี้ยงที่คุณรัก</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #44842d;">ใบเสร็จรับเงิน</h2>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <!-- ข้อมูลคำสั่งซื้อ -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 10px; color: #0c3a5b; border-bottom: 1px solid #eee; padding-bottom: 5px;">ข้อมูลลูกค้า</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>ชื่อ:</strong> ${order.customer}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>เบอร์โทร:</strong> ${order.phone}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>ที่อยู่:</strong> ${order.customerAddress}</p>
        </div>
        <div style="flex: 1; text-align: right;">
          <h3 style="margin: 0 0 10px; color: #0c3a5b; border-bottom: 1px solid #eee; padding-bottom: 5px;">ข้อมูลคำสั่งซื้อ</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>เลขที่ใบเสร็จ:</strong> ${order.orderCode || order.id}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>วันที่สั่งซื้อ:</strong> ${new Date(order.updatedAt).toLocaleDateString('th-TH')}</p>
          ${order.trackingNumber ? `<p style="margin: 5px 0; font-size: 14px;"><strong>เลขพัสดุ:</strong> ${order.trackingNumber}</p>` : ''}
        </div>
      </div>

      <!-- รายการสินค้า -->
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px; color: #0c3a5b; border-bottom: 2px solid #eee; padding-bottom: 5px;">รายการสินค้า</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #0c3a5b;">สินค้า</th>
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #0c3a5b;">ตัวเลือก</th>
              <th style="text-align: right; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #0c3a5b;">ราคา</th>
              <th style="text-align: center; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #0c3a5b;">จำนวน</th>
              <th style="text-align: right; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #0c3a5b;">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">${item.option}</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">฿${item.price.toFixed(2)}</td>
                <td style="text-align: center; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">${item.quantity}</td>
                <td style="text-align: right; padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">฿${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- สรุปยอดเงิน -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 300px; border: 1px solid #eee; border-radius: 5px; padding: 15px; background-color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 14px;">ยอดรวมสินค้า:</span>
            <span style="font-size: 14px; font-weight: 500;">฿${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 14px;">ค่าจัดส่ง:</span>
            <span style="font-size: 14px; font-weight: 500;">฿${(order.shipping || 20).toFixed(2)}</span>
          </div>
          ${order.discount && order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #ef4444;">
            <span style="font-size: 14px;">ส่วนลด:</span>
            <span style="font-size: 14px; font-weight: 500;">-฿${order.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px dashed #ddd; margin-top: 5px;">
            <span style="font-size: 16px; font-weight: bold; color: #0c3a5b;">ยอดรวมสุทธิ:</span>
            <span style="font-size: 16px; font-weight: bold; color: #44842d;">฿${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- ส่วนท้าย -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #44842d; font-weight: bold;">ขอบคุณที่ใช้บริการ BPM PET SHOP</p>
      </div>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>BPM PET SHOP - ใบเสร็จรับเงิน</title>');
  printWindow.document.write('<meta charset="UTF-8">');
  printWindow.document.write('</head><body>');
  printWindow.document.write(receipt.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  // ให้เวลาหน้าโหลดเสร็จก่อนพิมพ์
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

const exportOrders = (format) => {
  const dataToExport = orders.value.map(order => ({
    id: order.orderCode || order.id, // ใช้ orderCode แทน id
    customer: order.customer,
    phone: order.phone,
    address: order.customerAddress,
    items: order.items.map(item => `${item.name} (${item.option}) x${item.quantity}`).join('; '),
    total: order.total,
    status: order.status,
    tracking: order.trackingNumber,
    date: order.updatedAt
  }));
  
  if (format === 'csv') {
    const headers = ['ID', 'Customer', 'Phone', 'Address', 'Items', 'Total', 'Status', 'Tracking', 'Date'];
    const csv = [
      headers.join(','),
      ...dataToExport.map(order => [
        order.id,
        `"${order.customer}"`,
        order.phone,
        `"${order.address}"`,
        `"${order.items}"`,
        order.total,
        order.status,
        order.tracking,
        `"${order.date}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  }
  
  if (format === 'json') {
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  }
};

const toggleSortDirection = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  dateRange.value = { start: '', end: '' };
  sortBy.value = 'updatedAt';
  sortDirection.value = 'desc';
};

// เรียกดึงข้อมูลเมื่อโหลดหน้า
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="flex max-h-full">
    <adminView />
    <div class="flex-1 mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8">Order Management</h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="loading loading-spinner loading-lg text-[#005a9a]"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16 px-4">
        <div class="flex flex-col items-center justify-center">
          <i class="fa-solid fa-circle-exclamation text-4xl mb-2 text-red-500"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาด</h3>
          <p class="text-gray-500 max-w-md">{{ error }}</p>
          <button @click="fetchOrders" class="btn btn-primary mt-4">
            <i class="fa-solid fa-refresh mr-2"></i> ลองใหม่
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-16 px-4">
        <div class="flex flex-col items-center justify-center">
          <i class="fa-solid fa-clipboard-list text-4xl mb-2 text-gray-400"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีออเดอร์</h3>
          <p class="text-gray-500 max-w-md">ยังไม่มีข้อมูลออเดอร์ในระบบ</p>
        </div>
      </div>
      
      <!-- Content (if data exists) -->
      <div v-else>
        <!-- Filter Component -->
        <OrderFilter 
          :total-orders="filteredOrders.length"
          @search="(query) => searchQuery = query"
          @filter="(filters) => {
            if (filters.status) statusFilter = filters.status
            if (filters.start) dateRange.start = filters.start
            if (filters.end) dateRange.end = filters.end
          }"
          @reset="resetFilters"
          @export="exportOrders"
        />

        <!-- Stats Component -->
        <OrderStats :stats="orderStats" />

        <!-- Table Component -->
        <OrderTable 
          :orders="filteredOrders"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          @open-detail-modal="openDetailModal"
          @print-receipt="printReceipt"
          @toggle-sort="toggleSortDirection"
        />

        <!-- Detail Modal Component -->
        <OrderDetailModal 
          v-if="selectedOrder"
          :order="selectedOrder"
          :is-open="isDetailModalOpen"
          @close="closeDetailModal"
          @update="updateOrder"
          @print-receipt="printReceipt"
        />
      </div>
    </div>
  </div>
</template>