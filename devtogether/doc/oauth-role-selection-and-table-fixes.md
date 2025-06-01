# OAuth Role Selection & Table Mismatch Fixes - DevTogether

## 🚨 Critical Issues Resolved

### Issue 1: OAuth Registration Role Selection
**Problem**: Users registering via OAuth providers (Google, GitHub) couldn't select their role (organization vs developer) and were automatically assigned 'developer' role without choice.

### Issue 2: Database Table Mismatch Causing Dashboard Errors
**Problem**: New OAuth users experiencing dashboard errors due to services still querying old `users` table instead of `profiles` table, causing 406 "Not Acceptable" errors.

## 🔍 Root Cause Analysis

### OAuth Registration Flow Issue:
- **OAuth providers bypass role selection** during authentication
- **Default role assignment** in `auth.ts` line 244: `role: (authUser.user.user_metadata?.role || 'developer')`
- **No mechanism for role selection** after OAuth authentication
- **Organizations cannot use OAuth** to register

### Table Mismatch Issue:
- **Multiple services still querying `users` table** instead of `profiles` table
- **406 errors from Supabase** when querying non-existent data
- **Dashboard failures** for new users due to missing profile data
- **Services affected**: dashboardService, workspaceService, teamService, applications, search

## 💡 Comprehensive Solution

### Fix 1: OAuth Role Selection System

#### **1.1 Modified OAuth Callback Flow**
**File**: `src/pages/auth/AuthCallbackPage.tsx`

Enhanced callback detection for new OAuth users:
```typescript
// Check if this is a new OAuth user without complete profile setup
if (!profile.bio && !profile.first_name && !profile.last_name && !profile.organization_name) {
    // This is likely a new OAuth user - redirect to role selection
    navigate('/auth/select-role', { replace: true })
    return
}
```

**Logic**: Detects new OAuth users by absence of profile data and redirects to role selection.

#### **1.2 Created Role Selection Page**
**File**: `src/pages/auth/RoleSelectionPage.tsx`

Features:
- **Clear role descriptions** with use case explanations
- **Visual role cards** with icons and feature lists
- **Professional UI** matching existing design system
- **Role validation** before proceeding
- **Error handling** with user feedback
- **Automatic redirect** for users with existing profiles

Role Options:
- **Developer**: Browse projects, showcase skills, collaborate
- **Organization**: Post projects, review applications, manage teams

#### **1.3 Routing Integration**
**File**: `src/App.tsx`

Added protected route:
```typescript
<Route
  path="/auth/select-role"
  element={
    <ProtectedRoute>
      <RoleSelectionPage />
    </ProtectedRoute>
  }
/>
```

### Fix 2: Complete Table Mismatch Resolution

#### **2.1 Dashboard Service Fix**
**File**: `src/services/dashboardService.ts`

Fixed all `users` table references:
- `getActiveProjects()`: Organization and team member queries
- `getRecentApplications()`: Organization data fetching  
- `getRecommendedProjects()`: Skills and organization queries

**Changes**:
```typescript
// Before
.from('users')

// After  
.from('profiles')
```

#### **2.2 Workspace Service Fix**
**File**: `src/services/workspaceService.ts`

Fixed references:
- Organization owner details query
- Team member relationship queries

#### **2.3 Team Service Fix**
**File**: `src/services/teamService.ts`

Fixed references:
- Team member data fetching
- Organization owner queries

#### **2.4 Applications Service Fix**
**File**: `src/services/applications.ts`

Fixed references:
- Developer notification queries
- Application relationship queries (foreign keys)
- Project application fetching

#### **2.5 Search Service Fix**
**File**: `src/services/search.ts`

Fixed references:
- Organization suggestion queries
- Quick search organization data

## 🧪 Testing & Verification

### OAuth Role Selection Tests:
1. **New OAuth User Flow**:
   - Sign up with Google/GitHub → Role selection page → Onboarding
2. **Existing OAuth User Flow**:
   - Sign in with OAuth → Direct to dashboard (bypasses role selection)
3. **Role Change Functionality**:
   - Select developer → Proceed to developer onboarding
   - Select organization → Proceed to organization onboarding

### Table Mismatch Resolution Tests:
1. **Dashboard Loading**:
   - New users: No 406 errors, dashboard loads successfully
   - Skills display: Correct data from profiles table
   - Recommendations: Working skill matching
2. **Profile Features**:
   - Profile display: Correct user data
   - Skills showcase: Functional with proper data
   - Organization profiles: Working correctly

## 🔄 Migration Flow

### For New OAuth Users:
```
OAuth Sign-in → AuthCallback → Role Selection → Onboarding → Dashboard
```

### For Existing OAuth Users:
```
OAuth Sign-in → AuthCallback → Dashboard (direct)
```

### For Existing Regular Users:
```
No change - existing flow continues working
```

## 📋 Files Modified

### New Files:
- `src/pages/auth/RoleSelectionPage.tsx` - OAuth role selection interface

### Modified Files:
- `src/pages/auth/AuthCallbackPage.tsx` - Enhanced OAuth callback logic
- `src/App.tsx` - Added role selection route
- `src/services/dashboardService.ts` - Fixed all table references
- `src/services/workspaceService.ts` - Fixed table references
- `src/services/teamService.ts` - Fixed table references  
- `src/services/applications.ts` - Fixed table references
- `src/services/search.ts` - Fixed table references

## 🎯 Resolution Summary

### OAuth Role Selection:
- ✅ **Organizations can now register via OAuth** - role selection available
- ✅ **Smooth onboarding flow** for all OAuth users
- ✅ **Professional UI** matching design system
- ✅ **Existing users unaffected** - direct dashboard access

### Table Mismatch Resolution:
- ✅ **All 406 errors resolved** - services query correct table
- ✅ **Dashboard functionality restored** - data loads successfully
- ✅ **Skills showcase working** - proper profile data access
- ✅ **Search and recommendations functional** - correct data queries

## 🔧 Technical Implementation

### Database Consistency:
- **Single source of truth**: All user data in `profiles` table
- **Consistent foreign keys**: All relationships use `profiles` table
- **RLS policies**: Security maintained across table changes

### User Experience:
- **Seamless OAuth flow**: Role selection integrated naturally
- **No data loss**: Existing functionality preserved
- **Professional interface**: Consistent with existing design
- **Clear messaging**: Users understand role differences

## 🎉 Final Results

**OAuth Registration**: Organizations and developers can both register via OAuth with proper role selection

**Dashboard Functionality**: New OAuth users experience smooth dashboard loading without errors

**Skills & Profile Features**: All enhanced profile features working correctly for OAuth users

**System Stability**: Table mismatch resolved across all services, preventing future 406 errors

---

**Status**: ✅ **BOTH ISSUES RESOLVED**
- OAuth role selection: Fully functional for organizations and developers
- Table mismatch: Completely fixed across all services
- Dashboard errors: Eliminated for new OAuth users
- User experience: Seamless for all authentication methods 