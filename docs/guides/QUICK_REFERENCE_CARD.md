# 📋 VITAL Platform - Quick Reference Card

## 🚀 One-Page Operations Guide

### 🔗 Quick Access URLs

```
Application:
├─ Main App:          http://localhost:3000
├─ Ask Expert:        http://localhost:3000/ask-expert
├─ Admin:             http://localhost:3000/admin
└─ Executive:         http://localhost:3000/admin?view=executive

Monitoring:
├─ Grafana:           http://localhost:3001  (admin / vital_admin_2025)
├─ Prometheus:        http://localhost:9090
├─ Alertmanager:      http://localhost:9093
└─ LangFuse:          http://localhost:3002
```

---

### ⚡ Common Commands

```bash
# Start Application
cd apps/digital-health-startup
npm run dev

# Deploy Monitoring Stack
cd monitoring
./deploy.sh

# View Logs
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f alertmanager

# Restart Services
docker-compose restart [service-name]

# Stop Everything
docker-compose down

# Database Migration
cd database/sql/migrations/2025
./execute_analytics_migration.sh
```

---

### 📊 Key Metrics Queries (Prometheus)

```promql
# System Health
up

# Request Rate
rate(http_requests_total[5m])

# Error Rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# LLM Cost (24h)
sum(increase(llm_cost_usd_total[24h]))

# Agent Success Rate
rate(agent_executions_success_total[15m]) / rate(agent_executions_total[15m])

# Active Users
user_sessions_active

# Token Usage
sum(llm_tokens_used_total) by (model)
```

---

### 🎯 Admin Dashboard Views

| View | URL Parameter | Purpose |
|------|---------------|---------|
| Executive | `?view=executive` | Real-time system health |
| Overview | `?view=overview` | Admin statistics |
| Users | `?view=users` | User management |
| Agents | `?view=agents` | Agent CRUD |
| Prompts | `?view=prompts` | Prompt templates |
| Tools | `?view=tools` | Tool registry |
| Analytics | `?view=agent-analytics` | Agent performance |
| Feedback | `?view=feedback-analytics` | User feedback |
| LLM Providers | `?view=llm-providers` | Provider status |

---

### 🚨 Alert Severity Levels

| Level | Route | Response Time | Examples |
|-------|-------|---------------|----------|
| **Critical** | PagerDuty | Immediate | System down, DB offline |
| **Warning** | Slack | 15 min | High CPU, cost spike |
| **Info** | Slack | 1 hour | Low engagement |

---

### 🔧 Troubleshooting Quick Fixes

**App won't start:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Monitoring down:**
```bash
cd monitoring
docker-compose down
docker-compose up -d
```

**Database connection:**
```bash
psql "$SUPABASE_DB_URL" -c "SELECT 1;"
```

**Analytics not working:**
```bash
psql "$SUPABASE_DB_URL" -c "\dt analytics.*"
```

---

### 📈 Daily Checklist

- [ ] Check Executive Dashboard for alerts
- [ ] Review daily costs in Cost Analytics
- [ ] Monitor agent success rates
- [ ] Check Slack for overnight alerts
- [ ] Verify system health (CPU, memory, disk)

---

### 📅 Weekly Checklist

- [ ] Review Grafana dashboards
- [ ] Analyze cost trends
- [ ] Check for slow queries
- [ ] Review security alerts
- [ ] Update alert thresholds if needed

---

### 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | >99.9% | Monitor in Grafana |
| API Latency (p95) | <2s | Monitor in Prometheus |
| Error Rate | <1% | Monitor in Executive Dashboard |
| Agent Success Rate | >95% | Monitor in Agent Analytics |
| Daily Cost | <$200 | Monitor in Cost Dashboard |

---

### 💾 Backup & Recovery

**Database Backup:**
```bash
pg_dump "$SUPABASE_DB_URL" > backup_$(date +%Y%m%d).sql
```

**Monitoring Data:**
```bash
docker cp vital-prometheus:/prometheus ./prometheus-backup
docker cp vital-grafana:/var/lib/grafana ./grafana-backup
```

---

### 📞 Emergency Contacts

**Critical Issues:**
1. Check Executive Dashboard
2. Review Alertmanager
3. Check Grafana for patterns
4. Review application logs

**Database Issues:**
1. Check PostgreSQL Exporter metrics
2. Review slow query logs
3. Check connection count
4. Verify Supabase status page

---

### 🎓 Key Concepts

**Hypertable:** Time-series optimized table in TimescaleDB  
**Continuous Aggregate:** Auto-updating materialized view  
**Scrape Interval:** How often Prometheus collects metrics (15s)  
**Alert Rule:** Condition that triggers an alert  
**Retention Policy:** How long data is kept before deletion

---

### 📚 Essential Documentation

| Document | When to Use |
|----------|-------------|
| `COMPLETE_DEPLOYMENT_GUIDE.md` | Initial setup & deployment |
| `PHASES_ABC_COMPLETE_SUMMARY.md` | Overview & feature reference |
| `SYSTEM_ARCHITECTURE_COMPLETE.md` | Understanding the system |
| `monitoring/README.md` | Monitoring stack details |
| `QUICK_START_GUIDE.md` | Analytics quick start |

---

### 🔐 Security Checklist

- [ ] Environment variables properly set
- [ ] Supabase RLS policies enabled
- [ ] API keys rotated regularly
- [ ] Grafana password changed from default
- [ ] Database backups configured
- [ ] SSL/TLS enabled in production
- [ ] Rate limiting configured
- [ ] Audit logs enabled

---

### 💡 Pro Tips

1. **Use Grafana's Explore view** to test PromQL queries before adding to dashboards
2. **Set up alert silences** during maintenance windows
3. **Tag releases** in Git to correlate with metrics
4. **Export Grafana dashboards** regularly as JSON
5. **Use LangFuse** for detailed LLM tracing
6. **Monitor the Executive Dashboard** daily
7. **Set up Slack for alerts** (highly recommended)
8. **Review costs weekly** to avoid surprises

---

### 🎯 Quick Wins

**Reduce LLM Costs:**
1. Check Cost Analytics for expensive queries
2. Optimize prompt templates
3. Use appropriate model for task
4. Implement caching

**Improve Performance:**
1. Monitor agent latency in Agent Analytics
2. Identify slow agents
3. Optimize prompts
4. Add caching layer

**Enhance User Experience:**
1. Review Feedback Analytics
2. Check error rates
3. Monitor session duration
4. Track feature usage

---

## 📊 Health Check Commands

```bash
# Application Health
curl http://localhost:3000/api/health

# Prometheus Health
curl http://localhost:9090/-/healthy

# Grafana Health
curl http://localhost:3001/api/health

# Database Health
psql "$SUPABASE_DB_URL" -c "SELECT NOW();"

# Check All Containers
docker-compose ps
```

---

## 🎉 Success Indicators

You're doing great if:
- ✅ All dashboards show data
- ✅ Alerts are routing to Slack
- ✅ Costs are within budget
- ✅ Agent success rate >95%
- ✅ Error rate <1%
- ✅ No critical alerts
- ✅ Users are happy 😊

---

**Print this page for your desk! 📄**

**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Status:** Production Ready ✅

