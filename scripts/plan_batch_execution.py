#!/usr/bin/env python3
"""
Execute Registry 250 batches 3-10 sequentially
Reads each SQL file and outputs for MCP apply_migration execution
"""
import os

batches_info = [
    (3, "51-75", "registry_250_batch_03_of_10.sql"),
    (4, "76-100", "registry_250_batch_04_of_10.sql"),
    (5, "101-125", "registry_250_batch_05_of_10.sql"),
    (6, "126-150", "registry_250_batch_06_of_10.sql"),
    (7, "151-175", "registry_250_batch_07_of_10.sql"),
    (8, "176-200", "registry_250_batch_08_of_10.sql"),
    (9, "201-225", "registry_250_batch_09_of_10.sql"),
    (10, "226-250", "registry_250_batch_10_of_10.sql"),
]

print("="*80)
print("REGISTRY 250 - BATCH EXECUTION PLAN")
print("="*80)

for batch_num, agent_range, filename in batches_info:
    file_path = f"scripts/{filename}"
    
    if os.path.exists(file_path):
        file_size = os.path.getsize(file_path)
        
        # Read first few lines to verify content
        with open(file_path, 'r') as f:
            first_line = f.readline().strip()
        
        print(f"\n📦 Batch {batch_num}: Agents {agent_range}")
        print(f"   File: {filename}")
        print(f"   Size: {file_size:,} bytes")
        print(f"   Migration name: load_registry_250_batch_{batch_num:02d}")
        print(f"   Status: ✅ Ready")
    else:
        print(f"\n❌ Batch {batch_num}: FILE NOT FOUND - {filename}")

print("\n" + "="*80)
print("📝 EXECUTION INSTRUCTIONS:")
print("="*80)
print("Use mcp_supabase_apply_migration for each batch:")
print("  - name: load_registry_250_batch_XX")
print("  - query: <contents of batch SQL file>")
print("\nAll 8 batches need to be executed sequentially.")
print("="*80)

