#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"

echo "=== Total JTBD Count ==="
curl -s "${URL}/rest/v1/jtbd?select=id" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range"

echo ""
echo "=== Distinct Code Prefixes ==="
curl -s "${URL}/rest/v1/jtbd?select=code&limit=500" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" > /tmp/jtbd_codes.json

python3 << 'PYTHON'
import json
from collections import Counter
import re

with open('/tmp/jtbd_codes.json') as f:
    data = json.load(f)

prefixes = Counter()
for item in data:
    code = item.get('code', '')
    # Extract prefix pattern (JTBD-XX or first part)
    if code.startswith('JTBD-'):
        parts = code.split('-')
        if len(parts) >= 2:
            prefix = f"JTBD-{parts[1]}"
            prefixes[prefix] += 1
    else:
        prefixes['other'] += 1

print("Code Prefix Distribution:")
for prefix, count in sorted(prefixes.items(), key=lambda x: -x[1])[:20]:
    print(f"  {prefix}: {count}")

# Check for our new patterns
print("\n=== New Pattern Check ===")
for pat in ['JTBD-MA-ALT-', 'JTBD-MKA-', 'JTBD-COM-', 'JTBD-REG-', 'JTBD-XF-']:
    count = sum(1 for x in data if x.get('code', '').startswith(pat))
    print(f"  {pat}*: {count}")
PYTHON
