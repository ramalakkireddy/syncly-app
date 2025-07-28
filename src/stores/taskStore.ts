import { create } from 'zustand'
import { supabase } from '../integrations/supabase/client'

interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasks: (projectId: string) => Promise<void>
  createTask: (task: TaskInsert) => Promise<void>
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (projectId: string) => {
    set({ loading: true })
    
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ tasks: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      set({ loading: false })
      throw error
    }
  },

  createTask: async (task: TaskInsert) => {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .insert([task])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        tasks: [data, ...state.tasks]
      }))
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  updateTask: async (id: string, updates: TaskUpdate) => {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? data : t)
      }))
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  deleteTask: async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  },
}))