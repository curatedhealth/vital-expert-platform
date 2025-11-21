# Gen AI Opportunity Framework - Alignment with Gold Standard
## Mapping Gen AI Opportunities to Universal Archetypes

**Date**: 2025-01-27  
**Purpose**: Align Gen AI opportunity identification with existing Automator/Orchestrator/Learner/Skeptic framework  
**Reference**: `.claude/vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md`

---

## ✅ Framework Alignment

Your existing **4 Universal Archetypes** perfectly align with Gen AI opportunity mapping:

| Archetype | AI Maturity | Work Complexity | Gen AI Opportunity Type |
|---|---|---|---|
| **Automator** | High | Routine | Automation & Efficiency |
| **Orchestrator** | High | Strategic | Intelligence Augmentation |
| **Learner** | Low | Routine | Guided Automation & Learning |
| **Skeptic** | Low | Strategic | Transparency & Trust Building |

---

## 🎯 Gen AI Opportunity Mapping by Archetype

### 1. AUTOMATOR (High AI Maturity + Routine Work)

#### Gen AI Opportunities
**Primary Focus**: Automation & Efficiency

| Opportunity Type | Example Use Cases | JTBD Alignment | Service Layer |
|---|---|---|---|
| **Workflow Automation** | Document generation, report compilation, data extraction | "Complete routine tasks 3x faster" | Workflows |
| **Template Generation** | Standardized outputs, compliance forms, routine communications | "Eliminate manual data entry" | Workflows + Templates |
| **Batch Processing** | Bulk operations, mass updates, scheduled tasks | "Automate repetitive workflows" | Workflows |
| **Data Extraction** | Extract structured data from unstructured sources | "Get consistent, reliable outputs" | Workflows + Ask Expert |

#### Platform Behavior
- ✅ Proactive automation suggestions
- ✅ Template library access
- ✅ Batch processing capabilities
- ✅ Integration with existing tools (Veeva, Salesforce, etc.)
- ✅ Minimal UI, maximum efficiency

#### JTBD Examples
- "Complete routine tasks 3x faster"
- "Eliminate manual data entry"
- "Automate compliance checks"
- "Generate standard reports automatically"
- "Reduce time spent on repetitive work from 10 hours/week to 2 hours/week"

#### Success Metrics
- Time savings (hours/week)
- Automation adoption rate
- Template usage frequency
- Error reduction percentage

---

### 2. ORCHESTRATOR (High AI Maturity + Strategic Work)

#### Gen AI Opportunities
**Primary Focus**: Intelligence Augmentation

| Opportunity Type | Example Use Cases | JTBD Alignment | Service Layer |
|---|---|---|---|
| **Multi-Agent Reasoning** | Complex analysis requiring multiple expert perspectives | "Synthesize evidence from 20+ sources" | Ask Panel |
| **Cross-Functional Synthesis** | Integrate insights across Medical, Commercial, Regulatory | "Identify patterns across therapeutic areas" | Ask Panel |
| **Strategic Scenario Planning** | What-if analysis, competitive intelligence, market scenarios | "Generate strategic scenarios" | Ask Panel + Solution Builder |
| **Evidence Gap Analysis** | Identify missing evidence, research gaps, opportunity areas | "Collaborate across 5+ functions" | Ask Panel |
| **Complex Problem Solving** | Multi-step reasoning, hypothesis generation, solution design | "Make better strategic decisions faster" | Ask Panel + Workflows |

#### Platform Behavior
- ✅ Access to expert panels (multi-agent reasoning)
- ✅ Deep reasoning capabilities (CoT, ReAct)
- ✅ Multi-source synthesis
- ✅ Strategic workflow support
- ✅ Cross-functional collaboration tools
- ✅ Canvas-style interface for complex thinking

#### JTBD Examples
- "Synthesize evidence from 20+ sources into strategic recommendations"
- "Identify patterns across therapeutic areas and markets"
- "Generate strategic scenarios for portfolio planning"
- "Collaborate across 5+ functions to solve complex problems"
- "Make better strategic decisions faster with comprehensive analysis"

#### Success Metrics
- Decision quality improvement
- Time to insight (hours → minutes)
- Cross-functional collaboration frequency
- Strategic outcome achievement rate

---

### 3. LEARNER (Low AI Maturity + Routine Work)

#### Gen AI Opportunities
**Primary Focus**: Guided Automation & Learning

