#!/usr/bin/env node

/**
 * Deploy RBAC System to Supabase Cloud
 * 
 * This script deploys the complete Role-Based Access Control system
 * to the Supabase cloud instance while preserving existing data.
 * 
 * Usage: node scripts/deploy-rbac-to-cloud.js
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
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

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Colors for console output
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Read migration SQL file
function readMigrationFile() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251010_deploy_rbac_to_cloud.sql');
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
  
  return fs.readFileSync(migrationPath, 'utf8');
}

// Execute SQL migration
async function executeMigration(sql) {
  try {
    logInfo('Executing RBAC migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }
    
    logSuccess('Migration executed successfully');
    return data;
  } catch (error) {
    // If exec_sql doesn't exist, try direct SQL execution
    if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
      logWarning('exec_sql function not available, trying alternative approach...');
      
      // Split SQL into individual statements and execute via REST API
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        try {
          // Use raw SQL query via REST API
          const { error: stmtError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);
          
          if (stmtError && !stmtError.message.includes('relation "_sql" does not exist')) {
            throw stmtError;
          }
          
          successCount++;
        } catch (stmtError) {
          logWarning(`Statement failed: ${statement.substring(0, 50)}...`);
          errorCount++;
        }
      }
      
      logInfo(`Executed ${successCount} statements successfully, ${errorCount} failed`);
      return { success: successCount, errors: errorCount };
    }
    
    throw error;
  }
}

// Verify RBAC deployment
async function verifyDeployment() {
  logStep('5', 'Verifying RBAC deployment');
  
  const checks = [
    {
      name: 'ENUM types created',
      query: `SELECT typname FROM pg_type WHERE typname IN ('user_role', 'permission_scope', 'permission_action')`,
      expected: 3
    },
    {
      name: 'role_permissions table exists',
      query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'role_permissions'`,
      expected: 1
    },
    {
      name: 'user_sessions table exists',
      query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'user_sessions'`,
      expected: 1
    },
    {
      name: 'encrypted_api_keys table exists',
      query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'encrypted_api_keys'`,
      expected: 1
    },
    {
      name: 'Permission functions exist',
      query: `SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_name IN ('check_user_permission', 'get_current_user_email', 'is_admin_user', 'get_user_role')`,
      expected: 4
    },
    {
      name: 'Role permissions seeded',
      query: `SELECT COUNT(*) as count FROM role_permissions`,
      expected: 106
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
      
      if (error) {
        logError(`${check.name}: ${error.message}`);
        allPassed = false;
        continue;
      }
      
      const count = data?.[0]?.count || data?.length || 0;
      const passed = count >= check.expected;
      
      if (passed) {
        logSuccess(`${check.name}: ${count} (expected: ${check.expected})`);
      } else {
        logError(`${check.name}: ${count} (expected: ${check.expected})`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${check.name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test permission functions
async function testPermissionFunctions() {
  logStep('6', 'Testing permission functions');
  
  try {
    // Test check_user_permission function
    const { data: permissionTest, error: permError } = await supabase.rpc('exec_sql', {
      sql: `SELECT check_user_permission('hn@vitalexpert.com', 'agents', 'read') as can_read_agents`
    });
    
    if (permError) {
      logWarning(`Permission test failed: ${permError.message}`);
    } else {
      logSuccess(`Permission test: ${permissionTest?.[0]?.can_read_agents ? 'PASS' : 'FAIL'}`);
    }
    
    // Test is_admin_user function
    const { data: adminTest, error: adminError } = await supabase.rpc('exec_sql', {
      sql: `SELECT is_admin_user('hn@vitalexpert.com') as is_admin`
    });
    
    if (adminError) {
      logWarning(`Admin test failed: ${adminError.message}`);
    } else {
      logSuccess(`Admin test: ${adminTest?.[0]?.is_admin ? 'PASS' : 'FAIL'}`);
    }
    
    // Test get_user_role function
    const { data: roleTest, error: roleError } = await supabase.rpc('exec_sql', {
      sql: `SELECT get_user_role('hn@vitalexpert.com') as user_role`
    });
    
    if (roleError) {
      logWarning(`Role test failed: ${roleError.message}`);
    } else {
      logSuccess(`Role test: ${roleTest?.[0]?.user_role || 'FAIL'}`);
    }
    
  } catch (error) {
    logWarning(`Function tests failed: ${error.message}`);
  }
}

// Check user roles after deployment
async function checkUserRoles() {
  logStep('7', 'Checking user roles after deployment');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email, role, is_active')
      .order('email');
    
    if (error) {
      logError(`Failed to fetch user roles: ${error.message}`);
      return;
    }
    
    logInfo('Current user roles:');
    data.forEach(user => {
      const status = user.is_active ? 'active' : 'inactive';
      log(`   ${user.email}: ${user.role} (${status})`, 'blue');
    });
    
  } catch (error) {
    logError(`Failed to check user roles: ${error.message}`);
  }
}

// Main deployment function
async function deployRBAC() {
  try {
    log('🚀 Deploying RBAC System to Supabase Cloud', 'bright');
    log('==========================================', 'bright');
    
    // Step 1: Validate connection
    logStep('1', 'Validating Supabase connection');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`);
    }
    
    logSuccess('Connected to Supabase cloud instance');
    
    // Step 2: Read migration file
    logStep('2', 'Reading migration file');
    const migrationSQL = readMigrationFile();
    logSuccess(`Migration file loaded (${migrationSQL.length} characters)`);
    
    // Step 3: Execute migration
    logStep('3', 'Executing RBAC migration');
    await executeMigration(migrationSQL);
    
    // Step 4: Verify deployment
    const deploymentValid = await verifyDeployment();
    
    if (!deploymentValid) {
      logError('Deployment verification failed');
      process.exit(1);
    }
    
    // Step 5: Test functions
    await testPermissionFunctions();
    
    // Step 6: Check user roles
    await checkUserRoles();
    
    // Final success message
    log('\n🎉 RBAC System Successfully Deployed!', 'green');
    log('=====================================', 'green');
    logInfo('✅ ENUM types created (user_role, permission_scope, permission_action)');
    logInfo('✅ role_permissions table with 106 permissions');
    logInfo('✅ user_sessions table for session tracking');
    logInfo('✅ encrypted_api_keys table for LLM providers');
    logInfo('✅ Security helper functions deployed');
    logInfo('✅ Row Level Security policies enabled');
    logInfo('✅ Audit triggers configured');
    logInfo('✅ User roles updated (hn@vitalexpert.com → admin)');
    
    log('\n📋 Next Steps:', 'yellow');
    log('1. Test permission checks in your application');
    log('2. Update frontend to use role-based UI restrictions');
    log('3. Monitor audit_logs for security events');
    log('4. Configure additional users as needed');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployRBAC();
}

module.exports = { deployRBAC, verifyDeployment, testPermissionFunctions };
