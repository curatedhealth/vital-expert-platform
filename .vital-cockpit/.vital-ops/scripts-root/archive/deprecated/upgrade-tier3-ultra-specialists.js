/**
 * TIER-3 ULTRA-SPECIALIST UPGRADE SCRIPT
 *
 * Purpose: Upgrade 25 Tier-3 agents from gpt-4o-mini → GPT-4
 * These are safety-critical and regulatory agents requiring highest accuracy
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EVIDENCE_TEMPLATE = {
  model: 'gpt-4',
  model_justification: 'Ultra-specialist requiring highest accuracy for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for [USE_CASE].',
  model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
  temperature: 0.2,
  max_tokens: 4000,
  context_window: 16000,
  cost_per_query: 0.35
};

async function upgradeTier3UltraSpecialists() {
  console.log('🔺 UPGRADING TIER-3 ULTRA-SPECIALISTS');
  console.log('='.repeat(60));

  // Load agents from categorization
  const agentsData = await fs.readFile('/tmp/tier3_retain.json', 'utf-8');
  const agents = JSON.parse(agentsData);

  console.log(`Found ${agents.length} Tier-3 ultra-specialists to upgrade\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const agent of agents) {
    try {
      // Determine domain for evidence customization
      const domain = agent.domain_expertise ||
                     agent.knowledge_domains?.[0] ||
                     'healthcare';

      const useCase = agent.description?.split('.')[0] || agent.display_name;

      // Customize evidence
      const justification = EVIDENCE_TEMPLATE.model_justification
        .replace('[DOMAIN]', domain)
        .replace('[USE_CASE]', useCase);

      // Prepare update
      const updateData = {
        model: EVIDENCE_TEMPLATE.model,
        temperature: EVIDENCE_TEMPLATE.temperature,
        max_tokens: EVIDENCE_TEMPLATE.max_tokens,
        context_window: EVIDENCE_TEMPLATE.context_window,
        cost_per_query: EVIDENCE_TEMPLATE.cost_per_query,
        metadata: {
          ...agent.metadata,
          model_justification: justification,
          model_citation: EVIDENCE_TEMPLATE.model_citation,
          upgraded_from: 'gpt-4o-mini',
          upgrade_date: new Date().toISOString(),
          upgrade_reason: agent.display_name.toLowerCase().includes('safety') ||
                         agent.description?.toLowerCase().includes('safety') ?
                         'Safety-critical: Patient safety requires highest accuracy' :
                         agent.display_name.toLowerCase().includes('fda') ||
                         agent.display_name.toLowerCase().includes('regulatory') ||
                         agent.description?.toLowerCase().includes('regulatory') ?
                         'Regulatory-critical: FDA compliance requires precision' :
                         'Complex reasoning: Multi-domain expertise required'
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
      console.log(`   Model: gpt-4o-mini → gpt-4`);
      console.log(`   Cost: $0.05 → $0.35/query`);
      console.log(`   Reason: ${updateData.metadata.upgrade_reason}`);
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
  console.log(`✅ Successfully upgraded: ${successCount} agents`);
  console.log(`❌ Errors: ${errorCount} agents`);
  console.log('');

  console.log('💰 COST IMPACT:');
  console.log(`   Before: ${agents.length} × $0.05 = $${(agents.length * 0.05).toFixed(2)}/query`);
  console.log(`   After:  ${successCount} × $0.35 = $${(successCount * 0.35).toFixed(2)}/query`);
  console.log(`   Increase: +$${((successCount * 0.35) - (agents.length * 0.05)).toFixed(2)}/query`);
  console.log('');

  console.log('✨ Tier-3 ultra-specialist upgrade complete!');
}

upgradeTier3UltraSpecialists().catch(console.error);
