# Medical Affairs: Fresh Start with MECE Personas

## Overview

This document outlines the approach for creating 4 distinct, MECE (Mutually Exclusive, Collectively Exhaustive) personas for each Medical Affairs role in the pharmaceutical tenant.

## Strategy

### Step 1: Fresh Start
- **Soft delete** all existing personas (preserves data, marks as inactive)
- Start with a clean slate to ensure no overlap or inconsistencies

### Step 2: MECE Framework

Based on web research and the universal archetype framework, we create 4 personas per role using a **2×2 matrix**:

#### The Two Axes:
1. **Work Complexity** (Low ↔ High)
   - Low: Routine tasks, structured workflows, clear processes
   - High: Strategic decisions, cross-functional collaboration, ambiguous problems

2. **AI Maturity** (Low ↔ High)
   - Low: Cautious about AI, prefers traditional methods, needs high trust
   - High: Early adopter, comfortable with AI tools, embraces innovation

#### The Four Archetypes:

| | Low AI Maturity | High AI Maturity |
|---|---|---|
| **Low Complexity** | **LEARNER** | **AUTOMATOR** |
| **High Complexity** | **SKEPTIC** | **ORCHESTRATOR** |

### Step 3: Persona Differentiation

Each archetype has distinct attributes based on web research:

#### 1. AUTOMATOR (Process Optimizer)
- **Work Complexity**: Low (30/100)
- **AI Maturity**: High (80/100)
- **Profile**: Mid-level professional focused on optimizing routine processes
- **Characteristics**:
  - Years of experience: 6
  - Seniority: Mid
  - Technology adoption: Early adopter
  - Work pattern: Routine
  - Geographic scope: Regional
  - Team size: 3
  - Budget authority: Moderate
  - Decision style: Data-driven
- **Use Case**: Automates repetitive tasks, uses AI for document generation, workflow optimization

#### 2. ORCHESTRATOR (Strategic Leader)
- **Work Complexity**: High (75/100)
- **AI Maturity**: High (85/100)
- **Profile**: Senior leader managing complex strategic initiatives
- **Characteristics**:
  - Years of experience: 12
  - Seniority: Senior
  - Technology adoption: Early adopter
  - Work pattern: Strategic
  - Geographic scope: Global
  - Team size: 12
  - Budget authority: Significant
  - Decision style: Collaborative
- **Use Case**: Multi-agent AI systems, complex synthesis, strategic planning, cross-functional coordination

#### 3. LEARNER (Emerging Professional)
- **Work Complexity**: Low (20/100)
- **AI Maturity**: Low (35/100)
- **Profile**: Entry-level professional learning the role and AI tools
- **Characteristics**:
  - Years of experience: 2
  - Seniority: Entry
  - Technology adoption: Early majority
  - Work pattern: Routine
  - Geographic scope: Local
  - Team size: 1
  - Budget authority: Limited
  - Decision style: Consensus
- **Use Case**: Needs guidance, templates, step-by-step workflows, learning resources

#### 4. SKEPTIC (Experienced Traditionalist)
- **Work Complexity**: High (80/100)
- **AI Maturity**: Low (30/100)
- **Profile**: Experienced director with traditional approach, cautious about AI
- **Characteristics**:
  - Years of experience: 18
  - Seniority: Director
  - Technology adoption: Late majority
  - Work pattern: Strategic
  - Geographic scope: Global
  - Team size: 15
  - Budget authority: High
  - Decision style: Hierarchical
- **Use Case**: Needs proof points, compliance guarantees, gradual introduction, high transparency

## Medical Affairs Roles Covered

Based on web research, the following Medical Affairs roles will receive 4 personas each:

1. **Medical Science Liaison (MSL)**
2. **Medical Advisor**
3. **Medical Information Specialist**
4. **Medical Affairs Manager/Director**
5. **HEOR Specialist**
6. **Medical Director**
7. **Field Medical Director**
8. **Medical Writer**
9. **Publications Manager**
10. **Clinical Operations Support roles**
11. ... (all roles in Medical Affairs function)

## MECE Validation

### Mutually Exclusive
- Each persona has distinct attribute combinations
- No two personas share the same archetype for the same role
- Clear differentiation in work complexity and AI maturity scores

### Collectively Exhaustive
- All 4 archetypes cover the full spectrum:
  - Low complexity + Low AI maturity (Learner)
  - Low complexity + High AI maturity (Automator)
  - High complexity + Low AI maturity (Skeptic)
  - High complexity + High AI maturity (Orchestrator)
- Every possible combination is represented

## Implementation

### Script: `fresh_start_medical_affairs_personas.sql`

The script:
1. Soft deletes all existing personas
2. Identifies all Medical Affairs roles in pharma tenant
3. Creates 4 personas per role with distinct attributes
4. Verifies MECE compliance
5. Provides summary statistics

### Execution

```sql
\i fresh_start_medical_affairs_personas.sql
```

### Expected Results

- **Total Roles**: ~30-50 Medical Affairs roles (depending on your structure)
- **Total Personas**: ~120-200 personas (4 per role)
- **Archetype Distribution**: 25% each (Automator, Orchestrator, Learner, Skeptic)
- **MECE Compliance**: 100% (every role has exactly 4 distinct personas)

## Next Steps

After creating Medical Affairs personas:
1. Review and validate persona attributes
2. Add pain points and goals specific to each archetype
3. Map Jobs-To-Be-Done (JTBDs) for each persona
4. Identify Gen AI opportunities per archetype
5. Repeat process for other functions (Commercial, Regulatory, etc.)

## References

- Web research: Pharmaceutical Medical Affairs roles and responsibilities
- Framework: Universal Archetype Framework (Automator, Orchestrator, Learner, Skeptic)
- Strategy: PERSONA_STRATEGY_GOLD_STANDARD.md
- Schema: PERSONA_DATABASE_SCHEMA_NORMALIZED.sql

