# VITAL Expert Consultation - Autonomous Agent Enhancement

## Overview

This implementation provides world-class autonomous agent capabilities for VITAL's Ask Expert service, featuring:

- **Real-time Reasoning Transparency**: Live streaming of agent thinking process
- **Comprehensive Tool Integration**: Access to all 30 RAG domains and 254+ expert agents
- **Cost Management**: Real-time budget tracking and prediction
- **Execution Control**: Pause, resume, and intervention capabilities
- **Production-Grade**: Full error handling, session persistence, and analytics

## Architecture

```
Frontend (Next.js/TypeScript) ←→ Node Gateway ←→ Python AI Backend
                                      ↓
                              PostgreSQL + Redis
```

## Features Implemented

### ✅ Core Components
- [x] Python FastAPI backend with LangGraph
- [x] Enhanced ReAct reasoning pattern
- [x] Real-time SSE streaming
- [x] Comprehensive tool registry (FDA, PubMed, Clinical Trials, etc.)
- [x] Strategic tool selection with domain awareness
- [x] Cost tracking and budget management
- [x] TypeScript Node.js gateway
- [x] React frontend components
- [x] Session management and persistence
- [x] Docker deployment configuration

### ✅ Knowledge Integration
- [x] All 30 RAG knowledge domains
- [x] Agent store with 254+ specialized agents
- [x] Domain-aware tool selection
- [x] Multi-source evidence synthesis

### ✅ User Experience
- [x] Live reasoning display
- [x] Cost tracking dashboard
- [x] Execution control panel
- [x] Session history
- [x] Real-time progress indicators

## Quick Start

### 1. Environment Setup

```bash
# Copy environment file
cp backend/python-ai-services/expert_consultation/env.example backend/python-ai-services/expert_consultation/.env

# Edit with your API keys
nano backend/python-ai-services/expert_consultation/.env
```

### 2. Database Setup

```bash
# Run migrations
psql -h localhost -U vital -d vital_expert_consultation -f supabase/migrations/20250118_expert_consultation_tables.sql
```

### 3. Start Services

```bash
# Start Python backend
cd backend/python-ai-services/expert_consultation
pip install -r requirements.txt
uvicorn expert_consultation.main:app --host 0.0.0.0 --port 8001

# Start Node gateway (in another terminal)
cd backend/node-gateway
npm install
npm run dev

# Start frontend (in another terminal)
npm run dev
```

### 4. Docker Deployment

```bash
# Start all services
docker-compose -f docker-compose.expert-consultation.yml up -d

# View logs
docker-compose -f docker-compose.expert-consultation.yml logs -f expert-consultation
```

## API Endpoints

### Consultation
- `POST /expert/execute` - Start consultation
- `GET /expert/status/{sessionId}` - Get status
- `GET /expert/history/{userId}` - Get user history

### Streaming
- `GET /expert/stream/{sessionId}` - Stream reasoning (SSE)
- `POST /expert/stream/{sessionId}/subscribe` - Subscribe to stream

### Control
- `POST /expert/control/{sessionId}/pause` - Pause execution
- `POST /expert/control/{sessionId}/resume` - Resume execution
- `POST /expert/control/{sessionId}/stop` - Stop execution

### Analytics
- `GET /expert/analytics/{sessionId}` - Get session analytics
- `GET /expert/analytics/performance/overview` - Get performance metrics

## Usage Examples

### Start a Consultation

```typescript
const response = await fetch('/api/ask-expert/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the regulatory requirements for a Phase III oncology trial?",
    expert_type: "regulatory-strategy",
    business_context: {
      company_size: "50-200 employees",
      therapeutic_area: "Oncology",
      development_stage: "Phase II"
    },
    user_id: "user-123",
    reasoning_mode: "react",
    budget: 15.0,
    max_iterations: 5
  })
});

const { session_id, stream_url } = await response.json();
```

### Stream Reasoning

```typescript
const eventSource = new EventSource(`/api/ask-expert/stream/${sessionId}`);

eventSource.addEventListener('reasoning_step', (event) => {
  const step = JSON.parse(event.data);
  console.log('New reasoning step:', step);
});

eventSource.addEventListener('execution_complete', () => {
  console.log('Consultation completed');
  eventSource.close();
});
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `SUPABASE_URL` | Supabase URL | Required |
| `SUPABASE_KEY` | Supabase service key | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `DEFAULT_BUDGET` | Default consultation budget | `10.0` |
| `MAX_ITERATIONS` | Maximum reasoning iterations | `10` |

### Cost Management

The system includes comprehensive cost tracking:

- Real-time cost monitoring
- Budget warnings at 90% and 95%
- Cost breakdown by reasoning phase
- Token usage tracking
- Automatic execution pause on budget exceeded

### Tool Integration

All tools are automatically selected based on:

- Query domain detection
- Expert type requirements
- Available evidence sources
- Cost optimization

## Monitoring

### Health Checks

```bash
# Check Python service
curl http://localhost:8001/health

# Check Node gateway
curl http://localhost:3000/api/health
```

### Logs

```bash
# Python service logs
docker-compose logs -f expert-consultation

# All services
docker-compose logs -f
```

## Development

### Running Tests

```bash
# Python tests
cd backend/python-ai-services/expert_consultation
pytest tests/

# TypeScript tests
npm test
```

### Code Structure

```
backend/python-ai-services/expert_consultation/
├── main.py                    # FastAPI app
├── state.py                   # LangGraph state definitions
├── graphs/
│   └── react_graph.py        # ReAct implementation
├── streaming/
│   └── reasoning_streamer.py # SSE streaming
├── tools/
│   ├── comprehensive_registry.py
│   └── strategic_selector.py
├── knowledge/
│   ├── rag_connector.py
│   └── agent_store_connector.py
├── cost/
│   └── cost_tracker.py
└── routes/
    ├── consultation.py
    ├── streaming.py
    ├── control.py
    ├── sessions.py
    └── analytics.py

src/features/expert-consultation/
├── components/
│   ├── ConsultationForm.tsx
│   ├── LiveReasoningView.tsx
│   ├── CostTracker.tsx
│   └── ExecutionControlPanel.tsx
└── hooks/
    ├── useReasoningStream.ts
    └── useExecutionControl.ts
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure all services are running
2. **Stream not working**: Check CORS settings and SSE support
3. **High costs**: Adjust budget and iteration limits
4. **Slow performance**: Check Redis and database connections

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Start with debug
uvicorn expert_consultation.main:app --reload --log-level debug
```

## Support

For issues and questions:

1. Check the logs for error messages
2. Verify environment variables
3. Test individual components
4. Review the API documentation

## License

This implementation is part of the VITAL platform and follows the same licensing terms.
