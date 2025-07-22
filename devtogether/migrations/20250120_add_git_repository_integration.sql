-- 20250120_add_git_repository_integration.sql
-- Git Repository Integration for Project Workspaces

-- ================================
-- 1. CREATE PROJECT_REPOSITORIES TABLE
-- ================================

CREATE TABLE IF NOT EXISTS project_repositories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Repository Information
    repository_name VARCHAR(255) NOT NULL,
    repository_url TEXT NOT NULL,
    repository_type VARCHAR(50) DEFAULT 'github' CHECK (repository_type IN ('github', 'gitlab', 'bitbucket', 'other')),
    
    -- GitHub/Git Provider Details
    provider_repo_id VARCHAR(255), -- GitHub repo ID for API calls
    owner_username VARCHAR(255),   -- GitHub username/organization
    default_branch VARCHAR(100) DEFAULT 'main',
    
    -- Connection Status
    connection_status VARCHAR(50) DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'pending')),
    last_sync_at TIMESTAMPTZ,
    sync_error_message TEXT,
    
    -- Repository Metadata
    is_private BOOLEAN DEFAULT true,
    description TEXT,
    language VARCHAR(100),
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    
    -- Access Control
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one repository per project for now
    UNIQUE(project_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_repositories_project_id ON project_repositories(project_id);
CREATE INDEX IF NOT EXISTS idx_project_repositories_provider_repo_id ON project_repositories(provider_repo_id);
CREATE INDEX IF NOT EXISTS idx_project_repositories_owner_username ON project_repositories(owner_username);

-- ================================
-- 2. CREATE REPOSITORY_COMMITS TABLE (for tracking recent activity)
-- ================================

CREATE TABLE IF NOT EXISTS repository_commits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES project_repositories(id) ON DELETE CASCADE,
    
    -- Commit Information
    commit_sha VARCHAR(40) NOT NULL,
    commit_message TEXT NOT NULL,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    author_username VARCHAR(255), -- GitHub username if available
    
    -- Commit Metadata
    commit_date TIMESTAMPTZ NOT NULL,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    changed_files INTEGER DEFAULT 0,
    
    -- Branch Information
    branch_name VARCHAR(100),
    
    -- Sync Information
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate commits
    UNIQUE(repository_id, commit_sha)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repository_commits_repository_id ON repository_commits(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_commits_commit_date ON repository_commits(commit_date DESC);
CREATE INDEX IF NOT EXISTS idx_repository_commits_author_username ON repository_commits(author_username);

-- ================================
-- 3. CREATE REPOSITORY_BRANCHES TABLE (for tracking branches)
-- ================================

CREATE TABLE IF NOT EXISTS repository_branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES project_repositories(id) ON DELETE CASCADE,
    
    -- Branch Information
    branch_name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_protected BOOLEAN DEFAULT false,
    
    -- Latest Commit
    latest_commit_sha VARCHAR(40),
    latest_commit_date TIMESTAMPTZ,
    
    -- Branch Status
    ahead_by INTEGER DEFAULT 0, -- commits ahead of default branch
    behind_by INTEGER DEFAULT 0, -- commits behind default branch
    
    -- Sync Information
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate branches
    UNIQUE(repository_id, branch_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repository_branches_repository_id ON repository_branches(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_branches_is_default ON repository_branches(is_default);

-- ================================
-- 4. CREATE REPOSITORY_CONTRIBUTORS TABLE (for tracking team contributions)
-- ================================

CREATE TABLE IF NOT EXISTS repository_contributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES project_repositories(id) ON DELETE CASCADE,
    
    -- Contributor Information
    github_username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    
    -- Contribution Stats
    total_commits INTEGER DEFAULT 0,
    total_additions INTEGER DEFAULT 0,
    total_deletions INTEGER DEFAULT 0,
    first_commit_date TIMESTAMPTZ,
    last_commit_date TIMESTAMPTZ,
    
    -- User Mapping (if contributor is a project team member)
    user_id UUID REFERENCES auth.users(id),
    
    -- Sync Information
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate contributors
    UNIQUE(repository_id, github_username)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repository_contributors_repository_id ON repository_contributors(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_contributors_user_id ON repository_contributors(user_id);
CREATE INDEX IF NOT EXISTS idx_repository_contributors_github_username ON repository_contributors(github_username);

-- ================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE project_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_contributors ENABLE ROW LEVEL SECURITY;

-- project_repositories policies
CREATE POLICY "project_repositories_select" ON project_repositories
    FOR SELECT USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Project team members can view repository information
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id = auth.uid()
            OR p.id IN (
                SELECT app.project_id FROM applications app 
                WHERE app.developer_id = auth.uid() 
                AND app.status = 'accepted'
            )
        )
    );

CREATE POLICY "project_repositories_insert" ON project_repositories
    FOR INSERT WITH CHECK (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Only project owners can add repositories
        project_id IN (SELECT id FROM projects WHERE organization_id = auth.uid())
    );

CREATE POLICY "project_repositories_update" ON project_repositories
    FOR UPDATE USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Project owners and status managers can update repository info
        project_id IN (SELECT id FROM projects WHERE organization_id = auth.uid())
        OR
        project_id IN (
            SELECT project_id FROM applications
            WHERE developer_id = auth.uid()
            AND status = 'accepted'
            AND status_manager = true
        )
    );

CREATE POLICY "project_repositories_delete" ON project_repositories
    FOR DELETE USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Only project owners can remove repositories
        project_id IN (SELECT id FROM projects WHERE organization_id = auth.uid())
    );

-- repository_commits policies (read-only for team members)
CREATE POLICY "repository_commits_select" ON repository_commits
    FOR SELECT USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Project team members can view commit history
        repository_id IN (
            SELECT pr.id FROM project_repositories pr
            JOIN projects p ON pr.project_id = p.id
            WHERE p.organization_id = auth.uid()
            OR p.id IN (
                SELECT app.project_id FROM applications app 
                WHERE app.developer_id = auth.uid() 
                AND app.status = 'accepted'
            )
        )
    );

