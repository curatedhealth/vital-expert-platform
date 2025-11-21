const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile) {
  console.log(`\n🔄 Running migration: ${migrationFile}`);

  try {
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by statements (separated by semicolons)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { query: statement });

        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_dummy_table_that_does_not_exist')
            .select()
            .limit(0);

          // Execute via PostgreSQL connection
          const { error: pgError } = await supabase.rpc('run_sql', { sql: statement });

          if (pgError) {
            console.error(`❌ Error executing statement: ${pgError.message}`);
            throw pgError;
          }
        }
      }
    }

    console.log(`✅ Migration ${migrationFile} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found');
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('ℹ️  No migration files found');
    return;
  }

  console.log(`Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach(file => console.log(`  - ${file}`));

  let successCount = 0;

  for (const migrationFile of migrationFiles) {
    const success = await runMigration(migrationFile);
    if (success) {
      successCount++;
    } else {
      console.log(`\n❌ Stopping migrations due to failure in ${migrationFile}`);
      break;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Successful: ${successCount}/${migrationFiles.length}`);
  console.log(`  ❌ Failed: ${migrationFiles.length - successCount}/${migrationFiles.length}`);

  if (successCount === migrationFiles.length) {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n🔍 Testing database connection...');

    // Test the JTBD table creation
    try {
      const { data, error } = await supabase
        .from('jtbd_library')
        .select('count')
        .limit(1);

      if (!error) {
        console.log('✅ JTBD tables are accessible');
      } else {
        console.log('⚠️  JTBD tables may need manual verification');
      }
    } catch (testError) {
      console.log('⚠️  Database connection test failed:', testError.message);
    }
  } else {
    console.log('\n💡 Some migrations failed. Check the errors above.');
    process.exit(1);
  }
}

// Run migrations
runAllMigrations()
  .then(() => {
    console.log('\n✨ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration process failed:', error);
    process.exit(1);
  });