// src/stores/authStore.js
import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false
  }),
  
  actions: {
    async initializeAuth() {
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        this.loading = true;
        try {
          const userData = await authService.getUserProfile(userId);
          this.user = userData;
          this.isLoggedIn = true;
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('userId');
          this.user = null;
          this.isLoggedIn = false;
        } finally {
          this.loading = false;
        }
      }
    },
    
    async logout() {
      authService.logout();
      this.user = null;
      this.isLoggedIn = false;
    },
    
    setUser(userData) {
      this.user = userData;
      this.isLoggedIn = true;
    }
  }
});