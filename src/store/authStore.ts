import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'owner' | 'user';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkingAuth: boolean;
  login: (role: UserRole, credentials: any) => Promise<void>;
  register: (role: UserRole, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      checkingAuth: false,
      
      login: async (role, credentials) => {
        set({ isLoading: true, error: null });
        try {
          // Determine the endpoint based on role
          let endpoint;
          if (role === 'admin') {
            endpoint = '/admin/login';
          } else if (role === 'owner') {
            endpoint = '/owner/login';
          } else {
            endpoint = '/user/login';
          }
          console.log('Login endpoint:', endpoint);
          

          console.log(`Login attempt for role: ${role} to endpoint: ${endpoint}`);
          console.log('Login credentials:', credentials);
          
          // Ensure credentials match what the backend expects
          const loginData = {
            username: credentials.username,
            password: credentials.password
          };
          
          // Set withCredentials to true to handle cookies properly
          const response = await api.post(endpoint, loginData, { 
            withCredentials: true 
          });
          
          console.log('Login response:', response.data);
          
          // Extract user data from response
          const userData = {
            ...(response.data.user || {}),
            role: response.data.user?.role || role
          };
          
          set({ 
            user: userData,
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success(response.data.message || 'Login successful!');
        } catch (error: any) {
          console.error('Login error:', error);
          
          // More detailed error logging
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
          }
          
          set({ 
            error: error.response?.data?.error || 'Login failed',
            isLoading: true 
          });
          toast.error(error.response?.data?.error || 'Login failed');
        }
      },
      
      register: async (role, userData) => {
        set({ isLoading: true, error: null });
        try {
          let endpoint;
          
          if (role === 'admin') {
            endpoint = '/admin/createAdmin';
          } else if (role === 'owner') {
            endpoint = '/admin/createOwner';
          } else {
            endpoint = '/user/register';
          }
          
          const response = await api.post(endpoint, userData, {
            withCredentials: true
          });
          
          set({ isLoading: false });
          toast.success(response.data.message || 'Registration successful!');
        } catch (error: any) {
          console.error('Registration error:', error);
          
          set({ 
            error: error.response?.data?.error || error.response?.data?.message || 'Registration failed',
            isLoading: false 
          });
          toast.error(error.response?.data?.error || error.response?.data?.message || 'Registration failed');
        }
      },
      
      logout: async () => {
        try {

          await api.post('/user/logout', {}, {
            withCredentials: true
          });
          
          // Clear local state
          set({ user: null, isAuthenticated: false });
          toast.info('Logged out successfully');
        } catch (error) {
          console.error('Logout error:', error);
          // Even if server logout fails, clear client state
          set({ user: null, isAuthenticated: false });
          toast.info('Logged out successfully');
        }
      },
      
      checkAuth: async () => {
        set({ checkingAuth: true, isLoading: true });

        try {
          const { data } = await api.get('/user/me', {
            withCredentials: true
          });
          
          console.log('Auth check response:', data);
          
          set({ 
            user: { ...data, role: data.role || 'user' },
            isAuthenticated: true,
            isLoading: false,
            checkingAuth: false
          });
        } catch (error: any) {
          console.error('Auth check error:', error);
          
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            checkingAuth: false
          });
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;