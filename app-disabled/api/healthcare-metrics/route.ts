import { NextRequest, NextResponse } from 'next/server';
import { register, Gauge, Counter, Histogram } from 'prom-client';

// Healthcare-specific metrics
const healthcareRegister = new register();

// PHI Access Metrics
export const phiAccessMetrics = new Counter({
  name: 'phi_access_events_total',
  help: 'Total number of PHI access events',
  labelNames: ['access_type', 'user_role', 'compliance_status'],
  registers: [healthcareRegister]
});

export const phiDataVolume = new Gauge({
  name: 'phi_data_volume_bytes',
  help: 'Volume of PHI data processed in bytes',
  labelNames: ['data_type', 'processing_stage'],
  registers: [healthcareRegister]
});

// Patient Safety Metrics
export const patientSafetyScore = new Gauge({
  name: 'patient_safety_score',
  help: 'Patient safety score (0-100)',
  labelNames: ['department', 'time_period'],
  registers: [healthcareRegister]
});

export const clinicalDecisionSupportEvents = new Counter({
  name: 'clinical_decision_support_events_total',
  help: 'Total number of clinical decision support events',
  labelNames: ['event_type', 'severity', 'outcome'],
  registers: [healthcareRegister]
});

export const medicationSafetyEvents = new Counter({
  name: 'medication_safety_events_total',
  help: 'Total number of medication safety events',
  labelNames: ['event_type', 'severity', 'medication_class'],
  registers: [healthcareRegister]
});

// Compliance Metrics
export const hipaaComplianceScore = new Gauge({
  name: 'hipaa_compliance_score',
  help: 'HIPAA compliance score (0-100)',
  labelNames: ['compliance_area', 'time_period'],
  registers: [healthcareRegister]
});

export const gdprComplianceScore = new Gauge({
  name: 'gdpr_compliance_score',
  help: 'GDPR compliance score (0-100)',
  labelNames: ['compliance_area', 'time_period'],
  registers: [healthcareRegister]
});

export const fdaComplianceScore = new Gauge({
  name: 'fda_compliance_score',
  help: 'FDA compliance score (0-100)',
  labelNames: ['compliance_area', 'device_class'],
  registers: [healthcareRegister]
});

export const auditTrailEvents = new Counter({
  name: 'audit_trail_events_total',
  help: 'Total number of audit trail events',
  labelNames: ['event_type', 'user_role', 'compliance_status'],
  registers: [healthcareRegister]
});

// Emergency System Metrics
export const emergencyResponseTime = new Histogram({
  name: 'emergency_response_duration_seconds',
  help: 'Duration of emergency responses in seconds',
  labelNames: ['emergency_type', 'severity', 'response_team'],
  buckets: [1, 5, 10, 30, 60, 300, 600],
  registers: [healthcareRegister]
});

export const emergencySystemAvailability = new Gauge({
  name: 'emergency_system_availability',
  help: 'Emergency system availability (0-1)',
  labelNames: ['system_component'],
  registers: [healthcareRegister]
});

export const criticalAlerts = new Counter({
  name: 'critical_alerts_total',
  help: 'Total number of critical alerts',
  labelNames: ['alert_type', 'severity', 'response_time'],
  registers: [healthcareRegister]
});

// Clinical Workflow Metrics
export const clinicalWorkflowDuration = new Histogram({
  name: 'clinical_workflow_duration_seconds',
  help: 'Duration of clinical workflows in seconds',
  labelNames: ['workflow_type', 'department', 'complexity'],
  buckets: [60, 300, 900, 1800, 3600, 7200],
  registers: [healthcareRegister]
});

export const clinicalDecisionAccuracy = new Gauge({
  name: 'clinical_decision_accuracy',
  help: 'Clinical decision accuracy (0-1)',
  labelNames: ['decision_type', 'agent_name'],
  registers: [healthcareRegister]
});

export const treatmentRecommendationAdoption = new Gauge({
  name: 'treatment_recommendation_adoption_rate',
  help: 'Treatment recommendation adoption rate (0-1)',
  labelNames: ['recommendation_type', 'department'],
  registers: [healthcareRegister]
});

