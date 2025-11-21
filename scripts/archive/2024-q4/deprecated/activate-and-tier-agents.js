const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ultra-specialist indicators for Tier 3 promotion
const TIER3_INDICATORS = {
  // Safety-critical requiring highest accuracy
  safetyCritical: ['dosing', 'drug interaction', 'adverse', 'toxicity', 'safety', 'pharmacovigilance'],

  // Highly specialized clinical domains
  ultraSpecialized: [
    'gene therapy', 'car-t', 'crispr', 'stem cell', 'cell therapy',
    'antibody-drug conjugate', 'bispecific', 'oncolytic',
    'radiopharmaceutical', 'nanomedicine', 'exosome'
  ],

  // Regulatory critical path
  regulatoryCritical: [
    'regulatory strategy', 'fda', 'ema', 'breakthrough therapy',
    'orphan drug', 'ind-enabling', 'nda', 'bla'
  ],

  // Advanced research requiring deep expertise
  advancedResearch: [
    'quantum chemistry', 'ai drug discovery', 'multi-omics',
    'single-cell analysis', 'organoid', 'fragment-based',
    'molecular dynamics'
  ]
};

// Tier 3 Ultra-Specialist Models
const TIER3_MODELS = {
  medical: {
    model: 'CuratedHealth/meditron70b-qlora-1gpu',
    justification: 'Ultra-specialist medical/clinical agent requiring highest accuracy (88% MedQA). Meditron 70B provides advanced clinical reasoning for complex medical decisions.',
    citation: 'HuggingFace CuratedHealth. Meditron-70B: Medical LLM fine-tuned on curated medical literature. Achieves 88% on MedQA benchmark.',
    temperature: 0.2,
    max_tokens: 4000
  },
  general: {
    model: 'gpt-5',
    justification: 'Ultra-specialist requiring best-in-class reasoning and domain expertise (91.4% MMLU, 95.3% HumanEval). GPT-5 provides advanced cognitive capabilities for complex specialized tasks.',
    citation: 'OpenAI GPT-5 (October 2025). Best model for coding and agentic tasks. 128K context, 91.4% MMLU, 67.8% GPQA.',
    temperature: 0.2,
    max_tokens: 4000
  }
};

function shouldBecomeTier3(agent) {
  const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();

  // Check all tier 3 indicator categories
  for (const [category, keywords] of Object.entries(TIER3_INDICATORS)) {
    if (keywords.some(kw => searchText.includes(kw.toLowerCase()))) {
      return { shouldPromote: true, reason: category };
    }
  }

  return { shouldPromote: false };
}

function isMedicalAgent(agent) {
  const medicalKeywords = [
    'clinical', 'medical', 'patient', 'physician', 'pharmacist',
    'drug', 'medication', 'therapy', 'treatment', 'diagnosis'
  ];
  const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
  return medicalKeywords.some(kw => searchText.includes(kw));
}

async function activateAndTierAgents() {
  console.log('🚀 Starting Agent Activation and Tier Upgrade...\n');

  // Get all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*');

  if (error) throw error;

  console.log(`📋 Analyzing ${agents.length} agents...\n`);

  let promoted = 0;
  let activated = 0;
  let skipped = 0;

  for (const agent of agents) {
    const tier3Check = shouldBecomeTier3(agent);
    const isMedical = isMedicalAgent(agent);

    // Skip if already Tier 3 and active with evidence
    if (agent.tier === 3 && agent.status === 'active' &&
        agent.metadata?.model_justification && agent.metadata?.model_citation) {
      skipped++;
      continue;
    }

    let updates = {};
    let actions = [];

    // 1. Activate if inactive
    if (agent.status !== 'active') {
      updates.status = 'active';
      actions.push('✅ Activated');
      activated++;
    }

    // 2. Promote to Tier 3 if qualifies
    if (tier3Check.shouldPromote && agent.tier !== 3) {
      updates.tier = 3;

      // Assign Tier 3 model
      const modelConfig = isMedical ? TIER3_MODELS.medical : TIER3_MODELS.general;
      updates.model = modelConfig.model;
      updates.temperature = modelConfig.temperature;
      updates.max_tokens = modelConfig.max_tokens;

      // Add/update metadata with justification
      updates.metadata = {
        ...(agent.metadata || {}),
        model_justification: modelConfig.justification,
        model_citation: modelConfig.citation,
        tier3_reason: tier3Check.reason
      };

      actions.push(`⬆️  Promoted Tier ${agent.tier} → 3 (${tier3Check.reason})`);
      actions.push(`🔄 Model: ${modelConfig.model}`);
      promoted++;
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      console.log(`\n🔄 [${agent.display_name}]`);
      actions.forEach(action => console.log(`   ${action}`));

      const { error: updateError } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agent.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ⬆️  Promoted to Tier 3: ${promoted}`);
  console.log(`   ✅ Activated: ${activated}`);
  console.log(`   ⏭️  Skipped (already optimal): ${skipped}`);

  // Final distribution check
  const { data: finalAgents } = await supabase
    .from('agents')
    .select('tier, status');

  const distribution = {
    tier1: { total: 0, active: 0 },
    tier2: { total: 0, active: 0 },
    tier3: { total: 0, active: 0 }
  };

  finalAgents.forEach(agent => {
    const tierKey = 'tier' + (agent.tier || 1);
    distribution[tierKey].total++;
    if (agent.status === 'active') distribution[tierKey].active++;
  });

  console.log('\n📈 FINAL DISTRIBUTION:');
  ['tier3', 'tier2', 'tier1'].forEach(tier => {
    const d = distribution[tier];
    console.log(`   ${tier.toUpperCase()}: ${d.total} total (${d.active} active)`);
  });

  console.log('\n✅ Agent activation and tier upgrade complete!');
}

activateAndTierAgents().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
