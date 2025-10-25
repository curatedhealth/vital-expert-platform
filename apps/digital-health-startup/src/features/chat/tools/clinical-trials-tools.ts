import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * ClinicalTrials.gov Search Tool
 */
export const clinicalTrialsSearchTool = new DynamicStructuredTool({
  name: 'clinical_trials_search',
  description: `Search ClinicalTrials.gov for relevant clinical studies.
  Use this when you need to find:
  - Similar clinical trials for digital health interventions
  - Study designs for specific conditions
  - Endpoints used in comparable studies
  - Recruitment strategies and sample sizes
  - Published results from completed trials`,
  schema: z.object({
    condition: z.string().optional().describe('Medical condition or disease'),
    intervention: z.string().optional().describe('Type of intervention (drug, device, behavioral)'),
    phase: z.array(z.enum(['1', '2', '3', '4'])).optional().describe('Trial phases to search'),
    status: z.array(z.enum(['recruiting', 'completed', 'active'])).optional().describe('Trial status'),
    country: z.string().optional().describe('Country where trial is conducted'),
  }),
  func: async ({ condition, intervention, phase, status, country }) => {
    try {
      console.log('🔬 ClinicalTrials Search:', { condition, intervention, phase, status });

      const trials = await searchClinicalTrials({ condition, intervention, phase, status, country });

      return JSON.stringify({
        success: true,
        totalTrials: trials.length,
        trials: trials.slice(0, 5),
        summary: `Found ${trials.length} clinical trials${condition ? ` for ${condition}` : ''}`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Clinical trials search failed',
      });
    }
  },
});

