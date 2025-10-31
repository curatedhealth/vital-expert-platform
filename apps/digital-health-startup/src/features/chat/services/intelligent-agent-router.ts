/**
 * Intelligent Agent Router
 *
 * Uses Python AI Engine via API Gateway to analyze user queries and select
 * the most appropriate agent from the available pool based on:
 * - Query content and domain
 * - Agent expertise and capabilities
 * - Confidence scoring
 * - Escalation path determination
 */

import { createClient } from '@supabase/supabase-js';

// API Gateway URL for Python AI Engine
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.API_GATEWAY_URL || 'http://localhost:3001';

export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  tier: number;
  domain?: string;
  capabilities?: string[];
  focus_areas?: string[];
  key_expertise?: string;
  expert_level?: string;
}

export interface AgentSelectionResult {
  selectedAgent: Agent;
  confidence: number;
  reasoning: string;
  alternativeAgents: Array<{ agent: Agent; score: number }>;
  escalationPath: string[];
  matchedCriteria: string[];
}

export interface ReasoningStep {
  step: string;
  details: string;
  timestamp: number;
}

/**
 * Analyze user query and select the best agent using OpenAI reasoning
 * @param userQuery - The user's message
 * @param availableAgents - List of available agents
 * @param currentAgent - The currently selected agent (for follow-up questions)
 * @param chatHistory - Previous messages in the conversation
 */
