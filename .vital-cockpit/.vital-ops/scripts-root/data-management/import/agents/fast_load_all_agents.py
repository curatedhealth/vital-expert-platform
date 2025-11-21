#!/usr/bin/env python3
"""
Fast batch load all agents using SQL files
"""
import subprocess
import sys

def execute_sql_file(file_path, description):
    """Read SQL file and print for execution"""
    print(f"\n{'='*80}")
    print(f"📦 LOADING: {description}")
    print(f"{'='*80}")
    
    try:
        with open(file_path, 'r') as f:
            sql_content = f.read()
            
        # Count number of agents (count VALUES entries)
        agent_count = sql_content.count("NOW(), NOW())") - sql_content.count("NOW(), NOW()),")
        print(f"   Agents in batch: {agent_count}")
        print(f"   File: {file_path}")
        print(f"   Status: ✅ Ready for execution")
        print(f"\n   SQL Preview (first 500 chars):")
        print(f"   {sql_content[:500]}...")
        
        return sql_content
        
    except FileNotFoundError:
        print(f"   ❌ File not found: {file_path}")
        return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def main():
    print("\n" + "="*80)
    print("🚀 FAST AGENT LOADER - ALL REMAINING AGENTS")
    print("="*80)
    
    # List of SQL files to execute
    sql_files = [
        ('scripts/sql_batch_medical_2.sql', 'Medical Affairs Batch 2 (10 more agents)'),
        ('scripts/sql_batch_market_1.sql', 'Market Access Batch 1 (10 agents)'),
        ('scripts/sql_batch_market_2.sql', 'Market Access Batch 2 (10 agents)'),
        ('scripts/sql_batch_market_3.sql', 'Market Access Batch 3 (10 agents)'),
        ('scripts/sql_batch_marketing.sql', 'Marketing (4 agents)'),
        ('scripts/sql_batch_remote.sql', 'Remote Backup Doctors (3 agents)'),
    ]
    
    loaded_batches = []
    total_agents = 0
    
    for sql_file, description in sql_files:
        sql_content = execute_sql_file(sql_file, description)
        if sql_content:
            loaded_batches.append((sql_file, description, sql_content))
            # Rough count
            agent_count = sql_content.count("'::jsonb, true, NOW(), NOW())")
            total_agents += agent_count
    
    print("\n" + "="*80)
    print(f"📊 SUMMARY")
    print("="*80)
    print(f"   Total batches ready: {len(loaded_batches)}")
    print(f"   Estimated total agents: {total_agents}")
    print(f"\n   Note: Execute these SQL statements in Supabase manually")
    print(f"   or use the MCP Supabase tool")
    print("="*80)
    
    # Save all SQL to a single file for easy execution
    with open('scripts/ALL_AGENTS_COMBINED.sql', 'w') as f:
        for sql_file, description, sql_content in loaded_batches:
            f.write(f"-- {description}\n")
            f.write(f"-- Source: {sql_file}\n\n")
            f.write(sql_content)
            f.write("\n\n")
    
    print(f"\n✅ All SQL combined into: scripts/ALL_AGENTS_COMBINED.sql")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

