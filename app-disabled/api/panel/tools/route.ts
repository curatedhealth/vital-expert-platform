import { NextRequest, NextResponse } from 'next/server';
import { toolUsageTracker } from '@/lib/services/expert-tools';

export const runtime = 'nodejs';

/**
 * GET /api/panel/tools
 * Get tool usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolName = searchParams.get('toolName');

    // Get statistics
    const stats = toolUsageTracker.getStats();

    // Get tool calls (all or filtered by tool name)
    const toolCalls = toolUsageTracker.getToolCalls(toolName || undefined);

    return NextResponse.json({
      success: true,
      stats,
      toolCalls: toolName ? toolCalls : undefined,
      totalCalls: toolCalls.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching tool usage:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch tool usage'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/panel/tools
 * Reset tool usage statistics
 */
export async function DELETE(request: NextRequest) {
  try {
    toolUsageTracker.reset();

    return NextResponse.json({
      success: true,
      message: 'Tool usage statistics reset',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error resetting tool usage:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reset tool usage'
      },
      { status: 500 }
    );
  }
}
