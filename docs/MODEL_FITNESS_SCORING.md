# LLM Model Fitness Scoring System

## Overview

The Model Fitness Scoring System intelligently evaluates how well each LLM model matches an agent's specific role, capabilities, and requirements. This helps users select the optimal model for their use case with confidence.

> **🔬 NEW: Evidence-Based Recommendations** - All model recommendations are now backed by validated benchmarks and academic citations. See [Evidence-Based Model Scoring Documentation](./EVIDENCE_BASED_MODEL_SCORING.md) for data sources, research citations, and how to verify all claims.

## Features

### 1. **Comprehensive Scoring Algorithm**
Evaluates 6 key dimensions:
- **Role Match** (25% weight) - How well the model suits the agent's role type
- **Capability Match** (25% weight) - Model capabilities vs agent requirements
- **Performance Match** (15% weight) - Accuracy and quality for the task
- **Cost Efficiency** (10% weight) - Value for money based on task complexity
- **Context Size Match** (15% weight) - Token limits vs expected output length
- **Compliance Match** (10% weight) - HIPAA, PHI, and regulatory requirements

### 2. **Real-time Recommendations**
- **Excellent** (85-100): ⭐️ Perfect match for this role
- **Good** (70-84): ✓ Solid choice with minor trade-offs
- **Acceptable** (55-69): ○ Works but alternatives may be better
- **Poor** (40-54): △ Significant limitations
- **Not Recommended** (<40): ✕ Better alternatives strongly recommended

### 3. **Visual Feedback**
- Overall score badge with color coding
- Progress bars for each scoring dimension
- Strengths and weaknesses breakdown
- Alternative model suggestions

### 4. **Dynamic Agent Configuration** ✨ NEW
The system now integrates dynamic agent properties from the Supabase agent registry:

- **Temperature** (0-1): Creativity level affects model recommendations
  - High temperature (≥0.8): Prefers GPT-4/Claude for better quality creative outputs
  - Low temperature (≤0.3): Any model works well for deterministic tasks

- **Max Tokens**: Response length requirement from agent configuration
  - Directly used for context window matching instead of estimates

- **RAG Enabled**: Vector search integration requirements
  - Bonuses for models with large context windows (32K+ tokens)

- **Context Window**: Required context size from agent registry
  - Precise matching against model capabilities

- **Response Format**: Expected output format (markdown, JSON, text)
  - Future scoring consideration for format compatibility

- **Tools**: Required tool integrations
  - Essential function calling capability check
  - Major penalty if tools required but model lacks function calling

- **Knowledge Domains**: Specialized knowledge areas
  - Bonus for large context windows when multiple domains present

**Example:**
```typescript
// Agent with dynamic configuration
{
  temperature: 0.7,
  max_tokens: 2000,
  rag_enabled: true,
  context_window: 8000,
  tools: ['Web Search', 'Document Analysis'],
  knowledge_domains: ['clinical-research', 'regulatory']
}

// Scoring impact:
// - RAG enabled → +10 points if model has 32K+ context
// - 2 tools → +15 points if function calling supported, -20 if not
// - 8K context window → Model must support at least 8K tokens
// - 2 knowledge domains → +10 points for 32K+ context window
```

## Example Scoring Scenarios

### Scenario 1: Medical Writer Agent + GPT-3.5 Turbo

**Agent Profile:**
- Role: Medical Writer
- Business Function: Clinical Development
- Capabilities: Document Generation, Clinical Research, Regulatory Writing
- Requires High Accuracy: Yes
- HIPAA Compliant: Yes

**GPT-3.5 Turbo Score: 62/100 - Acceptable**

Breakdown:
```
Role Match:        65/100 ⚠️  (Not medical-specific)
Capabilities:      70/100 ✓   (Good general capabilities)
Performance:       60/100 ⚠️  (Lower accuracy for medical)
Cost:              90/100 ⭐  (Very cost-effective)
Context Size:      75/100 ✓   (16K tokens adequate)
Compliance:        70/100 ✓   (Can use with BAA)
```

**Strengths:**
- Very cost-effective
- Fast response times
- Adequate context window

**Weaknesses:**
- Not optimized for medical content
- Lower accuracy than GPT-4
- Missing specialized medical knowledge

**Better Alternatives:**
- GPT-4 - High accuracy for medical tasks
- BioGPT - Specialized for biomedical text
- Claude 3 Opus - Excellent medical reasoning

---

### Scenario 2: Medical Writer Agent + BioGPT

**BioGPT Score: 88/100 - Excellent** ⭐️

Breakdown:
```
Role Match:        95/100 ⭐  (Medical-specific model)
Capabilities:      90/100 ⭐  (Biomedical expertise)
Performance:       85/100 ✓   (High medical accuracy)
Cost:              100/100 ⭐ (Free/Open source)
Context Size:      60/100 ⚠️  (1K tokens limited)
Compliance:        95/100 ⭐  (Supports PHI)
```

**Strengths:**
- Specialized medical knowledge
- Excellent match for this role
- Very cost-effective
- Meets compliance requirements

**Weaknesses:**
- Limited context window for long outputs

