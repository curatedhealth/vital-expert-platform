const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250918_enhance_workflow_system.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Reading migration file...');

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'COMMIT');

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error(`Error in statement ${i + 1}:`, error);
            // Try direct query for some statements
            const { error: queryError } = await supabase.from('_migrations').select('*').limit(1);
            if (queryError && queryError.code !== 'PGRST116') {
              console.error('Supabase connection error:', queryError);
              return;
            }
          }
        } catch (err) {
          console.log(`Statement ${i + 1} might need manual execution:`, statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('Migration process completed!');
    console.log('Some statements may need to be executed manually in the Supabase SQL editor.');

  } catch (err) {
    console.error('Error reading migration file:', err.message);
  }
}

runMigration();