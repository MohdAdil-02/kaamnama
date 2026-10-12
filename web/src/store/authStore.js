import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,         // access token
      refreshToken: null,  // single-use, rotates on every refresh
      user: null,
      setSession: ({ token, refreshToken, user }) =>
        set((s) => ({ token, refreshToken: refreshToken ?? s.refreshToken, user: user ?? s.user })),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: 'auth' }
  )
);