
import { create } from 'zustand';
import api from '@/lib/api';

export const TASHKENT_DISTRICTS = [
  'Bektemir', 'Chilanzar', 'Hamza', 'Mirobod', 'Mirzo-Ulugbek', 
  'Sergeli', 'Shayhontohur', 'Olmazar', 'Uchtepa', 'Yakkasaray', 'Yunusabad'
];

export interface Hall {
  id: string;
  name: string;
  images: string[];
  district: string;
  address: string;
  capacity: number;
  pricePerSeat: number;
  phone: string;
  ownerId?: string;
  status: 'approved' | 'pending';
}

interface HallsState {
  halls: Hall[];
  filteredHalls: Hall[];
  currentHall: Hall | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchHalls: () => Promise<void>;
  filterHalls: (filters: any) => void;
  fetchHallById: (id: string) => Promise<void>;
  createHall: (hallData: FormData) => Promise<void>;
  updateHall: (id: string, hallData: FormData) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
  approveHall: (id: string) => Promise<void>;
}

const useHallsStore = create<HallsState>((set, get) => ({
  halls: [],
  filteredHalls: [],
  currentHall: null,
  isLoading: false,
  error: null,
  
  fetchHalls: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch halls based on user role
      const { data } = await api.get('/admin/halls');
      set({ halls: data, filteredHalls: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  filterHalls: (filters: any) => {
    // Filter implementation would go here
    // This is just a placeholder - the actual implementation would depend on your requirements
    const { halls } = get();
    let filtered = [...halls];
    
    // Example filtering logic
    if (filters.district) {
      filtered = filtered.filter(hall => hall.district === filters.district);
    }
    
    if (filters.status) {
      filtered = filtered.filter(hall => hall.status === filters.status);
    }
    
    // More filtering options can be added here
    
    set({ filteredHalls: filtered });
  },
  
  fetchHallById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/admin/halls/${id}`);
      set({ currentHall: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  createHall: async (hallData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      // Set correct content type for FormData (multipart/form-data)
      const { data } = await api.post('/owner/createHall', hallData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set(state => ({ 
        halls: [...state.halls, data],
        filteredHalls: [...state.filteredHalls, data],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateHall: async (id: string, hallData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      // Set correct content type for FormData (multipart/form-data)
      const { data } = await api.put(`/owner/updateHall/${id}`, hallData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set(state => ({
        halls: state.halls.map(hall => hall.id === id ? data : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? data : hall),
        currentHall: data,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  deleteHall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/admin/halls/${id}`);
      set(state => ({
        halls: state.halls.filter(hall => hall.id !== id),
        filteredHalls: state.filteredHalls.filter(hall => hall.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  approveHall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/admin/halls/${id}`, { status: 'approved' });
      
      set(state => ({
        halls: state.halls.map(hall => hall.id === id ? { ...hall, status: 'approved' } : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? { ...hall, status: 'approved' } : hall),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useHallsStore;
