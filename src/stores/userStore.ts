import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface UserWithProfile {
  id: string
  email: string
  username: string | null
  phone: string | null
  joined_at: string
  name: string // Add name property for backward compatibility
}

interface UserState {
  users: UserWithProfile[]
  loading: boolean
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true })
    
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get auth users data (this requires service role key in production)
      // For now, we'll just use profiles data and get emails from auth state
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        // Fallback: use current session user only
        const { data: { user } } = await supabase.auth.getUser()
        if (user && profiles) {
          const userProfile = profiles.find(p => p.id === user.id)
          const username = userProfile?.username || user.email?.split('@')[0] || 'User'
          set({ 
            users: [{
              id: user.id,
              email: user.email || '',
              username: userProfile?.username || null,
              phone: userProfile?.phone || null,
              joined_at: user.created_at,
              name: username
            }], 
            loading: false 
          })
        } else {
          set({ users: [], loading: false })
        }
        return
      }

      // Combine profile and auth data
      const combinedData: UserWithProfile[] = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        const username = profile?.username || user.email?.split('@')[0] || 'User'
        return {
          id: user.id,
          email: user.email || '',
          username: profile?.username || null,
          phone: profile?.phone || null,
          joined_at: user.created_at,
          name: username
        }
      })
      
      set({ users: combinedData, loading: false })
    } catch (error) {
      console.error('Error fetching users:', error)
      set({ loading: false })
      throw error
    }
  },
}))