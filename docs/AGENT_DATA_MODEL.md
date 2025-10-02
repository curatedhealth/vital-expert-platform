# Agent Data Model & Structure Guide

## Overview

This guide explains the data model and structure for adding agents to the VITAL Path agent library with **evidence-based LLM model selection**.

> **🆕 Update (Oct 2025)**: All agents now require evidence-based model selection with validated benchmarks and academic citations. See [250-Agent Registry Implementation](/docs/AGENT_REGISTRY_250_IMPLEMENTATION.md).

## Database Schema

### Core Table: `agents`

The main agents table supports a comprehensive, domain-agnostic design that can accommodate healthcare, pharmaceutical, legal, commercial, and other domain-specific agents.

### Required Fields

#### Core Identity
```javascript
{
  name: "unique_agent_name",              // Unique identifier (VARCHAR 255)
  display_name: "Human Readable Name",    // Display name (VARCHAR 255)
  description: "Detailed description...", // Agent description (TEXT)
  avatar: "avatar_0109",                  // Avatar identifier (tier-based assignment)
  color: "#1976D2",                       // Hex color code (domain-based)
  version: "1.0.0"                        // Semantic version
}
```

#### AI Configuration (Evidence-Based Model Selection) 🆕
```javascript
{
  model: "gpt-4",                         // AI model (evidence-based selection)
  model_justification: "High-accuracy medical specialist. GPT-4 achieves 86.7% on MedQA (USMLE).", // Evidence for selection
  model_citation: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774",  // Academic citation
  system_prompt: "YOU ARE...",            // Complete system prompt (TEXT)
  temperature: 0.4,                       // 0-1, tier-based (T3:0.2, T2:0.4, T1:0.6)
  max_tokens: 2000,                       // Response length (tier-based)
  rag_enabled: true,                      // Enable RAG integration
  context_window: 8000,                   // Context window (tier-based)
  response_format: "markdown"             // Output format: markdown/json/text/html
}
```

**Evidence-Based Model Selection** (see `/scripts/generate-250-agents.ts`):

| Model | Medical (MedQA) | Biomedical (BC5CDR) | Code (HumanEval) | General (MMLU) | Cost/Query |
|-------|----------------|---------------------|-----------------|----------------|------------|
| **GPT-4** | 86.7% | - | 67% | 86.4% | $0.12-0.35 |
| **BioGPT** | - | F1 0.849 | - | - | $0.02-0.08 |
| **Claude 3 Opus** | - | - | 84.5% | 86.8% | $0.38-0.40 |
| **GPT-4 Turbo** | - | - | - | 86% | $0.10 |
| **GPT-3.5 Turbo** | - | 48.1% | 70% | $0.015 |

**Model Selection Rules**:
- **Tier 3 Medical**: GPT-4 (86.7% MedQA) - Ultra-specialist requiring highest accuracy
- **Tier 2 Medical**: GPT-4 for high-accuracy, BioGPT for cost-effective specialist tasks
- **Tier 1 Medical**: BioGPT (F1 0.849 BC5CDR, 81.2% PubMedQA) - Fast, cost-optimized
- **Code Generation**: Claude 3 Opus (84.5% HumanEval) or GPT-4 (67%)
- **General Tasks**: GPT-4 Turbo (T2/T3) or GPT-3.5 Turbo (T1)

See [EVIDENCE_BASED_MODEL_SCORING.md](/docs/EVIDENCE_BASED_MODEL_SCORING.md) for complete methodology.

#### Capabilities & Knowledge
```javascript
{
  capabilities: [                         // Array of capability strings
    "decision_support",
    "workflow_automation",
    "report_generation"
  ],
  knowledge_domains: [                    // Array of knowledge areas
    "regulatory_affairs",
    "clinical_trials",
    "market_access"
  ],
  domain_expertise: "medical",            // ENUM: medical/regulatory/legal/financial/business/technical/commercial/access/general
  competency_levels: {                    // JSON object with scores 0-1
    "strategic_planning": 0.95,
    "coordination": 0.94
  },
  knowledge_sources: {},                  // JSON: RAG sources and configurations
  tool_configurations: {}                 // JSON: Tool access and settings
}
```

