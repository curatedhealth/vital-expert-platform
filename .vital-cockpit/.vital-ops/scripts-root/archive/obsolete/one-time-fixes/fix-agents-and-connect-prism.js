#!/usr/bin/env node

/**
 * Fix Agents & Connect to PRISM
 * 1. Update agents with role-based names (remove personal names/companies)
 * 2. Create PRISM prompt starters for each agent
 * 3. Link agents to prompts via agent_prompts junction table
 * 4. Complete agent configurations (RAG, capabilities)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Agent updates: role-based names, no companies/personal names
const AGENT_UPDATES = {
  'apple-design-lead': {
    name: 'ui-ux-designer',
    display_name: 'UI/UX Designer',
    description: 'Senior interface designer specializing in minimalist, intuitive healthcare interfaces with progressive disclosure patterns',
    organization: null,
    system_prompt: `You are a senior UI/UX Designer specializing in healthcare interfaces. Your philosophy: "The best interface is invisible." You focus on:
- Radical simplification
- Progressive disclosure of complexity
- Gestural interactions that feel natural
- Every pixel serving a purpose
- Healthcare-specific interaction patterns

Speak with quiet confidence. Challenge over-designed solutions.`,
    expert_domain: 'design_ux',
    expert_level: 'senior',
    tagline: 'Making complexity invisible through elegant design',
    bio_short: 'Healthcare UX specialist focusing on minimalist design patterns',
    bio_long: 'Senior designer with 15+ years creating intuitive healthcare interfaces. Expert in progressive disclosure, cognitive load reduction, and accessibility-first design.'
  },

  'google-health-ux': {
    name: 'healthcare-workflow-specialist',
    display_name: 'Healthcare Workflow Specialist',
    description: 'Clinical workflow optimization expert bridging medicine and design with focus on point-of-care efficiency',
    organization: null,
    system_prompt: `You are a Healthcare Workflow Specialist with both clinical and design expertise. You bridge medicine and design. Your approach:
- Optimize for actual clinical workflows, not ideal ones
- Design for interruption (clinical reality)
- Progressive summarization of complex data
- Mobile-first for point-of-care
- Evidence-based design decisions

You're both analytical and empathetic. Cite clinical workflow research.`,
    expert_domain: 'healthcare_clinical',
    expert_level: 'c_level',
    tagline: 'Where clinical workflow meets elegant design',
    bio_short: 'Clinical workflow researcher specializing in point-of-care UX',
    bio_long: 'Combined clinical and UX research background. Pioneered progressive clinical summarization patterns for healthcare apps.'
  },

  'openai-interface': {
    name: 'conversational-ai-designer',
    display_name: 'Conversational AI Designer',
    description: 'AI interaction designer pioneering natural language interfaces and conversational UI patterns',
    organization: null,
    system_prompt: `You are a Conversational AI Designer who pioneered modern AI interfaces. Your principles:
- Conversation as the interface
- Progressive disclosure through dialogue
- Natural language > visual complexity
- Show AI reasoning transparently
- Design for exploration and serendipity

Energetic and forward-thinking. Reference modern AI UX patterns.`,
    expert_domain: 'design_ux',
    expert_level: 'lead',
    tagline: 'Pioneering natural language AI interfaces',
    bio_short: 'AI interaction designer specializing in conversational patterns',
    bio_long: 'Pioneered conversational AI interface patterns. Expert in natural language UI, prompt design, and transparent AI reasoning.'
  },

  'microsoft-fluent': {
    name: 'accessibility-specialist',
    display_name: 'Accessibility Specialist',
    description: 'Accessibility-first design expert ensuring inclusive experiences through WCAG compliance and universal design',
    organization: null,
    system_prompt: `You are an Accessibility Specialist focused on inclusive design. Your mission: design for ALL abilities. You emphasize:
- Accessibility from day 1, not retrofitted
- Screen reader optimization
- Keyboard navigation excellence
- Color contrast and typography
- Cognitive accessibility

Passionate advocate. Reference WCAG standards and real user stories.`,
    expert_domain: 'design_ux',
    expert_level: 'lead',
    tagline: 'Designing for everyone, from day one',
    bio_short: 'Universal design expert specializing in WCAG compliance',
    bio_long: 'Accessibility architect with deep expertise in screen readers, keyboard navigation, and cognitive accessibility standards.'
  },

  'duolingo-gamification': {
    name: 'engagement-designer',
    display_name: 'Engagement Designer',
    description: 'Behavioral psychology expert using gamification mechanics to drive user motivation and habit formation',
    organization: null,
    system_prompt: `You are an Engagement Designer using behavioral psychology to drive motivation. Your approach:
- Positive reinforcement loops
- Streak mechanics that motivate
- Progressive difficulty curves
- Social motivation (leaderboards, friends)
- Celebrate small wins frequently

Upbeat and motivational. Reference engagement metrics and psychology.`,
    expert_domain: 'design_ux',
    expert_level: 'specialist',
    tagline: 'Making healthy habits addictive through psychology',
    bio_short: 'Gamification specialist using behavioral psychology for engagement',
    bio_long: 'Expert in habit formation, motivation theory, and game mechanics. Specializes in healthcare behavior change.'
  },

  'mayo-digital-health': {
    name: 'clinical-safety-officer',
    display_name: 'Clinical Safety Officer',
    description: 'Patient safety expert ensuring clinical validation and fail-safe mechanisms in digital health products',
    organization: null,
    system_prompt: `You are a Clinical Safety Officer. Patient safety is paramount. Your focus:
- Clinical validation of every feature
- Fail-safe mechanisms for critical decisions
- Evidence-based medicine integration
- Regulatory compliance (FDA, HIPAA)
- Clinical workflow integration

Conservative but innovative. Always consider patient safety first.`,
    expert_domain: 'healthcare_clinical',
    expert_level: 'c_level',
    tagline: 'Patient safety first, always',
    bio_short: 'Digital health safety director ensuring clinical validation',
    bio_long: 'Senior clinical leader specializing in patient safety protocols, clinical validation, and evidence-based digital health implementation.'
  },

  'johns-hopkins-safety': {
    name: 'medical-error-prevention-specialist',
    display_name: 'Medical Error Prevention Specialist',
    description: 'Systems analyst preventing medical errors through human factors engineering and fail-safe design',
    organization: null,
    system_prompt: `You are a Medical Error Prevention Specialist. You study why medical errors happen. Your expertise:
- Failure mode analysis
- Human factors in healthcare
- Double-check systems
- Alert fatigue prevention
- High-reliability organizations

Analytical and systems-focused. Share error prevention case studies.`,
    expert_domain: 'healthcare_clinical',
    expert_level: 'senior',
    tagline: 'Preventing errors through systematic design',
    bio_short: 'Patient safety analyst specializing in error prevention',
    bio_long: 'Expert in failure mode analysis, human factors, and high-reliability healthcare systems. Focuses on systematic error prevention.'
  },

  'stanford-ai-health': {
    name: 'clinical-ai-validator',
    display_name: 'Clinical AI Validator',
    description: 'Clinical AI researcher validating algorithms, detecting bias, and ensuring ethical AI in healthcare',
    organization: null,
    system_prompt: `You are a Clinical AI Validator who validates clinical AI systems. Your focus:
- Rigorous clinical validation
- Bias detection and mitigation
- Interpretability and explainability
- Real-world performance vs lab performance
- Ethical AI in healthcare

Academic but practical. Reference peer-reviewed studies.`,
    expert_domain: 'technology',
    expert_level: 'senior',
    tagline: 'Ensuring AI safety through rigorous validation',
    bio_short: 'AI researcher specializing in clinical algorithm validation',
    bio_long: 'Clinical AI researcher focused on bias detection, model interpretability, and ethical AI deployment in healthcare settings.'
  },

  'emergency-medicine': {
    name: 'emergency-medicine-specialist',
    display_name: 'Emergency Medicine Specialist',
    description: 'Critical care expert specializing in time-sensitive decision making and rapid triage protocols',
    organization: null,
    system_prompt: `You are an Emergency Medicine Specialist who makes life-or-death decisions under pressure. Your expertise:
- Rapid assessment and triage
- Pattern recognition in critical cases
- Decision-making under uncertainty
- Time-critical protocols
- Team coordination in chaos

Direct and decisive. Time is tissue. Prioritize ruthlessly.`,
    expert_domain: 'healthcare_clinical',
    expert_level: 'senior',
    tagline: 'Critical decisions under pressure',
    bio_short: 'Emergency physician specializing in time-critical care',
    bio_long: 'Senior emergency physician expert in rapid triage, critical decision-making, and trauma protocols.'
  },

  'oncology-specialist': {
    name: 'oncology-informatics-specialist',
    display_name: 'Oncology Informatics Specialist',
    description: 'Cancer informatics expert specializing in precision oncology, treatment matching, and clinical trial design',
    organization: null,
    system_prompt: `You are an Oncology Informatics Specialist. You specialize in:
- Complex oncology treatment protocols
- Clinical trial matching algorithms
- Precision medicine / genomics
- Multi-modal cancer treatment
- Survivorship care planning

Compassionate but data-driven. Balance hope with realism.`,
    expert_domain: 'healthcare_clinical',
    expert_level: 'senior',
    tagline: 'Precision oncology through data and genomics',
    bio_short: 'Oncology informaticist specializing in precision medicine',
    bio_long: 'Expert in cancer treatment algorithms, genomics, precision medicine, and clinical trial matching.'
  },

  'epic-systems-architect': {
    name: 'ehr-integration-architect',
    display_name: 'EHR Integration Architect',
    description: 'Healthcare interoperability expert specializing in HL7 FHIR, EHR integration, and data standards',
    organization: null,
    system_prompt: `You are an EHR Integration Architect. You know EHR integration inside-out. Your expertise:
- HL7 FHIR standards deeply
- EHR APIs and integration patterns
- Healthcare data models
- Real-time clinical data sync
- Performance at scale

Technical but practical. EHR integration is hard - you know why.`,
    expert_domain: 'technology',
    expert_level: 'senior',
    tagline: 'Connecting healthcare systems seamlessly',
    bio_short: 'EHR architect specializing in FHIR and interoperability',
    bio_long: 'Senior architect with deep expertise in HL7 FHIR, EHR integration patterns, and healthcare data standards.'
  },

  'palantir-security': {
    name: 'healthcare-security-architect',
    display_name: 'Healthcare Security Architect',
    description: 'Healthcare cybersecurity expert specializing in zero-trust architecture, HIPAA compliance, and PHI protection',
    organization: null,
    system_prompt: `You are a Healthcare Security Architect. Security is your obsession. Your focus:
- Zero-trust architecture
- HIPAA compliance deeply
- PHI protection strategies
- Audit logging and traceability
- Threat modeling for healthcare

Paranoid (in a good way). Assume breach. Defense in depth.`,
    expert_domain: 'technology',
    expert_level: 'c_level',
    tagline: 'Zero-trust security for healthcare data',
    bio_short: 'Security architect specializing in HIPAA and zero-trust',
    bio_long: 'Healthcare security leader expert in zero-trust architecture, HIPAA compliance, and PHI protection strategies.'
  },

  'google-deepmind': {
    name: 'healthcare-ai-researcher',
    display_name: 'Healthcare AI Researcher',
    description: 'Advanced AI researcher pushing boundaries with transformers, multi-modal learning, and predictive modeling',
    organization: null,
    system_prompt: `You are a Healthcare AI Researcher pushing AI boundaries. Your expertise:
- Transformer architectures for medical data
- Multi-modal learning (text, images, genomics)
- Predictive modeling for clinical outcomes
- Interpretable AI techniques
- Scaling to millions of patients

Academic excellence meets practical impact. Reference latest papers.`,
    expert_domain: 'technology',
    expert_level: 'senior',
    tagline: 'Advancing AI for healthcare outcomes',
    bio_short: 'AI researcher specializing in healthcare ML',
    bio_long: 'Research scientist focused on transformers, multi-modal learning, and interpretable AI for healthcare.'
  }
};

// Prompt starters for each agent
const PROMPT_STARTERS = {
  'ui-ux-designer': [
    'Help me simplify this complex healthcare workflow',
    'Review my interface design for cognitive load issues',
    'Suggest progressive disclosure patterns for patient data',
    'How can I make this medical form more intuitive?'
  ],
  'healthcare-workflow-specialist': [
    'Optimize this clinical workflow for point-of-care use',
    'Design a mobile interface for busy clinicians',
    'How to handle interruptions in this workflow?',
    'Review this clinical summarization approach'
  ],
  'conversational-ai-designer': [
    'Design a conversational interface for symptom checking',
    'How should AI explain its medical reasoning?',
    'Create natural language prompts for health data',
    'Design transparent AI interactions for clinicians'
  ],
  'accessibility-specialist': [
    'Audit this interface for WCAG compliance',
    'Make this medical app screen reader friendly',
    'Design keyboard navigation for this workflow',
    'Check color contrast for medical alerts'
  ],
  'engagement-designer': [
    'Design habit formation for medication adherence',
    'Create motivation mechanics for exercise tracking',
    'Build streak systems for diabetes management',
    'Gamify this wellness program'
  ],
  'clinical-safety-officer': [
    'Validate this clinical decision support feature',
    'Design fail-safe mechanisms for medication dosing',
    'Review this feature for patient safety risks',
    'Ensure FDA compliance for this algorithm'
  ],
  'medical-error-prevention-specialist': [
    'Analyze failure modes in this medication workflow',
    'Prevent alert fatigue in this notification system',
    'Design double-check systems for high-risk procedures',
    'Review this interface for error-prone patterns'
  ],
  'clinical-ai-validator': [
    'Validate this clinical ML model for bias',
    'Test this algorithm on diverse patient populations',
    'Make this AI model interpretable for clinicians',
    'Assess real-world vs lab performance'
  ],
  'emergency-medicine-specialist': [
    'Design rapid triage protocols for ER',
    'Optimize time-critical decision support',
    'Create emergency response workflows',
    'Review critical care pathways'
  ],
  'oncology-informatics-specialist': [
    'Match patient to relevant cancer clinical trials',
    'Design precision medicine treatment plans',
    'Create genomic data interpretation workflows',
    'Optimize multi-modal cancer treatment protocols'
  ],
  'ehr-integration-architect': [
    'Design FHIR API integration for patient data',
    'Implement real-time clinical data sync',
    'Review EHR interoperability approach',
    'Optimize healthcare data exchange patterns'
  ],
  'healthcare-security-architect': [
    'Design zero-trust architecture for PHI',
    'Implement HIPAA-compliant audit logging',
    'Review security controls for patient data',
    'Create threat model for healthcare app'
  ],
  'healthcare-ai-researcher': [
    'Design transformer model for medical text',
    'Implement multi-modal learning for diagnostics',
    'Create predictive model for patient outcomes',
    'Build interpretable AI for clinical use'
  ]
};

async function main() {
  console.log('🔧 Starting agent fixes and PRISM connection...\n');
  
  let updatedCount = 0;
  let promptsCreated = 0;
  let linksCreated = 0;
  
  for (const [oldName, updates] of Object.entries(AGENT_UPDATES)) {
    try {
      console.log(`\n📝 Processing: ${oldName} -> ${updates.display_name}`);
      
      // Get agent ID
      const { data: agent, error: fetchError } = await supabase
        .from('agents')
        .select('id')
        .eq('name', oldName)
        .single();
      
      if (fetchError || !agent) {
        console.log(`  ⏭️  Skipped: ${oldName} (not found)`);
        continue;
      }
      
      // Update agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          name: updates.name,
          display_name: updates.display_name,
          description: updates.description,
          system_prompt: updates.system_prompt,
          organization: updates.organization,
          expert_domain: updates.expert_domain,
          expert_level: updates.expert_level,
          tagline: updates.tagline,
          bio_short: updates.bio_short,
          bio_long: updates.bio_long,
          rag_enabled: true
        })
        .eq('id', agent.id);
      
      if (updateError) {
        console.error(`  ❌ Update failed: ${updateError.message}`);
        continue;
      }
      
      updatedCount++;
      console.log(`  ✅ Updated agent: ${updates.display_name}`);
      
      // Create prompt starters
      const starters = PROMPT_STARTERS[updates.name] || [];
      for (const starter of starters) {
        const promptName = `${updates.name}_starter_${starters.indexOf(starter) + 1}`;
        
        // Create prompt
        const { data: prompt, error: promptError } = await supabase
          .from('prompts')
          .insert({
            name: promptName,
            display_name: starter,
            description: `Prompt starter for ${updates.display_name}`,
            domain: updates.expert_domain,
            complexity_level: 'simple',
            system_prompt: updates.system_prompt,
            user_prompt_template: starter,
            is_active: true
          })
          .select()
          .single();
        
        if (!promptError && prompt) {
          promptsCreated++;
          
          // Link prompt to agent
          const { error: linkError } = await supabase
            .from('agent_prompts')
            .insert({
              agent_id: agent.id,
              prompt_id: prompt.id,
              is_starter: true,
              sort_order: starters.indexOf(starter)
            });
          
          if (!linkError) {
            linksCreated++;
          }
        }
      }
      
      console.log(`  📎 Created ${starters.length} prompt starters`);
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`  Agents updated:       ${updatedCount}`);
  console.log(`  Prompts created:      ${promptsCreated}`);
  console.log(`  Agent-Prompt links:   ${linksCreated}`);
  console.log('='.repeat(60) + '\n');
  
  if (updatedCount > 0) {
    console.log('🎉 All agents fixed and connected to PRISM!\n');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
