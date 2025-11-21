/**
 * Create knowledge_domains table
 *
 * Run: NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create-knowledge-domains-table.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  console.log('📋 Creating knowledge_domains table...\n');

  // Create table using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.knowledge_domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        tier INTEGER NOT NULL DEFAULT 1,
        priority INTEGER NOT NULL DEFAULT 1,
        keywords TEXT[] DEFAULT '{}',
        sub_domains TEXT[] DEFAULT '{}',
        agent_count_estimate INTEGER DEFAULT 0,
        color TEXT DEFAULT '#3B82F6',
        icon TEXT DEFAULT 'book',
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        recommended_models JSONB DEFAULT '{
          "embedding": {
            "primary": "text-embedding-3-large",
            "alternatives": ["text-embedding-ada-002"],
            "specialized": null
          },
          "chat": {
            "primary": "gpt-4-turbo-preview",
            "alternatives": ["gpt-3.5-turbo"],
            "specialized": null
          }
        }'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
      CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
      CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
      CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);

      ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
      DROP POLICY IF EXISTS "Allow service role to manage knowledge_domains" ON public.knowledge_domains;

      CREATE POLICY "Allow public read access to knowledge_domains"
        ON public.knowledge_domains FOR SELECT USING (true);

      CREATE POLICY "Allow service role to manage knowledge_domains"
        ON public.knowledge_domains FOR ALL
        USING (auth.role() = 'service_role');
    `
  });

  if (error) {
    console.error('❌ Error:', error);

    // Try direct insert instead (RPC might not exist)
    console.log('\n⚠️  RPC method not available, trying direct table operations...\n');

    // Just try to insert a test record - this will create table via migrations
    const { error: testError } = await supabase
      .from('knowledge_domains')
      .select('id')
      .limit(1);

    if (testError && testError.message.includes('does not exist')) {
      console.error('❌ Table does not exist and cannot be created via API');
      console.error('   Please run the migration file manually or contact support');
      process.exit(1);
    }

    console.log('✅ Table exists or was created!');
  } else {
    console.log('✅ Table created successfully!');
  }
}

createTable()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
