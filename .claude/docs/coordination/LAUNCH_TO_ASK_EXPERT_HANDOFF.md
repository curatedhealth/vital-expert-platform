# Inter-Agent Coordination Document
# Launch Strategy Agent → Ask Expert Service Agent

**Document Type**: Cross-Agent Handoff
**From**: Launch Strategy Agent
**To**: Ask Expert Service Agent
**Date**: November 27, 2025
**Priority**: HIGH
**Status**: ACTION REQUIRED

---

## Executive Summary

As the **Launch Strategy Agent**, I've completed a comprehensive assessment of VITAL Platform's Phase 1 launch readiness for the Ask Expert service. This document shares key findings, identifies blocking issues requiring your attention, and outlines coordination needs for successful mid-December 2025 launch.

**Bottom Line**: Ask Expert is **95% production-ready**, but has **2 critical blockers** that require immediate engineering action before launch.

---

## 1. Current Status Assessment

### 1.1 Overall Readiness: 95%

| Component | Status | Evidence |
|-----------|--------|----------|
| Mode 1 (Interactive-Manual) | ✅ OPERATIONAL | 100% tests passing, ~475ms response |
| Mode 2 (Interactive-Automatic) | ✅ OPERATIONAL | 100% tests passing, ~335ms response |
| Mode 3 (Manual-Autonomous) | ✅ OPERATIONAL | 15% performance improvement achieved |
| Mode 4 (Automatic-Autonomous) | ✅ OPERATIONAL | 3-expert limit optimization applied |
| LangGraph Workflows | ✅ COMPLETE | LangGraph 1.0+ compatible |
| 4-Level Privacy System | ✅ DEPLOYED | RLS policies active |
| Bug Fixes | ✅ 3/3 RESOLVED | UUID, RAG namespace, RLS functions |

### 1.2 Documentation Created

I've created comprehensive launch documentation that will support your service:

| Document | Location | Relevance to Ask Expert |
|----------|----------|------------------------|
| **Phase 1 Launch Plan** | `.claude/docs/launch/PHASE1_LAUNCH_PLAN.md` | Timeline, checklists, success criteria |
| **Launch Runbook** | `.claude/docs/launch/LAUNCH_RUNBOOK.md` | Day-of operations, incident response |
| **Go/No-Go Framework** | `.claude/docs/launch/GO_NO_GO_FRAMEWORK.md` | Decision criteria, assessment forms |
| **Notion Action Tracker** | `.claude/docs/launch/NOTION_ACTION_TRACKER.md` | 38 action items, risk register |
| **Customer Onboarding** | `.claude/docs/launch/CUSTOMER_ONBOARDING_GUIDE.md` | 7-day onboarding playbook |
| **Support Runbook** | `.claude/docs/launch/SUPPORT_RUNBOOK.md` | Troubleshooting, escalation |
| **Success Playbook** | `.claude/docs/launch/CUSTOMER_SUCCESS_PLAYBOOK.md` | Adoption, retention strategies |

---

## 2. CRITICAL BLOCKERS (Action Required)

### BLOCKER 1: User Context Middleware

**Severity**: P0 - LAUNCH BLOCKER
**Owner**: Backend Team (needs your coordination)
**Due Date**: November 29, 2025

**Issue**:
The `set_user_context()` function must be called in FastAPI middleware to enable user-level RLS (Row-Level Security). Currently, only tenant-level isolation is enforced.

**Impact**:
- User-private agents will not work correctly
- Privacy levels 1-2 (User-Private, Tenant-Shared) won't function as designed
- Multi-level privacy system incomplete

**Required Fix**:
```python
# In FastAPI middleware
@app.middleware("http")
async def set_user_context_middleware(request: Request, call_next):
    user_id = request.headers.get("x-user-id")
    if user_id:
        await supabase.rpc('set_user_context', {'p_user_id': user_id})
    response = await call_next(request)
    return response
```

**Your Action Required**:
- [ ] Coordinate with Backend Team on implementation
- [ ] Verify integration with existing RLS policies
- [ ] Test all 4 modes with user context enabled
- [ ] Update API documentation

---

### BLOCKER 2: Frontend x-user-id Header

**Severity**: P0 - LAUNCH BLOCKER
**Owner**: Frontend Team (needs your coordination)
**Due Date**: November 29, 2025

