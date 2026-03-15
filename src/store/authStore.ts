import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Admin {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  token: string | null
  admin: Admin | null
  isAuthenticated: boolean
  login: (token: string, admin: Admin) => void
  logout: () => void
  updateAdmin: (admin: Partial<Admin>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => set({ token, admin, isAuthenticated: true }),
      logout: () => set({ token: null, admin: null, isAuthenticated: false }),
      updateAdmin: (updated) =>
        set((s) => ({ admin: s.admin ? { ...s.admin, ...updated } : null })),
    }),
    { name: 'admin-auth' }
  )
)
