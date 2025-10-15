#!/usr/bin/env node

/**
 * Complete Agent Update Script
 * - Updates business functions and roles with correct org structure
 * - Assigns avatar icons from the icon library
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive mapping with corrected function/role names and avatar assignments
const agentMappings = {
  'Dr. Sarah Chen': {
    business_function: 'Research & Development',
    role: 'Chief Scientific Officer',
    avatar: 'avatar_0001'
  },
  'Dr. Robert Kim': {
    business_function: 'Clinical Development',
    role: 'Chief Medical Officer',
    avatar: 'avatar_0002'
  },
  'Dr. Priya Sharma': {
    business_function: 'Research & Development',
    role: 'Data Scientist',
    avatar: 'avatar_0003'
  },
  'Dr. Thomas Anderson': {
    business_function: 'Regulatory Affairs',
    role: 'Regulatory Affairs Director',
    avatar: 'avatar_0004'
  },
  'Dr. David Wilson': {
    business_function: 'Business Development',
    role: 'Chief Business Officer',
    avatar: 'avatar_0005'
  },
  'Maria Gonzalez': {
    business_function: 'Commercial',
    role: 'Brand Director',
    avatar: 'avatar_0006'
  },
  'Quality Systems Architect': {
    business_function: 'Quality',
    role: 'Quality Director',
    avatar: 'avatar_0007'
  },
  'Pharmacovigilance Specialist': {
    business_function: 'Pharmacovigilance',
    role: 'Pharmacovigilance Scientist',
    avatar: 'avatar_0008'
  },
  'Health Economics Analyst': {
    business_function: 'Commercial',
    role: 'Health Economist',
    avatar: 'avatar_0009'
  },
  'Real-World Evidence Specialist': {
    business_function: 'Medical Affairs',
    role: 'RWE Scientist',
    avatar: 'avatar_0010'
  },
  'Healthcare Cybersecurity Specialist': {
    business_function: 'IT/Digital',
    role: 'Cybersecurity Specialist',
    avatar: 'avatar_0011'
  },
  'Patient Engagement Strategist': {
    business_function: 'Commercial',
    role: 'Patient Engagement Manager',
    avatar: 'avatar_0012'
  },
  'Value-Based Care Consultant': {
    business_function: 'Commercial',
    role: 'VBC Manager',
    avatar: 'avatar_0013'
  },
  'Clinical Data Manager': {
    business_function: 'Clinical Development',
    role: 'Clinical Data Manager',
    avatar: 'avatar_0014'
  },
  'Biostatistician': {
    business_function: 'Clinical Development',
    role: 'Statistician',
    avatar: 'avatar_0015'
  },
  'Digital Therapeutics Specialist': {
    business_function: 'Research & Development',
    role: 'Digital Health Specialist',
    avatar: 'avatar_0016'
  },
  'FDA Regulatory Strategist': {
    business_function: 'Regulatory Affairs',
    role: 'Regulatory Affairs Manager',
    avatar: 'avatar_0017'
  },
  'Clinical Trial Designer': {
    business_function: 'Clinical Development',
    role: 'Clinical Trial Manager',
    avatar: 'avatar_0018'
  },
  'Reimbursement Strategist': {
    business_function: 'Commercial',
    role: 'Reimbursement Manager',
    avatar: 'avatar_0019'
  },
  'HIPAA Compliance Officer': {
    business_function: 'Quality',
    role: 'Compliance Manager',
    avatar: 'avatar_0020'
  },
  'Medical Writer': {
    business_function: 'Medical Affairs',
    role: 'Medical Writer',
    avatar: 'avatar_0021'
  }
};

async function updateAllAgents() {
  console.log('🔄 Complete Agent Update Process...\n');
  console.log('   1. Updating business functions and roles');
  console.log('   2. Assigning avatar icons\n');

  try {
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, display_name, name, business_function, role, avatar');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      return;
    }

    console.log(`📊 Found ${agents.length} agents to update\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      const agentName = agent.display_name || agent.name;
      const mapping = agentMappings[agentName];

      if (!mapping) {
        console.log(`⏭️  Skipped: ${agentName} (no mapping defined)`);
        skippedCount++;
        continue;
      }

      // Update the agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          business_function: mapping.business_function,
          role: mapping.role,
          avatar: mapping.avatar
        })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agentName}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ ${agentName}`);
        console.log(`   Function: ${mapping.business_function}`);
        console.log(`   Role: ${mapping.role}`);
        console.log(`   Avatar: ${mapping.avatar}\n`);
        successCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Total processed: ${agents.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

async function verifyUpdates() {
  console.log('\n\n🔍 Verification Report...\n');

  const { data: agents } = await supabase
    .from('agents')
    .select('display_name, name, business_function, role, avatar')
    .order('display_name');

  agents.forEach((agent, i) => {
    const agentName = agent.display_name || agent.name;
    console.log(`${i + 1}. ${agentName}`);
    console.log(`   Function: ${agent.business_function}`);
    console.log(`   Role: ${agent.role}`);
    console.log(`   Avatar: ${agent.avatar}\n`);
  });
}

async function main() {
  await updateAllAgents();
  await verifyUpdates();
  console.log('✨ Complete agent update finished!\n');
  process.exit(0);
}

main();
