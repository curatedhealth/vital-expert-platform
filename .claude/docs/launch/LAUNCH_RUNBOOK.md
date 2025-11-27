# VITAL Platform - Launch Day Runbook
# Phase 1: Ask Expert Service

**Document Version**: 1.0
**Last Updated**: November 27, 2025
**Launch Date**: December 2025 (TBD)
**Owner**: Launch Strategy Agent + DevOps Lead

---

## Quick Reference Card

```
LAUNCH DAY CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Launch Lead:        [Name]         [Phone]
DevOps Lead:        [Name]         [Phone]
Backend Lead:       [Name]         [Phone]
Frontend Lead:      [Name]         [Phone]
Security Lead:      [Name]         [Phone]
Support Lead:       [Name]         [Phone]
Executive Sponsor:  [Name]         [Phone]

CRITICAL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slack Channel:      #vital-launch
Status Page:        status.vital.health
Monitoring:         [Datadog URL]
Production URL:     app.vital.health
Rollback Script:    /scripts/rollback-prod.sh

EMERGENCY ESCALATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1 (0-15min):  On-call engineer
Level 2 (15-30min): Team Lead
Level 3 (30min+):   VP Engineering + CEO
```

---

## Part 1: Pre-Launch Checklist (T-24 Hours)

### 1.1 Technical Verification

**Backend Systems**
```bash
# Run from deployment server
□ API health check passes
  curl -s https://api.vital.health/health | jq .

□ Database connectivity verified
  psql $DATABASE_URL -c "SELECT 1"

□ Redis cache operational
  redis-cli ping

□ OpenAI API key valid
  curl -s https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY" | head -5

□ All 4 modes responding
  curl -X POST https://api.vital.health/api/mode1/manual -d '{"test": true}'
  curl -X POST https://api.vital.health/api/mode2/automatic -d '{"test": true}'
  curl -X POST https://api.vital.health/api/mode3/autonomous-automatic -d '{"test": true}'
  curl -X POST https://api.vital.health/api/mode4/autonomous-manual -d '{"test": true}'
```

**Frontend Systems**
```bash
□ Production build successful
  npm run build

□ Static assets deployed to CDN
  curl -I https://cdn.vital.health/assets/main.js

□ SSL certificate valid (>30 days)
  echo | openssl s_client -connect app.vital.health:443 2>/dev/null | openssl x509 -noout -dates
```

**Infrastructure**
```bash
□ Auto-scaling configured
  # Verify in cloud console

□ Database backups current (<1 hour)
  # Check backup timestamp

□ Monitoring dashboards accessible
  # Open Datadog/Grafana

□ Alert channels configured
  # Test Slack webhook
```

### 1.2 Team Readiness

```
□ All team members confirmed availability
□ On-call rotation finalized
□ War room (virtual) set up
□ Communication channels tested
□ Escalation contacts verified
□ External dependencies confirmed (OpenAI, Supabase, Pinecone)
```

### 1.3 Documentation Ready

```
□ User guide published
□ API documentation live
□ Support FAQ available
□ Known issues documented
□ Troubleshooting guide ready
```

---

## Part 2: Launch Day Timeline

### T-4 Hours: Final Preparations

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 06:00 | Team assembles in war room | Launch Lead | □ |
| 06:15 | Final system health check | DevOps | □ |
| 06:30 | Database backup verification | DevOps | □ |
| 06:45 | Monitoring dashboard review | DevOps | □ |
| 07:00 | Go/No-Go confirmation call | All Leads | □ |

### T-2 Hours: Soft Launch

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 08:00 | Enable feature flags for internal users | DevOps | □ |
| 08:15 | Internal team smoke test | QA | □ |
| 08:30 | Fix any critical issues found | Engineering | □ |
| 09:00 | Internal soft launch complete | Launch Lead | □ |

### T-0: Public Launch

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 10:00 | Remove feature flags (public access) | DevOps | □ |
| 10:05 | Verify public access working | QA | □ |
| 10:10 | Send pilot customer notifications | Sales | □ |
| 10:15 | Publish blog post | Marketing | □ |
| 10:30 | Social media announcement | Marketing | □ |
| 10:30 | Status page update: "Launched" | DevOps | □ |

### T+1 to T+4 Hours: Active Monitoring

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 11:00 | First hour metrics review | Launch Lead | □ |
| 12:00 | Second hour metrics review | Launch Lead | □ |
| 13:00 | Third hour metrics review | Launch Lead | □ |
| 14:00 | Fourth hour metrics review + team sync | All | □ |

