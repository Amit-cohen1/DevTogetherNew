-- Migration: Admin organization approval functions
-- Created: 2025-07-08

-- Function to approve organization verification
CREATE OR REPLACE FUNCTION approve_organization(p_organization_id uuid, p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _updated BOOLEAN;
BEGIN
    UPDATE public.profiles
    SET organization_verified     = TRUE,
        organization_verified_at  = NOW(),
        organization_verified_by  = p_admin_id,
        organization_rejection_reason = NULL
    WHERE id = p_organization_id
    RETURNING TRUE INTO _updated;

    IF _updated IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Organization not found');
    END IF;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION approve_organization(uuid, uuid) TO anon, authenticated;

-- Function to reject organization verification
CREATE OR REPLACE FUNCTION reject_organization(p_organization_id uuid, p_admin_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _updated BOOLEAN;
BEGIN
    UPDATE public.profiles
    SET organization_verified     = FALSE,
        organization_verified_at  = NULL,
        organization_verified_by  = p_admin_id,
        organization_rejection_reason = p_reason
    WHERE id = p_organization_id
    RETURNING TRUE INTO _updated;

    IF _updated IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Organization not found');
    END IF;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION reject_organization(uuid, uuid, text) TO anon, authenticated; 