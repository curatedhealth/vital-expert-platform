/**
 * Panel Orchestration API Route
 * 
 * Routes panel consultation requests to Python AI Engine via API Gateway.
 * Complies with Golden Rule: All AI/ML services must be in Python.
 */

import { NextRequest, NextResponse } from 'next/server';

// API Gateway URL for Python AI Engine
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.AI_ENGINE_URL || // Fallback for compatibility
  'http://localhost:3001'; // Default to API Gateway

interface PanelOrchestrationRequest {
  message: string;
  panel: {
    id?: string;
    members: Array<{
      agent?: {
        id: string;
        name: string;
        [key: string]: any;
      };
      [key: string]: any;
    }>;
    archetype?: string;
    fusionModel?: string;
  };
  mode?: 'parallel' | 'sequential' | 'consensus';
  context?: {
    timestamp?: string;
    archetype?: string;
    fusionModel?: string;
    [key: string]: any;
  };
  user_id?: string;
  tenant_id?: string;
  session_id?: string;
}

interface PanelOrchestrationResponse {
  response: string;
  metadata: {
    mode: string;
    panel_size: number;
    session_id?: string;
    consensus: string[];
    dissent: string[];
    expert_responses: Array<{
      expert_id: string;
      expert_name: string;
      content: string;
      confidence: number;
      citations: any[];
    }>;
    processing_metadata?: any;
    compliance_protocols?: any;
    timestamp: string;
  };
  processing_time_ms: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PanelOrchestrationRequest = await request.json();

    // Validate required fields
    if (!body.message || !body.panel?.members || body.panel.members.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: message and panel.members are required' },
        { status: 400 }
      );
    }

    // Get user session and tenant ID for metrics tracking
    const userId = request.headers.get('x-user-id') || body.user_id;
    const tenantId = request.headers.get('x-tenant-id') || body.tenant_id;

    // Call Python AI Engine via API Gateway (Golden Rule compliance)
    const response = await fetch(`${API_GATEWAY_URL}/api/panel/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tenantId && { 'x-tenant-id': tenantId }),
      },
      body: JSON.stringify({
        message: body.message,
        panel: body.panel,
        mode: body.mode || 'parallel',
        context: body.context,
        user_id: userId,
        tenant_id: tenantId,
        session_id: body.session_id,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorBody.detail || errorBody.error || `API Gateway responded with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result = (await response.json()) as PanelOrchestrationResponse;

    // Return formatted response
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Panel Orchestration] Error:', error);
    return NextResponse.json(
      {
        error: 'Panel orchestration failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

