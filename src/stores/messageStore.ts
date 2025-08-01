import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface Message {
  id: string
  sender_id: string
  receiver_id: string | null
  project_id: string | null
  message: string
  created_at: string
}

type MessageInsert = Omit<Message, 'id' | 'created_at'>

interface MessageState {
  messages: Message[]
  loading: boolean
  fetchMessages: (projectId?: string) => Promise<void>
  sendMessage: (message: MessageInsert) => Promise<void>
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async (projectId?: string) => {
    set({ loading: true })
    
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      
      // If projectId is provided, filter by project, otherwise get all messages (global chat)
      if (projectId) {
        query = query.eq('project_id', projectId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ messages: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching messages:', error)
      set({ loading: false })
      throw error
    }
  },

  sendMessage: async (message: MessageInsert) => {
    try {
      const { data, error } = await (supabase as any)
        .from('messages')
        .insert([message])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        messages: [...state.messages, data]
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },
}))