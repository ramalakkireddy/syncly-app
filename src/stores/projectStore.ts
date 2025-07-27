
import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface Project {
  id: string
  team_id: string
  title: string
  description: string
  status: string
  tags: string[]
  created_at: string
}

interface ProjectState {
  projects: Project[]
  loading: boolean
  fetchProjects: (teamId: string) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async (teamId: string) => {
    set({ loading: true })
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    set({ projects: data || [], loading: false })
  },

  createProject: async (project) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()
    
    if (error) throw error
    
    set(state => ({
      projects: [data, ...state.projects]
    }))
  },

  updateProject: async (id, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    set(state => ({
      projects: state.projects.map(p => p.id === id ? data : p)
    }))
  },

  deleteProject: async (id) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    set(state => ({
      projects: state.projects.filter(p => p.id !== id)
    }))
  },
}))
