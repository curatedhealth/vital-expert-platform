/**
 * MODE 2 INTEGRATION TESTS
 * 
 * Comprehensive test suite for Mode 2 Automatic Agent Selection
 * Tests the complete workflow from query analysis to agent selection to Mode 1 execution
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { agentSelectorService } from '../agent-selector-service';
import { executeMode2, validateMode2Config } from '../mode2-automatic-agent-selection';

// ============================================================================
// TEST SETUP
// ============================================================================

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  PINECONE_API_KEY: 'test-pinecone-key',
  OPENAI_API_KEY: 'test-openai-key',
  PINECONE_INDEX_NAME: 'test-index'
};

// Mock Pinecone client
const mockPineconeClient = {
  index: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({
      matches: [
        {
          id: 'agent-1',
          score: 0.95,
          metadata: {
            agent_id: 'agent-1',
            name: 'Cardiology Expert',
            domain: 'cardiology'
          }
        },
        {
          id: 'agent-2', 
          score: 0.87,
          metadata: {
            agent_id: 'agent-2',
            name: 'General Practitioner',
            domain: 'general'
          }
        }
      ]
    })
  })
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'agent-1',
            name: 'cardiology-expert',
            display_name: 'Cardiology Expert',
            description: 'Expert in heart conditions and cardiovascular diseases',
            system_prompt: 'You are a cardiology expert...',
            tier: 5,
            capabilities: ['diagnosis', 'treatment', 'consultation'],
            knowledge_domains: ['cardiology', 'cardiac-surgery'],
            specialties: ['interventional-cardiology'],
            model: 'gpt-4',
            metadata: { tools: ['ecg-analysis', 'echo-interpretation'] }
          },
          {
            id: 'agent-2',
            name: 'general-practitioner',
            display_name: 'General Practitioner', 
            description: 'General medical practitioner for common conditions',
            system_prompt: 'You are a general practitioner...',
            tier: 3,
            capabilities: ['diagnosis', 'referral'],
            knowledge_domains: ['general-medicine'],
            specialties: ['primary-care'],
            model: 'gpt-3.5-turbo',
            metadata: { tools: [] }
          }
        ],
        error: null
      })
    })
  })
};

// Mock OpenAI API
const mockOpenAIResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        intent: 'diagnosis',
        domains: ['cardiology'],
        complexity: 'high',
        keywords: ['chest pain', 'heart', 'cardiac'],
        medicalTerms: ['myocardial infarction', 'angina'],
        confidence: 0.9
      })
    }
  }]
};

// ============================================================================
// TEST CASES
// ============================================================================

describe('Mode 2: Automatic Agent Selection', () => {
  beforeAll(() => {
    // Set up environment variables
    process.env = { ...process.env, ...mockEnv };
    
    // Mock external dependencies
    jest.mock('@pinecone-database/pinecone', () => ({
      Pinecone: jest.fn().mockImplementation(() => mockPineconeClient)
    }));
    
    jest.mock('@supabase/supabase-js', () => ({
      createClient: jest.fn().mockReturnValue(mockSupabaseClient)
    }));
    
    // Mock fetch for OpenAI API calls
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('api.openai.com/v1/chat/completions')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockOpenAIResponse)
        });
      }
      if (url.includes('api.openai.com/v1/embeddings')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            data: [{ embedding: new Array(1536).fill(0.1) }]
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Agent Selector Service', () => {
    it('should analyze query and extract intent and domains', async () => {
      const query = 'I have chest pain and shortness of breath, what could be wrong?';
      
      const analysis = await agentSelectorService.analyzeQuery(query);
      
      expect(analysis).toMatchObject({
        intent: expect.any(String),
        domains: expect.any(Array),
        complexity: expect.stringMatching(/^(low|medium|high)$/),
        keywords: expect.any(Array),
        medicalTerms: expect.any(Array),
        confidence: expect.any(Number)
      });
      
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should find candidate agents using Pinecone search', async () => {
      const query = 'chest pain diagnosis';
      const domains = ['cardiology'];
      
      const candidates = await agentSelectorService.findCandidateAgents(query, domains, 5);
      
      expect(candidates).toBeInstanceOf(Array);
      expect(candidates.length).toBeGreaterThan(0);
      
      // Verify agent structure
      candidates.forEach(agent => {
        expect(agent).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          display_name: expect.any(String),
          description: expect.any(String),
          system_prompt: expect.any(String),
          tier: expect.any(Number),
          capabilities: expect.any(Array),
          knowledge_domains: expect.any(Array)
        });
      });
    });

    it('should rank agents based on multiple criteria', () => {
      const agents = [
        {
          id: 'agent-1',
          name: 'cardiology-expert',
          display_name: 'Cardiology Expert',
          description: 'Expert in heart conditions',
          system_prompt: 'You are a cardiology expert...',
          tier: 5,
          capabilities: ['diagnosis', 'treatment'],
          knowledge_domains: ['cardiology'],
          specialties: ['interventional-cardiology'],
          model: 'gpt-4',
          metadata: {}
        },
        {
          id: 'agent-2',
          name: 'general-practitioner',
          display_name: 'General Practitioner',
          description: 'General medical practitioner',
          system_prompt: 'You are a general practitioner...',
          tier: 3,
          capabilities: ['diagnosis', 'referral'],
          knowledge_domains: ['general-medicine'],
          specialties: ['primary-care'],
          model: 'gpt-3.5-turbo',
          metadata: {}
        }
      ];

      const query = 'chest pain diagnosis';
      const analysis = {
        intent: 'diagnosis',
        domains: ['cardiology'],
        complexity: 'high' as const,
        keywords: ['chest', 'pain', 'heart'],
        medicalTerms: ['angina'],
        confidence: 0.9
      };

      const rankings = agentSelectorService.rankAgents(agents, query, analysis);

      expect(rankings).toBeInstanceOf(Array);
      expect(rankings.length).toBe(2);
      
      // Verify ranking structure
      rankings.forEach(ranking => {
        expect(ranking).toMatchObject({
          agent: expect.any(Object),
          score: expect.any(Number),
          reason: expect.any(String),
          breakdown: {
            semanticSimilarity: expect.any(Number),
            domainRelevance: expect.any(Number),
            tierPreference: expect.any(Number),
            capabilityMatch: expect.any(Number)
          }
        });
        
        expect(ranking.score).toBeGreaterThanOrEqual(0);
        expect(ranking.score).toBeLessThanOrEqual(1);
      });

      // Higher tier agent should generally score higher
      expect(rankings[0].score).toBeGreaterThanOrEqual(rankings[1].score);
    });

    it('should complete end-to-end agent selection workflow', async () => {
      const query = 'I have severe chest pain, what should I do?';
      
      const result = await agentSelectorService.selectBestAgent(query);
      
      expect(result).toMatchObject({
        selectedAgent: expect.any(Object),
        confidence: expect.any(Number),
        reasoning: expect.any(String),
        alternativeAgents: expect.any(Array),
        analysis: expect.any(Object)
      });
      
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.alternativeAgents.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Mode 2 Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const validConfig = {
        message: 'Test query',
        conversationHistory: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'assistant' as const, content: 'Hi there!' }
        ],
        enableRAG: true,
        enableTools: false,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        userId: 'user-123'
      };

      const errors = validateMode2Config(validConfig);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty message', () => {
      const invalidConfig = {
        message: '',
        userId: 'user-123'
      };

      const errors = validateMode2Config(invalidConfig);
      expect(errors).toContain('Message is required');
    });

    it('should reject message that is too long', () => {
      const invalidConfig = {
        message: 'a'.repeat(4001),
        userId: 'user-123'
      };

      const errors = validateMode2Config(invalidConfig);
      expect(errors).toContain('Message is too long (max 4000 characters)');
    });

    it('should reject invalid temperature', () => {
      const invalidConfig = {
        message: 'Test query',
        temperature: 3.0,
        userId: 'user-123'
      };

      const errors = validateMode2Config(invalidConfig);
      expect(errors).toContain('Temperature must be between 0 and 2');
    });

    it('should reject invalid max tokens', () => {
      const invalidConfig = {
        message: 'Test query',
        maxTokens: 50,
        userId: 'user-123'
      };

      const errors = validateMode2Config(invalidConfig);
      expect(errors).toContain('Max tokens must be between 100 and 8000');
    });

    it('should reject conversation history that is too long', () => {
      const longHistory = Array(51).fill(null).map((_, i) => ({
        role: 'user' as const,
        content: `Message ${i}`
      }));

      const invalidConfig = {
        message: 'Test query',
        conversationHistory: longHistory,
        userId: 'user-123'
      };

      const errors = validateMode2Config(invalidConfig);
      expect(errors).toContain('Conversation history is too long (max 50 messages)');
    });
  });

  describe('Mode 2 Execution', () => {
    it('should execute Mode 2 workflow and return streaming chunks', async () => {
      const config = {
        message: 'I have chest pain, what should I do?',
        enableRAG: true,
        enableTools: false,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        userId: 'user-123'
      };

      const stream = await executeMode2(config);
      
      const chunks: any[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      
      // Should have agent selection chunk
      const agentSelectionChunk = chunks.find(c => c.type === 'agent_selection');
      expect(agentSelectionChunk).toBeDefined();
      expect(agentSelectionChunk.selectedAgent).toBeDefined();
      expect(agentSelectionChunk.confidence).toBeDefined();

      // Should have selection reason chunk
      const reasonChunk = chunks.find(c => c.type === 'selection_reason');
      expect(reasonChunk).toBeDefined();
      expect(reasonChunk.selectionReason).toBeDefined();

      // Should have content chunks
      const contentChunks = chunks.filter(c => c.type === 'chunk');
      expect(contentChunks.length).toBeGreaterThan(0);

      // Should have done chunk
      const doneChunk = chunks.find(c => c.type === 'done');
      expect(doneChunk).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock a failing scenario
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: [],
            error: new Error('Database connection failed')
          })
        })
      });

      const config = {
        message: 'Test query',
        userId: 'user-123'
      };

      await expect(executeMode2(config)).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should complete agent selection within performance targets', async () => {
      const startTime = Date.now();
      
      const result = await agentSelectorService.selectBestAgent('chest pain diagnosis');
      
      const executionTime = Date.now() - startTime;
      
      // Agent selection should complete within 500ms
      expect(executionTime).toBeLessThan(500);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle concurrent requests', async () => {
      const queries = [
        'chest pain diagnosis',
        'diabetes management',
        'cancer treatment options',
        'mental health support',
        'pediatric care'
      ];

      const startTime = Date.now();
      
      const promises = queries.map(query => 
        agentSelectorService.selectBestAgent(query)
      );
      
      const results = await Promise.all(promises);
      const executionTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.selectedAgent).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      });

      // All requests should complete within reasonable time
      expect(executionTime).toBeLessThan(2000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty agent database', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      await expect(
        agentSelectorService.selectBestAgent('test query')
      ).rejects.toThrow('No agents found for the given query');
    });

    it('should handle malformed query analysis', async () => {
      // Mock OpenAI returning invalid JSON
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('api.openai.com/v1/chat/completions')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              choices: [{
                message: {
                  content: 'invalid json'
                }
              }]
            })
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const analysis = await agentSelectorService.analyzeQuery('test query');
      
      // Should fallback to default analysis
      expect(analysis.intent).toBe('general');
      expect(analysis.confidence).toBe(0.5);
    });

    it('should handle network timeouts gracefully', async () => {
      // Mock network timeout
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.reject(new Error('Network timeout'))
      );

      await expect(
        agentSelectorService.analyzeQuery('test query')
      ).resolves.toMatchObject({
        intent: 'general',
        confidence: 0.5
      });
    });
  });
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Helper function to create mock agent data
 */
function createMockAgent(overrides: Partial<any> = {}) {
  return {
    id: 'agent-1',
    name: 'test-agent',
    display_name: 'Test Agent',
    description: 'Test agent description',
    system_prompt: 'You are a test agent...',
    tier: 3,
    capabilities: ['diagnosis'],
    knowledge_domains: ['general'],
    specialties: ['primary-care'],
    model: 'gpt-3.5-turbo',
    metadata: {},
    ...overrides
  };
}

/**
 * Helper function to create mock query analysis
 */
function createMockAnalysis(overrides: Partial<any> = {}) {
  return {
    intent: 'diagnosis',
    domains: ['general'],
    complexity: 'medium' as const,
    keywords: ['test'],
    medicalTerms: [],
    confidence: 0.8,
    ...overrides
  };
}
