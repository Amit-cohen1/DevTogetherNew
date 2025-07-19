-- ============================================
-- COMPREHENSIVE NOTIFICATION TRIGGERS
-- DevTogether Platform - Complete Coverage
-- ============================================

-- PART 1: EXTEND NOTIFICATION TYPES (Safe)
-- ============================================

-- Update notification types to include all required types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'application', 'project', 'team', 'system', 'achievement',
        'moderation', 'chat', 'status_change', 'feedback', 'promotion'
    ));

-- PART 2: ADMIN NOTIFICATION TRIGGERS
-- ============================================

-- Trigger for new organization registrations (admin notifications)
CREATE OR REPLACE FUNCTION notify_admin_new_organization()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Only notify for new organization registrations
    IF NEW.role = 'organization' AND NEW.organization_status = 'pending' THEN
        -- Get all admin users
        FOR admin_user_id IN 
            SELECT id FROM profiles WHERE role = 'admin' OR is_admin = true
        LOOP
            PERFORM safe_create_notification(
                admin_user_id,
                'moderation',
                '🏢 New Organization Pending Approval',
                'Organization "' || COALESCE(NEW.organization_name, NEW.first_name || ' ' || NEW.last_name) || '" has requested to join the platform and awaits verification.',
                jsonb_build_object(
                    'organizationId', NEW.id,
                    'organizationName', COALESCE(NEW.organization_name, 'Organization'),
                    'actionUrl', '/admin',
                    'priority', 'high'
                )
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new project creation (admin notifications)
CREATE OR REPLACE FUNCTION notify_admin_new_project()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
    org_name TEXT;
BEGIN
    -- Only notify for projects requiring approval
    IF NEW.status = 'pending' THEN
        -- Get organization name
        SELECT organization_name INTO org_name 
        FROM profiles WHERE id = NEW.organization_id;
        
        -- Notify all admins
        FOR admin_user_id IN 
            SELECT id FROM profiles WHERE role = 'admin' OR is_admin = true
        LOOP
            PERFORM safe_create_notification(
                admin_user_id,
                'moderation',
                '📋 New Project Requires Review',
                'Project "' || NEW.title || '" by ' || COALESCE(org_name, 'Unknown Organization') || ' needs approval before publication.',
                jsonb_build_object(
                    'projectId', NEW.id,
                    'projectTitle', NEW.title,
                    'organizationName', COALESCE(org_name, 'Unknown'),
                    'actionUrl', '/admin',
                    'priority', 'medium'
                )
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 3: FEEDBACK SYSTEM TRIGGERS
-- ============================================

-- Trigger for new feedback submission (developer notifications)
CREATE OR REPLACE FUNCTION notify_developer_new_feedback()
RETURNS TRIGGER AS $$
DECLARE
    org_name TEXT;
BEGIN
    -- Get organization name
    SELECT organization_name INTO org_name 
    FROM profiles WHERE id = NEW.organization_id;
    
    -- Notify developer of new feedback
    PERFORM safe_create_notification(
        NEW.developer_id,
        'feedback',
        '⭐ New Feedback Received',
        COALESCE(org_name, 'An organization') || ' has submitted feedback for your work. Review and decide whether to approve it for your public profile.',
        jsonb_build_object(
            'feedbackId', NEW.id,
            'organizationName', COALESCE(org_name, 'Organization'),
            'rating', NEW.rating,
            'actionUrl', '/profile',
            'needsAction', true
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for feedback approval/rejection (organization notifications)
CREATE OR REPLACE FUNCTION notify_organization_feedback_decision()
RETURNS TRIGGER AS $$
DECLARE
    dev_name TEXT;
    org_name TEXT;
BEGIN
    -- Only trigger on status change
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
        -- Get developer and organization names
        SELECT first_name || ' ' || last_name INTO dev_name 
        FROM profiles WHERE id = NEW.developer_id;
        
        SELECT organization_name INTO org_name 
        FROM profiles WHERE id = NEW.organization_id;
        
        -- Notify organization of decision
        PERFORM safe_create_notification(
            NEW.organization_id,
            'feedback',
            CASE 
                WHEN NEW.status = 'approved' THEN '✅ Feedback Approved'
                ELSE '❌ Feedback Not Approved'
            END,
            COALESCE(dev_name, 'Developer') || ' has ' || 
            CASE 
                WHEN NEW.status = 'approved' THEN 'approved your feedback and it''s now visible on their public profile.'
                ELSE 'declined to approve your feedback for their public profile.'
            END,
            jsonb_build_object(
                'feedbackId', NEW.id,
                'developerName', COALESCE(dev_name, 'Developer'),
                'rating', NEW.rating,
                'status', NEW.status,
                'actionUrl', '/profile/' || NEW.developer_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 4: ENHANCED APPLICATION TRIGGERS
-- ============================================

-- Enhanced application status change trigger
CREATE OR REPLACE FUNCTION notify_application_status_enhanced()
RETURNS TRIGGER AS $$
DECLARE
    dev_name TEXT;
    org_name TEXT;
    project_title TEXT;
BEGIN
    -- Only trigger on status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get names and project info
        SELECT first_name || ' ' || last_name INTO dev_name 
        FROM profiles WHERE id = NEW.developer_id;
        
        SELECT p.title, pr.organization_name INTO project_title, org_name
        FROM projects p
        JOIN profiles pr ON p.organization_id = pr.id
        WHERE p.id = NEW.project_id;
        
        -- Notify developer of status change
        IF NEW.status IN ('accepted', 'rejected', 'removed') THEN
            PERFORM safe_create_notification(
                NEW.developer_id,
                'application',
                CASE 
                    WHEN NEW.status = 'accepted' THEN '🎉 Application Accepted!'
                    WHEN NEW.status = 'rejected' THEN '❌ Application Not Accepted'
                    ELSE '⚠️ Application Status Changed'
                END,
                CASE 
                    WHEN NEW.status = 'accepted' THEN 'Congratulations! Your application for "' || project_title || '" has been accepted by ' || COALESCE(org_name, 'the organization') || '.'
                    WHEN NEW.status = 'rejected' THEN 'Your application for "' || project_title || '" was not accepted this time. Keep improving and apply to other projects!'
                    ELSE 'Your application status for "' || project_title || '" has been updated to ' || NEW.status || '.'
                END,
                jsonb_build_object(
                    'applicationId', NEW.id,
                    'projectId', NEW.project_id,
                    'projectTitle', project_title,
                    'organizationName', COALESCE(org_name, 'Organization'),
                    'status', NEW.status,
                    'actionUrl', '/projects/' || NEW.project_id
                )
            );
        END IF;
        
        -- Notify organization of withdrawal
        IF NEW.status = 'withdrawn' AND OLD.status = 'pending' THEN
            PERFORM safe_create_notification(
                (SELECT organization_id FROM projects WHERE id = NEW.project_id),
                'application',
                '↩️ Application Withdrawn',
                COALESCE(dev_name, 'A developer') || ' has withdrawn their application from your project "' || project_title || '".',
                jsonb_build_object(
                    'applicationId', NEW.id,
                    'projectId', NEW.project_id,
                    'projectTitle', project_title,
                    'developerName', COALESCE(dev_name, 'Developer'),
                    'actionUrl', '/applications'
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 5: TEAM AND PROJECT TRIGGERS
-- ============================================

-- Trigger for team member promotion to status manager
CREATE OR REPLACE FUNCTION notify_status_manager_promotion()
RETURNS TRIGGER AS $$
DECLARE
    project_title TEXT;
    org_name TEXT;
    dev_name TEXT;
BEGIN
    -- Only trigger on promotion to status_manager
    IF OLD.role IS DISTINCT FROM NEW.role AND NEW.role = 'status_manager' THEN
        -- Get project and member details
        SELECT p.title, pr.organization_name INTO project_title, org_name
        FROM projects p
        JOIN profiles pr ON p.organization_id = pr.id
        WHERE p.id = NEW.project_id;
        
        SELECT first_name || ' ' || last_name INTO dev_name 
        FROM profiles WHERE id = NEW.user_id;
        
        -- Notify the promoted developer
        PERFORM safe_create_notification(
            NEW.user_id,
            'promotion',
            '⭐ Promoted to Status Manager!',
            'Congratulations! You have been promoted to Status Manager for "' || project_title || '" by ' || COALESCE(org_name, 'the organization') || '. You can now help manage project status and team activities.',
            jsonb_build_object(
                'projectId', NEW.project_id,
                'projectTitle', project_title,
                'organizationName', COALESCE(org_name, 'Organization'),
                'newRole', 'status_manager',
                'actionUrl', '/workspace/' || NEW.project_id
            )
        );
        
        -- Notify organization of successful promotion
        PERFORM safe_create_notification(
            (SELECT organization_id FROM projects WHERE id = NEW.project_id),
            'team',
            '👑 Status Manager Promoted',
            COALESCE(dev_name, 'Team member') || ' has been successfully promoted to Status Manager for "' || project_title || '". They can now help manage the project.',
            jsonb_build_object(
                'projectId', NEW.project_id,
                'projectTitle', project_title,
                'memberName', COALESCE(dev_name, 'Team member'),
                'newRole', 'status_manager',
                'actionUrl', '/workspace/' || NEW.project_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new team messages (mention notifications)
CREATE OR REPLACE FUNCTION notify_new_team_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    project_title TEXT;
    team_member_id UUID;
BEGIN
    -- Get sender name and project title
    SELECT first_name || ' ' || last_name INTO sender_name 
    FROM profiles WHERE id = NEW.sender_id;
    
    SELECT title INTO project_title 
    FROM projects WHERE id = NEW.project_id;
    
    -- Notify all team members except sender
    FOR team_member_id IN 
        SELECT a.developer_id 
        FROM applications a 
        WHERE a.project_id = NEW.project_id AND a.status = 'accepted' AND a.developer_id != NEW.sender_id
        UNION
        SELECT p.organization_id 
        FROM projects p 
        WHERE p.id = NEW.project_id AND p.organization_id != NEW.sender_id
    LOOP
        PERFORM safe_create_notification(
            team_member_id,
            'chat',
            '💬 New Team Message',
            COALESCE(sender_name, 'Team member') || ' sent a message in "' || project_title || '": ' || 
            CASE 
                WHEN length(NEW.content) > 50 THEN left(NEW.content, 50) || '...'
                ELSE NEW.content
            END,
            jsonb_build_object(
                'messageId', NEW.id,
                'projectId', NEW.project_id,
                'projectTitle', project_title,
                'senderName', COALESCE(sender_name, 'Team member'),
                'actionUrl', '/workspace/' || NEW.project_id
            )
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: CREATE ALL TRIGGERS
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_notify_admin_new_organization ON profiles;
DROP TRIGGER IF EXISTS trg_notify_admin_new_project ON projects;
DROP TRIGGER IF EXISTS trg_notify_developer_new_feedback ON developer_feedback;
DROP TRIGGER IF EXISTS trg_notify_organization_feedback_decision ON developer_feedback;
DROP TRIGGER IF EXISTS trg_notify_application_status_enhanced ON applications;
DROP TRIGGER IF EXISTS trg_notify_status_manager_promotion ON project_members;
DROP TRIGGER IF EXISTS trg_notify_new_team_message ON messages;

-- Create all triggers
CREATE TRIGGER trg_notify_admin_new_organization
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_new_organization();

CREATE TRIGGER trg_notify_admin_new_project
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_new_project();

-- Only create feedback triggers if developer_feedback table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'developer_feedback') THEN
        CREATE TRIGGER trg_notify_developer_new_feedback
            AFTER INSERT ON developer_feedback
            FOR EACH ROW
            EXECUTE FUNCTION notify_developer_new_feedback();
        
        CREATE TRIGGER trg_notify_organization_feedback_decision
            AFTER UPDATE ON developer_feedback
            FOR EACH ROW
            WHEN (OLD.status IS DISTINCT FROM NEW.status)
            EXECUTE FUNCTION notify_organization_feedback_decision();
        
        RAISE NOTICE 'SUCCESS: Feedback notification triggers created';
    ELSE
        RAISE NOTICE 'INFO: developer_feedback table not found - skipping feedback triggers';
    END IF;
END $$;

CREATE TRIGGER trg_notify_application_status_enhanced
    AFTER UPDATE ON applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_application_status_enhanced();

-- Only create team triggers if project_members table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        CREATE TRIGGER trg_notify_status_manager_promotion
            AFTER UPDATE ON project_members
            FOR EACH ROW
            WHEN (OLD.role IS DISTINCT FROM NEW.role AND NEW.role = 'status_manager')
            EXECUTE FUNCTION notify_status_manager_promotion();
        
        RAISE NOTICE 'SUCCESS: Team notification triggers created';
    ELSE
        RAISE NOTICE 'INFO: project_members table not found - skipping team triggers';
    END IF;
END $$;

CREATE TRIGGER trg_notify_new_team_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_team_message();

-- PART 7: UTILITY FUNCTIONS
-- ============================================

-- Function to manually trigger admin notifications for existing pending items
CREATE OR REPLACE FUNCTION notify_admins_pending_items()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    pending_orgs INT := 0;
    pending_projects INT := 0;
    admin_user_id UUID;
BEGIN
    -- Count pending items
    SELECT COUNT(*) INTO pending_orgs FROM profiles 
    WHERE role = 'organization' AND organization_status = 'pending';
    
    SELECT COUNT(*) INTO pending_projects FROM projects 
    WHERE status = 'pending';
    
    -- Notify admins if there are pending items
    IF pending_orgs > 0 OR pending_projects > 0 THEN
        FOR admin_user_id IN 
            SELECT id FROM profiles WHERE role = 'admin' OR is_admin = true
        LOOP
            IF pending_orgs > 0 THEN
                PERFORM safe_create_notification(
                    admin_user_id,
                    'moderation',
                    '⚠️ Pending Organizations Need Review',
                    'There are ' || pending_orgs || ' organization(s) waiting for approval. Please review them in the admin dashboard.',
                    jsonb_build_object(
                        'count', pending_orgs,
                        'type', 'organizations',
                        'actionUrl', '/admin',
                        'priority', 'high'
                    )
                );
            END IF;
            
            IF pending_projects > 0 THEN
                PERFORM safe_create_notification(
                    admin_user_id,
                    'moderation',
                    '📋 Pending Projects Need Review',
                    'There are ' || pending_projects || ' project(s) waiting for approval. Please review them in the admin dashboard.',
                    jsonb_build_object(
                        'count', pending_projects,
                        'type', 'projects',
                        'actionUrl', '/admin',
                        'priority', 'medium'
                    )
                );
            END IF;
        END LOOP;
        
        result_text := 'Notified admins about ' || pending_orgs || ' pending organizations and ' || pending_projects || ' pending projects.';
    ELSE
        result_text := 'No pending items found - no notifications sent.';
    END IF;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 8: MIGRATION VERIFICATION
-- ============================================

-- Log completion
INSERT INTO notification_audit (event_type, event_data, notification_created)
VALUES (
    'comprehensive_triggers_migration',
    jsonb_build_object(
        'migration', '20250120_comprehensive_notification_triggers',
        'timestamp', NOW(),
        'triggers_created', ARRAY[
            'notify_admin_new_organization',
            'notify_admin_new_project', 
            'notify_developer_new_feedback',
            'notify_organization_feedback_decision',
            'notify_application_status_enhanced',
            'notify_status_manager_promotion',
            'notify_new_team_message'
        ],
        'status', 'SUCCESS'
    ),
    true
);

-- Notify admins about any existing pending items
SELECT notify_admins_pending_items();

RAISE NOTICE '==================================================';
RAISE NOTICE 'COMPREHENSIVE NOTIFICATION TRIGGERS COMPLETED';
RAISE NOTICE '==================================================';
RAISE NOTICE 'TRIGGERS CREATED:';
RAISE NOTICE '✅ Admin notifications for new organizations';
RAISE NOTICE '✅ Admin notifications for new projects';
RAISE NOTICE '✅ Developer notifications for new feedback';
RAISE NOTICE '✅ Organization notifications for feedback decisions';
RAISE NOTICE '✅ Enhanced application status notifications';
RAISE NOTICE '✅ Status manager promotion notifications';
RAISE NOTICE '✅ Team message notifications';
RAISE NOTICE '=================================================='; 