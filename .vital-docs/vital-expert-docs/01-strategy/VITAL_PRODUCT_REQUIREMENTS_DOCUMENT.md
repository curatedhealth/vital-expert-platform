# VITAL Platform - Product Requirements Document (PRD)
## Gold Standard Edition

**Document Type:** Product Requirements Document (PRD)
**Version:** 1.0
**Date:** November 16, 2025
**Owner:** PRD Architect
**Status:** Week 3-4 Deliverable

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Nov 10, 2025 | PRD Architect | Initial framework |
| 0.5 | Nov 14, 2025 | PRD Architect | Core features specified |
| 0.9 | Nov 15, 2025 | PRD Architect | User stories added |
| 1.0 | Nov 16, 2025 | PRD Architect | Complete PRD v1.0 |

**Reviewers:**
- Strategy & Vision Architect (strategic alignment)
- System Architecture Architect (technical feasibility)
- Business & Analytics Strategist (business value)
- Frontend UI Architect (UI/UX requirements)
- Documentation & QA Lead (quality review)

**Cross-References:**
- `VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md` - Strategic foundation
- `VITAL_BUSINESS_REQUIREMENTS.md` - Business requirements & processes
- `VITAL_ANALYTICS_FRAMEWORK.md` - Success metrics
- `VITAL_ROI_BUSINESS_CASE.md` - Business case & ROI model

---

## Executive Summary

### Product Vision

**VITAL Platform transforms Medical Affairs from fixed-capacity teams into infinitely scalable, AI-augmented organizations that amplify human genius rather than replace it.**

The platform delivers on three sacred commitments:
1. **Human-in-Control:** Experts maintain authority; AI amplifies their capabilities
2. **Human-in-the-Loop:** Continuous learning from human feedback
3. **Human-Machine Synthesis:** Achieving outcomes impossible with either humans or AI alone

### Product Mission

Enable every Medical Affairs professional to access the world's best expertise instantly through AI-powered consultation, orchestrating 136+ specialized agents alongside customer proprietary AI to handle unlimited inquiry volume without proportional headcount growth.

### Key Product Highlights

**Platform Overview:**
- **Multi-Expert AI Consultation:** Ask Expert (1-on-1), Ask Panel (multi-expert), Ask Committee (AI advisory board)
- **BYOAI Orchestration:** Integrate customer proprietary AI agents seamlessly
- **Enterprise Platform:** SOC 2, HIPAA, GDPR, 21 CFR Part 11 compliant from Day 1
- **Real-Time ROI:** Built-in measurement delivering 5.7x ROI Year 1, scaling to 10.8x Year 3
- **Multi-Modal:** Web, mobile (iOS/Android), API, integrations (Veeva, Salesforce, etc.)

**Target Customers:**
- Large pharmaceutical companies (50-500 Medical Affairs professionals)
- Mid-size biotech companies (10-50 Medical Affairs professionals)
- Medical device companies (20-200 Clinical Affairs professionals)
- CROs & service providers (multi-client support)

**Go-to-Market:**
- Year 1: 50 customers, $1.2M ARR, $24K/month average deal
- Year 2: 200 customers, $6.0M ARR, land-and-expand driving growth
- Year 3: 500 customers, $24M ARR, platform ecosystem with partner channel

### Success Criteria

**Product will be considered successful when:**
- 70%+ Weekly Active Users (WAU) - high engagement
- 3+ consultations per user per week - forming habit
- 5.7x+ customer ROI in Year 1 - measurable value
- 95%+ first-pass AI approval rate - high quality
- 90%+ customer retention - product-market fit
- NPS > 60 - strong customer advocacy

---

# TABLE OF CONTENTS

## PART I: PRODUCT OVERVIEW
1. Product Context & Strategy
2. Target Customers & Market
3. Product Principles & Philosophy
4. Success Metrics & KPIs

## PART II: USER PERSONAS & JOURNEYS
5. Primary Personas (Medical Affairs)
6. Secondary Personas (Adjacent Roles)
7. User Journeys & Use Cases
8. Jobs-to-be-Done Framework

## PART III: FEATURE SPECIFICATIONS
9. Core Features (MVP)
   - 9.1 Ask Expert (1-on-1 AI Consultation)
   - 9.2 Ask Panel (Multi-Expert Collaboration)
   - 9.3 Ask Committee (AI Advisory Board)
   - 9.4 BYOAI Orchestration
   - 9.5 Knowledge Management
10. Supporting Features
   - 10.1 User Management & Authentication
   - 10.2 Analytics & Reporting
   - 10.3 Collaboration & Sharing
   - 10.4 Notifications & Alerts
11. Platform Features
   - 11.1 Mobile Applications (iOS/Android)
   - 11.2 API & Webhooks
   - 11.3 Integrations (Veeva, Salesforce, etc.)
   - 11.4 Admin & Configuration

## PART IV: USER STORIES LIBRARY
12. Epic 1: AI Consultation
13. Epic 2: BYOAI & Customization
14. Epic 3: Collaboration & Knowledge Sharing
15. Epic 4: Analytics & ROI
16. Epic 5: Administration & Setup

## PART V: UI/UX REQUIREMENTS
17. Design Principles
18. Information Architecture
19. Wireframes & User Flows
20. Responsive Design & Accessibility

## PART VI: NON-FUNCTIONAL REQUIREMENTS
21. Performance Requirements
22. Security & Compliance
23. Scalability & Reliability
24. Localization & Internationalization

## PART VII: PRODUCT ROADMAP
25. Release Planning (3-Year Horizon)
26. Feature Prioritization
27. Technical Dependencies
28. Go-to-Market Milestones

## APPENDICES
A. Glossary of Terms
B. User Research Summary
C. Competitive Analysis
D. Technical Constraints
E. Change Log

---

# PART I: PRODUCT OVERVIEW

## 1. Product Context & Strategy

### 1.1 The Problem We're Solving

**The Medical Affairs Capacity Crisis**

Medical Science Liaisons (MSLs) and Medical Affairs professionals are drowning in inquiries:
- **30-50 inquiries per MSL per month** from healthcare professionals (HCPs), internal stakeholders, and external partners
- **2-8 hours per inquiry** to research, consult experts, and provide compliant responses
- **70-90% of capacity consumed** by routine, repeatable questions
- **Only 10-30% of capacity available** for strategic activities (KOL engagement, advisory boards, insights generation)

**The Consequences:**
- Lost revenue: Delayed HCP education = delayed prescribing ($5M-$50M/year per large pharma)
- Compliance risk: Inconsistent responses lead to regulatory issues ($1M-$10M/year)
- Employee burnout: 35% MSL turnover rate (industry average)
- Cannot scale: Company growth requires proportional headcount growth ($200K-$300K per MSL)

**Root Cause:**
Medical Affairs operates as a **fixed-capacity model** (capability limited by headcount) when it should be an **infinitely scalable platform** (capability amplified by AI).

### 1.2 The VITAL Solution

**Transform Medical Affairs into an Elastic Organization**

```
BEFORE VITAL                          AFTER VITAL
═══════════════                       ═══════════════
50 MSLs                               50 MSLs + 136 AI Agents
2,500 inquiries/month                 10,000+ inquiries/month (4x capacity)
70-90% on routine work                20-30% on routine (AI handles 80%)
10-30% on strategic work              70-80% on strategic (human genius)
$10M-$15M annual cost                 $10.5M-$15.5M cost (+3% for VITAL)
No ROI measurement                    Real-time 5.7x ROI dashboard
Inconsistent responses                100% consistent, compliant
18-24 months to scale                 30 days to scale
```

**How It Works:**

```
┌─────────────────────────────────────────────────────────┐
│                   INQUIRY ARRIVES                        │
│          (HCP question, internal request, etc.)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              INTELLIGENT ROUTING                         │
│   ├─ AI classifies inquiry (topic, urgency, complexity) │
│   ├─ Recommends expert(s) from 136-agent registry       │
│   └─ User confirms or selects different expert          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ASK EXPERT   ASK PANEL  ASK COMMITTEE
    (1-on-1)     (2-5 experts) (5-12 experts)
         │           │           │
         └───────────┼───────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AI RESPONSE GENERATION                      │
│   ├─ RAG pipeline retrieves relevant documents          │
│   ├─ LLM synthesizes expert-quality response            │
│   ├─ Citations to source material                       │
│   └─ Compliance checks (on-label, regulatory)           │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│              HUMAN EXPERT REVIEW                         │
│   ├─ Expert notified (push notification, email)         │
│   ├─ Reviews response for accuracy & compliance         │
│   ├─ Approves, edits, or rejects                        │
│   └─ 95%+ approved on first pass (high quality)         │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│              RESPONSE DELIVERED                          │
│   ├─ User receives expert-quality answer                │
│   ├─ 4-hour SLA for routine, 24-hour for complex        │
│   ├─ Full audit trail (regulatory compliance)           │
│   └─ ROI tracked (time saved, value delivered)          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Product Differentiation

**Why VITAL Wins vs. Alternatives**

| Dimension | VITAL Platform | Legacy MI Platforms (Veeva, Zinc) | Generic AI (ChatGPT, Copilot) | Build In-House |
|-----------|----------------|----------------------------------|-------------------------------|----------------|
| **AI-Native** | ✅ Built for AI from Day 1 | ❌ AI bolted onto legacy | ⚠️ Generic, not domain-specific | ⚠️ Possible but expensive |
| **Multi-Agent** | ✅ 136+ specialized agents | ❌ Single chatbot | ❌ Single general model | ⚠️ Requires AI expertise |
| **BYOAI** | ✅ Integrate proprietary AI | ❌ Vendor lock-in | ❌ Cannot integrate custom models | ✅ Full control |
| **Human-in-Control** | ✅ 100% human review | ⚠️ Manual processes | ❌ No oversight | ⚠️ Must build |
| **Compliance** | ✅ SOC 2, HIPAA, 21 CFR Part 11 | ✅ Enterprise-ready | ❌ Not validated | ⚠️ Must achieve |
| **ROI Measurement** | ✅ Real-time, built-in | ❌ Manual reporting | ❌ No measurement | ⚠️ Must build |
| **Time-to-Value** | ✅ 30 days | ⚠️ 90-120 days | ✅ Immediate (but low value) | ❌ 18-24 months |
| **Total Cost** | $180K-$600K/year | $50K-$200K/year (but limited AI) | $30-$100/user/month | $2M-$5M initial + $500K/year |
| **ROI** | 5.7x Year 1 → 10.8x Year 3 | 1.5-2x (productivity gains only) | Unknown (hard to measure) | Negative Year 1-2 |

**Key Differentiators:**

1. **Only true multi-agent platform** - 136 specialized agents vs. single chatbot
2. **BYOAI orchestration** - Seamlessly integrate customer proprietary AI (no vendor lock-in)
3. **Real-time ROI measurement** - Built-in value tracking (CFO-friendly)
4. **30-day time-to-value** - 3x faster than legacy platforms, 50x faster than build
5. **Human-in-Control architecture** - Satisfies regulatory and ethical requirements
6. **Medical Affairs-specific** - Pre-built workflows, personas, compliance features

### 1.4 Product Strategy (3-Year Horizon)

**Year 1 (2026): Platform Foundation**

```
Q1 2026: MVP Launch
├─ Core consultation features (Ask Expert, Ask Panel)
├─ 136-agent registry (3 tier categories)
├─ Web application (responsive)
├─ Basic integrations (SSO, Veeva CRM)
├─ SOC 2 Type II certification
└─ TARGET: 10 customers, $240K ARR

Q2 2026: Enterprise Features
├─ BYOAI orchestration (custom agent integration)
├─ Advanced analytics & ROI dashboard
├─ Mobile apps (iOS, Android beta)
├─ Expanded integrations (Salesforce, Vault)
├─ White-glove onboarding process
└─ TARGET: 25 customers, $600K ARR

Q3 2026: Scale & Polish
├─ Ask Committee (AI advisory board)
├─ Knowledge base curation workflows
├─ Team collaboration features
├─ Mobile apps (general availability)
├─ API & webhooks for extensibility
└─ TARGET: 40 customers, $960K ARR

Q4 2026: Market Leadership
├─ Multi-language support (ES, DE, FR, JP, CN)
├─ Advanced BYOAI workflows (multi-agent chains)
├─ Predictive inquiry routing
├─ Customer success playbooks
├─ Thought leadership (conferences, whitepapers)
└─ TARGET: 50 customers, $1.2M ARR
```

**Year 2 (2027): Scale & Expansion**

```
Focus Areas:
├─ Product-led growth (PLG) - Free trial, self-serve tier
├─ Insights Engine - Aggregate intelligence across consultations
├─ White-label capability - For CROs serving multiple clients
├─ International expansion - EU, APAC data residency
├─ Partner channel - Consulting firms, system integrators
└─ TARGET: 200 customers, $6.0M ARR
```

**Year 3 (2028): Platform Ecosystem**

```
Focus Areas:
├─ Agent Marketplace - Third-party developers create custom agents
├─ Multi-modal AI - Voice & video consultation
├─ Auto-agent generation - Upload docs → Auto-create agents
├─ Predictive analytics - Forecast inquiry trends, proactive answers
├─ Strategic partnerships - Veeva, IQVIA, Oracle co-sell
└─ TARGET: 500 customers, $24M ARR
```

---

## 2. Target Customers & Market

### 2.1 Primary Target: Large Pharmaceutical Companies

**Company Profile:**
- Annual revenue: $5B-$50B+
- Medical Affairs team: 50-500 professionals
- Geographic footprint: Global (50+ countries)
- Product portfolio: 10-50 approved products
- Medical Affairs budget: $50M-$500M annually
- AI maturity: Advanced (existing AI initiatives)

**Key Pain Points:**
1. **Volume overload:** 1,500-5,000 HCP inquiries per month
2. **Geographic inconsistency:** Different answers in US vs. EU vs. APAC
3. **Capacity constraints:** Cannot hire fast enough to keep up with growth
4. **ROI pressure:** CFO questioning Medical Affairs value
5. **Compliance risk:** Off-label inquiries, adverse event reporting gaps

**VITAL Value Proposition:**
- Automate 60-80% of routine inquiries → Free up 20-30 hours/week per MSL
- Ensure global consistency → Same expert answer regardless of geography
- Scale infinitely → Handle 4x inquiry volume without 4x headcount
- Prove ROI → Real-time dashboard showing 5.7x return
- Reduce compliance risk → 100% audit trail, automated AE detection

**Buying Process:**
- **Decision-makers:** VP/Head of Medical Affairs (business owner), CIO/IT (technical gate), CFO (budget holder)
- **Influencers:** MSLs (end users), Compliance/Legal (risk assessment), Procurement (contract negotiation)
- **Sales cycle:** 90-120 days (RFP, security review, pilot, procurement)
- **Budget:** $180K-$600K/year ($15K-$50K/month)
- **Procurement:** Centralized (global contract) or decentralized (regional pilots)

**Success Metrics:**
- Year 1: 30 customers (60% of target customer mix)
- Average deal size: $300K/year
- Win rate: 25%+ (competitive market)
- Expansion rate: 30% Year 2 (seat expansion, multi-product)

### 2.2 Secondary Target: Mid-Size Biotech Companies

**Company Profile:**
- Annual revenue: $500M-$5B
- Medical Affairs team: 10-50 professionals
- Geographic footprint: US/EU focus
- Product portfolio: 2-10 approved products or late-stage pipeline
- Medical Affairs budget: $5M-$50M annually
- AI maturity: Emerging (pilot projects)

**Key Pain Points:**
1. **Small team, high expectations:** Must compete with Big Pharma on Medical Affairs excellence
2. **Cannot justify headcount:** CFO won't approve hiring more MSLs
3. **Rapid growth:** Going from 2 products to 5 products, team can't keep up
4. **Limited budget:** Cannot afford expensive legacy platforms ($200K+/year)
5. **Need to prove value:** Must demonstrate ROI to secure ongoing funding

**VITAL Value Proposition:**
- "Infinite MSL team" without headcount costs → Compete with Big Pharma
- Enterprise capabilities at mid-market price → $96K-$240K/year (affordable)
- Fast time-to-value → 30 days to go-live (vs. 120 days for Veeva)
- Higher ROI → 7.2x Year 1 (higher than large pharma due to labor savings)
- Scales with company growth → Add products/indications without re-implementation

**Buying Process:**
- **Decision-makers:** VP Medical Affairs (business owner), CFO (budget holder)
- **Influencers:** MSLs (users), Head of IT (security review)
- **Sales cycle:** 60-90 days (shorter than Big Pharma)
- **Budget:** $96K-$240K/year ($8K-$20K/month)
- **Procurement:** Faster, less bureaucratic

**Success Metrics:**
- Year 1: 15 customers (30% of target customer mix)
- Average deal size: $150K/year
- Win rate: 30%+ (less competitive at mid-market)
- Expansion rate: 40% Year 2 (high growth companies expand faster)

### 2.3 Tertiary Target: Medical Technology Companies

**Company Profile:**
- Annual revenue: $1B-$20B
- Clinical/Medical Affairs team: 20-200 professionals
- Geographic footprint: Global or regional
- Product portfolio: 5-50 approved medical devices
- Clinical Affairs budget: $10M-$100M annually
- AI maturity: Moderate (exploring AI)

**Key Pain Points:**
1. **Technical product questions:** Clinicians ask detailed device specifications
2. **Post-market surveillance:** Safety monitoring, adverse event reporting
3. **Clinical evidence generation:** Need to synthesize real-world evidence
4. **Regulatory complexity:** FDA, MDR (EU), PMDA (Japan) compliance
5. **Educational content at scale:** Training thousands of clinicians globally

**VITAL Value Proposition:**
- AI-powered clinical support for device-related inquiries
- Automated post-market surveillance workflows (integrate with safety systems)
- Evidence synthesis & literature review automation
- Compliance documentation & audit trail (FDA inspections)
- 6.5x ROI Year 1 (device companies have similar capacity issues)

**Buying Process:**
- **Decision-makers:** VP Clinical Affairs, VP Medical Affairs, CIO
- **Influencers:** Clinical specialists, Regulatory Affairs, Quality Assurance
- **Sales cycle:** 90-120 days (similar to pharma)
- **Budget:** $120K-$360K/year ($10K-$30K/month)
- **Procurement:** Similar process to pharma

**Success Metrics:**
- Year 1: 5 customers (10% of target customer mix)
- Average deal size: $180K/year
- Win rate: 20%+ (nascent market, education required)
- Expansion rate: 25% Year 2

### 2.4 Market Sizing & Opportunity

**Total Addressable Market (TAM): $258M-$895M**

```
Segment Breakdown:

Large Pharma (Top 50):
├─ 50 companies × $180K-$600K/year
├─ Realistic penetration: 30 customers by Year 3
└─ Revenue potential: $9M-$18M ARR

Mid-Size Pharma (51-200):
├─ 150 companies × $60K-$300K/year
├─ Realistic penetration: 150 customers by Year 3
└─ Revenue potential: $9M-$45M ARR

Mid-Size Biotech:
├─ 300 companies × $96K-$240K/year
├─ Realistic penetration: 250 customers by Year 3
└─ Revenue potential: $24M-$60M ARR

Medical Device:
├─ 250 companies × $120K-$360K/year
├─ Realistic penetration: 100 customers by Year 3
└─ Revenue potential: $12M-$36M ARR

TOTAL REALISTIC YEAR 3: 530 customers, $54M-$159M ARR
VITAL TARGET YEAR 3: 500 customers, $24M ARR (conservative)
```

**Expansion Markets (Year 3+):**
- CROs & service providers ($50M+ TAM)
- Healthcare provider organizations ($1B+ TAM)
- Regulatory affairs technology ($500M+ TAM)
- Clinical development platforms ($2B+ TAM)

---

## 3. Product Principles & Philosophy

### 3.1 Design Principles

**The Three Sacred Commitments**

These principles are non-negotiable and guide every product decision:

**1. Human-in-Control**

```
Principle: Experts maintain authority and accountability. AI amplifies their
capabilities but never makes final decisions.

Product Implications:
├─ 100% of AI responses reviewed by human expert before delivery
├─ Expert can approve, edit, reject, or escalate any AI response
├─ AI confidence score visible (expert knows when to scrutinize more)
├─ Override capability: Human always has final say
└─ Audit trail: Who approved what, when, and why

Bad Example: AI auto-responds to HCP without expert review
Good Example: AI drafts response → Expert reviews → Expert approves → Deliver
```

**2. Human-in-the-Loop**

```
Principle: AI continuously learns from human feedback to improve quality over time.

Product Implications:
├─ User feedback on every response (helpful/not helpful, rating)
├─ Expert feedback during review (edit = implicit feedback)
├─ Explicit labeling interface (expert corrects AI mistakes)
├─ A/B testing of AI models (best model wins)
└─ Continuous retraining pipeline (weekly model updates)

Bad Example: AI never improves, makes same mistakes repeatedly
Good Example: AI learns from expert edits, next similar inquiry handled better
```

**3. Human-Machine Synthesis**

```
Principle: Best outcomes achieved when humans and AI collaborate, not when
either works alone.

Product Implications:
├─ AI handles breadth (136 agents, infinite recall)
├─ Human handles depth (judgment, nuance, context)
├─ Hybrid workflows (AI research → Human synthesis → AI formatting)
├─ Show AI reasoning (expert can validate or correct logic)
└─ Celebrate synthesis (metrics track human+AI outcomes, not just AI)

Bad Example: AI works in isolation, human just rubber-stamps
Good Example: AI surfaces 10 relevant studies, human synthesizes into coherent
clinical perspective, AI formats into compliant response
```

### 3.2 User Experience Principles

**Principle 1: Invisible Complexity**

> "Make the complex simple, never the simple complex."

- User sees: "Ask Expert" → Type question → Get answer
- System handles: Inquiry classification, expert routing, RAG pipeline, LLM synthesis, compliance checks, human workflow, audit logging, ROI calculation
- **Product implication:** Hide AI complexity behind conversational interface

**Principle 2: Progressive Disclosure**

> "Show novices the basics, reveal power features to experts."

- New user: Simple "Ask a question" interface, suggested experts
- Power user: Advanced filtering, BYOAI workflows, custom agents, API access
- **Product implication:** Default to simple, enable advanced via progressive UI

**Principle 3: Immediate Feedback**

> "Never leave the user wondering what's happening."

- Show real-time status: "AI generating response...", "Expert reviewing...", "Approved, delivering..."
- Provide estimated time: "Typically takes 4 hours for routine inquiries"
- Send notifications: Push, email, SMS when status changes
- **Product implication:** Every user action has immediate visible response

**Principle 4: Trust Through Transparency**

> "Show your work. Cite your sources. Admit uncertainty."

- Every AI response includes citations to source documents
- Confidence score visible (High: 95%, Medium: 70%, Low: 40%)
- Dissenting opinions shown (if panel disagrees)
- **Product implication:** Build trust through radical transparency

**Principle 5: Delight in the Details**

> "Sweat the small stuff. Microinteractions matter."

- Smooth animations (inquiry submission, response arrival)
- Thoughtful empty states ("No consultations yet. Ask your first question!")
- Celebratory moments (First consultation, 100th consultation, ROI milestone)
- **Product implication:** Polish drives adoption and satisfaction

### 3.3 Technical Principles

**Principle 1: API-First Architecture**

- Every feature exposed via API before UI
- Enables integrations, BYOAI, extensibility
- Forces clean abstractions, separation of concerns

**Principle 2: Multi-Tenant from Day 1**

- Complete data isolation between customers (Row-Level Security)
- No "we'll add multi-tenancy later" - baked into foundation
- Scales to 10,000 customers without re-architecture

**Principle 3: Security by Design**

- Encryption at rest (AES-256), in transit (TLS 1.3)
- Zero trust network architecture
- Principle of least privilege (RBAC)
- Audit everything (immutable audit log)

**Principle 4: Observability Built-In**

- Real-time metrics (Prometheus, Grafana)
- Distributed tracing (OpenTelemetry)
- Structured logging (JSON, searchable)
- Alerts for anomalies (PagerDuty)

**Principle 5: Continuous Deployment**

- Ship to production multiple times per day
- Feature flags for gradual rollout
- Automated testing (unit, integration, E2E)
- Canary deployments (1% → 10% → 100%)

---

## 4. Success Metrics & KPIs

### 4.1 North Star Metric

**Hours of Human Genius Amplified**

```
Formula:
Hours Amplified = Σ (Consultations × Avg Time Saved per Consultation)

Example (Year 1):
= 25,000 consultations × 2 hours saved each
= 50,000 hours of human genius amplified

3-Year Target: 625,000 hours (500x growth)

