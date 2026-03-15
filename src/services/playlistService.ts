import api from './api';

export const getAll = async () => {
  const response = await api.get('/playlists');
  return response.data;
};

export const getById = async (id: string) => {
  const response = await api.get(`/playlists/${id}`);
  return response.data;
};

export const create = async (data: any) => {
  const response = await api.post('/playlists', data);
  return response.data;
};

export const update = async (id: string, data: any) => {
  const response = await api.put(`/playlists/${id}`, data);
  return response.data;
};

const _delete = async (id: string) => {
  const response = await api.delete(`/playlists/${id}`);
  return response.data;
};

export { _delete as delete };
