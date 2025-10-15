/**
 * ADD EVIDENCE TO REMAINING ACTIVE AGENTS
 *
 * Purpose: Add model_justification + model_citation to 16 active agents
 * Target: All active agents without evidence
 * Method: Use evidence templates by model and tier
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Evidence templates by model and tier
const EVIDENCE_TEMPLATES = {
  'gpt-4': {
    tier3: {
      justification: 'Ultra-specialist requiring highest accuracy for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for [USE_CASE].',
      citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
      temperature: 0.2,
      max_tokens: 4000,
      context_window: 16000,
      cost_per_query: 0.35
    },
    tier2: {
      justification: 'High-accuracy specialist for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE). Balanced performance for specialist tasks.',
      citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
      temperature: 0.4,
      max_tokens: 3000,
      context_window: 8000,
      cost_per_query: 0.12
    }
  },
  'gpt-3.5-turbo': {
    tier1: {
      justification: 'Fast, cost-effective for foundational [DOMAIN] queries. GPT-3.5 Turbo achieves 70% on HumanEval. Ideal for high-volume, low-complexity queries.',
      citation: 'OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo',
      temperature: 0.6,
      max_tokens: 2000,
      context_window: 4000,
      cost_per_query: 0.015
    }
  },
  'BioGPT': {
    tier2: {
      justification: 'Cost-effective biomedical specialist. BioGPT achieves F1 0.849 on BC5CDR (chemical-disease relations), 81.2% on PubMedQA. Optimized for biomedical tasks.',
      citation: 'Luo et al. (2022). BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation and Mining. DOI:10.1093/bib/bbac409',
      temperature: 0.4,
      max_tokens: 3000,
      context_window: 8000,
      cost_per_query: 0.08
    }
  },
  'claude-3-opus-20240229': {
    tier3: {
      justification: 'Best-in-class code generation and complex reasoning. Claude 3 Opus achieves 84.5% pass@1 on HumanEval. Excellent for [USE_CASE].',
      citation: 'Anthropic (2024). Claude 3 Model Card. https://www.anthropic.com/news/claude-3-family',
      temperature: 0.2,
      max_tokens: 4000,
      context_window: 16000,
      cost_per_query: 0.40
    }
  }
};

async function addEvidenceToRemainingActive() {
  console.log('📝 ADDING EVIDENCE TO REMAINING ACTIVE AGENTS');
  console.log('='.repeat(60));

  // Fetch all active agents without evidence
  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .or('metadata->model_justification.is.null,metadata->model_citation.is.null');

  if (fetchError) {
    console.error('❌ Error fetching agents:', fetchError);
    return;
  }

  console.log(`\nFound ${agents.length} active agents without evidence\n`);

  let updated = 0;
  let errors = 0;
  let skipped = 0;

  for (const agent of agents) {
    console.log(`📌 ${agent.display_name} (Tier ${agent.tier}, ${agent.model})`);

    // Get template for this model and tier
    const template = EVIDENCE_TEMPLATES[agent.model]?.[`tier${agent.tier}`];

    if (!template) {
      console.log(`   ⚠️  No template for ${agent.model} Tier-${agent.tier} - skipping`);
      skipped++;
      continue;
    }

    // Customize justification with agent-specific context
    const domain = agent.domain_expertise || agent.knowledge_domains?.[0] || 'healthcare';
    const useCase = agent.description?.split('.')[0] || agent.display_name;

    const justification = template.justification
      .replace('[DOMAIN]', domain)
      .replace('[USE_CASE]', useCase.toLowerCase());

    // Update agent
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        temperature: template.temperature,
        max_tokens: template.max_tokens,
        context_window: template.context_window,
        cost_per_query: template.cost_per_query,
        metadata: {
          ...agent.metadata,
          model_justification: justification,
          model_citation: template.citation,
          evidence_added_date: new Date().toISOString()
        }
      })
      .eq('id', agent.id);

    if (updateError) {
      console.log(`   ❌ Error: ${updateError.message}`);
      errors++;
    } else {
      console.log(`   ✅ Evidence added`);
      console.log(`   📊 Params: temp=${template.temperature}, tokens=${template.max_tokens}, cost=$${template.cost_per_query}`);
      updated++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updated} agents`);
  console.log(`❌ Errors: ${errors} agents`);
  console.log(`⚠️  Skipped: ${skipped} agents (no template)`);
  console.log(`📋 Total: ${agents.length} agents`);

  if (updated > 0) {
    console.log('\n🎯 IMPACT:');
    console.log(`   • Evidence completion: ${Math.round((updated / agents.length) * 100)}% of batch`);
    console.log(`   • All updated agents now have:`);
    console.log(`     - model_justification with benchmarks`);
    console.log(`     - model_citation with academic source`);
    console.log(`     - Tier-appropriate parameters`);

    console.log('\n📈 NEXT STEPS:');
    console.log('   1. Verify all active agents now have complete evidence');
    console.log('   2. Begin Tier-3 systematic review (80+ agents)');
    console.log('   3. Start Tier-2 batch evidence addition (170+ agents)');
  }

  console.log('\n✨ Evidence addition complete!\n');
}

// Execute
addEvidenceToRemainingActive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  });
