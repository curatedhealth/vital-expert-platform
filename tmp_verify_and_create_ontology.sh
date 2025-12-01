#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== Verifying JTBD Insertion ==="

echo ""
echo "--- Total JTBD Count ---"
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "--- New Code Patterns ---"
curl -s "${URL}/rest/v1/jtbd?select=code&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" > /tmp/jtbd_codes_new.json

python3 << 'PYTHON'
import json
with open('/tmp/jtbd_codes_new.json') as f:
    data = json.load(f)

for pat in ['JTBD-MA-ALT-', 'JTBD-MKA-', 'JTBD-COM-', 'JTBD-REG-', 'JTBD-XF-']:
    count = sum(1 for x in data if x.get('code', '').startswith(pat))
    print(f"  {pat}*: {count}")
PYTHON
