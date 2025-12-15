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
import { createClient } from '@supabase/supabase-js';

// Statistics are fetched directly from Supabase agent_metrics table.
// Falls back to empty stats if no data is available.

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

const CACHE_TTL_MS = 60_000;

const statsCache = new Map<
  string,
  { timestamp: number; data: AgentStats }
>();

// Create Supabase client for direct database queries
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * GET /api/agents/[id]/stats
 *
 * Fetches statistics directly from Supabase agent_metrics table.
 * Returns empty stats if no data is available.
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

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Agent Stats] Supabase not configured, returning fallback stats');
      return NextResponse.json({
        success: true,
        data: FALLBACK_STATS,
        meta: { fallback: true, reason: 'supabase_not_configured' },
      });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query agent_metrics table for this agent
    // Use created_at if recorded_at doesn't exist
    const { data: metrics, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .eq('agent_id', agentId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Agent Stats] Supabase query error:', error);
      return NextResponse.json({
        success: true,
        data: FALLBACK_STATS,
        meta: { fallback: true, reason: 'query_error' },
      });
    }

    // Calculate aggregated stats from metrics
    const stats: AgentStats = calculateStats(metrics || []);
    statsCache.set(cacheKey, { timestamp: now, data: stats });

    return NextResponse.json({
      success: true,
      data: stats,
    });
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

/**
 * Calculate aggregated statistics from metrics records.
 */
function calculateStats(metrics: any[]): AgentStats {
  if (!metrics || metrics.length === 0) {
    return FALLBACK_STATS;
  }

  const totalConsultations = metrics.length;
  const avgSatisfaction = metrics.reduce((sum, m) => sum + (m.satisfaction_score || 0), 0) / totalConsultations;
  const successCount = metrics.filter(m => m.success === true).length;
  const avgResponseTime = metrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / totalConsultations / 1000;
  const totalTokens = metrics.reduce((sum, m) => sum + (m.tokens_used || 0), 0);
  const totalCost = metrics.reduce((sum, m) => sum + (m.cost_usd || 0), 0);

  return {
    totalConsultations,
    satisfactionScore: Math.round(avgSatisfaction * 10) / 10,
    successRate: Math.round((successCount / totalConsultations) * 100),
    averageResponseTime: Math.round(avgResponseTime * 100) / 100,
    certifications: [], // Would need separate table query
    totalTokensUsed: totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
    confidenceLevel: Math.min(100, Math.round(totalConsultations / 10) * 10), // Simple heuristic
    availability: 'online',
    recentFeedback: [], // Would need separate feedback table query
  };
}
