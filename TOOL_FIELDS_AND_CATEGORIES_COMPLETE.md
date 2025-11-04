# 📋 TOOL REGISTRY: Complete Fields & Categories Reference

## 🗂️ **DATABASE SCHEMA: `dh_tool` Table**

### **All 39 Fields**

| # | Field Name | Data Type | Description | Required | Example |
|---|------------|-----------|-------------|----------|---------|
| 1 | `id` | UUID | Primary key | ✅ | `gen_random_uuid()` |
| 2 | `tenant_id` | UUID | Multi-tenancy ID | ✅ | - |
| 3 | `unique_id` | TEXT | Human-readable ID | ✅ | `TL-SEARCH-europe_pmc` |
| 4 | `code` | VARCHAR(50) | Short code | ✅ | `TOOL-SEARCH-EUROPE_PMC` |
| 5 | `name` | VARCHAR(150) | Display name | ✅ | `Europe PMC` |
| 6 | `category` | VARCHAR(100) | Category/domain | ❌ | `Research` |
| 7 | `tool_type` | VARCHAR(50) | Type of tool | ❌ | `ai_function` |
| 8 | `implementation_type` | TEXT | How it's implemented | ❌ | `langchain_tool` |
| 9 | `lifecycle_stage` | TEXT | Production readiness | ❌ | `production` |
| 10 | `tool_description` | TEXT | Full description | ❌ | Detailed description |
| 11 | `llm_description` | TEXT | Short LLM-friendly | ❌ | `Search 40M+ biomedical articles` |
| 12 | `usage_guide` | TEXT | How to use it | ❌ | Step-by-step guide |
| 13 | `implementation_path` | TEXT | Code path | ❌ | `langchain_community.tools...` |
| 14 | `function_name` | TEXT | Function to call | ❌ | `search_europe_pmc` |
| 15 | `vendor` | VARCHAR(150) | Vendor/provider | ❌ | `European Bioinformatics Institute` |
| 16 | `version` | VARCHAR(50) | Version number | ❌ | `1.0.0` |
| 17 | `documentation_url` | TEXT | Docs link | ❌ | `https://europepmc.org/docs` |
| 18 | `input_schema` | JSONB | Input parameters | ❌ | `{type: object, properties: {...}}` |
| 19 | `output_schema` | JSONB | Output format | ❌ | `{type: object, properties: {...}}` |
| 20 | `example_usage` | JSONB | Usage examples | ❌ | `{example: "...", curl: "..."}` |
| 21 | `capabilities` | TEXT[] | Array of capabilities | ❌ | `['full_text_search', 'citations']` |
| 22 | `tags` | TEXT[] | Searchable tags | ❌ | `['research', 'literature', 'pubmed']` |
| 23 | `required_env_vars` | TEXT[] | Required env vars | ❌ | `['OPENAI_API_KEY']` |
| 24 | `allowed_tenants` | TEXT[] | Tenant whitelist | ❌ | `['tenant-1', 'tenant-2']` |
| 25 | `allowed_roles` | TEXT[] | Role whitelist | ❌ | `['admin', 'researcher']` |
| 26 | `access_level` | TEXT | Access control | ❌ | `public` / `private` / `licensed` |
| 27 | `access_requirements` | JSONB | Access details | ✅ | `{api_key: true, license: false}` |
| 28 | `is_active` | BOOLEAN | Active/inactive | ✅ | `true` |
| 29 | `is_async` | BOOLEAN | Async execution | ❌ | `true` |
| 30 | `max_execution_time_seconds` | INTEGER | Timeout | ❌ | `30` |
| 31 | `rate_limit_per_minute` | INTEGER | Rate limit | ❌ | `60` |
| 32 | `cost_per_execution` | NUMERIC | Cost estimate | ❌ | `0.0001` |
| 33 | `retry_config` | JSONB | Retry settings | ❌ | `{max_retries: 3, backoff: 'exponential'}` |
| 34 | `langgraph_compatible` | BOOLEAN | LangGraph ready | ❌ | `true` |
| 35 | `langgraph_node_name` | TEXT | LangGraph node ID | ❌ | `europe_pmc_search_node` |
| 36 | `metadata` | JSONB | Additional metadata | ✅ | `{tier: 1, license: 'MIT'}` |
| 37 | `notes` | TEXT | Internal notes | ❌ | Free-form notes |
| 38 | `created_at` | TIMESTAMPTZ | Creation time | ✅ | `now()` |
| 39 | `updated_at` | TIMESTAMPTZ | Last update | ✅ | `now()` |

