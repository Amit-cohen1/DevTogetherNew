-- Add spotlight control to developer profiles
-- This allows developers to control whether they appear in the spotlight section

-- Add spotlight_enabled column to profiles table
ALTER TABLE profiles 
ADD COLUMN spotlight_enabled BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.spotlight_enabled IS 'Controls whether developer appears in homepage spotlight rotation';

-- Update existing developers to have spotlight enabled by default
UPDATE profiles 
SET spotlight_enabled = true 
WHERE role = 'developer' OR role = 'admin';

-- Create index for spotlight queries
CREATE INDEX IF NOT EXISTS idx_profiles_spotlight 
ON profiles (role, is_public, spotlight_enabled, total_stars_earned DESC) 
WHERE role = 'developer' AND is_public = true AND spotlight_enabled = true; 