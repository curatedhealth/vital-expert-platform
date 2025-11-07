#!/usr/bin/env python3
"""
Combine all remaining Registry 250 batches (2-10) into a single migration
for efficient execution via apply_migration
"""
import os

print("="*80)
print("🚀 COMBINING REGISTRY 250 BATCHES 2-10")
print("="*80)

batches = [
    ('scripts/registry_250_batch_02_of_10.sql', 26, 50),
    ('scripts/registry_250_batch_03_of_10.sql', 51, 75),
    ('scripts/registry_250_batch_04_of_10.sql', 76, 100),
    ('scripts/registry_250_batch_05_of_10.sql', 101, 125),
    ('scripts/registry_250_batch_06_of_10.sql', 126, 150),
    ('scripts/registry_250_batch_07_of_10.sql', 151, 175),
    ('scripts/registry_250_batch_08_of_10.sql', 176, 200),
    ('scripts/registry_250_batch_09_of_10.sql', 201, 225),
    ('scripts/registry_250_batch_10_of_10.sql', 226, 250),
]

# Combine all batches
combined_sql = "-- Registry 250 Combined Migration: Batches 2-10\n"
combined_sql += "-- Agents 26-250 (225 agents)\n"
combined_sql += "-- Status: DEVELOPMENT (is_active=false)\n"
combined_sql += "-- Generated for efficient bulk loading\n\n"

for batch_file, start, end in batches:
    if os.path.exists(batch_file):
        print(f"📦 Processing Batch agents {start:3d}-{end:3d}... ", end='')
        with open(batch_file, 'r') as f:
            content = f.read()
        
        # Remove the header comments from subsequent batches
        lines = content.split('\n')
        sql_start = None
        for i, line in enumerate(lines):
            if line.strip().startswith('INSERT INTO'):
                sql_start = i
                break
        
        if sql_start:
            batch_sql = '\n'.join(lines[sql_start:])
            
            # For batches 3-10, we need to append to existing INSERT
            # Remove "INSERT INTO..." and keep only the VALUES part
            if start > 26:  # Not the first batch
                # Find the VALUES part
                values_idx = batch_sql.find('VALUES\n')
                if values_idx > 0:
                    batch_sql = batch_sql[values_idx + 7:]  # Skip "VALUES\n"
                    # Remove leading '(' and add ',\n(' to connect
                    batch_sql = ',\n' + batch_sql
            
            combined_sql += batch_sql
            if not batch_sql.strip().endswith(';'):
                combined_sql += '\n'
            
            print("✅")
        else:
            print(" SKIP (no SQL found)")
    else:
        print(f"❌ File not found: {batch_file}")

# Save combined migration
output_file = 'scripts/registry_250_combined_batches_02_10.sql'
with open(output_file, 'w') as f:
    f.write(combined_sql)

print("\n" + "="*80)
print(f"✅ Combined migration saved: {output_file}")
print(f"   Contains: Agents 26-250 (225 agents)")
print(f"   Status: DEVELOPMENT")
print(f"   Size: {len(combined_sql):,} bytes")
print("="*80)
print("\n💡 TIP: This is too large for a single migration.")
print("   Will need to execute batches 2-10 individually.")
print("="*80)

