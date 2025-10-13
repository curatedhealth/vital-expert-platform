import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

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

    console.log('📨 Chat request received:', {
      message: message?.substring(0, 50) + '...',
      userId,
      sessionId,
      hasAgent: !!agent,
      automaticRouting
    });

    // If agent is provided, use it directly
    if (agent) {
      console.log('🤖 Agent provided, using:', agent.name);
      
      // Create streaming response for selected agent
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send agent confirmation
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'agent_selected',
              content: `Selected: ${agent.display_name || agent.name}`
            })}\n\n`));

            // Send a simple response
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'content',
              content: `Hello! I'm ${agent.display_name || agent.name}, your ${agent.business_function || 'General'} expert. How can I help you with "${message}"?`
            })}\n\n`));

            controller.close();
          } catch (error) {
            console.error('❌ Agent response error:', error);
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
    console.log('🤖 No agent provided, showing agent selection');
    
    try {
      // Get all active agents from database
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .limit(5);
      
      if (agentsError || !agents || agents.length === 0) {
        console.error('❌ No agents found:', agentsError);
        return NextResponse.json(
          { error: 'No agents available' },
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
            
            // Create simplified agent suggestions
            console.log('🤖 Creating simplified agent suggestions...');
            const suggestions = agents.map((agent, index) => ({
              id: agent.id,
              name: agent.name,
              display_name: agent.display_name || agent.name,
              description: agent.description || 'Expert agent',
              capabilities: agent.capabilities || ['General assistance'],
              score: 0.7 + (index * 0.05), // Simple scoring
              confidence: 'medium' as const,
              reasoning: `Available ${agent.business_function || 'General'} expert`,
              color: agent.color || 'text-blue-600',
              avatar: agent.avatar || '🤖'
            }));
            
            console.log('✅ Agent suggestions created:', suggestions.length);
            
            // Send agent suggestions
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: `🎯 Found ${suggestions.length} suitable agents. Please select the best one for your query:`
            })}\n\n`));
            
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
