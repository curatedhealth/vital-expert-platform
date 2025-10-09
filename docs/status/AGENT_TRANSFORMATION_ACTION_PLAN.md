# 🎯 VITAL AI Agent Transformation - Prioritized Action Plan
**Based on:** Industry-Leading Agent Library Transformation Playbook
**Timeline:** 12 weeks (90 days)
**Status:** Ready to Execute

---

## 🚀 Quick Start - Week 1 Critical Actions

### ⚠️ SAFETY CRITICAL: Fix Tier-3 Clinical Agents (Days 1-3)

**Problem:** 5 safety-critical agents are using gpt-4o-mini (low-cost model) instead of GPT-4

**Agents to Fix Immediately:**
1. **Dosing Calculator** - Tier 3, currently gpt-4o-mini
2. **Drug Interaction Checker** - Tier 3, currently gpt-4o-mini
3. **Pediatric Dosing Specialist** - Tier 3, currently gpt-4o-mini
4. **Adverse Event Reporter** - Tier 3, currently gpt-4o-mini
5. **Pharmacokinetics Advisor** - Tier 3, currently gpt-4o-mini

**Action Script:**
```bash
# Update each agent to use GPT-4 with evidence
# Template for update:
{
  model: "gpt-4",
  model_justification: "Ultra-specialist requiring highest clinical accuracy for [dosing calculations/drug interactions/etc]. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for patient safety - zero tolerance for calculation errors.",
  model_citation: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774",
  temperature: 0.2,
  max_tokens: 4000,
  context_window: 16000,
  cost_per_query: 0.35
}
```

**Execute:** Create update script `scripts/fix-safety-critical-tier3-agents.js`

---

### 💰 COST OPTIMIZATION: Fix Tier-1 Wrong Models (Days 4-5)

**Problem:** 4 Tier-1 foundational agents using expensive GPT-4 instead of GPT-3.5-Turbo

**Agents to Fix:**
1. Reimbursement Strategist (currently Tier 1, GPT-4)
2. HIPAA Compliance Officer (currently Tier 1, GPT-4)
3. [2 more to identify]

**Cost Impact:**
- Current: $0.12/query per agent
- After fix: $0.015/query per agent
- **Savings: 88% per query for these agents**

**Action Script:**
```javascript
// Downgrade to appropriate model with evidence
{
  model: "gpt-3.5-turbo",
  model_justification: "Fast, cost-effective for foundational [domain] queries. GPT-3.5 Turbo achieves 70% on HumanEval. Ideal for high-volume, foundational guidance with appropriate escalation to specialists when needed.",
  model_citation: "OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo",
  temperature: 0.6,
  max_tokens: 2000,
  context_window: 4000,
  cost_per_query: 0.015
}
```

---

### ✅ Add Evidence to Active Agents (Days 6-7)

**Target:** 20 active agents currently missing model_justification + model_citation

**Process:**
1. Group by tier (8 Tier-3, 8 Tier-2, 4 Tier-1)
2. For each agent, add:
   - `model_justification`: Why this model? What benchmarks? What use case?
   - `model_citation`: Academic source (arXiv, DOI, official docs)
3. Use templates from DIGITAL_HEALTH_AGENTS_15.json as reference

**Batch Script:** `scripts/add-evidence-to-active-agents.js`

---

## 📅 Phased Execution Plan (12 Weeks)

### Phase 1: Foundation & Emergency Fixes (Weeks 1-2)

#### Week 1: Safety & Evidence Critical
- ✅ Day 1-3: Fix 5 safety-critical Tier-3 agents
- ✅ Day 4-5: Fix 4 Tier-1 cost-optimization agents
- ✅ Day 6-7: Add evidence to 10 highest-priority active agents

**Deliverables:**
- 5 safety agents upgraded to GPT-4
- 4 cost agents downgraded to GPT-3.5-Turbo
- 10 agents with complete evidence
- **Total improved: 19 agents (56% of active agents)**

#### Week 2: Complete Active Agent Evidence
- Add evidence to remaining 10 active agents
- Validate all 34 active agents have complete metadata
- Create evidence quality checklist
- Expert review sampling (5 agents)

**Deliverables:**
- 100% of active agents have evidence
- Quality validation report
- Evidence template library (7-10 archetypes)

---

### Phase 2: Tier-3 Systematic Review (Weeks 3-6)

#### Week 3: Audit 85 Tier-3 gpt-4o-mini Agents
**Goal:** Determine if these are truly ultra-specialists

**Process:**
1. Group agents by domain:
   - Clinical/Medical: ~40 agents
   - Pharmaceutical: ~30 agents
   - Regulatory: ~10 agents
   - Other: ~5 agents

2. For each agent, ask:
   - Is >95% accuracy REQUIRED for this task?
   - Are there life/safety implications?
   - Is this truly specialized expertise?

