# VITAL Platform - Support Runbook
# Phase 1: Ask Expert Service

**Document Version**: 1.0
**Last Updated**: November 27, 2025
**Owner**: Support Team Lead
**Audience**: Support Engineers, CSMs

---

## Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SUPPORT QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEVERITY LEVELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P0 - Critical:  Platform down, data loss, security breach
                Response: 15 min | Resolution: 4 hours
P1 - High:      Major feature broken, blocking work
                Response: 1 hour | Resolution: 8 hours
P2 - Medium:    Feature degraded, workaround exists
                Response: 4 hours | Resolution: 24 hours
P3 - Low:       Minor issue, cosmetic, enhancement request
                Response: 24 hours | Resolution: 72 hours

ESCALATION PATH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tier 1 (0-30 min):   Support Engineer
Tier 2 (30-60 min):  Support Lead + Engineering
Tier 3 (60+ min):    VP Engineering + On-call
P0 Immediate:        Page on-call, notify leadership

KEY CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Support Lead:     [Name]     [Phone]     [Slack: @name]
Backend On-call:  [Rotation] [PagerDuty] [Slack: #oncall]
DevOps On-call:   [Rotation] [PagerDuty] [Slack: #oncall]
CSM Team:         [Name]     [Phone]     [Slack: #cs-team]

USEFUL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Dashboard:  https://admin.vital.health
Monitoring:       [Datadog URL]
Logs:             [Log aggregator URL]
Status Page:      https://status.vital.health
Knowledge Base:   https://docs.vital.health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Part 1: Support Operations Overview

### 1.1 Support Hours

| Channel | Hours | Availability |
|---------|-------|--------------|
| In-app Chat | 9am - 6pm EST | Mon-Fri |
| Email Support | 9am - 6pm EST | Mon-Fri |
| Emergency Line | 24/7 | P0 only |
| Status Page | 24/7 | Automated |

### 1.2 Support Channels

| Channel | Use Case | SLA |
|---------|----------|-----|
| **In-app Chat** | Quick questions, guidance | Real-time |
| **Email** | Detailed issues, documentation | See priority SLAs |
| **Phone** | P0 emergencies only | 15 min response |
| **Slack** (internal) | Engineering escalation | Per severity |

### 1.3 Ticket Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPORT TICKET LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

1. TICKET CREATED
   │
   ├── Source: Chat, Email, Phone, Self-service
   │
   ▼
2. TRIAGE (< 15 min)
   │
   ├── Assign priority (P0-P3)
   ├── Categorize issue type
   ├── Assign to support engineer
   │
   ▼
3. INVESTIGATION
   │
   ├── Gather information
   ├── Reproduce issue
   ├── Check known issues
   │
   ▼
4. RESOLUTION / ESCALATION
   │
   ├── Resolve directly OR
   ├── Escalate to Tier 2/3
   │
   ▼
5. CUSTOMER COMMUNICATION
   │
   ├── Update customer
   ├── Verify resolution
   │
   ▼
6. CLOSURE
   │
   ├── Document resolution
   ├── Update knowledge base
   └── Close ticket
```

---

## Part 2: Issue Categories & Solutions

### 2.1 Authentication Issues

#### Issue: User Cannot Log In

**Symptoms:**
- "Invalid credentials" error
- Redirect loop on login
- Blank page after login

**Diagnostic Steps:**
```
1. Verify user account exists
   - Check admin dashboard: Users > Search by email

2. Check account status
   - Is account active? (not suspended/deleted)
   - Is MFA enabled and configured?

3. Verify credentials
   - Ask user to reset password
   - Check for caps lock, copy-paste issues

4. Check browser
   - Clear cookies and cache
   - Try incognito/private mode
   - Try different browser

5. Check SSO (if applicable)
   - Verify SSO configuration
   - Check IdP status
   - Review SAML assertions
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| Wrong password | Send password reset link |
| Account locked | Unlock in admin dashboard |
| MFA issue | Reset MFA, provide backup codes |
| SSO misconfigured | Verify IdP settings, attribute mapping |
| Session expired | Clear cookies, re-login |
| Browser issue | Clear cache, try incognito |

**Canned Response:**
```
Hi [Name],

I'm sorry you're having trouble logging in. Let's get this resolved:

1. Please try resetting your password: [Reset Link]

2. If that doesn't work, try clearing your browser cookies:
   - Chrome: Settings > Privacy > Clear browsing data
   - Select "Cookies" and clear

3. Try logging in using an incognito/private window

If you're still having issues, please let me know:
- What browser are you using?
- Are you seeing any error message?
- Are you using SSO (single sign-on)?

I'm here to help!
[Support Name]
```

---

#### Issue: MFA Not Working

**Symptoms:**
- MFA code rejected
- "Invalid code" error
- No MFA prompt appears

**Diagnostic Steps:**
```
1. Verify MFA is enabled for user
   - Admin > Users > [User] > Security

2. Check time sync
   - TOTP codes are time-sensitive
   - User's device clock must be accurate

3. Verify correct MFA method
   - Authenticator app vs SMS
   - Correct account in authenticator

4. Check for recent device changes
   - New phone?
   - App reinstalled?
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| Time sync issue | Sync device time to internet |
| Wrong account in app | Re-enroll MFA with new QR code |
| Lost device | Use backup codes, then re-enroll |
| App corrupted | Reinstall authenticator app |

---

### 2.2 Ask Expert Issues

#### Issue: Mode Not Responding / Timeout

**Symptoms:**
- Spinning loader indefinitely
- "Request timed out" error
- No response after 60+ seconds

**Diagnostic Steps:**
```
1. Check system status
   - Is the service operational?
   - Check monitoring dashboards
   - Review recent deployments

2. Identify affected mode
   - Mode 1? Mode 2? Mode 3? Mode 4?
   - All modes or specific mode?

3. Check API health
   curl -X POST https://api.vital.health/api/mode1/health
   curl -X POST https://api.vital.health/api/mode2/health

4. Check logs for errors
   - Search for user's tenant_id
   - Look for timeout errors
   - Check OpenAI API errors

5. Check dependencies
   - OpenAI API status
   - Supabase status
   - Pinecone status
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| OpenAI API down | Wait for recovery, notify customer |
| Mode-specific bug | Escalate to engineering |
| Network timeout | Ask user to retry |
| Query too complex | Suggest simpler query, try Mode 1/2 |
| System overloaded | Scale up, notify DevOps |

**Canned Response:**
```
Hi [Name],

I'm sorry you're experiencing slow or missing responses. Let me help:

Current system status: [Check status.vital.health]

A few things to try:
1. Refresh the page and try your query again
2. If using Mode 3 or 4, try Mode 1 or 2 for faster responses
3. Try simplifying your query if it's very complex

If the issue persists, can you share:
- Which mode were you using?
- What was your query? (approximately)
- When did this occur? (time and timezone)

I'll investigate further and get back to you shortly.

[Support Name]
```

---

#### Issue: Poor Quality Response

**Symptoms:**
- Response doesn't address question
- Response is generic/unhelpful
- Missing citations or evidence
- Incorrect information

**Diagnostic Steps:**
```
1. Review the query
   - Was it clear and specific?
   - Was appropriate mode selected?

2. Review the response
   - What specifically was wrong?
   - Was wrong agent selected (Mode 2)?

3. Check agent selection
   - In Mode 2, was appropriate agent chosen?
   - Would a different agent be better?

4. Review conversation context
   - Was context lost?
   - Previous messages relevant?
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| Vague query | Help user refine query |
| Wrong mode | Suggest better mode |
| Wrong agent (Mode 2) | Suggest Mode 1 with specific agent |
| Agent limitation | Identify better agent |
| System issue | Escalate if reproducible |

**Canned Response:**
```
Hi [Name],

Thank you for the feedback. I want to make sure you get the best results.

A few questions:
1. Can you share the original query you submitted?
2. What specifically was missing or incorrect in the response?
3. Which mode were you using?

Quick tips for better responses:
• Be specific about your context (industry, region, use case)
• State your desired outcome clearly
• For technical topics, try Mode 1 with a specific expert

I'd be happy to suggest the best approach for your use case.

[Support Name]
```

---

#### Issue: Agent Not Available / Selection Error

**Symptoms:**
- "No agents available" error
- Can't find specific agent
- Agent selection fails in Mode 2

**Diagnostic Steps:**
```
1. Check agent catalog
   - Is agent active in database?
   - Is agent assigned to tenant?

2. Check tenant permissions
   - Does tenant have access to agent?
   - Check agent_tenant_access table

3. Check mode configuration
   - Mode 1: User must select agent
   - Mode 2: System selects from available agents

4. Review error logs
   - Search for agent selection errors
   - Check RAG retrieval logs
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| Agent not in catalog | Verify agent exists, notify product |
| Tenant doesn't have access | Grant access in admin |
| Agent disabled | Re-enable or suggest alternative |
| Mode 2 algorithm issue | Escalate to engineering |

---

### 2.3 Performance Issues

#### Issue: Slow Response Times

**Symptoms:**
- Responses taking >60 seconds
- Frequent timeouts
- Degraded user experience

**Diagnostic Steps:**
```
1. Check baseline performance
   - What are normal response times?
   - Mode 1-2: 30-60s, Mode 3-4: 3-10 min

2. Check system metrics
   - CPU/memory utilization
   - Database connection count
   - API request queue depth

3. Check dependencies
   - OpenAI API latency
   - Database query times
   - Network latency

4. Isolate the issue
   - All users or specific user?
   - All modes or specific mode?
   - All queries or specific type?
```

**Resolution Steps:**

| Cause | Solution |
|-------|----------|
| OpenAI latency | Monitor, notify if persistent |
| Database slow | Check query performance, add indexes |
| High load | Scale up resources |
| Network issues | Check cloud provider status |
| Complex query | Suggest breaking into smaller queries |

---

### 2.4 Data & Privacy Issues

#### Issue: User Sees Another User's Data

**Severity: P0 - CRITICAL**

**Immediate Actions:**
```
1. DOCUMENT immediately
   - Screenshot (if possible)
   - User ID, tenant ID
   - What data was visible
   - Timestamp

2. ESCALATE immediately
   - Page on-call engineer
   - Notify Support Lead
   - Notify Security Lead

3. ISOLATE
   - Disable affected user's access
   - Do NOT delete evidence

4. DO NOT communicate to customer
   - Wait for leadership guidance
   - Legal may need to be involved
```

**Escalation Script:**
```
@oncall @support-lead @security-lead

P0 DATA INCIDENT - POTENTIAL CROSS-TENANT DATA EXPOSURE

Affected Customer: [Customer Name]
Affected User: [User ID]
Incident Time: [Time]
Description: [Brief description]

Evidence preserved: Yes/No
User access suspended: Yes/No

Awaiting guidance on customer communication.
```

---

#### Issue: Data Deletion Request (GDPR/CCPA)

**Process:**
```
1. Verify request authenticity
   - Confirm requester identity
   - Verify they have authority

2. Document request
   - Create ticket
   - Record scope of deletion
   - Get written confirmation

3. Escalate to Data Protection team
   - Forward to dpo@vital.health
   - Include all documentation

4. Communicate timeline
   - GDPR: 30 days
   - CCPA: 45 days

5. Confirm completion
   - Provide deletion confirmation
   - Document in compliance log
```

**Canned Response:**
```
Hi [Name],

Thank you for your data deletion request. We take data privacy seriously
and will process your request in accordance with applicable regulations.

Here's what happens next:
1. We've forwarded your request to our Data Protection team
2. They will verify the request scope
3. You'll receive confirmation within [30/45] days

If you have any questions, please don't hesitate to ask.

[Support Name]
```

---

### 2.5 Billing Issues

#### Issue: Billing Discrepancy

**Process:**
```
1. Gather information
   - Invoice number
   - Disputed amount
   - Expected amount

2. Review usage
   - Pull usage report from admin
   - Compare to invoice

3. Identify discrepancy
   - Calculation error?
   - Usage tracking issue?
   - Pricing confusion?

4. Resolve or escalate
   - Simple corrections: Process immediately
   - Complex issues: Escalate to Finance
```

**Canned Response:**
```
Hi [Name],

Thank you for bringing this to our attention. I'd be happy to review
your billing concern.

To help me investigate, please provide:
1. Invoice number or billing period
2. What amount you expected vs. what was charged
3. Any specific line items in question

I'll review this and get back to you within 24 hours with findings.

[Support Name]
```

---

## Part 3: Escalation Procedures

### 3.1 Escalation Matrix

| Severity | Initial Owner | Escalation 1 (30 min) | Escalation 2 (60 min) | Escalation 3 (2 hr) |
|----------|---------------|----------------------|----------------------|---------------------|
| P0 | On-call Engineer | Engineering Lead | VP Engineering | CEO |
| P1 | Support Engineer | Support Lead | Engineering Lead | VP Engineering |
| P2 | Support Engineer | Support Lead | Engineering | - |
| P3 | Support Engineer | Support Lead | - | - |

### 3.2 P0 Escalation Procedure

```
┌─────────────────────────────────────────────────────────────────┐
│                    P0 ESCALATION PROCEDURE                       │
│                    "PLATFORM DOWN" PROTOCOL                      │
└─────────────────────────────────────────────────────────────────┘

MINUTE 0: Incident Detected
├── Acknowledge in #incidents channel
├── Start incident timer
└── Assign Incident Commander

MINUTE 5: Initial Assessment
├── Identify scope of impact
├── Check monitoring dashboards
├── Review recent changes
└── Post update to #incidents

MINUTE 10: Page On-Call
├── Page backend on-call
├── Page DevOps on-call
└── Notify Support Lead

MINUTE 15: First Customer Update
├── Update status page
├── Send holding response to affected customers
└── Post update to #incidents

MINUTE 30: Escalation Check
├── If not mitigated: Escalate to Engineering Lead
├── Update status page
└── Customer communication update

MINUTE 60: Leadership Notification
├── If not mitigated: Notify VP Engineering
├── Consider external communication (PR)
└── Customer communication update

EVERY 15 MIN: Status Updates
├── Post to #incidents
├── Update status page
└── Customer communication (if customer-facing)

RESOLUTION:
├── Confirm stable for 30 minutes
├── Update status page: "Resolved"
├── Send resolution communication to customers
├── Schedule post-mortem within 48 hours
└── Close incident
```

### 3.3 Engineering Escalation Template

```markdown
## Support Escalation to Engineering

**Ticket ID**: [Ticket #]
**Customer**: [Customer Name]
**Priority**: [P0/P1/P2/P3]
**Issue Type**: [Category]

### Issue Summary
[One paragraph description]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Evidence
- Screenshot: [Link]
- Logs: [Link]
- Error message: [Exact text]

### Impact
- Users affected: [Count]
- Functionality blocked: [Yes/No]
- Workaround available: [Yes/No]

### Customer Context
- Tenant ID: [UUID]
- User ID: [UUID]
- Time of incident: [Time + Timezone]

### Attempted Solutions
1. [What was tried]
2. [What was tried]

### Additional Notes
[Any other relevant information]
```

---

## Part 4: Tools & Access

### 4.1 Support Tools

| Tool | Purpose | Access Level |
|------|---------|--------------|
| **Admin Dashboard** | User management, tenant config | Support Engineer |
| **Datadog** | Monitoring, logs, APM | Support Engineer |
| **Supabase Dashboard** | Database queries (read-only) | Support Lead |
| **Zendesk** | Ticket management | All Support |
| **Slack** | Internal communication | All Support |
| **PagerDuty** | On-call escalation | Support Lead |
| **Status Page** | Incident communication | Support Lead |

### 4.2 Admin Dashboard Guide

**Accessing the Dashboard:**
```
URL: https://admin.vital.health
Login: Support SSO
```

**Common Tasks:**

**Find a User:**
```
1. Navigate to Users > Search
2. Enter email or name
3. Click user to view details
```

**Check User Activity:**
```
1. Users > [User] > Activity
2. View recent queries
3. Check session history
```

**Reset User Password:**
```
1. Users > [User] > Security
2. Click "Send Password Reset"
3. Confirm action
```

**Reset User MFA:**
```
1. Users > [User] > Security
2. Click "Reset MFA"
3. User will re-enroll on next login
```

**Check Tenant Configuration:**
```
1. Tenants > [Tenant Name]
2. View settings, users, usage
```

### 4.3 Log Search Guide

**Datadog Log Search:**
```
# Find user's recent activity
service:vital-api @user_id:[UUID] @timestamp:[time range]

# Find errors for a tenant
service:vital-api @tenant_id:[UUID] status:error

# Find mode-specific issues
service:vital-api @endpoint:/api/mode1/* status:error

# Find slow requests
service:vital-api @duration:>5000

# Find OpenAI errors
service:vital-api @message:"OpenAI" status:error
```

**Common Log Patterns:**

| Pattern | Meaning |
|---------|---------|
| `status:error` | Error occurred |
| `@duration:>5000` | Request took >5 seconds |
| `"timeout"` | Request timed out |
| `"rate limit"` | Rate limiting triggered |
| `"authentication"` | Auth-related issue |
| `"RLS"` | Row-Level Security issue |

---

## Part 5: Canned Responses Library

### 5.1 Initial Response Templates

**Acknowledgment (All Priorities):**
```
Hi [Name],

Thank you for contacting VITAL Support. I've received your request and
I'm looking into it now.

Ticket ID: [#]
Priority: [Priority]
Expected response time: [SLA]

I'll update you as soon as I have more information.

[Support Name]
VITAL Support Team
```

**Need More Information:**
```
Hi [Name],

Thank you for reaching out. To help you better, I need a bit more
information:

1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

Once I have these details, I'll be able to investigate further.

[Support Name]
```

### 5.2 Resolution Templates

**Issue Resolved:**
```
Hi [Name],

Great news! The issue has been resolved.

**What happened:**
[Brief explanation]

**What we did:**
[Resolution steps]

**What you need to do:**
[Any user actions required, or "Nothing - you're all set!"]

If you experience any further issues, please don't hesitate to reach out.

[Support Name]
```

**Workaround Provided:**
```
Hi [Name],

I've identified a workaround for your issue:

**Workaround:**
[Step-by-step workaround]

**Root cause:**
[Brief explanation]

**Permanent fix:**
Our engineering team is working on a permanent fix. I'll update you
when it's deployed.

[Support Name]
```

**Escalated to Engineering:**
```
Hi [Name],

I've escalated your issue to our engineering team for further
investigation.

**What happens next:**
1. Engineering will investigate (ETA: [time])
2. I'll keep you updated on progress
3. We'll notify you once resolved

**Workaround (if available):**
[Workaround or "None available at this time"]

I appreciate your patience.

[Support Name]
```

### 5.3 Outage Communication Templates

**Service Degradation:**
```
Hi [Name],

We're aware of performance issues affecting [service/feature].

**Status:** We're actively investigating
**Impact:** [Description of impact]
**Workaround:** [If available]

I'll update you as soon as we have more information.

You can also check our status page: status.vital.health

[Support Name]
```

**Service Restored:**
```
Hi [Name],

Good news! [Service/feature] has been restored to normal operation.

**Issue:** [Brief description]
**Duration:** [Start time] - [End time]
**Resolution:** [What was done]

We apologize for any inconvenience. If you're still experiencing
issues, please let me know.

[Support Name]
```

---

## Part 6: Knowledge Base Management

### 6.1 KB Article Template

```markdown
# [Issue Title]

**Category**: [Authentication / Ask Expert / Performance / Billing / Other]
**Last Updated**: [Date]
**Applies To**: [All users / Specific plan / Specific feature]

## Symptoms
- [Symptom 1]
- [Symptom 2]
- [Symptom 3]

## Cause
[Brief explanation of what causes this issue]

## Resolution

### Option 1: [Self-Service Fix]
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Option 2: [If Option 1 Doesn't Work]
1. [Step 1]
2. [Step 2]

### Contact Support If:
- [Condition requiring support]
- [Condition requiring support]

## Related Articles
- [Link to related article 1]
- [Link to related article 2]

## Tags
[tag1], [tag2], [tag3]
```

### 6.2 When to Create KB Articles

Create a new KB article when:
- Same issue occurs 3+ times
- Workaround is non-obvious
- Resolution requires multiple steps
- Customer could self-serve with guidance

### 6.3 KB Article Review Process

```
1. Draft article using template
2. Test all steps personally
3. Submit for peer review
4. Publish to internal KB
5. If customer-facing, publish to docs.vital.health
6. Link in relevant ticket responses
```

---

## Part 7: Metrics & Reporting

### 7.1 Support KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Response Time (P0) | <15 min | Avg from ticket creation |
| First Response Time (P1) | <1 hour | Avg from ticket creation |
| First Response Time (P2) | <4 hours | Avg from ticket creation |
| Resolution Time (P0) | <4 hours | Avg from ticket creation |
| Resolution Time (P1) | <8 hours | Avg from ticket creation |
| Resolution Time (P2) | <24 hours | Avg from ticket creation |
| CSAT Score | >4.5/5 | Post-ticket survey |
| First Contact Resolution | >60% | Resolved without escalation |
| Ticket Volume | Baseline | Track trends |
| Escalation Rate | <20% | Tickets escalated to Eng |

### 7.2 Daily Stand-up Format

```markdown
## Support Daily Stand-up - [Date]

### Yesterday
- Tickets closed: [#]
- Escalations: [#]
- Notable issues: [Brief]

### Today
- Tickets in queue: [#]
- Priority items: [List]
- Coverage: [Names]

### Blockers
- [Any blockers]

### FYI
- [Any announcements]
```

### 7.3 Weekly Report Format

```markdown
## Support Weekly Report - Week of [Date]

### Summary
- Total tickets: [#]
- Tickets resolved: [#]
- Avg first response: [Time]
- Avg resolution time: [Time]
- CSAT: [Score]

### By Priority
| Priority | Received | Resolved | Avg Resolution |
|----------|----------|----------|----------------|
| P0       | [#]      | [#]      | [Time]         |
| P1       | [#]      | [#]      | [Time]         |
| P2       | [#]      | [#]      | [Time]         |
| P3       | [#]      | [#]      | [Time]         |

### Top Issues
1. [Issue category] - [#] tickets
2. [Issue category] - [#] tickets
3. [Issue category] - [#] tickets

### Escalations
- Total: [#]
- To Engineering: [#]
- To CSM: [#]

### Notable Incidents
- [Description]

### Feedback Themes
- [Common feedback 1]
- [Common feedback 2]

### Action Items
- [ ] [Action from this week]
- [ ] [Improvement opportunity]

### Next Week Focus
- [Priority focus area]
```

---

## Part 8: On-Call Procedures

### 8.1 On-Call Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| Week 1 | [Name] | [Name] |
| Week 2 | [Name] | [Name] |
| Week 3 | [Name] | [Name] |
| Week 4 | [Name] | [Name] |

### 8.2 On-Call Responsibilities

**During On-Call Hours (24/7 for P0):**
```
□ Monitor #alerts channel
□ Respond to pages within 5 minutes
□ Assess severity and escalate if needed
□ Document all incidents
□ Hand off to next on-call at shift change
```

**Page Response Checklist:**
```
□ Acknowledge page in PagerDuty
□ Post in #incidents that you're investigating
□ Check monitoring dashboards
□ Assess severity and impact
□ Follow escalation procedures
□ Update status page if customer-facing
□ Document in incident ticket
```

### 8.3 Handoff Procedure

```markdown
## On-Call Handoff - [Date]

**From**: [Outgoing on-call]
**To**: [Incoming on-call]

### Open Issues
| Ticket | Priority | Status | Notes |
|--------|----------|--------|-------|
| [#]    | [P#]     | [Status] | [Notes] |

### Recent Incidents
- [Incident summary]

### Ongoing Monitoring
- [Any systems to watch closely]

### FYI
- [Any relevant context]

**Handoff Acknowledged**: [Incoming on-call signature]
```

---

## Appendix A: Diagnostic Scripts

### Health Check Script

```bash
#!/bin/bash
# support-health-check.sh
# Run this to check system health

echo "=== VITAL Health Check $(date) ==="
echo ""

# API Health
echo "API Status:"
curl -s -w "\n  Response time: %{time_total}s\n" \
  https://api.vital.health/health | jq -r '.status'

# Mode Health
echo ""
echo "Mode Status:"
for mode in mode1 mode2 mode3 mode4; do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://api.vital.health/api/$mode/health)
  echo "  $mode: $status"
done

# External Dependencies
echo ""
echo "External Dependencies:"
echo "  OpenAI: $(curl -s https://status.openai.com/api/v2/status.json | jq -r '.status.indicator')"
echo "  Supabase: $(curl -s https://status.supabase.com/api/v2/status.json | jq -r '.status.indicator')"

echo ""
echo "=== Check Complete ==="
```

### User Lookup Script

```bash
#!/bin/bash
# support-user-lookup.sh
# Look up user information

USER_EMAIL=$1

if [ -z "$USER_EMAIL" ]; then
  echo "Usage: ./support-user-lookup.sh user@email.com"
  exit 1
fi

echo "=== User Lookup: $USER_EMAIL ==="
# This would connect to your admin API
curl -s "https://admin.vital.health/api/users?email=$USER_EMAIL" | jq
```

---

## Appendix B: Severity Classification Examples

### P0 - Critical (Platform Down)

- Platform completely inaccessible
- All users affected
- Data loss or corruption
- Security breach
- Complete feature failure (all modes down)

### P1 - High (Major Feature Broken)

- Single mode not working
- Specific tenant completely blocked
- Authentication system down
- Major performance degradation (>60s responses)
- Data not saving

### P2 - Medium (Feature Degraded)

- Slow responses (<60s but >15s)
- Intermittent errors
- Minor feature not working
- Workaround exists
- Single user affected

### P3 - Low (Minor Issue)

- UI/cosmetic issues
- Enhancement requests
- Documentation questions
- General inquiries
- Feature requests

---

## Appendix C: Support Checklist (Printable)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY SUPPORT CHECKLIST                       │
└─────────────────────────────────────────────────────────────────┘

START OF SHIFT
□ Check #alerts channel for overnight issues
□ Review open tickets in queue
□ Check status page for any incidents
□ Review handoff notes from previous shift
□ Verify all tools are accessible

DURING SHIFT
□ Respond to new tickets within SLA
□ Update tickets with progress
□ Escalate as needed
□ Document resolutions
□ Update knowledge base for repeated issues

END OF SHIFT
□ Update all open tickets with status
□ Create handoff notes for next shift
□ Flag any urgent items
□ Report any trends noticed
□ Log off and transfer on-call (if applicable)
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | Launch Strategy Agent | Initial version |

---

*This runbook should be reviewed and updated monthly based on support team feedback.*
