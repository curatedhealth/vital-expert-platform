const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function tryDirectLogin() {
  try {
    console.log('🔧 Attempting direct login without email confirmation...');
    
    // Try to login with existing users
    const testUsers = [
      { email: 'hicham.naim@curated.health', password: 'password123' },
      { email: 'admin@vitalexpert.com', password: 'password123' },
      { email: 'demo@vitalexpert.com', password: 'password123' },
      { email: 'test@vitalexpert.com', password: 'testpassword123' }
    ];
    
    for (const user of testUsers) {
      console.log(`\n🔍 Trying login: ${user.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`❌ ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ SUCCESS! Login worked with ${user.email}`);
        console.log('📧 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        console.log('🆔 User ID:', data.user.id);
        console.log('🔑 Session active:', data.session ? 'Yes' : 'No');
        
        console.log('\n🎯 WORKING CREDENTIALS:');
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log('\n🌐 Login URL: https://vital.expert/login');
        return;
      }
    }
    
    console.log('\n⚠️ All logins failed. Email confirmation is required.');
    console.log('💡 Solutions:');
    console.log('1. Check spam/junk folder for confirmation emails');
    console.log('2. Try a different email provider (Gmail, Yahoo, etc.)');
    console.log('3. Contact Supabase admin to disable email confirmation');
    console.log('4. Use a different Supabase project without email confirmation');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

tryDirectLogin();