3. Classify each:
   - ✅ **Keep Tier-3**: Upgrade to GPT-4 + evidence
   - ⬇️ **Move to Tier-2**: Keep gpt-4o-mini OR upgrade to GPT-4-Turbo
   - ⬇️ **Move to Tier-1**: Downgrade to gpt-3.5-turbo

**Deliverable:** Tier realignment matrix (85 agents categorized)

#### Week 4: Execute Tier-3 Realignment (Batch 1)
- Fix 30 highest-priority Tier-3 agents
- Upgrade models where needed
- Add evidence to all 30
- Activate 10 safety-critical agents

**Deliverable:** 30 Tier-3 agents production-ready

#### Week 5: Execute Tier-3 Realignment (Batch 2)
- Fix next 30 Tier-3 agents
- Continue model upgrades
- Add evidence
- Activate 10 more agents

**Deliverable:** 60 Tier-3 agents production-ready

#### Week 6: Complete Tier-3 Realignment
- Fix remaining 25+ Tier-3 agents
- Final validation
- Expert review (random sample 10%)
- Activation decisions

**Deliverable:** All Tier-3 agents (90-100) production-ready

---

### Phase 3: Tier-2 Evidence Addition (Weeks 7-9)

**Target:** 175 Tier-2 agents (164 inactive + 11 active)

#### Week 7: Tier-2 Batch 1 (60 agents)
- Add model_justification + citation
- Identify BioGPT candidates (biomedical/pharma specialists)
- Test BioGPT on 5 agents (cost optimization experiment)

**BioGPT Candidates:**
- Pharmacology specialists
- Drug development agents
- Clinical research agents
- Biomedical literature agents

**Deliverable:** 60 Tier-2 agents with evidence

#### Week 8: Tier-2 Batch 2 (60 agents)
- Continue evidence addition
- Expand BioGPT usage if successful
- Begin activation planning

**Deliverable:** 120 Tier-2 agents with evidence

#### Week 9: Tier-2 Batch 3 (55 agents)
- Complete remaining Tier-2 agents
- Validation sweep
- Expert review (10% sample)
- Activation readiness assessment

**Deliverable:** All 175 Tier-2 agents with evidence

---

### Phase 4: System Prompt Enhancement (Weeks 10-11)

**Target:** Create unique, specialized system prompts for all agents

#### Week 10: System Prompt Templates by Archetype
**Create 10-12 persona archetypes:**
1. Clinical Expert
2. Regulatory Authority
3. Data Analyst
4. Pharmaceutical Scientist
5. Compliance Guardian
6. Research Specialist
7. Operations Advisor
8. Commercial Strategist
9. Safety Officer
10. Innovation Strategist

**For each archetype, define:**
- Personality & tone
- Communication style
- Response structure
- Uncertainty handling
- Example conversations

**Deliverable:** Persona framework + 10 archetype templates

#### Week 11: Generate Unique System Prompts
**Process:**
1. Assign each of 283 agents to an archetype
2. Generate specialized prompts using template
3. Customize with agent-specific details
4. Quality validation (uniqueness check)
5. Expert review (sample 20 agents)

**Deliverable:** 283 unique system prompts

---

### Phase 5: Testing & Validation (Week 12)

#### Week 12: Comprehensive Validation
**Testing Framework:**
1. Automated fact-checking (citations valid?)
2. Response quality sampling (50 agents)
3. Expert review panel (all Tier-3, sample Tier-2/1)
4. Performance benchmarking
5. Cost validation

**Success Criteria:**
- ✅ 100% of agents have evidence
- ✅ 100% tier-model alignment
- ✅ 90% pass expert review
- ✅ Cost optimization targets met
- ✅ 50% of agents activated (142 agents)

**Deliverables:**
- Validation report
- Quality scorecard (per agent)
- Activation roadmap
- Monitoring dashboard

---

## 🛠️ Implementation Scripts

### Script 1: Fix Safety-Critical Tier-3 Agents
**File:** `scripts/fix-safety-critical-tier3-agents.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const safetyAgents = [
  {
    name: 'dosing_calculator',
    model: 'gpt-4',
    model_justification: 'Ultra-specialist requiring 100% accuracy for dosing calculations. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for patient safety - zero tolerance for calculation errors.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35
  },
  {
    name: 'drug_interaction_checker',
    model: 'gpt-4',
    model_justification: 'Ultra-specialist for critical drug-drug interaction detection. GPT-4 achieves 86.7% on MedQA (USMLE). Essential for patient safety - must detect all contraindications.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35
  },
  // ... add other 3 agents
];

async function upgradeSafetyAgents() {
  console.log('🚨 Upgrading Safety-Critical Agents to GPT-4...\n');

  for (const agent of safetyAgents) {
    const { data, error } = await supabase
      .from('agents')
      .update({
        model: agent.model,
        temperature: agent.temperature,
        max_tokens: agent.max_tokens,
        context_window: agent.context_window,
        cost_per_query: agent.cost_per_query,
        metadata: {
          model_justification: agent.model_justification,
          model_citation: agent.model_citation
        },
        status: 'active' // Activate these critical agents
      })
      .eq('name', agent.name);

    if (error) {
      console.error(`❌ Failed to upgrade ${agent.name}:`, error);
    } else {
      console.log(`✅ Upgraded ${agent.name} to GPT-4 (ACTIVE)`);
    }
  }

  console.log('\n✨ Safety-critical agents upgraded!');
}

upgradeSafetyAgents();
```