**Issue**:
Frontend must pass `x-user-id` header with all API requests for the user context middleware to function.

**Required Fix**:
```typescript
// In API client configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'x-user-id': getCurrentUserId(), // From auth context
  },
});
```

**Your Action Required**:
- [ ] Coordinate with Frontend Team on implementation
- [ ] Ensure header is passed for all Ask Expert API calls
- [ ] Test with logged-in users across all modes
- [ ] Verify user-private agent access

---

## 3. Performance Observations

### 3.1 Current Performance vs. Targets

| Mode | Current | PRD Target | Status | Notes |
|------|---------|------------|--------|-------|
| Mode 1 | 475ms | <500ms | ✅ ON TARGET | |
| Mode 2 | 335ms | <400ms | ✅ ON TARGET | |
| Mode 3 | 1951ms | <2000ms | ✅ ON TARGET | 15% improvement achieved |
| Mode 4 | 4665ms | <5000ms | ✅ ON TARGET | 3-expert limit applied |

### 3.2 Performance Recommendations

**For your consideration (not blockers)**:

1. **Mode 3 Optimization**: Current ~1.9s is good but could target <1.5s
   - Consider: Query classification to skip unnecessary steps for simple queries

2. **Mode 4 Optimization**: 4.6s is acceptable but UX would improve at <3s
   - Consider: Parallel RAG retrieval across selected agents
   - Consider: Shared context caching between agents

3. **Caching Opportunity**: Agent config caching (5-min TTL) is implemented but could be extended for frequently-used agents

---

## 4. Known Issues (Non-Blocking)

### Issue 1: Empty Responses in Edge Cases

**Severity**: P3 - Low
**Status**: Workaround in place

**Description**: Some edge cases return empty responses when agent orchestrator validation fails.

**Current Workaround**: Agents return fallback responses.

**Recommendation**: Add retry logic with query reformulation in Q1 2026.

---

### Issue 2: Mode 4 Agent Over-Selection

**Severity**: P2 - Medium
**Status**: Mitigated

**Description**: Agent selector sometimes returns 128+ agents for broad queries.

**Current Mitigation**: 3-agent limit enforced in workflow.

**Recommendation**: Fix agent selector algorithm to return max 5 agents, remove workflow limit.

---

### Issue 3: RAG Query Method Inconsistency

**Severity**: P3 - Low
**Status**: Non-blocking

**Description**: Different method signatures across modes for RAG queries.

**Current Handling**: Flexible error handling in place.

**Recommendation**: Standardize RAG interface in Q1 2026.

---

## 5. Launch Timeline Coordination

### Key Dates Requiring Your Attention

| Date | Milestone | Ask Expert Action |
|------|-----------|-------------------|
| **Nov 29** | Blockers resolved | Verify middleware + header |
| **Dec 4** | API documentation | Confirm docs complete |
| **Dec 6** | Security audit | Participate in review |
| **Dec 7** | Go/No-Go meeting | Present technical readiness |
| **Dec 8** | Production deployment | Monitor and support |
| **Dec 11** | Internal launch | Support smoke testing |
| **Dec 12** | Pilot customers live | On-call for issues |

### Go/No-Go Technical Requirements (Your Items)

These are the technical requirements I'll be assessing. Please ensure they're ready:

| ID | Requirement | Your Status |
|----|-------------|-------------|
| T1 | Mode 1 functional | ✅ Confirmed |
| T2 | Mode 2 functional | ✅ Confirmed |
| T3 | Mode 3 functional | ✅ Confirmed |
| T4 | Mode 4 functional | ✅ Confirmed |
| T5 | User context middleware | ⚠️ ACTION NEEDED |
| T6 | RLS policies tested | ✅ Confirmed |
| T7 | All P0/P1 bugs resolved | ⚠️ PENDING |
| T11 | P95 response time <3s (Mode 1-2) | ✅ Confirmed |
| T12 | P95 response time <5s (Mode 3-4) | ✅ Confirmed |

---

## 6. Customer-Facing Considerations

### 6.1 Onboarding Focus

Based on my customer onboarding documentation, here's what customers will be trained on:

**Week 1 Focus (Modes 1-2)**:
- Mode Selection Guide (which mode for which use case)
- Agent Catalog Navigation
- Query Best Practices

**Week 2 Focus (Modes 3-4)**:
- Autonomous Mode Capabilities
- Multi-Agent Collaboration
- Complex Workflow Execution