---

## 📊 **CATEGORIES (49 Total)**

### **Current Category Distribution**

| Category | Tools | Type |
|----------|-------|------|
| **Research** | 18 | 🔬 Literature & Academic |
| **Medical** / **medical** | 11 | 💊 Medical Databases |
| **Document Processing** | 6 | 📄 Document Tools |
| **Communication** | 5 | 💬 Messaging & Alerts |
| **Healthcare/Clinical NLP** | 5 | 🏥 Clinical NLP |
| **Healthcare/De-identification** | 5 | 🔒 PHI Removal |
| **Regulatory** | 5 | 🏛️ Regulatory Compliance |
| **AI/Agent Framework** | 4 | 🤖 AI Frameworks |
| **Computation** / **computation** | 5 | 💻 Computing |
| **Healthcare/Bioinformatics** | 4 | 🧬 Bioinformatics |
| **Healthcare/Data Quality** | 4 | ✅ Data QA |
| **Healthcare/FHIR** | 4 | 🏥 FHIR/EHR |
| **Healthcare/RWE** | 4 | 📊 Real-World Evidence |
| **Productivity** | 4 | 🔧 Productivity Tools |
| **STATISTICAL_SOFTWARE** | 4 | 📊 Statistics |
| **Data Quality** | 3 | ✅ Data Validation |
| **Healthcare/EHR** | 3 | 🏥 EHR Systems |
| **Healthcare/Medical Imaging** | 3 | 🖼️ Medical Imaging |
| **RESEARCH_DATABASE** | 3 | 🔬 Research DBs |
| **Web** / **web** | 6 | 🌐 Web Search |
| **AI/ML** | 2 | 🤖 AI/ML |
| **Code Execution** | 2 | 💻 Code Execution |
| **Data Analysis** | 2 | 📊 Data Analysis |
| **EDC_SYSTEM** | 2 | 📋 EDC Systems |
| **Finance** | 2 | 💰 Finance |
| **Healthcare/CDS** | 2 | 🏥 Clinical Decision Support |
| **Healthcare/Cheminformatics** | 2 | 🧪 Cheminformatics |
| **Monitoring** | 2 | 📱 Monitoring |
| **Statistics** | 2 | 📊 Statistics |
| **Wearables** | 2 | ⌚ Wearable Devices |
| **AI_ORCHESTRATION** | 1 | 🤖 AI Orchestration |
| **API** | 1 | 🔌 API Tools |
| **CTMS** | 1 | 📋 CTMS |
| **Database** | 1 | 🗄️ Database |
| **DECISION_ANALYSIS** | 1 | 🎯 Decision Analysis |
| **Healthcare/Benchmarking** | 1 | 🏥 Benchmarking |
| **Healthcare/Mobile** | 1 | 📱 Mobile Health |
| **Healthcare/Public Health** | 1 | 🏥 Public Health |
| **Healthcare/Supply Chain** | 1 | 📦 Supply Chain |
| **Healthcare/Synthetic Data** | 1 | 🏥 Synthetic Data |
| **PRO_REGISTRY** | 1 | 📋 PRO Registry |
| **rag** | 1 | 🔍 RAG |
| **REGULATORY_INFORMATION_MANAGEMENT** | 1 | 🏛️ Regulatory Info Mgmt |
| **REGULATORY_SUBMISSION** | 1 | 🏛️ Regulatory Submission |
| **SIMULATION** | 1 | 🎲 Simulation |
| **WORKFLOW_MANAGEMENT** | 1 | 📋 Workflow Mgmt |

---

## 🏷️ **TOOL_TYPE (6 Values)**