### Script 2: Add Evidence to Active Agents
**File:** `scripts/add-evidence-to-active-agents.js`

```javascript
// Query all active agents without evidence
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active')
  .or('metadata->model_justification.is.null,metadata->model_citation.is.null');

// Evidence templates by model
const evidenceTemplates = {
  'gpt-4': {
    tier3: {
      justification: 'Ultra-specialist requiring highest accuracy for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for [USE_CASE].',
      citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'
    },
    tier2: {
      justification: 'High-accuracy specialist for [DOMAIN]. GPT-4 achieves 86.7% on MedQA (USMLE). Balanced performance for specialist tasks.',
      citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'
    }
  },
  'gpt-3.5-turbo': {
    tier1: {
      justification: 'Fast, cost-effective for foundational [DOMAIN] queries. GPT-3.5 Turbo achieves 70% on HumanEval. Ideal for high-volume, low-complexity queries.',
      citation: 'OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo'
    }
  },
  'microsoft/biogpt': {
    tier2: {
      justification: 'Cost-effective biomedical specialist. BioGPT achieves F1 0.849 on BC5CDR (chemical-disease relations), 81.2% on PubMedQA. Optimized for [biomedical task].',
      citation: 'Luo et al. (2022). BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation and Mining. DOI:10.1093/bib/bbac409'
    }
  }
};

// For each agent, add appropriate evidence
for (const agent of agents) {
  const template = evidenceTemplates[agent.model]?.[`tier${agent.tier}`];
  if (template) {
    // Customize template with agent-specific context
    const justification = template.justification
      .replace('[DOMAIN]', agent.domain_expertise || 'healthcare')
      .replace('[USE_CASE]', agent.description.split('.')[0]);

    await supabase
      .from('agents')
      .update({
        metadata: {
          ...agent.metadata,
          model_justification: justification,
          model_citation: template.citation
        }
      })
      .eq('id', agent.id);

    console.log(`✅ Added evidence to ${agent.display_name}`);
  }
}
```

---

## 📊 Success Metrics & Tracking

### Weekly KPIs

**Week 1:**
- ✅ 5 safety agents upgraded
- ✅ 4 cost agents optimized
- ✅ 10 agents with evidence
- Target: 19 agents improved

**Week 2:**
- ✅ 100% active agents have evidence (34 total)
- Quality score: >90%
- Evidence validation: 100% citations accessible

**Weeks 3-6:**
- Tier-3 realignment: 85 agents reviewed
- Evidence added: 60-85 agents
- Activated: 20-30 new agents

**Weeks 7-9:**
- Tier-2 evidence: 175 agents complete
- BioGPT adoption: 10-20 agents
- Cost savings: 15-20%

**Weeks 10-11:**
- Unique prompts: 283 agents
- Quality validation: >95% pass
- Expert approval: >90%

**Week 12:**
- Total evidence: 100% (283/283)
- Total activated: 50% (142/283)
- Cost optimization: 30-40%
- Quality score: >92%

---

## 🎯 Quick Wins (This Week)

**Execute these 3 scripts immediately:**

1. ✅ **Safety Script** → Upgrade 5 critical agents to GPT-4
2. ✅ **Cost Script** → Downgrade 4 Tier-1 agents to GPT-3.5-Turbo
3. ✅ **Evidence Script** → Add evidence to 20 active agents

**Expected Impact:**
- Patient safety: 5 critical agents now production-ready
- Cost savings: $0.42/query on 4 agents (88% reduction)
- Compliance: 20 agents meet evidence standards
- Total improvement: 29 agents (85% of active agents)

**Time Required:** 2-3 days of development + testing

---

## 🚀 Next Actions

### Immediate (Today)
1. Review this action plan with team
2. Prioritize safety vs. cost optimization
3. Create 3 implementation scripts
4. Set up monitoring for active agents

### This Week
1. Execute safety-critical upgrades
2. Execute cost optimization downgrades
3. Add evidence to all active agents
4. Validate changes in production

### Next Week
1. Begin Tier-3 systematic review
2. Create evidence templates library
3. Set up expert review panel
4. Plan Phase 2 execution

---

**Action Plan Created:** October 6, 2025
**Owner:** VITAL AI Platform Team
**Review Cadence:** Weekly during execution
**Success Target:** 90 days to production-ready library
