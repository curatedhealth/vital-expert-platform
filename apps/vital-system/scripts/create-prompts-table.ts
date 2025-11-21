/**
 * Create the prompts table in Supabase if it doesn't exist
 * Based on the schema from migrations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS prompts (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Prompt Definition
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT,
    execution_instructions JSONB DEFAULT '{}',
    success_criteria JSONB DEFAULT '{}',
    
    -- Prompt Configuration
    model_requirements JSONB DEFAULT '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}',
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    
    -- Classification
    complexity_level VARCHAR(20) DEFAULT 'intermediate' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    domain VARCHAR(100) NOT NULL DEFAULT 'general',
    estimated_tokens INTEGER DEFAULT 1000,
    
    -- Dependencies
    prerequisite_prompts TEXT[],
    prerequisite_capabilities TEXT[] DEFAULT '{}',
    related_capabilities TEXT[],
    required_context TEXT[],
    
    -- Validation & Quality
    validation_status VARCHAR(20) DEFAULT 'active' CHECK (validation_status IN ('active', 'inactive', 'beta', 'deprecated')),
    accuracy_threshold DECIMAL(3,2) DEFAULT 0.85 CHECK (accuracy_threshold >= 0 AND accuracy_threshold <= 1),
    testing_scenarios JSONB DEFAULT '[]',
    
    -- Compliance
    hipaa_relevant BOOLEAN DEFAULT false,
    phi_handling_rules JSONB DEFAULT '{}',
    compliance_tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain);
CREATE INDEX IF NOT EXISTS idx_prompts_complexity ON prompts(complexity_level);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(validation_status);
`;

async function createTable() {
  console.log('🔧 Creating prompts table...\n');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: CREATE_TABLE_SQL });
  
  if (error) {
    // RPC might not exist, try direct SQL execution via REST
    console.log('RPC not available, trying alternative method...\n');
    
    // Use Supabase REST API to run SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql: CREATE_TABLE_SQL }),
    });
    
    if (!response.ok) {
      console.error('❌ Could not create table via REST API');
      console.error('   You may need to run the SQL migration manually');
      console.error('\nSQL to run:');
      console.log(CREATE_TABLE_SQL);
      return;
    }
  }
  
  // Verify table was created
  const { data: testData, error: testError } = await supabase
    .from('prompts')
    .select('*')
    .limit(1);
  
  if (testError && testError.code === '42P01') {
    console.error('❌ Table still does not exist');
    console.error('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log('\n' + CREATE_TABLE_SQL);
  } else {
    console.log('✅ Prompts table exists!');
    if (testData) {
      console.log(`   Table has ${testData.length} rows (or is accessible)`);
    }
  }
}

createTable();

