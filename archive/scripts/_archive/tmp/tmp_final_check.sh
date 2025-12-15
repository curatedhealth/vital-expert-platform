#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== FINAL VERIFICATION ==="
echo ""

echo "--- Total JTBDs by functional_area ---"
curl -s "${URL}/rest/v1/jtbd?select=functional_area&limit=1000" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'group_by(.functional_area) | map({area: .[0].functional_area, count: length})'

echo ""
echo "--- Sample Medical Affairs JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name&functional_area=eq.Medical%20Affairs&limit=10" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.[] | .code'

echo ""
echo "--- Sample Commercial JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=code,name&functional_area=eq.Commercial&limit=10" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.[] | .code'

echo ""
echo "--- AI Suitability table check ---"
curl -s "${URL}/rest/v1/jtbd_ai_suitability?select=*&limit=1" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq '.'

echo ""
echo "--- JTBD Total Count ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "=== ENTERPRISE ONTOLOGY SUMMARY ==="
echo "KPIs: $(curl -s "${URL}/rest/v1/jtbd_kpis?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
echo "Pain Points: $(curl -s "${URL}/rest/v1/jtbd_pain_points?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
echo "Desired Outcomes: $(curl -s "${URL}/rest/v1/jtbd_desired_outcomes?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
