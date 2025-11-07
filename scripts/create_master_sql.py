#!/usr/bin/env python3
"""
COMPREHENSIVE BATCH LOADER
Creates a master SQL file combining all batches 4-10 for streamlined execution
"""
import os

print("="*80)
print("🚀 CREATING MASTER SQL FILE FOR BATCHES 4-10")
print("="*80)

# Combine all remaining batches into one master file
master_sql = """-- ============================================================================
-- REGISTRY 250: COMPREHENSIVE LOADING - BATCHES 4-10
-- ============================================================================
-- Agents: 76-250 (175 agents)
-- Status: DEVELOPMENT (is_active=false)
-- Source: vital_agents_registry_250
-- ============================================================================

"""

batch_files = [
    ('scripts/exec_batch_04.sql', 4, '76-100'),
    ('scripts/exec_batch_05.sql', 5, '101-125'),
    ('scripts/exec_batch_06.sql', 6, '126-150'),
    ('scripts/exec_batch_07.sql', 7, '151-175'),
    ('scripts/exec_batch_08.sql', 8, '176-200'),
    ('scripts/exec_batch_09.sql', 9, '201-225'),
    ('scripts/exec_batch_10.sql', 10, '226-250'),
]

total_size = 0
for file_path, batch_num, agent_range in batch_files:
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        file_size = len(content)
        total_size += file_size
        
        # Add batch content
        master_sql += f"\n-- Batch {batch_num}: Agents {agent_range}\n"
        master_sql += content
        master_sql += "\n\n"
        
        print(f"✅ Added Batch {batch_num}: Agents {agent_range} ({file_size/1024:.1f}KB)")
    else:
        print(f"❌ Missing: {file_path}")

# Save master file
output_file = 'scripts/registry_250_master_batches_4_10.sql'
with open(output_file, 'w') as f:
    f.write(master_sql)

print("\n" + "="*80)
print(f"✅ MASTER FILE CREATED")
print("="*80)
print(f"   File: {output_file}")
print(f"   Size: {len(master_sql)/1024:.1f}KB")
print(f"   Batches: 4-10 (7 batches)")
print(f"   Agents: 175 (76-250)")
print("="*80)

print("\n💡 IMPORTANT:")
print("   This file is too large for a single mig ration.")
print("   Recommendation: Execute individual batch files via Supabase SQL Editor")
print("   OR: Use the split batch approach (already prepared)")
print("="*80)

