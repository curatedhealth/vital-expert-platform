# Getting Started with VITAL Platform

This guide will help you get VITAL Platform running locally in under 15 minutes.

## Prerequisites

- **Node.js** 20+ (with pnpm 8+)
- **Python** 3.11+
- **Docker** (optional, for containerized setup)
- **Supabase** account (for database)
- **OpenAI** API key

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/vital-path.git
cd vital-path

# Copy environment file
cp infrastructure/docker/env.example infrastructure/docker/.env
# Edit .env with your credentials

# Start services
make docker-up

# Verify
curl http://localhost:8000/health
```

### Option 2: Local Development

```bash
# Clone repository
git clone https://github.com/your-org/vital-path.git
cd vital-path

# Install dependencies
make install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Start development servers
make dev
```

## Environment Setup

### Required Variables

Create a `.env` file with:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# LLM
OPENAI_API_KEY=sk-your-key

# Auth
JWT_SECRET=your-32-character-secret
```

### Optional Variables

```bash
# Anthropic (for Claude)
ANTHROPIC_API_KEY=sk-ant-your-key

# Pinecone (for vector search)
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=us-east-1

# Redis (for caching)
REDIS_URL=redis://localhost:6379/0

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

## Verify Installation

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "uptime": 123.45
}
```

### Readiness Check

```bash
curl http://localhost:8000/ready
```

### Test Ask Expert

```bash
curl -X POST http://localhost:8000/api/expert/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mode": 1,
    "question": "What is a clinical trial?",
    "agent_id": null
  }'
```

## Project Structure

```
vital-path/
├── apps/
│   └── vital-system/        # Next.js frontend
├── services/
│   └── ai-engine/           # Python backend
├── packages/
│   └── protocol/            # Shared type definitions
├── database/
│   └── policies/            # RLS policies
├── infrastructure/
│   ├── docker/              # Docker configs
│   └── terraform/           # IaC
└── tests/
    ├── e2e/                 # Playwright tests
    └── performance/         # k6 load tests
```

## Common Commands

```bash
# Development
make dev                  # Start all services
make dev-api             # Start backend only
make dev-web             # Start frontend only

# Testing
make test                # Run all tests
make test-api            # Backend tests only

# Build
make build               # Build all packages
make docker-build        # Build Docker images

# Database
make db-migrate          # Run migrations
make db-seed             # Seed data
```

## Next Steps

1. **Explore the API**: See [API Reference](../api/openapi.yaml)
2. **Understand the Architecture**: Read [Architecture Overview](../architecture/overview.md)
3. **Set up Development**: Follow [Development Guide](development.md)
4. **Deploy**: See [Deployment Guide](deployment.md)

## Getting Help

- **Documentation**: Check `.claude/docs/` for detailed internal docs
- **Issues**: Open a GitHub issue
- **Team**: Reach out on Slack #vital-platform

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025






