import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { compileModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';

// Get current workflow configuration
export async function GET() {
  try {
    console.log('🔍 [Admin] Fetching workflow configuration...');

    // Get workflow from database
    const { data: workflowData, error } = await supabaseAdmin
      .from('workflow_configurations')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [Admin] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workflow configuration', details: error.message },
        { status: 500 }
      );
    }

    // Default workflow if none exists
    const defaultWorkflow = {
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'start',
          position: { x: 50, y: 50 },
          config: {},
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'routeByMode',
          name: 'Route by Mode',
          type: 'decision',
          position: { x: 200, y: 50 },
          config: {
            condition: 'interactionMode',
            options: ['manual', 'automatic']
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'suggestAgents',
          name: 'Suggest Agents',
          type: 'process',
          position: { x: 350, y: 50 },
          config: {
            maxSuggestions: 3,
            useRanking: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'suggestTools',
          name: 'Suggest Tools',
          type: 'process',
          position: { x: 350, y: 150 },
          config: {
            availableTools: ['web_search', 'pubmed_search', 'knowledge_base', 'calculator', 'fda_database']
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'selectAgentAutomatic',
          name: 'Select Agent (Auto)',
          type: 'process',
          position: { x: 500, y: 100 },
          config: {
            useOrchestrator: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'retrieveContext',
          name: 'Retrieve Context',
          type: 'process',
          position: { x: 650, y: 100 },
          config: {
            useRAG: true,
            maxDocuments: 5
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'processWithAgentNormal',
          name: 'Process (Normal)',
          type: 'process',
          position: { x: 800, y: 50 },
          config: {
            useSelectedTools: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'processWithAgentAutonomous',
          name: 'Process (Autonomous)',
          type: 'process',
          position: { x: 800, y: 150 },
          config: {
            useAllTools: true,
            useMemory: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'synthesizeResponse',
          name: 'Synthesize Response',
          type: 'process',
          position: { x: 950, y: 100 },
          config: {
            includeCitations: true,
            includeMetadata: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'end',
          name: 'End',
          type: 'end',
          position: { x: 1100, y: 100 },
          config: {},
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'routeByMode', status: 'active' },
        { id: 'e2', source: 'routeByMode', target: 'suggestAgents', condition: 'manual', status: 'active' },
        { id: 'e3', source: 'routeByMode', target: 'suggestTools', condition: 'automatic', status: 'active' },
        { id: 'e4', source: 'suggestAgents', target: 'suggestTools', status: 'active' },
        { id: 'e5', source: 'suggestTools', target: 'selectAgentAutomatic', status: 'active' },
        { id: 'e6', source: 'selectAgentAutomatic', target: 'retrieveContext', status: 'active' },
        { id: 'e7', source: 'retrieveContext', target: 'processWithAgentNormal', condition: 'normal', status: 'active' },
        { id: 'e8', source: 'retrieveContext', target: 'processWithAgentAutonomous', condition: 'autonomous', status: 'active' },
        { id: 'e9', source: 'processWithAgentNormal', target: 'synthesizeResponse', status: 'active' },
        { id: 'e10', source: 'processWithAgentAutonomous', target: 'synthesizeResponse', status: 'active' },
        { id: 'e11', source: 'synthesizeResponse', target: 'end', status: 'active' }
      ],
      metadata: {
        name: 'Mode-Aware Multi-Agent Workflow',
        description: 'LangGraph workflow supporting all 4 mode combinations',
        version: '2.0.0',
        lastModified: new Date(),
        status: 'active'
      }
    };

    const workflow = workflowData?.configuration || defaultWorkflow;

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update workflow configuration
export async function PUT(request: NextRequest) {
  try {
    const { workflow } = await request.json();
    console.log('💾 [Admin] Updating workflow configuration...');

    // Validate workflow structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      return NextResponse.json(
        { error: 'Invalid workflow: nodes must be an array' },
        { status: 400 }
      );
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      return NextResponse.json(
        { error: 'Invalid workflow: edges must be an array' },
        { status: 400 }
      );
    }

    // Update workflow in database
    const { error: updateError } = await supabaseAdmin
      .from('workflow_configurations')
      .upsert({
        id: 'main',
        configuration: workflow,
        is_active: true,
        updated_at: new Date().toISOString(),
        version: workflow.metadata?.version || '2.0.0'
      });

    if (updateError) {
      console.error('❌ [Admin] Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update workflow configuration', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ [Admin] Workflow configuration updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Workflow configuration updated successfully'
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
