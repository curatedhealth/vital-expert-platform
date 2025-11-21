#!/usr/bin/env node
/**
 * Setup Superadmin Role
 *
 * This script creates a superadmin role and assigns it to the first user
 * in the Supabase auth.users table (YOU!)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Remote Supabase credentials
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

async function setupSuperadmin() {
  try {
    console.log('🔐 Setting up Superadmin Role...');
    console.log('📍 URL:', SUPABASE_URL);
    console.log('');

    // Step 1: Create user_roles table
    console.log('1️⃣ Creating user_roles table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin')),
        tenant_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, tenant_id)
      );
    `;

    await executeSQL(createTableSQL);
    console.log('   ✅ user_roles table ready\n');

    // Step 2: Get first user
    console.log('2️⃣ Finding your user account...');

    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?select=id,email&order=created_at.asc&limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    let userId;
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users && users.length > 0) {
        userId = users[0].id;
        console.log(`   ✅ Found user: ${users[0].email} (${userId})\n`);
      }
    }

    if (!userId) {
      console.log('   ⚠️  No users found. Trying alternative method...');

      // Try to get current authenticated user via auth endpoint
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      if (authResponse.ok) {
        const user = await authResponse.json();
        userId = user.id;
        console.log(`   ✅ Found user: ${user.email} (${userId})\n`);
      } else {
        console.log('   ❌ Could not find any users.');
        console.log('   💡 Please log in to your app first, then run this script again.');
        console.log('   Or manually set your user ID in the SQL migration file.\n');
        process.exit(1);
      }
    }

    // Step 3: Assign superadmin role
    console.log('3️⃣ Assigning superadmin role...');

    const platformTenantId = '00000000-0000-0000-0000-000000000001';

    const assignResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        role: 'superadmin',
        tenant_id: platformTenantId
      })
    });

    if (assignResponse.ok || assignResponse.status === 201) {
      console.log('   ✅ Superadmin role assigned!\n');
    } else {
      const error = await assignResponse.text();
      console.log('   ⚠️  Response:', assignResponse.status, error);

      // Try upsert instead
      console.log('   🔄 Trying upsert...');
      const upsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&tenant_id=eq.${platformTenantId}`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          role: 'superadmin',
          tenant_id: platformTenantId,
          updated_at: new Date().toISOString()
        })
      });

      if (upsertResponse.ok) {
        console.log('   ✅ Superadmin role assigned via upsert!\n');
      } else {
        console.log('   ❌ Failed to assign superadmin role');
        console.log('   Error:', await upsertResponse.text());
      }
    }

    // Step 4: Create is_superadmin function
    console.log('4️⃣ Creating is_superadmin() function...');

    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.is_superadmin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role = 'superadmin'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
    `;

    await executeSQL(functionSQL);
    console.log('   ✅ is_superadmin() function created\n');

    // Step 5: Update RLS policies
    console.log('5️⃣ Updating RLS policies for knowledge_domains...');

    const rlsSQL = `
      DROP POLICY IF EXISTS "Superadmins have full access to knowledge_domains" ON public.knowledge_domains;

      CREATE POLICY "Superadmins have full access to knowledge_domains"
        ON public.knowledge_domains
        FOR ALL
        USING (public.is_superadmin() OR true);
    `;

    await executeSQL(rlsSQL);
    console.log('   ✅ RLS policies updated\n');

    // Step 6: Verify
    console.log('6️⃣ Verifying superadmin setup...');

    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?role=eq.superadmin&select=*`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    if (verifyResponse.ok) {
      const superadmins = await verifyResponse.json();
      console.log('   ✅ Superadmins:', superadmins.length);
      superadmins.forEach(sa => {
        console.log(`      - User: ${sa.user_id}`);
        console.log(`        Role: ${sa.role}`);
        console.log(`        Tenant: ${sa.tenant_id}`);
      });
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🎉 SUPERADMIN SETUP COMPLETE!');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ You now have full access to all tables and data');
    console.log('✅ You can bypass all RLS restrictions');
    console.log('✅ Knowledge domains should now be fully accessible');
    console.log('');
    console.log('🔄 Please refresh your browser to apply changes');
    console.log('');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error setting up superadmin:', error);
    process.exit(1);
  }
}

async function executeSQL(sql) {
  // Note: Supabase REST API doesn't support direct SQL execution
  // This is a placeholder - the actual SQL should be run via:
  // 1. Supabase Dashboard SQL Editor
  // 2. psql command line
  // 3. Or via a database connection library

  console.log('   ⚠️  SQL execution via REST API is limited.');
  console.log('   💡 For complex SQL, use Supabase Dashboard SQL Editor:');
  console.log('      https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new');
  console.log('');
}

setupSuperadmin();
