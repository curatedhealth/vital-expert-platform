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
import { mode1MetricsService } from '@/features/ask-expert/mode-1/services/mode1-metrics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

/**
 * GET /api/agents/[id]/stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: agentId } = await Promise.resolve(params);

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Calculate stats from Mode 1 metrics
    const mode1Stats = mode1MetricsService.getStats(60 * 24 * 7); // Last 7 days
    const agentMetrics = mode1Stats.byAgent.get(agentId);

    // Get agent from database for certifications and metadata
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, display_name, certifications, status')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      console.warn(`[Agent Stats] Agent ${agentId} not found`);
      // Return default stats if agent not found
      return NextResponse.json({
        success: true,
        data: getDefaultStats(),
      });
    }

    const recentFeedback = await fetchAgentFeedback(agentId);

    // Calculate statistics
    const stats: AgentStats = {
      totalConsultations: agentMetrics?.requestCount || 0,
      satisfactionScore: calculateSatisfactionScore(agentMetrics),
      successRate: agentMetrics ? agentMetrics.successRate * 100 : 0,
      averageResponseTime: agentMetrics ? agentMetrics.averageLatency / 1000 : 0, // Convert ms to seconds
      certifications: (agent.certifications as string[]) || [],
      totalTokensUsed: calculateTotalTokens(agentId, mode1Stats),
      totalCost: calculateTotalCost(agentId, mode1Stats),
      confidenceLevel: calculateConfidenceLevel(agentMetrics),
      availability: determineAvailability(agent.status, agentMetrics),
      recentFeedback,
    };

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
 * Calculate satisfaction score (0-5) based on metrics
 */
function calculateSatisfactionScore(
  agentMetrics?: { successRate: number; requestCount: number }
): number {
  if (!agentMetrics || agentMetrics.requestCount === 0) {
    return 0;
  }

  // Simple calculation: base score on success rate
  // In production, this would come from user feedback/satisfaction surveys
  const baseScore = agentMetrics.successRate * 5; // Convert 0-1 to 0-5
  
  // Adjust based on volume (more consultations = more reliable)
  const volumeAdjustment = Math.min(agentMetrics.requestCount / 100, 0.2); // Up to 0.2 bonus
  
  return Math.min(baseScore + volumeAdjustment, 5);
}

/**
 * Calculate total tokens used for agent (estimate from metrics)
 */
function calculateTotalTokens(agentId: string, stats: any): number {
  // This would typically come from a dedicated usage table
  // For now, estimate from metrics or return 0 if not tracked
  // TODO: Implement proper token tracking in Mode1Metrics
  return 0; // Placeholder - would need to track this in metrics
}

/**
 * Calculate total cost for agent (estimate)
 */
function calculateTotalCost(agentId: string, stats: any): number {
  // This would typically come from cost tracking
  // For now, return 0 if not tracked
  // TODO: Implement proper cost tracking in Mode1Metrics
  return 0; // Placeholder - would need to track this in metrics
}

/**
 * Calculate confidence level (0-100) based on metrics
 */
function calculateConfidenceLevel(
  agentMetrics?: { successRate: number; requestCount: number }
): number {
  if (!agentMetrics || agentMetrics.requestCount === 0) {
    return 0;
  }

  // Confidence based on:
  // - Success rate (0-70 points)
  // - Volume of consultations (0-30 points)
  const successScore = agentMetrics.successRate * 70;
  const volumeScore = Math.min(agentMetrics.requestCount / 10, 30);
  
  return Math.min(Math.round(successScore + volumeScore), 100);
}

/**
 * Determine availability status
 */
function determineAvailability(
  status: string,
  agentMetrics?: { requestCount: number }
): 'online' | 'busy' | 'offline' {
  if (status === 'deprecated' || status === 'development') {
    return 'offline';
  }

  // If agent has many recent requests, consider "busy"
  if (agentMetrics && agentMetrics.requestCount > 50) {
    return 'busy';
  }

  return 'online';
}

/**
 * Get default stats when agent not found or no metrics
 */
function getDefaultStats(): AgentStats {
  return {
    totalConsultations: 0,
    satisfactionScore: 0,
    successRate: 0,
    averageResponseTime: 0,
    certifications: [],
    totalTokensUsed: 0,
    totalCost: 0,
    confidenceLevel: 0,
    availability: 'offline',
    recentFeedback: [],
  };
}

async function fetchAgentFeedback(agentId: string): Promise<AgentFeedback[]> {
  try {
    const { data, error } = await supabase
      .from('agent_feedback')
      .select('id, rating, comment, user_id, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      rating: row.rating ?? 0,
      comment: row.comment ?? null,
      userId: row.user_id ?? null,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.warn('[Agent Stats] Failed to load feedback:', error);
    return [];
  }
}
