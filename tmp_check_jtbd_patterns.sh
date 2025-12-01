#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== Current JTBD Statistics ==="
echo ""

# Total count
echo "--- Total JTBDs ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "--- JTBDs by Functional Area ---"
curl -s "${URL}/rest/v1/jtbd?select=functional_area&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
from collections import Counter
areas = Counter(d.get('functional_area', 'null') for d in data)
for area, count in sorted(areas.items(), key=lambda x: -x[1]):
    print(f'  {area}: {count}')
"

echo ""
echo "--- Sample Codes by Pattern ---"
curl -s "${URL}/rest/v1/jtbd?select=code&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | python3 -c "
import json, sys, re
data = json.load(sys.stdin)
from collections import Counter
patterns = Counter()
for d in data:
    code = d.get('code', '')
    match = re.match(r'(JTBD-[A-Z]+)', code)
    if match:
        patterns[match.group(1)] += 1
    else:
        patterns['other'] += 1
for pat, count in sorted(patterns.items(), key=lambda x: -x[1]):
    print(f'  {pat}: {count}')
"

echo ""
echo "--- Check for New Code Patterns from JSON file ---"
echo "Looking for: JTBD-MKA, JTBD-COM, JTBD-REG, JTBD-XF"
for pat in "JTBD-MKA" "JTBD-COM" "JTBD-REG" "JTBD-XF"; do
    count=$(curl -s "${URL}/rest/v1/jtbd?select=code&code=like.${pat}%25&limit=100" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
    echo "  ${pat}-*: ${count}"
done
