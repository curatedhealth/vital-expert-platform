# 🎯 Domain-Based LLM Model Routing System

## Overview

Automatically selects the optimal LLM models (embedding + chat) based on **knowledge domains** and **domain tiers**. Each of the 30 knowledge domains has recommended models tailored to its specific content and use case.

---

## 🚀 Features

### 1. **Intelligent Model Selection**
- **Chat Models**: Automatically recommends GPT-4, Claude 3, or specialized medical models based on domain
- **Embedding Models**: Routes to general (OpenAI), scientific (SciBERT), or medical (BioBERT/PubMedBERT) embeddings
- **Tier-Based Prioritization**: Tier 1 (Core) domains get priority in recommendations

### 2. **30 Knowledge Domains with LLM Recommendations**
Each domain has:
- **Primary Model**: Best model for this domain
- **Alternative Models**: Fallback options
- **Specialized Models**: Domain-specific models (e.g., BioBERT for medical, SciBERT for scientific)
- **Rationale**: Why this model was chosen

### 3. **Seamless UI Integration**
- **Agent Creator**: Shows recommended models when knowledge domains are selected
- **Knowledge Domains Page**: Manage domains and view LLM recommendations
- **Automatic Updates**: Recommendations update in real-time as domains are selected

---

## 📊 Knowledge Domain Tiers

### **Tier 1: Core Domains** (15 domains)
High-priority, mission-critical domains requiring the best models
- Examples: Regulatory Affairs, Clinical Development, Pharmacovigilance
- **Models**: GPT-4 Turbo, BioBERT, PubMedBERT

### **Tier 2: Specialized Domains** (10 domains)
Specialized areas requiring domain expertise
- Examples: Scientific Publications, Nonclinical Sciences, Risk Management
- **Models**: GPT-4 Turbo, SciBERT

### **Tier 3: Emerging Domains** (5 domains)
Future-focused, evolving areas
- Examples: Precision Medicine, Telemedicine, Sustainability
- **Models**: GPT-4 Turbo, text-embedding-3-large

---

## 🧠 Model Recommendations by Domain

### Tier 1 Examples

#### **Regulatory Affairs** (`regulatory_affairs`)
```json
{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002", "biobert-pubmed"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Regulatory text requires high accuracy for compliance"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "rationale": "Complex regulatory reasoning requires most capable models"
  }
}
```

#### **Clinical Development** (`clinical_development`)
```json
{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large", "pubmedbert-abstract"],
    "specialized": "clinicalbert",
    "rationale": "Clinical trial protocols benefit from medical-specific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Clinical reasoning requires medical knowledge"
  }
}
```

#### **Pharmacovigilance** (`pharmacovigilance`)
```json
{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Safety data requires medical terminology understanding"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Safety analysis requires high accuracy and medical knowledge"
  }
}
```

### Tier 2 Examples

#### **Scientific Publications** (`scientific_publications`)
```json
{
  "embedding": {
    "primary": "scibert",
    "alternatives": ["biobert-pubmed", "text-embedding-3-large"],
    "specialized": "pubmedbert-abstract",
    "rationale": "Scientific publications require specialized embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "rationale": "Publication writing requires high quality output"
  }
}
```

---

## 💻 Usage

### **1. In Agent Creator**

When you select knowledge domains, the system automatically shows recommended models:

```tsx
// Select domains
formData.knowledgeDomains = ['regulatory_affairs', 'clinical_development'];

// Recommended models automatically appear
// Chat: gpt-4-turbo-preview (Tier 1 priority)
// Embedding: biobert-pubmed (medical-specific)
```

**UI Features:**
- ✅ Recommended model badge on dropdown
- ✅ "Use This" button to apply recommended model
- ✅ Tier badges on domain buttons (T1, T2, T3)
- ✅ Real-time updates as domains change

### **2. Via Model Selector Service**

```typescript
import { modelSelector } from '@/lib/services/model-selector';

// Get recommended embedding model
const embeddingModel = await modelSelector.getEmbeddingModel({
  knowledgeDomains: ['regulatory_affairs', 'clinical_development'],
  useSpecialized: true, // Prefer specialized models
});
// Returns: 'biobert-pubmed'

// Get recommended chat model
const chatModel = await modelSelector.getChatModel({
  knowledgeDomains: ['regulatory_affairs'],
});
// Returns: 'gpt-4-turbo-preview'

// Get full recommendations for a domain
const recommendations = await modelSelector.getDomainModelRecommendations('regulatory_affairs');
console.log(recommendations);
// {
//   embedding: { primary: "text-embedding-3-large", ... },
//   chat: { primary: "gpt-4-turbo-preview", ... }
// }
```

### **3. In RAG Service** (Automatic)

The LangChain RAG service automatically uses domain-specific embeddings:

