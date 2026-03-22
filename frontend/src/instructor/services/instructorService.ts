import apiClient from '@/admin/services/apiClient'

export const instructorService = {
    getAnalytics: async () => {
        const res = await apiClient.get('/instructor/analytics')
        return res.data
    },
    getRevenue: async () => {
        const res = await apiClient.get('/instructor/revenue')
        return res.data
    },
    getStudents: async () => {
        const res = await apiClient.get('/instructor/students')
        return res.data
    },
    getEnrollments: async () => {
        const res = await apiClient.get('/instructor/enrollments')
        return res.data
    },
    updateEnrollmentStatus: async (id: string, status: 'approved' | 'rejected') => {
        const res = await apiClient.patch(`/instructor/enrollments/${id}`, { status })
        return res.data
    },
}
