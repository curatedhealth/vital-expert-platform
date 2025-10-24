import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { createAutonomousAgent, executeAutonomousQuery } from '@/features/chat/agents/autonomous-expert-agent';
import { createAutoLearningMemory } from '@/features/chat/memory/long-term-memory';



/**
 * POST /api/chat/autonomous
 * Autonomous Expert Agent API Endpoint
 *
 * Features:
 * - Full LangChain agent with tools, retrievers, parsers
 * - Long-term memory across all sessions
 * - Auto-learning from conversations
 * - Streaming support
 * - Token tracking and budget enforcement
 * - Structured output parsing
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      message,
      agent,
      userId,
      sessionId,
      model,
      chatHistory = [],
      options = {},
    } = body;

    // Validate required fields
    if (!message || !agent || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, agent, userId, sessionId' },
        { status: 400 }
      );
    }

    // Check user budget before executing
    const { data: budgetCheck, error: budgetError } = await supabase.rpc('check_user_budget', {
      p_user_id: userId,
      p_estimated_cost: 0.5, // Estimated cost for autonomous agent call
    });

    if (budgetError) {
      console.warn('Budget check failed, allowing request to proceed:', budgetError);
      // Don't block request if budget check fails - allow it to proceed
    } else if (!budgetCheck?.allowed) {
      return NextResponse.json(
        {
          error: 'Budget exceeded',
          message: budgetCheck?.message || 'Monthly budget limit reached',
          budgetStatus: budgetCheck,
        },
        { status: 429 }
      );
    }

    // Initialize long-term memory (only for valid UUID format - Supabase requirement)
    // UUID regex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = userId && uuidRegex.test(userId);

    const autoLearning = isValidUUID
      ? createAutoLearningMemory(userId, options.enableLearning !== false)
      : null;

    if (!isValidUUID && userId) {
      console.warn(`⚠️  Long-term memory disabled: userId "${userId}" is not a valid UUID. Database requires UUID format.`);
    }

    // Get personalized context from long-term memory if available
    let personalizedContext = null;
    if (autoLearning) {
      try {
        personalizedContext = await autoLearning.getEnhancedContext(message);
      } catch (memoryError) {
        console.warn('Failed to load long-term memory context:', memoryError);
        personalizedContext = null;
      }
    }

    // Provide default empty context if personalized context is null
    const contextToUse = personalizedContext || {
      contextSummary: '',
      relevantFacts: [],
      activeProjects: [],
      activeGoals: [],
    };

    if (personalizedContext) {
      console.log('🧠 Long-term memory context:', {
        factsCount: personalizedContext.relevantFacts.length,
        projectsCount: personalizedContext.activeProjects.length,
        goalsCount: personalizedContext.activeGoals.length,
      });
    } else {
      console.log('⚠️  Long-term memory disabled (invalid userId or error)');
    }

    // Handle streaming vs non-streaming
    if (options.stream) {
      return handleStreamingResponse(
        message,
        agent,
        userId,
        sessionId,
        contextToUse,
        autoLearning,
        options
      );
    } else {
      return handleNonStreamingResponse(
        message,
        agent,
        userId,
        sessionId,
        contextToUse,
        autoLearning,
        { ...options, model }
      );
    }
  } catch (error: any) {
    console.error('Autonomous agent error:', error);

    return NextResponse.json(
      {
        error: 'Agent execution failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Non-Streaming Response
 */
async function handleNonStreamingResponse(
  message: string,
  agent: any,
  userId: string,
  sessionId: string,
  personalizedContext: any,
  autoLearning: any,
  options: any
) {
  // Enhance message with personalized context
  const enhancedMessage = `${personalizedContext.contextSummary}\n\nUser Query: ${message}`;

  // Execute autonomous agent
  const result = await executeAutonomousQuery(
    enhancedMessage,
    agent.id,
    userId,
    sessionId,
    {
      enableRAG: options.enableRAG !== false,
      retrievalStrategy: options.retrievalStrategy || 'rag_fusion',
      memoryStrategy: options.memoryStrategy || 'research',
      outputFormat: options.outputFormat || 'text',
      maxIterations: options.maxIterations || 10,
      temperature: options.temperature,
    }
  );

  // Auto-learn from conversation (background)
  autoLearning.processConversationTurn(message, result.output).catch(console.error);

  // Save to chat messages
  await saveChatMessages(sessionId, userId, agent.id, message, result.output);

  return NextResponse.json({
    success: true,
    response: result.output,
    parsedOutput: result.parsedOutput,
    sources: result.sources,
    intermediateSteps: result.intermediateSteps,
    tokenUsage: result.tokenUsage,
    personalizedContext: {
      factsUsed: personalizedContext.relevantFacts.length,
      activeProjects: personalizedContext.activeProjects.length,
      activeGoals: personalizedContext.activeGoals.length,
    },
  });
}

/**
 * Handle Streaming Response
 */
async function handleStreamingResponse(
  message: string,
  agent: any,
  userId: string,
  sessionId: string,
  personalizedContext: any,
  autoLearning: any,
  options: any
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start streaming in background
  (async () => {
    try {
      // Send initial context
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'context',
            data: {
              factsCount: personalizedContext.relevantFacts.length,
              projectsCount: personalizedContext.activeProjects.length,
              goalsCount: personalizedContext.activeGoals.length,
            },
          })}\n\n`
        )
      );

      // Enhance message with context
      const enhancedMessage = `${personalizedContext.contextSummary}\n\nUser Query: ${message}`;

      // Fetch agent profile
      const { data: agentProfile } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agent.id)
        .single();

      // Create autonomous agent
      const autonomousAgent = await createAutonomousAgent({
        agentId: agent.id,
        userId,
        sessionId,
        agentProfile,
        enableRAG: options.enableRAG !== false,
        retrievalStrategy: options.retrievalStrategy || 'rag_fusion',
        memoryStrategy: options.memoryStrategy || 'research',
        outputFormat: options.outputFormat || 'text',
        maxIterations: options.maxIterations || 10,
        temperature: options.temperature,
      });

      // Stream execution
      let fullOutput = '';
      for await (const chunk of autonomousAgent.stream(enhancedMessage)) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );

        if (chunk.type === 'output') {
          fullOutput = chunk.content;
        }
      }

      // Auto-learn from conversation
      if (fullOutput) {
        autoLearning.processConversationTurn(message, fullOutput).catch(console.error);

        // Save to chat messages
        await saveChatMessages(sessionId, userId, agent.id, message, fullOutput);
      }

      // Send completion
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      );
    } catch (error: any) {
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'error',
            error: error.message,
          })}\n\n`
        )
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Save Chat Messages to Database
 */
async function saveChatMessages(
  sessionId: string,
  userId: string,
  agentId: string,
  userMessage: string,
  assistantMessage: string
) {
  await supabase.from('chat_messages').insert([
    {
      session_id: sessionId,
      user_id: userId,
      agent_id: agentId,
      role: 'user',
      content: userMessage,
    },
    {
      session_id: sessionId,
      user_id: userId,
      agent_id: agentId,
      role: 'assistant',
      content: assistantMessage,
    },
  ]);
}

/**
 * GET /api/chat/autonomous/profile
 * Get user's long-term memory profile
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const autoLearning = createAutoLearningMemory(userId);
    const profile = await autoLearning.getUserProfile();

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
