const { createClient } = require('@supabase/supabase-js');

async function createAgentRelationships() {
  const client = createClient(
    'http://127.0.0.1:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  );

  console.log('🔗 Creating Agent-Capability Relationships');
  console.log('==========================================\n');

  // Get all agents and capabilities
  const { data: agents } = await client.from('agents').select('id, name, capabilities');
  const { data: capabilitiesData } = await client.from('capabilities').select('id, name');

  // Create a map for easy lookup
  const capabilityMap = {};
  capabilitiesData.forEach(cap => {
    capabilityMap[cap.name] = cap.id;
  });

  console.log(`Found ${agents.length} agents and ${capabilitiesData.length} capabilities\n`);

  // Agent to capability mapping based on their names
  const agentCapabilityMapping = {
    'fda-regulatory-strategist': [
      'clinical-evidence-planning',
      '510k-submission-preparation',
      'regulatory-strategy-development',
      'ai-ml-regulatory-guidance'
    ],
    'clinical-trial-designer': [
      'clinical-protocol-development',
      'patient-recruitment-planning',
      'safety-monitoring-design',
      'data-management-planning'
    ],
    'hipaa-compliance-officer': [
      'hipaa-risk-assessment',
      'privacy-policy-development',
      'security-controls-implementation',
      'breach-response-protocol'
    ],
    'reimbursement-strategist': [
      'cpt-coding-strategy',
      'health-economics-analysis',
      'heor-study-design',
      'market-access-planning'
    ],
    'qms-architect': [
      'qms-architecture-design',
      'iso-13485-implementation',
      'design-controls-development',
      'risk-management-planning'
    ]
  };

  let relationshipsCreated = 0;
  let relationshipsFailed = 0;

  for (const agent of agents) {
    const expectedCapabilities = agentCapabilityMapping[agent.name] || [];

    console.log(`Processing ${agent.name}:`);

    for (const capabilityName of expectedCapabilities) {
      const capabilityId = capabilityMap[capabilityName];

      if (capabilityId) {
        try {
          const relationResult = await client.from('agent_capabilities').insert([{
            agent_id: agent.id,
            capability_id: capabilityId,
            proficiency_level: 'expert',
            is_primary: true
          }]);

          if (relationResult.error) {
            console.log(`  ❌ ${capabilityName}: ${relationResult.error.message}`);
            relationshipsFailed++;
          } else {
            console.log(`  ✅ ${capabilityName}`);
            relationshipsCreated++;
          }
        } catch (error) {
          console.log(`  ❌ ${capabilityName}: ${error.message}`);
          relationshipsFailed++;
        }
      } else {
        console.log(`  ⚠️  ${capabilityName}: Capability not found in database`);
        relationshipsFailed++;
      }
    }
    console.log('');
  }

  console.log(`📊 Results: ${relationshipsCreated} created, ${relationshipsFailed} failed\n`);

  // Create agent-prompt relationships
  console.log('💬 Creating Agent-Prompt Relationships...');

  const { data: promptsData } = await client.from('prompts').select('id, name');
  const promptMap = {};
  promptsData.forEach(prompt => {
    promptMap[prompt.name] = prompt.id;
  });

  const agentPromptMapping = {
    'fda-regulatory-strategist': [
      'create-fda-regulatory-strategy',
      'plan-pre-submission-meeting',
      'respond-to-fda-ai-request',
      'prepare-510k-submission'
    ],
    'clinical-trial-designer': [
      'design-pivotal-trial-protocol',
      'calculate-sample-size',
      'develop-recruitment-strategy',
      'create-safety-monitoring-plan'
    ],
    'hipaa-compliance-officer': [
      'conduct-hipaa-risk-assessment',
      'create-privacy-policies',
      'design-security-controls',
      'manage-breach-response'
    ],
    'reimbursement-strategist': [
      'develop-reimbursement-strategy',
      'create-heor-study-plan',
      'analyze-payer-landscape'
    ],
    'qms-architect': [
      'design-qms-architecture',
      'create-risk-management-plan',
      'develop-design-controls'
    ]
  };

  let promptRelationshipsCreated = 0;

  for (const agent of agents) {
    const expectedPrompts = agentPromptMapping[agent.name] || [];

    for (const promptName of expectedPrompts) {
      const promptId = promptMap[promptName];

      if (promptId) {
        try {
          const relationResult = await client.from('agent_prompts').insert([{
            agent_id: agent.id,
            prompt_id: promptId,
            is_default: true
          }]);

          if (!relationResult.error) {
            promptRelationshipsCreated++;
          }
        } catch (error) {
          // Ignore duplicate errors
        }
      }
    }
  }

  console.log(`✅ Created ${promptRelationshipsCreated} agent-prompt relationships\n`);

  // Final verification
  const verification = await Promise.all([
    client.from('agents').select('count'),
    client.from('capabilities').select('count'),
    client.from('prompts').select('count'),
    client.from('agent_capabilities').select('count'),
    client.from('agent_prompts').select('count')
  ]);

  console.log('🎯 Final Database State:');
  console.log('========================');
  console.log(`✅ Agents: ${verification[0].data[0].count}`);
  console.log(`✅ Capabilities: ${verification[1].data[0].count}`);
  console.log(`✅ Prompts: ${verification[2].data[0].count}`);
  console.log(`✅ Agent-Capability Relations: ${verification[3].data[0].count}`);
  console.log(`✅ Agent-Prompt Relations: ${verification[4].data[0].count}`);

  console.log('\n🚀 Database is now fully populated and ready for testing!');
}

createAgentRelationships().catch(console.error);