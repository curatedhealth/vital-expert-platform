const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tool definitions based on LangChain tools
const TOOL_REGISTRY = [
  {
    tool_key: 'web_search',
    name: 'Web Search',
    description: 'Search the web for current information, news, and resources',
    tool_type: 'api',
    category: 'research',
    requires_api_key: true,
    is_active: true
  },
  {
    tool_key: 'pubmed_search',
    name: 'PubMed Search',
    description: 'Search medical and scientific literature from PubMed/MEDLINE',
    tool_type: 'api',
    category: 'medical_research',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'clinical_guidelines',
    name: 'Clinical Guidelines Database',
    description: 'Access evidence-based clinical practice guidelines',
    tool_type: 'api',
    category: 'medical_research',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'drug_database',
    name: 'Drug Information Database',
    description: 'Access comprehensive drug information, interactions, and dosing',
    tool_type: 'api',
    category: 'pharmaceutical',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'regulatory_database',
    name: 'Regulatory Database',
    description: 'Access FDA, EMA, and other regulatory agency databases',
    tool_type: 'api',
    category: 'regulatory',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'fda_guidance',
    name: 'FDA Guidance Documents',
    description: 'Search and retrieve FDA guidance documents',
    tool_type: 'api',
    category: 'regulatory',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'clinicaltrials_gov',
    name: 'ClinicalTrials.gov',
    description: 'Search clinical trials registry and results database',
    tool_type: 'api',
    category: 'clinical_research',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'data_analysis',
    name: 'Data Analysis Tool',
    description: 'Perform statistical analysis and data processing',
    tool_type: 'function',
    category: 'analytics',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'statistical_tools',
    name: 'Statistical Analysis',
    description: 'Advanced statistical methods and hypothesis testing',
    tool_type: 'function',
    category: 'analytics',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'visualization',
    name: 'Data Visualization',
    description: 'Create charts, graphs, and visual representations of data',
    tool_type: 'function',
    category: 'analytics',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'document_generation',
    name: 'Document Generator',
    description: 'Generate formatted documents and reports',
    tool_type: 'function',
    category: 'documentation',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'citation_manager',
    name: 'Citation Manager',
    description: 'Manage references and generate citations',
    tool_type: 'function',
    category: 'documentation',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'template_library',
    name: 'Template Library',
    description: 'Access document templates and forms',
    tool_type: 'function',
    category: 'documentation',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'patent_search',
    name: 'Patent Search',
    description: 'Search global patent databases',
    tool_type: 'api',
    category: 'legal',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'legal_database',
    name: 'Legal Database',
    description: 'Access legal precedents and regulations',
    tool_type: 'api',
    category: 'legal',
    requires_api_key: false,
    is_active: true
  },
  {
    tool_key: 'market_research',
    name: 'Market Research',
    description: 'Access market data and competitive intelligence',
    tool_type: 'api',
    category: 'business',
    requires_api_key: true,
    is_active: true
  },
  {
    tool_key: 'competitive_intelligence',
    name: 'Competitive Intelligence',
    description: 'Analyze competitor products and strategies',
    tool_type: 'api',
    category: 'business',
    requires_api_key: true,
    is_active: true
  }
];

async function linkAgentsToTools() {
  console.log('🔗 Linking Agents to Tools...\n');

  // For now, update agents metadata with tool_keys until tables are created
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*');

  if (error) throw error;

  console.log(`📋 Processing ${agents.length} agents...\n`);

  let updated = 0;

  for (const agent of agents) {
    // Get tools from metadata
    const toolNames = agent.metadata?.tools || [];

    if (toolNames.length === 0) {
      continue;
    }

    // Map tool names to tool_keys
    const toolKeys = toolNames.map(toolName => {
      const normalized = toolName.toLowerCase().replace(/\s+/g, '_');
      return normalized;
    });

    // Update agent metadata with tool_keys for LangChain integration
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        metadata: {
          ...(agent.metadata || {}),
          tool_keys: toolKeys
        }
      })
      .eq('id', agent.id);

    if (updateError) {
      console.log(`❌ [${agent.display_name}] Error: ${updateError.message}`);
    } else {
      console.log(`✅ [${agent.display_name}] Linked ${toolKeys.length} tools`);
      updated++;
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${agents.length - updated}`);

  // Print tool registry for reference
  console.log('\n📚 TOOL REGISTRY:');
  console.log('  Available tools for LangChain integration:');
  TOOL_REGISTRY.forEach(tool => {
    console.log(`    - ${tool.tool_key}: ${tool.name}`);
  });

  console.log('\n✅ Agent-tool linking complete!');
  console.log('\nℹ️  Note: Run the tool_registry_system migration to create');
  console.log('   the tools and agent_tool_assignments tables for full integration.');
}

linkAgentsToTools().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
