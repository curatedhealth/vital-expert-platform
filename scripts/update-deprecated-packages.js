#!/usr/bin/env node

/**
 * Update Deprecated Packages Script
 * 
 * This script helps migrate from deprecated packages to their modern alternatives.
 * Run this after updating package.json to ensure all code is updated accordingly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting deprecated packages migration...\n');

// 1. Remove deprecated Supabase auth helpers
console.log('📦 Removing deprecated Supabase auth helpers...');
try {
  execSync('npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared', { stdio: 'inherit' });
  console.log('✅ Removed deprecated Supabase auth helpers\n');
} catch (error) {
  console.log('⚠️  Some packages may not be installed, continuing...\n');
}

// 2. Install updated packages
console.log('📦 Installing updated packages...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Updated packages installed\n');
} catch (error) {
  console.error('❌ Error installing packages:', error.message);
  process.exit(1);
}

// 3. Check for auth helper usage that needs migration
console.log('🔍 Checking for deprecated auth helper usage...');
const authHelperFiles = [
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/middleware.ts',
  'src/app/api/auth/route.ts',
  'src/app/api/auth/callback/route.ts'
];

let foundDeprecatedUsage = false;
authHelperFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@supabase/auth-helpers')) {
      console.log(`⚠️  Found deprecated auth helper usage in: ${file}`);
      foundDeprecatedUsage = true;
    }
  }
});

if (foundDeprecatedUsage) {
  console.log('\n📝 Manual migration required:');
  console.log('   Replace @supabase/auth-helpers-nextjs with @supabase/ssr');
  console.log('   See: https://supabase.com/docs/guides/auth/server-side/nextjs\n');
}

// 4. Check ESLint configuration
console.log('🔍 Checking ESLint configuration...');
const eslintConfigFiles = [
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslintrc.cjs',
  'eslint.config.js'
];

let foundEslintConfig = false;
eslintConfigFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`📄 Found ESLint config: ${file}`);
    foundEslintConfig = true;
  }
});

if (foundEslintConfig) {
  console.log('\n📝 ESLint v9 migration notes:');
  console.log('   - ESLint v9 uses flat config by default');
  console.log('   - Consider migrating to eslint.config.js');
  console.log('   - Some plugins may need updates for v9 compatibility\n');
}

// 5. Run linting to check for issues
console.log('🔍 Running ESLint to check for issues...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ ESLint passed\n');
} catch (error) {
  console.log('⚠️  ESLint found issues, check output above\n');
}

// 6. Run type checking
console.log('🔍 Running TypeScript type checking...');
try {
  execSync('npm run type-check', { stdio: 'pipe' });
  console.log('✅ TypeScript type checking passed\n');
} catch (error) {
  console.log('⚠️  TypeScript found issues, check output above\n');
}

console.log('🎉 Deprecated packages migration completed!');
console.log('\n📋 Next steps:');
console.log('1. Review any ESLint or TypeScript errors');
console.log('2. Update auth helper imports to use @supabase/ssr');
console.log('3. Test your application thoroughly');
console.log('4. Consider updating to ESLint flat config format');
console.log('\n🔗 Useful resources:');
console.log('- Supabase SSR migration: https://supabase.com/docs/guides/auth/server-side/nextjs');
console.log('- ESLint v9 migration: https://eslint.org/docs/latest/use/configure/configuration-files');
