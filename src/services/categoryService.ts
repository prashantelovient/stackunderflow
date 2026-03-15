import api from './api';

export const getAll = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const create = async (data: any) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const update = async (id: string, data: any) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

const _delete = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export { _delete as delete };
