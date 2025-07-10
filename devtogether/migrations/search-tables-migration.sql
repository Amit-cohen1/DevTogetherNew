-- DevTogether Search Tables Migration
-- Execute this script in your Supabase SQL Editor to add search functionality

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

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX idx_popular_searches_search_count ON public.popular_searches(search_count DESC);
CREATE INDEX idx_popular_searches_last_searched ON public.popular_searches(last_searched);
CREATE INDEX idx_search_analytics_search_term ON public.search_analytics(search_term);
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at); 