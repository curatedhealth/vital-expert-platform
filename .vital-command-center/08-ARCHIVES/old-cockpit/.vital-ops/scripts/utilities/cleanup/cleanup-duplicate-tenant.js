/**
 * Delete Duplicate "Digital Health Startup" Tenant
 * Keep only: Digital Health Startups, Pharma Companies, VITAL Platform
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateTenant() {
  console.log('🔗 Connected to REMOTE Supabase:', supabaseUrl);
  console.log('');

  // Show all tenants before deletion
  console.log('📊 Current tenants in database:');
  const { data: beforeTenants } = await supabase
    .from('tenants')
    .select('id, name, slug, type, status')
    .eq('status', 'active')
    .order('name');
  
  console.table(beforeTenants);
  console.log('');

  // Delete the duplicate "Digital Health Startup" tenant
  console.log('🗑️  Deleting "Digital Health Startup" tenant (slug: digital-health-startup)...');
  const { error: deleteError } = await supabase
    .from('tenants')
    .delete()
    .eq('slug', 'digital-health-startup')
    .eq('id', '0a66b229-42b4-456a-a8cd-beef90261481');

  if (deleteError) {
    console.error('❌ Error deleting tenant:', deleteError.message);
  } else {
    console.log('✅ Successfully deleted duplicate tenant');
  }

  console.log('');
  console.log('📊 Tenants after cleanup:');
  const { data: afterTenants } = await supabase
    .from('tenants')
    .select('id, name, slug, type, status')
    .eq('status', 'active')
    .order('name');
  
  console.table(afterTenants);

  console.log('');
  console.log('✅ Cleanup complete!');
  console.log('');
  console.log('Final tenant list:');
  console.log('1. VITAL Platform (platform) - vital-platform');
  console.log('2. Digital Health Startups (client) - digital-health-startups ⭐ Tenant 1');
  console.log('3. Pharma Companies (client) - pharma ⭐ Tenant 2');
}

cleanupDuplicateTenant().catch(console.error);
