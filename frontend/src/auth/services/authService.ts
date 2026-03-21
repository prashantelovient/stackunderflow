import axios from 'axios'
import { UserRole } from '../store/authStore'

const API_BASE = 'http://localhost:5000/api/auth'

export const authService = {
    async login(email: string, password: string, role: UserRole) {
        const response = await axios.post(`${API_BASE}/login`, { email, password, role })
        return response.data
    },
    async register(name: string, email: string, password: string, role: UserRole) {
        const response = await axios.post(`${API_BASE}/register`, { name, email, password, role })
        return response.data
    }
}
