-- Database fixes for Syncly App
-- Run this in your Supabase SQL editor

-- Fix user access and ensure proper RLS policies
-- This migration ensures we can fetch all users safely

-- Drop the existing view that might have issues
DROP VIEW IF EXISTS public.user_details;

-- Create a secure function to get user details
CREATE OR REPLACE FUNCTION public.get_user_details()
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  phone TEXT,
  joined_at TIMESTAMPTZ,
  full_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.username,
    p.phone,
    u.created_at as joined_at,
    COALESCE(p.username, split_part(u.email, '@', 1)) as full_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.confirmed_at IS NOT NULL
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_details() TO authenticated;

-- Create a secure view for user details
CREATE VIEW public.user_details AS
SELECT * FROM public.get_user_details();

-- Grant access to the view
GRANT SELECT ON public.user_details TO authenticated;

-- Update RLS policies for profiles to allow reading all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Ensure messages table has proper structure for global chat
-- Add project_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'project_id') THEN
    ALTER TABLE public.messages ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update messages RLS to allow reading all messages
DROP POLICY IF EXISTS "Users can view project messages" ON public.messages;
CREATE POLICY "Users can view all messages" 
  ON public.messages FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Ensure realtime is enabled for all necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks; 