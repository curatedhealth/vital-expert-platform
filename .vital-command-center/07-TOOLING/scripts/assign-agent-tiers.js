#!/usr/bin/env node

/**
 * Assign Tier Numbers to All Agents
 * Based on VITAL 5-Level Hierarchy (CORRECTED)
 * 
 * CORRECT HIERARCHY:
 * - Level 1 (MASTER): Department Heads ONLY (one per department)
 * - Level 2 (EXPERT): Senior/Director Level (Directors, VPs, Senior roles, Leads)
 * - Level 3 (SPECIALIST): Mid/Entry Level (Managers, MSLs, Coordinators)
 * - Level 4 (WORKER): Task Executors (Analysts, Associates, Assistants)
 * - Level 5 (TOOL): API Wrappers & Micro-agents
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Determine tier based on agent name/role patterns
 * CORRECTED LOGIC:
 * - Tier 1: Department Heads, CMO, Masters (NOT Directors/VPs)
 * - Tier 2: Directors, VPs, Senior roles, Leads, Scientists, Strategists
 * - Tier 3: Managers, MSLs, Coordinators, Specialists, Writers
 * - Tier 4: Analysts, Associates, Assistants, Workers
 * - Tier 5: Tools, APIs, Bots, Calculators
 */
function determineTier(agent) {
  const name = (agent.display_name || agent.name || '').toLowerCase();
  const slug = (agent.slug || '').toLowerCase();
  const role = (agent.role || '').toLowerCase();

  // Tier 1: MASTER - Department Heads ONLY
  if (
    name.includes('master') ||
    slug.includes('-master') ||
    name.includes('chief medical officer') ||
    name.includes('cmo') ||
    name.includes('department head') ||
    name.includes('head of department')
  ) {
    return 1;
  }

  // Tier 5: TOOL - API Wrappers, Bots, Calculators (check before others)
  if (
    name.includes('api') ||
    name.includes('bot') ||
    name.includes('automation') ||
    name.includes('wrapper') ||
    name.includes('tool') ||
    slug.includes('-tool') ||
    name.includes('calculator') ||
    name.includes('searcher') ||
    name.includes('retriever') ||
    name.includes('extractor') ||
    name.includes('converter') ||
    name.includes('parser') ||
    name.includes('checker') ||
    name.includes('lookup') ||
    name.includes('plotter') ||
    name.includes('runner') ||
    name.includes('scorer') ||
    name.includes('notifier') ||
    name.includes('scheduler') ||
    name.includes('sender')
  ) {
    return 5;
  }

  // Tier 4: WORKER - Task Executors
  if (
    name.includes('analyst') ||
    name.includes('associate') ||
    name.includes('assistant') ||
    name.includes('junior') ||
    name.includes('technician') ||
    name.includes('administrator') ||
    name.includes('worker') ||
    slug.includes('-worker') ||
    name.includes('processor') ||
    name.includes('validator') ||
    name.includes('reviewer') ||
    name.includes('compiler') ||
    name.includes('tracker') ||
    name.includes('formatter') ||
    name.includes('generator') ||
    name.includes('archiver') ||
    name.includes('monitor') ||
    name.includes('detector') ||
    name.includes('drafter') ||
    name.includes('tagger') ||
    name.includes('controller') ||
    name.includes('builder')
  ) {
    return 4;
  }

  // Tier 2: EXPERT - Senior/Director Level
  if (
    name.includes('director') ||
    name.includes('vp') ||
    name.includes('vice president') ||
    name.includes('senior') ||
    name.includes('lead') ||
    name.includes('scientist') ||
    name.includes('strategist') ||
    name.includes('principal') ||
    name.includes('architect') ||
    name.includes('expert') ||
    slug.includes('-expert') ||
    (name.includes('executive') && !name.includes('chief'))
  ) {
    return 2;
  }

  // Tier 3: SPECIALIST - Mid/Entry Level (default for most roles)
  // Managers, MSLs, Coordinators, Specialists, Writers, etc.
  return 3;
}

async function assignTiers() {
  console.log('🔢 Assigning Tier Numbers to Agents (CORRECTED LOGIC)...\n');
  console.log('📋 Tier Hierarchy:');
  console.log('   L1 (MASTER): Department Heads ONLY');
  console.log('   L2 (EXPERT): Directors, VPs, Senior roles, Leads');
  console.log('   L3 (SPECIALIST): Managers, MSLs, Coordinators');
  console.log('   L4 (WORKER): Analysts, Associates, Assistants');
  console.log('   L5 (TOOL): APIs, Bots, Calculators\n');

  try {
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, display_name, name, slug, role, tier');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      return;
    }

    console.log(`📊 Found ${agents.length} agents to process\n`);

    let successCount = 0;
    let errorCount = 0;
    const tierDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const agent of agents) {
      const agentName = agent.display_name || agent.name;
      const tier = determineTier(agent);

      const { error: updateError } = await supabase
        .from('agents')
        .update({ tier })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agentName}:`, updateError.message);
        errorCount++;
      } else {
        tierDistribution[tier]++;
        successCount++;
        // Only log first few of each tier for brevity
        if (tierDistribution[tier] <= 3) {
          const tierNames = { 1: 'MASTER', 2: 'EXPERT', 3: 'SPECIALIST', 4: 'WORKER', 5: 'TOOL' };
          console.log(`✅ ${agentName} → Tier ${tier} (${tierNames[tier]})`);
        }
      }
    }

    console.log('\n📊 Tier Assignment Summary:');
    console.log(`   ✅ Successfully assigned: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Show tier distribution
    console.log('\n🎯 Tier Distribution:');
    const tierNames = { 
      1: 'MASTER (Dept Heads)', 
      2: 'EXPERT (Senior/Director)', 
      3: 'SPECIALIST (Mid/Entry)', 
      4: 'WORKER (Task Executors)', 
      5: 'TOOL (API Wrappers)' 
    };
    
    Object.entries(tierDistribution).sort().forEach(([tier, count]) => {
      const percentage = ((count / successCount) * 100).toFixed(1);
      console.log(`   Tier ${tier} - ${tierNames[tier]}: ${count} agents (${percentage}%)`);
    });

    // Verify expected distribution
    console.log('\n📈 Expected vs Actual:');
    console.log(`   L1 (MASTER): Expected ~9, Got ${tierDistribution[1]}`);
    console.log(`   L2 (EXPERT): Expected ~45-50, Got ${tierDistribution[2]}`);
    console.log(`   L3 (SPECIALIST): Expected ~50-60, Got ${tierDistribution[3]}`);
    console.log(`   L4 (WORKER): Expected ~18-20, Got ${tierDistribution[4]}`);
    console.log(`   L5 (TOOL): Expected ~50+, Got ${tierDistribution[5]}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

assignTiers();
