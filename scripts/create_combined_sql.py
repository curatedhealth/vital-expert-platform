#!/usr/bin/env python3
"""
FINAL LOADER: Generate summary SQL file combining all remaining batches
for single execution via Supabase MCP
"""
import os

print("="*80)
print("🚀 CREATING COMBINED SQL FOR BATCHES 3-10")
print("="*80)

# Read all batch files and combine
combined_sql = "-- Registry 250 Combined: Batches 3-10\n"
combined_sql += "-- Agents 51-250 (200 agents)\n"
combined_sql += "-- Status: DEVELOPMENT (is_active=false)\n"
combined_sql += "-- Auto-generated for bulk loading\n\n"

batches = [
    (3, "exec_batch_03.sql"),
    (4, "exec_batch_04.sql"),
    (5, "exec_batch_05.sql"),
    (6, "exec_batch_06.sql"),
    (7, "exec_batch_07.sql"),
    (8, "exec_batch_08.sql"),
    (9, "exec_batch_09.sql"),
    (10, "exec_batch_10.sql"),
]

for batch_num, filename in batches:
    file_path = f"scripts/{filename}"
    
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        # For first batch, include entire INSERT statement
        if batch_num == 3:
            combined_sql += content
        else:
            # For subsequent batches, extract just the VALUES portion
            # Remove the INSERT INTO header and connect with comma
            lines = content.strip().split('\n')
            
            # Find where VALUES starts
            values_start_idx = None
            for i, line in enumerate(lines):
                if 'VALUES' in line:
                    values_start_idx = i + 1
                    break
            
            if values_start_idx:
                # Get everything after VALUES line
                values_content = '\n'.join(lines[values_start_idx:])
                
                # Remove the final semicolon if present
                values_content = values_content.rstrip(';').rstrip()
                
                # Add comma and append
                combined_sql += ',\n' + values_content
        
        print(f"✅ Included Batch {batch_num}")
    else:
        print(f"❌ Missing Batch {batch_num}")

# Add final semicolon
if not combined_sql.strip().endswith(';'):
    combined_sql += ';'

# Save combined file
output_file = 'scripts/registry_250_batches_3_to_10_combined.sql'
with open(output_file, 'w') as f:
    f.write(combined_sql)

file_size = len(combined_sql)
print("\n" + "="*80)
print(f"✅ COMBINED SQL CREATED")
print("="*80)
print(f"   File: {output_file}")
print(f"   Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
print(f"   Agents: 200 (Batches 3-10)")
print("="*80)

# Calculate lines
line_count = combined_sql.count('\n')
print(f"   Lines: {line_count:,}")

print("\n💡 IMPORTANT: File too large for single apply_migration")
print("   Recommendation: Execute batches individually OR split into smaller chunks")
print("="*80)

