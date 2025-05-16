
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
  approved: boolean; // Changed from status to approved boolean
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
  
  // Add the missing functions
  setFilters: (filters: any) => void;
  resetFilters: () => void;
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
      
      // Convert status to approved for consistency
      const formattedData = data.map((hall: any) => ({
        ...hall,
        approved: hall.status === 'approved'
      }));
      
      set({ halls: formattedData, filteredHalls: formattedData, isLoading: false });
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
    
    if (filters.approved !== undefined) {
      filtered = filtered.filter(hall => hall.approved === filters.approved);
    }
    
    // More filtering options can be added here
    
    set({ filteredHalls: filtered });
  },
  
  // Add the missing functions that are used in components
  setFilters: (filters: any) => {
    get().filterHalls(filters);
  },
  
  resetFilters: () => {
    set(state => ({ filteredHalls: state.halls }));
  },
  
  fetchHallById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/admin/halls/${id}`);
      // Convert status to approved
      const formattedData = {
        ...data,
        approved: data.status === 'approved'
      };
      set({ currentHall: formattedData, isLoading: false });
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
      
      // Convert status to approved for consistency
      const formattedData = {
        ...data,
        approved: data.status === 'approved'
      };
      
      set(state => ({ 
        halls: [...state.halls, formattedData],
        filteredHalls: [...state.filteredHalls, formattedData],
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
      
      // Convert status to approved for consistency
      const formattedData = {
        ...data,
        approved: data.status === 'approved'
      };
      
      set(state => ({
        halls: state.halls.map(hall => hall.id === id ? formattedData : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? formattedData : hall),
        currentHall: formattedData,
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
        halls: state.halls.map(hall => hall.id === id ? { ...hall, approved: true } : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? { ...hall, approved: true } : hall),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useHallsStore;
