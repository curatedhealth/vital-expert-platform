'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Agent } from '@/shared/services/agents/agents-store';

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

// Default panel templates
const defaultTemplates: PanelTemplate[] = [
  {
    id: 'regulatory-advisory',
    name: 'Regulatory Advisory Panel',
    description: 'Expert panel for regulatory strategy and compliance decisions',
    domain: 'regulatory',
    recommendedMembers: {
      roles: ['regulatory_strategist', 'compliance_officer', 'regulatory_affairs'],
      businessFunctions: ['regulatory', 'quality', 'clinical'],
      minMembers: 3,
      maxMembers: 5
    },
    promptTemplates: [
      'What regulatory pathway should we pursue for FDA approval?',
      'How should we address this FDA feedback?',
      'What are the compliance requirements for this indication?'
    ],
    useCases: [
      'FDA submission strategy',
      'Regulatory pathway selection',
      'Compliance assessment',
      'Global regulatory strategy'
    ],
    complexity: 'high'
  },
  {
    id: 'clinical-design',
    name: 'Clinical Trial Design Panel',
    description: 'Expert panel for clinical trial design and strategy',
    domain: 'clinical',
    recommendedMembers: {
      roles: ['clinical_researcher', 'biostatistician', 'clinical_operations'],
      businessFunctions: ['clinical', 'biostatistics', 'medical_affairs'],
      minMembers: 3,
      maxMembers: 6
    },
    promptTemplates: [
      'Design an optimal Phase II study for this indication',
      'What endpoints should we use for this trial?',
      'How should we structure our patient recruitment strategy?'
    ],
    useCases: [
      'Protocol design',
      'Endpoint selection',
      'Statistical planning',
      'Operational feasibility'
    ],
    complexity: 'high'
  },
  {
    id: 'market-access',
    name: 'Market Access Advisory Panel',
    description: 'Expert panel for market access and commercialization strategy',
    domain: 'commercial',
    recommendedMembers: {
      roles: ['market_access', 'health_economist', 'payer_expert'],
      businessFunctions: ['commercial', 'market_access', 'health_economics'],
      minMembers: 3,
      maxMembers: 5
    },
    promptTemplates: [
      'What pricing strategy should we pursue?',
      'How should we approach payer negotiations?',
      'What health economics evidence do we need?'
    ],
    useCases: [
      'Pricing strategy',
      'Payer engagement',
      'Value proposition',
      'Market positioning'
    ],
    complexity: 'medium'
  },
  {
    id: 'digital-health',
    name: 'Digital Health Innovation Panel',
    description: 'Expert panel for digital therapeutics and health technology',
    domain: 'digital_health',
    recommendedMembers: {
      roles: ['digital_health', 'software_architect', 'regulatory_digital'],
      businessFunctions: ['digital_health', 'regulatory', 'clinical'],
      minMembers: 3,
      maxMembers: 4
    },
    promptTemplates: [
      'How should we classify this digital therapeutic?',
      'What clinical evidence is needed for our app?',
      'How do we ensure cybersecurity compliance?'
    ],
    useCases: [
      'SaMD classification',
      'Digital therapeutic validation',
      'Cybersecurity framework',
      'User experience optimization'
    ],
    complexity: 'high'
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
          const panel = state.panels.find(p => p.id === panelId);
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
                  members: panel.members.filter(m => m.agent.id !== memberId),
                  updated_at: new Date()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? {
                ...state.currentPanel,
                members: state.currentPanel.members.filter(m => m.agent.id !== memberId),
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