import { create } from 'zustand';
import api from '@/lib/api';

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  halls?: string[]; // Array of hall IDs
}

// Define an extended interface that includes password for creating owners
export interface OwnerWithPassword extends Partial<Owner> {
  password?: string;
}

interface OwnersState {
  owners: Owner[];
  currentOwner: Owner | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOwners: () => Promise<void>;
  fetchOwnerById: (id: string) => Promise<void>;
  createOwner: (ownerData: OwnerWithPassword) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
  assignHallToOwner: (ownerId: string, hallId: string) => Promise<void>;
}

const useOwnersStore = create<OwnersState>((set, get) => ({
  owners: [],
  currentOwner: null,
  isLoading: false,
  error: null,
  
  fetchOwners: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/owners');
      set({ owners: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchOwnerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/admin/owners/${id}`);
      set({ currentOwner: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  createOwner: async (ownerData: OwnerWithPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/admin/createOwner', ownerData);
      await get().fetchOwners();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  deleteOwner: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/admin/owners/${id}`);
      set(state => ({ 
        owners: state.owners.filter(owner => owner.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  assignHallToOwner: async (ownerId: string, hallId: string) => {
    set({ isLoading: true, error: null });
    try {
      // This would depend on your API implementation
      await api.put(`/admin/halls/${hallId}`, { ownerId });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

export default useOwnersStore;
