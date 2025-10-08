#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Domain mapping for prompts to agents
const DOMAIN_MAPPING = {
  'regulatory_affairs': ['Regulatory Affairs', 'FDA', 'Compliance', 'Submission'],
  'clinical_development': ['Clinical Development', 'Clinical Trial', 'Protocol', 'Study'],
  'clinical_operations': ['Clinical Operations', 'Site Management', 'GCP', 'Monitoring'],
  'pharmacovigilance': ['Pharmacovigilance', 'Safety', 'Adverse Events', 'PV'],
  'health_economics': ['Health Economics', 'HEOR', 'Market Access', 'Value'],
  'market_access': ['Market Access', 'Payer', 'Reimbursement', 'Access'],
  'medical_affairs': ['Medical Affairs', 'KOL', 'Medical Information', 'MSL'],
  'real_world_evidence': ['Real World Evidence', 'RWE', 'Observational', 'Epidemiology'],
  'regulatory_writing': ['Medical Writing', 'Regulatory Writing', 'Documentation', 'CSR'],
  'market_intelligence': ['Competitive Intelligence', 'Market Research', 'Competitor', 'Intelligence'],
  'digital_health': ['Digital Health', 'SaMD', 'DTx', 'Digital Therapeutics'],
  'project_management': ['Project Management', 'Program Management', 'Operations'],
  'clinical_research': ['Clinical Research', 'Research', 'Clinical', 'Protocol'],
  'sales_analytics': ['Sales', 'Commercial', 'Analytics', 'Performance'],
  'commercial': ['Commercial', 'Sales', 'Marketing', 'Business']
};

// Specific agent-prompt mappings for high-value connections
const SPECIFIC_MAPPINGS = {
  'draft-regulatory-document': ['FDA Regulatory Specialist', 'Regulatory Affairs Manager', 'Submission Specialist'],
  'radar-regulatory-intelligence': ['Regulatory Intelligence Analyst', 'Competitive Intelligence Specialist'],
  'reply-regulatory-response': ['Regulatory Affairs Director', 'FDA Response Specialist'],
  'guide-global-regulatory-strategy': ['Global Regulatory Director', 'International Regulatory Manager'],
  'design-clinical-protocol': ['Clinical Protocol Designer', 'Clinical Development Physician', 'Study Designer'],
  'qualify-site-assessment': ['Clinical Operations Manager', 'Site Qualification Specialist'],
  'detect-safety-case': ['Pharmacovigilance Specialist', 'Drug Safety Associate', 'Safety Manager'],
  'worth-health-economics': ['Health Economics Manager', 'HEOR Specialist', 'Value Demonstration Lead'],
  'connect-kol-engagement': ['Medical Science Liaison', 'KOL Manager', 'Medical Affairs Manager'],
  'study-rwe-design': ['Real World Evidence Scientist', 'Epidemiologist', 'RWE Manager'],
  'write-regulatory-document': ['Medical Writer', 'Regulatory Writer', 'Clinical Study Report Writer'],
  'watch-competitive-intelligence': ['Competitive Intelligence Analyst', 'Market Research Manager'],
  'project-management-framework': ['Project Manager', 'Program Manager', 'Operations Manager'],
  'forge-digital-health-development': ['Digital Health Architect', 'SaMD Developer', 'DTx Specialist'],
  'prism-clinical-protocol-analysis': ['Clinical Research Director', 'Protocol Analyst', 'Clinical Scientist'],
  'vital-sales-performance-optimization': ['Sales Performance Manager', 'Commercial Analytics Lead'],
  'vital-market-access-strategy': ['Market Access Director', 'Payer Relations Manager', 'Access Strategy Lead']
};

