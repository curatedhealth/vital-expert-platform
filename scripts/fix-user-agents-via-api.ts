#!/usr/bin/env tsx

/**
 * Script to create user_agents table via Supabase API
 * Run with: npx tsx scripts/fix-user-agents-via-api.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bomltkhixeatxuoxmolq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndCreateUserAgentsTable() {
  console.log('🔍 Checking if user_agents table exists...');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('user_agents')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('❌ user_agents table does not exist');
        console.log('📝 Creating table via SQL...');
        
        // Create the table
        const createTableSQL = `
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    is_user_copy BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id);

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Service role has full access to user_agents" ON user_agents;

CREATE POLICY "Users can view their own agent relationships" ON user_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent relationships" ON user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" ON user_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" ON user_agents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to user_agents" ON user_agents
    FOR ALL TO service_role USING (true) WITH CHECK (true);
        `;
        
        const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        });
        
        if (createError) {
          console.error('❌ Failed to create table:', createError);
          console.log('\n📋 Manual SQL:');
          console.log(createTableSQL);
          process.exit(1);
        }
        
        console.log('✅ user_agents table created successfully!');
      } else {
        console.error('❌ Error checking table:', error);
        process.exit(1);
      }
    } else {
      console.log('✅ user_agents table already exists!');
      console.log(`   Found ${data?.length || 0} records`);
    }
    
    // Verify the table structure
    console.log('\n🔍 Verifying table structure...');
    const { data: testData, error: testError } = await supabase
      .from('user_agents')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error verifying table:', testError);
    } else {
      console.log('✅ Table structure verified!');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the script
checkAndCreateUserAgentsTable()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });





