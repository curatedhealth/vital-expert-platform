# Ask Expert Environment Setup Guide

## Required Environment Variables

Add these environment variables to your Vercel project settings:

### OpenAI Configuration
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### LangChain Tracing (Optional but Recommended)
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-api-key-here
LANGCHAIN_PROJECT=vital-advisory-board
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

### Tavily Web Search
```bash
TAVILY_API_KEY=your-tavily-api-key-here
```

### HuggingFace (for embeddings)
```bash
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

### Supabase (Already Configured)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project: `vital-expert`
3. Go to Settings → Environment Variables
4. Add each variable above with the corresponding value
5. Make sure to set them for "Production" environment
6. Redeploy your project

## Testing the Implementation

### Phase 1: Manual Expert Selection + Basic Chat
- ✅ Agent selection from 372 agents works
- ✅ Messages stream correctly via `/api/ask-expert`
- ✅ Chat history persists per session
- ✅ Agent personality reflected in responses

### Phase 2: Autonomous Research with LangChain
- ✅ Tools execute correctly (FDA, clinical trials, PubMed, etc.)
- ✅ RAG retrieval works with all 5 strategies
- ✅ Structured outputs parse correctly
- ✅ Token tracking logs to database
- ✅ Long-term memory learns from conversations

### Phase 3: Automatic Orchestration
- ✅ Tier 1 (Fast AI) responds quickly
- ✅ Escalation to Tier 2 when confidence low
- ✅ Escalation to Tier 3 for complex queries
- ✅ Escalation history tracked
- ✅ Budget checks work at each tier

## API Endpoints Available

### Basic Chat
- `POST /api/ask-expert` - Basic agent chat with streaming

### Advanced LangChain
- `POST /api/chat/langchain-enhanced` - Enhanced conversational chain with memory
- `GET /api/chat/langchain-enhanced` - Retrieve memory
- `DELETE /api/chat/langchain-enhanced` - Clear memory

### Autonomous Research
- `POST /api/chat/autonomous` - Full autonomous agent with tools

### Memory Management
- `POST /api/migrate-memory` - Create long-term memory tables

## Features Implemented

### Core Chat Components
- Enhanced chat input with agent-aware features
- Streaming chat messages with real-time updates
- Agent selection and switching
- Chat history persistence

### LangChain Integration
- ConversationalRetrievalQAChain with memory
- BufferWindowMemory (last 10 messages)
- Token tracking callbacks
- LangSmith tracing integration

### Tools Available
- FDA Database Search
- FDA Guidance Lookup
- Regulatory Calculator
- Clinical Trials Search
- Study Design Helper
- Endpoint Selector
- Tavily Web Search
- PubMed Literature Search
- ArXiv Research Papers

### Advanced Retrievers
- Multi-Query Retriever
- Compression Retriever
- Hybrid Retriever (vector + keyword + domain)
- Self-Query Retriever
- RAG Fusion (reciprocal rank fusion)

### Memory Systems
- Buffer Window Memory (fast)
- Conversation Summary Memory (summarizes old)
- Vector Store Memory (semantic search)
- Hybrid Memory (buffer + vector)
- Entity Memory (tracks devices, trials, patients)

### Orchestration Services
- LangGraph workflow for Ask Expert
- Three-tier escalation system (Fast AI → Expert AI → Complex/Human)
- Confidence-based routing
- Budget checking at each tier
- Escalation logging

## Next Steps

1. Add the environment variables to Vercel
2. Test all three modes (Manual, Autonomous, Automatic)
3. Verify LangSmith traces are working
4. Monitor token usage and costs
5. Test long-term memory learning across sessions

## Troubleshooting

### Common Issues
1. **"No response" errors**: Check if API keys are properly set
2. **Memory not persisting**: Verify database migrations ran successfully
3. **Tools not working**: Check Tavily and HuggingFace API keys
4. **LangSmith not showing traces**: Verify LangChain API key and project name

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in the console.
