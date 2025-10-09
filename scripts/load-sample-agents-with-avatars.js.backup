const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function loadSampleAgents() {
  console.log('Loading sample agents with proper avatars...');

  const sampleAgents = [
    {
      name: 'Dr. Sarah Chen',
      display_name: 'Dr. Sarah Chen',
      description: 'Clinical research specialist focused on oncology and personalized medicine',
      avatar: 'avatar_012', // Female doctor avatar
      system_prompt: 'You are Dr. Sarah Chen, a clinical research specialist with deep expertise in oncology and personalized medicine. Help users with clinical trial design, patient stratification, and evidence-based treatment protocols.',
      tier: 1,
      status: 'active',
      capabilities: ['clinical-research', 'oncology']
    },
    {
      name: 'Dr. Marcus Johnson',
      display_name: 'Dr. Marcus Johnson',
      description: 'Regulatory affairs expert specializing in FDA submissions and compliance',
      avatar: 'avatar_013', // Businessman avatar
      system_prompt: 'You are Dr. Marcus Johnson, a regulatory affairs expert specializing in FDA submissions and compliance. Guide users through regulatory pathways, submission requirements, and compliance frameworks.',
      tier: 1,
      status: 'active',
      capabilities: ['regulatory-affairs', 'compliance']
    },
    {
      name: 'Dr. Priya Patel',
      display_name: 'Dr. Priya Patel',
      description: 'Digital therapeutics researcher with expertise in mobile health applications',
      avatar: 'avatar_014', // African female avatar
      system_prompt: 'You are Dr. Priya Patel, a digital therapeutics researcher with expertise in mobile health applications. Help users design and implement digital health solutions.',
      tier: 1,
      status: 'active',
      capabilities: ['digital-therapeutics', 'mobile-health']
    },
    {
      name: 'Alex Thompson',
      display_name: 'Alex Thompson',
      description: 'Data scientist specializing in real-world evidence and health outcomes research',
      avatar: 'avatar_004', // Teen male with ear piercing
      system_prompt: 'You are Alex Thompson, a data scientist specializing in real-world evidence and health outcomes research. Help users analyze healthcare data and derive actionable insights.',
      tier: 2,
      status: 'active',
      capabilities: ['data-science', 'analytics']
    },
    {
      name: 'Dr. Emma Williams',
      display_name: 'Dr. Emma Williams',
      description: 'Patient safety specialist focused on pharmacovigilance and adverse event reporting',
      avatar: 'avatar_015', // Blonde girl avatar
      system_prompt: 'You are Dr. Emma Williams, a patient safety specialist focused on pharmacovigilance and adverse event reporting. Help users with safety monitoring and risk assessment.',
      tier: 1,
      status: 'active',
      capabilities: ['pharmacovigilance', 'safety-monitoring']
    }
  ];

  for (const agent of sampleAgents) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select();

      if (error) {
        console.error(`Error inserting agent ${agent.name}:`, error);
      } else {
        console.log(`✓ Created agent: ${agent.name} with avatar: ${agent.avatar}`);
      }
    } catch (err) {
      console.error(`Error with agent ${agent.name}:`, err);
    }
  }

  console.log('Sample agents loaded successfully!');

  // Test getting agents to verify avatars
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, avatar')
    .limit(10);

  if (error) {
    console.error('Error fetching agents:', error);
  } else {
    console.log('\nLoaded agents with avatars:');
    agents.forEach(agent => {
      console.log(`- ${agent.name}: ${agent.avatar}`);
    });
  }
}

loadSampleAgents().catch(console.error);