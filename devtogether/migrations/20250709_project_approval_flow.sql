-- Migration: Project Approval Flow (admin_pending_projects view + approve/reject RPCs)
-- Created: 2025-07-09

-- 1. View: admin_pending_projects
CREATE OR REPLACE VIEW admin_pending_projects AS
SELECT
  p.id,
  p.title,
  p.description,
  p.difficulty_level,
  p.status,
  p.created_at,
  org.organization_name,
  org.email AS organization_email,
  EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 AS hours_waiting
FROM projects p
JOIN profiles org ON p.organization_id = org.id
WHERE p.status = 'pending';

-- 2. Approve Project Function
CREATE OR REPLACE FUNCTION approve_project(project_id uuid, admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _updated BOOLEAN;
BEGIN
  UPDATE projects
  SET status = 'open',
      approved_by = admin_id,
      approved_at = NOW(),
      rejection_reason = NULL
  WHERE id = project_id
  RETURNING TRUE INTO _updated;

  IF _updated IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Project not found');
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION approve_project(uuid, uuid) TO anon, authenticated;

-- 3. Reject Project Function
CREATE OR REPLACE FUNCTION reject_project(project_id uuid, admin_id uuid, reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _updated BOOLEAN;
BEGIN
  UPDATE projects
  SET status = 'cancelled',
      approved_by = NULL,
      approved_at = NULL,
      rejection_reason = reason
  WHERE id = project_id
  RETURNING TRUE INTO _updated;

  IF _updated IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Project not found');
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION reject_project(uuid, uuid, text) TO anon, authenticated; 