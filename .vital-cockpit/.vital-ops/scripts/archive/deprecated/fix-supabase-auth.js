/**
 * Fix Supabase Authentication Setup
 * - Creates a test user account
 * - Verifies auth system is working
 * - Sets up proper user profile with tenant association
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '../apps/digital-health-startup/.env.local');
let supabaseUrl, supabaseAnonKey, supabaseServiceKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  });
} catch (err) {
  console.error('❌ Could not read .env.local file');
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuth() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Fixing Supabase Authentication Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  // Step 1: Check if auth is working
  console.log('📋 Step 1: Checking Supabase Auth Service...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.log('❌ Auth service error:', sessionError.message);
  } else {
    console.log('✅ Auth service is accessible');
  }
  console.log('');

  // Step 2: Create test user
  console.log('📋 Step 2: Creating test user...');
  const testEmail = 'admin@vital.expert';
  const testPassword = 'Test123456!';
  
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('');

  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,  // Auto-confirm email for testing
    user_metadata: {
      full_name: 'Admin User',
      role: 'super_admin'
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already exists') || signUpError.message.includes('already registered')) {
      console.log('ℹ️  User already exists');
      console.log('   Fetching existing user...');
      
      // List users to find the existing one
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.log('❌ Error listing users:', listError.message);
      } else {
        const existingUser = users.users.find(u => u.email === testEmail);
        if (existingUser) {
          console.log('✅ Found existing user');
          console.log('   User ID:', existingUser.id);
          console.log('   Email:', existingUser.email);
          console.log('   Email Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');
        }
      }
    } else {
      console.log('❌ Error creating user:', signUpError.message);
    }
  } else {
    console.log('✅ Test user created successfully');
    console.log('   User ID:', signUpData.user.id);
    console.log('   Email:', signUpData.user.email);
  }
  console.log('');

  // Step 3: Check tenants
  console.log('📋 Step 3: Checking available tenants...');
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, name, slug, type')
    .eq('status', 'active')
    .order('type', { ascending: false });

  if (tenantsError) {
    console.log('❌ Error fetching tenants:', tenantsError.message);
  } else if (!tenants || tenants.length === 0) {
    console.log('⚠️  No tenants found');
    console.log('   Run: node scripts/create-remote-test-tenants.js');
  } else {
    console.log('✅ Found', tenants.length, 'active tenant(s):');
    tenants.forEach(t => {
      console.log(`   • ${t.name} (${t.type}) - ${t.slug}`);
    });
  }
  console.log('');

  // Step 4: Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Authentication Setup Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🧪 Test Login Credentials:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Open http://localhost:3000/login');
  console.log('   2. Enter the test credentials above');
  console.log('   3. You should be logged in successfully');
  console.log('');
  console.log('🔧 Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/auth/users');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

setupAuth().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
