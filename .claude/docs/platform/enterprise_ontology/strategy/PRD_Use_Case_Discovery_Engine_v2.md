# Product Requirements Document (PRD)
# Use Case Discovery Engine v2.0

**Document ID:** PRD-VITAL-007  
**Version:** 2.0  
**Status:** Product Board Approved  
**Created:** November 28, 2025  
**Last Updated:** November 28, 2025  
**Author:** Product Architecture Team  
**Stakeholders:** Product, Engineering, Medical Affairs, Executive Leadership, Strategy

---

# 1. Executive Summary

## 1.1 Product Vision

The **Use Case Discovery Engine v2.0** is an intelligent platform capability that automatically identifies, scores, and prioritizes AI/automation opportunities across the enterprise. Building on v1.0, this version integrates with the **Enterprise Intelligence Operating System**, leveraging the **L0 Domain Knowledge Layer**, **Intelligence Broker**, and **Transformation Flywheel** to deliver unprecedented strategic intelligence.

> "Transform strategic planning from subjective decision-making into data-driven opportunity identification, powered by deep domain context and real-time organizational intelligence."

## 1.2 v2.0 Enhancement Summary

| Area | v1.0 | v2.0 | Impact |
|------|------|------|--------|
| Domain Context | None | L0 Integration (Products, Diseases, TAs) | 3x relevance in recommendations |
| Opportunity Discovery | Rule-based | Intelligence Broker + GraphRAG | Real-time, relationship-aware |
| Value Quantification | Static formulas | Dynamic with confidence intervals | ±15% accuracy (vs ±25%) |
| Personalization | Archetype-based | Persona + Domain + JTBD fusion | Hyper-contextual briefs |
| Transformation Engine | Basic analytics | Full flywheel integration | Self-optimizing priorities |
| Governance | Advisory | Policy-as-Code integration | Compliance-by-design |

## 1.3 Problem Statement (Expanded)

Medical Affairs and enterprise leaders face critical challenges in AI transformation planning:

| Challenge | v1.0 Impact | v2.0 Solution |
|-----------|-------------|---------------|
| **Opportunity Blindness** | 40% of opportunities identified | Domain-aware discovery via L0 |
| **Prioritization Paralysis** | Days to generate roadmap | <1 hour with Intelligence Broker |
| **Value Quantification Gap** | ±25% accuracy | ±15% with dynamic modeling |
| **Persona Disconnect** | Archetype-level matching | Persona + Domain + JTBD fusion |
| **Strategic Scatter** | Pillar alignment only | Cross-functional value mapping |
| **Domain Ignorance** | Generic recommendations | Product/TA/Disease-specific insights |
| **Compliance Risk** | Post-hoc assessment | Pre-integrated governance |

## 1.4 Product Goals (v2.0)

| Goal | v1.0 Metric | v2.0 Target | Measurement |
|------|-------------|-------------|-------------|
| **Discover** | 50+ opportunities/quarter | 100+ opportunities/quarter | System-generated |
| **Prioritize** | <1 day to ranked roadmap | <1 hour with domain context | Time to output |
| **Quantify** | ±25% accuracy | ±15% accuracy | Projected vs actual ROI |
| **Domain-Contextualize** | N/A | 90% domain entity coverage | L0 match rate |
| **Transform** | 40% conversion rate | 60% conversion rate | Implemented/identified |
| **Adopt** | 90% leadership usage | 95% + 70% practitioner usage | Active users |

## 1.5 Success Metrics (v2.0)

**Primary Metrics:**
| Metric | v1.0 Target | v2.0 Target | Stretch |
|--------|-------------|-------------|---------|
| Opportunity conversion rate | 40% | 60% | 75% |
| ROI accuracy (projected vs actual) | ±25% | ±15% | ±10% |
| Time to first implementation | <90 days | <60 days | <45 days |
| User satisfaction (NPS) | >60 | >70 | >80 |
| Domain entity match rate | N/A | 90% | 95% |

**Secondary Metrics:**
| Metric | Target |
|--------|--------|
| Discovery Brief generation time | <3 seconds (was <5s) |
| Opportunity Radar refresh | Real-time (was <15 min) |
| Cross-functional opportunity rate | 40%+ (was 30%) |
| Strategic pillar balance | No pillar <10% |
| L0 domain coverage | All TAs, top 50 products |
| Governance policy coverage | 100% of recommendations |

---

# 2. User Personas & Use Cases

## 2.1 Primary Personas (Enhanced with Domain Context)

### Persona 1: VP Medical Affairs (Orchestrator)

**Profile:**
- Executive responsible for MA strategy and transformation
- Budget authority: $50M+
- Key concern: Strategic alignment, ROI demonstration, **portfolio-level insights**
- Archetype: Orchestrator (High AI Maturity × Strategic Work)

**Domain Context (L0):**
- Oversees 3-5 therapeutic areas
- Manages 10-15 products across lifecycle stages
- Responsible for 20+ disease areas
- Tracks 100+ evidence types

**Jobs-to-be-Done (Enhanced):**
1. "When planning annual transformation initiatives **for my portfolio**, I need to identify highest-value AI opportunities **by therapeutic area and product** so that I can allocate budget to maximum-impact projects."
2. "When presenting to the C-suite, I need quantified business cases **with product-specific ROI** so that I can secure funding for digital transformation."
3. "When assessing department readiness **across TAs**, I need to understand capability gaps **by disease area** so that I can plan talent development alongside technology investment."

**v2.0 Use Cases:**
| ID | Use Case | v2.0 Enhancement |
|----|----------|------------------|
| UC-1.1 | Generate enterprise opportunity radar for annual planning | **+ Domain filter by TA/Product** |
| UC-1.2 | Build executive business case for top 5 opportunities | **+ Product-specific value modeling** |
| UC-1.3 | Assess maturity readiness by function and role | **+ TA-specific capability gaps** |
| UC-1.4 | **NEW**: Portfolio-level transformation dashboard | Cross-product opportunity mapping |
| UC-1.5 | **NEW**: Competitive intelligence on peer AI adoption | Industry benchmarks by TA |

### Persona 2: Head of Medical Operations (Orchestrator)

**Profile:**
- Operational leader focused on efficiency and quality
- Budget authority: $10-20M
- Key concern: Process optimization, resource utilization, **cross-TA standardization**
- Archetype: Orchestrator

