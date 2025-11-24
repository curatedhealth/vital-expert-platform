/**
 * Create Super Admin Account
 *
 * This script creates a super admin account in Supabase
 * Usage: NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/create-super-admin.js
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SuperAdminData {
  email: string;
  password: string;
  fullName: string;
}

async function createSuperAdmin(data: SuperAdminData) {
  console.log('\n🚀 Creating Super Admin Account...\n');
  console.log(`Email: ${data.email}`);
  console.log(`Name: ${data.fullName}`);
  console.log('─'.repeat(50));

  try {
    // Step 1: Create auth user
    console.log('\n1️⃣ Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: data.fullName,
      },
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists. Finding existing user...');

        // Get user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find((u) => u.email === data.email);

        if (!existingUser) {
          throw new Error('User exists but cannot be found');
        }

        console.log(`✅ Found existing user: ${existingUser.id}`);

        // Update profile to super_admin
        console.log('\n2️⃣ Updating profile to super_admin...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'super_admin' })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (profileError) {
          // Try to create profile if it doesn't exist
          console.log('⚠️  Profile not found. Creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: data.email,
              full_name: data.fullName,
              role: 'super_admin',
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          console.log('✅ Profile created with super_admin role');
        } else {
          console.log('✅ Profile updated to super_admin role');
        }

        console.log('\n' + '─'.repeat(50));
        console.log('\n🎉 Super Admin Account Ready!\n');
        console.log(`📧 Email: ${data.email}`);
        console.log(`🔑 Password: ${data.password}`);
        console.log(`👤 Role: super_admin`);
        console.log(`🆔 User ID: ${existingUser.id}`);
        console.log('\n' + '─'.repeat(50));
        console.log('\n✨ You can now login at: http://localhost:3002/auth/login\n');

        return;
      }

      throw authError;
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Step 2: Create or update profile
    console.log('\n2️⃣ Creating profile with super_admin role...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        role: 'super_admin',
        metadata: {
          created_by: 'create-super-admin-script',
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (profileError) {
      // If insert fails, try update
      console.log('⚠️  Insert failed. Trying update...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin', full_name: data.fullName })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Profile updated to super_admin role');
    } else {
      console.log('✅ Profile created with super_admin role');
    }

    // Success!
    console.log('\n' + '─'.repeat(50));
    console.log('\n🎉 Super Admin Account Created Successfully!\n');
    console.log(`📧 Email: ${data.email}`);
    console.log(`🔑 Password: ${data.password}`);
    console.log(`👤 Role: super_admin`);
    console.log(`🆔 User ID: ${authData.user.id}`);
    console.log('\n' + '─'.repeat(50));
    console.log('\n✨ You can now login at: http://localhost:3002/auth/login\n');

  } catch (error: any) {
    console.error('\n❌ Error creating super admin:');
    console.error(error.message || error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Get data from command line or use defaults
  const email = args[0] || process.env.ADMIN_EMAIL || 'admin@vitalexpert.com';
  const password = args[1] || process.env.ADMIN_PASSWORD || 'VitalAdmin2025!';
  const fullName = args[2] || process.env.ADMIN_NAME || 'VITAL Administrator';

  await createSuperAdmin({
    email,
    password,
    fullName,
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { createSuperAdmin };
