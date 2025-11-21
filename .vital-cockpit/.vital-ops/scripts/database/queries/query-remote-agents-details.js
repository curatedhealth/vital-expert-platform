const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzU5NzI0MSwiZXhwIjoyMDQzMTczMjQxfQ.L2k6xgN3-BaI6L9t5PjdFZH_8hIWgP2rqEKjGgV3ZEI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryRemoteAgents() {
  console.log('🔍 Querying Remote Supabase Agents...\n');
  console.log('Host:', supabaseUrl);
  console.log('─'.repeat(80), '\n');

  try {
    // Get agents with all basic info (only existing columns)
    const { data: agents, error, count } = await supabase
      .from('agents')
      .select('id, name, description, model, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying agents:', error);
      return;
    }

    console.log(`✅ Total Agents Found: ${count}\n`);

    if (agents && agents.length > 0) {
      console.log('📋 Agent Details:\n');
      agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name}`);
        console.log(`   ID: ${agent.id}`);
        console.log(`   Model: ${agent.model || 'N/A'}`);
        console.log(`   Created: ${agent.created_at}`);
        console.log(`   Description: ${(agent.description || '').substring(0, 80)}...`);
        console.log('');
      });
    } else {
      console.log('⚠️  No agents found in remote database');
    }

    console.log('─'.repeat(80));
    console.log(`\n📊 Summary: ${count} agents in remote Supabase`);
    console.log(`📁 Backup has: 254 agents`);
    console.log(`❌ Missing: ${254 - (count || 0)} agents\n`);

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

queryRemoteAgents();
