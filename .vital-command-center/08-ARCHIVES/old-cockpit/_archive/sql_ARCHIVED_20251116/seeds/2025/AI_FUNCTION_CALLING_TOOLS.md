# 🤖 AI FUNCTION-CALLING TOOLS - Complete List

**Date**: November 3, 2025  
**Purpose**: Tools available for AI agents to call during workflow execution  
**Database Table**: `tools` (separate from `dh_tool` which has clinical/research software)  
**Status**: ✅ **9 Tools Active**

---

## 📊 **SUMMARY**

| Metric | Count |
|--------|-------|
| **Total Active AI Tools** | 9 |
| **LangGraph Compatible** | 9 (100%) |
| **Free Tools** | 7 (78%) |
| **Paid/API Tools** | 2 (22%) |
| **Categories** | 4 (Computation, Medical, RAG, Web) |
| **Created** | November 2, 2025 |

---

## 🛠️ **ALL 9 AI FUNCTION-CALLING TOOLS**

### **1. COMPUTATION TOOLS (1)**

#### **Calculator**
- **Code**: `calculator`
- **Description**: Perform mathematical calculations and evaluate expressions safely
- **Category**: Computation / Math
- **Cost**: $0.0001 per execution
- **LangGraph**: ✅ Compatible
- **Tags**: math, calculation, computation
- **Status**: ✅ Active

---

### **2. MEDICAL/CLINICAL TOOLS (4)**

#### **PubMed Medical Research Search**
- **Code**: `pubmed_search`
- **Description**: Search PubMed database for medical research papers, clinical studies, and biomedical literature. Free access to 30+ million citations
- **Category**: Medical / Research
- **Cost**: **FREE** ($0.0000)
- **LangGraph**: ✅ Compatible
- **Tags**: medical, research, pubmed, clinical, biomedical
- **Features**:
  - 30+ million citations
  - MeSH terms search
  - Publication type filtering
  - Date range filtering
- **Status**: ✅ Active
- **URL**: https://pubmed.ncbi.nlm.nih.gov

---

#### **ClinicalTrials.gov Search**
- **Code**: `clinicaltrials_search`
- **Description**: Search ClinicalTrials.gov for ongoing and completed clinical trials. Access to 400,000+ clinical studies worldwide
- **Category**: Medical / Clinical Trials
- **Cost**: **FREE** ($0.0000)
- **LangGraph**: ✅ Compatible
- **Tags**: medical, clinical_trials, research, fda
- **Features**:
  - 400,000+ studies
  - Trial status filtering
  - Condition search
  - Intervention filtering
- **Status**: ✅ Active
- **URL**: https://clinicaltrials.gov

---

#### **FDA Drug Database Search**
- **Code**: `fda_drugs`
- **Description**: Search FDA approved drugs, labels, and adverse events. Official FDA drugs@FDA database
- **Category**: Medical / Drugs
- **Cost**: **FREE** ($0.0000)
- **LangGraph**: ✅ Compatible
- **Tags**: medical, fda, drugs, pharmaceutical, regulatory
- **Features**:
  - FDA-approved drugs
  - Drug labels
  - Adverse events
  - Regulatory information
- **Status**: ✅ Active

---

#### **WHO Health Guidelines Search**
- **Code**: `who_guidelines`
- **Description**: Search World Health Organization guidelines, recommendations, and health information. Official WHO database access
- **Category**: Medical / Guidelines
- **Cost**: **FREE** ($0.0000)
- **LangGraph**: ✅ Compatible
- **Tags**: medical, who, guidelines, health, recommendations
- **Features**:
  - WHO guidelines
  - Health recommendations
  - Global health information
- **Status**: ✅ Active

---

### **3. RAG/KNOWLEDGE TOOLS (1)**

