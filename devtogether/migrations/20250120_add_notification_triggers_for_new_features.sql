-- 20250120_add_notification_triggers_for_new_features.sql
-- Notification Triggers for Meeting Scheduling and File Uploads

-- ================================
-- 1. MEETING SCHEDULING NOTIFICATIONS
-- ================================

-- Function to create notification when a meeting is scheduled
CREATE OR REPLACE FUNCTION notify_meeting_scheduled()
RETURNS TRIGGER AS $$
DECLARE
    project_title TEXT;
    organizer_name TEXT;
    team_member_record RECORD;
BEGIN
    -- Get project title and organizer name
    SELECT p.title INTO project_title 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    SELECT COALESCE(pr.first_name || ' ' || pr.last_name, pr.organization_name, 'Unknown') 
    INTO organizer_name
    FROM profiles pr 
    WHERE pr.id = NEW.organizer_id;
    
    -- Notify all team members except the organizer
    FOR team_member_record IN
        SELECT DISTINCT developer_id as user_id
        FROM applications 
        WHERE project_id = NEW.project_id 
        AND status = 'accepted'
        AND developer_id != NEW.organizer_id
        
        UNION
        
        SELECT organization_id as user_id
        FROM projects 
        WHERE id = NEW.project_id
        AND organization_id != NEW.organizer_id
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            project_id,
            related_id,
            created_at
        ) VALUES (
            team_member_record.user_id,
            'meeting_scheduled',
            '📅 New Meeting Scheduled',
            organizer_name || ' scheduled a ' || NEW.meeting_type || ' meeting "' || NEW.title || '" for ' || project_title || ' on ' || 
            TO_CHAR(NEW.meeting_date AT TIME ZONE 'UTC', 'Mon DD, YYYY at HH:MI AM'),
            NEW.project_id,
            NEW.id,
            NOW()
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for meeting scheduled notifications
DROP TRIGGER IF EXISTS trigger_meeting_scheduled_notification ON project_meetings;
CREATE TRIGGER trigger_meeting_scheduled_notification
    AFTER INSERT ON project_meetings
    FOR EACH ROW
    EXECUTE FUNCTION notify_meeting_scheduled();

-- ================================
-- 2. MEETING UPDATE NOTIFICATIONS  
-- ================================

-- Function to create notification when a meeting is updated
CREATE OR REPLACE FUNCTION notify_meeting_updated()
RETURNS TRIGGER AS $$
DECLARE
    project_title TEXT;
    organizer_name TEXT;
    team_member_record RECORD;
    change_summary TEXT;
BEGIN
    -- Only notify for significant changes
    IF (OLD.meeting_date != NEW.meeting_date OR 
        OLD.title != NEW.title OR 
        OLD.status != NEW.status) THEN
        
        -- Get project title and organizer name
        SELECT p.title INTO project_title 
        FROM projects p 
        WHERE p.id = NEW.project_id;
        
        SELECT COALESCE(pr.first_name || ' ' || pr.last_name, pr.organization_name, 'Unknown') 
        INTO organizer_name
        FROM profiles pr 
        WHERE pr.id = NEW.organizer_id;
        
        -- Determine what changed
        change_summary := '';
        IF OLD.meeting_date != NEW.meeting_date THEN
            change_summary := 'rescheduled to ' || TO_CHAR(NEW.meeting_date AT TIME ZONE 'UTC', 'Mon DD at HH:MI AM');
        ELSIF OLD.status != NEW.status THEN
            change_summary := 'status changed to ' || NEW.status;
        ELSIF OLD.title != NEW.title THEN
            change_summary := 'details updated';
        END IF;
        
        -- Notify all team members except the person who made the change
        FOR team_member_record IN
            SELECT DISTINCT developer_id as user_id
            FROM applications 
            WHERE project_id = NEW.project_id 
            AND status = 'accepted'
            
            UNION
            
            SELECT organization_id as user_id
            FROM projects 
            WHERE id = NEW.project_id
        LOOP
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message,
                project_id,
                related_id,
                created_at
            ) VALUES (
                team_member_record.user_id,
                'meeting_updated',
                '📅 Meeting Updated',
                'Meeting "' || NEW.title || '" for ' || project_title || ' has been ' || change_summary,
                NEW.project_id,
                NEW.id,
                NOW()
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for meeting updated notifications
DROP TRIGGER IF EXISTS trigger_meeting_updated_notification ON project_meetings;
CREATE TRIGGER trigger_meeting_updated_notification
    AFTER UPDATE ON project_meetings
    FOR EACH ROW
    EXECUTE FUNCTION notify_meeting_updated();

-- ================================
-- 3. FILE UPLOAD NOTIFICATIONS
-- ================================

-- Function to create notification when a file is uploaded
CREATE OR REPLACE FUNCTION notify_file_uploaded()
RETURNS TRIGGER AS $$
DECLARE
    project_title TEXT;
    uploader_name TEXT;
    team_member_record RECORD;
    file_type_emoji TEXT;
BEGIN
    -- Get project title and uploader name
    SELECT p.title INTO project_title 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    SELECT COALESCE(pr.first_name || ' ' || pr.last_name, pr.organization_name, 'Someone') 
    INTO uploader_name
    FROM profiles pr 
    WHERE pr.id = NEW.uploader_id;
    
    -- Get appropriate emoji based on file type
    file_type_emoji := CASE 
        WHEN NEW.file_type LIKE 'image/%' THEN '🖼️'
        WHEN NEW.file_type LIKE 'video/%' THEN '🎥'
        WHEN NEW.file_type LIKE 'audio/%' THEN '🎵'
        WHEN NEW.file_type = 'application/pdf' THEN '📄'
        WHEN NEW.file_type LIKE 'text/%' THEN '📝'
        WHEN NEW.file_type LIKE 'application/zip%' OR NEW.file_type LIKE 'application/x-rar%' THEN '📦'
        ELSE '📁'
    END;
    
    -- Notify all team members except the uploader
    FOR team_member_record IN
        SELECT DISTINCT developer_id as user_id
        FROM applications 
        WHERE project_id = NEW.project_id 
        AND status = 'accepted'
        AND developer_id != NEW.uploader_id
        
        UNION
        
        SELECT organization_id as user_id
        FROM projects 
        WHERE id = NEW.project_id
        AND organization_id != NEW.uploader_id
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            project_id,
            related_id,
            created_at
        ) VALUES (
            team_member_record.user_id,
            'file_uploaded',
            file_type_emoji || ' New File Uploaded',
            uploader_name || ' uploaded "' || NEW.file_name || '" to ' || project_title,
            NEW.project_id,
            NEW.id,
            NOW()
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for file upload notifications
DROP TRIGGER IF EXISTS trigger_file_uploaded_notification ON project_files;
CREATE TRIGGER trigger_file_uploaded_notification
    AFTER INSERT ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION notify_file_uploaded();

-- ================================
-- 4. GIT REPOSITORY CONNECTION NOTIFICATIONS
-- ================================

-- Function to create notification when a repository is connected
CREATE OR REPLACE FUNCTION notify_repository_connected()
RETURNS TRIGGER AS $$
DECLARE
    project_title TEXT;
    connector_name TEXT;
    team_member_record RECORD;
    repo_icon TEXT;
BEGIN
    -- Get project title and connector name
    SELECT p.title INTO project_title 
    FROM projects p 
    WHERE p.id = NEW.project_id;
    
    SELECT COALESCE(pr.first_name || ' ' || pr.last_name, pr.organization_name, 'Someone') 
    INTO connector_name
    FROM profiles pr 
    WHERE pr.id = NEW.created_by;
    
    -- Get appropriate icon based on repository type
    repo_icon := CASE NEW.repository_type
        WHEN 'github' THEN '🐙'
        WHEN 'gitlab' THEN '🦊'
        WHEN 'bitbucket' THEN '🪣'
        ELSE '📂'
    END;
    
    -- Notify all team members except the person who connected the repository
    FOR team_member_record IN
        SELECT DISTINCT developer_id as user_id
        FROM applications 
        WHERE project_id = NEW.project_id 
        AND status = 'accepted'
        AND developer_id != NEW.created_by
        
        UNION
        
        SELECT organization_id as user_id
        FROM projects 
        WHERE id = NEW.project_id
        AND organization_id != NEW.created_by
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            project_id,
            related_id,
            created_at
        ) VALUES (
            team_member_record.user_id,
            'repository_connected',
            repo_icon || ' Repository Connected',
            connector_name || ' connected ' || NEW.repository_name || ' repository to ' || project_title,
            NEW.project_id,
            NEW.id,
            NOW()
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for repository connection notifications
DROP TRIGGER IF EXISTS trigger_repository_connected_notification ON project_repositories;
CREATE TRIGGER trigger_repository_connected_notification
    AFTER INSERT ON project_repositories
    FOR EACH ROW
    EXECUTE FUNCTION notify_repository_connected();

-- ================================
-- 5. UPDATE NOTIFICATION TYPES IN ENUM (if needed)
-- ================================

-- Add new notification types to the existing enum if they don't exist
-- Note: This assumes the notification type column accepts these values
-- If using a strict enum, you might need to ALTER TYPE to add new values

-- ================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================

-- Create indexes on new notification types for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_meeting_type 
ON notifications(type) WHERE type IN ('meeting_scheduled', 'meeting_updated');

CREATE INDEX IF NOT EXISTS idx_notifications_file_type 
ON notifications(type) WHERE type = 'file_uploaded';

CREATE INDEX IF NOT EXISTS idx_notifications_repository_type 
ON notifications(type) WHERE type = 'repository_connected';

-- ================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ================================

COMMENT ON FUNCTION notify_meeting_scheduled() IS 'Creates notifications when a new meeting is scheduled in a project';
COMMENT ON FUNCTION notify_meeting_updated() IS 'Creates notifications when a meeting is updated with significant changes';
COMMENT ON FUNCTION notify_file_uploaded() IS 'Creates notifications when a file is uploaded to a project';
COMMENT ON FUNCTION notify_repository_connected() IS 'Creates notifications when a Git repository is connected to a project';

-- Migration completed successfully!
-- New notification triggers are now active for:
-- - Meeting scheduling and updates
-- - File uploads
-- - Git repository connections 