| Opportunity Type | Example Use Cases | JTBD Alignment | Service Layer |
|---|---|---|---|
| **Guided Workflows** | Step-by-step automation with explanations | "Learn how to use AI tools effectively" | Workflows (Guided Mode) |
| **Template Libraries** | Pre-built templates with examples and best practices | "Get step-by-step guidance" | Templates + Ask Expert |
| **Learning Mode** | Progressive complexity, tips, and tutorials | "Build confidence with automation" | Ask Expert + Onboarding |
| **Error Prevention** | Validation, checks, and safety nets | "Reduce errors in routine tasks" | Workflows + Validation |
| **Progressive Complexity** | Start simple, gradually increase sophistication | "Understand best practices" | All layers (progressive) |

#### Platform Behavior
- ✅ Onboarding and tutorials
- ✅ Guided workflows with explanations
- ✅ Example templates with annotations
- ✅ Progress tracking and milestones
- ✅ Success metrics and feedback
- ✅ Wizard-style interface for complex tasks

#### JTBD Examples
- "Learn how to use AI tools effectively"
- "Get step-by-step guidance for routine tasks"
- "Build confidence with automation"
- "Understand best practices for my role"
- "Reduce errors in routine work"

#### Success Metrics
- Learning curve (time to proficiency)
- Error reduction percentage
- Confidence score improvement
- Feature adoption progression
- User satisfaction with guidance

---

### 4. SKEPTIC (Low AI Maturity + Strategic Work)

#### Gen AI Opportunities
**Primary Focus**: Transparency & Trust Building

| Opportunity Type | Example Use Cases | JTBD Alignment | Service Layer |
|---|---|---|---|
| **Transparent Reasoning** | Show step-by-step AI thinking process | "Maintain quality and compliance" | Ask Panel (Transparent Mode) |
| **Citation & Source Tracking** | Every claim backed by source, full audit trail | "Understand AI recommendations" | Ask Panel + Citations |
| **Human-in-the-Loop** | Review checkpoints, approval gates, validation | "Control and validate outputs" | Workflows (HITL Mode) |
| **Quality Assurance** | Validation, compliance checks, risk assessment | "Preserve existing workflows" | All layers + QA |
| **Gradual Adoption** | Start with low-risk use cases, expand gradually | "See clear ROI before adopting" | Conservative rollout |

#### Platform Behavior
- ✅ Full transparency (show reasoning)
- ✅ Citation and source tracking
- ✅ Human review checkpoints
- ✅ Quality metrics and validation
- ✅ Conservative, proven use cases first
- ✅ Split-screen interface (AI output + validation)

#### JTBD Examples
- "Maintain quality and compliance standards"
- "Understand how AI reached its recommendations"
- "Control and validate all AI outputs"
- "Preserve existing workflows while gaining efficiency"
- "See clear ROI before adopting new tools"

#### Success Metrics
- Trust score improvement
- Validation checkpoint usage
- Quality assurance pass rate
- Gradual feature adoption
- Risk mitigation effectiveness

---

## 📊 Opportunity Discovery Framework

### Step 1: Identify Persona Archetype
Use existing inference algorithm from `PERSONA_STRATEGY_GOLD_STANDARD.md`:
- Calculate **Work Complexity Score** from: seniority, team size, budget, stakeholders
- Calculate **AI Maturity Score** from: adoption, risk tolerance, pain points, goals
- Assign archetype automatically

### Step 2: Map to Gen AI Opportunities
Based on archetype, identify relevant opportunities:

```sql
-- Example: Find Gen AI opportunities for Automators
SELECT 
    o.opportunity_name,
    o.opportunity_description,
    o.opportunity_type,
    o.estimated_roi,
    COUNT(DISTINCT p.id) as automator_count
FROM opportunities o
JOIN opportunity_archetypes oa ON o.id = oa.opportunity_id
JOIN personas p ON p.archetype = 'AUTOMATOR'
WHERE oa.archetype = 'AUTOMATOR'
  AND o.opportunity_type IN ('automation', 'efficiency', 'workflow')
GROUP BY o.id
ORDER BY automator_count DESC, o.estimated_roi DESC;
```

### Step 3: Score Opportunities (ODI Framework)
Use existing ODI scoring from gold standard:
- **Reach**: How many personas would benefit?
- **Impact**: How much value would it create?
- **Feasibility**: How easy is it to implement?
- **Adoption Readiness**: How likely are users to adopt?

