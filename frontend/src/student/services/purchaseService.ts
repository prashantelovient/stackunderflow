import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/purchase';

const getAuthToken = () => {
    const authStore = JSON.parse(localStorage.getItem('vault-auth') || '{}');
    return authStore.state?.token || '';
};

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const purchaseService = {
    buyCourse: async (courseId: string) => {
        const response = await api.post('/fake-purchase', { courseId });
        return response.data;
    },
    getPurchases: async () => {
        const response = await api.get('/my-purchases');
        return response.data;
    }
};
