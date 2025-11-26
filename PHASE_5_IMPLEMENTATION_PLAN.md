# Phase 5: Monitoring & Safety Implementation Plan

## Overview

**Goal**: Build comprehensive monitoring, safety, and compliance systems for AgentOS 3.0  
**Duration**: 3-4 hours  
**Status**: Starting now  
**Date**: 2025-11-23

---

## 🎯 Phase 5 Objectives

1. **Clinical AI Monitoring** - Track diagnostic metrics, accuracy, confidence
2. **Fairness Monitoring** - Detect bias across demographics
3. **Drift Detection** - Alert on performance degradation
4. **Real-time Metrics** - Prometheus + Grafana dashboards
5. **Compliance Logging** - Audit trail for regulatory requirements

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentOS 3.0 Monitoring                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Ask Expert Request  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Agent Selection     │ ← Phase 3: Evidence-Based
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Agent Execution     │ ← Phase 2: Graph Compilation
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Response Generation │ ← Phase 1: GraphRAG
└──────────┬───────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│                MONITORING LAYER (Phase 5)                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Clinical Monitor│  │ Fairness Monitor│              │
│  │                 │  │                 │              │
│  │ • Accuracy      │  │ • Demographics  │              │
│  │ • Confidence    │  │ • Bias metrics  │              │
│  │ • Sensitivity   │  │ • Parity checks │              │
│  │ • Specificity   │  │ • Alerts        │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                        │
│           └────────┬───────────┘                        │
│                    ↓                                     │
│  ┌──────────────────────────────────────┐              │
│  │        Database Persistence          │              │
│  │  • agent_interaction_logs            │              │
│  │  • agent_diagnostic_metrics          │              │
│  │  • agent_drift_alerts                │              │
│  │  • agent_fairness_metrics            │              │
│  └──────────────────┬───────────────────┘              │
│                     │                                   │
│                     ↓                                   │
│  ┌──────────────────────────────────────┐              │
│  │      Prometheus Metrics              │              │
│  │  • Counters (requests, errors)       │              │
│  │  • Histograms (latency)              │              │
│  │  • Gauges (active agents)            │              │
│  └──────────────────┬───────────────────┘              │
│                     │                                   │
│                     ↓                                   │
│  ┌──────────────────────────────────────┐              │
│  │      Grafana Dashboards              │              │
│  │  • Performance                       │              │
│  │  • Quality                           │              │
│  │  • Safety                            │              │
│  │  • Fairness                          │              │
│  └──────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗃️ Database Schema (Phase 5 Tables)

### 1. agent_interaction_logs
**Purpose**: Complete audit trail of all agent interactions

```sql
CREATE TABLE agent_interaction_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  session_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id),
  service_type TEXT, -- 'ask_expert', 'ask_panel', 'ask_critic', 'ask_planner'
  
  -- Request data
  query TEXT NOT NULL,
  context JSONB,
  tier TEXT, -- 'tier_1', 'tier_2', 'tier_3'
  
  -- Response data
  response TEXT,
  confidence_score DECIMAL(5,4),
  reasoning TEXT,
  citations JSONB,
  
  -- Quality metrics
  was_successful BOOLEAN,
  had_human_oversight BOOLEAN DEFAULT false,
  was_escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  
  -- Performance
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  
  -- RAG metadata
  rag_profile_id UUID,
  context_chunks_used INTEGER,
  graph_paths_used INTEGER,
  
  -- Demographics (for fairness)
  user_age_group TEXT,
  user_gender TEXT,
  user_region TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_interactions_tenant_date (tenant_id, created_at DESC),
  INDEX idx_interactions_agent (agent_id, created_at DESC),
  INDEX idx_interactions_session (session_id)
);
```

### 2. agent_diagnostic_metrics
**Purpose**: Clinical-style diagnostic metrics per agent

