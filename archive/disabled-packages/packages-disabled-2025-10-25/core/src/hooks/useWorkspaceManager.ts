/**
 * Workspace Manager Hook
 * Manages contextual workspaces and scoped conversations for stakeholder-specific work
 */

import { useState, useEffect, useCallback } from 'react';

import type { Conversation, Message, Agent } from '@/shared/types/chat.types';

export type WorkspaceType = 'pharma' | 'payer' | 'provider' | 'dtx-startup' | 'general';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  description: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  conversationIds: string[];
  defaultAgents: string[];
  customSettings?: {
    complianceLevel: 'standard' | 'enhanced' | 'maximum';
    enabledFeatures: string[];
    defaultTemplate?: string;
  };
  metadata?: {
    totalConversations: number;
    totalMessages: number;
    avgResponseTime: number;
    primaryTopics: string[];
  };
}

export interface WorkspaceConversation extends Conversation {
  workspaceId: string;
  workspaceType: WorkspaceType;
  contextualTags: string[];
  stakeholderContext?: {
    role: string;
    department: string;
    priorities: string[];
    constraints: string[];
  };
}

interface UseWorkspaceManagerOptions {
  autoDetectWorkspace?: boolean;
  persistWorkspaces?: boolean;
}

export const __useWorkspaceManager = ({
  autoDetectWorkspace = true,
  persistWorkspaces = true
}: UseWorkspaceManagerOptions = { /* TODO: implement */ }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaceConversations, setWorkspaceConversations] = useState<Map<string, WorkspaceConversation[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Default workspaces for healthcare stakeholders
  const defaultWorkspaces: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'conversationIds'>[] = [
    {
      name: 'Pharmaceutical Development',
      type: 'pharma',
      description: 'Drug development, regulatory strategy, and clinical research workspace',
      icon: '💊',
      color: 'blue',
      defaultAgents: ['clinical-trial', 'fda-regulatory', 'biostatistics', 'medical-safety'],
      customSettings: {
        complianceLevel: 'enhanced',
        enabledFeatures: ['regulatory-intelligence', 'clinical-endpoints', 'safety-monitoring'],
        defaultTemplate: 'pharmaceutical-development'
      },
      metadata: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        primaryTopics: ['Clinical Trials', 'Regulatory Pathways', 'Drug Safety', 'Market Access']
      }
    },
    {
      name: 'Healthcare Economics',
      type: 'payer',
      description: 'Coverage decisions, value assessment, and reimbursement strategy workspace',
      icon: '💰',
      color: 'green',
      defaultAgents: ['reimbursement', 'market-access', 'biostatistics', 'real-world-evidence'],
      customSettings: {
        complianceLevel: 'enhanced',
        enabledFeatures: ['budget-impact-modeling', 'value-assessment', 'coverage-policies'],
        defaultTemplate: 'health-economics'
      },
      metadata: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        primaryTopics: ['Coverage Decisions', 'Budget Impact', 'Value Assessment', 'Policy Development']
      }
    },
    {
      name: 'Clinical Operations',
      type: 'provider',
      description: 'Patient care optimization and clinical workflow enhancement workspace',
      icon: '🏥',
      color: 'purple',
      defaultAgents: ['patient-engagement', 'clinical-trial', 'quality-systems', 'compliance-monitor'],
      customSettings: {
        complianceLevel: 'maximum',
        enabledFeatures: ['patient-outcomes', 'workflow-optimization', 'quality-measures'],
        defaultTemplate: 'clinical-operations'
      },
      metadata: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        primaryTopics: ['Patient Care', 'Workflow Efficiency', 'Quality Improvement', 'Staff Training']
      }
    },
    {
      name: 'Digital Health Innovation',
      type: 'dtx-startup',
      description: 'DTx development, market entry, and regulatory strategy workspace',
      icon: '🚀',
      color: 'orange',
      defaultAgents: ['digital-therapeutics', 'fda-regulatory', 'market-access', 'ai-ml-specialist'],
      customSettings: {
        complianceLevel: 'enhanced',
        enabledFeatures: ['dtx-validation', 'market-analysis', 'regulatory-pathways'],
        defaultTemplate: 'digital-health-startup'
      },
      metadata: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        primaryTopics: ['DTx Development', 'Regulatory Pathways', 'Market Validation', 'Technology Integration']
      }
    },
    {
      name: 'General Healthcare',
      type: 'general',
      description: 'Multi-purpose healthcare consultation and research workspace',
      icon: '🔬',
      color: 'gray',
      defaultAgents: ['clinical-trial', 'fda-regulatory', 'compliance-monitor'],
      customSettings: {
        complianceLevel: 'standard',
        enabledFeatures: ['general-consultation', 'research-support', 'compliance-check'],
        defaultTemplate: 'general-healthcare'
      },
      metadata: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        primaryTopics: ['Healthcare Research', 'Compliance', 'General Consultation']
      }
    }
  ];

  // Initialize workspaces
  useEffect(() => {

      setIsLoading(true);

      try {
        // Load from localStorage if persist is enabled
        let savedWorkspaces: Workspace[] = [];
        if (persistWorkspaces) {

          if (saved) {
            savedWorkspaces = JSON.parse(saved).map((ws: unknown) => ({
              ...ws,
              createdAt: new Date(ws.createdAt),
              updatedAt: new Date(ws.updatedAt)
            }));
          }
        }

        // If no saved workspaces, create defaults
        if (savedWorkspaces.length === 0) {

          savedWorkspaces = defaultWorkspaces.map((ws, index) => ({
            ...ws,
            id: `workspace-${ws.type}-${Date.now()}-${index}`,
            createdAt: now,
            updatedAt: now,
            conversationIds: []
          }));
        }

        setWorkspaces(savedWorkspaces);

        // Set default workspace
        if (!currentWorkspace && savedWorkspaces.length > 0) {
          setCurrentWorkspace(savedWorkspaces[0]);
        }
      } catch (error) {
        // console.error('Error initializing workspaces:', error);
        // Fall back to creating default workspaces

          ...ws,
          id: `workspace-${ws.type}-${Date.now()}-${index}`,
          createdAt: now,
          updatedAt: now,
          conversationIds: []
        }));
        setWorkspaces(fallbackWorkspaces);
        setCurrentWorkspace(fallbackWorkspaces[0]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspaces();
  }, [persistWorkspaces]);

  // Save workspaces to localStorage when they change
  useEffect(() => {
    if (persistWorkspaces && workspaces.length > 0) {
      try {
        localStorage.setItem('vital-workspaces', JSON.stringify(workspaces));
      } catch (error) {
        // console.error('Error saving workspaces:', error);
      }
    }
  }, [workspaces, persistWorkspaces]);

  // Auto-detect workspace based on conversation content

    if (!autoDetectWorkspace) return 'general';

    // Pharma indicators
    if (
      content.includes('drug development') ||
      content.includes('clinical trial') ||
      content.includes('fda submission') ||
      content.includes('pharmaceutical') ||
      agentTypes.includes('fda-regulatory') ||
      agentTypes.includes('clinical-trial')
    ) {
      return 'pharma';
    }

    // Payer indicators
    if (
      content.includes('coverage') ||
      content.includes('reimbursement') ||
      content.includes('budget impact') ||
      content.includes('formulary') ||
      agentTypes.includes('reimbursement') ||
      agentTypes.includes('market-access')
    ) {
      return 'payer';
    }

    // Provider indicators
    if (
      content.includes('patient care') ||
      content.includes('clinical workflow') ||
      content.includes('ehr integration') ||
      content.includes('quality metrics') ||
      agentTypes.includes('patient-engagement')
    ) {
      return 'provider';
    }

    // DTx startup indicators
    if (
      content.includes('digital therapeutic') ||
      content.includes('dtx') ||
      content.includes('startup') ||
      content.includes('market validation') ||
      agentTypes.includes('digital-therapeutics')
    ) {
      return 'dtx-startup';
    }

    return 'general';
  }, [autoDetectWorkspace]);

  // Create new workspace

    const newWorkspace: Workspace = {
      ...workspaceData,
      id: `workspace-${workspaceData.type}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      conversationIds: []
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  }, []);

  // Switch workspace

    if (workspace) {
      setCurrentWorkspace(workspace);
      return true;
    }
    return false;
  }, [workspaces]);

  // Create conversation in workspace

    workspaceId: string,
    conversation: Omit<WorkspaceConversation, 'id' | 'workspaceId' | 'workspaceType'>
  ): WorkspaceConversation | null => {

    if (!workspace) return null;

    const newConversation: WorkspaceConversation = {
      ...conversation,
      id: `conv-${Date.now()}`,
      workspaceId,
      workspaceType: workspace.type,
      contextualTags: [...(conversation.contextualTags || []), workspace.type]
    };

    // Update workspace conversation list
    setWorkspaces(prev => prev.map(w =>
      w.id === workspaceId
        ? {
            ...w,
            conversationIds: [...w.conversationIds, newConversation.id],
            updatedAt: new Date(),
            metadata: {
              ...w.metadata!,
              totalConversations: w.metadata?.totalConversations + 1
            }
          }
        : w
    ));

    // Update workspace conversations map
    setWorkspaceConversations(prev => {

      updated.set(workspaceId, [...existing, newConversation]);
      return updated;
    });

    return newConversation;
  }, [workspaces]);

  // Get conversations for workspace

    return workspaceConversations.get(workspaceId) || [];
  }, [workspaceConversations]);

  // Update workspace metadata

    setWorkspaces(prev => prev.map(w =>
      w.id === workspaceId
        ? {
            ...w,
            metadata: { ...w.metadata!, ...updates },
            updatedAt: new Date()
          }
        : w
    ));
  }, []);

  // Get contextual agents for current workspace

    return currentWorkspace?.defaultAgents || ['clinical-trial'];
  }, [currentWorkspace]);

  // Get workspace-specific settings

      ? workspaces.find(w => w.id === workspaceId)
      : currentWorkspace;
    return workspace?.customSettings;
  }, [workspaces, currentWorkspace]);

  return {
    workspaces,
    currentWorkspace,
    workspaceConversations: workspaceConversations,
    isLoading,

    // Actions
    createWorkspace,
    switchWorkspace,
    createConversationInWorkspace,
    getWorkspaceConversations,
    updateWorkspaceMetadata,
    getContextualAgents,
    getWorkspaceSettings,
    detectWorkspaceFromContext,

    // Utilities
    getWorkspaceById: (id: string) => workspaces.find(w => w.id === id),
    getWorkspaceByType: (type: WorkspaceType) => workspaces.find(w => w.type === type),
    getDefaultWorkspace: () => workspaces.find(w => w.type === 'general') || workspaces[0]
  };
};

export type { UseWorkspaceManagerOptions };