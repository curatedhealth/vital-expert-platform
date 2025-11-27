# Phase 1 Launch Readiness Checklist
## Ask Expert Service (Modes 1-2)

**Target Launch**: Mid-December 2025 (~3 weeks)
**Created**: November 27, 2025
**Owner**: Launch Strategy Agent
**Status**: PRE-LAUNCH ASSESSMENT

---

## Executive Summary

| Category | Complete | In Progress | Not Started | Blocked | Total |
|----------|----------|-------------|-------------|---------|-------|
| Technical Readiness | 15 | 3 | 2 | 1 | 21 |
| Security & Compliance | 6 | 2 | 3 | 0 | 11 |
| Documentation | 2 | 3 | 5 | 0 | 10 |
| Operational Readiness | 1 | 2 | 7 | 0 | 10 |
| Marketing & Sales | 0 | 1 | 6 | 0 | 7 |
| **TOTAL** | **24** | **11** | **23** | **1** | **59** |

**Overall Readiness**: ~41% Complete | 59 Items Total

---

## Launch Timeline

| Milestone | Date | Status |
|-----------|------|--------|
| T-21 days | Nov 27 | Assessment & Gap Analysis |
| T-14 days | Dec 4 | Remediation Sprint Begins |
| T-7 days | Dec 11 | Feature Freeze |
| T-3 days | Dec 14 | Go/No-Go Decision |
| **LAUNCH** | Dec 17 | Production Deployment |

---

## 1. TECHNICAL READINESS

### 1.1 Mode 1: Interactive + Manual (User Selects Expert)

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| T1.1 | Mode 1 endpoint operational | P0 | COMPLETE | ask-expert-service-agent | - | POST /api/mode1/manual verified |
| T1.2 | User can select from agent catalog | P0 | COMPLETE | ask-expert-service-agent | - | 319+ agents available |
| T1.3 | Multi-turn conversation with history | P0 | COMPLETE | ask-expert-service-agent | - | Session management working |
| T1.4 | RAG retrieval functional | P1 | COMPLETE | ask-expert-service-agent | - | Fixed namespace callable |
| T1.5 | Citation tracking | P1 | COMPLETE | ask-expert-service-agent | - | Evidence-based responses |
| T1.6 | Response latency <25s (P50) | P0 | IN PROGRESS | ask-expert-service-agent | Dec 10 | Current: 475ms (needs validation at scale) |

### 1.2 Mode 2: Interactive + Automatic (AI Selects Expert)

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| T2.1 | Mode 2 endpoint operational | P0 | COMPLETE | ask-expert-service-agent | - | POST /api/mode2/automatic verified |
| T2.2 | Evidence-based agent selection | P0 | COMPLETE | ask-expert-service-agent | - | GraphRAG selector working |
| T2.3 | Selection reasoning provided to user | P1 | COMPLETE | ask-expert-service-agent | - | Explains why expert chosen |
| T2.4 | Response latency <40s (P50) | P0 | IN PROGRESS | ask-expert-service-agent | Dec 10 | Current: 335ms (needs validation at scale) |
| T2.5 | Multi-expert selection (top 2-3) | P1 | COMPLETE | ask-expert-service-agent | - | Returns best matches |

### 1.3 Core Infrastructure

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| T3.1 | LangGraph workflows operational | P0 | COMPLETE | python-ai-ml-engineer | - | v1.0+ compatible |
| T3.2 | Agent UUID validation fixed | P0 | COMPLETE | ask-expert-service-agent | - | Union[UUID, str] support |
| T3.3 | OpenAI API configured | P0 | COMPLETE | ask-expert-service-agent | - | GPT-4-0613, embeddings working |
| T3.4 | Pinecone index connected | P0 | COMPLETE | ask-expert-service-agent | - | vital-medical-agents index |
| T3.5 | Neo4j connection | P2 | BLOCKED | data-architecture-expert | Dec 5 | DNS resolution failed - check Aura console |
| T3.6 | PostgreSQL full-text search RPC | P1 | NOT STARTED | sql-supabase-specialist | Dec 3 | search_agents_fulltext() needed |
| T3.7 | Agent caching (5-min TTL) | P1 | COMPLETE | ask-expert-service-agent | - | Performance optimization |

### 1.4 Database & Data

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| T4.1 | Agent data complete (892 active) | P0 | COMPLETE | vital-database-architect | - | 1,138 total, 892 active |
| T4.2 | Multi-tenant data isolation | P0 | COMPLETE | vital-database-architect | - | 5 tenants configured |
| T4.3 | Agent embeddings in Pinecone | P0 | COMPLETE | ask-expert-service-agent | - | ~892 vectors estimated |
| T4.4 | agent_levels table schema fix | P1 | NOT STARTED | sql-supabase-specialist | Dec 3 | level_name vs level_number issue |

---

## 2. SECURITY & COMPLIANCE

