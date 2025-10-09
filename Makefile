.PHONY: help bootstrap dev build test lint clean install

# Default target
help: ## Show this help message
	@echo "VITAL Path Digital Health Platform - Development Commands"
	@echo "========================================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

bootstrap: ## Install dependencies and setup workspace
	pnpm install
	pnpm -r build

install: ## Install dependencies
	pnpm install

dev: ## Start all services in development mode
	pnpm dev

dev-frontend: ## Start frontend development server
	pnpm dev:frontend

dev-gateway: ## Start node gateway development server
	pnpm dev:gateway

dev-python: ## Start python services
	pnpm dev:python

build: ## Build all packages and apps
	pnpm build

build-frontend: ## Build frontend app
	pnpm build:frontend

build-gateway: ## Build node gateway
	pnpm build:gateway

test: ## Run all tests
	pnpm test

test-unit: ## Run unit tests
	pnpm test:unit

test-integration: ## Run integration tests
	pnpm test:integration

test-coverage: ## Run tests with coverage
	pnpm test:coverage

lint: ## Run linting
	pnpm lint

lint-fix: ## Fix linting issues
	pnpm lint:fix

format: ## Format code
	pnpm format

type-check: ## Run TypeScript type checking
	pnpm type-check

clean: ## Clean build artifacts
	pnpm clean
	rm -rf node_modules/.cache
	rm -rf .next
	rm -rf dist
	rm -rf build

db-migrate: ## Run database migrations
	pnpm db:migrate

db-status: ## Check migration status
	pnpm db:status

db-setup: ## Setup database
	pnpm db:setup

health-check: ## Run healthcare compliance checks
	pnpm healthcare:check

pre-commit: ## Run pre-commit checks
	pnpm pre-commit

pre-deploy: ## Run pre-deployment checks
	pnpm pre-deploy
