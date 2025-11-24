const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Create a test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@vitalexpert.com',
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Test User',
          organization: 'VITAL Expert'
        }
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return;
    }

    if (data.user) {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email:', data.user.email);
      console.log('🆔 User ID:', data.user.id);
      console.log('📝 User metadata:', data.user.user_metadata);
      
      // Create a profile for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || 'Test User',
          organization: data.user.user_metadata?.organization || 'VITAL Expert',
          role: 'user'
        })
        .select();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
      } else {
        console.log('✅ User profile created successfully!');
        console.log('👤 Profile data:', profileData);
      }
    }

    console.log('\n🎯 Test Credentials:');
    console.log('Email: test@vitalexpert.com');
    console.log('Password: testpassword123');
    console.log('\n🌐 Login URL: https://vital.expert/login');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createTestUser();