-- Enhanced Organization Profile Migration
-- This migration adds support for organization images, metrics, and testimonials

-- Create organization_images table
CREATE TABLE IF NOT EXISTS organization_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT CHECK (category IN ('team', 'office', 'events', 'projects', 'impact')),
    title TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_metrics table
CREATE TABLE IF NOT EXISTS organization_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('number', 'percentage', 'text')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create developer_testimonials table
CREATE TABLE IF NOT EXISTS developer_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    testimonial_text TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_images_organization_id ON organization_images(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_images_category ON organization_images(category);
CREATE INDEX IF NOT EXISTS idx_organization_images_display_order ON organization_images(display_order);

CREATE INDEX IF NOT EXISTS idx_organization_metrics_organization_id ON organization_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_metrics_display_order ON organization_metrics(display_order);

CREATE INDEX IF NOT EXISTS idx_developer_testimonials_organization_id ON developer_testimonials(organization_id);
CREATE INDEX IF NOT EXISTS idx_developer_testimonials_developer_id ON developer_testimonials(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_testimonials_featured ON developer_testimonials(is_featured);

-- Enable Row Level Security
ALTER TABLE organization_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_images
CREATE POLICY "Public can view organization images" ON organization_images
    FOR SELECT USING (true);

CREATE POLICY "Organizations can manage their own images" ON organization_images
    FOR ALL USING (
        auth.uid() = organization_id
    );

-- RLS Policies for organization_metrics
CREATE POLICY "Public can view organization metrics" ON organization_metrics
    FOR SELECT USING (true);

CREATE POLICY "Organizations can manage their own metrics" ON organization_metrics
    FOR ALL USING (
        auth.uid() = organization_id
    );

-- RLS Policies for developer_testimonials
CREATE POLICY "Public can view featured testimonials" ON developer_testimonials
    FOR SELECT USING (is_featured = true);

CREATE POLICY "Organizations can view all their testimonials" ON developer_testimonials
    FOR SELECT USING (auth.uid() = organization_id);

CREATE POLICY "Developers can view their own testimonials" ON developer_testimonials
    FOR SELECT USING (auth.uid() = developer_id);

CREATE POLICY "Organizations can manage testimonials" ON developer_testimonials
    FOR ALL USING (
        auth.uid() = organization_id
    );

CREATE POLICY "Developers can create testimonials" ON developer_testimonials
    FOR INSERT WITH CHECK (
        auth.uid() = developer_id
    );

-- Create storage bucket for organization images
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-images', 'organization-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
CREATE POLICY "Public can view organization images" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-images');

CREATE POLICY "Organizations can upload their own images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'organization-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Organizations can update their own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'organization-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Organizations can delete their own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'organization-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_images_updated_at
    BEFORE UPDATE ON organization_images
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organization_metrics_updated_at
    BEFORE UPDATE ON organization_metrics
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_developer_testimonials_updated_at
    BEFORE UPDATE ON developer_testimonials
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable realtime for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE organization_images;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE developer_testimonials;

-- Insert some sample data for testing (optional)
-- Note: Replace with actual organization IDs from your database

-- Sample metrics for organizations
-- INSERT INTO organization_metrics (organization_id, metric_name, metric_value, metric_type, display_order)
-- VALUES 
--     ('org-uuid-1', 'Years of Impact', '5+', 'text', 1),
--     ('org-uuid-1', 'Community Members Served', '10,000+', 'number', 2),
--     ('org-uuid-1', 'Project Success Rate', '95', 'percentage', 3),
--     ('org-uuid-1', 'Developer Satisfaction', '4.8/5', 'text', 4);

COMMENT ON TABLE organization_images IS 'Stores organization gallery images with categories';
COMMENT ON TABLE organization_metrics IS 'Stores custom metrics and achievements for organizations';
COMMENT ON TABLE developer_testimonials IS 'Stores testimonials from developers about organizations';

-- Grant necessary permissions
GRANT ALL ON organization_images TO authenticated;
GRANT ALL ON organization_metrics TO authenticated;
GRANT ALL ON developer_testimonials TO authenticated;

GRANT SELECT ON organization_images TO anon;
GRANT SELECT ON organization_metrics TO anon;
GRANT SELECT ON developer_testimonials TO anon; 