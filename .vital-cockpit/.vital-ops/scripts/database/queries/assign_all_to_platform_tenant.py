#!/usr/bin/env python3
"""
Assign all existing data to VITAL Platform tenant
Ensures all agents, knowledge, prompts, personas, etc. are accessible via the platform tenant
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEW_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('NEW_SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ Missing environment variables")
    sys.exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001"

def assign_all_to_platform():
    print("=" * 70)
    print("🔄 ASSIGNING ALL DATA TO VITAL PLATFORM TENANT")
    print("=" * 70)
    print(f"🌐 Platform Tenant ID: {PLATFORM_TENANT_ID}")
    print("")

    # List of tables to update
    tables_to_update = [
        'agents',
        'knowledge_domains',
        'knowledge_documents',
        'prompts',
        'personas',
        'tools',
        'agent_tools',
        'agent_knowledge_domains',
        'user_agents',
        'rag_user_feedback'
    ]

    results = {}

    for table_name in tables_to_update:
        print(f"📊 Processing table: {table_name}")
        try:
            # First, check if table exists and has tenant_id column
            test_query = supabase.table(table_name).select('id').limit(1).execute()

            # Count total records
            count_response = supabase.table(table_name).select('id', count='exact').execute()
            total_count = count_response.count if count_response.count else 0

            print(f"   ℹ️  Found {total_count} total records")

            if total_count == 0:
                print(f"   ⏭️  Skipping (no records)")
                results[table_name] = {'updated': 0, 'total': 0}
                continue

            # Try to update records - simpler approach: just update ALL records to platform tenant
            try:
                print(f"   🔄 Assigning all {total_count} records to platform tenant...")

                # Update ALL records in the table to platform tenant
                # Use batched approach for large tables
                batch_size = 1000
                updated_count = 0

                # Get all record IDs
                all_records = supabase.table(table_name)\
                    .select('id')\
                    .execute()

                if all_records.data and len(all_records.data) > 0:
                    # Process in batches
                    for i in range(0, len(all_records.data), batch_size):
                        batch = all_records.data[i:i + batch_size]
                        ids = [record['id'] for record in batch]

                        # Update this batch
                        update_response = supabase.table(table_name)\
                            .update({'tenant_id': PLATFORM_TENANT_ID})\
                            .in_('id', ids)\
                            .execute()

                        updated_count += len(batch)
                        if total_count > batch_size:
                            print(f"   ✅ Updated {updated_count}/{total_count} records")

                    print(f"   ✅ Successfully assigned {updated_count} records to platform tenant")
                    results[table_name] = {'updated': updated_count, 'total': total_count}
                else:
                    print(f"   ℹ️  No records to update")
                    results[table_name] = {'updated': 0, 'total': 0}

            except Exception as e:
                error_msg = str(e)
                # Check if table doesn't have tenant_id column
                if 'column' in error_msg.lower() and 'tenant_id' in error_msg.lower():
                    print(f"   ⏭️  Table doesn't have tenant_id column")
                    results[table_name] = {'updated': 0, 'total': total_count, 'note': 'No tenant_id column'}
                else:
                    raise e

        except Exception as e:
            error_msg = str(e)
            # Check if table doesn't exist
            if 'PGRST' in error_msg and ('204' in error_msg or '205' in error_msg):
                print(f"   ⏭️  Table doesn't exist")
                results[table_name] = {'updated': 0, 'total': 0, 'note': 'Table not found'}
            else:
                print(f"   ⚠️  Error: {error_msg}")
                results[table_name] = {'error': error_msg}

        print("")

    # Print summary
    print("=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)

    total_updated = 0
    total_records = 0

    for table_name, result in results.items():
        if 'error' in result:
            print(f"❌ {table_name}: Error - {result['error']}")
        elif 'note' in result:
            print(f"⏭️  {table_name}: {result['note']}")
        else:
            updated = result.get('updated', 0)
            total = result.get('total', 0)
            total_updated += updated
            total_records += total

            if updated > 0:
                print(f"✅ {table_name}: Updated {updated} of {total} records")
            else:
                print(f"✅ {table_name}: All {total} records already assigned")

    print("")
    print("=" * 70)
    print(f"🎉 COMPLETED!")
    print("=" * 70)
    print(f"✅ Total records updated: {total_updated}")
    print(f"✅ Total records in platform: {total_records}")
    print("")
    print("🔄 All data is now accessible via VITAL Platform tenant")
    print("=" * 70)

if __name__ == '__main__':
    try:
        assign_all_to_platform()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
