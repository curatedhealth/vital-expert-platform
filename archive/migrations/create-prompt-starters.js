#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// PRISM Prompt Starters - Short, actionable prompts for quick access
const PROMPT_STARTERS = {
  'draft-regulatory-document': {
    title: 'Create FDA Regulatory Document',
    description: 'Generate a comprehensive FDA-compliant regulatory document using the DRAFT framework',
    starter_text: 'Create an FDA-compliant regulatory document for {product_name} in {therapeutic_area}. Include all required sections following 21 CFR guidelines.',
    variables: ['product_name', 'therapeutic_area', 'submission_type', 'target_date'],
    category: 'regulatory',
    complexity: 'complex'
  },
  'radar-regulatory-intelligence': {
    title: 'Monitor Regulatory Activities',
    description: 'Track regulatory activities and competitive filings across target agencies',
    starter_text: 'Monitor regulatory activities for {therapeutic_area} products across {agencies} over the next {timeframe}.',
    variables: ['therapeutic_area', 'agencies', 'timeframe', 'competitors'],
    category: 'regulatory',
    complexity: 'moderate'
  },
  'reply-regulatory-response': {
    title: 'Respond to Regulatory Inquiry',
    description: 'Develop comprehensive response strategy for FDA Complete Response Letters',
    starter_text: 'Develop a response strategy for {product_name} CRL addressing {key_issues} by {deadline}.',
    variables: ['product_name', 'key_issues', 'deadline', 'application_number'],
    category: 'regulatory',
    complexity: 'complex'
  },
  'guide-global-regulatory-strategy': {
    title: 'Plan Global Regulatory Strategy',
    description: 'Coordinate regulatory pathways across major markets (FDA, EMA, PMDA, Health Canada)',
    starter_text: 'Develop a global regulatory strategy for {product} with {lead_market} as primary market, targeting {regions}.',
    variables: ['product', 'lead_market', 'regions', 'submission_strategy'],
    category: 'regulatory',
    complexity: 'complex'
  },
  'design-clinical-protocol': {
    title: 'Design Clinical Study Protocol',
    description: 'Create comprehensive clinical study protocol following ICH GCP guidelines',
    starter_text: 'Design a {phase} clinical protocol for {product} in {indication} targeting {population}.',
    variables: ['phase', 'product', 'indication', 'population', 'endpoints'],
    category: 'clinical',
    complexity: 'complex'
  },
  'qualify-site-assessment': {
    title: 'Conduct Site Qualification',
    description: 'Evaluate investigator sites for clinical trial participation and GCP compliance',
    starter_text: 'Qualify {site_count} sites for {protocol} in {indication} across {regions}.',
    variables: ['site_count', 'protocol', 'indication', 'regions', 'enrollment_goals'],
    category: 'clinical',
    complexity: 'moderate'
  },
  'detect-safety-case': {
    title: 'Process Safety Case',
    description: 'Process adverse event cases following ICH E2A-E2F guidelines',
    starter_text: 'Process safety case {case_id} for {product} with {severity} severity from {source}.',
    variables: ['case_id', 'product', 'severity', 'source', 'reporter_type'],
    category: 'safety',
    complexity: 'complex'
  },
  'worth-health-economics': {
    title: 'Conduct Health Economics Analysis',
    description: 'Design and conduct health economic evaluations and outcomes research',
    starter_text: 'Conduct health economics analysis for {product} in {indication} vs {comparators} from {perspective} perspective.',
    variables: ['product', 'indication', 'comparators', 'perspective', 'population'],
    category: 'market_access',
    complexity: 'complex'
  },
  'connect-kol-engagement': {
    title: 'Plan KOL Engagement',
    description: 'Develop strategy for engaging key opinion leaders and clinical experts',
    starter_text: 'Develop KOL engagement strategy for {kol_name} at {institution} specializing in {specialty}.',
    variables: ['kol_name', 'institution', 'specialty', 'research_focus', 'tier'],
    category: 'stakeholder_engagement',
    complexity: 'moderate'
  },
  'study-rwe-design': {
    title: 'Design Real-World Evidence Study',
    description: 'Create observational research study for generating real-world evidence',
    starter_text: 'Design RWE study for {product} in {indication} using {data_sources} to answer {research_question}.',
    variables: ['product', 'indication', 'data_sources', 'research_question', 'cohort'],
    category: 'evidence',
    complexity: 'complex'
  },
  'write-regulatory-document': {
    title: 'Write Regulatory Document',
    description: 'Create regulatory submission documents following ICH E3 guidelines',
    starter_text: 'Write {document_type} for {study} in {phase} for {indication} following ICH E3 {section}.',
    variables: ['document_type', 'study', 'phase', 'indication', 'section'],
    category: 'medical_writing',
    complexity: 'complex'
  },
  'watch-competitive-intelligence': {
    title: 'Monitor Competitive Landscape',
    description: 'Track competitor activities and market trends across therapeutic areas',
    starter_text: 'Monitor competitive landscape for {therapeutic_area} in {markets} focusing on {competitors}.',
    variables: ['therapeutic_area', 'markets', 'competitors', 'timeframe', 'focus_areas'],
    category: 'competitive_intelligence',
    complexity: 'moderate'
  },
  'project-management-framework': {
    title: 'Manage Digital Health Project',
    description: 'Coordinate cross-functional teams for digital health product development',
    starter_text: 'Manage {project_type} project for {product} with {timeline} timeline and {budget} budget.',
    variables: ['project_type', 'product', 'timeline', 'budget', 'team_size'],
    category: 'project_management',
    complexity: 'moderate'
  },
  'forge-digital-health-development': {
    title: 'Develop Digital Health Solution',
    description: 'Create Software as Medical Device (SaMD) and Digital Therapeutics platforms',
    starter_text: 'Develop {product_type} for {indication} with {device_class} classification using {tech_stack}.',
    variables: ['product_type', 'indication', 'device_class', 'tech_stack', 'integrations'],
    category: 'digital_health',
    complexity: 'complex'
  },
  'prism-clinical-protocol-analysis': {
    title: 'Analyze Clinical Protocol',
    description: 'Provide structured analysis of clinical research protocols using PRISM framework',
    starter_text: 'Analyze clinical protocol for {study} in {indication} focusing on {analysis_areas}.',
    variables: ['study', 'indication', 'analysis_areas', 'protocol_details'],
    category: 'clinical',
    complexity: 'complex'
  },
  'vital-sales-performance-optimization': {
    title: 'Optimize Sales Performance',
    description: 'Analyze sales data and recommend optimization strategies for pharmaceutical sales',
    starter_text: 'Analyze sales performance for {territory} with {products} focusing on {metrics}.',
    variables: ['territory', 'products', 'metrics', 'timeframe', 'goals'],
    category: 'commercial',
    complexity: 'moderate'
  },
  'vital-market-access-strategy': {
    title: 'Develop Market Access Strategy',
    description: 'Create comprehensive market access strategies for payer relations and value-based care',
    starter_text: 'Develop market access strategy for {product} in {indication} targeting {payers} in {markets}.',
    variables: ['product', 'indication', 'payers', 'markets', 'barriers'],
    category: 'market_access',
    complexity: 'complex'
  }
};

