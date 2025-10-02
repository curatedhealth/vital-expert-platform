# Adding Agents to VITAL Agent Library

## Overview

This guide explains how to add new agents to the VITAL agent library with proper evidence-based model recommendations, benchmark data, and citations.

**Related Documentation**:
- [Agent Data Model](./AGENT_DATA_MODEL.md) - Core schema and structure
- [Evidence-Based Model Scoring](./EVIDENCE_BASED_MODEL_SCORING.md) - Benchmark methodology
- [Complete Implementation Guide](./COMPLETE_IMPLEMENTATION_GUIDE.md) - Full 250-agent registry

---

## Quick Start

### 1. Choose Your Agent Category

Based on the VITAL 3-tier system:

**Tier 1** (85 agents): Fast response, foundational capabilities
- Response time: <2s
- Cost: $0.01-0.03 per query
- Usage: ~78% of queries
- Avatar range: `avatar_0109` to `avatar_0193`

**Tier 2** (115 agents): Specialist, advanced capabilities
- Response time: 1-3s
- Cost: $0.05-0.15 per query
- Usage: ~18% of queries
- Avatar range: `avatar_0200` to `avatar_0314`

**Tier 3** (50 agents): Ultra-specialist, highest complexity
- Response time: 3-5s
- Cost: $0.20-0.50 per query
- Usage: ~4% of queries
- Avatar range: `avatar_0400` to `avatar_0449`

### 2. Define Agent Profile

Use the schema from [AGENT_DATA_MODEL.md](./AGENT_DATA_MODEL.md):

```javascript
{
  // Core Identity
  name: "unique_agent_name",
  display_name: "Human Readable Name",
  description: "Detailed description...",
  avatar: "avatar_0XXX",
  color: "#1976D2",
  version: "1.0.0",

  // AI Configuration (with evidence-based model selection)
  model: "gpt-4",  // See step 3 for evidence-based selection
  system_prompt: "YOU ARE...",
  temperature: 0.7,
  max_tokens: 2000,
  rag_enabled: true,
  context_window: 8000,
  response_format: "markdown",

  // Capabilities & Knowledge
  capabilities: ["cap1", "cap2"],
  knowledge_domains: ["domain1", "domain2"],
  domain_expertise: "medical",

  // Business Context
  business_function: "clinical_development",
  role: "designer",
  tier: 1,
  priority: 10,
  implementation_phase: 1,

  // Compliance
  hipaa_compliant: true,
  gdpr_compliant: true,
  audit_trail_enabled: true,

  // Status
  status: "active"
}
```

### 3. Select LLM Model (Evidence-Based)

Use the fitness scoring system to choose the optimal model:

#### For Medical/Clinical Agents

**Best Choices** (with evidence):

1. **BioGPT** - Specialized biomedical model
   - BC5CDR (Disease): F1 0.849
   - PubMedQA: 81.2% accuracy
   - Citation: Luo et al. (2022), DOI:10.1093/bib/bbac409
   - Cost: Low (open source)
   - Use case: Medical literature, biomedical NER, clinical text

2. **GPT-4** - High medical accuracy
   - MedQA (USMLE): 86.7% accuracy
   - MMLU: 86.4% accuracy
   - Citation: OpenAI (2023), arXiv:2303.08774
   - Cost: High ($0.03-0.06 per 1K tokens)
   - Use case: Medical reasoning, diagnosis, complex clinical queries

3. **PubMedBERT** - Domain-specific BERT
   - BLURB: 81.3% average score
   - BC5CDR-disease: F1 0.858
   - Citation: Gu et al. (2020), arXiv:2007.15779
   - Cost: Low (open source)
   - Use case: Medical text classification, entity recognition

4. **Claude 3 Opus** - Excellent reasoning
   - MMLU: 86.8% accuracy
   - Citation: Anthropic (2024)
   - Cost: High ($0.015-0.075 per 1K tokens)
   - Use case: Complex medical reasoning, multi-step analysis

#### For Code/Technical Agents

**Best Choices**:

1. **Claude 3 Opus** - Top code generation
   - HumanEval: 84.5% pass@1
   - Citation: Anthropic (2024)

2. **GPT-4** - Strong coding capability
   - HumanEval: 67.0% pass@1
   - Citation: OpenAI (2023)

3. **CodeLlama 34B** - Specialized code model
   - HumanEval: 48.0% pass@1
   - Citation: Meta (2023)

#### For General/Business Agents

**Best Choices**:

1. **GPT-4** or **Claude 3 Opus**
   - MMLU: 86.4% / 86.8%
   - Best for reasoning, analysis, strategy

2. **GPT-4 Turbo**
   - MMLU: 86.0%
   - Faster, larger context (128K tokens)

3. **GPT-3.5 Turbo** (budget option)
   - MMLU: 70.0%
   - Cost-effective for simpler tasks

