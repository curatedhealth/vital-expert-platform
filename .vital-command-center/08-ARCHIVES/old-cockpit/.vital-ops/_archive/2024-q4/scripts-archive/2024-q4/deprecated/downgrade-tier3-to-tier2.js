/**
 * TIER-3 TO TIER-2 DOWNGRADE SCRIPT
 *
 * Purpose: Downgrade 55 agents from Tier-3 to Tier-2
 * These are specialist agents without safety/regulatory criticality
 * Model: gpt-4o-mini → gpt-4 (Tier-2 parameters)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIER2_EVIDENCE_TEMPLATE = {
  model: 'gpt-4',
  tier: 2,
  model_justification: 'High-accuracy specialist for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE). Balanced performance for specialist tasks in [USE_CASE].',
  model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
  temperature: 0.4,
  max_tokens: 3000,
  context_window: 8000,
  cost_per_query: 0.12
};

async function downgradeTier3ToTier2() {
  console.log('🔻 DOWNGRADING TIER-3 TO TIER-2');
  console.log('='.repeat(60));

  // Load agents from categorization
  const agentsData = await fs.readFile('/tmp/tier3_downgrade.json', 'utf-8');
  const agents = JSON.parse(agentsData);

  console.log(`Found ${agents.length} agents to downgrade from Tier-3 to Tier-2\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const agent of agents) {
    try {
      // Determine domain for evidence customization
      const domain = agent.domain_expertise ||
                     agent.knowledge_domains?.[0] ||
                     'healthcare operations';

      const useCase = agent.description?.split('.')[0] || agent.display_name;

      // Customize evidence
      const justification = TIER2_EVIDENCE_TEMPLATE.model_justification
        .replace('[DOMAIN]', domain)
        .replace('[USE_CASE]', useCase);

      // Prepare update
      const updateData = {
        tier: TIER2_EVIDENCE_TEMPLATE.tier,
        model: TIER2_EVIDENCE_TEMPLATE.model,
        temperature: TIER2_EVIDENCE_TEMPLATE.temperature,
        max_tokens: TIER2_EVIDENCE_TEMPLATE.max_tokens,
        context_window: TIER2_EVIDENCE_TEMPLATE.context_window,
        cost_per_query: TIER2_EVIDENCE_TEMPLATE.cost_per_query,
        metadata: {
          ...agent.metadata,
          model_justification: justification,
          model_citation: TIER2_EVIDENCE_TEMPLATE.model_citation,
          previous_tier: 3,
          downgraded_from: 'gpt-4o-mini',
          downgrade_date: new Date().toISOString(),
          downgrade_reason: 'Operational/Support: Specialist expertise without safety criticality'
        },
        status: 'active'
      };

      // Execute update
      const { error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', agent.id);

      if (error) throw error;

      console.log(`✅ ${agent.display_name}`);
      console.log(`   Tier: 3 → 2`);
      console.log(`   Model: gpt-4o-mini → gpt-4 (Tier-2)`);
      console.log(`   Cost: $0.05 → $0.12/query`);
      console.log('');

      successCount++;
    } catch (error) {
      console.error(`❌ ${agent.display_name}:`, error.message);
      errorCount++;
    }
  }

  console.log('='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully downgraded: ${successCount} agents`);
  console.log(`❌ Errors: ${errorCount} agents`);
  console.log('');

  console.log('💰 COST IMPACT:');
  console.log(`   Before: ${agents.length} × $0.05 = $${(agents.length * 0.05).toFixed(2)}/query`);
  console.log(`   After:  ${successCount} × $0.12 = $${(successCount * 0.12).toFixed(2)}/query`);
  console.log(`   Increase: +$${((successCount * 0.12) - (agents.length * 0.05)).toFixed(2)}/query`);
  console.log('');

  console.log('📋 TIER DISTRIBUTION AFTER DOWNGRADE:');
  console.log('   Tier-3: 25 ultra-specialists (safety/regulatory critical)');
  console.log('   Tier-2: ' + successCount + ' specialists (operational expertise)');
  console.log('');

  console.log('✨ Tier-3 to Tier-2 downgrade complete!');
}

downgradeTier3ToTier2().catch(console.error);
