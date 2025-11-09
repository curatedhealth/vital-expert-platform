#!/usr/bin/env python3
"""
Phase 1: Enrich 8 Tier 1 Personas with Detailed Profiles
This script will:
1. Load the 8 detailed personas from parsed JSON
2. Match them to existing Supabase records
3. Update with enriched data (pain points, scores, details)
4. Import 18 new JTBDs
5. Create persona-JTBD mappings
"""

import json
import os
import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, List, Any

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Statistics tracking
stats = {
    'personas_matched': 0,
    'personas_enriched': 0,
    'jtbds_created': 0,
    'mappings_created': 0,
    'errors': []
}

def load_parsed_data(json_file: str) -> Dict[str, Any]:
    """Load the parsed persona data from JSON"""
    with open(json_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def match_persona_in_supabase(persona_title: str, sector: str) -> Dict[str, Any]:
    """
    Match a persona from the catalogue to an existing Supabase record.
    Match by title similarity and sector.
    """
    # Try exact title match first
    result = supabase.table('dh_personas')\
        .select('*')\
        .eq('title', persona_title)\
        .execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]
    
    # Try fuzzy match by searching for key words in title
    title_parts = persona_title.lower().split()
    for part in title_parts:
        if len(part) > 4:  # Only search meaningful words
            result = supabase.table('dh_personas')\
                .select('*')\
                .ilike('title', f'%{part}%')\
                .execute()
            
            if result.data and len(result.data) > 0:
                # If multiple matches, prefer the one with matching sector
                for record in result.data:
                    if record.get('sector') and sector.lower() in record['sector'].lower():
                        return record
                return result.data[0]
    
    # Try matching by persona_code pattern
    # Extract initials from title for matching
    words = persona_title.split()
    if len(words) >= 2:
        initials = ''.join([w[0].upper() for w in words[:3]])
        result = supabase.table('dh_personas')\
            .select('*')\
            .ilike('persona_code', f'%{initials}%')\
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
    
    return None