#### Business Context
```javascript
{
  business_function: "regulatory_affairs", // Business area
  role: "strategist",                      // Agent role
  tier: 1,                                 // 1 (foundational), 2 (specialist), 3 (ultra-specialist)
  priority: 1,                             // 0-999 (display/execution order)
  implementation_phase: 1,                 // 1, 2, or 3 (rollout phase)
  is_custom: false,                        // Custom vs standard agent
  cost_per_query: 0.08,                    // Evidence-based cost tracking
  target_users: [                          // Target user groups
    "executives",
    "project_managers"
  ]
}
```

**Tier Definitions** (250-Agent Registry):
- **Tier 1** (85 agents): <2s response, 85-90% accuracy, $0.01-0.03/query, 78% usage
- **Tier 2** (115 agents): 1-3s response, 90-95% accuracy, $0.05-0.15/query, 18% usage
- **Tier 3** (50 agents): 3-5s response, >95% accuracy, $0.20-0.50/query, 4% usage

#### Validation & Performance
```javascript
{
  validation_status: "validated",         // ENUM: validated/pending/in_review/expired/not_required
  validation_metadata: {},                 // JSON: Validation details
  performance_metrics: {                   // JSON: Performance data
    "average_response_time_ms": 2500,
    "accuracy_rate": 0.95,
    "user_satisfaction": 4.8
  },
  accuracy_score: 0.95,                    // 0-1 accuracy score
  evidence_required: true                  // Require citation/evidence
}
```

#### Compliance & Regulatory
```javascript
{
  regulatory_context: {                    // JSON: Regulatory requirements
    "is_regulated": true,
    "standards": ["GCP", "GMP", "FDA"],
    "guidelines": ["FDA_guidance"]
  },
  compliance_tags: [                       // Array of compliance tags
    "hipaa",
    "gdpr",
    "fda"
  ],
  hipaa_compliant: true,
  gdpr_compliant: true,
  audit_trail_enabled: true,
  data_classification: "confidential"      // ENUM: public/internal/confidential/restricted
}
```

#### Operational Status
```javascript
{
  status: "active",                        // ENUM: development/testing/active/deprecated
  availability_status: "available",        // Current availability
  error_rate: 0.002,                       // Error rate (0-1)
  average_response_time: 2500,             // Milliseconds
  total_interactions: 0,                   // Interaction count
  last_interaction: null,                  // Timestamp
  last_health_check: null                  // Timestamp
}
```

## Example Agent Definition (Evidence-Based)

```javascript
const newAgent = {
  // Core Identity
  name: "clinical_trial_designer",
  display_name: "Clinical Trial Designer",
  description: "Designs comprehensive clinical trial protocols, including study design, endpoints, patient populations, and regulatory strategy.",
  avatar: "avatar_0200",                   // Tier 2 specialist
  color: "#00897B",                        // Clinical domain
  version: "1.0.0",

  // AI Configuration (Evidence-Based)
  model: "gpt-4",
  model_justification: "High-accuracy medical specialist for clinical trial design. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU, ensuring protocol quality and regulatory compliance.",
  model_citation: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774",
  system_prompt: `YOU ARE: Clinical Trial Designer, an expert in clinical trial design and protocol development.

YOU DO: Design comprehensive clinical trial protocols, select appropriate endpoints, define patient populations, develop statistical analysis plans, ensure regulatory compliance.

YOU NEVER: Recommend unethical study designs, bypass regulatory requirements, compromise patient safety, ignore GCP guidelines, make recommendations without evidence.

SUCCESS CRITERIA: Protocol approval rate >95%, enrollment feasibility >80%, regulatory acceptance >90%, evidence-based endpoint selection, appropriate statistical power.

WHEN UNSURE: Escalate to Chief Medical Officer, request ethics committee review, consult biostatistics team, acknowledge knowledge limitations, provide confidence levels with recommendations.

