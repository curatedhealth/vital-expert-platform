# Development Guide

Detailed guide for setting up a local development environment.

## Prerequisites

### Required

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Frontend & Protocol |
| pnpm | 8+ | Package manager |
| Python | 3.11+ | Backend |
| Git | 2.30+ | Version control |

### Optional

| Tool | Purpose |
|------|---------|
| Docker | Containerized development |
| Redis | Local caching |
| k6 | Performance testing |

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/vital-path.git
cd vital-path
```

### 2. Install Node Dependencies

```bash
pnpm install
```

### 3. Install Python Dependencies

```bash
cd services/ai-engine
pip install -r requirements.txt
cd ../..
```

### 4. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Development Workflow

### Starting Services

```bash
# All services
make dev

# Frontend only
make dev-web

# Backend only
make dev-api

# Workers (in separate terminal)
make dev-worker
```

### Type Synchronization

When you modify Protocol schemas:

```bash
# Regenerate all types
make sync-types

# Or step by step:
make generate-json-schemas  # Zod → JSON Schema
make generate-pydantic      # JSON Schema → Pydantic
```

### Running Tests

```bash
# All tests
make test

# Frontend tests
pnpm test

# Backend tests
cd services/ai-engine
pytest tests/ -v

# E2E tests
cd tests/e2e
pnpm test
```

### Code Quality

```bash
# Lint
make lint

# Format
make format

# Type check
make typecheck
```

## Architecture

### Backend Layers

```
services/ai-engine/src/
├── api/                 # FastAPI routes & middleware
├── modules/             # Business logic modules
├── domain/              # Entities & services
├── workers/             # Celery tasks
├── infrastructure/      # External integrations
└── core/                # Shared utilities
```

### Frontend Structure

```
apps/vital-system/src/
├── app/                 # Next.js App Router pages
├── features/            # Feature modules
├── components/          # Shared components
├── lib/                 # Utilities & hooks
└── styles/              # Global styles
```

## Database

### Migrations

```bash
# Create new migration
make db-migrate-new

# Apply migrations
make db-migrate

# Seed data
make db-seed
```

### RLS Policies

```bash
# Apply all policies
make db-policies
```

## Docker Development

### Build

```bash
make docker-build
```

### Run

```bash
# Basic (API + Workers + Redis)
make docker-up

# Full stack (includes frontend)
make docker-up-full

# With local PostgreSQL
make docker-up-local-db
```

### Logs

```bash
make docker-logs        # All services
make docker-logs-api    # API only
make docker-logs-workers # Workers only
```

## Debugging

### Backend

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use debugpy for VS Code
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()
```

### Frontend

```javascript
// Browser DevTools
debugger;

// React Query DevTools (automatically included)
```

### VS Code Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["src.main:app", "--reload"],
      "cwd": "${workspaceFolder}/services/ai-engine"
    },
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/apps/vital-system",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"]
    }
  ]
}
```

## Common Issues

### Port Already in Use

```bash
# Find process
lsof -i :8000

# Kill it
kill -9 <PID>
```

### Python Import Errors

```bash
# Ensure PYTHONPATH is set
export PYTHONPATH="${PYTHONPATH}:$(pwd)/services/ai-engine/src"
```

### Node Module Issues

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Redis Connection

```bash
# Start Redis locally
docker run -d -p 6379:6379 redis:7-alpine

# Or use Docker Compose
make docker-up
```

## Contributing

1. Create feature branch from `develop`
2. Make changes with tests
3. Run `make lint` and `make test`
4. Create PR with description
5. Get review and merge

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025






