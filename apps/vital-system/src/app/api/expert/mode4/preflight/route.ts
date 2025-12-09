/**
 * VITAL Platform - Mode 4 Pre-flight Check Route
 * 
 * Validates all requirements before launching a Mode 4 background mission:
 * - Budget availability
 * - Tool access permissions
 * - Agent compatibility
 * - Data source access
 * - Execution permissions
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      mission_id,
      goal,
      options = {},
    } = body;

    // Validate required fields
    if (!mission_id) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    if (!goal?.trim()) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    // Forward to Python backend for pre-flight validation
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/v1/expert/preflight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Tenant-ID': tenantId,
        'X-User-ID': session.user.id,
      },
      body: JSON.stringify({
        mission_id,
        goal,
        tenant_id: tenantId,
        user_id: session.user.id,
        mode: 'mode4_auto_autonomous',
        options: {
          budget_limit: options.budgetLimit,
          enable_rag: options.enableRag ?? true,
          enable_websearch: options.enableWebSearch ?? true,
          enable_all_tools: options.enableAllTools ?? true,
          max_duration: options.maxDuration,
        },
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode4 Preflight] Backend error:', backendResponse.status, errorText);
      
      // Return a failure result, not an error
      return NextResponse.json({
        passed: false,
        checks: [
          {
            id: 'backend',
            name: 'Backend Connectivity',
            category: 'permissions',
            status: 'failed',
            message: errorText || 'Backend validation failed',
            required: true,
          },
        ],
      });
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Mode4 Preflight] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Pre-flight check failed',
        passed: false,
        checks: [
          {
            id: 'system',
            name: 'System Health',
            category: 'permissions',
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unexpected error',
            required: true,
          },
        ],
      },
      { status: 500 }
    );
  }
}
