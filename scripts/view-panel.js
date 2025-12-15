/**
 * View Panel Details
 * Pretty-print panel information from database
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function viewPanel(panelId) {
  console.log('='.repeat(70));
  console.log('🔍 Panel Viewer');
  console.log('='.repeat(70));

  const { data: panel, error } = await supabase
    .from('panels')
    .select('*')
    .eq('id', panelId)
    .single();

  if (error) {
    console.error('\n❌ Error fetching panel:', error.message);
    process.exit(1);
  }

  // Fetch agent details
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, slug, description, title, expertise_level, avatar_url')
    .in('id', panel.suggested_agents);

  console.log('\n📋 PANEL INFORMATION');
  console.log('-'.repeat(70));
  console.log(`ID:           ${panel.id}`);
  console.log(`Slug:         ${panel.slug}`);
  console.log(`Name:         ${panel.name}`);
  console.log(`Category:     ${panel.category}`);
  console.log(`Mode:         ${panel.mode}`);
  console.log(`Framework:    ${panel.framework}`);
  console.log(`Created:      ${new Date(panel.created_at).toLocaleString()}`);
  console.log(`Updated:      ${new Date(panel.updated_at).toLocaleString()}`);

  console.log('\n📝 DESCRIPTION');
  console.log('-'.repeat(70));
  console.log(panel.description);

  console.log('\n👥 EXPERT AGENTS (' + agents.length + ')');
  console.log('-'.repeat(70));
  agents.forEach((agent, index) => {
    console.log(`\n${index + 1}. ${agent.name}`);
    console.log(`   Slug:       ${agent.slug}`);
    console.log(`   Title:      ${agent.title || 'N/A'}`);
    console.log(`   Level:      ${agent.expertise_level || 'N/A'}`);
    console.log(`   Description: ${(agent.description || 'N/A').substring(0, 60)}...`);
  });

  console.log('\n⚙️  DEFAULT SETTINGS');
  console.log('-'.repeat(70));
  Object.entries(panel.default_settings).forEach(([key, value]) => {
    console.log(`${key.padEnd(25)} ${value}`);
  });

  console.log('\n🔧 WORKFLOW STRUCTURE');
  console.log('-'.repeat(70));
  const workflow = panel.metadata.workflow_definition;
  console.log(`Nodes:        ${workflow.nodes.length}`);
  console.log(`Edges:        ${workflow.edges.length}`);

  console.log('\nNode Types:');
  const nodeTypes = {};
  workflow.nodes.forEach(node => {
    const type = node.type || node.data?.type;
    nodeTypes[type] = (nodeTypes[type] || 0) + 1;
  });
  Object.entries(nodeTypes).forEach(([type, count]) => {
    console.log(`  - ${type.padEnd(15)} ${count}`);
  });

  console.log('\n📊 METADATA');
  console.log('-'.repeat(70));
  console.log(`Created via:  ${panel.metadata.created_via}`);
  console.log(`Test panel:   ${panel.metadata.test_panel ? 'Yes' : 'No'}`);
  console.log(`Expert count: ${panel.metadata.expert_count}`);
  console.log(`Node count:   ${panel.metadata.node_count}`);
  console.log(`Edge count:   ${panel.metadata.edge_count}`);

  if (panel.metadata.tags) {
    console.log(`Tags:         ${panel.metadata.tags.join(', ')}`);
  }

  if (panel.metadata.icon) {
    console.log(`Icon:         ${panel.metadata.icon}`);
  }

  console.log('\n🔗 ACCESS LINKS');
  console.log('-'.repeat(70));
  console.log(`View in UI:   /ask-panel/${panel.id}`);
  console.log(`Full URL:     http://localhost:3000/ask-panel/${panel.id}`);
  console.log(`API endpoint: /api/panels/${panel.slug}`);

  console.log('\n' + '='.repeat(70));
  console.log('✅ Panel details displayed successfully');
  console.log('='.repeat(70));
  console.log();
}

async function listTestPanels() {
  console.log('='.repeat(70));
  console.log('📋 All Test Panels');
  console.log('='.repeat(70));

  const { data: panels, error } = await supabase
    .from('panels')
    .select('id, slug, name, created_at, suggested_agents, metadata')
    .eq('category', 'test')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('\n❌ Error fetching panels:', error.message);
    process.exit(1);
  }

  if (panels.length === 0) {
    console.log('\nNo test panels found.');
    console.log('\nCreate one with: node create-test-panel.js');
    console.log();
    return;
  }

  console.log(`\nFound ${panels.length} test panel(s):\n`);

  panels.forEach((panel, index) => {
    const agentCount = panel.suggested_agents?.length || 0;
    const nodeCount = panel.metadata?.node_count || 0;
    console.log(`${index + 1}. ${panel.name}`);
    console.log(`   ID:      ${panel.id}`);
    console.log(`   Slug:    ${panel.slug}`);
    console.log(`   Agents:  ${agentCount}`);
    console.log(`   Nodes:   ${nodeCount}`);
    console.log(`   Created: ${new Date(panel.created_at).toLocaleString()}`);
    console.log();
  });

  console.log('View details: node view-panel.js <panel-id>');
  console.log('='.repeat(70));
  console.log();
}

async function main() {
  const panelId = process.argv[2];

  if (!panelId) {
    await listTestPanels();
  } else {
    await viewPanel(panelId);
  }
}

main();
