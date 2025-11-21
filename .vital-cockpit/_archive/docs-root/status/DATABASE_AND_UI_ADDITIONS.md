# Database Schema & UI Additions for Enhanced Agent Template
## Complete Implementation Plan

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### Strategy: Use `metadata` JSONB column for flexibility + a few dedicated columns

### 1. New Dedicated Columns (Add to `agents` table)

```sql
-- Add these columns directly to agents table for better indexing and query performance
ALTER TABLE agents ADD COLUMN IF NOT EXISTS architecture_pattern VARCHAR(50) DEFAULT 'REACTIVE';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reasoning_method VARCHAR(50) DEFAULT 'DIRECT'; -- DIRECT, COT, REACT, HYBRID
ALTER TABLE agents ADD COLUMN IF NOT EXISTS communication_tone VARCHAR(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS communication_style VARCHAR(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS primary_mission TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS value_proposition TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agents_architecture_pattern ON agents(architecture_pattern);
CREATE INDEX IF NOT EXISTS idx_agents_reasoning_method ON agents(reasoning_method);
```

### 2. Enhanced Metadata Structure (Store in `metadata` JSONB)

```json
{
  // ========== EXISTING (Keep as-is) ==========
  "tools": [...],
  "tool_keys": [...],
  "fitness_score": 89,
  "responsibilities": [...],

  // ========== NEW: Capabilities Detail ==========
  "capabilities_detail": {
    "expert": [
      {
        "name": "Protocol Design",
        "proficiency": 0.95,
        "proficiency_description": "Expert",
        "application": "Full protocol development from concept to submission",
        "years_experience_equivalent": 10
      }
    ],
    "competent": [
      "Budget estimation and resource planning",
      "Site selection criteria development",
      "Risk assessment and mitigation strategies"
    ],
    "limitations": [
      "Direct patient medical advice or diagnosis",
      "Legal contract negotiations",
      "Manufacturing or CMC guidance"
    ]
  },

  // ========== NEW: Behavioral Directives ==========
  "behavioral_directives": {
    "operating_principles": [
      {
        "name": "Patient Safety First",
        "description": "Every recommendation must prioritize participant wellbeing over study efficiency or cost",
        "priority": 1
      },
      {
        "name": "Evidence-Based Design",
        "description": "All protocol elements must be supported by peer-reviewed literature or regulatory precedent",
        "priority": 2
      }
    ],
    "decision_framework": [
      {
        "scenario": "designing dose escalation schemes",
        "always": "Use validated statistical models (3+3, CRM, BOIN)",
        "never": "Exceed MTD estimates from preclinical data without safety run-in",
        "consider": "PK/PD modeling results and ethnic sensitivity factors"
      }
    ],
    "communication_protocol": {
      "tone": "Professional and authoritative with empathetic consideration",
      "style": "Structured, precise, with medical terminology appropriately explained",
      "complexity_level": "Medical director and regulatory affairs professional level",
      "language_constraints": "Use standard medical abbreviations, define on first use",
      "response_structure": [
        "Executive summary with key recommendations",
        "Detailed rationale with evidence citations",
        "Risk-benefit analysis and alternative approaches",
        "Regulatory considerations and precedents"
      ]
    }
  },

  // ========== NEW: Reasoning Frameworks ==========
  "reasoning_frameworks": {
    "primary_method": "REACT", // DIRECT, COT, REACT, HYBRID
    "cot_config": {
      "enabled": true,
      "activation_triggers": [
        "Complex protocol design requiring multiple endpoints",
        "Sample size calculations with multiple assumptions",
        "Risk-benefit assessments for vulnerable populations",
        "Confidence below threshold (<0.75)"
      ],
      "steps_template": [
        "STEP 1: Clinical Question Analysis",
        "STEP 2: Regulatory Landscape Review",
        "STEP 3: Statistical Framework Design",
        "STEP 4: Operational Feasibility Assessment",
        "STEP 5: Risk Mitigation Planning",
        "STEP 6: Final Recommendation"
      ]
    },
    "react_config": {
      "enabled": true, // Tier 2+
      "max_iterations": 5,
      "loop_pattern": "THOUGHT → ACTION → OBSERVATION → REFLECTION → (repeat) → ANSWER"
    },
    "self_consistency_verification": {
      "enabled": false, // Tier 3 only
      "num_paths": 3,
      "consensus_threshold": 0.80,
      "divergence_handling": "present_all_options"
    },
    "metacognitive_monitoring": {
      "enabled": true,
      "check_questions": [
        "Is my reasoning grounded in evidence?",
        "Am I making unstated assumptions?",
        "Could there be alternative interpretations?",
        "Do I have sufficient information to proceed?"
      ]
    }
  },

  // ========== NEW: Tool Integration Detail ==========
  "tools_detail": [
    {
      "name": "regulatory_database_search",
      "display_name": "Regulatory Database Search",
      "purpose": "Guideline verification",
      "when_to_use": "Protocol elements require regulatory precedent",
      "rate_limit_per_hour": 20,
      "rate_limit_per_minute": 5,
      "cost_profile": "LOW", // LOW, MEDIUM, HIGH
      "cost_per_call": 0.001,
      "safety_checks": ["Version currency validation", "Guidance applicability check"],
      "expected_output": "Regulatory documents and guidance with citations",
      "timeout_ms": 5000,
      "retry_policy": "exponential_backoff",
      "max_retries": 3
    }
  ],
  "tool_chaining": {
    "sequential_patterns": [
      "regulatory_database → extract_requirements → synthesize_evidence"
    ],
    "parallel_patterns": [
      "[regulatory_database, clinical_trials_registry] → merge_results"
    ],
    "conditional_patterns": [
      "IF novel_indication THEN literature_search ELSE precedent_lookup"
    ]
  },

  // ========== NEW: Safety & Compliance Detail ==========
  "safety_compliance": {
    "prohibitions": [
      "Promotional activities or off-label promotion",
      "Pre-approval product promotion",
      "Bypassing medical/legal/regulatory review",
      "Sharing embargoed or confidential data publicly"
    ],
    "mandatory_protections": [
      "Patient privacy in all case studies or examples",
      "Intellectual property and proprietary information",
      "Fair market value compliance for HCP interactions"
    ],
    "regulatory_standards": [
      "PhRMA Code",
      "AdvaMed Code",
      "EFPIA Code",
      "ICH-GCP E6(R2)",
      "FDA 21 CFR Part 11"
    ],
    "compliance_frameworks": [
      "HIPAA",
      "GDPR",
      "CCPA",
      "FDA Regulations"
    ],
    "data_handling_policy": "Confidential handling of all HCP and patient data",
    "privacy_framework": "GDPR/CCPA compliance for all data processing",
    "audit_requirements": "Log all decisions, tool usage, and escalations"
  },

  // ========== NEW: Escalation Detail ==========
  "escalation_config": {
    "triggers": [
      {
        "trigger": "Strategic congress selection decisions",
        "condition": "Decision requires budget >$50K or strategic impact",
        "route_to_tier": 2,
        "route_to_role": "Medical Affairs Director",
        "urgency": "MEDIUM",
        "sla_hours": 24
      },
      {
        "trigger": "Serious adverse events",
        "condition": "Any SAE reported",
        "route_to_tier": 3,
        "route_to_role": "Medical Monitor",
        "urgency": "IMMEDIATE",
        "sla_hours": 1
      },
      {
        "trigger": "Confidence below threshold",
        "condition": "confidence < 0.70",
        "route_to_tier": 2,
        "route_to_role": "Senior Specialist",
        "urgency": "HIGH",
        "sla_hours": 4
      }
    ],
    "uncertainty_handling": {
      "low_confidence_threshold": 0.70,
      "medium_confidence_threshold": 0.85,
      "high_confidence_threshold": 0.95,
      "action_below_threshold": "Apply CoT reasoning, present options, request clarification"
    }
  },

  // ========== NEW: Output Specifications ==========
  "output_specifications": {
    "standard_format": {
      "include_confidence": true,
      "include_reasoning_trace": true,
      "include_evidence": true,
      "include_recommendations": true,
      "include_caveats": true,
      "include_metadata": true
    },
    "citation_format": "APA 7th Edition",
    "citation_requirements": {
      "minimum_sources": 2,
      "prefer_peer_reviewed": true,
      "include_publication_date": true,
      "include_relevance_score": true
    },
    "confidence_scale": {
      "0.95-1.0": "Extremely high confidence - verified facts, established knowledge",
      "0.85-0.95": "High confidence - strong evidence, clear reasoning",
      "0.70-0.85": "Good confidence - sound logic, adequate evidence",
      "0.50-0.70": "Moderate confidence - some uncertainty, multiple interpretations",
      "0.0-0.50": "Low confidence - insufficient information, high uncertainty, escalate if critical"
    }
  },

  // ========== NEW: Performance Targets ==========
  "quality_metrics": {
    "accuracy_target": 0.95,
    "response_time_target_ms": 2000,
    "completeness_target": 0.90,
    "user_satisfaction_target": 4.5,
    "reasoning_efficiency_target": 5, // max iterations
    "tool_utilization_efficiency": 0.85,
    "escalation_appropriateness": 0.95
  },

  // ========== NEW: Success Criteria ==========
  "success_criteria": {
    "task_completion": [
      "Protocol approval >90%",
      "Enrollment rate >80%",
      "Data quality >95%",
      "Zero GCP violations"
    ],
    "user_outcomes": [
      "Problem solved or path forward clear: >90%",
      "User confidence in answer: >4.5/5",
      "Efficiency gain vs manual: >60%"
    ],
    "compliance": [
      "Zero safety violations: 100%",
      "Zero regulatory violations: 100%",
      "Privacy protection: 100%"
    ]
  },

  // ========== NEW: Memory & Context (Future) ==========
  "memory_config": {
    "short_term_memory": {
      "enabled": true,
      "capacity_tokens": 4000,
      "retention_strategy": "PRIORITY", // FIFO, LIFO, PRIORITY
      "pruning_policy": "Remove oldest low-priority items",
      "critical_items": ["user_preferences", "session_context", "safety_flags"]
    },
    "long_term_memory": {
      "enabled": false,
      "storage_backend": "vector_db",
      "indexing_strategy": "SEMANTIC",
      "retrieval_method": "SIMILARITY",
      "update_frequency": "REALTIME"
    }
  },

  // ========== NEW: Multi-Agent Coordination (Future) ==========
  "multi_agent_config": {
    "enabled": false,
    "architecture_pattern": "HIERARCHICAL", // HIERARCHICAL, PEER_TO_PEER, BLACKBOARD
    "coordinator_agent_id": null,
    "communication_protocol": "MESSAGE_PASSING", // MESSAGE_PASSING, SHARED_MEMORY
    "specialist_agents": [],
    "consensus_mechanism": "WEIGHTED", // MAJORITY, UNANIMOUS, WEIGHTED
    "conflict_resolution": "ARBITER" // ARBITER, PRIORITY, NEGOTIATION
  },

  // ========== NEW: Learning & Improvement (Future) ==========
  "learning_config": {
    "feedback_incorporation": "MANUAL", // REALTIME, BATCH, MANUAL, DISABLED
    "knowledge_base_updates": "WEEKLY",
    "reasoning_pattern_refinement": true,
    "error_pattern_analysis": "DAILY",
    "self_assessment_enabled": true,
    "learning_rate": 0.1
  },

  // ========== NEW: Version Control ==========
  "version_control": {
    "current_version": "2.0",
    "previous_version": "1.5",
    "change_log": "Added ReAct framework, enhanced tool integration, improved safety protocols",
    "compatibility": "BACKWARD_COMPATIBLE", // BREAKING, BACKWARD_COMPATIBLE
    "migration_path": "Automatic migration, no action required",
    "deprecated_features": [],
    "new_features": ["ReAct reasoning", "Enhanced tool chaining", "Dynamic prompt generation"]
  }
}
```

