#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

echo "=== Test single JTBD insert ==="
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"tenant_id\": \"${TENANT_ID}\",
    \"code\": \"JTBD-TEST-001\",
    \"name\": \"Test JTBD Insert\",
    \"description\": \"Testing if insert works\",
    \"functional_area\": \"Medical Affairs\",
    \"job_category\": \"strategic\",
    \"complexity\": \"high\",
    \"frequency\": \"quarterly\",
    \"status\": \"active\",
    \"validation_score\": 0.90,
    \"jtbd_type\": \"strategic\",
    \"work_pattern\": \"mixed\",
    \"strategic_priority\": \"high\",
    \"impact_level\": \"high\",
    \"compliance_sensitivity\": \"high\",
    \"recommended_service_layer\": \"L1_expert\"
  }")

echo "$response"

echo ""
echo "=== Check JTBD schema ==="
curl -s "${URL}/rest/v1/jtbd?select=*&limit=1" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'keys'
