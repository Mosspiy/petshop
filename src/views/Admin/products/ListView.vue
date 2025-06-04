<script setup>
import { ref, computed, onMounted } from 'vue'
import adminView from '../adminView.vue'
import { admin } from '@/services/admin'
import ProductFilter from '@/components/Admin/Product/ProductFilter.vue'
import ProductTable from '@/components/Admin/Product/ProductTable.vue'
import ProductForm from '@/components/Admin/Product/ProductForm.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// ค่า API URL
const apiUrl = import.meta.env.VITE_API_URL || 'https://petshop-api-6gix.onrender.com'
console.log('API URL for images:', apiUrl)

// อ้างอิงถึง Component
const toast = ref(null)
const confirmDialog = ref(null)

// สถานะการทำงาน
const isLoading = ref(false)
const errorMessage = ref('')

// หมวดหมู่สินค้าและชนิดของสัตว์
const categories = ref(["อาหารสัตว์", "ของเล่นสัตว์", "กรง ที่นอน", "ทรายแมว", "อาบน้ำ ดูแลขน"])
const animalTypes = ref(['สุนัข', 'แมว', 'นก', 'ปลา', 'กระต่าย']);

// ตัวแปรสำหรับป้อนหมวดหมู่และชนิดสัตว์ใหม่
const newCategory = ref('');
const newAnimalType = ref('');

// ข้อมูลสินค้า
const products = ref([])

// การควบคุมโมดอล
const isModalOpen = ref(false)
const selectedProduct = ref(null)

// โมดอลสำหรับจัดการหมวดหมู่และชนิดสัตว์
const isCategoryModalOpen = ref(false);
const isAnimalTypeModalOpen = ref(false);

const filterSettings = ref({
  search: '',
  category: 'all',
  animalType: 'all',
  status: 'all'
});
// สถานะการค้นหาและกรอง
const filteredProducts = ref([]);
const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('name')
const sortDirection = ref('asc')
const handleFilter = (filter) => {
  filterSettings.value = { ...filter };
  applyFiltersAndSort();
};
// ฟังก์ชันสำหรับดึงข้อมูลสินค้าทั้งหมด
const fetchProducts = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await admin.productService.getAll()
    
    products.value = response.map(product => ({
      ...product,
      images: product.imageUrl 
        ? [`${apiUrl}/uploads/${product.imageUrl}`] 
        : [],
      updatedAt: new Date(product.updateAt || new Date()).toLocaleString(),
      status: product.status ? 'Active' : 'Inactive'
    }))
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching products:', error)
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลสินค้าได้ โปรดลองอีกครั้ง'
    
    // แสดง toast แจ้งเตือนข้อผิดพลาด
    toast.value.useToast().error('ไม่สามารถโหลดข้อมูลสินค้าได้ โปรดลองอีกครั้งภายหลัง')
  }
}

// ดึงข้อมูลชนิดของสัตว์ทั้งหมด
const fetchAnimalTypes = async () => {
  try {
    const types = await admin.productService.getAllAnimalTypes();
    if (types && types.length > 0) {
      animalTypes.value = types;
    }
    // ถ้าไม่ได้ข้อมูลจะใช้ค่าเริ่มต้นที่กำหนดไว้
  } catch (error) {
    console.error('Error loading animal types:', error);
  }
};

// เปิดโมดอลสำหรับเพิ่มสินค้าใหม่
const openAddProductModal = () => {
  selectedProduct.value = null
  isModalOpen.value = true
}

// การปิดโมดอล
const closeModal = () => {
  isModalOpen.value = false
  selectedProduct.value = null
}

// เปิดโมดอลจัดการหมวดหมู่
const openCategoryManager = () => {
  isCategoryModalOpen.value = true;
  newCategory.value = '';
}

// เปิดโมดอลจัดการชนิดสัตว์
const openAnimalTypeManager = () => {
  isAnimalTypeModalOpen.value = true;
  newAnimalType.value = '';
}

