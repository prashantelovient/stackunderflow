import api from './api';

export const getAll = async () => {
  const response = await api.get('/blogs');
  return response.data;
};

export const getById = async (id: string) => {
  const response = await api.get(`/blogs/${id}`);
  return response.data;
};

export const create = async (data: any) => {
  const response = await api.post('/blogs', data);
  return response.data;
};

export const update = async (id: string, data: any) => {
  const response = await api.put(`/blogs/${id}`, data);
  return response.data;
};

const _delete = async (id: string) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};

export { _delete as delete };
