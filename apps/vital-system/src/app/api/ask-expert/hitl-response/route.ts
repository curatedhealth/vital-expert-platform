/**
 * API Route: /api/ask-expert-v2/hitl-response
 *
 * Handles HITL (Human-in-the-Loop) checkpoint responses from the ask-expert-v2 frontend.
 * Proxies the approval/rejection to the Python AI Engine's Mode 3 HITL endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

    const { checkpoint_id, session_id, decision, rejection_reason, user_id } = body;

    // Validate required fields
    if (!checkpoint_id || !session_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: checkpoint_id, session_id, decision' },
        { status: 400 }
      );
    }

    // Validate decision value
    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    console.log('[ask-expert-v2/hitl-response] Processing HITL response:', {
      checkpoint_id,
      session_id,
      decision,
      user_id,
      has_rejection_reason: !!rejection_reason,
    });

    // Forward to Python AI Engine
    const response = await fetch(`${AI_ENGINE_URL}/api/mode3/hitl/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        checkpoint_id,
        session_id,
        decision,
        rejection_reason: rejection_reason || null,
        user_id: user_id || null,
        responded_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ask-expert-v2/hitl-response] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to submit HITL response', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log('[ask-expert-v2/hitl-response] Successfully submitted HITL response:', {
      checkpoint_id,
      decision,
      backend_status: result.status,
    });

    return NextResponse.json({
      success: true,
      checkpoint_id,
      decision,
      ...result,
    });
  } catch (error: any) {
    console.error('[ask-expert-v2/hitl-response] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
