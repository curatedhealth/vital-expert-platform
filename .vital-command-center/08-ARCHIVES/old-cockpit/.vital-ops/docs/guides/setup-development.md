# Setup Development Environment

Complete guide to setting up your VITAL platform development environment.

## Prerequisites

### Required Software

- **Node.js**: v18+ (LTS recommended)
- **pnpm**: v8+
- **Python**: 3.11+
- **PostgreSQL**: 15+
- **Docker**: Latest stable
- **Git**: Latest stable

### Optional Tools

- **kubectl**: For Kubernetes development
- **terraform**: For infrastructure work
- **psql**: PostgreSQL client

## Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/vital-platform.git
cd vital-platform
```

### 2. Quick Setup (Automated)

```bash
# Run automated setup
cd .vital-cockpit/.vital-ops
./bin/setup-environment dev

# This will:
# - Install dependencies
# - Setup database
# - Configure environment
# - Start services
```

### 3. Manual Setup (Step-by-Step)

If you prefer manual setup or the automated script fails:

#### 3.1 Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd .vital-cockpit/.vital-ops/services/ai-engine
pip install -r requirements.txt
```

#### 3.2 Configure Environment

```bash
# Copy environment template
cp .vital-cockpit/.vital-ops/config/environments/.env.dev.example .env.dev

# Edit configuration
vi .env.dev

# Required variables:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - OPENAI_API_KEY
```

#### 3.3 Setup Database

```bash
# Start PostgreSQL (via Docker)
cd .vital-cockpit/.vital-ops/infrastructure/docker
docker-compose up -d postgres

# Run migrations
cd ../..
./scripts/database/migrations/run-all.sh

# Seed development data
./scripts/database/seeds/seed-dev.sh
```

#### 3.4 Start Services

```bash
# Start all services
./bin/start-services

# Or start individually:
cd apps/web && pnpm dev                          # Frontend
cd .vital-cockpit/.vital-ops/services/ai-engine && ./start-dev.sh  # Backend
```

## Verification

### Check Installation

```bash
# Run health check
./bin/health-check

# Expected output:
# ✅ Database: Connected
# ✅ AI Engine: Running on port 8000
# ✅ Frontend: Running on port 3000
# ✅ All systems operational
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run integration tests
./scripts/testing/integration/run-all.sh
```

### Access Application

- **Frontend**: http://localhost:3000
- **AI Engine**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Common Issues

### Issue: Database Connection Fails

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check DATABASE_URL in .env.dev
echo $DATABASE_URL

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Issue: Dependencies Won't Install

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install

# For Python
pip cache purge
pip install -r requirements.txt --force-reinstall
```

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Run migrations
./bin/run-migrations

# 4. Start development servers
./bin/start-services

# 5. Start coding!
```

### Before Committing

```bash
# Run linter
pnpm lint

# Run tests
pnpm test

# Check for type errors
pnpm type-check
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Python
- Docker
- GitLens

Settings file: `.vscode/settings.json` (included in repo)

### Other IDEs

Configuration files provided for:
- WebStorm: `.idea/` directory
- Vim: `.vimrc` in project root

## Next Steps

- Read `docs/architecture/services.md` - Understand the architecture
- Read `docs/guides/database-migrations.md` - Learn about migrations
- Join team Slack channel for questions
- Schedule onboarding session with team lead

## Getting Help

- **Documentation**: `docs/`
- **Troubleshooting**: `docs/troubleshooting/`
- **Team Chat**: #vital-dev Slack channel
- **Office Hours**: Tuesday/Thursday 2-3pm

## Related Documentation

- `docs/architecture/services.md` - Services overview
- `docs/guides/database-migrations.md` - Database guide
- `docs/troubleshooting/services.md` - Service troubleshooting

