-- DevTogether Database Schema
-- Execute this script in your Supabase SQL Editor

-- Enable Row Level Security on all tables
-- Create users table (extends auth.users)
CREATE TABLE public.users (
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
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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
CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    developer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    cover_letter text,
    portfolio_links text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, developer_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_members table
CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- Create search_history table
CREATE TABLE public.search_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    search_term text NOT NULL,
    filters jsonb,
    result_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create popular_searches table
CREATE TABLE public.popular_searches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term text UNIQUE NOT NULL,
    search_count integer DEFAULT 1,
    last_searched timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create search_analytics table
CREATE TABLE public.search_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term text NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    result_count integer DEFAULT 0,
    clicked_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    click_position integer,
    session_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_activities table
CREATE TABLE public.team_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type text NOT NULL CHECK (activity_type IN ('joined', 'left', 'promoted', 'demoted', 'status_updated', 'message_sent')),
    activity_data jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, first_name, last_name, organization_name)
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

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Anyone can view user profiles (for public profiles)
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects table
-- Anyone can view open projects
CREATE POLICY "Open projects are viewable by everyone" ON public.projects
    FOR SELECT USING (status = 'open' OR auth.uid() = organization_id);

-- Only organizations can create projects
CREATE POLICY "Organizations can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = organization_id AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'organization')
    );

-- Organizations can update their own projects
CREATE POLICY "Organizations can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = organization_id);

-- Organizations can delete their own projects
CREATE POLICY "Organizations can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = organization_id);

-- RLS Policies for applications table
-- Developers can view their own applications
CREATE POLICY "Developers can view own applications" ON public.applications
    FOR SELECT USING (
        auth.uid() = developer_id OR
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- Developers can create applications
CREATE POLICY "Developers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = developer_id AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'developer')
    );

-- Developers can update their own applications
CREATE POLICY "Developers can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = developer_id);

-- Organizations can update applications for their projects
CREATE POLICY "Organizations can update project applications" ON public.applications
    FOR UPDATE USING (
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- RLS Policies for messages table
-- Only project members can view messages
CREATE POLICY "Project members can view messages" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.project_members WHERE project_id = messages.project_id
            UNION
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
        )
    );

-- Only project members can send messages
CREATE POLICY "Project members can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        auth.uid() IN (
            SELECT user_id FROM public.project_members WHERE project_id = messages.project_id
            UNION
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
        )
    );

-- RLS Policies for project_members table
-- Project members and organization can view members
CREATE POLICY "Project members can view team" ON public.project_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- Organizations can add members to their projects
CREATE POLICY "Organizations can add project members" ON public.project_members
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- Organizations can remove members from their projects
CREATE POLICY "Organizations can remove project members" ON public.project_members
    FOR DELETE USING (
        auth.uid() IN (SELECT organization_id FROM public.projects WHERE id = project_id)
    );

-- Members can leave projects
CREATE POLICY "Members can leave projects" ON public.project_members
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for search_history table
-- Users can view their own search history
CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their own search history
CREATE POLICY "Users can add to own search history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "Users can delete own search history" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for popular_searches table
-- Anyone can view popular searches
CREATE POLICY "Anyone can view popular searches" ON public.popular_searches
    FOR SELECT USING (true);

-- Only authenticated users can update popular searches (via functions)
CREATE POLICY "Authenticated users can update popular searches" ON public.popular_searches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can modify popular searches" ON public.popular_searches
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for search_analytics table
-- Users can view their own search analytics
CREATE POLICY "Users can view own search analytics" ON public.search_analytics
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users can add search analytics
CREATE POLICY "Authenticated users can add search analytics" ON public.search_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for team_activities table
-- Project members and organization can view activities
CREATE POLICY "Project members can view team activities" ON public.team_activities
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT user_id FROM public.project_members WHERE project_id = team_activities.project_id
            UNION
            SELECT organization_id FROM public.projects WHERE id = team_activities.project_id
        )
    );

-- Project members can add activities
CREATE POLICY "Project members can add team activities" ON public.team_activities
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IN (
            SELECT user_id FROM public.project_members WHERE project_id = team_activities.project_id
            UNION
            SELECT organization_id FROM public.projects WHERE id = team_activities.project_id
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_technology_stack ON public.projects USING GIN(technology_stack);
CREATE INDEX idx_applications_project_id ON public.applications(project_id);
CREATE INDEX idx_applications_developer_id ON public.applications(developer_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX idx_popular_searches_search_count ON public.popular_searches(search_count DESC);
CREATE INDEX idx_popular_searches_last_searched ON public.popular_searches(last_searched);
CREATE INDEX idx_search_analytics_search_term ON public.search_analytics(search_term);
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_team_activities_project_id ON public.team_activities(project_id);
CREATE INDEX idx_team_activities_user_id ON public.team_activities(user_id);
CREATE INDEX idx_team_activities_created_at ON public.team_activities(created_at);

-- Create storage buckets and policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for project-files bucket
CREATE POLICY "Project files are accessible to project members" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-files' AND
        auth.uid() IN (
            SELECT user_id FROM public.project_members 
            WHERE project_id::text = (storage.foldername(name))[1]
            UNION
            SELECT organization_id FROM public.projects 
            WHERE id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Project members can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-files' AND
        auth.uid() IN (
            SELECT user_id FROM public.project_members 
            WHERE project_id::text = (storage.foldername(name))[1]
            UNION
            SELECT organization_id FROM public.projects 
            WHERE id::text = (storage.foldername(name))[1]
        )
    ); 