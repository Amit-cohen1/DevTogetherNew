-- Create storage buckets for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create storage buckets for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for project files bucket
CREATE POLICY "Project members can view project files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-files' AND
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id::text = (storage.foldername(name))[1]
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can upload project files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-files' AND
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id::text = (storage.foldername(name))[1]
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can update project files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'project-files' AND
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id::text = (storage.foldername(name))[1]
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Organizations can delete project files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'project-files' AND
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id::text = (storage.foldername(name))[1]
            AND organization_id = auth.uid()
        )
    ); 