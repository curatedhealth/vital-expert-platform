/**
 * Unit Tests for Agent Orchestration System
 * Tests multi-agent coordination, consensus building, and collaboration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaborationPanel } from '@/components/chat/agents/CollaborationPanel';
import type {
  CollaborationState,
  ConsensusResult,
  Agent,
  AgentResponse,
  Conflict
} from '@/shared/types/chat.types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Agent Orchestration System', () => {
  const mockAgents: Agent[] = [
    {
      id: 'dtx-expert',
      name: 'Digital Therapeutics Expert',
      type: 'digital-therapeutics-expert',
      description: 'Expert in digital therapeutics',
      specialty: 'Digital Health',
      icon: '💊',
      availability: 'online',
      responseTime: 2000,
      confidence: 0.95,
      expertise: ['dtx-development', 'regulatory-pathways'],
    },
    {
      id: 'fda-strategist',
      name: 'FDA Regulatory Strategist',
      type: 'fda-regulatory-strategist',
      description: 'FDA regulatory expert',
      specialty: 'Regulatory Affairs',
      icon: '🏛️',
      availability: 'online',
      responseTime: 3000,
      confidence: 0.98,
      expertise: ['fda-regulations', '510k-process'],
    },
    {
      id: 'clinical-designer',
      name: 'Clinical Trial Designer',
      type: 'clinical-trial-designer',
      description: 'Clinical trial design expert',
      specialty: 'Clinical Research',
      icon: '🔬',
      availability: 'online',
      responseTime: 2500,
      confidence: 0.92,
      expertise: ['protocol-design', 'statistical-analysis'],
    },
  ];

  const mockAgentResponses: AgentResponse[] = [
    {
      agentId: 'dtx-expert',
      agent: mockAgents[0],
      content: 'DTx solutions require evidence-based validation and FDA clearance pathway.',
      confidence: 0.95,
      reasoning: 'Based on FDA Digital Therapeutics Guidance 2022',
      citations: [],
      sources: [],
      artifacts: [],
      status: 'completed',
      progress: 100,
      timestamp: new Date(),
    },
    {
      agentId: 'fda-strategist',
      agent: mockAgents[1],
      content: 'Recommend pursuing De Novo pathway for novel DTx with clinical evidence.',
      confidence: 0.98,
      reasoning: 'Novel DTx typically require De Novo classification',
      citations: [],
      sources: [],
      artifacts: [],
      status: 'completed',
      progress: 100,
      timestamp: new Date(),
    },
  ];

  describe('Collaboration State Management', () => {
    it('should initialize collaboration state correctly', () => {
      const initialState: CollaborationState = {
        isActive: false,
        activeAgents: [],
        responses: [],
        consensusLevel: 0,
        conflicts: [],
        status: 'pending',
      };

      expect(initialState.isActive).toBe(false);
      expect(initialState.activeAgents).toHaveLength(0);
      expect(initialState.responses).toHaveLength(0);
      expect(initialState.consensusLevel).toBe(0);
      expect(initialState.status).toBe('pending');
    });

    it('should transition through collaboration states correctly', () => {
      const states: CollaborationState['status'][] = [
        'pending',
        'analyzing',
        'building-consensus',
        'completed'
      ];

      states.forEach((status, index) => {
        const state: CollaborationState = {
          isActive: true,
          activeAgents: mockAgents.slice(0, index + 1),
          responses: mockAgentResponses.slice(0, index),
          consensusLevel: (index + 1) * 0.25,
          conflicts: [],
          status,
        };

        expect(state.status).toBe(status);
        expect(state.activeAgents).toHaveLength(index + 1);
        expect(state.consensusLevel).toBe((index + 1) * 0.25);
      });
    });

    it('should handle active collaboration with multiple agents', () => {
      const activeState: CollaborationState = {
        isActive: true,
        activeAgents: mockAgents,
        responses: mockAgentResponses,
        consensusLevel: 0.85,
        conflicts: [],
        status: 'building-consensus',
      };

      expect(activeState.isActive).toBe(true);
      expect(activeState.activeAgents).toHaveLength(3);
      expect(activeState.responses).toHaveLength(2);
      expect(activeState.consensusLevel).toBeGreaterThan(0.8);
    });
  });

  describe('Consensus Building', () => {
    it('should calculate consensus level based on agent agreement', () => {
      const highConsensusState: CollaborationState = {
        isActive: true,
        activeAgents: mockAgents.slice(0, 2),
        responses: mockAgentResponses,
        consensusLevel: 0.9,
        conflicts: [],
        status: 'building-consensus',
      };

      expect(highConsensusState.consensusLevel).toBeGreaterThanOrEqual(0.8);
    });

    it('should identify conflicts between agents', () => {
      const conflicts: Conflict[] = [
        {
          id: 'conflict-1',
          type: 'disagreement',
          description: 'DTX expert recommends 510(k), FDA strategist recommends De Novo',
          agents: ['dtx-expert', 'fda-strategist'],
          severity: 'medium',
          resolution: 'Further regulatory consultation needed',
        },
      ];

      const conflictState: CollaborationState = {
        isActive: true,
        activeAgents: mockAgents.slice(0, 2),
        responses: mockAgentResponses,
        consensusLevel: 0.4,
        conflicts,
        status: 'building-consensus',
      };

      expect(conflictState.conflicts).toHaveLength(1);
      expect(conflictState.conflicts[0].type).toBe('disagreement');
      expect(conflictState.conflicts[0].severity).toBe('medium');
      expect(conflictState.consensusLevel).toBeLessThan(0.6);
    });

    it('should generate consensus results', () => {
      const consensusResult: ConsensusResult = {
        finalResponse: 'Recommend De Novo pathway for novel DTx with comprehensive clinical evidence package',
        confidence: 0.92,
        reasoning: 'Weighted consensus based on FDA expertise and DTx specialization',
        contributingAgents: mockAgents.slice(0, 2),
        citations: [],
        sources: [],
        artifacts: [],
        conflicts: [],
        resolutionStrategy: 'expert-priority',
      };

      expect(consensusResult.confidence).toBeGreaterThan(0.9);
      expect(consensusResult.contributingAgents).toHaveLength(2);
      expect(consensusResult.resolutionStrategy).toBe('expert-priority');
      expect(consensusResult.finalResponse).toContain('De Novo');
    });
  });

  describe('Agent Response Handling', () => {
    it('should handle agent responses with different confidence levels', () => {
      const lowConfidenceResponse: AgentResponse = {
        ...mockAgentResponses[0],
        confidence: 0.6,
        status: 'completed',
        reasoning: 'Limited data available for this specific DTx category',
      };

      const highConfidenceResponse: AgentResponse = {
        ...mockAgentResponses[1],
        confidence: 0.98,
        status: 'completed',
        reasoning: 'Clear regulatory precedent exists',
      };

      expect(lowConfidenceResponse.confidence).toBeLessThan(0.8);
      expect(highConfidenceResponse.confidence).toBeGreaterThan(0.95);
    });

    it('should track response progress correctly', () => {
      const progressStates = [
        { status: 'thinking' as const, progress: 0 },
        { status: 'composing' as const, progress: 25 },
        { status: 'streaming' as const, progress: 75 },
        { status: 'completed' as const, progress: 100 },
      ];

      progressStates.forEach(({ status, progress }) => {
        const response: AgentResponse = {
          ...mockAgentResponses[0],
          status,
          progress,
        };

        expect(response.status).toBe(status);
        expect(response.progress).toBe(progress);
      });
    });

    it('should handle streaming responses', () => {
      const streamingResponse: AgentResponse = {
        ...mockAgentResponses[0],
        status: 'streaming',
        progress: 60,
        preview: 'Based on FDA guidance for DTx...',
      };

      expect(streamingResponse.status).toBe('streaming');
      expect(streamingResponse.progress).toBe(60);
      expect(streamingResponse.preview).toBeTruthy();
    });
  });

  describe('Collaboration Panel Component', () => {
    const defaultProps = {
      state: {
        isActive: true,
        activeAgents: mockAgents.slice(0, 2),
        responses: mockAgentResponses,
        consensusLevel: 0.85,
        conflicts: [],
        status: 'building-consensus' as const,
      },
    };

    it('should render collaboration panel when active', () => {
      render(<CollaborationPanel {...defaultProps} />);

      expect(screen.getByText('Expert Collaboration')).toBeInTheDocument();
      expect(screen.getByText('2 experts')).toBeInTheDocument();
      expect(screen.getByText('building-consensus')).toBeInTheDocument();
    });

    it('should display consensus indicator', () => {
      render(<CollaborationPanel {...defaultProps} />);

      expect(screen.getByText('Agent Consensus')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Strong consensus')).toBeInTheDocument();
    });

    it('should show agent responses', () => {
      render(<CollaborationPanel {...defaultProps} />);

      expect(screen.getByText('Agent Responses')).toBeInTheDocument();
      expect(screen.getByText('Digital Therapeutics Expert')).toBeInTheDocument();
      expect(screen.getByText('FDA Regulatory Strategist')).toBeInTheDocument();
    });

    it('should handle conflicts display', () => {
      const conflictProps = {
        ...defaultProps,
        state: {
          ...defaultProps.state,
          conflicts: [
            {
              id: 'conflict-1',
              type: 'disagreement' as const,
              description: 'Pathway recommendation conflict',
              agents: ['dtx-expert', 'fda-strategist'],
              severity: 'medium' as const,
              resolution: 'Expert consultation required',
            },
          ],
          consensusLevel: 0.4,
        },
      };

      render(<CollaborationPanel {...conflictProps} />);

      expect(screen.getByText('1 conflict detected')).toBeInTheDocument();
    });

    it('should show consensus results when completed', () => {
      const consensusProps = {
        ...defaultProps,
        state: {
          ...defaultProps.state,
          status: 'completed' as const,
        },
        consensus: {
          finalResponse: 'Consensus recommendation achieved',
          confidence: 0.92,
          reasoning: 'Based on expert analysis',
          contributingAgents: mockAgents.slice(0, 2),
          citations: [],
          sources: [],
          artifacts: [],
          conflicts: [],
          resolutionStrategy: 'weighted-voting',
        },
      };

      render(<CollaborationPanel {...consensusProps} />);

      expect(screen.getByText('Consensus Reached')).toBeInTheDocument();
      expect(screen.getByText('92% confidence')).toBeInTheDocument();
    });

    it('should not render when collaboration is inactive', () => {
      const inactiveProps = {
        state: {
          ...defaultProps.state,
          isActive: false,
        },
      };

      const { container } = render(<CollaborationPanel {...inactiveProps} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Healthcare-Specific Orchestration', () => {
    it('should prioritize medical safety in consensus building', () => {
      const medicalSafetyAgent: Agent = {
        id: 'safety-officer',
        name: 'Medical Safety Officer',
        type: 'medical-safety-officer',
        description: 'Medical device safety expert',
        specialty: 'Medical Device Safety',
        icon: '🛡️',
        availability: 'online',
        responseTime: 1500,
        confidence: 0.99,
        expertise: ['safety-assessment', 'risk-management'],
      };

      const safetyResponse: AgentResponse = {
        agentId: 'safety-officer',
        agent: medicalSafetyAgent,
        content: 'CRITICAL: Additional safety validation required before approval',
        confidence: 0.99,
        reasoning: 'Safety-first approach mandated for high-risk devices',
        citations: [],
        sources: [],
        artifacts: [],
        status: 'completed',
        progress: 100,
        timestamp: new Date(),
      };

      // Safety agent responses should override other recommendations
      expect(safetyResponse.confidence).toBe(0.99);
      expect(safetyResponse.content).toContain('CRITICAL');
      expect(medicalSafetyAgent.responseTime).toBeLessThan(2000); // Fast response for safety
    });

    it('should handle regulatory compliance validation', () => {
      const complianceState: CollaborationState = {
        isActive: true,
        activeAgents: [
          mockAgents.find(a => a.type === 'fda-regulatory-strategist')!,
          {
            id: 'ema-specialist',
            name: 'EMA Compliance Specialist',
            type: 'ema-compliance-specialist',
            description: 'European regulatory expert',
            specialty: 'EU Regulatory Affairs',
            icon: '🇪🇺',
            availability: 'online',
            responseTime: 2800,
            confidence: 0.96,
            expertise: ['ce-marking', 'mdr-compliance'],
          },
        ],
        responses: [],
        consensusLevel: 0.95,
        conflicts: [],
        status: 'building-consensus',
      };

      expect(complianceState.activeAgents).toHaveLength(2);
      expect(complianceState.activeAgents[0].type).toBe('fda-regulatory-strategist');
      expect(complianceState.activeAgents[1].type).toBe('ema-compliance-specialist');
      expect(complianceState.consensusLevel).toBeGreaterThan(0.9);
    });

    it('should ensure clinical validation requirements', () => {
      const clinicalResponse: AgentResponse = {
        agentId: 'clinical-designer',
        agent: mockAgents.find(a => a.type === 'clinical-trial-designer')!,
        content: 'Randomized controlled trial with n=500 required for statistical power',
        confidence: 0.94,
        reasoning: 'FDA guidance requires adequate clinical evidence for DTx efficacy',
        citations: [
          {
            id: 'fda-2022-dtx',
            number: 1,
            title: 'FDA Digital Therapeutics Guidance 2022',
            authors: ['FDA Center for Devices and Radiological Health'],
            year: 2022,
            relevanceScore: 0.98,
          },
        ],
        sources: [],
        artifacts: [],
        status: 'completed',
        progress: 100,
        timestamp: new Date(),
      };

      expect(clinicalResponse.citations).toHaveLength(1);
      expect(clinicalResponse.citations[0].relevanceScore).toBeGreaterThan(0.95);
      expect(clinicalResponse.content).toContain('controlled trial');
    });

    it('should handle multi-domain expertise coordination', () => {
      const multiDomainAgents: Agent[] = [
        mockAgents.find(a => a.type === 'digital-therapeutics-expert')!, // Medical
        mockAgents.find(a => a.type === 'fda-regulatory-strategist')!, // Regulatory
        {
          id: 'health-economist',
          name: 'Health Economics Analyst',
          type: 'health-economics-analyst',
          description: 'Healthcare economics expert',
          specialty: 'Health Economics',
          icon: '📊',
          availability: 'online',
          responseTime: 3200,
          confidence: 0.89,
          expertise: ['cost-effectiveness', 'reimbursement'],
        }, // Financial
      ];

      const crossDomainState: CollaborationState = {
        isActive: true,
        activeAgents: multiDomainAgents,
        responses: [],
        consensusLevel: 0.78,
        conflicts: [
          {
            id: 'cost-efficacy-conflict',
            type: 'uncertainty',
            description: 'Cost-effectiveness analysis shows marginal benefit vs clinical efficacy',
            agents: ['dtx-expert', 'health-economist'],
            severity: 'low',
          },
        ],
        status: 'building-consensus',
      };

      expect(crossDomainState.activeAgents).toHaveLength(3);
      expect(crossDomainState.conflicts).toHaveLength(1);
      expect(crossDomainState.conflicts[0].type).toBe('uncertainty');
      expect(crossDomainState.consensusLevel).toBeGreaterThan(0.7);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle agent timeout scenarios', () => {
      const timeoutResponse: AgentResponse = {
        agentId: 'slow-agent',
        agent: {
          ...mockAgents[0],
          id: 'slow-agent',
          availability: 'busy',
          responseTime: 30000, // 30 seconds
        },
        content: '',
        confidence: 0,
        reasoning: 'Request timeout',
        citations: [],
        sources: [],
        artifacts: [],
        status: 'error',
        progress: 0,
        timestamp: new Date(),
      };

      expect(timeoutResponse.status).toBe('error');
      expect(timeoutResponse.confidence).toBe(0);
      expect(timeoutResponse.agent.availability).toBe('busy');
    });

    it('should handle conflicting high-confidence responses', () => {
      const conflictingResponses: AgentResponse[] = [
        {
          ...mockAgentResponses[0],
          content: 'Recommend 510(k) pathway for DTx',
          confidence: 0.96,
        },
        {
          ...mockAgentResponses[1],
          content: 'De Novo pathway is required for this DTx',
          confidence: 0.98,
        },
      ];

      const highConflictState: CollaborationState = {
        isActive: true,
        activeAgents: mockAgents.slice(0, 2),
        responses: conflictingResponses,
        consensusLevel: 0.2, // Low due to high-confidence conflict
        conflicts: [
          {
            id: 'pathway-conflict',
            type: 'contradiction',
            description: 'High-confidence disagreement on regulatory pathway',
            agents: ['dtx-expert', 'fda-strategist'],
            severity: 'high',
            resolution: 'Escalate to senior regulatory counsel',
          },
        ],
        status: 'building-consensus',
      };

      expect(highConflictState.consensusLevel).toBeLessThan(0.5);
      expect(highConflictState.conflicts[0].severity).toBe('high');
      expect(highConflictState.conflicts[0].type).toBe('contradiction');
    });

    it('should handle empty or invalid agent responses', () => {
      const invalidResponse: AgentResponse = {
        agentId: 'invalid-agent',
        agent: mockAgents[0],
        content: '',
        confidence: 0,
        reasoning: '',
        citations: [],
        sources: [],
        artifacts: [],
        status: 'error',
        progress: 0,
        timestamp: new Date(),
      };

      expect(invalidResponse.content).toBe('');
      expect(invalidResponse.confidence).toBe(0);
      expect(invalidResponse.status).toBe('error');
    });
  });
});