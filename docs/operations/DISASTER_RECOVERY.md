# 🚨 Disaster Recovery Plan

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Owner**: DevOps Team  
**Review Cycle**: Quarterly

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Disaster Scenarios](#disaster-scenarios)
4. [Recovery Procedures](#recovery-procedures)
5. [Team Responsibilities](#team-responsibilities)
6. [Communication Plan](#communication-plan)
7. [Testing & Validation](#testing--validation)

---

## 🎯 Overview

This Disaster Recovery (DR) plan outlines procedures to restore VITAL Path services in the event of catastrophic failures, data loss, or service outages.

### Scope

**In Scope**:
- Database (Supabase PostgreSQL)
- AI Engine Backend (Railway)
- Frontend Application (Vercel)
- File storage and backups (S3)
- Configuration and secrets

**Out of Scope**:
- Third-party services (OpenAI, external APIs)
- End-user devices
- Network infrastructure (handled by cloud providers)

---

## 📊 Recovery Objectives

### RTO (Recovery Time Objective)

| Service | RTO | Priority |
|---------|-----|----------|
| **Database** | 1 hour | 🔴 Critical |
| **AI Engine Backend** | 30 minutes | 🔴 Critical |
| **Frontend** | 15 minutes | 🔴 Critical |
| **File Storage** | 2 hours | 🟡 High |

### RPO (Recovery Point Objective)

| Data Type | RPO | Backup Frequency |
|-----------|-----|------------------|
| **Database** | 24 hours | Daily at 2 AM UTC |
| **Configuration** | 1 hour | On change (Git) |
| **User Files** | 24 hours | Daily |
| **Logs** | Real-time | Streaming |

---

## 🔥 Disaster Scenarios

### Scenario 1: Complete Database Loss

**Trigger**: Database corruption, accidental deletion, ransomware  
**Impact**: 🔴 **CRITICAL** - All services offline  
**RTO**: 1 hour  
**RPO**: 24 hours

**Recovery Procedure**:

```bash
# 1. Verify disaster (confirm data is actually lost)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_tables;"

# 2. Stop all services to prevent data writes
railway service stop vital-ai-engine
# (Vercel auto-handles read-only mode)

# 3. List available backups
./scripts/restore-database.sh --list

# 4. Select most recent backup
BACKUP_NAME="vital_db_backup_YYYYMMDD_HHMMSS.dump.gpg"

# 5. Restore database
./scripts/restore-database.sh $BACKUP_NAME

# 6. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_agent;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_use_case;"

# 7. Restart services
railway service start vital-ai-engine

# 8. Verify application health
curl https://vital-ai-engine.railway.app/health
curl https://your-app.vercel.app/api/health

# 9. Test critical user flows
# - Login
# - Ask Expert
# - Ask Panel

# 10. Communicate with users
# - Post incident update
# - Notify affected users
# - Document lessons learned
```

**Data Loss**: Up to 24 hours of user data (last backup)

**Post-Recovery**:
- Notify users of potential data loss
- Review backup frequency (consider hourly backups)
- Identify root cause
- Implement preventive measures

---

### Scenario 2: Railway AI Engine Failure

**Trigger**: Deployment failure, service crash, resource exhaustion  
**Impact**: 🔴 **CRITICAL** - Backend services offline  
**RTO**: 30 minutes  
**RPO**: Real-time (no data loss)

**Recovery Procedure**:

```bash
# 1. Check Railway status
railway status

# 2. Check logs for errors
railway logs --tail 100

# 3. Rollback to previous deployment
railway rollback

# 4. If rollback fails, redeploy from known good commit
git checkout <last-known-good-commit>
railway up

# 5. Verify health
curl https://vital-ai-engine.railway.app/health
curl https://vital-ai-engine.railway.app/frameworks/info

# 6. Monitor error rates in Sentry
# Check for any new errors

# 7. If still failing, scale up resources
railway service scale --memory 2GB --cpu 2

# 8. Communicate incident status
```

**Data Loss**: None (stateless service)

**Post-Recovery**:
- Review deployment logs
- Add deployment smoke tests
- Update CI/CD pipeline

---

### Scenario 3: Vercel Frontend Failure

**Trigger**: Build failure, bad deployment, DDoS attack  
**Impact**: 🔴 **CRITICAL** - Frontend offline  
**RTO**: 15 minutes  
**RPO**: Real-time (no data loss)

**Recovery Procedure**:

```bash
# 1. Check Vercel deployment status
vercel ls

# 2. Check build logs
vercel logs <deployment-url>

# 3. Rollback to previous deployment
# Via Vercel Dashboard:
# Deployments → Select previous working deployment → Promote to Production

# OR via CLI:
vercel rollback

# 4. If rollback fails, redeploy from known good commit
git checkout <last-known-good-commit>
vercel --prod

# 5. Verify deployment
curl https://your-app.vercel.app
curl https://your-app.vercel.app/api/health

# 6. Test critical pages
# - /
# - /dashboard
# - /ask-expert
# - /ask-panel

# 7. Monitor client-side errors in Sentry
```

**Data Loss**: None (static assets)

**Post-Recovery**:
- Review build logs
- Fix broken dependencies
- Update E2E tests

---

### Scenario 4: Complete S3 Bucket Loss

**Trigger**: Accidental deletion, credential compromise, region outage  
**Impact**: 🟡 **HIGH** - Backups and files lost  
**RTO**: 2 hours  
**RPO**: Depends on replication

**Recovery Procedure**:

```bash
# 1. Check S3 bucket status
aws s3 ls s3://$S3_BUCKET

# 2. If bucket is deleted, recreate
aws s3 mb s3://$S3_BUCKET --region us-east-1

# 3. Restore from S3 versioning (if enabled)
aws s3api list-object-versions --bucket $S3_BUCKET

# 4. If no versioning, restore from secondary backup location
# (Assuming cross-region replication was enabled)
aws s3 sync s3://$BACKUP_BUCKET/$S3_PREFIX s3://$S3_BUCKET/$S3_PREFIX

# 5. Verify backup files
./scripts/restore-database.sh --list

# 6. Create immediate database backup
./scripts/backup-database.sh

# 7. Verify new backup is in S3
aws s3 ls s3://$S3_BUCKET/$S3_PREFIX/

# 8. Document incident and prevent recurrence
```

**Data Loss**: Depends on versioning/replication setup

**Post-Recovery**:
- Enable S3 versioning
- Configure cross-region replication
- Implement bucket deletion protection
- Add MFA delete requirement

---

### Scenario 5: Secrets Compromise

**Trigger**: Key leak, unauthorized access, insider threat  
**Impact**: 🔴 **CRITICAL** - Security breach  
**RTO**: 1 hour  
**RPO**: Real-time

**Recovery Procedure**:

```bash
# IMMEDIATE ACTIONS (within 5 minutes):

# 1. Revoke compromised keys
# - OpenAI API key
# - Supabase keys
# - Railway tokens
# - AWS credentials
# - Database passwords

# 2. Rotate all secrets
# Generate new keys for:
OPENAI_API_KEY=<new-key>
DATABASE_URL=<new-connection-string>
SUPABASE_SERVICE_ROLE_KEY=<new-key>
AWS_ACCESS_KEY_ID=<new-key>
AWS_SECRET_ACCESS_KEY=<new-key>

# 3. Update environment variables
# Railway:
railway variables set OPENAI_API_KEY=$OPENAI_API_KEY
railway variables set DATABASE_URL=$DATABASE_URL

# Vercel:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 4. Force redeploy all services
railway redeploy
vercel --prod --force

# 5. Verify services are using new keys
railway logs | grep "initialized"
vercel logs | grep "error"

# 6. Audit access logs
# - Check Supabase logs for unauthorized queries
# - Check Railway logs for suspicious activity
# - Check AWS CloudTrail

# 7. Notify users if PII was accessed
# - Follow HIPAA breach notification rules (60 days)
# - Document incident for compliance

# 8. Implement additional security
# - Enable 2FA on all accounts
# - Restrict IP access
# - Add rate limiting
# - Enable audit logging
```

**Data Loss**: None (preventive action)

**Post-Recovery**:
- Complete security audit
- Implement secret rotation schedule
- Add secret scanning to CI/CD
- Train team on security best practices

---

### Scenario 6: Total Data Center Outage

**Trigger**: AWS/Railway/Vercel region outage  
**Impact**: 🔴 **CRITICAL** - All services offline  
**RTO**: 4 hours (failover to different region)  
**RPO**: 24 hours

**Recovery Procedure**:

```bash
# This scenario requires pre-configured multi-region deployment

# 1. Confirm primary region is down
# Check AWS Status: https://status.aws.amazon.com/
# Check Railway Status: https://status.railway.app/
# Check Vercel Status: https://vercel-status.com/

# 2. Activate DR site in alternate region
# (Requires pre-configured infrastructure)

# 3. Update DNS to point to DR site
# Change A/CNAME records to DR endpoints

# 4. Restore database in DR region
# Use most recent S3 backup
./scripts/restore-database.sh --database-url $DR_DATABASE_URL

# 5. Verify services in DR region
curl https://dr-vital-ai-engine.railway.app/health
curl https://dr.your-app.vercel.app

# 6. Communicate with users
# - Announce temporary service on DR site
# - Explain potential data loss (up to 24h)
# - Provide estimated recovery time

# 7. When primary region recovers
# - Sync DR data back to primary
# - Update DNS back to primary
# - Deactivate DR site
```

**Data Loss**: Up to 24 hours

**Post-Recovery**:
- Implement hot standby in alternate region
- Set up real-time replication
- Automate DNS failover

---

## 👥 Team Responsibilities

### On-Call Engineer (Primary)

**Responsibilities**:
- First responder to incidents
- Execute recovery procedures
- Communicate with stakeholders
- Document incident timeline

**Contact**: [on-call rotation]

### Database Administrator (Secondary)

**Responsibilities**:
- Database-specific recovery
- Backup verification
- Data integrity checks

**Contact**: [DBA contact]

### DevOps Lead (Escalation)

**Responsibilities**:
- Complex infrastructure issues
- Multi-service coordination
- Vendor escalation

**Contact**: [DevOps lead]

### Security Team (For Breaches)

**Responsibilities**:
- Security incident response
- Forensic analysis
- Compliance notification

**Contact**: [Security team]

---

## 📞 Communication Plan

### Internal Communication

**Incident Channel**: #vital-incidents (Slack)

**Update Frequency**:
- Every 15 minutes during active incident
- Every hour during recovery
- Final post-mortem within 48 hours

**Template**:
```
🚨 INCIDENT UPDATE #[N]

Status: [IN PROGRESS | RESOLVED | INVESTIGATING]
Started: [TIME]
Impact: [DESCRIPTION]
Current Action: [WHAT WE'RE DOING]
ETA: [ESTIMATED RESOLUTION TIME]
Next Update: [TIME]
```

### External Communication

**Status Page**: https://status.vitalpath.com (if configured)

**User Notification**:
- Email: For incidents > 1 hour
- In-app banner: For all incidents
- Twitter: For major outages

**Template**:
```
We're experiencing [BRIEF DESCRIPTION].

What's affected: [SERVICES]
Current status: [INVESTIGATING | FIXING | RESOLVED]
When: [START TIME]
Expected resolution: [ETA]

We'll update you every [FREQUENCY].
For questions: support@vitalpath.com
```

---

## 🧪 Testing & Validation

### Quarterly DR Drills

**Schedule**: First Monday of each quarter

**Scenarios to Test**:
1. Q1: Database restoration
2. Q2: Service failover
3. Q3: Security breach response
4. Q4: Total outage simulation

**Success Criteria**:
- RTO met for all scenarios
- RPO within acceptable limits
- Communication plan executed
- All team members participated

**Post-Drill**:
- Document lessons learned
- Update procedures
- Fix identified gaps

---

## 📚 Appendices

### A. Contact List

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| On-Call | Rotating | [phone] | [email] | [backup] |
| DBA | [Name] | [phone] | [email] | [backup] |
| DevOps | [Name] | [phone] | [email] | [backup] |
| Security | [Name] | [phone] | [email] | [backup] |

### B. Vendor Support

| Vendor | Support URL | Phone | SLA |
|--------|-------------|-------|-----|
| **Railway** | support@railway.app | N/A | 24h |
| **Vercel** | support@vercel.com | N/A | 24h |
| **AWS** | https://console.aws.amazon.com/support | +1-866-909-0384 | Varies by plan |
| **Supabase** | support@supabase.com | N/A | 48h |

### C. Recovery Time Log

| Date | Scenario | Time to Detect | Time to Resolve | RTO Met? | Lessons Learned |
|------|----------|----------------|-----------------|----------|-----------------|
| | | | | | |

### D. Backup Verification Log

| Date | Backup Tested | Restoration Success? | Time Taken | Issues Found |
|------|---------------|---------------------|------------|--------------|
| | | | | |

---

## ✅ Pre-Disaster Checklist

Ensure these are configured BEFORE a disaster:

- [ ] Daily automated backups running
- [ ] Backup restoration tested monthly
- [ ] S3 versioning enabled
- [ ] Cross-region replication configured
- [ ] Monitoring and alerting active
- [ ] Incident communication channels set up
- [ ] Team trained on DR procedures
- [ ] Vendor support contacts verified
- [ ] Secrets rotation schedule implemented
- [ ] DR drills scheduled quarterly

---

**Document Status**: ✅ **COMPLETE**  
**Last DR Drill**: [DATE]  
**Next DR Drill**: [DATE]  
**Last Backup Verified**: [DATE]  
**Backup Success Rate**: [%]

---

**Review and Update**:
- After every incident
- After infrastructure changes
- Quarterly for accuracy
- When team members change

**Approval**:
- CTO: _________________ Date: _______
- Security Lead: _________________ Date: _______
- DevOps Lead: _________________ Date: _______