---

## Step-by-Step Agent Creation

### Example: Adding a "Pharmacogenomics Specialist" Agent

#### Step 1: Define Requirements

```javascript
// Agent specification
const agentSpec = {
  purpose: "Interpret pharmacogenomic test results and provide medication recommendations",
  target_users: ["physicians", "pharmacists", "genetic_counselors"],
  complexity: "high",
  required_accuracy: ">95%",
  domain: "medical",
  subdomain: "pharmacogenomics"
};
```

#### Step 2: Determine Tier Assignment

**Analysis**:
- High complexity → Consider Tier 2 or Tier 3
- Requires high accuracy (>95%) → Tier 2 minimum
- Specialized knowledge → Tier 2
- Not ultra-rare query type → Tier 2 (not Tier 3)

**Decision**: **Tier 2** (Specialist)

#### Step 3: Select Model Using Evidence

**Requirements**:
- Medical knowledge: YES (requiresMedicalKnowledge: true)
- Code generation: NO
- High accuracy: YES (requiresHighAccuracy: true)

**Fitness Score Analysis**:

| Model | Medical Performance | Cost | Recommendation |
|-------|-------------------|------|----------------|
| GPT-4 | 86.7% on MedQA ✅ | High | Excellent |
| BioGPT | 81.2% on PubMedQA ✅ | Low | Good |
| Claude 3 Opus | 86.8% on MMLU ✅ | High | Excellent |

**Selected Model**: **GPT-4**
- Reasoning: High accuracy required, proven medical performance
- Citation: OpenAI (2023). GPT-4 Technical Report, arXiv:2303.08774

#### Step 4: Create Agent Definition

```javascript
const pharmacogenomicsSpecialist = {
  // Core Identity
  name: "pharmacogenomics_specialist",
  display_name: "Pharmacogenomics Specialist",
  description: "Expert in interpreting pharmacogenomic test results (CYP2D6, CYP2C19, etc.) and providing evidence-based medication recommendations based on genetic variants. Integrates CPIC and PharmGKB guidelines.",
  avatar: "avatar_0215",  // Tier 2 avatar
  color: "#9C27B0",
  version: "1.0.0",

  // AI Configuration
  model: "gpt-4",  // Evidence-based selection (86.7% MedQA)
  system_prompt: `YOU ARE: Pharmacogenomics Specialist, an expert in translating genetic test results into actionable medication recommendations.

YOU DO: Interpret pharmacogenomic test results, explain genetic variant implications, provide evidence-based medication alternatives, cite CPIC/PharmGKB guidelines, calculate dosing adjustments based on genotype.

YOU NEVER: Make treatment decisions without considering full clinical context, ignore drug-drug-gene interactions, provide recommendations outside guideline-supported areas without clear disclaimers.

SUCCESS CRITERIA: Recommendation alignment with CPIC guidelines >98%, appropriate consideration of gene-drug-drug interactions >95%, clear communication of evidence strength.

WHEN UNSURE: Escalate to Clinical Pharmacologist or recommend genetic counseling consult. Always provide evidence strength ratings (strong/moderate/limited).`,

  temperature: 0.3,  // Low for high accuracy
  max_tokens: 3000,  // Complex explanations
  rag_enabled: true,  // Access CPIC/PharmGKB databases
  context_window: 8000,
  response_format: "markdown",

  // Capabilities & Knowledge
  capabilities: [
    "pharmacogenomic_interpretation",
    "cpic_guideline_application",
    "drug_gene_interaction_assessment",
    "genotype_based_dosing",
    "variant_nomenclature",
    "evidence_rating"
  ],

  knowledge_domains: [
    "pharmacogenomics",
    "clinical_pharmacology",
    "genetics",
    "precision_medicine"
  ],

  domain_expertise: "medical",

  competency_levels: {
    "cyp450_interpretation": 0.98,
    "cpic_guidelines": 0.97,
    "pharmacokinetics": 0.92,
    "clinical_application": 0.95
  },

  // Business Context
  business_function: "clinical_pharmacology",
  role: "specialist",
  tier: 2,
  priority: 25,
  implementation_phase: 2,
  is_custom: false,
  cost_per_query: 0.12,
  target_users: ["physicians", "pharmacists", "genetic_counselors"],

  // Validation & Performance
  validation_status: "validated",
  performance_metrics: {
    "average_response_time_ms": 2200,
    "accuracy_rate": 0.96,
    "user_satisfaction": 4.8,
    "guideline_concordance": 0.98
  },
  accuracy_score: 0.96,
  evidence_required: true,

  // Compliance & Regulatory
  regulatory_context: {
    "is_regulated": true,
    "standards": ["CLIA", "CAP"],
    "guidelines": ["CPIC", "PharmGKB", "FDA"]
  },
  compliance_tags: ["hipaa", "gdpr"],
  hipaa_compliant: true,
  gdpr_compliant: true,
  audit_trail_enabled: true,
  data_classification: "confidential",

  // Status
  status: "active",
  availability_status: "available"
};
```

