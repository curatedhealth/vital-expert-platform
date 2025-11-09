#!/usr/bin/env python3
"""
Import all 111 new Medical Affairs JTBDs from consolidated file
Imports JTBDs 006-120 (excluding already imported 001-005, 010, 020, 025, 040)
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

# Already imported JTBDs
ALREADY_IMPORTED = {
    'JTBD-MA-001', 'JTBD-MA-002', 'JTBD-MA-003', 'JTBD-MA-004', 'JTBD-MA-005',
    'JTBD-MA-010', 'JTBD-MA-020', 'JTBD-MA-025', 'JTBD-MA-040'
}

def extract_verb_from_statement(statement: str) -> str:
    """Extract verb from JTBD statement"""
    match = re.search(r'I want to (\w+)', statement)
    if match:
        return match.group(1).lower()
    return 'manage'

def extract_goal_from_statement(statement: str) -> str:
    """Extract goal from JTBD statement"""
    match = re.search(r'so I can (.+?)(?:\.|$)', statement, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return 'achieve outcome'

def parse_personas(jtbd: Dict[str, Any]) -> List[str]:
    """Extract persona codes from JTBD"""
    persona_ids = jtbd.get('persona_ids', [])
    if not persona_ids:
        # Try to extract from personas field
        personas = jtbd.get('personas', [])
        if personas and isinstance(personas, list):
            return personas[:3]  # Limit to 3 personas
    return persona_ids[:3]  # Limit to 3 personas

def clean_description(desc) -> str:
    """Clean description field"""
    if isinstance(desc, str):
        return desc[:500] if desc else ''
    elif isinstance(desc, list):
        return ' '.join(desc)[:500] if desc else ''
    return ''

def map_complexity(complexity: str) -> str:
    """Map complexity values to allowed values"""
    complexity_lower = complexity.lower() if complexity else ''
    
    # Map common values
    mapping = {
        'basic': 'Low',
        'simple': 'Low',
        'beginner': 'Low',
        'entry': 'Low',
        'intermediate': 'Medium',
        'moderate': 'Medium',
        'standard': 'Medium',
        'advanced': 'High',
        'expert': 'High',
        'complex': 'High',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
    }
    
    return mapping.get(complexity_lower, 'Medium')  # Default to Medium

def prepare_jtbd_data(jtbd: Dict[str, Any], pillar_id: str) -> Optional[Dict[str, Any]]:
    """Prepare JTBD data for Supabase insert"""
    jtbd_id = jtbd.get('id', '')
    
    # Skip if already imported
    if jtbd_id in ALREADY_IMPORTED:
        return None
    
    # Extract sequential number from ID
    match = re.search(r'JTBD-MA-(\d+)', jtbd_id)
    if not match:
        return None
    
    seq_num = int(match.group(1))
    
    # Generate unique_id
    unique_id = f"pmc_jtbd{seq_num:05d}"
    
    # Extract verb and goal
    statement = jtbd.get('jtbd_statement', '')
    verb = extract_verb_from_statement(statement)
    goal = extract_goal_from_statement(statement)
    
    # Get persona codes
    persona_codes = parse_personas(jtbd)
    
    # Generate title from JTBD statement (first 50 chars or category)
    title = jtbd.get('title') or jtbd.get('category', '') or statement[:50] + '...'
    
    # Map complexity to allowed values
    complexity = map_complexity(jtbd.get('complexity', 'Intermediate'))
    
    # Prepare data
    data = {
        'id': f"jtbd{seq_num:05d}",
        'unique_id': unique_id,
        'jtbd_code': jtbd_id,
        'original_id': jtbd_id,
        'title': title[:100],  # Limit title length
        'category': jtbd.get('category', 'General'),
        'statement': statement,
        'verb': verb,
        'goal': goal,
        'description': clean_description(jtbd.get('description', '')),
        'frequency': jtbd.get('frequency', 'Ongoing'),
        'complexity': complexity,
        'function': pillar_id,  # Use strategic pillar as function
        'source': 'Medical Affairs Consolidated Library',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Add optional fields
    success_criteria = jtbd.get('success_criteria', [])
    if success_criteria and isinstance(success_criteria, list):
        data['success_metrics'] = {'criteria': success_criteria[:5]}
    
    # Add tags from pain points and enablers
    pain_points = jtbd.get('pain_points', [])
    enablers = jtbd.get('enablers', [])
    kpis = jtbd.get('kpis', [])
    
    tags = []
    if pain_points:
        tags.extend(['pain_point'] * min(len(pain_points), 2))
    if enablers:
        tags.extend(['enabler'] * min(len(enablers), 2))
    if kpis:
        tags.extend(['kpi'] * min(len(kpis), 2))
    
    if tags:
        data['tags'] = tags[:5]
    
    return data

def import_jtbd_batch(jtbd_list: List[Dict[str, Any]], pillar_name: str) -> tuple:
    """Import a batch of JTBDs"""
    success_count = 0
    error_count = 0
    errors = []
    
    for jtbd in jtbd_list:
        jtbd_id = jtbd.get('id', 'unknown')
        
        try:
            # Check if already imported
            if jtbd_id in ALREADY_IMPORTED:
                continue
            
            # Get pillar ID from jtbd
            pillar_id = jtbd.get('strategic_pillar', 'SP05')
            
            # Prepare data
            data = prepare_jtbd_data(jtbd, pillar_id)
            if not data:
                continue
            
            # Insert to Supabase using upsert
            result = supabase.table('jtbd_library').upsert(data, on_conflict='id').execute()
            
            if result.data:
                success_count += 1
                print(f"   ✅ {jtbd_id}: {jtbd.get('jtbd_statement', '')[:60]}...")
            else:
                error_count += 1
                errors.append(f"{jtbd_id}: No data returned")
                print(f"   ❌ {jtbd_id}: No data returned")
                
        except Exception as e:
            error_count += 1
            error_msg = str(e)
            errors.append(f"{jtbd_id}: {error_msg}")
            print(f"   ❌ {jtbd_id}: {error_msg}")
    
    return success_count, error_count, errors

def main():
    """Main execution function"""
    print("╔═══════════════════════════════════════════════════════════════════════╗")
    print("║                                                                        ║")
    print("║  IMPORT ALL 111 NEW MEDICAL AFFAIRS JTBDs                            ║")
    print("║  From Consolidated Library (JTBDs 006-120)                           ║")
    print("║                                                                        ║")
    print("╚═══════════════════════════════════════════════════════════════════════╝\n")
    
    # Load consolidated JSON file
    json_file = '/Users/hichamnaim/Downloads/MEDICAL_AFFAIRS_JTBD_CONSOLIDATED_AUGMENTED.json'
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        return
    
    print(f"📊 File loaded successfully!")
    print(f"   • Total Pillars: {data['metadata']['total_pillars']}")
    print(f"   • Total JTBDs Declared: {data['metadata']['total_jtbd']}")
    print(f"   • Already Imported: {len(ALREADY_IMPORTED)}")
    print(f"   • New to Import: {data['metadata']['total_jtbd'] - len(ALREADY_IMPORTED)}\n")
    
    total_success = 0
    total_errors = 0
    all_errors = []
    
    # Process each pillar
    for pillar_data in data['pillars']:
        pillar_id = pillar_data['pillar']['id']
        pillar_name = pillar_data['pillar']['name']
        jtbds = pillar_data['jobs_to_be_done']
        
        # Filter out already imported
        new_jtbds = [j for j in jtbds if j.get('id') not in ALREADY_IMPORTED]
        
        if not new_jtbds:
            print(f"⏭️  {pillar_id} - {pillar_name}: All JTBDs already imported\n")
            continue
        
        print(f"\n{'=' * 75}")
        print(f"📋 {pillar_id} - {pillar_name}")
        print(f"   Importing {len(new_jtbds)} new JTBDs...")
        print(f"{'=' * 75}\n")
        
        success, errors, error_list = import_jtbd_batch(new_jtbds, pillar_name)
        total_success += success
        total_errors += errors
        all_errors.extend(error_list)
        
        print(f"\n   ✅ Success: {success}")
        print(f"   ❌ Errors: {errors}")
    
    # Final summary
    print("\n" + "=" * 75)
    print("📊 IMPORT COMPLETE!")
    print("=" * 75)
    print(f"\n✅ Successfully Imported: {total_success} JTBDs")
    print(f"❌ Errors: {total_errors} JTBDs")
    print(f"📈 Success Rate: {(total_success / (total_success + total_errors) * 100):.1f}%")
    
    if all_errors:
        print(f"\n⚠️  Error Details:")
        for error in all_errors[:10]:
            print(f"   • {error}")
        if len(all_errors) > 10:
            print(f"   ... and {len(all_errors) - 10} more errors")
    
    print(f"\n🎉 Total Medical Affairs JTBDs in Database: {len(ALREADY_IMPORTED) + total_success}")
    print(f"   • Previously Imported: {len(ALREADY_IMPORTED)}")
    print(f"   • Newly Imported: {total_success}")
    print(f"   • Total: {len(ALREADY_IMPORTED) + total_success} / 120 (Target)")
    
    print("\n" + "=" * 75)
    print("✅ IMPORT PROCESS COMPLETE!")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    main()

