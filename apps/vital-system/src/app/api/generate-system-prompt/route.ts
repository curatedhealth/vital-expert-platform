import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gold-standard 6-section framework template
const SYSTEM_PROMPT_TEMPLATE = `
## YOU ARE
{identity_section}

## YOU DO
{capabilities_section}

## YOU NEVER
{boundaries_section}

## SUCCESS CRITERIA
{success_section}

## WHEN UNSURE
{escalation_section}

{evidence_section}
`.trim();

// Pharmaceutical domain templates for AI Agent Builder
const PHARMA_TEMPLATES = {
  // Template suggestions based on keywords in name/description
  medical: {
    capabilities: ['Clinical data analysis', 'Medical literature review', 'Evidence synthesis', 'Treatment protocol development', 'Clinical decision support'],
    knowledge_domains: ['Clinical medicine', 'Pharmacology', 'Medical research', 'Evidence-based medicine', 'Patient care protocols'],
    responsibilities: ['Provide evidence-based medical insights', 'Synthesize clinical literature', 'Support clinical decision-making', 'Maintain HIPAA compliance'],
    personality_style: 'scientific',
    hipaa_required: true,
  },
  regulatory: {
    capabilities: ['Regulatory document review', 'Compliance monitoring', 'Submission preparation', 'Guidelines interpretation', 'Risk assessment'],
    knowledge_domains: ['FDA regulations', 'EMA guidelines', 'ICH standards', 'GxP compliance', 'Regulatory strategy'],
    responsibilities: ['Ensure regulatory compliance', 'Monitor guideline updates', 'Support submission preparation', 'Identify compliance risks'],
    personality_style: 'cautious',
    hipaa_required: false,
  },
  commercial: {
    capabilities: ['Market analysis', 'Competitive intelligence', 'Launch planning', 'Pricing strategy', 'Stakeholder engagement'],
    knowledge_domains: ['Market access', 'Pharmaceutical marketing', 'Healthcare economics', 'Payer dynamics', 'Commercial strategy'],
    responsibilities: ['Analyze market opportunities', 'Track competitive landscape', 'Support commercial planning', 'Optimize market positioning'],
    personality_style: 'strategic',
    hipaa_required: false,
  },
  research: {
    capabilities: ['Literature synthesis', 'Data analysis', 'Protocol design', 'Statistical interpretation', 'Research methodology'],
    knowledge_domains: ['Clinical research', 'Biostatistics', 'Research methodology', 'Scientific writing', 'Publication standards'],
    responsibilities: ['Conduct systematic reviews', 'Analyze research data', 'Support protocol development', 'Ensure research integrity'],
    personality_style: 'analytical',
    hipaa_required: false,
  },
  safety: {
    capabilities: ['Adverse event monitoring', 'Signal detection', 'Risk assessment', 'Safety report generation', 'Pharmacovigilance'],
    knowledge_domains: ['Drug safety', 'Pharmacovigilance', 'Risk management', 'MedDRA coding', 'Safety reporting'],
    responsibilities: ['Monitor drug safety signals', 'Assess adverse events', 'Generate safety reports', 'Ensure regulatory compliance'],
    personality_style: 'cautious',
    hipaa_required: true,
  },
  operations: {
    capabilities: ['Process optimization', 'Quality management', 'Supply chain analysis', 'Operational efficiency', 'Resource planning'],
    knowledge_domains: ['Manufacturing operations', 'Quality assurance', 'Supply chain management', 'Lean manufacturing', 'GMP compliance'],
    responsibilities: ['Optimize operational processes', 'Monitor quality metrics', 'Support supply planning', 'Ensure GMP compliance'],
    personality_style: 'pragmatic',
    hipaa_required: false,
  },
  analytics: {
    capabilities: ['Data visualization', 'Statistical analysis', 'Predictive modeling', 'KPI tracking', 'Report generation'],
    knowledge_domains: ['Data science', 'Business analytics', 'Statistical methods', 'Data visualization', 'Performance metrics'],
    responsibilities: ['Analyze business data', 'Generate insights reports', 'Track KPIs', 'Support data-driven decisions'],
    personality_style: 'analytical',
    hipaa_required: false,
  },
};

