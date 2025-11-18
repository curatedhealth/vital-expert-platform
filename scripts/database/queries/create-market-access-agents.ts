import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Market Access agents to create
const marketAccessAgents = [
  // HEOR Department
  { name: 'heor_director', display_name: 'HEOR Director', department: 'Health Economics & Outcomes Research (HEOR)', role: 'HEOR Director', description: 'Lead health economics and outcomes research strategy and evidence generation' },
  { name: 'health_economist', display_name: 'Health Economist', department: 'Health Economics & Outcomes Research (HEOR)', role: 'Health Economist', description: 'Conduct economic modeling and cost-effectiveness analysis' },
  { name: 'outcomes_research_scientist', display_name: 'Outcomes Research Scientist', department: 'Health Economics & Outcomes Research (HEOR)', role: 'Outcomes Research Scientist', description: 'Design and execute real-world evidence studies' },
  { name: 'rwe_analyst', display_name: 'RWE Analyst', department: 'Health Economics & Outcomes Research (HEOR)', role: 'RWE Analyst', description: 'Analyze real-world data and generate insights' },

  // Payer Relations & Account Management
  { name: 'payer_account_manager', display_name: 'Payer Account Manager', department: 'Payer Relations & Account Management', role: 'Payer Account Manager', description: 'Manage relationships with key payer accounts' },
  { name: 'payer_relations_director', display_name: 'Payer Relations Director', department: 'Payer Relations & Account Management', role: 'Payer Relations Director', description: 'Lead payer engagement and account strategy' },
  { name: 'national_account_director', display_name: 'National Account Director', department: 'Payer Relations & Account Management', role: 'National Account Director', description: 'Manage national payer accounts and negotiations' },
  { name: 'regional_account_manager', display_name: 'Regional Account Manager', department: 'Payer Relations & Account Management', role: 'Regional Account Manager', description: 'Manage regional payer relationships and contracts' },

  // Pricing & Contracting
  { name: 'pricing_strategy_director', display_name: 'Pricing Strategy Director', department: 'Pricing & Contracting', role: 'Pricing Strategy Director', description: 'Develop global and regional pricing strategies' },
  { name: 'pricing_analyst', display_name: 'Pricing Analyst', department: 'Pricing & Contracting', role: 'Pricing Analyst', description: 'Analyze pricing data and market dynamics' },
  { name: 'contracting_specialist', display_name: 'Contracting Specialist', department: 'Pricing & Contracting', role: 'Contracting Specialist', description: 'Develop and negotiate payer contracts' },
  { name: 'rebate_analyst', display_name: 'Rebate Analyst', department: 'Pricing & Contracting', role: 'Rebate Analyst', description: 'Manage rebate programs and analytics' },

  // Value & Evidence
  { name: 'value_evidence_lead', display_name: 'Value & Evidence Lead', department: 'Value & Evidence', role: 'Value & Evidence Lead', description: 'Lead value proposition development and evidence strategy' },
  { name: 'evidence_strategy_manager', display_name: 'Evidence Strategy Manager', department: 'Value & Evidence', role: 'Evidence Strategy Manager', description: 'Develop evidence generation plans and strategies' },
  { name: 'value_dossier_developer', display_name: 'Value Dossier Developer', department: 'Value & Evidence', role: 'Value Dossier Developer', description: 'Create comprehensive value dossiers for payers' },

  // Access Strategy
  { name: 'access_strategy_lead', display_name: 'Access Strategy Lead', department: 'Access Strategy', role: 'Access Strategy Lead', description: 'Develop comprehensive market access strategies' },
  { name: 'market_access_director', display_name: 'Market Access Director', department: 'Access Strategy', role: 'Market Access Director', description: 'Lead market access planning and execution' },

  // Reimbursement
  { name: 'reimbursement_specialist', display_name: 'Reimbursement Specialist', department: 'Reimbursement', role: 'Reimbursement Specialist', description: 'Navigate reimbursement pathways and coding' },
  { name: 'reimbursement_manager', display_name: 'Reimbursement Manager', department: 'Reimbursement', role: 'Reimbursement Manager', description: 'Manage reimbursement strategy and submissions' },
  { name: 'coverage_specialist', display_name: 'Coverage Specialist', department: 'Reimbursement', role: 'Coverage Specialist', description: 'Optimize coverage strategies and policies' },
  { name: 'policy_analyst', display_name: 'Policy Analyst', department: 'Reimbursement', role: 'Policy Analyst', description: 'Analyze healthcare policies and reimbursement trends' },

  // Commercial Analytics
  { name: 'commercial_analytics_manager', display_name: 'Commercial Analytics Manager', department: 'Commercial Analytics', role: 'Commercial Analytics Manager', description: 'Lead commercial analytics and insights' },
  { name: 'data_insights_specialist', display_name: 'Data Insights Specialist', department: 'Commercial Analytics', role: 'Data Insights Specialist', description: 'Generate data-driven insights for decision making' },

  // Market Insights & Intelligence
  { name: 'market_intelligence_analyst', display_name: 'Market Intelligence Analyst', department: 'Market Insights & Intelligence', role: 'Market Intelligence Analyst', description: 'Analyze market trends and competitive landscape' },

  // Patient Access Services
  { name: 'patient_access_coordinator', display_name: 'Patient Access Coordinator', department: 'Patient Access Services', role: 'Patient Access Coordinator', description: 'Coordinate patient support and access programs' },
  { name: 'copay_program_manager', display_name: 'Copay Program Manager', department: 'Patient Access Services', role: 'Copay Program Manager', description: 'Manage copay assistance programs' },
  { name: 'hub_services_manager', display_name: 'Hub Services Manager', department: 'Patient Access Services', role: 'Hub Services Manager', description: 'Oversee patient hub services and operations' },
  { name: 'patient_assistance_specialist', display_name: 'Patient Assistance Specialist', department: 'Patient Access Services', role: 'Patient Assistance Specialist', description: 'Support patient financial assistance programs' },

  // Policy & Government Affairs
  { name: 'policy_government_affairs_director', display_name: 'Policy & Government Affairs Director', department: 'Policy & Government Affairs', role: 'director', description: 'Lead policy development and government relations' },

  // Trade & Distribution
  { name: 'trade_distribution_manager', display_name: 'Trade & Distribution Manager', department: 'Trade & Distribution', role: 'manager', description: 'Manage trade channels and distribution strategies' },
];

