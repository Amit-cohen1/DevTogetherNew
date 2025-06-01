-- Fix Missing Profile Data
-- Run this script if you're getting 406 errors (user might not have a profile record)

-- Check if current user has a profile
SELECT 
    auth.uid() as current_user_id,
    p.id as profile_exists,
    p.email,
    p.role,
    p.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.id = auth.uid();

-- If the above query shows profile_exists as null, create a profile
-- Replace 'your-email@example.com' with your actual email
-- Replace 'developer' with 'organization' if you're an organization

INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'developer'),
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.id = auth.uid()
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the profile was created
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    created_at
FROM public.profiles 
WHERE id = auth.uid(); 