---

## 🎨 UI MODAL ADDITIONS - Edit Agent Modal

### Current Tabs in Edit Agent Modal
1. ✅ Basic Info
2. ✅ Organization
3. ✅ Capabilities
4. ✅ Prompt Starters
5. ✅ Knowledge
6. ✅ Tools
7. ✅ Models

### NEW Tabs to Add

#### **Tab 8: Behavioral Settings** 🎯 (NEW)

**Sections:**

1. **Operating Principles**
   ```
   [+ Add Principle Button]

   Principle 1:
   ┌─────────────────────────────────────────────┐
   │ Name: [Patient Safety First            ]    │
   │ Priority: [1 ▼]                             │
   │ Description:                                 │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Every recommendation must prioritize... │ │
   │ └─────────────────────────────────────────┘ │
   │ [Remove]                                     │
   └─────────────────────────────────────────────┘
   ```

2. **Decision Framework**
   ```
   [+ Add Decision Rule Button]

   Rule 1:
   ┌─────────────────────────────────────────────┐
   │ Scenario: [designing dose escalation    ]  │
   │                                             │
   │ ALWAYS:                                      │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Use validated statistical models       │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ NEVER:                                       │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Exceed MTD without safety run-in       │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ CONSIDER:                                    │
   │ ┌─────────────────────────────────────────┐ │
   │ │ PK/PD modeling results                 │ │
   │ └─────────────────────────────────────────┘ │
   │ [Remove]                                     │
   └─────────────────────────────────────────────┘
   ```

