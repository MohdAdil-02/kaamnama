import { create } from 'zustand';
export const useWorkerStore = create((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clear: () => set({ profile: null }),
}));
