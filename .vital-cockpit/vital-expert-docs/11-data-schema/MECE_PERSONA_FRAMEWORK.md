# MECE Framework for 4 Personas Per Role
## Mutually Exclusive, Collectively Exhaustive Persona Differentiation

**Date**: 2025-01-27  
**Purpose**: Create 4 distinct personas per role using a MECE framework  
**Based on**: Research and industry best practices

---

## 🎯 MECE Framework Definition

### **Mutually Exclusive (ME)**
Each persona has unique, non-overlapping attributes that clearly distinguish it from the other 3.

### **Collectively Exhaustive (CE)**
The 4 personas together cover all possible combinations of the two primary dimensions.

---

## 📊 Primary Differentiation: 2×2 Matrix

### **Dimension 1: AI Maturity** (Low ↔ High)
- **Low**: Cautious, needs guidance, prioritizes safety
- **High**: AI-native, comfortable with experimentation, prioritizes speed

### **Dimension 2: Work Complexity** (Routine ↔ Strategic)
- **Routine**: Repetitive, predictable, process-driven
- **Strategic**: Variable, complex, decision-driven

### **The 4 Personas:**

```
                    AI MATURITY
                        HIGH
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │  1. AUTOMATOR  │ 2. ORCHESTRATOR│
        │                │                │
ROUTINE │  High AI +     │  High AI +     │
        │  Routine Work  │  Strategic Work│
        │                │                │
        ─────────────────┼─────────────────
        │                │                │
        │  3. LEARNER    │  4. SKEPTIC    │
        │                │                │
STRATEGIC│  Low AI +     │  Low AI +      │
        │  Routine Work  │  Strategic Work│
        │                │                │
        └────────────────┼────────────────┘
                         │
                        LOW
```

---

## 🔍 Secondary Differentiators (For Distinctiveness)

To ensure personas are truly distinct, we add secondary attributes:

### **1. Geographic Scope**
- **Global**: Cross-regional, enterprise-wide
- **Regional**: Multi-country, regional operations
- **Local/Country**: Country-specific, local operations

### **2. Organization Size/Type**
- **Large Pharma**: Established, process-driven, scale-focused
- **Emerging Biopharma**: Agile, innovation-focused, growth-oriented
- **Specialty Pharma**: Niche-focused, precision-oriented
- **Mid-Size Pharma**: Balanced, flexible

### **3. Seniority & Experience**
- **Entry/Mid**: 3-7 years experience, building expertise
- **Senior/Director**: 8-15 years experience, established expert
- **Executive**: 15+ years experience, strategic leader

### **4. Work Context**
- **Field-Based**: Travel, customer-facing, external focus
- **Office-Based**: Internal, process-driven, collaboration-focused
- **Hybrid**: Mix of field and office work

---

## 📋 Complete Persona Specifications

### **PERSONA 1: AUTOMATOR**
**AI Maturity: HIGH | Work Complexity: ROUTINE**

#### Core Attributes:
- `technology_adoption`: `early_adopter`
- `risk_tolerance`: `moderate`
- `change_readiness`: `high`
- `work_pattern`: `routine`
- `work_complexity_score`: 30-40 (routine)
- `ai_maturity_score`: 70-80 (high)

#### Secondary Attributes:
- `seniority_level`: `mid` to `senior`
- `years_of_experience`: 5-10
- `geographic_scope`: `global` or `regional`
- `typical_org_size`: `Large Pharma`
- `preferred_service_layer`: `WORKFLOWS`

#### Characteristics:
- Focuses on efficiency and automation
- Hates repetitive tasks
- Builds systems to save time
- Prefers batch processing and templates
- Values speed and consistency

#### Gen AI Opportunities:
- Workflow automation
- Template generation
- Batch processing
- Data extraction

---

### **PERSONA 2: ORCHESTRATOR**
**AI Maturity: HIGH | Work Complexity: STRATEGIC**

#### Core Attributes:
- `technology_adoption`: `early_adopter` or `innovator`
- `risk_tolerance`: `moderate`
- `change_readiness`: `high`
- `work_pattern`: `strategic`
- `work_complexity_score`: 60-80 (strategic)
- `ai_maturity_score`: 70-85 (high)

#### Secondary Attributes:
- `seniority_level`: `senior` to `director` to `executive`
- `years_of_experience`: 10-20
- `geographic_scope`: `global`
- `typical_org_size`: `Large Pharma` or `Emerging Biopharma`
- `preferred_service_layer`: `ASK_PANEL`

#### Characteristics:
- Strategic thinker
- Needs multi-source synthesis
- Cross-functional collaboration
- Complex problem-solving
- Values insight quality over speed

