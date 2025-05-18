import { create } from 'zustand';
import api from '@/lib/api';

export const TASHKENT_DISTRICTS = [
  'Bektemir', 'Chilanzar', 'Hamza', 'Mirobod', 'Mirzo-Ulugbek', 
  'Sergeli', 'Shayhontohur', 'Olmazar', 'Uchtepa', 'Yakkasaray', 'Yunusobod'
];

export interface Hall {
  id: string;
  name: string;
  images: string[];
  district: string;
  address: string;
  capacity: number;
  price: number;
  phone: string;
  owner_id?: string;
  owner?: string; 
  approved: boolean; 
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
  fetchHallById: (id: number) => Promise<void>;
  createHall: (hallData: FormData) => Promise<void>;
  updateHall: (id: string, hallData: FormData) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
  approveHall: (id: string) => Promise<void>;
  rejectHall: (id: string) => Promise<void>;
  assignHall: (hallId: string, ownerId: string) => Promise<void>;
  
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
     
      const { data } = await api.get('/user/halls');
      
     
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
  
    const { halls } = get();
    let filtered = [...halls];
    
  
    if (filters.district && filters.district !== 'any_district') {
      filtered = filtered.filter(hall => hall.district === filters.district);
    }
    
    if (filters.approved !== undefined) {
      filtered = filtered.filter(hall => hall.approved === filters.approved);
    }
    
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(hall => 
        hall.name.toLowerCase().includes(searchLower) || 
        hall.address.toLowerCase().includes(searchLower)
      );
    }
    

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
          break;
        case 'capacity_asc':
          filtered.sort((a, b) => a.capacity - b.capacity);
          break;
        case 'capacity_desc':
          filtered.sort((a, b) => b.capacity - a.capacity);
          break;
      }
    }
    
    set({ filteredHalls: filtered });
  },
  

  setFilters: (filters: any) => {
    get().filterHalls(filters);
  },
  
  resetFilters: () => {
    set(state => ({ filteredHalls: state.halls }));
  },
  
  fetchHallById: async (id: number) => {
  set({ isLoading: true, error: null });
  try {
    // Use axios directly without authentication headers for this specific endpoint
    const { data } = await api.get(`/user/halls/${id}`, {
      headers: {
        // Skip authentication for this request
        skipAuth: true
      }
    });
    
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
      const { data } = await api.post('/owner/createHall', hallData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      

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
      const { data } = await api.post(`/admin/approveHall/${id}`);
      console.log('Approve hall response:', data);
      set(state => ({
        halls: state.halls.map(hall => hall.id === id ? { ...hall, approved: true } : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? { ...hall, approved: true } : hall),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  rejectHall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/admin/rejectHall/${id}`);
      console.log('Reject hall response:', data);
      set(state => ({
        halls: state.halls.map(hall => hall.id === id ? { ...hall, approved: false } : hall),
        filteredHalls: state.filteredHalls.map(hall => hall.id === id ? { ...hall, approved: false } : hall),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getHallsByOwnerId: async (ownerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/owner/getHalls/${ownerId}`);
      set({ halls: data, filteredHalls: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  assignHall: async (hallId: string, ownerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/admin/assignHall', { hallId, ownerId });
      

      set(state => ({
        halls: state.halls.map(hall => 
          hall.id === hallId ? { ...hall, ownerId: ownerId } : hall
        ),
        filteredHalls: state.filteredHalls.map(hall => 
          hall.id === hallId ? { ...hall, ownerId: ownerId } : hall
        ),
        // If current hall is the one being updated, update it as well
        currentHall: state.currentHall?.id === hallId ? 
          { ...state.currentHall, ownerId: ownerId } : state.currentHall,
        isLoading: false
      }));
      
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Assigning hall failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  }
}));

export default useHallsStore;