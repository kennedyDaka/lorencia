import { create } from "zustand";

interface AuthState {
  userId: string | null;
  email: string | null;
  role: string | null;
  isLoading: boolean;
  setAuth: (userId: string, email: string, role?: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  role: null,
  isLoading: true,
  setAuth: (userId, email, role) => set({ userId, email, role: role ?? null, isLoading: false }),
  clearAuth: () => set({ userId: null, email: null, role: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
