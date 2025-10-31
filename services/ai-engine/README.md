# VITAL AI Engine - FastAPI Service

FastAPI backend service for VITAL Path medical AI agent orchestration.

## Architecture

This service implements the Python AI/ML backend following the **Golden Rule**: All AI/ML services must be in Python and accessed via API Gateway.

**Request Flow:**
```
Frontend (Next.js) → API Gateway (Node.js) → Python AI Engine (FastAPI)
```

## Features

- 🤖 **Agent Orchestration**: Multi-agent system for medical AI experts
- 🔍 **RAG (Retrieval Augmented Generation)**: Knowledge base search and retrieval
- 📊 **Embedding Generation**: OpenAI and HuggingFace embeddings
- 🎯 **Agent Selection**: Intelligent agent matching based on queries
- 🎭 **Panel Orchestration**: Multi-expert advisory panel coordination
- 📝 **Metadata Extraction**: Smart document metadata extraction
- 🔄 **4 Interaction Modes**: Manual, Automatic, Autonomous workflows

## Project Structure

```
services/ai-engine/
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── start.py             # Startup script (reads PORT from env)
│   ├── core/                # Core configuration and utilities
│   │   ├── config.py        # Settings and configuration
│   │   ├── monitoring.py    # Metrics and monitoring
│   │   └── rag_config.py    # RAG configuration
│   ├── services/            # Business logic services
│   │   ├── agent_orchestrator.py      # Agent orchestration
│   │   ├── agent_selector_service.py  # Agent selection
│   │   ├── embedding_service_factory.py # Embedding services
│   │   ├── medical_rag.py              # Medical RAG pipeline
│   │   ├── unified_rag_service.py     # Unified RAG service
│   │   ├── supabase_client.py          # Supabase integration
│   │   ├── metadata_processing_service.py # Metadata extraction
│   │   └── ...                         # Other services
│   ├── agents/              # Agent implementations
│   │   ├── regulatory_expert.py
│   │   ├── medical_specialist.py
│   │   └── clinical_researcher.py
│   ├── models/              # Pydantic models
│   │   ├── requests.py      # Request models
│   │   └── responses.py      # Response models
│   └── tests/               # Test suite
├── requirements.txt         # Python dependencies
├── Dockerfile              # Production Docker image
├── .dockerignore           # Docker ignore patterns
├── start.py                # Startup script
└── README.md               # This file
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Agent Operations
- `POST /api/agents/query` - Query an agent
- `POST /api/agents/select` - Select best agent for query

### Interaction Modes
- `POST /api/mode1/manual` - Mode 1: Manual Interactive
- `POST /api/mode2/automatic` - Mode 2: Automatic Agent Selection
- `POST /api/mode3/autonomous-automatic` - Mode 3: Autonomous-Automatic
- `POST /api/mode4/autonomous-manual` - Mode 4: Autonomous-Manual

### Embeddings
- `POST /api/embeddings/generate` - Generate single embedding
- `POST /api/embeddings/generate/batch` - Generate batch embeddings

### Panel Operations
- `POST /api/panel/orchestrate` - Orchestrate multi-expert panel

### Chat Completions (OpenAI-compatible)
- `POST /v1/chat/completions` - Chat completion with streaming support

### Metadata
- `POST /api/metadata/extract` - Extract metadata from filename/content
- `POST /api/metadata/sanitize` - Sanitize content (remove PII/PHI)

## Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
PORT=8000                          # Server port (default: 8000)
LOG_LEVEL=info                    # Logging level
PYTHONUNBUFFERED=1                # Python output buffering
REDIS_URL=redis://localhost:6379  # Redis URL for caching
DATABASE_URL=your_database_url    # Database connection string
```

## Development

### Local Setup

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Run the server:**
   ```bash
   python src/main.py
   # Or use the startup script:
   python start.py
   ```

### Running Tests

```bash
pytest tests/ -v
```

## Docker Deployment

### Build Image

```bash
docker build -t vital-ai-engine:latest .
```

### Run Container

```bash
docker run -d \
  --name vital-ai-engine \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  vital-ai-engine:latest
```

### Using Docker Compose

```bash
# Using backend-only compose file
docker-compose -f docker-compose.python-only.yml up -d

# Or use the full compose file
docker-compose -f docker-compose.yml up -d python-ai-services
```

### Health Check

```bash
curl http://localhost:8000/health
```

## Production Deployment

### Docker Compose (Recommended)

1. **Create `.env` file with required variables**

2. **Start service:**
   ```bash
   docker-compose -f docker-compose.python-only.yml up -d
   ```

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.python-only.yml logs -f
   ```

4. **Stop service:**
   ```bash
   docker-compose -f docker-compose.python-only.yml down
   ```

### Kubernetes (Future)

Kubernetes deployment manifests will be added in the future for production scaling.

## Monitoring

- **Health Check**: `GET /health`
- **Metrics**: Prometheus metrics available at `/metrics` (if enabled)
- **Logs**: Structured JSON logging via structlog

## Troubleshooting

### Service won't start
- Check environment variables are set correctly
- Verify OpenAI API key is valid
- Ensure Supabase connection is working
- Check port 8000 is not in use

### High latency
- Check Redis connection (if caching enabled)
- Verify Supabase database performance
- Monitor OpenAI API rate limits
- Check network connectivity

### Memory issues
- Reduce `max_tokens` in requests
- Enable response streaming
- Monitor container memory limits

## License

Proprietary - VITAL Platform

## Support

For issues or questions, contact the VITAL Platform team.