### 2.1 Row-Level Security (RLS)

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| S1.1 | RLS policies deployed | P0 | COMPLETE | vital-security-compliance | - | agents table protected |
| S1.2 | set_tenant_context() function | P0 | COMPLETE | sql-supabase-specialist | - | Migration 001 deployed |
| S1.3 | User context in middleware | P0 | IN PROGRESS | ask-expert-service-agent | Dec 5 | Need x-user-id header |
| S1.4 | Multi-level privacy (4 levels) | P1 | COMPLETE | vital-security-compliance | - | User/Tenant/Multi/Public |
| S1.5 | agent_tenant_access junction | P1 | COMPLETE | vital-database-architect | - | Sharing mechanism ready |

### 2.2 Compliance

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| S2.1 | HIPAA compliance review | P0 | IN PROGRESS | vital-security-compliance | Dec 10 | No PHI in MVP scope |
| S2.2 | Data handling policies documented | P1 | NOT STARTED | vital-documentation-writer | Dec 8 | Legal review needed |
| S2.3 | Security assessment | P0 | NOT STARTED | vital-security-compliance | Dec 10 | Penetration test scope TBD |
| S2.4 | Audit logging enabled | P1 | NOT STARTED | vital-devops-engineer | Dec 10 | Query and response logging |
| S2.5 | Terms of Service finalized | P1 | NOT STARTED | external-legal | Dec 12 | Legal team dependency |
| S2.6 | Privacy policy updated | P1 | NOT STARTED | external-legal | Dec 12 | Legal team dependency |

---

## 3. DOCUMENTATION

### 3.1 User-Facing Documentation

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| D1.1 | User guide for Mode 1-2 | P0 | NOT STARTED | vital-documentation-writer | Dec 10 | Include screenshots |
| D1.2 | FAQ and troubleshooting | P1 | NOT STARTED | vital-documentation-writer | Dec 12 | Common issues |
| D1.3 | Demo scripts (5-min walkthrough) | P1 | NOT STARTED | launch-strategy-agent | Dec 8 | Sales enablement |
| D1.4 | Video tutorial | P2 | NOT STARTED | external-marketing | Dec 14 | Nice to have for launch |

### 3.2 Technical Documentation

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| D2.1 | API documentation | P0 | IN PROGRESS | vital-api-designer | Dec 8 | Endpoints documented, need examples |
| D2.2 | Agent capability catalog | P1 | COMPLETE | ask-expert-service-agent | - | 892 agents cataloged |
| D2.3 | Architecture decision records | P1 | COMPLETE | system-architecture-architect | - | ARD exists |
| D2.4 | Integration guide | P1 | IN PROGRESS | vital-documentation-writer | Dec 10 | For pilot customers |
| D2.5 | Error codes reference | P1 | NOT STARTED | vital-api-designer | Dec 8 | HTTP status + custom codes |
| D2.6 | Rate limiting documentation | P2 | IN PROGRESS | vital-api-designer | Dec 10 | Limits TBD |

---

## 4. OPERATIONAL READINESS

### 4.1 Monitoring & Alerting

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| O1.1 | Monitoring dashboards | P0 | IN PROGRESS | vital-devops-engineer | Dec 8 | Latency, errors, throughput |
| O1.2 | Alert thresholds configured | P0 | NOT STARTED | vital-devops-engineer | Dec 10 | P50 >30s, error rate >1% |
| O1.3 | On-call rotation | P1 | NOT STARTED | leadership | Dec 12 | Who responds to alerts? |
| O1.4 | Logging pipeline | P1 | COMPLETE | vital-devops-engineer | - | CloudWatch/Supabase logs |

### 4.2 Support & Incident Response

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| O2.1 | Incident response runbook | P0 | NOT STARTED | vital-devops-engineer | Dec 10 | Escalation paths |
| O2.2 | Support team briefing | P1 | NOT STARTED | launch-strategy-agent | Dec 12 | Training materials |
| O2.3 | Support ticket system | P1 | NOT STARTED | leadership | Dec 8 | Email? Slack? Tool? |
| O2.4 | Escalation paths defined | P0 | NOT STARTED | leadership | Dec 8 | L1/L2/L3 support |

### 4.3 Deployment & Rollback

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| O3.1 | Rollback procedure documented | P0 | NOT STARTED | vital-devops-engineer | Dec 10 | Tested procedure |
| O3.2 | Staging environment parity | P0 | IN PROGRESS | vital-devops-engineer | Dec 5 | Mirrors production |

---

## 5. MARKETING & SALES

### 5.1 Go-to-Market

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| M1.1 | Landing page live | P0 | NOT STARTED | external-marketing | Dec 12 | Product page |
| M1.2 | Product demo available | P0 | NOT STARTED | launch-strategy-agent | Dec 10 | Interactive demo |
| M1.3 | Press release drafted | P2 | NOT STARTED | external-marketing | Dec 14 | Optional for soft launch |
| M1.4 | Social media plan | P2 | NOT STARTED | external-marketing | Dec 14 | LinkedIn focus |

