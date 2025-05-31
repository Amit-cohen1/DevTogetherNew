# DevTogether - Testing Setup

## Quick Start (Without Supabase)

To test the authentication UI pages without setting up Supabase:

1. **Create a `.env` file** in the project root with temporary values:
```
REACT_APP_SUPABASE_URL=https://temp.supabase.co
REACT_APP_SUPABASE_ANON_KEY=temp_key
```

2. **Start the development server:**
```bash
npm start
```

3. **Test the different pages:**
- Home page: http://localhost:3000/
- Login: http://localhost:3000/auth/login
- Register: http://localhost:3000/auth/register
- Forgot Password: http://localhost:3000/auth/forgot-password
- Verify Email: http://localhost:3000/auth/verify-email

## Available Routes

### Public Routes (accessible without login):
- `/` - Home page with sign in/up buttons
- `/auth/login` - Login page
- `/auth/register` - Registration with role selection
- `/auth/forgot-password` - Password reset request
- `/auth/verify-email` - Email verification page

### Protected Routes (require authentication):
- `/onboarding` - Multi-step profile completion
- `/dashboard` - Developer dashboard (developers only)
- `/organization/dashboard` - Organization dashboard (organizations only)

## Setting Up Real Supabase (For Full Functionality)

To test with real authentication:

1. **Create a Supabase project** at https://supabase.com
2. **Set up the database** using the schema from `doc/step-1.3-setup-supabase-backend.md`
3. **Update your `.env` file** with real values:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_real_anon_key
```

## Testing Flow

1. Visit the home page
2. Click "Sign Up" to create an account
3. Choose Developer or Organization role
4. Fill out the registration form
5. Complete the onboarding process
6. Access your role-specific dashboard

## Features Implemented

✅ **Authentication System**
- Email/password authentication
- OAuth with Google & GitHub (configured but needs Supabase setup)
- Password reset flow
- Email verification
- Role-based registration

✅ **User Onboarding**
- Multi-step profile completion
- Developer skills selection
- Organization mission setup
- Progress tracking

✅ **Route Protection**
- Public vs protected routes
- Role-based access control
- Automatic redirects based on auth state

## Next: Phase 3 Development

The authentication system is complete! Next up:
- User profile management
- Navigation and layout
- Dashboard functionality 