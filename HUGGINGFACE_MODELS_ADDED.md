# HuggingFace Medical Models Added ✅

## Overview

Added 4 medical-specialized HuggingFace models from CuratedHealth to the model selection system.

---

## Models Added

### 1. **Meditron 70B (Medical)** 🏥
- **Model ID**: `CuratedHealth/meditron70b-qlora-1gpu`
- **Link**: https://huggingface.co/CuratedHealth/meditron70b-qlora-1gpu
- **Description**: Large medical-specialized model, best for clinical reasoning and complex medical queries
- **Max Tokens**: 8,192
- **Cost Tier**: Medium
- **Use Case**: Complex clinical analysis, differential diagnosis, treatment planning

### 2. **Meditron 7B Chat (Medical)** 💊
- **Model ID**: `CuratedHealth/meditron7b-lora-chat`
- **Link**: https://huggingface.co/CuratedHealth/meditron7b-lora-chat
- **Description**: Efficient medical chat model optimized for clinical conversations
- **Max Tokens**: 4,096
- **Cost Tier**: Low
- **Use Case**: Medical Q&A, patient education, clinical documentation

### 3. **Qwen3 8B Medical (Fine-tuned)** 🔬
- **Model ID**: `CuratedHealth/Qwen3-8B-SFT-20250917123923`
- **Link**: https://huggingface.co/CuratedHealth/Qwen3-8B-SFT-20250917123923
- **Description**: Medical fine-tuned Qwen model for healthcare applications
- **Max Tokens**: 8,192
- **Cost Tier**: Low
- **Use Case**: Healthcare research, medical literature analysis, regulatory documents

### 4. **CuratedHealth Base 7B** ⚕️
- **Model ID**: `CuratedHealth/base_7b`
- **Link**: https://huggingface.co/CuratedHealth/base_7b
- **Description**: Base medical model for general healthcare queries
- **Max Tokens**: 4,096
- **Cost Tier**: Free
- **Use Case**: General medical queries, basic medical information, triage

---

## Complete Model List

### Total Models: **9** (previously 5)

**OpenAI Models (3)**:
- 🤖 GPT-4 Turbo (default)
- 🧠 GPT-4
- ⚡ GPT-3.5 Turbo

**Google Models (2)**:
- 💎 Gemini 1.5 Pro
- ⚡ Gemini 1.5 Flash

**HuggingFace Medical Models (4)** - NEW:
- 🏥 Meditron 70B (Medical)
- 💊 Meditron 7B Chat (Medical)
- 🔬 Qwen3 8B Medical (Fine-tuned)
- ⚕️ CuratedHealth Base 7B

---

## New Helper Functions

### `getRecommendedMedicalModel(isComplex: boolean)`
Recommends a medical model based on query complexity:

```typescript
// For complex clinical queries
const complexModel = getRecommendedMedicalModel(true);
// Returns: 'CuratedHealth/meditron70b-qlora-1gpu'

// For general medical queries
const generalModel = getRecommendedMedicalModel(false);
// Returns: 'CuratedHealth/meditron7b-lora-chat'
```

### `isMedicalModel(modelId: string)`
Check if a model is medical-specialized:

```typescript
isMedicalModel('CuratedHealth/meditron70b-qlora-1gpu'); // true
isMedicalModel('gpt-4-turbo'); // false
```

---

## Environment Setup

### Add to `.env.local`:

```bash
# HuggingFace API Key for medical models
HUGGINGFACE_API_KEY="YOUR_HUGGINGFACE_API_KEY_HERE"
```

### Verify Environment Variable:

```bash
# Check if key is set
grep HUGGINGFACE_API_KEY .env.local
```

---

## API Integration

When implementing the API endpoint (`/api/ask-expert/route.ts`), you'll need to handle HuggingFace models differently:

### HuggingFace Inference API Setup:

```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// For chat completion
const response = await hf.textGeneration({
  model: 'CuratedHealth/meditron7b-lora-chat',
  inputs: prompt,
  parameters: {
    max_new_tokens: 512,
    temperature: 0.7,
    top_p: 0.95,
    return_full_text: false,
  }
});
```

### Install Required Package:

```bash
cd apps/digital-health-startup
npm install @huggingface/inference
```

---

## Model Selection UI

The dropdown now shows all 9 models grouped by provider:

```
🤖 GPT-4 Turbo
🧠 GPT-4
⚡ GPT-3.5 Turbo
💎 Gemini 1.5 Pro
⚡ Gemini 1.5 Flash
🏥 Meditron 70B (Medical)
💊 Meditron 7B Chat (Medical)
🔬 Qwen3 8B Medical (Fine-tuned)
⚕️ CuratedHealth Base 7B
```

---

## Smart Model Recommendation Logic

### For Medical/Clinical Queries:
```typescript
// Detect if query is medical
const isMedicalQuery = query.toLowerCase().includes('medical') ||
                       query.toLowerCase().includes('clinical') ||
                       query.toLowerCase().includes('diagnosis');

if (isMedicalQuery) {
  // Use medical-specialized model
  const recommendedModel = getRecommendedMedicalModel(isComplexQuery);
}
```

