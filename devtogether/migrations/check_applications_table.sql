-- Check the actual structure of the applications table
-- Execute this in your Supabase SQL Editor to see the column names

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'applications'
ORDER BY ordinal_position; 