async function linkPromptsToAgents() {
  console.log('🔗 LINKING PRISM PROMPTS TO RELEVANT AGENTS\n');
  console.log('=' .repeat(70));

  try {
    // Step 1: Get all PRISM prompts
    console.log('📋 Step 1: Fetching PRISM prompts...');
    
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, name, display_name, domain, prompt_starter')
      .or('name.like.*prism*,name.like.*draft*,name.like.*radar*,name.like.*reply*,name.like.*guide*,name.like.*design*,name.like.*qualify*,name.like.*detect*,name.like.*worth*,name.like.*connect*,name.like.*study*,name.like.*write*,name.like.*watch*,name.like.*project*,name.like.*forge*,name.like.*vital*');

    if (promptsError) {
      console.error('❌ Error fetching prompts:', promptsError.message);
      return;
    }

    console.log(`   ✅ Found ${prompts?.length || 0} PRISM prompts`);

    // Step 2: Get all agents
    console.log('\n📋 Step 2: Fetching agents...');
    
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, business_function, tier, status, specializations, domain_expertise')
      .eq('status', 'active');

    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError.message);
      return;
    }

    console.log(`   ✅ Found ${agents?.length || 0} active agents`);

    // Step 3: Create agent-prompt mappings
    console.log('\n📋 Step 3: Creating agent-prompt mappings...');
    
    const mappings = [];
    let totalMappings = 0;

    for (const prompt of prompts || []) {
      const promptMappings = [];
      
      // Method 1: Specific mappings
      const specificAgentNames = SPECIFIC_MAPPINGS[prompt.name] || [];
      for (const agentName of specificAgentNames) {
        const agent = agents?.find(a => 
          a.display_name?.includes(agentName) || 
          a.name?.includes(agentName.toLowerCase().replace(/\s+/g, '-'))
        );
        if (agent) {
          promptMappings.push({
            agent_id: agent.id,
            prompt_id: prompt.id,
            is_default: true,
            customizations: {
              priority: 'high',
              mapping_type: 'specific',
              agent_name: agent.display_name
            }
          });
        }
      }

      // Method 2: Domain-based mappings
      const domainKeywords = DOMAIN_MAPPING[prompt.domain] || [];
      for (const keyword of domainKeywords) {
        const matchingAgents = agents?.filter(a => 
          a.business_function?.includes(keyword) ||
          a.display_name?.includes(keyword) ||
          a.name?.includes(keyword.toLowerCase()) ||
          a.specializations?.some(s => s?.includes(keyword)) ||
          a.domain_expertise?.some(d => d?.includes(keyword))
        ) || [];

        for (const agent of matchingAgents.slice(0, 3)) { // Limit to top 3 matches per keyword
          if (!promptMappings.find(m => m.agent_id === agent.id)) {
            promptMappings.push({
              agent_id: agent.id,
              prompt_id: prompt.id,
              is_default: false,
              customizations: {
                priority: 'medium',
                mapping_type: 'domain',
                keyword: keyword,
                agent_name: agent.display_name
              }
            });
          }
        }
      }

      // Method 3: Tier-based mappings for high-value prompts
      if (prompt.domain === 'regulatory_affairs' || prompt.domain === 'clinical_development') {
        const tier1Agents = agents?.filter(a => a.tier === 'Tier 1' && a.status === 'active') || [];
        for (const agent of tier1Agents.slice(0, 2)) { // Limit to 2 tier 1 agents
          if (!promptMappings.find(m => m.agent_id === agent.id)) {
            promptMappings.push({
              agent_id: agent.id,
              prompt_id: prompt.id,
              is_default: false,
              customizations: {
                priority: 'high',
                mapping_type: 'tier_based',
                agent_name: agent.display_name
              }
            });
          }
        }
      }

      mappings.push(...promptMappings);
      totalMappings += promptMappings.length;
      
      console.log(`   ✅ ${prompt.display_name}: ${promptMappings.length} agent mappings`);
    }

    // Step 4: Insert mappings into agent_prompts table
    console.log('\n📋 Step 4: Inserting agent-prompt mappings...');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < mappings.length; i += batchSize) {
      const batch = mappings.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('agent_prompts')
          .insert(batch);

        if (error) {
          console.log(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`);
          errorCount += batch.length;
          errors.push({ batch: Math.floor(i/batchSize) + 1, error: error.message });
        } else {
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} mappings inserted`);
          successCount += batch.length;
        }
      } catch (err) {
        console.log(`   ❌ Batch ${Math.floor(i/batchSize) + 1} error: ${err.message}`);
        errorCount += batch.length;
        errors.push({ batch: Math.floor(i/batchSize) + 1, error: err.message });
      }
    }

    // Step 5: Verify mappings
    console.log('\n📋 Step 5: Verifying agent-prompt mappings...');
    
    const { data: verification, error: verifyError } = await supabase
      .from('agent_prompts')
      .select(`
        id,
        is_default,
        customizations,
        agents!inner(display_name, primary_function),
        prompts!inner(display_name, domain)
      `)
      .limit(10);

    if (verifyError) {
      console.log(`   ❌ Error verifying: ${verifyError.message}`);
    } else {
      console.log(`   ✅ Successfully verified ${verification?.length || 0} sample mappings:`);
      verification?.forEach(mapping => {
        console.log(`      - ${mapping.agents?.display_name} ↔ ${mapping.prompts?.display_name} (${mapping.customizations?.mapping_type})`);
      });
    }

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 AGENT-PROMPT LINKING SUMMARY');
    console.log('=' .repeat(70));
    
    console.log(`\n✅ SUCCESSFULLY LINKED: ${successCount} mappings`);
    console.log(`❌ FAILED LINKINGS: ${errorCount} mappings`);
    console.log(`📊 TOTAL MAPPINGS CREATED: ${totalMappings}`);
    console.log(`🔗 PROMPTS LINKED: ${prompts?.length || 0}`);
    console.log(`👥 AGENTS INVOLVED: ${new Set(mappings.map(m => m.agent_id)).size}`);

    if (errors.length > 0) {
      console.log('\n⚠️  LINKING ERRORS:');
      errors.forEach(err => {
        console.log(`   - Batch ${err.batch}: ${err.error}`);
      });
    }

    console.log('\n🚀 AGENT-PROMPT LINKING IS COMPLETE!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test prompt retrieval in chat interface');
    console.log('   2. Implement prompt enhancement functionality');
    console.log('   3. Set up performance monitoring');
    console.log('   4. Create admin prompt management interface');

  } catch (error) {
    console.error('❌ Linking failed:', error.message);
  }
}

// Run the linking
linkPromptsToAgents();
