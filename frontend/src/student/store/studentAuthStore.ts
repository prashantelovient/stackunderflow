import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Student {
  id: string
  name: string
  email: string
}

interface StudentAuthState {
  token: string | null
  student: Student | null
  isAuthenticated: boolean
  login: (token: string, student: Student) => void
  logout: () => void
  updateStudent: (student: Partial<Student>) => void
}

export const useStudentAuthStore = create<StudentAuthState>()(
  persist(
    (set) => ({
      token: null,
      student: null,
      isAuthenticated: false,
      login: (token, student) => set({ token, student, isAuthenticated: true }),
      logout: () => set({ token: null, student: null, isAuthenticated: false }),
      updateStudent: (updated) =>
        set((s) => ({ student: s.student ? { ...s.student, ...updated } : null })),
    }),
    { name: 'student-auth' }
  )
)
