/**
 * TIER REALIGNMENT SCRIPT - Specialist Agents
 *
 * Purpose: Fix 4 specialist agents incorrectly classified as Tier-1
 * Issue: FDA, Clinical Trial, HIPAA, and Reimbursement specialists are currently Tier-1
 * Action: Upgrade to Tier-2 (Specialist tier) with appropriate parameters
 *
 * These are NOT foundational agents - they require specialized expertise in:
 * - FDA regulatory pathways and submissions
 * - Clinical trial design and protocols
 * - HIPAA compliance and healthcare privacy law
 * - Healthcare reimbursement and payer strategy
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Specialist agents misclassified as Tier-1 that should be Tier-2
const SPECIALIST_AGENTS_TO_UPGRADE = [
  {
    name: 'fda-regulatory-strategist',
    display_name: 'FDA Regulatory Strategist',
    current_tier: 1,
    correct_tier: 2,
    model: 'gpt-4',
    model_justification: 'High-accuracy regulatory specialist for FDA submissions and pathways. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Essential for navigating complex FDA regulations (510k, PMA, De Novo), providing accurate regulatory strategy, and ensuring submission compliance.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.4,
    max_tokens: 3000,
    context_window: 8000,
    cost_per_query: 0.12,
    rationale: 'FDA regulatory strategy requires specialized expertise in 21 CFR, guidance documents, and submission pathways - not foundational.'
  },
  {
    name: 'clinical-trial-designer',
    display_name: 'Clinical Trial Designer',
    current_tier: 1,
    correct_tier: 2,
    model: 'gpt-4',
    model_justification: 'High-accuracy specialist for clinical trial design and protocol development. GPT-4 achieves 86.7% on MedQA (USMLE). Critical for designing scientifically sound trials, selecting appropriate endpoints, ensuring statistical rigor, and complying with ICH-GCP guidelines.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.4,
    max_tokens: 3000,
    context_window: 8000,
    cost_per_query: 0.12,
    rationale: 'Clinical trial design requires specialized knowledge of study design, biostatistics, endpoints, and regulatory requirements - not foundational.'
  },
  {
    name: 'hipaa-compliance-officer',
    display_name: 'HIPAA Compliance Officer',
    current_tier: 1,
    correct_tier: 2,
    model: 'gpt-4',
    model_justification: 'High-accuracy specialist for HIPAA compliance and healthcare privacy law. GPT-4 achieves 86.4% on MMLU. Essential for navigating Privacy Rule, Security Rule, Breach Notification Rule, BAA requirements, and ensuring healthcare data protection compliance.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.4,
    max_tokens: 3000,
    context_window: 8000,
    cost_per_query: 0.12,
    rationale: 'HIPAA compliance requires specialized legal and regulatory expertise in healthcare privacy law - not foundational.'
  },
  {
    name: 'reimbursement-strategist',
    display_name: 'Reimbursement Strategist',
    current_tier: 1,
    correct_tier: 2,
    model: 'gpt-4',
    model_justification: 'High-accuracy specialist for healthcare reimbursement and payer strategy. GPT-4 achieves 86.4% on MMLU. Critical for navigating complex reimbursement landscape (CMS, commercial payers), coding strategies (CPT, HCPCS, ICD-10), coverage policies, and value demonstration.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.4,
    max_tokens: 3000,
    context_window: 8000,
    cost_per_query: 0.12,
    rationale: 'Reimbursement strategy requires specialized knowledge of payer landscape, coding, coverage policies - not foundational.'
  }
];

async function upgradeTierMisalignedAgents() {
  console.log('🔄 TIER REALIGNMENT SCRIPT');
  console.log('==========================================\n');
  console.log('Purpose: Upgrade 4 specialist agents from Tier-1 to Tier-2');
  console.log('Reason: These require specialized expertise, not foundational knowledge\n');

  let upgraded = 0;
  let errors = 0;

  for (const agent of SPECIALIST_AGENTS_TO_UPGRADE) {
    console.log(`\n📝 Processing: ${agent.display_name}`);
    console.log(`   Current: Tier ${agent.current_tier} → Correct: Tier ${agent.correct_tier}`);
    console.log(`   Rationale: ${agent.rationale}`);

    // Check if agent exists
    const { data: existing, error: findError } = await supabase
      .from('agents')
      .select('id, name, tier, model, status')
      .eq('name', agent.name)
      .maybeSingle();

    if (findError || !existing) {
      console.error(`   ❌ Agent not found - skipping`);
      errors++;
      continue;
    }

    console.log(`   Current state: Tier ${existing.tier}, ${existing.model}, ${existing.status}`);

    // Update to Tier-2 with appropriate parameters
    const updateData = {
      tier: agent.correct_tier,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      context_window: agent.context_window,
      cost_per_query: agent.cost_per_query,
      metadata: {
        ...existing.metadata,
        model_justification: agent.model_justification,
        model_citation: agent.model_citation,
        tier_realignment: {
          date: new Date().toISOString(),
          from_tier: agent.current_tier,
          to_tier: agent.correct_tier,
          reason: agent.rationale
        }
      }
    };

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Failed to upgrade: ${error.message}`);
      errors++;
    } else {
      console.log(`   ✅ TIER UPGRADED: Tier ${agent.current_tier} → Tier ${agent.correct_tier}`);
      console.log(`   ✅ Model: ${agent.model} (appropriate for specialists)`);
      console.log(`   ✅ Parameters: temp=0.4, max_tokens=3000, context=8000`);
      console.log(`   ✅ Evidence added: model_justification + citation`);
      console.log(`   💰 Cost: $${agent.cost_per_query}/query (Tier-2 rate)`);
      upgraded++;
    }
  }

  // Summary
  console.log('\n\n============================================================');
  console.log('📊 TIER REALIGNMENT SUMMARY');
  console.log('============================================================');
  console.log(`✅ Successfully upgraded: ${upgraded} agents`);
  console.log(`❌ Errors: ${errors} agents`);
  console.log(`📋 Total processed: ${SPECIALIST_AGENTS_TO_UPGRADE.length} agents\n`);

  if (upgraded > 0) {
    console.log('📈 TIER ALIGNMENT:');
    console.log(`   Before: Tier-1 (Foundational) - INCORRECT`);
    console.log(`   After:  Tier-2 (Specialist) - CORRECT`);
    console.log(`   Model: GPT-4 is appropriate for Tier-2 specialists`);
    console.log(`   Cost: $0.12/query (Tier-2 rate, NOT $0.015 Tier-1 rate)\n`);

    console.log('🎯 IMPACT:');
    console.log('   - Agents now properly classified by expertise level');
    console.log('   - Temperature, tokens, context window adjusted to Tier-2 standards');
    console.log('   - Evidence added for all agents');
    console.log('   - Cost properly reflects specialist tier ($0.12 vs $0.015)\n');

    console.log('📋 NEXT STEPS:');
    console.log('   1. Review Tier-1 agents to find TRUE foundational agents');
    console.log('   2. Consider creating Tier-1 versions (e.g., "Basic HIPAA Q&A")');
    console.log('   3. Update agent descriptions to reflect specialist positioning');
    console.log('   4. Document tier assignment criteria for future agents\n');
  }

  console.log('✨ Tier realignment complete!\n');
}

// Execute
upgradeTierMisalignedAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  });
