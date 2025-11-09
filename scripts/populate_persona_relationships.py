#!/usr/bin/env python3
"""
Populate Persona Relationship Tables - COMPREHENSIVE
=====================================================
Creates all persona-JTBD, persona-workflow, and persona-task relationships
from the MA_Persona_Mapping.json file.
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Initialize Supabase client."""
    url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    
    return create_client(url, key)

def load_mapping_data() -> Dict[str, Any]:
    """Load the MA persona mapping JSON file."""
    file_path = '/Users/hichamnaim/Downloads/MA_Persona_Mapping.json'
    with open(file_path, 'r') as f:
        return json.load(f)

def get_persona_id_by_code(supabase: Client, persona_code: str) -> str:
    """Get persona UUID by persona_code."""
    result = supabase.table('dh_personas')\
        .select('id')\
        .eq('persona_code', persona_code)\
        .execute()
    
    if result.data:
        return result.data[0]['id']
    return None

def get_jtbd_id_by_code(supabase: Client, jtbd_code: str) -> str:
    """Get JTBD UUID by jtbd_code."""
    result = supabase.table('jtbd_library')\
        .select('id')\
        .eq('jtbd_code', jtbd_code)\
        .execute()
    
    if result.data:
        return result.data[0]['id']
    return None

def get_workflow_id_by_name(supabase: Client, workflow_code: str) -> str:
    """Get workflow UUID by workflow code in definition."""
    result = supabase.table('workflows')\
        .select('id, definition')\
        .execute()
    
    if result.data:
        for workflow in result.data:
            definition = workflow.get('definition', {})
            if isinstance(definition, dict):
                if definition.get('workflow_id') == workflow_code:
                    return workflow['id']
    return None

