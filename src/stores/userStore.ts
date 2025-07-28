import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface User {
  id: string
  name: string
  email: string
  joined_at: string
}

interface UserState {
  users: User[]
  loading: boolean
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true })
    
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false })
      
      if (error) throw error
      
      set({ users: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching users:', error)
      set({ loading: false })
      throw error
    }
  },
}))