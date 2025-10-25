import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * FDA Database Search Tool
 * Searches FDA 510(k) clearances, PMA approvals, and guidance documents
 */
export const fdaDatabaseTool = new DynamicStructuredTool({
  name: 'fda_database_search',
  description: `Search the FDA database for medical device clearances, approvals, and guidance documents.
  Use this when you need to find:
  - 510(k) clearances for similar devices (predicate devices)
  - PMA approvals for Class III devices
  - De Novo classifications for novel devices
  - FDA guidance documents on specific topics
  - Device recalls or safety alerts
  Input should include the device type, intended use, or regulatory pathway.`,
  schema: z.object({
    query: z.string().describe('Search query for FDA database'),
    searchType: z.enum(['510k', 'pma', 'de_novo', 'guidance', 'recall']).optional().describe('Type of FDA data to search'),
    deviceClass: z.enum(['I', 'II', 'III']).optional().describe('Device class filter'),
    yearFrom: z.number().optional().describe('Filter results from this year onwards'),
  }),
  func: async ({ query, searchType, deviceClass, yearFrom }) => {
    try {
      console.log('🔍 FDA Database Search:', { query, searchType, deviceClass, yearFrom });

      // Simulate FDA API search (replace with actual FDA API integration)
      const results = await searchFDADatabase(query, searchType, deviceClass, yearFrom);

      return JSON.stringify({
        success: true,
        totalResults: results.length,
        results: results.slice(0, 5), // Top 5 results
        summary: `Found ${results.length} FDA records matching "${query}"`,
      });
    } catch (error) {
      console.error('FDA search error:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'FDA search failed',
      });
    }
  },
});

/**
 * Simulate FDA database search
 * TODO: Replace with actual FDA API integration
 */
