-- Temporary simplified fix for testing status manager functionality
-- This temporarily allows all authenticated users to update projects for testing
-- DO NOT USE IN PRODUCTION - this is just for debugging

-- Drop the current policy
DROP POLICY IF EXISTS "Organizations and status managers can update projects" ON public.projects;

-- Create a temporary permissive policy for testing
CREATE POLICY "Temporary - Allow authenticated users to update projects" ON public.projects
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Note: Remember to restore proper security after testing!
-- Run the debug script first, then try this temporary fix to isolate the issue 