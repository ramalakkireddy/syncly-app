
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          owner_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          team_id: string
          title: string
          description: string
          status: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          title: string
          description: string
          status: string
          tags: string[]
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          title?: string
          description?: string
          status?: string
          tags?: string[]
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          status: string
          due_date: string
          priority: string
          assigned_to: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description: string
          status: string
          due_date: string
          priority: string
          assigned_to: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string
          status?: string
          due_date?: string
          priority?: string
          assigned_to?: string
          created_at?: string
        }
      }
    }
  }
}
