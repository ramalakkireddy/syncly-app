
import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    set({ user: data.user, session: data.session })
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    set({ user: data.user, session: data.session })
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    set({ user: null, session: null })
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    set({ 
      user: session?.user || null, 
      session, 
      loading: false 
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        user: session?.user || null, 
        session,
        loading: false 
      })
    })
  },
}))
