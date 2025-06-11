# Progressive Debugging: Project Details 406 Error

## Issue Summary
**Bug**: 406 (Not Acceptable) error when accessing project details after removing `project_members` table references  
**Status**: Query structure is correct, but error persists - suggests caching/schema/RLS issue  
**Project**: `89558ca3-b488-4d77-9b58-27671ec8ab74` (status: 'in_progress')  

## Problem Analysis

### **Fixed Issues** ✅
- ✅ Removed all `project_members` table references from TypeScript types
- ✅ Updated `getProject` query to remove non-existent table references  
- ✅ Fixed interface definitions in ProjectDetailsPage.tsx
- ✅ Query structure is now correct: no more `project_members` references

### **Current Issue** ❌
- Query structure is correct but **406 error persists**
- Suggests **database-level caching**, **RLS policy**, or **API schema cache** issue
- Need to identify exactly which part of the query is failing

## Progressive Debugging Implementation

### **Step-by-Step Query Testing**
Updated `getProject` function to test query complexity progressively:

1. **Basic Project Query**: `SELECT * FROM projects WHERE id = ?`
2. **With Organization**: `SELECT *, organization:profiles!projects_organization_id_fkey(*)`  
3. **With Applications**: `+ applications(*)`
4. **Full Query**: `+ applications(*, developer:profiles!applications_developer_id_fkey(*))`

### **Expected Console Output**
```
🔍 ProjectService.getProject called for projectId: 89558ca3-b488-4d77-9b58-27671ec8ab74
📊 Simple getProject query result: { data: {...}, error: null }
📊 getProject with organization result: { dataWithOrg: {...}, errorWithOrg: null }  
📊 getProject with applications result: { dataWithApps: {...}, errorWithApps: null }
📊 getProject FULL query result: { fullData: {...}, fullError: {...} }
```

### **Debugging Actions Taken**

#### **1. Schema Cache Refresh** ✅
```sql
NOTIFY pgrst, 'reload schema';
```
- Forces PostgREST to reload schema cache
- Eliminates cached schema mismatch issues

#### **2. Database Verification** ✅
- ✅ Project exists: `89558ca3-b488-4d77-9b58-27671ec8ab74`
- ✅ Foreign keys correct: `projects_organization_id_fkey`, `applications_developer_id_fkey`
- ✅ Applications exist: 1 accepted application for this project
- ✅ RLS policies allow access: `applications_select_policy_v2` permits accepted applications

#### **3. Progressive Query Testing** 🔄
- Will identify exactly which query level fails
- Graceful fallback to simpler data if complex queries fail
- Detailed console logging for debugging

## Expected Outcomes

### **Scenario A: Basic Query Works**
- **Result**: Project details load with basic information
- **Next Step**: Identify which join is causing the 406 error
- **Action**: Fix specific join syntax or RLS policy

### **Scenario B: All Queries Fail**  
- **Result**: Indicates broader RLS or permission issue
- **Next Step**: Review RLS policies for authenticated user context
- **Action**: Update RLS policies or authentication context

### **Scenario C: Full Query Works**
- **Result**: 406 error was browser cache issue
- **Next Step**: Document cache clearing solution
- **Action**: User needs hard browser refresh

## Next Steps
1. **Test the progressive queries** in browser
2. **Analyze console output** to identify failure point  
3. **Apply targeted fix** based on specific failure
4. **Restore original query** once issue is resolved
5. **Document solution** for future reference

## Browser Cache Considerations
- **Hard Refresh**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Clear Cache**: DevTools → Application → Storage → Clear Storage
- **Incognito Test**: Test in private/incognito window to bypass cache

This progressive approach will definitively identify whether the issue is:
- **Query syntax** (specific join fails)
- **RLS policies** (permissions issue) 
- **Browser cache** (all queries work fine)
- **API cache** (schema refresh resolves it) 