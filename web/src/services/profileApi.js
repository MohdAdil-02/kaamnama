import api from './api';

export const profileApi = {
  getPublic: (slug) => api.get(`/profiles/${slug}`),                          // -> { data: { profile } }
  getRatings: (slug, params) => api.get(`/ratings/worker/${slug}`, { params }), // -> { data: { ratings, ... }, meta }
  getHistory: (slug, params) => api.get(`/ratings/worker/${slug}`, { params }), // old name kept
};