**Domain Context (L0):**
- Manages operations across all products
- Standardizes processes for 15+ therapeutic areas
- Handles 5,000+ medical inquiries annually
- Oversees 50+ workflows

**v2.0 Use Cases:**
| ID | Use Case | v2.0 Enhancement |
|----|----------|------------------|
| UC-2.1 | Identify top 10 workflow automation opportunities | **+ Ranked by TA volume** |
| UC-2.2 | Calculate FTE equivalent savings by opportunity | **+ Product complexity weighting** |
| UC-2.3 | Generate vendor requirements from opportunity specs | **+ Domain-specific requirements** |
| UC-2.4 | **NEW**: Cross-TA process harmonization opportunities | Identify standardization value |
| UC-2.5 | **NEW**: Resource optimization by product lifecycle | Match staffing to lifecycle stage |

### Persona 3: Medical Director - Therapeutic Area (Skeptic)

**Profile:**
- Scientific leader responsible for TA strategy
- Budget authority: $5-10M
- Key concern: Scientific accuracy, compliance, **disease-specific evidence**
- Archetype: Skeptic (Low AI Maturity × Strategic Work)

**Domain Context (L0):**
- Deep expertise in 1-3 disease areas
- Manages 2-5 products in TA
- Tracks 500+ publications in specialty
- Oversees evidence strategy for TA

**v2.0 Use Cases:**
| ID | Use Case | v2.0 Enhancement |
|----|----------|------------------|
| UC-3.1 | Filter opportunities by compliance risk level | **+ Disease-specific regulations** |
| UC-3.2 | View AI suitability for evidence-related JTBDs | **+ Evidence type breakdown** |
| UC-3.3 | Generate team-specific adoption recommendations | **+ Scientific rigor requirements** |
| UC-3.4 | **NEW**: Disease-specific opportunity discovery | AI gaps in disease management |
| UC-3.5 | **NEW**: Evidence generation opportunity mapping | Where AI can accelerate evidence |

### Persona 4: Innovation/Digital Lead (Automator)

**Profile:**
- Technology leader driving AI adoption
- Budget authority: $2-5M
- Key concern: Implementation feasibility, adoption velocity
- Archetype: Automator (High AI Maturity × Routine Work)

**Domain Context (L0):**
- Works across all TAs/products
- Tracks 50+ AI technologies
- Manages 20+ integrations
- Oversees 100+ use cases

**v2.0 Use Cases:**
| ID | Use Case | v2.0 Enhancement |
|----|----------|------------------|
| UC-4.1 | Generate implementation roadmap with dependencies | **+ Domain complexity scoring** |
| UC-4.2 | Identify quick wins (high value, low complexity) | **+ Product lifecycle stage filter** |
| UC-4.3 | Track value realization against projections | **+ L0 entity attribution** |
| UC-4.4 | **NEW**: Technology-opportunity matching | Map AI capabilities to domain needs |
| UC-4.5 | **NEW**: Cross-domain synergy identification | Reusable patterns across TAs |

## 2.2 Secondary Personas (v2.0)

| Persona | Archetype | v2.0 Enhancements |
|---------|-----------|-------------------|
| MSL Regional Lead | Orchestrator | Territory + TA-specific opportunities |
| Publications Lead | Automator | Publication type + journal targeting |
| MI Manager | Automator | Inquiry category + product complexity |
| Compliance Director | Skeptic | Domain-specific regulatory requirements |
| HEOR Lead | Orchestrator | Evidence type + payer relevance |
| **NEW**: Product Director | Orchestrator | Lifecycle-stage specific opportunities |
| **NEW**: TA Head | Orchestrator | Disease-area portfolio optimization |

---

# 3. Feature Requirements

## 3.1 Feature Overview (v2.0)

```
USE CASE DISCOVERY ENGINE v2.0 - FEATURE MAP

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              DISCOVERY ENGINE v2.0                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   OPPORTUNITY       │  │   VALUE             │  │   DISCOVERY         │      │
│  │   RADAR v2.0        │  │   CALCULATOR v2.0   │  │   BRIEF v2.0        │      │
│  │                     │  │                     │  │                     │      │
│  │  • Ranked list      │  │  • Multi-factor     │  │  • Persona-         │      │
│  │  • L0 Domain Filter │  │  • Dynamic modeling │  │    specific         │      │
│  │  • Real-time update │  │  • Confidence bands │  │  • Domain-aware     │      │
│  │  • GraphRAG power   │  │  • Sensitivity      │  │  • Actionable       │      │
│  │  • Governance tags  │  │  • Product-level    │  │  • Compliance-      │      │
│  │                     │  │                     │  │    embedded         │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   MATURITY          │  │   IMPLEMENTATION    │  │   TRANSFORMATION    │      │
│  │   ASSESSMENT v2.0   │  │   PLANNER v2.0      │  │   DASHBOARD (NEW)   │      │
│  │                     │  │                     │  │                     │      │
│  │  • 5-level model    │  │  • Dependency DAG   │  │  • Flywheel viz     │      │
│  │  • Domain-specific  │  │  • Resource model   │  │  • Value tracking   │      │
│  │  • Capability heat  │  │  • Risk assessment  │  │  • Adoption metrics │      │
│  │  • Readiness score  │  │  • Governance gates │  │  • Portfolio view   │      │
│  │                     │  │                     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   JTBD NAVIGATOR    │  │   DOMAIN EXPLORER   │  │   GOVERNANCE        │      │
│  │   v2.0              │  │   (NEW)             │  │   ADVISOR (NEW)     │      │
│  │                     │  │                     │  │                     │      │
│  │  • Browse & search  │  │  • L0 entity view   │  │  • Policy preview   │      │
│  │  • Domain context   │  │  • TA/Product/      │  │  • Compliance score │      │
│  │  • ODI scoring      │  │    Disease nav      │  │  • HITL forecasting │      │
│  │  • Opportunity link │  │  • Opportunity map  │  │  • Audit readiness  │      │
│  │                     │  │                     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Feature: Opportunity Radar v2.0

### 3.2.1 Overview

The Opportunity Radar v2.0 is the flagship discovery interface, now powered by the Intelligence Broker and L0 Domain Knowledge.

### 3.2.2 Functional Requirements

| ID | Requirement | Priority | v2.0 Enhancement |
|----|-------------|----------|------------------|
| OR-001 | Display ranked list of AI opportunities | P0 | GraphRAG-powered ranking |
| OR-002 | Filter by Strategic Pillar (SP01-SP07) | P0 | - |
| OR-003 | Filter by Persona/Role | P0 | Intelligence Broker integration |
| OR-004 | Filter by Archetype | P0 | - |
| OR-005 | Filter by Department | P1 | - |
| OR-006 | **NEW**: Filter by Therapeutic Area | P0 | L0 domain filter |
| OR-007 | **NEW**: Filter by Product | P0 | L0 domain filter |
| OR-008 | **NEW**: Filter by Disease Area | P0 | L0 domain filter |
| OR-009 | **NEW**: Filter by Product Lifecycle Stage | P1 | L0 attribute filter |
| OR-010 | **NEW**: Filter by Evidence Type | P1 | L0 domain filter |
| OR-011 | Sort by multiple criteria (VPANES, ODI, Value) | P0 | Dynamic re-ranking |
| OR-012 | Real-time updates (was <15 min) | P0 | CDC-powered refresh |
| OR-013 | Quadrant visualization (Impact × Feasibility) | P0 | - |
| OR-014 | Scatter plot visualization | P1 | - |
| OR-015 | **NEW**: Domain entity heatmap | P1 | TA × Opportunity matrix |
| OR-016 | **NEW**: Governance risk indicators | P0 | Policy-as-Code tags |
| OR-017 | **NEW**: Cross-functional opportunity highlighting | P1 | Graph-detected synergies |
| OR-018 | Export to PDF, XLSX, PPT | P1 | - |
| OR-019 | **NEW**: Share/collaborate on opportunity sets | P2 | Team workspace |

### 3.2.3 Scoring Algorithm v2.0

```python
# v2.0 Opportunity Score with Domain Context

