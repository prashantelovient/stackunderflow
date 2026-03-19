import api from './api';

export const getByModule = async (moduleId: string) => {
    const response = await api.get(`/lectures/module/${moduleId}`);
    return response.data;
};

export const getById = async (id: string) => {
    const response = await api.get(`/lectures/${id}`);
    return response.data;
};

export const create = async (data: any) => {
    const response = await api.post('/lectures', data);
    return response.data;
};

export const update = async (id: string, data: any) => {
    const response = await api.put(`/lectures/${id}`, data);
    return response.data;
};

const _delete = async (id: string) => {
    const response = await api.delete(`/lectures/${id}`);
    return response.data;
};

export { _delete as delete };
