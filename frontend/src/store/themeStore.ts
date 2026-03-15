import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggle: () =>
    set((s) => {
      const next = !s.isDark
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return { isDark: next }
    }),
  setDark: (v) => {
    localStorage.setItem('theme', v ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', v)
    set({ isDark: v })
  },
}))
