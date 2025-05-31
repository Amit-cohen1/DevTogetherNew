-- Create team_activities table for tracking team events and activities
CREATE TABLE IF NOT EXISTS team_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('member_joined', 'member_left', 'member_removed', 'project_updated', 'message_sent', 'milestone_reached')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_activities_project_id ON team_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_user_id ON team_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_created_at ON team_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_team_activities_type ON team_activities(activity_type);

-- Enable RLS
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_activities
-- Team members can view activities for their projects
CREATE POLICY "Team members can view team activities" ON team_activities
    FOR SELECT
    USING (
        project_id IN (
            -- Organization owners can see all activities for their projects
            SELECT id FROM projects WHERE organization_id = auth.uid()
            UNION
            -- Developers can see activities for projects they're part of (accepted applications)
            SELECT project_id FROM applications 
            WHERE developer_id = auth.uid() AND status = 'accepted'
        )
    );

-- Team members can create activity logs for their projects
CREATE POLICY "Team members can create team activities" ON team_activities
    FOR INSERT
    WITH CHECK (
        project_id IN (
            -- Organization owners can create activities for their projects
            SELECT id FROM projects WHERE organization_id = auth.uid()
            UNION
            -- Developers can create activities for projects they're part of
            SELECT project_id FROM applications 
            WHERE developer_id = auth.uid() AND status = 'accepted'
        )
    );

-- Enable realtime for team activities
ALTER PUBLICATION supabase_realtime ADD TABLE team_activities; 