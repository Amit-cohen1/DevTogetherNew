-- Migration: Add Meeting Status Automation and Notifications
-- Date: 2025-01-20
-- Description: Add triggers and functions for automatic meeting status updates and real-time notifications

-- Function to automatically update meeting status based on time
CREATE OR REPLACE FUNCTION update_meeting_status()
RETURNS void AS $$
BEGIN
    -- Update meetings to 'in_progress' if they've started and are still within duration
    UPDATE project_meetings 
    SET status = 'in_progress'
    WHERE status = 'scheduled'
    AND meeting_date <= NOW()
    AND (meeting_date + INTERVAL '1 minute' * duration_minutes) > NOW();

    -- Update meetings to 'completed' if they've ended
    UPDATE project_meetings 
    SET status = 'completed'
    WHERE status = 'in_progress'
    AND (meeting_date + INTERVAL '1 minute' * duration_minutes) <= NOW();

    -- Log the updates
    RAISE NOTICE 'Meeting statuses updated at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to send meeting notifications
CREATE OR REPLACE FUNCTION notify_meeting_events()
RETURNS trigger AS $$
DECLARE
    project_title TEXT;
    notification_message TEXT;
    team_member RECORD;
BEGIN
    -- Get project title
    SELECT title INTO project_title 
    FROM projects 
    WHERE id = NEW.project_id;

    -- Different notifications based on status change
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'in_progress' THEN
                notification_message := 'Meeting "' || NEW.title || '" has started in project ' || project_title;
            WHEN 'completed' THEN
                notification_message := 'Meeting "' || NEW.title || '" has ended in project ' || project_title;
            ELSE
                notification_message := 'Meeting "' || NEW.title || '" status updated to ' || NEW.status || ' in project ' || project_title;
        END CASE;

        -- Insert notifications for all team members
        FOR team_member IN 
            SELECT DISTINCT a.developer_id as user_id
            FROM applications a
            WHERE a.project_id = NEW.project_id 
            AND a.status = 'accepted'
            UNION
            SELECT p.organization_id as user_id
            FROM projects p 
            WHERE p.id = NEW.project_id
        LOOP
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type,
                related_id,
                created_at
            ) VALUES (
                team_member.user_id,
                'Meeting Update',
                notification_message,
                'meeting_update',
                NEW.id,
                NOW()
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meeting status notifications
DROP TRIGGER IF EXISTS meeting_status_notification_trigger ON project_meetings;
CREATE TRIGGER meeting_status_notification_trigger
    AFTER UPDATE ON project_meetings
    FOR EACH ROW
    EXECUTE FUNCTION notify_meeting_events();

-- Function to check for meetings starting soon (within 5 minutes)
CREATE OR REPLACE FUNCTION notify_meetings_starting_soon()
RETURNS void AS $$
DECLARE
    meeting_record RECORD;
    project_title TEXT;
    notification_message TEXT;
    team_member RECORD;
BEGIN
    -- Find meetings starting within the next 5 minutes
    FOR meeting_record IN 
        SELECT * FROM project_meetings 
        WHERE status = 'scheduled'
        AND meeting_date > NOW()
        AND meeting_date <= NOW() + INTERVAL '5 minutes'
        AND NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE related_id = project_meetings.id::text 
            AND type = 'meeting_reminder'
            AND created_at > NOW() - INTERVAL '10 minutes'
        )
    LOOP
        -- Get project title
        SELECT title INTO project_title 
        FROM projects 
        WHERE id = meeting_record.project_id;

        notification_message := 'Meeting "' || meeting_record.title || '" starts in 5 minutes in project ' || project_title;

        -- Insert notifications for all team members
        FOR team_member IN 
            SELECT DISTINCT a.developer_id as user_id
            FROM applications a
            WHERE a.project_id = meeting_record.project_id 
            AND a.status = 'accepted'
            UNION
            SELECT p.organization_id as user_id
            FROM projects p 
            WHERE p.id = meeting_record.project_id
        LOOP
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type,
                related_id,
                created_at
            ) VALUES (
                team_member.user_id,
                'Meeting Reminder',
                notification_message,
                'meeting_reminder',
                meeting_record.id,
                NOW()
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to be called periodically to update meeting statuses and send reminders
CREATE OR REPLACE FUNCTION process_meeting_automation()
RETURNS void AS $$
BEGIN
    -- Update meeting statuses
    PERFORM update_meeting_status();
    
    -- Send reminders for meetings starting soon
    PERFORM notify_meetings_starting_soon();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_meeting_status() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_meeting_events() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_meetings_starting_soon() TO authenticated;
GRANT EXECUTE ON FUNCTION process_meeting_automation() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION process_meeting_automation() IS 'Call this function periodically (every minute) to automatically update meeting statuses and send reminders';

-- Create an index for better performance on meeting status queries
CREATE INDEX IF NOT EXISTS idx_project_meetings_status_date 
ON project_meetings (status, meeting_date);

-- Create an index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_related_type 
ON notifications (related_id, type, created_at);

COMMIT; 