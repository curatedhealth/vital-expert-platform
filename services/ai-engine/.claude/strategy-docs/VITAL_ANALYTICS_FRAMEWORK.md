# VITAL Platform - Analytics Framework & Success Metrics

**Version**: 1.0
**Date**: 2025-11-16
**Status**: 🏆 Gold Standard
**Owner**: Business & Analytics Strategist
**Classification**: Operational Strategy - Executive Level

---

## Document Control

| Field | Value |
|-------|-------|
| **Document Type** | Analytics Framework & KPI Definition |
| **Approver** | CEO / VP Product |
| **Review Cycle** | Monthly |
| **Last Updated** | 2025-11-16 |
| **Distribution** | Executive Team, Product, Engineering, Customer Success |

---

## Executive Summary

### The Analytics Philosophy

**"What gets measured gets managed. What gets managed gets improved."**

VITAL's analytics framework is built on a **hierarchical metrics pyramid**:

```
                    North Star Metric
                  (Hours of Genius Amplified)
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    Engagement       Business Value    Product Health
    (Usage KPIs)     (ROI KPIs)       (Quality KPIs)
           │               │               │
           └───────────────┼───────────────┘
                           ▼
              Operational Metrics (30+)
           (System Health, Costs, etc.)
```

---

### Metrics Overview

| Tier | # of Metrics | Purpose | Review Frequency |
|------|--------------|---------|------------------|
| **North Star** | 1 | Ultimate success measure | Monthly |
| **Primary KPIs** | 7 | Critical business/product health | Weekly |
| **Secondary KPIs** | 15 | Supporting indicators | Weekly |
| **Operational** | 30+ | System health, efficiency | Daily |
| **TOTAL** | **53+** | Comprehensive measurement | Mixed |

---

### Current Dashboard Status

| Dashboard | Status | Owner | Users |
|-----------|--------|-------|-------|
| **Executive Dashboard** | ✅ Live | CEO/Board | Executives |
| **Product Dashboard** | ✅ Live | VP Product | Product Team |
| **Customer Success Dashboard** | ✅ Live | VP CS | CS Team |
| **Engineering Dashboard** | ✅ Live | CTO | Engineering |
| **Sales Dashboard** | 🔄 In Progress | VP Sales | Sales Team |

---

## Table of Contents

