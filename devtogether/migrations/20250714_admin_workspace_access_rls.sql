-- Migration: Admin Workspace Access RLS Policy
-- Allow admins to view project data only if admin_workspace_access_granted = true

CREATE POLICY "Admins can view project if workspace access granted"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
  AND admin_workspace_access_granted = true
);

-- Do not drop or alter existing SELECT policies for orgs, team members, or open projects.
-- This policy is additive and ensures DB-level enforcement for admin workspace access. 