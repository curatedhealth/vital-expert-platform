/**
 * Contextual Helper Functions for Stakeholder-Adaptive Orchestrator
 * Provides stakeholder-specific responses, citations, and follow-up questions
 */

type StakeholderType = 'pharma' | 'payer' | 'provider' | 'dtx-startup' | 'auto';

// Stakeholder detection and contextual helper functions
export function detectStakeholderType(context: unknown): StakeholderType {
  // Implement intelligent stakeholder detection based on context clues
  if (context?.stakeholder) return context.stakeholder;
  // Add more sophisticated detection logic here
  return 'auto';
}

export function getDefaultAgentsForStakeholder(stakeholderType: string): string[] {
  const defaults: Record<string, string[]> = {
    'pharma': ['clinical-trial', 'fda-regulatory'],
    'payer': ['reimbursement', 'market-access'],
    'provider': ['clinical-trial', 'patient-engagement'],
    'dtx-startup': ['digital-therapeutics', 'market-access'],
    'auto': ['clinical-trial']
  };
  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return ['clinical-trial'];
  }
  return defaults[stakeholderType as keyof typeof defaults] || ['clinical-trial'];
}

export function getContextualWorkflow(stakeholderType: string, message: string, agents: string[]): string {
  // Stakeholder-priority workflow mapping
  const workflows: Record<string, string> = {
    'pharma': 'drug-development-workflow',
    'payer': 'coverage-assessment-workflow',
    'provider': 'clinical-care-workflow',
    'dtx-startup': 'digital-health-workflow',
    'auto': 'general-healthcare-consultation'
  };

  // Message content analysis for workflow refinement

  if (messageKeywords.includes('clinical trial') || messageKeywords.includes('study')) {
    return 'clinical-research-workflow';
  } else if (messageKeywords.includes('reimbursement') || messageKeywords.includes('coverage')) {
    return 'market-access-workflow';
  } else if (messageKeywords.includes('compliance') || messageKeywords.includes('privacy')) {
    return 'compliance-assessment-workflow';
  }

  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return 'general-healthcare-consultation';
  }
  return workflows[stakeholderType as keyof typeof workflows] || 'general-healthcare-consultation';
}

export function getContextualThinkingMessage(stakeholderType: string): string {
  const messages: Record<string, string> = {
    'pharma': 'Drug development experts analyzing your pharmaceutical query...',
    'payer': 'Coverage and value assessment experts reviewing your inquiry...',
    'provider': 'Clinical care specialists evaluating your patient care question...',
    'dtx-startup': 'Digital health market experts assessing your startup needs...',
    'auto': 'Healthcare AI experts analyzing your query...'
  };
  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return messages['auto'];
  }
  return messages[stakeholderType as keyof typeof messages] || messages['auto'];
}

// Contextual response generation based on stakeholder type
export function generateContextualResponse(message: string, selectedAgents: string[], execution: unknown, stakeholderType: string): string {

  return `${stakeholderContext.greeting} "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}".

**${stakeholderContext.analysisLabel}:**

I've consulted with our specialized ${stakeholderContext.expertType} focusing on **${agentExpertise}** to provide you with ${stakeholderContext.guidanceType}.

**${stakeholderContext.insightsLabel}:**

${generateStakeholderSpecificInsights(selectedAgents, stakeholderType)}

**Compliance Status:** ${execution.compliance_summary?.overall_compliant ? '✅ Fully Compliant' : '⚠️ Review Required'}
${execution.compliance_summary?.phi_detected ? '\n**Note:** Potential PHI detected - additional privacy safeguards recommended' : ''}

**${stakeholderContext.nextStepsLabel}:**

${generateContextualNextSteps(stakeholderType)}

**${stakeholderContext.collaborationLabel}:**
Our ${selectedAgents.length} specialized ${stakeholderContext.agentLabel}${selectedAgents.length > 1 ? 's are' : ' is'} ready to provide deeper analysis and customized guidance for your ${stakeholderContext.situationType}.

${stakeholderContext.callToAction}`;
}

