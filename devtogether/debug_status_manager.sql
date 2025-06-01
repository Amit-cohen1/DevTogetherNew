-- Debug script to check status manager functionality
-- Run this in Supabase SQL Editor to troubleshoot the issue

-- 1. Check current RLS policies on projects table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects';

-- 2. Check if the user has status_manager = true for the specific project
-- Replace 'USER_ID_HERE' with the actual user ID and 'PROJECT_ID_HERE' with the project ID
SELECT 
    a.developer_id,
    a.project_id,
    a.status,
    a.status_manager,
    u.first_name,
    u.last_name,
    p.title as project_title
FROM applications a
JOIN users u ON u.id = a.developer_id  
JOIN projects p ON p.id = a.project_id
WHERE a.project_id = 'd1c8a473-e304-4b24-aef1-152bea9b1a0a'  -- Replace with your project ID
AND a.status = 'accepted';

-- 3. Test the RLS policy logic manually
-- Replace 'USER_ID_HERE' with the developer's user ID who should be a status manager
SELECT 
    'Can update?' as test,
    EXISTS (
        SELECT 1 
        FROM applications 
        WHERE applications.project_id = 'd1c8a473-e304-4b24-aef1-152bea9b1a0a'  -- Replace with your project ID
        AND applications.developer_id = 'USER_ID_HERE'  -- Replace with the user ID
        AND applications.status = 'accepted' 
        AND applications.status_manager = true
    ) as has_permission;

-- 4. Check current authentication state (run this while logged in as the status manager)
SELECT auth.uid() as current_user_id;

-- 5. Verify the project exists and show its organization_id
SELECT id, title, organization_id, status
FROM projects 
WHERE id = 'd1c8a473-e304-4b24-aef1-152bea9b1a0a';  -- Replace with your project ID 