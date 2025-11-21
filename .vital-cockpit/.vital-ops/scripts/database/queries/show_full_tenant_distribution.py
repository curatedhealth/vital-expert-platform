#!/usr/bin/env python3
"""
Show Complete Data Distribution Across Tenants
Displays distribution of all data types including functions, departments, roles
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

def get_count(table, tenant_id):
    """Get count of records for a tenant in a table"""
    try:
        result = supabase.table(table).select('id', count='exact').eq('tenant_id', tenant_id).execute()
        return result.count or 0
    except Exception:
        return 0

def get_full_tenant_stats():
    """Get complete statistics for all tenants"""
    print("=" * 100)
    print("📊 COMPLETE DATA DISTRIBUTION ACROSS TENANTS")
    print("=" * 100)
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
        stats = {
            'slug': slug,
            'agents': get_count('agents', tenant_id),
            'knowledge_domains': get_count('knowledge_domains', tenant_id),
            'personas': get_count('personas', tenant_id),
            'tools': get_count('tools', tenant_id),
            'functions': get_count('org_functions', tenant_id),
            'departments': get_count('org_departments', tenant_id),
            'roles': get_count('org_roles', tenant_id),
            'user_roles': get_count('user_roles', tenant_id),
        }

        stats['total'] = sum([
            stats['agents'],
            stats['knowledge_domains'],
            stats['personas'],
            stats['tools'],
            stats['functions'],
            stats['departments'],
            stats['roles'],
            stats['user_roles']
        ])

        results[tenant_name] = stats

    # Get global prompts count
    prompts_count = supabase.table('prompts').select('id', count='exact').execute().count or 0

    # Display results in a formatted table
    print("┌─────────────────────────────┬─────────┬───────────┬──────────┬────────┬───────────┬─────────────┬────────┬────────────┬────────┐")
    print("│ Tenant                      │ Agents  │ Knowledge │ Personas │ Tools  │ Functions │ Departments │ Roles  │ User Roles │ Total  │")
    print("├─────────────────────────────┼─────────┼───────────┼──────────┼────────┼───────────┼─────────────┼────────┼────────────┼────────┤")

    for tenant_name in sorted(results.keys(), key=lambda x: results[x]['total'], reverse=True):
        stats = results[tenant_name]
        print(f"│ {tenant_name:27} │ {stats['agents']:7} │ {stats['knowledge_domains']:9} │ {stats['personas']:8} │ "
              f"{stats['tools']:6} │ {stats['functions']:9} │ {stats['departments']:11} │ {stats['roles']:6} │ "
              f"{stats['user_roles']:10} │ {stats['total']:6} │")

    print("└─────────────────────────────┴─────────┴───────────┴──────────┴────────┴───────────┴─────────────┴────────┴────────────┴────────┘")
    print()
    print(f"📝 Global Prompts (shared): {prompts_count:,}")
    print()

    # Detailed breakdown
    print("=" * 100)
    print("📋 DETAILED BREAKDOWN BY TENANT")
    print("=" * 100)
    print()

    for tenant_name in sorted(results.keys()):
        stats = results[tenant_name]
        print(f"🏢 {tenant_name} ({stats['slug']})")
        print(f"   Agents:            {stats['agents']:6,}")
        print(f"   Knowledge Domains: {stats['knowledge_domains']:6,}")
        print(f"   Personas:          {stats['personas']:6,}")
        print(f"   Tools:             {stats['tools']:6,}")
        print(f"   Functions:         {stats['functions']:6,}")
        print(f"   Departments:       {stats['departments']:6,}")
        print(f"   Roles:             {stats['roles']:6,}")
        print(f"   User Roles:        {stats['user_roles']:6,}")
        print(f"   {'─' * 40}")
        print(f"   Total:             {stats['total']:6,}")
        print()

    # Summary by dimension
    print("=" * 100)
    print("📊 SUMMARY BY DIMENSION")
    print("=" * 100)
    print()

    dimensions = ['agents', 'knowledge_domains', 'personas', 'tools', 'functions', 'departments', 'roles', 'user_roles']

    for dim in dimensions:
        total = sum([results[t][dim] for t in results.keys()])
        print(f"{dim.replace('_', ' ').title():20} - Total across all tenants: {total:6,}")

    print(f"{'Prompts (Global)':20} - Shared: {prompts_count:6,}")
    print()

    print("=" * 100)
    print("✅ Distribution report complete")
    print("=" * 100)

if __name__ == '__main__':
    try:
        get_full_tenant_stats()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
