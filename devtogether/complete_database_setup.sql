-- DevTogether Complete Database Setup
-- Execute this script in your Supabase SQL Editor to set up the complete database

-- =============================================
-- PART 1: BASIC DATABASE SCHEMA
-- =============================================

-- Enable Row Level Security on all tables
-- Create profiles table (note: using 'profiles' instead of 'users' to match the codebase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('developer', 'organization')),
    first_name text,
    last_name text,
    organization_name text,
    bio text,
    skills text[],
    location text,
    website text,
    linkedin text,
    github text,
    portfolio text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    technology_stack text[] NOT NULL,
    difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    application_type text NOT NULL CHECK (application_type IN ('individual', 'team', 'both')),
    max_team_size integer,
    deadline timestamp with time zone,
    estimated_duration text,
    is_remote boolean DEFAULT true,
    location text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    developer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    cover_letter text,
    portfolio_links text[],
    status_manager boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, developer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS public.search_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    search_term text NOT NULL,
    filters jsonb,
    result_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create popular_searches table
CREATE TABLE IF NOT EXISTS public.popular_searches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term text UNIQUE NOT NULL,
    search_count integer DEFAULT 1,
    last_searched timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create search_analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term text NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    result_count integer DEFAULT 0,
    clicked_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    click_position integer,
    session_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_activities table
CREATE TABLE IF NOT EXISTS public.team_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type text NOT NULL CHECK (activity_type IN ('joined', 'left', 'promoted', 'demoted', 'status_updated', 'message_sent')),
    activity_data jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- PART 2: PROFILE ENHANCEMENT FEATURES
-- =============================================

-- Add profile enhancement columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Create profile analytics table
CREATE TABLE IF NOT EXISTS public.profile_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    view_date TIMESTAMPTZ DEFAULT NOW(),
    view_type TEXT CHECK (view_type IN ('direct', 'shared_link', 'search')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 3: FUNCTIONS AND TRIGGERS
-- =============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET profile_views = COALESCE(profile_views, 0) + 1 
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, first_name, last_name, organization_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'developer'),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'organization_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers before creating new ones
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PART 4: ROW LEVEL SECURITY SETUP
-- =============================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects table
DROP POLICY IF EXISTS "Open projects are viewable by everyone" ON public.projects;
CREATE POLICY "Open projects are viewable by everyone" ON public.projects
    FOR SELECT USING (status = 'open' OR auth.uid() = organization_id);

DROP POLICY IF EXISTS "Organizations can create projects" ON public.projects;
CREATE POLICY "Organizations can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = organization_id AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organization')
    );

DROP POLICY IF EXISTS "Organizations can update own projects" ON public.projects;
CREATE POLICY "Organizations can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = organization_id);

DROP POLICY IF EXISTS "Organizations can delete own projects" ON public.projects;
CREATE POLICY "Organizations can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = organization_id);

-- RLS Policies for applications table
DROP POLICY IF EXISTS "Developers can view their own applications" ON public.applications;
CREATE POLICY "Developers can view their own applications" ON public.applications
    FOR SELECT USING (
        auth.uid() = developer_id OR 
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

DROP POLICY IF EXISTS "Developers can create applications" ON public.applications;
CREATE POLICY "Developers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = developer_id AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer')
    );

DROP POLICY IF EXISTS "Users can update relevant applications" ON public.applications;
CREATE POLICY "Users can update relevant applications" ON public.applications
    FOR UPDATE USING (
        auth.uid() = developer_id OR 
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- RLS Policies for messages table
DROP POLICY IF EXISTS "Project members can view messages" ON public.messages;
CREATE POLICY "Project members can view messages" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT organization_id FROM public.projects WHERE id = project_id
            UNION
            SELECT developer_id FROM public.applications WHERE project_id = messages.project_id AND status = 'accepted'
        )
    );

DROP POLICY IF EXISTS "Project members can create messages" ON public.messages;
CREATE POLICY "Project members can create messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        auth.uid() IN (
            SELECT organization_id FROM public.projects WHERE id = project_id
            UNION
            SELECT developer_id FROM public.applications WHERE project_id = messages.project_id AND status = 'accepted'
        )
    );

-- RLS Policies for profile_analytics
DROP POLICY IF EXISTS "profile_analytics_select_policy" ON public.profile_analytics;
CREATE POLICY "profile_analytics_select_policy" ON public.profile_analytics 
FOR SELECT USING (profile_id = auth.uid() OR viewer_id = auth.uid());

DROP POLICY IF EXISTS "profile_analytics_insert_policy" ON public.profile_analytics;
CREATE POLICY "profile_analytics_insert_policy" ON public.profile_analytics 
FOR INSERT WITH CHECK (true);

-- =============================================
-- PART 5: PERFORMANCE INDEXES
-- =============================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_technology_stack ON public.projects USING GIN(technology_stack);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON public.applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_developer_id ON public.applications(developer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_popular_searches_search_count ON public.popular_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_last_searched ON public.popular_searches(last_searched);
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_term ON public.search_analytics(search_term);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_team_activities_project_id ON public.team_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_user_id ON public.team_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_created_at ON public.team_activities(created_at);

-- Profile enhancement indexes
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_id ON public.profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_viewer_id ON public.profile_analytics(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_view_date ON public.profile_analytics(view_date);
CREATE INDEX IF NOT EXISTS idx_profiles_share_token ON public.profiles(share_token);

-- =============================================
-- PART 6: COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.profile_analytics IS 'Track profile views and sharing analytics';
COMMENT ON COLUMN public.profiles.is_public IS 'Whether profile is publicly shareable';
COMMENT ON COLUMN public.profiles.share_token IS 'Unique token for sharing profile via link';
COMMENT ON COLUMN public.profiles.profile_views IS 'Total number of profile views';

-- Database setup complete!
-- You should now have all tables, functions, triggers, RLS policies, and indexes set up. 