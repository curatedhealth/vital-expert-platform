#!/usr/bin/env python3
"""
Import Medical Affairs Complete JTBD Library to Supabase
- 120 JTBDs with detailed workflows
- 25 Use Cases
- 85 Workflows
- 7 Strategic Pillars
- Complete persona-JTBD mappings
"""

import json
import os
from datetime import datetime, timezone
from supabase import create_client, Client
from typing import Dict, Any, List, Optional

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Statistics
stats = {
    'jtbds_created': 0,
    'jtbds_updated': 0,
    'use_cases_created': 0,
    'workflows_created': 0,
    'persona_mappings_created': 0,
    'errors': []
}

def parse_frequency(freq_str: str) -> str:
    """Convert frequency string to standardized value"""
    freq_lower = freq_str.lower()
    if 'daily' in freq_lower or 'week' in freq_lower:
        return 'Weekly'
    elif 'month' in freq_lower or 'quarter' in freq_lower:
        return 'Monthly'
    elif 'annual' in freq_lower or 'year' in freq_lower:
        return 'Annual'
    else:
        return 'Ongoing'

def parse_importance(impact: str) -> int:
    """Convert impact to importance score 1-10"""
    impact_lower = impact.lower()
    if 'critical' in impact_lower:
        return 10
    elif 'high' in impact_lower:
        return 8
    elif 'medium' in impact_lower:
        return 6
    else:
        return 4

def extract_verb_and_goal(statement: str) -> tuple:
    """Extract verb and goal from JTBD statement"""
    verb = 'manage'
    goal = 'achieve outcome'
    
    try:
        # Extract verb from "I want to [verb]"
        if 'I want to' in statement:
            verb_part = statement.split('I want to')[1].split(',')[0].strip()
            first_word = verb_part.split()[0].lower()
            if len(first_word) > 2:
                verb = first_word[:20]
        
        # Extract goal from "so I can [goal]"
        if 'so I can' in statement:
            goal = statement.split('so I can')[1].strip()
            if goal.endswith('.'):
                goal = goal[:-1]
    except:
        pass
    
    return verb, goal

def generate_jtbd_id(index: int) -> str:
    """Generate sequential JTBD ID"""
    return f"ma{index:05d}"

