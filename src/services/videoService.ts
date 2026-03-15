import api from './api';

export const getAll = async () => {
  const response = await api.get('/videos');
  return response.data;
};

export const getById = async (id: string) => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

export const create = async (formData: FormData) => {
  const response = await api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const update = async (id: string, data: any) => {
  const response = await api.put(`/videos/${id}`, data);
  return response.data;
};

const _delete = async (id: string) => {
  const response = await api.delete(`/videos/${id}`);
  return response.data;
};

export { _delete as delete };
