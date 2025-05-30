# Supabase Setup Guide for DevTogether

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project

## Setup Steps

### 1. Environment Variables
Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

You can find these values in your Supabase project settings under:
- Settings → API → Project URL
- Settings → API → Project API keys → anon public

### 2. Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the SQL and create all tables

### 3. Storage Buckets
1. In the SQL Editor, copy and paste the contents of `supabase-storage.sql`
2. Click "Run" to create storage buckets and policies

### 4. Authentication Setup
1. Go to Authentication → Settings
2. Enable Email authentication
3. Configure OAuth providers:
   - Enable Google (optional)
   - Enable GitHub (optional)
   - Add `http://localhost:3000` to Redirect URLs

### 5. Email Templates (Optional)
Customize email templates in Authentication → Email Templates:
- Confirmation email
- Password reset email
- Magic link email

## Testing the Setup

### Verify Tables
Run this query in SQL Editor to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- users
- projects
- applications
- messages
- project_members

### Verify Storage
Go to Storage in your dashboard. You should see:
- avatars (public bucket)
- project-files (private bucket)

### Test Authentication
The Supabase client in `src/services/supabase.ts` is configured and ready to use.

## Security Notes
- Row Level Security (RLS) is enabled on all tables
- Storage policies ensure users can only access appropriate files
- The `handle_new_user` function automatically creates user profiles on signup
- All timestamps are automatically managed with triggers

## Next Steps
1. Start the development server: `npm start`
2. Begin implementing authentication in your React components
3. Use the Supabase client to interact with the database 