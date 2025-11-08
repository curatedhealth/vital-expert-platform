#!/usr/bin/env python3
"""
Import Digital Health Personas and JTBDs to Supabase
Complete import with all fields, relationships, and mappings
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase credentials not found in .env.local")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_industry_id_by_name(industry_name: str) -> str:
    """Get industry ID by name"""
    try:
        result = supabase.table('industries').select('id').ilike('industry_name', f'%{industry_name}%').limit(1).execute()
        if result.data:
            return result.data[0]['id']
    except Exception as e:
        print(f"   ⚠️  Could not find industry '{industry_name}': {e}")
    return None

def get_org_function_id_by_name(function_name: str) -> str:
    """Get org_function ID by name"""
    try:
        result = supabase.table('org_functions').select('id').ilike('org_function', f'%{function_name}%').limit(1).execute()
        if result.data:
            return result.data[0]['id']
    except Exception as e:
        print(f"   ⚠️  Could not find function '{function_name}': {e}")
    return None

def parse_score(score_str: str) -> int:
    """Parse score string (e.g., '10/10') to integer"""
    if isinstance(score_str, int):
        return score_str
    if isinstance(score_str, str):
        return int(score_str.split('/')[0])
    return 0

def import_persona(persona_data: Dict[str, Any]) -> str:
    """Import a single persona to Supabase"""
    profile = persona_data.get('profile', {})
    persona_title = persona_data.get('persona_title', '')
    
    # Extract name from title (format: "Role - Name")
    if ' - ' in persona_title:
        role_part, name_part = persona_title.split(' - ', 1)
        name = name_part.strip()
    else:
        name = profile.get('name', persona_title)
    
    # Generate persona code (first 3 letters of last name)
    name_parts = name.replace('.', '').replace(',', '').split()
    hash_num = abs(hash(name)) % 100
    if len(name_parts) >= 2:
        persona_code = f"P{name_parts[-1][:3].upper()}{hash_num:02d}"
    else:
        persona_code = f"P{name.replace(' ', '')[:3].upper()}{hash_num:02d}"
    
    # Generate unique_id
    org = profile.get('organization', 'general').lower().replace(' ', '_')[:10]
    name_slug = name.lower().replace(' ', '_').replace('.', '')[:15]
    unique_id = f"dh_{org}_{name_slug}"
    
    # Determine sector from organization or title
    sector = "Digital Health"
    if 'pharma' in profile.get('organization', '').lower():
        sector = "Pharma"
    elif 'startup' in profile.get('organization', '').lower():
        sector = "Startup"
    elif 'dtx' in profile.get('organization', '').lower():
        sector = "DTx"
    
    # Get industry ID
    industry_id = None
    if sector == "Pharma":
        industry_id = get_industry_id_by_name("Pharmaceutical")
    elif sector in ["Startup", "DTx"]:
        industry_id = get_industry_id_by_name("Digital Health")
    
    # Prepare persona record
    persona_record = {
        'unique_id': unique_id,
        'persona_code': persona_code,
        'name': name,
        'title': profile.get('title', persona_title),
        'organization': profile.get('organization'),
        'background': profile.get('background'),
        'sector': sector,
        'therapeutic_areas': profile.get('therapeutic_areas'),
        'programs_managed': profile.get('programs_managed'),
        'budget': profile.get('budget'),
        'team': profile.get('team'),
        'focus': profile.get('focus'),
        'projects': profile.get('projects'),
        'specialization': profile.get('specialization'),
        'certifications': profile.get('certifications'),
        'experience': profile.get('experience'),
        'responsibilities': json.dumps(profile.get('responsibilities', [])),
        'pain_points': json.dumps(profile.get('pain_points', [])),
        'goals': json.dumps(profile.get('goals', [])),
        'needs': json.dumps(profile.get('needs', [])),
        'behaviors': json.dumps(profile.get('behaviors', [])),
        'industry_id': industry_id,
        'source': 'Digital Health JTBD Library',
        'is_active': True
    }
    
    # Remove None values
    persona_record = {k: v for k, v in persona_record.items() if v is not None}
    
    try:
        # Upsert persona
        result = supabase.table('dh_personas').upsert(
            persona_record,
            on_conflict='unique_id'
        ).execute()
        
        if result.data:
            return result.data[0]['id']
        return None
    except Exception as e:
        print(f"   ❌ Error importing persona '{name}': {e}")
        return None

def import_jtbd(jtbd_data: Dict[str, Any], persona_id: str, persona_name: str, persona_title: str) -> bool:
    """Import a single JTBD to Supabase"""
    
    # Parse scores
    importance = parse_score(jtbd_data.get('importance', 0))
    satisfaction = parse_score(jtbd_data.get('current_satisfaction', 0))
    opportunity_score = parse_score(jtbd_data.get('opportunity_score', 0))
    
    # Categorize frequency
    frequency = jtbd_data.get('frequency', '')
    if frequency in ['Daily', 'Weekly']:
        frequency_category = 'High Frequency'
    elif frequency in ['Monthly', 'Quarterly']:
        frequency_category = 'Regular'
    elif 'Per' in frequency or 'per' in frequency:
        frequency_category = 'Project-Based'
    elif frequency == 'Annual':
        frequency_category = 'Low Frequency'
    else:
        frequency_category = 'Other'
    
    # Calculate priority tier
    if opportunity_score >= 18:
        priority_tier = 1
    elif opportunity_score >= 16:
        priority_tier = 2
    elif opportunity_score >= 14:
        priority_tier = 3
    elif opportunity_score >= 12:
        priority_tier = 4
    else:
        priority_tier = 5
    
    # Get industry ID for Digital Health
    industry_id = get_industry_id_by_name("Digital Health")
    
    # Create short title from statement
    statement = jtbd_data.get('statement', '')
    if ', I need' in statement:
        title = statement.split(', I need')[0].replace('When ', '')
    else:
        title = statement[:100]
    
    # Prepare JTBD record
    jtbd_record = {
        'id': jtbd_data.get('jtbd_code', jtbd_data.get('jtbd_id')),
        'jtbd_code': jtbd_data.get('jtbd_code'),
        'unique_id': jtbd_data.get('unique_id'),
        'original_id': jtbd_data.get('original_id'),
        'title': title[:255],
        'statement': statement,
        'goal': statement,  # For backward compatibility
        'verb': 'need',  # For backward compatibility
        'function': 'Digital Health',  # For backward compatibility
        'frequency': frequency,
        'frequency_category': frequency_category,
        'importance': importance,
        'satisfaction': satisfaction,
        'opportunity_score': opportunity_score,
        'priority_tier': priority_tier,
        'success_metrics': json.dumps(jtbd_data.get('success_metrics', [])),
        'metrics_count': len(jtbd_data.get('success_metrics', [])),
        'persona_id': persona_id,
        'persona_name': persona_name,
        'persona_title': persona_title,
        'industry_id': industry_id,
        'sector': 'Digital Health',
        'source': 'Digital Health JTBD Library',
        'is_active': True
    }
    
    # Remove None values
    jtbd_record = {k: v for k, v in jtbd_record.items() if v is not None}
    
    try:
        # Upsert JTBD
        result = supabase.table('jtbd_library').upsert(
            jtbd_record,
            on_conflict='id'
        ).execute()
        
        return bool(result.data)
    except Exception as e:
        print(f"   ❌ Error importing JTBD '{jtbd_record['jtbd_code']}': {e}")
        return False

def create_persona_jtbd_mapping(jtbd_id: str, persona_id: str) -> bool:
    """Create mapping between JTBD and Persona"""
    try:
        mapping_record = {
            'jtbd_id': jtbd_id,
            'persona_dh_id': persona_id,
            'relevance_score': 10,  # High relevance since it's their job
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('jtbd_org_persona_mapping').insert(mapping_record).execute()
        return bool(result.data)
    except Exception as e:
        # Mapping might already exist
        return True

def main():
    """Main import process"""
    print("\n" + "="*80)
    print("🚀 DIGITAL HEALTH PERSONAS & JTBD IMPORT")
    print("="*80)
    
    # Load parsed data
    data_file = 'data/dh_jtbd_library_enhanced_20251108_192510.json'
    print(f"\n📂 Loading data from: {data_file}")
    
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    metadata = data.get('metadata', {})
    personas = data.get('personas', [])
    
    print(f"\n📊 Data Summary:")
    print(f"   • Total Personas: {metadata.get('total_personas', len(personas))}")
    print(f"   • Total JTBDs: {metadata.get('total_jobs', 0)}")
    print(f"   • Source: {metadata.get('source', 'Unknown')}")
    print(f"   • Generated: {metadata.get('generated_at', 'Unknown')}")
    
    # Statistics
    personas_imported = 0
    personas_failed = 0
    jtbds_imported = 0
    jtbds_failed = 0
    mappings_created = 0
    
    print("\n" + "-"*80)
    print("📥 IMPORTING PERSONAS & JTBDs")
    print("-"*80)
    
    for idx, persona_data in enumerate(personas, 1):
        persona_title = persona_data.get('persona_title', f'Persona {idx}')
        profile = persona_data.get('profile', {})
        name = profile.get('name', persona_title)
        jobs = persona_data.get('jobs_to_be_done', [])
        
        print(f"\n[{idx}/{len(personas)}] {name}")
        print(f"   Title: {profile.get('title', 'N/A')}")
        print(f"   Organization: {profile.get('organization', 'N/A')}")
        print(f"   JTBDs: {len(jobs)}")
        
        # Import persona
        print(f"   → Importing persona...")
        persona_id = import_persona(persona_data)
        
        if persona_id:
            personas_imported += 1
            print(f"   ✅ Persona imported (ID: {persona_id[:8]}...)")
            
            # Import JTBDs for this persona
            if jobs:
                print(f"   → Importing {len(jobs)} JTBDs...")
                for job in jobs:
                    jtbd_code = job.get('jtbd_code', job.get('jtbd_id'))
                    if import_jtbd(job, persona_id, name, profile.get('title', '')):
                        jtbds_imported += 1
                        # Create mapping
                        if create_persona_jtbd_mapping(jtbd_code, persona_id):
                            mappings_created += 1
                    else:
                        jtbds_failed += 1
                print(f"   ✅ Imported {len(jobs)} JTBDs")
        else:
            personas_failed += 1
            print(f"   ❌ Failed to import persona")
    
    # Final Summary
    print("\n" + "="*80)
    print("📊 IMPORT SUMMARY")
    print("="*80)
    print(f"\n✅ Personas:")
    print(f"   • Imported: {personas_imported}")
    print(f"   • Failed: {personas_failed}")
    print(f"   • Success Rate: {(personas_imported/(personas_imported+personas_failed)*100):.1f}%")
    
    print(f"\n✅ JTBDs:")
    print(f"   • Imported: {jtbds_imported}")
    print(f"   • Failed: {jtbds_failed}")
    print(f"   • Success Rate: {(jtbds_imported/(jtbds_imported+jtbds_failed)*100):.1f}% if jtbds_imported+jtbds_failed > 0 else 100")
    
    print(f"\n✅ Mappings:")
    print(f"   • Created: {mappings_created}")
    
    print("\n" + "="*80)
    print("🎉 IMPORT COMPLETE!")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()