3. **Communication Protocol**
   ```
   ┌─────────────────────────────────────────────┐
   │ Tone: [Professional and authoritative  ▼]   │
   │ Style: [Structured, precise            ▼]   │
   │ Complexity: [Medical director level    ▼]   │
   │                                             │
   │ Language Constraints:                        │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Use standard medical abbreviations     │ │
   │ └─────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
   ```

#### **Tab 9: Reasoning & Intelligence** 🧠 (NEW)

**Sections:**

1. **Architecture Pattern**
   ```
   ┌─────────────────────────────────────────────┐
   │ Pattern: ○ Reactive                          │
   │          ● Hybrid (Deliberative + Reactive)  │
   │          ○ Deliberative                      │
   │                                              │
   │ Primary Reasoning Method:                    │
   │ ○ Direct Response                            │
   │ ● Chain of Thought (CoT)                     │
   │ ○ ReAct (Reasoning + Acting)                 │
   │ ○ Hybrid (CoT + ReAct)                       │
   └─────────────────────────────────────────────┘
   ```

2. **Chain of Thought (CoT) Configuration**
   ```
   ┌─────────────────────────────────────────────┐
   │ ☑ Enable CoT Reasoning                       │
   │                                              │
   │ Activation Triggers:                         │
   │ [+ Add Trigger]                              │
   │ • Complex protocol design requiring...       │
   │ • Confidence below threshold (<0.75)         │
   │ • Multi-criteria decision making            │
   │                                              │
   │ Number of Steps: [6]                         │
   └─────────────────────────────────────────────┘
   ```

