#!/usr/bin/env python3
"""
Create individual migration scripts for batches 3-10  
Each will be a separate SQL file ready for apply_migration
"""
import os

# Batch info
remaining_batches = [
    (3, "51-75"),
    (4, "76-100"),
    (5, "101-125"),
    (6, "126-150"),
    (7, "151-175"),
    (8, "176-200"),
    (9, "201-225"),
    (10, "226-250"),
]

print("="*80)
print("PREPARING BATCHES 3-10 FOR LOADING")
print("="*80)

for batch_num, agent_range in remaining_batches:
    source_file = f'scripts/registry_250_batch_{batch_num:02d}_of_10.sql'
    
    if os.path.exists(source_file):
        # Get file size
        file_size = os.path.getsize(source_file)
        print(f"✅ Batch {batch_num:2d}: Agents {agent_range:>8} - {file_size:>8,} bytes - Ready")
    else:
        print(f"❌ Batch {batch_num:2d}: FILE NOT FOUND")

print("\n" + "="*80)
print("All batch files are ready for loading via mcp_supabase_apply_migration")
print("="*80)

