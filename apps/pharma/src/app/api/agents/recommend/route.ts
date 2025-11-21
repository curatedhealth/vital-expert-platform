import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.AI_ENGINE_URL ||
  'http://localhost:3001'; // Default to API Gateway

/**
 * Step 1: Detect knowledge domains from query
 * Uses keyword matching for fast domain detection
 */
function detectKnowledgeDomains(query: string): string[] {
  const keywords = query.toLowerCase();
  const detected: string[] = [];

  // Regulatory Affairs
  if (/fda|ema|regulatory|approval|submission|510k|pma|premarket|clearance/i.test(keywords)) {
    detected.push('regulatory_affairs');
  }

  // Clinical Development
  if (/clinical|trial|study|patient|treatment|protocol|endpoint|adverse event/i.test(keywords)) {
    detected.push('clinical_development');
  }

  // Pharmacovigilance & Safety
  if (/safety|adverse|side effect|pharmacovigilance|monitoring|susar/i.test(keywords)) {
    detected.push('pharmacovigilance');
  }

  // Digital Health
  if (/digital|software|samd|app|mobile health|telehealth|remote monitoring/i.test(keywords)) {
    detected.push('digital_health');
  }

  // Market Access & Reimbursement
  if (/reimbursement|payer|market access|pricing|heor|health economics/i.test(keywords)) {
    detected.push('market_access');
  }

  // Quality & Compliance
  if (/quality|gmp|qms|iso|compliance|validation|hipaa/i.test(keywords)) {
    detected.push('quality_compliance');
  }

  // Medical Affairs
  if (/medical affair|scientific|publication|kol|advisory board/i.test(keywords)) {
    detected.push('medical_affairs');
  }

  // If no specific domain detected, use general
  if (detected.length === 0) {
    detected.push('general');
  }

  return detected;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Query:', query);

    // Step 1: Detect knowledge domains (fast keyword-based)
    const detectedDomains = detectKnowledgeDomains(query);
    console.log('🎯 Detected domains:', detectedDomains);

    // Step 2: Get ALL active agents for GPT-4 ranking
    // Note: knowledge_domains in DB contains descriptive strings like "FDA regulations"
    // So we'll let GPT-4 do the semantic matching instead of .overlaps()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, display_name, description, capabilities, tier, system_prompt, avatar, knowledge_domains, model')
      .eq('status', 'active')
      .lte('tier', 3) // Only active tiers
      .order('tier', { ascending: false }) // Tier 3 (highest) first
      .order('priority', { ascending: true }) // Then by priority
      .limit(20); // Limit candidates for GPT-4 ranking

    if (error) {
      console.error('❌ Error fetching agents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    if (!agents || agents.length === 0) {
      console.warn('⚠️ No agents found');

      // Fallback: Get any active agents
      const { data: fallbackAgents } = await supabase
        .from('agents')
        .select('id, name, display_name, description, capabilities, tier, system_prompt, avatar, model, knowledge_domains')
        .eq('status', 'active')
        .order('tier', { ascending: false })
        .limit(5);

      if (fallbackAgents && fallbackAgents.length > 0) {
        // Return top 2-3 agents even as fallback
        const topAgents = fallbackAgents.slice(0, Math.min(3, fallbackAgents.length));
        const recommendations = topAgents.map((agent, index) => ({
          agentId: agent.id,
          score: 90 - (index * 5),
          reasoning: index === 0 ? 'Highest tier general expert' : `Tier ${agent.tier} specialist`
        }));

        return NextResponse.json({
          success: true,
          agents: topAgents,
          recommendations,
          reasoning: 'Using top tier agents as fallback',
          detectedDomains,
          complexity: 'simple',
        });
      }

      return NextResponse.json(
        { error: 'No agents available' },
        { status: 404 }
      );
    }

    console.log(`✅ Found ${agents.length} candidate agents`);

    // Step 3: Use GPT-4 for semantic ranking (RAG)
    const agentList = agents.map((agent: any) => ({
      id: agent.id,
      name: agent.display_name || agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      tier: agent.tier,
      domains: agent.knowledge_domains,
    }));

    const systemPrompt = `You are an intelligent agent selector for a digital health AI system.
Your task is to analyze the user's query and rank the candidate agents by relevance.

IMPORTANT: Always recommend at least 2-3 agents so the user can choose.

Detected knowledge domains: ${detectedDomains.join(', ')}

Available candidate agents:
${JSON.stringify(agentList, null, 2)}

Agent Tiers:
- Tier 3: Ultra-specialized experts with deep domain knowledge (highest priority)
- Tier 2: Specialized experts with focused expertise
- Tier 1: General experts with broad knowledge

Ranking Criteria:
1. Domain alignment: Does the agent's knowledge domains match the query?
2. Capability match: Does the agent have the right capabilities?
3. Tier priority: Higher tier agents are more specialized
4. Diversity: Provide different perspectives when possible

Respond with a JSON object containing:
- "recommendations": Array of AT LEAST 2-3 objects with {agentId, score (0-100), reasoning}
- "complexity": "simple" | "moderate" | "complex"

Example:
{
  "recommendations": [
    {"agentId": "abc-123", "score": 95, "reasoning": "Best match - Primary expert in FDA 510(k) submissions with 15+ years experience"},
    {"agentId": "def-456", "score": 85, "reasoning": "Strong alternative - Specializes in clinical data requirements for device submissions"},
    {"agentId": "ghi-789", "score": 75, "reasoning": "Good option - Regulatory strategy expert with cross-functional perspective"}
  ],
  "complexity": "moderate"
}`;

    // Call Python AI Engine via API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query: "${query}"\n\nRank these agents and recommend the top 2-3 best matches for the user to choose from.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Gateway error: ${response.status} ${response.statusText}`);
    }

    const completion = await response.json();
    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(responseText);
    console.log('🤖 GPT-4 recommendations:', result);

    // Extract top recommended agents - Always return 2-3 for user choice
    const recommendedAgentIds = (result.recommendations || [])
      .sort((a: any, b: any) => b.score - a.score) // Sort by score descending
      .slice(0, Math.min(3, agents.length)) // Take top 3 (or fewer if less available)
      .map((r: any) => r.agentId);

    // Get full agent details in order of recommendation
    const recommendedAgents = recommendedAgentIds
      .map((id: string) => agents.find((agent: any) => agent.id === id))
      .filter(Boolean);

    // If we got less than 2 recommendations, add more agents
    if (recommendedAgents.length < 2 && agents.length >= 2) {
      const additionalAgents = agents
        .filter((agent: any) => !recommendedAgentIds.includes(agent.id))
        .slice(0, 2 - recommendedAgents.length);
      recommendedAgents.push(...additionalAgents);
    }

    // If no agents recommended or all invalid IDs, fall back to highest tier
    if (recommendedAgents.length === 0) {
      console.warn('⚠️ No valid agent recommendations, using fallback');
      const fallbackAgents = agents.slice(0, Math.min(3, agents.length));
      const fallbackRecommendations = fallbackAgents.map((agent, index) => ({
        agentId: agent.id,
        score: 90 - (index * 5),
        reasoning: index === 0 ? 'Highest tier expert' : `Tier ${agent.tier} specialist`
      }));

      return NextResponse.json({
        success: true,
        agents: fallbackAgents,
        recommendations: fallbackRecommendations,
        reasoning: 'Using top tier agents as fallback',
        detectedDomains,
        complexity: result.complexity || 'simple',
      });
    }

    console.log(`✅ Recommended ${recommendedAgents.length} agent(s):`,
      recommendedAgents.map((a: any) => a.display_name || a.name));

    return NextResponse.json({
      success: true,
      agents: recommendedAgents,
      recommendations: result.recommendations,
      complexity: result.complexity,
      suggestPanel: result.suggestPanel,
      detectedDomains,
    });

  } catch (error) {
    console.error('Error recommending agents:', error);
    return NextResponse.json(
      {
        error: 'Failed to recommend agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