```sql
CREATE TABLE agent_diagnostic_metrics (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  metric_period TEXT, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Diagnostic metrics (clinical AI)
  total_interactions INTEGER DEFAULT 0,
  true_positives INTEGER DEFAULT 0,
  true_negatives INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  
  -- Calculated metrics
  sensitivity DECIMAL(5,4), -- TP / (TP + FN)
  specificity DECIMAL(5,4), -- TN / (TN + FP)
  precision DECIMAL(5,4), -- TP / (TP + FP)
  f1_score DECIMAL(5,4), -- 2 * (precision * recall) / (precision + recall)
  accuracy DECIMAL(5,4), -- (TP + TN) / (TP + TN + FP + FN)
  
  -- Confidence metrics
  avg_confidence DECIMAL(5,4),
  confidence_std_dev DECIMAL(5,4),
  calibration_error DECIMAL(5,4),
  
  -- Performance
  avg_response_time_ms INTEGER,
  p95_response_time_ms INTEGER,
  p99_response_time_ms INTEGER,
  
  -- Cost
  total_cost_usd DECIMAL(10,2),
  avg_cost_per_query DECIMAL(10,4),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, metric_period, period_start)
);
```

### 3. agent_drift_alerts
**Purpose**: Detect and log performance drift

```sql
CREATE TABLE agent_drift_alerts (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  alert_type TEXT NOT NULL, -- 'accuracy_drop', 'latency_increase', 'cost_spike', 'confidence_drop'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Drift details
  metric_name TEXT NOT NULL,
  baseline_value DECIMAL(10,4),
  current_value DECIMAL(10,4),
  drift_magnitude DECIMAL(10,4),
  drift_percentage DECIMAL(5,2),
  
  -- Statistical test
  test_name TEXT, -- 'kolmogorov_smirnov', 't_test', 'chi_square'
  p_value DECIMAL(10,8),
  is_significant BOOLEAN,
  
  -- Context
  detection_window_days INTEGER,
  affected_interactions INTEGER,
  
  -- Resolution
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_drift_agent_status (agent_id, status, created_at DESC)
);
```

### 4. agent_fairness_metrics
**Purpose**: Track bias and fairness across demographics

```sql
CREATE TABLE agent_fairness_metrics (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  metric_date DATE NOT NULL,
  
  -- Protected attribute
  protected_attribute TEXT NOT NULL, -- 'age_group', 'gender', 'region', 'ethnicity'
  attribute_value TEXT NOT NULL, -- e.g., '18-30', 'female', 'northeast'
  
  -- Metrics per group
  total_interactions INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  avg_confidence DECIMAL(5,4),
  avg_response_time_ms INTEGER,
  escalation_rate DECIMAL(5,4),
  
  -- Fairness indicators
  success_rate DECIMAL(5,4),
  demographic_parity DECIMAL(5,4), -- Difference from overall rate
  equal_opportunity DECIMAL(5,4), -- TPR difference
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, metric_date, protected_attribute, attribute_value)
);
```

---

## 📁 File Structure

```
services/ai-engine/src/
├── monitoring/
│   ├── __init__.py
│   ├── clinical_monitor.py          # Clinical AI metrics
│   ├── fairness_monitor.py          # Bias detection
│   ├── drift_detector.py            # Performance drift
│   ├── prometheus_metrics.py        # Prometheus exporters
│   └── models.py                    # Pydantic models
├── api/routes/
│   └── monitoring.py                # Monitoring API endpoints
└── grafana-dashboards/
    ├── agentos-performance.json     # Response times, throughput
    ├── agentos-quality.json         # Accuracy, confidence
    ├── agentos-safety.json          # Safety gates, escalations
    └── agentos-fairness.json        # Demographic parity

tests/
└── monitoring/
    ├── test_clinical_monitor.py
    ├── test_fairness_monitor.py
    ├── test_drift_detector.py
    └── test_integration.py
```

---

## 🔨 Implementation Tasks

