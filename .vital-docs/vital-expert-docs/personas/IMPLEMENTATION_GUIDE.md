# VITAL Persona System Implementation Guide
**Version**: 4.0 (Gold Standard)
**Date**: 2025-11-20
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Deliverables](#deliverables)
4. [Implementation Phases](#implementation-phases)
5. [Database Setup](#database-setup)
6. [Seeding Strategy](#seeding-strategy)
7. [API Integration](#api-integration)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)
10. [Support & Troubleshooting](#support--troubleshooting)

---

## Overview

This implementation guide provides step-by-step instructions for deploying the VITAL Platform's Universal Persona Strategy & Intelligence Framework across your organization.

### What You're Building

A **Dual-Purpose Persona Intelligence System** that:

1. **Personalizes AI experiences** for individual users based on their archetype (Automator, Orchestrator, Learner, Skeptic)
2. **Transforms enterprise operations** by aggregating persona data to reveal AI opportunities, adoption readiness, and strategic insights

### Key Innovation

Instead of creating dozens of static personas, this system creates **4 archetype variants per role** using:
- **Behavioral patterns** (AI maturity + work complexity)
- **Automatic inference** (from attributes, not self-reporting)
- **Universal applicability** (works across all business functions)
- **Dynamic adaptation** (tracks migration paths like Learner → Automator)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  VITAL Persona Intelligence                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐          │
│  │   PostgreSQL    │◄───────►│     Neo4j       │          │
│  │  (Source of     │  Sync   │  (Graph Query   │          │
│  │   Truth)        │         │   Engine)       │          │
│  └────────┬────────┘         └────────┬────────┘          │
│           │                           │                     │
│           │                           │                     │
│  ┌────────▼──────────────────────────▼────────┐           │
│  │         Application Layer                   │           │
│  │  - Archetype Inference Engine               │           │
│  │  - Service Router                           │           │
│  │  - Personalization Engine                   │           │
│  │  - Transformation Engine (Analytics)        │           │
│  └────────┬────────────────────────────────────┘           │
│           │                                                 │
│  ┌────────▼────────┐                                       │
│  │   User Interfaces                                       │
│  │  - Platform UX (Adapted by Archetype)                  │
│  │  - Admin Dashboard                                      │
│  │  - Analytics Dashboard (Leadership)                     │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Persona Creation** (Seeding Pipeline)
   - JSON templates → Validation → Enrichment → Inference → PostgreSQL → Neo4j

2. **User Request** (Personalization)
   - User query → Identify persona → Get archetype → Route to service → Adapt UX

3. **Analytics** (Transformation)
   - Aggregate personas → Identify patterns → Score opportunities → Generate insights

---

## Deliverables

You now have three complete deliverables:

### 1. **Strategy Document**
**File**: `PERSONA_STRATEGY_GOLD_STANDARD.md`

**Contents**:
- Complete strategic framework
- All 4 archetype definitions
- JTBD integration
- Service layer mapping
- Cross-functional examples
- ROI frameworks
- Success metrics

**Use For**: Strategic alignment, stakeholder buy-in, training materials

---

### 2. **PostgreSQL Schema**
**File**: `PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`

**Key Features**:
- ✅ **FULLY NORMALIZED** (NO JSONB - per your requirement)
- 24 tables covering all persona aspects
- Proper foreign keys and constraints
- Automatic archetype inference triggers
- Materialized views for analytics
- Sample queries included

**Tables Overview**:

**Core Tables**:
- `personas` - Main persona table (one row per persona variant)
- `persona_pain_points` - Normalized pain points
- `persona_goals` - Normalized goals
- `persona_challenges` - Normalized challenges
- `persona_week_in_life` - Time allocation
- `persona_stakeholders` - Internal relationships
- `persona_responsibilities` - Key duties
- `persona_skills` - Competencies
- `persona_motivations` - Drivers
- `persona_frustrations` - Friction points
- `persona_service_preferences` - Service layer preferences

**JTBD Tables**:
- `jtbds` - Master JTBD library
- `persona_jtbds` - Persona-JTBD mapping
- `jtbd_outcomes` - Desired outcomes

**Opportunity Tables**:
- `opportunities` - AI opportunities
- `opportunity_jtbds` - Opportunity-JTBD mapping

**Tracking Tables**:
- `archetype_migrations` - Migration tracking
- `persona_audit_log` - Change history

**Function-Specific Extensions**:
- `persona_medical_affairs_attributes`
- `persona_sales_attributes`
- `persona_finance_attributes`
- `persona_marketing_attributes`
- `persona_engineering_attributes`

**Use For**: Production database, OLTP operations, source of truth

---

### 3. **Neo4j Ontology**
**File**: `PERSONA_NEO4J_ONTOLOGY.cypher`

**Key Features**:
- Graph-based relationship modeling
- 10+ core node types
- 15+ relationship types
- Sample traversal queries
- Graph algorithm examples (GDS)
- Synchronization patterns with PostgreSQL

**Node Types**:
- `Persona`, `Archetype`, `JTBD`, `Outcome`
- `PainPoint`, `Goal`, `Challenge`
- `Opportunity`, `OrgFunction`, `ServiceLayer`

**Use For**: Graph queries, cross-functional pattern discovery, analytics

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: Database Setup

**Day 1-2: PostgreSQL**
1. Review `PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`
2. Create test database
3. Execute schema DDL
4. Verify all tables, constraints, indexes created
5. Test trigger functions
6. Run sample queries

**Day 3-4: Neo4j**
1. Set up Neo4j instance (Aura or self-hosted)
2. Review `PERSONA_NEO4J_ONTOLOGY.cypher`
3. Create constraints and indexes
4. Create core reference nodes (Archetypes, ServiceLayers, OrgFunctions)
5. Test relationship creation
6. Run sample traversal queries

**Day 5: Integration**
1. Set up database synchronization strategy
2. Implement initial bulk import (PostgreSQL → Neo4j)
3. Test read/write operations
4. Document connection strings and credentials

#### Week 2: Initial Persona Seeding

**Day 1-2: Define Your First Function**
- Choose one function to start (e.g., Medical Affairs, Sales, Finance)
- Identify 5-10 core roles
- Create JSON templates for each role

**Day 3-5: Create 4 Variants Per Role**
For each role, create 4 persona records:

**Example: "Medical Director" role:**

```json
{
  "role": "Medical Director",
  "variants": [
    {
      "archetype": "AUTOMATOR",
      "name": "Dr. Michael Chen - Medical Director (Automator)",
      "slug": "medical-director-automator",
      "tagline": "Efficiency-Focused Operations Leader",
      "pain_points": [
        "Spend 10 hours/week on routine reporting",
        "Manual data extraction from multiple systems",
        "Repetitive MSL coaching on same topics"
      ],
      "goals": [
        "Automate weekly team reports",
        "Reduce administrative time by 50%",
        "Scale team productivity without headcount"
      ],
      "ai_maturity_indicators": {
        "technology_adoption": "early_adopter",
        "risk_tolerance": "moderate",
        "change_readiness": "high"
      },
      "work_pattern_indicators": {
        "meeting_ratio": "30% meetings, 70% execution",
        "stakeholder_count": 3,
        "strategic_time_percent": 20
      }
    },
    {
      "archetype": "ORCHESTRATOR",
      "name": "Dr. Sarah Johnson - Medical Director (Orchestrator)",
      "slug": "medical-director-orchestrator",
      "tagline": "Strategic Evidence Leader",
      "pain_points": [
        "Can't synthesize evidence from 50+ sources fast enough",
        "Cross-functional alignment takes too long",
        "Miss patterns that span therapeutic areas"
      ],
      "goals": [
        "Make better strategic decisions faster",
        "Identify evidence gaps proactively",
        "Improve cross-functional collaboration"
      ],
      "ai_maturity_indicators": {
        "technology_adoption": "early_adopter",
        "risk_tolerance": "moderate",
        "change_readiness": "high"
      },
      "work_pattern_indicators": {
        "meeting_ratio": "70% meetings, 30% execution",
        "stakeholder_count": 12,
        "strategic_time_percent": 80
      }
    },
    {
      "archetype": "LEARNER",
      "name": "Dr. David Park - Medical Director (Learner)",
      "slug": "medical-director-learner",
      "tagline": "Developing Medical Leader",
      "pain_points": [
        "New to Medical Affairs, learning the ropes",
        "Don't know best practices for MSL team management",
        "Overwhelmed by regulatory requirements"
      ],
      "goals": [
        "Build confidence in role",
        "Learn medical affairs best practices",
        "Reduce errors and rework"
      ],
      "ai_maturity_indicators": {
        "technology_adoption": "early_majority",
        "risk_tolerance": "conservative",
        "change_readiness": "moderate"
      },
      "work_pattern_indicators": {
        "meeting_ratio": "40% meetings, 60% learning/execution",
        "stakeholder_count": 5,
        "strategic_time_percent": 40
      }
    },
    {
      "archetype": "SKEPTIC",
      "name": "Dr. Maria Rodriguez - Medical Director (Skeptic)",
      "slug": "medical-director-skeptic",
      "tagline": "Quality-Focused Medical Leader",
      "pain_points": [
        "Can't trust AI medical content without verification",
        "Regulatory compliance risks too high for automation",
        "Need to maintain quality standards"
      ],
      "goals": [
        "Ensure medical accuracy in all outputs",
        "Maintain regulatory compliance",
        "Validate AI recommendations before use"
      ],
      "ai_maturity_indicators": {
        "technology_adoption": "late_majority",
        "risk_tolerance": "conservative",
        "change_readiness": "low"
      },
      "work_pattern_indicators": {
        "meeting_ratio": "60% meetings, 40% review/validation",
        "stakeholder_count": 8,
        "strategic_time_percent": 70
      }
    }
  ]
}
```

---

### Phase 2: Validation & Refinement (Week 3)

**Day 1-2: Test Archetype Inference**

Run the inference algorithm on your seeded personas:

```sql
-- Test archetype inference for all personas
SELECT
    persona_id,
    name,
    archetype as assigned_archetype,
    work_complexity_score,
    ai_maturity_score,
    archetype_confidence,
    archetype_requires_review,
    CASE
        WHEN work_complexity_score >= 50 AND ai_maturity_score >= 50 THEN 'ORCHESTRATOR'
        WHEN work_complexity_score < 50 AND ai_maturity_score >= 50 THEN 'AUTOMATOR'
        WHEN work_complexity_score >= 50 AND ai_maturity_score < 50 THEN 'SKEPTIC'
        ELSE 'LEARNER'
    END as calculated_archetype
FROM personas
WHERE is_active = TRUE;

-- Verify matches
SELECT
    persona_id,
    name,
    archetype as assigned,
    CASE
        WHEN work_complexity_score >= 50 AND ai_maturity_score >= 50 THEN 'ORCHESTRATOR'
        WHEN work_complexity_score < 50 AND ai_maturity_score >= 50 THEN 'AUTOMATOR'
        WHEN work_complexity_score >= 50 AND ai_maturity_score < 50 THEN 'SKEPTIC'
        ELSE 'LEARNER'
    END as calculated,
    CASE
        WHEN archetype = CASE
            WHEN work_complexity_score >= 50 AND ai_maturity_score >= 50 THEN 'ORCHESTRATOR'
            WHEN work_complexity_score < 50 AND ai_maturity_score >= 50 THEN 'AUTOMATOR'
            WHEN work_complexity_score >= 50 AND ai_maturity_score < 50 THEN 'SKEPTIC'
            ELSE 'LEARNER'
        END THEN '✓ Match'
        ELSE '✗ Mismatch'
    END as validation
FROM personas
WHERE is_active = TRUE;
```

**Day 3-4: Validate Cross-Functional Patterns**

```sql
-- Find shared pain points across functions
SELECT
    pp.pain_point_text,
    pp.pain_category,
    COUNT(DISTINCT p.business_function) as function_count,
    ARRAY_AGG(DISTINCT p.business_function::text) as affected_functions,
    COUNT(DISTINCT p.persona_id) as affected_persona_count
FROM persona_pain_points pp
JOIN personas p ON pp.persona_id = p.persona_id
WHERE p.is_active = TRUE
GROUP BY pp.pain_point_text, pp.pain_category
HAVING COUNT(DISTINCT p.business_function) > 1
ORDER BY function_count DESC, affected_persona_count DESC
LIMIT 20;
```

**Day 5: Stakeholder Review**
- Present initial personas to stakeholders
- Gather feedback on accuracy
- Refine attributes based on input
- Document any customizations needed

---

### Phase 3: Application Integration (Weeks 4-6)

#### Week 4: Build Core Services

**Archetype Inference Service**

```typescript
// services/archetype-inference.ts

interface PersonaAttributes {
  seniority_level: string;
  years_of_experience: number;
  team_size_typical: number;
  budget_authority: number;
  technology_adoption: string;
  risk_tolerance: string;
  change_readiness: string;
  pain_points: string[];
  goals: string[];
}

interface ArchetypeAssignment {
  archetype: 'AUTOMATOR' | 'ORCHESTRATOR' | 'LEARNER' | 'SKEPTIC';
  work_complexity_score: number;
  ai_maturity_score: number;
  confidence: number;
  requires_review: boolean;
}

export function inferArchetype(attributes: PersonaAttributes): ArchetypeAssignment {
  // Calculate work complexity score (0-100)
  const workComplexityScore = calculateWorkComplexity(attributes);

  // Calculate AI maturity score (0-100)
  const aiMaturityScore = calculateAIMaturity(attributes);

  // Assign archetype based on quadrant
  let archetype: ArchetypeAssignment['archetype'];
  if (workComplexityScore >= 50 && aiMaturityScore >= 50) {
    archetype = 'ORCHESTRATOR';
  } else if (workComplexityScore < 50 && aiMaturityScore >= 50) {
    archetype = 'AUTOMATOR';
  } else if (workComplexityScore >= 50 && aiMaturityScore < 50) {
    archetype = 'SKEPTIC';
  } else {
    archetype = 'LEARNER';
  }

  // Calculate confidence
  const distanceFromCenter = Math.abs(workComplexityScore - 50) + Math.abs(aiMaturityScore - 50);
  const confidence = Math.min(distanceFromCenter / 100, 1.0);

  return {
    archetype,
    work_complexity_score: workComplexityScore,
    ai_maturity_score: aiMaturityScore,
    confidence,
    requires_review: confidence < 0.60
  };
}

function calculateWorkComplexity(attributes: PersonaAttributes): number {
  let score = 0;

  // Seniority contribution (0-25 points)
  const seniorityMap = {
    'entry': 5,
    'mid': 15,
    'senior': 20,
    'director': 22,
    'executive': 25,
    'c_suite': 25
  };
  score += seniorityMap[attributes.seniority_level] || 10;

  // Team size contribution (0-20 points)
  if (attributes.team_size_typical === 0) {
    score += 5;
  } else if (attributes.team_size_typical <= 5) {
    score += 12;
  } else if (attributes.team_size_typical <= 15) {
    score += 18;
  } else {
    score += 20;
  }

  // Budget authority contribution (0-20 points)
  if (attributes.budget_authority < 100000) {
    score += 5;
  } else if (attributes.budget_authority < 1000000) {
    score += 12;
  } else if (attributes.budget_authority < 5000000) {
    score += 18;
  } else {
    score += 20;
  }

  // ... additional signals ...

  return Math.min(score, 100);
}

function calculateAIMaturity(attributes: PersonaAttributes): number {
  let score = 0;

  // Technology adoption contribution (0-30 points)
  const adoptionMap = {
    'laggard': 5,
    'late_majority': 12,
    'early_majority': 18,
    'early_adopter': 25,
    'innovator': 30
  };
  score += adoptionMap[attributes.technology_adoption] || 15;

  // Risk tolerance contribution (0-20 points)
  const riskMap = {
    'very_conservative': 5,
    'conservative': 10,
    'moderate': 15,
    'aggressive': 20
  };
  score += riskMap[attributes.risk_tolerance] || 10;

  // ... additional signals ...

  return Math.min(score, 100);
}
```

**Service Router**

```typescript
// services/service-router.ts

interface UserRequest {
  user_id: string;
  persona_id: string;
  query: string;
  context: any;
}

interface RoutingDecision {
  service_layer: 'ASK_EXPERT' | 'ASK_PANEL' | 'WORKFLOWS' | 'SOLUTION_BUILDER';
  configuration: ServiceConfiguration;
}

interface ServiceConfiguration {
  automation_level: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  explanation_depth: 'minimal' | 'moderate' | 'detailed' | 'comprehensive';
  citation_density: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  proactivity_level: 'passive' | 'low' | 'moderate' | 'high' | 'very_high';
  hitl_frequency?: 'never' | 'final_only' | 'key_steps' | 'frequent' | 'every_step';
}

export async function routeRequest(request: UserRequest): Promise<RoutingDecision> {
  // Get persona and archetype
  const persona = await getPersona(request.persona_id);
  const archetype = persona.archetype;

  // Analyze request complexity
  const requestComplexity = analyzeComplexity(request.query, request.context);
  const requestType = classifyRequest(request.query);

  // Route based on archetype + request type
  if (archetype === 'AUTOMATOR') {
    if (requestType === 'routine_task') {
      return {
        service_layer: 'WORKFLOWS',
        configuration: {
          automation_level: 'high',
          explanation_depth: 'minimal',
          citation_density: 'low',
          proactivity_level: 'high',
          hitl_frequency: 'final_only'
        }
      };
    } else if (requestType === 'quick_question') {
      return {
        service_layer: 'ASK_EXPERT',
        configuration: {
          automation_level: 'high',
          explanation_depth: 'minimal',
          citation_density: 'low',
          proactivity_level: 'high'
        }
      };
    }
  } else if (archetype === 'ORCHESTRATOR') {
    if (requestComplexity === 'high' && requestType === 'strategic') {
      return {
        service_layer: 'ASK_PANEL',
        configuration: {
          automation_level: 'moderate',
          explanation_depth: 'detailed',
          citation_density: 'medium',
          proactivity_level: 'moderate'
        }
      };
    }
  } else if (archetype === 'LEARNER') {
    if (requestType === 'learning') {
      return {
        service_layer: 'ASK_EXPERT',
        configuration: {
          automation_level: 'low',
          explanation_depth: 'comprehensive',
          citation_density: 'medium',
          proactivity_level: 'low'
        }
      };
    }
  } else if (archetype === 'SKEPTIC') {
    if (requestComplexity === 'high') {
      return {
        service_layer: 'ASK_PANEL',
        configuration: {
          automation_level: 'low',
          explanation_depth: 'comprehensive',
          citation_density: 'very_high',
          proactivity_level: 'very_low',
          hitl_frequency: 'frequent'
        }
      };
    }
  }

  // Default fallback
  return {
    service_layer: 'ASK_EXPERT',
    configuration: {
      automation_level: 'moderate',
      explanation_depth: 'moderate',
      citation_density: 'medium',
      proactivity_level: 'moderate'
    }
  };
}
```

#### Week 5: Build Analytics Engine

**Opportunity Discovery**

```typescript
// services/opportunity-discovery.ts

interface OpportunityScore {
  opportunity_id: string;
  opportunity_name: string;
  reach_score: number;
  impact_score: number;
  feasibility_score: number;
  adoption_readiness_score: number;
  overall_score: number;
  estimated_value_usd: number;
}

export async function discoverOpportunities(
  function_name: string
): Promise<OpportunityScore[]> {
  // Get all personas in function
  const personas = await getPersonasByFunction(function_name);

  // Get archetype distribution
  const archetypeDistribution = calculateArchetypeDistribution(personas);

  // Aggregate pain points
  const painClusters = await aggregatePainPoints(personas);

  // Calculate opportunity scores
  const opportunities: OpportunityScore[] = [];

  for (const cluster of painClusters) {
    const reach = cluster.affected_persona_count;
    const impact = cluster.pain_severity * cluster.business_value_multiplier;
    const feasibility = await assessFeasibility(cluster);
    const adoptionReadiness = calculateAdoptionReadiness(
      cluster.affected_personas,
      archetypeDistribution
    );

    const overallScore = Math.pow(
      reach * impact * feasibility * adoptionReadiness,
      0.25
    );

    opportunities.push({
      opportunity_id: generateId(),
      opportunity_name: cluster.opportunity_name,
      reach_score: reach,
      impact_score: impact,
      feasibility_score: feasibility,
      adoption_readiness_score: adoptionReadiness,
      overall_score: overallScore,
      estimated_value_usd: cluster.estimated_annual_value
    });
  }

  return opportunities.sort((a, b) => b.overall_score - a.overall_score);
}

function calculateAdoptionReadiness(
  personas: Persona[],
  distribution: ArchetypeDistribution
): number {
  const automatorPercent = distribution.AUTOMATOR / distribution.total;
  const orchestratorPercent = distribution.ORCHESTRATOR / distribution.total;
  const learnerPercent = distribution.LEARNER / distribution.total;
  const skepticPercent = distribution.SKEPTIC / distribution.total;

  // Weighted score
  return (
    automatorPercent * 100 +
    orchestratorPercent * 90 +
    learnerPercent * 50 +
    skepticPercent * 20
  );
}
```

#### Week 6: Build Admin Dashboard

Create admin interfaces for:
- Persona management (CRUD)
- Archetype review and override
- Opportunity tracking
- Analytics dashboards

---

### Phase 4: Pilot & Scale (Weeks 7-12)

#### Week 7-8: Pilot with Early Adopters

1. Select 10-15 "Automator" or "Orchestrator" personas
2. Onboard real users
3. Monitor archetype accuracy
4. Gather feedback
5. Measure time-to-value

#### Week 9-10: Expand to Learners

1. Build training programs
2. Create guided workflows
3. Add "Learner" users
4. Measure skill velocity

#### Week 11-12: Convert Skeptics

1. Build trust features (citations, HITL, audit trails)
2. Create case studies from Automator/Orchestrator success
3. Run pilot with Skeptics
4. Measure adoption rate

---

## Testing Strategy

### Unit Tests

Test core logic:

```typescript
// __tests__/archetype-inference.test.ts

import { inferArchetype } from '../services/archetype-inference';

describe('Archetype Inference', () => {
  it('should assign AUTOMATOR for high AI + routine work', () => {
    const attributes = {
      seniority_level: 'mid',
      years_of_experience: 8,
      team_size_typical: 3,
      budget_authority: 50000,
      technology_adoption: 'early_adopter',
      risk_tolerance: 'moderate',
      change_readiness: 'high',
      pain_points: ['Manual reporting takes too long', 'Repetitive data entry'],
      goals: ['Automate weekly reports', 'Reduce admin time']
    };

    const result = inferArchetype(attributes);

    expect(result.archetype).toBe('AUTOMATOR');
    expect(result.work_complexity_score).toBeLessThan(50);
    expect(result.ai_maturity_score).toBeGreaterThanOrEqual(50);
    expect(result.confidence).toBeGreaterThan(0.60);
  });

  it('should assign ORCHESTRATOR for high AI + strategic work', () => {
    const attributes = {
      seniority_level: 'executive',
      years_of_experience: 18,
      team_size_typical: 25,
      budget_authority: 8000000,
      technology_adoption: 'early_adopter',
      risk_tolerance: 'moderate',
      change_readiness: 'high',
      pain_points: ['Can't synthesize cross-functional insights fast enough'],
      goals: ['Improve strategic decision quality', 'Accelerate planning cycles']
    };

    const result = inferArchetype(attributes);

    expect(result.archetype).toBe('ORCHESTRATOR');
    expect(result.work_complexity_score).toBeGreaterThanOrEqual(50);
    expect(result.ai_maturity_score).toBeGreaterThanOrEqual(50);
  });

  // ... more test cases for LEARNER and SKEPTIC
});
```

### Integration Tests

Test database operations:

```typescript
// __tests__/persona-repository.test.ts

import { PersonaRepository } from '../repositories/persona-repository';

describe('Persona Repository', () => {
  let repo: PersonaRepository;

  beforeAll(async () => {
    // Set up test database
    repo = new PersonaRepository(testDbConnection);
  });

  it('should create persona with all related entities', async () => {
    const persona = {
      name: 'Test Persona',
      title: 'Test Title',
      slug: 'test-persona',
      archetype: 'AUTOMATOR',
      business_function: 'SALES',
      pain_points: [
        { pain_point_text: 'Test pain', severity: 'high' }
      ],
      goals: [
        { goal_text: 'Test goal', priority: 'high' }
      ]
    };

    const created = await repo.create(persona);

    expect(created.persona_id).toBeDefined();
    expect(created.pain_points).toHaveLength(1);
    expect(created.goals).toHaveLength(1);
  });

  it('should correctly infer and assign archetype', async () => {
    const persona = await repo.getById('test-id');
    expect(persona.archetype).toBe('AUTOMATOR');
    expect(persona.archetype_confidence).toBeGreaterThan(0.60);
  });
});
```

### End-to-End Tests

Test full user flows:

```typescript
// __tests__/e2e/persona-journey.test.ts

describe('Persona Journey - Automator', () => {
  it('should route Automator to Workflows for routine tasks', async () => {
    // Create test user with Automator persona
    const user = await createTestUser({ archetype: 'AUTOMATOR' });

    // Submit routine task request
    const response = await request(app)
      .post('/api/query')
      .send({
        user_id: user.id,
        query: 'Generate my weekly report'
      });

    // Should route to Workflows
    expect(response.body.service_layer).toBe('WORKFLOWS');
    expect(response.body.configuration.automation_level).toBe('high');
    expect(response.body.configuration.explanation_depth).toBe('minimal');
  });
});
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] PostgreSQL schema deployed to production
- [ ] Neo4j instance provisioned and configured
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] All environment variables configured
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Documentation finalized

### Deployment

- [ ] Deploy application code
- [ ] Run database migrations
- [ ] Seed initial reference data (Archetypes, ServiceLayers, OrgFunctions)
- [ ] Sync initial personas to Neo4j
- [ ] Verify all services healthy
- [ ] Run smoke tests
- [ ] Enable monitoring dashboards

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check archetype inference accuracy
- [ ] Verify service routing working correctly
- [ ] Gather user feedback
- [ ] Schedule daily materialized view refresh
- [ ] Set up weekly data quality checks

---

## Support & Troubleshooting

### Common Issues

**Issue**: Archetype inference confidence is low (<0.60)

**Solution**:
- Check if persona has sufficient attributes populated
- Verify pain points and goals are descriptive
- Review work pattern indicators
- May need manual review and override

---

**Issue**: Cross-functional pain patterns not showing

**Solution**:
- Ensure pain points use consistent language across functions
- Check that `pain_category` is standardized
- Run materialized view refresh
- Verify Neo4j sync is working

---

**Issue**: Service routing not working as expected

**Solution**:
- Check request classification logic
- Verify persona archetype is correct
- Review service preference mappings
- Check application logs for routing decisions

---

**Issue**: Neo4j and PostgreSQL out of sync

**Solution**:
- Check sync job logs
- Verify database connectivity
- Run manual sync: `CALL apoc.load.jdbc(...)`
- Check for constraint violations

---

### Performance Optimization

**Slow persona queries:**
- Check index usage: `EXPLAIN ANALYZE SELECT ...`
- Ensure materialized views are refreshed
- Consider caching frequently accessed personas

**Slow graph traversals:**
- Check Neo4j query plan: `PROFILE MATCH ...`
- Ensure indexes exist on frequently queried properties
- Consider using GDS library for complex algorithms

---

### Support Contacts

**Technical Support**: support@vital.ai
**Product Questions**: product@vital.ai
**Security Issues**: security@vital.ai

---

## Next Steps

1. **Review all three deliverables**:
   - `PERSONA_STRATEGY_GOLD_STANDARD.md`
   - `PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`
   - `PERSONA_NEO4J_ONTOLOGY.cypher`

2. **Schedule kickoff meeting** with:
   - Engineering lead
   - Product manager
   - Data architect
   - Key stakeholders

3. **Allocate resources**:
   - 2 backend engineers (8-12 weeks)
   - 1 data engineer (4-6 weeks)
   - 1 product manager (ongoing)

4. **Set milestones**:
   - Week 2: Database setup complete
   - Week 4: First personas seeded
   - Week 8: Pilot launched
   - Week 12: Full deployment

---

**Document Status**: READY FOR IMPLEMENTATION
**Last Updated**: 2025-11-20
**Version**: 4.0

---

*This implementation guide is part of the VITAL Platform Universal Persona Strategy & Intelligence Framework. For questions or clarifications, contact the Product Team.*
