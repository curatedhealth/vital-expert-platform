import { NextRequest, NextResponse } from 'next/server';
import { register, Gauge, Counter, Histogram } from 'prom-client';

// Agent-specific metrics
const agentRegister = new register();

// Agent Performance Metrics
export const agentResponseTime = new Histogram({
  name: 'agent_response_duration_seconds',
  help: 'Duration of agent responses in seconds',
  labelNames: ['agent_name', 'agent_type', 'tier', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [agentRegister]
});

export const agentConfidenceScore = new Gauge({
  name: 'agent_confidence_score',
  help: 'Confidence score of agent responses (0-1)',
  labelNames: ['agent_name', 'agent_type', 'tier'],
  registers: [agentRegister]
});

export const agentAccuracy = new Gauge({
  name: 'agent_accuracy_score',
  help: 'Accuracy score of agent responses (0-1)',
  labelNames: ['agent_name', 'agent_type', 'domain'],
  registers: [agentRegister]
});

export const agentThroughput = new Gauge({
  name: 'agent_throughput_requests_per_second',
  help: 'Agent throughput in requests per second',
  labelNames: ['agent_name', 'agent_type'],
  registers: [agentRegister]
});

// Agent Selection Metrics
export const agentSelectionTime = new Histogram({
  name: 'agent_selection_duration_seconds',
  help: 'Duration of agent selection process in seconds',
  labelNames: ['selection_strategy', 'agent_count', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
  registers: [agentRegister]
});

export const agentSelectionAccuracy = new Gauge({
  name: 'agent_selection_accuracy',
  help: 'Accuracy of agent selection (0-1)',
  labelNames: ['selection_strategy', 'query_complexity'],
  registers: [agentRegister]
});

export const agentSelectionConfidence = new Gauge({
  name: 'agent_selection_confidence',
  help: 'Confidence in agent selection (0-1)',
  labelNames: ['selection_strategy', 'query_domain'],
  registers: [agentRegister]
});

// Agent Collaboration Metrics
export const multiAgentCollaborations = new Counter({
  name: 'multi_agent_collaborations_total',
  help: 'Total number of multi-agent collaborations',
  labelNames: ['collaboration_type', 'agent_count', 'success'],
  registers: [agentRegister]
});

export const agentConflictResolutions = new Counter({
  name: 'agent_conflict_resolutions_total',
  help: 'Total number of agent conflict resolutions',
  labelNames: ['resolution_strategy', 'conflict_type', 'success'],
  registers: [agentRegister]
});

export const agentConsensusBuilding = new Counter({
  name: 'agent_consensus_building_events_total',
  help: 'Total number of agent consensus building events',
  labelNames: ['consensus_strategy', 'participant_count', 'success'],
  registers: [agentRegister]
});

// Agent Tool Usage Metrics
export const agentToolUsage = new Counter({
  name: 'agent_tool_usage_total',
  help: 'Total number of agent tool usages',
  labelNames: ['agent_name', 'tool_name', 'success'],
  registers: [agentRegister]
});

export const agentToolResponseTime = new Histogram({
  name: 'agent_tool_response_duration_seconds',
  help: 'Duration of agent tool responses in seconds',
  labelNames: ['agent_name', 'tool_name', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [agentRegister]
});

export const agentToolAccuracy = new Gauge({
  name: 'agent_tool_accuracy',
  help: 'Accuracy of agent tool responses (0-1)',
  labelNames: ['agent_name', 'tool_name'],
  registers: [agentRegister]
});

// Agent Memory Metrics
export const agentMemoryUsage = new Gauge({
  name: 'agent_memory_usage_bytes',
  help: 'Agent memory usage in bytes',
  labelNames: ['agent_name', 'memory_type'],
  registers: [agentRegister]
});

export const agentContextRetrievalTime = new Histogram({
  name: 'agent_context_retrieval_duration_seconds',
  help: 'Duration of agent context retrieval in seconds',
  labelNames: ['agent_name', 'context_type', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [agentRegister]
});

export const agentLearningEvents = new Counter({
  name: 'agent_learning_events_total',
  help: 'Total number of agent learning events',
  labelNames: ['agent_name', 'learning_type', 'success'],
  registers: [agentRegister]
});

// Agent Domain Expertise Metrics
export const agentDomainExpertise = new Gauge({
  name: 'agent_domain_expertise_score',
  help: 'Agent domain expertise score (0-1)',
  labelNames: ['agent_name', 'domain', 'expertise_level'],
  registers: [agentRegister]
});

export const agentKnowledgeCoverage = new Gauge({
  name: 'agent_knowledge_coverage',
  help: 'Agent knowledge coverage (0-1)',
  labelNames: ['agent_name', 'knowledge_domain'],
  registers: [agentRegister]
});

export const agentSpecializationScore = new Gauge({
  name: 'agent_specialization_score',
  help: 'Agent specialization score (0-1)',
  labelNames: ['agent_name', 'specialization_area'],
  registers: [agentRegister]
});

// Agent Quality Metrics
export const agentResponseQuality = new Gauge({
  name: 'agent_response_quality_score',
  help: 'Agent response quality score (0-1)',
  labelNames: ['agent_name', 'quality_dimension'],
  registers: [agentRegister]
});

export const agentUserSatisfaction = new Gauge({
  name: 'agent_user_satisfaction_score',
  help: 'Agent user satisfaction score (0-1)',
  labelNames: ['agent_name', 'user_type'],
  registers: [agentRegister]
});

export const agentErrorRate = new Gauge({
  name: 'agent_error_rate',
  help: 'Agent error rate (0-1)',
  labelNames: ['agent_name', 'error_type'],
  registers: [agentRegister]
});

// Agent Orchestration Metrics
export const agentOrchestrationTime = new Histogram({
  name: 'agent_orchestration_duration_seconds',
  help: 'Duration of agent orchestration in seconds',
  labelNames: ['orchestration_type', 'agent_count', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [agentRegister]
});

export const agentOrchestrationSuccess = new Gauge({
  name: 'agent_orchestration_success_rate',
  help: 'Agent orchestration success rate (0-1)',
  labelNames: ['orchestration_type', 'complexity'],
  registers: [agentRegister]
});

export const agentLoadBalancing = new Gauge({
  name: 'agent_load_balancing_score',
  help: 'Agent load balancing score (0-1)',
  labelNames: ['load_balancing_strategy'],
  registers: [agentRegister]
});

// Agent Compliance Metrics
export const agentComplianceScore = new Gauge({
  name: 'agent_compliance_score',
  help: 'Agent compliance score (0-1)',
  labelNames: ['agent_name', 'compliance_standard'],
  registers: [agentRegister]
});

export const agentAuditEvents = new Counter({
  name: 'agent_audit_events_total',
  help: 'Total number of agent audit events',
  labelNames: ['agent_name', 'audit_type', 'compliance_status'],
  registers: [agentRegister]
});

export const agentSecurityEvents = new Counter({
  name: 'agent_security_events_total',
  help: 'Total number of agent security events',
  labelNames: ['agent_name', 'security_event_type', 'severity'],
  registers: [agentRegister]
});

// Agent Cost Metrics
export const agentCostPerQuery = new Gauge({
  name: 'agent_cost_per_query_usd',
  help: 'Agent cost per query in USD',
  labelNames: ['agent_name', 'agent_type', 'tier'],
  registers: [agentRegister]
});

export const agentTokenUsage = new Counter({
  name: 'agent_token_usage_total',
  help: 'Total agent token usage',
  labelNames: ['agent_name', 'token_type', 'model'],
  registers: [agentRegister]
});

export const agentResourceUtilization = new Gauge({
  name: 'agent_resource_utilization',
  help: 'Agent resource utilization (0-1)',
  labelNames: ['agent_name', 'resource_type'],
  registers: [agentRegister]
});

// Agent Versioning Metrics
export const agentVersionDeployments = new Counter({
  name: 'agent_version_deployments_total',
  help: 'Total number of agent version deployments',
  labelNames: ['agent_name', 'version', 'deployment_status'],
  registers: [agentRegister]
});

export const agentVersionPerformance = new Gauge({
  name: 'agent_version_performance_score',
  help: 'Agent version performance score (0-1)',
  labelNames: ['agent_name', 'version', 'metric_type'],
  registers: [agentRegister]
});

export const agentVersionRollbacks = new Counter({
  name: 'agent_version_rollbacks_total',
  help: 'Total number of agent version rollbacks',
  labelNames: ['agent_name', 'from_version', 'to_version'],
  registers: [agentRegister]
});

export async function GET(request: NextRequest) {
  try {
    const metrics = await agentRegister.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': agentRegister.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating agent metrics:', error);
    return new NextResponse('Error generating agent metrics', { status: 500 });
  }
}
