import apiClient from './apiClient'

export interface NoteItem {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    instructorId: string;
    createdAt: string;
}

export const getAll = async () => {
    const response = await apiClient.get<NoteItem[]>('/notes')
    return response.data
}

export const getById = async (id: string) => {
    const response = await apiClient.get<NoteItem>(`/notes/${id}`)
    return response.data
}

export const create = async (data: any) => {
    const response = await apiClient.post<NoteItem>('/notes', data)
    return response.data
}

export const update = async (id: string, data: any) => {
    const response = await apiClient.patch<NoteItem>(`/notes/${id}`, data) // Assuming patch for now
    return response.data
}

const _delete = async (id: string) => {
    const response = await apiClient.delete(`/notes/${id}`)
    return response.data
}

export { _delete as delete };

export const getDownloadUrl = async (id: string) => {
    const response = await apiClient.get<{ downloadUrl: string }>(`/notes/${id}/download`)
    return response.data.downloadUrl
}
