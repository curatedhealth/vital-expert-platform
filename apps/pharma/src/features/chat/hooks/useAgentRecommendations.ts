import { useState } from 'react';

interface RecommendedAgent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  avatar: string;
  tier?: number;
  reasoning: string;
  score?: number;
}

interface RecommendationAPIResponse {
  success: boolean;
  agents: Array<{
    id: string;
    name: string;
    display_name?: string;
    description: string;
    avatar: string;
    tier?: number;
  }>;
  recommendations?: Array<{
    reasoning: string;
    score: number;
  }>;
}

/**
 * Custom hook for managing agent recommendations
 * Fetches recommended agents based on user query
 * Handles loading states and agent selection
 */
export function useAgentRecommendations() {
  const [isSelectingAgent, setIsSelectingAgent] = useState(false);
  const [recommendedAgents, setRecommendedAgents] = useState<RecommendedAgent[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string>('');

  /**
   * Fetch agent recommendations based on user query
   * @param query - The user's message/query
   * @returns Promise<boolean> - true if recommendations were found
   */
  const fetchRecommendations = async (query: string): Promise<boolean> => {
    setIsSelectingAgent(true);
    setPendingMessage(query);

    try {
      const response = await fetch('/api/agents/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json() as RecommendationAPIResponse;

        if (data.success && data.agents && data.agents.length > 0) {
          // Show top 2-3 recommendations for user to choose
          const topAgents = data.agents.slice(0, 3);

          const enrichedAgents = topAgents.map((agent, index: number) => ({
            ...agent,
            // Optional chaining and default values are safe here - ESLint security warning is false positive
            // eslint-disable-next-line security/detect-object-injection
            reasoning: data.recommendations?.[index]?.reasoning || 'Best match for your query',
            // eslint-disable-next-line security/detect-object-injection
            score: data.recommendations?.[index]?.score || 100
          }));

          setRecommendedAgents(enrichedAgents);
          setIsSelectingAgent(false);
          return true;
        } else {
          console.warn('No agents in response or invalid data structure');
          setIsSelectingAgent(false);
          return false;
        }
      } else {
        console.error('API response not OK:', response.status, response.statusText);
        setIsSelectingAgent(false);
        return false;
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setIsSelectingAgent(false);
      return false;
    }
  };

  /**
   * Clear recommendations and reset state
   */
  const clearRecommendations = () => {
    setRecommendedAgents([]);
    setPendingMessage('');
  };

  /**
   * Cancel the recommendation flow and restore the pending message
   * @returns The pending message that was cancelled
   */
  const cancelRecommendations = (): string => {
    const message = pendingMessage;
    clearRecommendations();
    return message;
  };

  return {
    isSelectingAgent,
    recommendedAgents,
    pendingMessage,
    fetchRecommendations,
    clearRecommendations,
    cancelRecommendations,
  };
}
