import { NextRequest, NextResponse } from 'next/server';
import { loadBalancer } from '@/features/autonomous/load-balancer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        const stats = await loadBalancer.getStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });

      case 'nodes':
        const healthyNodes = loadBalancer.getHealthyNodes();
        return NextResponse.json({
          success: true,
          data: healthyNodes,
          count: healthyNodes.length,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "stats" or "nodes"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [LoadBalancer API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'add-node':
        loadBalancer.addNode(data);
        return NextResponse.json({
          success: true,
          message: 'Node added successfully',
          nodeId: data.id,
          timestamp: new Date().toISOString()
        });

      case 'remove-node':
        if (!data.nodeId) {
          return NextResponse.json(
            { error: 'nodeId is required' },
            { status: 400 }
          );
        }
        loadBalancer.removeNode(data.nodeId);
        return NextResponse.json({
          success: true,
          message: 'Node removed successfully',
          nodeId: data.nodeId,
          timestamp: new Date().toISOString()
        });

      case 'update-node':
        if (!data.nodeId) {
          return NextResponse.json(
            { error: 'nodeId is required' },
            { status: 400 }
          );
        }
        loadBalancer.updateNode(data.nodeId, data.updates);
        return NextResponse.json({
          success: true,
          message: 'Node updated successfully',
          nodeId: data.nodeId,
          timestamp: new Date().toISOString()
        });

      case 'assign-task':
        const assignment = await loadBalancer.assignTask(data);
        if (assignment) {
          return NextResponse.json({
            success: true,
            data: assignment,
            message: 'Task assigned successfully',
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to assign task - no healthy nodes available' },
            { status: 503 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "add-node", "remove-node", "update-node", or "assign-task"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [LoadBalancer API] POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
