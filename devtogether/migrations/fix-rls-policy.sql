-- Fix: Add missing INSERT policy for users table
-- Execute this in your Supabase SQL Editor

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id); 