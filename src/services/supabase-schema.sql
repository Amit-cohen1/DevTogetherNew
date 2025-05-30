-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('developer', 'organization')),
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[],
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    organization_name TEXT,
    organization_website TEXT,
    organization_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    technologies TEXT[] NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    team_size INTEGER NOT NULL,
    application_deadline TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    cover_letter TEXT NOT NULL,
    portfolio_links TEXT[],
    availability TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, developer_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_applications_project_id ON public.applications(project_id);
CREATE INDEX idx_applications_developer_id ON public.applications(developer_id);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects table
CREATE POLICY "Anyone can view open projects" ON public.projects
    FOR SELECT USING (status = 'open' OR organization_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid()));

CREATE POLICY "Organizations can create projects" ON public.projects
    FOR INSERT WITH CHECK (organization_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'organization'));

CREATE POLICY "Organizations can update own projects" ON public.projects
    FOR UPDATE USING (organization_id = auth.uid());

CREATE POLICY "Organizations can delete own projects" ON public.projects
    FOR DELETE USING (organization_id = auth.uid());

-- RLS Policies for applications table
CREATE POLICY "Developers can view own applications" ON public.applications
    FOR SELECT USING (developer_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.projects WHERE id = applications.project_id AND organization_id = auth.uid()));

CREATE POLICY "Developers can create applications" ON public.applications
    FOR INSERT WITH CHECK (developer_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can update own applications" ON public.applications
    FOR UPDATE USING (developer_id = auth.uid());

CREATE POLICY "Organizations can update applications for their projects" ON public.applications
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE id = applications.project_id AND organization_id = auth.uid()));

-- RLS Policies for messages table
CREATE POLICY "Project members can view messages" ON public.messages
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = messages.project_id AND user_id = auth.uid()));

CREATE POLICY "Project members can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = messages.project_id AND user_id = auth.uid()));

-- RLS Policies for project_members table
CREATE POLICY "Anyone can view project members" ON public.project_members
    FOR SELECT USING (true);

CREATE POLICY "Organizations can manage project members" ON public.project_members
    FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_members.project_id AND organization_id = auth.uid()));

-- Create functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'role');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 