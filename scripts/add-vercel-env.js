#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * Interactive script to add environment variables to Vercel
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 VITAL Expert - Vercel Environment Variables Setup');
console.log('====================================================\n');

async function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

async function installVercelCLI() {
  console.log('📦 Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install Vercel CLI:', error.message);
    return false;
  }
}

async function loginToVercel() {
  console.log('🔐 Logging into Vercel...');
  try {
    execSync('vercel login', { stdio: 'inherit' });
    console.log('✅ Logged into Vercel successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to login to Vercel:', error.message);
    return false;
  }
}

async function addEnvironmentVariable(name, value, description) {
  try {
    console.log(`\n📝 Adding ${name}...`);
    console.log(`   Description: ${description}`);
    
    // Use echo to pipe the value to vercel env add
    const command = `echo "${value}" | vercel env add ${name}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ ${name} added successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add ${name}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    // Check if Vercel CLI is installed
    const hasVercelCLI = await checkVercelCLI();
    if (!hasVercelCLI) {
      const install = await question('Vercel CLI not found. Install it now? (y/n): ');
      if (install.toLowerCase() === 'y') {
        const installed = await installVercelCLI();
        if (!installed) {
          console.log('❌ Cannot proceed without Vercel CLI');
          process.exit(1);
        }
      } else {
        console.log('❌ Vercel CLI is required. Please install it manually: npm install -g vercel');
        process.exit(1);
      }
    }

    // Login to Vercel
    const loggedIn = await loginToVercel();
    if (!loggedIn) {
      console.log('❌ Cannot proceed without Vercel login');
      process.exit(1);
    }

    console.log('\n🔧 Environment Variables Setup');
    console.log('===============================\n');

    // Required variables
    console.log('📋 Required Variables:');
    console.log('');

    const supabaseKey = await question('Enter Supabase Service Role Key: ');
    if (supabaseKey.trim()) {
      await addEnvironmentVariable(
        'SUPABASE_SERVICE_ROLE_KEY',
        supabaseKey.trim(),
        'Supabase service role key for database access'
      );
    }

    const openaiKey = await question('Enter OpenAI API Key: ');
    if (openaiKey.trim()) {
      await addEnvironmentVariable(
        'OPENAI_API_KEY',
        openaiKey.trim(),
        'OpenAI API key for AI functionality'
      );
    }

    // Optional Redis variables
    console.log('\n🔧 Optional - Redis Caching:');
    console.log('');

    const enableRedis = await question('Enable Redis caching? (y/n): ');
    if (enableRedis.toLowerCase() === 'y') {
      const redisUrl = await question('Enter Upstash Redis REST URL: ');
      if (redisUrl.trim()) {
        await addEnvironmentVariable(
          'UPSTASH_REDIS_REST_URL',
          redisUrl.trim(),
          'Upstash Redis URL for caching'
        );
      }

      const redisToken = await question('Enter Upstash Redis REST Token: ');
      if (redisToken.trim()) {
        await addEnvironmentVariable(
          'UPSTASH_REDIS_REST_TOKEN',
          redisToken.trim(),
          'Upstash Redis token for authentication'
        );
      }
    }

    // Optional LangSmith variables
    console.log('\n🔍 Optional - LangSmith Monitoring:');
    console.log('');

    const enableLangSmith = await question('Enable LangSmith monitoring? (y/n): ');
    if (enableLangSmith.toLowerCase() === 'y') {
      await addEnvironmentVariable(
        'LANGCHAIN_TRACING_V2',
        'true',
        'Enable LangSmith tracing'
      );

      const langsmithKey = await question('Enter LangSmith API Key: ');
      if (langsmithKey.trim()) {
        await addEnvironmentVariable(
          'LANGCHAIN_API_KEY',
          langsmithKey.trim(),
          'LangSmith API key for monitoring'
        );
      }

      await addEnvironmentVariable(
        'LANGCHAIN_PROJECT',
        'vital-path-production',
        'LangSmith project name'
      );
    }

    console.log('\n🎉 Environment Variables Setup Complete!');
    console.log('==========================================\n');

    console.log('📋 Next Steps:');
    console.log('1. Redeploy your application: vercel --prod');
    console.log('2. Test the application functionality');
    console.log('3. Check monitoring dashboards');
    console.log('');

    console.log('🔗 Useful Links:');
    console.log('• Vercel Dashboard: https://vercel.com/dashboard');
    console.log('• Upstash Console: https://console.upstash.com/');
    console.log('• LangSmith Dashboard: https://smith.langchain.com/');
    console.log('• Supabase Dashboard: https://supabase.com/dashboard');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
