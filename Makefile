# ============================================================================
# VITAL Path - Makefile
# ============================================================================
#
# Common commands for development and deployment.
#
# Usage:
#   make help       - Show available commands
#   make dev        - Start development servers
#   make sync-types - Synchronize TypeScript/Python types
#   make test       - Run all tests
#
# ============================================================================

.PHONY: help dev build test lint clean sync-types install db-migrate db-seed

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo "VITAL Path - Available Commands"
	@echo "================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ============================================================================
# DEVELOPMENT
# ============================================================================

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	pnpm install
	cd services/ai-engine && poetry install
	@echo "✅ Dependencies installed"

dev: ## Start all development servers
	@echo "🚀 Starting development servers..."
	pnpm run dev

dev-web: ## Start frontend development server
	@echo "🌐 Starting frontend..."
	cd apps/web && pnpm run dev

dev-api: ## Start backend API server
	@echo "🐍 Starting backend API..."
	cd services/ai-engine && poetry run uvicorn src.main:app --reload --port 8000

dev-worker: ## Start Celery worker
	@echo "⚙️ Starting Celery worker..."
	cd services/ai-engine && poetry run celery -A src.workers.config worker -l info

# ============================================================================
# BUILD
# ============================================================================

build: ## Build all packages
	@echo "🔨 Building..."
	pnpm run build

build-protocol: ## Build protocol package
	@echo "📦 Building protocol package..."
	cd packages/protocol && pnpm run build

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "🧪 Running tests..."
	pnpm run test
	cd services/ai-engine && poetry run pytest

test-web: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	cd apps/web && pnpm run test

test-api: ## Run backend tests
	@echo "🧪 Running backend tests..."
	cd services/ai-engine && poetry run pytest

test-e2e: ## Run end-to-end tests
	@echo "🧪 Running E2E tests..."
	cd tests/e2e && pnpm run test

# ============================================================================
# CODE QUALITY
# ============================================================================

lint: ## Run linters
	@echo "🔍 Running linters..."
	pnpm run lint
	cd services/ai-engine && poetry run ruff check .

lint-fix: ## Fix linting issues
	@echo "🔧 Fixing linting issues..."
	pnpm run lint --fix
	cd services/ai-engine && poetry run ruff check . --fix

format: ## Format code
	@echo "💅 Formatting code..."
	pnpm run format
	cd services/ai-engine && poetry run black .

typecheck: ## Run type checking
	@echo "📝 Type checking..."
	pnpm run typecheck
	cd services/ai-engine && poetry run mypy src

# ============================================================================
# TYPE SYNCHRONIZATION
# ============================================================================

sync-types: ## Synchronize TypeScript and Python types
	@echo "🔄 Synchronizing types..."
	./scripts/codegen/sync_types.sh

generate-json-schemas: ## Generate JSON Schemas from Zod
	@echo "📋 Generating JSON Schemas..."
	cd packages/protocol && pnpm run generate:json-schemas

generate-pydantic: ## Generate Pydantic models from JSON Schemas
	@echo "🐍 Generating Pydantic models..."
	python scripts/codegen/generate_pydantic.py

# ============================================================================
# DATABASE
# ============================================================================

db-migrate: ## Run database migrations
	@echo "📊 Running migrations..."
	supabase db push

db-migrate-new: ## Create a new migration
	@echo "📝 Creating new migration..."
	@read -p "Migration name: " name; \
	supabase migration new $$name

db-seed: ## Seed the database
	@echo "🌱 Seeding database..."
	supabase db seed

db-reset: ## Reset database (DANGEROUS)
	@echo "⚠️ Resetting database..."
	@read -p "Are you sure? [y/N] " confirm; \
	if [ "$$confirm" = "y" ]; then \
		supabase db reset; \
	fi