-- Only system/sync processes should insert commits (via service role)
CREATE POLICY "repository_commits_insert" ON repository_commits
    FOR INSERT WITH CHECK (
        -- Admin access via JWT email or service role
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        (auth.role() = 'service_role')
    );

-- repository_branches policies (similar to commits)
CREATE POLICY "repository_branches_select" ON repository_branches
    FOR SELECT USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Project team members can view branch information
        repository_id IN (
            SELECT pr.id FROM project_repositories pr
            JOIN projects p ON pr.project_id = p.id
            WHERE p.organization_id = auth.uid()
            OR p.id IN (
                SELECT app.project_id FROM applications app 
                WHERE app.developer_id = auth.uid() 
                AND app.status = 'accepted'
            )
        )
    );

CREATE POLICY "repository_branches_insert" ON repository_branches
    FOR INSERT WITH CHECK (
        -- Admin access via JWT email or service role
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        (auth.role() = 'service_role')
    );

-- repository_contributors policies
CREATE POLICY "repository_contributors_select" ON repository_contributors
    FOR SELECT USING (
        -- Admin access via JWT email
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        -- Project team members can view contributor information
        repository_id IN (
            SELECT pr.id FROM project_repositories pr
            JOIN projects p ON pr.project_id = p.id
            WHERE p.organization_id = auth.uid()
            OR p.id IN (
                SELECT app.project_id FROM applications app 
                WHERE app.developer_id = auth.uid() 
                AND app.status = 'accepted'
            )
        )
    );

CREATE POLICY "repository_contributors_insert" ON repository_contributors
    FOR INSERT WITH CHECK (
        -- Admin access via JWT email or service role
        (COALESCE((auth.jwt() ->> 'email'::text), ''::text) = 'hananel12345@gmail.com'::text)
        OR
        (auth.role() = 'service_role')
    );

-- ================================
-- 6. CREATE FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_repositories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_project_repositories_updated_at
    BEFORE UPDATE ON project_repositories
    FOR EACH ROW
    EXECUTE FUNCTION update_project_repositories_updated_at();

-- ================================
-- 7. ADD REPOSITORY_ID TO PROJECTS TABLE (Optional Link)
-- ================================

-- Add optional repository reference to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS repository_id UUID REFERENCES project_repositories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projects_repository_id ON projects(repository_id);

-- ================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ================================

COMMENT ON TABLE project_repositories IS 'Git repositories linked to projects for version control integration';
COMMENT ON TABLE repository_commits IS 'Recent commit history synced from linked repositories';
COMMENT ON TABLE repository_branches IS 'Branch information for linked repositories';
COMMENT ON TABLE repository_contributors IS 'Contributor statistics and team member mapping';

COMMENT ON COLUMN project_repositories.provider_repo_id IS 'External repository ID from GitHub/GitLab API';
COMMENT ON COLUMN project_repositories.connection_status IS 'Current status of repository connection and sync';
COMMENT ON COLUMN repository_commits.commit_sha IS 'Git commit SHA hash (40 characters)';
COMMENT ON COLUMN repository_contributors.user_id IS 'Maps GitHub contributors to project team members';

-- ================================
-- 9. INITIAL DATA (if needed)
-- ================================

-- No initial data required - repositories will be connected by users

-- Migration completed successfully!
-- Next steps:
-- 1. Create GitRepositoryService for API interactions
-- 2. Implement GitHub API integration for repository management
-- 3. Create UI components for Git tab in project workspace
-- 4. Add background sync jobs for repository data 