-- Fix RLS policy for projects table to allow team members to view projects they're part of
-- This resolves the 403 error when organization users try to access project workspaces

-- Drop existing policy
DROP POLICY IF EXISTS "Open projects are viewable by everyone" ON public.projects;

-- Create updated policy that allows:
-- 1. Everyone to view open projects
-- 2. Organization owners to view their own projects (any status)
-- 3. Developers with accepted applications to view projects they're part of (any status)
CREATE POLICY "Projects are viewable by everyone for open projects and team members for any status" 
ON public.projects
FOR SELECT USING (
    status = 'open' OR 
    auth.uid() = organization_id OR
    auth.uid() IN (
        SELECT developer_id 
        FROM public.applications 
        WHERE project_id = projects.id 
        AND status = 'accepted'
    )
);

-- Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY; 