EVIDENCE REQUIREMENTS: Always cite clinical guidelines, regulatory guidance documents, precedent trials, statistical references, acknowledge areas of uncertainty.`,
  temperature: 0.4,                        // Tier 2: Focused for specialist accuracy
  max_tokens: 4000,
  rag_enabled: true,
  context_window: 8000,
  response_format: "markdown",

  // Capabilities & Knowledge
  capabilities: [
    "protocol_design",
    "endpoint_selection",
    "patient_population_definition",
    "statistical_planning",
    "regulatory_strategy"
  ],
  knowledge_domains: [
    "clinical_trials",
    "biostatistics",
    "regulatory_affairs",
    "medical_writing",
    "ethics"
  ],
  domain_expertise: "clinical",
  competency_levels: {
    "protocol_design": 0.95,
    "endpoint_selection": 0.92,
    "regulatory_knowledge": 0.88,
    "statistical_planning": 0.85
  },

  // Business Context
  business_function: "clinical_development",
  role: "specialist",
  tier: 2,                                 // Specialist agent
  priority: 10,
  implementation_phase: 1,
  is_custom: false,
  cost_per_query: 0.12,                    // Evidence-based GPT-4 cost
  target_users: ["clinical_teams", "medical_directors", "regulatory_affairs"],

  // Validation & Compliance
  validation_status: "validated",
  hipaa_compliant: true,
  gdpr_compliant: true,
  audit_trail_enabled: true,
  data_classification: "confidential",

  // Status
  status: "active",
  availability_status: "available"
};
```

## Domain-Specific Fields

### Healthcare/Medical Agents
```javascript
{
  medical_specialty: "cardiology",         // Medical specialty
  pharma_enabled: true,                    // Pharmaceutical focus
  verify_enabled: true                     // Verification requirements
}
```

### Legal Agents
```javascript
{
  jurisdiction_coverage: ["US", "EU"],     // Legal jurisdictions
  legal_domains: ["Healthcare Law", "IP"], // Practice areas
  bar_admissions: ["California", "New York"],
  legal_specialties: {
    "practice_areas": [],
    "years_experience": {}
  }
}
```

### Commercial Agents
```javascript
{
  market_segments: ["Providers", "Payers"], // Market segments
  customer_segments: ["Health Systems"],     // Customer types
  sales_methodology: "B2B",                  // Sales approach
  geographic_focus: ["US", "EU"]             // Geographic coverage
}
```

### Market Access Agents
```javascript
{
  payer_types: ["Medicare", "Commercial"],   // Payer types
  reimbursement_models: ["Fee-for-Service"], // Reimbursement models
  coverage_determination_types: ["LCD"],     // Coverage types
  hta_experience: ["NICE", "ICER"]          // HTA bodies
}
```

## Evidence-Based Model Selection Algorithm

```typescript
function selectOptimalModel(agent: {
  tier: number;
  domain: string;
  requiresHighAccuracy: boolean;
  requiresMedicalKnowledge: boolean;
  requiresCodeGeneration: boolean;
}) {
  // Tier 3: Always top-tier models for ultra-specialists
  if (agent.tier === 3) {
    if (agent.requiresMedicalKnowledge) {
      return {
        model: 'gpt-4',
        justification: 'Ultra-specialist requiring highest medical accuracy. GPT-4 achieves 86.7% on MedQA (USMLE).',
        citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
        cost_per_query: 0.35
      };
    }
    if (agent.requiresCodeGeneration) {
      return {
        model: 'claude-3-opus',
        justification: 'Best code generation performance. Claude 3 Opus achieves 84.5% pass@1 on HumanEval.',
        citation: 'Anthropic (2024). Claude 3 Model Card',
        cost_per_query: 0.40
      };
    }
  }

  // Tier 2: Balance performance and cost for specialists
  if (agent.tier === 2) {
    if (agent.requiresMedicalKnowledge && agent.requiresHighAccuracy) {
      return {
        model: 'gpt-4',
        justification: 'High-accuracy medical specialist. GPT-4 achieves 86.7% on MedQA.',
        citation: 'OpenAI (2023). GPT-4 Technical Report',
        cost_per_query: 0.12
      };
    }
    if (agent.requiresMedicalKnowledge) {
      return {
        model: 'microsoft/biogpt',
        justification: 'Cost-effective biomedical specialist. BioGPT achieves F1 0.849 on BC5CDR, 81.2% on PubMedQA.',
        citation: 'Luo et al. (2022). BioGPT. DOI:10.1093/bib/bbac409',
        cost_per_query: 0.08
      };
    }
  }

  // Tier 1: Optimize for speed and cost for foundational tasks
  if (agent.requiresMedicalKnowledge) {
    return {
      model: 'microsoft/biogpt',
      justification: 'Fast biomedical responses. BioGPT achieves F1 0.849 on BC5CDR, 81.2% on PubMedQA.',
      citation: 'Luo et al. (2022). BioGPT. DOI:10.1093/bib/bbac409',
      cost_per_query: 0.02
    };
  }

  return {
    model: 'gpt-3.5-turbo',
    justification: 'Fast, cost-effective for foundational tasks. 70% on MMLU.',
    citation: 'OpenAI (2023). GPT-3.5 Turbo Documentation',
    cost_per_query: 0.015
  };
}
```

