-- ============================================
-- DevTogether Notification System Migration
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('application', 'project', 'team', 'system', 'achievement')),
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id, read, created_at DESC);

-- Create composite index for efficient unread count queries
CREATE INDEX IF NOT EXISTS notifications_user_unread_count_idx ON notifications(user_id) WHERE read = FALSE;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for any user (for automated notifications)
-- This allows the notification service to create notifications for users
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to clean up old notifications (optional)
-- This function can be called periodically to clean up old read notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE read = TRUE 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create helper function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO count_result
    FROM notifications
    WHERE user_id = target_user_id AND read = FALSE;
    
    RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- Create sample notifications for testing (optional - remove in production)
-- This will create some sample notifications for existing users to test the system
/*
INSERT INTO notifications (user_id, title, message, type, data) 
SELECT 
    id as user_id,
    'Welcome to DevTogether!' as title,
    'Your notification system is now active. You''ll receive updates about your projects and applications here.' as message,
    'system' as type,
    '{"source": "migration", "version": "1.0"}' as data
FROM auth.users 
WHERE id IN (SELECT DISTINCT id FROM profiles LIMIT 5);
*/

-- ============================================
-- Migration Verification Queries
-- ============================================

-- Verify table creation
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE 'SUCCESS: notifications table created';
    ELSE
        RAISE EXCEPTION 'FAILED: notifications table not created';
    END IF;
END $$;

-- Verify indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'notifications' AND indexname = 'notifications_user_id_idx') THEN
        RAISE NOTICE 'SUCCESS: notifications indexes created';
    ELSE
        RAISE EXCEPTION 'FAILED: notifications indexes not created';
    END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND rowsecurity = true) THEN
        RAISE NOTICE 'SUCCESS: RLS enabled on notifications table';
    ELSE
        RAISE EXCEPTION 'FAILED: RLS not enabled on notifications table';
    END IF;
END $$;

-- ============================================
-- Usage Examples and Documentation
-- ============================================

/*
-- Example: Create a notification
INSERT INTO notifications (user_id, title, message, type, data)
VALUES (
    'user-uuid-here',
    'New Application Received',
    'John Doe has applied to your project: Website Redesign',
    'application',
    '{"projectId": "project-uuid", "applicationId": "app-uuid", "developerName": "John Doe"}'
);

-- Example: Mark notification as read
UPDATE notifications 
SET read = TRUE, updated_at = NOW()
WHERE id = 'notification-uuid-here' AND user_id = 'user-uuid-here';

-- Example: Get unread count for user
SELECT get_unread_notification_count('user-uuid-here');

-- Example: Get recent notifications for user
SELECT * FROM notifications 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC 
LIMIT 20;

-- Example: Clean up old notifications
SELECT cleanup_old_notifications(30); -- Clean up notifications older than 30 days
*/

COMMIT; 