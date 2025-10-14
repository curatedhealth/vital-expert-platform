import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { executeModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';

// Test workflow execution
export async function POST(request: NextRequest) {
  try {
    const { testQuery, mode, autonomous, selectedTools = [] } = await request.json();
    console.log('🧪 [Admin] Starting workflow test...');

    // Validate test parameters
    if (!testQuery) {
      return NextResponse.json(
        { error: 'Test query is required' },
        { status: 400 }
      );
    }

    if (!mode || !['automatic', 'manual'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be "automatic" or "manual"' },
        { status: 400 }
      );
    }

    // Create test execution record
    const testSessionId = `test_${Date.now()}`;
    const testUserId = 'admin_test_user';
    
    const { data: execution, error: executionError } = await supabaseAdmin
      .from('workflow_executions')
      .insert({
        session_id: testSessionId,
        user_id: testUserId,
        workflow_id: 'main',
        status: 'running',
        current_node: 'start',
        start_time: new Date().toISOString(),
        metadata: {
          test: true,
          mode,
          autonomous,
          selectedTools
        }
      })
      .select()
      .single();

    if (executionError) {
      console.error('❌ [Admin] Database error:', executionError);
      return NextResponse.json(
        { error: 'Failed to create test execution', details: executionError.message },
        { status: 500 }
      );
    }

    // Execute workflow test
    try {
      const result = await executeModeAwareWorkflow({
        query: testQuery,
        sessionId: testSessionId,
        userId: testUserId,
        interactionMode: mode,
        autonomousMode: autonomous,
        selectedTools,
        chatHistory: []
      });

      // Update execution status
      const { error: updateError } = await supabaseAdmin
        .from('workflow_executions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          duration: Date.now() - new Date(execution.start_time).getTime(),
          current_node: 'end',
          metadata: {
            ...execution.metadata,
            result: {
              answer: result.answer,
              sources: result.sources,
              citations: result.citations,
              toolCalls: result.toolCalls,
              workflowStep: result.workflowStep
            }
          }
        })
        .eq('id', execution.id);

      if (updateError) {
        console.error('❌ [Admin] Update error:', updateError);
      }

      // Log test completion
      const { error: logError } = await supabaseAdmin
        .from('workflow_logs')
        .insert({
          execution_id: execution.id,
          level: 'info',
          message: 'Workflow test completed successfully',
          metadata: {
            testQuery,
            mode,
            autonomous,
            selectedTools,
            result: {
              hasAnswer: !!result.answer,
              sourceCount: result.sources?.length || 0,
              citationCount: result.citations?.length || 0,
              toolCallCount: result.toolCalls?.length || 0
            }
          }
        });

      if (logError) {
        console.error('❌ [Admin] Log error:', logError);
      }

      console.log('✅ [Admin] Workflow test completed successfully');

      return NextResponse.json({
        success: true,
        message: 'Workflow test completed successfully',
        testId: execution.id,
        result: {
          answer: result.answer,
          sources: result.sources,
          citations: result.citations,
          toolCalls: result.toolCalls,
          workflowStep: result.workflowStep,
          metadata: result.metadata
        }
      });

    } catch (testError) {
      console.error('❌ [Admin] Test execution failed:', testError);

      // Update execution status to failed
      const { error: updateError } = await supabaseAdmin
        .from('workflow_executions')
        .update({
          status: 'failed',
          end_time: new Date().toISOString(),
          duration: Date.now() - new Date(execution.start_time).getTime(),
          error: testError instanceof Error ? testError.message : 'Unknown test error',
          metadata: {
            ...execution.metadata,
            error: testError instanceof Error ? testError.message : 'Unknown test error'
          }
        })
        .eq('id', execution.id);

      if (updateError) {
        console.error('❌ [Admin] Update error:', updateError);
      }

      // Log test failure
      const { error: logError } = await supabaseAdmin
        .from('workflow_logs')
        .insert({
          execution_id: execution.id,
          level: 'error',
          message: 'Workflow test failed',
          metadata: {
            testQuery,
            mode,
            autonomous,
            selectedTools,
            error: testError instanceof Error ? testError.message : 'Unknown test error'
          }
        });

      if (logError) {
        console.error('❌ [Admin] Log error:', logError);
      }

      return NextResponse.json(
        { 
          error: 'Workflow test failed', 
          details: testError instanceof Error ? testError.message : 'Unknown test error',
          testId: execution.id
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
