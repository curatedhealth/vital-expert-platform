#!/usr/bin/env python3
"""
Import and Merge 120+ Persona Database with existing Supabase data.
This script will:
1. Parse the Complete Persona Database (120+ Profiles).md
2. Compare with existing dh_personas in Supabase
3. Merge/deduplicate based on role and sector
4. Import all new personas
5. Update existing personas with new scoring data
"""

import re
import os
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional, Tuple

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
    'total_parsed': 0,
    'new_personas': 0,
    'updated_personas': 0,
    'duplicates_found': 0,
    'errors': 0,
    'by_sector': {}
}

def parse_persona_table(file_path: str) -> List[Dict[str, Any]]:
    """Parse the markdown table from Complete Persona Database"""
    personas = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the table section
    table_pattern = r'\|\s*\*\*P\d+\*\*\s*\|([^\n]+)\|'
    matches = re.finditer(table_pattern, content)
    
    for match in matches:
        row = match.group(0)
        cells = [cell.strip() for cell in row.split('|')]
        cells = [c for c in cells if c]  # Remove empty cells
        
        if len(cells) >= 18:
            try:
                persona = {
                    'persona_id': cells[0].replace('**', '').strip(),
                    'sector': cells[1].strip(),
                    'tier': int(cells[2].strip()) if cells[2].strip().isdigit() else None,
                    'function': cells[3].strip(),
                    'role': cells[4].strip(),
                    'org_type': cells[5].strip(),
                    'org_size': cells[6].strip(),
                    'budget_authority': cells[7].strip(),
                    'team_size': cells[8].strip(),
                    'value_score': int(cells[9].strip()) if cells[9].strip().isdigit() else None,
                    'pain_score': int(cells[10].strip()) if cells[10].strip().isdigit() else None,
                    'adoption_score': int(cells[11].strip()) if cells[11].strip().isdigit() else None,
                    'ease_score': int(cells[12].strip()) if cells[12].strip().isdigit() else None,
                    'strategic_score': int(cells[13].strip()) if cells[13].strip().isdigit() else None,
                    'network_score': int(cells[14].strip()) if cells[14].strip().isdigit() else None,
                    'priority_score': float(cells[15].strip()) if cells[15].strip() else None,
                    'key_need': cells[16].strip(),
                    'decision_cycle': cells[17].strip() if len(cells) > 17 else None
                }
                
                personas.append(persona)
                stats['total_parsed'] += 1
                
                # Track by sector
                sector = persona['sector']
                stats['by_sector'][sector] = stats['by_sector'].get(sector, 0) + 1
                
            except (ValueError, IndexError) as e:
                print(f"Warning: Failed to parse row: {row[:50]}... - {e}")
                stats['errors'] += 1
    
    return personas

def generate_unique_id(persona: Dict[str, Any]) -> str:
    """Generate a unique_id for the persona"""
    sector_map = {
        'Pharma': 'pharma',
        'Pharmaceutical': 'pharma',
        'Digital Health': 'dh',
        'Payer': 'payer',
        'Provider': 'provider',
        'Healthcare Providers': 'provider',
        'Investor': 'investor',
        'CRO': 'cro',
        'Academic': 'academic',
        'Academia': 'academic',
        'Government': 'govt',
        'Technology': 'tech',
        'MedDevice': 'meddevice',
        'Medical Device': 'meddevice',
        'Consultant': 'consultant',
        'Consultants': 'consultant',
        'Consulting': 'consultant',
        'Specialty': 'specialty',
        'Specialty Orgs': 'specialty',
        'Patient': 'patient',
        'DTx': 'dtx'
    }
    
    sector_prefix = sector_map.get(persona['sector'], 'other')
    
    # Create slug from role
    role_slug = persona['role'].lower()
    role_slug = re.sub(r'[^a-z0-9]+', '_', role_slug)
    role_slug = role_slug.strip('_')[:30]
    
    return f"{sector_prefix}_{role_slug}"

def check_duplicate(persona: Dict[str, Any], existing_personas: List[Dict]) -> Optional[Dict]:
    """Check if persona is a duplicate of existing data"""
    role = persona['role'].lower()
    sector = persona['sector'].lower()
    
    for existing in existing_personas:
        existing_title = existing.get('title', '').lower()
        existing_sector = existing.get('sector', '').lower()
        
        # Check for exact or near match
        if (role in existing_title or existing_title in role) and sector == existing_sector:
            return existing
    
    return None

