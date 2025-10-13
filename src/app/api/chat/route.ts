import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

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
            const suggestions = agents.slice(0, 10).map((agent, index) => ({
              id: agent.id,
              name: agent.name,
              display_name: agent.display_name || agent.name,
              description: agent.description || agent.system_prompt || 'Expert agent',
              capabilities: agent.capabilities || agent.tools || ['General assistance'],
              score: 0.7 + (index * 0.05), // Simple scoring
              confidence: 'medium' as const,
              reasoning: `Available ${agent.business_function || agent.tier || 'General'} expert`,
              color: agent.color || 'text-blue-600',
              avatar: agent.avatar || '🤖',
              business_function: agent.business_function || 'General'
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
