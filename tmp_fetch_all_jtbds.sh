#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== Checking all our new JTBDs ==="
echo ""

echo "--- All Medical Affairs JTBDs with our codes ---"
curl -s "${URL}/rest/v1/jtbd?select=id,code,name&or=(code.like.JTBD-MA-L%25,code.like.JTBD-MA-FM%25,code.like.JTBD-MA-MI%25,code.like.JTBD-MA-ME%25,code.like.JTBD-MA-PB%25,code.like.JTBD-MA-MS%25)&limit=50" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo ""
echo "--- All Market Access JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=id,code&functional_area=eq.Market%20Access&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo ""
echo "--- All Commercial JTBDs (JTBD-CO-*) ---"
curl -s "${URL}/rest/v1/jtbd?select=id,code&or=(code.like.JTBD-CO%25)&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo ""
echo "--- Sample Medical Affairs JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=id,code,name&or=(code.like.JTBD-MA-L%25,code.like.JTBD-MA-FM%25)&limit=5" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.[] | {code, name}'