3. **ReAct Configuration** (Tier 2+)
   ```
   ┌─────────────────────────────────────────────┐
   │ ☑ Enable ReAct Reasoning (Tier 2+ only)      │
   │                                              │
   │ Max Iterations: [5]                          │
   │ Loop Pattern: THOUGHT → ACTION → OBSERVATION │
   │              → REFLECTION → ANSWER           │
   └─────────────────────────────────────────────┘
   ```

4. **Self-Consistency Verification** (Tier 3 only)
   ```
   ┌─────────────────────────────────────────────┐
   │ ☑ Enable Multi-Path Verification (Tier 3)    │
   │                                              │
   │ Number of Paths: [3]                         │
   │ Consensus Threshold: [0.80]                  │
   │ Divergence Handling: [Present all options▼] │
   └─────────────────────────────────────────────┘
   ```

5. **Metacognitive Monitoring**
   ```
   ┌─────────────────────────────────────────────┐
   │ ☑ Enable Metacognitive Self-Checks           │
   │                                              │
   │ Check Questions: [+ Add Question]            │
   │ • Is my reasoning grounded in evidence?     │
   │ • Am I making unstated assumptions?         │
   │ • Could there be alternative interpretations?│
   └─────────────────────────────────────────────┘
   ```

#### **Tab 10: Safety & Compliance** 🛡️ (ENHANCED)

**Sections:**

1. **Prohibitions (What Agent NEVER Does)**
   ```
   [+ Add Prohibition]

   ┌─────────────────────────────────────────────┐
   │ ✗ Promotional activities or off-label      │
   │ ✗ Pre-approval product promotion           │
   │ ✗ Bypassing medical/legal/regulatory review│
   │ ✗ [Add custom prohibition...]              │
   └─────────────────────────────────────────────┘
   ```

2. **Mandatory Protections (What Agent ALWAYS Ensures)**
   ```
   [+ Add Protection]

   ┌─────────────────────────────────────────────┐
   │ ✓ Patient privacy in all case studies      │
   │ ✓ Intellectual property protection         │
   │ ✓ Fair market value compliance             │
   │ ✓ [Add custom protection...]               │
   └─────────────────────────────────────────────┘
   ```

