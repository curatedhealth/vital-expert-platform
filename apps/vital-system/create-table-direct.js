/**
 * Create user_panels table directly using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createTableSQL = `
-- Create user_panels table
CREATE TABLE IF NOT EXISTS user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'panel',
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT false,
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),
  selected_agents TEXT[] NOT NULL,
  suggested_agents TEXT[] DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  workflow_definition JSONB,
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_is_favorite ON user_panels(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON user_panels(last_used_at DESC NULLS LAST);
`;

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 Creating user_panels table');
  console.log('='.repeat(70));

  console.log('\n📋 Manual SQL execution required');
  console.log('\nSupabase PostgREST doesn't support raw SQL execution.');
  console.log('Please run the following SQL manually in Supabase SQL Editor:\n');

  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to: SQL Editor');
  console.log('4. Create a new query');
  console.log('5. Paste the following SQL:\n');

  console.log('-'.repeat(70));
  console.log(createTableSQL);
  console.log('-'.repeat(70));

  console.log('\n6. Click "Run" button');
  console.log('\n✅ After running the SQL, run: node create-test-panel.js');
  console.log();
}

main();
