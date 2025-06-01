-- Create User Profile - DevTogether
-- This script will create a profile record for your current authenticated user

-- First, let's check what user info we have
SELECT 
    'Current User Info:' as section,
    auth.uid() as user_id,
    au.email,
    au.raw_user_meta_data,
    au.created_at
FROM auth.users au
WHERE au.id = auth.uid();

-- Check if profile already exists
SELECT 
    'Profile Check:' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) 
        THEN 'Profile EXISTS' 
        ELSE 'Profile MISSING - Will create'
    END as status;

-- Create the profile if it doesn't exist
INSERT INTO public.profiles (
    id, 
    email, 
    role,
    first_name,
    last_name,
    bio,
    skills,
    is_public,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'role', 
        'developer'
    ) as role,
    COALESCE(
        au.raw_user_meta_data->>'first_name',
        SPLIT_PART(au.email, '@', 1)
    ) as first_name,
    COALESCE(
        au.raw_user_meta_data->>'last_name',
        'User'
    ) as last_name,
    'Welcome to DevTogether! Update your profile to get started.' as bio,
    ARRAY[]::text[] as skills,
    true as is_public,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id = auth.uid()
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the profile was created successfully
SELECT 
    'Profile Created Successfully:' as section,
    id,
    email,
    role,
    first_name,
    last_name,
    bio,
    skills,
    is_public,
    created_at
FROM public.profiles 
WHERE id = auth.uid();

-- If you're an organization, update the role manually:
-- UPDATE public.profiles SET role = 'organization' WHERE id = auth.uid(); 