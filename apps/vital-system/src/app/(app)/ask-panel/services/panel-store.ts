'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Agent } from '@/lib/stores/agents-store';

export interface PanelMember {
  agent: Agent;
  role: 'lead' | 'expert' | 'advisor';
  weight: number; // voting weight in consensus
}

export interface PanelMessage {
  id: string;
  content: string;
  role: 'user' | 'panel' | 'member';
  memberId?: string; // for individual member responses
  timestamp: Date;
  metadata?: {
    consensus?: number; // 0-1 representing agreement level
    confidence?: number;
    reasoning?: string;
  };
}

export interface Panel {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  members: PanelMember[];
  messages: PanelMessage[];
  status: 'draft' | 'active' | 'completed';
  created_at: Date;
  updated_at: Date;
  metadata?: {
    domain?: string;
    complexity?: 'low' | 'medium' | 'high';
    consensusThreshold?: number;
    autoConsensus?: boolean;
  };
}

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  recommendedMembers: {
    roles: string[];
    businessFunctions: string[];
    minMembers: number;
    maxMembers: number;
  };
  promptTemplates: string[];
  useCases: string[];
  complexity: 'low' | 'medium' | 'high';
}

interface PanelState {
  panels: Panel[];
  currentPanel: Panel | null;
  templates: PanelTemplate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTemplates: () => void;
  createPanel: (config: Partial<Panel>) => Panel;
  selectPanel: (panelId: string) => void;
  addMemberToPanel: (panelId: string, member: PanelMember) => void;
  removeMemberFromPanel: (panelId: string, memberId: string) => void;
  sendMessageToPanel: (content: string) => Promise<void>;
  deletePanel: (panelId: string) => void;
  clearError: () => void;
}

// Default panel templates - 6 main panel workflow types
const defaultTemplates: PanelTemplate[] = [
  {
    id: 'structured_panel',
    name: 'Structured Panel',
    description: 'Structured multi-expert panel with moderator, opening statements, multiple discussion rounds, consensus and documentation.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['moderator', 'expert', 'advisor'],
      businessFunctions: ['regulatory', 'clinical', 'quality', 'compliance'],
      minMembers: 3,
      maxMembers: 10
    },
    promptTemplates: [
      'Conduct a structured review of this regulatory submission strategy',
      'Facilitate a formal panel discussion on clinical trial design',
      'Lead a consensus-building session on compliance requirements'
    ],
    useCases: [
      'Formal advisory board meetings',
      'Regulatory strategy sessions',
      'Consensus building',
      'Structured decision-making'
    ],
    complexity: 'high'
  },
  {
    id: 'open_panel',
    name: 'Open Panel',
    description: 'Open, collaborative panel format optimized for brainstorming, innovation and exploratory discussions.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['facilitator', 'expert', 'innovator'],
      businessFunctions: ['commercial', 'digital_health', 'clinical', 'marketing'],
      minMembers: 3,
      maxMembers: 10
    },
    promptTemplates: [
      'Brainstorm innovative approaches for market entry',
      'Explore new digital health opportunities',
      'Generate creative solutions for patient engagement'
    ],
    useCases: [
      'Innovation sessions',
      'Brainstorming',
      'Exploratory discussions',
      'Creative problem-solving'
    ],
    complexity: 'medium'
  },
  {
    id: 'expert_panel',
    name: 'Expert Panel',
    description: 'Focused expert consensus panel where domain specialists provide opinions and converge on a recommendation.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['lead_expert', 'domain_specialist', 'advisor'],
      businessFunctions: ['clinical', 'regulatory', 'health_economics', 'biostatistics'],
      minMembers: 3,
      maxMembers: 10
    },
    promptTemplates: [
      'Provide expert consensus on this clinical trial design',
      'Reach agreement on regulatory pathway selection',
      'Develop unified recommendations for payer strategy'
    ],
    useCases: [
      'Expert advisory sessions',
      'Consensus recommendations',
      'Strategic guidance',
      'Domain-specific decisions'
    ],
    complexity: 'high'
  },
  {
    id: 'socratic_panel',
    name: 'Socratic Panel',
    description: 'Panel focused on structured questioning, probing assumptions and refining ideas through iterative Q&A.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['questioner', 'expert', 'analyst'],
      businessFunctions: ['clinical', 'regulatory', 'biostatistics', 'health_economics'],
      minMembers: 3,
      maxMembers: 10
    },
    promptTemplates: [
      'Challenge the assumptions in this trial design',
      'Probe the weaknesses in this regulatory strategy',
      'Question the evidence supporting this market access approach'
    ],
    useCases: [
      'Assumption testing',
      'Critical analysis',
      'Idea refinement',
      'Deep questioning'
    ],
    complexity: 'medium'
  },
  {
    id: 'devils_advocate_panel',
    name: "Devil's Advocate Panel",
    description: 'Panel configuration where one or more experts are assigned to challenge assumptions and stress-test proposals.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['challenger', 'defender', 'arbiter'],
      businessFunctions: ['risk_management', 'regulatory', 'compliance', 'clinical'],
      minMembers: 3,
      maxMembers: 10
    },
    promptTemplates: [
      'Stress-test this go-to-market strategy',
      'Challenge the feasibility of this clinical trial design',
      'Identify potential failures in this regulatory approach'
    ],
    useCases: [
      'Risk assessment',
      'Stress testing',
      'Challenge sessions',
      'Proposal validation'
    ],
    complexity: 'high'
  },
  {
    id: 'structured_ask_expert',
    name: 'Structured Ask Expert',
    description: 'Single-expert structured consultation with clear phases, from initial assessment to recommendation and next steps.',
    domain: 'panel',
    recommendedMembers: {
      roles: ['lead_expert', 'advisor'],
      businessFunctions: ['clinical', 'regulatory', 'biostatistics', 'health_economics'],
      minMembers: 1,
      maxMembers: 3
    },
    promptTemplates: [
      'Provide structured guidance on FDA submission requirements',
      'Walk through the clinical trial design process step by step',
      'Give a comprehensive assessment of market access strategy'
    ],
    useCases: [
      'One-on-one expert consultation',
      'Structured guidance',
      'Step-by-step advisory',
      'Focused expertise'
    ],
    complexity: 'low'
  }
];

