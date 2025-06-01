-- Add profile enhancement columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Create profile analytics table
CREATE TABLE IF NOT EXISTS profile_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    view_date TIMESTAMPTZ DEFAULT NOW(),
    view_type TEXT CHECK (view_type IN ('direct', 'shared_link', 'search')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for profile_analytics
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to view analytics for their own profile
CREATE POLICY profile_analytics_select_policy ON profile_analytics 
FOR SELECT USING (profile_id = auth.uid() OR viewer_id = auth.uid());

-- Allow inserting analytics (for tracking views)
CREATE POLICY profile_analytics_insert_policy ON profile_analytics 
FOR INSERT WITH CHECK (true);

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET profile_views = COALESCE(profile_views, 0) + 1 
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_id ON profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_viewer_id ON profile_analytics(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_view_date ON profile_analytics(view_date);
CREATE INDEX IF NOT EXISTS idx_profiles_share_token ON profiles(share_token);

COMMENT ON TABLE profile_analytics IS 'Track profile views and sharing analytics';
COMMENT ON COLUMN profiles.is_public IS 'Whether profile is publicly shareable';
COMMENT ON COLUMN profiles.share_token IS 'Unique token for sharing profile via link';
COMMENT ON COLUMN profiles.profile_views IS 'Total number of profile views'; 