// สลับสถานะสินค้า
const toggleStatus = async (product) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData = {
      name: product.name,
      description: product.description,
      about: product.about || '',
      category: product.category,
      animalType: product.animalType || '',
      options: product.options,
      status: product.status === 'Active' ? false : true // สลับสถานะ
    }

    // เรียก API เพื่ออัปเดตสถานะ
    await admin.productService.update(product._id, updateData)
    
    // อัปเดตข้อมูลในหน้าจอ
    const index = products.value.findIndex(p => p._id === product._id)
    if (index !== -1) {
      products.value[index].status = product.status === 'Active' ? 'Inactive' : 'Active'
      
      // แสดง toast แจ้งเตือนสำเร็จ
      const newStatus = products.value[index].status === 'Active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'
      toast.value.useToast().success(`${newStatus}สินค้า "${product.name}" เรียบร้อย`)
    }
  } catch (error) {
    console.error('Error toggling product status:', error)
    errorMessage.value = 'ไม่สามารถเปลี่ยนสถานะสินค้าได้ โปรดลองอีกครั้ง'
    
    // แสดง toast แจ้งเตือนข้อผิดพลาด
    toast.value.useToast().error('ไม่สามารถเปลี่ยนสถานะสินค้าได้ โปรดลองอีกครั้ง')
  } finally {
    isLoading.value = false
  }
}

// แก้ไขสินค้าที่มีอยู่
const editProduct = async (product) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // ดึงข้อมูลสินค้าจาก API
    const productToEdit = await admin.productService.getById(product._id)
    
    // กำหนดค่าให้ selectedProduct
    selectedProduct.value = {
      _id: productToEdit._id,
      name: productToEdit.name,
      description: productToEdit.description,
      about: productToEdit.about || '',
      category: productToEdit.category,
      animalType: productToEdit.animalType || '',
      options: productToEdit.options || [],
      status: productToEdit.status ? 'Active' : 'Inactive',
      images: productToEdit.imageUrl ? [`${apiUrl}/uploads/${productToEdit.imageUrl}`] : []
    }
    
    // เปิดโมดอล
    isModalOpen.value = true
  } catch (error) {
    console.error('Error fetching product details:', error)
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลสินค้าเพื่อแก้ไขได้ โปรดลองอีกครั้ง'
    
    // แสดง toast แจ้งเตือนข้อผิดพลาด
    toast.value.useToast().error('ไม่สามารถโหลดข้อมูลสินค้าเพื่อแก้ไข โปรดลองอีกครั้ง')
  } finally {
    isLoading.value = false
  }
}

// การเพิ่มชนิดของสัตว์ใหม่
const addAnimalType = (newType) => {
  if (newType && !animalTypes.value.includes(newType)) {
    animalTypes.value.push(newType)
    
    // แสดง toast แจ้งเตือนสำเร็จ
    toast.value.useToast().success(`เพิ่มชนิดของสัตว์ "${newType}" เรียบร้อยแล้ว`)
    
    // ถ้าเปิดจากโมดอลจัดการ ก็ล้างค่าอินพุต
    if (isAnimalTypeModalOpen.value) {
      newAnimalType.value = '';
    }
  } else if (animalTypes.value.includes(newType)) {
    toast.value.useToast().warning(`ชนิดของสัตว์ "${newType}" มีอยู่แล้ว`);
  }
}

