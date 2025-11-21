# Tool Calling Setup Guide

**Last Updated**: 2025-10-03
**Status**: ✅ Implementation Complete
**Version**: 1.0

---

## 🎯 Overview

The Virtual Advisory Board experts can now use **4 powerful tools** to fetch real-time data:

1. **Web Search** (Tavily API) - Current information, clinical trials, FDA approvals
2. **Calculator** - Precise mathematical operations
3. **PubMed Search** - Peer-reviewed medical literature (FREE)
4. **Knowledge Base** - Internal company documents (RAG integration)

---

## 🚀 Quick Start

### Step 1: Get Tavily API Key (Required for Web Search)

1. Go to https://tavily.com
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`:

```bash
TAVILY_API_KEY=tvly-your-actual-api-key-here
```

**Free Tier**: 1,000 searches/month

### Step 2: Optional - LangSmith Tracing (Debugging)

For debugging LangChain agents and tool calls:

1. Go to https://smith.langchain.com
2. Sign up and get API key
3. Add to `.env.local`:

```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=ls__your-actual-api-key-here
LANGCHAIN_PROJECT=vital-advisory-board
```

### Step 3: Optional - RAG Knowledge Base

If you have an internal RAG system:

```bash
RAG_ENDPOINT=https://your-rag-endpoint.com/api
RAG_API_KEY=your-rag-api-key-here
```

---

## 📋 Current .env.local Configuration

Your `.env.local` file now includes:

```bash
# Tool Calling Configuration
TAVILY_API_KEY=your-tavily-api-key-here          # ← REPLACE THIS

# RAG Configuration (Optional)
# RAG_ENDPOINT=https://your-rag-endpoint.com/api
# RAG_API_KEY=your-rag-api-key-here

# LangSmith Tracing (Optional)
# LANGCHAIN_TRACING_V2=true
# LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
# LANGCHAIN_API_KEY=your-langsmith-api-key-here
# LANGCHAIN_PROJECT=vital-advisory-board
```

---

## 🛠️ Available Tools

### 1. Web Search Tool (`web_search`)

**Purpose**: Search for current information, news, clinical trials, FDA approvals
**API**: Tavily (requires API key)
**Cost**: Free tier - 1,000 searches/month

**Prioritized Domains**:
- clinicaltrials.gov
- fda.gov
- ema.europa.eu
- pubmed.ncbi.nlm.nih.gov
- nejm.org
- thelancet.com
- bmj.com

**Example Use**:
```
Question: "What are the latest FDA approvals for psoriasis biologics in 2024?"

Expert will automatically use web_search to find:
- Recent FDA approval letters
- Clinical trial data
- Regulatory guidance updates
```

### 2. Calculator Tool (`calculator`)

**Purpose**: Precise mathematical calculations
**API**: None (built-in)
**Cost**: Free

**Capabilities**:
- Basic arithmetic: `1500000 * 0.15`
- Math functions: `sqrt(100)`, `pow(2, 10)`
- Financial calculations: NPV, ROI, percentages
- Statistical operations: mean, median, standard deviation

**Example Use**:
```
Question: "What's the ROI if we invest $1.5M and expect 15% annual return?"

Expert will use calculator: "1500000 * 0.15" = $225,000
```

### 3. PubMed Search Tool (`pubmed_search`)

**Purpose**: Search peer-reviewed medical literature
**API**: PubMed E-utilities (FREE, no API key needed)
**Cost**: Free

**Example Use**:
```
Question: "What is the efficacy of biologics for moderate-to-severe psoriasis?"

Expert will search PubMed for:
- Clinical trials
- Systematic reviews
- Meta-analyses
- Recent publications
```

### 4. Knowledge Base Tool (`knowledge_base`)

**Purpose**: Query internal company documents
**API**: Your RAG system (Pinecone, Weaviate, Chroma, etc.)
**Cost**: Depends on your RAG provider

**Status**: Ready for integration (requires RAG_ENDPOINT configuration)

**Categories**:
- `clinical` - Clinical trial data
- `regulatory` - Regulatory submissions
- `commercial` - Market analysis
- `manufacturing` - CMC data
- `safety` - Safety reports
- `general` - General documents

---

## 🧪 Testing Tool Calling

### Test 1: Web Search (requires Tavily API key)

```bash
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "parallel",
    "question": "What are the latest FDA approvals for psoriasis biologics in 2024?",
    "personas": ["Regulatory Affairs Expert", "Clinical Development Lead"]
  }'
```

Expected: Experts will use `web_search` tool to find current FDA data

### Test 2: Calculator

```bash
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "parallel",
    "question": "If we price at $50,000/year and capture 15% market share of 100,000 patients, what is projected revenue?",
    "personas": ["Health Economics Expert", "Commercial Strategy Lead"]
  }'
```

Expected: Experts will use `calculator` tool: `50000 * 0.15 * 100000`

### Test 3: PubMed Search (no API key needed)

```bash
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "parallel",
    "question": "What is the clinical evidence for IL-17 inhibitors in psoriasis?",
    "personas": ["Medical Affairs Expert", "Clinical Research Director"]
  }'
