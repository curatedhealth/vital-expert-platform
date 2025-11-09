#!/usr/bin/env python3
"""
Update Medical Affairs Personas with Comprehensive Mapping Data
================================================================
Updates existing MA personas in Supabase with department mappings, 
JTBD relationships, workflow assignments, and agent connections.
"""

import json
import os
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

def map_department_to_org_ids(department: str) -> Dict[str, str]:
    """Map department names to org_function and org_department IDs."""
    # Medical Affairs function ID
    ma_function_id = '0d4dd5f8-ef85-478b-a687-88fa11574c82'
    
    department_mapping = {
        'global_leadership': {
            'function_id': ma_function_id,
            'department_id': None,  # Leadership spans multiple departments
            'function_name': 'Medical Affairs - Leadership'
        },
        'field_medical': {
            'function_id': ma_function_id,
            'department_id': 'e816d937-53db-4b25-b5bd-a2dde29e6b18',  # MSL
            'function_name': 'Medical Affairs - Field Medical'
        },
        'medical_information': {
            'function_id': ma_function_id,
            'department_id': '5d9e45d7-969e-4da9-b73d-c05c164da8c0',  # Medical Info
            'function_name': 'Medical Affairs - Medical Information'
        },
        'medical_communications': {
            'function_id': ma_function_id,
            'department_id': '6fcaa75a-f76c-4e68-a86b-e2123548b885',  # Publications
            'function_name': 'Medical Affairs - Publications & Communications'
        },
        'heor_evidence': {
            'function_id': ma_function_id,
            'department_id': None,  # HEOR may not have specific dept mapping
            'function_name': 'Medical Affairs - HEOR & Evidence Generation'
        },
        'clinical_operations': {
            'function_id': ma_function_id,
            'department_id': None,
            'function_name': 'Medical Affairs - Clinical Operations'
        },
        'compliance_quality': {
            'function_id': ma_function_id,
            'department_id': None,
            'function_name': 'Medical Affairs - Compliance & Quality'
        },
        'medical_operations': {
            'function_id': ma_function_id,
            'department_id': None,
            'function_name': 'Medical Affairs - Operations & Analytics'
        },
        'digital_innovation': {
            'function_id': ma_function_id,
            'department_id': None,
            'function_name': 'Medical Affairs - Digital Health & Innovation'
        }
    }
    
    return department_mapping.get(department, {
        'function_id': ma_function_id,
        'department_id': None,
        'function_name': 'Medical Affairs'
    })

def update_persona_with_mapping(supabase: Client, persona: Dict, mapping_data: Dict) -> bool:
    """Update a single persona with comprehensive mapping data."""
    persona_id = persona['id']
    persona_code = persona_id
    
    # Get department org mapping
    department = persona.get('department', '')
    org_mapping = map_department_to_org_ids(department)
    
    # Find JTBD mappings
    jtbd_mapping = next(
        (m for m in mapping_data['mappings']['persona_to_jtbd'] if m['persona_id'] == persona_code),
        None
    )
    
    # Find workflow mappings
    workflow_mapping = next(
        (m for m in mapping_data['mappings']['persona_to_workflows'] if m['persona_id'] == persona_code),
        None
    )
    
    # Find agent mappings
    agent_mapping = next(
        (m for m in mapping_data['mappings']['persona_to_agents'] if m['persona_id'] == persona_code),
        None
    )
    
    # Prepare update data
    update_data = {
        'function': persona.get('function', org_mapping['function_name']),
        'sector': 'Pharmaceutical & Life Sciences',
        'organization': 'Global Pharmaceutical / Biotech',
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Add tags with department, JTBDs, workflows, and agents
    tags = [
        'medical-affairs',
        f"department-{department}",
        f"tier-{persona.get('tier', 1)}"
    ]
    
    if jtbd_mapping:
        tags.append(f"jtbds-{len(jtbd_mapping.get('primary', []))}-primary")
        tags.append(f"jtbds-{len(jtbd_mapping.get('secondary', []))}-secondary")
    
    if workflow_mapping:
        tags.append(f"workflows-{len(workflow_mapping.get('workflows', []))}")
    
    if agent_mapping:
        tags.append(f"agents-{len(agent_mapping.get('agents', []))}")
    
    update_data['tags'] = json.dumps(tags)
    
    # Add notes with mapping summary
    notes_parts = []
    notes_parts.append(f"Department: {department}")
    
    if jtbd_mapping:
        primary_count = len(jtbd_mapping.get('primary', []))
        secondary_count = len(jtbd_mapping.get('secondary', []))
        notes_parts.append(f"Primary JTBDs: {primary_count}, Secondary JTBDs: {secondary_count}")
        notes_parts.append(f"Primary JTBD IDs: {', '.join(jtbd_mapping.get('primary', [])[:5])}")
    
    if workflow_mapping:
        workflow_count = len(workflow_mapping.get('workflows', []))
        notes_parts.append(f"Assigned Workflows: {workflow_count}")
        notes_parts.append(f"Workflow IDs: {', '.join(workflow_mapping.get('workflows', [])[:5])}")
    
    if agent_mapping:
        agent_count = len(agent_mapping.get('agents', []))
        notes_parts.append(f"Recommended Agents: {agent_count}")
        notes_parts.append(f"Agents: {', '.join(agent_mapping.get('agents', [])[:3])}")
    
    update_data['notes'] = ' | '.join(notes_parts)
    
    # Update persona in Supabase
    try:
        result = supabase.table('dh_personas')\
            .update(update_data)\
            .eq('persona_code', persona_code)\
            .execute()
        
        if result.data:
            print(f"✅ Updated {persona_code}: {persona['name']}")
            if jtbd_mapping:
                print(f"   📋 JTBDs: {len(jtbd_mapping.get('primary', []))} primary, {len(jtbd_mapping.get('secondary', []))} secondary")
            if workflow_mapping:
                print(f"   🔄 Workflows: {len(workflow_mapping.get('workflows', []))}")
            if agent_mapping:
                print(f"   🤖 Agents: {len(agent_mapping.get('agents', []))}")
            return True
        else:
            print(f"⚠️  No data returned for {persona_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating {persona_code}: {str(e)}")
        return False

def main():
    """Main execution function."""
    print("\n" + "="*80)
    print("MEDICAL AFFAIRS PERSONA MAPPING UPDATE")
    print("="*80 + "\n")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    
    # Load mapping data
    print("📂 Loading MA_Persona_Mapping.json...")
    mapping_data = load_mapping_data()
    
    personas_in_file = len(mapping_data['personas'])
    print(f"✅ Loaded {personas_in_file} personas from mapping file\n")
    
    # Get all personas from the mapping file
    personas_to_update = mapping_data['personas']
    
    print(f"🎯 Updating {len(personas_to_update)} Medical Affairs personas...\n")
    
    # Update each persona
    success_count = 0
    for persona in personas_to_update:
        if update_persona_with_mapping(supabase, persona, mapping_data):
            success_count += 1
    
    # Print summary
    print("\n" + "="*80)
    print("UPDATE SUMMARY")
    print("="*80)
    print(f"✅ Successfully updated: {success_count}/{len(personas_to_update)} personas")
    print(f"📊 JTBD mappings: {len(mapping_data['mappings']['persona_to_jtbd'])}")
    print(f"🔄 Workflow mappings: {len(mapping_data['mappings']['persona_to_workflows'])}")
    print(f"🤖 Agent mappings: {len(mapping_data['mappings']['persona_to_agents'])}")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()

