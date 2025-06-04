import axios from 'axios';
import router from '@/router';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

// Request Interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user_token');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default instance;