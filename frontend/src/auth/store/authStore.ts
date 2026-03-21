import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'student' | 'instructor' | 'admin'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: UserRole
}

interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            updateUser: (updated) =>
                set((s) => ({ user: s.user ? { ...s.user, ...updated } : null })),
        }),
        { name: 'vault-auth' }
    )
)