#### **RAG Knowledge Search**
- **Code**: `rag_search`
- **Description**: Search the knowledge base using Retrieval-Augmented Generation. Returns relevant documents with citations
- **Category**: RAG / Search
- **Cost**: $0.0020 per execution
- **LangGraph**: ✅ Compatible
- **Tags**: rag, knowledge, search, retrieval
- **Features**:
  - Vector search
  - Document retrieval
  - Citation tracking
  - Context-aware results
- **Status**: ✅ Active

---

### **4. WEB/RESEARCH TOOLS (3)**

#### **Web Search (Tavily)**
- **Code**: `web_search`
- **Description**: Search the web for real-time information using Tavily API. Returns relevant web pages with content snippets, URLs, and relevance scores
- **Category**: Web / Search
- **Cost**: $0.0010 per execution
- **LangGraph**: ✅ Compatible
- **Tags**: web, search, research, real-time
- **Features**:
  - Real-time web search
  - Relevance scoring
  - Content snippets
  - URL extraction
  - Basic/Advanced search depth
- **API**: Tavily (requires TAVILY_API_KEY)
- **Rate Limit**: 60 calls/minute
- **Status**: ✅ Active

---

#### **Web Page Scraper**
- **Code**: `web_scraper`
- **Description**: Extract and parse content from web pages. Returns cleaned text, metadata, and structured data
- **Category**: Web / Scraping
- **Cost**: $0.0005 per execution
- **LangGraph**: ✅ Compatible
- **Tags**: web, scraping, extraction
- **Features**:
  - HTML parsing
  - Text extraction
  - Link extraction
  - Image extraction
  - Metadata extraction
- **Rate Limit**: 30 calls/minute
- **Status**: ✅ Active

---

#### **arXiv Scientific Papers Search**
- **Code**: `arxiv_search`
- **Description**: Search arXiv.org for scientific papers in physics, mathematics, computer science, and more. Access to 2+ million preprints
- **Category**: Web / Research
- **Cost**: **FREE** ($0.0000)
- **LangGraph**: ✅ Compatible
- **Tags**: research, arxiv, scientific, papers, preprints
- **Features**:
  - 2+ million preprints
  - Multiple disciplines
  - Full-text search
  - Author search
  - Date filtering
- **Status**: ✅ Active
- **URL**: https://arxiv.org

---

## 📊 **TOOLS BY CATEGORY**

| Category | Tools | Cost Range | Free Tools |
|----------|-------|------------|------------|
| **Computation** | 1 | $0.0001 | 0 |
| **Medical** | 4 | $0.0000 | 4 (100%) |
| **RAG** | 1 | $0.0020 | 0 |
| **Web** | 3 | $0.0000 - $0.0010 | 1 (33%) |

---

## 💰 **COST BREAKDOWN**

| Tool | Cost per Call | Cost Type |
|------|---------------|-----------|
| **PubMed Search** | $0.0000 | ✅ FREE |
| **ClinicalTrials.gov** | $0.0000 | ✅ FREE |
| **FDA Drugs** | $0.0000 | ✅ FREE |
| **WHO Guidelines** | $0.0000 | ✅ FREE |
| **arXiv Search** | $0.0000 | ✅ FREE |
| **Calculator** | $0.0001 | 💵 Low cost |
| **Web Scraper** | $0.0005 | 💵 Low cost |
| **Web Search** | $0.0010 | 💵 Low cost |
| **RAG Search** | $0.0020 | 💵 Moderate |

**Average Cost**: $0.0006 per tool call  
**Most Expensive**: RAG Search ($0.0020)  
**Most Affordable**: 5 free tools ($0.0000)

---

## 🔗 **AGENT ASSIGNMENTS**

Tools are assigned to AI agents via the `agent_tools` table. Example agents using these tools:

- **regulatory_affairs_expert**: Uses RAG search, FDA drugs, WHO guidelines, ClinicalTrials, PubMed, Web search, Web scraper
- **clinical_research_expert**: Uses RAG search, PubMed, ClinicalTrials, arXiv, Web search

---

## 🎯 **USE CASES**

