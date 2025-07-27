
import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface Project {
  id: string
  team_id: string
  title: string
  description: string | null
  status: string
  tags: string[]
  created_at: string
  updated_at: string
}

type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
type ProjectUpdate = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>

interface ProjectState {
  projects: Project[]
  loading: boolean
  fetchProjects: (teamId: string) => Promise<void>
  createProject: (project: ProjectInsert) => Promise<void>
  updateProject: (id: string, updates: ProjectUpdate) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async (teamId: string) => {
    set({ loading: true })
    
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ projects: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching projects:', error)
      set({ loading: false })
      throw error
    }
  },

  createProject: async (project) => {
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .insert([project])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        projects: [data, ...state.projects]
      }))
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  updateProject: async (id, updates) => {
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        projects: state.projects.map(p => p.id === id ? data : p)
      }))
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  deleteProject: async (id) => {
    try {
      const { error } = await (supabase as any)
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },
}))
