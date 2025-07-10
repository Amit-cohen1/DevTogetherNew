-- Migrate Existing Users to Profiles Table - DevTogether
-- This script migrates existing users and fixes RLS policies

-- Step 1: Temporarily disable RLS to allow migration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if we have existing users in a 'users' table
-- (Skip if users table doesn't exist)
DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Migrate from users table to profiles table
        INSERT INTO profiles (
            id, email, role, first_name, last_name, organization_name,
            bio, skills, location, website, linkedin, github, portfolio, avatar_url,
            is_public, share_token, profile_views, created_at, updated_at
        )
        SELECT 
            id, email, role, first_name, last_name, organization_name,
            bio, 
            COALESCE(skills, '{}'), -- Ensure skills is array, not null
            location, website, linkedin, github, portfolio, avatar_url,
            true, -- Default is_public to true
            NULL, -- share_token starts as null
            0,    -- profile_views starts at 0
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM users
        WHERE NOT EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = users.id
        );
        
        RAISE NOTICE 'Migrated users from users table to profiles table';
    ELSE
        RAISE NOTICE 'No users table found - skipping migration';
    END IF;
END $$;

-- Step 3: Create profiles for auth users who don't have profiles yet
INSERT INTO profiles (
    id, email, role, first_name, last_name, organization_name,
    bio, skills, location, website, linkedin, github, portfolio, avatar_url,
    is_public, share_token, profile_views, created_at, updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'developer')::text,
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name', 
    au.raw_user_meta_data->>'organization_name',
    NULL, -- bio
    '{}', -- empty skills array
    NULL, -- location
    NULL, -- website
    NULL, -- linkedin
    NULL, -- github
    NULL, -- portfolio
    au.raw_user_meta_data->>'avatar_url',
    true, -- is_public
    NULL, -- share_token
    0,    -- profile_views
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 4: Re-enable RLS with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Step 6: Create comprehensive RLS policies
-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow everyone to view public profiles (for sharing)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true OR auth.uid() = id);

-- Step 7: Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Step 8: Verification query
SELECT 
    'Migration Summary:' as section,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 1 END) as profiles_with_skills,
    COUNT(CASE WHEN is_public = true THEN 1 END) as public_profiles
FROM profiles;

-- Show any auth users still missing profiles
SELECT 
    'Missing Profiles:' as section,
    COUNT(*) as auth_users_without_profiles
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- Step 9: Final success messages
DO $$
BEGIN
    RAISE NOTICE 'Migration completed! Check the verification queries above.';
    RAISE NOTICE 'Users can now log in successfully.';
END $$; 