-- Migration: Fix notification_dashboard system_status logic
-- Only show WARNING if there are failures in the last hour, else HEALTHY
-- Created: 2025-07-08

DROP VIEW IF EXISTS notification_dashboard;

CREATE VIEW notification_dashboard AS
SELECT
  n.total_notifications,
  n.last_hour,
  n.last_24h,
  n.last_7d,
  jsonb_build_object(
    'application', n.application_count,
    'moderation', n.moderation_count,
    'project', n.project_count,
    'team', n.team_count,
    'system', n.system_count,
    'achievement', n.achievement_count,
    'chat', n.chat_count,
    'status_change', n.status_change_count
  ) AS notification_types,
  a.success_rate_percentage,
  a.events_with_errors,
  a.recent_failures,
  n.avg_creation_time_seconds,
  CASE
    WHEN (
      SELECT COUNT(*) FROM notification_audit 
      WHERE notification_created = FALSE 
        AND created_at > now() - interval '1 hour'
    ) > 0 THEN 'WARNING'
    WHEN (a.success_rate_percentage < 95) THEN 'WARNING'
    WHEN (n.avg_creation_time_seconds > 1.0) THEN 'WARNING'
    ELSE 'HEALTHY'
  END AS system_status,
  (
    SELECT count(*) FROM notifications
    WHERE created_at >= (now() - interval '48 hours')
      AND created_at <= (now() - interval '24 hours')
  ) AS previous_24h,
  n.last_updated
FROM notification_health_stats n
CROSS JOIN notification_audit_health a; 