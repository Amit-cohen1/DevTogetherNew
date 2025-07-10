-- 1. Drop old admin update policy if exists
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- 2. Create new admin update policy (row-based check)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    (auth.uid() = id)
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.is_admin IS TRUE)
    )
  )
  WITH CHECK (
    (auth.uid() = id)
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.is_admin IS TRUE)
    )
  );

-- 3. Restrict updates to role/is_admin fields to admins only
DROP POLICY IF EXISTS "Only admins can update role/is_admin" ON public.profiles;
CREATE POLICY "Only admins can update role/is_admin"
  ON public.profiles
  FOR UPDATE
  USING (
    (
      (
        (auth.uid() = id) -- user can update own profile, but...
        AND (
          (
            (role IS NULL OR role = OLD.role) -- can't change role
          )
          AND (
            (is_admin IS NULL OR is_admin = OLD.is_admin) -- can't change is_admin
          )
        )
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles AS p
        WHERE p.id = auth.uid()
          AND (p.role = 'admin' OR p.is_admin IS TRUE)
      )
    )
  );
-- This policy ensures only admins can change role/is_admin, but users can update their own profile as long as they don't touch those fields. 

-- 4. Add trigger to block non-admins from changing role/is_admin
CREATE OR REPLACE FUNCTION prevent_non_admin_role_change()
RETURNS trigger AS $$
BEGIN
  -- If the role or is_admin fields are being changed
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_admin IS DISTINCT FROM OLD.is_admin) THEN
    -- Check if the user is an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin IS TRUE)
    ) THEN
      RAISE EXCEPTION 'Only admins can change role or is_admin fields.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_non_admin_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_non_admin_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_non_admin_role_change(); 