### T+8 Hours: Day 1 Wrap-Up

| Time | Task | Owner | Status |
|------|------|-------|--------|
| 18:00 | Day 1 metrics summary | Launch Lead | □ |
| 18:15 | Issue triage and prioritization | Engineering | □ |
| 18:30 | Night shift handoff | DevOps | □ |
| 19:00 | War room stands down | Launch Lead | □ |

---

## Part 3: Monitoring Procedures

### 3.1 Key Metrics to Watch

**Real-Time Dashboard (Check every 15 minutes)**

| Metric | Green | Yellow | Red | Action |
|--------|-------|--------|-----|--------|
| Error Rate | <1% | 1-5% | >5% | Investigate immediately |
| Response Time (P95) | <3s | 3-5s | >5s | Check backend logs |
| Request Volume | Normal | +50% | +100% | Monitor capacity |
| CPU Usage | <60% | 60-80% | >80% | Scale up |
| Memory Usage | <70% | 70-85% | >85% | Scale up |
| Database Connections | <50% | 50-75% | >75% | Scale up |
| OpenAI API Errors | <0.1% | 0.1-1% | >1% | Check API status |

### 3.2 Health Check Commands

```bash
# Quick health check (run every 5 minutes)
#!/bin/bash
echo "=== VITAL Health Check $(date) ==="

# API Health
echo -n "API Health: "
curl -s -o /dev/null -w "%{http_code}" https://api.vital.health/health

# Mode 1 Check
echo -n "Mode 1: "
curl -s -o /dev/null -w "%{http_code}" -X POST https://api.vital.health/api/mode1/health

# Mode 2 Check
echo -n "Mode 2: "
curl -s -o /dev/null -w "%{http_code}" -X POST https://api.vital.health/api/mode2/health

# Database Check
echo -n "Database: "
curl -s -o /dev/null -w "%{http_code}" https://api.vital.health/db/health

# Response Time Check
echo "Response Time (Mode 1): "
curl -s -w "Total: %{time_total}s\n" -o /dev/null https://api.vital.health/api/mode1/health

echo "=== Check Complete ==="
```

### 3.3 Log Monitoring

**Critical Log Patterns to Watch**

```bash
# Error patterns to alert on
grep -E "ERROR|CRITICAL|FATAL" /var/log/vital/*.log

# Specific patterns
grep "OpenAI API error" /var/log/vital/ai-engine.log
grep "Database connection" /var/log/vital/backend.log
grep "RLS policy" /var/log/vital/backend.log
grep "Authentication failed" /var/log/vital/auth.log
grep "Rate limit" /var/log/vital/api.log
```

---

## Part 4: Incident Response Procedures

### 4.1 Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **SEV1** | System down, all users affected | 5 minutes | Complete outage |
| **SEV2** | Major feature broken, many users affected | 15 minutes | Mode 1 not working |
| **SEV3** | Minor feature broken, some users affected | 1 hour | Slow response times |
| **SEV4** | Cosmetic issue, minimal impact | 24 hours | UI glitch |

### 4.2 Incident Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT DETECTED                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. ACKNOWLEDGE (within 5 min)                                    │
│    □ Post in #vital-launch: "Investigating [issue]"              │
│    □ Assign incident commander                                   │
│    □ Start incident timer                                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ASSESS (within 15 min)                                        │
│    □ Determine severity (SEV1-4)                                 │
│    □ Identify affected systems/users                             │
│    □ Check recent deployments/changes                            │
│    □ Review logs and metrics                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. COMMUNICATE                                                   │
│    □ Update status page (if customer-facing)                     │
│    □ Notify stakeholders per escalation matrix                   │
│    □ Post updates every 15 minutes                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. MITIGATE                                                      │
│    □ Implement quick fix OR rollback                             │
│    □ Verify fix is working                                       │
│    □ Monitor for recurrence                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RESOLVE                                                       │
│    □ Confirm system stable for 30+ minutes                       │
│    □ Update status page: "Resolved"                              │
│    □ Notify stakeholders                                         │
│    □ Schedule post-mortem (within 48 hours)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Common Issues and Fixes

#### Issue: High Error Rate (>5%)

**Symptoms**: Error rate spike in monitoring
**Quick Diagnosis**:
```bash
# Check error logs
tail -100 /var/log/vital/api.log | grep ERROR

# Check recent deployments
git log --oneline -5

# Check external dependencies
curl https://status.openai.com/api/v2/status.json
curl https://status.supabase.com/api/v2/status.json
```