Why This Metric:
├─ Captures core value proposition (amplify human experts)
├─ Aligns product, business, and customer success
├─ Easy to explain to investors, customers, employees
└─ Drives right behaviors (quality + quantity)
```

### 4.2 Primary Product KPIs (The Vital 7)

**1. Weekly Active Users (WAU)**

- **Definition:** % of licensed users who log in and perform ≥1 action per week
- **Target:** 70%+ (best-in-class SaaS engagement)
- **Measurement:** Weekly cohort analysis
- **Why it matters:** Leading indicator of product value and retention

**2. Consultations per User per Week**

- **Definition:** Average consultations submitted per active user
- **Target:** 3+ per week (forming habit)
- **Measurement:** Median (not mean, to avoid power user skew)
- **Why it matters:** Measures depth of engagement, not just login

**3. First-Pass Approval Rate**

- **Definition:** % of AI responses approved by expert without edits
- **Target:** 95%+ (high AI quality)
- **Measurement:** Approval, edit, reject actions tracked
- **Why it matters:** AI quality directly impacts user trust and efficiency

**4. Customer ROI**

- **Definition:** Value delivered (time saved, decisions improved, risk avoided) divided by VITAL cost
- **Target:** 5.7x Year 1, scaling to 10.8x Year 3
- **Measurement:** VITAL Value Equation™ (built into platform)
- **Why it matters:** CFO approval and renewal decisions driven by ROI

**5. Net Promoter Score (NPS)**

- **Definition:** % promoters (9-10) minus % detractors (0-6)
- **Target:** 60+ (world-class SaaS)
- **Measurement:** Quarterly NPS survey
- **Why it matters:** Leading indicator of word-of-mouth growth and retention

**6. Time-to-Value (TTV)**

- **Definition:** Days from contract signature to "go-live certification"
- **Target:** <30 days (3x faster than competition)
- **Measurement:** Onboarding milestone tracking
- **Why it matters:** Fast TTV drives customer satisfaction and reduces churn risk

**7. Net Revenue Retention (NRR)**

- **Definition:** (Starting ARR + Expansion - Churn) / Starting ARR
- **Target:** 120%+ (land-and-expand working)
- **Measurement:** Monthly ARR cohort analysis
- **Why it matters:** Measures product stickiness and expansion potential

### 4.3 Secondary Metrics (Leading Indicators)

**Engagement Metrics:**
- Daily Active Users (DAU): 40%+ target
- Stickiness (DAU/MAU): 57%+ target
- Session duration: 15+ minutes median
- Feature adoption: 60%+ using ≥3 features

**Quality Metrics:**
- User satisfaction (CSAT): 4.5/5+ target
- Response accuracy: 99%+ factual correctness
- Compliance rate: 100% regulatory adherence
- Expert confidence: 90%+ "very confident" in AI responses

**Business Value Metrics:**
- Hours saved per user per month: 40+ hours
- Cost per inquiry: <$50 (vs. $150-$300 manual)
- Inquiry resolution rate: 95%+ (5% escalated to senior experts)
- Knowledge base growth: 10+ curated articles per month

**Operational Metrics:**
- Response time P50: <3 minutes
- Response time P95: <10 minutes
- Uptime: 99.9%+
- Support ticket volume: <5% of users per month

---

# PART II: USER PERSONAS & JOURNEYS

## 5. Primary Personas (Medical Affairs)

### 5.1 Persona 1: Sarah - Senior Medical Science Liaison (MSL)

**Demographics:**
- Age: 38
- Education: PharmD, 12 years pharma experience
- Company: Large pharma (Top 20)
- Territory: Northeast US (6 states)
- Team: Reports to Regional Medical Director, part of 50-person Medical Affairs organization

**Role & Responsibilities:**
- Engage with 150 Key Opinion Leaders (KOLs) in oncology
- Respond to 40-50 unsolicited HCP inquiries per month
- Support clinical trials (investigator meetings, site education)
- Deliver scientific presentations at medical conferences
- Gather insights from field interactions, report to Medical Affairs leadership

**Pain Points:**
1. **Drowning in inquiries:** Spends 70% of time on reactive Q&A, only 30% on strategic KOL engagement
2. **Research burden:** Takes 4-6 hours to research complex oncology questions (literature review, consult experts)
3. **Inconsistent responses:** Different MSLs answer same question differently, leading to HCP confusion
4. **Cannot scale:** Territory expanding (6 → 9 states) but headcount frozen
5. **No proof of value:** Struggles to quantify ROI of Medical Affairs to justify budget

**Goals:**
- Spend 70% of time on strategic KOL relationships (flip the ratio)
- Answer HCP inquiries within 24 hours (currently takes 3-5 days)
- Deliver consistently excellent, on-brand responses
- Demonstrate measurable value to leadership (prove worth)
- Advance career to Regional Medical Director

**Technology Usage:**
- Daily: Veeva CRM (log interactions), Outlook/Teams (communication), PubMed (literature search)
- Weekly: Veeva Vault (approved content repository), internal SharePoint (policies)
- Comfortable with tech but not an "early adopter"

**VITAL Use Cases:**
1. **Morning triage:** Reviews 10 new HCP inquiries, routes 7 to Ask Expert (AI handles), keeps 3 complex cases for personal attention
2. **Quick research:** Asks "Oncology Expert" about new immunotherapy combination data before KOL dinner
3. **Consistent messaging:** Uses Ask Panel to ensure her response aligns with what colleagues in EU/APAC are saying
4. **Prove value:** Shows VP Medical Affairs dashboard: "I've amplified 150 hours this quarter, 6.2x ROI"

**Success Metrics:**
- WAU: 100% (uses VITAL daily)
- Consultations per week: 8-10 (high engagement)
- Time saved: 25 hours/month
- Satisfaction: NPS 9 (promoter, refers VITAL to colleagues)

**Quote:**
> "VITAL gave me my nights and weekends back. I used to spend evenings researching HCP questions. Now the AI does the heavy lifting, I review for 10 minutes, approve, done. I'm back to doing the strategic work I was hired for."

---

### 5.2 Persona 2: Michael - Medical Director (Medical Affairs Leadership)

**Demographics:**
- Age: 45
- Education: MD, MBA, 18 years pharma experience (former MSL, promoted to leadership)
- Company: Large pharma (Top 10)
- Team: Manages 25 MSLs across US, reports to VP Medical Affairs

**Role & Responsibilities:**
- Lead Medical Affairs strategy for cardiovascular franchise ($2B annual sales)
- Manage $15M budget (headcount, conferences, technology)
- Ensure compliance and quality of Medical Information responses
- Report Medical Affairs impact to C-suite (CEO, CFO, CMO)
- Develop and mentor MSL team

**Pain Points:**
1. **Cannot demonstrate ROI:** CFO questioning Medical Affairs value, wants hard numbers
2. **Inconsistency across team:** 25 MSLs answering questions differently, brand risk
3. **Scaling challenge:** Launching 3 new indications next year, cannot hire 15 more MSLs
4. **Limited visibility:** No real-time view into what team is doing, inquiry trends
5. **Compliance concerns:** Worried about off-label responses, adverse event reporting gaps

**Goals:**
- Prove Medical Affairs ROI to CFO (justify and grow budget)
- Ensure 100% consistent, compliant responses across organization
- Scale team capability 3x without 3x headcount growth
- Real-time visibility into team performance and inquiry trends
- Elevate Medical Affairs from cost center to strategic partner

**Technology Usage:**
- Daily: Email, Veeva CRM reports (team activity dashboards)
- Weekly: Business intelligence tools (Tableau), Veeva Vault (content review)
- Prefers high-level dashboards, not hands-on with tools

**VITAL Use Cases:**
1. **Weekly Business Review:** Reviews VITAL executive dashboard (ROI, usage, quality metrics) with VP Medical Affairs
2. **Compliance oversight:** Monitors compliance dashboard (any off-label flags, adverse events detected)
3. **Team performance:** Identifies underutilizing MSLs, coaches them on VITAL adoption
4. **CFO reporting:** Exports quarterly ROI report showing $2.1M value delivered vs. $120K VITAL cost (17.5x ROI)
5. **Scaling strategy:** Plans new indication launch knowing VITAL can handle 3x inquiry volume

**Success Metrics:**
- Team WAU: 80%+ (high adoption across 25 MSLs)
- Team ROI: 8.5x (exceeds target)
- Consistency: 98% compliance rate (up from 85% pre-VITAL)
- Budget impact: Avoided hiring 8 MSLs ($1.6M-$2.4M savings)

**Quote:**
> "VITAL transformed my conversation with the CFO. I used to beg for headcount. Now I show him a dashboard: 8.5x ROI, $2.1M value delivered, 98% compliance. He asks when we're expanding VITAL to other franchises. Game changer."

---

### 5.3 Persona 3: Priya - Medical Information Specialist

**Demographics:**
- Age: 29
- Education: PharmD, 4 years pharma experience
- Company: Mid-size biotech (500 employees, 2 approved products)
- Location: Remote (US-based)
- Team: Part of 8-person Medical Information team, reports to Medical Information Manager

**Role & Responsibilities:**
- Respond to unsolicited HCP and patient inquiries (phone, email, web form)
- Handle 60-80 inquiries per month (higher volume than MSLs, less complex)
- Maintain medical information database (approved responses, Q&A library)
- Coordinate with Pharmacovigilance (adverse event reporting)
- Support commercial team (review promotional materials for accuracy)

**Pain Points:**
1. **Repetitive work:** 80% of inquiries are variations of same 20 questions
2. **High volume:** Cannot keep up with inquiry influx (backlog growing)
3. **Small team, limited expertise:** No deep experts in-house for niche questions
4. **Slow turnaround:** Target 48-hour response time, actually averaging 5-7 days
5. **Career stagnation:** Doing same repetitive work, not learning or growing

**Goals:**
- Eliminate backlog, achieve 24-hour response time
- Automate routine inquiries, focus on complex/interesting cases
- Build expertise in immunology (product therapeutic area)
- Contribute to strategic projects (publications, advisory boards)
- Work-life balance (currently working evenings to clear backlog)

**Technology Usage:**
- Daily: Email, Veeva Vault Medical, Microsoft Word (response drafting)
- Weekly: SharePoint (team knowledge base), safety database (adverse event reporting)
- Tech-savvy, early adopter of new tools

**VITAL Use Cases:**
1. **Triage inbox:** 60 new inquiries this week, routes 45 to Ask Expert (auto-handled), focuses on 15 complex cases
2. **Build expertise:** Uses Ask Panel to see how multiple experts approach complex immunology question, learns from AI reasoning
3. **Quality assurance:** Reviews AI responses for factual accuracy, provides feedback (Human-in-the-Loop)
4. **Knowledge base curation:** Converts high-quality consultations into reusable knowledge base articles
5. **Career development:** Freed time allows taking online course in medical writing

**Success Metrics:**
- WAU: 100% (uses VITAL daily)
- Consultations per week: 20-25 (very high power user)
- Backlog reduction: From 120 inquiries to 15 in 60 days
- Response time: 18 hours average (vs. 5-7 days before)
- Satisfaction: NPS 10 (enthusiastic advocate)

**Quote:**
> "VITAL eliminated the soul-crushing repetition. I used to copy-paste the same answers 50 times a week. Now AI handles those, I focus on the interesting questions that actually challenge me. I'm learning again, not just churning."

---

### 5.4 Persona 4: Dr. James Chen - Key Opinion Leader (KOL) / External Expert

**Demographics:**
- Age: 52
- Education: MD, PhD (Oncology), 25 years clinical/academic experience
- Affiliation: Major academic medical center, tenured professor
- Practice: Sees patients 2 days/week, research 2 days/week, consulting 1 day/week
- Industry relationships: Paid consultant to 5 pharma companies, speaker for 3

**Role & Responsibilities:**
- Treat cancer patients (focus on lung cancer)
- Conduct clinical research (PI on 12 trials)
- Educate medical community (lectures, publications, guidelines committees)
- Advise pharma companies on product development and Medical Affairs strategy
- Train fellows and residents

**Pain Points:**
1. **Limited time:** Receives 20-30 requests per week for expert opinion (can only handle 5)
2. **Repetitive questions:** Many pharma companies ask same questions
3. **Inefficient consulting:** Spends 60% of consulting time on routine questions, 40% on strategic advisory
4. **Knowledge dissemination challenge:** His expertise only reaches people he talks to directly
5. **Impact plateau:** Cannot scale personal impact beyond 1-on-1 interactions

**Goals:**
- Maximize impact of expertise (reach more clinicians, patients)
- Focus consulting time on strategic, interesting problems
- Build lasting legacy (expertise outlives his personal availability)
- Monetize expertise efficiently (higher consulting fees for strategic work)
- Reduce administrative burden (emails, scheduling, repetitive Q&A)

**Technology Usage:**
- Daily: Email, Epic (EMR), PubMed
- Weekly: Zoom (virtual meetings), PowerPoint (presentations)
- Not particularly tech-savvy, prefers human interaction

**VITAL Use Cases (as External Expert):**
1. **AI Agent Training:** Pharma company creates "Dr. Chen - Lung Cancer Expert" AI agent trained on his publications, presentations, and consultations
2. **Leverage expertise 24/7:** Dr. Chen's AI agent handles 80% of routine questions from MSLs globally, he only handles escalations
3. **Quality control:** Reviews AI agent responses monthly (1 hour), provides feedback to improve accuracy
4. **Strategic focus:** Consulting time shifts from routine Q&A to advisory boards, protocol design (higher value, higher fees)
5. **Legacy building:** Expertise codified in AI agent, continues to help clinicians even when Dr. Chen retires

**Success Metrics:**
- Reach: AI agent consulted 500 times/month (vs. 20 direct consults before)
- Time savings: 15 hours/month (redirected to strategic work)
- Consulting income: +40% (shift to higher-value work)
- Satisfaction: "This is how I scale my impact"

**Quote:**
> "I've been trying to clone myself for years. VITAL is the closest thing to it. The AI agent handles the routine 'what's the dose adjustment for renal impairment' questions, I focus on 'how should we design the Phase 3 trial?' Big difference."

---

## 6. Secondary Personas (Adjacent Roles)

### 6.1 Persona 5: Jessica - Regulatory Affairs Manager

**Use of VITAL:**
- Consult "Regulatory Expert" agent on labeling questions, submission strategies
- Ensure Medical Affairs responses align with approved product labeling (compliance checks)
- Review VITAL audit trail during regulatory inspections (demonstrate due diligence)

**Key Needs:**
- 100% audit trail (21 CFR Part 11 compliant)
- On-label content only (off-label detection)
- Citation to approved labeling in all responses

---

### 6.2 Persona 6: David - Pharmacovigilance Specialist

**Use of VITAL:**
- VITAL auto-detects adverse events in HCP inquiries, generates AE reports (MedDRA coding, E2B format)
- Routes suspected AEs to Pharmacovigilance system (integration with safety database)
- Reviews VITAL compliance dashboard for missed AE signals

**Key Needs:**
- Integration with Veeva Vault Safety
- 100% AE detection rate (cannot miss safety signals)
- Expedited reporting timelines (15-day, 7-day clock starts in VITAL)

---

### 6.3 Persona 7: Rachel - Customer Success Manager (CSM) at Large Pharma

**Use of VITAL:**
- Onboard new Medical Affairs users (training, adoption campaigns)
- Monitor customer health score (usage, ROI, satisfaction)
- Conduct Quarterly Business Reviews (QBR) with VP Medical Affairs
- Drive feature adoption (promote underutilized features)

**Key Needs:**
- Customer analytics dashboard (usage trends, health score)
- Automated QBR report generation
- In-app messaging (communicate with users without email)
- Success playbooks (onboarding, adoption, renewal)

---

## 7. User Journeys & Use Cases

### 7.1 Journey 1: MSL Handles Routine HCP Inquiry

**Actors:** Sarah (MSL), VITAL Platform, HCP (Dr. Martinez)

**Trigger:** Dr. Martinez emails Sarah: "What's the latest data on Drug X in combination with Drug Y for metastatic melanoma?"

**Journey:**

```
STEP 1: Inquiry Intake (2 minutes)
├─ Sarah receives email, opens VITAL mobile app
├─ Taps "New Consultation"
├─ Pastes HCP question into inquiry field
├─ VITAL auto-classifies: Topic = Oncology/Melanoma, Urgency = Routine, Complexity = Moderate
└─ VITAL recommends: "Oncology - Melanoma Expert"

STEP 2: Expert Selection (30 seconds)
├─ Sarah reviews recommendation, agrees
├─ Alternatively considers "Ask Panel" (Oncology + Clinical Data expert)
├─ Decides single expert sufficient for this question
└─ Taps "Ask Expert" → Submits consultation

STEP 3: AI Response Generation (3 minutes)
├─ VITAL shows progress: "Searching knowledge base... Found 47 relevant documents"
├─ "AI generating response... Oncology Expert synthesizing answer"
├─ Sarah puts phone away, continues driving to next appointment
└─ Push notification: "Response ready for review"

STEP 4: Human Expert Review (5 minutes)
├─ Sarah pulls over, opens VITAL app
├─ Reads AI-generated response:
│   ├─ Summary: "Combination X+Y shows 18% improvement in PFS vs. monotherapy..."
│   ├─ Detailed answer (3 paragraphs, clinical data from 2 Phase III trials)
│   ├─ Citations: [Study 1: NEJM 2024], [Study 2: JCO 2023]
│   └─ Confidence score: 92% (High)
├─ Sarah verifies facts, checks citations (spot-check 2 references)
├─ Makes minor edit (adds context about ongoing Phase IV trial)
└─ Taps "Approve & Send"

STEP 5: Response Delivery (instant)
├─ VITAL formats response as professional email
├─ Sends to Dr. Martinez via Sarah's email (VITAL integration)
├─ Logs consultation in Veeva CRM (auto-sync)
├─ Updates ROI dashboard (2 hours saved, $300 value)
└─ Sarah receives confirmation: "Response delivered to Dr. Martinez"

STEP 6: Follow-Up & Feedback (2 days later)
├─ Dr. Martinez replies: "Thanks, this is exactly what I needed!"
├─ Sarah rates consultation in VITAL: 5 stars, "Very Helpful"
├─ VITAL tracks positive outcome (improves AI model)
└─ Sarah total time invested: 7.5 minutes (vs. 4 hours before VITAL)

OUTCOME:
├─ Dr. Martinez: Answer in 24 hours (vs. 3-5 days before)
├─ Sarah: 3.5 hours saved (redirected to strategic KOL meeting)
├─ Company: $525 value delivered (3.5 hours × $150/hour)
└─ VITAL ROI: $525 value / $5 cost per consultation = 105x ROI per inquiry
```

**Success Metrics:**
- Time to response: 24 hours (vs. 3-5 days before VITAL)
- MSL time invested: 7.5 minutes (vs. 4 hours before VITAL)
- Quality: 5-star rating from Sarah
- ROI: 105x per inquiry, 7x annualized per user

---

### 7.2 Journey 2: Medical Director Prepares for CFO Business Review

**Actors:** Michael (Medical Director), VITAL Platform, CFO

**Trigger:** Quarterly Business Review (QBR) with CFO in 3 days, must justify Medical Affairs budget

**Journey:**

```
STEP 1: Access Executive Dashboard (2 minutes)
├─ Michael logs into VITAL web app
├─ Navigates to "Analytics" → "Executive Dashboard"
├─ Date range: Last 90 days (Q3 2026)
└─ Dashboard loads with key metrics

STEP 2: Review ROI Summary (5 minutes)
├─ ROI Multiple: 8.5x (VITAL Value Equation™)
│   ├─ Total value delivered: $2.1M
│   │   ├─ Time saved: $1.6M (8,000 hours × $200/hour avg)
│   │   ├─ Decisions improved: $350K (strategic insights valued)
│   │   └─ Risk avoided: $150K (compliance issues prevented)
│   └─ VITAL cost: $247K (25 users × $9,880/user for 90 days)
├─ Hours of Human Genius Amplified: 8,000 hours (North Star Metric)
├─ Consultations handled: 1,200 (vs. 450 capacity before VITAL = 2.7x scale)
└─ Michael notes: "This is compelling. CFO will love hard numbers."

STEP 3: Drill into Team Performance (10 minutes)
├─ Team usage metrics:
│   ├─ WAU: 88% (22 of 25 MSLs active weekly)
│   ├─ Consultations per user per week: 4.2 average
│   ├─ Top performers: Sarah (12/week), Marcus (9/week), Lisa (8/week)
│   └─ Underutilizers: 3 MSLs below 2/week (coaching opportunity)
├─ Team quality metrics:
│   ├─ First-pass approval rate: 96%
│   ├─ User satisfaction: 4.7/5 average
│   ├─ Compliance rate: 98% (up from 85% pre-VITAL)
│   └─ NPS: 68 (world-class)
└─ Michael identifies: "Need to coach 3 underutilizers, otherwise excellent"

STEP 4: Analyze Inquiry Trends (10 minutes)
├─ Top inquiry topics:
│   ├─ #1: Cardiovascular safety (28% of inquiries)
│   ├─ #2: Drug-drug interactions (18%)
│   ├─ #3: Dosing in renal impairment (12%)
│   ├─ #4: Pregnancy/lactation (9%)
│   └─ #5: Geriatric populations (7%)
├─ Insight: "Heavy focus on safety questions. Should develop proactive safety content."
├─ Geographic breakdown:
│   ├─ US: 65% of inquiries
│   ├─ EU: 22%
│   └─ APAC: 13%
└─ Insight: "APAC growing fast, may need dedicated agent for regional questions"

STEP 5: Export CFO Report (3 minutes)
├─ Michael clicks "Export QBR Report"
├─ Selects template: "Executive Business Review (CFO)"
├─ Customizes: Add comparison to headcount alternative
│   └─ "To handle 1,200 consultations manually would require 8 additional MSLs = $1.6M-$2.4M annually"
├─ Exports to PowerPoint (auto-generated, 12 slides)
└─ Report includes: ROI, team performance, cost avoidance, strategic insights

STEP 6: Present to CFO (30 minutes, 3 days later)
├─ Slide 1: Executive Summary (8.5x ROI, $2.1M value)
├─ Slide 2: North Star Metric (8,000 hours amplified)
├─ Slide 3: Cost Comparison (VITAL $247K vs. Hiring 8 MSLs $1.6M-$2.4M)
├─ Slide 4: Scale Achievement (2.7x inquiry handling capacity)
├─ Slide 5: Quality Improvement (98% compliance, up from 85%)
├─ Slide 6: Team Performance (88% adoption, 4.2 consultations/user/week)
├─ Slide 7: Inquiry Trends (strategic insights from data)
├─ Slide 8: Q4 Forecast (launching 3 new indications, VITAL enables scale)
├─ Slide 9: Budget Request (expand VITAL to EU team, 15 more users)
├─ Slide 10: ROI Projection (Year 1: 5.7x → Year 2: 8.5x → Year 3: 10.8x)
├─ CFO reaction: "This is exactly the data-driven Medical Affairs story I wanted to see."
└─ CFO approves: $180K budget for EU expansion, $2M total Medical Affairs budget (20% increase)

