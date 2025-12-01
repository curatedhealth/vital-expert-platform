#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== Full JTBD Debug ==="
echo ""

echo "--- Total JTBD count ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "--- JTBDs by functional_area ---"
curl -s "${URL}/rest/v1/jtbd?select=functional_area&limit=1000" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'group_by(.functional_area) | map({area: .[0].functional_area, count: length})'

echo ""
echo "--- All JTBD codes containing 'MA-L' (Leadership) ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name,functional_area&code=like.%25MA-L%25&limit=20" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- All JTBD codes containing 'CO-' (Commercial) ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name,functional_area&code=like.%25CO-%25&limit=50" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'
