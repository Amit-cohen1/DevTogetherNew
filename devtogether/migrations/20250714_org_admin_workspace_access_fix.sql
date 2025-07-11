-- Migration: Allow orgs to update admin workspace access fields on their own projects
-- This policy allows orgs to approve/deny admin workspace access as long as status is not changed

CREATE POLICY "Organizations can update admin workspace access fields" ON public.projects
    FOR UPDATE USING (
        auth.uid() = organization_id
        AND status = projects.status
    ); 