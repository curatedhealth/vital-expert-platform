/**
 * Agent Statistics API Endpoint
 * 
 * GET /api/agents/[id]/stats
 * 
 * Fetches comprehensive statistics for an agent including:
 * - Total consultations/sessions
 * - Satisfaction scores
 * - Success rates
 * - Response times
 * - Certifications
 * - Cost and token usage
 */

import { NextRequest, NextResponse } from 'next/server';

// All statistics are fetched from Python AI-engine which queries the agent_metrics table.
// No synthetic/mock data is used - returns empty stats if no data is available.

export interface AgentStats {
  totalConsultations: number;
  satisfactionScore: number; // 0-5
  successRate: number; // 0-100
  averageResponseTime: number; // in seconds
  certifications: string[];
  totalTokensUsed: number;
  totalCost: number; // USD
  confidenceLevel: number; // 0-100 computed
  availability: 'online' | 'busy' | 'offline';
  recentFeedback: AgentFeedback[];
}

interface AgentFeedback {
  id: string;
  rating: number;
  comment: string | null;
  userId?: string | null;
  createdAt: string;
}

const FALLBACK_STATS: AgentStats = {
  totalConsultations: 0,
  satisfactionScore: 0.0,
  successRate: 0.0,
  averageResponseTime: 0.0,
  certifications: [],
  totalTokensUsed: 0,
  totalCost: 0.0,
  confidenceLevel: 0,
  availability: 'offline',
  recentFeedback: [],
};

const API_TIMEOUT_MS = 4_000;
const CACHE_TTL_MS = 60_000;
const FAILURE_COOLDOWN_MS = 30_000;

const statsCache = new Map<
  string,
  { timestamp: number; data: AgentStats }
>();

let lastFailureTimestamp = 0;

/**
 * GET /api/agents/[id]/stats
 * 
 * Fetches comprehensive statistics for an agent from Python AI-engine.
 * Replaces synthetic/mock data with real data from agent_metrics table.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await Promise.resolve(params);

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Get days parameter from query string (default: 7 days)
   const { searchParams } = new URL(request.url);
   const days = parseInt(searchParams.get('days') || '7', 10);

    const cacheKey = `${agentId}:${days}`;
    const now = Date.now();
    const cached = statsCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        meta: { cacheHit: true },
      });
    }

    // Call Python AI-engine via API Gateway
    const apiGatewayUrl = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';
    
    try {
      if (now - lastFailureTimestamp < FAILURE_COOLDOWN_MS) {
        throw new Error('Python AI-engine recently unavailable; using fallback');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      const response = await fetch(`${apiGatewayUrl}/api/agents/${agentId}/stats?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Python AI-engine returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const stats: AgentStats = data.data || FALLBACK_STATS;
      statsCache.set(cacheKey, { timestamp: now, data: stats });
      lastFailureTimestamp = 0;

      // Return the response from Python AI-engine (which returns empty stats if no data, not synthetic)
      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (fetchError) {
      console.error('[Agent Stats] Python AI-engine call failed:', fetchError);
      lastFailureTimestamp = Date.now();
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          meta: { cacheHit: true, stale: true },
        });
      }
      
      // If Python service is unavailable, return empty stats instead of synthetic data
      return NextResponse.json({
        success: true,
        data: FALLBACK_STATS,
        meta: { fallback: true },
      });
    }
  } catch (error) {
    console.error('[Agent Stats] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agent statistics',
      },
      { status: 500 }
    );
  }
}

// All statistics calculation is now handled by Python AI-engine.
// This endpoint simply proxies requests to the Python service via API Gateway.
