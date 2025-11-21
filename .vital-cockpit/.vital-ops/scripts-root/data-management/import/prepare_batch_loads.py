#!/usr/bin/env python3
"""
Load all Registry 250 batch SQL files by printing them for MCP execution
Batch 2-10 (225 agents remaining)
"""
import os

batches_to_load = [
    'scripts/registry_250_batch_02_of_10.sql',
    'scripts/registry_250_batch_03_of_10.sql',
    'scripts/registry_250_batch_04_of_10.sql',
    'scripts/registry_250_batch_05_of_10.sql',
    'scripts/registry_250_batch_06_of_10.sql',
    'scripts/registry_250_batch_07_of_10.sql',
    'scripts/registry_250_batch_08_of_10.sql',
    'scripts/registry_250_batch_09_of_10.sql',
    'scripts/registry_250_batch_10_of_10.sql'
]

print("="*80)
print("🚀 REGISTRY 250 BATCH LOADING")
print("="*80)
print(f"\nBatch 1/10: ✅ LOADED (25 agents)")
print(f"Remaining: {len(batches_to_load)} batches (225 agents)\n")

for idx, batch_file in enumerate(batches_to_load, 2):
    if os.path.exists(batch_file):
        with open(batch_file, 'r') as f:
            content = f.read()
        
        # Count agents
        agent_count = content.count("'), (") + 1
        
        # Save to individual file for easy execution
        output_file = f'scripts/load_batch_{idx:02d}.sql'
        with open(output_file, 'w') as f:
            f.write(content)
        
        print(f"✅ Batch {idx:2d}/10: {agent_count:2d} agents → {output_file}")

print("\n" + "="*80)
print("📋 EXECUTION INSTRUCTIONS")
print("="*80)
print("Execute each batch sequentially using:")
print("  mcp_supabase_execute_sql with the content of each load_batch_XX.sql file")
print("\nAll batches are ready in scripts/load_batch_*.sql")
print("="*80)

