/**
 * Test Data for Psoriasis Digital Health User Story
 * Supporting comprehensive UAT and RAG functionality testing
 */

export interface TestQuery {
  id: string;
  query: string;
  expectedAgents: string[];
  expectedDomain: string;
  expectedComplexity: 'low' | 'medium' | 'high' | 'very-high';
  requiresMultiAgent: boolean;
  testType: 'automatic' | 'manual' | 'rag';
  ragKeywords: string[];
  expectedSources: string[];
}

export const psoriasisTestQueries: TestQuery[] = [
  // Automatic Agent Selection Tests
  {
    id: 'AUTO-001',
    query: "I need to explore digital health interventions opportunities for patients with psoriasis in Europe. Can you help me understand the market landscape, regulatory requirements, and identify the most promising DTx solutions?",
    expectedAgents: ['Digital Health Strategist', 'Regulatory Affairs Specialist', 'Market Access Strategist', 'Clinical Development Expert'],
    expectedDomain: 'digital_health',
    expectedComplexity: 'very-high',
    requiresMultiAgent: true,
    testType: 'automatic',
    ragKeywords: ['psoriasis', 'digital therapeutics', 'Europe', 'DTx', 'regulatory'],
    expectedSources: ['EMA guidelines', 'epidemiology data', 'competitive analysis']
  },
  {
    id: 'AUTO-002',
    query: "What are the current digital health solutions for psoriasis management available in European markets?",
    expectedAgents: ['Digital Health Strategist', 'Market Access Strategist'],
    expectedDomain: 'digital_health',
    expectedComplexity: 'high',
    requiresMultiAgent: true,
    testType: 'automatic',
    ragKeywords: ['psoriasis', 'digital health', 'European markets', 'management'],
    expectedSources: ['market research', 'competitive intelligence']
  },
  {
    id: 'AUTO-003',
    query: "How can mobile apps improve treatment adherence for psoriasis patients in Germany?",
    expectedAgents: ['Digital Health Strategist', 'Clinical Development Expert'],
    expectedDomain: 'digital_health',
    expectedComplexity: 'medium',
    requiresMultiAgent: false,
    testType: 'automatic',
    ragKeywords: ['mobile apps', 'treatment adherence', 'psoriasis', 'Germany'],
    expectedSources: ['clinical studies', 'German healthcare data']
  },

  // Manual Agent Selection Tests
  {
    id: 'MANUAL-001',
    query: "What are the specific EMA guidelines for psoriasis digital therapeutics?",
    expectedAgents: ['Regulatory Affairs Specialist'],
    expectedDomain: 'regulatory',
    expectedComplexity: 'medium',
    requiresMultiAgent: false,
    testType: 'manual',
    ragKeywords: ['EMA guidelines', 'psoriasis', 'digital therapeutics'],
    expectedSources: ['EMA guidance documents', 'regulatory frameworks']
  },
  {
    id: 'MANUAL-002',
    query: "Analyze the competitive landscape for psoriasis apps in Germany, France, and UK",
    expectedAgents: ['Market Access Strategist', 'Digital Health Strategist'],
    expectedDomain: 'market_access',
    expectedComplexity: 'high',
    requiresMultiAgent: true,
    testType: 'manual',
    ragKeywords: ['competitive landscape', 'psoriasis apps', 'Germany', 'France', 'UK'],
    expectedSources: ['market research', 'app store data', 'competitive analysis']
  },
  {
    id: 'MANUAL-003',
    query: "What clinical endpoints should we prioritize for a psoriasis DTx trial?",
    expectedAgents: ['Clinical Development Expert'],
    expectedDomain: 'clinical',
    expectedComplexity: 'high',
    requiresMultiAgent: false,
    testType: 'manual',
    ragKeywords: ['clinical endpoints', 'psoriasis', 'DTx trial'],
    expectedSources: ['clinical trial protocols', 'regulatory guidance']
  },

  // RAG-Focused Tests
  {
    id: 'RAG-001',
    query: "What is the prevalence of psoriasis in Germany?",
    expectedAgents: ['Clinical Development Expert'],
    expectedDomain: 'clinical',
    expectedComplexity: 'low',
    requiresMultiAgent: false,
    testType: 'rag',
    ragKeywords: ['prevalence', 'psoriasis', 'Germany'],
    expectedSources: ['epidemiological studies', 'health statistics']
  },
  {
    id: 'RAG-002',
    query: "What are the latest EMA requirements for psoriasis DTx?",
    expectedAgents: ['Regulatory Affairs Specialist'],
    expectedDomain: 'regulatory',
    expectedComplexity: 'medium',
    requiresMultiAgent: false,
    testType: 'rag',
    ragKeywords: ['EMA requirements', 'psoriasis', 'DTx'],
    expectedSources: ['EMA guidance', 'regulatory updates']
  },
  {
    id: 'RAG-003',
    query: "Who are the main competitors in European psoriasis digital health?",
    expectedAgents: ['Market Access Strategist'],
    expectedDomain: 'market_access',
    expectedComplexity: 'medium',
    requiresMultiAgent: false,
    testType: 'rag',
    ragKeywords: ['competitors', 'European', 'psoriasis', 'digital health'],
    expectedSources: ['competitive intelligence', 'market analysis']
  }
];

