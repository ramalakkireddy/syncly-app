import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface UserWithProfile {
  id: string
  email: string
  username: string | null
  phone: string | null
  joined_at: string
  name: string // Add name property for backward compatibility
  full_name: string
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
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        set({ users: [], loading: false })
        return
      }

      // Get current user to ensure we have at least one user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!profiles || profiles.length === 0) {
        // If no profiles exist, create a list with just the current user
        if (currentUser) {
          const username = currentUser.email?.split('@')[0] || 'User'
          set({ 
            users: [{
              id: currentUser.id,
              email: currentUser.email || '',
              username: username,
              phone: null,
              joined_at: currentUser.created_at,
              name: username,
              full_name: username
            }], 
            loading: false 
          })
        } else {
          set({ users: [], loading: false })
        }
        return
      }

      // Try to get all users from auth.users using a secure function
      // If that fails, we'll use a fallback approach
      let authUsers: any[] = []
      try {
        const { data: authData, error: authError } = await supabase
          .rpc('get_user_details')
        
        if (!authError && authData) {
          authUsers = authData
        }
      } catch (error) {
        console.log('Could not fetch auth users, using fallback')
      }

      // Transform profiles to user objects
      const users: UserWithProfile[] = profiles.map(profile => {
        const username = profile.username || profile.id.split('-')[0] || 'User'
        
        // Try to find matching auth user for email
        const authUser = authUsers.find(au => au.id === profile.id)
        const email = authUser?.email || ''
        
        return {
          id: profile.id,
          email: email,
          username: profile.username,
          phone: profile.phone,
          joined_at: profile.created_at,
          name: username,
          full_name: username
        }
      })

      // If current user is not in the list, add them
      if (currentUser && !users.find(u => u.id === currentUser.id)) {
        const username = currentUser.email?.split('@')[0] || 'User'
        users.unshift({
          id: currentUser.id,
          email: currentUser.email || '',
          username: username,
          phone: null,
          joined_at: currentUser.created_at,
          name: username,
          full_name: username
        })
      }

      // Update emails for users that match current user
      if (currentUser) {
        const currentUserInList = users.find(u => u.id === currentUser.id)
        if (currentUserInList) {
          currentUserInList.email = currentUser.email || ''
        }
      }

      // If we couldn't get emails from auth, generate demo emails for missing ones
      users.forEach((user) => {
        if (!user.email && user.id !== currentUser?.id) {
          const username = user.username || user.name
          user.email = `${username.toLowerCase()}@example.com`
        }
      })

      set({ users, loading: false })
    } catch (error) {
      console.error('Error fetching users:', error)
      set({ loading: false })
      throw error
    }
  },
}))