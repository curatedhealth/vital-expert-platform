import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get current timestamp
    const now = new Date();
    
    // Mock agent metrics data
    const metrics = {
      timestamp: now.toISOString(),
      agent_performance: {
        total_agents: 8,
        active_agents: 7,
        inactive_agents: 1,
        agent_uptime_percentage: 99.2,
        average_response_time_ms: 1250,
        total_requests_processed: 15420,
        successful_requests: 15280,
        failed_requests: 140,
        success_rate_percentage: 99.1
      },
      agent_breakdown: {
        'clinical_trial_agent': {
          requests_total: 4200,
          success_rate: 99.5,
          avg_response_time_ms: 1100,
          confidence_score: 0.94,
          accuracy_score: 0.96,
          uptime_percentage: 99.8,
          last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        'regulatory_agent': {
          requests_total: 3800,
          success_rate: 98.8,
          avg_response_time_ms: 1400,
          confidence_score: 0.92,
          accuracy_score: 0.94,
          uptime_percentage: 99.5,
          last_active: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        'medical_writer_agent': {
          requests_total: 3200,
          success_rate: 99.2,
          avg_response_time_ms: 1800,
          confidence_score: 0.89,
          accuracy_score: 0.91,
          uptime_percentage: 98.9,
          last_active: new Date(Date.now() - 1 * 60 * 1000).toISOString()
        },
        'pharmacovigilance_agent': {
          requests_total: 2800,
          success_rate: 98.5,
          avg_response_time_ms: 1600,
          confidence_score: 0.91,
          accuracy_score: 0.93,
          uptime_percentage: 99.1,
          last_active: new Date(Date.now() - 3 * 60 * 1000).toISOString()
        },
        'quality_assurance_agent': {
          requests_total: 2100,
          success_rate: 99.0,
          avg_response_time_ms: 1200,
          confidence_score: 0.93,
          accuracy_score: 0.95,
          uptime_percentage: 99.6,
          last_active: new Date(Date.now() - 4 * 60 * 1000).toISOString()
        },
        'medical_affairs_agent': {
          requests_total: 1800,
          success_rate: 98.7,
          avg_response_time_ms: 1350,
          confidence_score: 0.90,
          accuracy_score: 0.92,
          uptime_percentage: 99.3,
          last_active: new Date(Date.now() - 6 * 60 * 1000).toISOString()
        },
        'clinical_research_agent': {
          requests_total: 1520,
          success_rate: 99.3,
          avg_response_time_ms: 1500,
          confidence_score: 0.88,
          accuracy_score: 0.90,
          uptime_percentage: 98.7,
          last_active: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        }
      },
      collaboration_metrics: {
        multi_agent_collaborations_total: 450,
        cross_agent_referrals: 320,
        agent_handoff_success_rate: 97.8,
        collaboration_efficiency_score: 94.2,
        most_collaborative_agents: [
          { agent: 'clinical_trial_agent', collaborations: 120 },
          { agent: 'regulatory_agent', collaborations: 95 },
          { agent: 'medical_writer_agent', collaborations: 85 }
        ]
      },
      quality_metrics: {
        average_confidence_score: 0.91,
        average_accuracy_score: 0.93,
        user_satisfaction_score: 4.6,
        feedback_rating_distribution: {
          '5_stars': 85,
          '4_stars': 12,
          '3_stars': 2,
          '2_stars': 1,
          '1_star': 0
        },
        quality_improvement_trends: {
          confidence_score_trend: '+2.3%',
          accuracy_score_trend: '+1.8%',
          satisfaction_trend: '+0.4'
        }
      },
      usage_patterns: {
        peak_usage_hours: [9, 10, 11, 14, 15, 16],
        daily_active_agents: 6.8,
        weekly_active_agents: 7.2,
        monthly_active_agents: 7.5,
        most_used_agent: 'clinical_trial_agent',
        least_used_agent: 'clinical_research_agent'
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Agent metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
