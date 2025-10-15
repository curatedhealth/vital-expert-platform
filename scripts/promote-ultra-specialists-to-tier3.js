const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ultra-specialist indicators for Tier 3 promotion
const TIER3_INDICATORS = {
  // Safety-critical requiring highest accuracy
  safetyCritical: [
    'dosing', 'drug interaction', 'adverse', 'toxicity', 'safety',
    'pharmacovigilance', 'signal detection', 'safety reporting',
    'medication reconciliation', 'medical monitor'
  ],

  // Highly specialized clinical domains
  ultraSpecialized: [
    'gene therapy', 'car-t', 'crispr', 'stem cell', 'cell therapy',
    'antibody-drug conjugate', 'bispecific', 'oncolytic',
    'radiopharmaceutical', 'nanomedicine', 'exosome',
    'oligonucleotide', 'mrna vaccine', 'senolytic'
  ],

  // Regulatory critical path
  regulatoryCritical: [
    'regulatory strategy', 'fda regulatory', 'breakthrough therapy',
    'orphan drug', 'ind-enabling', 'advanced therapy regulatory'
  ],

  // Advanced research requiring deep expertise
  advancedResearch: [
    'quantum chemistry', 'ai drug discovery', 'multi-omics',
    'single-cell analysis', 'organoid', 'fragment-based',
    'molecular dynamics', 'mass spectrometry imaging',
    'liquid biopsy', 'epigenetic therapy'
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
  const searchText = `${agent.display_name} ${agent.description || ''}`.toLowerCase();

  // Check all tier 3 indicator categories
  for (const [category, keywords] of Object.entries(TIER3_INDICATORS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return { shouldPromote: true, reason: category, keyword };
      }
    }
  }

  return { shouldPromote: false };
}

function isMedicalAgent(agent) {
  const medicalKeywords = [
    'clinical', 'medical', 'patient', 'physician', 'pharmacist',
    'drug', 'medication', 'therapy', 'treatment', 'diagnosis',
    'pharmaceutical', 'pharmacology', 'toxicology', 'oncology'
  ];
  const searchText = `${agent.display_name} ${agent.description || ''}`.toLowerCase();
  return medicalKeywords.some(kw => searchText.includes(kw));
}

async function promoteUltraSpecialists() {
  console.log('⬆️  Starting Ultra-Specialist Tier 3 Promotion...\n');

  // Get all Tier 1 and Tier 2 agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .in('tier', [1, 2]);

  if (error) throw error;

  console.log(`📋 Analyzing ${agents.length} Tier 1 & 2 agents for promotion...\n`);

  let promoted = 0;
  let skipped = 0;

  for (const agent of agents) {
    const tier3Check = shouldBecomeTier3(agent);

    if (!tier3Check.shouldPromote) {
      skipped++;
      continue;
    }

    const isMedical = isMedicalAgent(agent);
    const modelConfig = isMedical ? TIER3_MODELS.medical : TIER3_MODELS.general;

    console.log(`\n⬆️  [${agent.display_name}]`);
    console.log(`   Reason: ${tier3Check.reason} (keyword: "${tier3Check.keyword}")`);
    console.log(`   Current: Tier ${agent.tier} | ${agent.model}`);
    console.log(`   New: Tier 3 | ${modelConfig.model}`);

    const updates = {
      tier: 3,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
      metadata: {
        ...(agent.metadata || {}),
        model_justification: modelConfig.justification,
        model_citation: modelConfig.citation,
        tier3_reason: tier3Check.reason,
        promoted_from_tier: agent.tier
      }
    };

    const { error: updateError } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agent.id);

    if (updateError) {
      console.log(`   ❌ Error: ${updateError.message}`);
    } else {
      console.log(`   ✅ Promoted successfully`);
      promoted++;
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ⬆️  Promoted to Tier 3: ${promoted}`);
  console.log(`   ⏭️  Kept in current tier: ${skipped}`);

  // Final distribution check
  const { data: tierCount } = await supabase
    .from('agents')
    .select('tier');

  const distribution = { tier1: 0, tier2: 0, tier3: 0 };
  tierCount.forEach(agent => {
    const tierKey = 'tier' + (agent.tier || 1);
    distribution[tierKey]++;
  });

  console.log('\n📈 FINAL TIER DISTRIBUTION:');
  console.log(`   Tier 3 (Ultra-Specialist): ${distribution.tier3}`);
  console.log(`   Tier 2 (Specialist): ${distribution.tier2}`);
  console.log(`   Tier 1 (Foundational): ${distribution.tier1}`);

  console.log('\n✅ Ultra-specialist promotion complete!');
}

promoteUltraSpecialists().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
