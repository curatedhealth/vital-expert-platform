#!/usr/bin/env node

/**
 * Update All Agents with Correct Business Functions and Roles
 * Maps existing agents to proper org_functions and org_roles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping of agent names to correct business function and role
const agentMappings = {
  // Expert Agents
  'Dr. Sarah Chen': {
    business_function: 'Research & Development',
    role: 'Head of Discovery'
  },
  'Dr. Robert Kim': {
    business_function: 'Clinical Development',
    role: 'Medical Director'
  },
  'Dr. Priya Sharma': {
    business_function: 'Research & Development',
    role: 'Chief Scientific Officer'
  },
  'Dr. Thomas Anderson': {
    business_function: 'Regulatory Affairs',
    role: 'Chief Regulatory Officer'
  },
  'Dr. David Wilson': {
    business_function: 'Business Development & Licensing',
    role: 'Chief Business Development Officer'
  },
  'Maria Gonzalez': {
    business_function: 'Commercial & Market Access',
    role: 'Market Access Director'
  },

  // Expanded Agents
  'Quality Systems Architect': {
    business_function: 'Quality Management System',
    role: 'Chief Quality Officer'
  },
  'Pharmacovigilance Specialist': {
    business_function: 'Medical Affairs',
    role: 'Pharmacovigilance Director'
  },
  'Health Economics Analyst': {
    business_function: 'Commercial & Market Access',
    role: 'Health Economics Director'
  },
  'Real-World Evidence Specialist': {
    business_function: 'Medical Affairs',
    role: 'Medical Science Liaison Manager'
  },
  'Healthcare Cybersecurity Specialist': {
    business_function: 'Support Functions',
    role: 'IT Manager'
  },
  'Patient Engagement Strategist': {
    business_function: 'Commercial & Market Access',
    role: 'Market Access Director'
  },
  'Value-Based Care Consultant': {
    business_function: 'Commercial & Market Access',
    role: 'HEOR Manager'
  },
  'Clinical Data Manager': {
    business_function: 'Clinical Development',
    role: 'Data Management Manager'
  },
  'Biostatistician': {
    business_function: 'Clinical Development',
    role: 'Biostatistics Manager'
  },
  'Digital Therapeutics Specialist': {
    business_function: 'Research & Development',
    role: 'Head of Discovery'
  },

  // Basic Agents
  'FDA Regulatory Strategist': {
    business_function: 'Regulatory Affairs',
    role: 'Regulatory Affairs Manager'
  },
  'Clinical Trial Designer': {
    business_function: 'Clinical Development',
    role: 'Clinical Operations Manager'
  },
  'Reimbursement Strategist': {
    business_function: 'Commercial & Market Access',
    role: 'Market Access Director'
  },
  'HIPAA Compliance Officer': {
    business_function: 'Quality Management System',
    role: 'Compliance Manager'
  },
  'Medical Writer': {
    business_function: 'Medical Affairs',
    role: 'Medical Affairs Manager'
  }
};

async function updateAgents() {
  console.log('🔄 Updating Agents with Organizational Structure...\n');

  try {
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, display_name, name, business_function, role');

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
          role: mapping.role
        })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agentName}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ Updated: ${agentName}`);
        console.log(`   Function: ${mapping.business_function}`);
        console.log(`   Role: ${mapping.role}\n`);
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
  console.log('\n\n🔍 Verifying Updates...\n');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('display_name, name, business_function, role')
    .order('display_name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  agents.forEach((agent, i) => {
    const agentName = agent.display_name || agent.name;
    console.log(`${i + 1}. ${agentName}`);
    console.log(`   Function: ${agent.business_function || 'NOT SET'}`);
    console.log(`   Role: ${agent.role || 'NOT SET'}\n`);
  });
}

async function main() {
  await updateAgents();
  await verifyUpdates();
  console.log('✨ Agent update complete!\n');
  process.exit(0);
}

main();