// ลบชนิดของสัตว์
const removeAnimalType = async (typeToRemove) => {
  try {
    // เปิดกล่องยืนยันการลบ
    const confirmed = await confirmDialog.value.open({
      title: 'ยืนยันการลบชนิดของสัตว์',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบชนิดของสัตว์ "${typeToRemove}"? การลบจะมีผลกับสินค้าที่ใช้ชนิดของสัตว์นี้`,
      type: 'warning',
      confirm: 'ลบชนิดของสัตว์',
      cancel: 'ยกเลิก'
    })
    
    if (confirmed) {
      // ตรวจสอบว่ามีสินค้าที่ใช้ชนิดของสัตว์นี้หรือไม่
      const productsUsingType = products.value.filter(p => p.animalType === typeToRemove);
      
      if (productsUsingType.length > 0) {
        // ถ้ามี แสดงข้อความเตือน
        toast.value.useToast().warning(`มีสินค้า ${productsUsingType.length} รายการที่ใช้ชนิดของสัตว์นี้ โปรดเปลี่ยนชนิดของสัตว์ของสินค้าเหล่านั้นก่อน`);
      } else {
        // ถ้าไม่มี ลบออกจากรายการ
        animalTypes.value = animalTypes.value.filter(type => type !== typeToRemove);
        toast.value.useToast().success(`ลบชนิดของสัตว์ "${typeToRemove}" เรียบร้อยแล้ว`);
      }
    }
  } catch (error) {
    console.error('Error removing animal type:', error);
    toast.value.useToast().error('เกิดข้อผิดพลาดในการลบชนิดของสัตว์');
  }
}

// ลบสินค้า
const deleteProduct = async (product) => {
  try {
    // เปิดกล่องยืนยันการลบ
    const confirmed = await confirmDialog.value.open({
      title: 'ยืนยันการลบสินค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${product.name}"?`,
      type: 'danger',
      confirm: 'ลบสินค้า',
      cancel: 'ยกเลิก'
    })
    
    // ดำเนินการเมื่อกดยืนยัน
    if (confirmed) {
      isLoading.value = true
      errorMessage.value = ''
      
      // เรียก API เพื่อลบสินค้า
      const response = await fetch(`${apiUrl}/admin/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'ไม่สามารถลบสินค้าได้')
      }
      
      // ลบสินค้าออกจากรายการในหน้าจอ
      products.value = products.value.filter(p => p._id !== product._id)
      
      // แสดง toast แจ้งเตือนสำเร็จ
      toast.value.useToast().success(`ลบสินค้า "${product.name}" เรียบร้อยแล้ว`)
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    errorMessage.value = error.message || 'ไม่สามารถลบสินค้าได้ โปรดลองอีกครั้ง'
    
    // แสดง toast แจ้งเตือนข้อผิดพลาด
    toast.value.useToast().error('ไม่สามารถลบสินค้าได้ โปรดลองอีกครั้ง')
  } finally {
    isLoading.value = false
  }
}

// การเพิ่มหมวดหมู่ใหม่
const addCategory = (newCat) => {
  if (newCat && !categories.value.includes(newCat)) {
    categories.value.push(newCat)
    
    // แสดง toast แจ้งเตือนสำเร็จ
    toast.value.useToast().success(`เพิ่มหมวดหมู่ "${newCat}" เรียบร้อยแล้ว`)
    
    // ถ้าเปิดจากโมดอลจัดการ ก็ล้างค่าอินพุต
    if (isCategoryModalOpen.value) {
      newCategory.value = '';
    }
  } else if (categories.value.includes(newCat)) {
    toast.value.useToast().warning(`หมวดหมู่ "${newCat}" มีอยู่แล้ว`);
  }
}

// ลบหมวดหมู่
const removeCategory = async (categoryToRemove) => {
  try {
    // เปิดกล่องยืนยันการลบ
    const confirmed = await confirmDialog.value.open({
      title: 'ยืนยันการลบหมวดหมู่',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categoryToRemove}"? การลบจะมีผลกับสินค้าที่อยู่ในหมวดหมู่นี้`,
      type: 'warning',
      confirm: 'ลบหมวดหมู่',
      cancel: 'ยกเลิก'
    })
    
    if (confirmed) {
      // ตรวจสอบว่ามีสินค้าในหมวดหมู่นี้หรือไม่
      const productsInCategory = products.value.filter(p => p.category === categoryToRemove);
      
      if (productsInCategory.length > 0) {
        // ถ้ามี แสดงข้อความเตือน
        toast.value.useToast().warning(`มีสินค้า ${productsInCategory.length} รายการในหมวดหมู่นี้ โปรดย้ายสินค้าไปหมวดหมู่อื่นก่อน`);
      } else {
        // ถ้าไม่มี ลบออกจากรายการ
        categories.value = categories.value.filter(cat => cat !== categoryToRemove);
        toast.value.useToast().success(`ลบหมวดหมู่ "${categoryToRemove}" เรียบร้อยแล้ว`);
      }
    }
  } catch (error) {
    console.error('Error removing category:', error);
    toast.value.useToast().error('เกิดข้อผิดพลาดในการลบหมวดหมู่');
  }
}

