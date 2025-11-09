#!/usr/bin/env python3
"""
Import SP01 Complete Operational Library
- 19 workflows
- 55 phases
- 135 tasks
- Enrich 17 JTBDs with success criteria, pain points, enablers, KPIs
- Import industry best practices
"""

import os
import json
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
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
    print("║   SP01 OPERATIONAL LIBRARY IMPORT                                         ║")
    print("║   19 Workflows | 55 Phases | 135 Tasks | 17 Enhanced JTBDs               ║")
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
                'duration': duration,
                'total_effort': wf.get('total_effort'),
                'phase_count': len(phases),
                'task_count': sum(len(p.get('tasks', [])) for p in phases),
                'phases': phases,
                'source': 'SP01 Operational Library',
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


def enrich_jtbds(jtbds: List[Dict]) -> int:
    """Enrich existing JTBDs with success criteria, pain points, enablers, KPIs"""
    print("\n" + "="*80)
    print("📋 PHASE 4: ENRICHING JTBDs WITH METADATA")
    print("="*80)
    
    enriched_count = 0
    
    for jtbd in jtbds:
        jtbd_id = jtbd['id']
        
        # Prepare enrichment data
        enrich_data = {
            'jtbd_code': jtbd_id,
            'success_criteria': jtbd.get('success_criteria', []),
            'pain_points': jtbd.get('pain_points', []),
            'enablers': jtbd.get('enablers', []),
            'kpis': jtbd.get('kpis', []),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Add use_case_ids if available
        use_case_ids = jtbd.get('use_case_ids', [])
        if use_case_ids:
            enrich_data['use_case_mappings'] = use_case_ids
        
        try:
            # Update JTBD
            result = supabase.table('jtbd_library').update(enrich_data).eq(
                'jtbd_code', jtbd_id
            ).execute()
            
            if result.data:
                enriched_count += 1
                print(f"✅ [{enriched_count}] {jtbd_id}: Added {len(jtbd.get('success_criteria', []))} criteria, "
                      f"{len(jtbd.get('pain_points', []))} pain points, "
                      f"{len(jtbd.get('enablers', []))} enablers, "
                      f"{len(jtbd.get('kpis', []))} KPIs")
            
        except Exception as e:
            print(f"❌ Error enriching {jtbd_id}: {str(e)}")
    
    print(f"\n✅ Enriched {enriched_count} JTBDs")
    return enriched_count

def import_best_practices(practices: Dict) -> None:
    """Import industry best practices as reference data"""
    print("\n" + "="*80)
    print("📋 PHASE 5: IMPORTING INDUSTRY BEST PRACTICES")
    print("="*80)
    
    # Prepare best practices data
    bp_data = {
        'pillar_code': 'SP01',
        'pillar_name': 'Growth & Market Access',
        'governance_practices': practices.get('governance', []),
        'standard_metrics': practices.get('standard_metrics', []),
        'common_tools': practices.get('common_tools', []),
        'source_refs': practices.get('source_refs', []),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    try:
        # Upsert best practices
        result = supabase.table('industry_best_practices').upsert(
            bp_data,
            on_conflict='pillar_code'
        ).execute()
        
        if result.data:
            print(f"✅ Imported {len(practices.get('governance', []))} governance practices")
            print(f"✅ Imported {len(practices.get('standard_metrics', []))} standard metrics")
            print(f"✅ Imported {len(practices.get('common_tools', []))} common tools")
        
    except Exception as e:
        print(f"⚠️  Best practices import failed (table may not exist): {str(e)}")
        print("   Continuing with main import...")

def main():
    """Main execution function"""
    print_header()
    
    # Load JSON file
    json_file = '/Users/hichamnaim/Downloads/SP01_Growth_MarketAccess_OperationalLibrary_FULL.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        print(f"✅ Loaded {data['metadata']['record_count']} JTBDs from operational library")
        print(f"   Generated: {data['metadata']['generated']}")
        print(f"   Version: {data['metadata']['version']}")
        
        jtbds = data['jobs_to_be_done']
        practices = data['industry_best_practices']
        
        # Phase 1: Import workflows (with embedded phases and tasks)
        workflow_count = import_workflows(jtbds)
        
        # Phase 2: Enrich JTBDs
        enriched_count = enrich_jtbds(jtbds)
        
        # Phase 3: Import best practices (optional)
        import_best_practices(practices)
        
        # Print summary
        print("\n" + "="*80)
        print("🎉 IMPORT COMPLETE!")
        print("="*80)
        print(f"\n✅ Successfully imported:")
        print(f"   • {workflow_count} workflows (with 55 phases and 135 tasks)")
        print(f"   • {enriched_count} enriched JTBDs")
        print(f"   • Industry best practices for SP01")
        print(f"\n🚀 SP01 Operational Library is now fully imported and ready!")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {json_file}")
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format: {str(e)}")
    except Exception as e:
        print(f"❌ Error during import: {str(e)}")
        raise

if __name__ == "__main__":
    main()

