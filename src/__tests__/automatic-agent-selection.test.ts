import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryAnalyzer } from '@/features/chat/services/query-analyzer';
import { AgentMatcher } from '@/features/chat/services/agent-matcher';
import { AutomaticAgentOrchestrator } from '@/features/chat/services/automatic-orchestrator';
import { PerformanceTracker } from '@/features/chat/services/performance-tracker';
import { Agent } from '@/types/agent';

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                intent: 'medical_query',
                secondaryIntents: ['drug_information'],
                keyTopics: ['metformin', 'diabetes'],
                requiredExpertise: ['pharmacology', 'endocrinology'],
                estimatedComplexity: 4,
                suggestedApproach: 'Provide detailed drug information with safety considerations'
              })
            }
          }]
        })
      }
    }
  }))
}));

// Mock natural
vi.mock('natural', () => ({
  WordTokenizer: vi.fn().mockImplementation(() => ({
    tokenize: vi.fn().mockReturnValue(['what', 'is', 'metformin'])
  })),
  TfIdf: vi.fn().mockImplementation(() => ({})),
  BayesClassifier: vi.fn().mockImplementation(() => ({
    addDocument: vi.fn(),
    train: vi.fn(),
    classify: vi.fn().mockReturnValue('medical'),
    getClassifications: vi.fn().mockReturnValue([
      { label: 'medical', value: 0.8 },
      { label: 'regulatory', value: 0.2 }
    ])
  }))
}));

describe('QueryAnalyzer', () => {
  let analyzer: QueryAnalyzer;

  beforeEach(() => {
    analyzer = new QueryAnalyzer();
  });

  it('should analyze a simple medical query', async () => {
    const query = 'What is the recommended dosage for metformin?';
    const result = await analyzer.analyzeQuery(query);

    expect(result.intent.primary).toBe('medical_query');
    expect(result.domain.primary).toBe('medical');
    expect(result.complexity.score).toBeGreaterThan(0);
    expect(result.entities).toBeDefined();
    expect(result.requiredCapabilities).toContain('drug_information');
  });

  it('should identify regulatory queries', async () => {
    const query = 'What are the FDA requirements for drug approval?';
    const result = await analyzer.analyzeQuery(query);

    expect(result.domain.primary).toBe('regulatory');
    expect(result.regulatory.requiresCompliance).toBe(true);
    expect(result.regulatory.region).toContain('US');
  });

  it('should assess complexity correctly', async () => {
    const simpleQuery = 'What is aspirin?';
    const complexQuery = 'Compare the pharmacokinetic profiles of metformin and glipizide in elderly patients with type 2 diabetes, considering drug-drug interactions and renal function.';

    const simpleResult = await analyzer.analyzeQuery(simpleQuery);
    const complexResult = await analyzer.analyzeQuery(complexQuery);

    expect(simpleResult.complexity.score).toBeLessThan(complexResult.complexity.score);
    expect(complexResult.complexity.requiresSpecialist).toBe(true);
  });
});

describe('AgentMatcher', () => {
  let matcher: AgentMatcher;
  let mockAgents: Agent[];

  beforeEach(() => {
    mockAgents = [
      {
        id: 'med-specialist',
        name: 'Medical Specialist',
        display_name: 'Dr. Smith',
        description: 'Medical expert',
        system_prompt: 'You are a medical expert',
        business_function: 'Medical',
        tier: 1,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        capabilities: ['drug_information', 'medical_knowledge'],
        knowledge_domains: ['medical', 'pharmacology'],
        rag_enabled: true
      },
      {
        id: 'reg-specialist',
        name: 'Regulatory Specialist',
        display_name: 'Dr. Jones',
        description: 'Regulatory expert',
        system_prompt: 'You are a regulatory expert',
        business_function: 'Regulatory',
        tier: 2,
        model: 'gpt-4',
        temperature: 0.6,
        max_tokens: 2500,
        capabilities: ['regulatory_compliance', 'submission_expertise'],
        knowledge_domains: ['regulatory', 'compliance'],
        rag_enabled: true
      }
    ];

    matcher = new AgentMatcher(mockAgents);
  });

  it('should match agents by domain', async () => {
    const analysis = {
      intent: { primary: 'medical_query', confidence: 0.9 },
      entities: [],
      complexity: { score: 3, factors: [], estimatedResponseTime: 9, requiresSpecialist: false },
      domain: { primary: 'medical', secondary: [], interdisciplinary: false },
      regulatory: { region: ['Global'], requiresCompliance: false, sensitivityLevel: 'public' as const },
      urgency: 'routine' as const,
      requiredCapabilities: ['drug_information'],
      suggestedTools: ['drug_database']
    };

    const matches = await matcher.findBestAgents(analysis);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].agent.business_function).toBe('Medical');
  });

  it('should score agents based on capabilities', async () => {
    const analysis = {
      intent: { primary: 'regulatory_query', confidence: 0.9 },
      entities: [],
      complexity: { score: 5, factors: [], estimatedResponseTime: 15, requiresSpecialist: false },
      domain: { primary: 'regulatory', secondary: [], interdisciplinary: false },
      regulatory: { region: ['US'], requiresCompliance: true, sensitivityLevel: 'public' as const },
      urgency: 'routine' as const,
      requiredCapabilities: ['regulatory_compliance'],
      suggestedTools: ['fda_database']
    };

    const matches = await matcher.findBestAgents(analysis);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].agent.business_function).toBe('Regulatory');
    expect(matches[0].score).toBeGreaterThan(0.5);
  });
});

