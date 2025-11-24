#!/usr/bin/env node
/**
 * Enable Public Read Access to Tenants Table
 * Required for subdomain-based tenant detection in middleware
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableTenantPublicRead() {
  console.log('🔧 Enabling public read access to tenants table...\n');

  // Create RLS policy to allow anonymous users to SELECT active tenants
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Drop existing policy if it exists
      DROP POLICY IF EXISTS "Enable read access for active tenants" ON public.tenants;

      -- Create policy to allow anonymous reads of active tenants (id, name, slug only)
      CREATE POLICY "Enable read access for active tenants"
      ON public.tenants
      FOR SELECT
      TO anon
      USING (status = 'active');

      -- Ensure RLS is enabled on tenants table
      ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
    `
  });

  if (error) {
    console.error('❌ Error creating RLS policy:', error);
    console.log('\n📝 You need to manually run this SQL in Supabase SQL Editor:\n');
    console.log(`
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for active tenants" ON public.tenants;

-- Create policy to allow anonymous reads of active tenants
CREATE POLICY "Enable read access for active tenants"
ON public.tenants
FOR SELECT
TO anon
USING (status = 'active');

-- Ensure RLS is enabled on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
    `);
    process.exit(1);
  }

  console.log('✅ RLS policy created successfully!');
  console.log('✅ Anonymous users can now read active tenants\n');

  // Verify the policy works
  console.log('🧪 Testing policy with ANON key...\n');

  const anonClient = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: tenants, error: testError } = await anonClient
    .from('tenants')
    .select('id, name, slug, status')
    .eq('status', 'active');

  if (testError) {
    console.error('❌ Test failed:', testError);
    process.exit(1);
  }

  console.log(`✅ Successfully queried ${tenants?.length || 0} tenants with ANON key:`);
  console.table(tenants);

  console.log('\n✅ Setup complete! Subdomain detection should now work.');
  console.log('🔄 Restart your dev server to test subdomain routing.');
}

enableTenantPublicRead().catch(console.error);
