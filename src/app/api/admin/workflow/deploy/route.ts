import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { compileModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';

// Deploy workflow configuration
export async function POST(request: NextRequest) {
  try {
    const { workflow } = await request.json();
    console.log('🚀 [Admin] Deploying workflow configuration...');

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

    // Test workflow compilation
    try {
      const compiledWorkflow = compileModeAwareWorkflow();
      console.log('✅ [Admin] Workflow compilation test passed');
    } catch (compileError) {
      console.error('❌ [Admin] Workflow compilation failed:', compileError);
      return NextResponse.json(
        { error: 'Workflow compilation failed', details: compileError instanceof Error ? compileError.message : 'Unknown compilation error' },
        { status: 400 }
      );
    }

    // Create deployment record
    const deploymentId = `deploy_${Date.now()}`;
    const { error: deploymentError } = await supabaseAdmin
      .from('workflow_deployments')
      .insert({
        id: deploymentId,
        workflow_id: 'main',
        configuration: workflow,
        status: 'deploying',
        deployed_at: new Date().toISOString(),
        version: workflow.metadata?.version || '2.0.0'
      });

    if (deploymentError) {
      console.error('❌ [Admin] Database error:', deploymentError);
      return NextResponse.json(
        { error: 'Failed to create deployment record', details: deploymentError.message },
        { status: 500 }
      );
    }

    // Update workflow configuration
    const { error: updateError } = await supabaseAdmin
      .from('workflow_configurations')
      .upsert({
        id: 'main',
        configuration: workflow,
        is_active: true,
        updated_at: new Date().toISOString(),
        version: workflow.metadata?.version || '2.0.0',
        deployment_id: deploymentId
      });

    if (updateError) {
      console.error('❌ [Admin] Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update workflow configuration', details: updateError.message },
        { status: 500 }
      );
    }

    // Update deployment status
    const { error: statusError } = await supabaseAdmin
      .from('workflow_deployments')
      .update({
        status: 'deployed',
        completed_at: new Date().toISOString()
      })
      .eq('id', deploymentId);

    if (statusError) {
      console.error('❌ [Admin] Status update error:', statusError);
      // Don't fail the deployment for this
    }

    // Log deployment
    const { error: logError } = await supabaseAdmin
      .from('workflow_logs')
      .insert({
        deployment_id: deploymentId,
        level: 'info',
        message: 'Workflow deployed successfully',
        metadata: {
          nodeCount: workflow.nodes.length,
          edgeCount: workflow.edges.length,
          version: workflow.metadata?.version || '2.0.0'
        }
      });

    if (logError) {
      console.error('❌ [Admin] Log error:', logError);
      // Don't fail the deployment for this
    }

    console.log('✅ [Admin] Workflow deployed successfully');

    return NextResponse.json({
      success: true,
      message: 'Workflow deployed successfully',
      deploymentId,
      version: workflow.metadata?.version || '2.0.0'
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
