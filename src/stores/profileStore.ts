import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'
import { useAuthStore } from './authStore'

interface Profile {
  id: string
  username: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

interface UserWithProfile {
  id: string
  email: string
  username: string | null
  phone: string | null
  joined_at: string
}

interface ProfileState {
  profiles: UserWithProfile[]
  loading: boolean
  fetchProfiles: () => Promise<void>
  updateProfile: (id: string, updates: { username?: string; phone?: string }) => Promise<void>
  getCurrentUserProfile: () => UserWithProfile | null
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  loading: false,

  fetchProfiles: async () => {
    set({ loading: true })
    
    try {
      // Get all profiles and join with auth user emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get auth users data
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) throw usersError

      // Combine profile and auth data
      const combinedData: UserWithProfile[] = users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        return {
          id: user.id,
          email: user.email || '',
          username: profile?.username || null,
          phone: profile?.phone || null,
          joined_at: user.created_at
        }
      })
      
      set({ profiles: combinedData, loading: false })
    } catch (error) {
      console.error('Error fetching profiles:', error)
      set({ loading: false })
      throw error
    }
  },

  updateProfile: async (id: string, updates: { username?: string; phone?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      // Update local state
      set(state => ({
        profiles: state.profiles.map(profile =>
          profile.id === id ? { ...profile, ...updates } : profile
        )
      }))
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  getCurrentUserProfile: () => {
    const { user } = useAuthStore.getState()
    if (!user) return null
    
    const { profiles } = get()
    return profiles.find(p => p.id === user.id) || null
  }
}))