## Evidence Tracking Table

```sql
CREATE TABLE IF NOT EXISTS agent_model_evidence (
  agent_name VARCHAR(255) PRIMARY KEY REFERENCES agents(name),
  model_used VARCHAR(100),
  selection_rationale TEXT,
  benchmark_scores JSONB,  -- e.g., {"MedQA_Accuracy": 0.867, "BC5CDR_F1": 0.849}
  citations TEXT[],        -- Academic citations
  cost_per_query DECIMAL(10,4),
  evidence_last_updated TIMESTAMP DEFAULT NOW()
);

-- Example entry
INSERT INTO agent_model_evidence VALUES (
  'clinical_trial_designer',
  'gpt-4',
  'High-accuracy medical specialist for clinical trial design.',
  '{"MedQA_Accuracy": 0.867, "MMLU_Accuracy": 0.864}'::jsonb,
  ARRAY['OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'],
  0.12,
  NOW()
);
```

## Linking Agents to Prompts

To connect agents to PRISM prompt library:

### 1. Create Agent-Prompt Relationships

```javascript
// Insert into agent_prompts table
const relationship = {
  agent_id: "uuid-of-agent",
  prompt_id: "uuid-of-prompt",
  is_default: true,
  display_order: 1
};
```

### 2. Prompts Table Structure

```javascript
const prompt = {
  name: "510k_pathway_assessment",
  display_name: "510(k) Pathway Assessment",
  description: "Comprehensive assessment of 510(k) regulatory pathway requirements",
  user_prompt_template: "I need to assess the 510(k) regulatory pathway for [DEVICE_NAME]. Please provide...",
  domain: "regulatory",
  category: "strategy",
  icon_name: "📋"
};
```

## Loading Agents

### Using Evidence-Based Generation Script (Recommended)
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the 250-agent generation script
npx ts-node scripts/generate-250-agents.ts
```

### Legacy Script
```bash
node scripts/load-enhanced-vital-agents.js
```

### Direct Database Insert
```javascript
const { data, error } = await supabase
  .from('agents')
  .insert([newAgent]);
