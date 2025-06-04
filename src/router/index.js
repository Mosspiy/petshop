import { createRouter, createWebHistory } from 'vue-router'
import authService from '../services/authService.js';

import Home from '@/views/Home.vue'
import Categories from '@/views/category.vue'
import profile from '@/views/ProfilePage.vue'
import favorite from '@/views/favorite.vue'
import cart from '@/views/cart.vue'
import searchView from '@/views/searchView.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Orderhistory from '../views/Orderhistory.vue'
import AddressView from '../views/AddressPage.vue'
import addAddress from '../views/addAddress.vue'
import test from '../components/test.vue'
import ProductList from '../views/ProductList.vue'
import LoginPage from '@/views/LoginPage.vue'
import LoginSuccess from '../views/LoginSuccess.vue'


/*Admin*/
import adminView from '../views/Admin/adminView.vue'
import adminProducts from '../views/Admin/products/ListView.vue'
import adminOrders from '../views/Admin/orders/ListView.vue'
import adminLogin from '../views/Admin/adminLogin.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
            meta: { requiresAuth: true }
        },
        {
            path: '/categories',
            name: 'categories',
            component: Categories
        },
        {
            path: '/products',
            name: 'products',
            component: ProductList
        },
        {
            path: '/profile',
            name: 'profile',
            component: profile
        },
        {
            path: '/favorite',
            name: 'favorite',
            component: favorite
        },
        {
            path: '/cart',
            name: 'cart',
            component: cart
        },
        {
            path: '/search',
            name: 'search',
            component: searchView,
        },
        {
            path: '/product/:id',
            name: 'ProductDetail',
            component: ProductDetail,
            props: true,
        },
        {
            path: '/orderhistory',
            name: 'Orderhistory',
            component: Orderhistory
        },
        {
            path: '/address',
            name: 'AddressView',
            component: AddressView
        },
        {
            path: '/addAddress',
            name: 'addAddress',
            component: addAddress
        },
        {
            path: '/test',
            name: 'test',
            component: test
        },
        {
            path: '/login',
            name: 'LoginPage',
            component: LoginPage,
            meta: { requiresAuth: false }
        },
        {
            path: '/login-success',
            name: 'LoginSuccess',
            component: LoginSuccess,
        },
     
        


        /*Admin*/
        {
            path: '/admin',
            name: 'adminLogin',
            component: adminLogin
        },
        {
            path: '/admin/products',
            name: 'adminProducts',
            component: adminProducts
        },
        {
            path: '/admin/orders',
            name: 'adminOrders',
            component: adminOrders
        },
        
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        // เมื่อเปลี่ยนหน้า จะเลื่อน scroll ไปที่ด้านบนสุด
        return { top: 0 };
    }
})
router.beforeEach((to, from, next) => {
    // ตรวจสอบว่าหน้านี้ต้องการการยืนยันตัวตนหรือไม่
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth) {
      // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือยัง
      if (!authService.isLoggedIn()) {
        // ถ้ายังไม่ได้เข้าสู่ระบบให้ redirect ไปที่หน้า login
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        // ถ้าเข้าสู่ระบบแล้วให้ไปยังหน้าที่ต้องการ
        next();
      }
    } else {
      // ถ้าไม่ต้องการการยืนยันตัวตนให้ไปยังหน้าที่ต้องการได้เลย
      next();
    }
  });
export default router