
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'owner' | 'user';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkingAuth: boolean; // Add this flag to prevent infinite loops
  login: (role: UserRole, credentials: { username: string; password: string }) => Promise<void>;
  register: (role: UserRole, userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      checkingAuth: false, // Add this flag initialized to false
      
      login: async (role, credentials) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = role === 'admin' 
            ? '/admin/login' 
            : role === 'owner'
              ? '/owner/login'
              : '/user/login';
          
          const { data } = await api.post(endpoint, credentials);
          
          set({ 
            token: data.token,
            user: { ...data.user, role },
            isAuthenticated: true,
            isLoading: false 
          });
          
          localStorage.setItem('token', data.token);
          toast.success('Login successful!');
          
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed',
            isLoading: false 
          });
        }
      },
      
      register: async (role, userData) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = role === 'admin' 
            ? '/admin/createAdmin' 
            : role === 'owner'
              ? '/admin/createOwner' // Only admin can create owners
              : '/user/register';
          
          await api.post(endpoint, userData);
          set({ isLoading: false });
          toast.success('Registration successful!');
          
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
        toast.info('Logged out successfully');
      },
      
      checkAuth: async () => {
        // Check if we're already in the process of checking auth
        if (get().checkingAuth || get().isLoading) {
          return;
        }
        
        set({ isLoading: true, checkingAuth: true });
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ isLoading: false, checkingAuth: false });
          return;
        }
        
        try {
          const { data } = await api.get('/me');
          set({ 
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            checkingAuth: false
          });
        } catch (error) {
          set({ 
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            checkingAuth: false
          });
          localStorage.removeItem('token');
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;
