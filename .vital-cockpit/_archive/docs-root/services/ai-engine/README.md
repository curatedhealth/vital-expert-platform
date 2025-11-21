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
├── src/                           # Source code
│   ├── main.py                    # FastAPI application entry point
│   ├── core/                      # Core configuration and utilities
│   │   ├── config.py              # Settings and configuration
│   │   ├── monitoring.py          # Metrics and monitoring
│   │   ├── rag_config.py          # RAG configuration
│   │   └── websocket_manager.py   # WebSocket management
│   ├── services/                  # Business logic services (30+ services)
│   │   ├── agent_orchestrator.py
│   │   ├── agent_selector_service.py
│   │   ├── embedding_service_factory.py
│   │   ├── medical_rag.py
│   │   ├── unified_rag_service.py
│   │   ├── supabase_client.py
│   │   ├── metadata_processing_service.py
│   │   └── ...
│   ├── langgraph_workflows/       # LangGraph workflow implementations
│   │   ├── mode1_enhanced_workflow.py
│   │   ├── mode2_interactive_manual_workflow.py
│   │   ├── mode3_autonomous_auto_workflow.py
│   │   ├── mode4_autonomous_manual_workflow.py
│   │   └── state_schemas.py
│   ├── agents/                    # Agent implementations
│   │   ├── regulatory_expert.py
│   │   ├── medical_specialist.py
│   │   └── clinical_researcher.py
│   ├── tools/                     # LangChain tools
│   │   ├── rag_tool.py
│   │   ├── web_tools.py
│   │   └── medical_research_tools.py
│   ├── models/                    # Pydantic models
│   │   ├── requests.py
│   │   └── responses.py
│   ├── middleware/                # FastAPI middleware
│   │   ├── tenant_isolation.py
│   │   ├── rate_limiting.py
│   │   └── admin_auth.py
│   └── tests/                     # Test suite (153 tests)
├── tests/                         # Organized test suite
│   ├── integration/               # Integration tests
│   ├── unit/                      # Unit tests
│   ├── security/                  # Security tests (RLS, tenant isolation)
│   ├── workflows/                 # Workflow tests
│   └── api/                       # API endpoint tests
├── archive/                       # Historical documentation and scripts
│   ├── docs/                      # 170+ archived docs
│   │   ├── deployment/            # Deployment guides
│   │   ├── audits/                # Quality audits
│   │   ├── implementation/        # Feature implementation docs
│   │   ├── planning/              # Project plans
│   │   └── status/                # Status reports
│   ├── scripts/                   # Legacy scripts
│   └── tests/                     # Root-level test files
├── data/                          # Data files
│   └── checkpoints/               # LangGraph checkpoints
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Production Docker image
├── railway.toml                   # Railway deployment config
├── start.py                       # Production startup script
├── start_minimal.py               # Diagnostic server (debugging)
├── pytest.ini                     # Pytest configuration
├── README.md                      # This file
└── FRONTEND_BACKEND_CONNECTION.md # Current setup documentation
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

## Documentation

### Active Documentation
- **README.md** - This file (main documentation)
- **FRONTEND_BACKEND_CONNECTION.md** - Current frontend-backend setup

### Archived Documentation
All historical documentation is organized in `archive/`:
- **archive/docs/deployment/** - 50+ deployment guides (Railway, Docker, Modal, etc.)
- **archive/docs/audits/** - 30+ quality and compliance audits
- **archive/docs/implementation/** - 40+ feature implementation docs
- **archive/docs/planning/** - 20+ project plans and execution guides
- **archive/docs/status/** - 20+ status reports and checklists
- **archive/scripts/** - 15+ deployment and utility scripts
- **archive/tests/** - Root-level test files

See `archive/README.md` for complete documentation index.

## Database Migrations

Database migrations are organized in `database/migrations/`:
- **rls/** - Row-Level Security migrations
- **seeds/use-cases/** - 30 use cases (RA, CD, MA)
- **seeds/tools/** - 35+ tool registry seeds
- **seeds/workflows/** - Workflow and prompt seeds

See `database/migrations/README.md` for migration guide.

## License

Proprietary - VITAL Platform

## Support

For issues or questions, contact the VITAL Platform team.

