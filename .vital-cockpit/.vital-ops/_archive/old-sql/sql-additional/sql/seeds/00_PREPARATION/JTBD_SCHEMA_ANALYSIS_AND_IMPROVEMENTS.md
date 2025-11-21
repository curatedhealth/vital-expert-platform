# JTBD Schema: Normalization Analysis & Suggested Improvements

**Date:** 2025-11-17
**Status:** Analysis & Recommendations

---

## Normalization Analysis

### Current Normalization Level: **2NF-3NF (Mostly Good)**

The schema follows normalization principles reasonably well, but has some denormalization trade-offs for performance and flexibility.

### ✅ Well-Normalized Aspects

1. **Proper Entity Separation**
   - Core JTBD entity separated from related data
   - Junction tables for many-to-many relationships
   - Foreign key constraints enforced
   - No obvious transitive dependencies

2. **Good Table Design**
   - Primary keys on all tables
   - Unique constraints where appropriate
   - Proper indexing strategy
   - Tenant isolation implemented

3. **Relationship Modeling**
   - `jtbd_personas` - Clean many-to-many with metadata
   - `capability_jtbd_mapping` - Proper junction table
   - Cascade deletes configured correctly

### ⚠️ Normalization Issues & Trade-offs

#### 1. **Denormalized JSONB Columns in `jobs_to_be_done`**

```sql
-- Current denormalized fields
kpis                  jsonb     -- Could be separate table
pain_points           jsonb     -- Duplicates jtbd_obstacles
desired_outcomes      jsonb     -- Duplicates jtbd_outcomes
success_criteria      text[]    -- Could be structured table
```

**Analysis:**
- **Pros:** Flexible, easy to query nested data, good for document-style storage
- **Cons:** Harder to maintain referential integrity, potential data duplication, limited query optimization

**Recommendation:** Keep JSONB for unstructured/flexible data, but ensure related normalized tables are populated as the primary source of truth.

#### 2. **Array Columns for Structured Data**

```sql
-- In jtbd_workflow_stages
key_activities        text[]
pain_points           text[]

-- In jtbd_competitive_alternatives
strengths             text[]
weaknesses            text[]

-- In jtbd_gen_ai_opportunities
key_ai_capabilities   text[]
risks                 text[]
mitigation_strategies text[]
```

**Issue:** These could benefit from normalization for:
- Better querying and filtering
- Relationship tracking
- Metadata (priority, category, etc.)

#### 3. **Potential Data Redundancy**

- Pain points stored in both `jobs_to_be_done.pain_points` AND `jtbd_obstacles`
- Outcomes in both `jobs_to_be_done.desired_outcomes` AND `jtbd_outcomes`

---

## Suggested Improvements

### Priority 1: Core Enhancements (High Impact)

#### 1.1 **KPI Table (Normalize KPIs)**

```sql
CREATE TABLE jtbd_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    kpi_code text NOT NULL,  -- e.g., "KPI-001"
    kpi_name text NOT NULL,
    kpi_description text,
    kpi_type text CHECK (kpi_type IN ('time', 'cost', 'quality', 'volume', 'compliance')),

    -- Measurement
    measurement_unit text,  -- e.g., "hours", "dollars", "%"
    baseline_value numeric,
    target_value numeric,
    current_value numeric,

    -- Metadata
    data_source text,
    measurement_frequency frequency_type,
    owner text,
    priority priority_type DEFAULT 'medium',

    -- Tracking
    sequence_order integer DEFAULT 1,
    is_primary boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(jtbd_id, kpi_code)
);

CREATE INDEX idx_jtbd_kpis_jtbd_id ON jtbd_kpis(jtbd_id);
CREATE INDEX idx_jtbd_kpis_type ON jtbd_kpis(kpi_type);
CREATE INDEX idx_jtbd_kpis_priority ON jtbd_kpis(priority);
```

**Benefit:** Structured KPI tracking with historical data capability

#### 1.2 **Success Criteria Table**