**Likely Causes & Fixes**:
| Cause | Fix |
|-------|-----|
| OpenAI API down | Enable fallback mode, notify users |
| Database connection pool exhausted | Restart API pods, increase pool size |
| Bad deployment | Rollback to previous version |
| Rate limiting triggered | Increase limits, add caching |

#### Issue: Slow Response Times (>5s P95)

**Symptoms**: Users complaining about slow responses
**Quick Diagnosis**:
```bash
# Check API response times
curl -w "Total: %{time_total}s\n" -o /dev/null https://api.vital.health/api/mode1/health

# Check database query times
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5"

# Check OpenAI latency
# Review Datadog APM traces
```

**Likely Causes & Fixes**:
| Cause | Fix |
|-------|-----|
| Database queries slow | Add indexes, optimize queries |
| OpenAI API slow | Cache responses, reduce token usage |
| CPU/memory pressure | Scale up infrastructure |
| Network issues | Check cloud provider status |

#### Issue: Authentication Failures

**Symptoms**: Users can't log in, 401 errors
**Quick Diagnosis**:
```bash
# Check auth service logs
tail -100 /var/log/vital/auth.log | grep -i error

# Verify Supabase auth status
curl https://[project].supabase.co/auth/v1/health
```

**Likely Causes & Fixes**:
| Cause | Fix |
|-------|-----|
| Supabase auth down | Wait for Supabase, enable maintenance mode |
| JWT secret mismatch | Verify environment variables |
| RLS policies blocking | Review RLS policies, check tenant_id |

---

## Part 5: Rollback Procedures

### 5.1 Rollback Decision Criteria

**Automatic Rollback Triggers**:
- Error rate >10% for 5+ minutes
- System completely unavailable for 5+ minutes
- Data integrity issue confirmed
- Security breach detected

**Manual Rollback Consideration**:
- Error rate >5% for 15+ minutes
- P95 response time >10s for 15+ minutes
- Customer-reported critical bugs
- Major functionality broken

### 5.2 Rollback Commands

```bash
#!/bin/bash
# rollback-prod.sh
# Run this script to rollback to the previous stable version

set -e

echo "======================================"
echo "VITAL Production Rollback"
echo "======================================"
echo ""
echo "WARNING: This will rollback production to the previous version."
echo "Type 'ROLLBACK' to confirm:"
read confirmation

if [ "$confirmation" != "ROLLBACK" ]; then
    echo "Rollback cancelled."
    exit 1
fi

echo ""
echo "Starting rollback..."

# 1. Get previous deployment tag
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^)
echo "Rolling back to: $PREVIOUS_TAG"

# 2. Rollback frontend (Vercel)
echo "Rolling back frontend..."
vercel rollback --yes

# 3. Rollback backend (Railway/K8s)
echo "Rolling back backend..."
kubectl rollout undo deployment/vital-api -n production

# 4. Wait for rollout
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/vital-api -n production --timeout=300s

# 5. Verify health
echo "Verifying health..."
for i in {1..5}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" https://api.vital.health/health)
    if [ "$status" == "200" ]; then
        echo "Health check passed!"
        break
    fi
    echo "Attempt $i: Status $status, retrying..."
    sleep 10
done

# 6. Post to Slack
echo "Posting to Slack..."
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🔄 VITAL Production Rollback Complete - Rolled back to $PREVIOUS_TAG\"}" \
    $SLACK_WEBHOOK_URL

echo ""
echo "======================================"
echo "Rollback Complete!"
echo "Previous version: $PREVIOUS_TAG"
echo "======================================"
echo ""
echo "NEXT STEPS:"
echo "1. Verify all systems are operational"
echo "2. Update status page"
echo "3. Notify stakeholders"
echo "4. Schedule post-mortem"
```

### 5.3 Post-Rollback Checklist

```
□ Verify all APIs responding (health checks)
□ Verify frontend accessible
□ Verify database connectivity
□ Run smoke tests on all 4 modes
□ Check monitoring dashboards
□ Update status page
□ Notify #vital-launch channel
□ Notify affected customers (if any)
□ Document timeline of events
□ Schedule post-mortem within 48 hours
```

---

## Part 6: Communication Templates

### 6.1 Status Page Updates

**Investigating**
```
Title: Investigating Issues with Ask Expert Service
Status: Investigating
Message: We are currently investigating reports of [issue description].
Our team is actively working to identify the cause. We will provide
updates every 15 minutes.
Posted: [Time]
```

**Identified**
```
Title: Issue Identified - Ask Expert Service
Status: Identified
Message: We have identified the cause of the [issue]. Our engineering
team is implementing a fix. Expected resolution: [time estimate].
Posted: [Time]
```

