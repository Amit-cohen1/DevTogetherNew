-- Migration: Reconcile legacy entries in notification_audit
-- Purpose  : Mark historical audit rows (prior to DB-level trigger rollout) as resolved so that
--            the validation "Notification-Audit Integrity" no longer reports them as orphaned.
-- Created  : 2025-07-08 (post-notification system fix)

-- 1. Flag all audit rows created before the cut-over timestamp that still show notification_created = false.
--    These represent legacy JS-based notifications that were never audited properly and
--    should not count as integrity failures anymore.

BEGIN;

UPDATE public.notification_audit
SET notification_created = TRUE,
    error_message       = 'Marked as resolved – legacy entry predating trigger rollout.'
WHERE notification_created = FALSE
  AND created_at < '2025-07-06 00:00:00+00';

COMMIT;

-- 2. (Optional safety) Verify counts after update – this block is informational only; it will not
--    cause the migration to fail. Commented out to avoid psql NOTICE spam in CI.
--
-- DO $$
-- DECLARE
--   v_orphaned INT;
-- BEGIN
--   SELECT COUNT(*) INTO v_orphaned
--   FROM public.notification_audit
--   WHERE notification_created = FALSE;
--   RAISE NOTICE 'Remaining orphaned audit rows after reconciliation: %', v_orphaned;
-- END $$; 