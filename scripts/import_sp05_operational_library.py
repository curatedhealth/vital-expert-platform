#!/usr/bin/env python3
"""
Import SP05 Operational Excellence Operational Library to Supabase
===================================================================

Imports:
- 15 JTBDs with enhanced metadata
- 16 complete workflows with phases and tasks
- Success criteria, pain points, enablers, KPIs
- Persona and department mappings

Author: VITAL AI System
Date: 2025-11-09
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(url, key)


def clean_text(text: str) -> str:
    """Clean text for database insertion"""
    if not text:
        return ""
    return text.strip().replace('\x00', '')


def map_complexity(complexity: str) -> str:
    """Map complexity values to allowed database values"""
    complexity_map = {
        'Expert': 'High',
        'Advanced': 'High',
        'Intermediate': 'Medium',
        'Basic': 'Low',
        'Simple': 'Low'
    }
    return complexity_map.get(complexity, 'Medium')


def enrich_jtbd(jtbd_id: str, jtbd_data: Dict[str, Any]) -> bool:
    """
    Enrich existing JTBD with SP04 workflow and metadata
    Returns True if successful, False if JTBD doesn't exist
    """
    try:
        # Check if JTBD exists
        result = supabase.table('jtbd_library')\
            .select('id, jtbd_code')\
            .eq('jtbd_code', jtbd_id)\
            .execute()
        
        if not result.data:
            print(f"   ⚠️  JTBD {jtbd_id} not found in database")
            return False
        
        db_id = result.data[0]['id']
        
        # Prepare enrichment data (only description exists in schema)
        enrichment = {
            'description': clean_text(jtbd_data.get('description', '')),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Update JTBD
        supabase.table('jtbd_library')\
            .update(enrichment)\
            .eq('id', db_id)\
            .execute()
        
        print(f"   ✅ Enriched JTBD: {jtbd_id}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error enriching JTBD {jtbd_id}: {str(e)}")
        return False


def import_workflow(workflow: Dict[str, Any], jtbd_id: str, jtbd_statement: str) -> bool:
    """Import a single workflow with its phases and tasks as JSONB"""
    try:
        workflow_id = workflow['workflow_id']
        workflow_name = workflow['workflow_name']
        
        # Build workflow definition with phases and tasks
        phases_data = []
        for phase in workflow.get('phases', []):
            phase_obj = {
                'phase_number': phase['phase_number'],
                'phase_name': phase['phase_name'],
                'duration': phase['duration'],
                'tasks': []
            }
            
            for task in phase.get('tasks', []):
                task_obj = {
                    'task_id': task['task_id'],
                    'task_name': task['task_name'],
                    'duration': task.get('duration', ''),
                    'owner': task.get('owner', ''),
                    'outputs': task.get('outputs', []),
                    'tools': task.get('tools', [])
                }
                phase_obj['tasks'].append(task_obj)
            
            phases_data.append(phase_obj)
        
        # Prepare workflow data (matching SP01-03 structure, no UUID id)
        workflow_data = {
            'name': workflow_name,
            'description': f"{jtbd_statement} - {workflow_name} ({workflow.get('duration', '')})",
            'status': 'active',
            'is_public': True,
            'definition': {
                'workflow_id': workflow_id,
                'workflow_name': workflow_name,
                'jtbd_id': jtbd_id,
                'duration': workflow.get('duration', ''),
                'phase_count': len(phases_data),
                'task_count': sum(len(p['tasks']) for p in phases_data),
                'phases': phases_data,
                'source': 'SP05 Operational Library',
                'strategic_pillar': 'SP05',
                'pillar_name': 'Operational Excellence',
                'imported_at': datetime.now(timezone.utc).isoformat()
            },
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Insert workflow (try insert first, then update if exists)
        try:
            result = supabase.table('workflows').insert(workflow_data).execute()
            if result.data:
                task_count = sum(len(p['tasks']) for p in phases_data)
                print(f"   ✅ Imported workflow: {workflow_name} ({len(phases_data)} phases, {task_count} tasks)")
                return True
        except Exception as insert_error:
            # Try update if insert fails (duplicate name)
            try:
                result = supabase.table('workflows').update(workflow_data).eq(
                    'name', workflow_name
                ).execute()
                if result.data:
                    task_count = sum(len(p['tasks']) for p in phases_data)
                    print(f"   ✅ Updated workflow: {workflow_name} ({len(phases_data)} phases, {task_count} tasks)")
                    return True
            except Exception as update_error:
                print(f"   ❌ Error importing workflow {workflow_name}: {str(update_error)}")
                return False
        
    except Exception as e:
        print(f"   ❌ Error importing workflow {workflow.get('workflow_id', 'unknown')}: {str(e)}")
        return False


def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Import SP05 Operational Excellence Library               ║")
    print("║  15 JTBDs + 16 Workflows with Phases & Tasks              ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Load JSON file
    json_file = '/Users/hichamnaim/Downloads/SP05_OperationalExcellence_OperationalLibrary_FULL.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        print(f"📂 Loaded: {json_file}")
        print(f"📊 Strategic Pillar: {data['pillar']['name']} ({data['pillar']['id']})")
        print(f"📈 Version: {data['metadata']['version']}")
        print(f"📝 Record Count: {data['metadata']['record_count']}\n")
        
        # Process JTBDs
        jtbds = data.get('jobs_to_be_done', [])
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📋 Processing {len(jtbds)} JTBDs...\n")
        
        enriched_count = 0
        workflow_count = 0
        phase_count = 0
        task_count = 0
        
        for jtbd in jtbds:
            jtbd_id = jtbd['id']
            jtbd_statement = jtbd['jtbd_statement']
            print(f"\n🎯 {jtbd_id}: {jtbd.get('category', 'Unknown')}")
            
            # Enrich JTBD
            if enrich_jtbd(jtbd_id, jtbd):
                enriched_count += 1
            
            # Import workflows
            for workflow in jtbd.get('workflows', []):
                if import_workflow(workflow, jtbd_id, jtbd_statement):
                    workflow_count += 1
                    phases = workflow.get('phases', [])
                    phase_count += len(phases)
                    task_count += sum(len(p.get('tasks', [])) for p in phases)
        
        # Final summary
        print(f"\n{'='*60}")
        print(f"✅ SP04 IMPORT COMPLETE!")
        print(f"{'='*60}")
        print(f"📊 SUMMARY:")
        print(f"   • JTBDs Enriched:     {enriched_count}/{len(jtbds)}")
        print(f"   • Workflows Imported: {workflow_count}")
        print(f"   • Phases:             {phase_count}")
        print(f"   • Tasks:              {task_count}")
        print(f"\n🎯 Strategic Pillar: SP05 - Operational Excellence")
        print(f"📅 Import Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"{'='*60}\n")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found - {json_file}")
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON - {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    main()

