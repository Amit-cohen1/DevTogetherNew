# Phase 3 Testing Guide: Core User Features

## Overview
This guide will help you test all the features implemented in Phase 3, including user profile management and the navigation/layout system.

## Prerequisites
1. **Start the development server**: `npm start`
2. **Ensure Supabase is configured**: Check that your `.env` file has the correct Supabase credentials
3. **Database setup**: Make sure your Supabase database has the proper schema from Phase 1

## Testing Scenarios

### 1. Authentication & Onboarding Flow
Before testing profiles, ensure you have test accounts:

**Developer Account:**
- Go to `/auth/register`
- Select "Developer" role
- Complete registration and email verification
- Complete onboarding with developer-specific information

**Organization Account:**
- Register another account with "Organization" role
- Complete organization-specific onboarding

### 2. Navigation System Testing

#### 2.1 Navbar Functionality
- **Logo**: Click DevTogether logo → should navigate to dashboard
- **Role-based menus**: 
  - Developer: Should see "Dashboard", "Projects", "Discover", "My Applications"
  - Organization: Should see "Dashboard", "Projects", "Discover", "My Projects", "Applications"
- **User dropdown**: Click avatar → should show "View Profile", "Settings", "Sign Out"
- **Active states**: Navigate between pages → active page should be highlighted
- **Mobile responsive**: Resize browser → hamburger menu should appear on small screens

