import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: any | null
  session: any | null
  isLoading: boolean
  setUser: (user: any) => void
  setSession: (session: any) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)