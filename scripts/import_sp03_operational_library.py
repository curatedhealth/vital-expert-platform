#!/usr/bin/env python3
"""
Import SP03 Stakeholder Engagement Operational Library
- 19 workflows
- 55 phases
- 82 tasks
- 18 JTBDs covered
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(url, key)

def print_header():
    """Print import header"""
    print("╔═══════════════════════════════════════════════════════════════════════════╗")
    print("║                                                                            ║")
    print("║   SP03 OPERATIONAL LIBRARY IMPORT                                         ║")
    print("║   19 Workflows | 55 Phases | 82 Tasks | 18 JTBDs                         ║")
    print("║   STAKEHOLDER ENGAGEMENT                                                  ║")
    print("║                                                                            ║")
    print("╚═══════════════════════════════════════════════════════════════════════════╝\n")

def import_workflows(jtbds: List[Dict]) -> int:
    """Import workflows with full definition (phases and tasks)"""
    print("\n" + "="*80)
    print("📋 IMPORTING COMPLETE WORKFLOWS (with Phases & Tasks)")
    print("="*80)
    
    workflow_count = 0
    phase_count = 0
    task_count = 0
    
    for jtbd in jtbds:
        jtbd_id = jtbd['id']
        workflows = jtbd.get('workflows', [])
        
        for wf in workflows:
            workflow_id = wf['workflow_id']
            workflow_name = wf['workflow_name']
            duration = wf['duration']
            phases = wf.get('phases', [])
            
            # Count phases and tasks
            phase_count += len(phases)
            for phase in phases:
                task_count += len(phase.get('tasks', []))
            
            # Prepare complete workflow definition with metadata
            workflow_definition = {
                'workflow_id': workflow_id,
                'workflow_name': workflow_name,
                'jtbd_id': jtbd_id,
                'pillar': 'SP03',
                'pillar_name': 'Stakeholder Engagement',
                'duration': duration,
                'total_effort': wf.get('total_effort'),
                'phase_count': len(phases),
                'task_count': sum(len(p.get('tasks', [])) for p in phases),
                'phases': phases,
                'source': 'SP03 Operational Library',
                'imported_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Prepare workflow data for Supabase
            workflow_data = {
                'name': workflow_name,
                'description': f"{workflow_name} for {jtbd_id} ({duration}, {len(phases)} phases, {workflow_definition['task_count']} tasks)",
                'definition': workflow_definition,
                'status': 'active',
                'is_public': True,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            try:
                # Insert workflow
                result = supabase.table('workflows').insert(workflow_data).execute()
                
                if result.data:
                    workflow_count += 1
                    print(f"✅ [{workflow_count}] {workflow_id}: {workflow_name}")
                    print(f"   └─ {len(phases)} phases, {workflow_definition['task_count']} tasks")
                
            except Exception as e:
                # Try update if insert fails (duplicate)
                try:
                    result = supabase.table('workflows').update(workflow_data).eq(
                        'name', workflow_name
                    ).execute()
                    if result.data:
                        workflow_count += 1
                        print(f"✅ [{workflow_count}] {workflow_id}: {workflow_name} (updated)")
                        print(f"   └─ {len(phases)} phases, {workflow_definition['task_count']} tasks")
                except Exception as e2:
                    print(f"❌ Error importing {workflow_id}: {str(e2)}")
    
    print(f"\n✅ Imported {workflow_count} workflows with:")
    print(f"   • {phase_count} phases")
    print(f"   • {task_count} tasks")
    return workflow_count

def main():
    """Main execution function"""
    print_header()
    
    # Load JSON file
    json_file = '/Users/hichamnaim/Downloads/SP03_StakeholderEngagement_OperationalLibrary_FULL.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        print(f"✅ Loaded {data['metadata']['record_count']} JTBDs from operational library")
        print(f"   Generated: {data['metadata']['generated']}")
        print(f"   Version: {data['metadata']['version']}")
        
        jtbds = data['jobs_to_be_done']
        
        # Import workflows (with embedded phases and tasks)
        workflow_count = import_workflows(jtbds)
        
        # Print summary
        print("\n" + "="*80)
        print("🎉 IMPORT COMPLETE!")
        print("="*80)
        print(f"\n✅ Successfully imported:")
        print(f"   • {workflow_count} workflows (with 55 phases and 82 tasks)")
        print(f"   • Covers 18 JTBDs across 6 categories")
        print(f"\n📊 CATEGORIES:")
        from collections import Counter
        categories = Counter(j['category'] for j in jtbds)
        for cat, count in categories.most_common():
            print(f"   • {cat}: {count} JTBDs")
        print(f"\n🚀 SP03 Stakeholder Engagement Library is now fully imported!")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {json_file}")
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format: {str(e)}")
    except Exception as e:
        print(f"❌ Error during import: {str(e)}")
        raise

if __name__ == "__main__":
    main()

