-- Fix RLS policy for applications table to enable team member indicators
-- This allows public viewing of accepted applications while maintaining privacy for pending applications
-- Execute this in your Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Developers can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Applications are viewable by stakeholders" ON public.applications;

-- Create new policy that allows public viewing of accepted applications
CREATE POLICY "Applications visibility policy" ON public.applications
    FOR SELECT USING (
        -- Developers can always view their own applications (any status)
        auth.uid() = developer_id OR
        -- Organizations can view applications for their projects (any status)
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = applications.project_id 
            AND projects.organization_id = auth.uid()
        ) OR
        -- Anyone can view accepted applications (for team member indicators)
        applications.status = 'accepted'
    );

-- Ensure other policies remain secure
-- Keep existing insert policy
DROP POLICY IF EXISTS "Developers can create applications" ON public.applications;
CREATE POLICY "Developers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = developer_id AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'developer')
    );

-- Keep existing update policies
DROP POLICY IF EXISTS "Developers can update own applications" ON public.applications;
CREATE POLICY "Developers can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = developer_id);

DROP POLICY IF EXISTS "Organizations can update project applications" ON public.applications;
CREATE POLICY "Organizations can update project applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = applications.project_id 
            AND projects.organization_id = auth.uid()
        )
    );

-- Add delete policy for application withdrawal
DROP POLICY IF EXISTS "Applications deletion policy" ON public.applications;
CREATE POLICY "Applications deletion policy" ON public.applications
    FOR DELETE USING (
        -- Developers can delete their own applications
        auth.uid() = developer_id OR
        -- Organizations can delete applications for their projects
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = applications.project_id 
            AND projects.organization_id = auth.uid()
        )
    ); 