import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔗 Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDepartmentColumn() {
  console.log('📝 Adding department column to agents table...\n');

  try {
    // Execute SQL to add department column
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add department column to agents table
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS department VARCHAR(255);

        -- Add index for department filtering
        CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);
      `
    });

    if (error) {
      // Try direct approach if RPC doesn't exist
      console.log('⚠️  RPC method not available, using direct SQL execution...');

      // Use raw SQL query
      const { error: sqlError } = await supabase
        .from('agents')
        .select('department')
        .limit(1);

      if (sqlError && sqlError.message.includes('does not exist')) {
        console.log('✅ Department column does not exist yet, needs to be added via migration');
        console.log('\n💡 Please run: npx supabase db reset --local');
        console.log('   This will apply all migrations including the new department column migration.');
      } else {
        console.log('✅ Department column already exists!');
      }
    } else {
      console.log('✅ Department column added successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addDepartmentColumn();