| Tool Type | Count | Description | Example |
|-----------|-------|-------------|---------|
| `ai_function` | ~80 | AI/ML function tools | LLM-powered tools |
| `langchain_tool` | ~40 | LangChain community tools | External APIs via LangChain |
| `api` | ~10 | API integrations | REST APIs |
| `function` | ~20 | Custom Python functions | Internal functions |
| `software_reference` | ~8 | Commercial software | TreeAge, SPSS |
| `database` | ~4 | Database systems | PubMed, Cochrane |

---

## 🔧 **IMPLEMENTATION_TYPE (5 Values)**

| Implementation Type | Count | Description | Ready? |
|---------------------|-------|-------------|--------|
| `langchain_tool` | ~50 | LangChain community | ✅ Yes |
| `custom` | ~20 | Custom implementation | 🚧 Build |
| `api` | ~15 | External API | ✅ Mostly |
| `function` | ~30 | Python function | 🚧 Build |
| `python_function` | ~5 | Python function | ✅ Some |

---

## 🚀 **LIFECYCLE_STAGE (5 Values)**

| Stage | Count | % | Description |
|-------|-------|---|-------------|
| `production` | 113 | 79.6% | ✅ Ready to use |
| `development` | 29 | 20.4% | 🚧 Need to build |
| `testing` | 0 | 0% | 🧪 In testing |
| `staging` | 0 | 0% | 🔄 Pre-production |
| `deprecated` | 0 | 0% | ❌ No longer supported |

---

## 🎯 **ACCESS_LEVEL (3 Values)**

| Access Level | Description | Example |
|--------------|-------------|---------|
| `public` | No restrictions | Wikipedia, PubMed |
| `private` | Tenant-specific | Internal tools |
| `licensed` | Commercial license required | Veeva, Medidata |

---

## 🔐 **ACCESS_REQUIREMENTS (JSONB)**

Common structure:
```json
{
  "api_key": true,              // Requires API key
  "license": false,             // Requires license
  "authentication": "oauth2",   // Auth method
  "rate_limit": "1000/day",     // Rate limits
  "cost": "free"                // Cost structure
}
```

---

## 📊 **CAPABILITIES (TEXT[] Array)**

Common capabilities:
```typescript
[
  // Search & Retrieval
  'full_text_search',
  'semantic_search',
  'citation_search',
  
  // Healthcare
  'fhir_server',
  'ehr_integration',
  'clinical_nlp',
  'phi_detection',
  'phi_removal',
  
  // Data Processing
  'data_validation',
  'data_quality',
  'etl',
  'transformation',
  
  // Analysis
  'statistical_analysis',
  'machine_learning',
  'predictive_modeling',
  
  // Imaging
  'medical_imaging',
  'image_segmentation',
  'dicom_support',
  
  // Compliance
  'hipaa_compliant',
  'fda_approved',
  'regulatory_submission'
]
```

---

## 🏷️ **TAGS (TEXT[] Array)**

Common tags:
```typescript
[
  // General
  'research', 'literature', 'search', 'analysis',
  
  // Healthcare
  'healthcare', 'clinical', 'medical', 'pharma',
  'fhir', 'ehr', 'hipaa', 'pii', 'phi',
  
  // Domains
  'regulatory', 'compliance', 'statistics',
  'bioinformatics', 'imaging', 'nlp',
  
  // Tech
  'ai', 'ml', 'llm', 'rag', 'langchain',
  'python', 'api', 'database'
]
```

---

## 📋 **METADATA (JSONB)**

Common metadata fields:
```json
{
  "tier": 1,                    // Priority tier (1=critical, 2=important, 3=nice-to-have)
  "license": "MIT",             // Software license
  "language": "Python",         // Programming language
  "source": "Open Source",      // Source type
  "coverage": "40M+ abstracts", // Data coverage
  "api_base_url": "https://...", // API endpoint
  "authentication": "none",     // Auth type
  "rate_limit": "none",         // Rate limits
  "cost": 0,                    // Cost per use
  "dependencies": ["requests"], // Dependencies
  "last_verified": "2025-11-04" // Last verification date
}
```

---

## 🎯 **SUGGESTED CATEGORY IMPROVEMENTS**

