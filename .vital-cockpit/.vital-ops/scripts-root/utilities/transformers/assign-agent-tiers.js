#!/usr/bin/env node

/**
 * Assign Tier Numbers to All Agents
 * Based on seniority and role complexity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tier classification:
// Tier 1: C-Suite executives, Directors, strategic leadership roles
// Tier 2: Managers, specialists with significant expertise
// Tier 3: Individual contributors, entry-level specialists

const tierMappings = {
  // Tier 1 - Strategic Leadership (C-Suite, Directors, Chiefs)
  'Dr. Sarah Chen': 1, // Chief Scientific Officer
  'Dr. Robert Kim': 1, // Chief Medical Officer
  'Dr. Thomas Anderson': 1, // Regulatory Attorney (high-level strategic)
  'Dr. David Wilson': 1, // Chief Business Officer
  'Maria Gonzalez': 1, // Brand Director
  'Quality Systems Architect': 1, // QA Director
  'Pharmacovigilance Specialist': 1, // Pharmacovigilance Director
  'Value-Based Care Consultant': 1, // HEOR Director

  // Tier 2 - Managers and Senior Specialists
  'Health Economics Analyst': 2, // Health Economist
  'Real-World Evidence Specialist': 2, // RWE Scientist
  'Healthcare Cybersecurity Specialist': 2, // Cybersecurity Specialist
  'Patient Engagement Strategist': 2, // Payer Relations Manager
  'Clinical Data Manager': 2, // Clinical Data Manager
  'Biostatistician': 2, // Principal Biostatistician
  'Digital Therapeutics Specialist': 2, // Digital Transformation Lead
  'FDA Regulatory Strategist': 2, // Regulatory Affairs Manager
  'Clinical Trial Designer': 2, // Clinical Trial Manager
  'Reimbursement Strategist': 2, // Reimbursement Specialist
  'HIPAA Compliance Officer': 2, // Compliance Manager

  // Tier 3 - Individual Contributors
  'Dr. Priya Sharma': 3, // Data Scientist
  'Medical Writer': 3 // Medical Writer
};

async function assignTiers() {
  console.log('🔢 Assigning Tier Numbers to Agents...\n');

  try {
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, display_name, name, role, tier');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      return;
    }

    console.log(`📊 Found ${agents.length} agents to process\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      const agentName = agent.display_name || agent.name;
      const tier = tierMappings[agentName];

      if (tier === undefined) {
        console.log(`⏭️  Skipped: ${agentName} (no tier mapping)`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('agents')
        .update({ tier })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agentName}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ ${agentName}`);
        console.log(`   Role: ${agent.role}`);
        console.log(`   Tier: ${tier}\n`);
        successCount++;
      }
    }

    console.log('\n📊 Tier Assignment Summary:');
    console.log(`   ✅ Successfully assigned: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Show tier distribution
    console.log('\n\n🎯 Tier Distribution:');
    const { data: tierCounts } = await supabase
      .from('agents')
      .select('tier');

    const distribution = tierCounts.reduce((acc, agent) => {
      acc[agent.tier] = (acc[agent.tier] || 0) + 1;
      return acc;
    }, {});

    Object.entries(distribution).sort().forEach(([tier, count]) => {
      console.log(`   Tier ${tier}: ${count} agents`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

assignTiers();
