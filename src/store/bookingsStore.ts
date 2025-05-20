
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  hallId: string;
  hallName: string;
  date: string;
  guestCount: number;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  status: 'upcoming' | 'past';
}

interface BookingFilter {
  hallId?: string;
  district?: string;
  status?: 'upcoming' | 'past';
}

interface BookingsState {
  bookings: Booking[];
  filteredBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  filters: BookingFilter;
  
  // Actions
  fetchAllBookings: () => Promise<void>;
  fetchHallBookings: (hallId: number) => Promise<void>;
  fetchUserBookings: (user_id: string) => Promise<void>;
  createBooking: (bookingData: CreateBookingData) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  setFilters: (filters: BookingFilter) => void;
  resetFilters: () => void;
}

interface CreateBookingData {
  date: string;
  guestCount: number;
  first_name: string;
  last_name: string;
  phone: string;
  hallId: string;
}

const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  filteredBookings: [],
  isLoading: false,
  error: null,
  filters: {},
  
  fetchAllBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/user/bookings');
      set({ bookings: data, filteredBookings: data, isLoading: false });
      get().setFilters(get().filters); 
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchHallBookings: async (hallId: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`user/bookings/${hallId}`);
      console.log('Fetched hall bookings:', data);
      set({ bookings: data, filteredBookings: data, isLoading: false });
      get().setFilters(get().filters); 
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchUserBookings: async (user_id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/user/myBookings/${user_id}`);
      set({ bookings: data, filteredBookings: data, isLoading: false });
      get().setFilters(get().filters);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
   createBooking: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/bookings', {
        date: data.date,
        guest_count: data.guestCount,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        hall_id: data.hallId
      });
      console.log('Booking created:', response.data);
      toast.success('Booking created successfully!');
      
      set((state) => ({
        bookings: [...state.bookings, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to create booking' });
     
      console.log('Error creating booking:', error);
    }
  },
  
  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/owner/deleteBooking/${id}`);
      set(state => ({ 
        bookings: state.bookings.filter(booking => booking.id !== id),
        filteredBookings: state.filteredBookings.filter(booking => booking.id !== id),
        isLoading: false
      }));
      toast.success('Booking cancelled successfully!');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  setFilters: (filters: BookingFilter) => {
    const newFilters = { ...get().filters, ...filters };
    set({ filters: newFilters });
    
    // Apply filters
    const { hallId, district, status } = newFilters;
    let filtered = [...get().bookings];
    
    if (hallId) {
      filtered = filtered.filter(booking => booking.hallId === hallId);
    }
    
    if (district) {
      // This would require hall information in the booking
      // Assuming hall district is accessible via booking.hall.district
      // filtered = filtered.filter(booking => booking.hall.district === district);
    }
    
    if (status) {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    // Default sort by date ascending
    filtered = [...filtered].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    set({ filteredBookings: filtered });
  },
  
  resetFilters: () => {
    set({ filters: {}, filteredBookings: get().bookings });
  }
}));

export default useBookingsStore;
