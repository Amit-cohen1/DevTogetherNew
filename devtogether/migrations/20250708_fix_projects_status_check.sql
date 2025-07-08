-- Migration: Add 'pending' status to projects.status check constraint
-- Created: 2025-07-08

-- Drop existing CHECK constraint on projects.status
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_status_check;

-- Recreate constraint including 'pending'
ALTER TABLE public.projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('pending', 'open', 'in_progress', 'completed', 'cancelled')); 