### 5.2 Sales Enablement

| # | Item | Priority | Status | Owner | Due Date | Notes |
|---|------|----------|--------|-------|----------|-------|
| M2.1 | Pricing finalized | P0 | IN PROGRESS | leadership | Dec 5 | $2K base + usage model |
| M2.2 | Sales deck complete | P1 | NOT STARTED | business-analytics-strategist | Dec 10 | Value proposition |
| M2.3 | Pilot agreement template | P0 | NOT STARTED | external-legal | Dec 8 | Contract template |
| M2.4 | Target customer list | P1 | NOT STARTED | business-analytics-strategist | Dec 5 | 20 pilot candidates |

---

## 6. GO/NO-GO GATES

### 6.1 T-14 Days (December 4)

| # | Gate Criteria | Required | Status |
|---|---------------|----------|--------|
| G1.1 | All P0 technical items complete or in remediation | YES | PENDING |
| G1.2 | Security review initiated | YES | IN PROGRESS |
| G1.3 | Documentation plan confirmed | YES | PENDING |
| G1.4 | Support model defined | YES | NOT STARTED |

### 6.2 T-7 Days (December 11)

| # | Gate Criteria | Required | Status |
|---|---------------|----------|--------|
| G2.1 | All P0 items complete | YES | PENDING |
| G2.2 | Feature freeze in effect | YES | PENDING |
| G2.3 | Staging environment validated | YES | PENDING |
| G2.4 | User documentation complete | YES | PENDING |

### 6.3 T-3 Days (December 14) - FINAL GO/NO-GO

| # | Gate Criteria | Required | Status |
|---|---------------|----------|--------|
| G3.1 | Zero P0 bugs open | YES | PENDING |
| G3.2 | Load testing complete | YES | PENDING |
| G3.3 | Rollback procedure tested | YES | PENDING |
| G3.4 | Support team trained | YES | PENDING |
| G3.5 | Leadership sign-off | YES | PENDING |

### 6.4 Launch Day (December 17)

| # | Gate Criteria | Required | Status |
|---|---------------|----------|--------|
| G4.1 | All systems green | YES | PENDING |
| G4.2 | Monitoring active | YES | PENDING |
| G4.3 | Support coverage confirmed | YES | PENDING |
| G4.4 | Communication sent | YES | PENDING |

---

## 7. RISK REGISTER (HIGH PRIORITY)

| ID | Risk | Probability | Impact | Owner | Mitigation | Status |
|----|------|-------------|--------|-------|------------|--------|
| R1 | Neo4j connection failure | HIGH | MEDIUM | data-architecture-expert | Use 2-method hybrid (80% coverage) | MITIGATED |
| R2 | Performance at scale untested | MEDIUM | HIGH | ask-expert-service-agent | Load test by Dec 10 | OPEN |
| R3 | User documentation incomplete | HIGH | MEDIUM | vital-documentation-writer | Prioritize Mode 1-2 guide | OPEN |
| R4 | Support team not trained | HIGH | MEDIUM | launch-strategy-agent | Brief by Dec 12 | OPEN |
| R5 | Legal delays (ToS, Privacy) | MEDIUM | HIGH | external-legal | Escalate to leadership | OPEN |
| R6 | Pricing not finalized | MEDIUM | MEDIUM | leadership | Decision needed by Dec 5 | OPEN |

---

## 8. IMMEDIATE ACTION ITEMS (This Week)

| Priority | Action | Owner | Due |
|----------|--------|-------|-----|
| 1 | Fix Neo4j connection (check Aura) | data-architecture-expert | Nov 29 |
| 2 | Finalize pricing model | leadership | Dec 1 |
| 3 | Create PostgreSQL full-text RPC | sql-supabase-specialist | Dec 3 |
| 4 | Start user documentation | vital-documentation-writer | Nov 28 |
| 5 | Define support model | leadership | Dec 1 |
| 6 | Set up monitoring dashboards | vital-devops-engineer | Dec 3 |
| 7 | Schedule load testing | ask-expert-service-agent | Dec 3 |
| 8 | Brief legal on timeline | launch-strategy-agent | Nov 28 |

---

## 9. SUCCESS METRICS

### Launch Day Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| System Availability | >99.5% | Uptime monitoring |
| Mode 1 P50 Latency | <25s | APM dashboard |
| Mode 2 P50 Latency | <40s | APM dashboard |
| Error Rate | <1% | Error tracking |
| First Response | <3s | Time to first token |

### Week 1 Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero P0 bugs | 0 | Bug tracker |
| User Satisfaction | >4.0/5 | Feedback survey |
| Query Success Rate | >95% | Analytics |
| Support Response Time | <2 hours | Ticket system |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| Nov 27, 2025 | Launch Strategy Agent | Initial checklist created |

---

**Next Review**: December 1, 2025 (T-16 days)
**Distribution**: Leadership, ask-expert-service-agent, ask-panel-service-agent, strategy-vision-architect
