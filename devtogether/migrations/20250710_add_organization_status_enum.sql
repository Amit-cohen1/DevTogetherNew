-- Add organization_status column to profiles
ALTER TABLE profiles
  ADD COLUMN organization_status TEXT CHECK (organization_status IN ('pending', 'approved', 'rejected', 'blocked')) DEFAULT 'pending';

-- Migrate existing data
UPDATE profiles
  SET organization_status = CASE
    WHEN organization_verified = true THEN 'approved'
    ELSE 'pending'
  END
  WHERE role = 'organization';

-- (Optional) Add can_resubmit flag for future use
ALTER TABLE profiles
  ADD COLUMN can_resubmit BOOLEAN DEFAULT TRUE;

-- Ensure organization_rejection_reason is present for rejected orgs (no change needed if already exists)
-- No destructive changes; organization_verified remains for backward compatibility

-- Add comment for deprecation
COMMENT ON COLUMN profiles.organization_verified IS 'Deprecated: use organization_status instead'; 