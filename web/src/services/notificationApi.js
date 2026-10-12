import api from './api';

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),   // -> { data: { notifications }, meta: { unread } }
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};