#### Gen AI Opportunities:
- Multi-agent reasoning
- Complex synthesis
- Strategic scenario planning
- Evidence gap analysis

---

### **PERSONA 3: LEARNER**
**AI Maturity: LOW | Work Complexity: ROUTINE**

#### Core Attributes:
- `technology_adoption`: `early_majority` or `late_majority`
- `risk_tolerance`: `conservative`
- `change_readiness`: `moderate`
- `work_pattern`: `routine`
- `work_complexity_score`: 20-40 (routine)
- `ai_maturity_score`: 30-45 (low)

#### Secondary Attributes:
- `seniority_level`: `entry` to `mid`
- `years_of_experience`: 3-7
- `geographic_scope`: `local` or `country`
- `typical_org_size`: `Mid-Size Pharma` or `Specialty Pharma`
- `preferred_service_layer`: `ASK_EXPERT`

#### Characteristics:
- Learning and building confidence
- Needs step-by-step guidance
- Cautious but willing to try
- Values error prevention
- Progressive complexity preferred

#### Gen AI Opportunities:
- Guided workflows
- Template libraries with examples
- Learning mode with tips
- Error prevention and validation

---

### **PERSONA 4: SKEPTIC**
**AI Maturity: LOW | Work Complexity: STRATEGIC**

#### Core Attributes:
- `technology_adoption`: `late_majority` or `laggard`
- `risk_tolerance`: `very_conservative` or `conservative`
- `change_readiness`: `low`
- `work_pattern`: `strategic`
- `work_complexity_score`: 60-80 (strategic)
- `ai_maturity_score`: 25-45 (low)

#### Secondary Attributes:
- `seniority_level`: `senior` to `director` to `executive`
- `years_of_experience`: 15-25
- `geographic_scope`: `global` or `regional`
- `typical_org_size`: `Large Pharma` (established)
- `preferred_service_layer`: `ASK_PANEL` (with HITL)

#### Characteristics:
- Traditionalist approach
- Needs proof of value
- Prioritizes quality and compliance
- Requires transparency
- Values control and validation

#### Gen AI Opportunities:
- Transparent reasoning
- Citation and source tracking
- Human-in-the-loop workflows
- Quality assurance and validation

---

## ✅ MECE Validation Checklist

### **Mutually Exclusive Check:**
- [ ] Each persona has unique `archetype` value
- [ ] No two personas share the same combination of `ai_maturity_score` and `work_complexity_score`
- [ ] Secondary attributes differ meaningfully
- [ ] `preferred_service_layer` is distinct per archetype

### **Collectively Exhaustive Check:**
- [ ] All 4 archetypes exist for each role
- [ ] Covers all combinations: (High/Low AI) × (Routine/Strategic Work)
- [ ] No gaps in the 2×2 matrix

---

## 🎯 Implementation Strategy

### **Step 1: Analyze Existing Personas**
Run `analyze_persona_archetype_distribution.sql` to see current state.

### **Step 2: Identify Gaps**
For each role, identify which archetypes are missing.

### **Step 3: Create Missing Personas**
Use the template in `create_4_mece_personas_per_role.sql` to generate SQL.

### **Step 4: Validate MECE**
Ensure:
- No duplicate archetypes per role
- All 4 archetypes present
- Attributes are distinct

### **Step 5: Populate Attributes**
Fill in:
- Pain points (archetype-specific)
- Goals (archetype-specific)
- JTBDs (archetype-specific)
- Service layer preferences

---

## 📊 Example: Medical Director Role

### **Medical Director - Automator**
- Focus: Automate routine team updates and reporting
- Pain: "10 hours/week on manual reporting"
- Service: Workflows (80% usage)

### **Medical Director - Orchestrator**
- Focus: Synthesize evidence for strategic decisions
- Pain: "Can't synthesize evidence from 50+ sources"
- Service: Ask Panel (60% usage)

### **Medical Director - Learner**
- Focus: Learn Medical Affairs best practices
- Pain: "New to Medical Affairs, learning best practices"
- Service: Ask Expert + Guided Workflows

### **Medical Director - Skeptic**
- Focus: Maintain quality and compliance
- Pain: "Can't trust AI without verification"
- Service: Ask Panel + HITL Workflows

---

## 🔗 Related Documents

- `GEN_AI_OPPORTUNITY_ALIGNMENT.md` - Gen AI opportunity mapping
- `STRATEGIC_PERSONA_DIFFERENTIATION_FOR_GEN_AI.md` - Strategic framework
- `.claude/vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md` - Gold standard

---

**This MECE framework ensures each role has 4 distinct, non-overlapping personas that collectively cover all AI maturity and work complexity combinations.**

