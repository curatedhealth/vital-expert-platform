/**
 * Unit Tests for Agent Store
 * Tests the core agent management functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useAgentsStore } from '@/shared/services/stores/agents-store';
import { agentService } from '@/shared/services/agents/agent-service';

// Mock the agent service
jest.mock('@/shared/services/agents/agent-service');

const mockAgentService = agentService as jest.Mocked<typeof agentService>;

describe('AgentsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    useAgentsStore.getState().agents = [];
    useAgentsStore.getState().categories = [];
    useAgentsStore.getState().selectedAgent = null;
    useAgentsStore.getState().isLoading = false;
    useAgentsStore.getState().error = null;
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAgentsStore());

      expect(result.current.agents).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.selectedAgent).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
    });
  });

  describe('Load Agents', () => {
    it('should load agents successfully', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'test-agent',
          display_name: 'Test Agent',
          description: 'Test agent description',
          system_prompt: 'Test prompt',
          model: 'gpt-4',
          avatar: '',
          color: '#6366f1',
          capabilities: ['analysis'],
          rag_enabled: false,
          temperature: 0.7,
          max_tokens: 2000,
          status: 'active' as const,
          tier: 1,
          priority: 1,
          implementation_phase: 1,
        }
      ];

      mockAgentService.getActiveAgents.mockResolvedValue(mockAgents);

      const { result } = renderHook(() => useAgentsStore());

      await act(async () => {
        await result.current.loadAgents();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.agents).toHaveLength(1);
      expect(result.current.agents[0].display_name).toBe('Test Agent');
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle load agents error', async () => {
      const mockError = new Error('Failed to load agents');
      mockAgentService.getActiveAgents.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAgentsStore());

      await act(async () => {
        await result.current.loadAgents();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.agents).toEqual([]);
      expect(result.current.error).toBe('Failed to load agents');
    });

    it('should set loading state during agent load', async () => {
      let resolvePromise: (value: any) => void;
      const loadPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockAgentService.getActiveAgents.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useAgentsStore());

      act(() => {
        result.current.loadAgents();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!([]);
        await loadPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Agent Selection', () => {
    it('should set selected agent', () => {
      const { result } = renderHook(() => useAgentsStore());
      const mockAgent = {
        id: '1',
        name: 'test-agent',
        display_name: 'Test Agent',
        description: 'Test description',
        system_prompt: 'Test prompt',
        model: 'gpt-4',
        avatar: '',
        color: '#6366f1',
        capabilities: [],
        rag_enabled: false,
        temperature: 0.7,
        max_tokens: 2000,
        status: 'active' as const,
        tier: 1,
        priority: 1,
        implementation_phase: 1,
      };

      act(() => {
        result.current.setSelectedAgent(mockAgent);
      });

      expect(result.current.selectedAgent).toEqual(mockAgent);
    });

    it('should clear selected agent', () => {
      const { result } = renderHook(() => useAgentsStore());

      // First set an agent
      act(() => {
        result.current.setSelectedAgent({
          id: '1',
          name: 'test-agent',
          display_name: 'Test Agent',
          description: 'Test description',
          system_prompt: 'Test prompt',
          model: 'gpt-4',
          avatar: '',
          color: '#6366f1',
          capabilities: [],
          rag_enabled: false,
          temperature: 0.7,
          max_tokens: 2000,
          status: 'active',
          tier: 1,
          priority: 1,
          implementation_phase: 1,
        });
      });

      expect(result.current.selectedAgent).not.toBeNull();

      // Then clear it
      act(() => {
        result.current.setSelectedAgent(null);
      });

      expect(result.current.selectedAgent).toBeNull();
    });
  });

  describe('Agent Queries', () => {
    beforeEach(() => {
      const mockAgents = [
        {
          id: '1',
          name: 'digital-therapeutics-expert',
          display_name: 'Digital Therapeutics Expert',
          description: 'Expert in digital therapeutics',
          system_prompt: 'You are a digital therapeutics expert',
          model: 'gpt-4',
          avatar: '💊',
          color: '#10B981',
          capabilities: ['dtx-analysis', 'regulatory-guidance'],
          rag_enabled: true,
          temperature: 0.7,
          max_tokens: 2000,
          status: 'active' as const,
          tier: 1,
          priority: 1,
          implementation_phase: 1,
          medical_specialty: 'Digital Therapeutics',
          clinical_validation_status: 'validated' as const,
          medical_accuracy_score: 0.95,
          hipaa_compliant: true,
        },
        {
          id: '2',
          name: 'fda-regulatory-strategist',
          display_name: 'FDA Regulatory Strategist',
          description: 'FDA regulatory expert',
          system_prompt: 'You are an FDA regulatory expert',
          model: 'gpt-4',
          avatar: '🏛️',
          color: '#3B82F6',
          capabilities: ['regulatory-analysis', 'compliance-review'],
          rag_enabled: true,
          temperature: 0.6,
          max_tokens: 2000,
          status: 'active' as const,
          tier: 1,
          priority: 1,
          implementation_phase: 1,
        }
      ];

      // Set mock agents in store
      useAgentsStore.setState({ agents: mockAgents });
    });

    it('should find agent by ID', () => {
      const { result } = renderHook(() => useAgentsStore());
      const agent = result.current.getAgentById('1');

      expect(agent).not.toBeNull();
      expect(agent?.display_name).toBe('Digital Therapeutics Expert');
    });

    it('should return null for non-existent agent ID', () => {
      const { result } = renderHook(() => useAgentsStore());
      const agent = result.current.getAgentById('non-existent');

      expect(agent).toBeNull();
    });

    it('should find agent by name', () => {
      const { result } = renderHook(() => useAgentsStore());
      const agent = result.current.getAgentByName('digital-therapeutics-expert');

      expect(agent).not.toBeNull();
      expect(agent?.id).toBe('1');
    });

    it('should find agent by display name', () => {
      const { result } = renderHook(() => useAgentsStore());
      const agent = result.current.getAgentByName('Digital Therapeutics Expert');

      expect(agent).not.toBeNull();
      expect(agent?.id).toBe('1');
    });
  });

  describe('Custom Agents', () => {
    it('should create custom agent successfully', async () => {
      const mockCustomAgent = {
        id: 'custom-1',
        name: 'custom-agent',
        display_name: 'Custom Agent',
        description: 'Custom agent description',
        system_prompt: 'Custom prompt',
        model: 'gpt-3.5-turbo',
        avatar: '🤖',
        color: '#8B5CF6',
        capabilities: ['custom-analysis'],
        rag_enabled: false,
        temperature: 0.8,
        max_tokens: 1500,
        status: 'active' as const,
        tier: 1,
        priority: 100,
        implementation_phase: 1,
        is_custom: true,
      };

      mockAgentService.createCustomAgent.mockResolvedValue(mockCustomAgent);

      const { result } = renderHook(() => useAgentsStore());

      let createdAgent;
      await act(async () => {
        createdAgent = await result.current.createCustomAgent({
          name: 'custom-agent',
          display_name: 'Custom Agent',
          description: 'Custom agent description',
          system_prompt: 'Custom prompt',
          model: 'gpt-3.5-turbo',
          avatar: '🤖',
          color: '#8B5CF6',
          capabilities: ['custom-analysis'],
          rag_enabled: false,
          temperature: 0.8,
          max_tokens: 1500,
        });
      });

      expect(createdAgent).toEqual(mockCustomAgent);
      expect(result.current.agents).toHaveLength(1);
      expect(result.current.agents[0].is_custom).toBe(true);
    });

    it('should handle create custom agent error', async () => {
      const mockError = new Error('Failed to create custom agent');
      mockAgentService.createCustomAgent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAgentsStore());

      await expect(act(async () => {
        await result.current.createCustomAgent({
          name: 'custom-agent',
          display_name: 'Custom Agent',
        });
      })).rejects.toThrow('Failed to create custom agent');
    });
  });

  describe('Agent Updates', () => {
    beforeEach(() => {
      const mockAgent = {
        id: '1',
        name: 'test-agent',
        display_name: 'Test Agent',
        description: 'Test description',
        system_prompt: 'Test prompt',
        model: 'gpt-4',
        avatar: '',
        color: '#6366f1',
        capabilities: [],
        rag_enabled: false,
        temperature: 0.7,
        max_tokens: 2000,
        status: 'active' as const,
        tier: 1,
        priority: 1,
        implementation_phase: 1,
      };

      useAgentsStore.setState({ agents: [mockAgent] });
    });

    it('should update agent successfully', async () => {
      mockAgentService.updateAgent.mockResolvedValue();

      const { result } = renderHook(() => useAgentsStore());

      await act(async () => {
        await result.current.updateAgent('1', {
          description: 'Updated description',
          temperature: 0.8
        });
      });

      expect(mockAgentService.updateAgent).toHaveBeenCalledWith('1', {
        description: 'Updated description',
        temperature: 0.8
      });

      const updatedAgent = result.current.getAgentById('1');
      expect(updatedAgent?.description).toBe('Updated description');
      expect(updatedAgent?.temperature).toBe(0.8);
    });

    it('should handle update agent error', async () => {
      const mockError = new Error('Failed to update agent');
      mockAgentService.updateAgent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAgentsStore());

      await expect(act(async () => {
        await result.current.updateAgent('1', { description: 'New description' });
      })).rejects.toThrow('Failed to update agent');
    });
  });

  describe('User Agent Copies', () => {
    const originalAgent = {
      id: '1',
      name: 'original-agent',
      display_name: 'Original Agent',
      description: 'Original description',
      system_prompt: 'Original prompt',
      model: 'gpt-4',
      avatar: '🤖',
      color: '#6366f1',
      capabilities: ['analysis'],
      rag_enabled: true,
      temperature: 0.7,
      max_tokens: 2000,
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: false,
    };

    beforeEach(() => {
      useAgentsStore.setState({ agents: [originalAgent] });
    });

    it('should create user copy of agent', async () => {
      const mockUserCopy = {
        ...originalAgent,
        id: 'copy-1',
        name: 'original-agent_user_copy_123456',
        display_name: 'Original Agent (My Copy)',
        is_custom: true,
      };

      mockAgentService.createCustomAgent.mockResolvedValue(mockUserCopy);

      const { result } = renderHook(() => useAgentsStore());

      let userCopy;
      await act(async () => {
        userCopy = await result.current.createUserCopy(originalAgent);
      });

      expect(userCopy).toBeDefined();
      expect(userCopy?.display_name).toContain('(My Copy)');
      expect(userCopy?.is_custom).toBe(true);
      expect(userCopy?.is_user_copy).toBe(true);
      expect(userCopy?.original_agent_id).toBe(originalAgent.id);
      expect(result.current.agents).toHaveLength(2);
    });

    it('should identify user agents correctly', () => {
      const userAgent = {
        ...originalAgent,
        id: '2',
        is_custom: true,
        is_user_copy: true,
      };

      useAgentsStore.setState({
        agents: [originalAgent, userAgent]
      });

      const { result } = renderHook(() => useAgentsStore());
      const userAgents = result.current.getUserAgents();

      expect(userAgents).toHaveLength(1);
      expect(userAgents[0].id).toBe('2');
    });

    it('should determine edit permissions correctly', () => {
      const { result } = renderHook(() => useAgentsStore());

      // Original agent cannot be edited
      expect(result.current.canEditAgent(originalAgent)).toBe(false);

      // Custom agent can be edited
      const customAgent = { ...originalAgent, is_custom: true };
      expect(result.current.canEditAgent(customAgent)).toBe(true);

      // User copy can be edited
      const userCopyAgent = { ...originalAgent, is_user_copy: true };
      expect(result.current.canEditAgent(userCopyAgent)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAgentsStore());

      // Set an error
      act(() => {
        useAgentsStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Legacy Format Conversion', () => {
    const modernAgent = {
      id: '1',
      name: 'test-agent',
      display_name: 'Test Agent',
      description: 'Test description',
      system_prompt: 'Test prompt',
      model: 'gpt-4',
      avatar: '🤖',
      color: '#6366f1',
      capabilities: ['analysis'],
      rag_enabled: true,
      temperature: 0.7,
      max_tokens: 2000,
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      knowledge_domains: ['healthcare'],
      business_function: 'clinical-analysis',
      role: 'expert',
      is_custom: false,
    };

    it('should convert to legacy format', () => {
      const { result } = renderHook(() => useAgentsStore());
      const legacyAgent = result.current.convertToLegacyFormat(modernAgent);

      expect(legacyAgent).toEqual({
        id: 'test-agent', // Legacy uses name as ID
        name: 'Test Agent',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        model: 'gpt-4',
        avatar: '🤖',
        color: '#6366f1',
        capabilities: ['analysis'],
        ragEnabled: true,
        temperature: 0.7,
        maxTokens: 2000,
        isCustom: false,
        knowledgeDomains: ['healthcare'],
        businessFunction: 'clinical-analysis',
        role: 'expert',
      });
    });

    it('should convert from legacy format', () => {
      const legacyAgent = {
        id: 'legacy-agent',
        name: 'Legacy Agent',
        description: 'Legacy description',
        systemPrompt: 'Legacy prompt',
        model: 'gpt-3.5-turbo',
        avatar: '🤖',
        color: '#8B5CF6',
        capabilities: ['legacy-analysis'],
        ragEnabled: false,
        temperature: 0.8,
        maxTokens: 1500,
        isCustom: true,
        knowledgeDomains: ['finance'],
        businessFunction: 'financial-analysis',
        role: 'advisor',
      };

      const { result } = renderHook(() => useAgentsStore());
      const modernAgent = result.current.convertFromLegacyFormat(legacyAgent);

      expect(modernAgent).toMatchObject({
        id: 'legacy-agent',
        name: 'legacy-agent',
        display_name: 'Legacy Agent',
        description: 'Legacy description',
        system_prompt: 'Legacy prompt',
        model: 'gpt-3.5-turbo',
        avatar: '🤖',
        color: '#8B5CF6',
        capabilities: ['legacy-analysis'],
        rag_enabled: false,
        temperature: 0.8,
        max_tokens: 1500,
        is_custom: true,
        is_public: true,
        status: 'active',
        tier: 1,
        priority: 100,
        implementation_phase: 1,
        knowledge_domains: ['finance'],
        business_function: 'financial-analysis',
        role: 'advisor',
      });
    });
  });

  describe('Healthcare-Specific Features', () => {
    const medicalAgent = {
      id: '1',
      name: 'clinical-specialist',
      display_name: 'Clinical Specialist',
      description: 'Medical expert',
      system_prompt: 'You are a medical expert',
      model: 'gpt-4',
      avatar: '👩‍⚕️',
      color: '#10B981',
      capabilities: ['diagnosis', 'treatment-planning'],
      rag_enabled: true,
      temperature: 0.6,
      max_tokens: 2000,
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      medical_specialty: 'Internal Medicine',
      clinical_validation_status: 'validated' as const,
      medical_accuracy_score: 0.97,
      citation_accuracy: 0.95,
      hallucination_rate: 0.02,
      medical_error_rate: 0.01,
      fda_samd_class: 'II',
      hipaa_compliant: true,
      pharma_enabled: true,
      verify_enabled: true,
      cost_per_query: 0.15,
      average_latency_ms: 2500,
    };

    it('should handle medical agent properties correctly', () => {
      useAgentsStore.setState({ agents: [medicalAgent] });
      const { result } = renderHook(() => useAgentsStore());

      const agent = result.current.getAgentById('1');
      expect(agent?.medical_specialty).toBe('Internal Medicine');
      expect(agent?.clinical_validation_status).toBe('validated');
      expect(agent?.medical_accuracy_score).toBe(0.97);
      expect(agent?.hipaa_compliant).toBe(true);
      expect(agent?.pharma_enabled).toBe(true);
    });

    it('should validate healthcare compliance requirements', () => {
      const { result } = renderHook(() => useAgentsStore());
      const agent = result.current.getAgentById('1');

      // Medical agents should have high accuracy scores
      expect(agent?.medical_accuracy_score).toBeGreaterThanOrEqual(0.95);

      // Should be HIPAA compliant
      expect(agent?.hipaa_compliant).toBe(true);

      // Should have low error rates
      expect(agent?.medical_error_rate).toBeLessThanOrEqual(0.02);
      expect(agent?.hallucination_rate).toBeLessThanOrEqual(0.05);
    });
  });
});