async function searchClinicalTrials(params: any) {
  // Mock clinical trials data
  const mockTrials = [
    {
      nctId: 'NCT04567890',
      title: 'Digital Cognitive Behavioral Therapy for Generalized Anxiety Disorder',
      condition: 'Generalized Anxiety Disorder',
      intervention: 'Digital Therapeutic (CBT-based app)',
      phase: '3',
      status: 'Completed',
      enrollment: 324,
      primaryOutcome: 'Change in GAD-7 score from baseline to 12 weeks',
      secondaryOutcomes: ['Quality of life (SF-36)', 'Treatment adherence', 'Adverse events'],
      results: {
        primaryEndpoint: 'Mean GAD-7 reduction of 6.2 points (p<0.001)',
        effectSize: 'Cohen\'s d = 0.85',
        adverseEvents: 'No serious adverse events reported',
      },
      sponsor: 'Digital Health Research Institute',
      startDate: '2022-03-01',
      completionDate: '2023-09-30',
    },
    {
      nctId: 'NCT05123456',
      title: 'AI-Powered Mental Health Assessment Tool Validation Study',
      condition: 'Depression, Anxiety',
      intervention: 'Digital Diagnostic Tool',
      phase: '2',
      status: 'Recruiting',
      enrollment: 500,
      primaryOutcome: 'Diagnostic accuracy compared to clinician assessment',
      secondaryOutcomes: ['Inter-rater reliability', 'User satisfaction', 'Time to diagnosis'],
      sponsor: 'MindTech Solutions',
      startDate: '2024-01-15',
      estimatedCompletion: '2025-06-30',
    },
    {
      nctId: 'NCT03987654',
      title: 'Prescription Digital Therapeutic for Insomnia in Adults',
      condition: 'Chronic Insomnia',
      intervention: 'Digital CBT-I Program',
      phase: '3',
      status: 'Completed',
      enrollment: 456,
      primaryOutcome: 'Change in Insomnia Severity Index (ISI) at 9 weeks',
      results: {
        primaryEndpoint: 'ISI reduction of 8.4 points vs 2.1 in control (p<0.001)',
        clinicalResponse: '67% achieved clinical remission',
      },
      sponsor: 'Sleep Health Digital',
      completionDate: '2023-12-15',
    },
  ];

  // Filter based on search criteria
  let filtered = mockTrials;

  if (params.condition) {
    filtered = filtered.filter(t =>
      t.condition.toLowerCase().includes(params.condition.toLowerCase())
    );
  }

  if (params.phase) {
    filtered = filtered.filter(t => params.phase.includes(t.phase));
  }

  if (params.status) {
    filtered = filtered.filter(t =>
      params.status.some((s: string) => t.status.toLowerCase().includes(s.toLowerCase()))
    );
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  return filtered;
}

/**
 * Study Design Helper Tool
 */
export const studyDesignTool = new DynamicStructuredTool({
  name: 'study_design_helper',
  description: `Generate study design recommendations for clinical trials.
  Use this to get recommendations on:
  - Appropriate trial design (RCT, single-arm, crossover)
  - Control group selection
  - Randomization strategy
  - Blinding approaches
  - Inclusion/exclusion criteria`,
  schema: z.object({
    deviceType: z.string().describe('Type of medical device or digital therapeutic'),
    condition: z.string().describe('Target medical condition'),
    intendedUse: z.string().describe('Intended use of the device'),
    riskClass: z.enum(['low', 'moderate', 'high']).describe('Device risk classification'),
  }),
  func: async ({ deviceType, condition, intendedUse, riskClass }) => {
    try {
      console.log('📋 Study Design Helper:', { deviceType, condition, riskClass });

      const design = generateStudyDesign(deviceType, condition, intendedUse, riskClass);

      return JSON.stringify({
        success: true,
        design,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Study design generation failed',
      });
    }
  },
});

function generateStudyDesign(deviceType: string, condition: string, intendedUse: string, riskClass: string) {
  const designs: Record<string, any> = {
    low: {
      recommendedDesign: 'Single-arm feasibility study',
      sampleSize: '30-50 participants',
      duration: '8-12 weeks',
      primaryEndpoint: 'Usability and safety',
      controlGroup: 'Not required for low-risk devices',
    },
    moderate: {
      recommendedDesign: 'Randomized Controlled Trial (RCT)',
      sampleSize: '100-200 participants per arm',
      duration: '12-24 weeks',
      primaryEndpoint: 'Efficacy on validated clinical outcome measure',
      controlGroup: 'Standard of care or sham control',
      randomization: '1:1 allocation with stratification by baseline severity',
      blinding: 'Patient and outcome assessor blinded (if feasible)',
    },
    high: {
      recommendedDesign: 'Multi-center Randomized Controlled Trial',
      sampleSize: '200-500 participants per arm',
      duration: '6-12 months minimum',
      primaryEndpoint: 'Clinical efficacy with long-term safety follow-up',
      controlGroup: 'Active comparator (standard of care)',
      randomization: 'Stratified block randomization across sites',
      blinding: 'Double-blind if possible, independent outcome assessment',
      additionalRequirements: [
        'Data Safety Monitoring Board (DSMB)',
        'Interim analysis plan',
        'Long-term safety follow-up (12+ months)',
      ],
    },
  };

  const baseDesign = designs[riskClass];

  return {
    ...baseDesign,
    inclusionCriteria: generateInclusionCriteria(condition),
    exclusionCriteria: generateExclusionCriteria(condition, deviceType),
    endpoints: generateEndpoints(condition, intendedUse),
  };
}

function generateInclusionCriteria(condition: string) {
  return [
    `Adults aged 18-65 years`,
    `Diagnosis of ${condition} per DSM-5/ICD-11 criteria`,
    `Baseline symptom severity meeting threshold (e.g., moderate to severe)`,
    `Access to smartphone or computer for digital intervention`,
    `Ability to provide informed consent`,
  ];
}

function generateExclusionCriteria(condition: string, deviceType: string) {
  return [
    `Active suicidal ideation or recent suicide attempt`,
    `Current substance use disorder requiring treatment`,
    `Unstable medical condition affecting participation`,
    `Current participation in another clinical trial`,
    `Insufficient language proficiency for digital intervention`,
  ];
}

function generateEndpoints(condition: string, intendedUse: string) {
  const commonEndpoints: Record<string, any> = {
    anxiety: {
      primary: 'Change in GAD-7 score from baseline',
      secondary: [
        'Response rate (≥50% symptom reduction)',
        'Remission rate (GAD-7 < 5)',
        'Quality of life (EQ-5D)',
        'Treatment adherence',
      ],
      safety: 'Adverse events, symptom worsening',
    },
    depression: {
      primary: 'Change in PHQ-9 score from baseline',
      secondary: [
        'Response rate (≥50% symptom reduction)',
        'Remission rate (PHQ-9 < 5)',
        'Functional impairment (WSAS)',
        'User engagement metrics',
      ],
      safety: 'Suicidal ideation monitoring, adverse events',
    },
  };

  return commonEndpoints.anxiety; // Default to anxiety for demo
}

/**
 * Endpoint Selection Tool
 */
export const endpointSelectorTool = new DynamicStructuredTool({
  name: 'clinical_endpoint_selector',
  description: `Recommend appropriate clinical endpoints for digital health studies.
  Use this to select:
  - Primary endpoints (efficacy measures)
  - Secondary endpoints (supporting outcomes)
  - Safety endpoints
  - Exploratory endpoints (digital biomarkers, engagement)`,
  schema: z.object({
    condition: z.string().describe('Target medical condition'),
    deviceType: z.string().describe('Type of digital health intervention'),
    studyPhase: z.enum(['pilot', 'phase2', 'phase3']).describe('Study phase'),
  }),
  func: async ({ condition, deviceType, studyPhase }) => {
    try {
      const endpoints = selectEndpoints(condition, deviceType, studyPhase);

      return JSON.stringify({
        success: true,
        endpoints,
        summary: `Recommended endpoints for ${condition} ${studyPhase} study`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Endpoint selection failed',
      });
    }
  },
});

function selectEndpoints(condition: string, deviceType: string, studyPhase: string) {
  const endpointLibrary: Record<string, any> = {
    pilot: {
      primary: [
        {
          name: 'Feasibility',
          measure: 'Recruitment rate, retention rate, completion rate',
          justification: 'Pilot studies focus on feasibility metrics',
        },
      ],
      secondary: [
        {
          name: 'Preliminary efficacy signal',
          measure: 'Symptom change on validated scale',
          justification: 'Exploratory efficacy assessment',
        },
        {
          name: 'Usability',
          measure: 'System Usability Scale (SUS)',
        },
      ],
    },
    phase2: {
      primary: [
        {
          name: 'Clinical efficacy',
          measure: 'Change in validated symptom scale',
          timepoint: '12 weeks',
          justification: 'Demonstrates clinical benefit',
        },
      ],
      secondary: [
        {
          name: 'Response rate',
          measure: '≥50% symptom reduction',
        },
        {
          name: 'Quality of life',
          measure: 'EQ-5D or SF-36',
        },
        {
          name: 'Engagement metrics',
          measure: 'Session completion, time in app',
        },
      ],
    },
    phase3: {
      primary: [
        {
          name: 'Superior or non-inferior efficacy',
          measure: 'Change in validated outcome vs. control',
          timepoint: '12-24 weeks',
          statisticalApproach: 'Pre-specified superiority or non-inferiority margin',
        },
      ],
      secondary: [
        {
          name: 'Remission rate',
          measure: 'Below clinical threshold on primary scale',
        },
        {
          name: 'Durability of effect',
          measure: 'Maintenance of improvement at 6-12 months',
        },
        {
          name: 'Functional outcomes',
          measure: 'Return to work, daily functioning',
        },
        {
          name: 'Safety',
          measure: 'Adverse events, symptom worsening',
        },
      ],
    },
  };

  return endpointLibrary[studyPhase] || endpointLibrary.phase2;
}

export const clinicalTrialsTools = [
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointSelectorTool,
];

// Export individual tools with expected names
export const endpointsTool = endpointSelectorTool;