#### 2.2 Footer
- **Links**: All footer links should be clickable (they'll show 404 for now, which is expected)
- **Social icons**: Should be clickable and open external links
- **Newsletter signup**: Should be functional UI (backend not implemented yet)
- **Responsive**: Should look good on all screen sizes

#### 2.3 Layout System
- **Consistent spacing**: All pages should have consistent margins and padding
- **Navbar presence**: Should appear on all authenticated pages
- **Footer presence**: Should appear at bottom of all pages

### 3. Profile Management Testing

#### 3.1 Profile Viewing
**Own Profile:**
- Navigate to `/profile`
- Should display your profile with edit button
- Should show role-appropriate sections (developer vs organization)

**Other User's Profile:**
- If you have another user's ID, navigate to `/profile/[user-id]`
- Should display their profile without edit button
- Should be read-only view

#### 3.2 Profile Header Component
**Visual Elements:**
- **Avatar**: Should display uploaded image or default icon
- **Role badge**: Should show "Developer" or "Organization"
- **Display name**: Should show first/last name for developers, org name for organizations
- **Member since**: Should show formatted join date
- **Social links**: Should be clickable and open in new tabs
- **Location**: Should display if provided

**Developer-specific:**
- **Skills tags**: Should display as colored badges
- **GitHub/Portfolio links**: Should be present if provided

#### 3.3 Profile Content Sections

**Developer Profile:**
- **About section**: Should display bio if provided
- **Technical Skills**: Should show skills in a grid layout
- **Portfolio**: Should show portfolio link with proper styling
- **Social Links**: GitHub and LinkedIn with proper icons
- **Empty state**: If profile is incomplete, should show "Complete Your Profile" message

**Organization Profile:**
- **About section**: Should display organization bio
- **Mission section**: Should show mission statement
- **Organization details**: Name and location in a grid
- **Website & links**: Should display with proper icons
- **Collaboration section**: Should show developer engagement messaging
- **Empty state**: Should prompt to complete organization information

#### 3.4 Profile Editing

**Opening Edit Modal:**
- Click "Edit Profile" button → should open modal overlay
- Modal should have proper backdrop and be centered

**Form Fields (Developer):**
- **Avatar upload**: Click "Change Photo" → should open file selector
- **First/Last Name**: Should be pre-filled and editable
- **Bio**: Should be a textarea with placeholder
- **Location**: Should be editable
- **Skills**: Should allow adding/removing skills with tags
- **Social links**: GitHub, LinkedIn, Portfolio, Website fields

**Form Fields (Organization):**
- **Avatar upload**: Same as developer
- **Organization Name**: Should be pre-filled and editable
- **Bio**: Textarea with organization-specific placeholder
- **Location**: Editable field
- **Social links**: Website and LinkedIn fields

**Form Validation:**
- **Required fields**: First/Last name for developers, Org name for organizations
- **URL validation**: Website, LinkedIn, GitHub, Portfolio should validate URL format
- **File upload**: Should validate image files and size limits (5MB)

**Saving Changes:**
- Click "Save Changes" → should show loading state
- Should update profile immediately after save
- Should close modal and show updated information
- Should handle errors gracefully

#### 3.5 Avatar Upload Testing

**File Selection:**
- Should accept image files (JPG, PNG, etc.)
- Should reject non-image files
- Should reject files > 5MB

**Upload Process:**
- Should show loading spinner during upload
- Should update avatar immediately after successful upload
- Should handle upload failures gracefully

### 4. Error Handling Testing

#### 4.1 Network Errors
- **Disconnect internet** → Should show appropriate error messages
- **Profile not found** → Should show "Profile Not Found" page with navigation option

#### 4.2 Permission Errors
- Try accessing non-existent user profile → Should handle gracefully
- Test with invalid user IDs → Should show error state

### 5. Responsive Design Testing

#### 5.1 Mobile Testing (320px - 768px)
- **Navigation**: Should show hamburger menu
- **Profile header**: Should stack vertically
- **Profile content**: Should be single column
- **Edit modal**: Should be full-width on mobile
- **Forms**: Should be touch-friendly

#### 5.2 Tablet Testing (768px - 1024px)
- **Navigation**: Should show full menu
- **Profile layout**: Should adapt to medium screens
- **Grid layouts**: Should adjust column counts

#### 5.3 Desktop Testing (1024px+)
- **Full layout**: Should use all available space efficiently
- **Multi-column grids**: Should display properly
- **Hover states**: Should work for interactive elements

### 6. Performance Testing

#### 6.1 Loading States
- **Profile loading**: Should show spinner while fetching data
- **Avatar upload**: Should show loading state during upload
- **Form submission**: Should show loading button state

#### 6.2 Caching
- **Profile data**: Should cache profile data appropriately
- **Images**: Uploaded avatars should load quickly on subsequent visits

### 7. Browser Compatibility
Test in different browsers:
- **Chrome** (primary development browser)
- **Firefox**
- **Safari** (if on Mac)
- **Edge**

## Common Issues & Solutions

### Issue: Components not found
**Error**: "Cannot find module '../components/profile/DeveloperProfile'"
**Solution**: The components should be created. If you see this error, verify all component files exist in the correct directories.

### Issue: Supabase authentication errors
**Solution**: Check your `.env` file has correct Supabase credentials and the database schema is properly set up.

### Issue: Avatar upload fails
**Solution**: Ensure Supabase Storage is configured with the `avatars` bucket and proper RLS policies.

### Issue: Profile not updating
**Solution**: Check browser console for errors and verify the updateProfile function in AuthContext is working.

## Test Checklist

### Navigation & Layout
- [ ] Navbar displays correctly for both roles
- [ ] User dropdown works
- [ ] Mobile menu functions properly
- [ ] Footer displays and links are clickable
- [ ] Layout is consistent across pages

### Profile Viewing
- [ ] Own profile displays correctly
- [ ] Other user profiles are read-only
- [ ] Developer profiles show skills and portfolio
- [ ] Organization profiles show mission and details
- [ ] Social links work properly

### Profile Editing
- [ ] Edit modal opens and closes
- [ ] Form fields are pre-populated
- [ ] Validation works for required fields
- [ ] URL validation works for links
- [ ] Skills can be added/removed (developers)
- [ ] Changes save successfully
- [ ] Avatar upload works

### Responsive Design
- [ ] Mobile layout works properly
- [ ] Tablet layout adapts correctly
- [ ] Desktop layout uses space efficiently
- [ ] Touch interactions work on mobile

### Error Handling
- [ ] Network errors display properly
- [ ] Invalid profiles show error states
- [ ] Form errors are user-friendly
- [ ] Upload errors are handled gracefully

## Next Steps
After testing Phase 3 features, you'll be ready to move on to Phase 4: Project Management System, which will include:
- Project creation for organizations
- Project discovery for developers
- Project detail pages
- Search and filtering functionality 