```sql
CREATE TABLE jtbd_success_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    criterion_text text NOT NULL,
    criterion_type text CHECK (criterion_type IN ('quantitative', 'qualitative', 'behavioral', 'outcome')),
    measurement_method text,
    acceptance_threshold text,

    -- Validation
    is_measurable boolean DEFAULT true,
    validation_status text CHECK (validation_status IN ('draft', 'validated', 'deprecated')),
    validation_date date,

    -- Priority
    priority priority_type DEFAULT 'medium',
    sequence_order integer DEFAULT 1,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_success_criteria_jtbd_id ON jtbd_success_criteria(jtbd_id);
```

#### 1.3 **Workflow Activities Table (Normalize key_activities)**

```sql
CREATE TABLE jtbd_workflow_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_stage_id uuid NOT NULL REFERENCES jtbd_workflow_stages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    activity_name text NOT NULL,
    activity_description text,
    activity_type text CHECK (activity_type IN ('manual', 'automated', 'decision', 'review', 'approval')),

    -- Execution
    typical_duration text,  -- e.g., "2 hours"
    effort_level text CHECK (effort_level IN ('low', 'medium', 'high', 'very_high')),
    automation_potential numeric(3,2) CHECK (automation_potential BETWEEN 0 AND 1),

    -- Dependencies
    depends_on_activity_id uuid REFERENCES jtbd_workflow_activities(id),
    is_critical_path boolean DEFAULT false,
    is_bottleneck boolean DEFAULT false,

    -- Resources
    required_skills text[],
    required_tools text[],
    required_data text[],

    sequence_order integer DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_workflow_activities_stage_id ON jtbd_workflow_activities(workflow_stage_id);
CREATE INDEX idx_jtbd_workflow_activities_type ON jtbd_workflow_activities(activity_type);
CREATE INDEX idx_jtbd_workflow_activities_critical ON jtbd_workflow_activities(is_critical_path) WHERE is_critical_path = true;
CREATE INDEX idx_jtbd_workflow_activities_bottleneck ON jtbd_workflow_activities(is_bottleneck) WHERE is_bottleneck = true;
```

**Benefit:** Detailed workflow analysis, bottleneck identification, automation targeting

#### 1.4 **JTBD Dependencies Table**

```sql
CREATE TABLE jtbd_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    dependent_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,

    dependency_type text NOT NULL CHECK (dependency_type IN (
        'prerequisite',      -- Must be completed before
        'parallel',          -- Can be done simultaneously
        'related',           -- Related but not blocking
        'alternative',       -- Alternative approach
        'complementary'      -- Enhances but not required
    )),

    strength text CHECK (strength IN ('weak', 'medium', 'strong')),
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(source_jtbd_id, dependent_jtbd_id),
    CHECK (source_jtbd_id != dependent_jtbd_id)  -- Prevent self-reference
);

CREATE INDEX idx_jtbd_dependencies_source ON jtbd_dependencies(source_jtbd_id);
CREATE INDEX idx_jtbd_dependencies_dependent ON jtbd_dependencies(dependent_jtbd_id);
CREATE INDEX idx_jtbd_dependencies_type ON jtbd_dependencies(dependency_type);
```

**Benefit:** Understand job sequences, identify critical paths, optimize workflows

---

### Priority 2: Enhanced AI/ML Features

#### 2.1 **JTBD Tags & Classification**

```sql
CREATE TABLE jtbd_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    tag_name text NOT NULL,
    tag_category text,  -- e.g., "technology", "process", "stakeholder"
    tag_color text,
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(tenant_id, tag_name)
);

CREATE TABLE jtbd_tag_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES jtbd_tags(id) ON DELETE CASCADE,

    confidence_score numeric(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    source text CHECK (source IN ('manual', 'ai_generated', 'validated')),

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(jtbd_id, tag_id)
);

CREATE INDEX idx_jtbd_tag_mappings_jtbd ON jtbd_tag_mappings(jtbd_id);
CREATE INDEX idx_jtbd_tag_mappings_tag ON jtbd_tag_mappings(tag_id);
```

#### 2.2 **JTBD Similarity Matrix**

