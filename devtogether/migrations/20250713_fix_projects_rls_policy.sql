-- Migration: Final fix for projects RLS policy (no recursion, correct business logic, status manager via trigger)

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Safe update for admins, orgs, and status managers" ON public.projects;
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;
DROP POLICY IF EXISTS "Organizations and status managers can update projects" ON public.projects;
DROP POLICY IF EXISTS "Organizations can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Status managers can update their projects" ON public.projects;

-- 1. Admins can update any project (full control)
CREATE POLICY "Admins can update any project" ON public.projects
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (true);

-- 2. Organizations can update their own projects (but not set status to 'open')
CREATE POLICY "Organizations can update own projects" ON public.projects
    FOR UPDATE
    USING (auth.uid() = organization_id)
    WITH CHECK (
        auth.uid() = organization_id
        AND (status IS NULL OR status <> 'open')
    );

-- 3. Status managers update permission is enforced by trigger (not RLS, to avoid recursion)

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trg_status_manager_update ON public.projects;
DROP FUNCTION IF EXISTS allow_status_manager_update();

-- Create trigger function to allow status manager update (except status='open')
CREATE OR REPLACE FUNCTION allow_status_manager_update()
RETURNS TRIGGER AS $$
DECLARE
    is_status_manager BOOLEAN;
    is_admin BOOLEAN;
    is_org BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') INTO is_admin;
    -- Check if user is org owner
    SELECT (NEW.organization_id = auth.uid()) INTO is_org;
    -- Check if user is status manager for this project
    SELECT EXISTS (
        SELECT 1 FROM public.applications
        WHERE applications.project_id = NEW.id
          AND applications.developer_id = auth.uid()
          AND applications.status = 'accepted'
          AND applications.status_manager = true
    ) INTO is_status_manager;

    -- If user is admin or org, allow (RLS already covers their logic)
    IF is_admin OR is_org THEN
        RETURN NEW;
    END IF;

    -- If user is status manager, allow update except status='open'
    IF is_status_manager THEN
        IF NEW.status = 'open' THEN
            RAISE EXCEPTION 'Status managers cannot set status to open';
        END IF;
        RETURN NEW;
    END IF;

    -- Otherwise, block update
    RAISE EXCEPTION 'You do not have permission to update this project';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_status_manager_update
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION allow_status_manager_update();

-- Note: The resubmit trigger logic remains unchanged and enforces that only orgs can set status to 'pending' if previous status was 'rejected'. 