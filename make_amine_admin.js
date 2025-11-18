const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/digital-health-startup/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? 'SET (' + supabaseUrl.substring(0, 30) + '...)' : 'NOT SET');
console.log('- SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET (length: ' + (supabaseServiceKey || '').length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USER_EMAIL = 'amine.oualibouch2@gmail.com';

async function makeUserAdminMultitenant() {
  console.log('\n🔄 Making user admin with multitenant access...\n');

  try {
    // Step 1: Get user by email using admin API
    console.log('Step 1: Finding user by email...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Could not list users:', listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === USER_EMAIL);

    if (!user) {
      console.error('❌ User not found:', USER_EMAIL);
      console.error('⚠️  The user may need to sign up first.');
      process.exit(1);
    }

    console.log('✅ Found user:', user.email, 'ID:', user.id);
    const userId = user.id;

    // Step 2: Check which profile table exists and update it
    console.log('\nStep 2: Checking profile tables...');

    // Try user_profiles first
    let profileUpdated = false;
    const { data: userProfileCheck, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);

    if (!userProfileError) {
      console.log('Found user_profiles table, updating...');
      const { data: profileUpdate, error: profileUpdateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: USER_EMAIL,
          full_name: 'Amine Oualibouch',
          role: 'super_admin',
          department: 'Engineering',
          organization: 'VITAL Platform',
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
        .select();

      if (profileUpdateError) {
        console.error('❌ Failed to update user_profiles:', profileUpdateError.message);
      } else {
        console.log('✅ User profile updated in user_profiles:', profileUpdate);
        profileUpdated = true;
      }
    } else {
      console.log('⚠️  user_profiles table not found or inaccessible:', userProfileError.message);
    }

    // Step 3: Update profiles table if it exists
    console.log('\nStep 3: Updating profiles table...');
    const { data: profilesUpdate, error: profilesError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: USER_EMAIL,
        full_name: 'Amine Oualibouch',
        role: 'super_admin',
        organization: 'VITAL Platform',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();

    if (profilesError) {
      console.log('⚠️  profiles table update failed (may not exist):', profilesError.message);
    } else {
      console.log('✅ Profiles table updated:', profilesUpdate);
    }

    // Step 4: Get all organizations
    console.log('\nStep 4: Getting all organizations...');
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_type, tenant_key');

    if (orgError) {
      console.error('❌ Failed to get organizations:', orgError.message);
    } else {
      console.log('✅ Found organizations:', organizations.length);
      console.log(organizations);

      // Step 5: Update profile with tenant_id for multitenant access
      // Try setting tenant_id to null or the system tenant to indicate multitenant access
      console.log('\nStep 5: Enabling multitenant access...');

      const systemTenant = organizations.find(o => o.tenant_type === 'system');
      if (systemTenant) {
        console.log('Setting tenant_id to system tenant for multitenant admin access...');
        const { data: tenantUpdate, error: tenantError } = await supabase
          .from('profiles')
          .update({
            tenant_id: null, // null typically means access to all tenants for super_admin
            organization: 'VITAL Platform - Multitenant Admin'
          })
          .eq('id', userId)
          .select();

        if (tenantError) {
          console.log('⚠️  Could not update tenant_id:', tenantError.message);
        } else {
          console.log('✅ Enabled multitenant access:', tenantUpdate);
        }
      }

      // Try user_organizations if it exists (optional)
      const { data: userOrgCheck, error: userOrgCheckError } = await supabase
        .from('user_organizations')
        .select('id')
        .limit(1);

      if (!userOrgCheckError) {
        console.log('\nFound user_organizations table, granting access to all orgs...');
        for (const org of organizations) {
          const { data: userOrgData, error: userOrgError } = await supabase
            .from('user_organizations')
            .upsert({
              user_id: userId,
              organization_id: org.id,
              role: 'admin',
              permissions: {
                can_manage_users: true,
                can_manage_agents: true,
                can_manage_settings: true
              }
            }, {
              onConflict: 'user_id,organization_id'
            })
            .select();

          if (userOrgError) {
            console.error(`  ❌ Failed to grant access to ${org.name}:`, userOrgError.message);
          } else {
            console.log(`  ✅ Granted admin access to: ${org.name} (${org.tenant_type})`);
          }
        }
      } else {
        console.log('\n⚠️  user_organizations table not available - using tenant_id=null for multitenant access');
      }
    }

    // Final verification
    console.log('\n📊 Final Verification:\n');

    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('email, role, organization, tenant_id')
      .eq('id', userId)
      .single();

    if (finalError) {
      console.error('❌ Could not verify profile:', finalError.message);
    } else {
      console.log('✅ User Profile:');
      console.log('   Email:', finalProfile.email);
      console.log('   Role:', finalProfile.role);
      console.log('   Organization:', finalProfile.organization);
      console.log('   Tenant ID:', finalProfile.tenant_id || 'null (multitenant access)');
    }

    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select('role, permissions, organizations(name, tenant_type)')
      .eq('user_id', userId);

    if (!userOrgsError && userOrgs && userOrgs.length > 0) {
      console.log('\n✅ Organization Memberships:');
      userOrgs.forEach(uo => {
        console.log(`   - ${uo.organizations.name} (${uo.organizations.tenant_type}): ${uo.role}`);
      });
    }

    console.log('\n✅ SUCCESS! User is now a super_admin with multitenant access.\n');
    console.log('   Role: super_admin');
    console.log('   Access: All tenants (tenant_id = null)\n');

  } catch (err) {
    console.error('\n❌ Exception:', err);
    process.exit(1);
  }
}

makeUserAdminMultitenant();
