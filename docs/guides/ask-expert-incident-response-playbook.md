# Ask Expert Incident Response Playbook

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Service:** Ask Expert (4-Mode Execution Matrix)  
**Owner:** AI Platform Team

---

## Table of Contents

1. [Incident Severity Levels](#incident-severity-levels)
2. [On-Call Responsibilities](#on-call-responsibilities)
3. [Incident Response Process](#incident-response-process)
4. [Common Incidents & Solutions](#common-incidents--solutions)
5. [Escalation Procedures](#escalation-procedures)
6. [Post-Incident Review](#post-incident-review)
7. [Communication Templates](#communication-templates)

---

## Incident Severity Levels

### SEV1: Critical - Service Down

**Definition:**
- All 4 modes unavailable
- Complete service outage
- Data loss or corruption
- Security breach

**Response Time:** 15 minutes  
**Resolution Target:** 1 hour  
**Example:** All API endpoints returning 500 errors

### SEV2: High - Major Degradation

**Definition:**
- One or more modes failing
- >50% of requests failing
- Significant performance degradation (P99 > 30s)
- Critical feature unavailable

**Response Time:** 30 minutes  
**Resolution Target:** 4 hours  
**Example:** Mode 4 missions failing to start

### SEV3: Medium - Minor Degradation

**Definition:**
- Intermittent errors (<10% failure rate)
- Performance degradation (P95 > 5s)
- Non-critical feature unavailable
- User impact limited

**Response Time:** 2 hours  
**Resolution Target:** 24 hours  
**Example:** Fusion Engine occasional timeouts

### SEV4: Low - Issue Detected

**Definition:**
- Minor bugs
- Cosmetic issues
- Performance optimization opportunities
- Documentation gaps

**Response Time:** 24 hours  
**Resolution Target:** Next sprint  
**Example:** Error message typo

---

## On-Call Responsibilities

### Primary On-Call Engineer

**Responsibilities:**
1. Acknowledge incident within response time
2. Assess severity and escalate if needed
3. Investigate root cause
4. Implement fix or workaround
5. Communicate status updates
6. Document incident

**Tools:**
- PagerDuty for alerts
- Slack #ask-expert-incidents
- Grafana dashboards
- Langfuse traces
- Production logs

### Escalation Chain

| Time | Escalate To |
|------|-------------|
| 0-15 min | Primary on-call |
| 15-30 min | Team lead |
| 30-60 min | Engineering manager |
| 60+ min (SEV1) | VP Engineering |

---

## Incident Response Process

### Step 1: Acknowledge & Assess (0-5 min)

```bash
# 1. Acknowledge in PagerDuty
# 2. Check incident channel
# 3. Assess severity

# Quick health check
curl -f https://api.vitalpath.ai/health || echo "Service down - SEV1"

# Check all modes
for mode in 1 2 3 4; do
  curl -sf https://api.vitalpath.ai/api/v1/expert/mode${mode}/health || echo "Mode $mode down"
done
```

### Step 2: Investigate (5-30 min)

```bash
# 1. Check recent deployments
git log --oneline -5

# 2. Check error logs
docker compose logs api --since 10m | grep -E "(ERROR|CRITICAL|Exception)"

# 3. Check metrics
# Visit: https://monitoring.vitalpath.ai/d/ask-expert

# 4. Check Langfuse traces
# Visit: https://cloud.langfuse.com/project/vital/traces?filter=error

# 5. Check external dependencies
./scripts/check-dependencies.sh
```

### Step 3: Mitigate (30-60 min)

**Options:**
1. **Rollback** - If recent deployment
2. **Scale up** - If resource constraint
3. **Enable fallback** - If feature failing
4. **Disable feature** - If non-critical

```bash
# Option 1: Rollback
./scripts/rollback.sh

# Option 2: Scale up
docker compose up -d --scale api=5 api

# Option 3: Enable fallback
export FUSION_FALLBACK_ENABLED=true
docker compose restart api

# Option 4: Disable feature
export FF_MODE4_ENABLED=false
docker compose restart api
```

### Step 4: Resolve & Verify (60+ min)

```bash
# 1. Verify fix
./scripts/health-check.sh

# 2. Run smoke tests
./scripts/smoke-tests.sh production

# 3. Monitor for 15 minutes
watch -n 30 './scripts/health-check.sh'

# 4. Close incident in PagerDuty
```

---

## Common Incidents & Solutions

### Incident: High Error Rate (5xx > 5%)

**Symptoms:**
- Grafana shows error rate spike
- Users reporting failures
- PagerDuty alerts firing

**Investigation:**

```bash
# Check error logs
docker compose logs api --since 10m | grep "ERROR" | tail -50

# Check specific error types
docker compose logs api --since 10m | grep -E "(DatabaseError|TimeoutError|LLMError)"

# Check resource usage
docker stats --no-stream

# Check database connections
docker compose exec api python -c "from core.database import check_pool; check_pool()"
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Recent deployment | Rollback: `./scripts/rollback.sh` |
| Database connection pool exhausted | Increase pool size or restart |
| LLM API rate limit | Enable fallback model |
| Memory leak | Restart containers |
| External dependency down | Enable fallback mode |

**Resolution:**

```bash
# If deployment related
./scripts/rollback.sh

# If resource related
docker compose up -d --scale api=5 api

# If external dependency
export LLM_FALLBACK_MODEL=gpt-4-turbo
docker compose restart api
```

---

### Incident: High Latency (P99 > 30s)

**Symptoms:**
- Slow response times
- Timeout errors
- User complaints

**Investigation:**

```bash
# Check latency by endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://api.vitalpath.ai/api/v1/expert/mode1/health

# Check slow queries in Langfuse
# Filter: duration > 10s

# Check resource usage
docker stats --no-stream

# Check queue depth
redis-cli -u $REDIS_URL LLEN ask_expert_queue
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| High load | Scale horizontally |
| Slow database queries | Check query performance |
| LLM API slow | Check Anthropic status |
| Fusion Engine timeout | Increase timeout or enable fallback |
| Memory pressure | Restart or scale |

**Resolution:**

```bash
# Scale up
docker compose up -d --scale api=5 api

# Increase timeouts
export MODE1_TIMEOUT=120
export FUSION_TIMEOUT=10
docker compose restart api
```

---

### Incident: Mode 4 Missions Failing

**Symptoms:**
- Mode 4 missions stuck in "created" status
- Pre-flight checks failing
- Team assembly errors

**Investigation:**

```bash
# Check Mode 4 health
curl -sf https://api.vitalpath.ai/api/v1/expert/mode4/health | jq .

# Check recent mission logs
docker compose logs worker --since 30m | grep "mode4"

# Check Fusion Engine
curl -sf https://api.vitalpath.ai/api/v1/fusion/health | jq .

# Check pre-flight logs
docker compose logs api --since 30m | grep "preflight"
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Fusion Engine down | Enable fallback selection |
| Pre-flight check failing | Review check logic |
| Budget exceeded | Increase budget or fix calculation |
| Tool unavailable | Disable tool or fix access |
| Agent instantiation failing | Check Supabase connectivity |

**Resolution:**

```bash
# Enable Fusion fallback
export FUSION_FALLBACK_ENABLED=true
docker compose restart api worker

# Disable problematic pre-flight check
export PREFLIGHT_SKIP_TOOLS=true
docker compose restart api

# Restart workers
docker compose restart worker
```

---

### Incident: Fusion Engine Timeouts

**Symptoms:**
- Mode 2/4 taking >10s to select experts
- Fusion selection errors
- Fallback to default agents

**Investigation:**

```bash
# Check Fusion health
curl -sf https://api.vitalpath.ai/api/v1/fusion/health | jq .

# Check vector DB (Pinecone)
curl -s "$PINECONE_URL/describe_index_stats" | jq .

# Check Neo4j (if using graph)
curl -s "$NEO4J_URL/db/neo4j/cluster/available" | jq .

# Check Fusion logs
docker compose logs api --since 10m | grep "fusion"
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Pinecone slow/down | Enable fallback, check status |
| Neo4j slow/down | Disable graph retriever |
| Network latency | Increase timeout |
| Large result sets | Reduce max results |

**Resolution:**

```bash
# Enable fallback
export FUSION_FALLBACK_ENABLED=true
export FUSION_TIMEOUT=10
docker compose restart api

# Disable slow retriever
export FUSION_DISABLE_GRAPH=true
docker compose restart api
```

---

### Incident: LLM API Errors

**Symptoms:**
- 429 (rate limit) errors
- 500 errors from Anthropic
- Timeout errors

**Investigation:**

```bash
# Check Anthropic status
curl -s https://status.anthropic.com/api/v2/status.json | jq .

# Check rate limit errors in logs
docker compose logs api --since 10m | grep "429"

# Check token usage
# Visit Langfuse: Token usage dashboard

# Check API key validity
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**Common Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Rate limit exceeded | Enable fallback model, reduce concurrency |
| API key invalid/expired | Rotate API key |
| Anthropic outage | Enable fallback model |
| Token budget exceeded | Check budget limits |

**Resolution:**

```bash
# Enable fallback model
export LLM_FALLBACK_MODEL=gpt-4-turbo
export LLM_FALLBACK_ENABLED=true
docker compose restart api

# Reduce concurrency
export LLM_MAX_CONCURRENT=5
docker compose restart api
```

---

## Escalation Procedures

### When to Escalate

**Escalate to Team Lead if:**
- No progress after 15 minutes (SEV1) or 30 minutes (SEV2)
- Need additional expertise
- Decision required on rollback
- Multiple systems affected

**Escalate to Engineering Manager if:**
- No progress after 30 minutes (SEV1) or 1 hour (SEV2)
- Customer impact significant
- Data loss or security breach
- Need to coordinate with other teams

**Escalate to VP Engineering if:**
- SEV1 incident > 1 hour unresolved
- Security breach confirmed
- Data loss confirmed
- Customer SLA breach

### Escalation Template

```
Subject: [SEV1] Ask Expert Service Down - Escalation Required

Incident: Ask Expert service completely unavailable
Severity: SEV1
Started: 2025-12-06 14:30 UTC
Duration: 45 minutes

Current Status:
- All 4 modes returning 500 errors
- Health checks failing
- Recent deployment at 14:00 UTC

Actions Taken:
1. Rolled back to previous version (14:35)
2. Scaled up API instances (14:40)
3. Verified database connectivity (14:45)

Next Steps:
- Need decision on full rollback
- Investigating database connection pool

Impact:
- 100% of users affected
- ~500 requests failing per minute
```

---

## Post-Incident Review

### Within 24 Hours

1. **Incident Summary**
   - Timeline
   - Root cause
   - Impact assessment
   - Resolution steps

2. **Action Items**
   - Immediate fixes
   - Short-term improvements
   - Long-term prevention

### Within 1 Week

1. **Post-Mortem Document**
   - Full timeline
   - Root cause analysis
   - Contributing factors
   - Action items with owners

2. **Follow-up Actions**
   - Implement fixes
   - Update runbooks
   - Improve monitoring
   - Update tests

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** 2025-12-06
**Severity:** SEV1
**Duration:** 1h 15m
**Impact:** All users, 100% service outage

## Timeline

- 14:00 UTC: Deployment to production
- 14:05 UTC: First error reports
- 14:10 UTC: PagerDuty alert fired
- 14:15 UTC: On-call acknowledged
- 14:30 UTC: Rollback initiated
- 14:45 UTC: Service restored
- 15:15 UTC: Incident resolved

## Root Cause

[Detailed analysis]

## Contributing Factors

1. [Factor 1]
2. [Factor 2]

## Action Items

| Action | Owner | Priority | Due Date |
|--------|-------|----------|----------|
| Fix deployment script | @engineer | P0 | 2025-12-07 |
| Add pre-deployment checks | @engineer | P1 | 2025-12-10 |
| Improve monitoring | @engineer | P1 | 2025-12-13 |

## Lessons Learned

[Key takeaways]
```

---

## Communication Templates

### Initial Alert (Slack)

```
🚨 [SEV1] Ask Expert Service Down

Status: Investigating
Started: 14:00 UTC
Impact: All users, all modes unavailable

Actions:
- Rolled back recent deployment
- Investigating root cause

Updates: #ask-expert-incidents
```

### Status Update (Slack)

```
📊 [SEV1] Ask Expert - Status Update

Duration: 30 minutes
Status: Mitigating

Progress:
✅ Rolled back deployment
✅ Scaled up API instances
🔄 Investigating database connections

ETA: 15 minutes
```

### Resolution (Slack)

```
✅ [SEV1] Ask Expert - RESOLVED

Duration: 1h 15m
Root Cause: Database connection pool exhausted
Resolution: Increased pool size + restarted services

Post-mortem: [Link]
```

### Customer Communication (Email)

```
Subject: Service Interruption - Ask Expert

Dear Valued Customer,

We experienced a service interruption on Ask Expert from 14:00-15:15 UTC today.

Impact: All Ask Expert modes were temporarily unavailable.

Root Cause: Database connection pool configuration issue.

Resolution: We've increased connection pool size and restarted services.

We apologize for any inconvenience. Service is now fully restored.

Best regards,
VITAL Platform Team
```

---

## Quick Reference

### Emergency Contacts

| Role | Contact |
|------|---------|
| Primary On-Call | PagerDuty |
| Team Lead | @team-lead (Slack) |
| Engineering Manager | @eng-manager (Slack) |
| VP Engineering | @vp-eng (Slack) |

### Useful Commands

```bash
# Health check
./scripts/health-check.sh

# Rollback
./scripts/rollback.sh

# Scale up
docker compose up -d --scale api=5 api

# Check logs
docker compose logs -f api worker

# Check metrics
# Visit: https://monitoring.vitalpath.ai/d/ask-expert
```

### Runbook Links

- [Deployment Runbook](./ask-expert-deployment-runbook.md)
- [API Reference](../api/ask-expert-api-reference.md)
- [Monitoring Dashboards](https://monitoring.vitalpath.ai)

---

**Document Owner:** AI Platform Team  
**Review Cycle:** Quarterly  
**Next Review:** March 6, 2026