**Monitoring**
```
Title: Fix Deployed - Monitoring Ask Expert Service
Status: Monitoring
Message: A fix has been deployed and we are monitoring the system.
Initial indicators show improvement. We will continue to monitor
for the next 30 minutes.
Posted: [Time]
```

**Resolved**
```
Title: Resolved - Ask Expert Service
Status: Resolved
Message: The issue affecting Ask Expert has been resolved. Service
is operating normally. We apologize for any inconvenience. A full
post-mortem will be published within 48 hours.
Posted: [Time]
```

### 6.2 Slack Announcement Templates

**Launch Announcement**
```
:rocket: *VITAL Phase 1 Launch Complete* :rocket:

Ask Expert is now LIVE at https://app.vital.health

*What's launched:*
• Mode 1: Interactive + Manual
• Mode 2: Interactive + Automatic
• Mode 3: Autonomous + Manual
• Mode 4: Autonomous + Automatic

*Monitoring:* War room active until 6pm
*Issues:* Report to #vital-launch

Let's go! :tada:
```

**Incident Alert**
```
:warning: *VITAL Incident Alert* :warning:

*Status:* [Investigating/Identified/Resolved]
*Severity:* [SEV1/SEV2/SEV3/SEV4]
*Impact:* [Description of user impact]
*Incident Commander:* [Name]

*Timeline:*
• [Time]: Issue detected
• [Time]: Team notified
• [Time]: [Status update]

*Next update:* [Time]
```

### 6.3 Customer Communication Templates

**Launch Welcome Email**
```
Subject: Welcome to VITAL Platform - Your AI-Powered Healthcare Expert

Dear [Customer Name],

We're excited to welcome you to VITAL Platform! Your Ask Expert
service is now active.

Getting Started:
1. Log in at https://app.vital.health
2. Select your interaction mode (we recommend starting with Mode 2)
3. Ask your first question to one of our 136+ expert agents

Quick Tips:
• Use Mode 1 for focused conversations with a specific expert
• Use Mode 2 to let AI select the best expert for your question

Need help? Our support team is standing by:
• Email: support@vital.health
• In-app chat: Available 9am-6pm EST

Welcome aboard!

The VITAL Team
```

**Service Disruption Notification**
```
Subject: [VITAL] Service Update - Ask Expert

Dear [Customer Name],

We wanted to let you know that we're currently experiencing
[brief issue description] with our Ask Expert service.

What this means for you:
[Description of impact]

What we're doing:
Our engineering team is actively working on a resolution.
We expect service to be restored by [time estimate].

We apologize for any inconvenience and will update you as
soon as service is restored.

The VITAL Team
```

---

## Part 7: Post-Launch Monitoring (Days 1-7)

### Day 1-3: Intensive Monitoring

**Every 2 Hours**
- [ ] Check error rate (<1%)
- [ ] Check response times (P95 <3s)
- [ ] Review customer feedback
- [ ] Check support ticket volume
- [ ] Review usage patterns

**Daily**
- [ ] Morning standup (9am)
- [ ] Metrics review meeting (2pm)
- [ ] Evening wrap-up (6pm)
- [ ] Night shift handoff

### Day 4-7: Stabilization

**Every 4 Hours**
- [ ] Check key metrics
- [ ] Review any new issues
- [ ] Customer success check-ins

**Daily**
- [ ] Morning standup
- [ ] Issue triage
- [ ] Customer feedback review

### End of Week 1

- [ ] Comprehensive metrics review
- [ ] Customer satisfaction survey sent
- [ ] Week 1 retrospective meeting
- [ ] War room stands down
- [ ] Transition to standard operations

---

## Appendix A: Contact Directory

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| Launch Lead | | | | |
| CEO | | | | |
| CTO | | | | |
| VP Engineering | | | | |
| DevOps Lead | | | | |
| Backend Lead | | | | |
| Frontend Lead | | | | |
| QA Lead | | | | |
| Support Lead | | | | |
| Security Lead | | | | |

## Appendix B: External Service Contacts

| Service | Status Page | Support Contact |
|---------|-------------|-----------------|
| OpenAI | status.openai.com | support@openai.com |
| Supabase | status.supabase.com | support@supabase.io |
| Pinecone | status.pinecone.io | support@pinecone.io |
| Vercel | vercel.com/status | support@vercel.com |
| Railway | railway.app/status | support@railway.app |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | Launch Strategy Agent | Initial version |

---

*Print this runbook and keep it accessible during launch day.*
