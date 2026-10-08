import api from './api';
// Public endpoints used by customers opening a link from SMS / WhatsApp
export const customerApi = {
  getReceipt: (id) => api.get(`/customer/receipts/${id}`),
  sendOtp: (id) => api.post(`/customer/receipts/${id}/send-otp`),
  confirm: (id, otp) => api.post(`/customer/receipts/${id}/confirm`, { otp }),
  reject: (id, reason) => api.post(`/customer/receipts/${id}/reject`, { reason }),
  rate: (id, payload) => api.post(`/ratings`, { receiptId: id, ...payload }),
};
