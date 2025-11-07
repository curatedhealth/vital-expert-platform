#!/usr/bin/env python3
"""
Split large SQL files into smaller batches for execution
"""
import re

def split_sql_into_batches(sql_file, batch_size=5):
    """Split large INSERT...VALUES statement into batches"""
    with open(sql_file, 'r') as f:
        content = f.read()
    
    # Extract the INSERT statement header
    header_match = re.match(r'(INSERT INTO.*?VALUES\n)', content, re.DOTALL)
    if not header_match:
        print(f"❌ Could not parse SQL file: {sql_file}")
        return []
    
    header = header_match.group(1)
    
    # Extract all VALUE entries
    # Pattern: ('...'::jsonb, true, NOW(), NOW())
    value_pattern = r"\('[^']*(?:''[^']*)*'.*?NOW\(\), NOW\(\)\)"
    values = re.findall(value_pattern, content, re.DOTALL)
    
    print(f"📄 File: {sql_file}")
    print(f"   Found {len(values)} agents")
    
    # Split into batches
    batches = []
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        batch_sql = header + ",\n".join(batch) + ";"
        batches.append(batch_sql)
    
    print(f"   Split into {len(batches)} batches of up to {batch_size} agents each")
    return batches

# Split Market Access file
print("="*80)
print("🔨 SPLITTING LARGE SQL FILES INTO BATCHES")
print("="*80)

batches_market = split_sql_into_batches('scripts/FINAL_market_access_30.sql', batch_size=6)
for i, batch in enumerate(batches_market, 1):
    with open(f'scripts/batch_market_access_{i}.sql', 'w') as f:
        f.write(batch)
    print(f"   ✅ Batch {i} saved: scripts/batch_market_access_{i}.sql")

print(f"\n✅ Market Access split into {len(batches_market)} batch files")
print("="*80)