### Task 1: Database Migration (15 min)
- Create `20251123_create_monitoring_tables.sql`
- 4 tables: interaction_logs, diagnostic_metrics, drift_alerts, fairness_metrics
- Indexes for performance
- Comments for documentation

### Task 2: Clinical Monitor (45 min)
- `clinical_monitor.py` with ClinicalAIMonitor class
- Methods:
  - `log_interaction()` - Log every agent interaction
  - `calculate_diagnostic_metrics()` - Compute sensitivity, specificity, etc.
  - `get_performance_report()` - Generate reports
  - `check_quality_thresholds()` - Alert on quality drops

### Task 3: Fairness Monitor (30 min)
- `fairness_monitor.py` with FairnessMonitor class
- Methods:
  - `calculate_fairness_metrics()` - Per-group metrics
  - `detect_bias()` - Statistical bias tests
  - `get_demographic_parity()` - Calculate parity
  - `generate_fairness_report()` - Compliance reports

### Task 4: Drift Detector (30 min)
- `drift_detector.py` with DriftDetector class
- Methods:
  - `detect_accuracy_drift()` - K-S test for accuracy
  - `detect_latency_drift()` - T-test for response time
  - `detect_cost_drift()` - Monitor cost increases
  - `create_alert()` - Generate drift alerts

### Task 5: Prometheus Metrics (20 min)
- `prometheus_metrics.py` with metric definitions
- Counters: requests, errors, escalations
- Histograms: latency, confidence
- Gauges: active agents, queue depth

### Task 6: Monitoring API (20 min)
- `api/routes/monitoring.py`
- Endpoints:
  - GET `/v1/monitoring/agents/{agent_id}/metrics`
  - GET `/v1/monitoring/agents/{agent_id}/drift-alerts`
  - GET `/v1/monitoring/fairness/report`
  - GET `/v1/monitoring/health`

### Task 7: Grafana Dashboards (30 min)
- 4 JSON dashboard definitions
- Performance: latency, throughput, errors
- Quality: accuracy, confidence, escalations
- Safety: oversight triggers, gates applied
- Fairness: demographic parity, bias alerts

### Task 8: Integration (20 min)
- Update `ask_expert.py` to call monitors
- Add monitoring to evidence-based selector
- Log all interactions with full context

### Task 9: Tests (30 min)
- Unit tests for each monitor
- Integration tests for full flow
- Test drift detection alerts
- Test fairness calculations

### Task 10: Documentation (20 min)
- Monitoring guide
- Metrics definitions
- Alert response procedures
- Compliance reporting

---

## 🎯 Success Criteria

### Functional:
- ✅ All interactions logged to database
- ✅ Diagnostic metrics calculated daily
- ✅ Drift detection operational
- ✅ Fairness metrics tracked
- ✅ Prometheus metrics exported
- ✅ Grafana dashboards functional

### Quality:
- ✅ Sensitivity/specificity calculated correctly
- ✅ Demographic parity < 0.1 threshold
- ✅ Drift alerts fire within 24h of detection
- ✅ No performance impact (< 50ms overhead)

### Compliance:
- ✅ Full audit trail maintained
- ✅ Protected attributes tracked
- ✅ Bias metrics meet regulatory standards
- ✅ Reports exportable for audits

---

## 📈 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Database migration | 15 min | 🔜 |
| Clinical monitor | 45 min | 🔜 |
| Fairness monitor | 30 min | 🔜 |
| Drift detector | 30 min | 🔜 |
| Prometheus metrics | 20 min | 🔜 |
| Monitoring API | 20 min | 🔜 |
| Grafana dashboards | 30 min | 🔜 |
| Integration | 20 min | 🔜 |
| Tests | 30 min | 🔜 |
| Documentation | 20 min | 🔜 |
| **TOTAL** | **~4 hours** | **Starting** |

---

## 🚀 Let's Begin!

Starting with Task 1: Database migration for monitoring tables...