async function searchFDADatabase(
  query: string,
  searchType?: string,
  deviceClass?: string,
  yearFrom?: number
) {
  // Mock FDA data for demonstration
  const mockResults = [
    {
      id: 'K230123',
      type: '510k',
      deviceName: 'Digital Therapeutic for Anxiety Management',
      applicant: 'HealthTech Inc.',
      decisionDate: '2023-06-15',
      deviceClass: 'II',
      predicateDevice: 'K192345',
      intendedUse: 'Adjunctive treatment for generalized anxiety disorder through cognitive behavioral therapy',
      summary: 'The device is a prescription digital therapeutic delivering CBT for adults with GAD.',
    },
    {
      id: 'K221456',
      type: '510k',
      deviceName: 'AI-Powered Diagnostic Software for Mental Health',
      applicant: 'MindCare Systems',
      decisionDate: '2023-03-20',
      deviceClass: 'II',
      predicateDevice: 'K201234',
      intendedUse: 'Aid in diagnosis of depression and anxiety disorders',
      summary: 'AI/ML software analyzing patient responses to standardized questionnaires.',
    },
    {
      id: 'P220045',
      type: 'pma',
      deviceName: 'Closed-Loop Neurostimulation System',
      applicant: 'NeuroHealth Corp.',
      decisionDate: '2023-08-10',
      deviceClass: 'III',
      intendedUse: 'Treatment of medication-resistant depression',
      summary: 'Implantable neurostimulation device with closed-loop feedback.',
    },
  ];

  // Filter by search type
  let filtered = mockResults;
  if (searchType) {
    filtered = filtered.filter(r => r.type === searchType);
  }
  if (deviceClass) {
    filtered = filtered.filter(r => r.deviceClass === deviceClass);
  }
  if (yearFrom) {
    filtered = filtered.filter(r => new Date(r.decisionDate).getFullYear() >= yearFrom);
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return filtered;
}

/**
 * FDA Guidance Document Tool
 */
export const fdaGuidanceTool = new DynamicStructuredTool({
  name: 'fda_guidance_lookup',
  description: `Look up specific FDA guidance documents for medical devices and digital health.
  Use this when you need official FDA guidance on:
  - Software as a Medical Device (SaMD)
  - Clinical Decision Support Software
  - Mobile Medical Applications
  - Cybersecurity for medical devices
  - AI/ML in medical devices`,
  schema: z.object({
    topic: z.string().describe('Topic or guidance document name'),
    documentType: z.enum(['final', 'draft', 'all']).optional().describe('Type of guidance document'),
  }),
  func: async ({ topic, documentType = 'all' }) => {
    try {
      console.log('📚 FDA Guidance Lookup:', { topic, documentType });

      const guidance = await fetchFDAGuidance(topic, documentType);

      return JSON.stringify({
        success: true,
        guidance,
        summary: `Found FDA guidance on "${topic}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Guidance lookup failed',
      });
    }
  },
});

async function fetchFDAGuidance(topic: string, documentType: string) {
  const mockGuidance = [
    {
      title: 'Clinical Decision Support Software - Guidance for Industry and FDA Staff',
      date: '2022-09-28',
      type: 'final',
      url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software',
      summary: 'Guidance on when clinical decision support software functions are and are not devices under section 201(h) of the FD&C Act.',
      keyPoints: [
        'CDS that meets certain criteria is not a device',
        'Must not acquire, process, or analyze medical images',
        'Healthcare providers must be able to independently review the basis for recommendations',
      ],
    },
    {
      title: 'Software as a Medical Device (SaMD): Clinical Evaluation',
      date: '2023-12-01',
      type: 'final',
      url: 'https://www.fda.gov/medical-devices/software-medical-device-samd/software-medical-device-samd-clinical-evaluation',
      summary: 'International guidance on clinical evaluation principles for Software as a Medical Device.',
      keyPoints: [
        'Valid clinical association must be established',
        'Analytical validation required',
        'Clinical validation demonstrates intended use',
      ],
    },
  ];

  await new Promise(resolve => setTimeout(resolve, 300));
  return mockGuidance;
}

/**
 * Regulatory Calculator Tool
 */
export const regulatoryCalculatorTool = new DynamicStructuredTool({
  name: 'regulatory_calculator',
  description: `Calculate regulatory timelines, costs, and requirements for medical device submissions.
  Use this to estimate:
  - FDA submission timeline (510k, PMA, De Novo)
  - Estimated costs for regulatory pathway
  - Clinical trial requirements based on device risk
  - Statistical power calculations for trial design`,
  schema: z.object({
    calculationType: z.enum(['timeline', 'cost', 'sample_size', 'power_analysis']).describe('Type of calculation'),
    pathway: z.enum(['510k', 'pma', 'de_novo']).optional(),
    deviceClass: z.enum(['I', 'II', 'III']).optional(),
    parameters: z.record(z.any()).optional().describe('Additional calculation parameters'),
  }),
  func: async ({ calculationType, pathway, deviceClass, parameters = {} }) => {
    try {
      console.log('🧮 Regulatory Calculator:', { calculationType, pathway, deviceClass });

      let result;

      switch (calculationType) {
        case 'timeline':
          result = calculateTimeline(pathway, deviceClass);
          break;
        case 'cost':
          result = calculateCost(pathway, deviceClass);
          break;
        case 'sample_size':
          result = calculateSampleSize(parameters);
          break;
        case 'power_analysis':
          result = calculatePower(parameters);
          break;
        default:
          throw new Error(`Unknown calculation type: ${calculationType}`);
      }

      return JSON.stringify({
        success: true,
        calculationType,
        result,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      });
    }
  },
});

function calculateTimeline(pathway?: string, deviceClass?: string) {
  const timelines: Record<string, any> = {
    '510k': {
      preparation: '3-6 months',
      fdaReview: '90-180 days',
      total: '6-12 months',
      breakdown: [
        { phase: 'Documentation preparation', duration: '3-6 months' },
        { phase: 'FDA submission', duration: '1 day' },
        { phase: 'FDA review', duration: '90-180 days' },
        { phase: 'Response to questions (if any)', duration: '30-60 days' },
      ],
    },
    'pma': {
      preparation: '12-18 months',
      fdaReview: '180-365 days',
      total: '2-3 years',
      breakdown: [
        { phase: 'Clinical trials', duration: '12-24 months' },
        { phase: 'Documentation preparation', duration: '6-12 months' },
        { phase: 'FDA filing review', duration: '45 days' },
        { phase: 'FDA substantive review', duration: '180-365 days' },
      ],
    },
    'de_novo': {
      preparation: '6-12 months',
      fdaReview: '150 days',
      total: '12-18 months',
      breakdown: [
        { phase: 'Documentation preparation', duration: '6-12 months' },
        { phase: 'FDA review', duration: '150 days' },
      ],
    },
  };

  return timelines[pathway || '510k'];
}

function calculateCost(pathway?: string, deviceClass?: string) {
  const costs: Record<string, any> = {
    '510k': {
      userFees: 12745,
      consultingServices: '50000-150000',
      testing: '25000-100000',
      total: '87745-262745',
      breakdown: [
        { item: 'FDA user fees', cost: 12745 },
        { item: 'Regulatory consulting', cost: '50000-150000' },
        { item: 'Testing and validation', cost: '25000-100000' },
        { item: 'Documentation', cost: '10000-30000' },
      ],
    },
    'pma': {
      userFees: 365657,
      clinicalTrials: '1000000-5000000',
      consultingServices: '200000-500000',
      total: '1565657-5865657',
      breakdown: [
        { item: 'FDA user fees', cost: 365657 },
        { item: 'Clinical trials', cost: '1000000-5000000' },
        { item: 'Regulatory consulting', cost: '200000-500000' },
        { item: 'Testing and validation', cost: '100000-300000' },
      ],
    },
  };

  return costs[pathway || '510k'];
}

function calculateSampleSize(params: any) {
  // Simplified sample size calculation
  const alpha = params.alpha || 0.05;
  const power = params.power || 0.80;
  const effectSize = params.effectSize || 0.5;

  // Basic formula (simplified)
  const sampleSize = Math.ceil((8 / (effectSize * effectSize)) * 1.5);

  return {
    recommendedSampleSize: sampleSize,
    perGroup: Math.ceil(sampleSize / 2),
    assumptions: {
      alpha,
      power,
      effectSize,
      testType: 'two-sided',
    },
    notes: 'This is a simplified calculation. Consult a biostatistician for final sample size determination.',
  };
}

function calculatePower(params: any) {
  const sampleSize = params.sampleSize || 100;
  const effectSize = params.effectSize || 0.5;

  // Simplified power calculation
  const power = Math.min(0.99, 0.5 + (sampleSize * effectSize) / 200);

  return {
    statisticalPower: power,
    interpretation: power >= 0.80 ? 'Adequate' : 'Underpowered',
    recommendation: power < 0.80 ? `Increase sample size to at least ${Math.ceil(sampleSize * 1.5)}` : 'Sample size is adequate',
  };
}

export const fdaTools = [
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
];