db-policies: ## Apply RLS policies
	@echo "🔒 Applying RLS policies..."
	for f in database/policies/*.sql; do \
		echo "  Applying $$(basename $$f)..."; \
		supabase db execute --file "$$f"; \
	done
	@echo "✅ RLS policies applied"

# ============================================================================
# DOCKER
# ============================================================================

docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	docker compose -f infrastructure/docker/docker-compose.yml build

docker-up: ## Start Docker containers (API + Workers + Redis)
	@echo "🐳 Starting containers..."
	docker compose -f infrastructure/docker/docker-compose.yml up -d

docker-up-full: ## Start all containers including frontend
	@echo "🐳 Starting full stack..."
	docker compose -f infrastructure/docker/docker-compose.yml --profile full-stack up -d

docker-up-local-db: ## Start with local PostgreSQL
	@echo "🐳 Starting with local database..."
	docker compose -f infrastructure/docker/docker-compose.yml --profile local-db up -d

docker-down: ## Stop Docker containers
	@echo "🐳 Stopping containers..."
	docker compose -f infrastructure/docker/docker-compose.yml down

docker-down-v: ## Stop containers and remove volumes (DANGER: data loss)
	@echo "⚠️ Stopping containers and removing volumes..."
	docker compose -f infrastructure/docker/docker-compose.yml down -v

docker-logs: ## View Docker logs (all services)
	docker compose -f infrastructure/docker/docker-compose.yml logs -f

docker-logs-api: ## View API logs
	docker compose -f infrastructure/docker/docker-compose.yml logs -f api

docker-logs-workers: ## View worker logs
	docker compose -f infrastructure/docker/docker-compose.yml logs -f worker-execution worker-ingestion worker-discovery

docker-ps: ## Show running containers
	docker compose -f infrastructure/docker/docker-compose.yml ps

docker-shell-api: ## Shell into API container
	docker compose -f infrastructure/docker/docker-compose.yml exec api bash

docker-shell-worker: ## Shell into worker container
	docker compose -f infrastructure/docker/docker-compose.yml exec worker-execution bash

docker-scale-workers: ## Scale execution workers (usage: make docker-scale-workers N=4)
	@echo "📈 Scaling execution workers to $(N)..."
	docker compose -f infrastructure/docker/docker-compose.yml up -d --scale worker-execution=$(N)

docker-restart: ## Restart all containers
	@echo "🔄 Restarting containers..."
	docker compose -f infrastructure/docker/docker-compose.yml restart

docker-health: ## Check service health
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:8000/health | python3 -m json.tool || echo "API not responding"
	@docker compose -f infrastructure/docker/docker-compose.yml exec redis redis-cli ping || echo "Redis not responding"

# ============================================================================
# CLEANUP
# ============================================================================

clean: ## Clean build artifacts
	@echo "🧹 Cleaning..."
	rm -rf node_modules
	rm -rf apps/web/.next
	rm -rf apps/web/node_modules
	rm -rf packages/*/dist
	rm -rf packages/*/node_modules
	rm -rf services/ai-engine/.venv
	rm -rf services/ai-engine/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleaned"

clean-generated: ## Clean generated files
	@echo "🧹 Cleaning generated files..."
	rm -rf packages/protocol/src/json-schemas
	rm -rf services/ai-engine/src/api/schemas/_generated
	@echo "✅ Generated files cleaned"

# ============================================================================
# UTILITIES
# ============================================================================

check-env: ## Check environment setup
	@echo "🔍 Checking environment..."
	@echo "Node: $$(node --version)"
	@echo "pnpm: $$(pnpm --version)"
	@echo "Python: $$(python3 --version)"
	@echo "Poetry: $$(poetry --version)"
	@echo "Supabase CLI: $$(supabase --version)"
	@echo "✅ Environment check complete"

update-deps: ## Update dependencies
	@echo "⬆️ Updating dependencies..."
	pnpm update
	cd services/ai-engine && poetry update
	@echo "✅ Dependencies updated"