```sql
CREATE TABLE jtbd_similarity_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_a_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    jtbd_b_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,

    similarity_score numeric(4,3) CHECK (similarity_score BETWEEN 0 AND 1),
    similarity_type text CHECK (similarity_type IN (
        'semantic',          -- Based on text similarity
        'structural',        -- Based on workflow similarity
        'outcome',          -- Based on desired outcomes
        'persona',          -- Based on shared personas
        'context'           -- Based on similar context
    )),

    calculation_method text,  -- e.g., "cosine_similarity", "jaccard"
    calculated_at timestamptz NOT NULL DEFAULT now(),

    -- Vector embeddings for semantic search
    embedding_vector vector(1536),  -- pgvector extension

    UNIQUE(jtbd_a_id, jtbd_b_id, similarity_type),
    CHECK (jtbd_a_id < jtbd_b_id)  -- Prevent duplicates
);

CREATE INDEX idx_jtbd_similarity_a ON jtbd_similarity_scores(jtbd_a_id);
CREATE INDEX idx_jtbd_similarity_b ON jtbd_similarity_scores(jtbd_b_id);
CREATE INDEX idx_jtbd_similarity_score ON jtbd_similarity_scores(similarity_score DESC);

-- If using pgvector extension for semantic search
CREATE INDEX ON jtbd_similarity_scores USING ivfflat (embedding_vector vector_cosine_ops);
```

#### 2.3 **AI Recommendations & Insights**

```sql
CREATE TABLE jtbd_ai_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    recommendation_type text CHECK (recommendation_type IN (
        'automation_opportunity',
        'process_improvement',
        'tool_suggestion',
        'persona_mapping',
        'related_jtbd',
        'risk_mitigation',
        'value_enhancement'
    )),

    title text NOT NULL,
    description text NOT NULL,
    rationale text,

    -- Scoring
    confidence_score numeric(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    potential_impact text CHECK (potential_impact IN ('low', 'medium', 'high', 'very_high')),
    implementation_effort text CHECK (implementation_effort IN ('low', 'medium', 'high', 'very_high')),

    -- AI Metadata
    model_name text,
    model_version text,
    prompt_used text,

    -- Status
    status text CHECK (status IN ('pending_review', 'accepted', 'rejected', 'implemented')) DEFAULT 'pending_review',
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_ai_recommendations_jtbd_id ON jtbd_ai_recommendations(jtbd_id);
CREATE INDEX idx_jtbd_ai_recommendations_type ON jtbd_ai_recommendations(recommendation_type);
CREATE INDEX idx_jtbd_ai_recommendations_status ON jtbd_ai_recommendations(status);
CREATE INDEX idx_jtbd_ai_recommendations_impact ON jtbd_ai_recommendations(potential_impact);
```

---

### Priority 3: Enhanced Analytics & Tracking

#### 3.1 **JTBD Metrics History**

```sql
CREATE TABLE jtbd_metrics_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    kpi_id uuid REFERENCES jtbd_kpis(id) ON DELETE SET NULL,

    metric_date date NOT NULL,
    metric_value numeric,
    metric_unit text,

    -- Context
    data_source text,
    collection_method text,
    sample_size integer,
    confidence_level numeric(3,2),

    notes text,

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(jtbd_id, kpi_id, metric_date)
);

CREATE INDEX idx_jtbd_metrics_history_jtbd_id ON jtbd_metrics_history(jtbd_id);
CREATE INDEX idx_jtbd_metrics_history_kpi_id ON jtbd_metrics_history(kpi_id);
CREATE INDEX idx_jtbd_metrics_history_date ON jtbd_metrics_history(metric_date DESC);
```

#### 3.2 **JTBD Adoption Tracking**

```sql
CREATE TABLE jtbd_adoption_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    period_start date NOT NULL,
    period_end date NOT NULL,

    -- Execution metrics
    execution_count integer,
    successful_completions integer,
    average_duration interval,
    median_duration interval,

    -- User metrics
    unique_users integer,
    active_personas uuid[],  -- Array of persona IDs

    -- Quality metrics
    average_satisfaction_score numeric(3,2),
    nps_score integer CHECK (nps_score BETWEEN -100 AND 100),
    error_rate numeric(4,2),

    -- Efficiency metrics
    time_saved interval,
    cost_saved numeric,
    automation_rate numeric(3,2) CHECK (automation_rate BETWEEN 0 AND 1),

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(jtbd_id, period_start, period_end)
);

CREATE INDEX idx_jtbd_adoption_metrics_jtbd_id ON jtbd_adoption_metrics(jtbd_id);
CREATE INDEX idx_jtbd_adoption_metrics_period ON jtbd_adoption_metrics(period_start, period_end);
```

