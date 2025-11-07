/**
 * API Route: Compose Dynamic Agent Prompt
 * 
 * TAG: DYNAMIC_PROMPT_API
 * 
 * Composes enhanced system prompts from all agent dimensions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/services/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, agent_data } = body;

    if (!agent_id && !agent_data) {
      return NextResponse.json(
        { error: 'agent_id or agent_data required' },
        { status: 400 }
      );
    }

    // Get agent data from Supabase if not provided
    let agentInfo = agent_data;
    
    if (!agentInfo && agent_id) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agent_id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }

      agentInfo = data;
    }

    // Compose enhanced prompt
    const result = composeAgentPrompt(agentInfo);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error composing agent prompt:', error);
    return NextResponse.json(
      { error: 'Failed to compose prompt' },
      { status: 500 }
    );
  }
}

function composeAgentPrompt(agentData: any) {
  const basePrompt = agentData.system_prompt || '';
  
  // Compose sections
  const sections = {
    identity: composeIdentity(agentData),
    capabilities: composeCapabilities(agentData),
    tools: composeTools(agentData),
    knowledge: composeKnowledge(agentData),
    guidelines: composeGuidelines(agentData),
    behavior: composeBehavior(agentData)
  };

  // Render enhanced prompt
  const enhancedPrompt = renderEnhancedPrompt(basePrompt, sections);

  return {
    base_prompt: basePrompt,
    enhanced_prompt: enhancedPrompt,
    sections,
    metadata: {
      agent_id: agentData.id,
      agent_name: agentData.name,
      composed_at: new Date().toISOString()
    }
  };
}

function composeIdentity(agentData: any): string {
  const role = agentData.display_name || agentData.name || 'AI Assistant';
  const description = agentData.description || '';
  const expertise = agentData.knowledge_domains || [];

  const parts = [`You are **${role}**.`];

  if (description) {
    parts.push(description);
  }

  if (expertise.length > 0) {
    parts.push(`\n**Areas of Expertise:** ${expertise.join(', ')}`);
  }

  return parts.join(' ');
}

function composeCapabilities(agentData: any): string {
  const capabilities = agentData.capabilities || [];
  const specializations = agentData.specializations || [];

  if (capabilities.length === 0 && specializations.length === 0) {
    return '';
  }

  const parts = ['## Capabilities\n\n**Core Skills:**'];

  if (capabilities.length > 0) {
    parts.push(capabilities.map((cap: string) => `- ${cap}`).join('\n'));
  }

  if (specializations.length > 0) {
    parts.push('\n\n**Specializations:**');
    parts.push(specializations.map((spec: string) => `- ${spec}`).join('\n'));
  }

  return parts.join('\n');
}

function composeTools(agentData: any): string {
  const tools = agentData.tool_configurations || {};

  if (!tools || (typeof tools === 'object' && Object.keys(tools).length === 0)) {
    return '';
  }

  const parts = ['## Available Tools\n'];

  if (typeof tools === 'object' && !Array.isArray(tools)) {
    for (const [toolName, toolConfig] of Object.entries(tools)) {
      const config = toolConfig as any;
      parts.push(`- **${toolName}**: ${config?.description || 'Available for use'}`);
    }
  } else if (Array.isArray(tools)) {
    for (const tool of tools) {
      if (typeof tool === 'object') {
        parts.push(`- **${tool.name || 'Tool'}**: ${tool.description || ''}`);
      } else {
        parts.push(`- ${tool}`);
      }
    }
  }

  return parts.join('\n');
}

function composeKnowledge(agentData: any): string {
  const ragEnabled = agentData.rag_enabled !== false;
  const domains = agentData.knowledge_domains || [];
  const sources = agentData.knowledge_sources || {};

  if (!ragEnabled) {
    return '';
  }

  const parts = ['## Knowledge Base\n'];
  parts.push('You have access to a comprehensive knowledge base.');

  if (domains.length > 0) {
    parts.push(`\n**Primary Domains:** ${domains.join(', ')}`);
  }

  if (sources && typeof sources === 'object' && Object.keys(sources).length > 0) {
    parts.push(`\n**Data Sources:** ${Object.keys(sources).join(', ')}`);
  }

  parts.push('\n\n**Citation Policy:** Always cite sources using [1], [2], etc. format.');

  return parts.join('\n');
}

function composeGuidelines(agentData: any): string {
  const parts = ['## Guidelines\n'];
  let hasContent = false;

  // Compliance
  const compliance = [];
  if (agentData.hipaa_compliant) compliance.push('HIPAA');
  if (agentData.gdpr_compliant) compliance.push('GDPR');

  if (compliance.length > 0) {
    parts.push(`**Compliance:** Must adhere to ${compliance.join(', ')} standards.`);
    hasContent = true;
  }

  // Regulatory context
  const regContext = agentData.regulatory_context || {};
  if (regContext.is_regulated) {
    parts.push('**Regulatory:** This agent operates in a regulated environment.');
    hasContent = true;
  }

  // Evidence requirements
  if (agentData.evidence_required) {
    parts.push('**Evidence:** All claims must be supported by evidence and citations.');
    hasContent = true;
  }

  return hasContent ? parts.join('\n') : '';
}

function composeBehavior(agentData: any): string {
  const responseFormat = agentData.response_format || 'markdown';

  const parts = ['## Response Style\n'];
  parts.push(`- **Format:** ${responseFormat}`);
  parts.push('- **Reasoning:** Provide step-by-step reasoning');
  parts.push('- **Tone:** Professional and evidence-based');

  return parts.join('\n');
}

function renderEnhancedPrompt(basePrompt: string, sections: Record<string, string>): string {
  const parts = [];

  // Start with base prompt if provided
  if (basePrompt) {
    parts.push('# System Prompt\n');
    parts.push(basePrompt);
    parts.push('\n---\n');
  }

  // Add sections
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (sectionContent) {
      parts.push(sectionContent);
      parts.push('\n');
    }
  }

  return parts.join('\n');
}

