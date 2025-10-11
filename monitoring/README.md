# VITAL AI Monitoring Infrastructure

This directory contains the complete monitoring and observability infrastructure for the VITAL AI chat service.

## 🚀 Quick Start

```bash
# Start all monitoring services
./scripts/setup-monitoring.sh

# Or manually with Docker Compose
docker-compose up -d
```

## 📊 Monitoring Stack

| Component | Purpose | Port | URL |
|-----------|---------|------|-----|
| **Prometheus** | Metrics collection & storage | 9090 | http://localhost:9090 |
| **Grafana** | Dashboards & visualization | 3001 | http://localhost:3001 |
| **Jaeger** | Distributed tracing | 16686 | http://localhost:16686 |
| **Elasticsearch** | Log storage & search | 9200 | http://localhost:9200 |
| **Kibana** | Log visualization | 5601 | http://localhost:5601 |
| **Redis** | Caching & sessions | 6379 | redis://localhost:6379 |
| **Node Exporter** | System metrics | 9100 | http://localhost:9100 |
| **cAdvisor** | Container metrics | 8080 | http://localhost:8080 |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Prometheus    │───▶│    Grafana      │
│   (Port 3001)   │    │   (Port 9090)   │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Jaeger      │    │  Elasticsearch  │    │     Kibana      │
│   (Port 16686)  │    │   (Port 9200)   │    │   (Port 5601)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📈 Metrics Endpoints

The VITAL AI application exposes metrics at several endpoints:

- **General Metrics**: `http://localhost:3000/api/metrics` - System and application metrics
- **Healthcare Metrics**: `http://localhost:3000/api/healthcare-metrics` - PHI access, compliance, patient safety
- **Agent Metrics**: `http://localhost:3000/api/agent-metrics` - Agent performance and collaboration
- **RAG Metrics**: `http://localhost:3000/api/rag-metrics` - RAG system performance and accuracy
- **Security Metrics**: `http://localhost:3000/api/security-metrics` - Security events and compliance

## 🎯 Key Metrics Categories

### System Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `active_connections` - Current active connections
- `memory_usage_bytes` - Memory usage gauge

### Agent Metrics
- `agent_response_duration_seconds` - Agent response time
- `agent_confidence_score` - Agent confidence level
- `agent_accuracy_score` - Agent accuracy rating
- `multi_agent_collaborations_total` - Multi-agent collaboration events

### RAG Metrics
- `rag_query_duration_seconds` - RAG query processing time
- `rag_retrieval_accuracy` - Retrieval accuracy score
- `rag_cache_hit_rate` - Cache hit rate percentage
- `rag_vector_search_duration_seconds` - Vector search time

### Healthcare Metrics
- `phi_access_events_total` - PHI access events
- `patient_safety_score` - Patient safety score
- `hipaa_compliance_score` - HIPAA compliance score
- `clinical_decision_support_events_total` - Clinical decision support events

### Security Metrics
- `authentication_attempts_total` - Authentication attempts
- `security_events_total` - Security events detected
- `data_breach_attempts_total` - Data breach attempts
- `vulnerability_scans_total` - Vulnerability scans performed

## 📊 Pre-built Dashboards

### 1. System Overview
**URL**: http://localhost:3001/d/vital-overview
- Request rate and response times
- Error rates and system health
- Memory and CPU usage
- Active connections

### 2. Healthcare Dashboard
**URL**: http://localhost:3001/d/vital-healthcare
- PHI access monitoring
- Patient safety metrics
- Compliance scores
- Clinical workflow efficiency

### 3. Agent Performance
**URL**: http://localhost:3001/d/vital-agents
- Agent response times and accuracy
- Multi-agent collaboration metrics
- Tool usage statistics
- Confidence scores

### 4. RAG System
**URL**: http://localhost:3001/d/vital-rag
- Query performance metrics
- Retrieval accuracy
- Cache hit rates
- Knowledge base coverage

