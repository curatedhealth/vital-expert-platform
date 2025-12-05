/**
 * Create user_panels table via Supabase Management API
 */

const https = require('https');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const projectRef = 'bomltkhixeatxuoxmolq';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Read SQL file
const sql = fs.readFileSync(path.join(__dirname, 'create-user-panels-table.sql'), 'utf8');

console.log('='.repeat(70));
console.log('🔧 Creating user_panels Table via API');
console.log('='.repeat(70));
console.log();

// Since we can't execute DDL via REST API, let's create a detailed guide
console.log('⚠️  Note: Supabase REST API does not support DDL operations (CREATE TABLE).');
console.log();
console.log('You have 2 options:');
console.log();
console.log('═'.repeat(70));
console.log('OPTION 1: Use Supabase Dashboard (RECOMMENDED - 2 minutes)');
console.log('═'.repeat(70));
console.log();
console.log('1. Open this URL in your browser:');
console.log('   https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new');
console.log();
console.log('2. The SQL file has been copied to your clipboard!');
console.log('   (If not, copy from: create-user-panels-table.sql)');
console.log();
console.log('3. Paste into the SQL Editor');
console.log();
console.log('4. Click "Run" button');
console.log();
console.log('5. You should see: "user_panels table created successfully!"');
console.log();

// Try to copy SQL to clipboard using pbcopy (macOS)
try {
  const { execSync } = require('child_process');
  execSync(`echo '${sql.replace(/'/g, "'\\''")}' | pbcopy`);
  console.log('✅ SQL copied to clipboard! Just paste and run.');
} catch (e) {
  console.log('💡 Tip: SQL is in create-user-panels-table.sql');
}

console.log();
console.log('═'.repeat(70));
console.log('OPTION 2: Manual Copy (If clipboard didn\'t work)');
console.log('═'.repeat(70));
console.log();
console.log('Copy this SQL and paste into Supabase SQL Editor:');
console.log();
console.log('─'.repeat(70));
console.log(sql);
console.log('─'.repeat(70));
console.log();

console.log('═'.repeat(70));
console.log('After running the SQL:');
console.log('═'.repeat(70));
console.log();
console.log('Verify it worked:');
console.log('  node -e "const {createClient}=require(\'@supabase/supabase-js\');');
console.log('           require(\'dotenv\').config({path:\'.env.local\'});');
console.log('           const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,');
console.log('           process.env.SUPABASE_SERVICE_ROLE_KEY);');
console.log('           (async()=>{const {error}=await s.from(\'user_panels\')');
console.log('           .select(\'id\').limit(1);');
console.log('           console.log(error?\'❌ Not created\':\'✅ Success!\')})();"');
console.log();
console.log('Then test saving in your app!');
console.log();