#### Step 5: Create Prompt Starters

```javascript
const promptStarters = [
  {
    title: "Interpret CYP2D6 Genotype",
    description: "Get medication recommendations based on CYP2D6 results",
    prompt: "Patient has CYP2D6 *1/*4 genotype. What are the implications for codeine therapy?",
    icon: "🧬"
  },
  {
    title: "CPIC Guideline Lookup",
    description: "Find CPIC recommendations for drug-gene pair",
    prompt: "What are the CPIC recommendations for clopidogrel and CYP2C19?",
    icon: "📋"
  },
  {
    title: "Dosing Adjustment",
    description: "Calculate genotype-based dose adjustments",
    prompt: "How should warfarin be dosed for a patient with CYP2C9 *1/*3 and VKORC1 -1639G>A?",
    icon: "💊"
  },
  {
    title: "Alternative Medications",
    description: "Find alternatives based on genetic profile",
    prompt: "Patient is CYP2D6 poor metabolizer. What alternatives to codeine are available?",
    icon: "🔄"
  }
];
```

#### Step 6: Add to Database

```bash
# Using the agent loading script
node scripts/load-agent.js pharmacogenomics_specialist.json

# Or via SQL
psql -f database/sql/seeds/pharmacogenomics_specialist.sql
```

#### Step 7: Link to Evidence-Based Benchmarks

Update the model-benchmarks.ts if using a new model configuration:

```typescript
// /src/lib/data/model-benchmarks.ts
export const AGENT_MODEL_SELECTIONS: Record<string, {
  model: string;
  justification: string;
  benchmarks: string[];
  citations: string[];
}> = {
  'pharmacogenomics_specialist': {
    model: 'gpt-4',
    justification: 'High accuracy required for medical recommendations. GPT-4 achieves 86.7% on MedQA (USMLE), demonstrating physician-level medical knowledge.',
    benchmarks: ['MedQA (USMLE)', 'MMLU'],
    citations: [
      'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
      'https://arxiv.org/abs/2303.08774'
    ]
  }
};
```

---

## Agent Templates by Domain

### Template 1: Medical Specialist Agent

```javascript
{
  name: "medical_specialist_template",
  display_name: "[Specialty] Specialist",
  model: "gpt-4",  // or BioGPT for lower cost
  temperature: 0.3,  // Low for accuracy
  max_tokens: 3000,
  rag_enabled: true,
  domain_expertise: "medical",
  hipaa_compliant: true,
  evidence_required: true,
  validation_status: "validated"
}
```

**Recommended Models**:
1. GPT-4 (86.7% MedQA) - High accuracy
2. BioGPT (81.2% PubMedQA) - Cost-effective
3. Claude 3 Opus (86.8% MMLU) - Complex reasoning

### Template 2: Regulatory Affairs Agent

```javascript
{
  name: "regulatory_specialist_template",
  display_name: "[Regulatory Area] Specialist",
  model: "claude-3-opus",  // or GPT-4
  temperature: 0.2,  // Very low for precision
  max_tokens: 4000,
  rag_enabled: true,
  domain_expertise: "regulatory",
  compliance_tags: ["fda", "ema"],
  evidence_required: true,
  citation_required: true
}
```

**Recommended Models**:
1. Claude 3 Opus (86.8% MMLU) - Best reasoning
2. GPT-4 (86.4% MMLU) - High accuracy
3. GPT-4 Turbo (128K context) - Long documents

### Template 3: Data Science Agent

```javascript
{
  name: "data_science_template",
  display_name: "[Data Science Role]",
  model: "gpt-4",  // or Claude 3 Opus
  temperature: 0.4,
  max_tokens: 4000,
  rag_enabled: true,
  domain_expertise: "technical",
  capabilities: ["statistical_analysis", "data_visualization", "machine_learning"],
  tools: ["python", "r", "sql"]
}
```

**Recommended Models**:
1. GPT-4 (67% HumanEval for code) - Best overall
2. Claude 3 Opus (84.5% HumanEval) - Best code generation
3. CodeLlama (48% HumanEval) - Cost-effective

### Template 4: Clinical Development Agent

```javascript
{
  name: "clinical_development_template",
  display_name: "[Clinical Role]",
  model: "gpt-4",
  temperature: 0.5,
  max_tokens: 4000,
  rag_enabled: true,
  domain_expertise: "medical",
  business_function: "clinical_development",
  compliance_tags: ["gcp", "fda", "ich"],
  hipaa_compliant: true
}
```

**Recommended Models**:
1. GPT-4 (86.4% MMLU) - Complex protocol design
2. Claude 3 Opus (86.8% MMLU) - Best reasoning
3. GPT-4 Turbo (128K context) - Long protocols

