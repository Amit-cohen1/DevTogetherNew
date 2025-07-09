-- Add 'rejected' status to projects.status
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check CHECK (status IN ('pending', 'open', 'in_progress', 'completed', 'cancelled', 'rejected'));

-- Add can_resubmit boolean (default true)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS can_resubmit BOOLEAN DEFAULT TRUE;

-- Ensure rejection_reason column exists (already present)
-- No destructive changes; migrate existing cancelled+rejection_reason to 'rejected' if needed
UPDATE public.projects
  SET status = 'rejected'
  WHERE status = 'cancelled' AND rejection_reason IS NOT NULL; 