function getStakeholderResponseContext(stakeholderType: string) {
  const contexts: Record<string, unknown> = {
    'pharma': {
      greeting: 'Thank you for your drug development inquiry about',
      analysisLabel: 'Pharmaceutical Development Analysis',
      expertType: 'drug development and regulatory experts',
      guidanceType: 'strategic pharmaceutical guidance',
      insightsLabel: 'Development Insights',
      nextStepsLabel: 'Recommended Development Strategy',
      collaborationLabel: 'Expert Development Team Available',
      agentLabel: 'pharmaceutical specialist',
      situationType: 'drug development goals',
      callToAction: 'Ready to advance your pharmaceutical development strategy?'
    },
    'payer': {
      greeting: 'Thank you for your coverage and value inquiry about',
      analysisLabel: 'Value Assessment Analysis',
      expertType: 'health economics and coverage experts',
      guidanceType: 'comprehensive value assessment',
      insightsLabel: 'Value Insights',
      nextStepsLabel: 'Recommended Coverage Strategy',
      collaborationLabel: 'Expert Value Assessment Team Available',
      agentLabel: 'health economics specialist',
      situationType: 'coverage objectives',
      callToAction: 'Ready to optimize your coverage and value strategy?'
    },
    'provider': {
      greeting: 'Thank you for your clinical care inquiry about',
      analysisLabel: 'Clinical Care Analysis',
      expertType: 'clinical care and patient management experts',
      guidanceType: 'evidence-based clinical guidance',
      insightsLabel: 'Clinical Insights',
      nextStepsLabel: 'Recommended Care Strategy',
      collaborationLabel: 'Expert Clinical Team Available',
      agentLabel: 'clinical specialist',
      situationType: 'patient care needs',
      callToAction: 'Ready to enhance your patient care approach?'
    },
    'dtx-startup': {
      greeting: 'Thank you for your digital health startup inquiry about',
      analysisLabel: 'Market Opportunity Analysis',
      expertType: 'digital health and market access experts',
      guidanceType: 'strategic market guidance',
      insightsLabel: 'Market Insights',
      nextStepsLabel: 'Recommended Go-to-Market Strategy',
      collaborationLabel: 'Expert Startup Advisory Team Available',
      agentLabel: 'digital health specialist',
      situationType: 'business objectives',
      callToAction: 'Ready to accelerate your digital health startup?'
    },
    'auto': {
      greeting: 'Thank you for your healthcare inquiry about',
      analysisLabel: 'Expert Analysis',
      expertType: 'healthcare AI experts',
      guidanceType: 'comprehensive guidance',
      insightsLabel: 'Key Insights',
      nextStepsLabel: 'Recommended Next Steps',
      collaborationLabel: 'Expert Collaboration Available',
      agentLabel: 'healthcare specialist',
      situationType: 'specific needs',
      callToAction: 'Would you like to dive deeper into any of these areas?'
    }
  };
  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return contexts['auto'];
  }
  return contexts[stakeholderType as keyof typeof contexts] || contexts['auto'];
}

function generateStakeholderSpecificInsights(selectedAgents: string[], stakeholderType: string): string {

  // Generate insights based on selected agents and stakeholder context
  if (selectedAgents.includes('fda-regulatory')) {

                   stakeholderType === 'dtx-startup' ? 'Digital Health' : 'Regulatory';
    insights += `\n🏛️ **${context} Regulatory Perspective:**\n`;
    insights += stakeholderType === 'pharma' ?
      '- Navigate IND/NDA pathways for your therapeutic\n- Plan Phase I-III clinical development strategy\n- Ensure CMC and manufacturing readiness\n- Prepare for FDA advisory committee meetings\n' :
      '- Consider appropriate regulatory pathways for your solution\n- Review compliance requirements for your use case\n- Plan regulatory strategy and submission timeline\n- Ensure quality management system readiness\n';
  }

  if (selectedAgents.includes('clinical-trial')) {
    insights += `\n🔬 **Clinical Development Considerations:**\n`;
    insights += stakeholderType === 'provider' ?
      '- Identify evidence gaps in current treatment protocols\n- Design pragmatic clinical studies for real-world evidence\n- Consider patient-reported outcomes and quality of life measures\n- Plan for implementation in clinical workflow\n' :
      '- Design robust clinical endpoints and study methodology\n- Calculate adequate sample sizes for statistical power\n- Consider regulatory-grade clinical documentation requirements\n- Plan for patient recruitment and retention strategies\n';
  }

  if (selectedAgents.includes('reimbursement')) {

    insights += `\n💰 **${focus}:**\n`;
    insights += stakeholderType === 'payer' ?
      '- Evaluate clinical and economic evidence quality\n- Assess budget impact and cost-effectiveness\n- Consider comparative effectiveness vs. standard of care\n- Plan value-based contract structures\n' :
      '- Develop compelling health economic evidence\n- Identify appropriate reimbursement pathways\n- Engage with key payers early in development\n- Consider real-world evidence collection strategies\n';
  }

  return insights;
}