export const __expectedRagSources = {
  psoriasisEpidemiology: [
    'European Academy of Dermatology and Venereology (EADV) reports',
    'National health statistics databases',
    'Epidemiological studies from major EU countries',
    'WHO European health data'
  ],
  regulatoryFrameworks: [
    'EMA guidance on digital therapeutics',
    'DiGA framework (Germany)',
    'MHRA guidance (UK)',
    'ANSM guidelines (France)',
    'CE marking requirements for medical devices'
  ],
  marketIntelligence: [
    'Digital health market research reports',
    'Competitive analysis databases',
    'App store analytics',
    'Investment and funding data',
    'Partnership announcements'
  ],
  clinicalEvidence: [
    'Clinical trial databases (ClinicalTrials.gov, EudraCT)',
    'Peer-reviewed publications',
    'Real-world evidence studies',
    'Patient outcome measures',
    'Treatment adherence studies'
  ]
};

export const __testValidationCriteria = {
  agentSelection: {
    accuracyThreshold: 0.9,
    responseTimeMax: 3000, // 3 seconds
    digitalHealthPriorityRecognition: true,
    europeanContextRecognition: true
  },
  ragIntegration: {
    retrievalAccuracyMin: 0.95,
    sourceAttributionRequired: true,
    dataRecencyMax: 24, // months
    geographicRelevanceRequired: true
  },
  responseQuality: {
    comprehensivenessScore: 4.5,
    actionabilityScore: 4.0,
    professionalToneRequired: true,
    conflictDetectionEnabled: true
  },
  performance: {
    maxResponseTime: 15000, // 15 seconds for complex queries
    maxRagRetrievalTime: 5000, // 5 seconds
    timeoutErrorThreshold: 0, // Zero tolerance
    concurrentUserSupport: 10
  }
};

export const __psoriasisKnowledgeBase = {
  // Sample knowledge that should be in the RAG system
  epidemiology: {
    europe: {
      prevalence: "2-3% of European population",
      countries: {
        germany: "2.5% (approximately 2.1 million patients)",
        france: "2.8% (approximately 1.9 million patients)",
        uk: "2.2% (approximately 1.5 million patients)",
        spain: "2.4% (approximately 1.1 million patients)"
      }
    }
  },
  digitalSolutions: {
    categories: ['Mobile apps', 'Wearable devices', 'Telemedicine platforms', 'AI-powered diagnosis tools'],
    leadingCompanies: ['AbbVie (myRA app)', 'Novartis (SkinVision)', 'LEO Pharma (myPso)', 'Janssen (ArthritisPower)'],
    marketSize: "€450M in 2023, projected €780M by 2028"
  },
  regulatory: {
    ema: {
      lastUpdate: "2023-12",
      keyRequirements: ['Clinical evidence', 'Data security', 'CE marking', 'Post-market surveillance']
    },
    diga: {
      approvedPsoriasisApps: 0, // As of 2024
      requirementsList: ['Positive healthcare effects', 'Medical device classification', 'Data protection compliance']
    }
  }
};