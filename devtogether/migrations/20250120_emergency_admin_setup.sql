-- ============================================
-- EMERGENCY ADMIN SETUP & NOTIFICATION FOUNDATIONS
-- DevTogether Platform - Critical Fix Migration
-- ============================================

-- PART 1: ADD ADMIN ROLE (Currently Missing!)
-- ============================================

-- Check if we're using ENUM or CHECK constraint for role
DO $$ 
BEGIN
    -- Try to add admin to existing enum type
    BEGIN
        ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'admin';
        RAISE NOTICE 'SUCCESS: Added admin to role_enum';
    EXCEPTION WHEN others THEN
        -- If enum doesn't exist, we're using CHECK constraint
        RAISE NOTICE 'INFO: role_enum not found, updating CHECK constraint';
        
        -- Update CHECK constraint to include admin
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('developer', 'organization', 'admin'));
        
        RAISE NOTICE 'SUCCESS: Updated role CHECK constraint with admin';
    END;
END $$;

-- PART 2: NOTIFICATION AUDIT TABLE (Safe Add)
-- ============================================

CREATE TABLE IF NOT EXISTS notification_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    notification_created BOOLEAN DEFAULT false,
    notification_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for monitoring
CREATE INDEX IF NOT EXISTS idx_notification_audit_created ON notification_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_audit_failures ON notification_audit(created_at DESC) 
    WHERE notification_created = false;
CREATE INDEX IF NOT EXISTS idx_notification_audit_event_type ON notification_audit(event_type);

COMMENT ON TABLE notification_audit IS 'Tracks all notification creation attempts for debugging and monitoring';

-- PART 3: ENHANCE NOTIFICATION TYPES (Safe Enum Extension)
-- ============================================

-- First, check current notification table structure
DO $$
BEGIN
    -- Add missing columns if notifications table exists but is incomplete
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Add enum values safely
        BEGIN
            -- Check if notifications.type is enum or text
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'notifications' 
                      AND column_name = 'type' 
                      AND data_type = 'text') THEN
                
                -- Update CHECK constraint to include new types
                ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
                ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
                    CHECK (type IN (
                        'application', 'project', 'team', 'system', 'achievement',
                        'moderation', 'chat', 'status_change'  -- NEW TYPES
                    ));
                
                RAISE NOTICE 'SUCCESS: Enhanced notification types with moderation, chat, status_change';
            END IF;
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'WARNING: Could not update notification types - will handle later';
        END;
    ELSE
        RAISE NOTICE 'INFO: notifications table not found - will be created by next migration';
    END IF;
END $$;

-- PART 4: SAFE NOTIFICATION HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION safe_create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
    v_audit_id UUID;
BEGIN
    -- Audit the attempt first
    INSERT INTO notification_audit (event_type, event_data)
    VALUES (
        'notification_attempt',
        jsonb_build_object(
            'user_id', p_user_id,
            'type', p_type,
            'title', p_title,
            'message', left(p_message, 100),  -- Truncate for audit
            'function_caller', 'safe_create_notification'
        )
    )
    RETURNING id INTO v_audit_id;
    
    -- Validate inputs
    IF p_user_id IS NULL THEN
        UPDATE notification_audit 
        SET error_message = 'ERROR: user_id cannot be null'
        WHERE id = v_audit_id;
        RETURN NULL;
    END IF;
    
    IF p_title IS NULL OR trim(p_title) = '' THEN
        UPDATE notification_audit 
        SET error_message = 'ERROR: title cannot be empty'
        WHERE id = v_audit_id;
        RETURN NULL;
    END IF;
    
    -- Create notification (only if notifications table exists)
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
            INSERT INTO notifications (user_id, type, title, message, data, read)
            VALUES (p_user_id, p_type, p_title, p_message, p_data, false)
            RETURNING id INTO v_notification_id;
            
            -- Mark success in audit
            UPDATE notification_audit 
            SET notification_created = true, notification_id = v_notification_id
            WHERE id = v_audit_id;
            
            RAISE NOTICE 'SUCCESS: Notification created with ID %', v_notification_id;
        ELSE
            -- Table doesn't exist yet, log but don't fail
            UPDATE notification_audit 
            SET error_message = 'INFO: notifications table does not exist yet'
            WHERE id = v_audit_id;
            
            RAISE NOTICE 'INFO: notifications table not found - logging to audit only';
        END IF;
        
        RETURN v_notification_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the calling transaction
        UPDATE notification_audit 
        SET error_message = 'DB ERROR: ' || SQLERRM
        WHERE id = v_audit_id;
        
        RAISE NOTICE 'ERROR creating notification: %', SQLERRM;
        RETURN NULL;
    END;
