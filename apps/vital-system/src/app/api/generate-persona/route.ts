import { NextRequest, NextResponse } from 'next/server';

// API Gateway URL for Python AI Engine
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.API_GATEWAY_URL || 'http://localhost:3001';

/**
 * POST /api/generate-persona
 * Generate role-based agent persona suggestions from organizational context
 */
export async function POST(request: NextRequest) {
  try {
    const { organization, intent, existingAgents } = await request.json();

    // Validate input
    if (!organization || !intent) {
      return NextResponse.json(
        { error: 'Organization context and intent are required' },
        { status: 400 }
      );
    }

    const { businessFunction, department, role } = organization;

    // Build the system instruction for persona generation
    const systemInstruction = `You are an expert AI Agent Designer for healthcare and pharmaceutical organizations.

Your task is to generate a comprehensive agent persona based on organizational context and user intent.

You must analyze:
1. **Business Function**: The high-level area of the organization
2. **Department**: The specific department within that function
3. **Role**: The specific role within that department
4. **Intent**: What the user wants the agent to do
5. **Existing Patterns**: Similar agents that exist (for consistency)

Based on this context, generate a complete agent persona that includes:

**Identity & Naming:**
- Agent Name: Professional, role-specific (e.g., "Clinical Trial Protocol Designer", "Regulatory Submission Specialist")
- Description: 1-2 sentences describing what the agent does
- Display Identity: How the agent introduces itself

**Classification:**
- Tier: 1 (Foundational), 2 (Specialist), or 3 (Expert) based on role complexity
- Status: usually "active" for new agents
- Priority: 1-10 based on criticality (regulatory = high, support = medium)

**Capabilities:**
- List 5-8 specific capabilities the agent should have
- Based on role requirements and industry best practices
- Include both domain-specific and general capabilities

**Architecture:**
- Architecture Pattern: REACTIVE (Tier 1), HYBRID (Tier 2), or DELIBERATIVE (Tier 3)
- Reasoning Method: DIRECT (simple), COT (chain of thought), or REACT (reasoning + action)
- Communication Tone: Professional, Empathetic, Technical, etc.
- Communication Style: Concise, Detailed, Conversational, Formal, etc.

**Mission & Value:**
- Primary Mission: Core purpose statement
- Value Proposition: Key benefit to users

**Tools & Knowledge:**
- Suggested tools based on role
- Knowledge domains relevant to the role

**Prompt Starters:**
- Generate 4-6 example prompts that users can click to start conversations with this agent
- Make them role-specific, practical, and representative of common tasks
- Format: { text: string, icon: string } where icon is an emoji like 📊, 📋, 🔍, 💡, ⚕️, 📈, etc.

Return a JSON object with all suggestions. Be specific and role-appropriate.`;

    const userPrompt = `Generate an agent persona for:

**Organizational Context:**
- Business Function: ${businessFunction}
- Department: ${department}
- Role: ${role}

**User Intent:**
"${intent}"

${existingAgents && existingAgents.length > 0 ? `
**Existing Similar Agents (for pattern reference):**
${existingAgents.map((a: any, i: number) => `
${i + 1}. ${a.name} (Tier ${a.tier})
   - ${a.description}
   - Capabilities: ${Array.isArray(a.capabilities) ? a.capabilities.join(', ') : 'N/A'}
`).join('\n')}
` : ''}

Please generate a complete agent persona that fits this organizational context and user intent.

Return ONLY a JSON object (no markdown, no explanations) with this structure:
{
  "agentName": "string",
  "description": "string",
  "tier": 1 | 2 | 3,
  "status": "active",
  "priority": number,
  "capabilities": ["string[]"],
  "architecturePattern": "REACTIVE" | "HYBRID" | "DELIBERATIVE",
  "reasoningMethod": "DIRECT" | "COT" | "REACT",
  "communicationTone": "string",
  "communicationStyle": "string",
  "primaryMission": "string",
  "valueProposition": "string",
  "tools": ["string[]"],
  "knowledgeDomains": ["string[]"],
  "promptStarters": [{"text": "string", "icon": "emoji"}],
  "reasoning": "Brief explanation of why these suggestions fit the role"
}`;

    // Call Python AI Engine via API Gateway
    const chatResponse = await fetch(`${API_GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244', // VITAL System tenant
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        model: 'gpt-4o',
        temperature: 0.8, // Slightly higher for creativity
        max_tokens: 2000,
        stream: false,
        // Note: response_format is not yet supported in our Python endpoint, but JSON response is default
      }),
    });

    if (!chatResponse.ok) {
      const errorData = await chatResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Chat completion failed: ${chatResponse.statusText}`);
    }

    const completion = await chatResponse.json();
    const responseContent = completion.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response (may need to handle markdown code blocks)
    let persona;
    try {
      // Try direct JSON parse first
      persona = JSON.parse(responseContent);
    } catch (e) {
      // If that fails, try extracting JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || responseContent.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        persona = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Add metadata
    const response = {
      ...persona,
      _meta: {
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model || 'gpt-4o',
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error generating persona:', error);

    // Handle specific errors
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded' },
        { status: 429 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 401 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate persona', details: error.message },
      { status: 500 }
    );
  }
}