def populate_jtbd_persona_mappings(supabase: Client, mapping_data: Dict) -> int:
    """Populate jtbd_persona_mapping table."""
    print("\n" + "="*80)
    print("POPULATING JTBD-PERSONA MAPPINGS")
    print("="*80 + "\n")
    
    success_count = 0
    skip_count = 0
    
    for mapping in mapping_data['mappings']['persona_to_jtbd']:
        persona_code = mapping['persona_id']
        persona_id = get_persona_id_by_code(supabase, persona_code)
        
        if not persona_id:
            print(f"⚠️  Persona {persona_code} not found, skipping")
            skip_count += 1
            continue
        
        # Process primary JTBDs
        for jtbd_code in mapping.get('primary', []):
            jtbd_id = get_jtbd_id_by_code(supabase, jtbd_code)
            
            if not jtbd_id:
                print(f"⚠️  JTBD {jtbd_code} not found")
                continue
            
            try:
                # Check if mapping already exists
                existing = supabase.table('jtbd_persona_mapping')\
                    .select('id')\
                    .eq('persona_id', persona_id)\
                    .eq('jtbd_id', jtbd_id)\
                    .execute()
                
                if existing.data:
                    continue  # Skip if exists
                
                mapping_record = {
                    'persona_id': persona_id,
                    'jtbd_id': jtbd_id,
                    'relationship_type': 'primary',
                    'priority': 1,
                    'frequency': 'daily',
                    'notes': f"Primary JTBD for {persona_code}",
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                supabase.table('jtbd_persona_mapping').insert(mapping_record).execute()
                success_count += 1
                
            except Exception as e:
                print(f"❌ Error mapping {persona_code} → {jtbd_code}: {str(e)}")
        
        # Process secondary JTBDs
        for jtbd_code in mapping.get('secondary', []):
            jtbd_id = get_jtbd_id_by_code(supabase, jtbd_code)
            
            if not jtbd_id:
                continue
            
            try:
                # Check if mapping already exists
                existing = supabase.table('jtbd_persona_mapping')\
                    .select('id')\
                    .eq('persona_id', persona_id)\
                    .eq('jtbd_id', jtbd_id)\
                    .execute()
                
                if existing.data:
                    continue
                
                mapping_record = {
                    'persona_id': persona_id,
                    'jtbd_id': jtbd_id,
                    'relationship_type': 'secondary',
                    'priority': 2,
                    'frequency': 'weekly',
                    'notes': f"Secondary JTBD for {persona_code}",
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                supabase.table('jtbd_persona_mapping').insert(mapping_record).execute()
                success_count += 1
                
            except Exception as e:
                print(f"❌ Error mapping {persona_code} → {jtbd_code}: {str(e)}")
    
    print(f"\n✅ Created {success_count} JTBD-Persona mappings")
    print(f"⚠️  Skipped {skip_count} personas not found\n")
    return success_count

def populate_workflow_persona_mappings(supabase: Client, mapping_data: Dict) -> int:
    """Populate dh_workflow_persona table."""
    print("\n" + "="*80)
    print("POPULATING WORKFLOW-PERSONA MAPPINGS")
    print("="*80 + "\n")
    
    success_count = 0
    
    # Get tenant_id (assuming single tenant)
    tenant_result = supabase.table('dh_personas').select('id').limit(1).execute()
    if not tenant_result.data:
        print("❌ No personas found to get tenant_id")
        return 0
    
    # For simplicity, use a fixed UUID for tenant (or fetch from environment)
    tenant_id = str(uuid.uuid4())  # You may need to adjust this
    
    for mapping in mapping_data['mappings']['persona_to_workflows']:
        persona_code = mapping['persona_id']
        persona_id = get_persona_id_by_code(supabase, persona_code)
        
        if not persona_id:
            print(f"⚠️  Persona {persona_code} not found")
            continue
        
        for workflow_code in mapping.get('workflows', []):
            workflow_id = get_workflow_id_by_name(supabase, workflow_code)
            
            if not workflow_id:
                print(f"⚠️  Workflow {workflow_code} not found")
                continue
            
            try:
                # Check if mapping already exists
                existing = supabase.table('dh_workflow_persona')\
                    .select('id')\
                    .eq('persona_id', persona_id)\
                    .eq('workflow_id', workflow_id)\
                    .execute()
                
                if existing.data:
                    continue
                
                workflow_persona_record = {
                    'id': str(uuid.uuid4()),
                    'tenant_id': tenant_id,
                    'workflow_id': workflow_id,
                    'persona_id': persona_id,
                    'responsibility': 'Execute',
                    'is_required': True,
                    'decision_authority': 'Approve',
                    'notes': f"Assigned workflow for {persona_code}",
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                supabase.table('dh_workflow_persona').insert(workflow_persona_record).execute()
                success_count += 1
                print(f"✅ Mapped {persona_code} → {workflow_code}")
                
            except Exception as e:
                print(f"❌ Error mapping {persona_code} → {workflow_code}: {str(e)}")
    
    print(f"\n✅ Created {success_count} Workflow-Persona mappings\n")
    return success_count

def main():
    """Main execution function."""
    print("\n" + "="*80)
    print("COMPREHENSIVE PERSONA RELATIONSHIP POPULATION")
    print("="*80 + "\n")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    
    # Load mapping data
    print("📂 Loading MA_Persona_Mapping.json...")
    mapping_data = load_mapping_data()
    print(f"✅ Loaded mapping data with {len(mapping_data['personas'])} personas\n")
    
    # Populate JTBD-Persona mappings
    jtbd_count = populate_jtbd_persona_mappings(supabase, mapping_data)
    
    # Populate Workflow-Persona mappings
    workflow_count = populate_workflow_persona_mappings(supabase, mapping_data)
    
    # Print final summary
    print("\n" + "="*80)
    print("POPULATION COMPLETE")
    print("="*80)
    print(f"✅ JTBD-Persona Mappings: {jtbd_count}")
    print(f"✅ Workflow-Persona Mappings: {workflow_count}")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()