export const __usePanelStore = create<PanelState>()(
  persist(
    (set, get) => ({
      panels: [],
      currentPanel: null,
      templates: defaultTemplates,
      isLoading: false,
      error: null,

      loadTemplates: () => {
        // Templates are loaded by default
        // In future, could load from API
        set({ templates: defaultTemplates });
      },

      createPanel: (config: Partial<Panel>) => {
        const newPanel: Panel = {
          id: `panel_${Date.now()}`,
          name: config.name || 'New Advisory Panel',
          description: config.description || '',
          templateId: config.templateId,
          members: config.members || [],
          messages: [],
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date(),
          metadata: config.metadata || { /* TODO: implement */ }
        };

        set(state => ({
          panels: [newPanel, ...state.panels],
          currentPanel: newPanel
        }));

        return newPanel;
      },

      selectPanel: (panelId: string) => {
        set(state => {
          const panel = state.panels.find((p: any) => p.id === panelId);
          if (panel) {
            return { currentPanel: panel };
          }
          return state;
        });
      },

      addMemberToPanel: (panelId: string, member: PanelMember) => {
        set(state => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? {
                  ...panel,
                  members: [...panel.members, member],
                  updated_at: new Date()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? {
                ...state.currentPanel,
                members: [...state.currentPanel.members, member],
                updated_at: new Date()
              }
            : state.currentPanel
        }));
      },

      removeMemberFromPanel: (panelId: string, memberId: string) => {
        set(state => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? {
                  ...panel,
                  members: panel.members.filter((m: any) => m.agent.id !== memberId),
                  updated_at: new Date()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? {
                ...state.currentPanel,
                members: state.currentPanel.members.filter((m: any) => m.agent.id !== memberId),
                updated_at: new Date()
              }
            : state.currentPanel
        }));
      },

      sendMessageToPanel: async (content: string) => {
        const currentPanel = get().currentPanel;
        if (!currentPanel) return;

        const userMessage: PanelMessage = {
          id: `msg_${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date()
        };

        // Add user message immediately
        set(state => ({
          currentPanel: state.currentPanel ? {
            ...state.currentPanel,
            messages: [...state.currentPanel.messages, userMessage]
          } : null,
          isLoading: true
        }));

        try {
          // Call panel orchestration API
          const response = await fetch('/api/panel/orchestrate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              panel: {
                id: currentPanel.id,
                members: currentPanel.members
              },
              context: {
                timestamp: new Date().toISOString()
              }
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get panel response');
          }

          const data = await response.json();

          // Add panel response(s)
          const panelMessage: PanelMessage = {
            id: `msg_${Date.now() + 1}`,
            content: data.response,
            role: 'panel',
            timestamp: new Date(),
            metadata: data.metadata
          };

          set(state => {
            const updatedMessages = state.currentPanel
              ? [...state.currentPanel.messages, panelMessage]
              : [];

            const updatedPanel = state.currentPanel ? {
              ...state.currentPanel,
              messages: updatedMessages,
              updated_at: new Date()
            } : null;

            return {
              currentPanel: updatedPanel,
              panels: state.panels.map(panel =>
                panel.id === updatedPanel?.id ? updatedPanel : panel
              ),
              isLoading: false
            };
          });

        } catch (error) {
          // console.error('Failed to send message to panel:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false
          });
        }
      },

      deletePanel: (panelId: string) => {
        set(state => ({
          panels: state.panels.filter(panel => panel.id !== panelId),
          currentPanel: state.currentPanel?.id === panelId ? null : state.currentPanel
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'panel-store',
      partialize: (state) => ({
        panels: state.panels,
        currentPanel: state.currentPanel,
      }),
    }
  )
);