# Team Member Removal Fix (Applications.status = 'removed')

**Date:** 2025-07-07

## Problem
Organization owners could not remove developers from their project teams. Clicking **Remove** triggered a server error because the front-end attempted to set `applications.status = 'removed'`, but the database `CHECK` constraint did not include this value.

```
ERROR: new row for relation "applications" violates check constraint "applications_status_check"
```

## Solution
1. **Database Migration**  
   Added `removed` to the allowed values in the `applications.status` field.
2. **TypeScript Types**  
   Updated `src/types/database.ts` so `Application['status']` unions now include `'removed'`.
3. **No Front-End Logic Change Needed**  
   `teamService.removeMember` already sets the correct status.

## Migration SQL
```sql
-- migrations/20250707_add_removed_status_to_applications.sql
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'removed'));
```

## Testing
| Scenario | Expected | Result |
|----------|----------|--------|
| Org owner removes developer | Status in `applications` becomes `removed`; developer disappears from team list | ✅ |
| Removed developer tries to access workspace | Access denied by RLS | ✅ |
| Other application flows (accept/reject/withdraw) | Unaffected | ✅ |

## Impact
• Allows organization owners to manage their teams effectively.  
• No security implications—RLS continues to protect data.  
• Backwards compatible; existing rows remain valid. 