/**
 * Intelligent Agent Router
 *
 * Uses OpenAI's reasoning capabilities to analyze user queries and select
 * the most appropriate agent from the available pool based on:
 * - Query content and domain
 * - Agent expertise and capabilities
 * - Confidence scoring
 * - Escalation path determination
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  // Build agent context for the reasoning model
  const agentContext = availableAgents.map(agent => ({
    id: agent.id,
    name: agent.display_name,
    description: agent.description,
    tier: agent.tier,
    domain: agent.domain || 'general',
    expertise: agent.key_expertise || agent.description,
    capabilities: agent.capabilities || [],
    focus_areas: agent.focus_areas || [],
    expert_level: agent.expert_level || 'specialist',
  }));

  // Create reasoning prompt for agent selection (optimized for speed)
  const systemPrompt = `You are an intelligent agent router. Analyze queries and select the best expert agent.

Agents:
${JSON.stringify(agentContext, null, 2)}

Respond in JSON:
{
  "selectedAgentId": "agent-id",
  "confidence": 95,
  "reasoning": "Brief reason",
  "alternatives": [{"agentId": "alt-1", "score": 85}],
  "escalationPath": ["Tier X: Agent Name"],
  "matchedCriteria": ["keyword1", "keyword2"]
}`;

  const userPrompt = `Query: "${userQuery}"

Select best agent.`;

  try {
    // Call OpenAI with faster model
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Faster than GPT-4
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500, // Limit response size for speed
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(response);

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
      const agent = availableAgents.find(a => a.id === alt.agentId);
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
  const scoredAgents = agents.map(agent => {
    let score = 0;
    const agentText = `${agent.display_name} ${agent.description} ${agent.key_expertise || ''} ${(agent.focus_areas || []).join(' ')}`.toLowerCase();

    // Check for keyword matches
    const keywords = queryLower.split(' ').filter(w => w.length > 3);
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
let agentsCache: { agents: Agent[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load all active agents from database (with caching)
 */
export async function loadAvailableAgents(): Promise<Agent[]> {
  // Check cache first
  if (agentsCache && Date.now() - agentsCache.timestamp < CACHE_DURATION) {
    console.log('✅ Using cached agents');
    return agentsCache.agents;
  }

  const { data, error } = await supabase
    .from('agents')
    .select('*')
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
    details: `Found agents across ${new Set(agents.map(a => a.tier)).size} tiers`,
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
