import { create } from 'zustand';

let id = 0;
export const useNotificationStore = create((set, get) => ({
  toasts: [],
  items: [], // server notifications
  setItems: (items) => set({ items }),
  push: (type, message) => {
    const t = { id: ++id, type, message };
    set({ toasts: [...get().toasts, t] });
    setTimeout(() => get().dismiss(t.id), 4000);
  },
  dismiss: (tid) => set({ toasts: get().toasts.filter((t) => t.id !== tid) }),
}));

export const toast = {
  success: (m) => useNotificationStore.getState().push('success', m),
  error: (m) => useNotificationStore.getState().push('error', m),
  info: (m) => useNotificationStore.getState().push('info', m),
};
