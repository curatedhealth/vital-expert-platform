import { NextRequest, NextResponse } from 'next/server';
import { register as promRegister, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client';

// Initialize Prometheus metrics
const register = new promRegister();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom application metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

export const agentResponseTime = new Histogram({
  name: 'agent_response_duration_seconds',
  help: 'Duration of agent responses in seconds',
  labelNames: ['agent_name', 'agent_type', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register]
});

export const agentConfidenceScore = new Gauge({
  name: 'agent_confidence_score',
  help: 'Confidence score of agent responses',
  labelNames: ['agent_name', 'agent_type'],
  registers: [register]
});

export const ragQueryDuration = new Histogram({
  name: 'rag_query_duration_seconds',
  help: 'Duration of RAG queries in seconds',
  labelNames: ['query_type', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

export const ragQueryResults = new Counter({
  name: 'rag_query_results_total',
  help: 'Total number of RAG query results',
  labelNames: ['query_type', 'result_type'],
  registers: [register]
});

export const phiAccessViolations = new Counter({
  name: 'phi_access_violations_total',
  help: 'Total number of PHI access violations',
  labelNames: ['violation_type', 'severity'],
  registers: [register]
});

export const hipaaComplianceViolations = new Counter({
  name: 'hipaa_compliance_violations_total',
  help: 'Total number of HIPAA compliance violations',
  labelNames: ['violation_type', 'severity'],
  registers: [register]
});

export const userSessions = new Counter({
  name: 'user_sessions_total',
  help: 'Total number of user sessions',
  labelNames: ['session_type', 'user_type'],
  registers: [register]
});

export const apiCost = new Counter({
  name: 'api_cost_total',
  help: 'Total API costs in USD',
  labelNames: ['provider', 'model', 'operation'],
  registers: [register]
});

export const failedAuthenticationAttempts = new Counter({
  name: 'failed_authentication_attempts_total',
  help: 'Total number of failed authentication attempts',
  labelNames: ['attempt_type', 'ip_address'],
  registers: [register]
});

export const suspiciousActivity = new Counter({
  name: 'suspicious_activity_total',
  help: 'Total number of suspicious activities detected',
  labelNames: ['activity_type', 'severity'],
  registers: [register]
});

export const dataBreachAttempts = new Counter({
  name: 'data_breach_attempts_total',
  help: 'Total number of data breach attempts',
  labelNames: ['attempt_type', 'severity'],
  registers: [register]
});

// Healthcare-specific metrics
export const patientSafetyEvents = new Counter({
  name: 'patient_safety_events_total',
  help: 'Total number of patient safety events',
  labelNames: ['event_type', 'severity', 'agent_name'],
  registers: [register]
});

export const complianceAuditEvents = new Counter({
  name: 'compliance_audit_events_total',
  help: 'Total number of compliance audit events',
  labelNames: ['audit_type', 'compliance_status'],
  registers: [register]
});

export const emergencySystemAlerts = new Counter({
  name: 'emergency_system_alerts_total',
  help: 'Total number of emergency system alerts',
  labelNames: ['alert_type', 'severity'],
  registers: [register]
});

// Business metrics
export const userEngagement = new Gauge({
  name: 'user_engagement_score',
  help: 'User engagement score (0-100)',
  labelNames: ['user_type', 'time_period'],
  registers: [register]
});

export const clinicalWorkflowEfficiency = new Gauge({
  name: 'clinical_workflow_efficiency',
  help: 'Clinical workflow efficiency score (0-100)',
  labelNames: ['workflow_type', 'department'],
  registers: [register]
});

export const operationalEfficiency = new Gauge({
  name: 'operational_efficiency',
  help: 'Operational efficiency score (0-100)',
  labelNames: ['operation_type', 'department'],
  registers: [register]
});

// Memory and context metrics
export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['memory_type', 'agent_name'],
  registers: [register]
});

export const contextRetrievalTime = new Histogram({
  name: 'context_retrieval_duration_seconds',
  help: 'Duration of context retrieval in seconds',
  labelNames: ['context_type', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register]
});

// Agent collaboration metrics
export const multiAgentCollaborations = new Counter({
  name: 'multi_agent_collaborations_total',
  help: 'Total number of multi-agent collaborations',
  labelNames: ['collaboration_type', 'agent_count'],
  registers: [register]
});

export const agentConflictResolutions = new Counter({
  name: 'agent_conflict_resolutions_total',
  help: 'Total number of agent conflict resolutions',
  labelNames: ['resolution_strategy', 'success'],
  registers: [register]
});

// RAG system metrics
export const ragCacheHitRate = new Gauge({
  name: 'rag_cache_hit_rate',
  help: 'RAG cache hit rate (0-1)',
  labelNames: ['cache_type'],
  registers: [register]
});

export const ragVectorSearchTime = new Histogram({
  name: 'rag_vector_search_duration_seconds',
  help: 'Duration of vector search in seconds',
  labelNames: ['search_type', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register]
});

// Service discovery metrics
export const serviceHealthChecks = new Counter({
  name: 'service_health_checks_total',
  help: 'Total number of service health checks',
  labelNames: ['service_name', 'status'],
  registers: [register]
});

export const serviceResponseTime = new Histogram({
  name: 'service_response_duration_seconds',
  help: 'Duration of service responses in seconds',
  labelNames: ['service_name', 'endpoint'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Encryption and security metrics
export const encryptionOperations = new Counter({
  name: 'encryption_operations_total',
  help: 'Total number of encryption operations',
  labelNames: ['operation_type', 'algorithm', 'success'],
  registers: [register]
});

export const keyRotationEvents = new Counter({
  name: 'key_rotation_events_total',
  help: 'Total number of key rotation events',
  labelNames: ['key_type', 'success'],
  registers: [register]
});

// Alert tuning metrics
export const alertTuningRecommendations = new Counter({
  name: 'alert_tuning_recommendations_total',
  help: 'Total number of alert tuning recommendations',
  labelNames: ['recommendation_type', 'applied'],
  registers: [register]
});

export const falsePositiveReduction = new Gauge({
  name: 'false_positive_reduction_rate',
  help: 'False positive reduction rate (0-1)',
  registers: [register]
});

// Performance optimization metrics
export const queryOptimizations = new Counter({
  name: 'query_optimizations_total',
  help: 'Total number of query optimizations applied',
  labelNames: ['optimization_type', 'success'],
  registers: [register]
});

export const cacheOptimizations = new Counter({
  name: 'cache_optimizations_total',
  help: 'Total number of cache optimizations applied',
  labelNames: ['optimization_type', 'success'],
  registers: [register]
});

export const autoScalingEvents = new Counter({
  name: 'auto_scaling_events_total',
  help: 'Total number of auto-scaling events',
  labelNames: ['scaling_type', 'direction'],
  registers: [register]
});

// Data consistency metrics
export const dataConsistencyViolations = new Counter({
  name: 'data_consistency_violations_total',
  help: 'Total number of data consistency violations',
  labelNames: ['violation_type', 'severity'],
  registers: [register]
});

export const conflictResolutions = new Counter({
  name: 'conflict_resolutions_total',
  help: 'Total number of conflict resolutions',
  labelNames: ['resolution_strategy', 'success'],
  registers: [register]
});

export async function GET(request: NextRequest) {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}