### Step 4: Prioritize by Archetype
- **Automators**: Highest ROI, fastest adoption → Build first
- **Orchestrators**: High value, medium adoption → Build second
- **Learners**: Medium value, guided adoption → Build third
- **Skeptics**: Lower value, slow adoption → Build last (but critical for trust)

---

## 🔄 Integration with Existing Schema

### Use Existing Tables

**Core Persona Tables** (from `PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`):
- `personas` - Core persona data with `archetype` field
- `pain_points` - Map to Gen AI opportunities
- `goals` - Map to JTBD outcomes
- `challenges` - Identify friction points

**JTBD Tables**:
- `jtbds` - Jobs-To-Be-Done definitions
- `persona_jtbds` - Persona-JTBD mappings
- `jtbd_outcomes` - Desired outcomes

**Opportunity Tables**:
- `opportunities` - Gen AI opportunities
- `opportunity_jtbds` - Opportunity-JTBD mappings
- `opportunity_archetypes` - **NEW**: Map opportunities to archetypes

### Recommended Schema Addition

```sql
-- Add opportunity-archetype mapping
CREATE TABLE opportunity_archetypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    archetype archetype_type NOT NULL,
    priority_score DECIMAL(5,2), -- 0-100
    estimated_adoption_rate DECIMAL(5,2), -- 0-100
    estimated_roi_multiplier DECIMAL(5,2), -- e.g., 1.5x for Automators
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, archetype)
);

-- Add Gen AI opportunity type
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS gen_ai_opportunity_type VARCHAR(50); -- automation, augmentation, learning, trust

-- Add service layer mapping
CREATE TABLE opportunity_service_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    service_layer VARCHAR(50) NOT NULL, -- ask_expert, ask_panel, workflows, solution_builder
    priority INTEGER, -- 1-4, higher = more important
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Implementation Recommendations

### Phase 1: Enhance Existing Personas (Week 1-2)
1. ✅ Use existing archetype inference algorithm
2. ✅ Populate `work_pattern` field (routine vs strategic)
3. ✅ Add Gen AI opportunity tags to pain points
4. ✅ Map personas to JTBDs (if not already done)

### Phase 2: Opportunity Discovery (Week 3-4)
1. ✅ Analyze pain points by archetype
2. ✅ Identify Gen AI opportunities
3. ✅ Score opportunities using ODI framework
4. ✅ Map opportunities to service layers

### Phase 3: Platform Configuration (Week 5-6)
1. ✅ Configure service layer routing by archetype
2. ✅ Set up guided workflows for Learners
3. ✅ Enable transparency features for Skeptics
4. ✅ Optimize automation for Automators
5. ✅ Enable multi-agent reasoning for Orchestrators

### Phase 4: Analytics & Optimization (Week 7-8)
1. ✅ Track opportunity adoption by archetype
2. ✅ Measure ROI by persona type
3. ✅ Identify migration patterns (Learner → Automator)
4. ✅ Optimize based on usage data

---

## 📈 Success Metrics by Archetype

### Automator Metrics
- Time savings (hours/week)
- Automation adoption rate
- Template usage frequency
- Error reduction percentage

### Orchestrator Metrics
- Decision quality improvement
- Time to insight (hours → minutes)
- Cross-functional collaboration frequency
- Strategic outcome achievement rate

### Learner Metrics
- Learning curve (time to proficiency)
- Error reduction percentage
- Confidence score improvement
- Feature adoption progression

### Skeptic Metrics
- Trust score improvement
- Validation checkpoint usage
- Quality assurance pass rate
- Gradual feature adoption

---

## 🔗 Key Documents Reference

1. **Strategy**: `.claude/vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md`
2. **Schema**: `.claude/vital-expert-docs/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`
3. **Neo4j**: `.claude/vital-expert-docs/personas/PERSONA_NEO4J_ONTOLOGY.cypher`
4. **Implementation**: `.claude/vital-expert-docs/personas/IMPLEMENTATION_GUIDE.md`

---

## ✅ Next Steps

1. **Review** this alignment document
2. **Enhance** existing schema with opportunity-archetype mappings
3. **Analyze** existing personas to identify Gen AI opportunities
4. **Configure** platform behavior by archetype
5. **Track** adoption and ROI by persona type

---

**This framework leverages your existing gold standard while adding Gen AI opportunity discovery and mapping capabilities.**