def calculate_opportunity_score_v2(
    opportunity: Opportunity,
    domain_context: DomainContext,
    persona_context: PersonaContext
) -> OpportunityScore:
    """
    Calculate opportunity score with L0 domain integration.
    
    v2.0 Enhancements:
    - Domain relevance weighting
    - Product lifecycle adjustment
    - Therapeutic area complexity factor
    - Cross-functional synergy bonus
    """
    
    # Base VPANES scores (0-10 scale)
    base_scores = {
        'value': opportunity.value_score,
        'pain': opportunity.pain_severity,
        'adoption': opportunity.adoption_likelihood,
        'network': opportunity.cross_functional_reach,
        'ease': opportunity.implementation_ease,
        'strategic': opportunity.strategic_alignment
    }
    
    # v2.0: Domain relevance multiplier
    domain_relevance = calculate_domain_relevance(
        opportunity=opportunity,
        therapeutic_areas=domain_context.therapeutic_areas,
        products=domain_context.products,
        diseases=domain_context.diseases
    )
    
    # v2.0: Product lifecycle adjustment
    lifecycle_factor = get_lifecycle_adjustment(
        products=domain_context.products,
        opportunity_type=opportunity.type
    )
    # Early stage products get boost for evidence generation
    # Mature products get boost for efficiency improvements
    
    # v2.0: TA complexity factor
    ta_complexity = calculate_ta_complexity(
        therapeutic_areas=domain_context.therapeutic_areas
    )
    # Rare diseases get higher weight for compliance
    # Competitive TAs get higher weight for speed
    
    # v2.0: Cross-functional synergy bonus (from GraphRAG)
    synergy_bonus = detect_cross_functional_synergy(
        opportunity=opportunity,
        related_opportunities=graph_traverse_related(opportunity.id)
    )
    
    # Calculate weighted composite
    weights_v2 = {
        'value': 0.22,      # Reduced from 0.25
        'pain': 0.18,       # Reduced from 0.20
        'adoption': 0.13,   # Reduced from 0.15
        'network': 0.15,    # Unchanged
        'ease': 0.12,       # Reduced from 0.15
        'strategic': 0.10,  # Unchanged
        'domain_relevance': 0.05,  # NEW
        'lifecycle_fit': 0.03,     # NEW
        'synergy': 0.02            # NEW
    }
    
    composite = (
        base_scores['value'] * weights_v2['value'] +
        base_scores['pain'] * weights_v2['pain'] +
        base_scores['adoption'] * weights_v2['adoption'] +
        base_scores['network'] * weights_v2['network'] +
        base_scores['ease'] * weights_v2['ease'] +
        base_scores['strategic'] * weights_v2['strategic'] +
        domain_relevance * weights_v2['domain_relevance'] * 10 +
        lifecycle_factor * weights_v2['lifecycle_fit'] * 10 +
        synergy_bonus * weights_v2['synergy'] * 10
    )
    
    # Apply TA complexity modifier
    composite = composite * ta_complexity
    
    # Calculate confidence interval
    confidence = calculate_confidence_v2(
        data_quality=opportunity.data_quality,
        sample_size=opportunity.sample_size,
        domain_coverage=domain_context.coverage_score
    )
    
    return OpportunityScore(
        composite=composite,
        confidence_lower=composite * (1 - confidence.margin),
        confidence_upper=composite * (1 + confidence.margin),
        components={
            **base_scores,
            'domain_relevance': domain_relevance,
            'lifecycle_fit': lifecycle_factor,
            'synergy': synergy_bonus,
            'ta_complexity': ta_complexity
        },
        domain_entities=domain_context.matched_entities
    )


def calculate_domain_relevance(
    opportunity: Opportunity,
    therapeutic_areas: List[TherapeuticArea],
    products: List[Product],
    diseases: List[Disease]
) -> float:
    """
    Calculate relevance of opportunity to user's domain context.
    """
    
    relevance = 0.0
    
    # TA match
    ta_ids = {ta.id for ta in therapeutic_areas}
    if opportunity.therapeutic_area_ids:
        ta_match = len(set(opportunity.therapeutic_area_ids) & ta_ids) / len(ta_ids)
        relevance += ta_match * 0.4
    
    # Product match
    product_ids = {p.id for p in products}
    if opportunity.product_ids:
        product_match = len(set(opportunity.product_ids) & product_ids) / len(product_ids)
        relevance += product_match * 0.4
    
    # Disease match
    disease_ids = {d.id for d in diseases}
    if opportunity.disease_ids:
        disease_match = len(set(opportunity.disease_ids) & disease_ids) / len(disease_ids)
        relevance += disease_match * 0.2
    
    return min(1.0, relevance)