```typescript
// RAG service automatically detects agent's knowledge domains
const embeddings = await this.getEmbeddingsForDomains(knowledgeDomains);
// Uses recommended embedding model for those domains
```

---

## 📁 Files & Components

### **Database**
- **Migration**: `database/sql/migrations/009_add_llm_recommendations_to_domains.sql`
- **Table**: `knowledge_domains.recommended_models` (JSONB column)

### **Services**
- **Model Selector**: `src/lib/services/model-selector.ts`
  - `getEmbeddingModel()` - Get recommended embedding model
  - `getChatModel()` - Get recommended chat model
  - `getDomainModelRecommendations()` - Get full recommendations
  - `getAvailableEmbeddingModels()` - List all embedding models
  - `getAvailableChatModels()` - List all chat models

### **UI Components**
- **Knowledge Domains Page**: `src/app/(app)/knowledge-domains/page.tsx`
  - View all domains with LLM recommendations
  - Add new domains
  - Filter by tier
  - See recommended models per domain

- **Agent Creator**: `src/features/chat/components/agent-creator.tsx`
  - Tier badges on domain buttons
  - Recommended models card
  - Auto-update model dropdown

### **RAG Integration**
- **LangChain Service**: `src/features/chat/services/langchain-service.ts`
  - `getEmbeddingsForDomains()` - Dynamic embedding selection
  - Upgraded default to `text-embedding-3-large`

---

## 🎨 Available Models

### **Embedding Models**

#### General Purpose (OpenAI)
- `text-embedding-3-large` - 3072 dims, best general model
- `text-embedding-ada-002` - 1536 dims, cost-effective
- `code-embedding-ada-002` - Code/technical docs

#### Medical/Scientific (HuggingFace)
- `biobert-pubmed` - Biomedical literature
- `pubmedbert-abstract` - PubMed abstracts
- `pubmedbert-abstract-fulltext` - Full PubMed articles
- `scibert` - Scientific publications
- `clinicalbert` - Clinical notes/EHR
- `chembert` - Chemical literature

### **Chat Models**

#### OpenAI
- `gpt-4-turbo-preview` - 128K context, most capable
- `gpt-4` - 8K context, high quality
- `gpt-3.5-turbo` - 16K context, fast/cost-effective

#### Anthropic
- `claude-3-opus` - 200K context, highest accuracy
- `claude-3-sonnet` - 200K context, balanced
- `claude-3-haiku` - 200K context, fastest

#### Specialized Medical
- `meditron-70b` - Medical reasoning/clinical knowledge

---

## 🔄 Workflow

### **When Creating an Agent**

1. **Select Knowledge Domains** (Knowledge tab)
   - Choose domains like "Regulatory Affairs", "Clinical Development"
   - Domains show tier badges (T1, T2, T3)

2. **System Calculates Recommendations** (Automatic)
   - Prioritizes Tier 1 domains
   - Gets primary domain's recommended models
   - Updates `recommendedModels` state

3. **View Recommendations** (Models tab)
   - Green card shows recommended chat + embedding models
   - "Use This" button to apply recommendation
   - Model dropdown shows ⭐ RECOMMENDED badge

4. **Select Model** (Optional)
   - Can use recommended model or choose alternative
   - Dropdown shows all available models
   - Specialized models highlighted if available

### **When Adding New Domain**

1. **Navigate to Knowledge Domains Page**
   - `/knowledge-domains` route

2. **Click "Add Domain"**
   - Fill in name, code, slug, tier
   - Select recommended embedding model (dropdown)
   - Select recommended chat model (dropdown)
   - System saves to database

3. **Domain Appears in Agent Creator**
   - Immediately available for selection
   - Recommendations automatically applied

---

## 📈 Benefits

### **1. Optimized Performance**
- Medical domains use specialized models (BioBERT, PubMedBERT)
- Better accuracy for domain-specific terminology
- Reduced hallucinations with medical content

### **2. Cost Efficiency**
- General domains use cost-effective models
- Specialized models only for Tier 1 critical domains
- Automatic fallback to cheaper alternatives

### **3. Scalability**
- Easy to add new domains
- Update recommendations without code changes
- Support for future models (GPT-5, Claude 4)

### **4. User Experience**
- Clear recommendations based on use case
- Transparent reasoning for model selection
- One-click application of recommended models

---

## 🧪 Testing

### **Test Recommended Model Selection**

```bash
# 1. Run database migration
npx supabase db push

# 2. Verify knowledge domains loaded
curl http://127.0.0.1:54321/rest/v1/knowledge_domains?select=slug,name,recommended_models \
  -H "apikey: YOUR_ANON_KEY"

# 3. Test in UI
npm run dev
# Navigate to /agents?create=true
# Select knowledge domains
# Check Models tab for recommendations
```

### **Test Model Selector Service**

