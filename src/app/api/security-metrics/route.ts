import { NextRequest, NextResponse } from 'next/server';
import { register, Gauge, Counter, Histogram } from 'prom-client';

// Security-specific metrics
const securityRegister = new register();

// Authentication Metrics
export const authenticationAttempts = new Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['attempt_type', 'success', 'user_type'],
  registers: [securityRegister]
});

export const failedAuthenticationAttempts = new Counter({
  name: 'failed_authentication_attempts_total',
  help: 'Total number of failed authentication attempts',
  labelNames: ['attempt_type', 'failure_reason', 'ip_address'],
  registers: [securityRegister]
});

export const authenticationSuccessRate = new Gauge({
  name: 'authentication_success_rate',
  help: 'Authentication success rate (0-1)',
  labelNames: ['user_type', 'time_period'],
  registers: [securityRegister]
});

export const sessionDuration = new Histogram({
  name: 'session_duration_seconds',
  help: 'Duration of user sessions in seconds',
  labelNames: ['user_type', 'session_type'],
  buckets: [60, 300, 900, 1800, 3600, 7200, 14400],
  registers: [securityRegister]
});

// Authorization Metrics
export const authorizationChecks = new Counter({
  name: 'authorization_checks_total',
  help: 'Total number of authorization checks',
  labelNames: ['resource_type', 'action', 'result'],
  registers: [securityRegister]
});

export const authorizationViolations = new Counter({
  name: 'authorization_violations_total',
  help: 'Total number of authorization violations',
  labelNames: ['violation_type', 'severity', 'user_role'],
  registers: [securityRegister]
});

export const accessControlViolations = new Counter({
  name: 'access_control_violations_total',
  help: 'Total number of access control violations',
  labelNames: ['violation_type', 'severity', 'resource_type'],
  registers: [securityRegister]
});

// Security Event Metrics
export const securityEvents = new Counter({
  name: 'security_events_total',
  help: 'Total number of security events',
  labelNames: ['event_type', 'severity', 'source'],
  registers: [securityRegister]
});

export const suspiciousActivity = new Counter({
  name: 'suspicious_activity_total',
  help: 'Total number of suspicious activities detected',
  labelNames: ['activity_type', 'severity', 'confidence'],
  registers: [securityRegister]
});

export const securityIncidents = new Counter({
  name: 'security_incidents_total',
  help: 'Total number of security incidents',
  labelNames: ['incident_type', 'severity', 'status'],
  registers: [securityRegister]
});

// Data Protection Metrics
export const dataBreachAttempts = new Counter({
  name: 'data_breach_attempts_total',
  help: 'Total number of data breach attempts',
  labelNames: ['attempt_type', 'severity', 'data_classification'],
  registers: [securityRegister]
});

export const dataLeakageEvents = new Counter({
  name: 'data_leakage_events_total',
  help: 'Total number of data leakage events',
  labelNames: ['leakage_type', 'severity', 'data_type'],
  registers: [securityRegister]
});

export const phiAccessViolations = new Counter({
  name: 'phi_access_violations_total',
  help: 'Total number of PHI access violations',
  labelNames: ['violation_type', 'severity', 'user_role'],
  registers: [securityRegister]
});

// Encryption Metrics
export const encryptionOperations = new Counter({
  name: 'encryption_operations_total',
  help: 'Total number of encryption operations',
  labelNames: ['operation_type', 'algorithm', 'key_size', 'success'],
  registers: [securityRegister]
});

export const encryptionKeyRotations = new Counter({
  name: 'encryption_key_rotations_total',
  help: 'Total number of encryption key rotations',
  labelNames: ['key_type', 'success', 'rotation_reason'],
  registers: [securityRegister]
});

export const encryptionKeyUsage = new Gauge({
  name: 'encryption_key_usage_count',
  help: 'Current usage count of encryption keys',
  labelNames: ['key_type', 'key_id'],
  registers: [securityRegister]
});

// Vulnerability Metrics
export const vulnerabilityScans = new Counter({
  name: 'vulnerability_scans_total',
  help: 'Total number of vulnerability scans',
  labelNames: ['scan_type', 'target_type', 'severity'],
  registers: [securityRegister]
});

export const vulnerabilitiesDetected = new Counter({
  name: 'vulnerabilities_detected_total',
  help: 'Total number of vulnerabilities detected',
  labelNames: ['vulnerability_type', 'severity', 'component'],
  registers: [securityRegister]
});

export const vulnerabilityRemediationTime = new Histogram({
  name: 'vulnerability_remediation_duration_hours',
  help: 'Duration of vulnerability remediation in hours',
  labelNames: ['vulnerability_type', 'severity'],
  buckets: [1, 24, 72, 168, 336, 720, 1440],
  registers: [securityRegister]
});