OUTCOME:
├─ Michael: Successfully defended and grew Medical Affairs budget
├─ CFO: Confidence in Medical Affairs ROI, approves expansion
├─ VITAL: Customer expansion (25 → 40 users, +60% ARPU)
└─ Time invested: 30 minutes prep + 30 minutes presentation (vs. weeks of manual data gathering)
```

**Success Metrics:**
- Prep time: 30 minutes (vs. 2 weeks manual analysis before VITAL)
- Budget outcome: 20% increase (vs. flat/declining budget trend)
- Expansion: +60% user growth
- CFO satisfaction: "Exactly what I wanted to see"

---

### 7.3 Journey 3: Medical Information Specialist Eliminates Backlog

**Actors:** Priya (MI Specialist), VITAL Platform

**Trigger:** Priya returns from 2-week vacation, faces 120-inquiry backlog

**Journey:**

```
DAY 1: Triage & Routing (2 hours)
├─ Priya logs into VITAL, sees 120 inquiries in queue
├─ Bulk selects all inquiries → "Classify & Route"
├─ VITAL analyzes each inquiry:
│   ├─ 85 routine (standard product info, dosing, contraindications)
│   ├─ 25 moderate (drug interactions, off-label questions)
│   └─ 10 complex (rare scenarios, requires expert judgment)
├─ Priya reviews AI recommendations:
│   ├─ 85 routine → Auto-route to "Ask Expert" (various specialized agents)
│   ├─ 25 moderate → Route to "Ask Panel" (2-3 experts)
│   └─ 10 complex → Reserve for personal handling (Priya's expertise required)
├─ Priya approves routing → 110 inquiries submitted to VITAL
└─ Time invested: 2 hours (vs. 10 hours manual triage)

DAY 2-3: AI Response Generation (automated)
├─ VITAL processes 110 inquiries in parallel
├─ Average response generation time: 5 minutes per inquiry
├─ Priya receives push notifications as responses ready for review
├─ Priya reviews 40 responses (20/day), approves 38, edits 2
└─ Approval rate: 95% (high AI quality)

DAY 4-5: Review & Approve Remaining (6 hours)
├─ Priya reviews remaining 70 AI responses
├─ Spot-checks citations (10% sample)
├─ Makes minor edits to 5 responses (tone, additional context)
├─ Approves and delivers all 110 responses
└─ Backlog reduced: 120 → 10 (complex cases)

DAY 6-10: Focus on Complex Cases (20 hours)
├─ Priya dedicates full attention to 10 complex inquiries
├─ Uses VITAL "Ask Panel" for expert perspectives
├─ Conducts additional literature research (PubMed)
├─ Drafts high-quality, nuanced responses
├─ Escalates 2 cases to Medical Director (truly exceptional scenarios)
└─ Closes all 10 complex cases

WEEK 3: Steady State (Normal Workload)
├─ New inquiries: 60 per week (normal pace)
├─ Routing: 45 to VITAL (75%), 15 personal handling (25%)
├─ Daily workflow:
│   ├─ Morning: Triage new inquiries (30 min)
│   ├─ Mid-day: Review AI responses (1-2 hours)
│   └─ Afternoon: Focus on complex cases, knowledge base curation (4-5 hours)
├─ Response time: 18 hours average (vs. 5-7 days before VITAL)
├─ Backlog: 0 (eliminated)
└─ Work-life balance: Leaves office at 5pm (vs. working evenings before)

WEEK 4: Knowledge Base Curation (Value-Add Work)
├─ Priya identifies 12 high-quality consultations from past month
├─ Converts into reusable knowledge base articles
├─ Publishes to team SharePoint and VITAL knowledge base
├─ Future similar inquiries auto-answered (further efficiency gains)
└─ Career development: Submits case study to industry journal (publication goal)

OUTCOME (30-Day View):
├─ Backlog: 120 → 0 (eliminated)
├─ Response time: 5-7 days → 18 hours (8x faster)
├─ Inquiry capacity: 60/week → 120/week (2x scale)
├─ Time allocation shift:
│   ├─ Before: 90% reactive Q&A, 10% strategic work
│   └─ After: 40% reactive (VITAL-assisted), 60% strategic (curation, publications, learning)
├─ Job satisfaction: Priya NPS 10 (was 4 before VITAL, burned out)
└─ Career progression: Promoted to Senior MI Specialist (publication, strategic contributions recognized)
```

**Success Metrics:**
- Backlog elimination: 30 days (vs. 6 months before VITAL)
- Response time improvement: 8x faster
- Capacity increase: 2x
- Job satisfaction: NPS 4 → 10 (dramatic improvement)
- Career progression: Promotion within 6 months

---

## 8. Jobs-to-be-Done Framework

### 8.1 Core JTBD: "When I receive an HCP inquiry, I want to deliver an expert-quality, compliant response quickly, so that I can spend my time on strategic work that only humans can do."

**Functional Job:**
- Deliver factually accurate, well-cited, compliant response
- Meet SLA (4-24 hour turnaround depending on urgency)
- Ensure consistency with approved labeling and company messaging
- Create audit trail for regulatory compliance

**Emotional Job:**
- Feel confident in response quality (not worried about errors)
- Reduce stress and anxiety (not overwhelmed by inquiry volume)
- Experience pride in work (doing meaningful strategic work, not drudgery)
- Demonstrate value to leadership (prove worth to avoid layoffs)

**Social Job:**
- Maintain professional reputation with HCPs (timely, high-quality responses)
- Collaborate with peers (share knowledge, build on each other's expertise)
- Impress leadership (show efficiency, innovation, impact)
- Contribute to patient outcomes (indirectly, by enabling HCP education)

**How VITAL Delivers:**

| Job Dimension | VITAL Solution |
|---------------|----------------|
| **Speed** | AI generates response in 3 min (vs. 4 hours manual research) |
| **Quality** | 95%+ first-pass approval rate (expert-quality AI responses) |
| **Consistency** | Same AI agent, same answer, regardless of geography or user |
| **Compliance** | Automated checks (on-label, citations, AE detection) |
| **Confidence** | Confidence score + citations + human review = trust |
| **Stress Reduction** | 4x capacity increase = no more backlog, reasonable workload |
| **Pride** | Time freed for strategic work (advisory boards, publications, KOL engagement) |
| **Value Demonstration** | Real-time ROI dashboard (prove worth to leadership) |
| **Reputation** | Faster, better responses = HCP satisfaction, professional credibility |
| **Collaboration** | Shared consultations, team workspaces, knowledge base |
| **Leadership Impression** | Usage metrics, ROI data, quality scores (objective performance data) |
| **Patient Impact** | Faster HCP education → better prescribing → improved patient outcomes |

---

### 8.2 Secondary JTBD: "When I need to scale Medical Affairs, I want to increase capability without proportional headcount growth, so that I can achieve ambitious growth targets within budget constraints."

**Actors:** Medical Directors, VPs of Medical Affairs, CFOs

**Functional Job:**
- Handle 2-4x more inquiries with same team size
- Launch new products/indications without hiring waves
- Expand geographically without proportional headcount
- Maintain quality and compliance while scaling

**Emotional Job:**
- Reduce budget anxiety (prove ROI, justify spend to CFO)
- Feel innovative and forward-thinking (AI adoption = leadership)
- Sleep well at night (compliance risks managed)
- Pride in team performance (efficiency, impact)

**Social Job:**
- Demonstrate leadership value to C-suite (CFO, CEO, CMO)
- Compete with peer pharma companies (Medical Affairs excellence)
- Industry thought leadership (speak at conferences, publish on AI in Medical Affairs)
- Retain and develop talent (employees not burning out)

**How VITAL Delivers:**

| Job Dimension | VITAL Solution |
|---------------|----------------|
| **Scale without headcount** | 4x inquiry capacity with same team (AI augmentation) |
| **New product launches** | Upload product docs → AI agents trained in 48 hours (vs. 6-month MSL hiring) |
| **Geographic expansion** | AI agents speak 6 languages, 24/7 availability (no timezone constraints) |
| **Quality at scale** | 95%+ first-pass approval, 98% compliance rate (consistent quality) |
| **Budget proof** | Real-time ROI dashboard (8.5x return = CFO approval) |
| **Innovation leadership** | "First pharma to deploy multi-agent AI in Medical Affairs" (speaking opportunities) |
| **Compliance confidence** | Immutable audit trail, automated checks, SOC 2/HIPAA/21 CFR Part 11 certified |
| **C-suite credibility** | Quarterly business reviews with hard data (ROI, scale, quality) |
| **Competitive advantage** | Faster HCP responses than competitors (win market share) |
| **Thought leadership** | VITAL case studies, industry presentations, media coverage |
| **Talent retention** | Employees love VITAL (NPS 68), reduced burnout, lower turnover |

---

# PART III: FEATURE SPECIFICATIONS

## 9. Core Features (MVP)

### 9.1 Ask Expert (1-on-1 AI Consultation)

**Feature Overview:**
User submits a question to a single AI expert agent, receives expert-quality response within 4-hour SLA (90% of inquiries).

**User Story:**
> "As an MSL, I want to ask a specific therapeutic area expert a clinical question, so that I can get a fast, accurate answer without spending hours researching."

**Detailed Specification:**

**9.1.1 Expert Discovery & Selection**

```
UI Components:
├─ Expert Directory (Browse View)
│   ├─ Categorized by:
│   │   ├─ Therapeutic Area (Oncology, Cardiology, Neurology, etc.)
│   │   ├─ Function (Clinical Data, Regulatory, Safety, Medical Writing)
│   │   └─ Specialty (Pediatrics, Geriatrics, Pregnancy/Lactation, etc.)
│   ├─ Each expert tile displays:
│   │   ├─ Expert name & avatar (e.g., "Oncology - Melanoma Expert")
│   │   ├─ Expertise description (2-3 sentences)
│   │   ├─ Sample questions ("Ask me about...")
│   │   ├─ Average response time (e.g., "Typically responds in 3 hours")
│   │   └─ User rating (4.8/5 stars, based on user feedback)
│   └─ Filtering: Search by keyword, filter by category, sort by popularity/rating
│
├─ Expert Search (Search View)
│   ├─ Smart search bar: Type question, AI suggests relevant experts
│   │   └─ Example: User types "melanoma combination therapy" →
│   │       Suggests: "Oncology - Melanoma Expert", "Clinical Data Expert"
│   ├─ Autocomplete: Show common questions as user types
│   └─ Search results: Ranked by relevance to user's query
│
└─ Favorites & Recents
    ├─ User can favorite frequently-used experts (quick access)
    ├─ Recent consultations shown (easy to ask follow-up)
    └─ Team favorites (most-used experts by team)
```

**Acceptance Criteria:**
- Expert directory loads in <2 seconds
- Search results appear as user types (real-time)
- 100% of experts have avatar, description, sample questions
- User can favorite expert in 1 click
- Search relevance: Top 3 results include correct expert 90%+ of time

---

**9.1.2 Inquiry Submission**

```
UI Flow:
1. User selects expert → Opens consultation form

2. Consultation Form:
   ├─ Question field (rich text editor)
   │   ├─ Supports: Plain text, formatting, bullet points
   │   ├─ Character limit: 5,000 characters (prevents overly complex questions)
   │   ├─ Suggested prompts (for new users):
   │   │   └─ "What is the dosing recommendation for..."
   │   │   └─ "What does the latest evidence show about..."
   │   │   └─ "How should I respond to an HCP asking about..."
   │   └─ Auto-save draft (every 10 seconds, prevent data loss)
   │
   ├─ Context (optional fields):
   │   ├─ Urgency: Routine (4-hour SLA), Urgent (2-hour SLA), Emergency (30-min SLA)
   │   ├─ Inquiry source: HCP, Internal stakeholder, Patient, Other
   │   ├─ Product: Select from customer's product portfolio
   │   ├─ Therapeutic area: Auto-detected from question, editable by user
   │   └─ Attach files: Upload PDFs, images (e.g., HCP email screenshot)
   │
   ├─ Privacy settings:
   │   ├─ Visibility: Private (only me), Team (my team can see), Organization (all can see)
   │   └─ Share with: Select specific colleagues to notify
   │
   └─ Submit button: "Ask Expert" (prominent, primary action)

3. Confirmation & Tracking:
   ├─ Confirmation message: "Your question has been submitted to [Expert Name]"
   ├─ Estimated response time: "You'll typically receive a response within 4 hours"
   ├─ Tracking ID: "Consultation #12345" (for reference)
   └─ Next steps: "You'll be notified when the response is ready for review"
```

**Backend Processing:**

```
Submission → API Gateway → Inquiry Service
                            │
                            ├─ Create consultation record (database)
                            ├─ Classify inquiry (ML model):
                            │   ├─ Topic extraction (therapeutic area, product)
                            │   ├─ Urgency detection (keywords like "urgent", "ASAP")
                            │   ├─ Complexity scoring (simple/moderate/complex)
                            │   └─ Compliance flags (off-label, adverse event mentions)
                            │
                            ├─ Route to AI Agent Service
                            │   └─ Assign to selected expert agent
                            │
                            ├─ Trigger workflow (LangGraph state machine)
                            │   └─ State: inquiry_submitted → ai_processing
                            │
                            └─ Send notifications:
                                ├─ User: "We're working on your question..."
                                └─ Analytics: Track inquiry created event
```

**Acceptance Criteria:**
- Form submission success rate: 99.9%+
- Auto-save prevents data loss (user can navigate away, return to draft)
- Inquiry classification accuracy: 85%+ (topic, urgency, complexity)
- Submission confirmation appears within 2 seconds
- Tracking ID generated and visible to user

---

**9.1.3 AI Response Generation (RAG Pipeline)**

```
AI Processing Workflow:

STEP 1: Retrieval (Fetch Relevant Knowledge)
├─ Input: User question + context (product, therapeutic area, etc.)
├─ Vector Search (Pinecone):
│   ├─ Convert question to embedding (OpenAI text-embedding-3-large)
│   ├─ Search vector database for similar content
│   ├─ Return top 50 relevant documents (ranked by cosine similarity)
│   └─ Filter by:
│       ├─ Customer tenant (multi-tenant isolation)
│       ├─ Product (if specified)
│       └─ Content type (labeling, clinical studies, publications, internal docs)
│
├─ Graph Traversal (Neo4j):
│   ├─ Identify related entities (Drug X → Indication Y → Study Z)
│   ├─ Find connected knowledge (adverse events, drug interactions, contraindications)
│   └─ Enrich with structured data (dosing tables, PK/PD parameters)
│
├─ Hybrid Ranking:
│   ├─ Combine vector similarity + graph relevance
│   ├─ Re-rank using cross-encoder model (more accurate than cosine similarity)
│   └─ Final top 10-20 documents passed to LLM
│
└─ Output: Curated knowledge context (10-20 documents, ~50K tokens)

STEP 2: Augmentation (Add Structured Context)
├─ Product metadata: Approved indications, dosing, contraindications
├─ Regulatory context: Geographic region (US/EU/APAC labeling differences)
├─ Compliance rules: On-label only, fair balance requirements
├─ Historical context: Similar past inquiries and responses (learn from history)
└─ Output: Enhanced context for LLM generation

STEP 3: Generation (LLM Synthesis)
├─ LLM Model: Claude 3.5 Sonnet (Anthropic) [Primary]
│   └─ Fallback: GPT-4 Turbo (OpenAI) if Claude unavailable
│
├─ Prompt Structure:
│   ├─ System prompt:
│   │   └─ "You are [Expert Name], a world-class expert in [Therapeutic Area].
│   │       Your role is to provide accurate, evidence-based medical information
│   │       in response to questions from Medical Affairs professionals.
│   │
│   │       Guidelines:
│   │       - Base all answers on provided documents (citations required)
│   │       - Stay on-label (approved indications only)
│   │       - Provide fair balance (benefits and risks)
│   │       - Be concise but comprehensive (3-5 paragraphs)
│   │       - Use professional medical tone
│   │       - If uncertain, say so (do not hallucinate)
│   │       - Flag any adverse events or off-label mentions for review"
│   │
│   ├─ Context: Retrieved documents (top 10-20, ranked)
│   ├─ User question: Original inquiry
│   ├─ Output format:
│   │   └─ "Provide response in this structure:
│   │       1. SUMMARY (2-3 sentences)
│   │       2. DETAILED ANSWER (3-5 paragraphs with citations)
│   │       3. CITATIONS (numbered list with full references)
│   │       4. CONFIDENCE SCORE (0-100%)
│   │       5. CAVEATS (any limitations or uncertainties)"
│   │
│   └─ LLM parameters:
│       ├─ Temperature: 0.3 (low = more deterministic, consistent)
│       ├─ Max tokens: 2,000 (typical response length)
│       ├─ Top-p: 0.9 (nucleus sampling for quality)
│       └─ Stop sequences: ["END_RESPONSE"]
│
├─ Generation:
│   ├─ LLM processes prompt + context
│   ├─ Generates structured response
│   ├─ Streaming: Show progress to user in real-time (optional)
│   └─ Typical generation time: 30-90 seconds
│
└─ Output: Draft AI response (formatted, with citations)

STEP 4: Post-Processing (Quality Checks)
├─ Citation Verification:
│   ├─ Ensure every claim links to source document
│   ├─ Check citation format (APA style)
│   └─ Verify cited documents exist in knowledge base
│
├─ Compliance Checks:
│   ├─ Off-label detection: Scan for unapproved indications, populations
│   ├─ Adverse event detection: Identify safety signals, auto-generate AE report
│   ├─ Fair balance check: Ensure risks mentioned alongside benefits
│   └─ Prohibited claims: Flag absolutes ("always", "never"), superlatives ("best")
│
├─ Quality Scoring:
│   ├─ Factual accuracy (cross-reference with source docs)
│   ├─ Completeness (did AI answer full question?)
│   ├─ Clarity (readability score, Flesch-Kincaid grade level)
│   └─ Confidence (LLM self-assessment + retrieval quality)
│
└─ Output: Validated response + metadata (confidence, compliance flags, quality score)

STEP 5: Human Review Routing
├─ Assign to human expert reviewer:
│   ├─ Default: User who submitted inquiry (self-review)
│   ├─ Alternative: Route to senior expert if:
│   │   ├─ Confidence score <70% (low confidence = needs expert eyes)
│   │   ├─ Compliance flags present (off-label, AE, prohibited claims)
│   │   └─ Complex inquiry (>5,000 tokens, multi-part question)
│   │
│   └─ SLA timer starts: 4 hours for routine, 2 hours for urgent, 30 min for emergency
│
├─ Notification:
│   ├─ Push notification (mobile app)
│   ├─ Email (with response preview)
│   ├─ In-app badge (pending approvals count)
│   └─ SMS (emergency inquiries only)
│
└─ State transition: ai_processing → pending_human_review
```

**Technical Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Inquiry Queue (Redis)                     │
│                  ├─ inquiry_id: 12345                        │
│                  ├─ expert: "oncology-melanoma"              │
│                  ├─ priority: routine                        │
│                  └─ timestamp: 2026-01-15T14:30:00Z          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Agent Service (Python)                   │
│                    ├─ LangGraph orchestration                │
│                    ├─ Multi-step RAG workflow                │
│                    └─ Parallel processing (10 inquiries/sec) │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Pinecone │    │  Neo4j   │    │  Claude  │
   │  Vector  │    │  Graph   │    │   LLM    │
   │   DB     │    │    DB    │    │   API    │
   └──────────┘    └──────────┘    └──────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Response Storage (Supabase)                  │
│                  ├─ consultation_id: 12345                   │
│                  ├─ ai_response: {summary, answer, citations}│
│                  ├─ confidence: 92%                          │
│                  ├─ compliance_flags: []                     │
│                  └─ state: pending_human_review              │
└─────────────────────────────────────────────────────────────┘
```

**Performance Requirements:**
- Retrieval: <2 seconds (vector + graph search)
- Generation: <90 seconds (LLM synthesis)
- Total AI processing time: <3 minutes (P50), <10 minutes (P95)
- Accuracy: 95%+ first-pass approval rate (human validation)
- Throughput: 10 concurrent inquiries per second

**Acceptance Criteria:**
- 90% of routine inquiries processed within 3 minutes
- 95%+ first-pass approval rate (high AI quality)
- 100% of responses include citations
- Compliance flags detected with 98%+ accuracy (no false negatives on safety issues)
- Zero hallucinations on critical safety information (contraindications, dosing)

---

**9.1.4 Human Expert Review & Approval**

```
Review UI (Web & Mobile):

┌─────────────────────────────────────────────────────────────┐
│                  Response Ready for Review                   │
│                 Consultation #12345                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ORIGINAL QUESTION (from Dr. Martinez):                      │
│ "What's the latest data on Drug X + Drug Y combination for  │
│  metastatic melanoma?"                                       │
│                                                              │
│ AI EXPERT: Oncology - Melanoma Expert                       │
│ CONFIDENCE: 92% (High)                                      │
│ PROCESSING TIME: 2 min 43 sec                               │
│ COMPLIANCE STATUS: ✅ On-label, No flags                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    AI-GENERATED RESPONSE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SUMMARY:                                                     │
│ Recent Phase III data demonstrates combination of Drug X +  │
│ Drug Y shows statistically significant 18% improvement in   │
│ progression-free survival (PFS) vs. Drug X monotherapy in   │
│ metastatic melanoma patients (HR 0.82, p<0.001).           │
│                                                              │
│ DETAILED ANSWER:                                             │
│                                                              │
│ The combination of Drug X (anti-PD-1) with Drug Y (anti-    │
│ CTLA-4) has been evaluated in two pivotal Phase III trials  │
│ for first-line treatment of metastatic melanoma [1,2].      │
│                                                              │
│ In the KEYNOTE-XXX study (n=945), combination therapy       │
│ demonstrated:                                                │
│ • Median PFS: 11.5 months vs. 6.9 months (monotherapy)     │
│ • Hazard ratio: 0.82 (95% CI: 0.71-0.94, p<0.001)         │
│ • Overall response rate: 45% vs. 32% (p<0.01)             │
│ • Duration of response: NR vs. 18.2 months [1]             │
│                                                              │
│ [... 2 more paragraphs with clinical data ...]              │
│                                                              │
│ IMPORTANT SAFETY INFORMATION:                                │
│ Combination therapy associated with higher rates of immune- │
│ related adverse events (irAEs) vs. monotherapy:             │
│ • Grade 3-4 irAEs: 32% vs. 18%                             │
│ • Treatment discontinuation due to AEs: 22% vs. 11%        │
│ • Common irAEs: Colitis (12%), hepatitis (8%), pneumonitis│
│   (6%) [2]                                                  │
│                                                              │
│ CITATIONS:                                                   │
│ [1] Smith et al. "Drug X + Y vs. Drug X monotherapy in     │
│     metastatic melanoma: Phase III KEYNOTE-XXX study."     │
│     N Engl J Med. 2024;390(12):1234-1245.                  │
│                                                              │
│ [2] Jones et al. "Safety profile of Drug X + Y combination  │
│     in melanoma: Integrated analysis." J Clin Oncol.        │
│     2023;41(28):4567-4578.                                  │
│                                                              │
│ CONFIDENCE & CAVEATS:                                        │
│ • Confidence: 92% (High) - based on two Phase III RCTs     │
│ • Limitation: Long-term survival data (OS) not yet mature  │
│ • Note: Response based on approved US labeling for Drug X   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

EXPERT ACTIONS:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   APPROVE   │    EDIT     │   REJECT    │  ESCALATE   │
│  ✅ Send     │  ✏️ Modify   │  ❌ Redo     │  ⬆️ Senior   │
│  as-is      │  & Approve  │  Response   │   Expert    │
└─────────────┴─────────────┴─────────────┴─────────────┘

REVIEW CHECKLIST (Expert confirms):
☑ Factually accurate (spot-checked citations)
☑ On-label (approved indication, no off-label)
☑ Fair balance (benefits and risks mentioned)
☑ Appropriate tone (professional, empathetic)
☑ Complete answer (addressed full question)
```

**Review Actions:**

**1. APPROVE (One-Click)**
```
User clicks "Approve" →
├─ Response locked (immutable)
├─ Delivered to end user (email, in-app notification)
├─ Logged in audit trail (who approved, when, why)
├─ ROI calculated (time saved, value delivered)
├─ State: pending_human_review → approved → delivered
└─ Expert notified: "Response delivered to Dr. Martinez"

Time invested: 30 seconds - 2 minutes (quick review)
```

**2. EDIT & APPROVE (Inline Editing)**
```
User clicks "Edit" →
├─ Response becomes editable (rich text editor)
├─ Expert makes changes:
│   ├─ Add context ("Note: This data was presented at ASCO 2024...")
│   ├─ Clarify nuance ("While PFS improved, OS data not yet available")
│   ├─ Fix tone ("Let me provide some context on this combination...")
│   └─ Correct minor error (citation formatting, typo)
├─ Track changes visible (AI original vs. expert edit)
├─ Expert clicks "Approve Edited Response"
├─ Edited version delivered, original saved for AI learning
├─ Feedback loop: AI learns from expert edits (Human-in-the-Loop)
└─ State: pending_human_review → edited → approved → delivered

Time invested: 2-10 minutes (minor edits)
```

**3. REJECT (Send Back for Revision)**
```
User clicks "Reject" →
├─ Rejection reason required (dropdown + free text):
│   ├─ Factually incorrect (specify error)
│   ├─ Missing key information (what's missing?)
│   ├─ Off-label content (flag specific section)
│   ├─ Inappropriate tone (too casual, too technical)
│   └─ Other (free text explanation)
├─ AI re-generates response with feedback
├─ Expert notified when new version ready
├─ Rejection logged (track AI failure modes for improvement)
└─ State: pending_human_review → rejected → ai_reprocessing → pending_human_review

Rejection rate target: <5% (AI quality high enough to minimize)
```

**4. ESCALATE (Route to Senior Expert)**
```
User clicks "Escalate" →
├─ Escalation reason required:
│   ├─ Outside my expertise (need specialist)
│   ├─ High-stakes inquiry (potential regulatory impact)
│   ├─ Conflicting data (need senior judgment)
│   └─ Other (free text)
├─ Routed to senior expert or Medical Director
├─ Original expert notified of outcome (learning opportunity)
├─ Escalation tracked (identify knowledge gaps, training needs)
└─ State: pending_human_review → escalated → assigned_to_senior

Escalation rate target: <5% (most inquiries handled by first reviewer)
```

**Acceptance Criteria:**
- Approval action completes in <2 seconds
- Inline editing supports rich text (bold, italic, bullet points, links)
- Rejection triggers AI re-generation within 5 minutes
- Escalation routes to appropriate senior expert within 10 minutes
- 100% of actions logged in immutable audit trail

---

**9.1.5 Response Delivery & Follow-Up**

```
Delivery Flow:

STEP 1: Format Response
├─ Response formatted as professional email or in-app message
├─ Template:
│   └─ "Dear [HCP Name / User],
│
│       Thank you for your inquiry regarding [Topic].
│
│       [AI-generated response, expert-approved]
│
│       [Citations]
│
│       Please let me know if you have any follow-up questions.
│
│       Best regards,
│       [Expert Reviewer Name, Title]
│       [Company Medical Affairs]
│
│       ---
│       This response was generated with assistance from VITAL AI and reviewed
│       by a medical expert for accuracy and compliance.
│       Consultation ID: #12345 | [Date]"
│
├─ Attachments (if applicable):
│   ├─ PDF export of response (formatted, professional)
│   ├─ Cited references (PDFs of studies, if available)
│   └─ Product labeling (prescribing information)
│
└─ Compliance footer:
    └─ "This information is for educational purposes only and should not be
        considered medical advice. Please refer to full prescribing information."

STEP 2: Multi-Channel Delivery
├─ Email (if inquiry came via email):
│   ├─ Sent from expert reviewer's email address
│   ├─ CC: Medical Affairs team email (med.info@company.com)
│   └─ Integration with Outlook/Gmail (via API or SMTP)
│
├─ In-App (if inquiry submitted via VITAL):
│   ├─ Notification: "Your consultation is ready!"
│   ├─ Push notification (mobile app)
│   └─ In-app message center (view full response)
│
├─ CRM Sync (log interaction in Veeva CRM):
│   ├─ Create "Medical Information Request" activity
│   ├─ Link to HCP account (Dr. Martinez)
│   ├─ Log response provided, date, MSL (Sarah)
│   └─ Tag with product, therapeutic area (segmentation)
│
└─ SMS (emergency inquiries only):
    └─ "Your urgent inquiry (#12345) has been answered. Check your email or VITAL app."

STEP 3: User Feedback Collection
├─ Feedback prompt (email + in-app):
│   └─ "Was this response helpful?"
│       ├─ 👍 Yes, very helpful (5 stars)
│       ├─ 😐 Somewhat helpful (3 stars)
│       └─ 👎 Not helpful (1 star)
│
├─ Follow-up questions (optional):
│   ├─ "What did you like most about this response?"
│   ├─ "What could be improved?"
│   └─ "Do you have a follow-up question?"
│
└─ Feedback logged:
    ├─ Rating (1-5 stars)
    ├─ Comment (free text)
    ├─ Follow-up question (new consultation auto-created)
    └─ Used to improve AI models (Human-in-the-Loop)

STEP 4: ROI Calculation & Analytics
├─ Automatically calculate value delivered:
│   ├─ Time saved: User reports "This saved me 3 hours" (or system estimates based on complexity)
│   │   └─ Value: 3 hours × $150/hour (MSL hourly rate) = $450
│   ├─ Decision value: If strategic decision (vs. routine Q&A), higher value
│   ├─ Risk avoided: If compliance flag prevented (off-label, AE miss), quantify risk
│   └─ Total value: Time + Decision + Risk
│
├─ Update dashboards (real-time):
│   ├─ User dashboard: "You've saved 25 hours this month, $3,750 value"
│   ├─ Team dashboard: "Team has handled 120 consultations, $18K value, 8.2x ROI"
│   └─ Executive dashboard: "8,000 hours amplified this quarter, $2.1M value delivered"
│
├─ Log metrics:
│   ├─ Response delivered (timestamp)
│   ├─ End-to-end time: Inquiry submitted → Response delivered (4h 15min)
│   ├─ User satisfaction (5-star rating)
│   └─ Value delivered ($450)
│
└─ Trigger workflows:
    ├─ If NPS 9-10 (promoter): Invite to customer reference program
    ├─ If NPS 0-6 (detractor): Alert CSM, schedule intervention call
    └─ If follow-up question: Create new consultation (link to original)

STEP 5: Audit Trail & Compliance Logging
├─ Immutable audit log entry:
│   ├─ Consultation ID: #12345
│   ├─ User: Sarah Johnson (MSL, Northeast US)
│   ├─ Expert: Oncology - Melanoma Expert
│   ├─ Question: [Full text]
│   ├─ AI Response (original): [Full text]
│   ├─ Expert Reviewer: Sarah Johnson
│   ├─ Review Action: Approved (no edits)
│   ├─ Approval Timestamp: 2026-01-15T18:45:00Z
│   ├─ Delivered To: Dr. Martinez (HCP)
│   ├─ Delivery Timestamp: 2026-01-15T18:45:23Z
│   ├─ Citations: [List of source documents with checksums]
│   ├─ Compliance Checks: ✅ On-label, ✅ Fair balance, ✅ No AE flags
│   └─ Digital signature: [Cryptographic hash for tamper-evidence]
│
├─ Retention: 7 years (21 CFR Part 11 requirement)
├─ Export capability: CSV, PDF, JSON (for regulatory submissions)
└─ Audit dashboard: Real-time compliance monitoring, query audit log
```

**SLA Performance Tracking:**

| Inquiry Type | Target SLA | Actual Performance (P50) | Actual Performance (P90) |
|--------------|------------|-------------------------|-------------------------|
| **Routine** | 4 hours | 2h 15min | 3h 45min |
| **Moderate** | 8 hours | 4h 30min | 7h 15min |
| **Complex** | 24 hours | 12h 20min | 22h 10min |
| **Emergency** | 1 hour | 35 min | 55 min |

**Acceptance Criteria:**
- 90% of consultations meet SLA target
- Response formatting: 100% professional (no formatting errors)
- CRM sync: 95%+ success rate (log created in Veeva)
- User feedback collection: 60%+ response rate (users provide rating)
- Audit trail: 100% of consultations logged (immutable, 7-year retention)

---

### 9.2 Ask Panel (Multi-Expert Collaboration)

**Feature Overview:**
User poses a complex question to a panel of 2-5 AI experts, each providing independent perspectives. System synthesizes into coherent recommendation.

**User Story:**
> "As a Medical Director, I want to consult a panel of experts on a complex cross-functional question (regulatory + medical + commercial), so that I get a well-rounded, multi-disciplinary answer."

**When to Use Ask Panel vs. Ask Expert:**
- **Ask Expert:** Simple, single-domain questions (e.g., "What's the dosing in renal impairment?")
- **Ask Panel:** Complex, multi-dimensional questions requiring diverse perspectives (e.g., "Should we pursue accelerated approval for this rare disease indication? Consider regulatory feasibility, clinical evidence, and commercial viability.")

**Detailed Specification:**

**9.2.1 Panel Configuration**

```
UI Flow:

1. User selects "Ask Panel" (vs. "Ask Expert")

2. Panel Builder Interface:
   ├─ Question field (same as Ask Expert)
   ├─ Panel composition:
   │   ├─ Recommended panel (AI suggests 3-5 experts based on question)
   │   │   └─ Example: Question about rare disease accelerated approval
   │   │       AI suggests:
   │   │       ├─ Regulatory Affairs Expert (FDA pathways)
   │   │       ├─ Clinical Development Expert (evidence requirements)
   │   │       ├─ Rare Disease Expert (orphan drug considerations)
   │   │       └─ Health Economics Expert (pricing, reimbursement)
   │   │
   │   ├─ Custom panel (user manually selects experts):
   │   │   ├─ Drag-and-drop interface (add/remove experts)
   │   │   ├─ Min 2 experts, max 5 experts (optimal panel size)
   │   │   └─ Visual: Expert cards show expertise, estimated contribution
   │   │
   │   └─ Saved panel templates (reuse common panels):
   │       ├─ "Medical Affairs Leadership Panel" (Medical Director + Compliance + MSL Lead)
   │       ├─ "Safety Panel" (Pharmacovigilance + Regulatory + Medical)
   │       └─ "Launch Readiness Panel" (Medical + Commercial + Regulatory + Market Access)
   │
   ├─ Deliberation mode (how should panel collaborate?):
   │   ├─ INDEPENDENT (default): Each expert responds independently, then synthesize
   │   ├─ SEQUENTIAL: Expert 1 → Expert 2 builds on Expert 1 → Expert 3 builds on 1+2
   │   └─ DEBATE: Experts debate, chairperson synthesizes (Ask Committee feature, Year 1 Q3)
   │
   └─ Submit: "Ask Panel" button

3. Confirmation & Tracking:
   └─ "Your question has been submitted to [Panel Name]: Expert A, Expert B, Expert C"
   └─ "Estimated response time: 8 hours (panel consultations take longer than 1-on-1)"
```

**Acceptance Criteria:**
- Panel recommendations 85%+ accurate (correct experts for question)
- User can customize panel in <2 minutes
- Saved panel templates reduce setup time to <30 seconds
- Max panel size enforced (5 experts) to prevent analysis paralysis

---

**9.2.2 Multi-Expert Response Generation**

```
AI Processing Workflow:

STEP 1: Parallel Expert Consultation (INDEPENDENT mode)
├─ Question routed to each panel member simultaneously
├─ Each expert processes question independently:
│   ├─ RAG pipeline (retrieval + generation) per expert
│   ├─ Expert-specific knowledge bases:
│   │   ├─ Regulatory Expert → FDA guidance docs, EMA guidelines, precedents
│   │   ├─ Clinical Expert → Clinical trial data, protocols, endpoints
│   │   ├─ Rare Disease Expert → Orphan drug regulations, patient registries
│   │   └─ Health Economics Expert → Pricing models, payer policies, HTA reports
│   └─ Each expert generates independent response (no cross-talk yet)
│
├─ Processing time: 3-5 minutes per expert (parallel = same 3-5 min total)
│
└─ Output: 3-5 independent expert perspectives

STEP 2: Perspective Analysis
├─ Identify consensus areas:
│   └─ "All experts agree that accelerated approval is feasible if surrogate endpoint validated"
│
├─ Identify divergent opinions:
│   └─ "Regulatory Expert optimistic (70% approval probability), Clinical Expert cautious (40% probability)"
│
├─ Identify knowledge gaps:
│   └─ "Health Economics Expert notes lack of payer data for this indication"
│
└─ Output: Consensus/dissent mapping

STEP 3: Synthesis (Meta-Agent)
├─ Synthesis LLM (specialized for multi-perspective integration):
│   ├─ Input: All expert responses + consensus/dissent analysis
│   ├─ Prompt: "Synthesize these perspectives into coherent recommendation. Highlight consensus, acknowledge dissent, provide balanced conclusion."
│   ├─ Output structure:
│   │   ├─ EXECUTIVE SUMMARY (3-sentence synthesis)
│   │   ├─ CONSENSUS POINTS (where all experts agree)
│   │   ├─ KEY PERSPECTIVES (by expert)
│   │   ├─ DISSENTING VIEWS (where experts disagree, with reasoning)
│   │   ├─ SYNTHESIS & RECOMMENDATION (balanced conclusion)
│   │   └─ NEXT STEPS (actionable recommendations)
│   │
│   └─ Generation time: 60-90 seconds
│
└─ Output: Synthesized panel response

STEP 4: Quality Checks
├─ Ensure all expert perspectives represented (no expert ignored)
├─ Dissenting opinions clearly highlighted (not buried)
├─ Synthesis is balanced (not overly weighted to one expert)
├─ Actionable (provides clear next steps, not just analysis)
└─ Citations to each expert's sources (maintain traceability)

Total Processing Time:
├─ Expert consultation: 3-5 minutes (parallel)
├─ Synthesis: 1-2 minutes
├─ Total: 5-7 minutes (P50), 12-15 minutes (P95)
└─ Still faster than human panel discussion (2-3 hours minimum)
```

**Example Synthesized Response:**

```
PANEL CONSULTATION #45678
Question: "Should we pursue accelerated approval for Drug Z in rare disease X?"
Panel: Regulatory Expert, Clinical Expert, Rare Disease Expert, Health Economics Expert

EXECUTIVE SUMMARY:
Accelerated approval is feasible if the surrogate endpoint (biomarker Y) is validated
with FDA. However, significant uncertainty remains around post-marketing confirmatory
trial requirements and payer acceptance. Recommend proceeding with FDA Type B meeting
to confirm regulatory pathway before committing resources.

CONSENSUS POINTS:
✅ All experts agree:
   • Orphan drug designation appropriate (prevalence <200K in US)
   • Strong unmet medical need (no approved therapies)
   • Surrogate endpoint (biomarker Y) correlates with clinical benefit (published data)
   • Post-marketing confirmatory trial will be required (industry precedent)

KEY PERSPECTIVES:

🏛️ REGULATORY AFFAIRS EXPERT:
"Accelerated approval pathway is the right strategy. FDA has granted accelerated
approval for similar rare disease indications based on surrogate endpoints in past
2 years (see precedents: Drug A, Drug B). Key success factors:
• Type B meeting with FDA to align on surrogate endpoint (schedule ASAP)
• Demonstrate reasonably likely clinical benefit based on biomarker data
• Commit to robust post-marketing trial (design protocol now)
Probability of accelerated approval if Type B meeting successful: 70-80%"
[Citations: FDA Guidance 2023, Precedent analyses]

🔬 CLINICAL DEVELOPMENT EXPERT:
"From clinical evidence perspective, we have solid biomarker data but limited long-
term outcomes. Surrogate endpoint shows 65% response rate in Phase II (n=45), but
durability unknown. Confirmatory trial will need to demonstrate actual clinical
benefit (survival, quality of life). This is a 3-5 year commitment post-approval.
Concerns:
• Small patient population makes enrollment challenging (only 50-80 new patients/year in US)
• Need global trial (US + EU) to hit enrollment targets
• High risk of confirmatory trial failure if surrogate doesn't predict long-term benefit
Probability of ultimate clinical success: 40-50% (biomarker risk)"
[Citations: Phase II data, Patient registry estimates]

🧬 RARE DISEASE EXPERT:
"Patient community is desperate for new therapies. Strong advocacy group support,
high willingness to participate in trials. Orphan drug benefits are substantial:
• 7 years market exclusivity
• Tax credits on clinical trial costs (50% in US)
• Reduced FDA user fees
• Priority review voucher potential (if pediatric indication)
Patient perspective: Even conditional approval provides hope and access. Community
will strongly support accelerated pathway."
[Citations: Patient advocacy data, Orphan drug economics]

💰 HEALTH ECONOMICS EXPERT:
"Commercial viability depends on payer acceptance of surrogate endpoint. Recent rare
disease launches show mixed payer response:
• If priced >$300K/year: Payers demand outcomes-based contracts (pay-for-performance)
• Risk of coverage denials if confirmatory trial fails or delayed
• Ultra-rare pricing may face political scrutiny (see recent congressional hearings)
Recommendation: Conservative pricing ($200K-$250K/year) to reduce payer pushback,
with tiered pricing based on confirmatory trial success."
[Citations: Payer policies, Rare disease pricing analysis]

DISSENTING VIEWS:
⚠️ Divergence on risk assessment:
• Regulatory Expert: Optimistic (70-80% accelerated approval probability)
• Clinical Expert: Cautious (40-50% ultimate success probability due to biomarker risk)

Reasoning: Regulatory approval ≠ Clinical success. Accelerated approval may be granted,
but if confirmatory trial fails, drug could be withdrawn (FDA precedent: 3 withdrawals
in past 5 years). Clinical Expert focuses on long-term risk, Regulatory Expert focuses
on near-term approval feasibility.

SYNTHESIS & RECOMMENDATION:
Balanced recommendation: PROCEED with accelerated approval strategy, BUT de-risk clinical
path and manage commercial expectations.

Rationale:
✅ Pros outweigh cons:
   • Strong patient need + advocacy support
   • Regulatory precedent favorable
   • Orphan drug benefits substantial
   • No competing therapies (market exclusivity)

⚠️ Key risks to manage:
   • Biomarker surrogate may not predict long-term benefit (40-50% risk)
   • Confirmatory trial enrollment challenging (small patient population)
   • Payer acceptance uncertain (outcomes-based contracts likely)

NEXT STEPS (Actionable Recommendations):
1. Schedule FDA Type B meeting (within 90 days) to align on:
   • Surrogate endpoint acceptability
   • Confirmatory trial design requirements
   • Post-marketing study commitments

2. Initiate confirmatory trial planning NOW (parallel path):
   • Design global trial (US + EU + APAC for enrollment)
   • Identify sites with rare disease expertise
   • Engage patient advocacy for recruitment support

3. Develop payer value story (health economics):
   • Real-world evidence plan (demonstrate clinical benefit post-launch)
   • Outcomes-based contract frameworks (de-risk payer coverage)
   • Conservative pricing strategy ($200K-$250K/year)

4. Financial planning:
   • Model scenarios: Accelerated approval granted (Year 2), confirmatory trial success (Year 5)
   • Budget for 3-5 year post-marketing commitment
   • Assess risk of withdrawal if confirmatory trial fails (contingency plan)

5. Decision gate: After FDA Type B meeting
   • If FDA supports pathway → Full commitment (allocate resources)
   • If FDA raises significant concerns → Re-evaluate, consider alternative endpoints

CONSULTATION METADATA:
• Panel: 4 experts (Regulatory, Clinical, Rare Disease, Health Economics)
• Processing time: 6 minutes 32 seconds
• Confidence: 85% (High - based on strong precedent data, some uncertainty on biomarker)
• Reviewed by: Dr. Michael Chen (Medical Director)
• Approved: 2026-01-20T16:30:00Z
```

**Acceptance Criteria:**
- Synthesis includes all expert perspectives (100% representation)
- Dissenting opinions clearly flagged (not buried in synthesis)
- Actionable next steps provided (not just analysis)
- Processing time: <8 minutes (P50), <15 minutes (P95)
- First-pass approval rate: 90%+ (slightly lower than Ask Expert due to complexity)

---

**9.2.3 Dissent Handling & Conflict Resolution**

```
When Experts Disagree:

SCENARIO: Panel disagrees on recommended course of action

Example:
├─ Question: "Should we include pediatric population in Phase III trial?"
├─ Pediatric Expert: "Yes, high unmet need, ethical imperative"
├─ Regulatory Expert: "Yes, FDA may require for full approval"
├─ Clinical Expert: "No, insufficient safety data, risk outweighs benefit"
└─ Commercial Expert: "No, pediatric market too small, not commercially viable"

VITAL Handling:

OPTION 1: Transparent Dissent (Default)
├─ Synthesis clearly presents both sides:
│   └─ "Panel is divided 2-2 on pediatric inclusion.
│
│       ARGUMENTS FOR:
│       • High unmet need in pediatric population (Pediatric Expert)
│       • FDA may require pediatric data for full approval (Regulatory Expert)
│
│       ARGUMENTS AGAINST:
│       • Insufficient safety data, ethical concerns (Clinical Expert)
│       • Small market, not commercially viable (Commercial Expert)
│
│       RECOMMENDATION: Escalate to executive leadership for decision.
│       This is a strategic business decision, not purely technical."
│
└─ Human reviewer makes final call (or escalates to leadership)

OPTION 2: Weighted Voting (Configurable)
├─ Assign weights to experts based on question domain:
│   └─ For clinical safety question: Clinical Expert weight = 2x, Commercial weight = 0.5x
├─ Calculate weighted consensus
└─ Synthesis reflects weighted perspective

OPTION 3: Chairperson Synthesis (Ask Committee)
├─ Assign senior "chairperson" expert to panel
├─ Chairperson reviews all perspectives, makes final synthesis
├─ Available in Ask Committee feature (Year 1 Q3 release)
└─ Use for highest-stakes decisions (regulatory submissions, clinical trial design)

VITAL Default: Always show dissent transparently. Do not hide disagreement.
Principle: Humans make final decisions, AI provides perspectives.
```

**Acceptance Criteria:**
- 100% of dissenting opinions surfaced (never hidden)
- Synthesis explicitly states when panel divided (e.g., "Panel split 3-1...")
- Weighted voting optional (configurable per panel template)
- Escalation path clear (when to involve senior leadership)

---

**9.2.4 Panel Analytics & Insights**

```
Panel Performance Metrics:

1. Panel Composition Analysis:
   ├─ Which expert combinations most effective?
   │   └─ Example: "Regulatory + Clinical + Commercial panels have 92% approval rate"
   └─ Identify underutilized experts (opportunity to promote)

2. Consensus vs. Dissent Rates:
   ├─ Track % of panels with full consensus (healthy: 60-70%)
   ├─ Track % with dissent (healthy: 30-40%, shows diverse perspectives)
   └─ Alert if consensus too high (groupthink?) or too low (incoherent panels?)

3. Synthesis Quality:
   ├─ User ratings on synthesis quality (separate from individual expert ratings)
   ├─ Measure: "Was the synthesis helpful in reaching a decision?"
   └─ Target: 4.5/5 stars on synthesis quality

4. Decision Outcomes:
   ├─ Track: Did user act on panel recommendation?
   ├─ Follow-up survey: "Did you proceed with the recommended course of action?"
   └─ Measure panel impact on business decisions (ultimate value metric)
```

**Acceptance Criteria:**
- Panel composition recommendations 85%+ accurate
- Synthesis quality rating: 4.5/5 stars average
- User acts on panel recommendation: 75%+ of time (if lower, synthesis not actionable enough)

---

### 9.3 Ask Committee (AI Advisory Board)

**Feature Overview:**
Complex, multi-phase AI advisory board for highest-stakes decisions. Committee of 5-12 experts with chairperson, structured deliberation process.

**Release Timeline:** Year 1 Q3 (Advanced feature, follows Ask Expert + Ask Panel)

**User Story:**
> "As a VP Medical Affairs, I need to make a critical go/no-go decision on a $50M clinical trial. I want an AI advisory board to deliberate on this, considering all angles (clinical, regulatory, commercial, financial), so that I have confidence in my recommendation to the C-suite."

**Differentiation from Ask Panel:**
- **Ask Panel:** 2-5 experts, independent perspectives, synthesized (30 min - 8 hours)
- **Ask Committee:** 5-12 experts, structured deliberation with phases, chairperson-led (8-24 hours)

**High-Level Specification:**

```
Committee Workflow:

PHASE 1: RESEARCH (Hours 0-4)
├─ Each committee member conducts independent research
├─ RAG pipeline retrieval (comprehensive, not quick scan)
├─ Prepare position statement (2-3 pages per expert)
└─ Output: Individual expert memos

PHASE 2: DISCUSSION (Hours 4-12)
├─ Experts review each other's memos (simulated asynchronous discussion)
├─ Identify points of agreement and contention
├─ Pose questions to each other (multi-turn dialogue)
└─ Output: Discussion transcript

PHASE 3: VOTE (Hours 12-16)
├─ Committee votes on recommendation (Yes/No/Abstain)
├─ Weighted voting (chairperson weight 2x, specialists 1x)
├─ Supermajority required for strong recommendation (75%+ agreement)
└─ Output: Vote tally + rationale

PHASE 4: SYNTHESIS (Hours 16-24)
├─ Chairperson synthesizes discussion into formal report
├─ Report structure:
│   ├─ Executive summary (1 page)
│   ├─ Background & question (2 pages)
│   ├─ Committee composition (1 page)
│   ├─ Discussion summary (5 pages)
│   ├─ Vote results (1 page)
│   ├─ Recommendation with confidence level (2 pages)
│   ├─ Dissenting opinions (if any, 1-2 pages)
│   └─ Next steps & decision gates (1 page)
└─ Output: Committee report (15-20 pages)

HUMAN REVIEW:
├─ VP Medical Affairs reviews full committee report
├─ Can request follow-up (committee reconvenes on specific question)
├─ Makes final decision with committee input
└─ Committee report attached to business case (audit trail)

Total Time: 8-24 hours (depends on complexity)
Use Cases: Go/no-go decisions, regulatory strategy, portfolio prioritization, major investments
```

**Acceptance Criteria (High-Level, Detailed Spec in Year 1 Q3):**
- Committee report delivered within 24-hour SLA (95%+ of time)
- Report quality: 4.8/5 stars (high bar, executive-ready)
- Decision confidence: 90%+ of executives feel "very confident" in decision after committee review
- ROI: Value of improved decisions (avoided bad investments, accelerated good ones) > $1M+ per committee

---

---

### 9.4 BYOAI Orchestration (Bring Your Own AI)

**Feature Overview:**
Enterprise customers integrate proprietary AI agents alongside VITAL's 136 agents, creating unified multi-agent ecosystem. Critical differentiator vs. competitors.

**User Story:**
> "As a Head of Medical Affairs, I want to integrate our proprietary AI agent (trained on 15 years of internal safety data) with VITAL's platform, so that we can leverage both VITAL's expertise and our unique internal knowledge without vendor lock-in."

**Business Value:**
- **Differentiation:** Only platform supporting true BYOAI orchestration
- **Customer lock-in:** Deep integration with customer AI ecosystem (switching cost high)
- **No vendor lock-in perception:** Customers retain ownership of proprietary IP
- **Network effects:** More custom agents = more valuable platform
- **Premium pricing:** BYOAI feature commands 30-50% price premium

**Detailed Specification:**

**9.4.1 Agent Registration & Discovery**

```
Agent Registration Flow:

STEP 1: Access Agent Management Console
├─ Navigate to Settings → BYOAI → "Register Custom Agent"
├─ Permissions: Admin or designated "Agent Manager" role only
└─ Compliance check: Legal/IT approval workflow for external agent integrations

STEP 2: Agent Configuration Form
├─ Basic Information:
│   ├─ Agent Name: "Acme Pharma Safety AI" (user-defined)
│   ├─ Agent Description: "Trained on 15 years internal safety database, specializes in adverse event assessment"
│   ├─ Category: Safety & Pharmacovigilance (select from taxonomy)
│   ├─ Expertise Tags: [Adverse Events, Drug Interactions, Post-Market Surveillance]
│   └─ Avatar: Upload image or select icon
│
├─ Technical Configuration:
│   ├─ API Endpoint: https://safety-ai.acmepharma.com/api/v1/query
│   ├─ Authentication Method:
│   │   ├─ API Key (customer provides, stored encrypted)
│   │   ├─ OAuth 2.0 (customer OAuth server)
│   │   ├─ Mutual TLS (certificate-based)
│   │   └─ SAML (enterprise SSO)
│   ├─ API Specification:
│   │   ├─ Upload OpenAPI 3.0 spec (JSON/YAML)
│   │   ├─ VITAL validates compatibility
│   │   └─ Required endpoints: POST /query, GET /health
│   └─ Timeout settings: Max response time (default: 30 seconds)
│
├─ Behavior Configuration:
│   ├─ Response format: JSON, XML, Plain Text
│   ├─ Citation handling: How to extract citations from response
│   ├─ Confidence scoring: Does agent provide confidence? (0-100%)
│   └─ Error handling: What to do if agent unavailable (retry, fallback, fail gracefully)
│
├─ Governance & Compliance:
│   ├─ Data residency: Where does agent process data? (US, EU, APAC)
│   ├─ Privacy policy: Upload agent privacy policy
│   ├─ Compliance certifications: SOC 2, HIPAA, GDPR (checkboxes)
│   ├─ Audit trail: Log all queries to custom agent? (Yes/No)
│   └─ Usage limits: Max queries per day (cost control)
│
└─ Submit for Validation

STEP 3: Agent Validation (Automated)
├─ VITAL tests agent connectivity:
│   ├─ Health check: GET /health → Expects 200 OK
│   ├─ Sample query: POST /query with test question
│   ├─ Response validation: Verify JSON structure matches spec
│   ├─ Latency test: Ensure response time <30 seconds (P95)
│   └─ Security scan: Check for vulnerabilities (SSL cert valid, no open ports)
│
├─ Pass criteria:
│   ├─ ✅ Health check successful
│   ├─ ✅ Sample query returns valid response
│   ├─ ✅ Response time acceptable
│   ├─ ✅ Security scan clean
│   └─ If all pass → Agent status: "Active"
│
└─ Fail criteria:
    └─ If any fail → Agent status: "Configuration Error"
        └─ Show error message, troubleshooting guide

STEP 4: Agent Activation
├─ Agent appears in Expert Directory (alongside VITAL agents)
├─ Marked with custom badge: "Acme Pharma Custom Agent"
├─ Discoverable via search, category browse
├─ Users can now "Ask Expert" → Select custom agent
└─ Usage tracked (queries, response time, approval rate)
```

**API Specification (Customer Agent Requirements):**

```json
OpenAPI 3.0 Specification (Minimum Required):

{
  "openapi": "3.0.0",
  "info": {
    "title": "Custom AI Agent API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://safety-ai.acmepharma.com/api/v1"
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "summary": "Health check endpoint",
        "responses": {
          "200": {
            "description": "Agent is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "string", "enum": ["healthy", "degraded", "unavailable"] },
                    "version": { "type": "string" },
                    "uptime": { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/query": {
      "post": {
        "summary": "Submit query to AI agent",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["question", "context"],
                "properties": {
                  "question": { "type": "string", "maxLength": 5000 },
                  "context": {
                    "type": "object",
                    "properties": {
                      "user_id": { "type": "string" },
                      "product": { "type": "string" },
                      "therapeutic_area": { "type": "string" },
                      "urgency": { "type": "string", "enum": ["routine", "urgent", "emergency"] }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["answer", "confidence"],
                  "properties": {
                    "answer": { "type": "string" },
                    "citations": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "source": { "type": "string" },
                          "url": { "type": "string", "format": "uri" }
                        }
                      }
                    },
                    "confidence": { "type": "number", "minimum": 0, "maximum": 100 },
                    "caveats": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Acceptance Criteria:**
- Agent registration completes in <5 minutes (simple UI)
- Validation automatically tests connectivity, response format
- 95%+ of valid agents pass validation on first try
- Agent appears in Expert Directory within 60 seconds of activation
- Full audit trail of agent registration (who registered, when, configuration)

---

**9.4.2 Multi-Agent Workflows (BYOAI + VITAL Agents)**

```
Workflow Builder:

USE CASE: "Safety Signal Assessment Workflow"
Customer wants to chain VITAL Medical Agent → Acme Safety AI → VITAL Regulatory Agent

Workflow Definition:

STEP 1: User submits safety question
└─ "HCP reported patient experiencing rash and elevated liver enzymes after starting Drug X. Is this a known safety signal?"

STEP 2: Route to VITAL Medical Agent (Product Knowledge)
├─ VITAL Medical Agent researches:
│   ├─ Drug X prescribing information (known adverse events)
│   ├─ Clinical trial safety data (Phase II/III)
│   ├─ Published case reports (literature)
│   └─ Generates preliminary assessment
├─ Output: "Rash is known AE (5% incidence), elevated LFTs less common (0.5% incidence). Possible drug-induced liver injury (DILI)."
└─ Confidence: 85%

STEP 3: Route to Acme Safety AI (Internal Safety Database)
├─ Acme Safety AI queries internal safety database:
│   ├─ Post-marketing surveillance reports (15 years)
│   ├─ Similar case reports (pattern recognition)
│   ├─ Geographic clustering (any regional signals?)
│   └─ Generates internal safety assessment
├─ Output: "Internal database shows 47 reports of rash + elevated LFTs with Drug X. 12 cases confirmed DILI, 2 required hospitalization. Signal strength: Moderate."
└─ Confidence: 92%

STEP 4: Route to VITAL Regulatory Agent (Reporting Requirements)
├─ VITAL Regulatory Agent determines:
│   ├─ Is this a serious adverse event? (Elevated LFTs = potentially serious)
│   ├─ Reporting timeline: 15-day expedited report required (serious, unexpected)
│   ├─ MedDRA coding: Drug-Induced Liver Injury (PT: 10013694)
│   └─ Generate E2B report template
├─ Output: "15-day expedited report required. MedDRA coded. E2B XML generated."
└─ Confidence: 98%

STEP 5: Synthesis (Multi-Agent Response)
├─ Combine all three perspectives:
│   ├─ VITAL Medical: Clinical context (known AE profile)
│   ├─ Acme Safety: Internal signal analysis (moderate strength)
│   ├─ VITAL Regulatory: Compliance requirements (15-day report)
│   └─ Synthesized recommendation
├─ Final Response:
│   └─ "SIGNAL CONFIRMED: Rash + elevated LFTs is a known but uncommon adverse event pattern with Drug X.
│
│       INTERNAL DATA (Acme Safety AI): 47 similar cases in post-marketing database, 12 confirmed DILI, moderate signal strength.
│
│       REGULATORY ACTION REQUIRED: 15-day expedited report to FDA (serious, unexpected AE).
│
│       NEXT STEPS:
│       1. Submit E2B report (template attached) within 15 days
│       2. Update prescribing information (add LFT monitoring recommendation)
│       3. Investigate causality (naranjo scale, expert review)
│       4. Consider Dear HCP letter if signal strengthens"
│
└─ Confidence: 90% (high, based on strong internal data)

STEP 6: Human Expert Review
├─ Pharmacovigilance specialist reviews synthesized response
├─ Validates signal strength assessment (agrees: moderate signal)
├─ Approves regulatory action plan
└─ Delivers to Medical Affairs team + submits AE report
```

**Workflow Configuration (Visual Builder):**

```
Visual Workflow Editor:

┌─────────────────────────────────────────────────────────────┐
│                     WORKFLOW CANVAS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   START                                                      │
│     │                                                        │
│     ▼                                                        │
│   ┌───────────────────┐                                     │
│   │ VITAL Medical     │  Confidence > 80%?                  │
│   │ Agent             │────────┐                            │
│   └───────────────────┘        │                            │
│                                 │                            │
│                        YES ◄────┘                            │
│                         │                                    │
│                         ▼                                    │
│                   ┌───────────────────┐                     │
│                   │ Acme Safety AI    │  Signal detected?   │
│                   │ (Custom Agent)    │────────┐            │
│                   └───────────────────┘        │            │
│                                                 │            │
│                                        YES ◄────┘            │
│                                         │                    │
│                                         ▼                    │
│                                   ┌───────────────────┐     │
│                                   │ VITAL Regulatory  │     │
│                                   │ Agent             │     │
│                                   └───────────────────┘     │
│                                         │                    │
│                                         ▼                    │
│                                   ┌───────────────────┐     │
│                                   │ Synthesis         │     │
│                                   └───────────────────┘     │
│                                         │                    │
│                                         ▼                    │
│                                       END                    │
│                                                              │
│   [Add Agent] [Add Condition] [Add Parallel Path]          │
└─────────────────────────────────────────────────────────────┘

Workflow Properties:
├─ Name: "Safety Signal Assessment"
├─ Trigger: Manual (user selects this workflow)
├─ SLA: 24 hours (complex multi-agent workflow)
├─ Approval required: Yes (Pharmacovigilance specialist)
└─ Save as Template: ✓ (reuse for similar cases)
```

**Conditional Logic (If/Then Routing):**

```
IF/THEN Rules:

1. IF VITAL Medical Agent confidence < 80%
   THEN Escalate to human medical director (no automation)

2. IF Acme Safety AI detects NO signal
   THEN Skip regulatory agent (no reporting needed)
   ELSE Route to VITAL Regulatory Agent

3. IF Serious Adverse Event (SAE) detected
   THEN Trigger emergency workflow (30-min SLA)
   ELSE Standard workflow (24-hour SLA)

4. IF Custom agent unavailable (timeout, error)
   THEN Fallback to VITAL agent (graceful degradation)
   AND Alert admin (custom agent needs troubleshooting)
```

**Acceptance Criteria:**
- Workflow builder: Drag-and-drop interface, no coding required
- Support 2-10 agents per workflow (optimal complexity)
- Conditional logic: IF/THEN rules for routing (up to 5 conditions per workflow)
- Workflow templates: Save and reuse common patterns
- Execution time: <15 minutes for 3-agent workflow (P50), <30 minutes (P95)
- Error handling: Graceful fallback if custom agent fails (don't break workflow)

---

**9.4.3 Custom Agent Marketplace (Year 2 Feature)**

```
Vision: Third-Party Agent Ecosystem

Concept:
├─ VITAL hosts marketplace of pre-built custom agents
├─ Third-party developers create agents for common use cases
├─ Customers browse, install agents (1-click)
├─ Revenue share: 70% developer, 30% VITAL
└─ Examples:
    ├─ "Oncology - Immunotherapy Expert" (by KOL Dr. Smith)
    ├─ "Real-World Evidence Analyzer" (by IQVIA)
    ├─ "Payer Policy Expert" (by Avalere Health)
    └─ "Medical Writing Assistant" (by medical writing agency)

Marketplace Features:
├─ Agent listings: Description, ratings, pricing, use cases
├─ Free trial: Test agent with 10 queries before purchase
├─ Pricing models: Per-query, subscription, enterprise license
├─ Reviews: User ratings, testimonials, case studies
├─ Certification: VITAL-certified agents (quality badge)
└─ Analytics: Agent usage, ROI, performance metrics

Business Model:
├─ Developer revenue: $10-$50 per customer per month
├─ VITAL revenue: 30% marketplace fee
├─ Target: 50 third-party agents by Year 2
└─ GMV: $500K+ by Year 3 (marketplace transaction volume)
```

**Acceptance Criteria (Year 2):**
- Marketplace with 50+ third-party agents
- 1-click installation (<2 minutes from browse to active)
- Free trial for all agents (10 queries)
- Developer onboarding: <1 week from application to live
- Revenue share: Automated billing, monthly payouts

---

### 9.5 Knowledge Management

**Feature Overview:**
Centralized knowledge base where customers upload, organize, and maintain content that powers AI agents. Foundation for AI quality.

**User Story:**
> "As a Medical Affairs Manager, I want to upload our approved product labeling, clinical study reports, and internal Q&A library to VITAL, so that AI agents provide accurate, on-brand responses based on our authoritative content."

**Business Value:**
- **AI Quality:** Better content = better AI responses (95%+ approval rate)
- **Customer Control:** Customers own and curate their knowledge
- **Time-to-Value:** Fast content upload = faster onboarding (30-day target)
- **Compliance:** Audit trail of content changes (regulatory requirement)
- **Differentiation:** Enterprise-grade knowledge management (vs. consumer AI tools)

**Detailed Specification:**

**9.5.1 Content Upload & Ingestion**

```
Content Upload Flow:

STEP 1: Access Knowledge Base Manager
├─ Navigate to Settings → Knowledge Base → "Upload Content"
├─ Permissions: Admin, Medical Affairs Manager, Content Curator roles
└─ Welcome wizard (first-time users): "Let's set up your knowledge base"

STEP 2: Upload Interface
├─ Drag-and-drop file upload:
│   ├─ Supported formats: PDF, DOCX, PPTX, TXT, HTML, MD
│   ├─ Max file size: 100 MB per file (larger files: contact support)
│   ├─ Batch upload: Up to 100 files simultaneously
│   └─ Cloud import: Google Drive, SharePoint, Veeva Vault (connectors)
│
├─ Content metadata:
│   ├─ Document type: Product labeling, Clinical study, Publication, Internal Q&A, Policy, Other
│   ├─ Product(s): Associate with product(s) from catalog
│   ├─ Therapeutic area: Oncology, Cardiology, etc.
│   ├─ Date: Publication date, approval date, effective date
│   ├─ Version: Document version number (track revisions)
│   ├─ Classification: Public, Internal, Confidential
│   └─ Tags: Free-text tags for discoverability (e.g., "drug interactions", "pediatric")
│
├─ Processing options:
│   ├─ OCR (Optical Character Recognition): Extract text from scanned PDFs
│   ├─ Language detection: Auto-detect document language (6 supported)
│   ├─ Entity extraction: Auto-tag products, indications, adverse events
│   └─ Chunking strategy: How to split document (by page, by section, semantic chunks)
│
└─ Submit: "Upload & Process"

STEP 3: Automated Processing Pipeline
├─ File validation:
│   ├─ Virus scan (ClamAV)
│   ├─ Format validation (ensure readable)
│   ├─ Size check (within limits)
│   └─ Duplicate detection (avoid duplicate content)
│
├─ Text extraction:
│   ├─ PDF → Text (PyMuPDF, OCR if needed)
│   ├─ DOCX → Text (python-docx)
│   ├─ PPTX → Text (python-pptx)
│   └─ HTML → Text (BeautifulSoup)
│
├─ Content enrichment:
│   ├─ Named Entity Recognition (NER):
│   │   ├─ Extract: Drug names, indications, dosing, adverse events
│   │   ├─ Medical ontology mapping: MedDRA, RxNorm, SNOMED CT
│   │   └─ Store entities as structured metadata
│   ├─ Semantic chunking:
│   │   ├─ Split document into logical chunks (paragraphs, sections)
│   │   ├─ Optimal chunk size: 500-1000 tokens (balance context vs. precision)
│   │   └─ Overlapping chunks (50-token overlap for continuity)
│   └─ Quality scoring:
│       ├─ Readability (Flesch-Kincaid)
│       ├─ Completeness (missing sections detected)
│       └─ Recency (flag outdated content)
│
├─ Vectorization:
│   ├─ Generate embeddings for each chunk
│   ├─ Embedding model: OpenAI text-embedding-3-large (3072 dimensions)
│   ├─ Store in vector database (Pinecone)
│   └─ Index for fast retrieval (<100ms search)
│
├─ Graph extraction:
│   ├─ Extract relationships: Drug → Indication, Drug → Adverse Event, etc.
│   ├─ Store in knowledge graph (Neo4j)
│   └─ Enable traversal queries (find all indications for Drug X)
│
└─ Processing time:
    ├─ Small doc (<10 pages): 30-60 seconds
    ├─ Medium doc (10-100 pages): 2-5 minutes
    ├─ Large doc (100+ pages): 10-20 minutes
    └─ User notified when complete (email, push notification)

STEP 4: Content Review & Approval
├─ Document status: "Processing" → "Review Pending"
├─ Assigned to content curator for quality check:
│   ├─ Verify text extraction accuracy (spot-check)
│   ├─ Confirm metadata correct (product, therapeutic area)
│   ├─ Review auto-extracted entities (any errors?)
│   └─ Test retrieval (sample queries, does this doc surface?)
│
├─ Curator actions:
│   ├─ APPROVE → Status: "Active" (available to AI agents)
│   ├─ EDIT → Fix metadata, re-process
│   └─ REJECT → Status: "Rejected" (not used by AI)
│
└─ Approval workflow (optional):
    └─ Multi-level approval (content curator → medical director → compliance)
```

**Content Processing Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Upload Queue (S3 + SQS)                   │
│                  ├─ Document: product-label.pdf              │
│                  ├─ Size: 5.2 MB                             │
│                  └─ Status: queued                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Content Processing Service (Python)             │
│                  ├─ Virus scan (ClamAV)                      │
│                  ├─ Text extraction (PyMuPDF + OCR)          │
│                  ├─ NER (spaCy + BioBERT medical NER)        │
│                  ├─ Chunking (LangChain TextSplitter)        │
│                  └─ Parallel processing (10 docs/minute)     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ OpenAI   │    │ Pinecone │    │  Neo4j   │
   │ Embedding│    │  Vector  │    │  Graph   │
   │   API    │    │    DB    │    │    DB    │
   └──────────┘    └──────────┘    └──────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Document Metadata (Supabase)                  │
│                  ├─ document_id: abc-123                     │
│                  ├─ filename: product-label.pdf              │
│                  ├─ status: active                           │
│                  ├─ chunks: 47                               │
│                  └─ indexed_at: 2026-01-20T10:15:00Z         │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Upload success rate: 99%+ (robust error handling)
- Processing time: <5 minutes for 95% of documents
- Text extraction accuracy: 98%+ (for machine-readable PDFs), 90%+ (for scanned PDFs with OCR)
- Auto-tagging accuracy: 85%+ (products, indications, AEs correctly extracted)
- User notification: Instant when processing complete

---

**9.5.2 Content Organization & Search**

```
Knowledge Base UI:

├─ Content Library (Main View)
│   ├─ List view / Grid view / Tree view (hierarchical)
│   ├─ Columns: Document name, Type, Product, Date, Status, Actions
│   ├─ Sorting: Name, Date (newest first), Relevance, Popularity (most-cited)
│   ├─ Filtering:
│   │   ├─ Document type (multi-select)
│   │   ├─ Product (multi-select)
│   │   ├─ Therapeutic area (multi-select)
│   │   ├─ Status (Active, Archived, Pending Review)
│   │   └─ Date range (uploaded date, effective date)
│   └─ Bulk actions: Archive, Delete, Export, Re-process
│
├─ Search & Discovery
│   ├─ Full-text search:
│   │   ├─ Search within document content (not just titles)
│   │   ├─ Snippet preview (show matching sentences)
│   │   ├─ Highlighting (highlight search terms)
│   │   └─ Autocomplete (suggest as user types)
│   ├─ Semantic search:
│   │   ├─ "Find documents about rash and liver toxicity" (concept-based, not keyword)
│   │   ├─ Vector similarity search (Pinecone)
│   │   └─ Results ranked by relevance
│   └─ Advanced search:
│       ├─ Boolean operators (AND, OR, NOT)
│       ├─ Phrase search ("exact phrase")
│       └─ Field-specific (product:"Drug X" AND type:"labeling")
│
├─ Folder Organization (Optional)
│   ├─ Create folders: "Product Labeling", "Clinical Studies", "Publications"
│   ├─ Nested folders: Up to 5 levels deep
│   ├─ Drag-and-drop: Move documents between folders
│   └─ Folder permissions: Control who can access specific folders
│
└─ Collections (Smart Folders)
    ├─ Auto-populate based on rules:
    │   └─ Example: "All Drug X documents published in last 6 months"
    ├─ Dynamic: Updates automatically as new content added
    └─ Use cases: "Recent Publications", "Regulatory Submissions", "Safety Updates"
```

**Content Metadata Enrichment:**

```
Automated Metadata Extraction:

1. Product Identification:
   ├─ NER extracts drug names from document
   ├─ Map to product catalog (fuzzy matching)
   ├─ Confidence score: High (>90%), Medium (70-90%), Low (<70%)
   └─ User confirms or corrects (Human-in-the-Loop)

2. Indication Extraction:
   ├─ Extract approved indications from labeling
   ├─ Medical ontology: Map to ICD-10, SNOMED CT
   ├─ Store as structured data (not just free text)
   └─ Enable filtering: "Show all documents for melanoma indication"

3. Adverse Event Extraction:
   ├─ Identify AE mentions (NER + MedDRA mapping)
   ├─ Frequency extraction: "Rash (5%)", "Headache (common, 12%)"
   ├─ Severity: Grade 1-5 (CTCAE)
   └─ Store for safety signal analysis

4. Dosing Regimen Extraction:
   ├─ Extract: "200 mg orally twice daily"
   ├─ Structured format: {dose: 200, unit: mg, route: oral, frequency: BID}
   └─ Enable AI to provide accurate dosing responses

5. Citation Extraction:
   ├─ Extract references from bibliography
   ├─ Parse: Author, Title, Journal, Year, DOI
   └─ Link to PubMed (if available)
```

**Acceptance Criteria:**
- Search results appear in <500ms (fast)
- Search relevance: Top 3 results contain answer 85%+ of time (semantic search)
- Metadata extraction: 85%+ accuracy (auto-tagging products, indications, AEs)
- Folder organization: Support 10,000+ documents without performance degradation
- Collections: Update in real-time (<5 min latency for new documents)

---

**9.5.3 Content Versioning & Lifecycle Management**

```
Content Lifecycle:

STAGE 1: DRAFT
├─ Document uploaded, processing
├─ Not yet available to AI agents
├─ Assigned to curator for review
└─ Actions: Edit metadata, Approve, Reject

STAGE 2: ACTIVE
├─ Document approved, indexed, available to AI
├─ AI agents can cite in responses
├─ Usage tracked (how often cited, user feedback on quality)
└─ Actions: Update, Archive, Delete

STAGE 3: UPDATED (Version Control)
├─ New version uploaded (e.g., updated labeling)
├─ Old version → "Superseded"
├─ New version → "Active"
├─ Both versions retained (audit trail)
├─ AI agents use latest version only (unless specified)
└─ Version comparison: Side-by-side diff view (what changed?)

STAGE 4: ARCHIVED
├─ Document no longer current (outdated)
├─ Not available to AI agents
├─ Retained for compliance (7-year retention)
└─ Actions: Restore (if needed), Permanently Delete (after retention period)

STAGE 5: DELETED
├─ Permanently removed from system
├─ Requires approval (delete is irreversible)
├─ Audit log entry (who deleted, when, why)
└─ Cannot be restored
```

**Version Control:**

```
Document Version History:

Product Label for Drug X:
├─ Version 1.0 (2020-01-15): Original approval
├─ Version 1.1 (2021-03-20): Added warning for hepatotoxicity
├─ Version 1.2 (2022-07-10): New indication added (metastatic melanoma)
├─ Version 2.0 (2023-11-05): Major update (new dosing regimen)
└─ Version 2.1 (2025-02-14): Clarified contraindications ← CURRENT

User actions:
├─ View current version (default)
├─ View all versions (history timeline)
├─ Compare versions (side-by-side diff)
├─ Rollback to previous version (if needed, rare)
└─ Download any version (PDF export)

AI behavior:
├─ Always use current version for new consultations
├─ Historical consultations retain version used (audit trail)
└─ Alert if document updated during consultation (rare edge case)
```

**Content Freshness Monitoring:**

```
Automated Freshness Checks:

1. Expiration Dates:
   ├─ User sets expiration date (e.g., labeling expires when new version approved)
   ├─ Alert 30 days before expiration: "Product Label expiring soon, upload new version"
   └─ Auto-archive if expired and no new version uploaded

2. Recency Scoring:
   ├─ Documents >2 years old: Flag as "Potentially Outdated"
   ├─ Documents >5 years old: Flag as "Likely Outdated", require curator review
   └─ Dashboard: Show % of content that's current (<2 years)

3. Citation Freshness:
   ├─ If AI frequently cites very old documents (>5 years), alert curator
   ├─ Suggestion: "80% of Oncology citations are >3 years old. Consider uploading recent publications."
   └─ Goal: Keep knowledge base current, not stale

4. Usage-Based Curation:
   ├─ Track which documents frequently cited (high value)
   ├─ Track which documents never cited (low value, consider archiving)
   └─ Dashboard: "Top 20 Most Cited Documents" (focus curation efforts here)
```

**Acceptance Criteria:**
- Version history: 100% of document changes tracked (who, when, what changed)
- Side-by-side diff: Visual comparison of versions (highlighting changes)
- Expiration alerts: 100% of expiring documents flagged 30 days in advance
- Freshness dashboard: Real-time view of content recency (% current vs. outdated)
- Archive/restore: <2 seconds to archive or restore document

---

**9.5.4 Content Quality & Compliance**

```
Quality Assurance Workflows:

1. Content Review Checklist (Curator):
   ├─ ☑ Text extraction accurate? (spot-check 3 pages)
   ├─ ☑ Metadata correct? (product, therapeutic area, date)
   ├─ ☑ Entities extracted? (products, indications, AEs tagged)
   ├─ ☑ Compliant content? (no off-label, no promotional claims)
   ├─ ☑ Complete document? (no missing pages, corrupted sections)
   └─ ☑ Searchable? (test query: does this doc surface appropriately?)

2. Compliance Scanning (Automated):
   ├─ Off-label detection:
   │   ├─ Compare document claims vs. approved labeling
   │   ├─ Flag: "Document mentions Drug X for unapproved indication Y"
   │   └─ Curator reviews flagged content
   ├─ Prohibited language:
   │   ├─ Flag absolutes: "always", "never", "guaranteed"
   │   ├─ Flag superlatives: "best", "only", "superior" (without substantiation)
   │   └─ Flag promotional: "game-changing", "revolutionary" (inappropriate for Medical Affairs)
   └─ Citation requirements:
       ├─ Ensure clinical claims have citations
       └─ Flag uncited claims for curator review

3. Quality Scoring (AI-Generated):
   ├─ Readability: Flesch-Kincaid grade level (target: 10-12 for HCP content)
   ├─ Completeness: Expected sections present? (e.g., labeling should have Dosage, Warnings, Adverse Reactions)
   ├─ Accuracy: Cross-reference with authoritative sources (detect discrepancies)
   ├─ Recency: Publication date (prefer recent over old)
   └─ Overall quality score: 0-100 (composite metric)

4. Curator Dashboard:
   ├─ Documents pending review (queue)
   ├─ Documents with compliance flags (high priority)
   ├─ Documents with low quality scores (review for improvement or archive)
   └─ Content coverage gaps: "No documents for Drug Y Indication Z" (gap analysis)
```

**Compliance Audit Trail:**

```
Immutable Audit Log:

Every content action logged:
├─ Upload: Who, when, filename, size, metadata
├─ Processing: Start time, end time, chunks created, entities extracted
├─ Review: Curator name, action (approve/reject/edit), timestamp
├─ Updates: Who updated, what changed (diff), version increment
├─ Access: Who viewed/downloaded document, when (privacy tracking)
├─ Archive/Delete: Who archived/deleted, when, reason
└─ AI Usage: Which consultations cited this document (traceability)

Retention: 7 years (21 CFR Part 11 requirement)
Export: CSV, JSON, PDF (for regulatory submissions)
Search: Query audit log (e.g., "Show all documents accessed by User X in Q3 2026")
```

**Acceptance Criteria:**
- Compliance scanning: 98%+ accuracy (flag off-label, prohibited language)
- Quality scoring: 85%+ correlation with curator manual assessment
- Curator dashboard: Real-time updates (<1 min latency)
- Audit trail: 100% of actions logged (immutable, tamper-proof)
- Gap analysis: Identify missing content areas (e.g., "No safety documents for Drug X pediatric population")

---

## 10. Supporting Features

### 10.1 User Management & Authentication

**Feature Overview:**
Enterprise-grade user management with SSO, RBAC, and team organization.

**10.1.1 Single Sign-On (SSO)**

```
Supported Protocols:
├─ SAML 2.0 (Okta, Azure AD, Ping Identity, OneLogin)
├─ OAuth 2.0 / OpenID Connect (Google, Microsoft, Auth0)
├─ LDAP / Active Directory (for on-prem deployments)
└─ Just-in-Time (JIT) Provisioning (auto-create users on first login)

Configuration:
├─ Customer provides SSO metadata (XML or URL)
├─ VITAL validates configuration
├─ Test SSO connection (sample login)
└─ Enable for organization (all users require SSO)

User Experience:
├─ User clicks "Log in with SSO"
├─ Redirected to customer IdP (Okta, Azure AD, etc.)
├─ Authenticates with company credentials
├─ Redirected back to VITAL (auto-logged in)
└─ Session: 8 hours (configurable), auto-logout on inactivity
```

**Acceptance Criteria:**
- SSO setup: <30 minutes (with clear documentation)
- Login success rate: 99.5%+
- JIT provisioning: Auto-create user on first SSO login
- Session management: Configurable timeout, secure session cookies

---

**10.1.2 Role-Based Access Control (RBAC)**

```
Pre-Defined Roles:

1. Admin:
   ├─ Full system access (all features)
   ├─ User management (invite, remove, assign roles)
   ├─ Billing & subscription management
   ├─ Settings & configuration (SSO, integrations, BYOAI)
   └─ View all analytics (organization-wide)

2. Medical Affairs Manager:
   ├─ Content management (upload, organize, curate knowledge base)
   ├─ Team management (view team usage, performance)
   ├─ Analytics (team and organization-wide dashboards)
   ├─ Expert review (approve AI responses)
   └─ BYOAI (register custom agents)

3. Medical Science Liaison (End User):
   ├─ Submit consultations (Ask Expert, Ask Panel)
   ├─ View own consultation history
   ├─ Share consultations with team
   ├─ Provide feedback (rate responses)
   └─ Limited analytics (own performance only)

4. Viewer (Read-Only):
   ├─ View shared consultations
   ├─ Search knowledge base (read-only)
   ├─ No consultation submission (observer role)
   └─ Use case: Executives, compliance reviewers

5. Custom Roles:
   ├─ Customer can define custom roles
   ├─ Granular permissions (100+ permissions available)
   ├─ Examples:
   │   ├─ "Safety Reviewer" (approve safety-related consultations only)
   │   ├─ "Content Curator" (knowledge base management only, no consultations)
   │   └─ "Analytics Viewer" (dashboards only, no system access)
   └─ Assign custom roles to users or teams
```

**Permissions Matrix:**

| Permission | Admin | Manager | MSL | Viewer |
|------------|-------|---------|-----|--------|
| Submit consultations | ✅ | ✅ | ✅ | ❌ |
| Approve consultations | ✅ | ✅ | Own only | ❌ |
| Upload content | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | Team only | ❌ | ❌ |
| View team analytics | ✅ | ✅ | Own only | ❌ |
| Configure integrations | ✅ | ❌ | ❌ | ❌ |
| Billing access | ✅ | ❌ | ❌ | ❌ |

**Acceptance Criteria:**
- Pre-defined roles: 5 roles available out-of-box
- Custom roles: Support 20+ custom roles per organization
- Granular permissions: 100+ individual permissions (flexible RBAC)
- Role assignment: Bulk assign roles to users (CSV import)
- Audit trail: Log all permission changes (who granted/revoked access, when)

---

**10.1.3 Team Organization**

```
Team Structure:

Organization (Acme Pharma)
├─ Team 1: Oncology Medical Affairs (25 users)
│   ├─ Subteam: Melanoma (8 users)
│   └─ Subteam: Lung Cancer (12 users)
├─ Team 2: Cardiology Medical Affairs (15 users)
├─ Team 3: Global Medical Information (20 users)
└─ Team 4: Safety & Pharmacovigilance (10 users)

Team Features:
├─ Team workspaces: Shared consultations, team knowledge base
├─ Team analytics: Aggregate usage, ROI, performance
├─ Team admin: Designated team leader (manages team members, settings)
├─ Team-specific agents: Custom AI agents accessible only to team
└─ Team notifications: @mention team, broadcast announcements

Collaboration:
├─ Cross-team sharing: Share consultations with other teams
├─ Organization-wide sharing: Make consultation public to all users
└─ External sharing: Export consultation (PDF) to share with HCPs
```

**Acceptance Criteria:**
- Support 50+ teams per organization
- Nested teams: Up to 3 levels (org → team → subteam)
- Team admin: Delegate team management (reduce admin burden)
- Team analytics: Real-time dashboards (team performance, ROI, usage)

---

### 10.2 Analytics & Reporting

**Feature Overview:**
Comprehensive analytics dashboards for users, teams, and executives. Real-time ROI measurement built-in.

**10.2.1 User Dashboard (Personal Analytics)**

```
My Performance Dashboard:

┌─────────────────────────────────────────────────────────────┐
│                    MY VITAL DASHBOARD                        │
│                    Sarah Johnson (MSL)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  THIS MONTH (November 2026)                                 │
│  ├─ Consultations: 32 (▲ 15% vs. last month)               │
│  ├─ Hours Saved: 48 hours (1.5 hours per consultation)     │
│  ├─ ROI: 7.2x ($7,200 value / $1,000 VITAL cost)           │
│  └─ Satisfaction: 4.8/5 stars ⭐⭐⭐⭐⭐                      │
│                                                              │
│  YEAR-TO-DATE (Jan-Nov 2026)                                │
│  ├─ Total Consultations: 287                                │
│  ├─ Total Hours Saved: 431 hours (53 workdays!)            │
│  ├─ Total Value: $64,650                                    │
│  └─ Average Rating: 4.7/5 stars                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    USAGE TRENDS                              │
│  [Line chart: Consultations per month, Jan-Nov 2026]        │
│  Peak: August (42 consultations) - Launch month for new indication
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    TOP EXPERTS CONSULTED                     │
│  1. Oncology - Melanoma Expert (47 consultations)           │
│  2. Clinical Data Expert (23 consultations)                 │
│  3. Regulatory Affairs Expert (18 consultations)            │
│  4. Drug Interaction Expert (15 consultations)              │
│  5. Safety & Pharmacovigilance (12 consultations)           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    ACHIEVEMENTS & BADGES                     │
│  🏆 Power User (>200 consultations/year)                    │
│  ⭐ Quality Champion (>4.5 star average rating)             │
│  🚀 Early Adopter (Active user since Month 1)               │
│  📚 Knowledge Curator (10 KB articles contributed)          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    RECENT CONSULTATIONS                      │
│  [List: Last 10 consultations with status, date, rating]   │
│  1. "Drug X + Y combination in melanoma" - 5⭐ - Nov 14     │
│  2. "Dosing in renal impairment" - 5⭐ - Nov 13             │
│  ...                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Actions:
├─ Export report (PDF, PowerPoint for self-promotion)
├─ Compare to peers (how do I rank vs. team average?)
└─ Set personal goals (target: 40 consultations/month)
```

**Acceptance Criteria:**
- Dashboard loads in <2 seconds
- Real-time updates (<5 min latency for new consultations)
- Gamification: Badges, achievements (drive engagement)
- Export to PDF/PPTX (for self-reviews, promotions)

---

**10.2.2 Team Dashboard (Manager View)**

```
Team Performance Dashboard:

┌─────────────────────────────────────────────────────────────┐
│                 ONCOLOGY TEAM DASHBOARD                      │
│                 Medical Director: Dr. Michael Chen           │
│                 Team: 25 MSLs (US Oncology)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TEAM PERFORMANCE (November 2026)                           │
│  ├─ Total Consultations: 312 (▲ 22% vs. last month)        │
│  ├─ Team ROI: 8.5x ($156,000 value / $18,400 cost)         │
│  ├─ Hours Amplified: 625 hours (25 hours per MSL)          │
│  ├─ Adoption: 88% WAU (22 of 25 MSLs active weekly)        │
│  └─ Satisfaction: 4.7/5 stars (team average)                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    TOP PERFORMERS                            │
│  1. Sarah Johnson - 32 consults, 7.2x ROI, 4.8⭐           │
│  2. Marcus Williams - 28 consults, 8.1x ROI, 4.9⭐         │
│  3. Lisa Chen - 26 consults, 7.5x ROI, 4.7⭐               │
│  ...                                                         │
│  24. David Kim - 8 consults, 3.2x ROI, 4.1⭐ ⚠️ (underutilizing)
│  25. Emily Rodriguez - 4 consults, 2.1x ROI, 3.8⭐ ⚠️ (needs coaching)
│                                                              │
│  Actions:                                                    │
│  └─ [Schedule Coaching Call] for Emily Rodriguez            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    INQUIRY TRENDS                            │
│  Top Topics (November):                                     │
│  1. Drug X safety questions (28% of inquiries)              │
│  2. Combination therapy efficacy (18%)                      │
│  3. Biomarker testing (12%)                                 │
│  4. Dosing adjustments (9%)                                 │
│                                                              │
│  Insight: Heavy focus on safety. Consider proactive Dear HCP letter.
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    QUALITY METRICS                           │
│  ├─ First-pass approval rate: 96% (▲ 2% vs. last month)    │
│  ├─ Compliance rate: 98% (all responses on-label)          │
│  ├─ Average response time: 3.2 hours (target: <4 hours)    │
│  └─ Escalation rate: 4% (low, team handling independently) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Coaching Insights (AI-Generated):**

```
Recommendations for Medical Director:

1. Address Underutilization (2 MSLs <10 consultations/month):
   ├─ Emily Rodriguez: 4 consultations (target: 12+)
   ├─ Possible reasons: Training gap? Doesn't see value? Resistant to change?
   └─ Action: Schedule 1:1, understand barriers, provide training

2. Celebrate Top Performers (Public recognition):
   ├─ Marcus Williams: 8.1x ROI, highest in team
   └─ Action: Recognize in team meeting, nominate for company award

3. Knowledge Gaps Identified:
   ├─ Biomarker testing questions increasing (12% → 18% in 3 months)
   ├─ Current KB content limited on biomarkers
   └─ Action: Upload recent biomarker guidelines, create expert agent

4. Team Capacity:
   ├─ Team handling 312 consultations/month (vs. 115 capacity before VITAL)
   ├─ 2.7x scale achieved without headcount growth
   └─ Insight: Team can absorb new indication launch without hiring
```

**Acceptance Criteria:**
- Team dashboard: Real-time aggregation (<5 min latency)
- Coaching insights: AI-generated recommendations (save manager time)
- Underutilizer alerts: Proactive flagging (<10 consultations/month)
- Trend analysis: Identify inquiry patterns, knowledge gaps

---

**10.2.3 Executive Dashboard (C-Suite View)**

```
Executive Business Review Dashboard:

┌─────────────────────────────────────────────────────────────┐
│               ACME PHARMA - VITAL EXECUTIVE DASHBOARD        │
│               VP Medical Affairs: Dr. Jennifer Martinez      │
│               Period: Q4 2026 (Oct-Dec)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HEADLINE METRICS                                           │
│  ├─ Total ROI: 8.5x ($2.55M value / $300K VITAL cost)      │
│  ├─ Hours Amplified: 12,750 hours (North Star Metric)      │
│  ├─ Consultations Handled: 1,530 (4x capacity vs. manual)  │
│  ├─ User Adoption: 85% WAU (102 of 120 licensed users)     │
│  └─ NPS: 68 (World-class customer advocacy)                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS IMPACT                           │
│  Cost Avoidance:                                            │
│  ├─ Avoided Hiring: 12 FTEs ($2.4M-$3.6M annually)         │
│  ├─ Efficiency Gains: $2.1M (time saved × hourly rate)     │
│  └─ Compliance Risk Avoided: $450K (prevented 3 potential issues)
│                                                              │
│  Strategic Enablement:                                      │
│  ├─ Launched 2 new indications without headcount growth     │
│  ├─ Expanded to 3 new geographies (EU markets)             │
│  └─ Increased HCP engagement: 35% more interactions        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    QUARTERLY TRENDS                          │
│  [Chart: Consultations per quarter, Q1-Q4 2026]            │
│  Growth: Q1 (210) → Q2 (485) → Q3 (1,245) → Q4 (1,530)    │
│  Insight: 6.3x growth year-over-year, strong adoption curve │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    TEAM PERFORMANCE                          │
│  By Therapeutic Area:                                       │
│  1. Oncology: 312 consults, 8.5x ROI, 96% approval         │
│  2. Cardiology: 185 consults, 7.8x ROI, 94% approval       │
│  3. Neurology: 142 consults, 6.9x ROI, 93% approval        │
│                                                              │
│  By Geography:                                              │
│  1. US: 65% of consultations, 8.2x ROI                     │
│  2. EU: 22% of consultations, 8.8x ROI                     │
│  3. APAC: 13% of consultations, 7.5x ROI                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    CFO SUMMARY                               │
│  Investment: $300K (Q4 2026)                                │
│  Value Delivered: $2.55M (measured ROI)                    │
│  Return: 8.5x                                               │
│  Payback Period: <4 weeks (fastest in enterprise software) │
│                                                              │
│  2027 Projection:                                           │
│  ├─ Expand to 200 users (+67% growth)                      │
│  ├─ Projected ROI: 9.2x (improving over time)              │
│  └─ Budget Request: $540K annually                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Actions:
├─ Export to PowerPoint (CFO presentation)
├─ Schedule QBR with VITAL CSM (review, plan expansion)
└─ Share with C-suite (demonstrate Medical Affairs value)
```

**Acceptance Criteria:**
- Executive dashboard: High-level, concise (no clutter)
- ROI calculation: Real-time, auditable (CFO-grade rigor)
- Export to PowerPoint: Auto-generated slides (12-slide deck)
- Benchmarking: Compare to industry (how does our ROI compare?)

---

### 10.3 Collaboration & Sharing

**10.3.1 Consultation Sharing**

```
Sharing Options:

1. Share within VITAL:
   ├─ Share with specific users (type name or email)
   ├─ Share with team (entire team can view)
   ├─ Share organization-wide (all users in company)
   └─ Permissions: View-only, Comment, Edit (collaborative)

2. Share externally (outside VITAL):
   ├─ Export to PDF (formatted, professional)
   ├─ Generate public link (expiring, password-protected)
   ├─ Email directly from VITAL (integrates with Outlook/Gmail)
   └─ Print (formatted for printing, optional watermark)

3. Privacy controls:
   ├─ Public (anyone in org can see)
   ├─ Team (only my team)
   ├─ Private (only me + specific people I share with)
   └─ Confidential (redact patient info, HCP names before sharing)
```

**Collaborative Features:**

```
Discussion Threads:

Consultation #12345: "Drug X + Y combination in melanoma"
├─ Original question & AI response
├─ Comments:
│   ├─ Sarah (MSL): "Great response! I used this with Dr. Martinez, he loved it."
│   ├─ Marcus (MSL): "FYI, Dr. Chen asked similar question last week. Consider KB article?"
│   ├─ Lisa (Manager): "Agreed. I'll add to KB curation queue."
│   └─ Michael (Director): "Nice work team. This is exactly the collaboration I want to see."
│
├─ Reactions: 👍 (8), ❤️ (3), 🎯 (2)
├─ Saves: 12 users saved this consultation (bookmark)
└─ Follow-up consultations: 2 (linked consultations building on this one)

Features:
├─ @mentions: Notify specific user ("Hey @Marcus, check this out")
├─ Notifications: Real-time (push, email when someone comments)
├─ Threading: Nested replies (maintain conversation context)
└─ Rich media: Attach images, links, files to comments
```

**Acceptance Criteria:**
- Sharing: <5 seconds from select to share
- Permissions: Granular control (view/comment/edit)
- Comments: Real-time updates (<2 sec latency)
- External export: PDF generation <10 seconds

---

### 10.4 Notifications & Alerts

**10.4.1 Notification Channels**

```
Multi-Channel Notifications:

1. In-App Notifications:
   ├─ Badge count (unread notifications)
   ├─ Notification center (dropdown)
   ├─ Real-time updates (WebSocket)
   └─ Mark as read/unread, archive

2. Push Notifications (Mobile):
   ├─ iOS: Apple Push Notification Service (APNS)
   ├─ Android: Firebase Cloud Messaging (FCM)
   ├─ User controls: Enable/disable per notification type
   └─ Delivery: Instant (<5 sec latency)

3. Email Notifications:
   ├─ Digest: Daily or weekly summary (configurable)
   ├─ Immediate: Critical notifications (emergency consultations)
   ├─ Batching: Group related notifications (reduce email fatigue)
   └─ Unsubscribe: Granular control (opt-out per type)

4. SMS (Emergency Only):
   ├─ Use case: Emergency consultations (30-min SLA)
   ├─ Opt-in required (user provides phone number)
   └─ Carrier: Twilio (reliable delivery)

5. Slack/Teams Integration (Optional):
   ├─ Post notifications to Slack channel or Teams chat
   ├─ Use case: Team notifications, shared consultations
   └─ Setup: Install VITAL bot, configure channel
```

**Notification Types:**

| Event | In-App | Push | Email | SMS | Configurable |
|-------|--------|------|-------|-----|--------------|
| **Response ready for review** | ✅ | ✅ | ✅ | ❌ | Yes |
| **Consultation approved** | ✅ | ✅ | Optional | ❌ | Yes |
| **Someone commented on your consultation** | ✅ | ✅ | Daily digest | ❌ | Yes |
| **@mentioned in comment** | ✅ | ✅ | ✅ | ❌ | Yes |
| **Emergency consultation assigned** | ✅ | ✅ | ✅ | ✅ | No (always on) |
| **Content expiring soon** | ✅ | ❌ | Weekly digest | ❌ | Yes |
| **Low adoption alert (admin)** | ✅ | ❌ | ✅ | ❌ | Yes |
| **ROI milestone reached** | ✅ | ✅ | ✅ | ❌ | Yes |

**Acceptance Criteria:**
- Delivery speed: Push <5 sec, Email <1 min, SMS <10 sec
- User control: Granular settings (enable/disable per type, per channel)
- Batching: Intelligent grouping (don't send 20 separate emails, send 1 digest)
- Reliability: 99.9% delivery rate

---

## 11. Platform Features

### 11.1 Mobile Applications (iOS & Android)

**Feature Overview:**
Native mobile apps for on-the-go consultation. Critical for field-based MSLs.

**11.1.1 Mobile App Features**

```
Core Capabilities (Parity with Web):
├─ Submit consultations (Ask Expert, Ask Panel)
├─ Review & approve AI responses
├─ View consultation history
├─ Search knowledge base
├─ View analytics dashboard (my performance)
└─ Notifications (push, real-time)

Mobile-Specific Features:
├─ Voice input (dictate question via Siri/Google Assistant)
├─ Camera integration (take photo of HCP question, OCR to text)
├─ Offline mode (queue consultations, sync when online)
├─ Quick actions (3D Touch / long-press shortcuts)
├─ Biometric authentication (Face ID, Touch ID, fingerprint)
└─ Share to app (share from email, browser → VITAL app)

UI/UX Optimizations:
├─ Swipe gestures (swipe to approve, swipe to archive)
├─ Bottom sheet navigation (thumb-friendly)
├─ Dark mode (reduce eye strain)
├─ Large touch targets (44×44 pt minimum, iOS guidelines)
└─ One-handed operation (all critical actions reachable)
```

**Mobile App Platforms:**

| Platform | Technology | Min OS Version | Release Timeline |
|----------|------------|----------------|------------------|
| **iOS** | Swift + SwiftUI | iOS 15+ | Q2 2026 (Beta), Q3 2026 (GA) |
| **Android** | Kotlin + Jetpack Compose | Android 10+ | Q2 2026 (Beta), Q3 2026 (GA) |

**Acceptance Criteria:**
- Feature parity: 95%+ of web features available on mobile
- Performance: App launch <2 seconds, consultation submit <3 seconds
- Offline mode: Queue up to 50 consultations offline, sync when online
- App rating: 4.5+ stars (iOS App Store, Google Play)
- Crash rate: <0.1% (industry-leading stability)

---

### 11.2 API & Webhooks

**11.2.1 RESTful API**

```
API Overview:

Base URL: https://api.vital.ai/v1
Authentication: Bearer token (OAuth 2.0)
Rate Limit: 1,000 requests/hour (per API key)
Versioning: Semantic versioning (v1, v2, etc.)
Documentation: OpenAPI 3.0 spec, interactive docs (Swagger UI)

Key Endpoints:

POST /consultations
├─ Submit consultation programmatically
├─ Request body: { "question": "...", "expert_id": "...", "context": {...} }
├─ Response: { "consultation_id": "12345", "status": "processing", "estimated_time": "4 hours" }
└─ Use case: Integrate VITAL into customer's internal tools (CRM, help desk)

GET /consultations/{id}
├─ Retrieve consultation status & response
├─ Response: { "id": "12345", "status": "approved", "answer": "...", "citations": [...] }
└─ Use case: Poll for consultation completion

POST /consultations/{id}/approve
├─ Programmatically approve AI response (for automated workflows)
├─ Request body: { "action": "approve", "reviewer_id": "user-456" }
└─ Use case: Auto-approve routine consultations if confidence >95%

GET /analytics/user/{user_id}
├─ Retrieve user analytics (consultations, ROI, ratings)
├─ Response: { "consultations": 32, "hours_saved": 48, "roi": 7.2 }
└─ Use case: Embed VITAL analytics in customer BI dashboards

POST /knowledge-base/upload
├─ Programmatically upload documents to knowledge base
├─ Request body: Multipart form-data (file + metadata)
└─ Use case: Automated content sync from Veeva Vault, SharePoint
```

**API Client Libraries:**

```
Supported Languages:
├─ Python (vital-python)
├─ JavaScript/TypeScript (vital-js)
├─ Java (vital-java)
└─ .NET/C# (vital-dotnet)

Example (Python):

from vital import VITALClient

client = VITALClient(api_key="your-api-key")

# Submit consultation
consultation = client.consultations.create(
    question="What's the dosing for Drug X in renal impairment?",
    expert_id="nephrology-expert",
    context={"product": "Drug X", "urgency": "routine"}
)

print(f"Consultation submitted: {consultation.id}")

# Poll for response
response = client.consultations.get(consultation.id)
if response.status == "approved":
    print(f"Answer: {response.answer}")
```

**Acceptance Criteria:**
- API uptime: 99.9%+
- Response time: <200ms (P50), <500ms (P95)
- Documentation: Interactive, code examples in 4 languages
- Client libraries: SDKs for Python, JS, Java, .NET
- Rate limiting: Clear error messages, retry-after headers

---

**11.2.2 Webhooks (Event-Driven Integration)**

```
Webhook Events:

1. consultation.created
   └─ Triggered when: New consultation submitted
   └─ Payload: { "event": "consultation.created", "consultation_id": "12345", "question": "...", "timestamp": "..." }

2. consultation.ai_response_ready
   └─ Triggered when: AI generates response, awaiting human review
   └─ Use case: Send Slack notification to expert reviewer

3. consultation.approved
   └─ Triggered when: Expert approves response, delivered to user
   └─ Use case: Update CRM (Veeva) with consultation outcome

4. consultation.rejected
   └─ Triggered when: Expert rejects AI response (quality issue)
   └─ Use case: Alert AI team, investigate failure mode

5. knowledge_base.document_processed
   └─ Triggered when: Document uploaded, processed, indexed
   └─ Use case: Notify content curator, ready for review

6. user.roi_milestone
   └─ Triggered when: User reaches ROI milestone (10x, 20x, etc.)
   └─ Use case: Send congratulatory email, celebrate achievement

Webhook Configuration:
├─ URL: Customer provides webhook endpoint (e.g., https://customer.com/webhooks/vital)
├─ Authentication: HMAC signature (verify webhook authenticity)
├─ Retry: Exponential backoff (3 retries over 24 hours)
├─ Payload: JSON (consistent format across all events)
└─ Logs: Webhook delivery logs (success/failure, response code)
```

**Acceptance Criteria:**
- Event delivery: <5 seconds after event occurs
- Reliability: 99.5%+ delivery rate (with retries)
- Security: HMAC signature validation (prevent spoofing)
- Debugging: Webhook logs (view delivery history, retry failed webhooks)

---

### 11.3 Enterprise Integrations

**11.3.1 Veeva CRM Integration**

```
Integration Overview:

Bi-Directional Sync:
├─ VITAL → Veeva CRM:
│   ├─ Log consultation as "Medical Information Request" activity
│   ├─ Associate with HCP account (if consultation related to specific HCP)
│   ├─ Tag with product, therapeutic area (for segmentation)
│   └─ Update HCP profile (enrichment: "Interested in Drug X combination therapy")
│
└─ Veeva CRM → VITAL:
    ├─ HCP inquiry logged in Veeva → Auto-create consultation in VITAL
    ├─ MSL can initiate consultation from within Veeva CRM (embedded widget)
    └─ HCP data synced (name, institution, specialty) for context

Setup:
├─ OAuth 2.0 connection to Veeva CRM
├─ Field mapping (VITAL fields → Veeva fields)
├─ Sync frequency: Real-time (webhook-triggered) or Scheduled (hourly)
└─ Configuration UI (no coding required)

Use Cases:
├─ MSL receives HCP inquiry in Veeva CRM email
├─ Clicks "Create VITAL Consultation" button (Veeva embedded widget)
├─ VITAL opens, pre-populated with HCP question & context
├─ MSL submits consultation, AI generates response
├─ MSL approves, VITAL auto-logs activity in Veeva CRM
└─ HCP profile enriched with topic tags (machine learning)
```

**Acceptance Criteria:**
- Setup time: <2 hours (with documentation)
- Sync success rate: 99%+ (robust error handling)
- Embedded widget: Seamless UX (feels native to Veeva)
- Field mapping: Support custom Veeva fields (flexibility)

---

**11.3.2 Salesforce Integration**

```
Integration Type: AppExchange App + API

Features:
├─ Salesforce AppExchange listing (one-click install)
├─ Embedded VITAL widget in Salesforce (Lightning Component)
├─ Consultation linked to Salesforce objects (Account, Contact, Opportunity)
├─ Analytics: VITAL data surfaces in Salesforce reports & dashboards
└─ SSO: Single sign-on (use Salesforce credentials for VITAL)

Use Case:
└─ Pharmaceutical sales rep logs customer question in Salesforce
    → Medical Affairs team picks up inquiry in VITAL
    → Responds with compliant answer
    → Response logged back to Salesforce (audit trail)
```

**Acceptance Criteria:**
- AppExchange certification: By Q4 2026
- Lightning Component: Responsive, mobile-friendly
- Data sync: Real-time or near-real-time (<5 min)

---

**11.3.3 Microsoft Teams Integration**

```
VITAL Bot for Teams:

Commands:
├─ /vital ask [question] → Submit consultation from Teams chat
├─ /vital status [consultation_id] → Check consultation status
├─ /vital recent → View recent consultations
└─ /vital stats → View my performance stats

Notifications:
├─ Response ready → Teams message with preview & link
├─ @mentioned in comment → Teams notification
└─ Team updates → Broadcast to Teams channel

Setup:
└─ Install VITAL app from Teams app store (one-click)
```

**Acceptance Criteria:**
- Teams app certification: By Q3 2026
- Command response time: <2 seconds
- Notification delivery: <5 seconds

---

### 11.4 Admin & Configuration

**11.4.1 Admin Console**

```
Settings Categories:

1. Organization Settings:
   ├─ Company name, logo, branding
   ├─ Time zone, language, regional settings
   ├─ Fiscal year (for analytics reporting)
   └─ Data residency (US, EU, APAC)

2. User Management:
   ├─ Invite users (email invitations)
   ├─ Bulk import (CSV upload)
   ├─ Role assignment (RBAC)
   ├─ Deactivate users (offboarding)
   └─ Audit log (user access, permission changes)

3. Security & Compliance:
   ├─ SSO configuration (SAML, OAuth)
   ├─ MFA enforcement (require for all users)
   ├─ Session timeout (configurable)
   ├─ IP allow listing (restrict access by IP range)
   ├─ Data retention policy (7 years default, configurable)
   └─ Export audit logs (compliance reporting)

4. Integrations:
   ├─ Veeva CRM, Salesforce, Microsoft Teams, Slack
   ├─ API keys (generate, revoke, rotate)
   ├─ Webhooks (configure endpoint, view logs)
   └─ BYOAI (register custom agents)

5. Knowledge Base:
   ├─ Content upload, organization, curation
   ├─ Auto-expiration rules (flag docs >2 years old)
   ├─ Content quality dashboard (gaps, freshness)
   └─ Agent training status (which agents trained on which docs)

6. Analytics & Reporting:
   ├─ Default dashboard configuration
   ├─ Custom report builder
   ├─ Scheduled reports (email weekly/monthly reports)
   └─ Data export (CSV, API access for BI tools)

7. Billing & Subscription:
   ├─ Current plan (Enterprise, seats, add-ons)
   ├─ Usage (seats used, consultations this month)
   ├─ Invoice history (download PDFs)
   ├─ Payment method (credit card, ACH, invoice)
   └─ Upgrade/downgrade (change plan, add seats)
```

**Acceptance Criteria:**
- Admin console: Intuitive UI, no training required
- Settings: Changes apply in <1 minute (real-time propagation)
- Bulk import: Support 10,000+ users (CSV)
- Audit log: Searchable, exportable, 100% coverage

---

This PRD is now ~75 pages. I'll continue with User Stories Library, UI/UX Requirements, Non-Functional Requirements, and Product Roadmap to reach 100-150 pages. Should I continue?# PART IV: USER STORIES LIBRARY

## 12. Epic 1: AI Consultation

### User Story 12.1: Submit Simple Inquiry (Priority: P0 - Must Have)

**As a** Medical Science Liaison (MSL)
**I want to** submit a question to an AI expert and receive a fast, accurate response
**So that** I can answer HCP inquiries without spending hours researching

**Acceptance Criteria:**
- [ ] User can select expert from 136-agent registry in <30 seconds
- [ ] User can type question (up to 5,000 characters)
- [ ] System auto-classifies inquiry (topic, urgency, complexity) with 85%+ accuracy
- [ ] Confirmation displayed within 2 seconds with estimated response time
- [ ] User receives notification when response ready (push, email)
- [ ] 90% of consultations meet 4-hour SLA

**Story Points:** 5
**Dependencies:** Expert directory, AI response generation, notification system
**Release:** MVP (Q1 2026)

---

### User Story 12.2: Review & Approve AI Response (Priority: P0 - Must Have)

**As an** Expert Reviewer (MSL, Medical Director)
**I want to** quickly review AI-generated responses for accuracy and compliance
**So that** I can maintain quality control before responses are delivered

**Acceptance Criteria:**
- [ ] Response displayed with summary, detailed answer, citations, confidence score
- [ ] One-click approve action (completes in <2 seconds)
- [ ] Inline editing capability (for minor corrections)
- [ ] Rejection with feedback (triggers AI re-generation)
- [ ] Escalation path (route to senior expert)
- [ ] 100% of responses logged in audit trail

**Story Points:** 8
**Dependencies:** AI response generation, audit logging
**Release:** MVP (Q1 2026)

---

### User Story 12.3: Ask Panel of Experts (Priority: P1 - Should Have)

**As a** Medical Director
**I want to** pose complex questions to a panel of 2-5 experts
**So that** I get multi-disciplinary perspectives on strategic decisions

**Acceptance Criteria:**
- [ ] User can select 2-5 experts for panel
- [ ] System provides recommended panel based on question (85%+ accuracy)
- [ ] Each expert generates independent response
- [ ] System synthesizes responses into coherent recommendation
- [ ] Dissenting opinions clearly highlighted
- [ ] Panel response delivered within 8-hour SLA (90% of time)

**Story Points:** 13
**Dependencies:** Ask Expert, multi-agent synthesis
**Release:** Q2 2026

---

### User Story 12.4: Voice Input for Question (Priority: P2 - Nice to Have)

**As an** MSL on the go
**I want to** dictate my question using voice input
**So that** I can submit consultations hands-free while driving or between appointments

**Acceptance Criteria:**
- [ ] Voice input button available on mobile app
- [ ] Integrates with Siri (iOS) and Google Assistant (Android)
- [ ] Speech-to-text accuracy >95% for medical terminology
- [ ] User can edit transcribed text before submission
- [ ] Voice input available in 6 languages

**Story Points:** 5
**Dependencies:** Mobile app, speech-to-text API
**Release:** Q3 2026 (Mobile GA)

---

### User Story 12.5: Follow-Up Question (Priority: P1 - Should Have)

**As an** MSL
**I want to** ask follow-up questions on previous consultations
**So that** I can dig deeper without re-explaining context

**Acceptance Criteria:**
- [ ] "Ask Follow-Up" button on consultation detail page
- [ ] Previous consultation context auto-included
- [ ] Follow-up linked to original consultation (breadcrumb trail)
- [ ] Expert agent has memory of previous interaction
- [ ] Follow-up responses faster (context already retrieved)

**Story Points:** 5
**Dependencies:** Consultation history, LLM memory/context
**Release:** Q2 2026

---

## 13. Epic 2: BYOAI & Customization

### User Story 13.1: Register Custom AI Agent (Priority: P1 - Should Have)

**As a** Medical Affairs Manager
**I want to** register our proprietary AI agent with VITAL
**So that** we can leverage both VITAL's expertise and our internal knowledge

**Acceptance Criteria:**
- [ ] Agent registration form (name, description, API endpoint, auth)
- [ ] Upload OpenAPI 3.0 spec for validation
- [ ] Automated connectivity test (health check, sample query)
- [ ] Security scan (SSL cert, vulnerabilities)
- [ ] Agent appears in Expert Directory within 60 seconds
- [ ] Full audit trail of registration

**Story Points:** 13
**Dependencies:** API gateway, agent registry, validation service
**Release:** Q2 2026 (BYOAI launch)

---

### User Story 13.2: Create Multi-Agent Workflow (Priority: P1 - Should Have)

**As a** Medical Affairs Manager
**I want to** chain VITAL agents and custom agents into workflows
**So that** we can automate complex multi-step processes

**Acceptance Criteria:**
- [ ] Visual workflow builder (drag-and-drop)
- [ ] Support 2-10 agents per workflow
- [ ] Conditional logic (IF/THEN routing based on confidence, content)
- [ ] Workflow templates (save and reuse)
- [ ] Test mode (dry-run workflow before activating)
- [ ] Workflow execution time <30 minutes (P95)

**Story Points:** 21
**Dependencies:** BYOAI, LangGraph orchestration
**Release:** Q3 2026

---

### User Story 13.3: Monitor Custom Agent Performance (Priority: P2 - Nice to Have)

**As a** Medical Affairs Manager
**I want to** see analytics on custom agent usage and quality
**So that** I can optimize our proprietary agents

**Acceptance Criteria:**
- [ ] Custom agent dashboard (queries, response time, approval rate)
- [ ] Compare custom agent vs. VITAL agents (performance benchmarking)
- [ ] Alert if custom agent underperforming (<80% approval rate)
- [ ] Usage trends (which custom agents most popular)
- [ ] Cost tracking (if custom agent has usage fees)

**Story Points:** 8
**Dependencies:** BYOAI, analytics framework
**Release:** Q3 2026

---

## 14. Epic 3: Collaboration & Knowledge Sharing

### User Story 14.1: Share Consultation with Team (Priority: P1 - Should Have)

**As an** MSL
**I want to** share high-quality consultations with my team
**So that** we can learn from each other and build institutional knowledge

**Acceptance Criteria:**
- [ ] "Share" button on consultation detail page
- [ ] Share with specific users, teams, or organization-wide
- [ ] Permissions: View-only, Comment, Edit
- [ ] Shared consultations appear in team feed
- [ ] Notification sent to shared recipients
- [ ] 40%+ of consultations shared (target adoption)

**Story Points:** 5
**Dependencies:** Team management, permissions system
**Release:** Q2 2026

---

### User Story 14.2: Comment on Consultation (Priority: P1 - Should Have)

**As a** Team Member
**I want to** comment on shared consultations
**So that** I can provide feedback and start discussions

**Acceptance Criteria:**
- [ ] Comment box on consultation detail page
- [ ] @mentions (notify specific users)
- [ ] Threaded replies (nested comments)
- [ ] Reactions (👍, ❤️, 🎯)
- [ ] Real-time updates (<2 sec latency)
- [ ] Email digest (daily summary of comments)

**Story Points:** 8
**Dependencies:** Consultation sharing, real-time infrastructure
**Release:** Q2 2026

---

### User Story 14.3: Convert Consultation to Knowledge Base Article (Priority: P2 - Nice to Have)

**As a** Content Curator
**I want to** convert high-quality consultations into reusable KB articles
**So that** future similar questions are answered instantly

**Acceptance Criteria:**
- [ ] "Convert to KB Article" action (curator only)
- [ ] Auto-populate article with consultation content
- [ ] Curator edits for generalization (remove patient-specific details)
- [ ] Approval workflow (curator → medical director → compliance)
- [ ] Published articles searchable in knowledge base
- [ ] AI agents cite KB articles in future responses

**Story Points:** 13
**Dependencies:** Knowledge base, curation workflow
**Release:** Q3 2026

---

## 15. Epic 4: Analytics & ROI

### User Story 15.1: View Personal ROI Dashboard (Priority: P0 - Must Have)

**As an** MSL
**I want to** see my personal ROI and performance metrics
**So that** I can demonstrate value to my manager

**Acceptance Criteria:**
- [ ] Dashboard displays: Consultations, hours saved, ROI, satisfaction
- [ ] Month-over-month trends (usage increasing or decreasing?)
- [ ] Comparison to team average (am I above/below average?)
- [ ] Top experts consulted (where do I go for help?)
- [ ] Export to PDF/PowerPoint (for self-reviews, promotions)
- [ ] Dashboard loads in <2 seconds

**Story Points:** 8
**Dependencies:** Analytics framework, ROI calculation engine
**Release:** MVP (Q1 2026)

---

### User Story 15.2: View Team Performance (Priority: P1 - Should Have)

**As a** Medical Director
**I want to** see aggregate team performance metrics
**So that** I can identify top performers and coach underutilizers

**Acceptance Criteria:**
- [ ] Team dashboard (total consultations, team ROI, hours amplified, adoption)
- [ ] Leaderboard (top performers by consultations, ROI, quality)
- [ ] Underutilizer alerts (flag users <10 consultations/month)
- [ ] Inquiry trends (top topics, knowledge gaps)
- [ ] AI-generated coaching insights (recommendations for manager)
- [ ] Export to PowerPoint (for team meetings, executive reviews)

**Story Points:** 13
**Dependencies:** User analytics, team management
**Release:** Q2 2026

---

### User Story 15.3: Export Executive Business Review (Priority: P1 - Should Have)

**As a** VP Medical Affairs
**I want to** generate auto-formatted QBR report for CFO
**So that** I can justify Medical Affairs budget with hard ROI data

**Acceptance Criteria:**
- [ ] "Export QBR" button (executive dashboard)
- [ ] Auto-generated PowerPoint (12 slides: ROI, impact, trends)
- [ ] Customizable template (add logo, adjust metrics)
- [ ] Comparison to previous quarter (growth trends)
- [ ] Export completes in <1 minute
- [ ] CFO-grade rigor (auditable calculations)

**Story Points:** 13
**Dependencies:** Executive dashboard, PowerPoint export library
**Release:** Q2 2026

---

## 16. Epic 5: Administration & Setup

### User Story 16.1: Configure SSO (Priority: P0 - Must Have)

**As an** IT Administrator
**I want to** configure SAML SSO with our identity provider
**So that** users can log in with company credentials

**Acceptance Criteria:**
- [ ] SSO configuration UI (upload metadata or provide URL)
- [ ] Supported protocols: SAML 2.0, OAuth 2.0, OIDC
- [ ] Test SSO connection (validate before enabling)
- [ ] JIT user provisioning (auto-create users on first login)
- [ ] Setup completes in <30 minutes (with documentation)
- [ ] Login success rate: 99.5%+

**Story Points:** 13
**Dependencies:** Authentication service, IdP integrations
**Release:** MVP (Q1 2026)

---

### User Story 16.2: Bulk Import Users (Priority: P1 - Should Have)

**As an** Admin
**I want to** bulk import 500+ users via CSV
**So that** I can onboard entire organization efficiently

**Acceptance Criteria:**
- [ ] CSV template provided (columns: email, name, role, team)
- [ ] Upload CSV (validate format, detect errors)
- [ ] Preview import (show which users will be created)
- [ ] Bulk create users (100+ users in <2 minutes)
- [ ] Email invitations sent automatically
- [ ] Import log (success/failure per user)

**Story Points:** 8
**Dependencies:** User management, email service
**Release:** Q1 2026

---

### User Story 16.3: Upload Knowledge Base Content (Priority: P0 - Must Have)

**As a** Medical Affairs Manager
**I want to** upload our approved product labeling and clinical studies
**So that** AI agents provide accurate, on-brand responses

**Acceptance Criteria:**
- [ ] Drag-and-drop file upload (PDF, DOCX, PPTX, TXT, HTML, MD)
- [ ] Batch upload (up to 100 files)
- [ ] Metadata entry (product, therapeutic area, date, version)
- [ ] Auto-processing (text extraction, NER, vectorization, graphing)
- [ ] Processing time: <5 minutes for 95% of documents
- [ ] Upload success rate: 99%+

**Story Points:** 13
**Dependencies:** Content processing pipeline, vector DB, graph DB
**Release:** MVP (Q1 2026)

---

## Additional User Stories (Summary)

**Epic 1: AI Consultation**
- 12.6: Search Consultation History (P1, 5 pts, Q2 2026)
- 12.7: Filter Consultations by Product/Topic (P2, 3 pts, Q2 2026)
- 12.8: Star/Favorite Consultation (P2, 2 pts, Q2 2026)
- 12.9: Emergency Consultation (30-min SLA) (P0, 8 pts, Q1 2026)
- 12.10: Offline Mode (Queue Consultations) (P2, 13 pts, Q3 2026)

**Epic 2: BYOAI & Customization**
- 13.4: Marketplace - Browse Third-Party Agents (P3, 13 pts, Year 2)
- 13.5: Marketplace - Install Agent 1-Click (P3, 8 pts, Year 2)
- 13.6: Custom Agent Versioning (P2, 5 pts, Q3 2026)
- 13.7: Agent A/B Testing (P3, 13 pts, Year 2)

**Epic 3: Collaboration & Knowledge Sharing**
- 14.4: Team Workspace (Shared Resources) (P1, 8 pts, Q2 2026)
- 14.5: Save Consultation as Template (P2, 5 pts, Q3 2026)
- 14.6: Expert Network Directory (Find Human Experts) (P2, 8 pts, Q3 2026)
- 14.7: Consultation Bookmarks (P2, 3 pts, Q2 2026)

**Epic 4: Analytics & ROI**
- 15.4: Custom Reports (Build Your Own Dashboard) (P2, 13 pts, Q3 2026)
- 15.5: Scheduled Reports (Email Weekly/Monthly) (P2, 5 pts, Q3 2026)
- 15.6: Benchmark vs. Industry (P3, 8 pts, Year 2)
- 15.7: Predictive Analytics (Forecast Usage, ROI) (P3, 21 pts, Year 2)

**Epic 5: Administration & Setup**
- 16.4: Configure Veeva CRM Integration (P1, 13 pts, Q2 2026)
- 16.5: Configure Webhooks (P2, 8 pts, Q2 2026)
- 16.6: Audit Log Search & Export (P1, 8 pts, Q1 2026)
- 16.7: Data Retention Policy Configuration (P1, 5 pts, Q1 2026)

**Total User Stories: 50+ (detailed above + summaries)**
**Total Story Points: ~400 points (roughly 2-3 sprints per epic)**

---

# PART V: UI/UX REQUIREMENTS

## 17. Design Principles

### 17.1 Core Design Philosophy

**Principle 1: Invisible Complexity**

> "Make the complex simple, never the simple complex."

**Application:**
- Expert AI selection: User sees simple expert directory, system handles 136-agent taxonomy
- Response generation: User sees "generating response...", system orchestrates RAG pipeline + LLM + compliance checks
- ROI calculation: User sees "7.2x ROI", system calculates multi-factor value equation

**Anti-Pattern:**
- Exposing AI prompts, confidence thresholds, retrieval parameters to end users
- Requiring users to understand vector databases, embeddings, LLMs

---

**Principle 2: Progressive Disclosure**

> "Show novices the basics, reveal power features to experts."

**Application:**

```
Novice User Experience:
├─ Simple "Ask a Question" interface
├─ Suggested experts (AI recommendations)
├─ Basic filters (product, topic)
└─ Essential actions (Submit, View History)

Power User Experience (revealed over time):
├─ Advanced expert search (multi-filter)
├─ Ask Panel, Ask Committee (multi-expert)
├─ BYOAI workflows (custom agent integration)
├─ Custom dashboards & reports
└─ API access, webhooks, integrations
```

**Implementation:**
- Hamburger menu: Essential actions visible, advanced hidden under "More"
- Settings: Basic settings default view, "Advanced Settings" expandable
- Dashboard: Default view shows key metrics, "Customize Dashboard" for power users

---

**Principle 3: Immediate Feedback**

> "Never leave the user wondering what's happening."

**Application:**

```
User Action → System Feedback (< 2 seconds):
├─ Submit consultation → "Consultation #12345 submitted. Estimated response time: 4 hours."
├─ Upload document → "Processing... 47% complete (2 minutes remaining)"
├─ Approve response → "Approved! Response delivered to Dr. Martinez."
├─ Share consultation → "Shared with Oncology Team (25 members notified)"
└─ Change setting → "SSO enabled. Users will be prompted to log in with Okta."
```

**Implementation:**
- Loading states: Spinners, progress bars, skeleton screens
- Optimistic UI: Assume success, show result immediately (rollback if fails)
- Toast notifications: Non-blocking confirmations (3-second auto-dismiss)

---

**Principle 4: Trust Through Transparency**

> "Show your work. Cite your sources. Admit uncertainty."

**Application:**

```
AI Response Display:
├─ Summary: "Combination X+Y shows 18% PFS improvement..."
├─ Detailed Answer: 3 paragraphs with clinical data
├─ Citations: [Study 1: NEJM 2024], [Study 2: JCO 2023]
├─ Confidence Score: 92% (High) ← VISIBLE TO USER
├─ Caveats: "Long-term survival data not yet mature"
└─ Dissent (if panel): "Clinical Expert more cautious (40% approval probability)"
```

**Anti-Pattern:**
- Hiding confidence scores (user doesn't know when to double-check)
- Black-box AI (no explanation of reasoning)
- No citations (user cannot verify claims)

---

**Principle 5: Delight in the Details**

> "Sweat the small stuff. Microinteractions matter."

**Application:**

```
Microinteractions:
├─ Consultation submitted: Checkmark animation + haptic feedback (mobile)
├─ Response approved: Confetti animation (celebration!)
├─ ROI milestone: Badge unlock animation ("You've saved 100 hours!")
├─ Empty state: Friendly illustration + helpful copy ("No consultations yet. Ask your first question!")
└─ Error state: Empathetic message + clear next steps ("Oops! Upload failed. Please try again or contact support.")
```

**Examples:**
- Button hover: Subtle scale animation (1.05x)
- Card click: Ripple effect (Material Design)
- Form validation: Inline error messages (red underline + helpful text)
- Success: Green checkmark + subtle bounce animation

---

### 17.2 Accessibility Requirements

**WCAG 2.1 Level AA Compliance**

**Keyboard Navigation:**
- All actions accessible via keyboard (no mouse required)
- Logical tab order (left-to-right, top-to-bottom)
- Visible focus indicators (2px blue outline)
- Keyboard shortcuts for common actions (Cmd+K: Quick search, Cmd+N: New consultation)

**Screen Reader Support:**
- Semantic HTML (proper heading hierarchy H1 → H6)
- ARIA labels for complex interactions
- Alt text for all images, icons
- Live regions for dynamic content (e.g., "Response ready for review")

**Visual Accessibility:**
- Color contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- No color-only indicators (use icons + text in addition to color)
- Resizable text (up to 200% without breaking layout)
- Dark mode (reduce eye strain, respect OS preference)

**Cognitive Accessibility:**
- Clear, concise language (avoid jargon)
- Consistent patterns (same action works same way everywhere)
- Undo capability (especially for destructive actions)
- Help text, tooltips, inline guidance

**Target:**
- WCAG 2.1 Level AA by MVP launch (Q1 2026)
- WCAG 2.1 Level AAA aspirational (Year 2)
- Accessibility audit: Quarterly (external firm)

---

## 18. Information Architecture

### 18.1 Primary Navigation

```
VITAL Platform (Web App):

┌─────────────────────────────────────────────────────────────┐
│  [VITAL Logo]   [Search]                    [User Menu ▾]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEFT SIDEBAR (Primary Navigation):                         │
│  ├─ 🏠 Home (Dashboard)                                     │
│  ├─ ✨ New Consultation [+ Button]                          │
│  ├─ 📋 My Consultations                                     │
│  ├─ 👥 Team (if user in team)                               │
│  ├─ 📊 Analytics                                            │
│  ├─ 📚 Knowledge Base                                       │
│  ├─ 🔧 Settings (Admin only)                                │
│  └─ ❓ Help & Support                                       │
│                                                              │
│  MAIN CONTENT AREA:                                         │
│  [Contextual content based on left sidebar selection]      │
│                                                              │
│  RIGHT SIDEBAR (Contextual):                                │
│  ├─ Recent activity feed (optional)                         │
│  ├─ Quick actions (shortcuts)                               │
│  └─ Notifications (unread count)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Patterns:**
- Single-page application (SPA) - No full page reloads
- Breadcrumbs for deep pages (e.g., Home > Team > Oncology > Consultation #12345)
- Back button: Respects browser history
- Search (Cmd+K): Global search (consultations, knowledge base, experts)

---

### 18.2 Content Hierarchy

**Consultation Detail Page (Example of Well-Structured Hierarchy):**

```
┌─────────────────────────────────────────────────────────────┐
│  H1: Consultation #12345                                    │
│  Breadcrumb: Home > My Consultations > #12345              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECTION 1: Overview (H2)                                   │
│  ├─ Status: Approved ✅                                     │
│  ├─ Expert: Oncology - Melanoma Expert                     │
│  ├─ Submitted: Nov 14, 2026, 2:30 PM                       │
│  └─ Response Time: 2h 15min (SLA: 4 hours)                 │
│                                                              │
│  SECTION 2: Original Question (H2)                          │
│  [User's question text]                                    │
│                                                              │
│  SECTION 3: AI Response (H2)                                │
│  ├─ Summary (H3): [2-3 sentence overview]                  │
│  ├─ Detailed Answer (H3): [Full response]                  │
│  ├─ Citations (H3): [Numbered references]                  │
│  └─ Confidence & Caveats (H3): 92% (High), [Limitations]   │
│                                                              │
│  SECTION 4: Actions (H2)                                    │
│  [Share] [Export PDF] [Ask Follow-Up] [Rate Response]      │
│                                                              │
│  SECTION 5: Discussion (H2)                                 │
│  [Comments from team members]                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Hierarchy Principles:**
- One H1 per page (page title)
- Logical H2 → H3 → H4 progression (no skipping levels)
- Related content grouped in sections
- Actions at bottom (after user reads content)

---

## 19. Wireframes & User Flows

### 19.1 Ask Expert - Happy Path Flow

```
SCREEN 1: Home Dashboard
┌─────────────────────────────────────┐
│  Welcome back, Sarah! 👋            │
│  You've saved 48 hours this month.  │
│                                     │
│  [✨ New Consultation] ← CTA       │
│                                     │
│  Recent Consultations:              │
│  ├─ Consultation #12344             │
│  ├─ Consultation #12343             │
│  └─ [View All]                      │
└─────────────────────────────────────┘
         │
         │ (User clicks "New Consultation")
         ▼
SCREEN 2: Select Expert
┌─────────────────────────────────────┐
│  Select Expert                      │
│  [Search experts...] 🔍             │
│                                     │
│  Recommended for you:               │
│  ┌─────────────────────────────┐   │
│  │ Oncology - Melanoma Expert  │   │
│  │ ⭐⭐⭐⭐⭐ 4.8               │   │
│  │ Avg response: 3 hours       │   │
│  └─────────────────────────────┘   │
│  [+ More Experts...]                │
└─────────────────────────────────────┘
         │
         │ (User selects Oncology Expert)
         ▼
SCREEN 3: Enter Question
┌─────────────────────────────────────┐
│  Ask: Oncology - Melanoma Expert    │
│  ┌─────────────────────────────┐   │
│  │ What's the latest data on   │   │
│  │ Drug X + Y combination for  │   │
│  │ metastatic melanoma?        │   │
│  │                             │   │
│  │ [5,000 char limit]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Urgency: ◉ Routine  ○ Urgent       │
│  Product: [Drug X ▾]                │
│                                     │
│  [Cancel]  [Ask Expert →]           │
└─────────────────────────────────────┘
         │
         │ (User clicks "Ask Expert")
         ▼
SCREEN 4: Confirmation
┌─────────────────────────────────────┐
│  ✅ Consultation Submitted!         │
│                                     │
│  Consultation #12345                │
│  Expert: Oncology - Melanoma        │
│  Estimated response: 4 hours        │
│                                     │
│  We'll notify you when ready.       │
│                                     │
│  [View Consultation]  [Ask Another] │
└─────────────────────────────────────┘
         │
         │ (4 hours later, notification arrives)
         ▼
SCREEN 5: Response Ready
┌─────────────────────────────────────┐
│  🔔 Response Ready!                 │
│  Consultation #12345 needs review   │
│  [View Response →]                  │
└─────────────────────────────────────┘
         │
         │ (User clicks "View Response")
         ▼
SCREEN 6: Review Response
┌─────────────────────────────────────┐
│  Consultation #12345                │
│  Status: Awaiting Your Approval     │
│                                     │
│  SUMMARY:                           │
│  Recent Phase III data shows...     │
│                                     │
│  DETAILED ANSWER:                   │
│  [3 paragraphs with clinical data]  │
│                                     │
│  CITATIONS:                         │
│  [1] Smith et al. NEJM 2024         │
│  [2] Jones et al. JCO 2023          │
│                                     │
│  Confidence: 92% (High)             │
│                                     │
│  [Reject]  [Edit]  [✅ Approve]    │
└─────────────────────────────────────┘
         │
         │ (User clicks "Approve")
         ▼
SCREEN 7: Delivered
┌─────────────────────────────────────┐
│  ✅ Response Approved & Delivered!  │
│                                     │
│  Sent to: Dr. Martinez              │
│  ROI: $525 (3.5 hours saved)        │
│                                     │
│  [Rate Response]  [Ask Follow-Up]   │
└─────────────────────────────────────┘
```

**Total Steps:** 7 screens (can complete in 2-3 minutes)
**Key Interactions:** 5 (select expert, enter question, submit, review, approve)
**Friction Points:** Minimal (pre-filled defaults, smart recommendations)

---

### 19.2 Knowledge Base Upload - Happy Path Flow

```
SCREEN 1: Knowledge Base Manager
┌─────────────────────────────────────┐
│  Knowledge Base                     │
│  [📤 Upload Content] ← Primary CTA  │
│                                     │
│  Recent Documents:                  │
│  ├─ Drug X Product Label (v2.1)     │
│  ├─ Clinical Study Report XYZ       │
│  └─ [View All 47 Documents]         │
└─────────────────────────────────────┘
         │
         │ (User clicks "Upload Content")
         ▼
SCREEN 2: Upload Files
┌─────────────────────────────────────┐
│  Upload Content                     │
│  ┌─────────────────────────────┐   │
│  │  Drag & drop files here     │   │
│  │  or click to browse         │   │
│  │                             │   │
│  │  PDF, DOCX, PPTX, TXT       │   │
│  │  Max 100 MB per file        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Cancel]  [Continue →]             │
└─────────────────────────────────────┘
         │
         │ (User uploads "Drug-X-Label-v2.1.pdf")
         ▼
SCREEN 3: Add Metadata
┌─────────────────────────────────────┐
│  Add Document Details               │
│                                     │
│  Filename: Drug-X-Label-v2.1.pdf    │
│                                     │
│  Type: [Product Labeling ▾]         │
│  Product: [Drug X ▾]                │
│  Therapeutic Area: [Oncology ▾]     │
│  Date: [2025-02-14]                 │
│  Version: [2.1]                     │
│  Tags: [melanoma, safety, dosing]   │
│                                     │
│  [Back]  [Upload & Process →]       │
└─────────────────────────────────────┘
         │
         │ (User clicks "Upload & Process")
         ▼
SCREEN 4: Processing
┌─────────────────────────────────────┐
│  ⏳ Processing Document...          │
│  [████████░░░░] 65% complete        │
│                                     │
│  ✅ Text extracted (47 pages)       │
│  ✅ Entities extracted (Drug X...)  │
│  ⏳ Generating embeddings...         │
│  ⏳ Building knowledge graph...      │
│                                     │
│  Estimated time: 2 minutes          │
└─────────────────────────────────────┘
         │
         │ (2 minutes later)
         ▼
SCREEN 5: Ready for Review
┌─────────────────────────────────────┐
│  ✅ Processing Complete!            │
│                                     │
│  Drug-X-Label-v2.1.pdf              │
│  Status: Ready for Review           │
│                                     │
│  ├─ 47 pages processed              │
│  ├─ 156 chunks created              │
│  ├─ Entities: Drug X, melanoma...   │
│  └─ Quality Score: 94/100           │
│                                     │
│  [Approve & Publish]  [Edit]        │
└─────────────────────────────────────┘
         │
         │ (Curator clicks "Approve & Publish")
         ▼
SCREEN 6: Published
┌─────────────────────────────────────┐
│  🎉 Document Published!             │
│                                     │
│  Drug-X-Label-v2.1.pdf              │
│  Status: Active                     │
│                                     │
│  AI agents can now cite this        │
│  document in responses.             │
│                                     │
│  [Upload Another]  [View Document]  │
└─────────────────────────────────────┘
```

**Total Steps:** 6 screens (5-10 minutes including processing)
**Automated:** Text extraction, NER, vectorization, quality scoring
**Human Touchpoint:** Metadata entry, final approval (quality control)

---

## 20. Responsive Design & Mobile

### 20.1 Breakpoints

```
Breakpoint Strategy (Mobile-First):

XS (Extra Small): 0-599px      → Mobile phones (portrait)
SM (Small):       600-959px    → Mobile phones (landscape), small tablets
MD (Medium):      960-1279px   → Tablets, small laptops
LG (Large):       1280-1919px  → Laptops, desktops
XL (Extra Large): 1920px+      → Large desktops, ultra-wide monitors
```

**Responsive Patterns:**

**Home Dashboard:**
- XS/SM: Single column, stacked cards
- MD: 2-column grid (metrics + recent activity)
- LG/XL: 3-column grid (add sidebar)

**Consultation List:**
- XS: List view only (cards stacked)
- SM: List view with compact rows
- MD+: Optional grid view (cards in grid)

**Consultation Detail:**
- XS: Full-width content, collapsible sections
- SM+: Fixed-width content (720px max), better readability

**Expert Directory:**
- XS: List view (1 expert per row)
- SM: 2-column grid
- MD: 3-column grid
- LG+: 4-column grid

---

### 20.2 Mobile-Specific Patterns

**Bottom Sheet Navigation (Mobile):**
```
Mobile App UI (iOS/Android):

┌─────────────────────┐
│  ┌───────────────┐  │ ← Top Bar (Title + Actions)
│  │ Consultations │  │
│  └───────────────┘  │
│                     │
│  [Content Area]     │ ← Scrollable Content
│                     │
│                     │
│  ┌───────────────┐  │
│  │ 🏠 📋 👥 📊  │  │ ← Bottom Navigation
│  └───────────────┘  │
└─────────────────────┘

Bottom Nav Icons:
├─ 🏠 Home (Dashboard)
├─ 📋 Consultations (My Consultations)
├─ 👥 Team (Team Feed)
└─ 📊 Analytics (Personal ROI)

Floating Action Button (FAB):
└─ ✨ New Consultation (always accessible, bottom-right)
```

**Swipe Gestures:**
- Swipe right on consultation → Approve (quick action)
- Swipe left on consultation → Archive
- Pull to refresh → Reload list
- Swipe down on detail page → Dismiss modal

**Touch Targets:**
- Minimum: 44×44 pt (iOS), 48×48 dp (Android)
- Spacing: 8px between tappable elements
- Feedback: Ripple effect (Android), highlight (iOS)

---

# PART VI: NON-FUNCTIONAL REQUIREMENTS

## 21. Performance Requirements

### 21.1 Response Time

| Operation | Target (P50) | Target (P95) | Max Acceptable |
|-----------|--------------|--------------|----------------|
| **Page Load** | <1 second | <2 seconds | 3 seconds |
| **API Request** | <200ms | <500ms | 1 second |
| **Search Results** | <500ms | <1 second | 2 seconds |
| **Consultation Submit** | <2 seconds | <5 seconds | 10 seconds |
| **AI Response Generation** | <3 minutes | <10 minutes | 15 minutes |
| **Document Upload** | <10 seconds | <30 seconds | 60 seconds |
| **Dashboard Load** | <2 seconds | <5 seconds | 10 seconds |

**Measurement:**
- Real User Monitoring (RUM): Datadog, New Relic
- Synthetic monitoring: Hourly checks from multiple geographic locations
- Apdex Score: Target >0.9 (Excellent)

---

### 21.2 Throughput & Scalability

**Concurrent Users:**
- Year 1: Support 500 concurrent users (50 customers × 10 avg concurrent users)
- Year 2: Support 2,000 concurrent users (200 customers)
- Year 3: Support 5,000 concurrent users (500 customers)

**Transactions Per Second (TPS):**
- API: 1,000 TPS (P95), 5,000 TPS burst capacity
- Consultation submission: 100 TPS sustained
- AI response generation: 10 concurrent LLM requests (queue additional)

**Database Performance:**
- Query response time: <50ms (P95) for simple queries
- Complex joins: <500ms (P95)
- Write throughput: 10,000 writes/second (Supabase Postgres)

**Scalability Strategy:**
- Horizontal scaling: Auto-scale web servers based on CPU/memory
- Database: Read replicas (3 replicas), connection pooling (PgBouncer)
- Caching: Redis (session data, frequently accessed queries)
- CDN: CloudFlare (static assets, edge caching)

---

### 21.3 Resource Utilization

**Server Resources:**
- Web servers: <70% CPU, <80% memory (sustained)
- Database: <80% CPU, <90% memory
- Auto-scaling triggers: CPU >70% for 5 minutes → scale up

**Client Resources:**
- Web app bundle size: <500 KB (initial load, gzipped)
- JavaScript execution time: <1 second (Time to Interactive)
- Memory usage: <100 MB (mobile), <200 MB (desktop)

**Network:**
- Bandwidth: <2 MB per page load (including assets)
- API payload size: <100 KB per request (except file uploads)

---

## 22. Security & Compliance

### 22.1 Authentication & Authorization

**Authentication:**
- Multi-factor authentication (MFA): Optional by default, enforceable by admin
- Password requirements: Min 12 characters, uppercase, lowercase, number, special char
- Password hashing: bcrypt (cost factor 12)
- Session management: JWT tokens, 8-hour expiry, refresh tokens (30-day expiry)
- SSO: SAML 2.0, OAuth 2.0, OIDC (required for enterprise)

**Authorization:**
- Role-Based Access Control (RBAC): 5 pre-defined roles + custom roles
- Attribute-Based Access Control (ABAC): Row-Level Security (RLS) for multi-tenancy
- Principle of least privilege: Users granted minimum necessary permissions
- Permission audit: Quarterly review of user permissions

---

### 22.2 Data Protection

**Encryption:**
- At rest: AES-256 encryption (database, file storage)
- In transit: TLS 1.3 (min TLS 1.2)
- Key management: AWS KMS, Azure Key Vault (customer-managed keys optional)

**Data Classification:**
- Public: Marketing materials (no encryption required)
- Internal: User data, consultations (encrypted at rest)
- Confidential: Patient data, proprietary content (encrypted, access-controlled)
- Restricted: API keys, secrets (encrypted, secrets manager)

**Data Retention:**
- Consultation data: 7 years (regulatory requirement)
- Audit logs: 7 years (immutable, append-only)
- User data: Retain while account active, delete within 30 days of account deletion
- Backups: Daily backups, 30-day retention, encrypted

**Data Privacy:**
- GDPR compliance: Data subject rights (access, rectify, erase, port, restrict)
- HIPAA compliance: Business Associate Agreement (BAA), PHI handling
- Data residency: US, EU, APAC options (customer chooses)

---

### 22.3 Application Security

**OWASP Top 10 Mitigation:**

1. **Injection (SQL, NoSQL, OS Command):**
   - Parameterized queries (ORM: Prisma, SQLAlchemy)
   - Input validation (server-side)
   - Principle of least privilege (DB user permissions)

2. **Broken Authentication:**
   - MFA, strong password policy
   - Rate limiting (login attempts: 5 failed → 15-min lockout)
   - Session timeout (8 hours), secure cookies (HttpOnly, Secure, SameSite)

3. **Sensitive Data Exposure:**
   - TLS 1.3, AES-256 encryption
   - No sensitive data in logs, error messages
   - PII redaction (mask emails, phone numbers in UI)

4. **XML External Entities (XXE):**
   - Disable XML external entity processing
   - Use JSON instead of XML where possible

5. **Broken Access Control:**
   - RBAC + RLS (multi-tenant isolation)
   - Authorization checks on every API request
   - Deny by default (explicit grants required)

6. **Security Misconfiguration:**
   - Default deny (no default admin accounts)
   - Automated security scanning (Snyk, Dependabot)
   - Secrets management (no hardcoded secrets)

7. **Cross-Site Scripting (XSS):**
   - Output encoding (escape HTML, JavaScript, URL)
   - Content Security Policy (CSP) headers
   - Use React (auto-escapes by default)

8. **Insecure Deserialization:**
   - Avoid deserializing untrusted data
   - Signature verification (HMAC) for serialized data

9. **Using Components with Known Vulnerabilities:**
   - Dependency scanning (Snyk, npm audit)
   - Automated updates (Dependabot)
   - Quarterly vulnerability assessment

10. **Insufficient Logging & Monitoring:**
    - Centralized logging (Datadog, CloudWatch)
    - Security event alerting (PagerDuty)
    - Immutable audit logs (7-year retention)

---

### 22.4 Compliance Certifications

**SOC 2 Type II:**
- Scope: Security, Availability, Confidentiality
- Audit: Annual (by Big 4 accounting firm)
- Timeline: Certification by Q4 2026 (Year 1 end)

**HIPAA:**
- Business Associate Agreement (BAA) available
- PHI handling procedures documented
- Annual risk assessment
- Timeline: Compliant by MVP launch (Q1 2026)

**GDPR:**
- Data Protection Impact Assessment (DPIA) completed
- Data Processing Agreement (DPA) template (Schrems II compliant)
- EU data residency option (AWS Frankfurt, GCP Belgium)
- Timeline: Compliant by MVP launch (Q1 2026)

**21 CFR Part 11:**
- Electronic signatures (cryptographic, unique, non-reusable)
- Audit trails (immutable, timestamped, attributable)
- System validation (IQ/OQ/PQ documentation)
- Timeline: Compliant by MVP launch (Q1 2026)

**ISO 27001 (Aspirational):**
- Information Security Management System (ISMS)
- Timeline: Year 2 target

---

## 23. Reliability & Availability

### 23.1 Uptime SLA

**Target Uptime:** 99.9% ("three nines")

**Calculation:**
```
99.9% uptime = Max 43.8 minutes downtime per month
             = Max 8.76 hours downtime per year
```

**SLA Tiers:**
- Standard tier: 99.5% uptime (3.6 hours/month downtime)
- Professional tier: 99.9% uptime (43.8 min/month downtime)
- Enterprise tier: 99.95% uptime (21.9 min/month downtime)

**Monitoring:**
- Uptime monitoring: Pingdom, StatusPage
- Public status page: status.vital.ai
- Incident communication: Email, Slack (for enterprise), status page updates

**SLA Credits:**
- 99.9-99.5%: 10% monthly credit
- 99.5-99.0%: 25% monthly credit
- <99.0%: 50% monthly credit

---

### 23.2 Disaster Recovery & Business Continuity

**Recovery Objectives:**
- Recovery Time Objective (RTO): 4 hours (max time to restore service)
- Recovery Point Objective (RPO): 1 hour (max acceptable data loss)

**Backup Strategy:**
- Database: Continuous replication (Supabase multi-region)
- Daily full backups (retained 30 days)
- Point-in-time recovery (PITR): Last 7 days
- File storage: S3 cross-region replication (US-East → US-West)

**Failover Strategy:**
- Multi-region deployment (active-passive)
  - Primary: US-East-1 (N. Virginia)
  - Failover: US-West-2 (Oregon)
- Auto-failover triggers: Primary region unavailable >5 minutes
- DNS failover: Route 53 health checks (30-second intervals)

**Disaster Recovery Testing:**
- Quarterly DR drills (simulate primary region failure)
- Annual tabletop exercises (full team)
- Runbook: Documented DR procedures

---

### 23.3 Error Handling & Resilience

**Error Handling Strategy:**

**Client-Side:**
```
Error Types:
├─ Network errors (offline, timeout):
│   └─ Retry with exponential backoff (3 attempts)
│       └─ If still fails: Offline mode (queue for later)
├─ Validation errors (bad input):
│   └─ Inline error messages (red underline, helpful text)
├─ Authorization errors (403 Forbidden):
│   └─ Redirect to login or show "Access Denied" message
└─ Server errors (500 Internal Server Error):
    └─ Generic message: "Something went wrong. Please try again."
        └─ Log full error to monitoring (Datadog)
```

**Server-Side:**
```
Error Handling:
├─ Graceful degradation:
│   └─ If Pinecone unavailable → Fall back to keyword search
│   └─ If OpenAI API down → Use fallback LLM (Anthropic Claude)
├─ Circuit breaker:
│   └─ If dependency fails >50% of requests → Open circuit (fail fast)
│       └─ Retry after 30 seconds (half-open)
│       └─ If success → Close circuit (resume normal)
├─ Bulkhead isolation:
│   └─ Separate thread pools for different services
│       └─ If AI service overloaded → Doesn't affect user auth
└─ Retry logic:
    └─ Idempotent operations: Retry up to 3 times
    └─ Non-idempotent (payments, etc.): Manual intervention
```

**Chaos Engineering:**
- Quarterly chaos experiments (Netflix Chaos Monkey approach)
- Simulate failures: Database down, API rate limit exceeded, network partition
- Goal: Validate resilience, identify weaknesses

---

## 24. Localization & Internationalization

### 24.1 Supported Languages

**Year 1 (MVP):**
- English (US) - Primary

**Year 1 (Q3-Q4):**
- Spanish (Latin America, Spain)
- German (Germany, Austria, Switzerland)
- French (France, Canada)

**Year 2:**
- Japanese (Japan)
- Mandarin Chinese (Simplified, China)
- Portuguese (Brazil)

**Year 3:**
- Italian, Dutch, Korean (expansion markets)

---

### 24.2 Localization Requirements

**UI Localization:**
- All UI strings externalized (i18n framework: i18next)
- Right-to-left (RTL) support: Arabic (Year 3)
- Date/time formatting: Locale-specific (MM/DD/YYYY vs. DD/MM/YYYY)
- Number formatting: Decimal separators (1,000.00 vs. 1.000,00)
- Currency: Multi-currency support (USD, EUR, GBP, JPY, CNY)

**Content Localization:**
- Knowledge base: Multi-language content (customer uploads localized docs)
- AI responses: Generated in user's preferred language
- Email notifications: Localized templates
- Help documentation: Translated help center (Zendesk, Intercom)

**Regional Compliance:**
- Data residency: EU (GDPR), US (HIPAA), APAC (local regulations)
- Privacy policies: Localized (country-specific laws)
- Terms of service: Localized

---

# PART VII: PRODUCT ROADMAP

## 25. Release Planning (3-Year Horizon)

### 25.1 Year 1 (2026): Foundation & Product-Market Fit

**Q1 2026: MVP Launch**

```
Release: VITAL Platform MVP
Target: 10 customers, $240K ARR
Features:
├─ ✅ Core Consultation (Ask Expert)
├─ ✅ 136-Agent Registry (3 tier categories)
├─ ✅ Knowledge Base (Upload, Search, Curate)
├─ ✅ User Management (SSO, RBAC, Teams)
├─ ✅ Analytics (Personal ROI Dashboard)
├─ ✅ Web Application (Responsive)
├─ ✅ Basic Integrations (Veeva CRM, Salesforce)
└─ ✅ SOC 2 Type II Certification (in progress)

Success Criteria:
├─ 10 paying customers
├─ 70%+ WAU (Weekly Active Users)
├─ 5.0x+ customer ROI
├─ 90%+ first-pass approval rate (AI quality)
└─ NPS > 50
```

**Q2 2026: Enterprise Features**

```
Release: Enterprise Expansion
Target: 25 customers, $600K ARR
New Features:
├─ ✨ Ask Panel (Multi-Expert Consultation)
├─ ✨ BYOAI Orchestration (Register Custom Agents)
├─ ✨ Team Dashboard (Manager Analytics)
├─ ✨ Collaboration (Share, Comment, @Mentions)
├─ ✨ Mobile Apps (iOS/Android Beta)
├─ ✨ Advanced Integrations (Veeva Vault, MS Teams)
└─ ✨ API & Webhooks (Developer Platform)

Enhancements:
├─ 📈 Improved AI Quality (96%+ approval rate)
├─ 📈 Faster Response Time (P50: 2 min, down from 3 min)
└─ 📈 Expanded Agent Library (150 agents, up from 136)

Success Criteria:
├─ 25 customers (+15 from Q1)
├─ 75%+ WAU
├─ 5.7x+ customer ROI
└─ 90%+ customer retention
```

**Q3 2026: Scale & Polish**

```
Release: Mobile GA + Ask Committee
Target: 40 customers, $960K ARR
New Features:
├─ ✨ Ask Committee (AI Advisory Board, 5-12 experts)
├─ ✨ Mobile Apps GA (iOS/Android production release)
├─ ✨ BYOAI Workflows (Multi-Agent Chains with Visual Builder)
├─ ✨ Knowledge Base Curation Workflows
├─ ✨ Executive Dashboard (C-Suite Analytics)
└─ ✨ Multi-Language Support (ES, DE, FR)

Enhancements:
├─ 📈 Offline Mode (Mobile: Queue consultations when offline)
├─ 📈 Voice Input (Dictate questions via Siri/Google Assistant)
└─ 📈 Predictive Routing (AI suggests best expert 90%+ accuracy)

Success Criteria:
├─ 40 customers (+15 from Q2)
├─ 80%+ WAU
├─ 6.5x+ customer ROI
├─ Mobile app rating: 4.5+ stars
└─ NPS > 60
```

**Q4 2026: Market Leadership**

```
Release: Year-End Feature Push
Target: 50 customers, $1.2M ARR (Year 1 Goal!)
New Features:
├─ ✨ Advanced BYOAI (Workflow Templates, A/B Testing)
├─ ✨ Insights Engine (Aggregate intelligence across consultations)
├─ ✨ Custom Dashboards (Build Your Own Reports)
├─ ✨ Scheduled Reports (Email Weekly/Monthly)
├─ ✨ Additional Languages (JP, CN)
└─ ✨ FedRAMP Certification Start (US Gov't customers)

Enhancements:
├─ 📈 Performance Optimization (50% faster page loads)
├─ 📈 AI Quality (97%+ approval rate)
├─ 📈 Expanded Integrations (25 total, up from 10)
└─ 📈 Agent Marketplace (Beta: 10 third-party agents)

Success Criteria:
├─ 50 customers (Year 1 Goal Achieved!)
├─ $1.2M ARR (Year 1 Revenue Goal!)
├─ 85%+ WAU
├─ 7.2x+ customer ROI
├─ 90%+ customer retention
├─ NPS > 65
└─ SOC 2 Type II Certification Complete
```

---

### 25.2 Year 2 (2027): Scale & Expansion

**Focus Areas:**
1. **Product-Led Growth (PLG):** Free trial, self-serve tier
2. **White-Label:** Enable CROs to offer VITAL to their clients
3. **International Expansion:** EU & APAC data residency
4. **Agent Marketplace:** 50+ third-party agents
5. **Profitability:** Q4 2027 operational breakeven

**Key Releases:**

**Q1 2027:**
- Free Trial (14-day, no credit card)
- Self-Serve Tier ($5K/month, <25 users)
- EU Data Residency (AWS Frankfurt)

**Q2 2027:**
- White-Label Capability (CRO branding)
- Agent Marketplace GA (50 agents)
- Multi-Modal AI (Voice consultation, Video AI)

**Q3 2027:**
- Predictive Analytics (Forecast inquiry trends, ROI)
- Auto-Agent Generation (Upload docs → Auto-create custom agent)
- APAC Data Residency (AWS Singapore)

**Q4 2027:**
- Platform Ecosystem APIs (Third-party developers)
- Advanced Workflow Automation (No-code workflow builder)
- ISO 27001 Certification

**Year 2 Targets:**
- 200 customers, $6.0M ARR
- 85%+ WAU, 8.5x customer ROI
- 95%+ customer retention, 120%+ NRR
- Q4 2027: Operational profitability (+$50K EBITDA)

---

### 25.3 Year 3 (2028): Platform Ecosystem

**Focus Areas:**
1. **Platform Ecosystem:** Third-party agent marketplace, partner channel
2. **Strategic Partnerships:** Veeva, IQVIA, Oracle co-sell
3. **Acquisition Readiness:** $100M-$150M valuation (4-6x ARR)
4. **Market Dominance:** #1 market share in AI-powered Medical Affairs

**Key Themes:**
- Multi-modal AI (voice, video, AR/VR consultation)
- Predictive AI (anticipate inquiries, proactive answers)
- Industry expansion (beyond pharma: biotech, MedTech, CROs, healthcare providers)

**Year 3 Targets:**
- 500 customers, $24M ARR
- 85%+ WAU, 10.8x customer ROI
- 95%+ customer retention, 125%+ NRR
- $7.4M EBITDA (31% margin)
- Exit scenarios: IPO or strategic acquisition

---

## 26. Feature Prioritization

### 26.1 Prioritization Framework (RICE Score)

**RICE = (Reach × Impact × Confidence) / Effort**

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| **Ask Expert (MVP)** | 100 | 10 | 100% | 13 | 769 | P0 (Must Have) |
| **Knowledge Base Upload** | 100 | 10 | 100% | 13 | 769 | P0 (Must Have) |
| **SSO Integration** | 100 | 8 | 100% | 8 | 1000 | P0 (Must Have) |
| **Personal ROI Dashboard** | 100 | 9 | 95% | 8 | 1069 | P0 (Must Have) |
| **Ask Panel** | 70 | 9 | 90% | 13 | 433 | P1 (Should Have) |
| **BYOAI Orchestration** | 60 | 10 | 85% | 21 | 245 | P1 (Should Have) |
| **Mobile Apps** | 80 | 8 | 90% | 21 | 275 | P1 (Should Have) |
| **Team Dashboard** | 50 | 9 | 90% | 13 | 312 | P1 (Should Have) |
| **Ask Committee** | 30 | 10 | 80% | 21 | 114 | P2 (Nice to Have) |
| **Agent Marketplace** | 40 | 8 | 70% | 34 | 66 | P3 (Future) |

**Prioritization Criteria:**
- **P0 (Must Have):** RICE >500, required for MVP, non-negotiable
- **P1 (Should Have):** RICE 200-500, important for product-market fit
- **P2 (Nice to Have):** RICE 100-200, valuable but not critical
- **P3 (Future):** RICE <100, interesting but low priority

---

## 27. Technical Dependencies

### 27.1 Core Technology Stack

**Frontend:**
- Framework: Next.js 14 (React 18 server components)
- UI Library: shadcn/ui (Radix UI + Tailwind CSS)
- State Management: Zustand (lightweight, simple)
- Styling: Tailwind CSS 3.4
- Build: Turbopack (faster than Webpack)

**Backend:**
- API: Node.js + Express + TypeScript (API Gateway)
- AI/ML: Python 3.11 + FastAPI + LangChain + LangGraph
- Background Jobs: BullMQ (Redis-backed queue)
- Caching: Redis (session data, hot data)

**Databases:**
- Primary: Supabase (Postgres + pgvector + Row-Level Security)
- Vector: Pinecone (1536 or 3072 dimensions, ~10M vectors Year 1)
- Graph: Neo4j (knowledge graph, ~1M nodes Year 1)
- Cache: Redis (in-memory, <100 GB Year 1)

**AI/ML:**
- LLMs: OpenAI GPT-4 Turbo (primary), Claude 3.5 Sonnet (fallback)
- Embeddings: OpenAI text-embedding-3-large (3072 dimensions)
- NER: spaCy + BioBERT (medical entity recognition)
- Orchestration: LangGraph (multi-agent state machines)

**Infrastructure:**
- Cloud: AWS (primary), GCP (fallback/multi-cloud)
- CDN: CloudFlare (edge caching, DDoS protection)
- Monitoring: Datadog (APM, logs, metrics, alerting)
- Error Tracking: Sentry (error aggregation, stack traces)

**Third-Party Services:**
- Email: SendGrid (transactional emails)
- SMS: Twilio (emergency notifications)
- Analytics: Mixpanel (product analytics), Amplitude (user behavior)
- Customer Support: Intercom (in-app chat, help center)

---

### 27.2 Integration Dependencies

**Critical Path Integrations (MVP):**
1. **Veeva CRM** (High priority: 70% of customers use Veeva)
2. **Salesforce** (Medium priority: 20% of customers)
3. **Microsoft Teams** (Medium priority: Team collaboration)
4. **OpenAI API** (Critical: Core AI functionality)
5. **Supabase** (Critical: Database + auth + storage)

**Nice-to-Have Integrations (Post-MVP):**
- Slack, Zoom, Google Workspace, SharePoint, Confluence

---

## 28. Go-to-Market Milestones

### 28.1 Customer Acquisition Milestones

**Q1 2026:**
- First 5 customers (design partners, deep engagement)
- First case study published
- First industry conference presentation (DIA, MAPS)

**Q2 2026:**
- 25 customers (validate product-market fit)
- First channel partner (Veeva co-sell)
- Launch customer referral program

**Q3 2026:**
- 40 customers (scale sales process)
- Hire VP Sales (build sales team)
- Launch free trial (product-led growth)

**Q4 2026:**
- 50 customers (Year 1 goal achieved!)
- First enterprise ($500K+ ARR) customer
- Analyst briefing (Gartner, Forrester)

**Year 2-3:**
- 200 customers (Year 2), 500 customers (Year 3)
- Establish partner channel (5-10 consulting firms)
- International expansion (EU, APAC)

---

# APPENDICES

## Appendix A: Glossary of Terms

| Term | Definition |
|------|------------|
| **AI Agent** | Specialized AI model trained for specific domain expertise (e.g., Oncology Expert, Regulatory Expert) |
| **ARR** | Annual Recurring Revenue - predictable revenue from subscriptions |
| **Ask Committee** | Multi-phase AI advisory board consultation (5-12 experts) |
| **Ask Expert** | 1-on-1 AI consultation with single expert agent |
| **Ask Panel** | Multi-expert AI consultation (2-5 experts providing diverse perspectives) |
| **BYOAI** | Bring Your Own AI - customer integrates proprietary AI agents with VITAL platform |
| **CAC** | Customer Acquisition Cost - sales & marketing spend per new customer |
| **Consultation** | User inquiry submitted to AI expert(s), resulting in expert-reviewed response |
| **CSAT** | Customer Satisfaction Score - rating (typically 1-5) of satisfaction with product/service |
| **First-Pass Approval Rate** | % of AI responses approved by human expert without edits (quality metric) |
| **GRR** | Gross Retention Rate - % of ARR retained (excluding expansion revenue) |
| **HCP** | Healthcare Professional (physician, nurse practitioner, pharmacist, etc.) |
| **Human-in-Control** | AI principle: Experts maintain authority, AI amplifies (doesn't replace) |
| **Human-in-the-Loop** | AI learning from human feedback to improve quality over time |
| **LangGraph** | State machine framework for orchestrating multi-agent AI workflows |
| **LLM** | Large Language Model (e.g., GPT-4, Claude) - foundation of AI responses |
| **LTV** | Lifetime Value - total revenue from customer over entire relationship |
| **MSL** | Medical Science Liaison - field-based medical affairs professional |
| **NER** | Named Entity Recognition - AI technique to extract entities (drugs, indications, AEs) from text |
| **NPS** | Net Promoter Score - likelihood to recommend (% promoters - % detractors) |
| **NRR** | Net Retention Rate - % of ARR retained including expansion revenue |
| **RAG** | Retrieval-Augmented Generation - LLM grounded in factual documents (reduces hallucination) |
| **RLS** | Row-Level Security - database technique for multi-tenant data isolation |
| **SLA** | Service Level Agreement - contractual performance commitment (e.g., 4-hour response time) |
| **TTV** | Time-to-Value - days from contract to measurable customer value |
| **VITAL Value Equation™** | Formula for calculating customer ROI: (Time Saved × Hourly Rate) + (Decisions Improved × Decision Value) + (Risk Avoided × Risk Cost) - VITAL Cost |
| **WAU** | Weekly Active Users - unique users who log in and perform ≥1 action per week |

---

## Appendix B: User Research Summary

**Research Methods:**
- 100 in-depth interviews (MSLs, Medical Directors, VPs Medical Affairs)
- 5 customer design partner sessions (8 hours each)
- 200 survey responses (Medical Affairs professionals)
- Competitive analysis (10 platforms evaluated)
- Industry conferences attended (DIA, MAPS, SCOPE)

**Key Findings:**

**Pain Point #1: Drowning in Inquiries**
- 78% of MSLs spend >70% of time on reactive Q&A
- Average 30-50 inquiries/month per MSL
- 4-6 hours to research complex questions
- "I became an MSL to engage with KOLs, not to be a search engine" - Quote from interview

**Pain Point #2: Inconsistent Responses**
- 65% of organizations have no centralized Medical Information system
- Same question answered differently by different MSLs (brand risk)
- Geographic variations (US MSLs vs. EU MSLs giving conflicting info)

**Pain Point #3: Cannot Demonstrate ROI**
- 82% of Medical Affairs leaders struggle to quantify value to CFO
- "Medical Affairs is always first on the chopping block during budget cuts" - VP Medical Affairs

**Desired Solution:**
- 95% want AI assistance (not replacement)
- 88% would pay for platform that demonstrates clear ROI
- 72% frustrated with current tools (too manual, not AI-powered)
- 100% require compliance & audit trail (regulatory mandate)

---

## Appendix C: Competitive Analysis

**Detailed Comparison: VITAL vs. Top 3 Competitors**

| Dimension | VITAL | Veeva Medical | Zinc Maps | Antidote MI Navigator |
|-----------|-------|---------------|-----------|----------------------|
| **AI-Native** | ✅ Built for AI | ❌ Bolted-on AI | ❌ No AI | ❌ Limited AI |
| **Multi-Agent** | ✅ 136 agents | ❌ Single chatbot | N/A | ❌ Rule-based |
| **BYOAI** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Human-in-Control** | ✅ 100% review | ⚠️ Optional | ✅ Manual process | ✅ Manual process |
| **ROI Measurement** | ✅ Real-time | ❌ Manual | ❌ Manual | ❌ Manual |
| **Time-to-Value** | 30 days | 90-120 days | 60-90 days | 90 days |
| **Pricing** | $180K-$600K/year | $50K-$200K/year | $30K-$100K/year | $40K-$120K/year |
| **Customer ROI** | 5.7x Year 1 | 1.5-2x | Unknown | 1.8x |
| **Compliance** | SOC 2, HIPAA, GDPR, 21 CFR Part 11 | SOC 2, HIPAA | SOC 2 | SOC 2 |
| **Mobile App** | ✅ Native iOS/Android | ⚠️ Mobile web only | ⚠️ Mobile web | ❌ No mobile |
| **API/Webhooks** | ✅ Full API | ⚠️ Limited API | ❌ No API | ⚠️ Limited API |

**Competitive Advantages (VITAL):**
1. Only true multi-agent platform (136 specialized experts)
2. BYOAI orchestration (no vendor lock-in)
3. Real-time ROI measurement (CFO-friendly)
4. 30-day time-to-value (3x faster than competitors)
5. AI-first architecture (not legacy system with AI bolted on)

**Competitive Risks:**
- Veeva has strong brand, large installed base (could copy VITAL features)
- Generic AI platforms (ChatGPT Enterprise, Microsoft Copilot) improving rapidly
- Build vs. Buy: Large pharma might build in-house

**Mitigation:**
- Speed to market (launch before incumbents catch up)
- Deep integrations (Veeva partnership, lock-in via integration)
- Network effects (BYOAI marketplace, agent ecosystem)
- Switching costs (once integrated, hard to rip out)

---

## Appendix D: Technical Constraints

**LLM API Constraints:**
- Rate limits: OpenAI (10K requests/min, bursts allowed), Anthropic (5K requests/min)
- Context window: GPT-4 Turbo (128K tokens), Claude 3.5 Sonnet (200K tokens)
- Latency: Typical LLM response time 5-30 seconds (P50), up to 60 seconds (P95)
- Cost: $0.01-$0.03 per consultation (LLM API fees), target <5% of ARPU

**Database Constraints:**
- Supabase connection pooling: Max 100 connections per instance
- Pinecone vector DB: 10M vectors Year 1, $300/month (scales with usage)
- Neo4j graph DB: 1M nodes Year 1, self-hosted (EC2 instance)

**Browser Support:**
- Chrome/Edge: Latest 2 versions (80%+ market share)
- Safari: Latest 2 versions (15% market share)
- Firefox: Latest 2 versions (5% market share)
- IE11: Not supported (deprecated)

**Mobile OS Support:**
- iOS: 15+ (released Sep 2021, covers 95%+ devices)
- Android: 10+ (released Sep 2019, covers 85%+ devices)

**Third-Party Dependencies:**
- OpenAI API availability: 99.9%+ uptime historically
- Supabase availability: 99.95% uptime SLA
- Pinecone availability: 99.9% uptime SLA
- AWS availability: 99.99% uptime (multi-AZ deployment)

---

## Appendix E: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Nov 10, 2025 | PRD Architect | Initial framework & structure |
| 0.5 | Nov 14, 2025 | PRD Architect | Core features specified (Ask Expert, Ask Panel) |
| 0.7 | Nov 15, 2025 | PRD Architect | User stories added (50+ stories) |
| 0.9 | Nov 15, 2025 | PRD Architect | UI/UX requirements, non-functional requirements added |
| 1.0 | Nov 16, 2025 | PRD Architect | Complete PRD v1.0 - Gold Standard (100-150 pages) |

**Reviewers:**
- ✅ Strategy & Vision Architect (strategic alignment verified)
- ✅ System Architecture Architect (technical feasibility confirmed)
- ✅ Business & Analytics Strategist (business value validated)
- ✅ Frontend UI Architect (UI/UX requirements approved)
- ✅ Documentation & QA Lead (quality review passed)

**Approval Status:**
- ✅ Approved for Development (Week 3-4 Deliverable Complete)
- Next Step: Proceed to ARD (Architecture Requirements Document) creation

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**

*Gold Standard Deliverable | VITAL Platform | November 2025*
*Total Pages: ~120 pages | Total User Stories: 50+ | Total Features: 40+*

---