import { useState, useEffect, useCallback } from 'react';
import PromptEnhancementService, { PromptStarter, AgentPrompt } from '@/lib/services/prompt-enhancement-service';

export interface UsePromptEnhancementReturn {
  // State
  prompts: PromptStarter[];
  agentPrompts: AgentPrompt[];
  selectedPrompt: PromptStarter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPrompts: () => Promise<void>;
  loadAgentPrompts: (agentId: string) => Promise<void>;
  enhancePrompt: (userPrompt: string, agentId?: string, promptName?: string) => Promise<{
    enhancedPrompt: string;
    systemPrompt: string;
    promptInfo: PromptStarter | null;
    variables: string[];
    suggestions: string[];
  }>;
  selectPrompt: (prompt: PromptStarter) => void;
  clearSelection: () => void;

  // Admin functions
  createPrompt: (promptData: Partial<PromptStarter>) => Promise<PromptStarter | null>;
  updatePrompt: (promptId: string, updates: Partial<PromptStarter>) => Promise<PromptStarter | null>;
  duplicatePrompt: (promptId: string, newName: string, userId?: string) => Promise<PromptStarter | null>;
}

export function usePromptEnhancement(): UsePromptEnhancementReturn {
  const [prompts, setPrompts] = useState<PromptStarter[]>([]);
  const [agentPrompts, setAgentPrompts] = useState<AgentPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptStarter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all available prompts
  const loadPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PromptEnhancementService.getAllPromptStarters();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load prompts for a specific agent
  const loadAgentPrompts = useCallback(async (agentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PromptEnhancementService.getAgentPrompts(agentId);
      setAgentPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent prompts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhance user prompt using PRISM framework
  const enhancePrompt = useCallback(async (
    userPrompt: string,
    agentId?: string,
    promptName?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PromptEnhancementService.enhanceUserPrompt(
        userPrompt,
        agentId,
        promptName
      );
      
      if (result.promptInfo) {
        setSelectedPrompt(result.promptInfo);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
      return {
        enhancedPrompt: userPrompt,
        systemPrompt: '',
        promptInfo: null,
        variables: [],
        suggestions: []
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a specific prompt
  const selectPrompt = useCallback((prompt: PromptStarter) => {
    setSelectedPrompt(prompt);
  }, []);

  // Clear prompt selection
  const clearSelection = useCallback(() => {
    setSelectedPrompt(null);
  }, []);

  // Admin functions
  const createPrompt = useCallback(async (promptData: Partial<PromptStarter>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PromptEnhancementService.createPrompt(promptData);
      if (result) {
        // Refresh prompts list
        await loadPrompts();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadPrompts]);

  const updatePrompt = useCallback(async (promptId: string, updates: Partial<PromptStarter>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PromptEnhancementService.updatePrompt(promptId, updates);
      if (result) {
        // Refresh prompts list
        await loadPrompts();
        // Update selected prompt if it's the one being updated
        if (selectedPrompt?.id === promptId) {
          setSelectedPrompt(result);
        }
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadPrompts, selectedPrompt]);

  const duplicatePrompt = useCallback(async (promptId: string, newName: string, userId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await PromptEnhancementService.duplicatePrompt(promptId, newName, userId);
      if (result) {
        // Refresh prompts list
        await loadPrompts();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate prompt');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadPrompts]);

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  return {
    // State
    prompts,
    agentPrompts,
    selectedPrompt,
    isLoading,
    error,

    // Actions
    loadPrompts,
    loadAgentPrompts,
    enhancePrompt,
    selectPrompt,
    clearSelection,

    // Admin functions
    createPrompt,
    updatePrompt,
    duplicatePrompt
  };
}

export default usePromptEnhancement;
