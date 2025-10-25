import { useState, useEffect, useMemo } from 'react';

import type { Agent } from '@/lib/stores/chat-store';

interface PromptStarter {
  text: string;
  description: string;
  color: string;
  icon?: string;
  fullPrompt?: string;
}

// Default prompts for agents without specific capabilities
const getDefaultPrompts = (): PromptStarter[] => [
  { text: 'General assistance', description: 'Get help with general questions', color: 'blue' },
  { text: 'Knowledge search', description: 'Search the knowledge base', color: 'green' },
  { text: 'Best practices', description: 'Learn about best practices', color: 'purple' },
  { text: 'Expert guidance', description: 'Get expert recommendations', color: 'orange' }
];

// Helper function for dynamic prompt generation based on capabilities
const generateDynamicPrompts = (capabilities: unknown): PromptStarter[] => {
  const capabilityPrompts: Record<string, PromptStarter[]> = {
    'regulatory': [
      { text: 'Regulatory pathway guidance', description: 'Get guidance on regulatory submissions', color: 'blue' },
      { text: 'Compliance requirements', description: 'Understand regulatory compliance needs', color: 'green' }
    ],
    'clinical': [
      { text: 'Clinical study design', description: 'Design clinical studies and trials', color: 'purple' },
      { text: 'Clinical data analysis', description: 'Analyze clinical trial data', color: 'orange' }
    ],
    'reimbursement': [
      { text: 'Market access strategy', description: 'Develop market access plans', color: 'blue' },
      { text: 'Payer analysis', description: 'Analyze payer landscape', color: 'green' }
    ],
    'medical-writing': [
      { text: 'Document drafting', description: 'Draft medical documents', color: 'purple' },
      { text: 'Regulatory writing', description: 'Create regulatory submissions', color: 'orange' }
    ]
  };

  const prompts: PromptStarter[] = [];
  const normalizedCapabilities = Array.isArray(capabilities)
    ? capabilities as string[]
    : typeof capabilities === 'string'
      ? [capabilities]
      : [];

  normalizedCapabilities.forEach((capability: string) => {
    const capabilityKey = capability.toLowerCase().replace(/[^a-z0-9]/g, '-');
    // Validate key exists before accessing object - safe validated access
    if (Object.prototype.hasOwnProperty.call(capabilityPrompts, capabilityKey)) {
      // eslint-disable-next-line security/detect-object-injection
      prompts.push(...capabilityPrompts[capabilityKey]);
    }
  });

  return prompts.length > 0 ? prompts : getDefaultPrompts();
};

/**
 * Custom hook for managing agent-specific prompt starters
 * Fetches prompts from API or generates dynamic ones based on agent capabilities
 */
export function usePromptStarters(selectedAgent: Agent | null) {
  const [agentPromptStarters, setAgentPromptStarters] = useState<PromptStarter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch agent-specific prompt starters when agent changes
  useEffect(() => {
    const fetchAgentPromptStarters = async () => {
      if (!selectedAgent?.id) {
        setAgentPromptStarters([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/agents/${selectedAgent.id}/prompt-starters`);
        if (response.ok) {
          const starters = await response.json() as PromptStarter[];
          if (starters && starters.length > 0) {
            setAgentPromptStarters(starters);
          } else {
            // Fallback to default prompts if no agent-specific prompts found
            setAgentPromptStarters([]);
          }
        } else {
          setAgentPromptStarters([]);
        }
      } catch (error) {
        console.error('Error fetching agent prompt starters:', error);
        setAgentPromptStarters([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentPromptStarters();
  }, [selectedAgent?.id]);

  // Get agent-specific prompt starters with memoization
  const promptStarters = useMemo(() => {
    // No agent selected - use default prompts
    if (!selectedAgent) {
      return [
        { text: '510(k) vs PMA requirements', description: 'Compare pathway requirements and timelines', color: 'blue' },
        { text: 'Regulatory strategy guidance', description: 'Get strategic advice for your submission', color: 'green' },
        { text: 'De Novo vs 510(k) pathways', description: 'Understand novel device classification options', color: 'purple' },
        { text: 'Submission checklist review', description: 'Ensure your submission is complete', color: 'orange' }
      ];
    }

    // Use agent-specific prompts if available
    if (agentPromptStarters.length > 0) {
      return agentPromptStarters;
    }

    // Dynamic prompts based on agent capabilities or use default general prompts
    const prompts = selectedAgent?.capabilities && selectedAgent.capabilities.length > 0
      ? generateDynamicPrompts(selectedAgent.capabilities)
      : getDefaultPrompts();

    return prompts;
  }, [selectedAgent, agentPromptStarters]);

  /**
   * Manually refresh prompt starters for current agent
   */
  const refreshPrompts = async () => {
    if (!selectedAgent?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/prompt-starters`);
      if (response.ok) {
        const starters = await response.json() as PromptStarter[];
        if (starters && starters.length > 0) {
          setAgentPromptStarters(starters);
        }
      }
    } catch (error) {
      console.error('Error refreshing prompt starters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptStarters,
    isLoading,
    refreshPrompts,
  };
}
