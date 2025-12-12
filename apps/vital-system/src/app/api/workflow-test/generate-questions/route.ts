import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/workflow-test/generate-questions
 * Generate AI-powered question suggestions based on workflow structure
 */
export async function POST(request: NextRequest) {
  try {
    const { nodes, edges, panelType, openai_api_key } = await request.json();

    // Validate input
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Nodes array is required' },
        { status: 400 }
      );
    }

    if (!openai_api_key) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openai_api_key,
    });

    // Extract workflow metadata
    const agentNames: string[] = [];
    const nodeTypes: string[] = [];
    const agentIds: string[] = [];

    nodes.forEach((node: any) => {
      const nodeData = node.data || {};
      const nodeType = node.type || nodeData.type;
      
      // Collect node types
      if (nodeType && !nodeTypes.includes(nodeType)) {
        nodeTypes.push(nodeType);
      }

      // Extract agent information
      const agentId = nodeData.config?.agentId || nodeData.agentId || nodeData.agent?.id;
      const agentName = nodeData.agentName || nodeData.agent?.name || nodeData.label;
      
      if (agentId && !agentIds.includes(agentId)) {
        agentIds.push(agentId);
      }
      
      if (agentName && typeof agentName === 'string' && !agentNames.includes(agentName)) {
        agentNames.push(agentName);
      }

      // Check for expert nodes
      if (nodeData.task?.id === 'expert_agent' || nodeType === 'expert_agent' || nodeType === 'agent') {
        const expertName = nodeData.label || agentName || 'Expert Agent';
        if (!agentNames.includes(expertName)) {
          agentNames.push(expertName);
        }
      }
    });

    // Build context string
    const contextParts: string[] = [];
    
    if (panelType) {
      contextParts.push(`Panel Type: ${panelType}`);
    }
    
    if (agentNames.length > 0) {
      contextParts.push(`Agents/Experts: ${agentNames.join(', ')}`);
    }
    
    if (nodeTypes.length > 0) {
      contextParts.push(`Node Types: ${nodeTypes.join(', ')}`);
    }
    
    if (edges && edges.length > 0) {
      contextParts.push(`Workflow has ${edges.length} connections between nodes`);
    }

    const workflowContext = contextParts.join('\n');

    // Build the prompt for question generation
    const systemPrompt = `You are an expert at generating discussion questions for expert panels in healthcare and pharmaceutical domains.

Your task is to generate 6-10 discussion questions that experts/agents in a workflow would debate, analyze, or provide perspectives on.

Guidelines:
- Questions should be relevant to the agents/expertise in the workflow
- Questions should match the panel type (e.g., regulatory questions for regulatory panels)
- Questions should be thought-provoking and suitable for multi-expert discussion
- Questions should allow different perspectives and expert opinions
- Questions should be specific enough to generate meaningful expert responses
- Make questions realistic and industry-appropriate
- Return your response as a JSON object with a "questions" array, or as a plain JSON array

Example JSON format:
{"questions": ["Question 1?", "Question 2?", "Question 3?"]}
OR
["Question 1?", "Question 2?", "Question 3?"]`;

    const userPrompt = `Generate 6-10 discussion questions that experts would debate or provide perspectives on:

${workflowContext}

${panelType ? `This is a ${panelType} panel workflow where multiple experts will discuss these questions.` : 'This is a general workflow with multiple experts.'}

Generate questions that would lead to meaningful expert discussions and diverse perspectives.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
      // Don't force JSON format - let it return natural text that we'll parse
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response - LLM may return JSON or plain text
    let questions: string[] = [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(responseContent);
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (typeof parsed === 'object') {
        // Try to find questions in object values
        const values = Object.values(parsed).flat();
        questions = values.filter((v): v is string => typeof v === 'string' && v.includes('?'));
      }
    } catch (parseError) {
      // Not JSON - parse as plain text
      const lines = responseContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Extract questions (lines ending with ? or containing ?)
      questions = lines
        .map(line => {
          // Remove list markers and quotes
          return line
            .replace(/^[-*•\d.]+\s*/, '')
            .replace(/^["']|["']$/g, '')
            .trim();
        })
        .filter(line => {
          const hasQuestion = line.includes('?');
          const isLongEnough = line.length > 15;
          return hasQuestion && isLongEnough;
        });
    }

    // Ensure we have valid questions
    if (questions.length === 0) {
      // Fallback questions based on context
      questions = [
        'What are the key considerations for this topic?',
        'What are the main challenges and opportunities?',
        'What are the best practices and recommendations?',
        'What are the potential risks and mitigation strategies?',
      ];
      
      if (agentNames.length > 0) {
        questions = [
          `What perspectives would ${agentNames[0]} provide on this topic?`,
          `How would ${agentNames.join(' and ')} approach this challenge?`,
          `What are the key recommendations from ${agentNames[0]}?`,
          `What are the critical factors ${agentNames[0]} would consider?`,
        ];
      }
    }

    // Limit to 10 questions max
    questions = questions.slice(0, 10);

    return NextResponse.json({
      success: true,
      questions,
      context: {
        agentCount: agentNames.length,
        nodeCount: nodes.length,
        panelType,
      },
    });

  } catch (error: any) {
    console.error('[Generate Questions API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate questions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

