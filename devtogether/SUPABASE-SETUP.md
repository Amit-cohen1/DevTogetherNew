# Supabase Real Authentication Setup Guide

This guide will help you switch from development mode to real Supabase authentication.

## Step 1: Create Environment Variables File

Create a file called `.env.local` in your project root (same directory as `package.json`) with the following content:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (something like `https://abcdefg123.supabase.co`)
   - **anon public** key (long JWT token starting with `eyJ...`)

## Step 3: Update Environment File

Replace the placeholder values in `.env.local`:

```env
# Replace with your actual values
REACT_APP_SUPABASE_URL=https://abcdefg123.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmcxMjMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0...
```

## Step 4: Configure OAuth Providers in Supabase

### Google OAuth Setup

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Configure**
3. Enable the provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. In **Redirect URLs**, add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. In your Google Cloud Console OAuth settings, add these redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

### GitHub OAuth Setup

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** and click **Configure**
3. Enable the provider
4. Add your GitHub OAuth app credentials:
   - **Client ID**: From GitHub OAuth App
   - **Client Secret**: From GitHub OAuth App
5. In **Redirect URLs**, add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. In your GitHub OAuth app settings, set the callback URL to:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

## Step 5: Update Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/login
   ```

## Step 6: Test the Setup

1. Save your `.env.local` file
2. Restart your development server:
   ```bash
   npm start
   ```
3. Navigate to `http://localhost:3000/auth/login`
4. Try the authentication methods:
   - Email/password registration
   - Google OAuth login
   - GitHub OAuth login

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check that your Supabase URL and anon key are correct
   - Ensure `.env.local` is in the project root
   - Restart the development server after adding environment variables

2. **OAuth redirect errors**
   - Verify redirect URLs are correctly configured in both Supabase and OAuth providers
   - Check that Site URL is set correctly in Supabase

3. **CORS errors**
   - Ensure your domain is added to the allowed origins in Supabase

### Environment Variables Not Loading

If your environment variables aren't being loaded:

1. Ensure the file is named exactly `.env.local` (not `.env` or anything else)
2. Make sure it's in the project root directory
3. Restart the development server completely
4. Check the browser console for any errors

### Verification

Once setup is complete, you should see:
- No "development mode" warning in the browser console
- OAuth buttons redirect to actual provider login pages
- Email/password registration creates real user accounts
- User sessions persist after browser refresh

## Production Deployment

When deploying to production:

1. Update the Site URL in Supabase to your production domain
2. Add your production domain to OAuth provider redirect URLs
3. Set environment variables in your hosting platform
4. Update CORS settings if needed

## Database Schema

The database schema is already configured with RLS policies. Users will be automatically created in the `users` table when they sign up or log in via OAuth. 