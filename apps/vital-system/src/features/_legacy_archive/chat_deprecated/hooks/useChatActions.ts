import type { Agent, AIModel } from '@/lib/stores/chat-store';

interface UseChatActionsProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  autoAgentSelection: boolean;
  selectedAgent: Agent | null;
  selectedModel: AIModel | null;
  setSelectedAgent: (agent: Agent) => void;
  sendMessage: (message: string) => Promise<void>;
  onRecommendationsNeeded: (message: string) => Promise<boolean>;
}

interface RecommendedAgent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  avatar: string;
  tier?: number;
  system_prompt?: string;
  model?: string;
  capabilities?: string[];
  reasoning: string;
  score?: number;
}

/**
 * Custom hook for managing chat actions (send, key press, agent selection)
 * Consolidates chat interaction logic in one place
 */
export function useChatActions({
  input,
  setInput,
  // isLoading is available but not used in current implementation
  autoAgentSelection,
  selectedAgent,
  selectedModel,
  setSelectedAgent,
  sendMessage,
  onRecommendationsNeeded,
}: UseChatActionsProps) {
  /**
   * Handle sending a message
   * Shows agent recommendations if auto-selection is enabled and no agent selected
   * Otherwise sends message directly
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const message = input.trim();

    // Step 1: Show agent recommendations if auto-selection is enabled and no agent selected
    if (autoAgentSelection && !selectedAgent) {
      setInput(''); // Clear input immediately

      const hasRecommendations = await onRecommendationsNeeded(message);

      if (hasRecommendations) {
        // IMPORTANT: Return early to prevent sending message
        // The message will be sent after user selects an agent
        return;
      } else {
        // If recommendation fails, send message without agent selection
        await sendMessage(message);
        return;
      }
    }

    // Step 2: Send message if agent is already selected
    setInput('');
    await sendMessage(message);
  };

  /**
   * Handle agent selection from recommendations
   * @param recommendedAgent - The agent selected by the user
   * @param pendingMessage - The message that was pending agent selection
   */
  const handleSelectRecommendedAgent = async (
    recommendedAgent: RecommendedAgent,
    pendingMessage: string
  ) => {
    // Convert to Agent type and set as selected
    const agent: Agent = {
      id: recommendedAgent.id,
      name: recommendedAgent.name,
      display_name: recommendedAgent.display_name,
      description: recommendedAgent.description,
      avatar: recommendedAgent.avatar,
      systemPrompt: recommendedAgent.system_prompt,
      tier: recommendedAgent.tier,
      capabilities: recommendedAgent.capabilities || [],
      model: selectedModel || recommendedAgent.model || 'gpt-4-turbo-preview', // Use selected model from dropdown
    };

    setSelectedAgent(agent);
    await sendMessage(pendingMessage);
  };

  /**
   * Handle key press events in chat input
   * Send message on Enter (without Shift)
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle agent selection from sidebar or agent list
   * @param agentId - ID of the agent to select
   * @param agents - Array of available agents to search from
   * @param createNewChat - Function to create a new chat
   * @param setHasUserSelectedAgent - Function to mark that user has selected an agent
   * @param setUseDirectLLM - Function to switch to agent mode
   */
  const handleAgentSelect = (
    agentId: string,
    agents: Agent[],
    createNewChat: () => void,
    setHasUserSelectedAgent: (value: boolean) => void,
    setUseDirectLLM: (value: boolean) => void
  ) => {
    const agent = agents.find((a: any) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setHasUserSelectedAgent(true); // Mark that user has explicitly selected an agent
      setUseDirectLLM(false); // Switch to agent mode
      // Create a new chat to show the agent profile with prompt starters
      createNewChat();
    }
  };

  return {
    handleSendMessage,
    handleSelectRecommendedAgent,
    handleKeyPress,
    handleAgentSelect,
  };
}