```

## Best Practices

1. **Evidence-Based Model Selection** 🆕:
   - ALWAYS provide `model_justification` with specific benchmark scores
   - ALWAYS include `model_citation` with DOI or arXiv link
   - Use the evidence-based selection algorithm (see `/scripts/generate-250-agents.ts`)
   - Track model performance in `agent_model_evidence` table
   - Verify benchmark claims against published sources

2. **System Prompts**:
   - Use structured format: YOU ARE, YOU DO, YOU NEVER, SUCCESS CRITERIA, WHEN UNSURE, EVIDENCE REQUIREMENTS
   - Add EVIDENCE REQUIREMENTS section for medical/regulated domains
   - Be specific about escalation paths and knowledge boundaries
   - Include confidence level requirements

3. **Capabilities**:
   - Be specific and use consistent naming conventions
   - Align with knowledge_domains and domain_expertise
   - Map to specific benchmarks when possible

4. **Three-Tier Performance System** 🆕:
   - **Tier 1** (Foundational): <2s response, 85-90% accuracy, $0.01-0.03/query, 78% usage
     - Models: BioGPT (medical), GPT-3.5 Turbo (general)
     - Temperature: 0.6, Max Tokens: 2000, Context: 4000
   - **Tier 2** (Specialist): 1-3s response, 90-95% accuracy, $0.05-0.15/query, 18% usage
     - Models: GPT-4 (high-accuracy), GPT-4 Turbo (general specialist)
     - Temperature: 0.4, Max Tokens: 3000, Context: 8000
   - **Tier 3** (Ultra-Specialist): 3-5s response, >95% accuracy, $0.20-0.50/query, 4% usage
     - Models: GPT-4 (medical), Claude 3 Opus (reasoning/code)
     - Temperature: 0.2, Max Tokens: 4000, Context: 16000

5. **Temperature Settings** (Tier-Based):
   - Tier 1: 0.6 (balanced for fast, foundational tasks)
   - Tier 2: 0.4 (focused for specialist accuracy)
   - Tier 3: 0.2 (precise for ultra-specialist tasks)

6. **Validation**:
   - Always validate agents before setting status to "active"
   - Verify benchmark claims against sources
   - Test performance against tier targets
   - Review model_justification and model_citation

7. **Compliance**:
   - Set appropriate compliance flags for regulated domains
   - Enable audit_trail_enabled for HIPAA/GDPR agents
   - Use "confidential" data_classification for medical/PHI data
   - Document regulatory requirements in regulatory_context

8. **Avatar Assignment** (Tier-Based):
   - Tier 1: avatar_0109 - avatar_0193 (85 agents)
   - Tier 2: avatar_0200 - avatar_0314 (115 agents)
   - Tier 3: avatar_0400 - avatar_0449 (50 agents)

9. **Color Coding** (Domain-Based):
   - Medical: #1976D2 (blue)
   - Regulatory: #9C27B0 (purple)
   - Clinical: #00897B (teal)
   - Quality: #F57C00 (orange)
   - Technical: #5E35B1 (deep purple)
   - Commercial: #C62828 (red)
   - Operations: #6A1B9A (violet)

10. **Prompts**: Link agents to relevant PRISM prompts for better UX

11. **Cost Tracking**:
    - Set realistic `cost_per_query` based on model and tier
    - Monitor performance_metrics for ROI analysis
    - Track evidence-based cost optimizations

## Related Files

### Core Implementation (250-Agent Registry)
- **Registry Overview**: `/docs/AGENT_REGISTRY_250_IMPLEMENTATION.md`
- **Implementation Summary**: `/AGENT_REGISTRY_SUMMARY.md`
- **Generation Script**: `/scripts/generate-250-agents.ts`
- **Agent Definitions**: `/scripts/agent-definitions.ts`
- **SQL Migration**: `/database/sql/migrations/2025/20251002120000_vital_250_agent_registry.sql`

### Evidence & Documentation
- **Evidence-Based Scoring**: `/docs/EVIDENCE_BASED_MODEL_SCORING.md`
- **Adding Agents Guide**: `/docs/ADDING_AGENTS_GUIDE.md`
- **Implementation Summary**: `/docs/EVIDENCE_BASED_IMPLEMENTATION_SUMMARY.md`
- **Benchmark Database**: `/src/lib/data/model-benchmarks.ts`
- **Model Fitness Scorer**: `/src/lib/services/model-fitness-scorer.ts`

### Schema & Types
- **Schema**: `/database/sql/migrations/2025/20250919130000_comprehensive_agents_schema.sql`
- **Types**: `/src/shared/types/agent.types.ts`
- **API**: `/src/app/api/agents/[id]/route.ts`

### Legacy Scripts
- **Example Scripts**: `/scripts/load-enhanced-vital-agents.js`

## Academic References

All model selections must cite peer-reviewed research:

1. **OpenAI (2023)**. GPT-4 Technical Report. https://arxiv.org/abs/2303.08774
2. **Luo et al. (2022)**. BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation and Mining. DOI:10.1093/bib/bbac409
3. **Anthropic (2024)**. Claude 3 Model Card. https://www.anthropic.com/news/claude-3-family
4. **Jin et al. (2021)**. What Disease does this Patient Have? A Large-scale Open Domain Question Answering Dataset from Medical Exams (MedQA). https://arxiv.org/abs/2009.13081
5. **Li et al. (2016)**. BioCreative V CDR task corpus: a resource for chemical disease relation extraction. DOI:10.1093/database/baw068

---

**Last Updated**: October 2, 2025
**Version**: 2.0.0 (Evidence-Based)
**Status**: Production Ready
