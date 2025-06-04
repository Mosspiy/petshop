apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token'); // เปลี่ยนจาก 'token' เป็น 'auth_token'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);