def enrich_persona(persona_data: Dict[str, Any], existing: Dict[str, Any]) -> bool:
    """Enrich an existing persona with detailed data from the catalogue"""
    try:
        # Prepare enrichment data
        update_data = {
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Add pain points if available
        if persona_data.get('pain_points'):
            update_data['pain_points'] = persona_data['pain_points']
        
        # Add scores if available
        if persona_data.get('priority_score_target'):
            # Calculate individual scores based on priority score
            priority = persona_data['priority_score_target']
            # Estimate component scores (the catalogue provides the composite)
            update_data['value_score'] = min(10, max(1, int(priority)))
            update_data['pain_score'] = min(10, max(1, int(priority)))
            update_data['adoption_score'] = min(10, max(1, int(priority * 0.9)))
            update_data['ease_score'] = min(10, max(1, int(priority * 0.85)))
            update_data['strategic_score'] = min(10, max(1, int(priority * 0.95)))
            update_data['network_score'] = min(10, max(1, int(priority * 0.9)))
        
        # Add organizational details
        if persona_data.get('org_size'):
            update_data['org_size'] = persona_data['org_size']
        
        if persona_data.get('team_size'):
            update_data['team_size'] = persona_data['team_size']
        
        if persona_data.get('budget_authority'):
            update_data['budget_authority'] = persona_data['budget_authority']
        
        # Update tier to 1 (these are all Tier 1 personas)
        update_data['tier'] = 1
        
        # Add source information
        update_data['source'] = 'Persona Master Catalogue v6.0 - Enriched'
        
        # Execute update
        result = supabase.table('dh_personas')\
            .update(update_data)\
            .eq('id', existing['id'])\
            .execute()
        
        if result.data:
            stats['personas_enriched'] += 1
            print(f"✅ Enriched: {existing['title']}")
            print(f"   • Pain points: {len(persona_data.get('pain_points', []))} added")
            print(f"   • Scores updated: Priority {persona_data.get('priority_score_target', 'N/A')}")
            print(f"   • Budget: {persona_data.get('budget_authority', 'N/A')}")
            return True
        return False
        
    except Exception as e:
        error_msg = f"Error enriching {existing.get('title', 'unknown')}: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"❌ {error_msg}")
        return False

def generate_jtbd_id(persona_code: str, index: int) -> str:
    """Generate a unique JTBD ID"""
    return f"{persona_code}_JTBD_{index:03d}"

def import_jtbd(jtbd_data: Dict[str, Any], persona_id: str, persona_unique_id: str, index: int) -> str:
    """Import a JTBD to Supabase"""
    try:
        # Generate IDs (fit within varchar constraints)
        # id: varchar(20), unique_id: unlimited
        simple_id = f"jtbd{index:05d}"  # jtbd00001, jtbd00002, etc. (9 chars)
        jtbd_code = generate_jtbd_id(jtbd_data.get('persona_code', 'PMC'), index)
        unique_id = f"pmc_{simple_id}"  # pmc_jtbd00001
        
        # Prepare JTBD data
        # Convert scores to integers (database uses INTEGER for importance/satisfaction)
        opportunity_score = jtbd_data.get('opportunity_score', 8)
        if isinstance(opportunity_score, float):
            opportunity_score = int(round(opportunity_score))
        
        satisfaction = jtbd_data.get('current_satisfaction', 5)
        if isinstance(satisfaction, str):
            satisfaction = int(satisfaction) if satisfaction.isdigit() else 5
        
        # Extract verb from JTBD statement (first verb after "When")
        # Format: "When [situation], I need [solution], so I can [outcome]"
        statement = jtbd_data['statement']
        verb = 'manage'  # Default verb
        try:
            if 'I need' in statement:
                need_part = statement.split('I need')[1].split(',')[0].strip()
                # Extract first word (likely a verb or noun we can use)
                first_word = need_part.split()[0].lower()
                if len(first_word) > 2:
                    verb = first_word[:20]  # Truncate to 20 chars for varchar(50)
        except:
            pass  # Use default verb
        
        jtbd_insert = {
            'id': simple_id,  # Simple string ID (9 chars) instead of UUID
            'unique_id': unique_id,
            'jtbd_code': jtbd_code,
            'title': jtbd_data['statement'],
            'verb': verb,  # Required field - extracted or default
            'description': jtbd_data['statement'],
            'frequency': jtbd_data.get('frequency'),
            'importance': opportunity_score,  # Now as integer
            'satisfaction': satisfaction,  # Now as integer
            'sector': 'Pharma',  # Primary sector from catalogue
            'source': 'Persona Master Catalogue v6.0',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if JTBD already exists
        existing = supabase.table('jtbd_library')\
            .select('id')\
            .eq('unique_id', unique_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            print(f"⚠️  JTBD already exists: {jtbd_code}")
            return existing.data[0]['id']
        
        # Insert JTBD
        result = supabase.table('jtbd_library')\
            .insert(jtbd_insert)\
            .execute()
        
        if result.data and len(result.data) > 0:
            jtbd_id = result.data[0]['id']
            stats['jtbds_created'] += 1
            print(f"✨ Created JTBD: {jtbd_code}")
            print(f"   • Statement: {jtbd_data['statement'][:80]}...")
            print(f"   • Opportunity Score: {jtbd_data.get('opportunity_score', 'N/A')}")
            return jtbd_id
        
        return None
        
    except Exception as e:
        error_msg = f"Error importing JTBD: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"❌ {error_msg}")
        return None

def create_jtbd_persona_mapping(jtbd_id: str, persona_id: str) -> bool:
    """Create a mapping between JTBD and persona"""
    try:
        # Check if mapping already exists
        existing = supabase.table('jtbd_org_persona_mapping')\
            .select('id')\
            .eq('jtbd_id', jtbd_id)\
            .eq('persona_id', persona_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            return True  # Already mapped
        
        # Create mapping
        mapping_data = {
            'jtbd_id': jtbd_id,
            'persona_id': persona_id,
            'relevance_score': 10,  # High relevance for catalogue JTBDs
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('jtbd_org_persona_mapping')\
            .insert(mapping_data)\
            .execute()
        
        if result.data:
            stats['mappings_created'] += 1
            return True
        
        return False
        
    except Exception as e:
        error_msg = f"Error creating mapping: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"❌ {error_msg}")
        return False

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 1: Enrich 8 Tier 1 Personas                        ║")
    print("║  Import 18 JTBDs & Create Mappings                        ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Load parsed data
    json_file = 'data/persona_master_catalogue_20251108_204641.json'
    
    if not os.path.exists(json_file):
        print(f"❌ Error: JSON file not found: {json_file}")
        return
    
    data = load_parsed_data(json_file)
    personas = data['personas']
    jtbds = data.get('jtbds', [])
    
    print(f"📖 Loaded {len(personas)} personas and {len(jtbds)} JTBDs from catalogue\n")
    print("=" * 70)
    
    # First, enrich personas
    persona_map = {}  # Map persona_code to Supabase ID
    
    for i, persona in enumerate(personas, 1):
        print(f"\n🔍 [{i}/{len(personas)}] Processing: {persona['title']}")
        print(f"   Sector: {persona['sector']}")
        
        # Match to existing record
        existing = match_persona_in_supabase(persona['title'], persona['sector'])
        
        if existing:
            print(f"   ✅ Matched to: {existing['title']} (ID: {existing['id']})")
            stats['personas_matched'] += 1
            persona_map[persona['persona_code']] = existing['id']
            
            # Enrich the persona
            enrich_persona(persona, existing)
        else:
            print(f"   ⚠️  No match found in Supabase")
            print(f"   💡 This persona might not be in the database yet")
    
    # Now import all JTBDs
    if jtbds:
        print(f"\n" + "=" * 70)
        print(f"\n📋 Importing {len(jtbds)} JTBDs from catalogue:\n")
        
        for i, jtbd in enumerate(jtbds, 1):
            persona_code = jtbd.get('persona_code')
            persona_id = persona_map.get(persona_code)
            
            if persona_id:
                print(f"\n[{i}/{len(jtbds)}] JTBD for {jtbd.get('persona_title', 'Unknown')}")
                jtbd_id = import_jtbd(jtbd, persona_id, jtbd.get('persona_unique_id', 'unknown'), i)
                
                if jtbd_id:
                    # Create mapping
                    create_jtbd_persona_mapping(jtbd_id, persona_id)
            else:
                print(f"\n[{i}/{len(jtbds)}] ⚠️ Skipping - persona not matched: {jtbd.get('persona_title')}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 1 Complete - Summary Statistics                    ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    print(f"📊 Personas Matched:     {stats['personas_matched']}/{len(personas)}")
    print(f"✅ Personas Enriched:    {stats['personas_enriched']}/{len(personas)}")
    print(f"✨ JTBDs Created:        {stats['jtbds_created']}")
    print(f"🔗 Mappings Created:     {stats['mappings_created']}")
    
    if stats['errors']:
        print(f"\n⚠️  Errors Encountered:   {len(stats['errors'])}")
        for error in stats['errors'][:5]:  # Show first 5 errors
            print(f"   • {error}")
    
    print(f"\n✅ Phase 1 execution complete!")
    
    # Create completion report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"data/phase1_enrichment_report_{timestamp}.txt"
    
    with open(report_file, 'w') as f:
        f.write("PHASE 1: TIER 1 PERSONA ENRICHMENT - COMPLETION REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Timestamp: {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"Personas Matched: {stats['personas_matched']}/{len(personas)}\n")
        f.write(f"Personas Enriched: {stats['personas_enriched']}/{len(personas)}\n")
        f.write(f"JTBDs Created: {stats['jtbds_created']}\n")
        f.write(f"Mappings Created: {stats['mappings_created']}\n")
        f.write(f"Errors: {len(stats['errors'])}\n\n")
        
        if stats['errors']:
            f.write("Errors:\n")
            for error in stats['errors']:
                f.write(f"  - {error}\n")
    
    print(f"📄 Report saved: {report_file}\n")

if __name__ == "__main__":
    main()