### **Recommended Standardization**

Many categories have inconsistent naming (e.g., `medical` vs `Medical`, `web` vs `Web`). Here's a recommendation:

#### **Top-Level Categories (15)**

1. **Healthcare** (41 tools)
   - Healthcare/FHIR
   - Healthcare/EHR  
   - Healthcare/Clinical NLP
   - Healthcare/De-identification
   - Healthcare/RWE
   - Healthcare/Medical Imaging
   - Healthcare/Bioinformatics
   - Healthcare/Data Quality
   - Healthcare/CDS
   - Healthcare/Cheminformatics
   - Healthcare/Public Health
   - Healthcare/Mobile
   - Healthcare/Supply Chain
   - Healthcare/Synthetic Data
   - Healthcare/Benchmarking

2. **Research** (21 tools)
   - Research/Literature Search
   - Research/Databases
   - Research/Citations

3. **Medical** (11 tools)
   - Medical/Clinical Databases
   - Medical/Terminology
   - Medical/Drug Information

4. **Regulatory** (8 tools)
   - Regulatory/Compliance
   - Regulatory/Submissions
   - Regulatory/Guidelines

5. **AI/ML** (21 tools)
   - AI/Frameworks
   - AI/Agents
   - AI/Orchestration
   - AI/RAG

6. **Data** (15 tools)
   - Data/Analysis
   - Data/Quality
   - Data/Processing

7. **Document** (6 tools)
   - Document/Processing
   - Document/Generation
   - Document/Extraction

8. **Communication** (5 tools)
   - Communication/Messaging
   - Communication/Notifications

9. **Clinical** (8 tools)
   - Clinical/EDC
   - Clinical/CTMS
   - Clinical/Monitoring

10. **Statistics** (6 tools)
    - Statistics/Analysis
    - Statistics/Software

11. **Computation** (5 tools)
    - Computation/Code Execution
    - Computation/Math

12. **Web** (6 tools)
    - Web/Search
    - Web/Scraping

13. **Productivity** (4 tools)
    - Productivity/Project Management
    - Productivity/Development

14. **Finance** (2 tools)
    - Finance/Market Data

15. **Wearables** (2 tools)
    - Wearables/Fitness
    - Wearables/Health

---

## 🔄 **RECOMMENDED ACTIONS**

### **1. Standardize Categories** 🎯
- Merge `Medical` and `medical` → `Medical`
- Merge `Web` and `web` → `Web`
- Merge `Computation` and `computation` → `Computation`
- Convert ALL_CAPS categories to Title Case
- Organize in hierarchical structure

### **2. Add Missing Fields** ➕
Consider adding:
- `priority` (high/medium/low)
- `business_value` (1-10 score)
- `technical_complexity` (1-10 score)
- `development_status` (planned/in-progress/complete)
- `last_verified_date` (when was it last tested)
- `health_status` (healthy/degraded/down)

### **3. Populate Existing Fields** ✅
- Add `capabilities` arrays to all tools
- Add `tags` to all tools for better search
- Add `example_usage` JSONB for all tools
- Complete `input_schema` and `output_schema`

### **4. Create Category Hierarchy** 🗂️
Implement parent-child categories:
```sql
ALTER TABLE dh_tool ADD COLUMN category_parent VARCHAR(100);
ALTER TABLE dh_tool ADD COLUMN category_child VARCHAR(100);

-- Example:
-- category_parent: 'Healthcare'
-- category_child: 'Clinical NLP'
```

---

## 📊 **SUMMARY**

| Aspect | Count |
|--------|-------|
| **Total Fields** | 39 |
| **Required Fields** | 6 |
| **Optional Fields** | 33 |
| **Current Categories** | 49 |
| **Recommended Categories** | 15 (top-level) + 45 (sub-categories) |
| **Tool Types** | 6 |
| **Implementation Types** | 5 |
| **Lifecycle Stages** | 5 (using 2) |
| **Access Levels** | 3 |

---

**Date:** November 4, 2025  
**Tools in Registry:** 142  
**Status:** ✅ COMPLETE REFERENCE

