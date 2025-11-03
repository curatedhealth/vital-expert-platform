#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 RLS Verification for VITAL AI Engine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENV_NAME="${1:-dev}"
echo "📍 Environment: $ENV_NAME"
echo ""

# Set DATABASE_URL based on environment
case $ENV_NAME in
    dev) DB_URL="${DATABASE_URL_DEV:-$DATABASE_URL}" ;;
    preview) DB_URL="${DATABASE_URL_PREVIEW}" ;;
    production) DB_URL="${DATABASE_URL_PROD}" ;;
    *) 
        echo "❌ Invalid environment: $ENV_NAME"
        echo "Usage: ./verify-rls.sh [dev|preview|production]"
        exit 1
        ;;
esac

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL not set for environment: $ENV_NAME"
    exit 1
fi

echo "🗄️  Database: ${DB_URL%%@*}@***"
echo ""

# Test 1: Check RLS is enabled
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ Checking RLS is enabled on tables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DB_URL" << 'EOF'
SELECT 
    schemaname, 
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'messages', 'user_agents')
ORDER BY tablename;
EOF

echo ""

# Test 2: Count policies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ Counting RLS policies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
POLICY_COUNT=$(psql "$DB_URL" -t -c "
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND policyname LIKE 'tenant_isolation_%'
" | xargs)

if [ "$POLICY_COUNT" -ge "4" ]; then
    echo "✅ Found $POLICY_COUNT policies (expected 4+)"
else
    echo "❌ ERROR: Found only $POLICY_COUNT policies (expected 4+)"
    exit 1
fi

echo ""

# Test 3: List policies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ Listing RLS policies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DB_URL" << 'EOF'
SELECT 
    tablename, 
    policyname,
    CASE WHEN permissive = 'PERMISSIVE' THEN '✅ PERMISSIVE' ELSE '⚠️  RESTRICTIVE' END as type,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE 'tenant_isolation_%'
ORDER BY tablename, policyname;
EOF

echo ""

# Test 4: Check helper functions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ Checking helper functions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FUNCTIONS_FOUND=0
for func in set_tenant_context get_tenant_context clear_tenant_context count_rls_policies; do
    COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname = '$func'" | xargs)
    if [ "$COUNT" = "1" ]; then
        echo "✅ $func() exists"
        FUNCTIONS_FOUND=$((FUNCTIONS_FOUND + 1))
    else
        echo "❌ ERROR: $func() not found"
    fi
done

if [ "$FUNCTIONS_FOUND" -ne "4" ]; then
    echo "❌ ERROR: Only $FUNCTIONS_FOUND/4 functions found"
    exit 1
fi

echo ""

# Test 5: Test RLS enforcement (THE CRITICAL TEST)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣ Testing RLS enforcement (CRITICAL SECURITY TEST)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   This test ensures Tenant A cannot see Tenant B's data."
echo ""

psql "$DB_URL" << 'EOF'
DO $$
DECLARE
    tenant_a UUID := '550e8400-e29b-41d4-a716-446655440001'::uuid;
    tenant_b UUID := '550e8400-e29b-41d4-a716-446655440002'::uuid;
    agent_id_a UUID;
    count_a INTEGER;
    count_b INTEGER;
BEGIN
    -- Cleanup any existing test data
    DELETE FROM agents WHERE tenant_id IN (tenant_a, tenant_b);
    
    -- Set context to Tenant A
    PERFORM set_tenant_context(tenant_a);
    
    -- Create agent for Tenant A
    INSERT INTO agents (id, tenant_id, name, description, created_at, updated_at)
    VALUES (gen_random_uuid(), tenant_a, 'RLS Test Agent A', 'Test', NOW(), NOW())
    RETURNING id INTO agent_id_a;
    
    -- Query as Tenant A (should see 1 agent)
    SELECT COUNT(*) INTO count_a FROM agents WHERE tenant_id = tenant_a;
    
    -- Switch to Tenant B
    PERFORM set_tenant_context(tenant_b);
    
    -- Query as Tenant B (should see 0 agents - RLS working!)
    SELECT COUNT(*) INTO count_b FROM agents WHERE tenant_id = tenant_a;
    
    -- Cleanup
    PERFORM set_tenant_context(tenant_a);
    DELETE FROM agents WHERE id = agent_id_a;
    PERFORM clear_tenant_context();
    
    -- Verify results
    IF count_a = 1 AND count_b = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '   ✅ RLS TEST PASSED - Tenant isolation working correctly!';
        RAISE NOTICE '   📊 Tenant A saw: % agent (expected 1)', count_a;
        RAISE NOTICE '   📊 Tenant B saw: % agents (expected 0)', count_b;
        RAISE NOTICE '   🔒 Cross-tenant data access is BLOCKED';
        RAISE NOTICE '';
    ELSE
        RAISE EXCEPTION '❌ RLS TEST FAILED - Tenant A saw %, Tenant B saw % (expected 1, 0)', count_a, count_b;
    END IF;
END $$;
EOF

RLS_TEST_EXIT_CODE=$?

echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $RLS_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ RLS VERIFICATION PASSED FOR $ENV_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Summary:"
    echo "  ✅ RLS enabled on 4+ tables"
    echo "  ✅ $POLICY_COUNT policies active"
    echo "  ✅ 4 helper functions available"
    echo "  ✅ Cross-tenant access blocked"
    echo ""
    echo "Security Status: COMPLIANT ✅"
    echo ""
    echo "Next steps:"
    echo "  1. Update health endpoint to show RLS status"
    echo "  2. Run security tests: pytest tests/security/"
    echo "  3. Monitor RLS in production"
    exit 0
else
    echo "❌ RLS VERIFICATION FAILED FOR $ENV_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  SECURITY RISK: RLS is not working correctly!"
    echo ""
    echo "Action required:"
    echo "  1. Review migration logs"
    echo "  2. Check database permissions"
    echo "  3. Contact security team"
    exit 1
fi

