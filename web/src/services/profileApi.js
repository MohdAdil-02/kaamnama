import api from './api';
export const profileApi = {
  getPublic: (slug) => api.get(`/profiles/${slug}`),
  getHistory: (slug, params) => api.get(`/profiles/${slug}/receipts`, { params }),
};