// อัปเดตการเรียงลำดับ
const updateSort = ({ sortBy: newSortBy, sortDirection: newSortDirection }) => {
  sortBy.value = newSortBy
  sortDirection.value = newSortDirection
}

// การใช้ตัวกรอง
const applyFiltersAndSort = () => {
  // ประมวลผลการกรอง
  filteredProducts.value = products.value.filter(product => {
    // กรองตามคำค้นหา
    if (filterSettings.value.search && !product.name.toLowerCase().includes(filterSettings.value.search.toLowerCase())) {
      return false;
    }
    
    // กรองตามหมวดหมู่
    if (filterSettings.value.category !== 'all' && product.category !== filterSettings.value.category) {
      return false;
    }
    
    // กรองตามชนิดของสัตว์
    if (filterSettings.value.animalType !== 'all' && product.animalType !== filterSettings.value.animalType) {
      return false;
    }
    
    // กรองตามสถานะ
    if (filterSettings.value.status !== 'all' && product.status !== filterSettings.value.status) {
      return false;
    }
    
    return true;
  });
};

// รีเซ็ตตัวกรอง
const resetFilters = () => {
  filterSettings.value = {
    search: '',
    category: 'all',
    animalType: 'all',
    status: 'all'
  };
  searchQuery.value = '';
  categoryFilter.value = 'all';
  statusFilter.value = 'all';
  sortBy.value = 'name';
  sortDirection.value = 'asc';
}

// จัดการการส่งฟอร์ม
const handleProductSubmit = async ({ productId, productData, imageFile }) => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
    const formData = new FormData()
    
    // เพิ่มข้อมูลสินค้า
    formData.append('name', productData.name)
    formData.append('description', productData.description)
    formData.append('about', productData.about)
    formData.append('category', productData.category)
    formData.append('animalType', productData.animalType || '')
    formData.append('status', String(productData.status))
    formData.append('updateAt', productData.updateAt)
    
    // แปลง options เป็น JSON string
    formData.set('options', JSON.stringify(productData.options))

    // เพิ่มรูปภาพ (ถ้ามี)
    if (imageFile) {
      formData.append('imageUrl', imageFile)
    }
    
    let result
    
    // แยกตามกรณี: เพิ่มสินค้าใหม่ หรือ แก้ไขสินค้า
    if (productId) {
      // กรณีแก้ไขสินค้า
      result = await fetch(`${apiUrl}/admin/products/${productId}`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } else {
      // กรณีเพิ่มสินค้าใหม่
      result = await fetch(`${apiUrl}/admin/products`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    }
    
    // ตรวจสอบผลลัพธ์
    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า')
    }
    
    // รีเฟรชรายการสินค้า
    await fetchProducts()
    
    // แสดง toast แจ้งเตือนสำเร็จ
    if (productId) {
      toast.value.useToast().success(`อัปเดตสินค้า "${productData.name}" เรียบร้อยแล้ว`)
    } else {
      toast.value.useToast().success(`เพิ่มสินค้า "${productData.name}" เรียบร้อยแล้ว`)
    }
    
    // ปิดโมดอล
    closeModal()
  } catch (error) {
    console.error('Error saving product:', error)
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า'
    
    // แสดง toast แจ้งเตือนข้อผิดพลาด
    toast.value.useToast().error(error.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า โปรดลองอีกครั้ง')
  } finally {
    isLoading.value = false
  }
}