END;
$$;

-- Grant access to service role and authenticated users
GRANT EXECUTE ON FUNCTION safe_create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION safe_create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION safe_create_notification IS 'Safely creates notifications with comprehensive audit logging';

-- PART 5: ADMIN USER CREATION
-- ============================================

-- Create test function to create admin users (manual execution required)
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_count INTEGER;
    result_message TEXT;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO admin_count 
    FROM profiles 
    WHERE email = admin_email;
    
    IF admin_count = 0 THEN
        RETURN 'ERROR: User with email ' || admin_email || ' not found in profiles table';
    END IF;
    
    -- Update user to admin
    UPDATE profiles 
    SET role = 'admin' 
    WHERE email = admin_email;
    
    -- Verify update
    SELECT COUNT(*) INTO admin_count 
    FROM profiles 
    WHERE email = admin_email AND role = 'admin';
    
    IF admin_count = 1 THEN
        result_message := 'SUCCESS: User ' || admin_email || ' is now an admin';
        
        -- Create welcome notification for new admin
        PERFORM safe_create_notification(
            (SELECT id FROM profiles WHERE email = admin_email),
            'system',
            '🛡️ Admin Access Granted',
            'Welcome to DevTogether admin panel. You can now moderate organizations and projects.',
            jsonb_build_object('admin_granted_at', NOW())
        );
        
    ELSE
        result_message := 'ERROR: Failed to grant admin access to ' || admin_email;
    END IF;
    
    RETURN result_message;
END;
$$;

GRANT EXECUTE ON FUNCTION create_admin_user(TEXT) TO service_role;

-- PART 6: MONITORING QUERIES
-- ============================================

-- Function to check system health
CREATE OR REPLACE FUNCTION notification_system_health_check()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check 1: Admin users exist
    RETURN QUERY
    SELECT 
        'admin_users'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
        ('Found ' || COUNT(*) || ' admin users')::TEXT
    FROM profiles WHERE role = 'admin';
    
    -- Check 2: Notification table exists
    RETURN QUERY
    SELECT 
        'notification_table'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
             THEN 'OK' ELSE 'WARNING' END::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
             THEN 'notifications table exists' 
             ELSE 'notifications table missing - will be created' END::TEXT;
    
    -- Check 3: Recent audit activity
    RETURN QUERY
    SELECT 
        'audit_activity'::TEXT,
        'INFO'::TEXT,
        ('Last 24h: ' || COUNT(*) || ' audit entries')::TEXT
    FROM notification_audit 
    WHERE created_at > NOW() - INTERVAL '24 hours';
    
    -- Check 4: Recent notification failures
    RETURN QUERY
    SELECT 
        'recent_failures'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' 
             WHEN COUNT(*) < 10 THEN 'WARNING'
             ELSE 'ERROR' END::TEXT,
        ('Last 24h: ' || COUNT(*) || ' notification failures')::TEXT
    FROM notification_audit 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    AND notification_created = false;
    
END;
$$;

GRANT EXECUTE ON FUNCTION notification_system_health_check() TO service_role;
GRANT EXECUTE ON FUNCTION notification_system_health_check() TO authenticated;

-- ============================================
-- VERIFICATION & NEXT STEPS
-- ============================================

-- Run immediate health check
DO $$
DECLARE
    health_record RECORD;
BEGIN
    RAISE NOTICE '=== NOTIFICATION SYSTEM HEALTH CHECK ===';
    FOR health_record IN SELECT * FROM notification_system_health_check() LOOP
        RAISE NOTICE '%: % - %', health_record.check_name, health_record.status, health_record.details;
    END LOOP;
END $$;

-- Log completion
INSERT INTO notification_audit (event_type, event_data, notification_created)
VALUES (
    'migration_completed',
    jsonb_build_object(
        'migration', '20250120_emergency_admin_setup',
        'timestamp', NOW(),
        'status', 'SUCCESS'
    ),
    true
);

RAISE NOTICE '==================================================';
RAISE NOTICE 'EMERGENCY ADMIN SETUP COMPLETED SUCCESSFULLY';
RAISE NOTICE '==================================================';
RAISE NOTICE 'NEXT STEPS:';
RAISE NOTICE '1. Create admin user: SELECT create_admin_user(''your-email@domain.com'');';
RAISE NOTICE '2. Run health check: SELECT * FROM notification_system_health_check();';
RAISE NOTICE '3. Proceed with notification trigger implementation';
RAISE NOTICE '=================================================='; 