import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Get workflow metrics
export async function GET() {
  try {
    const timeRange = '24h';
    const workflowId = 'main';

    console.log('📊 [Admin] Fetching workflow metrics...');

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get execution statistics
    const { data: executions, error: executionsError } = await supabaseAdmin
      .from('workflow_executions')
      .select('status, start_time, end_time, duration, current_node, metadata')
      .eq('workflow_id', workflowId)
      .gte('start_time', startTime.toISOString());

    if (executionsError) {
      console.error('❌ [Admin] Database error:', executionsError);
      return NextResponse.json(
        { error: 'Failed to fetch execution metrics', details: executionsError.message },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalExecutions = executions?.length || 0;
    const completedExecutions = executions?.filter(e => e.status === 'completed').length || 0;
    const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0;
    const runningExecutions = executions?.filter(e => e.status === 'running').length || 0;
    
    const successRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;
    const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

    // Calculate average latency
    const completedWithDuration = executions?.filter(e => 
      e.status === 'completed' && e.duration !== null
    ) || [];
    
    const averageLatency = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) / completedWithDuration.length
      : 0;

    // Calculate node performance
    const nodePerformance: Record<string, {
      executions: number;
      averageLatency: number;
      errorRate: number;
    }> = {};

    // Group by current node
    const nodeStats = executions?.reduce((acc, execution) => {
      const node = execution.current_node || 'unknown';
      if (!acc[node]) {
        acc[node] = {
          executions: 0,
          totalLatency: 0,
          errors: 0
        };
      }
      acc[node].executions++;
      if (execution.duration) {
        acc[node].totalLatency += execution.duration;
      }
      if (execution.status === 'failed') {
        acc[node].errors++;
      }
      return acc;
    }, {} as Record<string, { executions: number; totalLatency: number; errors: number }>) || {};

    // Calculate node performance metrics
    Object.entries(nodeStats).forEach(([node, stats]) => {
      nodePerformance[node] = {
        executions: stats.executions,
        averageLatency: stats.executions > 0 ? stats.totalLatency / stats.executions : 0,
        errorRate: stats.executions > 0 ? (stats.errors / stats.executions) * 100 : 0
      };
    });

    // Get recent error logs
    const { data: errorLogs, error: logsError } = await supabaseAdmin
      .from('workflow_executions')
      .select('error, created_at, session_id')
      .eq('workflow_id', workflowId)
      .not('error', 'is', null)
      .gte('start_time', startTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const recentErrors = errorLogs?.map(log => ({
      error: log.error,
      timestamp: new Date(log.created_at),
      sessionId: log.session_id
    })) || [];

    // Get execution trends (hourly for last 24h)
    const hourlyTrends = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);
      
      const hourExecutions = executions?.filter(e => {
        const execTime = new Date(e.start_time);
        return execTime >= hourStart && execTime < hourEnd;
      }) || [];

      hourlyTrends.push({
        hour: hourStart.getHours(),
        executions: hourExecutions.length,
        completed: hourExecutions.filter(e => e.status === 'completed').length,
        failed: hourExecutions.filter(e => e.status === 'failed').length
      });
    }

    const metrics = {
      totalExecutions,
      successRate: Math.round(successRate * 10) / 10,
      averageLatency: Math.round(averageLatency),
      errorRate: Math.round(errorRate * 10) / 10,
      activeExecutions: runningExecutions,
      nodePerformance,
      recentErrors,
      hourlyTrends,
      timeRange,
      workflowId
    };

    console.log('✅ [Admin] Successfully calculated workflow metrics');

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
