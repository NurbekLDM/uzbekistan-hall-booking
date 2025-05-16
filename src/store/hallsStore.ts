
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Hall {
  id: string;
  name: string;
  images: string[];
  district: string;
  address: string;
  capacity: number;
  pricePerSeat: number;
  phone: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approved: boolean;
}

interface HallFilter {
  district?: string;
  approved?: boolean;
  searchText?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'capacity_asc' | 'capacity_desc';
}

interface HallsState {
  halls: Hall[];
  filteredHalls: Hall[];
  currentHall: Hall | null;
  isLoading: boolean;
  error: string | null;
  filters: HallFilter;
  
  // Actions
  fetchHalls: () => Promise<void>;
  fetchHallById: (id: string) => Promise<void>;
  createHall: (hallData: FormData) => Promise<void>;
  updateHall: (id: string, hallData: Partial<Hall>) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
  approveHall: (id: string) => Promise<void>;
  setFilters: (filters: HallFilter) => void;
  resetFilters: () => void;
}

const TASHKENT_DISTRICTS = [
  'Bektemir', 'Chilanzar', 'Hamza', 'Mirobod', 'Mirzo Ulugbek', 
  'Sergeli', 'Shaykhantaur', 'Olmazar', 'Uchtepa', 'Yakkasaray', 'Yunusabad'
];

const useHallsStore = create<HallsState>((set, get) => ({
  halls: [],
  filteredHalls: [],
  currentHall: null,
  isLoading: false,
  error: null,
  filters: {},
  
  fetchHalls: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/halls');
      set({ halls: data, filteredHalls: data, isLoading: false });
      get().setFilters(get().filters); // Apply any existing filters
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
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
      await api.post('/owner/createHall', hallData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await get().fetchHalls();
      toast.success('Hall created successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateHall: async (id: string, hallData: Partial<Hall>) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/admin/halls/${id}`, hallData);
      await get().fetchHalls();
      toast.success('Hall updated successfully!');
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
      toast.success('Hall deleted successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  approveHall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/admin/halls/${id}`, { approved: true });
      set(state => ({
        halls: state.halls.map(hall => 
          hall.id === id ? { ...hall, approved: true } : hall
        ),
        filteredHalls: state.filteredHalls.map(hall => 
          hall.id === id ? { ...hall, approved: true } : hall
        ),
        isLoading: false
      }));
      toast.success('Hall approved successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  setFilters: (filters: HallFilter) => {
    const newFilters = { ...get().filters, ...filters };
    set({ filters: newFilters });
    
    // Apply filters
    const { district, approved, searchText, sortBy } = newFilters;
    let filtered = [...get().halls];
    
    if (district) {
      filtered = filtered.filter(hall => hall.district === district);
    }
    
    if (approved !== undefined) {
      filtered = filtered.filter(hall => hall.approved === approved);
    }
    
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(hall => 
        hall.name.toLowerCase().includes(search) || 
        hall.address.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'price_asc') return a.pricePerSeat - b.pricePerSeat;
        if (sortBy === 'price_desc') return b.pricePerSeat - a.pricePerSeat;
        if (sortBy === 'capacity_asc') return a.capacity - b.capacity;
        if (sortBy === 'capacity_desc') return b.capacity - a.capacity;
        return 0;
      });
    }
    
    set({ filteredHalls: filtered });
  },
  
  resetFilters: () => {
    set({ filters: {}, filteredHalls: get().halls });
  }
}));

export default useHallsStore;
export { TASHKENT_DISTRICTS };
