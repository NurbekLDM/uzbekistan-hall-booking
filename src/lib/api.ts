import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';
    
    // Avoid showing 401 errors during auth checks
    if (!error.config.url.includes('/me') || error.response?.status !== 401) {
      toast.error(message);
    }
    
    // Handle token expiration
    if (error.response?.status === 401 && !error.config.url.includes('/login') && !error.config.url.includes('/me')) {
      // Just redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;