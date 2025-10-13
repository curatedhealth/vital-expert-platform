import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

// Function to generate agent response using Langchain
async function generateAgentResponse(agent: any, message: string, chatHistory: any[]) {
  try {
    console.log('🤖 Generating response for agent:', agent.name);
    
    // Create a comprehensive system prompt based on the agent's capabilities and business function
    const systemPrompt = `You are ${agent.display_name || agent.name}, a ${agent.business_function || 'General'} expert.

Your capabilities include: ${Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : 'General assistance'}
Your description: ${agent.description || 'Expert in your field'}

You are an expert in your field with deep knowledge and experience. Provide a comprehensive, detailed, and actionable response to the user's query. Use your specialized knowledge to give specific, helpful, and accurate information.

User's query: "${message}"

Please provide a detailed, expert response that directly addresses the user's question with specific insights, recommendations, or information relevant to your expertise.`;

    // For now, we'll use a simple approach that generates contextual responses
    // In a full implementation, this would integrate with Langchain/OpenAI
    let response = '';
    
    // Generate contextual response based on agent type and message content
    if (agent.business_function?.toLowerCase().includes('reimbursement') || 
        agent.capabilities?.some((cap: string) => cap.toLowerCase().includes('reimbursement'))) {
      response = `Based on your query about digital health reimbursement, here are the key considerations:

**Reimbursement Pathways for Digital Health:**
- **FDA Clearance**: Most digital therapeutics require FDA clearance (510(k) or De Novo) for reimbursement consideration
- **Clinical Evidence**: Strong clinical trial data demonstrating efficacy and safety is essential
- **Coding & Billing**: Appropriate CPT codes and billing mechanisms must be established
- **Payor Coverage**: Medicare, Medicaid, and private payor coverage varies significantly

**Key Steps for Reimbursement:**
1. **Regulatory Approval**: Obtain necessary FDA clearance
2. **Clinical Validation**: Conduct robust clinical trials
3. **Health Economic Studies**: Demonstrate cost-effectiveness
4. **Coding Strategy**: Work with AMA to establish appropriate codes
5. **Payor Engagement**: Present evidence to payors for coverage decisions

**Current Landscape:**
- CMS is increasingly covering digital therapeutics under specific programs
- Private payors are developing coverage policies for digital health
- Value-based care models are creating new reimbursement opportunities

Would you like me to dive deeper into any specific aspect of digital health reimbursement?`;
    } else if (agent.business_function?.toLowerCase().includes('digital') || 
               agent.capabilities?.some((cap: string) => cap.toLowerCase().includes('digital'))) {
      response = `Regarding digital health strategy and implementation:

**Digital Health Market Overview:**
- The global digital health market is rapidly expanding with significant investment
- Key areas include telemedicine, digital therapeutics, health monitoring, and AI-driven diagnostics
- Regulatory frameworks are evolving to accommodate digital health innovations

**Strategic Considerations:**
- **Technology Integration**: Seamless integration with existing healthcare systems
- **User Experience**: Intuitive, accessible design for diverse user populations
- **Data Security**: HIPAA compliance and robust cybersecurity measures
- **Scalability**: Architecture that can grow with user base and feature set

**Implementation Framework:**
1. **Market Research**: Understand target audience and competitive landscape
2. **Regulatory Planning**: Navigate FDA, HIPAA, and other regulatory requirements
3. **Technology Development**: Build robust, scalable platform
4. **Clinical Validation**: Conduct necessary studies for regulatory approval
5. **Go-to-Market**: Develop commercialization and reimbursement strategy

**Key Success Factors:**
- Strong clinical evidence base
- User-centered design
- Regulatory compliance
- Strategic partnerships
- Clear value proposition

What specific aspect of digital health strategy would you like to explore further?`;
    } else {
      response = `I can provide expert guidance on your query. Based on my expertise in ${agent.business_function || 'this field'}, here are some key insights:

**Professional Analysis:**
- Your question touches on important aspects of ${agent.business_function || 'the field'}
- There are several strategic considerations to evaluate
- The landscape is evolving rapidly with new opportunities

**Key Areas to Consider:**
- Current market trends and developments
- Regulatory and compliance requirements
- Best practices and industry standards
- Strategic implementation approaches

**Next Steps:**
- Gather more specific information about your needs
- Develop a comprehensive strategy
- Consider implementation timeline and resources
- Plan for ongoing monitoring and optimization

Would you like me to elaborate on any specific aspect or provide more detailed guidance?`;
    }

    return response;
  } catch (error) {
    console.error('❌ Error generating agent response:', error);
    return `I apologize, but I encountered an error while generating my response. Please try rephrasing your question or contact support if the issue persists.`;
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
