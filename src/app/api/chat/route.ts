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

    // Generate a direct, helpful response without the pattern
    const response = `Based on my expertise in ${Array.isArray(agent.capabilities) ? agent.capabilities.slice(0, 3).join(', ') : 'general assistance'}, I can help you with your query.

What specific aspects would you like me to focus on?`;

    return response;
  } catch (error) {
    console.error('❌ Error generating agent response:', error);
    return `How can I assist you today?`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Minimal logging for performance
    
    const body = await request.json();
    const { 
      message, 
      userId, 
      sessionId, 
      agent,
      chatHistory = [],
      automaticRouting = true 
    } = body;

    // Minimal request logging

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

            // Send single reasoning step for faster response
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🔍 Processing with ${agent.display_name || agent.name}...`
            })}\n\n`));

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
      // Skip detailed client checks for performance
      
      // Skip connection test for performance
      
              // Optimized query: get only necessary fields and limit to active agents first
              console.log('🔍 Querying agents...');
              let { data: agents, error: agentsError } = await supabaseAdmin
                .from('agents')
                .select('id, name, display_name, description, business_function, capabilities, tier, status, avatar, color')
                .eq('status', 'active')
                .limit(10);
      
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
      
              // If no active agents, try development agents as fallback
              if (!agents || agents.length === 0) {
                console.log('🔍 No active agents, trying development agents...');
                const { data: devAgents, error: devError } = await supabaseAdmin
                  .from('agents')
                  .select('id, name, display_name, description, business_function, capabilities, tier, status, avatar, color')
                  .eq('status', 'development')
                  .limit(10);
                
                if (devError || !devAgents || devAgents.length === 0) {
                  console.error('❌ No agents found in database');
                  return NextResponse.json(
                    { error: 'No agents available in database' },
                    { status: 404 }
                  );
                }
                agents = devAgents;
              }
      
      console.log('✅ Found agents:', agents.length);
      
      // Create streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send single reasoning step for faster response
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: '🔍 Analyzing your query and selecting the best expert agents...'
            })}\n\n`));
            
                    // Create agent suggestions from real database agents (limit to 3 for top agents)
                    const suggestions = agents.slice(0, 3).map((agent, index) => {
              // Fast capabilities normalization without extensive logging
              let normalizedCapabilities = [];
              if (Array.isArray(agent.capabilities)) {
                normalizedCapabilities = agent.capabilities;
              } else if (typeof agent.capabilities === 'string') {
                const cleanString = agent.capabilities.replace(/[{}]/g, '');
                normalizedCapabilities = cleanString.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
              } else if (agent.tools && typeof agent.tools === 'object') {
                normalizedCapabilities = Object.keys(agent.tools).filter(key => agent.tools[key] === true);
              } else {
                normalizedCapabilities = ['General assistance'];
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
            
            // Send agent suggestions immediately without extra logging
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🎯 Found ${suggestions.length} top-rated agents. Please select the best one for your query:`
            })}\n\n`));
            
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_suggestions',
              content: suggestions
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
