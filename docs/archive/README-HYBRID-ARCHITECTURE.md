# VITAL Path - Hybrid 3-Tier Architecture Implementation

## Overview

VITAL Path has been successfully upgraded to a hybrid 3-tier architecture that combines the best of TypeScript/Node.js and Python ecosystems for optimal medical AI performance.

## Architecture Components

### 🎯 Frontend Tier - TypeScript/Next.js
- **Technology**: Next.js 14 with TypeScript
- **Port**: 3002
- **Responsibilities**:
  - User interface and experience
  - Real-time WebSocket connections
  - Client-side routing and state management
  - Authentication and session management

### 🚪 Gateway Tier - Node.js Express
- **Technology**: Node.js with Express and Socket.IO
- **Port**: 3001
- **Responsibilities**:
  - API Gateway and request routing
  - WebSocket connection management
  - Authentication middleware
  - Request/response transformation
  - Rate limiting and security
  - Metrics collection and monitoring

### 🧠 AI Services Tier - Python FastAPI
- **Technology**: Python FastAPI with LangChain
- **Port**: 8000
- **Responsibilities**:
  - Medical AI agent orchestration
  - RAG pipeline with Supabase vector storage
  - LLM integration (OpenAI, Claude)
  - Medical compliance protocols (PHARMA/VERIFY)
  - Advanced NLP and embedding generation

## Key Features

### ✅ Hybrid Benefits
- **Best of Both Worlds**: TypeScript for frontend/gateway, Python for AI
- **Optimized Performance**: Each tier uses the most suitable technology
- **Scalable Architecture**: Independent scaling of each component
- **Technology Specialization**: Python's AI ecosystem + TypeScript's web ecosystem

### 🏥 Medical AI Capabilities
- **Advanced RAG Pipeline**: Supabase vector storage with medical context awareness
- **Compliance Protocols**: PHARMA and VERIFY protocols for medical accuracy
- **Multi-Model Support**: OpenAI GPT-4, Claude, and other medical-specialized models
- **Medical Validation**: Evidence-based responses with citation quality scoring

### 🔒 Security & Compliance
- **HIPAA Compliance**: End-to-end encrypted medical data handling
- **FDA 21 CFR Part 11**: Complete audit trails for medical decisions
- **Organization Scoping**: Multi-tenant architecture with data isolation
- **Row-Level Security**: Supabase RLS for data protection

### 🚀 Real-Time Features
- **WebSocket Support**: Real-time agent communication
- **Live Monitoring**: System health and performance metrics
- **Streaming Responses**: Progressive response delivery
- **Session Management**: Persistent agent sessions

## API Endpoints

### New Hybrid Endpoints

#### Agent Query (Hybrid)
```typescript
POST /api/agents/query-hybrid
```
Enhanced medical AI agent queries with Python backend processing.

#### RAG Search (Hybrid)
```typescript
POST /api/rag/search-hybrid
```
Medical document search using Python RAG pipeline with Supabase vectors.

#### Prompt Generation (Hybrid)
```typescript
POST /api/prompts/generate-hybrid
```
Medical-grade system prompt generation with compliance protocols.

### Legacy Endpoints
All existing endpoints remain functional for backward compatibility.

## Docker Configuration

### Development Setup
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Services available:
# - Frontend: http://localhost:3002
# - Gateway: http://localhost:3001
# - Python AI: http://localhost:8000
# - Redis: localhost:6379
# - Monitoring: http://localhost:3000 (Grafana)
```

### Production Deployment
```bash
# Start production environment
docker-compose up -d

# Includes:
# - Nginx load balancer
# - Prometheus metrics
# - Grafana dashboards
# - Jaeger tracing
# - Automated backups
```

## Environment Variables

### Required for All Tiers
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_url

# AI Services
OPENAI_API_KEY=your_openai_key

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Security
JWT_SECRET=your_jwt_secret
```

### Gateway Specific
```env
GATEWAY_PORT=3001
PYTHON_SERVICE_URL=http://python-ai-services:8000
CORS_ORIGINS=http://localhost:3002,http://localhost:3000
```

### Python AI Services Specific
```env
VECTOR_DIMENSION=1536
MEDICAL_ACCURACY_THRESHOLD=0.95
PHARMA_PROTOCOL_ENABLED=true
VERIFY_PROTOCOL_ENABLED=true
MAX_CONCURRENT_AGENTS=10
```

## File Structure

```
VITAL Path/
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents/query-hybrid/    # Hybrid agent endpoints
│   │   │   ├── rag/search-hybrid/      # Hybrid RAG endpoints
│   │   │   └── prompts/generate-hybrid/ # Hybrid prompt endpoints
│   │   └── (app)/                      # Frontend pages
│   └── shared/                         # Shared components & services
├── backend/
│   ├── node-gateway/                   # Node.js API Gateway
│   │   ├── src/
│   │   │   ├── services/              # Gateway services
│   │   │   ├── websocket/             # WebSocket management
│   │   │   └── middleware/            # Auth & validation
│   │   └── Dockerfile
│   └── python-ai-services/            # Python AI Backend
│       ├── main.py                    # FastAPI application
│       ├── services/                  # AI services
│       │   ├── agent_orchestrator.py  # Agent management
│       │   ├── medical_rag.py         # RAG pipeline
│       │   └── supabase_client.py     # Vector DB client
│       ├── models/                    # Pydantic models
│       └── Dockerfile
├── docker-compose.yml                 # Production config
├── docker-compose.dev.yml             # Development config
└── README-HYBRID-ARCHITECTURE.md     # This file
```