describe('AutomaticAgentOrchestrator', () => {
  let orchestrator: AutomaticAgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AutomaticAgentOrchestrator();
  });

  it('should select single agent for simple queries', async () => {
    const query = 'What is the dosage for metformin?';
    const result = await orchestrator.orchestrate(query);

    expect(result.strategy).toBe('single');
    expect(result.selectedAgent).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should use escalation strategy for complex queries', async () => {
    const query = 'Analyze the complex pharmacokinetic interactions between novel oncology drugs and CYP450 inhibitors in elderly patients with multiple comorbidities, considering regulatory requirements across US, EU, and Japan.';
    const result = await orchestrator.orchestrate(query);

    expect(result.strategy).toBe('escalation');
    expect(result.selectedAgent.tier).toBeGreaterThanOrEqual(2);
  });

  it('should provide fallback for unmatched queries', async () => {
    const query = 'Random unrelated question about cooking';
    const result = await orchestrator.orchestrate(query);

    expect(result.selectedAgent.id).toBe('general-ai');
    expect(result.confidence).toBeLessThan(0.5);
  });
});

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  it('should track query performance', async () => {
    const mockResult = {
      selectedAgent: { id: 'test-agent' } as Agent,
      alternativeAgents: [],
      confidence: 0.8,
      reasoning: ['Test reasoning'],
      strategy: 'single' as const,
      analysis: {
        intent: { primary: 'test', confidence: 0.8 },
        entities: [],
        complexity: { score: 5, factors: [], estimatedResponseTime: 15, requiresSpecialist: false },
        domain: { primary: 'test', secondary: [], interdisciplinary: false },
        regulatory: { region: ['Global'], requiresCompliance: false, sensitivityLevel: 'public' as const },
        urgency: 'routine' as const,
        requiredCapabilities: [],
        suggestedTools: []
      },
      metadata: { processingTime: 100, matchCount: 1, tierUsed: 1 }
    };

    const tracking = await tracker.trackQuery('test-query', mockResult);
    
    tracking.updateResponseTime(2000);
    tracking.updateSatisfaction(4);
    tracking.updateSuccess(true);
    await tracking.complete();

    const performance = await tracker.getAgentPerformance('test-agent');
    expect(performance.totalQueries).toBe(1);
    expect(performance.successRate).toBe(1);
  });
});

describe('Integration Tests', () => {
  it('should handle end-to-end automatic agent selection', async () => {
    const orchestrator = new AutomaticAgentOrchestrator();
    const query = 'What are the side effects of metformin in elderly patients?';

    const result = await orchestrator.orchestrate(query);

    expect(result).toBeDefined();
    expect(result.selectedAgent).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.analysis.domain.primary).toBeDefined();
  });

  it('should handle multi-agent scenarios', async () => {
    const orchestrator = new AutomaticAgentOrchestrator();
    const query = 'Compare FDA and EMA requirements for diabetes drug approval including clinical trial design and safety monitoring.';

    const result = await orchestrator.orchestrate(query);

    expect(result.strategy).toBe('multi');
    expect(result.alternativeAgents.length).toBeGreaterThan(0);
  });
});
