import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeComplianceMetrics = searchParams.get('include_compliance_metrics') === 'true';
    const includePhiMetrics = searchParams.get('include_phi_metrics') === 'true';
    
    // Get current timestamp
    const now = new Date();
    
    // Mock healthcare metrics data
    const metrics = {
      timestamp: now.toISOString(),
      phi_access: {
        total_phi_requests: 150,
        phi_access_events_total: 150,
        phi_access_by_department: {
          'clinical_research': 45,
          'regulatory_affairs': 30,
          'medical_affairs': 35,
          'quality_assurance': 25,
          'pharmacovigilance': 15
        },
        phi_access_trends: {
          last_24h: 12,
          last_7d: 89,
          last_30d: 150
        }
      },
      compliance: includeComplianceMetrics ? {
        hipaa_compliance_score: 98.5,
        gdpr_compliance_score: 97.2,
        fda_compliance_score: 99.1,
        compliance_audit_status: 'passed',
        last_audit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_audit_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        compliance_violations: 0,
        compliance_warnings: 2
      } : null,
      patient_safety: {
        patient_safety_score: 99.8,
        adverse_events_total: 0,
        near_misses_total: 1,
        safety_incidents_by_severity: {
          'low': 0,
          'medium': 0,
          'high': 0,
          'critical': 0
        },
        safety_trends: {
          last_24h: 0,
          last_7d: 0,
          last_30d: 1
        }
      },
      clinical_decision_support: {
        cds_events_total: 250,
        cds_recommendations_accepted: 240,
        cds_recommendations_rejected: 10,
        cds_accuracy_score: 96.0,
        cds_impact_score: 94.5,
        cds_usage_by_agent: {
          'clinical_trial_agent': 80,
          'regulatory_agent': 70,
          'medical_writer_agent': 60,
          'pharmacovigilance_agent': 40
        }
      },
      data_quality: {
        data_completeness_score: 97.8,
        data_accuracy_score: 98.2,
        data_consistency_score: 96.5,
        data_freshness_score: 99.1,
        quality_issues_total: 5,
        quality_issues_by_type: {
          'missing_required_fields': 2,
          'invalid_format': 1,
          'outdated_information': 2,
          'duplicate_entries': 0
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Healthcare metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching healthcare metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch healthcare metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