export async function selectAgentWithReasoning(
  userQuery: string,
  availableAgents: Agent[],
  currentAgent?: Agent,
  chatHistory?: Array<{ role: string; content: string }>
): Promise<AgentSelectionResult> {

  // If there's a current agent and chat history, check if they can handle this follow-up
  if (currentAgent && chatHistory && chatHistory.length > 0) {
    console.log(`🔄 Checking if ${currentAgent.display_name} can handle follow-up question...`);

    // For follow-up questions, stick with the current agent unless explicitly needed
    // Only consider switching if the query is completely out of scope
    const isFollowUp = chatHistory.length > 2; // More than one exchange

    if (isFollowUp) {
      // Return the current agent with high confidence for follow-ups
      return {
        selectedAgent: currentAgent,
        confidence: 90,
        reasoning: `Continuing conversation with ${currentAgent.display_name}. This appears to be a follow-up question.`,
        alternativeAgents: [],
        escalationPath: [`Tier ${currentAgent.tier || 1}: ${currentAgent.display_name}`],
        matchedCriteria: ['conversation-continuity', 'follow-up-question'],
      };
    }
  }

  // Build agent context for the reasoning model (limit to prevent context overflow)
  // Only include essential information and limit to top 20 agents by tier
  const limitedAgents = availableAgents
    .sort((a, b) => (a.tier || 1) - (b.tier || 1))
    .slice(0, 20);
    
  const agentContext = limitedAgents.map((agent: any) => ({
    id: agent.id,
    name: agent.display_name,
    description: agent.description.substring(0, 100) + '...', // Truncate description
    tier: agent.tier,
    domain: agent.domain || 'general',
    expertise: (agent.key_expertise || agent.description).substring(0, 50) + '...', // Truncate expertise
  }));

  // Create reasoning prompt for agent selection (optimized for speed and token usage)
  const systemPrompt = `Select the best expert agent for this query. Respond in JSON format.

Available agents:
${agentContext.map((a: any) => `${a.id}: ${a.name} (Tier ${a.tier}, ${a.domain}) - ${a.expertise}`).join('\n')}

JSON format:
{"selectedAgentId": "agent-id", "confidence": 95, "reasoning": "Brief reason", "alternatives": [{"agentId": "alt-1", "score": 85}], "escalationPath": ["Tier X: Agent Name"], "matchedCriteria": ["keyword1", "keyword2"]}`;

  const userPrompt = `Query: "${userQuery}"`;

  try {
    // Call Python AI Engine via API Gateway for agent selection
    const response = await fetch(`${API_GATEWAY_URL}/api/agents/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        query: userQuery,
        context: {
          available_agents: agentContext,
          chat_history: chatHistory || [],
        },
        correlation_id: `agent-select-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Gateway error: ${errorData.message || response.statusText}`);
    }

    const analysis = await response.json();

    // Map Python response to expected format
    const result = {
      selectedAgentId: analysis.selected_agent?.id || analysis.agent_rankings?.[0]?.agent?.id,
      confidence: analysis.confidence || analysis.agent_rankings?.[0]?.score || 75,
      reasoning: analysis.reasoning || analysis.query_analysis?.summary || 'Agent selected based on query analysis',
      alternatives: (analysis.agent_rankings || []).slice(1, 4).map((ranking: any) => ({
        agentId: ranking.agent?.id,
        score: ranking.score || 0,
        reason: ranking.reason || '',
      })),
      escalationPath: analysis.escalation_path || [],
      matchedCriteria: analysis.query_analysis?.medical_terms || [],
    };

    // Find the selected agent
    const selectedAgent = availableAgents.find(
      a => a.id === result.selectedAgentId
    );

    if (!selectedAgent) {
      console.warn(`⚠️  Selected agent not found: ${result.selectedAgentId}, using fallback`);
      return fallbackAgentSelection(userQuery, availableAgents);
    }

    // Map alternative agents
    const alternativeAgents = result.alternatives.map((alt: any) => {
      const agent = availableAgents.find((a: any) => a.id === alt.agentId);
      return {
        agent: agent!,
        score: alt.score,
        reason: alt.reason,
      };
    }).filter((alt: any) => alt.agent); // Filter out any not found

    return {
      selectedAgent,
      confidence: result.confidence,
      reasoning: result.reasoning,
      alternativeAgents,
      escalationPath: result.escalationPath || [],
      matchedCriteria: result.matchedCriteria || [],
    };

  } catch (error) {
    console.error('❌ Agent selection error:', error);

    // Fallback: Use simple keyword matching
    return fallbackAgentSelection(userQuery, availableAgents);
  }
}

/**
 * Fallback agent selection using simple keyword matching
 */
function fallbackAgentSelection(
  query: string,
  agents: Agent[]
): AgentSelectionResult {
  if (!agents || agents.length === 0) {
    throw new Error('No agents available for selection');
  }

  const queryLower = query.toLowerCase();

  // Simple keyword-based scoring
  const scoredAgents = agents.map((agent: any) => {
    let score = 0;
    const agentText = `${agent.display_name} ${agent.description} ${agent.key_expertise || ''} ${(agent.focus_areas || []).join(' ')}`.toLowerCase();

    // Check for keyword matches
    const keywords = queryLower.split(' ').filter((w: any) => w.length > 3);
    keywords.forEach(keyword => {
      if (agentText.includes(keyword)) {
        score += 10;
      }
    });

    // Prefer lower tier agents (they handle more queries)
    score += (4 - (agent.tier || 1)) * 5;

    return { agent, score };
  });

  // Sort by score
  scoredAgents.sort((a, b) => b.score - a.score);

  const topAgent = scoredAgents[0];
  const alternatives = scoredAgents.slice(1, 4);

  return {
    selectedAgent: topAgent.agent,
    confidence: Math.min(topAgent.score * 5, 95),
    reasoning: `Selected based on keyword matching: "${query}". This agent's expertise aligns with your query.`,
    alternativeAgents: alternatives,
    escalationPath: [`Tier ${topAgent.agent.tier || 1}: ${topAgent.agent.display_name}`],
    matchedCriteria: ['keyword matching'],
  };
}

// Cache agents for 5 minutes to reduce database calls
// Cloud-optimized agent loading
const CLOUD_OPTIMIZATION = {
  connectionPooling: true,
  retryAttempts: 3,
  timeoutMs: 10000,
  batchSize: 50
};
let agentsCache: { agents: Agent[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes - cloud optimized // 5 minutes

/**
 * Load all active agents from database (with caching)
 */
export async function loadAvailableAgents(): Promise<Agent[]> {
  // Create Supabase client inside the function to avoid build-time validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase configuration missing');
    return agentsCache?.agents || [];
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check cache first
  if (agentsCache && Date.now() - agentsCache.timestamp < CACHE_DURATION) {
    console.log('✅ Using cached agents');
    return agentsCache.agents;
  }

  // Only load agents with status 'active' or 'testing' (ready for use in chat/services)
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .in('status', ['active', 'testing'])
    .order('tier', { ascending: true });

  if (error) {
    console.error('❌ Failed to load agents:', error);
    return agentsCache?.agents || []; // Return stale cache if available
  }

  // Update cache
  agentsCache = {
    agents: data as Agent[],
    timestamp: Date.now(),
  };

  return data as Agent[];
}

/**
 * Generate streaming reasoning steps as the model evaluates agents
 */
export async function* streamAgentSelection(
  userQuery: string,
  currentAgent?: Agent,
  chatHistory?: Array<{ role: string; content: string }>
): AsyncGenerator<ReasoningStep> {

  yield {
    step: 'Loading available expert agents',
    details: 'Querying database for active agents...',
    timestamp: Date.now(),
  };

  const agents = await loadAvailableAgents();

  yield {
    step: `Evaluating ${agents.length} expert agents`,
    details: `Found agents across ${new Set(agents.map((a: any) => a.tier)).size} tiers`,
    timestamp: Date.now(),
  };

  yield {
    step: 'Analyzing query with reasoning model',
    details: 'Using GPT-4 to identify domain, complexity, and required expertise...',
    timestamp: Date.now(),
  };

  const result = await selectAgentWithReasoning(userQuery, agents, currentAgent, chatHistory);

  yield {
    step: `Selected: ${result.selectedAgent.display_name}`,
    details: `Confidence: ${result.confidence}% | Tier ${result.selectedAgent.tier} | ${result.reasoning}`,
    timestamp: Date.now(),
  };

  if (result.matchedCriteria.length > 0) {
    yield {
      step: 'Matched criteria',
      details: result.matchedCriteria.join(', '),
      timestamp: Date.now(),
    };
  }

  if (result.alternativeAgents.length > 0) {
    yield {
      step: 'Alternative agents identified',
      details: result.alternativeAgents
        .map(alt => `${alt.agent.display_name} (${alt.score}%)`)
        .join(', '),
      timestamp: Date.now(),
    };
  }
}