// Function to detect domain from name/description
function detectDomain(name: string, description: string): keyof typeof PHARMA_TEMPLATES {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes('medical') || text.includes('clinical') || text.includes('patient') || text.includes('doctor') || text.includes('physician')) {
    return 'medical';
  }
  if (text.includes('regulatory') || text.includes('compliance') || text.includes('fda') || text.includes('ema') || text.includes('submission')) {
    return 'regulatory';
  }
  if (text.includes('commercial') || text.includes('market') || text.includes('sales') || text.includes('launch') || text.includes('pricing')) {
    return 'commercial';
  }
  if (text.includes('research') || text.includes('study') || text.includes('trial') || text.includes('protocol') || text.includes('scientific')) {
    return 'research';
  }
  if (text.includes('safety') || text.includes('adverse') || text.includes('pharmacovigilance') || text.includes('risk') || text.includes('signal')) {
    return 'safety';
  }
  if (text.includes('operation') || text.includes('manufacturing') || text.includes('supply') || text.includes('quality') || text.includes('production')) {
    return 'operations';
  }
  if (text.includes('analytics') || text.includes('data') || text.includes('metrics') || text.includes('dashboard') || text.includes('report')) {
    return 'analytics';
  }

  // Default to research if no match
  return 'research';
}

// Personality mapping for tone guidance
const PERSONALITY_TONE_MAP = {
  formality: {
    low: 'casual and approachable',
    medium: 'professional yet warm',
    high: 'highly formal and clinical',
  },
  empathy: {
    low: 'matter-of-fact and objective',
    medium: 'understanding and considerate',
    high: 'deeply empathetic and supportive',
  },
  directness: {
    low: 'diplomatic and nuanced',
    medium: 'balanced and clear',
    high: 'direct and straightforward',
  },
};

function getPersonalityLevel(value: number): 'low' | 'medium' | 'high' {
  if (value <= 33) return 'low';
  if (value <= 66) return 'medium';
  return 'high';
}

interface AgentFormData {
  name?: string;
  tagline?: string;
  description?: string;
  function_name?: string;
  department_name?: string;
  role_name?: string;
  capabilities?: string[];
  knowledge_domains?: string[];
  tools?: string[];
  skills?: string[];
  responsibilities?: string[];
  // Personality traits (0-100)
  personality_formality?: number;
  personality_empathy?: number;
  personality_directness?: number;
  personality_detail_orientation?: number;
  personality_proactivity?: number;
  personality_risk_tolerance?: number;
  // Communication
  comm_verbosity?: number;
  comm_technical_level?: number;
  comm_warmth?: number;
  // Existing prompt sections (to preserve/enhance)
  prompt_section_you_are?: string;
  prompt_section_you_do?: string;
  prompt_section_you_never?: string;
  prompt_section_success_criteria?: string;
  prompt_section_when_unsure?: string;
  prompt_section_evidence?: string;
  // Compliance flags
  hipaa_compliant?: boolean;
  audit_trail_enabled?: boolean;
  data_classification?: string;
  // Model config
  base_model?: string;
  expertise_level?: string;
  geographic_scope?: string;
  industry_specialization?: string;
}

