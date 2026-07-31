import { create } from "zustand";

interface AuthState {
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  setAuth: (userId: string, email: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  isLoading: true,
  setAuth: (userId, email) => set({ userId, email, isLoading: false }),
  clearAuth: () => set({ userId: null, email: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
