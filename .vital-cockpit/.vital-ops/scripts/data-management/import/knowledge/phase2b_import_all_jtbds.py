#!/usr/bin/env python3
"""
Phase 2b: Import All Parsed JTBDs to Supabase
This script will import the 127 parsed JTBDs with proper field mapping.
"""

import json
import os
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
    'total_imported': 0,
    'skipped_duplicates': 0,
    'errors': []
}

def import_jtbd(jtbd: Dict[str, Any]) -> bool:
    """Import a single JTBD to Supabase"""
    try:
        # Check if already exists
        existing = supabase.table('jtbd_library')\
            .select('id')\
            .eq('unique_id', jtbd['unique_id'])\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            stats['skipped_duplicates'] += 1
            return False
        
        # Prepare data for insert
        insert_data = {
            'id': jtbd['id'],
            'unique_id': jtbd['unique_id'],
            'jtbd_code': jtbd['jtbd_code'],
            'title': jtbd['statement'][:255],
            'verb': jtbd['verb'][:50],
            'function': jtbd['object'][:100] if jtbd['object'] else 'Not specified',
            'goal': jtbd['goal'][:255] if jtbd['goal'] else 'Achieve desired outcome',
            'description': jtbd['statement'],
            'frequency': jtbd['frequency'],
            'importance': jtbd['importance'],
            'satisfaction': jtbd['satisfaction'],
            'sector': jtbd['sector'],
            'source': jtbd['source'],
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Insert to Supabase
        result = supabase.table('jtbd_library')\
            .insert(insert_data)\
            .execute()
        
        if result.data:
            stats['total_imported'] += 1
            return True
        
        return False
        
    except Exception as e:
        error_msg = f"Error importing JTBD {jtbd.get('id', 'unknown')}: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"❌ {error_msg}")
        return False

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 2b: Import All JTBDs to Supabase                   ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Load the extracted JTBDs
    json_file = 'data/phase2_all_jtbds_20251108_211301.json'
    
    if not os.path.exists(json_file):
        print(f"❌ Error: JSON file not found: {json_file}")
        return
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    jtbds = data['jtbds']
    total = len(jtbds)
    
    print(f"📖 Loaded {total} JTBDs from {json_file}\n")
    print("=" * 70)
    
    # Import in batches
    batch_size = 10
    for i in range(0, total, batch_size):
        batch = jtbds[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total + batch_size - 1) // batch_size
        
        print(f"\n📦 Batch {batch_num}/{total_batches} ({len(batch)} JTBDs)")
        
        for j, jtbd in enumerate(batch, 1):
            jtbd_num = i + j
            success = import_jtbd(jtbd)
            
            if success:
                print(f"   ✅ [{jtbd_num}/{total}] {jtbd['id']}: {jtbd['statement'][:60]}...")
            elif jtbd['unique_id'] in [e for e in stats['errors'] if 'already exists' in e]:
                print(f"   ⚠️  [{jtbd_num}/{total}] {jtbd['id']}: Already exists (skipped)")
    
    # Print summary
    print("\n" + "=" * 70)
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 2b Complete - Import Summary                       ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    print(f"📊 Total Processed:      {total}")
    print(f"✅ Successfully Imported: {stats['total_imported']}")
    print(f"⚠️  Skipped (Duplicates):  {stats['skipped_duplicates']}")
    print(f"❌ Errors:               {len(stats['errors'])}")
    
    success_rate = (stats['total_imported'] / total * 100) if total > 0 else 0
    print(f"\n📈 Success Rate:         {success_rate:.1f}%")
    
    if stats['errors']:
        print(f"\n⚠️  Errors (first 5):")
        for error in stats['errors'][:5]:
            print(f"   • {error}")
    
    print(f"\n✅ Phase 2b import complete!")
    print(f"🎯 Total JTBDs in Supabase: {112 + stats['total_imported']} (was 112)")
    print(f"\n🚀 Ready for Phase 3: Complete Org Structures\n")

if __name__ == "__main__":
    main()

