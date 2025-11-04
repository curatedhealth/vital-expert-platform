-- ============================================================================
-- ADD SECOND SUPERADMIN
-- ============================================================================
-- Adds hicham.naim@xroadscatalyst.com as superadmin
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'hicham.naim@xroadscatalyst.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Assign superadmin role
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (v_user_id, 'superadmin', v_platform_tenant_id)
    ON CONFLICT (user_id, tenant_id)
    DO UPDATE SET role = 'superadmin';

    RAISE NOTICE 'Granted superadmin to: hicham.naim@xroadscatalyst.com (ID: %)', v_user_id;
  ELSE
    RAISE NOTICE 'User not found: hicham.naim@xroadscatalyst.com';
    RAISE NOTICE 'Please ensure this user has logged in at least once.';
  END IF;
END $$;

-- Verify all superadmins
SELECT
  u.email,
  ur.role,
  ur.tenant_id,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'superadmin'
ORDER BY ur.created_at;
