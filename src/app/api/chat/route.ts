import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

// Function to generate agent response using Langchain
async function generateAgentResponse(agent: any, message: string, chatHistory: any[]) {
  try {
    console.log('🤖 Generating response for agent:', agent.name);
    
    // Create a system prompt based on the agent's capabilities and business function
    const systemPrompt = `You are ${agent.display_name || agent.name}, a ${agent.business_function || 'General'} expert.
    
Your capabilities include: ${Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : 'General assistance'}
Your description: ${agent.description || 'Expert in your field'}

Please provide a comprehensive, expert response to the user's query. Use your specialized knowledge and capabilities to give the most helpful and accurate answer possible.

User's query: "${message}"`;

    // For now, we'll use a simple response generation
    // In a full implementation, this would integrate with Langchain and the agent's specific tools
    const response = `As a ${agent.business_function || 'General'} expert, I can help you with "${message}". 

Based on my expertise in ${Array.isArray(agent.capabilities) ? agent.capabilities.slice(0, 3).join(', ') : 'general assistance'}, here's what I can tell you:

This is a specialized response from ${agent.display_name || agent.name}. I'm ready to dive deeper into your specific needs and provide detailed guidance based on my ${agent.business_function || 'General'} expertise.

What specific aspects of "${message}" would you like me to focus on?`;

    return response;
  } catch (error) {
    console.error('❌ Error generating agent response:', error);
    return `I'm ${agent.display_name || agent.name}, your ${agent.business_function || 'General'} expert. I'm ready to help you with "${message}". Please let me know what specific information you need.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log('🔍 Environment variables check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      nodeEnv: process.env.NODE_ENV
    });
    
    const body = await request.json();
    const { 
      message, 
      userId, 
      sessionId, 
      agent,
      chatHistory = [],
      automaticRouting = true 
    } = body;

    console.log('📨 Chat request received:', {
      message: message?.substring(0, 50) + '...',
      userId,
      sessionId,
      hasAgent: !!agent,
      automaticRouting
    });

    // If agent is provided, use it directly (but not AI Orchestrator)
    if (agent && agent.id && agent.id !== 'ai-orchestrator' && agent.name !== 'AI Orchestrator') {
      console.log('🤖 Agent provided, processing with:', agent.name);
      
      // Process the request with the selected agent using Langchain
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send agent confirmation
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_selected',
              content: `Selected: ${agent.display_name || agent.name}`
            })}\n\n`));

            // Send reasoning steps
            const reasoningSteps = [
              `🔍 Processing your request with ${agent.display_name || agent.name}...`,
              `🧠 Analyzing: "${message}"`,
              `⚡ Applying ${agent.business_function || 'General'} expertise...`,
              `📊 Generating specialized response...`
            ];

            for (let i = 0; i < reasoningSteps.length; i++) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'reasoning',
                content: reasoningSteps[i]
              })}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Generate response using the selected agent's capabilities
            const agentResponse = await generateAgentResponse(agent, message, chatHistory);
            
            // Send the agent's response
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'content',
              content: agentResponse
            })}\n\n`));

            controller.close();
          } catch (error) {
            console.error('❌ Agent processing error:', error);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: 'Sorry, I encountered an error processing your request. Please try again.'
            })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // No agent provided or AI Orchestrator - show agent selection
    console.log('🤖 No specific agent provided, showing agent selection interface');
    console.log('🔍 Agent check:', { 
      hasAgent: !!agent, 
      agentId: agent?.id, 
      agentName: agent?.name,
      isAIOrchestrator: agent?.name === 'AI Orchestrator' || agent?.id === 'ai-orchestrator'
    });
    
    try {
      // Get all agents from database (try different approaches)
      console.log('🔍 Querying agents from database...');
      console.log('🔍 Supabase admin client check:', {
        hasSupabaseAdmin: !!supabaseAdmin,
        supabaseAdminType: typeof supabaseAdmin,
        supabaseAdminMethods: Object.getOwnPropertyNames(supabaseAdmin)
      });
      
      // Test basic connection first
      console.log('🔍 Testing basic Supabase connection...');
      const { data: testData, error: testError } = await supabaseAdmin
        .from('agents')
        .select('id')
        .limit(1);
      
      console.log('🔍 Basic connection test:', {
        testData,
        testError,
        hasTestData: !!testData,
        testDataLength: testData?.length || 0
      });
      
      if (testError) {
        console.error('❌ Basic connection failed:', testError);
        return NextResponse.json(
          { error: `Database connection failed: ${testError.message}` },
          { status: 500 }
        );
      }
      
      // First try: get all agents without any filters
      console.log('🔍 Querying all agents...');
      let { data: agents, error: agentsError } = await supabaseAdmin
        .from('agents')
        .select('*');
      
      console.log('📊 All agents query result:', { 
        agentsCount: agents?.length || 0, 
        error: agentsError,
        errorMessage: agentsError?.message,
        errorCode: agentsError?.code,
        errorDetails: agentsError?.details,
        errorHint: agentsError?.hint,
        sampleAgents: agents?.slice(0, 3).map(a => ({ 
          id: a.id, 
          name: a.name, 
          status: a.status,
          business_function: a.business_function,
          capabilities: a.capabilities
        })) || []
      });
      
      if (agentsError) {
        console.error('❌ Database error:', agentsError);
        return NextResponse.json(
          { error: `Database error: ${agentsError.message}` },
          { status: 500 }
        );
      }
      
      if (!agents || agents.length === 0) {
        console.error('❌ No agents found in database');
        return NextResponse.json(
          { error: 'No agents available in database' },
          { status: 404 }
        );
      }
      
      console.log('✅ Found agents:', agents.length);
      
      // Create streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial reasoning steps
            const initialReasoningSteps = [
              '🔍 Analyzing your question and context...',
              '🧠 Detecting relevant knowledge domains...',
              '⚡ Selecting the most appropriate expert agent...',
              '📊 Preparing specialized response...'
            ];
            
            for (let i = 0; i < initialReasoningSteps.length; i++) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'reasoning',
                content: initialReasoningSteps[i]
              })}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Create agent suggestions from real database agents (limit to 10 for UI performance)
            console.log('🤖 Creating agent suggestions from database...');
            const suggestions = agents.slice(0, 10).map((agent, index) => {
              // Normalize capabilities to always be an array
              console.log(`🔍 Agent ${index + 1} capabilities normalization:`, {
                original: agent.capabilities,
                type: typeof agent.capabilities,
                isArray: Array.isArray(agent.capabilities)
              });
              
              let normalizedCapabilities = [];
              if (Array.isArray(agent.capabilities)) {
                normalizedCapabilities = agent.capabilities;
                console.log(`✅ Agent ${index + 1}: Using array capabilities`);
              } else if (typeof agent.capabilities === 'string') {
                // Parse string format like "{cap1,cap2,cap3}" or "cap1,cap2,cap3"
                const cleanString = agent.capabilities.replace(/[{}]/g, '');
                normalizedCapabilities = cleanString.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
                console.log(`✅ Agent ${index + 1}: Converted string to array:`, normalizedCapabilities);
              } else if (agent.tools && typeof agent.tools === 'object') {
                normalizedCapabilities = Object.keys(agent.tools).filter(key => agent.tools[key] === true);
                console.log(`✅ Agent ${index + 1}: Using tools as capabilities:`, normalizedCapabilities);
              } else {
                normalizedCapabilities = ['General assistance'];
                console.log(`✅ Agent ${index + 1}: Using fallback capabilities`);
              }

              return {
                id: agent.id,
                name: agent.name,
                display_name: agent.display_name || agent.name,
                description: agent.description || agent.system_prompt || 'Expert agent',
                capabilities: normalizedCapabilities,
                score: 0.7 + (index * 0.05), // Simple scoring
                confidence: 'medium' as const,
                reasoning: `Available ${agent.business_function || agent.tier || 'General'} expert`,
                color: agent.color || 'text-blue-600',
                avatar: agent.avatar || '🤖',
                business_function: agent.business_function || 'General'
              };
            });
            
            console.log('✅ Agent suggestions created:', suggestions.length);
            console.log('🔍 Sample suggestion capabilities:', suggestions[0]?.capabilities);
            console.log('🔍 Sample suggestion capabilities type:', typeof suggestions[0]?.capabilities);
            console.log('🔍 Sample suggestion capabilities isArray:', Array.isArray(suggestions[0]?.capabilities));
            
            // Send agent suggestions
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🎯 Found ${suggestions.length} suitable agents. Please select the best one for your query:`
            })}\n\n`));
            
            console.log('📤 Sending agent suggestions via SSE...');
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_suggestions',
              content: suggestions
            })}\n\n`));
            
            // Send waiting message
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'waiting_for_selection',
              content: 'Please select an agent to continue...'
            })}\n\n`));
            
            controller.close();
            return;
          } catch (error) {
            console.error('❌ Simplified orchestration error:', error);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: 'Sorry, I encountered an error during agent selection. Please try again.'
            })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
      
    } catch (importError) {
      console.error('Failed to get agents:', importError);
      console.error('Import error details:', {
        message: importError instanceof Error ? importError.message : String(importError),
        stack: importError instanceof Error ? importError.stack : undefined,
        name: importError instanceof Error ? importError.name : undefined
      });
      // Fallback to basic response
      return NextResponse.json(
        { error: 'Agent selection unavailable. Please try again.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