def get_lifecycle_adjustment(
    products: List[Product],
    opportunity_type: str
) -> float:
    """
    Adjust score based on product lifecycle stage alignment.
    """
    
    lifecycle_weights = {
        'preclinical': {
            'evidence_generation': 1.3,
            'process_automation': 0.7,
            'stakeholder_engagement': 0.8
        },
        'phase1': {
            'evidence_generation': 1.2,
            'process_automation': 0.8,
            'stakeholder_engagement': 0.9
        },
        'phase3': {
            'evidence_generation': 1.1,
            'process_automation': 0.9,
            'stakeholder_engagement': 1.2
        },
        'approved': {
            'evidence_generation': 0.9,
            'process_automation': 1.1,
            'stakeholder_engagement': 1.3
        },
        'mature': {
            'evidence_generation': 0.8,
            'process_automation': 1.3,
            'stakeholder_engagement': 1.0
        },
        'loe': {
            'evidence_generation': 0.7,
            'process_automation': 1.2,
            'stakeholder_engagement': 0.8
        }
    }
    
    # Average across products
    adjustments = []
    for product in products:
        stage = product.lifecycle_stage
        type_weights = lifecycle_weights.get(stage, {})
        adjustment = type_weights.get(opportunity_type, 1.0)
        adjustments.append(adjustment)
    
    return sum(adjustments) / len(adjustments) if adjustments else 1.0
```

### 3.2.4 UI Wireframe: Opportunity Radar v2.0

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  OPPORTUNITY RADAR v2.0                                    [Export ▼] [Share]    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ FILTERS                                                           [Reset]   │ │
│  │                                                                              │ │
│  │ Strategic Pillar  │ Persona      │ Archetype   │ Department    │ Score     │ │
│  │ [All         ▼]  │ [All     ▼]  │ [All    ▼]  │ [All      ▼]  │ [≥7.0  ▼] │ │
│  │                                                                              │ │
│  │ ─────────────────────────── v2.0 Domain Filters ───────────────────────────  │ │
│  │                                                                              │ │
│  │ Therapeutic Area  │ Product       │ Disease      │ Lifecycle    │ Evidence  │ │
│  │ [Oncology    ▼]  │ [Product A▼]  │ [All     ▼]  │ [Approved ▼] │ [All   ▼] │ │
│  │                                                                              │ │
│  │ [🔒 Governance: Low Risk ▼]  [🔄 Cross-Functional Only □]                    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ VIEW: [List ●] [Quadrant ○] [Heatmap ○] [Domain Map ○]                      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ # │ Opportunity                  │ Score │ Domain      │ Pillar │ Gov │ Act │ │
│  │───┼──────────────────────────────┼───────┼─────────────┼────────┼─────┼─────│ │
│  │ 1 │ Evidence Gap Analysis Engine │ 9.4   │ Oncology    │ SP02   │ 🟢  │ [→] │ │
│  │   │ └─ Products: Drug A, Drug B  │ ±0.3  │ NSCLC       │        │     │     │ │
│  │   │ └─ Cross-functional: +3 depts│       │             │        │     │     │ │
│  │───┼──────────────────────────────┼───────┼─────────────┼────────┼─────┼─────│ │
│  │ 2 │ MI Response Automation       │ 9.3   │ All TAs     │ SP02   │ 🟢  │ [→] │ │
│  │   │ └─ Volume: 5,200 inquiries/yr│ ±0.2  │             │        │     │     │ │
│  │───┼──────────────────────────────┼───────┼─────────────┼────────┼─────┼─────│ │
│  │ 3 │ KOL Meeting Prep Suite       │ 9.1   │ Oncology    │ SP03   │ 🟡  │ [→] │ │
│  │   │ └─ Products: Drug A          │ ±0.4  │ Immuno-Onc  │        │HITL │     │ │
│  │   │ └─ Lifecycle: Approved       │       │             │        │     │     │ │
│  │───┼──────────────────────────────┼───────┼─────────────┼────────┼─────┼─────│ │
│  │ 4 │ Congress Intelligence        │ 8.9   │ Oncology    │ SP03   │ 🟢  │ [→] │ │
│  │   │ └─ Synergy: +Publications    │ ±0.3  │ Multi-TA    │        │     │     │ │
│  │───┼──────────────────────────────┼───────┼─────────────┼────────┼─────┼─────│ │
│  │ 5 │ Adverse Event Detection      │ 8.7   │ All TAs     │ SP04   │ 🔴  │ [→] │ │
│  │   │ └─ Governance: HIGH PRIORITY │ ±0.2  │             │        │GATE │     │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  Showing 1-5 of 87 opportunities matching filters          [< Prev] [Next >]     │
│                                                                                   │
│  🟢 Low governance risk   🟡 HITL required   🔴 Governance gate required          │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Feature: Discovery Brief Generator v2.0

### 3.3.1 Overview

The Discovery Brief Generator v2.0 creates hyper-personalized opportunity briefs using the Intelligence Broker to fuse persona context, domain knowledge, and opportunity data.

### 3.3.2 Functional Requirements

| ID | Requirement | Priority | v2.0 Enhancement |
|----|-------------|----------|------------------|
| DB-001 | Generate persona-specific Discovery Brief | P0 | Intelligence Broker integration |
| DB-002 | Include JTBD alignment analysis | P0 | - |
| DB-003 | Include value calculation summary | P0 | - |
| DB-004 | Include implementation considerations | P0 | - |
| DB-005 | **NEW**: Include domain context summary | P0 | L0 entity integration |
| DB-006 | **NEW**: Include governance assessment | P0 | Policy-as-Code preview |
| DB-007 | **NEW**: Include cross-functional synergies | P1 | GraphRAG-detected |
| DB-008 | **NEW**: Include product lifecycle alignment | P1 | L0 attribute |
| DB-009 | **NEW**: Include evidence type recommendations | P1 | Domain-specific |
| DB-010 | **NEW**: Include competitive context | P2 | Benchmark data |
| DB-011 | Export to PDF, DOCX | P0 | - |
| DB-012 | Generate in <3 seconds (was <5s) | P0 | Broker caching |

### 3.3.3 Brief Generation Flow (v2.0)

```python
async def generate_discovery_brief_v2(
    opportunity_id: str,
    persona_id: str,
    broker: IntelligenceBroker,
    governance: GovernanceEngine
) -> DiscoveryBrief:
    """
    Generate hyper-personalized Discovery Brief using Intelligence Broker.
    """
    
    # 1. Get unified intelligence context from Broker
    intelligence_context = await broker.get_context(
        query=f"Generate discovery brief for opportunity {opportunity_id}",
        persona_id=persona_id,
        execution_context={
            'task': 'discovery_brief',
            'opportunity_id': opportunity_id
        }
    )
    
    # 2. Extract domain context
    domain_entities = intelligence_context.domain_entities
    structural_context = intelligence_context.structural_context
    
    # 3. Get opportunity details with domain enrichment
    opportunity = await get_opportunity_with_domain(
        opportunity_id=opportunity_id,
        domain_entities=domain_entities
    )
    
    # 4. Get persona JTBD alignment
    jtbd_alignment = await calculate_jtbd_alignment(
        opportunity=opportunity,
        persona_jtbd=structural_context['persona'].get('jtbd', [])
    )
    
    # 5. Calculate domain-aware value
    value_calculation = await calculate_value_v2(
        opportunity=opportunity,
        domain_context=domain_entities,
        persona_context=structural_context['persona']
    )
    
    # 6. Pre-assess governance requirements
    governance_assessment = await governance.preview_requirements(
        opportunity=opportunity,
        domain_entities=domain_entities
    )
    
    # 7. Detect cross-functional synergies
    synergies = await detect_synergies(
        opportunity=opportunity,
        graph_context=structural_context.get('domain', {})
    )
    
    # 8. Generate lifecycle alignment
    lifecycle_fit = calculate_lifecycle_fit(
        opportunity=opportunity,
        products=[e for e in domain_entities if e.type == 'product']
    )
    
    # 9. Assemble brief sections
    brief = DiscoveryBrief(
        opportunity=opportunity,
        
        # Persona-specific sections
        executive_summary=generate_executive_summary(
            opportunity=opportunity,
            archetype=structural_context['persona'].get('archetype'),
            domain_entities=domain_entities
        ),
        
        jtbd_alignment=JTBDAlignmentSection(
            matched_jtbd=jtbd_alignment.matched,
            alignment_score=jtbd_alignment.score,
            unmet_outcomes=jtbd_alignment.gaps
        ),
        
        # Domain-specific sections (NEW)
        domain_context=DomainContextSection(
            therapeutic_areas=[e for e in domain_entities if e.type == 'therapeutic_area'],
            products=[e for e in domain_entities if e.type == 'product'],
            diseases=[e for e in domain_entities if e.type == 'disease'],
            relevance_explanation=generate_domain_relevance_text(
                opportunity, domain_entities
            )
        ),
        
        # Value sections
        value_proposition=ValueSection(
            primary_value=value_calculation.primary_driver,
            quantified_benefits=value_calculation.benefits,
            roi_projection=value_calculation.roi,
            confidence_interval=value_calculation.confidence
        ),
        
        # Implementation sections
        implementation_path=ImplementationSection(
            recommended_approach=opportunity.intervention_type,
            prerequisites=opportunity.prerequisites,
            dependencies=opportunity.dependencies,
            estimated_timeline=value_calculation.timeline,
            resource_requirements=value_calculation.resources
        ),
        
        # Governance section (NEW)
        governance_preview=GovernanceSection(
            risk_level=governance_assessment.risk_level,
            policies_applicable=governance_assessment.policies,
            hitl_requirements=governance_assessment.hitl_checkpoints,
            compliance_considerations=governance_assessment.compliance_notes
        ),
        
        # Synergy section (NEW)
        cross_functional_synergies=SynergySection(
            related_opportunities=synergies.related_opportunities,
            shared_components=synergies.shared_components,
            combined_value=synergies.combined_value_potential
        ),
        
        # Lifecycle section (NEW)
        lifecycle_alignment=LifecycleSection(
            fit_score=lifecycle_fit.score,
            stage_recommendations=lifecycle_fit.recommendations,
            timing_considerations=lifecycle_fit.timing
        ),
        
        # Call to action (archetype-adapted)
        recommended_next_steps=generate_next_steps(
            opportunity=opportunity,
            archetype=structural_context['persona'].get('archetype'),
            governance=governance_assessment
        ),
        
        # Metadata
        generated_at=datetime.utcnow(),
        persona_id=persona_id,
        confidence_score=intelligence_context.confidence
    )
    
    return brief
