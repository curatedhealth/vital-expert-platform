const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createHichamUser() {
  try {
    console.log('🔧 Creating user for hicham.naim@curated.health...');
    
    // Create a user with your email
    const { data, error } = await supabase.auth.signUp({
      email: 'hicham.naim@curated.health',
      password: 'password123',
      options: {
        data: {
          full_name: 'Hicham Naim',
          organization: 'Curated Health'
        }
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      
      // If user already exists, try to sign in
      if (error.message.includes('already registered')) {
        console.log('👤 User already exists, testing login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'hicham.naim@curated.health',
          password: 'password123'
        });

        if (signInError) {
          console.error('❌ Login failed:', signInError.message);
        } else {
          console.log('✅ Login successful!');
          console.log('📧 Email:', signInData.user.email);
          console.log('🆔 User ID:', signInData.user.id);
        }
      }
      return;
    }

    if (data.user) {
      console.log('✅ User created successfully!');
      console.log('📧 Email:', data.user.email);
      console.log('🆔 User ID:', data.user.id);
      console.log('📝 User metadata:', data.user.user_metadata);
    }

    console.log('\n🎯 Your Credentials:');
    console.log('Email: hicham.naim@curated.health');
    console.log('Password: password123');
    console.log('\n🌐 Login URL: https://vital.expert/login');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createHichamUser();
