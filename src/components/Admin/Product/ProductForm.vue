<!-- ProductForm.vue -->
<template>
    <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
      <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto relative my-8">
        <!-- ปุ่มปิดโมดอล -->
        <button @click="close()" class="absolute top-2 right-4 text-gray-600 hover:text-gray-900">
          <i class="fa-solid fa-xmark text-2xl"></i>
        </button>
  
        <h2 class="text-xl font-semibold mb-6">
          {{ editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}
        </h2>
  
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- การแสดงตัวอย่างและอัปโหลดรูปภาพ -->
          <div class="w-full lg:w-1/3">
            <ImageUploader 
              :images="form.images" 
              @upload-image="handleImageUpload" 
              @remove-image="removeImage" 
            />
          </div>
  
          <!-- ฟอร์มสินค้า -->
          <div class="w-full lg:w-2/3">
            <form @submit.prevent="submitProduct" class="overflow-y-auto max-h-[80vh] px-2">
              <!-- ชื่อสินค้า -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">ชื่อสินค้า</span></label>
                <input v-model="form.name" type="text" class="input input-bordered w-full" placeholder="กรอกชื่อสินค้า" required />
              </div>
  
              <!-- หมวดหมู่สินค้า -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">หมวดหมู่</span></label>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div class="md:col-span-6">
                    <select v-model="form.category" class="select select-bordered w-full" required>
                      <option value="" disabled>เลือกหมวดหมู่</option>
                      <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                      </option>
                    </select>
                  </div>
                  <div class="md:col-span-6">
                    <div class="flex gap-2">
                      <input 
                        v-model="newCategory" 
                        type="text" 
                        class="input input-bordered w-full" 
                        placeholder="เพิ่มหมวดหมู่ใหม่" 
                      />
                      <button 
                        type="button" 
                        @click="addCategory" 
                        class="btn bg-[#2b7deb] text-white" 
                        :disabled="!newCategory.trim()">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ชนิดของสัตว์ -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">ชนิดของสัตว์</span></label>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div class="md:col-span-6">
                    <select v-model="form.animalType" class="select select-bordered w-full">
                      <option value="" disabled>เลือกชนิดของสัตว์</option>
                      <option v-for="animal in animalTypes" :key="animal" :value="animal">
                        {{ animal }}
                      </option>
                    </select>
                  </div>
                  <div class="md:col-span-6">
                    <div class="flex gap-2">
                      <input 
                        v-model="newAnimalType" 
                        type="text" 
                        class="input input-bordered w-full" 
                        placeholder="เพิ่มชนิดของสัตว์ใหม่" 
                      />
                      <button 
                        type="button" 
                        @click="addAnimalType" 
                        class="btn bg-[#2b7deb] text-white" 
                        :disabled="!newAnimalType.trim()">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- คำอธิบายสินค้า -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">คำอธิบายสินค้า</span></label>
                <textarea v-model="form.description" class="textarea textarea-bordered w-full" placeholder="กรอกคำอธิบายสินค้า" required></textarea>
              </div>
  
              <!-- ข้อมูลเพิ่มเติม -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">ข้อมูลเพิ่มเติม</span></label>
                <textarea v-model="form.about" class="textarea textarea-bordered w-full" placeholder="กรอกข้อมูลเพิ่มเติม"></textarea>
              </div>
  
              <!-- ตัวเลือกสินค้า -->
              <ProductOptions v-model="productOptions" />
  
              <!-- สถานะสินค้า -->
              <div class="form-control mb-4">
                <label class="label"><span class="label-text">สถานะสินค้า</span></label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.status" value="Active" class="radio radio-success" />
                    <span>ใช้งาน</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.status" value="Inactive" class="radio radio-error" />
                    <span>ไม่ใช้งาน</span>
                  </label>
                </div>
              </div>
  
              <!-- ข้อความแสดงข้อผิดพลาด -->
              <div v-if="errorMessage" class="alert alert-error mb-4">
                <i class="fa-solid fa-circle-exclamation mr-2"></i>
                {{ errorMessage }}
              </div>
  
              <!-- ปุ่มส่งข้อมูล -->
              <div class="form-control mt-4">
                <button
                  type="submit"
                  :class="editing ? 'bg-green-500' : 'bg-[#2b7deb]'"
                  class="btn w-full text-white"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading">
                    <div class="loading loading-spinner loading-sm mr-2"></div> กำลังดำเนินการ...
                  </span>
                  <span v-else>
                    {{ editing ? 'อัปเดตสินค้า' : 'เพิ่มสินค้า' }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- ระบบแจ้งเตือนแบบ Toast -->
      <ToastNotification ref="toast" />
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import ImageUploader from '@/components/Admin/Product/ImageUploader.vue'
  import ProductOptions from '@/components/Admin/Product/ProductOptions.vue'
  import ToastNotification from '@/components/ToastNotification.vue'
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => null
    },
    categories: {
      type: Array,
      required: true
    },
    animalTypes: {
      type: Array,
      default: () => ['สุนัข', 'แมว', 'นก', 'ปลา', 'กระต่าย', 'หนู', 'สัตว์เลี้ยงลูกด้วยนม', 'สัตว์เลื้อยคลาน', 'อื่นๆ']
    },
    apiUrl: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['close', 'submit', 'add-category', 'add-animal-type'])
  
  // อ้างอิงถึง Toast Component
  const toast = ref(null)
  
  // สถานะการทำงาน
  const isLoading = ref(false)
  const errorMessage = ref('')
  const newCategory = ref('')
  const newAnimalType = ref('')
  
  // ข้อมูลฟอร์ม
  const form = ref({
    id: null,
    name: '',
    images: [],
    description: '',
    about: '',
    category: '',
    animalType: '',
    status: 'Active'
  })
  
  // ตัวเลือกสินค้า
  const productOptions = ref([{ size: '', price: 0, stock: 0 }])
  
  // ไฟล์รูปภาพ
  const imageFile = ref(null)
  
  // สถานะการแก้ไข
  const editing = computed(() => !!form.value.id)
  
  // เมื่อมีการเปลี่ยนแปลงข้อมูลสินค้า
  watch(() => props.product, (newProduct) => {
    if (newProduct) {
      form.value = {
        id: newProduct._id,
        name: newProduct.name,
        images: newProduct.images || [],
        description: newProduct.description || '',
        about: newProduct.about || '',
        category: newProduct.category || '',
        animalType: newProduct.animalType || '',
        status: newProduct.status || 'Active'
      }
      
      if (newProduct.options && newProduct.options.length > 0) {
        productOptions.value = newProduct.options.map(option => ({
          size: option.size,
          price: option.price,
          stock: option.stock
        }))
      } else {
        productOptions.value = [{ size: '', price: 0, stock: 0 }]
      }
    }
  }, { immediate: true, deep: true })
  
  // ปิดฟอร์ม
  const close = () => {
    resetForm()
    emit('close')
  }
  
  // รีเซ็ตฟอร์ม
  const resetForm = () => {
    form.value = {
      id: null,
      name: '',
      images: [],
      description: '',
      about: '',
      category: '',
      animalType: '',
      options: [],
      status: 'Active'
    }
    productOptions.value = [{ size: '', price: 0, stock: 0 }]
    imageFile.value = null
    errorMessage.value = ''
    newCategory.value = ''
    newAnimalType.value = ''
  }
  
  // การลบรูปภาพ
  const removeImage = (index) => {
    form.value.images.splice(index, 1)
    if (index === 0) {
      imageFile.value = null
    }
  }
  
  // การจัดการอัปโหลดรูปภาพ
  const handleImageUpload = ({ file, preview }) => {
    imageFile.value = file
    form.value.images = [preview]
    
    // แสดง toast แจ้งเตือนอัปโหลดรูปภาพสำเร็จ
    toast.value.useToast().info('อัปโหลดรูปภาพเรียบร้อย คลิกที่รูปเพื่อดูขนาดเต็ม')
  }
  
  // เพิ่มหมวดหมู่ใหม่
  const addCategory = () => {
    if (newCategory.value.trim() && !props.categories.includes(newCategory.value.trim())) {
      emit('add-category', newCategory.value.trim())
      form.value.category = newCategory.value.trim()
      
      // แสดง toast แจ้งเตือนเพิ่มหมวดหมู่สำเร็จ
      toast.value.useToast().success(`เพิ่มหมวดหมู่ "${newCategory.value.trim()}" เรียบร้อยแล้ว`)
      
      newCategory.value = ''
    } else if (props.categories.includes(newCategory.value.trim())) {
      // แสดง toast แจ้งเตือนหมวดหมู่ซ้ำ
      toast.value.useToast().warning(`หมวดหมู่ "${newCategory.value.trim()}" มีอยู่แล้ว`)
    }
  }

  // เพิ่มชนิดของสัตว์ใหม่
  const addAnimalType = () => {
    if (newAnimalType.value.trim() && !props.animalTypes.includes(newAnimalType.value.trim())) {
      emit('add-animal-type', newAnimalType.value.trim())
      form.value.animalType = newAnimalType.value.trim()
      
      // แสดง toast แจ้งเตือนเพิ่มชนิดของสัตว์สำเร็จ
      toast.value.useToast().success(`เพิ่มชนิดของสัตว์ "${newAnimalType.value.trim()}" เรียบร้อยแล้ว`)
      
      newAnimalType.value = ''
    } else if (props.animalTypes.includes(newAnimalType.value.trim())) {
      // แสดง toast แจ้งเตือนชนิดของสัตว์ซ้ำ
      toast.value.useToast().warning(`ชนิดของสัตว์ "${newAnimalType.value.trim()}" มีอยู่แล้ว`)
    }
  }
  
  // ตรวจสอบความถูกต้องของฟอร์ม
  const validateForm = () => {
    // ตรวจสอบชื่อสินค้า
    if (!form.value.name || form.value.name.trim() === '') {
      errorMessage.value = 'กรุณากรอกชื่อสินค้า'
      toast.value.useToast().error('กรุณากรอกชื่อสินค้า')
      return false
    }
  
    // ตรวจสอบคำอธิบาย
    if (!form.value.description || form.value.description.trim() === '') {
      errorMessage.value = 'กรุณากรอกคำอธิบายสินค้า'
      toast.value.useToast().error('กรุณากรอกคำอธิบายสินค้า')
      return false
    }
  
    // ตรวจสอบข้อมูลเพิ่มเติม
    if (!form.value.about || form.value.about.trim() === '') {
      errorMessage.value = 'กรุณากรอกข้อมูลเพิ่มเติม'
      toast.value.useToast().error('กรุณากรอกข้อมูลเพิ่มเติม')
      return false
    }
  
    // ตรวจสอบหมวดหมู่
    if (!form.value.category || form.value.category.trim() === '') {
      errorMessage.value = 'กรุณาเลือกหมวดหมู่'
      toast.value.useToast().error('กรุณาเลือกหมวดหมู่')
      return false
    }
  
    // ตรวจสอบตัวเลือกสินค้า
    const validOptions = productOptions.value
      .filter(option => 
        option.size && option.size.trim() !== '' && 
        !isNaN(parseFloat(option.price)) && 
        !isNaN(parseInt(option.stock))
      )
      .map(option => ({
        size: option.size.trim(),
        price: parseFloat(option.price), 
        stock: parseInt(option.stock)
      }))
  
    if (validOptions.length === 0) {
      errorMessage.value = 'ต้องมีอย่างน้อยหนึ่งตัวเลือกสินค้าที่มีข้อมูลครบถ้วน'
      toast.value.useToast().error('ต้องมีอย่างน้อยหนึ่งตัวเลือกสินค้าที่มีข้อมูลครบถ้วน')
      return false
    }
  
    return true
  }
  
  // ส่งฟอร์ม
  const submitProduct = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
  
      // ตรวจสอบความถูกต้องของฟอร์ม
      if (!validateForm()) {
        isLoading.value = false
        return
      }
  
      // แปลงตัวเลือกสินค้า
      const options = productOptions.value
        .filter(option => 
          option.size && option.size.trim() !== '' && 
          !isNaN(parseFloat(option.price)) && 
          !isNaN(parseInt(option.stock))
        )
        .map(option => ({
          size: String(option.size).trim(),
          price: Number(option.price),
          stock: Number(option.stock)
        }))
  
      // เตรียมข้อมูลสินค้า
      const productData = {
        name: form.value.name.trim(),
        description: form.value.description.trim(),
        about: form.value.about.trim(),
        category: form.value.category.trim(),
        animalType: form.value.animalType.trim(),
        status: form.value.status === 'Active',
        options: options,
        updateAt: new Date().toISOString()
      }
  
      // ส่งข้อมูลไปยัง Component หลัก
      emit('submit', {
        productId: form.value.id,
        productData,
        imageFile: imageFile.value
      })
  
    } catch (error) {
      console.error('Error preparing form data:', error)
      errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการเตรียมข้อมูลสินค้า'
      toast.value.useToast().error(error.message || 'เกิดข้อผิดพลาดในการเตรียมข้อมูลสินค้า')
    } finally {
      isLoading.value = false
    }
  }
  </script>