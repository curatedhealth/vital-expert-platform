#!/usr/bin/env python3
"""
Import Medical Affairs Personas (Enhanced)
Imports 10 detailed Medical Affairs personas with VPANES priority scoring from JSON
"""

import os
import json
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, Any

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
    'personas_created': 0,
    'personas_updated': 0,
    'errors': []
}

def parse_budget_auth(budget_str: str) -> tuple:
    """Extract min and max budget from string like '$10M - $100M+'"""
    try:
        # Clean the string - remove notes in parentheses
        clean_str = budget_str
        if '(' in clean_str:
            clean_str = clean_str.split('(')[0].strip()
        
        # Remove + and split
        parts = clean_str.replace('+', '').replace('$', '').split(' - ')
        
        def convert_to_number(s):
            s = s.strip().upper()
            if 'M' in s:
                return float(s.replace('M', '').strip()) * 1_000_000
            elif 'K' in s:
                return float(s.replace('K', '').strip()) * 1_000
            else:
                return float(s)
        
        min_val = convert_to_number(parts[0])
        max_val = convert_to_number(parts[1]) if len(parts) > 1 else min_val
        
        return min_val, max_val
    except Exception as e:
        print(f"⚠️  Could not parse budget: {budget_str} - {str(e)}")
        return None, None

def parse_team_size(team_str: str) -> tuple:
    """Extract min and max team size from string like '50-500+' or '0 (Individual Contributor)'"""
    try:
        # Handle special cases
        if 'Individual Contributor' in team_str or team_str == '0':
            return 0, 0
        
        # Remove + and clean
        clean = team_str.replace('+', '').replace(' MSLs', '').replace('(writers, coordinators)', '').strip()
        
        if '-' in clean:
            parts = clean.split('-')
            return int(parts[0]), int(parts[1])
        else:
            val = int(clean)
            return val, val
    except Exception as e:
        print(f"⚠️  Could not parse team size: {team_str} - {str(e)}")
        return None, None

def map_seniority_level(seniority_str: str) -> str:
    """Map seniority to valid values: Executive, Senior, Mid, Junior, Entry"""
    seniority_upper = seniority_str.upper()
    
    if 'EXECUTIVE' in seniority_upper or 'C-SUITE' in seniority_upper or 'C-1' in seniority_upper:
        return 'Executive'
    elif 'SENIOR' in seniority_upper:
        return 'Senior'
    elif 'MID' in seniority_upper or 'MANAGER' in seniority_upper:
        return 'Mid'
    elif 'JUNIOR' in seniority_upper:
        return 'Junior'
    elif 'INDIVIDUAL CONTRIBUTOR' in seniority_upper or 'IC' in seniority_upper:
        return 'Mid'  # Default IC to Mid
    else:
        return 'Mid'  # Default

def import_persona(persona_data: Dict[str, Any]) -> bool:
    """Import or update a single persona"""
    try:
        persona_code = persona_data['id']  # P001, P002, etc.
        scoring = persona_data['scoring']
        
        # Parse budget and team size
        budget_min, budget_max = parse_budget_auth(persona_data['budget_auth'])
        team_min, team_max = parse_team_size(persona_data['team_size'])
        
        # Map seniority level
        seniority = map_seniority_level(persona_data['seniority_level'])
        
        # Create persona data
        data = {
            'persona_code': persona_code,
            'title': persona_data['name'],
            'sector': persona_data['sector'],
            'tier': persona_data['tier'],
            'function': persona_data['function'],
            'role_category': persona_data['role'],
            'org_type': persona_data['org_type'],
            'org_size': persona_data['org_size'],
            'budget_authority': persona_data['budget_auth'],
            'team_size': persona_data['team_size'],
            'value_score': scoring['V_value'],
            'pain_score': scoring['P_pain'],
            'adoption_score': scoring['A_adoption'],
            'ease_score': scoring['E_ease'],
            'strategic_score': scoring['S_strategic'],
            'network_score': scoring['N_network'],
            # priority_score is generated column
            'key_need': persona_data['key_need'],
            'decision_cycle': persona_data['decision_cycle'],
            'decision_authority': persona_data.get('reports_to'),
            'expertise_level': seniority,
            'source': 'BRIDGE™ Medical Affairs Enhanced',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if persona exists
        existing = supabase.table('dh_personas')\
            .select('id, title')\
            .eq('persona_code', persona_code)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing persona
            result = supabase.table('dh_personas')\
                .update(data)\
                .eq('persona_code', persona_code)\
                .execute()
            
            stats['personas_updated'] += 1
            print(f"   ✅ Updated: {persona_data['name']} (Tier {persona_data['tier']}, Priority {scoring['priority_score']:.2f})")
        else:
            # Insert new persona
            result = supabase.table('dh_personas')\
                .insert(data)\
                .execute()
            
            stats['personas_created'] += 1
            print(f"   ✅ Created: {persona_data['name']} (Tier {persona_data['tier']}, Priority {scoring['priority_score']:.2f})")
        
        return True
        
    except Exception as e:
        error_msg = f"Error importing {persona_data.get('name', 'Unknown')}: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"   ❌ {error_msg}")
        return False

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Import Medical Affairs Complete Persona Library          ║")
    print("║  43 Personas with VPANES Priority Scoring                 ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Load JSON file
    json_file = '/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_ALL_43_PERSONAS_COMPLETE.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        personas = data['personas']
        metadata = data['metadata']
        
        print(f"📊 Found {len(personas)} Medical Affairs personas")
        print(f"📋 Framework: {metadata['framework']}")
        print(f"📅 Created: {metadata['created_date']}\n")
        
        print("=" * 70)
        print("\n🚀 Starting import...\n")
        
        # Import each persona
        for i, persona in enumerate(personas, 1):
            print(f"\n[{i}/{len(personas)}] Processing: {persona['name']}")
            import_persona(persona)
        
        # Print summary
        print("\n" + "=" * 70)
        print("\n╔════════════════════════════════════════════════════════════╗")
        print("║  Import Complete - Summary Statistics                     ║")
        print("╚════════════════════════════════════════════════════════════╝\n")
        
        print(f"✅ Personas Created:  {stats['personas_created']}")
        print(f"🔄 Personas Updated:  {stats['personas_updated']}")
        print(f"📊 Total Processed:   {stats['personas_created'] + stats['personas_updated']}")
        
        if stats['errors']:
            print(f"\n⚠️  Errors Encountered: {len(stats['errors'])}")
            for error in stats['errors']:
                print(f"   • {error}")
        
        # Query final counts by tier
        print("\n📈 Persona Distribution by Tier:")
        tier_counts = supabase.rpc('exec', {
            'query': """
                SELECT tier, COUNT(*) as count
                FROM dh_personas
                WHERE sector = 'Pharmaceutical & Life Sciences'
                  AND function LIKE 'Medical Affairs%'
                GROUP BY tier
                ORDER BY tier
            """
        }).execute()
        
        # Print priority ranking
        print("\n🏆 Top 5 Medical Affairs Personas by Priority:")
        top_personas = supabase.table('dh_personas')\
            .select('title, tier, priority_score')\
            .eq('sector', 'Pharmaceutical & Life Sciences')\
            .like('function', 'Medical Affairs%')\
            .order('priority_score', desc=True)\
            .limit(5)\
            .execute()
        
        for idx, persona in enumerate(top_personas.data, 1):
            print(f"   {idx}. {persona['title']}")
            print(f"      Tier {persona['tier']} | Priority: {persona['priority_score']:.2f}")
        
        print(f"\n✅ Medical Affairs personas successfully imported!\n")
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find file: {json_file}")
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()