async function createPromptStarters() {
  console.log('🚀 CREATING PROMPT STARTERS FOR PRISM PROMPTS\n');
  console.log('=' .repeat(70));

  try {
    // Step 1: Get all existing PRISM prompts
    console.log('📋 Step 1: Fetching existing PRISM prompts...');
    
    const { data: existingPrompts, error: fetchError } = await supabase
      .from('prompts')
      .select('id, name, display_name')
      .or('name.like.*prism*,name.like.*draft*,name.like.*radar*,name.like.*reply*,name.like.*guide*,name.like.*design*,name.like.*qualify*,name.like.*detect*,name.like.*worth*,name.like.*connect*,name.like.*study*,name.like.*write*,name.like.*watch*,name.like.*project*,name.like.*forge*,name.like.*vital*');

    if (fetchError) {
      console.error('❌ Error fetching prompts:', fetchError.message);
      return;
    }

    console.log(`   ✅ Found ${existingPrompts?.length || 0} PRISM prompts`);

    // Step 2: Update each prompt with its starter
    console.log('\n📋 Step 2: Adding prompt starters...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const prompt of existingPrompts || []) {
      const starter = PROMPT_STARTERS[prompt.name];
      
      if (!starter) {
        console.log(`   ⚠️  No starter defined for ${prompt.name}`);
        continue;
      }

      try {
        const { error } = await supabase
          .from('prompts')
          .update({
            prompt_starter: starter.starter_text,
            tags: [...(prompt.tags || []), 'prompt_starter', starter.category],
            target_users: [...(prompt.target_users || []), 'healthcare_professionals', 'regulatory_affairs'],
            use_cases: [...(prompt.use_cases || []), starter.category],
            customization_guide: `Variables: ${starter.variables.join(', ')}. Customize the starter text by replacing variables with specific values.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', prompt.id);

        if (error) {
          console.log(`   ❌ Failed to update ${prompt.name}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Added starter for ${prompt.display_name}`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error updating ${prompt.name}: ${err.message}`);
        errorCount++;
      }
    }

    // Step 3: Verify updates
    console.log('\n📋 Step 3: Verifying prompt starters...');
    
    const { data: updatedPrompts, error: verifyError } = await supabase
      .from('prompts')
      .select('name, display_name, prompt_starter, tags')
      .not('prompt_starter', 'is', null)
      .limit(5);

    if (verifyError) {
      console.log(`   ❌ Error verifying: ${verifyError.message}`);
    } else {
      console.log(`   ✅ Successfully verified ${updatedPrompts?.length || 0} prompts with starters:`);
      updatedPrompts?.forEach(prompt => {
        console.log(`      - ${prompt.display_name}: ${prompt.prompt_starter?.substring(0, 50)}...`);
      });
    }

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 PROMPT STARTERS CREATION SUMMARY');
    console.log('=' .repeat(70));
    
    console.log(`\n✅ SUCCESSFULLY UPDATED: ${successCount} prompts`);
    console.log(`❌ FAILED UPDATES: ${errorCount} prompts`);
    console.log(`📊 TOTAL PROMPTS WITH STARTERS: ${updatedPrompts?.length || 0}`);

    console.log('\n🚀 PROMPT STARTERS ARE NOW READY FOR USE!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Link prompts to relevant agents');
    console.log('   2. Integrate with chat interface');
    console.log('   3. Test prompt functionality');
    console.log('   4. Set up performance monitoring');

  } catch (error) {
    console.error('❌ Creation failed:', error.message);
  }
}

// Run the creation
createPromptStarters();