### 5. Security Dashboard
**URL**: http://localhost:3001/d/vital-security
- Authentication and authorization metrics
- Security events and threats
- Compliance violations
- Access control monitoring

## 🚨 Alerting Rules

### Critical Alerts
- **High Error Rate**: >10% for 2 minutes
- **PHI Access Violation**: Any unauthorized PHI access
- **HIPAA Compliance Breach**: Any compliance violation
- **Data Breach Attempt**: Any data breach attempt

### Warning Alerts
- **High Response Time**: >2s for 3 minutes
- **High Memory Usage**: >90% for 5 minutes
- **High CPU Usage**: >80% for 5 minutes
- **Low Agent Confidence**: <70% for 5 minutes

### Business Alerts
- **Low User Engagement**: <10 sessions/hour
- **High API Costs**: >$100/hour
- **RAG Performance Degradation**: >3s for 3 minutes

## 🔧 Configuration

### Environment Variables

```bash
# Prometheus Configuration
PROMETHEUS_RETENTION_TIME=90d
PROMETHEUS_STORAGE_PATH=/prometheus

# Grafana Configuration
GF_SECURITY_ADMIN_PASSWORD=admin123
GF_USERS_ALLOW_SIGN_UP=false

# Jaeger Configuration
COLLECTOR_OTLP_ENABLED=true

# Elasticsearch Configuration
ES_JAVA_OPTS=-Xms1g -Xmx1g
xpack.security.enabled=false

# Redis Configuration
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

### Prometheus Configuration

The Prometheus configuration is located in `prometheus/prometheus.yml` and includes:

- Scrape intervals and timeouts
- Alert rule definitions
- Target configurations for all services
- Healthcare-specific metric collection

### Grafana Configuration

Grafana is pre-configured with:

- Prometheus as the default datasource
- Pre-built dashboards for all system components
- Alert notification channels
- User management and permissions

## 🚀 Deployment

### Development

```bash
# Start monitoring stack
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Production

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale prometheus=2
```

### Kubernetes

```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n monitoring
```

## 🔍 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker status
docker ps -a

# Check logs
docker-compose logs [service-name]

# Restart services
docker-compose restart [service-name]
```

#### Metrics Not Appearing
1. Verify application is running on port 3001
2. Check Prometheus targets: http://localhost:9090/targets
3. Verify metrics endpoint: http://localhost:3001/api/metrics
4. Check firewall settings

#### Dashboards Not Loading
1. Verify Prometheus datasource in Grafana
2. Check if metrics are being collected
3. Review dashboard JSON for syntax errors
4. Ensure proper permissions

### Health Checks

```bash
# Prometheus health
curl http://localhost:9090/-/healthy

# Grafana health
curl http://localhost:3000/api/health

# Jaeger health
curl http://localhost:16686/api/services

# Elasticsearch health
curl http://localhost:9200/_cluster/health
```

## 📚 Documentation

- [Monitoring & Observability Guide](../docs/MONITORING_AND_OBSERVABILITY_GUIDE.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Deployment Guide](../docs/DEPLOYMENT_AND_OPERATIONS_GUIDE.md)

## 🛠️ Maintenance

### Regular Tasks

1. **Update Components**: Keep monitoring software updated
2. **Review Alerts**: Adjust thresholds based on system changes
3. **Clean Data**: Manage storage efficiently
4. **Backup Configs**: Save dashboard and alert configurations

### Monitoring the Monitoring

1. **Meta-alerts**: Alert when monitoring fails
2. **Regular Testing**: Verify alerting and dashboards work
3. **Capacity Planning**: Monitor storage and performance
4. **Health Checks**: Monitor monitoring system health

## 🤝 Support

For monitoring support:

- **Documentation**: Check the guides in `/docs`
- **Issues**: Create GitHub issues for bugs
- **Questions**: Use the community forum
- **Emergency**: Contact the VITAL AI team

## 📄 License

This monitoring infrastructure is part of the VITAL AI project and follows the same license terms.

---

**Happy Monitoring! 🎉**