```

### 3.3.4 Discovery Brief Template (v2.0)

```markdown
# Discovery Brief: [Opportunity Name]
**Generated for:** [Persona Name] | [Role] | [Department]
**Archetype:** [Orchestrator/Automator/Learner/Skeptic]
**Date:** [Generated Date]
**Confidence Score:** [X.X]/10

---

## Executive Summary

[2-3 paragraph archetype-adapted summary of the opportunity, 
emphasizing aspects most relevant to the persona's role and concerns]

---

## Domain Context (NEW in v2.0)

### Therapeutic Areas
- **Primary TA:** [TA Name] (Relevance: High)
- **Secondary TAs:** [List]

### Products
| Product | Lifecycle Stage | Relevance |
|---------|-----------------|-----------|
| [Name]  | [Stage]         | [Score]   |

### Disease Areas
- [Disease 1]: [Relevance explanation]
- [Disease 2]: [Relevance explanation]

---

## JTBD Alignment

### Matched Jobs-to-be-Done
| JTBD | Alignment Score | Key Outcomes Addressed |
|------|-----------------|------------------------|
| [Job] | [X.X]/10 | [Outcomes] |

### Opportunity Gap Analysis
[How this opportunity addresses unmet needs in your role]

---

## Value Proposition

### Primary Value Driver
[Main benefit with quantification]

### Quantified Benefits
| Benefit | Estimate | Confidence |
|---------|----------|------------|
| [Benefit] | [Value] | [High/Med/Low] |

### ROI Projection
- **Year 1:** [ROI]%
- **Year 3:** [ROI]%
- **Confidence Interval:** [Range]

---

## Governance Assessment (NEW in v2.0)

### Risk Level: [🟢 Low | 🟡 Medium | 🔴 High]

### Applicable Policies
- [Policy 1]: [Requirement]
- [Policy 2]: [Requirement]

### Human-in-the-Loop Requirements
| Checkpoint | Trigger | Reviewer |
|------------|---------|----------|
| [Gate] | [Condition] | [Role] |

### Compliance Considerations
[Domain-specific regulatory notes]

---

## Cross-Functional Synergies (NEW in v2.0)

### Related Opportunities
| Opportunity | Synergy Type | Combined Value Uplift |
|-------------|--------------|----------------------|
| [Name] | [Type] | +[X]% |

### Shared Components
- [Component]: Reusable across [N] opportunities

---

## Lifecycle Alignment (NEW in v2.0)

### Fit Score: [X.X]/10

### Stage-Specific Recommendations
[Based on product lifecycle stages in your portfolio]

### Timing Considerations
[When to implement based on lifecycle dynamics]

---

## Implementation Path

### Recommended Approach: [Automate | Augment | Assist | Advise]

### Prerequisites
1. [Prerequisite 1]
2. [Prerequisite 2]

### Timeline Estimate
| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Discovery | [X weeks] | [Deliverables] |
| Implementation | [X weeks] | [Deliverables] |
| Optimization | [X weeks] | [Deliverables] |

### Resource Requirements
| Resource | Quantity | Duration |
|----------|----------|----------|
| [Role] | [N] | [Duration] |

---

## Recommended Next Steps

[Archetype-adapted action items]

### For Orchestrators:
1. [Strategic action]
2. [Stakeholder engagement]
3. [Portfolio alignment]

### For Skeptics:
1. [Validation step]
2. [Risk mitigation]
3. [Proof point requirement]

---

**Document ID:** [UUID]
**Version:** 2.0
**Expires:** [Date + 30 days]
```

## 3.4 Feature: Transformation Dashboard (NEW)

### 3.4.1 Overview

The Transformation Dashboard provides a real-time view of the **Transformation Flywheel**, showing the relationship between adoption, intelligence generation, opportunity discovery, and value realization.

### 3.4.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| TD-001 | Display flywheel visualization with metrics | P0 |
| TD-002 | Show adoption metrics by persona/archetype | P0 |
| TD-003 | Track opportunity pipeline (identified → prioritized → implemented → realized) | P0 |
| TD-004 | Display value realization vs projection | P0 |
| TD-005 | Show intelligence generation metrics (queries, context builds) | P1 |
| TD-006 | Portfolio view by TA/Product | P1 |
| TD-007 | Maturity progression tracking | P1 |
| TD-008 | Benchmark against industry peers | P2 |
| TD-009 | Predictive analytics for transformation velocity | P2 |

### 3.4.3 UI Wireframe: Transformation Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TRANSFORMATION DASHBOARD                              [Time: Last 90 Days ▼]    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        TRANSFORMATION FLYWHEEL                               │ │
│  │                                                                              │ │
│  │                    ┌─────────────────┐                                       │ │
│  │                    │   ADOPTION      │                                       │ │
│  │                    │    ████████     │                                       │ │
│  │                    │   847 users     │                                       │ │
│  │                    │   +23% ▲        │                                       │ │
│  │                    └────────┬────────┘                                       │ │
│  │                             │                                                │ │
│  │          ┌──────────────────┼──────────────────┐                            │ │
│  │          │                  ▼                  │                            │ │
│  │  ┌───────┴───────┐  ┌─────────────────┐  ┌────┴────────┐                   │ │
│  │  │ VALUE         │  │  INTELLIGENCE   │  │ OPPORTUNITY │                   │ │
│  │  │ REALIZATION   │  │  GENERATION     │  │ DISCOVERY   │                   │ │
│  │  │  ███████      │◄─┤   ████████████  │─►│  ████████   │                   │ │
│  │  │  $4.2M        │  │   12,340        │  │  127 new    │                   │ │
│  │  │  92% of proj  │  │   contexts/day  │  │  +34 this Q │                   │ │
│  │  └───────────────┘  └─────────────────┘  └─────────────┘                   │ │
│  │                                                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ OPPORTUNITY PIPELINE         │  │ VALUE REALIZATION TRACKING               │ │
│  │                              │  │                                          │ │
│  │ Identified:     127  ████████│  │ Projected:    $5.0M   ████████████████   │ │
│  │ Prioritized:     48  ███     │  │ Realized:     $4.2M   █████████████      │ │
│  │ In Progress:     23  ██      │  │ Tracking:      84%    On Track           │ │
│  │ Implemented:     15  █       │  │                                          │ │
│  │ Value Realized:  12  █       │  │ By Quarter:                              │ │
│  │                              │  │ Q1: $1.1M │ Q2: $1.4M │ Q3: $1.7M        │ │
│  │ Conversion Rate: 60%         │  │                                          │ │
│  └──────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                   │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ ADOPTION BY ARCHETYPE        │  │ PORTFOLIO VIEW (by TA)                   │ │
│  │                              │  │                                          │ │
│  │ Orchestrator: 89%  █████████ │  │ Oncology:      45 opps │ $2.1M value     │ │
│  │ Automator:    78%  ████████  │  │ Immunology:    32 opps │ $1.2M value     │ │
│  │ Learner:      65%  ███████   │  │ Neurology:     28 opps │ $0.6M value     │ │
│  │ Skeptic:      52%  █████     │  │ Rare Disease:  22 opps │ $0.3M value     │ │
│  │                              │  │                                          │ │
│  │ Target: 70% overall          │  │ [View by Product ▼]                      │ │
│  └──────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ AI MATURITY PROGRESSION                                                      │ │
│  │                                                                              │ │
│  │ Level 1 (Basic)      ██████████████████████████████████████  245 users      │ │
│  │ Level 2 (Developing) ████████████████████████████  189 users                │ │
│  │ Level 3 (Proficient) ██████████████████  142 users                          │ │
│  │ Level 4 (Advanced)   ████████████  98 users                                 │ │
│  │ Level 5 (Expert)     ██████  56 users                                       │ │
│  │                                                                              │ │
│  │ Avg Maturity Score: 2.8 → 3.2 (Target: 3.5 by EOY)                          │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 Feature: Domain Explorer (NEW)

### 3.5.1 Overview

The Domain Explorer allows users to navigate the L0 Domain Knowledge layer and discover opportunities by therapeutic area, product, or disease.

### 3.5.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DE-001 | Navigate by Therapeutic Area hierarchy | P0 |
| DE-002 | Navigate by Product portfolio | P0 |
| DE-003 | Navigate by Disease area | P0 |
| DE-004 | View opportunities mapped to domain entities | P0 |
| DE-005 | View JTBDs relevant to domain entities | P1 |
| DE-006 | View personas working in domain | P1 |
| DE-007 | Visualize entity relationships | P1 |
| DE-008 | Filter Opportunity Radar by selected entity | P0 |
| DE-009 | Export domain-filtered reports | P2 |

## 3.6 Feature: Governance Advisor (NEW)

### 3.6.1 Overview

The Governance Advisor provides pre-implementation assessment of governance requirements for opportunities, leveraging Policy-as-Code integration.

### 3.6.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GA-001 | Display governance risk level for each opportunity | P0 |
| GA-002 | List applicable policies | P0 |
| GA-003 | Identify HITL checkpoint requirements | P0 |
| GA-004 | Estimate HITL effort/time | P1 |
| GA-005 | Provide compliance score by domain | P1 |
| GA-006 | Suggest mitigation strategies | P1 |
| GA-007 | Forecast audit readiness | P2 |
| GA-008 | Compare governance requirements across opportunities | P2 |

---

# 4. Technical Architecture

## 4.1 System Architecture (v2.0)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    USE CASE DISCOVERY ENGINE v2.0 ARCHITECTURE                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│                              PRESENTATION LAYER                                   │
│   ┌─────────────────────────────────────────────────────────────────────────────┐│
│   │  Opportunity   │  Discovery    │  Transform.  │  Domain     │  Governance  ││
│   │  Radar UI      │  Brief UI     │  Dashboard   │  Explorer   │  Advisor     ││
│   └─────────────────────────────────────────────────────────────────────────────┘│
│                                         │                                        │
│                                         ▼                                        │
│                              API GATEWAY (GraphQL + REST)                        │
│   ┌─────────────────────────────────────────────────────────────────────────────┐│
│   │  /opportunities  │ /briefs  │ /transform  │ /domain  │ /governance │ /value ││
│   └─────────────────────────────────────────────────────────────────────────────┘│
│                                         │                                        │
│                                         ▼                                        │
│                                SERVICE LAYER                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐│
│   │                                                                              ││
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          ││
│   │  │  Opportunity     │  │  Value           │  │  Discovery       │          ││
│   │  │  Scoring         │  │  Calculator      │  │  Brief           │          ││
│   │  │  Service         │  │  Service         │  │  Generator       │          ││
│   │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          ││
│   │           │                     │                     │                     ││
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          ││
│   │  │  Maturity        │  │  Implementation  │  │  Report          │          ││
│   │  │  Assessment      │  │  Planner         │  │  Generator       │          ││
│   │  │  Service         │  │  Service         │  │  Service         │          ││
│   │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          ││
│   │           │                     │                     │                     ││
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          ││
│   │  │  JTBD            │  │  Domain          │  │  Transformation  │          ││
│   │  │  Navigator       │  │  Explorer        │  │  Analytics       │          ││
│   │  │  Service         │  │  Service (NEW)   │  │  Service (NEW)   │          ││
│   │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          ││
│   │           │                     │                     │                     ││
│   └───────────┼─────────────────────┼─────────────────────┼─────────────────────┘│
│               │                     │                     │                      │
│               └─────────────────────┼─────────────────────┘                      │
│                                     ▼                                            │
│                    ┌────────────────────────────────────┐                        │
│                    │      INTELLIGENCE BROKER           │                        │
│                    │                                    │                        │
│                    │  • Entity Resolution (L0)          │                        │
│                    │  • GraphRAG (IIG)                  │                        │
│                    │  • VectorRAG (Pinecone)            │                        │
│                    │  • Context Fusion                  │                        │
│                    └────────────────────────────────────┘                        │
│                                     │                                            │
│                    ┌────────────────┼────────────────────┐                       │
│                    │                │                    │                       │
│                    ▼                ▼                    ▼                       │
│   ┌────────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│   │    PostgreSQL      │  │     Neo4j        │  │    Pinecone      │            │
│   │    (Supabase)      │  │     (IIG)        │  │    (Vectors)     │            │
│   │                    │  │                  │  │                  │            │
│   │  • Opportunities   │  │  • L0-L7 Graph   │  │  • Document      │            │
│   │  • Personas        │  │  • Relationships │  │    embeddings    │            │
│   │  • JTBDs           │  │  • Pathfinding   │  │  • Semantic      │            │
│   │  • Domain (L0)     │  │                  │  │    search        │            │
│   │  • Value           │  │                  │  │                  │            │
│   └────────────────────┘  └──────────────────┘  └──────────────────┘            │
│                                                                                   │
│                    ┌────────────────────────────────────┐                        │
│                    │      GOVERNANCE ENGINE             │                        │
│                    │                                    │                        │
│                    │  • Policy-as-Code (OPA)            │                        │
│                    │  • HITL Preview                    │                        │
│                    │  • Compliance Scoring              │                        │
│                    └────────────────────────────────────┘                        │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Data Requirements (v2.0)

### Input Data Sources

| Data Source | Purpose | Update Frequency | v2.0 Change |
|-------------|---------|------------------|-------------|
| Personas | User context, archetypes | Daily | Via CDC |
| JTBDs | Job definitions, outcomes | Weekly | Via CDC |
| Opportunities | Opportunity catalog | Real-time | Via CDC |
| Maturity Assessments | Readiness scores | Monthly | Via CDC |
| Workflow Metrics | Time/error baselines | Daily | Via CDC |
| User Feedback | Adoption, satisfaction | Real-time | - |
| **L0 Domain Entities** | TAs, Products, Diseases | Daily | **NEW** |
| **Governance Policies** | Compliance rules | On change | **NEW** |
| **Value Realization** | Actual ROI tracking | Weekly | **NEW** |

### Output Data Artifacts

| Artifact | Format | Retention | v2.0 Change |
|----------|--------|-----------|-------------|
| Discovery Briefs | JSON, PDF | 90 days | + domain context |
| Value Calculations | JSON | Indefinite | + confidence bands |
| Roadmaps | JSON, PDF, XLSX | Indefinite | + governance gates |
| Assessment Results | JSON | Indefinite | - |
| Audit Logs | Structured logs | 7 years | + governance |
| **Transformation Metrics** | JSON | Indefinite | **NEW** |
| **Domain Reports** | PDF, PPTX | 90 days | **NEW** |

## 4.3 Performance Requirements (v2.0)

| Metric | v1.0 Target | v2.0 Target | Notes |
|--------|-------------|-------------|-------|
| Opportunity Radar load time | <2 seconds | <1.5 seconds | With domain filters |
| Discovery Brief generation | <5 seconds | <3 seconds | Broker caching |
| Value calculation | <1 second | <500ms | Optimized formulas |
| Search response | <500ms | <300ms | GraphRAG optimization |
| Concurrent users | 500+ | 1,000+ | Horizontal scaling |
| Data freshness | <15 minutes | **Real-time** | CDC pipeline |
| Domain filter response | N/A | <200ms | L0 index |
| Governance preview | N/A | <1 second | OPA query |

## 4.4 Security Requirements (v2.0)

| Requirement | Implementation | v2.0 Enhancement |
|-------------|----------------|------------------|
| Authentication | JWT with OIDC | - |
| Authorization | RBAC with RLS | + domain-level permissions |
| Data isolation | Tenant-level separation | + TA-level isolation option |
| Audit logging | All access logged | + governance decisions |
| Encryption | TLS 1.3, AES-256 at rest | - |
| Compliance | SOC2, HIPAA-ready | + Policy-as-Code |

---

# 5. Release Plan

## 5.1 MVP (Phase 1) - Q1 2026

**Scope:**
- Opportunity Radar v2.0 (L0 filters, governance tags)
- Value Calculator v2.0 (domain weighting, confidence bands)
- Discovery Brief v2.0 (domain context, governance preview)
- Intelligence Broker integration

**Success Criteria:**
- 100+ users generating briefs weekly
- 95% of opportunities have L0 entity mapping
- Brief generation <3 seconds
- NPS >50

## 5.2 Enhanced (Phase 2) - Q2 2026

**Scope:**
- Domain Explorer (full L0 navigation)
- Transformation Dashboard (flywheel metrics)
- Governance Advisor (full policy preview)
- Implementation Planner v2.0 (governance gates)
- Advanced visualizations

**Success Criteria:**
- Leadership using for quarterly planning
- 85% of value projections within ±15% of actual
- 60% opportunity conversion rate
- NPS >60

## 5.3 Enterprise (Phase 3) - Q3 2026

**Scope:**
- Organization-wide aggregation
- Benchmark comparisons (industry)
- Project management integration
- Predictive analytics
- API for external consumption
- Multi-tenant comparison

**Success Criteria:**
- Board-level reporting generated from platform
- Full strategic pillar coverage
- 95% governance compliance
- NPS >70

---

# 6. Appendices

## Appendix A: Scoring Methodology Reference (v2.0)

### VPANES Composite Score v2.0

```
VPANES_v2 = 
  (V × 0.22) +           -- Value (reduced from 0.25)
  (P × 0.18) +           -- Pain (reduced from 0.20)
  (A × 0.13) +           -- Adoption (reduced from 0.15)
  (N × 0.15) +           -- Network (unchanged)
  (E × 0.12) +           -- Ease (reduced from 0.15)
  (S × 0.10) +           -- Strategic (unchanged)
  (DR × 0.05 × 10) +     -- Domain Relevance (NEW)
  (LF × 0.03 × 10) +     -- Lifecycle Fit (NEW)
  (SY × 0.02 × 10)       -- Synergy (NEW)

× TA_Complexity_Factor    -- Applied as multiplier (NEW)

Where:
V, P, A, N, E, S = 0-10 scale
DR, LF, SY = 0-1 scale (multiplied by 10)
TA_Complexity_Factor = 0.8-1.2 based on therapeutic area
```

### Domain Relevance Calculation

```
Domain_Relevance = 
  (TA_Match × 0.4) +      -- Therapeutic Area match rate
  (Product_Match × 0.4) + -- Product portfolio match rate
  (Disease_Match × 0.2)   -- Disease area match rate

Match_Rate = |Intersection| / |User_Context|
```

### Lifecycle Fit Scoring

```
Lifecycle_Fit = weighted_average(
  Product_Stage × Stage_Weight[Opportunity_Type]
)

Stage_Weights vary by opportunity type:
- Evidence Generation: Higher for early stages
- Process Automation: Higher for mature stages
- Stakeholder Engagement: Higher for approved stages
```

## Appendix B: v1 to v2 Migration

### Data Migration

| Data | Migration Action |
|------|------------------|
| Opportunities | Add L0 entity references |
| JTBDs | Add domain context fields |
| Value Calculations | Add confidence bands |
| Discovery Briefs | Regenerate with v2 template |

### API Changes

| Endpoint | v1 | v2 | Breaking? |
|----------|-----|-----|-----------|
| /opportunities | Basic list | + domain filters | No (additive) |
| /briefs/generate | Basic | + domain context | No (additive) |
| /value/calculate | Static | + confidence | No (additive) |
| /domain/* | N/A | New endpoint | N/A |
| /governance/* | N/A | New endpoint | N/A |
| /transform/* | N/A | New endpoint | N/A |

## Appendix C: Glossary (v2.0 Additions)

| Term | Definition |
|------|------------|
| **Domain Explorer** | Interface for navigating L0 entities |
| **Governance Advisor** | Policy-as-Code preview tool |
| **Intelligence Broker** | Unified GraphRAG + VectorRAG service |
| **L0 Domain Knowledge** | Subject matter layer (TAs, Products, Diseases) |
| **Lifecycle Fit** | Alignment of opportunity with product stage |
| **Projection Spine** | CDC pipeline for real-time sync |
| **Transformation Dashboard** | Flywheel metrics visualization |
| **Transformation Flywheel** | Adoption → Intelligence → Opportunity → Value cycle |

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-28 | Product Team | Initial Use Case Discovery Engine |
| 2.0 | 2025-11-28 | Product Team | L0 Integration, Intelligence Broker, Governance Advisor, Transformation Dashboard, Domain Explorer |

---

**Document Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Engineering Lead | | | |
| UX Lead | | | |
| Medical Affairs Sponsor | | | |
| Executive Sponsor | | | |
| Chief Data Officer | | | |

---

**END OF PRD v2.0**
