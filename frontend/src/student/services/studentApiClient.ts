import axios from 'axios'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const studentApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

studentApiClient.interceptors.request.use((config) => {
  const token = useStudentAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

studentApiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useStudentAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default studentApiClient