// Quality Metrics
export const careQualityScore = new Gauge({
  name: 'care_quality_score',
  help: 'Care quality score (0-100)',
  labelNames: ['quality_dimension', 'department'],
  registers: [healthcareRegister]
});

export const patientSatisfactionScore = new Gauge({
  name: 'patient_satisfaction_score',
  help: 'Patient satisfaction score (0-100)',
  labelNames: ['service_type', 'department'],
  registers: [healthcareRegister]
});

export const clinicalOutcomeMetrics = new Gauge({
  name: 'clinical_outcome_metrics',
  help: 'Clinical outcome metrics',
  labelNames: ['outcome_type', 'measurement_period'],
  registers: [healthcareRegister]
});

// Regulatory Metrics
export const regulatorySubmissionEvents = new Counter({
  name: 'regulatory_submission_events_total',
  help: 'Total number of regulatory submission events',
  labelNames: ['submission_type', 'regulatory_body', 'status'],
  registers: [healthcareRegister]
});

export const complianceTrainingEvents = new Counter({
  name: 'compliance_training_events_total',
  help: 'Total number of compliance training events',
  labelNames: ['training_type', 'user_role', 'completion_status'],
  registers: [healthcareRegister]
});

export const riskAssessmentEvents = new Counter({
  name: 'risk_assessment_events_total',
  help: 'Total number of risk assessment events',
  labelNames: ['risk_type', 'severity', 'mitigation_status'],
  registers: [healthcareRegister]
});

// Data Governance Metrics
export const dataRetentionCompliance = new Gauge({
  name: 'data_retention_compliance_rate',
  help: 'Data retention compliance rate (0-1)',
  labelNames: ['data_type', 'retention_policy'],
  registers: [healthcareRegister]
});

export const dataQualityScore = new Gauge({
  name: 'data_quality_score',
  help: 'Data quality score (0-100)',
  labelNames: ['data_type', 'quality_dimension'],
  registers: [healthcareRegister]
});

export const dataLineageEvents = new Counter({
  name: 'data_lineage_events_total',
  help: 'Total number of data lineage events',
  labelNames: ['event_type', 'data_classification'],
  registers: [healthcareRegister]
});

// Security Metrics
export const securityIncidentEvents = new Counter({
  name: 'security_incident_events_total',
  help: 'Total number of security incident events',
  labelNames: ['incident_type', 'severity', 'resolution_status'],
  registers: [healthcareRegister]
});

export const vulnerabilityScanEvents = new Counter({
  name: 'vulnerability_scan_events_total',
  help: 'Total number of vulnerability scan events',
  labelNames: ['scan_type', 'severity', 'remediation_status'],
  registers: [healthcareRegister]
});

export const accessControlViolations = new Counter({
  name: 'access_control_violations_total',
  help: 'Total number of access control violations',
  labelNames: ['violation_type', 'severity', 'user_role'],
  registers: [healthcareRegister]
});

// Business Continuity Metrics
export const systemUptime = new Gauge({
  name: 'system_uptime_percentage',
  help: 'System uptime percentage',
  labelNames: ['system_component', 'time_period'],
  registers: [healthcareRegister]
});

export const disasterRecoveryEvents = new Counter({
  name: 'disaster_recovery_events_total',
  help: 'Total number of disaster recovery events',
  labelNames: ['event_type', 'severity', 'recovery_time'],
  registers: [healthcareRegister]
});

export const backupCompliance = new Gauge({
  name: 'backup_compliance_rate',
  help: 'Backup compliance rate (0-1)',
  labelNames: ['backup_type', 'retention_policy'],
  registers: [healthcareRegister]
});

export async function GET(request: NextRequest) {
  try {
    const metrics = await healthcareRegister.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': healthcareRegister.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating healthcare metrics:', error);
    return new NextResponse('Error generating healthcare metrics', { status: 500 });
  }
}
