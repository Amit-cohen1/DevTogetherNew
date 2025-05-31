-- Fix RLS policies for applications table to prevent 406 errors
-- The issue occurs when developers check if they've applied to a project
-- Execute this in your Supabase SQL Editor

-- Drop and recreate the SELECT policy for applications to ensure proper access
DROP POLICY IF EXISTS "Developers can view own applications" ON public.applications;

-- Create more explicit policy for viewing applications
CREATE POLICY "Applications are viewable by stakeholders" ON public.applications
    FOR SELECT USING (
        -- Developers can view their own applications
        auth.uid() = developer_id OR
        -- Organizations can view applications for their projects
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = applications.project_id 
            AND projects.organization_id = auth.uid()
        )
    );

-- Ensure the policy for creating applications is correct
DROP POLICY IF EXISTS "Developers can create applications" ON public.applications;

CREATE POLICY "Developers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = developer_id AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'developer')
    );

-- Ensure update policies are correct
DROP POLICY IF EXISTS "Developers can update own applications" ON public.applications;
DROP POLICY IF EXISTS "Organizations can update project applications" ON public.applications;

CREATE POLICY "Developers can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Organizations can update project applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = applications.project_id 
            AND projects.organization_id = auth.uid()
        )
    );

-- Add a delete policy for applications (for withdrawal)
DROP POLICY IF EXISTS "Developers can delete own applications" ON public.applications;

CREATE POLICY "Developers can delete own applications" ON public.applications
    FOR DELETE USING (auth.uid() = developer_id); 