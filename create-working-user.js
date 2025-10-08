const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWorkingUser() {
  try {
    console.log('🔧 Creating a working user account...');
    
    // Try to create user with a different email that might work
    const testEmails = [
      'admin@vitalexpert.com',
      'demo@vitalexpert.com', 
      'user@vitalexpert.com'
    ];
    
    for (const email of testEmails) {
      console.log(`\n🔍 Trying to create user: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            organization: 'VITAL Expert'
          }
        }
      });

      if (error) {
        console.log(`❌ ${email}: ${error.message}`);
        
        // If user exists, try to login
        if (error.message.includes('already registered')) {
          console.log(`👤 ${email} already exists, testing login...`);
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: 'password123'
          });

          if (loginError) {
            console.log(`❌ Login failed: ${loginError.message}`);
          } else {
            console.log(`✅ Login successful with ${email}!`);
            console.log('📧 Email confirmed:', loginData.user.email_confirmed_at ? 'Yes' : 'No');
            
            if (loginData.user.email_confirmed_at) {
              console.log('\n🎯 WORKING CREDENTIALS:');
              console.log(`Email: ${email}`);
              console.log('Password: password123');
              console.log('\n🌐 Login URL: https://vital.expert/login');
              return;
            }
          }
        }
      } else {
        console.log(`✅ User created: ${email}`);
        console.log('📧 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        
        if (data.user.email_confirmed_at) {
          console.log('\n🎯 WORKING CREDENTIALS:');
          console.log(`Email: ${email}`);
          console.log('Password: password123');
          console.log('\n🌐 Login URL: https://vital.expert/login');
          return;
        }
      }
    }
    
    console.log('\n⚠️ All users require email confirmation. You may need to:');
    console.log('1. Check your email for confirmation links');
    console.log('2. Or disable email confirmation in Supabase dashboard');
    console.log('3. Or use a different email that might be auto-confirmed');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createWorkingUser();
