import api from './api';
export const workerApi = {
  dashboard: () => api.get('/workers/me/dashboard'),
  getMe: () => api.get('/workers/me'),
  updateMe: (data) => api.put('/workers/me', data),
  uploadAvatar: (formData) => api.post('/workers/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  trustScore: () => api.get('/workers/me/trust-score'),
  qr: () => api.get('/workers/me/qr'),
  memberships: () => api.get('/workers/me/memberships'),
  requestDeletion: () => api.post('/workers/me/deletion-request'),
};
