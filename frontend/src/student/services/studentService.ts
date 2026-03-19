import studentApiClient from './studentApiClient'
import apiClient from '@/admin/services/apiClient'

// ---- Admin student management functions (used by admin StudentsPage) ----
export const getAll = async () => {
  const res = await apiClient.get('/student')
  return res.data
}

export const deleteStudent = async (id: string) => {
  const res = await apiClient.delete(`/student/${id}`)
  return res.data
}
// Alias 'delete' as a computed property since 'delete' is a reserved word
export { deleteStudent as delete }

export const suspend = async (id: string) => {
  const res = await apiClient.patch(`/student/${id}/suspend`)
  return res.data
}

export const activate = async (id: string) => {
  const res = await apiClient.patch(`/student/${id}/activate`)
  return res.data
}


export interface StudentUser {
  id: string
  name: string
  email: string
}

export interface LoginResponse {
  token: string
  student: StudentUser
}

export const studentAuth = {
  register: async (name: string, email: string, password: string): Promise<LoginResponse> => {
    const res = await studentApiClient.post('/student/register', { name, email, password })
    return res.data
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await studentApiClient.post('/student/login', { email, password })
    return res.data
  },
}

export interface Video {
  id: string
  title: string
  description: string
  videoPath: string
  thumbnail: string | null
  duration: string
  playlistId: string | null
  playlistTitle: string
  status: string
  uploadDate: string
}

export interface Playlist {
  id: string
  title: string
  description: string
  thumbnail: string | null
  categoryId: string | null
  createdAt: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  content: string
  status: string
  createdAt: string
}

export interface WatchProgress {
  id: string
  videoId: string | Video
  progress: number
  completed: boolean
  updatedAt: string
}

export const playlists = {
  getAll: async (): Promise<Playlist[]> => {
    const res = await studentApiClient.get('/playlists')
    return res.data
  },
  getById: async (id: string): Promise<Playlist & { videos?: Video[] }> => {
    const res = await studentApiClient.get(`/playlists/${id}`)
    return res.data
  },
}

export const studentVideos = {
  getAll: async (): Promise<Video[]> => {
    const res = await studentApiClient.get('/videos')
    return res.data
  },
  getById: async (id: string): Promise<Video> => {
    const res = await studentApiClient.get(`/videos/${id}`)
    return res.data
  },
  getByPlaylist: async (playlistId: string): Promise<Video[]> => {
    const res = await studentApiClient.get('/videos')
    return res.data.filter((v: Video) => v.playlistId === playlistId)
  },
}

export const studentBlogs = {
  getAll: async (): Promise<Blog[]> => {
    const res = await studentApiClient.get('/blogs')
    return res.data
  },
  getById: async (id: string): Promise<Blog> => {
    const res = await studentApiClient.get(`/blogs/${id}`)
    return res.data
  },
}

export const watchProgress = {
  save: async (videoId: string, progressSeconds: number, completed?: boolean): Promise<void> => {
    await studentApiClient.post('/progress', { videoId, progressSeconds, completed })
  },
  getForVideo: async (videoId: string): Promise<WatchProgress> => {
    const res = await studentApiClient.get(`/progress/${videoId}`)
    return res.data
  },
  getAll: async (): Promise<WatchProgress[]> => {
    const res = await studentApiClient.get('/progress')
    return res.data
  },
}