// กรองและเรียงลำดับสินค้า
const filteredAndSortedProducts = computed(() => {
  let result = [...products.value]
  
  // กรองตามการค้นหา
  if (filterSettings.value.search) {
    const query = filterSettings.value.search.toLowerCase()
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query) ||
      (product.about && product.about.toLowerCase().includes(query))
    )
  }
  
  // กรองตามหมวดหมู่
  if (filterSettings.value.category !== 'all') {
    result = result.filter(product => product.category === filterSettings.value.category)
  }
  
  // กรองตามชนิดของสัตว์
  if (filterSettings.value.animalType !== 'all') {
    result = result.filter(product => product.animalType === filterSettings.value.animalType)
  }
  
  // กรองตามสถานะ
  if (filterSettings.value.status !== 'all') {
    result = result.filter(product => product.status === filterSettings.value.status)
  }
  
  // เรียงลำดับ
  result.sort((a, b) => {
    let valA, valB
    
    if (sortBy.value === 'price') {
      // ถ้าไม่มี options จะให้ราคาเป็น 0
      const pricesA = a.options && a.options.length > 0 ? a.options.map(option => option.price) : [0]
      const pricesB = b.options && b.options.length > 0 ? b.options.map(option => option.price) : [0]
      valA = Math.min(...pricesA)
      valB = Math.min(...pricesB)
    } else if (sortBy.value === 'stock') {
      valA = a.options ? a.options.reduce((total, option) => total + option.stock, 0) : 0
      valB = b.options ? b.options.reduce((total, option) => total + option.stock, 0) : 0
    } else if (sortBy.value === 'updatedAt') {
      valA = new Date(a.updateAt || a.createdAt).getTime()
      valB = new Date(b.updateAt || b.createdAt).getTime()
    } else {
      valA = a[sortBy.value]
      valB = b[sortBy.value]
    }
    
    // การเรียงลำดับข้อความ
    if (typeof valA === 'string' && typeof valB === 'string') {
      if (sortDirection.value === 'asc') {
        return valA.localeCompare(valB)
      } else {
        return valB.localeCompare(valA)
      }
    }
    
    // การเรียงลำดับตัวเลข
    if (sortDirection.value === 'asc') {
      return valA - valB
    } else {
      return valB - valA
    }
  })
  
  return result
})

