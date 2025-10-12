const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running long-term memory migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database/sql/migrations/2025/20251004000000_long_term_memory.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 Executing:', statement.substring(0, 100) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('❌ Error executing statement:', error);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Long-term memory migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
