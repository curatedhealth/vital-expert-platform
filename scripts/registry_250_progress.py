#!/usr/bin/env python3
"""
Create a summary script to track Registry 250 loading progress
and provide SQL file paths for easy execution
"""

print("="*80)
print("REGISTRY 250 LOADING PROGRESS")
print("="*80)

batches = {
    1: {"agents": "1-25", "status": "✅ LOADED", "file": "registry_250_batch_01_of_10.sql"},
    2: {"agents": "26-50", "status": "✅ LOADED", "file": "registry_250_batch_02_of_10.sql"},
    3: {"agents": "51-75", "status": "⏳ PENDING", "file": "registry_250_batch_03_of_10.sql"},
    4: {"agents": "76-100", "status": "⏳ PENDING", "file": "registry_250_batch_04_of_10.sql"},
    5: {"agents": "101-125", "status": "⏳ PENDING", "file": "registry_250_batch_05_of_10.sql"},
    6: {"agents": "126-150", "status": "⏳ PENDING", "file": "registry_250_batch_06_of_10.sql"},
    7: {"agents": "151-175", "status": "⏳ PENDING", "file": "registry_250_batch_07_of_10.sql"},
    8: {"agents": "176-200", "status": "⏳ PENDING", "file": "registry_250_batch_08_of_10.sql"},
    9: {"agents": "201-225", "status": "⏳ PENDING", "file": "registry_250_batch_09_of_10.sql"},
    10: {"agents": "226-250", "status": "⏳ PENDING", "file": "registry_250_batch_10_of_10.sql"},
}

print("\nBatch Summary:")
print(f"{'Batch':<10} {'Agents':<15} {'Status':<15} {'File':<40}")
print("-" * 80)

loaded_count = 0
pending_count = 0

for batch_num, info in batches.items():
    print(f"{batch_num:<10} {info['agents']:<15} {info['status']:<15} {info['file']:<40}")
    if "LOADED" in info['status']:
        loaded_count += 1
    else:
        pending_count += 1

print("\n" + "="*80)
print(f"📊 PROGRESS: {loaded_count}/10 batches loaded ({loaded_count * 25} agents)")
print(f"   Remaining: {pending_count} batches ({pending_count * 25} agents)")
print("="*80)

# Generate list of remaining batch files
remaining_files = [f"scripts/{batches[i]['file']}" for i in range(3, 11)]

print("\n📝 NEXT STEPS:")
print("   Execute remaining batches 3-10 using mcp_supabase_apply_migration")
print(f"   Files ready in: scripts/ directory")

print("\n✅ All batch files generated and ready!")

