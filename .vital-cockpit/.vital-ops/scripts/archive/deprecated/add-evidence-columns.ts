import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function addEvidenceColumns() {
  console.log('🔧 Adding evidence-based model selection columns to agents table...\n');

  try {
    // Use raw SQL query to add columns
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error connecting to database:', error);
      process.exit(1);
    }

    console.log('✅ Connected to database successfully');
    console.log('ℹ️  Note: Column additions need to be done via Supabase Studio or direct SQL');
    console.log('');
    console.log('Please run these SQL commands in Supabase Studio:');
    console.log('');
    console.log('ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_justification TEXT;');
    console.log('ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_citation TEXT;');
    console.log('');
    console.log('Or use the migration file at:');
    console.log('database/sql/migrations/2025/20251002121000_add_evidence_columns.sql');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addEvidenceColumns();
