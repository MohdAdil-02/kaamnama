import api from './api';

export const receiptApi = {
  // ---- Worker (logged in) ----
  create: (payload) => api.post('/receipts', payload), // -> { data: { receipt, verification } }
  uploadPhotos: (id, files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('photos', f));
    return api.post(`/receipts/${id}/photos`, fd);
  },
  list: (params) => api.get('/receipts', { params }),   // -> { data: { receipts }, meta }
  get: (id) => api.get(`/receipts/${id}`),              // -> { data: { receipt, events } }
  newQr: (id) => api.post(`/receipts/${id}/qr`),        // -> { data: { verification } }
  sendLink: (id) => api.post(`/receipts/${id}/send-link`),
  resend: (id) => api.post(`/receipts/${id}/send-link`), // old name kept

  // ---- Customer (public, the token is the credential) ----
  preview: (token) => api.get(`/receipts/verify/${token}`),            // -> { data: { receipt } }
  sendOtp: (token) => api.post(`/receipts/verify/${token}/otp`),
  confirm: (token, { otp, action = 'verify', reason, channel = 'link' }) =>
    api.post(`/receipts/verify/${token}/confirm`, { otp, action, reason, channel }),
};