3. **Regulatory Standards**
   ```
   [+ Add Standard]

   Selected Standards:
   ☑ PhRMA Code
   ☑ AdvaMed Code
   ☑ ICH-GCP E6(R2)
   ☑ FDA 21 CFR Part 11
   ☐ ISO 14155
   ☐ Custom: [                    ]
   ```

4. **Compliance Frameworks**
   ```
   ☑ HIPAA
   ☑ GDPR
   ☑ CCPA
   ☐ FDA Regulations
   ☐ Custom: [                    ]
   ```

#### **Tab 11: Escalation Rules** ⬆️ (ENHANCED)

**Sections:**

1. **Escalation Triggers**
   ```
   [+ Add Escalation Rule]

   Rule 1:
   ┌─────────────────────────────────────────────┐
   │ Trigger: [Serious adverse events       ▼]   │
   │ Condition: [Any SAE reported              ] │
   │                                             │
   │ Route To:                                    │
   │ Tier: [3 ▼]                                  │
   │ Role: [Medical Monitor              ▼]      │
   │                                             │
   │ Urgency: ● Immediate  ○ High  ○ Medium      │
   │ SLA (hours): [1]                             │
   │                                             │
   │ [Remove Rule]                                │
   └─────────────────────────────────────────────┘

   Rule 2:
   ┌─────────────────────────────────────────────┐
   │ Trigger: [Confidence below threshold   ▼]   │
   │ Condition: [confidence < 0.70             ] │
   │ Route To Tier: [2 ▼]                         │
   │ Route To Role: [Senior Specialist       ▼]  │
   │ Urgency: ○ Immediate  ● High  ○ Medium      │
   │ SLA (hours): [4]                             │
   │ [Remove Rule]                                │
   └─────────────────────────────────────────────┘
   ```

2. **Confidence Thresholds**
   ```
   ┌─────────────────────────────────────────────┐
   │ Low Confidence: [0.70]                       │
   │ Medium Confidence: [0.85]                    │
   │ High Confidence: [0.95]                      │
   │                                              │
   │ Action When Below Threshold:                 │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Apply CoT reasoning, present options,  │ │
   │ │ request clarification                  │ │
   │ └─────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
   ```

#### **Tab 12: Output & Quality** 📊 (NEW)

**Sections:**

1. **Output Format Specifications**
   ```
   Standard Output Includes:
   ☑ Confidence Score
   ☑ Reasoning Trace
   ☑ Evidence/Citations
   ☑ Recommendations
   ☑ Caveats & Limitations
   ☑ Metadata
   ```

2. **Citation Requirements**
   ```
   ┌─────────────────────────────────────────────┐
   │ Citation Format: [APA 7th Edition      ▼]   │
   │ Minimum Sources: [2]                         │
   │ ☑ Prefer peer-reviewed sources               │
   │ ☑ Include publication date                   │
   │ ☑ Include relevance score                    │
   └─────────────────────────────────────────────┘
   ```

3. **Quality Metrics & Targets**
   ```
   ┌─────────────────────────────────────────────┐
   │ Accuracy Target: [0.95] (95%)                │
   │ Response Time Target: [2000] ms              │
   │ Completeness Target: [0.90] (90%)            │
   │ User Satisfaction Target: [4.5] /5.0         │
   │ Max Reasoning Iterations: [5]                │
   │ Tool Utilization Efficiency: [0.85] (85%)    │
   │ Escalation Appropriateness: [0.95] (95%)     │
   └─────────────────────────────────────────────┘
   ```

4. **Confidence Scale Guide**
   ```
   ┌─────────────────────────────────────────────┐
   │ 0.95-1.0:  Extremely high confidence        │
   │ 0.85-0.95: High confidence                  │
   │ 0.70-0.85: Good confidence                  │
   │ 0.50-0.70: Moderate confidence              │
   │ 0.0-0.50:  Low confidence - escalate        │
   └─────────────────────────────────────────────┘
   ```

#### **ENHANCED Tab: Capabilities** (Update existing)

**Add to existing Capabilities tab:**