---

### Priority 4: Stakeholder & Collaboration

#### 4.1 **JTBD Stakeholders**

```sql
CREATE TABLE jtbd_stakeholders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    stakeholder_type text CHECK (stakeholder_type IN (
        'executor',          -- Performs the job
        'manager',           -- Manages the job
        'sponsor',           -- Sponsors/funds the job
        'beneficiary',       -- Benefits from job completion
        'approver',          -- Approves job execution
        'contributor',       -- Contributes to job
        'observer'           -- Observes/monitors job
    )),

    -- Link to persona or custom stakeholder
    persona_id uuid REFERENCES personas(id) ON DELETE SET NULL,
    stakeholder_name text,  -- For external/custom stakeholders
    stakeholder_role text,
    stakeholder_organization text,

    -- Engagement
    involvement_level text CHECK (involvement_level IN ('high', 'medium', 'low')),
    decision_authority text CHECK (decision_authority IN ('final', 'recommend', 'inform', 'none')),

    notes text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_stakeholders_jtbd_id ON jtbd_stakeholders(jtbd_id);
CREATE INDEX idx_jtbd_stakeholders_type ON jtbd_stakeholders(stakeholder_type);
CREATE INDEX idx_jtbd_stakeholders_persona_id ON jtbd_stakeholders(persona_id);
```

#### 4.2 **JTBD Comments & Discussions**

```sql
CREATE TABLE jtbd_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Optional: Reference specific aspect of JTBD
    context_type text CHECK (context_type IN ('general', 'outcome', 'obstacle', 'workflow', 'gen_ai')),
    context_id uuid,  -- ID of the specific outcome, obstacle, etc.

    comment_text text NOT NULL,
    comment_type text CHECK (comment_type IN ('question', 'suggestion', 'concern', 'insight', 'validation')),

    -- Threading
    parent_comment_id uuid REFERENCES jtbd_comments(id) ON DELETE CASCADE,

    -- Author
    author_id uuid REFERENCES auth.users(id),
    author_name text,

    -- Status
    is_resolved boolean DEFAULT false,
    resolved_at timestamptz,
    resolved_by uuid REFERENCES auth.users(id),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_comments_jtbd_id ON jtbd_comments(jtbd_id);
CREATE INDEX idx_jtbd_comments_parent ON jtbd_comments(parent_comment_id);
CREATE INDEX idx_jtbd_comments_context ON jtbd_comments(context_type, context_id);
CREATE INDEX idx_jtbd_comments_unresolved ON jtbd_comments(is_resolved) WHERE is_resolved = false;
```

---

### Priority 5: Integration & Extensions

#### 5.1 **JTBD-Content Mapping**

```sql
CREATE TABLE jtbd_content_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,

    content_type text CHECK (content_type IN (
        'documentation',
        'training_material',
        'video',
        'case_study',
        'best_practice',
        'sop',
        'template',
        'tool'
    )),

    content_id uuid,  -- Reference to content table
    content_url text,
    content_title text NOT NULL,
    content_description text,

    relevance_score numeric(3,2) CHECK (relevance_score BETWEEN 0 AND 1),

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_content_mappings_jtbd_id ON jtbd_content_mappings(jtbd_id);
CREATE INDEX idx_jtbd_content_mappings_type ON jtbd_content_mappings(content_type);
```

#### 5.2 **JTBD-Project Mapping**

```sql
CREATE TABLE jtbd_project_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    project_id uuid NOT NULL,  -- Reference to project management system

    project_type text CHECK (project_type IN ('improvement', 'automation', 'tool_implementation', 'process_redesign')),

    -- Targeting
    targeted_outcomes uuid[],  -- Array of outcome IDs
    targeted_obstacles uuid[], -- Array of obstacle IDs

    -- Status
    project_status text CHECK (project_status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    expected_impact text,
    actual_impact text,

    start_date date,
    end_date date,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jtbd_project_mappings_jtbd_id ON jtbd_project_mappings(jtbd_id);
CREATE INDEX idx_jtbd_project_mappings_status ON jtbd_project_mappings(project_status);
```