def import_jtbd(jtbd_data: Dict[str, Any], index: int) -> Optional[str]:
    """Import a single JTBD to Supabase"""
    try:
        jtbd_id = generate_jtbd_id(index)
        unique_id = f"medical_affairs_{jtbd_id}"
        
        # Extract verb and goal
        verb, goal = extract_verb_and_goal(jtbd_data['jtbd_statement'])
        
        # Parse importance
        importance = parse_importance(jtbd_data.get('impact', 'High'))
        
        # Parse frequency
        frequency = parse_frequency(jtbd_data.get('frequency', 'Ongoing'))
        
        # Prepare JTBD data
        jtbd_insert = {
            'id': jtbd_id,
            'unique_id': unique_id,
            'jtbd_code': jtbd_data['id'],
            'title': jtbd_data['jtbd_statement'][:255],
            'verb': verb,
            'goal': goal[:255] if len(goal) > 255 else goal,
            'description': jtbd_data.get('description', jtbd_data['jtbd_statement']),
            'frequency': frequency,
            'importance': importance,
            'satisfaction': 5,  # Default neutral
            'sector': 'Pharma',
            'category': jtbd_data.get('category', 'Medical Affairs'),
            'strategic_pillar': jtbd_data.get('strategic_pillar'),
            'complexity': jtbd_data.get('complexity', 'Intermediate'),
            'success_criteria': json.dumps(jtbd_data.get('success_criteria', [])),
            'pain_points': json.dumps(jtbd_data.get('pain_points', [])),
            'workflows': json.dumps(jtbd_data.get('workflows', [])),
            'use_case_ids': json.dumps(jtbd_data.get('use_case_ids', [])),
            'source': 'Medical Affairs JTBD Complete Library v3.0',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if exists
        existing = supabase.table('jtbd_library')\
            .select('id')\
            .eq('unique_id', unique_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            # Update
            result = supabase.table('jtbd_library')\
                .update(jtbd_insert)\
                .eq('id', existing.data[0]['id'])\
                .execute()
            stats['jtbds_updated'] += 1
            print(f"   🔄 Updated: {jtbd_data['id']}")
            return existing.data[0]['id']
        else:
            # Create
            result = supabase.table('jtbd_library')\
                .insert(jtbd_insert)\
                .execute()
            stats['jtbds_created'] += 1
            print(f"   ✅ Created: {jtbd_data['id']}")
            return result.data[0]['id']
            
    except Exception as e:
        error_msg = f"Error importing JTBD {jtbd_data['id']}: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"   ❌ {error_msg}")
        return None

def create_persona_jtbd_mappings(jtbd_data: Dict[str, Any], jtbd_db_id: str):
    """Create persona-JTBD mappings"""
    try:
        for persona_code in jtbd_data.get('persona_ids', []):
            # Find persona in database
            persona_result = supabase.table('dh_personas')\
                .select('id')\
                .eq('persona_code', persona_code)\
                .execute()
            
            if persona_result.data and len(persona_result.data) > 0:
                persona_id = persona_result.data[0]['id']
                
                # Check if mapping exists
                existing_mapping = supabase.table('jtbd_persona_mapping')\
                    .select('id')\
                    .eq('jtbd_id', jtbd_db_id)\
                    .eq('persona_id', persona_id)\
                    .execute()
                
                if not existing_mapping.data or len(existing_mapping.data) == 0:
                    # Create mapping
                    mapping_data = {
                        'jtbd_id': jtbd_db_id,
                        'persona_id': persona_id,
                        'relevance_score': 8,  # High relevance for explicit mappings
                        'created_at': datetime.now(timezone.utc).isoformat()
                    }
                    
                    supabase.table('jtbd_persona_mapping')\
                        .insert(mapping_data)\
                        .execute()
                    
                    stats['persona_mappings_created'] += 1
    except Exception as e:
        error_msg = f"Error creating persona mappings for {jtbd_data['id']}: {str(e)}"
        stats['errors'].append(error_msg)

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Import Medical Affairs Complete JTBD Library             ║")
    print("║  120 JTBDs + 25 Use Cases + 85 Workflows                  ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Load JSON file
    json_file = '/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_JTBD_COMPLETE.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        print(f"📊 Found {data['metadata']['total_jtbd']} Medical Affairs JTBDs")
        print(f"📋 Framework: {data['metadata']['framework']}")
        print(f"📅 Created: {data['metadata']['created_date']}")
        print(f"\n📈 Coverage:")
        print(f"   • {data['metadata']['coverage']['personas']} personas")
        print(f"   • {data['metadata']['coverage']['departments']} departments")
        print(f"   • {data['metadata']['coverage']['strategic_pillars']} strategic pillars")
        print(f"\n{'=' * 70}\n")
        
        print("🚀 Starting import...\n")
        
        # Import JTBDs
        total_jtbds = len(data['jobs_to_be_done'])
        for idx, jtbd in enumerate(data['jobs_to_be_done'], 1):
            print(f"[{idx}/{total_jtbds}] Processing: {jtbd['id']}")
            
            # Import JTBD
            jtbd_db_id = import_jtbd(jtbd, idx)
            
            # Create persona mappings
            if jtbd_db_id:
                create_persona_jtbd_mappings(jtbd, jtbd_db_id)
        
        print(f"\n{'=' * 70}\n")
        
        # Print summary
        print("╔════════════════════════════════════════════════════════════╗")
        print("║  Import Complete - Summary Statistics                     ║")
        print("╚════════════════════════════════════════════════════════════╝\n")
        
        print(f"✅ JTBDs Created:           {stats['jtbds_created']}")
        print(f"🔄 JTBDs Updated:           {stats['jtbds_updated']}")
        print(f"🔗 Persona Mappings:        {stats['persona_mappings_created']}")
        print(f"📊 Total Processed:         {stats['jtbds_created'] + stats['jtbds_updated']}")
        
        if stats['errors']:
            print(f"\n⚠️  Errors encountered: {len(stats['errors'])}")
            for error in stats['errors'][:10]:  # Show first 10
                print(f"   • {error}")
        
        # Get final counts from database
        try:
            result = supabase.table('jtbd_library')\
                .select('id', count='exact')\
                .eq('source', 'Medical Affairs JTBD Complete Library v3.0')\
                .execute()
            
            print(f"\n📈 Total Medical Affairs JTBDs in database: {result.count}")
            
        except Exception as e:
            print(f"\n❌ Error getting final count: {str(e)}")
        
        print("\n✅ Import complete!")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {json_file}")
        return 1
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {str(e)}")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