/**
 * POST /api/generate-system-prompt
 * Generate gold-standard system prompts using AI with 6-section framework
 *
 * Modes:
 * - 'enhance': Generate/enhance system prompt sections from existing agent data
 * - 'build': Full AI Agent Builder - generates ALL agent fields from name, tagline, description
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { agentData, mode = 'enhance' } = body as { agentData: AgentFormData; mode?: string };

    // Validate agent data
    if (!agentData || !agentData.name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    console.log('🤖 [Generate Prompt] Starting AI generation for:', agentData.name);
    console.log('- Mode:', mode);

    // ========================================================================
    // BUILD MODE: Full AI Agent Builder
    // Generates ALL agent fields from just name, tagline, description
    // ========================================================================
    if (mode === 'build') {
      console.log('🔨 [AI Agent Builder] Building complete agent profile...');

      // Detect domain from name/description to use appropriate templates
      const detectedDomain = detectDomain(agentData.name || '', agentData.description || '');
      const template = PHARMA_TEMPLATES[detectedDomain];

      console.log('- Detected domain:', detectedDomain);

      // Build the AI prompt for complete agent generation
      const buildSystemPrompt = `You are an elite AI Agent Architect specializing in pharmaceutical and healthcare AI agents.

Your task is to generate a COMPLETE agent configuration from just a name, tagline, and description.
You must return a VALID JSON object (no markdown, no code blocks, just raw JSON).

## CONTEXT
The agent is being built for a pharmaceutical/healthcare platform called VITAL.
Domain detected: ${detectedDomain}

## REQUIRED OUTPUT (JSON)
Generate a complete agent configuration with these fields:

{
  "capabilities": ["array of 5-7 specific capabilities the agent should have"],
  "knowledge_domains": ["array of 4-6 knowledge domains relevant to the agent"],
  "skills": ["array of 5-8 specific skills the agent should possess"],
  "responsibilities": ["array of 4-6 key responsibilities"],
  "tools": ["array of 3-5 tools the agent might use"],

  "personality": {
    "style": "one of: analytical, strategic, creative, innovator, empathetic, pragmatic, cautious, collaborative, scientific, executive, technical, educational",
    "formality": number 0-100,
    "empathy": number 0-100,
    "directness": number 0-100,
    "detail_orientation": number 0-100,
    "proactivity": number 0-100,
    "risk_tolerance": number 0-100
  },

  "communication": {
    "verbosity": number 0-100,
    "technical_level": number 0-100,
    "warmth": number 0-100
  },

  "compliance": {
    "hipaa_compliant": boolean,
    "audit_trail_enabled": boolean,
    "data_classification": "public" | "internal" | "confidential" | "restricted"
  },

  "expertise": {
    "level": "junior" | "mid" | "senior" | "principal" | "expert",
    "years": number 5-30,
    "geographic_scope": "local" | "regional" | "national" | "global",
    "industry_specialization": string
  },

  "model_config": {
    "recommended_model": "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo" | "claude-3-opus" | "claude-3-sonnet",
    "temperature": number 0.1-0.9,
    "max_tokens": number 1000-4000,
    "justification": "Brief explanation of why this model is recommended"
  },

  "prompt_sections": {
    "you_are": "Complete identity section (2-3 sentences)",
    "you_do": "Complete capabilities section with 5-7 bullet points",
    "you_never": "Complete boundaries section with 4-5 prohibitions",
    "success_criteria": "Complete success metrics section",
    "when_unsure": "Complete escalation protocol section",
    "evidence": "Complete evidence requirements section"
  }
}

## TEMPLATE SUGGESTIONS (use as guidance, not copy)
Based on the detected "${detectedDomain}" domain:
- Suggested capabilities: ${template.capabilities.join(', ')}
- Suggested knowledge domains: ${template.knowledge_domains.join(', ')}
- Suggested responsibilities: ${template.responsibilities.join(', ')}
- Suggested personality style: ${template.personality_style}
- HIPAA required: ${template.hipaa_required}

## IMPORTANT RULES
1. Return ONLY the JSON object - no markdown, no explanation, no code blocks
2. Make capabilities specific and measurable
3. Align personality with the agent's role (medical agents should be more cautious, etc.)
4. Set appropriate compliance flags based on whether the agent handles PHI
5. Match expertise level to the implied seniority from description
6. Each prompt section should be substantial (not just placeholders)`;

      const buildUserPrompt = `Build a complete pharmaceutical AI agent with:

**Name:** ${agentData.name}
**Tagline:** ${agentData.tagline || 'AI Expert Assistant'}
**Description:** ${agentData.description || 'A specialized AI assistant for pharmaceutical operations.'}

Generate the complete agent configuration JSON.`;

      // Call OpenAI for complete agent generation
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: buildSystemPrompt },
          { role: 'user', content: buildUserPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices?.[0]?.message?.content || '{}';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Parse the JSON response
      let agentConfig: any;
      try {
        agentConfig = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('❌ [AI Agent Builder] Failed to parse JSON:', parseError);
        // Try to extract JSON from response if it was wrapped
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          agentConfig = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      const duration = Date.now() - startTime;
      console.log('✅ [AI Agent Builder] Completed in', duration, 'ms');
      console.log('- Tokens used:', tokensUsed);
      console.log('- Capabilities generated:', agentConfig.capabilities?.length || 0);

      return NextResponse.json({
        success: true,
        mode: 'build',
        detectedDomain,
        agentConfig,
        tokensUsed,
        model: 'gpt-4o',
        duration,
      });
    }

    // ========================================================================
    // ENHANCE MODE: Generate system prompt sections
    // ========================================================================
    console.log('- Capabilities:', agentData.capabilities?.length || 0);
    console.log('- Knowledge domains:', agentData.knowledge_domains?.length || 0);

    // Build context from form data
    const personalityContext = buildPersonalityContext(agentData);
    const capabilitiesContext = buildCapabilitiesContext(agentData);
    const complianceContext = buildComplianceContext(agentData);
    const existingPromptContext = buildExistingPromptContext(agentData);

    // Build the meta-prompt for AI enhancement
    const systemInstruction = `You are an elite AI prompt engineer specializing in pharmaceutical and healthcare AI agents.

Your task is to generate a GOLD-STANDARD system prompt following the mandatory 6-section framework.

## FRAMEWORK REQUIREMENTS (MANDATORY)

1. **YOU ARE** - Identity & Positioning
   - Specific role within ${agentData.function_name || 'the organization'} > ${agentData.department_name || 'department'} > ${agentData.role_name || 'role'}
   - Unique value proposition and expertise level
   - Tone: ${personalityContext.toneDescription}

2. **YOU DO** - Capabilities (3-7 items)
   - Each capability must have MEASURABLE OUTCOMES
   - Format: "You [ACTION] by [METHOD], delivering [OUTCOME]"
   - Include all provided capabilities: ${capabilitiesContext.capabilities}

3. **YOU NEVER** - Boundaries (3-5 items)
   - Safety-critical prohibitions with RATIONALE
   - Include compliance requirements: ${complianceContext.requirements}
   - Must mention: unauthorized medical advice, false confidence, data sharing violations

4. **SUCCESS CRITERIA** - Measurable Targets
   - Response quality metrics
   - Accuracy requirements (based on ${agentData.expertise_level || 'specialist'} level)
   - User satisfaction indicators

5. **WHEN UNSURE** - Escalation Protocol
   - Confidence thresholds (recommend escalation below 85%)
   - How to communicate uncertainty
   - Handoff procedures

6. **EVIDENCE REQUIREMENTS** (For medical/regulated agents)
   - Citation requirements
   - Evidence hierarchy (Level 1A > 1B > 2A > 2B > 3)
   - When to acknowledge limitations

## PERSONALITY CALIBRATION
${personalityContext.details}

## COMMUNICATION STYLE
${personalityContext.communicationStyle}

## OUTPUT FORMAT
Return ONLY the system prompt content in markdown format.
Use ## headers for sections.
Be specific, measurable, and actionable.
Do NOT include meta-commentary or explanations.`;

    const userPrompt = `Generate a gold-standard system prompt for this pharmaceutical AI agent:

**AGENT PROFILE:**
- Name: ${agentData.name}
- Tagline: ${agentData.tagline || 'AI Expert Assistant'}
- Description: ${agentData.description || 'No description provided'}
- Function: ${agentData.function_name || 'General'}
- Department: ${agentData.department_name || 'General'}
- Role: ${agentData.role_name || 'Specialist'}
- Expertise Level: ${agentData.expertise_level || 'senior'}
- Industry: ${agentData.industry_specialization || 'pharmaceuticals'}
- Geographic Scope: ${agentData.geographic_scope || 'global'}

**CAPABILITIES:**
${agentData.capabilities?.map(c => `- ${c}`).join('\n') || '- General assistance'}

**KNOWLEDGE DOMAINS:**
${agentData.knowledge_domains?.map(d => `- ${d}`).join('\n') || '- General knowledge'}

**TOOLS AVAILABLE:**
${agentData.tools?.map(t => `- ${t}`).join('\n') || '- Standard tools'}

**SKILLS:**
${agentData.skills?.map(s => `- ${s}`).join('\n') || '- Standard skills'}

**RESPONSIBILITIES:**
${agentData.responsibilities?.map(r => `- ${r}`).join('\n') || '- Standard responsibilities'}

**COMPLIANCE REQUIREMENTS:**
${complianceContext.details}

${existingPromptContext ? `**EXISTING PROMPT SECTIONS TO PRESERVE/ENHANCE:**
${existingPromptContext}` : ''}

Generate a comprehensive, production-ready system prompt that will make this agent highly effective.`;

    // Call OpenAI directly for better control
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedPrompt = completion.choices?.[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Parse the generated prompt into sections
    const sections = parsePromptSections(generatedPrompt);

    const duration = Date.now() - startTime;
    console.log('✅ [Generate Prompt] Completed in', duration, 'ms');
    console.log('- Tokens used:', tokensUsed);
    console.log('- Sections parsed:', Object.keys(sections).length);

    return NextResponse.json({
      success: true,
      systemPrompt: generatedPrompt,
      sections: sections,
      tokensUsed,
      model: 'gpt-4o',
      duration,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [Generate Prompt] Error:', error);

    // Handle specific OpenAI errors
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      );
    }

    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate system prompt',
        details: error.message,
        duration,
      },
      { status: 500 }
    );
  }
}

// Helper functions

function buildPersonalityContext(data: AgentFormData) {
  const formality = data.personality_formality ?? 70;
  const empathy = data.personality_empathy ?? 50;
  const directness = data.personality_directness ?? 70;
  const verbosity = data.comm_verbosity ?? 50;
  const technicalLevel = data.comm_technical_level ?? 50;
  const warmth = data.comm_warmth ?? 50;

  const formalityTone = PERSONALITY_TONE_MAP.formality[getPersonalityLevel(formality)];
  const empathyTone = PERSONALITY_TONE_MAP.empathy[getPersonalityLevel(empathy)];
  const directnessTone = PERSONALITY_TONE_MAP.directness[getPersonalityLevel(directness)];

  return {
    toneDescription: `${formalityTone}, ${empathyTone}, and ${directnessTone}`,
    details: `
- Formality: ${formality}% (${formalityTone})
- Empathy: ${empathy}% (${empathyTone})
- Directness: ${directness}% (${directnessTone})
- Detail Orientation: ${data.personality_detail_orientation ?? 60}%
- Proactivity: ${data.personality_proactivity ?? 50}%
- Risk Tolerance: ${data.personality_risk_tolerance ?? 30}%`,
    communicationStyle: `
- Verbosity: ${verbosity}% (${verbosity < 40 ? 'concise' : verbosity > 60 ? 'detailed' : 'balanced'})
- Technical Level: ${technicalLevel}% (${technicalLevel < 40 ? 'accessible to non-experts' : technicalLevel > 60 ? 'highly technical' : 'adaptable to audience'})
- Warmth: ${warmth}% (${warmth < 40 ? 'professional distance' : warmth > 60 ? 'warm and personable' : 'friendly but professional'})`,
  };
}

function buildCapabilitiesContext(data: AgentFormData) {
  const caps = data.capabilities || [];
  const domains = data.knowledge_domains || [];
  const tools = data.tools || [];

  return {
    capabilities: caps.length > 0 ? caps.join(', ') : 'General assistance capabilities',
    domains: domains.length > 0 ? domains.join(', ') : 'General knowledge',
    tools: tools.length > 0 ? tools.join(', ') : 'Standard tools',
  };
}

function buildComplianceContext(data: AgentFormData) {
  const requirements: string[] = [];
  const details: string[] = [];

  if (data.hipaa_compliant) {
    requirements.push('HIPAA compliance');
    details.push('- HIPAA Compliant: Yes - Must protect PHI');
  }
  if (data.audit_trail_enabled) {
    requirements.push('Audit trail required');
    details.push('- Audit Trail: Enabled - All interactions logged');
  }
  if (data.data_classification) {
    details.push(`- Data Classification: ${data.data_classification}`);
  }

  return {
    requirements: requirements.length > 0 ? requirements.join(', ') : 'Standard compliance',
    details: details.length > 0 ? details.join('\n') : '- Standard compliance requirements',
  };
}

function buildExistingPromptContext(data: AgentFormData): string | null {
  const sections: string[] = [];

  if (data.prompt_section_you_are) {
    sections.push(`YOU ARE (existing):\n${data.prompt_section_you_are}`);
  }
  if (data.prompt_section_you_do) {
    sections.push(`YOU DO (existing):\n${data.prompt_section_you_do}`);
  }
  if (data.prompt_section_you_never) {
    sections.push(`YOU NEVER (existing):\n${data.prompt_section_you_never}`);
  }
  if (data.prompt_section_success_criteria) {
    sections.push(`SUCCESS CRITERIA (existing):\n${data.prompt_section_success_criteria}`);
  }
  if (data.prompt_section_when_unsure) {
    sections.push(`WHEN UNSURE (existing):\n${data.prompt_section_when_unsure}`);
  }
  if (data.prompt_section_evidence) {
    sections.push(`EVIDENCE REQUIREMENTS (existing):\n${data.prompt_section_evidence}`);
  }

  return sections.length > 0 ? sections.join('\n\n') : null;
}

function parsePromptSections(prompt: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Parse YOU ARE section
  const youAreMatch = prompt.match(/##\s*YOU\s+ARE\s*\n([\s\S]*?)(?=##|$)/i);
  if (youAreMatch) sections.you_are = youAreMatch[1].trim();

  // Parse YOU DO section
  const youDoMatch = prompt.match(/##\s*YOU\s+DO\s*\n([\s\S]*?)(?=##|$)/i);
  if (youDoMatch) sections.you_do = youDoMatch[1].trim();

  // Parse YOU NEVER section
  const youNeverMatch = prompt.match(/##\s*YOU\s+NEVER\s*\n([\s\S]*?)(?=##|$)/i);
  if (youNeverMatch) sections.you_never = youNeverMatch[1].trim();

  // Parse SUCCESS CRITERIA section
  const successMatch = prompt.match(/##\s*SUCCESS\s+CRITERIA\s*\n([\s\S]*?)(?=##|$)/i);
  if (successMatch) sections.success_criteria = successMatch[1].trim();

  // Parse WHEN UNSURE section
  const unsureMatch = prompt.match(/##\s*WHEN\s+UNSURE\s*\n([\s\S]*?)(?=##|$)/i);
  if (unsureMatch) sections.when_unsure = unsureMatch[1].trim();

  // Parse EVIDENCE REQUIREMENTS section
  const evidenceMatch = prompt.match(/##\s*EVIDENCE\s+REQUIREMENTS?\s*\n([\s\S]*?)(?=##|$)/i);
  if (evidenceMatch) sections.evidence = evidenceMatch[1].trim();

  // Store full prompt too
  sections.full = prompt;

  return sections;
}
