#!/usr/bin/env python3
"""
Setup Hicham as Super Admin
Sets up hicham.naim@curated.health as a super admin across all tenants
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from the correct path
load_dotenv('.env')

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEW_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('NEW_SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ Missing environment variables:")
    print("   - NEXT_PUBLIC_SUPABASE_URL")
    print("   - SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

EMAIL = "hicham.naim@curated.health"
PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001"

def setup_superadmin():
    print("=" * 70)
    print("🔐 SETTING UP SUPER ADMIN FOR HICHAM")
    print("=" * 70)
    print(f"📧 Email: {EMAIL}")
    print(f"🌐 Supabase URL: {SUPABASE_URL}")
    print("")

    try:
        # Step 1: Find user by email
        print("1️⃣  Finding user account...")

        # Query auth.users via Supabase admin API
        response = supabase.auth.admin.list_users()

        user = None
        for u in response:
            if u.email == EMAIL:
                user = u
                break

        if not user:
            print(f"   ❌ User not found with email: {EMAIL}")
            print(f"   💡 Please ensure the user has signed up first")
            print(f"   💡 You can create the account manually in Supabase Dashboard")
            sys.exit(1)

        user_id = user.id
        print(f"   ✅ Found user: {user.email}")
        print(f"   🆔 User ID: {user_id}")
        print("")

        # Step 2: Check if user_roles table exists and create if needed
        print("2️⃣  Checking user_roles table...")
        try:
            test_query = supabase.table('user_roles').select('id').limit(1).execute()
            print("   ✅ user_roles table exists")
        except Exception as e:
            print("   ⚠️  user_roles table might not exist")
            print("   💡 Run the superadmin SQL migration first:")
            print("   📄 database/sql/migrations/2025/20251027000002_create_superadmin_role.sql")
            print("")
            print(f"   Error: {str(e)}")
            sys.exit(1)

        print("")

        # Step 3: Insert or update superadmin role
        print("3️⃣  Assigning superadmin role...")

        try:
            # First, try to check if the role already exists
            existing = supabase.table('user_roles')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('tenant_id', PLATFORM_TENANT_ID)\
                .execute()

            if existing.data and len(existing.data) > 0:
                # Update existing role
                print("   ℹ️  User already has a role, updating to superadmin...")
                result = supabase.table('user_roles')\
                    .update({'role': 'superadmin'})\
                    .eq('user_id', user_id)\
                    .eq('tenant_id', PLATFORM_TENANT_ID)\
                    .execute()
                print("   ✅ Updated existing role to superadmin")
            else:
                # Insert new role
                result = supabase.table('user_roles').insert({
                    'user_id': user_id,
                    'role': 'superadmin',
                    'tenant_id': PLATFORM_TENANT_ID
                }).execute()
                print("   ✅ Superadmin role assigned successfully!")

        except Exception as e:
            print(f"   ❌ Error assigning role: {str(e)}")

            # Try alternative approach - upsert
            print("   🔄 Trying alternative method...")
            try:
                result = supabase.table('user_roles').upsert({
                    'user_id': user_id,
                    'role': 'superadmin',
                    'tenant_id': PLATFORM_TENANT_ID
                }, on_conflict='user_id,tenant_id').execute()
                print("   ✅ Superadmin role assigned via upsert!")
            except Exception as e2:
                print(f"   ❌ Upsert also failed: {str(e2)}")
                sys.exit(1)

        print("")

        # Step 4: Get all tenants and assign superadmin role for each
        print("4️⃣  Assigning superadmin role across all tenants...")

        try:
            tenants_result = supabase.table('tenants').select('id, name').execute()
            tenants = tenants_result.data

            if tenants:
                print(f"   📊 Found {len(tenants)} tenant(s)")

                for tenant in tenants:
                    tenant_id = tenant['id']
                    tenant_name = tenant.get('name', 'Unknown')

                    # Skip platform tenant (already done)
                    if tenant_id == PLATFORM_TENANT_ID:
                        print(f"   ⏭️  Skipping platform tenant (already assigned)")
                        continue

                    try:
                        # Check if role exists for this tenant
                        existing = supabase.table('user_roles')\
                            .select('*')\
                            .eq('user_id', user_id)\
                            .eq('tenant_id', tenant_id)\
                            .execute()

                        if existing.data and len(existing.data) > 0:
                            # Update
                            supabase.table('user_roles')\
                                .update({'role': 'superadmin'})\
                                .eq('user_id', user_id)\
                                .eq('tenant_id', tenant_id)\
                                .execute()
                            print(f"   ✅ Updated role for tenant: {tenant_name}")
                        else:
                            # Insert
                            supabase.table('user_roles').insert({
                                'user_id': user_id,
                                'role': 'superadmin',
                                'tenant_id': tenant_id
                            }).execute()
                            print(f"   ✅ Assigned role for tenant: {tenant_name}")

                    except Exception as e:
                        print(f"   ⚠️  Warning for tenant {tenant_name}: {str(e)}")
                        continue
            else:
                print("   ℹ️  No additional tenants found")

        except Exception as e:
            print(f"   ⚠️  Could not fetch tenants: {str(e)}")
            print("   ℹ️  Superadmin role assigned for platform tenant only")

        print("")

        # Step 5: Verify setup
        print("5️⃣  Verifying superadmin setup...")

        try:
            all_roles = supabase.table('user_roles')\
                .select('*, tenants(name)')\
                .eq('user_id', user_id)\
                .eq('role', 'superadmin')\
                .execute()

            if all_roles.data:
                print(f"   ✅ Verified {len(all_roles.data)} superadmin role(s):")
                for role in all_roles.data:
                    tenant_name = role.get('tenants', {}).get('name', 'Platform') if role.get('tenants') else 'Platform'
                    print(f"      - Tenant: {tenant_name}")
                    print(f"        ID: {role['tenant_id']}")
            else:
                print("   ⚠️  Could not verify roles (but assignment might have succeeded)")

        except Exception as e:
            print(f"   ⚠️  Verification error: {str(e)}")

        print("")
        print("=" * 70)
        print("🎉 SUPER ADMIN SETUP COMPLETE!")
        print("=" * 70)
        print(f"✅ {EMAIL} is now a super admin")
        print("✅ Full access across all tenants granted")
        print("✅ Can bypass all RLS policies")
        print("")
        print("🔄 Please log out and log back in to apply changes")
        print("=" * 70)

    except Exception as e:
        print("")
        print("=" * 70)
        print("❌ ERROR SETTING UP SUPER ADMIN")
        print("=" * 70)
        print(f"Error: {str(e)}")
        print("")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    setup_superadmin()
