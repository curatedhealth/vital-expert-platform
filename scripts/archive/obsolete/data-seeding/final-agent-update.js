#!/usr/bin/env node

/**
 * Final Complete Agent Update - All Correct Mappings
 * Using exact role names from org_roles table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Final mappings with exact role names
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
    role: 'Regulatory Attorney',
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
    role: 'QA Director',
    avatar: 'avatar_0007'
  },
  'Pharmacovigilance Specialist': {
    business_function: 'Pharmacovigilance',
    role: 'Pharmacovigilance Director',
    avatar: 'avatar_0008'
  },
  'Health Economics Analyst': {
    business_function: 'Commercial',
    role: 'Health Economist',
    avatar: 'avatar_0009'
  },
  'Real-World Evidence Specialist': {
    business_function: 'Medical Affairs',
    role: 'Real-World Evidence Scientist',
    avatar: 'avatar_0010'
  },
  'Healthcare Cybersecurity Specialist': {
    business_function: 'IT/Digital',
    role: 'Cybersecurity Specialist',
    avatar: 'avatar_0011'
  },
  'Patient Engagement Strategist': {
    business_function: 'Commercial',
    role: 'Payer Relations Manager',
    avatar: 'avatar_0012'
  },
  'Value-Based Care Consultant': {
    business_function: 'Commercial',
    role: 'HEOR Director',
    avatar: 'avatar_0013'
  },
  'Clinical Data Manager': {
    business_function: 'Clinical Development',
    role: 'Clinical Data Manager',
    avatar: 'avatar_0014'
  },
  'Biostatistician': {
    business_function: 'Clinical Development',
    role: 'Principal Biostatistician',
    avatar: 'avatar_0015'
  },
  'Digital Therapeutics Specialist': {
    business_function: 'Research & Development',
    role: 'Digital Transformation Lead',
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
    role: 'Reimbursement Specialist',
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

async function finalUpdate() {
  console.log('✨ Final Agent Update - All Correct Mappings\n');

  try {
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, display_name, name');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      return;
    }

    console.log(`📊 Updating ${agents.length} agents...\n`);

    let successCount = 0;

    for (const agent of agents) {
      const agentName = agent.display_name || agent.name;
      const mapping = agentMappings[agentName];

      if (!mapping) continue;

      const { error } = await supabase
        .from('agents')
        .update({
          business_function: mapping.business_function,
          role: mapping.role,
          avatar: mapping.avatar
        })
        .eq('id', agent.id);

      if (!error) {
        console.log(`✅ ${agentName}`);
        successCount++;
      }
    }

    console.log(`\n✨ Successfully updated ${successCount} agents!\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

finalUpdate();
