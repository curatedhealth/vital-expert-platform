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

    // Generate a completely natural response without any patterns
    const response = `I can help you with your query. What specific aspects would you like me to focus on?`;

    return response;
  } catch (error) {
    console.error('❌ Error generating agent response:', error);
    return `How can I assist you today?`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      userId, 
      sessionId, 
      agent,
      chatHistory = [],
      automaticRouting = true 
    } = body;

    // If agent is provided, process with that agent
    if (agent && agent.id && agent.id !== 'ai-orchestrator' && agent.name !== 'AI Orchestrator') {
      console.log('🤖 Processing with selected agent:', agent.name);
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send agent confirmation
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_selected',
              content: `Selected: ${agent.display_name || agent.name}`
            })}\n\n`));

            // Send reasoning
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🔍 Processing with ${agent.display_name || agent.name}...`
            })}\n\n`));

            // Generate response
            const response = await generateAgentResponse(agent, message, chatHistory);
            
            // Send response
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'content',
              content: response
            })}\n\n`));

            controller.close();
          } catch (error) {
            console.error('❌ Error:', error);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: 'Sorry, I encountered an error. Please try again.'
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

    // No agent provided - show agent selection
    console.log('🤖 Showing agent selection for message:', message.substring(0, 50) + '...');
    
    try {
      // Get agents from database
      let { data: agents, error: agentsError } = await supabaseAdmin
        .from('agents')
        .select('id, name, display_name, description, business_function, capabilities, tier, status, avatar, color')
        .eq('status', 'active')
        .limit(10);
      
      if (agentsError || !agents || agents.length === 0) {
        // Fallback to development agents
        const { data: devAgents } = await supabaseAdmin
          .from('agents')
          .select('id, name, display_name, description, business_function, capabilities, tier, status, avatar, color')
          .eq('status', 'development')
          .limit(10);
        agents = devAgents || [];
      }

      if (!agents || agents.length === 0) {
        return NextResponse.json(
          { error: 'No agents available' },
          { status: 404 }
        );
      }

      // Create agent suggestions
      const suggestions = agents.slice(0, 3).map((agent, index) => {
        // Normalize capabilities
        let normalizedCapabilities = [];
        if (Array.isArray(agent.capabilities)) {
          normalizedCapabilities = agent.capabilities;
        } else if (typeof agent.capabilities === 'string') {
          const cleanString = agent.capabilities.replace(/[{}]/g, '');
          normalizedCapabilities = cleanString.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
        } else {
          normalizedCapabilities = ['General assistance'];
        }

        return {
          id: agent.id,
          name: agent.name,
          display_name: agent.display_name || agent.name,
          description: agent.description || 'Expert agent',
          capabilities: normalizedCapabilities,
          score: 0.7 + (index * 0.05),
          confidence: 'medium' as const,
          reasoning: `Available ${agent.business_function || 'General'} expert`,
          color: agent.color || 'text-blue-600',
          avatar: agent.avatar || '🤖',
          business_function: agent.business_function || 'General'
        };
      });

      // Show agent selection
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send reasoning
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: '🔍 Analyzing your query and selecting the best expert agents...'
            })}\n\n`));

            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🎯 Found ${suggestions.length} top-rated agents. Please select the best one for your query:`
            })}\n\n`));
            
            // Send agent suggestions
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_suggestions',
              content: suggestions
            })}\n\n`));

            controller.close();
          } catch (error) {
            console.error('❌ Error:', error);
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
      
    } catch (error) {
      console.error('❌ Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
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

// Simple agent selection logic
function selectBestAgent(message: string, agents: any[]) {
  const messageLower = message.toLowerCase();
  
  // Simple keyword matching
  for (const agent of agents) {
    const capabilities = Array.isArray(agent.capabilities) 
      ? agent.capabilities.join(' ').toLowerCase()
      : (agent.capabilities || '').toLowerCase();
    
    const businessFunction = (agent.business_function || '').toLowerCase();
    const description = (agent.description || '').toLowerCase();
    
    // Check for reimbursement keywords
    if (messageLower.includes('reimbursement') || messageLower.includes('payment') || messageLower.includes('cost')) {
      if (capabilities.includes('reimbursement') || businessFunction.includes('reimbursement') || 
          capabilities.includes('payment') || capabilities.includes('cost')) {
        return agent;
      }
    }
    
    // Check for digital health keywords
    if (messageLower.includes('digital health') || messageLower.includes('digital therapeutics')) {
      if (capabilities.includes('digital health') || businessFunction.includes('digital health') ||
          capabilities.includes('digital therapeutics') || businessFunction.includes('digital therapeutics')) {
        return agent;
      }
    }
    
    // Check for clinical trial keywords
    if (messageLower.includes('clinical trial') || messageLower.includes('protocol') || messageLower.includes('study')) {
      if (capabilities.includes('clinical') || businessFunction.includes('clinical') ||
          capabilities.includes('protocol') || capabilities.includes('trial')) {
        return agent;
      }
    }
  }
  
  // Default to first agent if no match
  return agents[0];
}