function generateContextualNextSteps(stakeholderType: string): string {
  const steps: Record<string, string> = {
    'pharma': `1. **Clinical Development Planning** - Define Phase I-III strategy with regulatory milestones\n2. **Regulatory Strategy** - Develop comprehensive regulatory roadmap and submission timeline\n3. **Commercial Planning** - Prepare market access and pricing strategy\n4. **Partnership Strategy** - Identify potential collaboration and licensing opportunities`,
    'payer': `1. **Evidence Review** - Conduct systematic review of clinical and economic evidence\n2. **Budget Impact Analysis** - Model financial impact of coverage decisions\n3. **Policy Development** - Create coverage criteria and utilization management protocols\n4. **Stakeholder Engagement** - Collaborate with providers and patients on implementation`,
    'provider': `1. **Clinical Integration** - Plan implementation into existing clinical workflows\n2. **Training and Education** - Develop staff training and patient education programs\n3. **Quality Metrics** - Establish outcome measures and quality improvement protocols\n4. **Technology Integration** - Ensure compatibility with existing health IT systems`,
    'dtx-startup': `1. **Market Validation** - Conduct comprehensive market research and competitive analysis\n2. **Product-Market Fit** - Refine value proposition and go-to-market strategy\n3. **Regulatory Pathway** - Define regulatory strategy and development timeline\n4. **Funding Strategy** - Prepare for next funding round with compelling business case`,
    'auto': `1. **Detailed Analysis** - Work with specialized experts to define specific requirements\n2. **Strategic Planning** - Develop comprehensive strategy with clear milestones\n3. **Risk Assessment** - Identify potential challenges and mitigation strategies\n4. **Implementation Roadmap** - Create actionable plan with measurable outcomes`
  };
  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return steps['auto'];
  }
  return steps[stakeholderType as keyof typeof steps] || steps['auto'];
}

// Contextual metadata generation functions
export function generateContextualCitations(selectedAgents: string[], stakeholderType: string): unknown[] {

  // Add stakeholder-specific base citations
  if (stakeholderType === 'pharma') {
    citations.push({
      id: citationId++,
      number: citations.length + 1,
      title: 'FDA Drug Development and Review Process',
      authors: ['FDA Center for Drug Evaluation and Research'],
      journal: 'FDA.gov',
      year: 2023,
      url: 'https://www.fda.gov/drugs/development-approval-process-drugs',
      relevance: 0.95
    });
  } else if (stakeholderType === 'payer') {
    citations.push({
      id: citationId++,
      number: citations.length + 1,
      title: 'Health Economic Evaluation Guidelines',
      authors: ['ISPOR Health Technology Assessment Guidelines'],
      journal: 'Value in Health',
      year: 2023,
      url: 'https://www.ispor.org/heor-resources/good-practices',
      relevance: 0.94
    });
  } else if (stakeholderType === 'provider') {
    citations.push({
      id: citationId++,
      number: citations.length + 1,
      title: 'Clinical Practice Guidelines and Evidence-Based Medicine',
      authors: ['Institute of Medicine'],
      journal: 'National Academies Press',
      year: 2023,
      url: 'https://www.nationalacademies.org/hmd',
      relevance: 0.93
    });
  }

  // Add agent-specific citations
  if (selectedAgents.includes('clinical-trial')) {
    citations.push({
      id: citationId++,
      number: citations.length + 1,
      title: 'Digital Health Clinical Trial Design Best Practices',
      authors: ['Digital Medicine Society (DiMe)'],
      journal: 'Digital Medicine',
      year: 2023,
      url: 'https://www.dimesociety.org/clinical-trials',
      relevance: 0.92
    });
  }

  return citations;
}

