import api from './api';

export const getByCourse = async (courseId: string) => {
    const response = await api.get(`/modules/course/${courseId}`);
    return response.data;
};

export const create = async (data: any) => {
    const response = await api.post('/modules', data);
    return response.data;
};

export const update = async (id: string, data: any) => {
    const response = await api.put(`/modules/${id}`, data);
    return response.data;
};

const _delete = async (id: string) => {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
};

export { _delete as delete };