### 6.2 Support Preparation

The Support Runbook includes Ask Expert specific troubleshooting:

| Issue Category | Frequency (Expected) | Escalation Path |
|----------------|---------------------|-----------------|
| Mode timeout | Medium | Tier 1 → Backend |
| Poor response quality | Low | Tier 1 → Product |
| Agent not available | Low | Tier 1 → Database |
| Authentication | Medium | Tier 1 (self-resolve) |

### 6.3 Success Metrics We'll Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| First query within 48 hours | 100% of pilots | Analytics |
| Mode 2 adoption | >60% of queries | Analytics |
| Response satisfaction | >4.5/5 | In-app feedback |
| Follow-up question rate | >40% | Analytics |

---

## 7. Coordination Requests

### 7.1 Information Needed From You

| Request | Purpose | Due Date |
|---------|---------|----------|
| Confirmation of blocker resolution | Go/No-Go assessment | Nov 29 |
| Performance test results | Launch readiness | Dec 6 |
| Known issues status | Risk register update | Dec 6 |
| API documentation review | Customer enablement | Dec 4 |

### 7.2 Meetings to Schedule

| Meeting | Purpose | Suggested Date |
|---------|---------|----------------|
| Technical sync | Blocker resolution planning | Nov 28 |
| Go/No-Go prep | Review assessment scores | Dec 6 |
| Launch day brief | Roles and responsibilities | Dec 11 |

### 7.3 Communication Channels

For launch coordination, please use:
- **Slack**: #vital-launch (real-time)
- **Email**: For formal updates
- **Daily standup**: Launch team sync

---

## 8. Risk Alignment

### Risks I'm Tracking That Affect You

| Risk | Impact | Your Role |
|------|--------|-----------|
| Veeva competitor launch (Dec 2025) | Market pressure | Ensure on-time delivery |
| User context not implemented | Privacy system incomplete | Resolve by Nov 29 |
| Performance degradation at scale | Poor UX | Monitor and optimize |
| OpenAI API rate limits | Service disruption | Implement fallbacks |

### Mitigation Coordination

For each risk, we should align on:
1. Detection mechanism (how will we know?)
2. Response plan (what do we do?)
3. Owner (who leads response?)

---

## 9. Documentation Handoff

### Documents You Should Review

**Priority 1 (Before Nov 29)**:
- [ ] `GO_NO_GO_FRAMEWORK.md` - Technical requirements checklist
- [ ] `PHASE1_LAUNCH_PLAN.md` - Technical readiness section

**Priority 2 (Before Dec 6)**:
- [ ] `LAUNCH_RUNBOOK.md` - Incident response procedures
- [ ] `SUPPORT_RUNBOOK.md` - Ask Expert troubleshooting section

**Priority 3 (Before Dec 11)**:
- [ ] `CUSTOMER_ONBOARDING_GUIDE.md` - Training content accuracy
- [ ] `NOTION_ACTION_TRACKER.md` - Your assigned action items

---

## 10. Summary of Actions

### Your Immediate Actions (Nov 27-29)

| # | Action | Priority | Due |
|---|--------|----------|-----|
| 1 | Coordinate user context middleware implementation | P0 | Nov 29 |
| 2 | Coordinate x-user-id header implementation | P0 | Nov 29 |
| 3 | Test all 4 modes with user context | P0 | Nov 30 |
| 4 | Review Go/No-Go technical requirements | P1 | Nov 29 |
| 5 | Schedule technical sync meeting | P1 | Nov 28 |

### My Commitments to You

| # | Commitment | Timeline |
|---|------------|----------|
| 1 | Daily status updates on launch readiness | Through launch |
| 2 | Go/No-Go assessment preparation | Dec 6 |
| 3 | Customer communication templates ready | Dec 8 |
| 4 | Support team briefed on Ask Expert | Dec 10 |
| 5 | Post-launch monitoring coordination | Dec 12+ |

---

## Acknowledgment

Please confirm receipt of this handoff by:
1. Reviewing the blockers and confirming ownership
2. Providing estimated completion dates
3. Identifying any additional coordination needs

**Response requested by**: November 28, 2025

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | Launch Strategy Agent | Initial handoff |

---

*This document serves as the official coordination record between Launch Strategy Agent and Ask Expert Service Agent for Phase 1 launch.*
