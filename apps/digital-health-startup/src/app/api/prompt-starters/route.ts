/**
 * API Route: Generate Prompt Starters for Selected Agents
 * Dynamically generates prompts based on agent expertise and category
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@vital/sdk/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Prompt templates by domain
const promptTemplates = {
  clinical_research: [
    { complexity: 'basic', text: 'What are the key considerations for designing a clinical trial?' },
    { complexity: 'intermediate', text: 'How can I optimize patient recruitment strategies for a Phase III trial?' },
    { complexity: 'advanced', text: 'Analyze the statistical power requirements for a multi-center randomized controlled trial' },
    { complexity: 'expert', text: 'Design an adaptive clinical trial protocol with Bayesian interim analysis' }
  ],
  regulatory_affairs: [
    { complexity: 'basic', text: 'What are the main FDA submission requirements for a new drug application?' },
    { complexity: 'intermediate', text: 'How should I structure a regulatory dossier for EU market authorization?' },
    { complexity: 'advanced', text: 'Develop a comprehensive regulatory strategy for orphan drug designation' },
    { complexity: 'expert', text: 'Design a global regulatory pathway for first-in-class therapy with companion diagnostic' }
  ],
  medical_affairs: [
    { complexity: 'basic', text: 'What is the role of medical affairs in pharmaceutical commercialization?' },
    { complexity: 'intermediate', text: 'How can I develop an effective medical science liaison (MSL) engagement strategy?' },
    { complexity: 'advanced', text: 'Create a comprehensive publication strategy for Phase III trial results' },
    { complexity: 'expert', text: 'Design an integrated evidence generation plan spanning real-world evidence' }
  ],
  general: [
    { complexity: 'basic', text: 'Help me understand the current trends in this field' },
    { complexity: 'intermediate', text: 'What are the best practices for strategic planning?' },
    { complexity: 'advanced', text: 'Analyze the strategic implications of recent regulatory changes' },
    { complexity: 'expert', text: 'Design a comprehensive strategy integrating clinical, regulatory, and commercial considerations' }
  ]
};

function getDomain(agent: any): string {
  const category = String(agent.category || '').toLowerCase();
  const expertise = String(agent.expertise || '').toLowerCase();
  const title = String(agent.title || '').toLowerCase();

  if (category.includes('clinical') || expertise.includes('clinical') || title.includes('clinical')) {
    return 'clinical_research';
  }
  if (category.includes('regulatory') || expertise.includes('regulatory') || title.includes('regulatory')) {
    return 'regulatory_affairs';
  }
  if (category.includes('medical') || expertise.includes('medical affairs') || title.includes('medical')) {
    return 'medical_affairs';
  }

  return 'general';
}

export async function POST(request: NextRequest) {
  try {
    const { agentIds } = await request.json();

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        { error: 'Agent IDs are required' },
        { status: 400 }
      );
    }

    // Fetch agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, title, expertise, category')
      .in('id', agentIds);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ prompts: [] });
    }

    // Generate prompts based on agents
    const prompts: any[] = [];
    const domains = new Set<string>();

    agents.forEach((agent: any) => {
      const domain = getDomain(agent);
      domains.add(domain);
      const templates = promptTemplates[domain as keyof typeof promptTemplates] || promptTemplates.general;

      templates.forEach((template, index) => {
        const agentTitle = agent.title || agent.name;
        prompts.push({
          id: `${agent.id}_${index}`,
          prompt_starter: template.text,
          name: `${agent.name}_prompt_${index + 1}`,
          display_name: `${template.complexity.charAt(0).toUpperCase()}${template.complexity.slice(1)}: ${agentTitle}`,
          description: `A ${template.complexity}-level prompt`,
          domain: domain,
          complexity_level: template.complexity
        });
      });
    });

    // Return up to 12 prompts
    const selectedPrompts = prompts.slice(0, 12);

    return NextResponse.json({
      prompts: selectedPrompts,
      agents: agents.map((a: any) => a.title || a.name),
      domains: Array.from(domains),
    });

  } catch (error) {
    console.error('Error in prompt-starters API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