```typescript
// In console or test file
import { modelSelector } from '@/lib/services/model-selector';

// Test embedding model selection
const embeddingModel = await modelSelector.getEmbeddingModel({
  knowledgeDomains: ['clinical_development', 'pharmacovigilance'],
  useSpecialized: true,
});
console.log('Recommended embedding:', embeddingModel);
// Expected: 'biobert-pubmed' (Tier 1 medical domain)

// Test chat model selection
const chatModel = await modelSelector.getChatModel({
  knowledgeDomains: ['regulatory_affairs'],
});
console.log('Recommended chat:', chatModel);
// Expected: 'gpt-4-turbo-preview' (Tier 1 critical domain)
```

---

## 🔧 Configuration

### **Add New Embedding Model**

Edit `src/lib/services/model-selector.ts`:

```typescript
export const AVAILABLE_EMBEDDING_MODELS = {
  // ... existing models
  'my-new-model': {
    name: 'My New Model',
    provider: 'MyProvider',
    dimensions: 1024,
    contextWindow: 8192,
    costPer1k: 0.0001,
    description: 'Description of model',
    suitable_for: ['medical', 'research'],
  },
};
```

### **Update Domain Recommendations**

Edit `database/sql/migrations/009_add_llm_recommendations_to_domains.sql`:

```sql
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "new-embedding-model",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "specialized-model"
  },
  "chat": {
    "primary": "new-chat-model",
    "alternatives": ["gpt-4-turbo-preview"]
  }
}'::jsonb
WHERE slug = 'my_domain';
```

---

## 📚 API Reference

### **ModelSelector Class**

```typescript
class ModelSelector {
  // Get recommended embedding model
  async getEmbeddingModel(options: {
    knowledgeDomains?: string[];
    tier?: number;
    useSpecialized?: boolean;
    fallbackModel?: string;
  }): Promise<string>

  // Get recommended chat model
  async getChatModel(options: {
    knowledgeDomains?: string[];
    tier?: number;
    useSpecialized?: boolean;
    fallbackModel?: string;
  }): Promise<string>

  // Get full domain recommendations
  async getDomainModelRecommendations(
    domainSlug: string
  ): Promise<DomainModelConfig | null>

  // Get available models for dropdown
  getAvailableEmbeddingModels(): ModelInfo[]
  getAvailableChatModels(): ModelInfo[]

  // Get recommended models for dropdown (with badges)
  async getRecommendedModelsForDomain(
    domainSlug: string,
    modelType: 'embedding' | 'chat'
  ): Promise<Array<{
    value: string;
    label: string;
    isRecommended: boolean;
    isSpecialized: boolean;
  }>>

  // Clear cache
  clearCache(): void
}
```

---

## 🎯 Next Steps

### **Phase 1: Embedding Upgrade** ✅ COMPLETE
- ✅ Upgrade from `text-embedding-ada-002` to `text-embedding-3-large`
- ✅ Add domain-based routing
- ✅ Support specialized models (BioBERT, SciBERT)

### **Phase 2: Knowledge Base Population** (Next)
- [ ] Upload FDA guidelines → `regulatory_affairs`
- [ ] Upload ICH guidelines → `regulatory_affairs`
- [ ] Upload clinical trial protocols → `clinical_development`
- [ ] Upload PubMed articles → `medical_affairs`

### **Phase 3: Advanced Features** (Future)
- [ ] Hybrid embeddings (combine general + specialized)
- [ ] Fine-tune models on specific domains
- [ ] A/B testing for model performance
- [ ] Cost tracking per domain
- [ ] Quality metrics dashboard

---

## ✅ Status

- ✅ Database schema updated with `recommended_models` column
- ✅ 30 domains configured with LLM recommendations
- ✅ Model selector service implemented
- ✅ Agent creator UI updated
- ✅ Knowledge domains management page created
- ✅ RAG service integrated with domain routing
- ✅ Tier-based prioritization working
- ✅ Documentation complete

**Total Implementation**: 7 files created/modified
- 1 database migration
- 1 model selector service
- 1 knowledge domains UI page
- 1 agent creator enhancement
- 1 RAG service update
- 1 documentation file
- 1 summary file

---

## 🤝 Related Documentation

- [Knowledge Domains Summary](./KNOWLEDGE_DOMAINS_SUMMARY.md) - Complete 30 domains reference
- [Knowledge Domains Setup](./KNOWLEDGE_DOMAINS_SETUP.md) - Step-by-step setup guide
- [Recommended Knowledge Domains](./RECOMMENDED_KNOWLEDGE_DOMAINS.md) - Analysis & recommendations
- [RAG Enhancements](./RAG_ENHANCEMENTS.md) - Hybrid search + re-ranking

---

**🎉 Domain-Based LLM Routing is now live!**

Select knowledge domains in the agent creator, and the system automatically recommends the optimal models for your use case.
