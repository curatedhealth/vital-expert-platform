import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get current timestamp
    const now = new Date();
    
    // Mock security metrics data
    const metrics = {
      timestamp: now.toISOString(),
      authentication: {
        total_login_attempts: 2450,
        successful_logins: 2380,
        failed_logins: 70,
        login_success_rate: 97.1,
        active_sessions: 45,
        average_session_duration_minutes: 120,
        multi_factor_authentication_rate: 100,
        password_reset_requests: 12,
        account_lockouts: 3
      },
      authorization: {
        total_authorization_checks: 15420,
        successful_authorizations: 15380,
        failed_authorizations: 40,
        authorization_success_rate: 99.7,
        privilege_escalation_attempts: 0,
        unauthorized_access_attempts: 8,
        role_based_access_violations: 2
      },
      data_protection: {
        phi_access_events: 150,
        phi_access_violations: 0,
        data_encryption_coverage: 100,
        data_anonymization_rate: 95.8,
        data_retention_compliance: 99.2,
        data_breach_attempts: 0,
        data_leak_prevention_alerts: 3,
        sensitive_data_classification_score: 98.5
      },
      network_security: {
        total_requests: 125000,
        blocked_requests: 1250,
        suspicious_requests: 45,
        ddos_attempts: 0,
        malicious_ip_blocks: 8,
        ssl_tls_coverage: 100,
        network_intrusion_attempts: 2,
        firewall_blocks: 1250
      },
      application_security: {
        sql_injection_attempts: 0,
        xss_attempts: 0,
        csrf_attempts: 0,
        api_rate_limit_violations: 15,
        input_validation_failures: 8,
        security_header_compliance: 100,
        vulnerability_scans_completed: 12,
        critical_vulnerabilities: 0,
        high_vulnerabilities: 1,
        medium_vulnerabilities: 3,
        low_vulnerabilities: 7
      },
      compliance: {
        hipaa_compliance_score: 98.5,
        gdpr_compliance_score: 97.2,
        fda_compliance_score: 99.1,
        sox_compliance_score: 96.8,
        pci_dss_compliance_score: 100,
        compliance_audit_status: 'passed',
        last_compliance_audit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_compliance_audit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        compliance_violations: 0,
        compliance_warnings: 2
      },
      incident_response: {
        total_security_incidents: 5,
        resolved_incidents: 5,
        open_incidents: 0,
        average_resolution_time_hours: 2.5,
        incidents_by_severity: {
          'critical': 0,
          'high': 1,
          'medium': 2,
          'low': 2
        },
        false_positive_rate: 12.5,
        incident_response_time_minutes: 15
      },
      threat_intelligence: {
        known_threat_indicators: 1250,
        active_threats_blocked: 8,
        threat_intelligence_updates: 24,
        ioc_matches: 3,
        threat_hunting_queries: 45,
        threat_intelligence_accuracy: 94.2
      },
      user_behavior: {
        anomalous_user_behavior_detected: 3,
        privilege_escalation_attempts: 0,
        unusual_access_patterns: 2,
        data_exfiltration_attempts: 0,
        insider_threat_indicators: 0,
        user_risk_scores: {
          'low_risk': 42,
          'medium_risk': 3,
          'high_risk': 0
        }
      },
      security_training: {
        security_awareness_training_completed: 95,
        phishing_simulation_click_rate: 8.5,
        security_incident_reporting_rate: 100,
        security_policy_acknowledgment_rate: 100,
        last_security_training: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      trends: {
        security_incidents_trend: '-40%',
        failed_login_attempts_trend: '-15%',
        vulnerability_count_trend: '-25%',
        compliance_score_trend: '+2.1%',
        threat_detection_accuracy_trend: '+5.3%'
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Security metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch security metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
