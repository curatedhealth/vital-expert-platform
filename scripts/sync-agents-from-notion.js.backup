const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map Notion tier format to database tier number
function parseTier(tierStr) {
  if (!tierStr) return 1;
  const match = tierStr.match(/Tier (\d+)/i);
  return match ? parseInt(match[1]) : 1;
}

// Parse comma-separated capabilities/specializations to array
function parseArray(str) {
  if (!str || str === 'null') return [];
  if (Array.isArray(str)) return str;
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

async function syncAgents() {
  console.log('🔄 Starting agent sync from Notion export...\n');

  // Read agents from JSON
  const agentsPath = path.join(__dirname, '..', 'exports', 'notion', 'agents.json');
  const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));

  console.log(`📊 Found ${agentsData.length} agents to sync\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const agent of agentsData) {
    try {
      // Map Notion fields to database schema
      const dbAgent = {
        name: agent.Name,
        display_name: agent['Display Name'],
        description: agent.Description || 'No description provided',
        avatar: agent.Avatar || '🤖',
        color: 'text-trust-blue', // Default color
        system_prompt: agent['System Prompt'] || `You are ${agent['Display Name']}.`,
        model: agent.Model || 'gpt-4',
        temperature: parseFloat(agent.Temperature) || 0.7,
        max_tokens: parseInt(agent['Max Tokens']) || 2000,
        tier: parseTier(agent.Tier),
        priority: parseInt(agent.Priority) || 1,
        status: agent.Status?.toLowerCase() === 'active' ? 'active' : 'inactive',
        rag_enabled: true,
        is_custom: agent['Is Custom'] === true || agent['Is Custom'] === 'true',

        // JSONB fields
        capabilities: JSON.stringify(parseArray(agent.Capabilities || agent['Domain Expertise'])),
        specializations: JSON.stringify(parseArray(agent.Specializations || agent['Medical Specialty'])),
        tools: JSON.stringify([]),
        knowledge_domains: JSON.stringify(parseArray(agent['Knowledge Domains'])),
        data_sources: JSON.stringify([]),
        roi_metrics: JSON.stringify({}),
        use_cases: JSON.stringify(parseArray(agent['Use Cases'])),
        target_users: JSON.stringify(parseArray(agent['Target Users'])),
        required_integrations: JSON.stringify([]),
        compliance_requirements: JSON.stringify(
          [
            agent['HIPAA Compliant'] && 'HIPAA',
            agent['GDPR Compliant'] && 'GDPR',
          ].filter(Boolean)
        ),
        security_level: agent['Data Classification'] || 'standard',
      };

      // Upsert agent (insert or update if exists)
      const { error } = await supabase
        .from('agents')
        .upsert(dbAgent, {
          onConflict: 'name',
          ignoreDuplicates: false
        });

      if (error) {
        errorCount++;
        errors.push({ name: agent.Name, error: error.message });
        console.error(`❌ ${agent['Display Name']}: ${error.message}`);
      } else {
        successCount++;
        console.log(`✅ ${agent['Display Name']}`);
      }
    } catch (err) {
      errorCount++;
      errors.push({ name: agent.Name, error: err.message });
      console.error(`❌ ${agent['Display Name']}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Sync Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount} agents`);
  console.log(`❌ Errors: ${errorCount} agents`);
  console.log(`📈 Total: ${agentsData.length} agents`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.slice(0, 5).forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more errors`);
    }
  }

  // Verify final count
  const { count } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎯 Total agents in database: ${count}`);
}

syncAgents().catch(console.error);
