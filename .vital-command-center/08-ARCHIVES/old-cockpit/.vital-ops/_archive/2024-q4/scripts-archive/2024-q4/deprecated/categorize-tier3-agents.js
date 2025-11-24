/**
 * TIER-3 AGENT CATEGORIZATION SCRIPT
 *
 * Purpose: Analyze 80 Tier-3 agents using gpt-4o-mini and categorize them:
 * - Ultra-Specialists (retain Tier-3, upgrade to GPT-4): Safety-critical, complex reasoning, regulatory
 * - Specialists (downgrade to Tier-2): Standard expertise, operational tasks
 *
 * Criteria for Tier-3 (Ultra-Specialist):
 * 1. Safety-critical: Patient safety, drug calculations, clinical decisions
 * 2. Regulatory: FDA submissions, compliance, legal
 * 3. Complex reasoning: Multi-step analysis, risk assessment
 * 4. High stakes: Financial, legal, or health consequences
 *
 * Criteria for Tier-2 (Specialist):
 * 1. Operational: Process management, coordination
 * 2. Standard expertise: Domain knowledge without safety criticality
 * 3. Support functions: Documentation, planning, tracking
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ultra-Specialist keywords (Tier-3)
const TIER3_KEYWORDS = [
  'safety', 'adverse', 'risk', 'signal', 'pharmacovigilance',
  'clinical decision', 'dosing', 'interaction', 'medication therapy',
  'anticoagulation', 'immunosuppression', 'oncology', 'pain management',
  'infectious disease', 'pediatric', 'geriatric',
  'FDA', 'regulatory strategy', 'NDA', 'BLA', 'IND',
  'benefit-risk', 'breakthrough therapy', 'accelerated approval',
  'orphan drug', 'pediatric investigation',
  'REMS', 'risk management plan', 'safety labeling'
];

// Specialist keywords (Tier-2)
const TIER2_KEYWORDS = [
  'coordination', 'planning', 'management', 'tracking',
  'documentation', 'training', 'support', 'administration',
  'scheduling', 'logistics', 'budget', 'contract',
  'engagement', 'communication', 'education', 'marketing',
  'operations', 'process', 'quality metrics', 'KPI'
];

function categorizeTier3Agent(agent) {
  const text = `${agent.display_name} ${agent.description}`.toLowerCase();

  // Count Tier-3 keyword matches
  const tier3Score = TIER3_KEYWORDS.reduce((score, keyword) => {
    return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);

  // Count Tier-2 keyword matches
  const tier2Score = TIER2_KEYWORDS.reduce((score, keyword) => {
    return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);

  // Safety-critical overrides
  const isSafetyCritical = text.includes('safety') ||
                           text.includes('adverse') ||
                           text.includes('risk') ||
                           text.includes('signal') ||
                           text.includes('clinical decision') ||
                           text.includes('medication therapy') ||
                           text.includes('dosing') ||
                           text.includes('anticoagulation') ||
                           text.includes('immunosuppression') ||
                           text.includes('oncology');

  // Regulatory overrides
  const isRegulatory = text.includes('fda') ||
                       text.includes('nda') ||
                       text.includes('bla') ||
                       text.includes('ind') ||
                       text.includes('regulatory strategy') ||
                       text.includes('breakthrough therapy') ||
                       text.includes('accelerated approval') ||
                       text.includes('orphan drug');

  // Decision logic
  if (isSafetyCritical) {
    return {
      recommendedTier: 3,
      rationale: 'Safety-critical: Patient safety requires highest accuracy',
      category: 'ultra-specialist'
    };
  }

  if (isRegulatory) {
    return {
      recommendedTier: 3,
      rationale: 'Regulatory-critical: FDA compliance requires precision',
      category: 'ultra-specialist'
    };
  }

  if (tier3Score > tier2Score && tier3Score >= 2) {
    return {
      recommendedTier: 3,
      rationale: 'Complex reasoning: Multi-domain expertise required',
      category: 'ultra-specialist'
    };
  }

  return {
    recommendedTier: 2,
    rationale: 'Operational/Support: Specialist expertise without safety criticality',
    category: 'specialist'
  };
}

async function categorizeTier3Agents() {
  console.log('📊 CATEGORIZING TIER-3 AGENTS');
  console.log('='.repeat(60));

  // Fetch all Tier-3 agents using gpt-4o-mini
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('tier', 3)
    .eq('model', 'gpt-4o-mini')
    .order('name');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`Found ${agents.length} Tier-3 agents using gpt-4o-mini\n`);

  const retainTier3 = [];
  const downgradeTier2 = [];

  agents.forEach(agent => {
    const result = categorizeTier3Agent(agent);

    if (result.recommendedTier === 3) {
      retainTier3.push({ agent, ...result });
    } else {
      downgradeTier2.push({ agent, ...result });
    }
  });

  console.log('📋 CATEGORIZATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Retain Tier-3 (Ultra-Specialists): ${retainTier3.length} agents`);
  console.log(`Downgrade to Tier-2 (Specialists): ${downgradeTier2.length} agents`);
  console.log('');

  console.log('🔺 RETAIN TIER-3 (Ultra-Specialists):');
  console.log('-'.repeat(60));
  retainTier3.forEach((item, i) => {
    console.log(`${i + 1}. ${item.agent.display_name}`);
    console.log(`   Rationale: ${item.rationale}`);
    console.log(`   Description: ${item.agent.description?.substring(0, 60)}...`);
    console.log('');
  });

  console.log('🔻 DOWNGRADE TO TIER-2 (Specialists):');
  console.log('-'.repeat(60));
  downgradeTier2.forEach((item, i) => {
    console.log(`${i + 1}. ${item.agent.display_name}`);
    console.log(`   Rationale: ${item.rationale}`);
    console.log(`   Description: ${item.agent.description?.substring(0, 60)}...`);
    console.log('');
  });

  // Save results to files for processing
  const fs = await import('fs/promises');

  await fs.writeFile(
    '/tmp/tier3_retain.json',
    JSON.stringify(retainTier3.map(item => item.agent), null, 2)
  );

  await fs.writeFile(
    '/tmp/tier3_downgrade.json',
    JSON.stringify(downgradeTier2.map(item => item.agent), null, 2)
  );

  console.log('💾 Results saved:');
  console.log('   - /tmp/tier3_retain.json (agents to upgrade to GPT-4)');
  console.log('   - /tmp/tier3_downgrade.json (agents to downgrade to Tier-2)');
  console.log('');

  console.log('📊 SUMMARY:');
  console.log('-'.repeat(60));
  console.log(`Total reviewed: ${agents.length} agents`);
  console.log(`Retain Tier-3: ${retainTier3.length} agents (${Math.round(retainTier3.length/agents.length*100)}%)`);
  console.log(`Downgrade Tier-2: ${downgradeTier2.length} agents (${Math.round(downgradeTier2.length/agents.length*100)}%)`);
  console.log('');

  console.log('📈 COST IMPACT:');
  console.log('-'.repeat(60));
  const currentCost = agents.length * 0.05; // gpt-4o-mini
  const tier3Cost = retainTier3.length * 0.35; // GPT-4 Tier-3
  const tier2Cost = downgradeTier2.length * 0.12; // GPT-4 Tier-2
  const newCost = tier3Cost + tier2Cost;
  const savings = currentCost - newCost;

  console.log(`Current cost (all gpt-4o-mini): $${currentCost}/query`);
  console.log(`New cost after optimization: $${newCost.toFixed(2)}/query`);
  console.log(`Tier-3 (GPT-4): ${retainTier3.length} × $0.35 = $${tier3Cost.toFixed(2)}`);
  console.log(`Tier-2 (GPT-4): ${downgradeTier2.length} × $0.12 = $${tier2Cost.toFixed(2)}`);
  console.log(`Net change: ${savings > 0 ? '-' : '+'}$${Math.abs(savings).toFixed(2)}/query`);
  console.log('');

  console.log('✅ Categorization complete!');
}

categorizeTier3Agents().catch(console.error);
