/**
 * Create Test Tenants in REMOTE Supabase Database
 * Run with: node scripts/create-remote-test-tenants.js
 * Schema: Uses 'status' column (not 'is_active')
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to read .env.local from apps/digital-health-startup
const envPath = path.join(__dirname, '../apps/digital-health-startup/.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = line.split('=')[1].trim();
      }
    });
  } catch (err) {
    console.error('❌ Could not read .env.local file');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set environment variables or ensure .env.local exists');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTenants() {
  console.log('🔗 Connected to REMOTE Supabase:', supabaseUrl);
  console.log('');

  // Tenant 1: Digital Health Startups
  console.log('📝 Creating Tenant 1: Digital Health Startups...');
  const { data: tenant1, error: error1 } = await supabase
    .from('tenants')
    .upsert({
      name: 'Digital Health Startups',
      slug: 'digital-health-startups',
      type: 'client',
      status: 'active',
      subscription_tier: 'enterprise',
      subscription_status: 'active',
      industry: 'digital-health',
      metadata: {
        description: 'Digital health and medtech startups community',
        features: ['telemedicine', 'wearables', 'AI-diagnostics'],
        plan: 'enterprise'
      }
    }, {
      onConflict: 'slug'
    })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error creating tenant 1:', error1.message);
  } else {
    console.log('✅ Tenant 1 created successfully');
    console.log('   ID:', tenant1.id);
    console.log('   Slug:', tenant1.slug);
  }

  // Tenant 2: Pharma Companies
  console.log('');
  console.log('📝 Creating Tenant 2: Pharma Companies...');
  const { data: tenant2, error: error2 } = await supabase
    .from('tenants')
    .upsert({
      name: 'Pharma Companies',
      slug: 'pharma',
      type: 'client',
      status: 'active',
      subscription_tier: 'enterprise',
      subscription_status: 'active',
      industry: 'pharmaceutical',
      metadata: {
        description: 'Pharmaceutical companies and drug manufacturers',
        features: ['clinical-trials', 'regulatory', 'market-access'],
        plan: 'enterprise'
      }
    }, {
      onConflict: 'slug'
    })
    .select()
    .single();

  if (error2) {
    console.error('❌ Error creating tenant 2:', error2.message);
  } else {
    console.log('✅ Tenant 2 created successfully');
    console.log('   ID:', tenant2.id);
    console.log('   Slug:', tenant2.slug);
  }

  // Verify all tenants
  console.log('');
  console.log('🔍 Verifying all tenants in REMOTE database...');
  const { data: allTenants, error: error3 } = await supabase
    .from('tenants')
    .select('id, name, slug, type, status')
    .eq('status', 'active')
    .order('name');

  if (error3) {
    console.error('❌ Error fetching tenants:', error3.message);
  } else {
    console.log('');
    console.log('📊 All active tenants in REMOTE database:');
    console.table(allTenants);
  }

  console.log('');
  console.log('✅ Test tenants created successfully in REMOTE Supabase!');
  console.log('');
  console.log('🧪 Next steps:');
  console.log('');
  console.log('1. Edit /etc/hosts:');
  console.log('   sudo nano /etc/hosts');
  console.log('   Add: 127.0.0.1 digital-health-startups.localhost');
  console.log('   Add: 127.0.0.1 pharma.localhost');
  console.log('');
  console.log('2. Test subdomain routing:');
  console.log('   curl -v http://digital-health-startups.localhost:3000 2>&1 | grep "x-tenant-id"');
  console.log('   curl -v http://pharma.localhost:3000 2>&1 | grep "x-tenant-id"');
  console.log('');
  console.log('3. Open in browser:');
  console.log('   http://localhost:3000 (Platform Tenant)');
  console.log('   http://digital-health-startups.localhost:3000');
  console.log('   http://pharma.localhost:3000');
}

createTestTenants().catch(console.error);