## Migration from Pinecone to Supabase

The hybrid architecture replaces Pinecone with Supabase for vector storage:

### ✅ Advantages
- **Cost Effective**: No separate vector database fees
- **Unified Storage**: Documents and vectors in same database
- **Better Integration**: Native PostgreSQL with pgvector extension
- **Compliance**: Better HIPAA and SOC2 compliance
- **Performance**: Reduced latency with co-located data

### 🔄 Migration Process
1. Vector embeddings now stored in Supabase `vecs` schema
2. Medical documents indexed with enhanced metadata
3. Search performance optimized with proper indexing
4. Organization-level data isolation maintained

## Monitoring & Observability

### 📊 Metrics (Prometheus)
- Request rates and latencies across all tiers
- AI model performance and accuracy scores
- Vector search performance
- WebSocket connection metrics
- Medical compliance audit metrics

### 📈 Dashboards (Grafana)
- System health overview
- AI agent performance
- Medical query analytics
- User engagement metrics
- Compliance monitoring

### 🔍 Tracing (Jaeger)
- End-to-end request tracing
- AI processing pipeline visibility
- Performance bottleneck identification
- Error propagation tracking

## Performance Optimizations

### 🚀 Speed Improvements
- **Parallel Processing**: Multiple tiers working concurrently
- **Caching**: Redis caching for frequent queries
- **Connection Pooling**: Optimized database connections
- **Vector Indexing**: Efficient similarity search

### 📈 Scalability Features
- **Horizontal Scaling**: Each tier scales independently
- **Load Balancing**: Nginx distribution across instances
- **Session Stickiness**: WebSocket session management
- **Background Processing**: Async task queues

## Medical AI Enhancements

### 🏥 Advanced Medical Features
- **Multi-Specialty Support**: Regulatory, Clinical, Pharmacovigilance
- **Evidence Grading**: Automatic evidence level assessment
- **Citation Quality**: Impact factor and peer-review validation
- **Confidence Scoring**: AI confidence with medical context
- **Regulatory Compliance**: PHARMA/VERIFY protocol integration

### 🔬 AI Model Integration
- **OpenAI GPT-4**: Primary reasoning and generation
- **Text Embeddings**: Advanced vector representations
- **Medical Models**: Specialized healthcare LLMs
- **Custom Fine-tuning**: Organization-specific model adaptation

## Development Workflow

### 🛠️ Local Development
```bash
# 1. Start hybrid development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 2. Frontend development (with hot reload)
cd src && npm run dev

# 3. Gateway development
cd backend/node-gateway && npm run dev

# 4. Python AI development
cd backend/python-ai-services && uvicorn main:app --reload
```

### 🧪 Testing
```bash
# Frontend tests
npm run test

# Gateway tests
cd backend/node-gateway && npm test

# Python tests
cd backend/python-ai-services && pytest

# Integration tests
docker-compose -f docker-compose.test.yml up
```

### 🚀 Deployment
```bash
# Production build
docker-compose build

# Deploy to production
docker-compose up -d

# Health checks
curl http://localhost/health
curl http://localhost:3001/health
curl http://localhost:8000/health
```

## Next Steps

### 🔄 Immediate
1. Test all hybrid endpoints with existing frontend
2. Migrate existing agent configurations to Python backend
3. Set up monitoring dashboards
4. Configure production environment variables

### 📈 Future Enhancements
1. **Multi-Model Support**: Add Claude, Cohere, and other models
2. **Advanced RAG**: Implement graph-based knowledge retrieval
3. **Federated Learning**: Multi-organization model training
4. **Edge Deployment**: Offline medical AI capabilities

## Troubleshooting

### Common Issues

#### Gateway Connection Issues
```bash
# Check Python service health
curl http://localhost:8000/health

# Check gateway logs
docker-compose logs node-gateway
```

#### Vector Search Problems
```bash
# Check Supabase connection
docker-compose logs python-ai-services

# Verify vector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

#### WebSocket Issues
```bash
# Check WebSocket connections
docker-compose logs node-gateway | grep websocket

# Test WebSocket endpoint
wscat -c ws://localhost:3001/ws/agents/test
```

## Support

For technical support or questions about the hybrid architecture:

1. **Documentation**: Check this README and API documentation
2. **Logs**: Review Docker Compose logs for each service
3. **Monitoring**: Use Grafana dashboards for system health
4. **Issues**: Create GitHub issues for bugs or feature requests

---

**VITAL Path Hybrid Architecture v2.0** - Combining TypeScript and Python for optimal medical AI performance.