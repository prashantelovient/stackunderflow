import apiClient from '@/admin/services/apiClient'

export const instructorService = {
    getAnalytics: async () => {
        const res = await apiClient.get('/instructor/analytics')
        return res.data
    },
}
