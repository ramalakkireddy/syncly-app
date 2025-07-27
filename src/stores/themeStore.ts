
import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark' || 
          (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
  
  toggle: () => set((state) => {
    const newTheme = !state.isDark
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
    return { isDark: newTheme }
  }),
  
  setTheme: (isDark: boolean) => set(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
    return { isDark }
  }),
}))
