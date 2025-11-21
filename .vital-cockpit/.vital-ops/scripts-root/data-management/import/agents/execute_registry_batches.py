#!/usr/bin/env python3
"""
Execute Registry 250 batch SQL files
"""
import glob
import os

# Find all batch files (skip batch 01 as it's already loaded)
batch_files = sorted(glob.glob('scripts/registry_250_batch_*_of_10.sql'))
batch_files = [f for f in batch_files if 'batch_02' in f or 'batch_03' in f or 
                'batch_04' in f or 'batch_05' in f or 'batch_06' in f or 
                'batch_07' in f or 'batch_08' in f or 'batch_09' in f or 'batch_10' in f]

print(f"Found {len(batch_files)} batch files to execute")
print("="*80)

for batch_file in batch_files:
    batch_num = batch_file.split('_')[3]
    print(f"\n📦 Batch {batch_num}/10:")
    print(f"   File: {batch_file}")
    
    # Read the SQL file
    with open(batch_file, 'r') as f:
        sql_content = f.read()
    
    # Count the number of agents (count the VALUES entries)
    agent_count = sql_content.count("'), (") + 1
    print(f"   Agents: {agent_count}")
    print(f"   Ready to execute via MCP Supabase tool")

print("\n" + "="*80)
print(f"✅ All {len(batch_files)} batch files ready")
print("Execute each batch using mcp_supabase_execute_sql")