### **For Clinical Development:**
- ✅ PubMed Search → Literature reviews
- ✅ ClinicalTrials.gov → Competitive landscape
- ✅ WHO Guidelines → Clinical protocols
- ✅ Calculator → Sample size calculations

### **For Regulatory Affairs:**
- ✅ FDA Drugs → Precedent research
- ✅ RAG Search → Internal knowledge base
- ✅ Web Search → Real-time regulatory news
- ✅ ClinicalTrials.gov → Regulatory endpoints

### **For Market Access:**
- ✅ PubMed Search → Health economics literature
- ✅ Web Search → Payer landscapes
- ✅ RAG Search → Internal HEOR documents
- ✅ arXiv → Health economics preprints

### **For Evidence & Engagement:**
- ✅ PubMed Search → RWE studies
- ✅ ClinicalTrials.gov → Registry protocols
- ✅ Web Scraper → Conference abstracts
- ✅ RAG Search → Publication database

### **For Product Development:**
- ✅ arXiv Search → AI/ML papers
- ✅ Web Search → Technology trends
- ✅ PubMed Search → Clinical validation
- ✅ Calculator → Algorithm calculations

---

## 🔒 **SECURITY & ACCESS**

### **Access Levels:**
- **Public**: All tools (no authentication required for most)
- **API Keys Required**: 
  - Web Search (Tavily): TAVILY_API_KEY
  - RAG Search: Internal system

### **Rate Limits:**
- PubMed: 100 calls/minute
- Web Search: 60 calls/minute
- Web Scraper: 30 calls/minute
- Others: No documented limits

### **Execution Timeouts:**
- Most tools: 30 seconds
- Web Scraper: 45 seconds
- Default: 30 seconds with 3 retry attempts

---

## 📈 **INTEGRATION STATUS**

| Integration | Status |
|-------------|--------|
| **LangGraph** | ✅ All 9 tools compatible |
| **Python Functions** | ✅ All implemented |
| **Async Support** | ✅ All tools async-ready |
| **Streaming** | ❌ None support streaming |
| **Retry Logic** | ✅ All have retry config |

---

## 🆚 **COMPARISON: AI TOOLS vs CLINICAL TOOLS**

### **AI Function-Calling Tools (this list):**
- **Table**: `tools`
- **Purpose**: Real-time data access during AI execution
- **Count**: 9 tools
- **Examples**: Web search, PubMed search, calculator
- **Used by**: AI agents during task execution

### **Clinical/Research Software (`dh_tool`):**
- **Table**: `dh_tool`
- **Purpose**: Clinical trial management & statistical software
- **Count**: 17 tools
- **Examples**: R, SAS, Medidata Rave, Veeva Vault
- **Used by**: Human users for research/trials

**Key Difference**: AI tools are for real-time function calling, while clinical tools are for human-operated software platforms.

---

## 📍 **WHERE ARE THEY?**

**Database**: Supabase  
**Table**: `tools` (NOT `dh_tool`)  
**Tenant**: System-wide (not tenant-specific)  
**Created**: November 2, 2025 at 10:24:07 UTC  
**Status**: ✅ **Live and operational**

---

## 🚀 **NEXT STEPS**

### **To Use These Tools:**
1. AI agents automatically call these during workflow execution
2. Tools are assigned via `agent_tools` table
3. LangGraph orchestration handles tool routing
4. Results are returned to agents for processing

### **To Add More Tools:**
1. Insert into `tools` table
2. Define input/output schemas
3. Assign to agents in `agent_tools`
4. Implement Python function in codebase

### **To Monitor Usage:**
1. Check `tool_executions` table for logs
2. Review `tool_usage_logs` for analytics
3. Monitor costs via `cost_per_execution`

---

**Bottom Line**: You have **9 AI function-calling tools** that agents can use during workflow execution, with **7 free tools** covering medical research, clinical trials, guidelines, and web search! ✅

**These are separate from your 17 clinical/research software tools** in the `dh_tool` table.

