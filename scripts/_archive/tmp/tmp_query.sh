#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=============================================="
echo "=== JTBD TABLE STRUCTURE ==="
echo "=============================================="
echo ""

echo "--- Checking for JTBD-related tables ---"
curl -s "${URL}/rest/v1/?apikey=${APIKEY}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r 'keys[]' | grep -i jtbd

echo ""
echo "--- All tables with 'job' in name ---"
curl -s "${URL}/rest/v1/?apikey=${APIKEY}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r 'keys[]' | grep -i job

echo ""
echo "=============================================="
echo "=== JTBD TABLE SAMPLE (if exists) ==="
echo "=============================================="

echo ""
echo "--- Sample from jtbd table ---"
curl -s "${URL}/rest/v1/jtbd?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- JTBD count ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "=============================================="
echo "=== JTBD JUNCTION TABLES ==="
echo "=============================================="

echo ""
echo "--- jtbd_roles sample ---"
curl -s "${URL}/rest/v1/jtbd_roles?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_functions sample ---"
curl -s "${URL}/rest/v1/jtbd_functions?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_departments sample ---"
curl -s "${URL}/rest/v1/jtbd_departments?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "=============================================="
echo "=== ORG FUNCTIONS TABLE ==="
echo "=============================================="

echo ""
echo "--- All functions ---"
curl -s "${URL}/rest/v1/org_functions?select=id,name&order=name&limit=50" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r '.[] | "\(.id) | \(.name)"'

echo ""
echo "=============================================="
echo "=== ORG DEPARTMENTS (Medical, Access, Commercial) ==="
echo "=============================================="

echo ""
echo "--- Medical Affairs departments ---"
curl -s "${URL}/rest/v1/org_departments?select=id,name,function_id&name=ilike.*medical*&limit=20" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r '.[] | "\(.id) | \(.name)"'

echo ""
echo "--- Market Access departments ---"
curl -s "${URL}/rest/v1/org_departments?select=id,name,function_id&or=(name.ilike.*access*,name.ilike.*heor*,name.ilike.*pricing*,name.ilike.*payer*)&limit=20" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r '.[] | "\(.id) | \(.name)"'

echo ""
echo "--- Commercial departments ---"
curl -s "${URL}/rest/v1/org_departments?select=id,name,function_id&or=(name.ilike.*commercial*,name.ilike.*sales*,name.ilike.*marketing*,name.ilike.*brand*)&limit=20" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r '.[] | "\(.id) | \(.name)"'
