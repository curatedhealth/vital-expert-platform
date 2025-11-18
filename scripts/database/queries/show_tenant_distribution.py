#!/usr/bin/env python3
"""
Show Data Distribution Across Tenants
Displays distribution of agents, knowledge domains, personas, tools across tenants
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEW_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('NEW_SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ Missing environment variables")
    sys.exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

def get_tenant_stats():
    """Get statistics for all tenants"""
    print("=" * 80)
    print("📊 DATA DISTRIBUTION ACROSS TENANTS")
    print("=" * 80)
    print()

    # Get the three tenants we care about
    tenant_slugs = ['vital-platform', 'pharmaceuticals', 'digital-health-startup']

    results = {}

    for slug in tenant_slugs:
        # Get tenant
        tenant_response = supabase.table('tenants').select('id, name, slug').eq('slug', slug).execute()

        if not tenant_response.data:
            print(f"⚠️  Tenant '{slug}' not found")
            continue

        tenant = tenant_response.data[0]
        tenant_id = tenant['id']
        tenant_name = tenant['name']

        # Get counts for each dimension
        agents_count = supabase.table('agents').select('id', count='exact').eq('tenant_id', tenant_id).execute().count or 0
        knowledge_count = supabase.table('knowledge_domains').select('id', count='exact').eq('tenant_id', tenant_id).execute().count or 0
        personas_count = supabase.table('personas').select('id', count='exact').eq('tenant_id', tenant_id).execute().count or 0
        tools_count = supabase.table('tools').select('id', count='exact').eq('tenant_id', tenant_id).execute().count or 0
        user_roles_count = supabase.table('user_roles').select('id', count='exact').eq('tenant_id', tenant_id).execute().count or 0

        total = agents_count + knowledge_count + personas_count + tools_count + user_roles_count

        results[tenant_name] = {
            'slug': slug,
            'agents': agents_count,
            'knowledge_domains': knowledge_count,
            'personas': personas_count,
            'tools': tools_count,
            'user_roles': user_roles_count,
            'total': total
        }

    # Get global prompts count
    prompts_count = supabase.table('prompts').select('id', count='exact').execute().count or 0

    # Display results in a formatted table
    print("┌─────────────────────────────┬─────────┬───────────┬──────────┬────────┬────────────┬────────┐")
    print("│ Tenant                      │ Agents  │ Knowledge │ Personas │ Tools  │ User Roles │ Total  │")
    print("├─────────────────────────────┼─────────┼───────────┼──────────┼────────┼────────────┼────────┤")

    for tenant_name in sorted(results.keys(), key=lambda x: results[x]['total'], reverse=True):
        stats = results[tenant_name]
        print(f"│ {tenant_name:27} │ {stats['agents']:7} │ {stats['knowledge_domains']:9} │ {stats['personas']:8} │ {stats['tools']:6} │ {stats['user_roles']:10} │ {stats['total']:6} │")

    print("└─────────────────────────────┴─────────┴───────────┴──────────┴────────┴────────────┴────────┘")
    print()
    print(f"📝 Global Prompts (shared): {prompts_count:,}")
    print()

    # Detailed breakdown
    print("=" * 80)
    print("📋 DETAILED BREAKDOWN")
    print("=" * 80)
    print()

    for tenant_name in sorted(results.keys()):
        stats = results[tenant_name]
        print(f"🏢 {tenant_name} ({stats['slug']})")
        print(f"   Agents:            {stats['agents']:6,}")
        print(f"   Knowledge Domains: {stats['knowledge_domains']:6,}")
        print(f"   Personas:          {stats['personas']:6,}")
        print(f"   Tools:             {stats['tools']:6,}")
        print(f"   User Roles:        {stats['user_roles']:6,}")
        print(f"   {'─' * 30}")
        print(f"   Total:             {stats['total']:6,}")
        print()

    print("=" * 80)
    print("✅ Distribution report complete")
    print("=" * 80)

if __name__ == '__main__':
    try:
        get_tenant_stats()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