// Network Security Metrics
export const networkConnections = new Counter({
  name: 'network_connections_total',
  help: 'Total number of network connections',
  labelNames: ['connection_type', 'protocol', 'success'],
  registers: [securityRegister]
});

export const networkIntrusions = new Counter({
  name: 'network_intrusions_total',
  help: 'Total number of network intrusions detected',
  labelNames: ['intrusion_type', 'severity', 'source_ip'],
  registers: [securityRegister]
});

export const ddosAttacks = new Counter({
  name: 'ddos_attacks_total',
  help: 'Total number of DDoS attacks detected',
  labelNames: ['attack_type', 'severity', 'duration_minutes'],
  registers: [securityRegister]
});

// Compliance Metrics
export const complianceViolations = new Counter({
  name: 'compliance_violations_total',
  help: 'Total number of compliance violations',
  labelNames: ['compliance_standard', 'violation_type', 'severity'],
  registers: [securityRegister]
});

export const hipaaComplianceScore = new Gauge({
  name: 'hipaa_compliance_score',
  help: 'HIPAA compliance score (0-1)',
  labelNames: ['compliance_area', 'time_period'],
  registers: [securityRegister]
});

export const gdprComplianceScore = new Gauge({
  name: 'gdpr_compliance_score',
  help: 'GDPR compliance score (0-1)',
  labelNames: ['compliance_area', 'time_period'],
  registers: [securityRegister]
});

export const auditTrailEvents = new Counter({
  name: 'audit_trail_events_total',
  help: 'Total number of audit trail events',
  labelNames: ['event_type', 'user_role', 'compliance_status'],
  registers: [securityRegister]
});

// Threat Intelligence Metrics
export const threatIntelligenceUpdates = new Counter({
  name: 'threat_intelligence_updates_total',
  help: 'Total number of threat intelligence updates',
  labelNames: ['threat_type', 'source', 'confidence'],
  registers: [securityRegister]
});

export const threatDetections = new Counter({
  name: 'threat_detections_total',
  help: 'Total number of threat detections',
  labelNames: ['threat_type', 'severity', 'detection_method'],
  registers: [securityRegister]
});

export const threatResponseTime = new Histogram({
  name: 'threat_response_duration_seconds',
  help: 'Duration of threat response in seconds',
  labelNames: ['threat_type', 'response_action'],
  buckets: [1, 5, 15, 60, 300, 900, 3600],
  registers: [securityRegister]
});

// Security Training Metrics
export const securityTrainingEvents = new Counter({
  name: 'security_training_events_total',
  help: 'Total number of security training events',
  labelNames: ['training_type', 'user_role', 'completion_status'],
  registers: [securityRegister]
});

export const securityAwarenessScore = new Gauge({
  name: 'security_awareness_score',
  help: 'Security awareness score (0-1)',
  labelNames: ['user_role', 'time_period'],
  registers: [securityRegister]
});

export const phishingSimulationResults = new Counter({
  name: 'phishing_simulation_results_total',
  help: 'Total number of phishing simulation results',
  labelNames: ['simulation_type', 'user_role', 'outcome'],
  registers: [securityRegister]
});

// Incident Response Metrics
export const incidentResponseTime = new Histogram({
  name: 'incident_response_duration_seconds',
  help: 'Duration of incident response in seconds',
  labelNames: ['incident_type', 'severity', 'response_team'],
  buckets: [60, 300, 900, 1800, 3600, 7200, 14400],
  registers: [securityRegister]
});

export const incidentResolutionTime = new Histogram({
  name: 'incident_resolution_duration_seconds',
  help: 'Duration of incident resolution in seconds',
  labelNames: ['incident_type', 'severity', 'resolution_method'],
  buckets: [300, 900, 1800, 3600, 7200, 14400, 28800],
  registers: [securityRegister]
});

export const incidentEscalations = new Counter({
  name: 'incident_escalations_total',
  help: 'Total number of incident escalations',
  labelNames: ['incident_type', 'escalation_level', 'reason'],
  registers: [securityRegister]
});

// Security Monitoring Metrics
export const securityMonitoringCoverage = new Gauge({
  name: 'security_monitoring_coverage',
  help: 'Security monitoring coverage (0-1)',
  labelNames: ['monitoring_type', 'component'],
  registers: [securityRegister]
});

export const securityAlertAccuracy = new Gauge({
  name: 'security_alert_accuracy',
  help: 'Security alert accuracy (0-1)',
  labelNames: ['alert_type', 'detection_method'],
  registers: [securityRegister]
});

export const falsePositiveRate = new Gauge({
  name: 'false_positive_rate',
  help: 'False positive rate (0-1)',
  labelNames: ['alert_type', 'detection_method'],
  registers: [securityRegister]
});

export async function GET(request: NextRequest) {
  try {
    const metrics = await securityRegister.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': securityRegister.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating security metrics:', error);
    return new NextResponse('Error generating security metrics', { status: 500 });
  }
}
