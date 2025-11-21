/**
 * Agent Store Verification API
 * 
 * GET /api/agent-store/verify
 * 
 * Verifies that agents are available in Supabase without modifying anything.
 * Useful for debugging and checking if the integration is working.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentStore, testAgentFetch, testAutoSelection } from '@/features/ask-expert/utils/verify-agent-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const agentId = searchParams.get('agentId');
    const query = searchParams.get('query');

    // General verification
    if (!action || action === 'status') {
      const status = await verifyAgentStore();
      return NextResponse.json({
        success: true,
        ...status,
        message: status.hasAgents
          ? `✅ Agent Store is connected. Found ${status.activeAgents} active agents.`
          : '⚠️ No active agents found in Agent Store. Check Supabase or run seed scripts.',
      });
    }

    // Test fetching specific agent
    if (action === 'test-fetch' && agentId) {
      const result = await testAgentFetch(agentId);
      return NextResponse.json({
        success: result.success,
        ...result,
        message: result.success
          ? `✅ Successfully fetched agent: ${result.agent?.display_name}`
          : `❌ Failed to fetch agent: ${result.error}`,
      });
    }

    // Test automatic selection
    if (action === 'test-select' && query) {
      const result = await testAutoSelection(query);
      return NextResponse.json({
        success: result.success,
        ...result,
        message: result.success
          ? `✅ Auto-selected agent: ${result.selectedAgent?.display_name}`
          : `❌ No agent found: ${result.error}`,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=status, ?action=test-fetch&agentId=..., or ?action=test-select&query=...',
    }, { status: 400 });

  } catch (error) {
    console.error('❌ [Agent Store Verify] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

