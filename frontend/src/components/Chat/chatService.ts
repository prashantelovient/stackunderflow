import axios from 'axios'

const API_BASE = 'http://localhost:5000/api/messages'

export interface Message {
    id: string
    senderId: string
    senderName: string
    senderRole: 'admin' | 'instructor' | 'student'
    senderModel: 'Admin' | 'Instructor' | 'Student'
    message: string
    timestamp: string
}

export const chatService = {
    async getMessages(token: string, before?: string): Promise<Message[]> {
        const response = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
            params: { before }
        })
        return response.data
    },
    async sendMessageByHttp(token: string, data: Partial<Message>): Promise<Message> {
        const response = await axios.post(API_BASE, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }
}
