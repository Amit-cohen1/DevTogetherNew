-- Fix RLS policies for messages table to work with accepted applications
-- FINAL VERSION - confirmed developer_id column exists
-- Execute this in your Supabase SQL Editor

-- Drop existing policies for messages table
DROP POLICY IF EXISTS "Project members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Project members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can edit own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- Create new policy for viewing messages based on accepted applications
CREATE POLICY "Team members can view messages" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            -- Organization owners of the project
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
            UNION
            -- Developers with accepted applications
            SELECT developer_id FROM public.applications 
            WHERE project_id = messages.project_id AND status = 'accepted'
        )
    );

-- Create new policy for sending messages based on accepted applications
CREATE POLICY "Team members can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        auth.uid() IN (
            -- Organization owners of the project
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
            UNION
            -- Developers with accepted applications
            SELECT developer_id FROM public.applications 
            WHERE project_id = messages.project_id AND status = 'accepted'
        )
    );

-- Create policy for updating messages (for editing)
CREATE POLICY "Users can edit own messages" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id AND
        auth.uid() IN (
            -- Organization owners of the project
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
            UNION
            -- Developers with accepted applications
            SELECT developer_id FROM public.applications 
            WHERE project_id = messages.project_id AND status = 'accepted'
        )
    );

-- Create policy for deleting messages (for deletion)
CREATE POLICY "Users can delete own messages" ON public.messages
    FOR DELETE USING (
        auth.uid() = sender_id AND
        auth.uid() IN (
            -- Organization owners of the project
            SELECT organization_id FROM public.projects WHERE id = messages.project_id
            UNION
            -- Developers with accepted applications
            SELECT developer_id FROM public.applications 
            WHERE project_id = messages.project_id AND status = 'accepted'
        )
    ); 