1. **Expert Capabilities** (with proficiency)
   ```
   [+ Add Expert Capability]

   Expert Capability 1:
   ┌─────────────────────────────────────────────┐
   │ Name: [Protocol Design                    ] │
   │ Proficiency: [0.95] ████████████████████░   │
   │              (Expert - 95%)                  │
   │ Application:                                 │
   │ ┌─────────────────────────────────────────┐ │
   │ │ Full protocol development from concept │ │
   │ │ to submission                          │ │
   │ └─────────────────────────────────────────┘ │
   │ Years Experience Equiv: [10]                 │
   │ [Remove]                                     │
   └─────────────────────────────────────────────┘
   ```

2. **Competent Capabilities** (simpler list)
   ```
   [+ Add Competent Capability]

   ┌─────────────────────────────────────────────┐
   │ • Budget estimation and resource planning   │
   │ • Site selection criteria development       │
   │ • Risk assessment and mitigation           │
   │ • [Add capability...]                       │
   └─────────────────────────────────────────────┘
   ```

3. **Limitations** (explicit)
   ```
   [+ Add Limitation]

   ┌─────────────────────────────────────────────┐
   │ ✗ Direct patient medical advice or diagnosis│
   │ ✗ Legal contract negotiations               │
   │ ✗ Manufacturing or CMC guidance             │
   │ ✗ [Add limitation...]                       │
   └─────────────────────────────────────────────┘
   ```

#### **ENHANCED Tab: Tools** (Update existing)

**Add per-tool configuration:**

```
Tool: Regulatory Database Search
┌─────────────────────────────────────────────┐
│ Display Name: [Regulatory Database Search  ] │
│ Purpose: [Guideline verification          ] │
│ When to Use: [Protocol elements require...] │
│                                             │
│ Rate Limits:                                 │
│ Per Hour: [20]  Per Minute: [5]              │
│                                             │
│ Cost Profile: ○ Low  ● Medium  ○ High       │
│ Cost Per Call: [$0.001]                      │
│                                             │
│ Safety Checks: [+ Add Check]                 │
│ • Version currency validation                │
│ • Guidance applicability check              │
│                                             │
│ Timeout (ms): [5000]                         │
│ Max Retries: [3]                             │
│ Retry Policy: [Exponential Backoff      ▼]  │
└─────────────────────────────────────────────┘
```

**Tool Chaining Section:**
```
Tool Chaining Patterns:
┌─────────────────────────────────────────────┐
│ Sequential:                                  │
│ [+ Add Pattern]                              │
│ • regulatory_db → extract → synthesize      │
│                                             │
│ Parallel:                                    │
│ • [regulatory_db, trials_registry] → merge  │
│                                             │
│ Conditional:                                 │
│ • IF novel THEN literature ELSE precedent   │
└─────────────────────────────────────────────┘
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Critical (Implement First)

1. **Database Migration**:
   - Add new dedicated columns
   - Add metadata structure for:
     - `capabilities_detail`
     - `behavioral_directives`
     - `reasoning_frameworks`
     - `safety_compliance`
     - `escalation_config`

2. **UI Updates**:
   - **Tab 8: Behavioral Settings** (Operating Principles, Decision Framework)
   - **Enhanced Capabilities Tab** (Expert/Competent/Limitations with proficiency)
   - **Enhanced Safety Tab** (Prohibitions, Protections)

### Phase 2: Important (Next Sprint)

3. **Database**:
   - Add metadata for:
     - `tools_detail`
     - `output_specifications`
     - `quality_metrics`

4. **UI Updates**:
   - **Tab 9: Reasoning & Intelligence**
   - **Tab 11: Enhanced Escalation Rules**
   - **Tab 12: Output & Quality**
   - **Enhanced Tools Tab** (per-tool config, chaining)

### Phase 3: Advanced (Future)

5. **Database**:
   - Add metadata for:
     - `memory_config`
     - `multi_agent_config`
     - `learning_config`

6. **UI Updates**:
   - Memory & Context tab
   - Multi-Agent Coordination tab
   - Learning & Improvement tab

---

## 📋 NEXT STEPS

1. ✅ Review this plan
2. Create SQL migration script
3. Update TypeScript types
4. Implement UI components for new tabs
5. Update agent-creator form handling
6. Update dynamic prompt generator to use new fields
7. Test with sample data
8. Deploy and validate

Would you like me to proceed with creating the SQL migration script and TypeScript types?
