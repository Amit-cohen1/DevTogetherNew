-- Migration: Add 'removed' status to applications.status
-- Created 2025-07-07

-- Drop existing CHECK constraint (if any)
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_status_check;

-- Re-create the constraint including the new value 'removed'
ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'removed')); 