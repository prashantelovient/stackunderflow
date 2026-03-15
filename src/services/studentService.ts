import api from './api';

export const getAll = async () => {
  const response = await api.get('/student');
  return response.data;
};

export const getById = async (id: string) => {
  const response = await api.get(`/student/${id}`);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/student/${id}`);
  return response.data;
};

// Map `delete` to `deleteStudent` since `delete` is a reserved word depending on usage, but we can export as `delete: deleteStudent`
const _delete = async (id: string) => {
  const response = await api.delete(`/student/${id}`);
  return response.data;
};

export const suspend = async (id: string) => {
  const response = await api.patch(`/student/${id}/suspend`);
  return response.data;
};

export { _delete as delete };
