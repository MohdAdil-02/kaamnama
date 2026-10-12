import api from './api';

export const directoryApi = {
  categories: () => api.get('/directory/categories'),            // -> { data: { categories } }
  search: (params) => api.get('/directory/workers', { params }), // -> { data: { workers }, meta }
};