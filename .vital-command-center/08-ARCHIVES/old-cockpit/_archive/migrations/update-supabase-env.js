#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Supabase Environment Setup');
console.log('============================');
console.log('');
console.log('To get your Supabase credentials:');
console.log('1. Go to https://supabase.com');
console.log('2. Create a new project or select existing one');
console.log('3. Go to Settings > API');
console.log('4. Copy your Project URL and anon public key');
console.log('');

rl.question('Enter your Supabase Project URL (e.g., https://your-project.supabase.co): ', (supabaseUrl) => {
  rl.question('Enter your Supabase Anon Key: ', (anonKey) => {
    console.log('');
    console.log('📝 Environment Variables to Update:');
    console.log('====================================');
    console.log('');
    console.log('For Vercel CLI:');
    console.log(`vercel env add NEXT_PUBLIC_SUPABASE_URL "${supabaseUrl}"`);
    console.log(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "${anonKey}"`);
    console.log('');
    console.log('For local development (.env.local):');
    console.log(`NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl}"`);
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`);
    console.log('');
    console.log('🔐 Don\'t forget to:');
    console.log('1. Enable email authentication in Supabase Auth settings');
    console.log('2. Configure your site URL in Supabase Auth settings');
    console.log('3. Set up email templates if needed');
    console.log('');
    
    rl.close();
  });
});
