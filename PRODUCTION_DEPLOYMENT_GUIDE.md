# AgentOS 3.0 - Production Deployment Guide

**Version**: 1.0  
**Date**: November 23, 2025  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migrations](#database-migrations)
4. [Data Loading](#data-loading)
5. [Service Deployment](#service-deployment)
6. [Monitoring Setup](#monitoring-setup)
7. [Testing & Verification](#testing-verification)
8. [Production Cutover](#production-cutover)
9. [Rollback Plan](#rollback-plan)
10. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

### Infrastructure Ready
- [ ] PostgreSQL (Supabase) - Connection verified
- [ ] Neo4j (Aura) - Connection verified
- [ ] Pinecone - API key validated
- [ ] Elasticsearch - Optional, can skip initially
- [ ] Redis - For rate limiting and caching
- [ ] Prometheus - For metrics collection
- [ ] Grafana - For dashboards

### Dependencies Installed
- [ ] Python 3.13+ installed
- [ ] All packages in requirements: `pip install -r requirements.txt`
- [ ] Key packages verified:
  ```bash
  python3 -c "
  import langgraph, langchain, openai, pinecone, neo4j, asyncpg
  import scipy, prometheus_client, structlog
  print('✅ All dependencies installed')
  "
  ```

### Code Ready
- [ ] Latest code pulled from repository
- [ ] All migrations present in `supabase/migrations/`
- [ ] Environment variables configured
- [ ] SSL certificates (if needed)

---

## 🔐 Environment Setup

### 1. Create `.env` File

```bash
# Create environment file
cat > .env << 'EOF'
# =============================================================================
# AgentOS 3.0 Production Environment Variables
# =============================================================================

# Database (PostgreSQL via Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
NEW_SUPABASE_SERVICE_KEY=your_service_key_here  # For compatibility

# Neo4j (Graph Database)
NEO4J_URI=bolt://your-neo4j-instance:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Pinecone (Vector Database)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=agentos-vectors

# OpenAI (Embeddings & LLM)
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_org_id

# Cohere (Optional - Reranking)
COHERE_API_KEY=your_cohere_api_key

# Redis (Rate Limiting & Caching)
REDIS_URL=redis://localhost:6379

# Prometheus (Metrics)
PROMETHEUS_PORT=9090

# Application
ENV=production
LOG_LEVEL=INFO
PORT=8000

# Security
JWT_SECRET=your_jwt_secret_here_minimum_32_chars
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Monitoring
SENTRY_DSN=your_sentry_dsn  # Optional
LANGFUSE_PUBLIC_KEY=your_langfuse_key  # Optional
LANGFUSE_SECRET_KEY=your_langfuse_secret  # Optional

EOF
```

### 2. Secure Environment File

```bash
# Set restrictive permissions
chmod 600 .env

# Never commit .env to git
echo ".env" >> .gitignore
```

---

## 🗄️ Database Migrations

### Step 1: Run All Migrations in Order

```bash
cd /path/to/VITAL_path/YXdjF

# Migrations to run (in order):
# 1. Agent graph tables
# 2. Agent knowledge domains
# 3. Agent tools population
# 4. Evidence-based selection tables
# 5. Monitoring tables

# Run via Supabase Dashboard SQL Editor:
```

**Migration Order**:

1. **Agent Graph Tables** (Phase 2)
   - File: `supabase/migrations/20251123_create_agent_graph_tables.sql`
   - Tables: `agent_graphs`, `agent_graph_nodes`, `agent_graph_edges`, `agent_hierarchies`

2. **Agent Knowledge Domains** (Phase 0)
   - File: `supabase/migrations/20251123_create_agent_knowledge_domains.sql`
   - Table: `agent_knowledge_domains`

3. **Agent Tools Population** (Phase 0)
   - File: `supabase/migrations/20251123_populate_agent_tools.sql`
   - Populates: `agent_tool_assignments`

4. **Evidence-Based Selection** (Phase 3)
   - File: `supabase/migrations/20251123_create_evidence_based_tables.sql`
   - Tables: `agent_tiers`, `agent_performance_metrics`, `agent_selection_logs`

5. **Monitoring Tables** (Phase 5)
   - File: `supabase/migrations/20251123_create_monitoring_tables.sql`
   - Tables: `agent_interaction_logs`, `agent_diagnostic_metrics`, `agent_drift_alerts`, `agent_fairness_metrics`

### Step 2: Seed Data

```bash
# 1. Seed skills
psql $SUPABASE_URL < database/seeds/data/skills_from_folder.sql

# 2. Seed KG metadata
psql $SUPABASE_URL < database/seeds/data/kg_metadata_seed.sql
```

### Step 3: Verify Migrations

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'agent%'
ORDER BY table_name;

-- Expected tables (12 total):
-- agent_diagnostic_metrics
-- agent_drift_alerts
-- agent_fairness_metrics
-- agent_graph_edges
-- agent_graph_nodes
-- agent_graphs
-- agent_hierarchies
-- agent_interaction_logs
-- agent_knowledge_domains
-- agent_performance_metrics
-- agent_selection_logs
-- agent_tiers
-- agent_tool_assignments
-- ... (plus other existing tables)
```

---

## 📊 Data Loading

### Step 1: Load Agents to Pinecone

```bash
cd services/ai-engine

# Option A: Use helper script
./scripts/run_pinecone.sh

# Option B: Direct execution
export $(grep -v '^#' ../../.env | grep -E '^(SUPABASE_URL|SUPABASE_SERVICE_KEY|PINECONE_API_KEY|OPENAI_API_KEY)=' | xargs)
python3 scripts/load_agents_to_pinecone.py
```

**Expected Output**:
```
✅ Loaded 50 agents to Pinecone
✅ Generated 50 embeddings
✅ Upserted to index: agentos-vectors
```

### Step 2: Load Agents to Neo4j

```bash
# Option A: Use helper script
./scripts/run_neo4j.sh

# Option B: Direct execution
export $(grep -v '^#' ../../.env | grep -E '^(NEO4J_URI|NEO4J_USER|NEO4J_PASSWORD|SUPABASE_URL|SUPABASE_SERVICE_KEY)=' | xargs)
python3 scripts/load_agents_to_neo4j.py
```

**Expected Output**:
```
✅ Created 50 agent nodes
✅ Created 120 skill relationships
✅ Created 80 tool relationships
✅ Created 30 knowledge domain relationships
✅ Created 25 hierarchy relationships
```

### Step 3: Verify Data Loading

```bash
python3 scripts/verify_data_loading.py
```

**Expected Output**:
```
✅ Pinecone: 50 vectors
✅ Neo4j: 50 agent nodes, 255 relationships
✅ PostgreSQL: 50 agents, 12 skills, 8 tools
```

---

## 🚀 Service Deployment

### Step 1: Build Docker Image (Optional)

```bash
cd services/ai-engine

# Build image
docker build -t agentos-ai-engine:1.0 .

# Test locally
docker run -p 8000:8000 \
  --env-file ../../.env \
  agentos-ai-engine:1.0
```

### Step 2: Deploy to Production

**Option A: Railway/Render/Heroku**

```bash
# Push to Railway
railway up

# Or Render
render deploy

# Or Heroku
git push heroku main
```

**Option B: Kubernetes**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentos-ai-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agentos
  template:
    metadata:
      labels:
        app: agentos
    spec:
      containers:
      - name: ai-engine
        image: agentos-ai-engine:1.0
        ports:
        - containerPort: 8000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: agentos-secrets
              key: supabase-url
        # ... other env vars
```

```bash
# Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

**Option C: Traditional Server**

```bash
# Install systemd service
sudo cp deploy/agentos.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable agentos
sudo systemctl start agentos

# Check status
sudo systemctl status agentos
```

### Step 3: Verify Service Health

```bash
# Health check
curl https://your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "version": "3.0.0",
  "timestamp": "2025-11-23T12:00:00Z"
}
```

---

## 📈 Monitoring Setup

### Step 1: Configure Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'agentos'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

```bash
# Start Prometheus
prometheus --config.file=prometheus.yml
```

### Step 2: Import Grafana Dashboards

1. Access Grafana: `http://localhost:3000`
2. Add Prometheus data source:
   - URL: `http://localhost:9090`
   - Access: Server
3. Import dashboards:
   - Go to: Create → Import
   - Upload JSON files from `services/ai-engine/grafana-dashboards/`:
     - `agentos-performance.json`
     - `agentos-quality.json`
     - `agentos-safety.json`
     - `agentos-fairness.json`

### Step 3: Configure Alerts

```yaml
# alerting_rules.yml
groups:
  - name: agentos_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(agentos_requests_total{success="false"}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
      
      - alert: LowAccuracy
        expr: avg(agentos_diagnostic_accuracy) < 0.85
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Agent accuracy below threshold"
      
      - alert: FairnessViolation
        expr: increase(agentos_fairness_violations_total[1h]) > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Fairness violations detected"
```

---

## 🧪 Testing & Verification

### Step 1: Smoke Tests

```bash
# Run smoke tests
pytest tests/integration/test_complete_agentos_flow.py -v -k "smoke"
```

### Step 2: End-to-End Tests

```bash
# Run full E2E tests
pytest tests/integration/test_complete_agentos_flow.py -v
```

### Step 3: Load Testing

```bash
# Install locust
pip install locust

# Run load test (100 concurrent users)
locust -f tests/load/locustfile.py \
  --host https://your-domain.com \
  --users 100 \
  --spawn-rate 10 \
  --run-time 5m
```

**Expected Performance**:
- Tier 1: < 5s response time
- Tier 2: < 30s response time
- Tier 3: < 120s response time
- Success rate: > 99%

---

## 🎬 Production Cutover

### Step 1: Pre-Cutover Checklist

- [ ] All migrations successful
- [ ] Data loaded to all databases
- [ ] Service deployed and healthy
- [ ] Monitoring dashboards operational
- [ ] Smoke tests passing
- [ ] Load tests passing
- [ ] Rollback plan ready
- [ ] Team briefed
- [ ] Incident response ready

### Step 2: Gradual Rollout (Canary Deployment)

```bash
# 1. Route 5% traffic to new version
# 2. Monitor for 1 hour
# 3. If stable, route 25% traffic
# 4. Monitor for 2 hours
# 5. If stable, route 50% traffic
# 6. Monitor for 4 hours
# 7. If stable, route 100% traffic
```

### Step 3: Post-Cutover Monitoring

**Monitor for 24 hours**:
- [ ] Error rates < 1%
- [ ] Response times within SLA
- [ ] No fairness violations
- [ ] No drift alerts
- [ ] Database performance stable
- [ ] No memory leaks
- [ ] Cost within budget

---

## 🔄 Rollback Plan

### When to Rollback

Rollback if ANY of these occur:
- Error rate > 5%
- Response times exceed 2x normal
- Multiple fairness violations
- Critical drift alerts
- Database corruption
- Service crashes repeatedly

### Rollback Procedure

```bash
# 1. Immediate: Route traffic to old version
kubectl set image deployment/agentos ai-engine=agentos-ai-engine:previous

# 2. Verify old version stable
curl https://your-domain.com/health

# 3. Investigate issue
kubectl logs deployment/agentos

# 4. Document incident
# 5. Plan fix
# 6. Re-deploy when ready
```

---

## 📋 Post-Deployment

### Week 1: Daily Checks

- [ ] Review error logs
- [ ] Check Grafana dashboards
- [ ] Verify fairness metrics
- [ ] Review drift alerts
- [ ] Check cost tracking
- [ ] User feedback review

### Week 2-4: Weekly Checks

- [ ] Performance trends
- [ ] Cost optimization
- [ ] User satisfaction scores
- [ ] Feature usage analytics
- [ ] Technical debt review

### Month 1: Optimization

- [ ] Identify bottlenecks
- [ ] Optimize slow queries
- [ ] Tune cache settings
- [ ] Review and adjust tier thresholds
- [ ] Optimize monitoring queries

---

## 🎯 Success Criteria

### Technical

- ✅ Uptime > 99.9%
- ✅ Error rate < 1%
- ✅ Response times within SLA
- ✅ All monitoring operational

### Quality

- ✅ Tier 1 accuracy: 85-92%
- ✅ Tier 2 accuracy: 90-96%
- ✅ Tier 3 accuracy: 94-98%
- ✅ Evidence coverage: > 98%

### Safety

- ✅ Mandatory escalation compliance: 100%
- ✅ Human oversight enforced: 100%
- ✅ Fairness violations: < 0.1%
- ✅ No critical drift alerts

### Business

- ✅ Cost per query within budget
- ✅ User satisfaction > 90%
- ✅ Feature adoption growing
- ✅ No major incidents

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: High Latency**
```bash
# Check database connections
psql $SUPABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check Neo4j
cypher-shell -a $NEO4J_URI -u $NEO4J_USER -p $NEO4J_PASSWORD \
  "CALL dbms.listQueries();"
```

**Issue 2: Fairness Violations**
```python
# Check fairness metrics
python3 << EOF
from monitoring.fairness_monitor import FairnessMonitor
monitor = FairnessMonitor(db_session)
report = await monitor.get_compliance_report(agent_id, days=7)
print(report)
EOF
```

**Issue 3: Memory Leaks**
```bash
# Monitor memory usage
ps aux | grep python | awk '{print $2, $3, $4, $6, $11}'

# Check for leaks
python3 -m memory_profiler scripts/profile_memory.py
```

---

## 📚 Additional Resources

- **Integration Patterns**: `INTEGRATION_PATTERNS_GUIDE.md`
- **API Documentation**: `/docs` endpoint (FastAPI auto-generated)
- **Monitoring Guide**: `PHASE_5_DEPLOYMENT_COMPLETE.md`
- **Architecture Overview**: `AGENTOS_3.0_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Final Checklist

Before declaring production ready:

- [ ] All migrations deployed
- [ ] All data loaded
- [ ] Service deployed and stable
- [ ] Monitoring operational
- [ ] Tests passing
- [ ] Team trained
- [ ] Documentation complete
- [ ] Rollback plan tested
- [ ] 24-hour burn-in successful
- [ ] Sign-off from stakeholders

---

**Deployment Complete!** 🎉

AgentOS 3.0 is now in production and ready to serve users with world-class AI agent orchestration.