export function generateContextualFollowupQuestions(message: string, selectedAgents: string[], stakeholderType: string): string[] {
  const stakeholderQuestions: Record<string, string[]> = {
    'pharma': [
      'What clinical development strategy would be most effective for my therapeutic area?',
      'How can I optimize my regulatory pathway and timeline?',
      'What partnerships should I consider for successful commercialization?'
    ],
    'payer': [
      'What evidence standards should I apply for coverage decisions?',
      'How can I structure value-based contracts effectively?',
      'What budget impact modeling approach would be most appropriate?'
    ],
    'provider': [
      'How can I integrate this solution into our existing clinical workflows?',
      'What training and change management approach would be most effective?',
      'How should we measure clinical outcomes and quality improvements?'
    ],
    'dtx-startup': [
      'What go-to-market strategy would be most effective for my solution?',
      'How can I differentiate from existing competitors in the market?',
      'What funding and partnership opportunities should I prioritize?'
    ],
    'auto': [
      'What specific pathway would be most appropriate for my solution?',
      'How can I strengthen the evidence for my healthcare innovation?',
      'What key stakeholders should I engage early in development?'
    ]
  };

  // Validate stakeholderType to prevent object injection
  const validStakeholderTypes = ['pharma', 'payer', 'provider', 'dtx-startup', 'auto'] as const;
  if (!validStakeholderTypes.includes(stakeholderType as unknown)) {
    return stakeholderQuestions['auto'];
  }
  const questions = stakeholderQuestions[stakeholderType as keyof typeof stakeholderQuestions] || stakeholderQuestions['auto'];

  // Add agent-specific questions

  if (selectedAgents.includes('reimbursement')) {
    agentQuestions.push('What health economic data would be most compelling to decision-makers?');
  }
  if (selectedAgents.includes('ai-ml-specialist')) {
    agentQuestions.push('What AI/ML validation requirements should I prioritize?');
  }
  if (selectedAgents.includes('data-privacy')) {
    agentQuestions.push('How can I ensure comprehensive privacy compliance from the start?');
  }

  return [...questions, ...agentQuestions].slice(0, 3);
}

export function generateContextualSources(selectedAgents: string[], stakeholderType: string): unknown[] {

  // Add stakeholder-specific sources
  if (stakeholderType === 'pharma') {
    sources.push({
      id: 'source-pharma',
      type: 'regulatory-guidance' as const,
      title: 'FDA Drug Development Resources',
      url: 'https://www.fda.gov/drugs/development-resources',
      date: new Date('2023-09-01'),
      reliability: 0.98,
      excerpt: 'Comprehensive guidance on pharmaceutical development and regulatory pathways.'
    });
  } else if (stakeholderType === 'payer') {
    sources.push({
      id: 'source-payer',
      type: 'health-economics' as const,
      title: 'Health Technology Assessment Guidelines',
      url: 'https://www.ispor.org/heor-resources',
      date: new Date('2023-08-15'),
      reliability: 0.96,
      excerpt: 'Evidence standards and methodologies for health economic evaluation.'
    });
  } else if (stakeholderType === 'provider') {
    sources.push({
      id: 'source-provider',
      type: 'clinical-guidelines' as const,
      title: 'Evidence-Based Clinical Practice Resources',
      url: 'https://www.ahrq.gov/evidence',
      date: new Date('2023-07-20'),
      reliability: 0.97,
      excerpt: 'Clinical practice guidelines and evidence-based care recommendations.'
    });
  }

  return sources;
}

// Agent specialty mapping (shared function)
export function getAgentSpecialty(agentType: string): string {
  const specialties: Record<string, string> = {
    'fda-regulatory': 'FDA Regulatory Affairs',
    'clinical-trial': 'Clinical Research Design',
    'digital-therapeutics': 'Digital Health & DTx',
    'ai-ml-specialist': 'AI/ML in Healthcare',
    'reimbursement': 'Healthcare Economics',
    'medical-safety': 'Clinical Safety & Risk',
    'data-privacy': 'HIPAA & Data Privacy',
    'compliance-monitor': 'Quality Management',
    'ema-specialist': 'EU Medical Device Regulation',
    'biostatistics': 'Clinical Evidence Analysis',
    'market-access': 'Market Access Strategy',
    'patient-engagement': 'Patient Experience',
    'real-world-evidence': 'Medical Literature',
    'quality-systems': 'Quality Systems'
  };
  // Validate agentType to prevent object injection
  const validAgentTypes = [
    'clinical-trial', 'fda-regulatory', 'digital-therapeutics', 'ai-ml-specialist',
    'reimbursement', 'medical-safety', 'data-privacy', 'compliance-monitor',
    'ema-specialist', 'biostatistics', 'market-access', 'patient-engagement',
    'real-world-evidence', 'quality-systems'
  ] as const;
  
  if (!validAgentTypes.includes(agentType as unknown)) {
    return 'Healthcare AI Expert';
  }
  return specialties[agentType as keyof typeof specialties] || 'Healthcare AI Expert';
}