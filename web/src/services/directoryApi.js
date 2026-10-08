import api from './api';
const cache = {};
export const directoryApi = {
  // params: q, category, vertical, pincode, radius, lat, lng, sort, page, limit
  search: (params) => api.get('/directory/workers', { params }),
  // Categories rarely change, so they are cached for the session
  categories: (vertical) => {
    const k = vertical || 'all';
    if (!cache[k]) cache[k] = api.get('/directory/categories', { params: { vertical } }).catch((e) => { delete cache[k]; throw e; });
    return cache[k];
  },
};
