#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            FINAL ENTERPRISE ONTOLOGY VERIFICATION              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "=== JTBD Statistics ==="
echo ""

echo "--- Total JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/content-range: /Total: /'

echo ""
echo "--- JTBDs by Functional Area ---"
curl -s "${URL}/rest/v1/jtbd?select=functional_area&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" > /tmp/jtbd_areas.json
python3 -c "
import json
from collections import Counter
with open('/tmp/jtbd_areas.json') as f:
    data = json.load(f)
areas = Counter(d.get('functional_area', 'null') for d in data)
for area, count in sorted(areas.items(), key=lambda x: -x[1]):
    print(f'  {area}: {count}')
"

echo ""
echo "--- New Code Patterns Added ---"
curl -s "${URL}/rest/v1/jtbd?select=code&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" > /tmp/jtbd_codes.json
python3 -c "
import json
with open('/tmp/jtbd_codes.json') as f:
    data = json.load(f)
patterns = ['JTBD-MA-ALT-', 'JTBD-MKA-', 'JTBD-COM-', 'JTBD-REG-', 'JTBD-XF-']
for pat in patterns:
    count = sum(1 for x in data if x.get('code', '').startswith(pat))
    print(f'  {pat}*: {count}')
total = sum(1 for x in data if any(x.get('code', '').startswith(p) for p in patterns))
print(f'  ---')
print(f'  Total New JTBDs: {total}')
"

echo ""
echo "=== Enterprise Ontology Tables ==="
echo ""

# KPIs
echo -n "KPIs: "
curl -s "${URL}/rest/v1/jtbd_kpis?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///'

# Pain Points
echo -n "Pain Points: "
curl -s "${URL}/rest/v1/jtbd_pain_points?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///'

# Desired Outcomes
echo -n "Desired Outcomes: "
curl -s "${URL}/rest/v1/jtbd_desired_outcomes?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///'

# AI Suitability
echo -n "AI Suitability: "
curl -s "${URL}/rest/v1/jtbd_ai_suitability?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///'

# Function Mappings
echo -n "Function Mappings: "
curl -s "${URL}/rest/v1/jtbd_functions?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///'

echo ""
echo "=== Sample New JTBDs ==="
echo ""
curl -s "${URL}/rest/v1/jtbd?select=code,name&code=like.JTBD-MKA-*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Market Access JTBDs:')
for d in data:
    print(f\"  {d['code']}: {d['name']}\")
"

curl -s "${URL}/rest/v1/jtbd?select=code,name&code=like.JTBD-REG-*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Regulatory JTBDs:')
for d in data:
    print(f\"  {d['code']}: {d['name']}\")
"

curl -s "${URL}/rest/v1/jtbd?select=code,name&code=like.JTBD-XF-*&limit=3" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('Cross-Functional JTBDs:')
for d in data:
    print(f\"  {d['code']}: {d['name']}\")
"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION COMPLETE                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
