-- Migration: Project Status Change Notification Trigger
-- Created: 2025-07-09

CREATE OR REPLACE FUNCTION notify_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status AND OLD.status = 'pending' THEN
    IF NEW.status = 'open' THEN
      PERFORM safe_create_notification(
        NEW.organization_id,
        'status_change',
        'הפרויקט אושר!',
        NEW.title || ' אושר ועתה פומבי באתר.',
        jsonb_build_object('projectId', NEW.id)
      );
    ELSIF NEW.status = 'cancelled' THEN
      PERFORM safe_create_notification(
        NEW.organization_id,
        'status_change',
        'הפרויקט נדחה',
        NEW.title || ' נדחה. סיבה: ' || COALESCE(NEW.rejection_reason, ''),
        jsonb_build_object('projectId', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_project_status_change ON projects;
CREATE TRIGGER trg_notify_project_status_change
AFTER UPDATE ON projects
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status IN ('open', 'cancelled'))
EXECUTE FUNCTION notify_project_status_change(); 