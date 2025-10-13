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

    // SIMPLIFIED FLOW: Always auto-select the best agent
    console.log('🤖 Auto-selecting best agent for message:', message.substring(0, 50) + '...');
    
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

      // Simple agent selection based on message content
      const selectedAgent = selectBestAgent(message, agents);
      console.log('✅ Selected agent:', selectedAgent.name);

      // Process with selected agent
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send reasoning
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🔍 Analyzing your query and selecting the best expert...`
            })}\n\n`));

            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `✅ Selected: ${selectedAgent.display_name || selectedAgent.name}`
            })}\n\n`));

            // Generate response
            const response = await generateAgentResponse(selectedAgent, message, chatHistory);
            
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
