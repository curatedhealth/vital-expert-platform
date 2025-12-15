#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== JTBD Junction Tables ==="
echo ""
echo "--- All tables with 'jtbd' in name ---"
curl -s "${URL}/rest/v1/?apikey=${APIKEY}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r 'keys[]' | grep -i jtbd

echo ""
echo "--- jtbd_functions sample ---"
curl -s "${URL}/rest/v1/jtbd_functions?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_roles sample ---"
curl -s "${URL}/rest/v1/jtbd_roles?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_departments sample ---"
curl -s "${URL}/rest/v1/jtbd_departments?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_kpis sample ---"
curl -s "${URL}/rest/v1/jtbd_kpis?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_pain_points sample ---"
curl -s "${URL}/rest/v1/jtbd_pain_points?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_desired_outcomes sample ---"
curl -s "${URL}/rest/v1/jtbd_desired_outcomes?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- jtbd_ai_suitability sample ---"
curl -s "${URL}/rest/v1/jtbd_ai_suitability?select=*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'
