#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== JTBD Tables Check ==="
echo ""
echo "--- All JTBD-related tables ---"
curl -s "${URL}/rest/v1/?apikey=${APIKEY}" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq -r 'keys[]' | grep -i jtbd | sort

echo ""
echo "--- JTBD count after migration ---"
curl -s "${URL}/rest/v1/jtbd?select=functional_area&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'group_by(.functional_area) | map({area: .[0].functional_area, count: length})'

echo ""
echo "--- Sample newly created JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name,functional_area&code=like.JTBD-MA-*&limit=5" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- Sample Commercial JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name,functional_area&code=like.JTBD-CO-*&limit=5" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'