---

## Bulk Agent Addition

For adding multiple agents at once:

### 1. Create CSV Template

```csv
name,display_name,description,avatar,model,tier,business_function,domain_expertise
cyp2d6_specialist,CYP2D6 Specialist,Expert in CYP2D6 pharmacogenomics,avatar_0216,gpt-4,2,clinical_pharmacology,medical
cyp2c19_specialist,CYP2C19 Specialist,Expert in CYP2C19 pharmacogenomics,avatar_0217,gpt-4,2,clinical_pharmacology,medical
...
```

### 2. Use Bulk Upload Script

```bash
npm run agents:bulk-upload agents.csv
```

### 3. Validate All Agents

```bash
npm run agents:validate
```

---

## Best Practices

### ✅ DO

1. **Use Evidence-Based Model Selection**
   - Check benchmarks in `/src/lib/data/model-benchmarks.ts`
   - Cite performance metrics
   - Consider cost-performance trade-offs

2. **Write Specific System Prompts**
   - Include YOU ARE, YOU DO, YOU NEVER, SUCCESS CRITERIA, WHEN UNSURE
   - Define clear boundaries
   - Specify evidence requirements

3. **Set Appropriate Tier**
   - Tier 1: Fast, foundational (78% of queries)
   - Tier 2: Specialist (18% of queries)
   - Tier 3: Ultra-specialist (4% of queries)

4. **Enable RAG for Knowledge-Intensive Agents**
   - Medical guidelines
   - Regulatory documents
   - Scientific literature

5. **Define Clear Capabilities**
   - Be specific and measurable
   - Use consistent naming
   - Map to business functions

### ❌ DON'T

1. **Don't Use Unsupported Models**
   - All models must have benchmark data
   - See `/src/lib/data/model-benchmarks.ts` for supported models

2. **Don't Ignore Compliance Requirements**
   - Set `hipaa_compliant`, `gdpr_compliant` correctly
   - Enable audit trails for regulated domains
   - Set appropriate `data_classification`

3. **Don't Overcomplicate Simple Agents**
   - Tier 1 agents should be fast and focused
   - Save complexity for Tier 2/3

4. **Don't Skip Validation**
   - Always set `validation_status`
   - Test before setting to "active"

5. **Don't Forget Cost Considerations**
   - Higher tiers = higher cost
   - Balance performance vs. cost
   - Monitor `cost_per_query`

---

## Validation Checklist

Before deploying a new agent:

- [ ] Agent name is unique and follows naming convention
- [ ] Display name is user-friendly
- [ ] Description is clear and specific
- [ ] Avatar is assigned from correct tier range
- [ ] Model selection is evidence-based with citation
- [ ] System prompt follows template structure
- [ ] Temperature is appropriate for use case
- [ ] RAG enabled if knowledge-intensive
- [ ] Capabilities are specific and measurable
- [ ] Business function is assigned
- [ ] Tier is appropriate for complexity
- [ ] Compliance flags are set correctly
- [ ] Validation status is set
- [ ] Prompt starters are created (minimum 3)
- [ ] Agent has been tested with sample queries
- [ ] Performance metrics baseline is established

---

## Testing New Agents

### Unit Test Template

```typescript
import { test, expect } from '@jest/globals';
import { AgentService } from '@/services/agent.service';

test('Pharmacogenomics Specialist - CYP2D6 interpretation', async () => {
  const agent = await AgentService.getAgent('pharmacogenomics_specialist');

  const response = await agent.query({
    message: "Patient has CYP2D6 *1/*4 genotype. Implications for codeine?"
  });

  expect(response).toContain('intermediate metabolizer');
  expect(response).toContain('CPIC');
  expect(response.citations).toBeDefined();
  expect(response.confidence).toBeGreaterThan(0.90);
});
```

### Performance Test

```typescript
test('Pharmacogenomics Specialist - response time', async () => {
  const startTime = Date.now();

  const response = await agent.query({
    message: "Interpret CYP2C19 *1/*2 genotype"
  });

  const responseTime = Date.now() - startTime;

  // Tier 2 target: 1-3s
  expect(responseTime).toBeLessThan(3000);
  expect(responseTime).toBeGreaterThan(1000);
});
```

---

## Resources

- [Agent Data Model](./AGENT_DATA_MODEL.md)
- [Evidence-Based Model Scoring](./EVIDENCE_BASED_MODEL_SCORING.md)
- [Model Benchmarks Database](../src/lib/data/model-benchmarks.ts)
- [Complete Implementation Guide](./COMPLETE_IMPLEMENTATION_GUIDE.md)

---

## Support

Questions about adding agents?
- Email: agents@vital-ai.com
- Slack: #agent-development
- Documentation: docs.vital-ai.com/agents