```

Expected: Experts will search PubMed for peer-reviewed studies

---

## 📊 Monitor Tool Usage

### View Tool Statistics

```bash
curl http://localhost:3000/api/panel/tools
```

**Response**:
```json
{
  "success": true,
  "stats": [
    {
      "toolName": "web_search",
      "callCount": 15,
      "totalDuration": 4500,
      "avgDuration": 300,
      "successRate": 0.93
    },
    {
      "toolName": "calculator",
      "callCount": 8,
      "totalDuration": 240,
      "avgDuration": 30,
      "successRate": 1.0
    }
  ],
  "totalCalls": 23
}
```

### View Specific Tool Calls

```bash
curl http://localhost:3000/api/panel/tools?toolName=web_search
```

### Reset Statistics

```bash
curl -X DELETE http://localhost:3000/api/panel/tools
```

---

## 🔍 How Tool Calling Works

### Architecture

```
User Question
    ↓
LangGraph Orchestrator
    ↓
Expert Agent (LangChain Agent Executor)
    ↓
Decision: Do I need tools?
    ↓
[YES] → Call tools → Synthesize with tool outputs → Answer
[NO]  → Direct LLM response → Answer
```

### Expert Decision Process

Experts automatically decide when to use tools:

1. **Current/Recent Information?** → Use `web_search` or `pubmed_search`
2. **Precise Calculation?** → Use `calculator`
3. **Internal Company Data?** → Use `knowledge_base`
4. **General Knowledge?** → Direct LLM response

### Tool Call Transparency

Every tool call is tracked:
```json
{
  "persona": "Regulatory Affairs Expert",
  "text": "Based on recent FDA approvals...",
  "confidence": 0.85,
  "toolCalls": [
    {
      "toolName": "web_search",
      "input": { "query": "FDA psoriasis biologic approvals 2024" },
      "output": "Found 3 recent approvals...",
      "timestamp": "2025-10-03T10:30:00Z",
      "duration": 320
    }
  ]
}
```

---

## ⚙️ Configuration Options

### Max Iterations (Prevent Infinite Loops)

Default: 5 iterations per expert

To change, edit `langgraph-orchestrator.ts`:
```typescript
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 10, // ← Change here
  returnIntermediateSteps: true
});
```

### Enable/Disable Specific Tools

Edit `expert-tools.ts`:
```typescript
export const getAllExpertTools = () => {
  return [
    createWebSearchTool(),
    createCalculatorTool(),
    // createKnowledgeBaseTool(), // ← Comment out to disable
    createPubMedSearchTool()
  ];
};
```

---

## 🚨 Troubleshooting

### Issue: "Tavily API key not configured"

**Cause**: TAVILY_API_KEY not set in `.env.local`

**Fix**:
1. Get API key from https://tavily.com
2. Add to `.env.local`: `TAVILY_API_KEY=tvly-your-key`
3. Restart dev server

**Graceful Fallback**: Experts will still answer using general knowledge

### Issue: Tool calls fail

**Cause**: Network error, API timeout, or invalid API key

**Fix**:
1. Check API key validity
2. Check network connectivity
3. Review LangSmith traces (if enabled)

**Graceful Fallback**: System falls back to simple LLM without tools

### Issue: Experts not using tools

**Possible Causes**:
1. Question doesn't require real-time data
2. Expert has sufficient knowledge
3. Tool use disabled in prompt

**Verification**:
- Enable LangSmith tracing to see agent reasoning
- Check tool usage stats: `GET /api/panel/tools`

---

## 📈 Performance Tips

### 1. Use PubMed for Medical Literature (Free)

Instead of paying for web search for medical topics, PubMed is free and comprehensive.

### 2. Enable LangSmith for Debugging

Essential for understanding why tools are/aren't being used:
```bash
LANGCHAIN_TRACING_V2=true
```

### 3. Monitor Tool Usage

Regularly check `/api/panel/tools` to:
- Track API costs
- Identify most-used tools
- Optimize tool selection

### 4. Set Reasonable maxIterations

Too high = slow responses + high costs
Too low = incomplete reasoning
Sweet spot = 3-5 iterations

---

## 📊 Cost Analysis

### Free Tools
- ✅ **Calculator**: Free, unlimited
- ✅ **PubMed Search**: Free, unlimited (E-utilities API)

### Paid Tools
- 💰 **Tavily Web Search**:
  - Free tier: 1,000 searches/month
  - Pro: $49/month for 10,000 searches
  - Enterprise: Custom pricing

- 💰 **LangSmith Tracing** (Optional):
  - Free tier: 5,000 traces/month
  - Plus: $39/month for 50,000 traces

- 💰 **RAG Knowledge Base**:
  - Depends on your provider (Pinecone, Weaviate, etc.)

### Cost Optimization
1. Use PubMed instead of web search for medical queries
2. Use calculator for all mathematical operations
3. Cache frequently-used search results
4. Monitor usage via `/api/panel/tools`

---

## 🎓 Next Steps

### 1. Get Tavily API Key
Sign up at https://tavily.com and add to `.env.local`

### 2. Test Tool Calling
Run the test queries above to verify everything works

### 3. Monitor Usage
Check `/api/panel/tools` after running sessions

### 4. Optional: Setup LangSmith
For debugging and optimization

### 5. Optional: Integrate RAG
Connect your internal knowledge base

---

## 📝 Summary

✅ **4 tools implemented**: web_search, calculator, pubmed_search, knowledge_base
✅ **Automatic tool selection**: Experts decide when to use tools
✅ **Full transparency**: All tool calls tracked and visible
✅ **Graceful fallback**: System works even if tools fail
✅ **Production-ready**: Error handling, logging, monitoring

**Next**: Replace `your-tavily-api-key-here` in `.env.local` with your actual API key and test!

---

**File**: [TOOL_CALLING_SETUP_GUIDE.md](TOOL_CALLING_SETUP_GUIDE.md)
**Last Updated**: 2025-10-03
**Owner**: Development Team
