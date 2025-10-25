import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * POST /api/generate-system-prompt
 * Generate or optimize system prompts using AI
 */
export async function POST(request: NextRequest) {
  try {
    const { agentData, mode = 'optimize' } = await request.json();

    // Validate agent data
    if (!agentData || !agentData.identity) {
      return NextResponse.json(
        { error: 'Invalid agent data provided' },
        { status: 400 }
      );
    }

    // Build the prompt for the LLM
    const systemInstruction = `You are an expert at crafting system prompts for AI agents in healthcare and pharmaceutical industries.

Your task is to create a comprehensive, well-structured system prompt that will guide an AI agent's behavior.

Requirements:
1. **Clear Identity**: Define who the agent is and what they do
2. **Organizational Context**: Include business function, department, and role
3. **Architecture & Reasoning**: Specify reasoning methods and communication style
4. **Capabilities**: List all agent capabilities clearly
5. **Medical Compliance**: Detail all regulatory requirements and standards
6. **Safety Rules**: Enforce prohibitions, mandatory protections, and confidence thresholds
7. **Knowledge & Tools**: List available knowledge domains and tools
8. **Success Criteria**: Define clear performance metrics

The prompt should be:
- **Clear and unambiguous** - No room for misinterpretation
- **Professionally structured** - Use headers, bullet points, and clear sections
- **Optimized for LLM comprehension** - Natural language that LLMs understand well
- **Free of redundancy** - Concise while comprehensive
- **Actionable** - Include specific directives and constraints

Return ONLY the generated system prompt text in markdown format. Do not include explanations or meta-commentary.`;

    const userPrompt = `Generate a system prompt for the following AI agent:

**Agent Data:**
\`\`\`json
${JSON.stringify(agentData, null, 2)}
\`\`\`

Mode: ${mode === 'optimize' ? 'Optimize for clarity and LLM comprehension' : 'Generate from scratch'}

Please create a comprehensive system prompt that incorporates all the provided information.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-4-turbo-preview', 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const systemPrompt = completion.choices[0].message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const model = completion.model;

    return NextResponse.json({
      systemPrompt,
      tokensUsed,
      model,
      success: true
    });

  } catch (error: any) {
    console.error('Error generating system prompt:', error);

    // Handle specific OpenAI errors
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate system prompt', details: error.message },
      { status: 500 }
    );
  }
}
