/**
 * Create Test Panel Script
 * Creates a new panel with 2 random active agents
 * Simulates the user workflow through the panel designer
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'create-test-panel-script',
    },
  },
  db: {
    schema: 'public',
  },
});

async function getRandomActiveAgents(count = 2) {
  console.log(`\n🔍 Fetching ${count} random active agents...`);

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, slug, description, title, expertise_level, avatar_url')
    .eq('status', 'active')
    .limit(100); // Get a pool to choose from

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  if (!agents || agents.length < count) {
    throw new Error(`Not enough active agents found. Need ${count}, found ${agents?.length || 0}`);
  }

  // Randomly select agents
  const shuffled = agents.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  console.log('✅ Selected agents:');
  selected.forEach((agent, index) => {
    console.log(`   ${index + 1}. ${agent.name} (${agent.slug})`);
    console.log(`      ${agent.description?.substring(0, 60)}...`);
  });

  return selected;
}

async function createWorkflowDefinition(agents) {
  console.log('\n🔧 Creating workflow definition...');

  // Create a simple workflow with the selected agents
  const nodes = [
    // Start node
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 50 },
      data: {
        id: 'start',
        label: 'Start',
        type: 'start',
        config: {
          description: 'Starting point of the workflow',
        },
      },
    },
    // Expert agent nodes
    ...agents.map((agent, index) => ({
      id: `expert_${agent.id}`,
      type: 'agent',
      position: { x: 100, y: 150 + (index * 150) },
      data: {
        id: `expert_${agent.id}`,
        label: agent.name,
        type: 'agent',
        config: {
          agentId: agent.id,
          agentName: agent.name,
          agentSlug: agent.slug,
          agentDisplayName: agent.name,
          agentDescription: agent.description || '',
          agentAvatar: agent.avatar_url,
          description: agent.description || `Expert agent: ${agent.name}`,
          systemPrompt: `You are ${agent.name}. ${agent.description || ''}`,
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
        expertConfig: {
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          title: agent.title,
          expertise_level: agent.expertise_level,
          avatar_url: agent.avatar_url,
          description: agent.description,
        },
      },
    })),
    // Synthesizer node
    {
      id: 'synthesizer',
      type: 'synthesizer',
      position: { x: 100, y: 150 + (agents.length * 150) },
      data: {
        id: 'synthesizer',
        label: 'Synthesizer',
        type: 'synthesizer',
        config: {
          synthesisStrategy: 'consensus',
          weightingMethod: 'equal',
          description: 'Synthesizes responses from all experts using consensus strategy',
        },
      },
    },
    // End node
    {
      id: 'end',
      type: 'end',
      position: { x: 100, y: 200 + (agents.length * 150) },
      data: {
        id: 'end',
        label: 'End',
        type: 'end',
        config: {
          description: 'End of workflow - final output',
        },
      },
    },
  ];

  // Create edges connecting the nodes
  const edges = [
    { id: 'e-start-expert0', source: 'start', target: `expert_${agents[0].id}` },
    ...agents.slice(0, -1).map((agent, index) => ({
      id: `e-expert${index}-expert${index + 1}`,
      source: `expert_${agent.id}`,
      target: `expert_${agents[index + 1].id}`,
    })),
    {
      id: `e-expert-last-synth`,
      source: `expert_${agents[agents.length - 1].id}`,
      target: 'synthesizer',
    },
    { id: 'e-synth-end', source: 'synthesizer', target: 'end' },
  ];

  const workflow = {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
  };

  console.log(`✅ Workflow created with ${nodes.length} nodes and ${edges.length} edges`);
  return workflow;
}

async function createTestPanel(agents, workflowDefinition) {
  console.log('\n💾 Creating panel in database...');

  const panelName = `Test Panel - ${agents.map(a => a.name.split(' ')[0]).join(' & ')}`;
  const timestamp = new Date().toISOString().split('T')[0];
  const slugSuffix = Math.random().toString(36).substring(2, 8);
  const slug = `test-panel-${agents.map(a => a.slug.split('-')[0]).join('-')}-${slugSuffix}`;

  const panelData = {
    slug: slug,
    name: panelName,
    description: `Test panel created with ${agents.length} experts: ${agents.map(a => a.name).join(', ')}. Created on ${timestamp} via script for demonstration purposes.`,
    category: 'test',
    mode: 'sequential',
    framework: 'langgraph',
    suggested_agents: agents.map(a => a.id),
    default_settings: {
      temperature: 0.7,
      max_tokens: 2000,
      max_iterations: 3,
      enable_feedback: true,
      synthesis_strategy: 'consensus',
    },
    metadata: {
      created_via: 'test_script',
      node_count: workflowDefinition.nodes.length,
      edge_count: workflowDefinition.edges.length,
      expert_count: agents.length,
      agent_names: agents.map(a => a.name),
      agent_slugs: agents.map(a => a.slug),
      test_panel: true,
      workflow_definition: workflowDefinition,
      tags: ['test', 'demo', 'auto-generated'],
      icon: '🧪',
    },
  };

  console.log('\nPanel data:');
  console.log(`  Slug: ${panelData.slug}`);
  console.log(`  Name: ${panelData.name}`);
  console.log(`  Description: ${panelData.description}`);
  console.log(`  Mode: ${panelData.mode}`);
  console.log(`  Framework: ${panelData.framework}`);
  console.log(`  Agents: ${panelData.suggested_agents.length}`);
  console.log(`  Nodes: ${panelData.metadata.node_count}`);
  console.log(`  Edges: ${panelData.metadata.edge_count}`);

  // Insert into panels table
  console.log('\n⏳ Inserting into panels table...');
  const { data: panel, error } = await supabase
    .from('panels')
    .insert(panelData)
    .select()
    .single();

  if (error) {
    console.error('\n❌ Error creating panel:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);

    throw error;
  }

  console.log('\n✅ Panel created successfully!');
  console.log(`   ID: ${panel.id}`);
  console.log(`   Name: ${panel.name}`);
  console.log(`   Created at: ${panel.created_at}`);

  return panel;
}

async function verifyPanel(panelId) {
  console.log('\n🔍 Verifying panel was saved correctly...');

  const { data: panel, error } = await supabase
    .from('panels')
    .select('*')
    .eq('id', panelId)
    .single();

  if (error) {
    throw new Error(`Failed to verify panel: ${error.message}`);
  }

  console.log('✅ Panel verification successful!');
  console.log(`   ID: ${panel.id}`);
  console.log(`   Slug: ${panel.slug}`);
  console.log(`   Name: ${panel.name}`);
  console.log(`   Agents: ${panel.suggested_agents?.length || 0}`);
  console.log(`   Workflow nodes: ${panel.metadata?.workflow_definition?.nodes?.length || 0}`);
  console.log(`   Workflow edges: ${panel.metadata?.workflow_definition?.edges?.length || 0}`);

  return panel;
}

function getSchemaSuggestion() {
  return `
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
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON user_panels(last_used_at DESC);
`;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 Create Test Panel with Random Agents');
  console.log('='.repeat(70));

  try {
    // Step 1: Get 2 random active agents
    const agents = await getRandomActiveAgents(2);

    // Step 2: Create workflow definition
    const workflowDefinition = await createWorkflowDefinition(agents);

    // Step 3: Create the panel
    const panel = await createTestPanel(agents, workflowDefinition);

    // Step 4: Verify panel was saved
    await verifyPanel(panel.id);

    console.log('\n' + '='.repeat(70));
    console.log('✅ SUCCESS! Test panel created successfully');
    console.log('='.repeat(70));
    console.log('\nPanel Summary:');
    console.log(`  ID: ${panel.id}`);
    console.log(`  Name: ${panel.name}`);
    console.log(`  Experts: ${agents.map(a => a.name).join(', ')}`);
    console.log(`  Mode: ${panel.mode}`);
    console.log(`  Framework: ${panel.framework}`);
    console.log('\nYou can now:');
    console.log(`  1. View it in the UI at /ask-panel/${panel.id}`);
    console.log('  2. Test the consultation workflow');
    console.log('  3. Modify it in the panel designer');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ FAILED to create test panel');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);

    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }

    process.exit(1);
  }
}

main();
