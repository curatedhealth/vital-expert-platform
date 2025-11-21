#!/usr/bin/env node

/**
 * Connect Agent Prompt Starters to PRISM Prompt Library
 *
 * This script creates prompt starters in the PRISM prompts table
 * and links them to agents via the agent_prompts junction table.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map agent names to their prompt starters
const AGENT_PROMPT_STARTERS = {
  'ui-ux-designer': {
    domain: 'design_ux',
    category: 'user_interface',
    starters: [
      'Help me simplify this complex healthcare workflow',
      'Review my interface design for cognitive load issues',
      'Suggest progressive disclosure patterns for patient data',
      'How can I make this medical form more intuitive?'
    ]
  },
  'healthcare-workflow-specialist': {
    domain: 'healthcare_clinical',
    category: 'clinical_workflow',
    starters: [
      'Optimize this clinical workflow for point-of-care use',
      'Design a mobile interface for busy clinicians',
      'How to handle interruptions in this workflow?',
      'Review this clinical summarization approach'
    ]
  },
  'conversational-ai-designer': {
    domain: 'design_ux',
    category: 'conversational_ai',
    starters: [
      'Design a medical chatbot conversation flow',
      'How to handle medical disclaimers in conversational AI?',
      'Review this symptom checker dialogue',
      'Make this health assistant more empathetic'
    ]
  },
  'accessibility-specialist': {
    domain: 'design_ux',
    category: 'accessibility',
    starters: [
      'Audit this interface for WCAG 2.2 AA compliance',
      'Design screen reader navigation for this medical app',
      'How to make medical imagery accessible?',
      'Review keyboard navigation for this clinical tool'
    ]
  },
  'engagement-designer': {
    domain: 'design_ux',
    category: 'patient_engagement',
    starters: [
      'Design gamification for medication adherence',
      'Create engagement mechanics for chronic disease management',
      'How to motivate patients without manipulation?',
      'Review this health behavior change strategy'
    ]
  },
  'clinical-safety-officer': {
    domain: 'healthcare_clinical',
    category: 'patient_safety',
    starters: [
      'Validate this clinical decision support feature',
      'Design fail-safe mechanisms for medication dosing',
      'Review this alert fatigue mitigation strategy',
      'How to prevent this diagnostic error?'
    ]
  },
  'medical-error-prevention-specialist': {
    domain: 'healthcare_clinical',
    category: 'patient_safety',
    starters: [
      'Analyze this near-miss medical event',
      'Design error-proof medication administration workflow',
      'Review this surgical safety checklist',
      'How to reduce handoff communication errors?'
    ]
  },
  'clinical-ai-validator': {
    domain: 'technology',
    category: 'clinical_ai',
    starters: [
      'Validate this medical AI model for clinical deployment',
      'Design bias detection for this diagnostic algorithm',
      'Review this AI explainability approach for clinicians',
      'How to test this AI for edge cases?'
    ]
  },
  'emergency-medicine-specialist': {
    domain: 'healthcare_clinical',
    category: 'emergency_medicine',
    starters: [
      'Design triage workflow for emergency department',
      'Optimize time-critical sepsis identification',
      'Review this stroke protocol decision support',
      'How to integrate trauma protocols into EHR?'
    ]
  },
  'oncology-informatics-specialist': {
    domain: 'healthcare_clinical',
    category: 'oncology',
    starters: [
      'Design precision oncology treatment selection tool',
      'Integrate genomic data into cancer care workflow',
      'Review this chemotherapy dosing calculator',
      'How to visualize complex cancer treatment timelines?'
    ]
  },
  'ehr-integration-architect': {
    domain: 'technology',
    category: 'ehr_integration',
    starters: [
      'Design HL7 FHIR integration for this digital health app',
      'Optimize EHR data extraction for analytics',
      'Review this bidirectional sync strategy',
      'How to handle EHR API rate limits?'
    ]
  },
  'healthcare-security-architect': {
    domain: 'technology',
    category: 'security',
    starters: [
      'Design zero-trust security for healthcare network',
      'Review this PHI encryption strategy',
      'How to secure medical IoT devices?',
      'Validate this access control model for clinical data'
    ]
  },
  'healthcare-ai-researcher': {
    domain: 'technology',
    category: 'clinical_ai',
    starters: [
      'Design federated learning for multi-hospital AI training',
      'Review this medical image segmentation model',
      'How to validate clinical AI against domain shift?',
      'Optimize this NLP model for clinical notes'
    ]
  }
};

async function main() {
  console.log('🔧 Starting PRISM prompt connection...\n');

  let totalPrompts = 0;
  let totalLinks = 0;

  for (const [agentName, config] of Object.entries(AGENT_PROMPT_STARTERS)) {
    console.log(`\n📝 Processing: ${agentName}`);

    // Get agent by name
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, display_name')
      .eq('name', agentName)
      .single();

    if (agentError || !agent) {
      console.log(`  ⚠️  Agent not found: ${agentName}`);
      continue;
    }

    console.log(`  ✅ Found agent: ${agent.display_name}`);

    // Create prompt starters
    for (let i = 0; i < config.starters.length; i++) {
      const starterText = config.starters[i];
      const promptName = `${agentName}_starter_${i + 1}`;

      // Check if prompt already exists
      const { data: existing } = await supabase
        .from('prompts')
        .select('id')
        .eq('name', promptName)
        .single();

      let promptId;

      if (existing) {
        console.log(`    ↻  Prompt already exists: ${promptName}`);
        promptId = existing.id;
      } else {
        // Create new prompt with all required fields
        const { data: prompt, error: promptError } = await supabase
          .from('prompts')
          .insert({
            name: promptName,
            display_name: starterText,
            description: `Prompt starter for ${agent.display_name}`,
            domain: config.domain,
            category: config.category,  // Required field!
            complexity_level: 'basic',  // Must be 'basic', 'intermediate', or 'advanced'
            system_prompt: `You are a ${agent.display_name}. Help the user with their request.`,
            user_prompt_template: starterText
          })
          .select()
          .single();

        if (promptError) {
          console.log(`    ❌ Failed to create prompt: ${promptError.message}`);
          continue;
        }

        console.log(`    ✅ Created prompt: ${promptName}`);
        promptId = prompt.id;
        totalPrompts++;
      }

      // Link prompt to agent
      const { data: existingLink } = await supabase
        .from('agent_prompts')
        .select('*')
        .eq('agent_id', agent.id)
        .eq('prompt_id', promptId)
        .single();

      if (existingLink) {
        console.log(`    ↻  Link already exists`);
      } else {
        const { error: linkError } = await supabase
          .from('agent_prompts')
          .insert({
            agent_id: agent.id,
            prompt_id: promptId
          });

        if (linkError) {
          console.log(`    ❌ Failed to link: ${linkError.message}`);
        } else {
          console.log(`    🔗 Linked prompt to agent`);
          totalLinks++;
        }
      }
    }
  }

  console.log('\n============================================================');
  console.log('📊 Summary:');
  console.log('============================================================');
  console.log(`  New prompts created:    ${totalPrompts}`);
  console.log(`  New agent-prompt links: ${totalLinks}`);
  console.log('============================================================\n');

  // Verify total counts
  const { count: promptCount } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .like('name', '%_starter_%');

  const { count: linkCount } = await supabase
    .from('agent_prompts')
    .select('*', { count: 'exact', head: true });

  console.log('📚 Total in database:');
  console.log(`  Total prompt starters:  ${promptCount || 0}`);
  console.log(`  Total agent links:      ${linkCount || 0}`);
  console.log('============================================================\n');

  console.log('✅ PRISM connection complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});