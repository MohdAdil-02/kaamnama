import api from './api';
export const receiptApi = {
  create: (formData) => api.post('/receipts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params) => api.get('/receipts', { params }),
  get: (id) => api.get(`/receipts/${id}`),
  resend: (id) => api.post(`/receipts/${id}/resend`),
};