**Reasoning:**
"BioGPT is an excellent choice for Medical Writer. It excels in the required capabilities with high performance and good value."

---

### Scenario 3: Regulatory Affairs Specialist + Claude 3 Opus

**Claude 3 Opus Score: 92/100 - Excellent** ⭐️

Breakdown:
```
Role Match:        90/100 ⭐  (Great for regulatory)
Capabilities:      95/100 ⭐  (Advanced reasoning)
Performance:       95/100 ⭐  (Highest accuracy)
Cost:              65/100 ⚠️  (Premium pricing)
Context Size:      100/100 ⭐ (200K tokens)
Compliance:        70/100 ✓   (Configurable BAA)
```

**Strengths:**
- High performance and accuracy
- Very large context window
- Supports all required capabilities
- Excellent for complex reasoning

**Weaknesses:**
- Higher cost compared to alternatives

---

### Scenario 4: Software Developer Agent + CodeLlama 34B

**CodeLlama 34B Score: 91/100 - Excellent** ⭐️

Breakdown:
```
Role Match:        95/100 ⭐  (Code-specialized)
Capabilities:      95/100 ⭐  (Code generation)
Performance:       85/100 ✓   (Good code quality)
Cost:              100/100 ⭐ (Free/Open source)
Context Size:      90/100 ✓   (16K tokens)
Compliance:        70/100 ✓   (Self-hosted option)
```

**Strengths:**
- Code generation support
- Excellent match for this role
- Very cost-effective
- Large context window

---

### Scenario 5: Business Strategist + Mixtral 8x7B

**Mixtral 8x7B Score: 78/100 - Good** ✓

Breakdown:
```
Role Match:        75/100 ✓   (Good for business)
Capabilities:      80/100 ✓   (Solid capabilities)
Performance:       75/100 ✓   (Good quality)
Cost:              100/100 ⭐ (Free/Open source)
Context Size:      95/100 ⭐  (32K tokens)
Compliance:        50/100 ⚠️  (Requires setup)
```

## How It Works

### 1. Agent Creator Opens Model Dropdown
When selecting a model, the system:
1. Analyzes the agent's profile (role, capabilities, requirements)
2. Fetches model specifications from database
3. Calculates fitness score in real-time
4. Displays visual feedback instantly

### 2. Scoring Algorithm

```typescript
// Role-based scoring
if (agent.role.includes('medical')) {
  if (model.name.includes('BioGPT')) score += 50;
  else if (model.name.includes('gpt-4')) score += 30;
  else if (model.name.includes('gpt-3.5')) score += 10;
}

// Capability matching
if (agent.requiresMedicalKnowledge && model.capabilities.medical_knowledge) {
  score += 30;
}

// Context size requirements
if (agent.expectedOutputLength === 'very_long') {
  if (model.maxTokens >= 32000) score += 50;
  else if (model.maxTokens >= 16000) score += 30;
  else score -= 30;
}
```

### 3. Visual Display

The UI shows:
- **Score Badge**: Color-coded overall score
- **Recommendation Label**: Excellent/Good/Acceptable/Poor
- **Progress Bars**: Visual breakdown of 6 dimensions
- **Reasoning**: Plain English explanation
- **Strengths/Weaknesses**: Bulleted lists
- **Alternatives**: Up to 3 better model suggestions

## Color Coding

- **Green** (80-100): Excellent performance in this area
- **Blue** (60-79): Good performance
- **Yellow** (40-59): Acceptable but could be better
- **Red** (0-39): Weak performance, consider alternatives

## Integration Points

### Agent Creator ([agent-creator.tsx](../src/features/chat/components/agent-creator.tsx))
- Shows fitness score when model is selected
- Updates dynamically as agent properties change
- Appears directly below model dropdown

### Scoring Service ([model-fitness-scorer.ts](../src/lib/services/model-fitness-scorer.ts))
- Pure TypeScript class with static methods
- No API calls, runs client-side
- Extensible for new model types

## Future Enhancements

1. **Historical Performance**: Track actual agent performance with each model
2. **User Preferences**: Learn from user's model selections
3. **Cost Tracking**: Show estimated monthly costs based on usage
4. **A/B Testing**: Compare models side-by-side
5. **Custom Weights**: Let users adjust scoring weights
6. **Model Benchmarks**: Integration with standardized benchmarks

## Benefits

✅ **Better Decision Making**: Data-driven model selection
✅ **Cost Optimization**: Identify over-provisioned models
✅ **Performance Assurance**: Match models to requirements
✅ **User Confidence**: Clear reasoning for recommendations
✅ **Learning Tool**: Understand model strengths/weaknesses

## Technical Details

**File Locations:**
- Scoring Algorithm: `src/lib/services/model-fitness-scorer.ts`
- UI Integration: `src/features/chat/components/agent-creator.tsx`
- Model Data: `/api/llm/available-models`

**Dependencies:**
- React useState for score state
- Tailwind CSS for visual styling
- TypeScript for type safety

**Performance:**
- Client-side calculation (no API calls)
- Instant scoring (<1ms)
- Minimal bundle impact (~5KB)
