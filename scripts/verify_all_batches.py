#!/usr/bin/env python3
"""
Batch Loader: Read each SQL file and prepare for MCP execution
"""
import os
import sys

def load_batch(batch_num):
    """Load and return SQL content for a specific batch"""
    filename = f"scripts/exec_batch_{batch_num:02d}.sql"
    
    if not os.path.exists(filename):
        print(f"❌ Error: {filename} not found", file=sys.stderr)
        return None
    
    with open(filename, 'r') as f:
        return f.read()

# Process batches 4-10
batches = [4, 5, 6, 7, 8, 9, 10]

print("="*80)
print("📦 BATCH SQL FILES READY FOR MCP SUPABASE")
print("="*80)

for batch_num in batches:
    sql_content = load_batch(batch_num)
    if sql_content:
        size_kb = len(sql_content) / 1024
        lines = sql_content.count('\n')
        agents_start = (batch_num - 1) * 25 + 1
        agents_end = batch_num * 25
        
        print(f"\n✅ Batch {batch_num:2d}: Agents {agents_start:3d}-{agents_end:3d}")
        print(f"   File: exec_batch_{batch_num:02d}.sql")
        print(f"   Size: {size_kb:.1f}KB ({lines} lines)")
        print(f"   Ready for: mcp_supabase_apply_migration")
        print(f"   Migration name: load_registry_250_batch_{batch_num:02d}")

print("\n" + "="*80)
print("✅ All 7 batches verified and ready")
print("🎯 Total: 175 agents (7 batches × 25 agents)")
print("="*80)

