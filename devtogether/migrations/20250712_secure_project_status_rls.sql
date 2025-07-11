-- Migration: Secure Project Status Updates (RLS)
-- Enforce that only admins can set status to 'open', and organizations can only set status to 'pending' if resubmitting from 'rejected'.

-- Drop the old update policy if exists
DROP POLICY IF EXISTS "Organizations and status managers can update projects" ON public.projects;

-- Create the new secure update policy
CREATE POLICY "Organizations and status managers can update projects" ON public.projects
    FOR UPDATE USING (
        -- Admins can update any project
        (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        OR
        -- Organizations can update their own projects, but with status restrictions
        (
            auth.uid() = organization_id
            AND (
                -- Allow resubmit: only allow status change to 'pending' if previous status was 'rejected'
                (new.status = 'pending' AND old.status = 'rejected')
                -- Allow all other status changes except to 'pending' or 'open'
                OR (new.status NOT IN ('pending', 'open'))
            )
        )
        -- Status managers logic can be added here if needed
    );

-- Add a comment for documentation
COMMENT ON POLICY "Organizations and status managers can update projects" ON public.projects IS 
'Only admins can set status to open. Organizations can only set status to pending if resubmitting from rejected. Otherwise, organizations cannot set status to pending or open.'; 