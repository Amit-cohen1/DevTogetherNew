-- File Sharing System Migration
-- Creates project_files table and storage bucket for workspace file sharing

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT CHECK (category IN ('attachment', 'document', 'image', 'other')) DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploader_id ON project_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON project_files(category);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_project_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_project_files_updated_at();

-- RLS Policies for project_files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view files in projects they have access to
CREATE POLICY "view_project_files" ON project_files
    FOR SELECT USING (
        -- Project owner can view all files
        project_id IN (
            SELECT id FROM projects WHERE organization_id = auth.uid()
        )
        OR
        -- Team members (accepted developers) can view files
        project_id IN (
            SELECT project_id FROM applications 
            WHERE developer_id = auth.uid() AND status = 'accepted'
        )
        OR
        -- Admin can view all files
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can upload files to projects they have access to
CREATE POLICY "upload_project_files" ON project_files
    FOR INSERT WITH CHECK (
        -- Project owner can upload files
        project_id IN (
            SELECT id FROM projects WHERE organization_id = auth.uid()
        )
        OR
        -- Team members (accepted developers) can upload files
        project_id IN (
            SELECT project_id FROM applications 
            WHERE developer_id = auth.uid() AND status = 'accepted'
        )
    );

-- Policy: Users can only delete their own files OR project owners can delete any file
CREATE POLICY "delete_project_files" ON project_files
    FOR DELETE USING (
        -- File uploader can delete their own files
        uploader_id = auth.uid()
        OR
        -- Project owner can delete any file in their project
        project_id IN (
            SELECT id FROM projects WHERE organization_id = auth.uid()
        )
        OR
        -- Admin can delete any file
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for project files (this needs to be run manually in Supabase dashboard)
-- Storage bucket creation via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-files',
    'project-files',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'text/markdown',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/javascript', 'text/typescript', 'text/css', 'text/html', 'application/json',
        'text/x-python', 'text/x-java', 'text/x-c', 'text/x-php',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Storage bucket RLS policies
-- Policy: Allow users to upload files to projects they have access to
CREATE POLICY "upload_project_files_storage" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-files' AND
        (
            -- Extract project ID from path and check if user has access
            SPLIT_PART(name, '/', 2) IN (
                -- Project owner can upload
                SELECT id::text FROM projects WHERE organization_id = auth.uid()
                UNION
                -- Team members can upload
                SELECT project_id::text FROM applications 
                WHERE developer_id = auth.uid() AND status = 'accepted'
            )
        )
    );

-- Policy: Allow users to view files from projects they have access to  
CREATE POLICY "view_project_files_storage" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-files' AND
        (
            -- Extract project ID from path and check if user has access
            SPLIT_PART(name, '/', 2) IN (
                -- Project owner can view
                SELECT id::text FROM projects WHERE organization_id = auth.uid()
                UNION
                -- Team members can view
                SELECT project_id::text FROM applications 
                WHERE developer_id = auth.uid() AND status = 'accepted'
                UNION
                -- Admin can view all
                SELECT id::text FROM projects WHERE EXISTS (
                    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Policy: Allow users to delete files they uploaded OR project owners can delete any file
CREATE POLICY "delete_project_files_storage" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'project-files' AND
        (
            -- File belongs to projects the user owns
            SPLIT_PART(name, '/', 2) IN (
                SELECT id::text FROM projects WHERE organization_id = auth.uid()
            )
            OR
            -- Admin can delete any file
            EXISTS (
                SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Add message attachments support (optional - for linking files to messages)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_id UUID REFERENCES project_files(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_attachment_id ON messages(attachment_id) WHERE attachment_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE project_files IS 'Stores metadata for files shared in project workspaces';
COMMENT ON COLUMN project_files.category IS 'File category for organization and filtering';
COMMENT ON COLUMN project_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN project_files.file_url IS 'Public URL from Supabase Storage';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'File sharing system migration completed successfully!';
    RAISE NOTICE 'Note: Storage bucket "project-files" may need to be created manually in Supabase dashboard if it does not exist.';
END $$; 