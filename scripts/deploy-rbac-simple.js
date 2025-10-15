#!/usr/bin/env node

/**
 * Simple RBAC Deployment Script
 * 
 * This script deploys RBAC by executing SQL statements via REST API
 * and provides manual instructions for complex operations.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkCurrentState() {
  log('\n🔍 Checking current database state...', 'cyan');
  
  try {
    // Check if ENUMs exist
    const { data: enums, error: enumError } = await supabase
      .from('pg_type')
      .select('typname')
      .in('typname', ['user_role', 'permission_scope', 'permission_action']);
    
    if (enumError) {
      log('⚠️  Cannot check ENUMs via REST API', 'yellow');
    } else {
      log(`✅ Found ${enums?.length || 0} ENUM types`, 'green');
    }
    
    // Check if role_permissions table exists
    const { data: rolePerms, error: rolePermsError } = await supabase
      .from('role_permissions')
      .select('count')
      .limit(1);
    
    if (rolePermsError) {
      log('❌ role_permissions table does not exist', 'red');
    } else {
      log('✅ role_permissions table exists', 'green');
    }
    
    // Check user_profiles structure
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      log('❌ Error checking user_profiles', 'red');
    } else if (profiles && profiles.length > 0) {
      const columns = Object.keys(profiles[0]);
      log(`✅ user_profiles has ${columns.length} columns: ${columns.join(', ')}`, 'green');
    }
    
  } catch (error) {
    log(`❌ Error checking state: ${error.message}`, 'red');
  }
}

async function updateUserRoles() {
  log('\n👥 Updating user roles...', 'cyan');
  
  try {
    // Update hn@vitalexpert.com to admin
    const { error: hnError } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'hn@vitalexpert.com');
    
    if (hnError) {
      log(`⚠️  Could not update hn@vitalexpert.com: ${hnError.message}`, 'yellow');
    } else {
      log('✅ Updated hn@vitalexpert.com to admin', 'green');
    }
    
    // Check current roles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, role')
      .order('email');
    
    if (usersError) {
      log(`❌ Error fetching users: ${usersError.message}`, 'red');
    } else {
      log('Current user roles:', 'blue');
      users.forEach(user => {
        log(`   ${user.email}: ${user.role}`, 'blue');
      });
    }
    
  } catch (error) {
    log(`❌ Error updating roles: ${error.message}`, 'red');
  }
}

function generateManualInstructions() {
  log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS', 'bright');
  log('==================================', 'bright');
  
  log('\n1. Open Supabase Dashboard SQL Editor:', 'yellow');
  log('   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql', 'blue');
  
  log('\n2. Copy and paste the following SQL migration:', 'yellow');
  log('   File: supabase/migrations/20251010_deploy_rbac_to_cloud.sql', 'blue');
  
  log('\n3. Execute the migration in the SQL Editor', 'yellow');
  
  log('\n4. Verify deployment by running these queries:', 'yellow');
  log('   -- Check ENUM types', 'blue');
  log('   SELECT typname FROM pg_type WHERE typname IN (\'user_role\', \'permission_scope\', \'permission_action\');', 'blue');
  
  log('\n   -- Check role_permissions table', 'blue');
  log('   SELECT COUNT(*) FROM role_permissions;', 'blue');
  
  log('\n   -- Check permission functions', 'blue');
  log('   SELECT check_user_permission(\'hn@vitalexpert.com\', \'agents\', \'read\');', 'blue');
  
  log('\n5. Test the RBAC system:', 'yellow');
  log('   node scripts/test-rbac-system.js', 'blue');
}

async function main() {
  log('🚀 RBAC Deployment Assistant', 'bright');
  log('============================', 'bright');
  
  await checkCurrentState();
  await updateUserRoles();
  generateManualInstructions();
  
  log('\n✨ Next Steps:', 'green');
  log('1. Follow the manual instructions above', 'blue');
  log('2. Run: node scripts/test-rbac-system.js', 'blue');
  log('3. Update your application to use the new RBAC system', 'blue');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkCurrentState, updateUserRoles };
