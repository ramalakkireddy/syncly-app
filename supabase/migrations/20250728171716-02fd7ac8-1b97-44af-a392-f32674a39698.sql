-- Create users table for team members
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_projects table for team membership
CREATE TABLE public.user_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- creator, member
  UNIQUE(user_id, project_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started', -- Not Started, Started, In Progress, Pending, Completed
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for team chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for project-wide messages
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Authenticated users can view users" 
  ON public.users FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create users" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update users" 
  ON public.users FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- RLS Policies for user_projects
CREATE POLICY "Authenticated users can view user_projects" 
  ON public.user_projects FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create user_projects" 
  ON public.user_projects FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update user_projects" 
  ON public.user_projects FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete user_projects" 
  ON public.user_projects FOR DELETE 
  USING (auth.role() = 'authenticated');

-- RLS Policies for tasks
CREATE POLICY "Authenticated users can view tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.role() = 'authenticated');

-- RLS Policies for messages
CREATE POLICY "Authenticated users can view messages" 
  ON public.messages FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update messages" 
  ON public.messages FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete messages" 
  ON public.messages FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Insert demo users for testing
INSERT INTO public.users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Mike Johnson', 'mike@example.com');

-- Create trigger to auto-update updated_at for tasks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();