---

## Enhanced Query Examples

### 1. Complete JTBD with All Enhancements

```sql
WITH jtbd_complete AS (
    SELECT
        j.*,

        -- KPIs
        COUNT(DISTINCT k.id) as kpi_count,
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'code', k.kpi_code,
            'name', k.kpi_name,
            'current', k.current_value,
            'target', k.target_value
        )) FILTER (WHERE k.id IS NOT NULL) as kpis,

        -- Success Criteria
        COUNT(DISTINCT sc.id) as success_criteria_count,

        -- Workflow
        COUNT(DISTINCT ws.id) as workflow_stages,
        COUNT(DISTINCT wa.id) as workflow_activities,
        COUNT(DISTINCT wa.id) FILTER (WHERE wa.is_bottleneck) as bottlenecks,

        -- Dependencies
        COUNT(DISTINCT jd_out.id) as dependent_jobs,
        COUNT(DISTINCT jd_in.id) as prerequisite_jobs,

        -- AI Insights
        ago.automation_potential_score,
        ago.augmentation_potential_score,
        COUNT(DISTINCT air.id) FILTER (WHERE air.status = 'pending_review') as pending_recommendations,

        -- Stakeholders
        COUNT(DISTINCT jst.id) as stakeholder_count,

        -- Adoption
        am.execution_count as recent_executions,
        am.automation_rate,

        -- Similarity (top 3 similar JTBDs)
        (
            SELECT JSON_AGG(similar_jtbd)
            FROM (
                SELECT
                    j2.code,
                    j2.name,
                    jss.similarity_score
                FROM jtbd_similarity_scores jss
                JOIN jobs_to_be_done j2 ON (
                    CASE
                        WHEN jss.jtbd_a_id = j.id THEN jss.jtbd_b_id
                        ELSE jss.jtbd_a_id
                    END = j2.id
                )
                WHERE jss.jtbd_a_id = j.id OR jss.jtbd_b_id = j.id
                ORDER BY jss.similarity_score DESC
                LIMIT 3
            ) similar_jtbd
        ) as similar_jobs

    FROM jobs_to_be_done j
    LEFT JOIN jtbd_kpis k ON k.jtbd_id = j.id
    LEFT JOIN jtbd_success_criteria sc ON sc.jtbd_id = j.id
    LEFT JOIN jtbd_workflow_stages ws ON ws.jtbd_id = j.id
    LEFT JOIN jtbd_workflow_activities wa ON wa.workflow_stage_id = ws.id
    LEFT JOIN jtbd_dependencies jd_out ON jd_out.source_jtbd_id = j.id
    LEFT JOIN jtbd_dependencies jd_in ON jd_in.dependent_jtbd_id = j.id
    LEFT JOIN jtbd_gen_ai_opportunities ago ON ago.jtbd_id = j.id
    LEFT JOIN jtbd_ai_recommendations air ON air.jtbd_id = j.id
    LEFT JOIN jtbd_stakeholders jst ON jst.jtbd_id = j.id
    LEFT JOIN LATERAL (
        SELECT * FROM jtbd_adoption_metrics
        WHERE jtbd_id = j.id
        ORDER BY period_end DESC
        LIMIT 1
    ) am ON true

    WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND j.deleted_at IS NULL

    GROUP BY j.id, ago.automation_potential_score, ago.augmentation_potential_score,
             am.execution_count, am.automation_rate
)
SELECT * FROM jtbd_complete
ORDER BY code;
```

### 2. Bottleneck Analysis

```sql
SELECT
    j.code,
    j.name,
    ws.stage_name,
    wa.activity_name,
    wa.typical_duration,
    wa.effort_level,
    wa.automation_potential,
    COUNT(DISTINCT jo.id) as related_obstacles
FROM jobs_to_be_done j
JOIN jtbd_workflow_stages ws ON ws.jtbd_id = j.id
JOIN jtbd_workflow_activities wa ON wa.workflow_stage_id = ws.id
LEFT JOIN jtbd_obstacles jo ON jo.jtbd_id = j.id
WHERE wa.is_bottleneck = true
  AND j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
GROUP BY j.code, j.name, ws.stage_name, wa.activity_name,
         wa.typical_duration, wa.effort_level, wa.automation_potential
ORDER BY wa.automation_potential DESC;
```