### Cost Optimization:
- **Free Tier**: `CuratedHealth/base_7b` - General medical queries
- **Low Cost**: `meditron7b-lora-chat`, `Qwen3-8B` - Routine medical tasks
- **Medium Cost**: `meditron70b-qlora-1gpu` - Complex clinical reasoning
- **High Cost**: `gpt-4-turbo`, `gpt-4` - Regulatory/legal analysis

---

## Testing the Models

### 1. Start Dev Server:
```bash
cd apps/digital-health-startup
npm run dev
```

### 2. Test Model Selection:
- Open http://localhost:3000/ask-expert
- Click model dropdown
- Verify all 9 models appear
- Select a medical model (e.g., Meditron 7B Chat)
- Check console: `🤖 Model changed: CuratedHealth/meditron7b-lora-chat`

### 3. Test Medical Badge:
- When medical model selected, badge should show: `💊 Meditron 7B Chat (Medical)`

---

## Next Steps for API Integration

### Phase 1: Add HuggingFace Package
```bash
npm install @huggingface/inference
```

### Phase 2: Create Model Router
Create `/lib/llm/model-router.ts`:
```typescript
export async function callModel(modelId: string, prompt: string) {
  const model = getModelById(modelId);

  if (!model) throw new Error('Model not found');

  switch (model.provider) {
    case 'openai':
      return callOpenAI(modelId, prompt);
    case 'google':
      return callGemini(modelId, prompt);
    case 'huggingface':
      return callHuggingFace(modelId, prompt);
    default:
      throw new Error('Unsupported provider');
  }
}
```

### Phase 3: Implement HuggingFace Handler
```typescript
async function callHuggingFace(modelId: string, prompt: string) {
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  const response = await hf.textGeneration({
    model: modelId,
    inputs: prompt,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.7,
      top_p: 0.95,
      return_full_text: false,
    },
  });

  return response.generated_text;
}
```

### Phase 4: Add Streaming Support
```typescript
async function streamHuggingFace(modelId: string, prompt: string) {
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  const stream = hf.textGenerationStream({
    model: modelId,
    inputs: prompt,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.7,
    },
  });

  for await (const chunk of stream) {
    yield chunk.token.text;
  }
}
```

---

## Model Comparison

### Performance Characteristics:

| Model | Size | Speed | Medical Accuracy | Cost | Best For |
|-------|------|-------|------------------|------|----------|
| Meditron 70B | Large | Slow | Highest | Medium | Complex clinical cases |
| Meditron 7B Chat | Medium | Fast | High | Low | Medical conversations |
| Qwen3 8B Medical | Medium | Fast | High | Low | Research & documents |
| Base 7B | Small | Very Fast | Good | Free | General medical info |
| GPT-4 Turbo | Large | Medium | Very High | High | Regulatory/legal |
| Gemini 1.5 Pro | Large | Fast | High | Medium | Large context needs |

---

## Usage Examples

### Example 1: Clinical Decision Support
```typescript
// Use Meditron 70B for complex clinical reasoning
const model = 'CuratedHealth/meditron70b-qlora-1gpu';
const query = 'Patient presents with chest pain, elevated troponin, and ST elevation. Differential diagnosis?';
```

### Example 2: Medical Education
```typescript
// Use Meditron 7B Chat for interactive learning
const model = 'CuratedHealth/meditron7b-lora-chat';
const query = 'Explain the mechanism of action of ACE inhibitors';
```

### Example 3: Medical Literature Analysis
```typescript
// Use Qwen3 8B for research tasks
const model = 'CuratedHealth/Qwen3-8B-SFT-20250917123923';
const query = 'Summarize recent findings on CRISPR gene therapy for sickle cell disease';
```

### Example 4: Basic Medical Information
```typescript
// Use Base 7B for simple queries
const model = 'CuratedHealth/base_7b';
const query = 'What are common symptoms of strep throat?';
```

---

## Important Notes

### Medical Disclaimer:
These models are for **informational and research purposes only**. They should not be used as a substitute for professional medical advice, diagnosis, or treatment.

### Regulatory Compliance:
- Ensure compliance with HIPAA when handling patient data
- Do not use models for diagnostic purposes without appropriate validation
- Implement appropriate safeguards and human oversight

### Model Limitations:
- Medical models may have knowledge cutoff dates
- Always verify critical medical information with authoritative sources
- Use ensemble approaches for high-stakes decisions

---

## Files Modified

### Updated:
1. `/lib/config/available-models.ts` - Added 4 HuggingFace models + helper functions

### Documentation:
1. `/HUGGINGFACE_MODELS_ADDED.md` - This file

---

## Summary

✅ **Added**: 4 medical-specialized HuggingFace models from CuratedHealth
✅ **Total Models**: 9 (3 OpenAI + 2 Google + 4 HuggingFace)
✅ **Helper Functions**: `getRecommendedMedicalModel()`, `isMedicalModel()`
✅ **Medical Icons**: 🏥 💊 🔬 ⚕️ for easy identification
✅ **Cost Tiers**: Free to Medium (cost-effective medical AI)

**Next**: Test model selection in UI, then implement HuggingFace API integration for real inference.
