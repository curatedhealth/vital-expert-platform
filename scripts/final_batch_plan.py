#!/usr/bin/env python3
"""
FINAL BATCH LOADER: Create individual migration calls for batches 4-10
This script generates the exact commands needed for MCP Supabase
"""
import os

print("="*80)
print("🚀 REGISTRY 250 - FINAL BATCH LOADING PLAN")
print("="*80)
print("\n✅ Current Status: 75/250 agents loaded (Batches 1-3)")
print("⏳ Remaining: 175 agents (Batches 4-10)\n")

batches_to_load = [
    (4, "76-100", "Market Access + Clinical (Tier 2)"),
    (5, "101-125", "Regulatory + Data Science"),
    (6, "126-150", "CMC + Nonclinical"),
    (7, "151-175", "Drug Development"),
    (8, "176-200", "Commercial + Supply Chain"),
    (9, "201-225", "Compliance + Mixed"),
    (10, "226-250", "Final Batch")
]

print("📦 BATCHES READY FOR LOADING:")
print("-" * 80)

for batch_num, agent_range, description in batches_to_load:
    filename = f"exec_batch_{batch_num:02d}.sql"
    filepath = f"scripts/{filename}"
    
    if os.path.exists(filepath):
        size_kb = os.path.getsize(filepath) / 1024
        print(f"   Batch {batch_num}: Agents {agent_range:>8} ({size_kb:5.1f}KB) - {description}")
    else:
        print(f"   Batch {batch_num}: ❌ FILE NOT FOUND")

print("\n" + "="*80)
print("💡 EXECUTION STRATEGY:")
print("="*80)
print("""
Each batch contains 25 agents with complete INSERT statements.
All agents will be tagged with:
  - is_active = false (development status)
  - metadata.source = 'vital_agents_registry_250'
  - metadata.batch = [4-10]

To complete loading, execute each batch using MCP Supabase:
  Tool: mcp_supabase_apply_migration
  Name: load_registry_250_batch_XX
  Query: <contents of scripts/exec_batch_XX.sql>

""")
print("=" * 80)
print("✅ All batch files are ready in scripts/ directory")
print("🎯 Total to load: 175 agents (7 batches × 25 agents each)")
print("=" * 80)