async function createMarketAccessAgents() {
  console.log('\n🏢 CREATING MARKET ACCESS AGENTS\n');
  console.log('='.repeat(80));

  // Get market_access business function
  const { data: maFunction } = await supabase
    .from('business_functions')
    .select('id, name')
    .eq('name', 'market_access')
    .single();

  if (!maFunction) {
    console.error('❌ Market Access function not found');
    return;
  }

  console.log(`✅ Found business function: ${maFunction.name} (${maFunction.id})\n`);
  console.log(`📊 Creating ${marketAccessAgents.length} Market Access agents...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const agentData of marketAccessAgents) {
    // Check if agent already exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id, name')
      .eq('name', agentData.name)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped: ${agentData.display_name} (already exists)`);
      skipped++;
      continue;
    }

    // Create system prompt
    const systemPrompt = `YOU ARE: ${agentData.display_name}, a specialized Market Access expert in ${agentData.department}.

YOU DO: ${agentData.description}

YOUR EXPERTISE:
- Market access strategy and tactics
- Payer landscape and dynamics
- Value proposition development
- Evidence-based decision making
- Healthcare policy and reimbursement

PROVIDE: Strategic, evidence-based guidance to support market access objectives and patient access to therapies.`;

    // Create the agent
    const { error } = await supabase
      .from('agents')
      .insert({
        name: agentData.name,
        display_name: agentData.display_name,
        description: agentData.description,
        system_prompt: systemPrompt,
        business_function: 'market_access', // Use readable name
        department: agentData.department,
        role: agentData.role,
        model: 'gpt-4',
        avatar: 'avatar_0001', // Default avatar
        color: '#8B5CF6', // Purple for market access
        tier: 2,
        priority: 50,
        status: 'active',
        is_custom: false,
        is_public: true,
        rag_enabled: true,
        temperature: 0.7,
        max_tokens: 2000,
        implementation_phase: 1,
        capabilities: ['Market Access Strategy', 'Payer Engagement', 'Value Communication'],
        knowledge_domains: ['market-access', 'health-economics'],
      });

    if (error) {
      console.error(`❌ Error creating ${agentData.display_name}:`, error.message);
      errors++;
    } else {
      console.log(`✅ Created: ${agentData.display_name} (${agentData.department} - ${agentData.role})`);
      created++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 CREATION SUMMARY:');
  console.log(`   ✅ Created: ${created} agents`);
  console.log(`   ⏭️  Skipped: ${skipped} agents (already exist)`);
  console.log(`   ❌ Errors: ${errors} agents`);
  console.log(`   📈 Total processed: ${marketAccessAgents.length} agents`);

  // Verify the new structure
  const { data: allMA } = await supabase
    .from('agents')
    .select('department, role')
    .eq('business_function', 'market_access')
    .eq('status', 'active');

  const uniqueDepts = [...new Set(allMA?.map(a => a.department))].sort();
  const uniqueRoles = [...new Set(allMA?.map(a => a.role))].sort();

  console.log('\n🏛️  MARKET ACCESS STRUCTURE (Updated):');
  console.log(`   Total Market Access Agents: ${allMA?.length || 0}`);
  console.log(`   Unique Departments: ${uniqueDepts.length}`);
  uniqueDepts.forEach(dept => console.log(`      • ${dept}`));
  console.log(`\n   Unique Roles: ${uniqueRoles.length}`);
  uniqueRoles.forEach(role => console.log(`      • ${role}`));

  console.log('\n' + '='.repeat(80));
  console.log('✅ Complete!\n');
  console.log('💡 The frontend will now show these departments and roles in the dropdowns');
  console.log('   when "market_access" business function is selected.\n');
}

createMarketAccessAgents();