onMounted(() => {
  console.log('ListView component mounted');
  fetchProducts();
  fetchAnimalTypes();
});
</script>
<template>
  <div class="flex max-h-full">
    <adminView />
    <div class="flex-1 mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8">Product Management</h1>
      
      <!-- ส่วนการค้นหาและกรอง -->
      <ProductFilter 
        :categories="categories" 
        :animalTypes="animalTypes"
        :filtered-count="filteredAndSortedProducts.length"
        @filter="handleFilter"
        @reset="resetFilters"
      />
      
      <!-- ปุ่มเพิ่มสินค้าและจัดการหมวดหมู่ -->
      <div class="flex justify-between mb-4">
        <div class="flex gap-2">
          <button @click="openCategoryManager" class="btn btn-outline">
            <i class="fa-solid fa-tag mr-1"></i> จัดการหมวดหมู่
          </button>
          <button @click="openAnimalTypeManager" class="btn btn-outline">
            <i class="fa-solid fa-paw mr-1"></i> จัดการชนิดของสัตว์
          </button>
        </div>
        <button @click="openAddProductModal" class="btn bg-[#2b7deb] text-white">
          <i class="fa-solid fa-plus mr-2"></i> เพิ่มสินค้า
        </button>
      </div>

      <!-- ข้อความแสดงข้อผิดพลาด -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <i class="fa-solid fa-circle-exclamation mr-2"></i>
        {{ errorMessage }}
      </div>

      <!-- แสดงสถานะกำลังโหลด -->
      <div v-if="isLoading" class="flex justify-center my-10">
        <div class="loading loading-spinner loading-lg"></div>
      </div>

      <!-- ตารางแสดงสินค้า -->
      <ProductTable 
        v-else
        :products="filteredAndSortedProducts"
        @edit="editProduct"
        @delete="deleteProduct"
        @toggle-status="toggleStatus"
        @sort="updateSort"
      />

      <!-- โมดอลฟอร์มเพิ่ม/แก้ไขสินค้า -->
      <ProductForm
        :is-visible="isModalOpen"
        :product="selectedProduct"
        :categories="categories"
        :animalTypes="animalTypes"
        :api-url="apiUrl"
        @close="closeModal"
        @submit="handleProductSubmit"
        @add-category="addCategory"
        @add-animal-type="addAnimalType"
      />
      
      <!-- โมดอลจัดการหมวดหมู่ -->
      <div v-if="isCategoryModalOpen" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">จัดการหมวดหมู่สินค้า</h2>
          
          <!-- ฟอร์มเพิ่มหมวดหมู่ใหม่ -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">เพิ่มหมวดหมู่ใหม่</h3>
            <div class="flex gap-2">
              <input 
                v-model="newCategory" 
                type="text" 
                class="input input-bordered flex-1" 
                placeholder="ชื่อหมวดหมู่ใหม่"
              />
              <button 
                @click="addCategory(newCategory)" 
                class="btn bg-[#2b7deb] text-white" 
                :disabled="!newCategory.trim()">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
          
          <!-- รายการหมวดหมู่ -->
          <div>
            <h3 class="text-lg font-semibold mb-2">รายการหมวดหมู่ทั้งหมด</h3>
            <div class="max-h-60 overflow-y-auto p-2 border rounded">
              <ul class="space-y-2">
                <li v-for="category in categories" :key="category" class="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                  <span>{{ category }}</span>
                  <button @click="removeCategory(category)" class="btn btn-sm btn-error" v-if="category !== 'ทั้งหมด'">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </li>
                <li v-if="categories.length === 0" class="text-gray-500 text-center py-4">
                  ไม่มีหมวดหมู่
                </li>
              </ul>
            </div>
          </div>
          
          <!-- ปุ่มปิด -->
          <div class="flex justify-end mt-6">
            <button @click="isCategoryModalOpen = false" class="btn">ปิด</button>
          </div>
        </div>
      </div>
      
      <!-- โมดอลจัดการชนิดของสัตว์ -->
      <div v-if="isAnimalTypeModalOpen" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">จัดการชนิดของสัตว์</h2>
          
          <!-- ฟอร์มเพิ่มชนิดของสัตว์ใหม่ -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">เพิ่มชนิดของสัตว์ใหม่</h3>
            <div class="flex gap-2">
              <input 
                v-model="newAnimalType" 
                type="text" 
                class="input input-bordered flex-1" 
                placeholder="ชื่อชนิดของสัตว์ใหม่"
              />
              <button 
                @click="addAnimalType(newAnimalType)" 
                class="btn bg-[#2b7deb] text-white" 
                :disabled="!newAnimalType.trim()">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
          
          <!-- รายการชนิดของสัตว์ -->
          <div>
            <h3 class="text-lg font-semibold mb-2">รายการชนิดของสัตว์ทั้งหมด</h3>
            <div class="max-h-60 overflow-y-auto p-2 border rounded">
              <ul class="space-y-2">
                <li v-for="type in animalTypes" :key="type" class="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                  <span>{{ type }}</span>
                  <button @click="removeAnimalType(type)" class="btn btn-sm btn-error">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </li>
                <li v-if="animalTypes.length === 0" class="text-gray-500 text-center py-4">
                  ไม่มีชนิดของสัตว์
                </li>
              </ul>
            </div>
          </div>
          
          <!-- ปุ่มปิด -->
          <div class="flex justify-end mt-6">
            <button @click="isAnimalTypeModalOpen = false" class="btn">ปิด</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ระบบแจ้งเตือนแบบ Toast -->
    <ToastNotification ref="toast" />
    
    <!-- กล่องโต้ตอบยืนยันการดำเนินการ -->
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>