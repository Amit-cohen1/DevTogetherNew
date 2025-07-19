-- Migration: 20250108_critical_security_fix_admin_self_promotion.sql
-- Purpose: Fix critical security vulnerability allowing self-promotion to admin
-- Issue: Users could execute UPDATE profiles SET role = 'admin' WHERE id = auth.uid()
-- Severity: CRITICAL - Complete platform takeover possible

-- CRITICAL SECURITY FIX: Prevent self-promotion to admin
-- This replaces the vulnerable prevent_non_admin_role_change function
CREATE OR REPLACE FUNCTION prevent_non_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow role/is_admin change on INSERT (new user registration)
  IF TG_OP = 'INSERT' THEN
    -- Block admin creation during registration unless done by existing admin
    IF (NEW.role = 'admin' OR NEW.is_admin IS TRUE) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles AS p
        WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin IS TRUE)
      ) THEN
        RAISE EXCEPTION 'Only existing admins can create new admin accounts during registration.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE, strict validation for role/admin changes
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_admin IS DISTINCT FROM OLD.is_admin) THEN
    
    -- SECURITY FIX: Block self-promotion to admin (CRITICAL VULNERABILITY PATCH)
    IF (auth.uid() = NEW.id) AND (
      (NEW.role = 'admin' AND COALESCE(OLD.role, '') != 'admin') OR
      (NEW.is_admin IS TRUE AND COALESCE(OLD.is_admin, FALSE) IS FALSE)
    ) THEN
      RAISE EXCEPTION 'SECURITY: Cannot promote yourself to admin. Admin privileges must be granted by existing admins.';
    END IF;
    
    -- SECURITY: Block self-demotion from admin (prevents admin lockout)
    IF (auth.uid() = NEW.id) AND (
      (OLD.role = 'admin' AND NEW.role != 'admin') OR
      (OLD.is_admin IS TRUE AND NEW.is_admin IS NOT TRUE)
    ) THEN
      RAISE EXCEPTION 'SECURITY: Admins cannot demote themselves. Admin removal must be performed by other admins.';
    END IF;
    
    -- Only existing admins can change role/admin status of others
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin IS TRUE)
    ) THEN
      RAISE EXCEPTION 'Only admins can change role or admin privileges.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log this critical security fix
INSERT INTO notification_audit (event_type, event_data, notification_created)
VALUES (
  'critical_security_fix_applied',
  jsonb_build_object(
    'fix_type', 'admin_self_promotion_vulnerability',
    'severity', 'CRITICAL',
    'description', 'Patched vulnerability allowing users to promote themselves to admin',
    'function_updated', 'prevent_non_admin_role_change',
    'migration_date', NOW(),
    'security_impact', 'Prevented complete platform takeover',
    'cve_equivalent', 'Privilege Escalation'
  ),
  true
);

-- Verify the fix is applied
DO $$
BEGIN
  RAISE NOTICE 'CRITICAL SECURITY FIX APPLIED: Admin self-promotion vulnerability patched.';
  RAISE NOTICE 'Function updated: prevent_non_admin_role_change()';
  RAISE NOTICE 'Users can no longer promote themselves to admin role.';
END $$; 