### 3. AI Opportunity Prioritization

```sql
WITH ai_opportunities AS (
    SELECT
        j.code,
        j.name,
        j.complexity,
        j.frequency,
        ago.automation_potential_score,
        ago.augmentation_potential_score,
        ago.implementation_complexity,
        COUNT(DISTINCT wa.id) FILTER (WHERE wa.automation_potential > 0.7) as high_automation_activities,
        COUNT(DISTINCT air.id) FILTER (WHERE air.recommendation_type = 'automation_opportunity' AND air.status = 'pending_review') as pending_recommendations,

        -- Calculate priority score
        (ago.automation_potential_score * 0.4 +
         ago.augmentation_potential_score * 0.3 +
         CASE j.frequency
            WHEN 'daily' THEN 10
            WHEN 'weekly' THEN 7
            WHEN 'monthly' THEN 5
            ELSE 3
         END * 0.2 +
         COUNT(DISTINCT wa.id) FILTER (WHERE wa.automation_potential > 0.7) * 0.1
        ) as ai_priority_score

    FROM jobs_to_be_done j
    JOIN jtbd_gen_ai_opportunities ago ON ago.jtbd_id = j.id
    LEFT JOIN jtbd_workflow_stages ws ON ws.jtbd_id = j.id
    LEFT JOIN jtbd_workflow_activities wa ON wa.workflow_stage_id = ws.id
    LEFT JOIN jtbd_ai_recommendations air ON air.jtbd_id = j.id
    WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND j.deleted_at IS NULL
    GROUP BY j.id, j.code, j.name, j.complexity, j.frequency,
             ago.automation_potential_score, ago.augmentation_potential_score,
             ago.implementation_complexity
)
SELECT *,
    CASE
        WHEN ai_priority_score >= 8 THEN 'Critical'
        WHEN ai_priority_score >= 6 THEN 'High'
        WHEN ai_priority_score >= 4 THEN 'Medium'
        ELSE 'Low'
    END as priority_category
FROM ai_opportunities
ORDER BY ai_priority_score DESC;
```

---

## Implementation Roadmap

### Phase 1: Core Normalization (Week 1-2)
- [ ] Create `jtbd_kpis` table
- [ ] Create `jtbd_success_criteria` table
- [ ] Create `jtbd_workflow_activities` table
- [ ] Create `jtbd_dependencies` table
- [ ] Migrate data from JSONB fields

### Phase 2: AI/ML Enhancement (Week 3-4)
- [ ] Create `jtbd_tags` and `jtbd_tag_mappings`
- [ ] Create `jtbd_similarity_scores` (with pgvector)
- [ ] Create `jtbd_ai_recommendations`
- [ ] Build similarity calculation pipeline

### Phase 3: Analytics & Tracking (Week 5-6)
- [ ] Create `jtbd_metrics_history`
- [ ] Create `jtbd_adoption_metrics`
- [ ] Build dashboards and reporting

### Phase 4: Collaboration (Week 7-8)
- [ ] Create `jtbd_stakeholders`
- [ ] Create `jtbd_comments`
- [ ] Build collaboration UI

### Phase 5: Integration (Week 9-10)
- [ ] Create `jtbd_content_mappings`
- [ ] Create `jtbd_project_mappings`
- [ ] Build integration APIs

---

## Benefits Summary

### Data Quality
- ✅ Better referential integrity
- ✅ Structured querying
- ✅ Historical tracking
- ✅ Reduced redundancy

### Analytics
- ✅ Trend analysis
- ✅ Bottleneck identification
- ✅ ROI measurement
- ✅ Adoption tracking

### AI/ML
- ✅ Semantic search
- ✅ Recommendation engine
- ✅ Similarity matching
- ✅ Auto-classification

### Collaboration
- ✅ Stakeholder visibility
- ✅ Discussion threads
- ✅ Review workflows
- ✅ Knowledge sharing

---

**Conclusion:** The current schema is well-designed but can be significantly enhanced with these additions for better analytics, AI capabilities, and collaboration features while maintaining normalization principles.
