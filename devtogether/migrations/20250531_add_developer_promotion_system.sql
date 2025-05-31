-- Add status_manager field to applications table for developer promotions
-- This allows organizations to promote specific developers to manage project status updates

ALTER TABLE applications 
ADD COLUMN status_manager BOOLEAN DEFAULT FALSE;

-- Create index for performance when querying promoted developers
CREATE INDEX IF NOT EXISTS idx_applications_status_manager ON applications(project_id, status_manager) WHERE status_manager = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN applications.status_manager IS 'Indicates if this developer has been promoted to manage project status updates'; 