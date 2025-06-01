-- Fix the RLS policy for status managers to update projects
-- The previous policy had issues with the subquery reference

-- Drop the problematic policy
DROP POLICY IF EXISTS "Organizations and status managers can update projects" ON public.projects;

-- Create a corrected policy with proper subquery reference
CREATE POLICY "Organizations and status managers can update projects" ON public.projects
    FOR UPDATE USING (
        -- Organization owners can update their own projects
        auth.uid() = organization_id 
        OR
        -- Status managers can update project status
        EXISTS (
            SELECT 1 
            FROM applications 
            WHERE applications.project_id = projects.id 
            AND applications.developer_id = auth.uid()
            AND applications.status = 'accepted' 
            AND applications.status_manager = true
        )
    );

-- Add comment for documentation
COMMENT ON POLICY "Organizations and status managers can update projects" ON public.projects IS 
'Allows organization owners and promoted status managers to update project information and status'; 