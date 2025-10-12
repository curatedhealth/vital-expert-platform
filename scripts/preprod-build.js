#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const adminDir = path.join(__dirname, '..', 'src', 'app', 'admin');
const tempAdminDir = path.join(__dirname, '..', 'temp-admin-backup');

function moveAdminPages() {
  console.log('🚀 Moving admin pages for pre-production build...');
  
  // Create temp directory
  if (!fs.existsSync(tempAdminDir)) {
    fs.mkdirSync(tempAdminDir, { recursive: true });
  }
  
  // Move admin directory to temp location
  if (fs.existsSync(adminDir)) {
    fs.renameSync(adminDir, path.join(tempAdminDir, 'admin'));
    console.log('✅ Admin pages moved to temp directory');
  }
}

function restoreAdminPages() {
  console.log('🔄 Restoring admin pages...');
  
  // Restore admin directory
  if (fs.existsSync(path.join(tempAdminDir, 'admin'))) {
    if (fs.existsSync(adminDir)) {
      fs.rmSync(adminDir, { recursive: true, force: true });
    }
    fs.renameSync(path.join(tempAdminDir, 'admin'), adminDir);
    console.log('✅ Admin pages restored');
  }
  
  // Clean up temp directory
  if (fs.existsSync(tempAdminDir)) {
    fs.rmSync(tempAdminDir, { recursive: true, force: true });
    console.log('✅ Temp directory cleaned up');
  }
}

function buildPreprod() {
  console.log('🏗️  Building pre-production version...');
  
  try {
    // Set environment variable for pre-production build
    process.env.BUILD_TARGET = 'preprod';
    
    // Run the build
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('✅ Pre-production build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  if (command === 'build') {
    try {
      moveAdminPages();
      buildPreprod();
    } finally {
      restoreAdminPages();
    }
  } else if (command === 'restore') {
    restoreAdminPages();
  } else {
    console.log('Usage:');
    console.log('  node scripts/preprod-build.js build    - Build pre-production version (excludes admin)');
    console.log('  node scripts/preprod-build.js restore  - Restore admin pages');
  }
}

main().catch(console.error);
