/**
 * View Panel by Slug
 * Shows complete panel data including metadata
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const slug = process.argv[2] || 'test-panel-drug-hash-jcnodk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('='.repeat(70));
  console.log('🔍 Panel Viewer (by slug)');
  console.log('='.repeat(70));
  console.log();

  const { data: panel, error } = await supabase
    .from('panels')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('📋 Panel Information:');
  console.log('  ID:', panel.id);
  console.log('  Slug:', panel.slug);
  console.log('  Name:', panel.name);
  console.log('  Description:', panel.description || '(none)');
  console.log('  Category:', panel.category);
  console.log('  Mode:', panel.mode);
  console.log('  Framework:', panel.framework);
  console.log();

  console.log('📊 Metadata:');
  const metadata = panel.metadata || {};
  const selectedAgents = metadata.selected_agents || [];
  const workflowDef = metadata.workflow_definition || {};

  console.log('  Selected Agents:', selectedAgents.length);
  if (selectedAgents.length > 0) {
    selectedAgents.forEach((agentId, idx) => {
      console.log(`    ${idx + 1}. ${agentId}`);
    });
  }

  console.log();
  console.log('  Workflow Definition:');
  console.log('    Nodes:', workflowDef.nodes?.length || 0);
  console.log('    Edges:', workflowDef.edges?.length || 0);

  if (workflowDef.nodes && workflowDef.nodes.length > 0) {
    console.log();
    console.log('  📝 Workflow Nodes:');
    workflowDef.nodes.forEach((node, idx) => {
      console.log(`    ${idx + 1}. ${node.id} (${node.type || 'unknown'})`);
      console.log(`       Label: ${node.label || node.data?.label || '(no label)'}`);
      if (node.data?.config?.agentId) {
        console.log(`       Agent ID: ${node.data.config.agentId}`);
      }
      if (node.position) {
        console.log(`       Position: (${node.position.x}, ${node.position.y})`);
      }
    });
  }

  console.log();
  console.log('  Other Metadata Keys:', Object.keys(metadata).filter(k =>
    k !== 'selected_agents' && k !== 'workflow_definition'
  ));

  console.log();
  console.log('='.repeat(70));

  // Fetch actual agent details if we have selected_agents
  if (selectedAgents.length > 0) {
    console.log();
    console.log('🔍 Fetching Agent Details...');
    console.log();

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, description, tier, status')
      .in('id', selectedAgents);

    if (agentsError) {
      console.log('❌ Error fetching agents:', agentsError.message);
    } else if (agents && agents.length > 0) {
      console.log(`✅ Found ${agents.length} agents:`);
      agents.forEach((agent, idx) => {
        console.log(`  ${idx + 1}. ${agent.display_name || agent.name}`);
        console.log(`     ID: ${agent.id}`);
        console.log(`     Tier: ${agent.tier || 'N/A'}`);
        console.log(`     Status: ${agent.status}`);
      });
    } else {
      console.log('⚠️  No agents found with those IDs');
      console.log('   (Agent IDs might be invalid or agents might be inactive)');
    }
    console.log();
    console.log('='.repeat(70));
  }
})();