### Part I: Metrics Hierarchy
1. [North Star Metric](#1-north-star-metric)
2. [Primary KPIs (Top 7)](#2-primary-kpis-top-7)
3. [Secondary KPIs (15 Supporting Metrics)](#3-secondary-kpis-15-supporting-metrics)
4. [Operational Metrics (30+)](#4-operational-metrics-30)

### Part II: Dashboard Specifications
5. [Executive Dashboard](#5-executive-dashboard)
6. [Product Dashboard](#6-product-dashboard)
7. [Customer Success Dashboard](#7-customer-success-dashboard)
8. [Engineering/Operations Dashboard](#8-engineeringoperations-dashboard)
9. [Sales & Marketing Dashboard](#9-sales--marketing-dashboard)

### Part III: Implementation
10. [Data Collection Strategy](#10-data-collection-strategy)
11. [Analytics Tools & Infrastructure](#11-analytics-tools--infrastructure)
12. [Reporting Cadence](#12-reporting-cadence)
13. [Alerts & Thresholds](#13-alerts--thresholds)

### Part IV: Measurement Playbook
14. [How to Measure Customer ROI](#14-how-to-measure-customer-roi)
15. [Cohort Analysis Framework](#15-cohort-analysis-framework)
16. [A/B Testing Methodology](#16-ab-testing-methodology)

### Appendices
- [Appendix A: Metrics Definitions (Complete)](#appendix-a-metrics-definitions-complete)
- [Appendix B: SQL Queries for Key Metrics](#appendix-b-sql-queries-for-key-metrics)
- [Appendix C: Dashboard Wireframes](#appendix-c-dashboard-wireframes)

---

# Part I: Metrics Hierarchy

## 1. North Star Metric

### 1.1 Definition

**North Star Metric**: **Hours of Human Genius Amplified**

**Formula**:
```
Hours Amplified = Σ (Consultations × Average Time Saved per Consultation)

Example (Year 1):
= 25,000 consultations × 2 hours saved each
= 50,000 hours of human genius amplified
```

---

### 1.2 Why This Metric?

**Alignment with Mission**:
- ✅ **Mission**: "Amplify human genius" → North Star directly measures this
- ✅ **Customer Value**: Time saved = direct value to customers
- ✅ **Platform Usage**: More consultations = more platform value
- ✅ **Scalability**: Shows impact as we grow (50K hours Year 1 → 500K hours Year 3)

**Properties of a Good North Star**:
- ✅ **Measurable**: Can track consultation count and time saved
- ✅ **Actionable**: Teams can influence this (more consultations, better agents)
- ✅ **Leading Indicator**: Predicts customer success, retention, expansion
- ✅ **Customer-Centric**: Reflects customer value, not vanity metric

---

### 1.3 Target Values

| Period | Consultations | Time Saved/Consultation | Hours Amplified | Growth |
|--------|---------------|------------------------|-----------------|--------|
| **Q1 2026** | 500 | 2.0 hours | 1,000 hours | - |
| **Q4 2026** | 6,250 | 2.0 hours | 12,500 hours | 12.5x |
| **Q4 2027** | 62,500 | 2.2 hours | 137,500 hours | 11x |
| **Q4 2028** | 250,000 | 2.5 hours | 625,000 hours | 4.5x |

**3-Year Target**: **625,000 hours of human genius amplified** (500x growth from Q1 2026)

---

### 1.4 How to Improve North Star

**Lever 1: Increase Consultations**
```
Drivers:
├─ More users (customer acquisition)
├─ Higher adoption (onboarding, training)
├─ More use cases (feature expansion)
└─ Better UX (faster, easier to use)

Tactics:
├─ Customer Success outreach (drive adoption)
├─ New features (Ask Panel, BYOAI)
├─ Marketing (internal customer campaigns)
└─ Product improvements (reduce friction)
```

**Lever 2: Increase Time Saved per Consultation**
```
Drivers:
├─ Better agent quality (more accurate, comprehensive answers)
├─ Faster response time (< 10 seconds → < 5 seconds)
├─ More complex use cases (high-value consultations)
└─ Better RAG (more relevant context)

Tactics:
├─ Agent improvement (fine-tuning, better prompts)
├─ Infrastructure optimization (reduce latency)
├─ Feature depth (Ask Panel for complex questions)
└─ Knowledge base expansion (more documents, better indexing)
```

---

## 2. Primary KPIs (Top 7)

These 7 KPIs are reviewed **weekly** by executive team and drive strategic decisions.

---

### KPI #1: Weekly Active Users (WAU)

**Definition**: Unique users with ≥1 consultation in the past 7 days

**Formula**:
```sql
SELECT COUNT(DISTINCT user_id)
FROM consultations
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND tenant_id = :tenant_id
```

**Why It Matters**:
- Measures engagement and product stickiness
- Leading indicator of retention and expansion
- Shows if users find value (engaged users = happy users)

**Targets**:
| Period | Total Users | WAU | WAU % | Interpretation |
|--------|-------------|-----|-------|----------------|
| **Q1 2026** | 100 | 60 | 60% | Good (pilot phase) |
| **Q4 2026** | 5,000 | 3,500 | 70% | Strong |
| **Q4 2027** | 25,000 | 20,000 | 80% | Excellent |
| **Q4 2028** | 75,000 | 60,000 | 80% | Mature product |

**Benchmarks**:
- 40-50%: Average SaaS product
- 60-70%: Good SaaS product
- 70-80%: Excellent SaaS product (VITAL target)

**How to Improve**:
- Better onboarding (get users to value faster)
- Email/Slack reminders (re-engage inactive users)
- New features (give users reasons to return)
- Customer Success outreach (drive adoption)

---

### KPI #2: Consultations per User per Week

**Definition**: Average weekly consultations per active user

**Formula**:
```
Consultations per User = Total Consultations (7 days) / WAU

Example:
= 10,000 consultations / 3,500 WAU
= 2.86 consultations per user per week
```

**Why It Matters**:
- Measures product depth (how much value users extract)
- High frequency = high value, high retention
- Drives North Star Metric (more consultations = more hours amplified)

**Targets**:
| Period | Consultations/User/Week | Interpretation |
|--------|------------------------|----------------|
| **Q1 2026** | 2.0 | Pilot (learning phase) |
| **Q4 2026** | 3.0 | Good adoption |
| **Q4 2027** | 4.5 | Strong usage |
| **Q4 2028** | 5.0 | Power user behavior |

**Benchmarks**:
- 1-2/week: Low usage (at-risk customers)
- 3-4/week: Good usage (healthy customers)
- 5+/week: Power users (advocates, champions)

**How to Improve**:
- Make consultations faster (reduce friction)
- Expand use cases (more reasons to consult)
- Improve quality (accurate answers → trust → more use)
- Integrate into workflows (Slack, email, API)

---

### KPI #3: Customer ROI (Measured)

**Definition**: Quantified ROI for each customer (value delivered vs. cost)

**Formula**:
```
Customer ROI = (Value Delivered - VITAL Cost) / VITAL Cost

Value Delivered = (Time Saved × Hourly Rate) +
                 (Decisions Improved × Decision Value) +
                 (Risk Avoided)
```

**Measurement Method**:
```
Quarterly ROI Surveys:
├─ Send to all customers (quarterly)
├─ Questions:
│   ├─ Hours saved per week?
│   ├─ Decisions improved this quarter?
│   ├─ Estimated value of improved decisions?
│   └─ Risks or errors avoided?
├─ Calculate ROI per customer
└─ Track over time
```

**Targets**:
| Period | Average Customer ROI | Interpretation |
|--------|---------------------|----------------|
| **Q4 2026** | 5x | Strong value (pilot validation) |
| **Q4 2027** | 7x | Excellent value (product-market fit) |
| **Q4 2028** | 10x | Exceptional value (category leader) |

**Benchmarks**:
- 2-3x: Minimum acceptable (customer will renew)
- 5x: Strong (customer will advocate)
- 10x: Exceptional (customer will expand, refer)

**How to Improve**:
- Increase time saved (better agents, faster responses)
- Expand use cases (more decisions supported)
- Customer Success coaching (help customers extract more value)
- Product features (Ask Panel, BYOAI → higher-value use cases)

---

### KPI #4: Net Promoter Score (NPS)

**Definition**: % Promoters (9-10 rating) - % Detractors (0-6 rating)

**Measurement**:
```
NPS Survey (Quarterly):
Question: "How likely are you to recommend VITAL to a colleague?"
Scale: 0 (not at all) to 10 (extremely likely)

Categories:
├─ Promoters (9-10): Enthusiastic advocates
├─ Passives (7-8): Satisfied but not enthusiastic
└─ Detractors (0-6): Unhappy, at risk of churn

NPS = % Promoters - % Detractors

Example:
├─ 60% Promoters
├─ 30% Passives
├─ 10% Detractors
└─ NPS = 60% - 10% = 50
```

**Targets**:
| Period | NPS | Interpretation |
|--------|-----|----------------|
| **Q4 2026** | 50 | Good (typical for new product) |
| **Q4 2027** | 60 | Excellent (product-market fit achieved) |
| **Q4 2028** | 70+ | World-class (category leader) |

**Benchmarks**:
- 0-30: Needs improvement
- 30-50: Good
- 50-70: Excellent
- 70+: World-class (Apple, Tesla level)

**How to Improve**:
- Address detractor feedback (fix issues causing unhappiness)
- Delight promoters (exceed expectations, surprise and delight)
- Convert passives (what would make them promoters?)
- Customer Success outreach (proactive support)

---

### KPI #5: Gross Revenue Retention (GRR)

**Definition**: Revenue retained from existing customers (excludes expansion)

**Formula**:
```
GRR = (Revenue at Start - Churn - Downgrades) / Revenue at Start × 100%

Example:
├─ Revenue start of year: $1,000,000
├─ Churn: $100,000 (10% of customers churned)
├─ Downgrades: $50,000 (customers downgraded tier)
├─ Revenue retained: $850,000
└─ GRR = $850,000 / $1,000,000 = 85%
```

**Targets**:
| Period | GRR | Interpretation |
|--------|-----|----------------|
| **Year 1** | 85% | Acceptable (pilot phase, some churn expected) |
| **Year 2** | 90% | Good (product-market fit) |
| **Year 3** | 92%+ | Excellent (sticky product) |

**Benchmarks**:
- 70-80%: Average SaaS (needs improvement)
- 85-90%: Good SaaS
- 90-95%: Excellent SaaS (VITAL target)
- 95%+: World-class (very rare)

**How to Improve**:
- Reduce churn (Customer Success, product quality)
- Prevent downgrades (ensure customers use full platform)
- Lock-in features (BYOAI integration = high switching cost)
- Quarterly Business Reviews (proactive value demonstration)

---

### KPI #6: Net Revenue Retention (NRR)

**Definition**: Revenue retained + expansion from existing customers

**Formula**:
```
NRR = (Revenue Retained + Expansion - Downgrades - Churn) / Revenue Start × 100%

Example:
├─ Revenue start: $1,000,000
├─ Churn: $100,000
├─ Downgrades: $50,000
├─ Expansion (upsells): $300,000
├─ Net revenue: $1,150,000
└─ NRR = $1,150,000 / $1,000,000 = 115%
```

**Targets**:
| Period | NRR | Interpretation |
|--------|-----|----------------|
| **Year 1** | 100% | Break-even (churn offset by expansion) |
| **Year 2** | 110% | Good (expansion revenue growing) |
| **Year 3** | 120% | Excellent (strong expansion) |

**Benchmarks**:
- 90-100%: Concerning (losing revenue from existing customers)
- 100-110%: Good (modest expansion)
- 110-120%: Excellent (strong expansion)
- 120%+: World-class (hypergrowth from base)

**Why >100% NRR is Critical**:
- Can grow revenue even with $0 new customer acquisition
- Efficient growth (expansion cheaper than new logos)
- Proves product value (customers pay more over time)
- Highly valued by investors (premium valuation multiple)

**How to Improve**:
- Upsell Starter → Professional → Enterprise
- Cross-sell additional features (BYOAI, custom agents)
- Seat expansion (more users within customer org)
- Customer Success-led expansion (identify upsell opportunities)

---

### KPI #7: Time to Value (TTV)

**Definition**: Days from signup to first successful consultation

**Formula**:
```sql
SELECT AVG(DATEDIFF(first_consultation.created_at, user.created_at)) AS ttv_days
FROM users
JOIN (
  SELECT user_id, MIN(created_at) AS created_at
  FROM consultations
  GROUP BY user_id
) AS first_consultation ON users.id = first_consultation.user_id
WHERE users.created_at >= '2026-01-01'
```

**Targets**:
| Period | TTV (Days) | Interpretation |
|--------|-----------|----------------|
| **Q1 2026** | 5 days | Acceptable (pilot, manual onboarding) |
| **Q4 2026** | 3 days | Good (streamlined onboarding) |
| **Q4 2027** | 1 day | Excellent (self-serve onboarding) |
| **Q4 2028** | < 1 day | World-class (instant value) |

**Benchmarks**:
- 7+ days: Slow (users may churn before seeing value)
- 3-7 days: Average
- 1-3 days: Good
- < 1 day: Excellent (instant gratification)

**Why It Matters**:
- Fast TTV = higher activation rate
- Users who see value quickly are more likely to retain
- Competitive advantage (faster than consultants/competitors)

**How to Improve**:
- Better onboarding (step-by-step guide, sample consultations)
- Pre-populated content (example questions, use cases)
- Onboarding automation (reduce manual CS touch)
- Product improvements (reduce setup complexity)

---

## 3. Secondary KPIs (15 Supporting Metrics)

These metrics provide deeper insight into product health and user behavior.

---

### Category A: Engagement Metrics

**KPI #8: Daily Active Users (DAU)**
- **Definition**: Users with ≥1 consultation in past 24 hours
- **Target**: 20-25% of total users (by Year 2)
- **Why**: Measures daily engagement (high frequency = high value)

**KPI #9: DAU/WAU Ratio**
- **Definition**: DAU / WAU (shows usage frequency)
- **Target**: 30-40% (3-4 days per week usage)
- **Why**: Indicates stickiness (higher = more habitual use)

**KPI #10: Session Duration**
- **Definition**: Average time spent per session
- **Target**: 10-15 minutes
- **Why**: Longer sessions = deeper engagement (but not too long = friction)

**KPI #11: User Retention (30-day)**
- **Definition**: % users active in month 2 after signup
- **Target**: 70% (by Year 2)
- **Why**: Early retention predicts long-term retention

---

### Category B: Feature Adoption

**KPI #12: Ask Expert Adoption (by Mode)**
- **Definition**: % of users using each of 4 Ask Expert modes
- **Targets**:
  - Mode 1 (Manual): 100% (core feature)
  - Mode 2 (Auto Selection): 60%
  - Mode 3-4 (Autonomous): 30%
- **Why**: Shows feature depth, user sophistication

**KPI #13: Ask Panel Adoption**
- **Definition**: % users who have used Ask Panel (multi-expert)
- **Target**: 40% (by Year 2)
- **Why**: High-value feature, indicator of complex use cases

**KPI #14: BYOAI Adoption**
- **Definition**: % customers with BYOAI integration active
- **Target**: 30% (by Year 3)
- **Why**: Unique differentiator, high switching cost (moat)

**KPI #15: Agent Diversity**
- **Definition**: % of 136 agents used at least once per month
- **Target**: 60% (80+ agents used monthly)
- **Why**: Shows platform breadth, prevents "only using 3 agents" problem

---

### Category C: Quality Metrics

**KPI #16: Response Time (p95)**
- **Definition**: 95th percentile time from question to answer
- **Target**: < 10 seconds (Year 1), < 5 seconds (Year 3)
- **Why**: Speed is core value prop (vs. weeks with consultants)

**KPI #17: Answer Accuracy (User-Rated)**
- **Definition**: % of answers rated 4-5 stars (out of 5)
- **Target**: 90%+ (by Year 2)
- **Why**: Quality drives trust, repeat usage, retention

**KPI #18: Error Rate**
- **Definition**: % of consultations resulting in error or timeout
- **Target**: < 1%
- **Why**: Reliability is table stakes, errors destroy trust

---

### Category D: Business Metrics

**KPI #19: Customer Churn Rate (Monthly)**
- **Definition**: % of customers churning per month
- **Target**: < 1% monthly (< 12% annually by Year 3)
- **Why**: Churn kills growth, high churn = product-market fit issue

**KPI #20: Monthly Recurring Revenue (MRR)**
- **Definition**: Predictable monthly revenue
- **Target**: $100K (Q4 2026), $2M (Q4 2027), $8M (Q4 2028)
- **Why**: Fundamental SaaS metric, predictable revenue

**KPI #21: Customer Acquisition Cost (CAC)**
- **Definition**: Sales & Marketing cost per new customer
- **Target**: $18K (maintain as we scale)
- **Why**: Must stay below 1/3 of LTV for healthy unit economics

**KPI #22: Customer Lifetime Value (LTV)**
- **Definition**: Total profit expected from customer over lifetime
- **Target**: $400K+ (5-year customer, 86% margin)
- **Why**: LTV/CAC ratio drives valuation

---

## 4. Operational Metrics (30+)

These metrics are monitored **daily** by engineering/operations teams.

---

### Category A: System Health

**Metric #23: System Uptime**
- **Definition**: % time system is available and functional
- **Target**: 99.9% (< 43 minutes downtime per month)
- **Owner**: Engineering
- **Alert Threshold**: < 99.5% (trigger incident response)

**Metric #24: API Latency (p95)**
- **Definition**: 95th percentile API response time
- **Target**: < 500ms
- **Owner**: Engineering
- **Alert Threshold**: > 1,000ms

**Metric #25: Database Query Time (p95)**
- **Definition**: 95th percentile database query time
- **Target**: < 100ms
- **Owner**: Engineering
- **Alert Threshold**: > 500ms

**Metric #26: LLM API Success Rate**
- **Definition**: % of LLM API calls that succeed (not timeout/error)
- **Target**: 99%+
- **Owner**: Engineering
- **Alert Threshold**: < 95%

---

### Category B: Cost Metrics

**Metric #27: LLM API Cost per Consultation**
- **Definition**: Average $ spent on LLM APIs per consultation
- **Target**: < $0.50 (Year 1), < $0.30 (Year 3)
- **Owner**: Engineering + Finance
- **Why**: Largest variable cost, must optimize to maintain margin

**Metric #28: Infrastructure Cost per Customer**
- **Definition**: Monthly infrastructure cost / # customers
- **Target**: < $200/customer/month
- **Owner**: Engineering
- **Why**: Must scale efficiently (leverage multi-tenant architecture)

**Metric #29: Gross Margin (Actual)**
- **Definition**: (Revenue - COGS) / Revenue
- **Target**: 70% (Year 1) → 86% (Year 3)
- **Owner**: Finance
- **Why**: Profitability driver, must hit targets for investor confidence

---

### Category C: Data Quality

**Metric #30: RAG Retrieval Quality**
- **Definition**: % of RAG retrievals returning relevant documents (human-rated)
- **Target**: 85%+ relevance
- **Owner**: AI/ML Team
- **Why**: RAG quality → answer quality → user trust

**Metric #31: Agent Response Quality (Automated)**
- **Definition**: Automated quality score (0-100) based on response characteristics
- **Target**: 80+ average score
- **Owner**: AI/ML Team
- **Why**: Early warning for agent degradation

**Metric #32: Knowledge Base Freshness**
- **Definition**: % of documents updated in last 90 days
- **Target**: 40%+ (indicates active knowledge base)
- **Owner**: Content Team
- **Why**: Stale knowledge = wrong answers

---

### Category D: Support & Operations

**Metric #33: Support Tickets per Week**
- **Definition**: Number of customer support tickets opened
- **Target**: < 5 per 100 active users
- **Owner**: Customer Success
- **Why**: High tickets = product issues or poor UX

**Metric #34: Ticket Resolution Time (p95)**
- **Definition**: 95th percentile time to resolve ticket
- **Target**: < 24 hours
- **Owner**: Customer Success
- **Why**: Fast resolution = customer satisfaction

**Metric #35: Feature Requests Logged**
- **Definition**: Number of feature requests from customers
- **Target**: Track trend (10-20/week is healthy)
- **Owner**: Product
- **Why**: Input for roadmap prioritization

---

### Category E: Security & Compliance

**Metric #36: Security Incidents**
- **Definition**: Number of security incidents (any severity)
- **Target**: 0 (zero tolerance)
- **Owner**: Security/Engineering
- **Alert**: Any incident triggers executive notification

**Metric #37: Data Breach Attempts**
- **Definition**: Number of detected/blocked intrusion attempts
- **Target**: Track trend, 100% blocked
- **Owner**: Security
- **Why**: Shows threat landscape, effectiveness of defenses

**Metric #38: RLS Policy Violations**
- **Definition**: Number of Row-Level Security policy violations detected
- **Target**: 0 (critical - multi-tenant data leakage risk)
- **Owner**: Engineering
- **Alert**: Any violation triggers immediate investigation

---

### Additional Operational Metrics (39-53)

39. Active Tenants (# tenants with ≥1 active user)
40. Consultations per Day (trend)
41. Peak Concurrent Users
42. Agent Invocation Distribution (which agents used most)
43. Failed Consultations (# that didn't complete)
44. User Sign-up Rate (new users/day)
45. User Activation Rate (% who complete first consultation)
46. Email Open Rate (marketing emails)
47. In-App Notification Click Rate
48. Mobile App Downloads (when available)
49. API Usage (external customer API calls)
50. Custom Agent Creation (# custom agents created by customers)
51. Knowledge Base Document Count (total documents)
52. Knowledge Base Upload Rate (docs uploaded/week)
53. Feedback Submission Rate (user feedback submissions/week)

---

# Part II: Dashboard Specifications

## 5. Executive Dashboard

**Audience**: CEO, Board, Executive Team
**Purpose**: High-level business health at a glance
**Update Frequency**: Real-time (refreshed hourly)

---

### 5.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  VITAL Platform - Executive Dashboard                      │
│  As of: 2025-11-16 14:30 PST                              │
└────────────────────────────────────────────────────────────┘

┌──────────── NORTH STAR METRIC ────────────┐
│  Hours of Human Genius Amplified          │
│                                            │
│  This Month: 12,500 hours  ▲ +45% MoM    │
│  This Quarter: 32,000 hours               │
│  This Year: 50,000 hours                  │
│                                            │
│  [Line Chart: Monthly trend for 12 months]│
└────────────────────────────────────────────┘

┌─── KEY METRICS ───┬─── GROWTH ───┬─── FINANCIAL ───┐
│                   │              │                 │
│  Customers        │  MRR Growth  │  ARR            │
│  50  ▲ +20 QoQ   │  +35% MoM    │  $1.2M          │
│                   │              │                 │
│  Active Users     │  User Growth │  Gross Margin   │
│  5,000  ▲ +1,200 │  +31% MoM    │  70%            │
│                   │              │                 │
│  WAU %            │  NRR         │  Cash           │
│  70%  ▲ +5pp     │  110%        │  $3.3M          │
└───────────────────┴──────────────┴─────────────────┘

┌─── HEALTH INDICATORS ───────────────────────────┐
│                                                  │
│  NPS: 52  🟢 (Target: 50+)                      │
│  Customer ROI: 5.7x  🟢 (Target: 5x+)           │
│  Churn: 1.2%/mo  🟡 (Target: <1%)              │
│  CAC Payback: 2.1 mo  🟢 (Target: <3mo)        │
│                                                  │
└──────────────────────────────────────────────────┘

┌─── RECENT ALERTS ───────────────────────────────┐
│                                                  │
│  🔴 1 Critical: API latency spike (resolved)    │
│  🟡 2 Warnings: Churn uptick in Tier Starter    │
│  🟢 All systems operational                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 5.2 Metrics Shown

| Metric | Visualization | Update Frequency |
|--------|---------------|------------------|
| **North Star (Hours Amplified)** | Big number + trend line | Hourly |
| **Customers** | Count + QoQ growth | Hourly |
| **Active Users** | Count + MoM growth | Hourly |
| **WAU %** | Percentage + trend | Daily |
| **MRR** | Currency + MoM growth % | Daily |
| **ARR** | Currency | Daily |
| **NPS** | Score + status indicator | Weekly |
| **Customer ROI** | Multiple + status | Monthly |
| **Churn Rate** | % + status indicator | Weekly |
| **Gross Margin** | % | Weekly |
| **Cash Balance** | Currency | Daily |

---

### 5.3 Interactivity

- **Drill-Down**: Click any metric → detailed dashboard
- **Time Range**: Toggle between Day/Week/Month/Quarter/Year
- **Filters**: Filter by customer segment, tenant type
- **Alerts**: Click alerts → incident details

---

## 6. Product Dashboard

**Audience**: VP Product, Product Managers, Product Team
**Purpose**: Product usage, feature adoption, user behavior
**Update Frequency**: Real-time (refreshed every 15 minutes)

---

### 6.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  VITAL Platform - Product Dashboard                        │
└────────────────────────────────────────────────────────────┘

┌─── ENGAGEMENT ──────────────────────────────────┐
│  Weekly Active Users (WAU)                      │
│  3,500 / 5,000 total = 70% WAU rate             │
│  [Line chart: WAU trend for 12 weeks]          │
│                                                  │
│  Consultations per User per Week                │
│  3.2 consultations/user/week  ▲ +0.3 WoW       │
│  [Bar chart: Distribution by user segment]      │
└──────────────────────────────────────────────────┘

┌─── FEATURE ADOPTION ────────────────────────────┐
│                                                  │
│  Ask Expert (Mode 1): 100% (all users)         │
│  Ask Expert (Mode 2): 65%  ▲ +5pp              │
│  Ask Panel: 42%  ▲ +8pp                        │
│  BYOAI: 12%  (Enterprise only)                  │
│                                                  │
│  [Funnel: User journey from signup → features] │
└──────────────────────────────────────────────────┘

┌─── AGENT USAGE ─────────────────────────────────┐
│  Top 10 Most Used Agents:                       │
│  1. Regulatory Affairs Expert (EU) - 2,340 uses│
│  2. Competitive Intelligence - 1,890 uses       │
│  3. Medical Writing Expert - 1,450 uses         │
│  ...                                             │
│                                                  │
│  Agent Diversity: 72% (98/136 agents used)     │
└──────────────────────────────────────────────────┘

┌─── QUALITY METRICS ─────────────────────────────┐
│  Response Time (p95): 8.2s  🟢 (Target: <10s)  │
│  Answer Accuracy: 87%  🟡 (Target: 90%)        │
│  Error Rate: 0.3%  🟢 (Target: <1%)            │
└──────────────────────────────────────────────────┘

┌─── RETENTION ───────────────────────────────────┐
│  30-Day User Retention: 68%  🟡                 │
│  [Cohort chart: Retention by signup month]     │
└──────────────────────────────────────────────────┘
```

---

### 6.2 Key Metrics

1. **Weekly Active Users (WAU)** - trend over time
2. **Consultations per User per Week** - engagement depth
3. **Feature Adoption Rates** - % using each feature
4. **Agent Usage Distribution** - which agents are popular
5. **Response Time (p95)** - product performance
6. **Answer Accuracy** - product quality
7. **User Retention Cohorts** - long-term stickiness

---

### 6.3 User Segmentation

**Segment by**:
- User role (MSL, Medical Director, etc.)
- Customer tier (Starter, Professional, Enterprise)
- Tenure (new users vs. veterans)
- Usage level (light, medium, heavy users)

**Example Insight**:
> "MSLs in Enterprise tier use Ask Panel 3x more than Professional tier → upsell opportunity"

---

## 7. Customer Success Dashboard

**Audience**: VP Customer Success, CSMs, Support Team
**Purpose**: Customer health, usage patterns, at-risk accounts
**Update Frequency**: Real-time (refreshed every 15 minutes)

---

### 7.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  VITAL Platform - Customer Success Dashboard               │
└────────────────────────────────────────────────────────────┘

┌─── CUSTOMER HEALTH SCORE ───────────────────────┐
│  Overall Health: 8.2 / 10  🟢                   │
│                                                  │
│  🟢 Healthy (35 customers): 70%                 │
│  🟡 At Risk (10 customers): 20%                 │
│  🔴 Critical (5 customers): 10%                 │
│                                                  │
│  [List: Top 5 at-risk customers with reasons]  │
└──────────────────────────────────────────────────┘

┌─── USAGE TRENDS ────────────────────────────────┐
│  Customers by Usage Level:                      │
│  - Power Users (10+ consult/week): 12 (24%)    │
│  - Active (3-10 consult/week): 28 (56%)        │
│  - Low (<3 consult/week): 10 (20%) ⚠️          │
│                                                  │
│  [Chart: Usage distribution by customer]        │
└──────────────────────────────────────────────────┘

┌─── UPCOMING RENEWALS ───────────────────────────┐
│  Next 30 Days: 8 renewals ($960K ARR)           │
│  - 6 confirmed renewals  🟢                     │
│  - 2 at risk  🔴 (action required)             │
│                                                  │
│  Expansion Opportunities: 5 customers           │
│  - Upsell potential: $180K ARR                  │
└──────────────────────────────────────────────────┘

┌─── SUPPORT METRICS ─────────────────────────────┐
│  Open Tickets: 12  (▼ -3 from last week)       │
│  Avg Resolution Time: 18 hours  🟢             │
│  CSAT Score: 4.6 / 5  🟢                       │
└──────────────────────────────────────────────────┘

┌─── NPS & FEEDBACK ──────────────────────────────┐
│  Latest NPS: 52  🟢                             │
│  - Promoters: 60% (30 customers)                │
│  - Passives: 30% (15 customers)                 │
│  - Detractors: 10% (5 customers)                │
│                                                  │
│  Recent Feedback (top themes):                  │
│  1. "Love the speed!" (15 mentions)            │
│  2. "Want more integrations" (8 mentions)       │
│  3. "Mobile app needed" (6 mentions)            │
└──────────────────────────────────────────────────┘
```

---

### 7.2 Customer Health Score

**Formula**:
```
Health Score = (Engagement Score × 0.4) +
               (Product Usage Score × 0.3) +
               (Support Score × 0.15) +
               (NPS Score × 0.15)

Where each component is 0-10 scale

Example:
├─ Engagement: 8.0 (70% WAU, good adoption)
├─ Product Usage: 9.0 (5 consult/user/week)
├─ Support: 7.0 (2 tickets this month)
├─ NPS: 8.0 (customer is promoter)
└─ Health = (8×0.4) + (9×0.3) + (7×0.15) + (8×0.15) = 8.2
```

**Health Thresholds**:
- 🟢 **Healthy** (8-10): Strong engagement, low support, promoter
- 🟡 **At Risk** (5-7.9): Declining usage, support issues, or passive
- 🔴 **Critical** (0-4.9): Very low usage, detractor, or high support

---

### 7.3 CSM Actions

**Automated Alerts**:
- 🔴 Customer health drops below 5 → urgent outreach
- 🟡 Usage declines 30% week-over-week → check-in call
- 🟢 Customer achieves 10x ROI → request case study/referral

**Recommended Actions by Health**:
- **Healthy**: Quarterly Business Review, ask for referral, upsell
- **At Risk**: Weekly check-in, identify blockers, offer training
- **Critical**: Executive escalation, rescue plan, last-chance offer

---

## 8. Engineering/Operations Dashboard

**Audience**: CTO, Engineering Team, DevOps
**Purpose**: System health, performance, costs, incidents
**Update Frequency**: Real-time (refreshed every 1 minute)

---

### 8.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  VITAL Platform - Engineering Dashboard                    │
└────────────────────────────────────────────────────────────┘

┌─── SYSTEM HEALTH ───────────────────────────────┐
│  Status: 🟢 All Systems Operational             │
│  Uptime (30d): 99.94%  🟢 (Target: 99.9%)      │
│                                                  │
│  [Uptime chart: Last 30 days, minute-by-minute]│
└──────────────────────────────────────────────────┘

┌─── PERFORMANCE METRICS ─────────────────────────┐
│  API Latency (p95): 420ms  🟢 (Target: <500ms) │
│  DB Query Time (p95): 85ms  🟢 (Target: <100ms)│
│  LLM API Success: 99.2%  🟢 (Target: 99%+)     │
│                                                  │
│  [Time series: Latency trends for 24 hours]    │
└──────────────────────────────────────────────────┘

┌─── COST METRICS ────────────────────────────────┐
│  LLM API Cost Today: $285  (avg $0.42/consult) │
│  Infrastructure Cost (MTD): $3,200              │
│  Total Burn Rate: $9.50/customer/day  🟢       │
│                                                  │
│  [Cost breakdown chart by service]              │
└──────────────────────────────────────────────────┘

┌─── ERROR TRACKING ──────────────────────────────┐
│  Errors (24h): 12 errors  (0.08% error rate)   │
│  - 10 timeouts (LLM API)  ⚠️                   │
│  - 2 database connection errors                 │
│                                                  │
│  [Error log: Recent errors with stack traces]  │
└──────────────────────────────────────────────────┘

┌─── ACTIVE INCIDENTS ────────────────────────────┐
│  🔴 1 Critical: LLM API latency spike (P0)     │
│     - Started: 2 hours ago                      │
│     - Owner: Alice (on-call engineer)           │
│     - ETA: 1 hour (mitigation in progress)     │
│                                                  │
│  🟡 0 Warnings                                  │
└──────────────────────────────────────────────────┘

┌─── DEPLOYMENT STATUS ───────────────────────────┐
│  Last Deploy: 3 hours ago (v1.4.2)  ✅         │
│  Next Deploy: Scheduled for tonight 11pm PST    │
│                                                  │
│  [Deployment history: Last 10 deploys]          │
└──────────────────────────────────────────────────┘
```

---

### 8.2 Alert Thresholds & Escalation

| Metric | Warning | Critical | Escalation |
|--------|---------|----------|------------|
| **Uptime** | < 99.5% (1 hour) | < 99% (2 hours) | Page on-call → escalate CTO |
| **API Latency** | > 750ms (15 min) | > 1,500ms (5 min) | Alert channel → page on-call |
| **Error Rate** | > 1% (15 min) | > 5% (5 min) | Alert channel → page on-call |
| **LLM API Cost** | > $0.60/consult | > $1.00/consult | Alert engineering + finance |
| **Database Load** | > 70% CPU | > 90% CPU | Auto-scale + alert |

---

## 9. Sales & Marketing Dashboard

**Audience**: VP Sales, Sales Team, Marketing Team
**Purpose**: Pipeline, conversion funnel, campaign performance
**Update Frequency**: Real-time (refreshed hourly)

---

### 9.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  VITAL Platform - Sales & Marketing Dashboard              │
└────────────────────────────────────────────────────────────┘

┌─── PIPELINE ────────────────────────────────────┐
│  Total Pipeline: $4.2M                          │
│  - Qualified: $2.8M (15 opps)                   │
│  - Negotiation: $1.2M (5 opps)                  │
│  - Closing This Quarter: $800K (forecast)       │
│                                                  │
│  [Funnel chart: MQL → SQL → Opp → Closed]      │
└──────────────────────────────────────────────────┘

┌─── CONVERSION METRICS ──────────────────────────┐
│  MQL → SQL: 42% (Target: 40%)  🟢              │
│  SQL → Opp: 48% (Target: 50%)  🟡             │
│  Opp → Closed Won: 68% (Target: 67%)  🟢      │
│                                                  │
│  Sales Cycle: 182 days (Target: <180 days) 🟡 │
└──────────────────────────────────────────────────┘

┌─── MARKETING PERFORMANCE ───────────────────────┐
│  This Month:                                     │
│  - Website Visitors: 12,500  ▲ +18%            │
│  - MQLs Generated: 85  ▲ +22%                  │
│  - Content Downloads: 240                       │
│  - Webinar Attendees: 95                        │
│                                                  │
│  Top Channels:                                   │
│  1. Organic Search: 45% of MQLs                 │
│  2. LinkedIn Ads: 30% of MQLs                   │
│  3. Referrals: 15% of MQLs                      │
│  4. Events: 10% of MQLs                         │
└──────────────────────────────────────────────────┘

┌─── CAMPAIGN ROI ────────────────────────────────┐
│  Campaign: "Elastic Organization" LinkedIn      │
│  - Spend: $12,000                                │
│  - MQLs: 28                                      │
│  - SQLs: 12                                      │
│  - Pipeline Created: $720K                       │
│  - ROI: 60x (if pipeline closes)  🟢           │
└──────────────────────────────────────────────────┘
```

---

# Part III: Implementation

## 10. Data Collection Strategy

### 10.1 Event Tracking

**Frontend Events** (PostHog or Mixpanel):
```javascript
// User signs up
track('User Signed Up', {
  user_id: userId,
  tenant_id: tenantId,
  signup_source: 'website',
  trial_tier: 'professional'
});

// User starts consultation
track('Consultation Started', {
  user_id: userId,
  tenant_id: tenantId,
  agent_id: agentId,
  mode: 'manual_interactive'
});

// User completes consultation
track('Consultation Completed', {
  user_id: userId,
  tenant_id: tenantId,
  agent_id: agentId,
  duration_seconds: 45,
  response_time_seconds: 8.2,
  user_rating: 5
});
```

**Backend Events** (LangSmith for LLM calls):
```python
# LangChain/LangGraph automatically tracked via LangSmith
from langsmith import traceable

@traceable
def invoke_agent(agent_id, question, context):
    # LangSmith captures:
    # - Input (question, context)
    # - Output (answer)
    # - Latency
    # - LLM API calls (model, tokens, cost)
    # - Errors
    ...
```

---

### 10.2 Database Schema for Analytics

**Core Tables**:
```sql
-- consultations table (already exists)
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  user_id UUID,
  agent_id UUID,
  mode VARCHAR(50), -- manual_interactive, auto_selection, etc.
  question_text TEXT,
  answer_text TEXT,
  response_time_seconds FLOAT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP,
  user_rating INT, -- 1-5 stars
  ...
);

-- user_activity table (for engagement tracking)
CREATE TABLE user_activity (
  id UUID PRIMARY KEY,
  user_id UUID,
  tenant_id UUID,
  activity_type VARCHAR(100), -- 'page_view', 'consultation', 'feature_used'
  activity_metadata JSONB,
  created_at TIMESTAMP
);

-- customer_metrics table (aggregated metrics)
CREATE TABLE customer_metrics (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  metric_date DATE,
  active_users INT,
  consultations_count INT,
  avg_response_time FLOAT,
  nps_score FLOAT,
  health_score FLOAT,
  ...
);
```

---

## 11. Analytics Tools & Infrastructure

### 11.1 Tool Stack

| Tool | Purpose | Cost | Status |
|------|---------|------|--------|
| **PostHog** | Product analytics (events, funnels, cohorts) | $0-500/mo | ✅ Implemented |
| **LangSmith** | LLM observability (traces, costs) | $0-300/mo | ✅ Implemented |
| **Sentry** | Error tracking | $0-100/mo | ✅ Implemented |
| **Metabase** | Custom dashboards (SQL queries on Supabase) | Free (open-source) | ✅ Implemented |
| **Stripe** | Revenue metrics, MRR, churn | Included | 🔄 Integration |
| **Google Analytics** | Website traffic | Free | ✅ Implemented |

**Total Monthly Cost**: $400-900/month (scales with usage)

---

### 11.2 Data Warehouse (Optional Year 2+)

**Consider**: Snowflake or BigQuery for centralized analytics warehouse

**Benefits**:
- Centralize data from PostHog, Supabase, Stripe, etc.
- Run complex queries without impacting production database
- Historical data retention (Supabase = 90 days, warehouse = unlimited)

**Timeline**: Implement when data volume exceeds Supabase capacity (Year 2+)

---

## 12. Reporting Cadence

### 12.1 Daily Reports (Automated)

**To**: CEO, VP Product, VP Engineering
**Contents**:
- Yesterday's key metrics (WAU, consultations, MRR, uptime)
- Top 3 highlights (wins)
- Top 3 concerns (issues)
- Critical alerts

**Delivery**: Email at 8am daily

---

### 12.2 Weekly Reports

**To**: Executive Team, Board (monthly)
**Contents**:
- Week-over-week trends (all Primary KPIs)
- Feature adoption updates
- Customer health summary
- Top wins & losses

**Delivery**: Monday morning email

---

### 12.3 Monthly Business Reviews

**To**: Board of Directors
**Contents**:
- Month-over-month performance (all Primary KPIs)
- Financial metrics (MRR, burn rate, runway)
- Strategic initiatives progress
- Risks and mitigations

**Delivery**: First week of each month (live presentation)

---

### 12.4 Quarterly Board Meetings

**To**: Board of Directors, Investors
**Contents**:
- Quarterly performance vs. targets
- Customer stories (wins, case studies)
- Product roadmap updates
- Financial projections update
- Strategic decisions needed

**Delivery**: Live presentation + deck

---

## 13. Alerts & Thresholds

### 13.1 Critical Alerts (Immediate Response)

**Trigger → Action**:
```
🔴 System Uptime < 99% for 1 hour
  → Page on-call engineer
  → Notify CEO, CTO
  → Post in #incidents Slack channel

🔴 Error Rate > 5% for 5 minutes
  → Page on-call engineer
  → Rollback latest deploy (if recent)
  → Post in #incidents

🔴 Customer Health Score < 3.0 (any customer)
  → Alert CSM (immediate)
  → Schedule rescue call within 24 hours
  → Escalate to VP CS

🔴 Security Incident
  → Page security team
  → Notify CEO, CTO, Legal
  → Initiate incident response protocol
```

---

### 13.2 Warning Alerts (24-Hour Response)

```
🟡 WAU % declines 10%+ week-over-week
  → Alert VP Product
  → Investigate user feedback, product issues
  → Report findings within 24 hours

🟡 Churn Rate > 1.5% monthly
  → Alert VP CS
  → Review churned customers (exit interviews)
  → Present churn reduction plan within 1 week

🟡 NPS drops below 45
  → Alert VP Product, VP CS
  → Review detractor feedback
  → Action plan within 1 week

🟡 LLM API Cost > $0.60/consultation
  → Alert VP Engineering, CFO
  → Investigate cost spike
  → Optimization plan within 1 week
```

---

# Part IV: Measurement Playbook

## 14. How to Measure Customer ROI

### 14.1 Quarterly ROI Survey

**Timing**: Send to all customers quarterly (at 90-day mark post-signup)

**Survey Questions**:

**Q1**: How many hours per week does your team save using VITAL?
- Options: 0-5, 5-10, 10-20, 20-40, 40+ hours

**Q2**: How many strategic decisions has VITAL helped improve this quarter?
- Options: 0, 1-5, 6-10, 11-20, 20+ decisions

**Q3**: Estimate the value of one improved decision (on average):
- Options: $0-1K, $1K-5K, $5K-10K, $10K-25K, $25K+

**Q4**: Have you avoided any compliance risks or strategic errors due to VITAL?
- Options: Yes / No
- If yes: Estimate value of risk avoided: $_______

**Q5**: What's your estimated overall ROI from VITAL?
- Options: < 2x, 2-5x, 5-10x, 10-20x, 20x+

---

### 14.2 ROI Calculation

**Automated Calculation**:
```python
# Based on survey responses
time_saved_per_week = survey_response['hours_saved']
team_size = customer.active_users_count
loaded_hourly_rate = 150  # default, can customize per customer

annual_time_value = (time_saved_per_week * 52 weeks * team_size * loaded_hourly_rate)

decisions_improved = survey_response['decisions_improved'] * 4  # quarterly → annual
decision_value = survey_response['decision_value_midpoint']
annual_decision_value = decisions_improved * decision_value

risk_avoided = survey_response['risk_value'] if survey_response['risk_avoided'] else 0

total_value = annual_time_value + annual_decision_value + risk_avoided
vital_cost = customer.annual_contract_value

roi = (total_value - vital_cost) / vital_cost

# Store in customer_metrics table
customer.roi = roi
customer.save()
```

---

### 14.3 ROI Reporting

**Customer ROI Report** (Quarterly):
```
VITAL Platform - ROI Report
Customer: BioTech Co.
Quarter: Q4 2026

Value Delivered:
├─ Time Saved: $300,000 (2,000 hours × $150/hr)
├─ Decisions Improved: $400,000 (40 decisions × $10,000)
├─ Risk Avoided: $200,000 (2 compliance violations)
└─ Total Value: $900,000

VITAL Investment: $30,000 (quarterly)

Net Benefit: $870,000
ROI: 29x (2,900% return)

Recommendation: ✅ Strong ROI - on track for renewal
```

---

## 15. Cohort Analysis Framework

### 15.1 User Cohorts (by Signup Month)

**Purpose**: Track retention and engagement over time

**Example**:
```
Cohort: January 2026 Signups (100 users)

Month 0 (Jan): 100 users active (100%)
Month 1 (Feb): 85 users active (85% retention)
Month 2 (Mar): 78 users active (78% retention)
Month 3 (Apr): 73 users active (73% retention)
...
Month 12: 65 users active (65% retention)

Benchmark:
- Month 1: 80%+ is good
- Month 3: 70%+ is good
- Month 12: 60%+ is excellent
```

**Visualization**: Cohort retention table (heatmap style)

---

### 15.2 Customer Cohorts (by Signup Quarter)

**Purpose**: Track revenue retention and expansion

**Example**:
```
Cohort: Q1 2026 Customers (10 customers, $120K MRR)

Q1 2026 (Month 0): $120K MRR (100%)
Q2 2026 (Month 3): $115K MRR (96% GRR) - 1 churned
Q3 2026 (Month 6): $125K MRR (104% NRR) - 2 upsells offset churn
Q4 2026 (Month 9): $135K MRR (113% NRR) - expansion revenue
...
Q4 2027 (Month 21): $150K MRR (125% NRR)

NRR = $150K / $120K = 125%
```

---

## 16. A/B Testing Methodology

### 16.1 What to A/B Test

**High-Impact Tests**:
1. **Onboarding Flow**: Different onboarding sequences → impact on TTV
2. **Pricing Page**: Pricing tiers, messaging → impact on conversion rate
3. **Ask Expert UX**: Different UI designs → impact on consultations/user
4. **Email Campaigns**: Subject lines, content → impact on open rate, click rate

---

### 16.2 A/B Test Framework

**Example Test**: Onboarding Flow

**Hypothesis**: Showing sample consultations in onboarding will reduce TTV

**Variants**:
- Control (A): Standard onboarding (current)
- Variant (B): Onboarding with 3 sample consultations shown

**Sample Size**: 100 users per variant (200 total)

**Success Metric**: Time to Value (days from signup to first consultation)

**Run Duration**: 4 weeks (until statistical significance)

**Analysis**:
```
Control (A): TTV = 5.2 days (avg)
Variant (B): TTV = 3.1 days (avg)

Improvement: -40% (2.1 days faster)
Statistical Significance: p < 0.05 ✅

Decision: Ship Variant B to all users
```

---

# END OF ANALYTICS FRAMEWORK

**Document Status**: ✅ **COMPLETE**

**Summary**:
- **North Star Metric**: Hours of Human Genius Amplified
- **53+ Metrics Defined**: 1 North Star, 7 Primary KPIs, 15 Secondary, 30+ Operational
- **5 Dashboards Specified**: Executive, Product, Customer Success, Engineering, Sales
- **Implementation Guide**: Data collection, tools, reporting cadence, alerts
- **Measurement Playbook**: Customer ROI, cohorts, A/B testing

**Created by**: Business & Analytics Strategist
**Date**: 2025-11-16
**For**: VITAL Platform Gold-Standard Documentation Initiative
