-- Add status manager permissions for updating projects
-- This allows developers with status_manager = true to update project status

-- Drop the existing update policy for projects
DROP POLICY IF EXISTS "Organizations can update own projects" ON public.projects;

-- Create a new policy that allows both organization owners and status managers to update projects
CREATE POLICY "Organizations and status managers can update projects" ON public.projects
    FOR UPDATE USING (
        -- Organization owners can update their own projects
        auth.uid() = organization_id 
        OR
        -- Status managers can update project status
        (
            auth.uid() IN (
                SELECT developer_id 
                FROM applications 
                WHERE project_id = projects.id 
                AND status = 'accepted' 
                AND status_manager = true
            )
        )
    );

-- Add comment for documentation
COMMENT ON POLICY "Organizations and status managers can update projects" ON public.projects IS 
'Allows organization owners and promoted status managers to update project information and status'; 