def import_persona(persona: Dict[str, Any], existing: Optional[Dict] = None) -> str:
    """Import or update a single persona in Supabase"""
    try:
        unique_id = generate_unique_id(persona)
        
        # Prepare data for Supabase
        data = {
            'unique_id': unique_id,
            'persona_code': persona['persona_id'],
            'name': persona['role'],  # Use role as name
            'title': persona['role'],
            'sector': persona['sector'],
            'tier': persona['tier'],
            'function': persona['function'],
            'role_category': persona['function'],  # Using function as role_category
            'org_type': persona['org_type'],
            'org_size': persona['org_size'],
            'budget_authority': persona['budget_authority'],
            'team_size': persona['team_size'],
            'value_score': persona['value_score'],
            'pain_score': persona['pain_score'],
            'adoption_score': persona['adoption_score'],
            'ease_score': persona['ease_score'],
            'strategic_score': persona['strategic_score'],
            'network_score': persona['network_score'],
            # 'priority_score': persona['priority_score'],  # SKIP: Generated column
            'key_need': persona['key_need'],  # Single text field
            'pain_points': [persona['key_need']],  # JSONB array
            'decision_cycle': persona['decision_cycle'],
            'source': 'Complete_Persona_Database_120',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        if existing:
            # Update existing persona
            result = supabase.table('dh_personas')\
                .update(data)\
                .eq('id', existing['id'])\
                .execute()
            stats['updated_personas'] += 1
            print(f"✅ Updated: {persona['role']} ({persona['sector']})")
            return 'updated'
        else:
            # Insert new persona
            data['created_at'] = datetime.now(timezone.utc).isoformat()
            result = supabase.table('dh_personas')\
                .insert(data)\
                .execute()
            stats['new_personas'] += 1
            print(f"✨ Created: {persona['role']} ({persona['sector']})")
            return 'created'
            
    except Exception as e:
        print(f"❌ Error importing {persona['role']}: {str(e)}")
        stats['errors'] += 1
        return 'error'

def get_existing_personas() -> List[Dict]:
    """Fetch all existing personas from Supabase"""
    try:
        result = supabase.table('dh_personas')\
            .select('*')\
            .execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching existing personas: {e}")
        return []

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  120+ Persona Database Import & Merge                     ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Path to the markdown file
    file_path = "/Users/hichamnaim/Downloads/Private & Shared 33/Complete Persona Database (120+ Profiles).md"
    
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        return
    
    print("📖 Parsing Complete Persona Database...")
    personas = parse_persona_table(file_path)
    print(f"✅ Parsed {len(personas)} personas from markdown\n")
    
    print("🔍 Fetching existing personas from Supabase...")
    existing_personas = get_existing_personas()
    print(f"✅ Found {len(existing_personas)} existing personas\n")
    
    print("🔄 Starting import and merge process...\n")
    
    for persona in personas:
        # Check for duplicates
        existing = check_duplicate(persona, existing_personas)
        
        if existing:
            stats['duplicates_found'] += 1
            print(f"🔁 Duplicate found: {persona['role']} -> Updating...")
            import_persona(persona, existing)
        else:
            import_persona(persona, None)
    
    # Print final statistics
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║  Import Complete - Final Statistics                       ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    print(f"📊 Total Parsed:          {stats['total_parsed']}")
    print(f"✨ New Personas:          {stats['new_personas']}")
    print(f"🔄 Updated Personas:      {stats['updated_personas']}")
    print(f"🔁 Duplicates Found:      {stats['duplicates_found']}")
    print(f"❌ Errors:                {stats['errors']}")
    
    print(f"\n📈 Breakdown by Sector:")
    for sector, count in sorted(stats['by_sector'].items(), key=lambda x: x[1], reverse=True):
        print(f"   • {sector:25s}: {count:3d} personas")
    
    print(f"\n✅ Import process completed!")
    print(f"   • Total in Supabase: {len(existing_personas) + stats['new_personas']} personas")
    
    # Save report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"data/persona_import_report_{timestamp}.txt"
    os.makedirs('data', exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write("120+ PERSONA DATABASE IMPORT REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n\n")
        f.write(f"Total Parsed:       {stats['total_parsed']}\n")
        f.write(f"New Personas:       {stats['new_personas']}\n")
        f.write(f"Updated Personas:   {stats['updated_personas']}\n")
        f.write(f"Duplicates Found:   {stats['duplicates_found']}\n")
        f.write(f"Errors:             {stats['errors']}\n\n")
        f.write("By Sector:\n")
        for sector, count in sorted(stats['by_sector'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"  {sector:25s}: {count:3d}\n")
    
    print(f"\n📄 Report saved to: {report_path}")

if __name__ == "__main__":
    main()

