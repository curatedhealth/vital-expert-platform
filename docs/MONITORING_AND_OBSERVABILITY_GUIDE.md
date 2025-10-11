# VITAL AI Monitoring & Observability Guide

## Overview

This guide provides comprehensive documentation for the VITAL AI monitoring and observability infrastructure, including setup, configuration, and usage instructions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monitoring Stack](#monitoring-stack)
3. [Setup Instructions](#setup-instructions)
4. [Metrics Collection](#metrics-collection)
5. [Dashboards](#dashboards)
6. [Alerting](#alerting)
7. [Logging](#logging)
8. [Tracing](#tracing)
9. [Security Monitoring](#security-monitoring)
10. [Healthcare-Specific Monitoring](#healthcare-specific-monitoring)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Architecture Overview

The VITAL AI monitoring system is built on a modern observability stack that provides comprehensive visibility into system performance, security, and compliance.

### Core Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Jaeger**: Distributed tracing
- **Elasticsearch**: Log storage and search
- **Kibana**: Log visualization
- **Redis**: Caching and session storage
- **Node Exporter**: System metrics
- **cAdvisor**: Container metrics

### Monitoring Layers

1. **Infrastructure Monitoring**: CPU, memory, disk, network
2. **Application Monitoring**: Request rates, response times, error rates
3. **Business Monitoring**: User engagement, clinical workflows, compliance
4. **Security Monitoring**: Authentication, authorization, threat detection
5. **Healthcare Monitoring**: PHI access, patient safety, regulatory compliance

## Monitoring Stack

### Prometheus Configuration

Prometheus is configured to scrape metrics from multiple sources:

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vital-ai-app'
    static_configs:
      - targets: ['host.docker.internal:3001']
    metrics_path: /api/metrics
```

### Grafana Dashboards

Pre-configured dashboards for different aspects of the system:

- **System Overview**: High-level system health and performance
- **Healthcare Dashboard**: PHI access, compliance, patient safety
- **Agent Performance**: Agent response times, accuracy, collaboration
- **RAG System**: Query performance, retrieval accuracy, cache hit rates
- **Security Dashboard**: Authentication, authorization, threat detection

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for application metrics)
- 8GB+ RAM recommended
- 50GB+ disk space for metrics storage

### Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd vital-ai
   ```

2. **Run the monitoring setup script**:
   ```bash
   ./scripts/setup-monitoring.sh
   ```

3. **Access the dashboards**:
   - Grafana: http://localhost:3000 (admin/admin123)
   - Prometheus: http://localhost:9090
   - Jaeger: http://localhost:16686
   - Kibana: http://localhost:5601

### Manual Setup

If you prefer to set up monitoring manually:

1. **Start the monitoring stack**:
   ```bash
   cd monitoring
   docker-compose up -d
   ```

2. **Configure your application** to expose metrics:
   ```typescript
   // In your Next.js app
   import { register } from 'prom-client';
   
   // Metrics will be available at /api/metrics
   ```

3. **Import Grafana dashboards** from `monitoring/grafana/dashboards/`

## Metrics Collection

### Application Metrics

The VITAL AI application exposes metrics at several endpoints:

- `/api/metrics` - General application metrics
- `/api/healthcare-metrics` - Healthcare-specific metrics
- `/api/agent-metrics` - Agent performance metrics
- `/api/rag-metrics` - RAG system metrics
- `/api/security-metrics` - Security and compliance metrics

### Key Metrics Categories

#### System Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `active_connections` - Active connections
- `memory_usage_bytes` - Memory usage

#### Agent Metrics
- `agent_response_duration_seconds` - Agent response time
- `agent_confidence_score` - Agent confidence
- `agent_accuracy_score` - Agent accuracy
- `multi_agent_collaborations_total` - Multi-agent collaborations

#### RAG Metrics
- `rag_query_duration_seconds` - RAG query duration
- `rag_retrieval_accuracy` - Retrieval accuracy
- `rag_cache_hit_rate` - Cache hit rate
- `rag_vector_search_duration_seconds` - Vector search time

#### Healthcare Metrics
- `phi_access_events_total` - PHI access events
- `patient_safety_score` - Patient safety score
- `hipaa_compliance_score` - HIPAA compliance score
- `clinical_decision_support_events_total` - Clinical decision support events

#### Security Metrics
- `authentication_attempts_total` - Authentication attempts
- `security_events_total` - Security events
- `data_breach_attempts_total` - Data breach attempts
- `vulnerability_scans_total` - Vulnerability scans

## Dashboards

### System Overview Dashboard

**URL**: http://localhost:3000/d/vital-overview

**Key Panels**:
- Request rate over time
- Response time percentiles
- Error rate percentage
- Memory and CPU usage
- Active connections

### Healthcare Dashboard

**URL**: http://localhost:3000/d/vital-healthcare

**Key Panels**:
- PHI access monitoring
- Patient safety metrics
- Compliance scores
- Clinical workflow efficiency
- Emergency system status

### Agent Performance Dashboard

**URL**: http://localhost:3000/d/vital-agents

**Key Panels**:
- Agent response times
- Confidence scores
- Accuracy metrics
- Multi-agent collaboration
- Tool usage statistics

### RAG System Dashboard

**URL**: http://localhost:3000/d/vital-rag

**Key Panels**:
- Query performance
- Retrieval accuracy
- Cache hit rates
- Vector search times
- Knowledge base coverage

### Security Dashboard

**URL**: http://localhost:3000/d/vital-security

**Key Panels**:
- Authentication metrics
- Security events
- Threat detection
- Compliance violations
- Access control violations

## Alerting

### Alert Rules

Alert rules are defined in `monitoring/prometheus/rules/vital-alerts.yml`:

#### Critical Alerts
- High error rate (>10% for 2 minutes)
- PHI access violations (immediate)
- HIPAA compliance breaches (immediate)
- Data breach attempts (immediate)

#### Warning Alerts
- High response time (>2s for 3 minutes)
- High memory usage (>90% for 5 minutes)
- High CPU usage (>80% for 5 minutes)
- Low agent confidence (<70% for 5 minutes)

#### Business Alerts
- Low user engagement (<10 sessions/hour)
- High API costs (>$100/hour)
- RAG performance degradation (>3s for 3 minutes)

### Alert Configuration

Alerts are configured with:
- **Severity levels**: critical, warning, info
- **Notification channels**: email, Slack, PagerDuty
- **Escalation policies**: based on severity and duration
- **Suppression rules**: to prevent alert fatigue

## Logging

### Log Aggregation

Logs are collected and stored in Elasticsearch:

- **Application logs**: Structured JSON logs
- **Access logs**: HTTP request/response logs
- **Audit logs**: Security and compliance events
- **Error logs**: Application errors and exceptions

### Log Levels

- **DEBUG**: Detailed diagnostic information
- **INFO**: General information about system operation
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failed operations
- **CRITICAL**: Critical errors requiring immediate attention

### Log Retention

- **Application logs**: 30 days (hot), 90 days (warm)
- **Audit logs**: 7 years (for HIPAA compliance)
- **Security logs**: 1 year
- **Error logs**: 90 days

## Tracing

### Distributed Tracing

Jaeger provides distributed tracing for request flows:

- **Service maps**: Visual representation of service dependencies
- **Trace analysis**: Detailed request flow analysis
- **Performance profiling**: Identify bottlenecks and slow operations
- **Error tracking**: Trace errors across service boundaries

### Trace Sampling

- **Default sampling**: 10% of requests
- **Healthcare operations**: 100% sampling for PHI operations
- **Emergency requests**: 100% sampling for emergency requests
- **Compliance operations**: 100% sampling for compliance operations

## Security Monitoring

### Authentication Monitoring

- Failed login attempts
- Account lockouts
- Password policy violations
- Multi-factor authentication events

### Authorization Monitoring

- Access control violations
- Privilege escalation attempts
- Resource access patterns
- Permission changes

### Threat Detection

- Suspicious activity patterns
- Anomaly detection
- Intrusion attempts
- Malware detection

### Compliance Monitoring

- HIPAA compliance tracking
- GDPR compliance monitoring
- SOX compliance auditing
- PCI DSS compliance validation

## Healthcare-Specific Monitoring

### PHI Access Monitoring

- PHI access events and patterns
- Data classification tracking
- Access authorization validation
- Data retention compliance

### Patient Safety Metrics

- Clinical decision support events
- Medication safety alerts
- Patient safety scores
- Clinical outcome tracking

### Regulatory Compliance

- HIPAA compliance scoring
- FDA compliance monitoring
- Audit trail completeness
- Compliance violation tracking

### Emergency System Monitoring

- Emergency response times
- System availability during emergencies
- Critical alert processing
- Disaster recovery readiness

## Troubleshooting

### Common Issues

#### Prometheus Not Scraping Metrics
1. Check if the application is running on the correct port
2. Verify the metrics endpoint is accessible
3. Check Prometheus configuration for correct targets
4. Review firewall settings

#### Grafana Dashboards Not Loading
1. Verify Prometheus datasource configuration
2. Check if metrics are being collected
3. Review dashboard JSON for syntax errors
4. Ensure proper permissions

#### High Memory Usage
1. Check for memory leaks in the application
2. Review Prometheus retention settings
3. Optimize query performance
4. Consider increasing memory limits

#### Missing Healthcare Metrics
1. Verify healthcare metrics endpoint is enabled
2. Check if PHI access logging is configured
3. Review compliance monitoring setup
4. Ensure proper data classification

### Performance Optimization

#### Prometheus Optimization
- Adjust scrape intervals based on metrics volume
- Configure appropriate retention periods
- Use recording rules for complex queries
- Implement metric relabeling for efficiency

#### Grafana Optimization
- Use query caching for frequently accessed dashboards
- Optimize dashboard queries
- Implement proper data source configuration
- Use appropriate time ranges for queries

## Best Practices

### Metrics Design

1. **Use meaningful metric names**: Clear, descriptive names
2. **Include relevant labels**: But avoid high cardinality
3. **Follow naming conventions**: Use consistent prefixes
4. **Document metrics**: Provide clear descriptions

### Dashboard Design

1. **Keep dashboards focused**: One dashboard per use case
2. **Use appropriate visualizations**: Choose the right chart type
3. **Include context**: Add descriptions and thresholds
4. **Test with real data**: Ensure dashboards work with actual metrics

### Alerting Best Practices

1. **Set appropriate thresholds**: Based on historical data
2. **Avoid alert fatigue**: Use proper grouping and suppression
3. **Include context**: Provide actionable information
4. **Test alerting**: Regularly verify alert delivery

### Security Considerations

1. **Secure metrics endpoints**: Use authentication and authorization
2. **Protect sensitive data**: Avoid exposing PHI in metrics
3. **Monitor access**: Track who accesses monitoring systems
4. **Regular updates**: Keep monitoring components updated

### Compliance Considerations

1. **Audit logging**: Log all monitoring system access
2. **Data retention**: Follow regulatory requirements
3. **Access controls**: Implement proper permissions
4. **Documentation**: Maintain compliance documentation

## Support and Maintenance

### Regular Maintenance Tasks

1. **Update monitoring components**: Keep software updated
2. **Review alert thresholds**: Adjust based on system changes
3. **Clean up old data**: Manage storage efficiently
4. **Backup configurations**: Save dashboard and alert configurations

### Monitoring the Monitoring

1. **Monitor monitoring system health**: Track Prometheus, Grafana, etc.
2. **Set up meta-alerts**: Alert when monitoring fails
3. **Regular testing**: Verify alerting and dashboards work
4. **Capacity planning**: Monitor storage and performance

### Getting Help

1. **Check logs**: Review application and monitoring logs
2. **Documentation**: Consult this guide and component docs
3. **Community**: Use Prometheus and Grafana communities
4. **Support**: Contact VITAL AI support team

---

For more information or support, please contact the VITAL AI team or refer to the individual component documentation.
