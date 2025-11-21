# VITAL Path Digital Health Platform

A comprehensive digital health intelligence platform with 50+ healthcare AI agents, built as a modern monorepo.

## 🏗️ Architecture

This is a monorepo containing multiple applications and shared packages:

### Applications (`apps/`)
- **`frontend/`** - Next.js React application with healthcare UI components
- **`node-gateway/`** - Node.js API gateway and orchestration service
- **`python-services/`** - Python AI services and machine learning components

### Packages (`packages/`)
- **`ui/`** - Shared React UI components and design system
- **`core/`** - Shared business logic, types, and utilities
- **`configs/`** - Shared configuration files (ESLint, Prettier, TypeScript)

### Database (`db/`)
- **`migrations/`** - Database schema migrations
- **`seeds/`** - Database seed data

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Python 3.11+
- PostgreSQL 14+
- Supabase CLI (optional)

### Installation

```bash
# Install dependencies
make bootstrap
# or
pnpm install

# Setup database
make db-setup
# or
pnpm db:setup

# Start development servers
make dev
# or
pnpm dev
```

### Individual Services

```bash
# Frontend only
make dev-frontend
pnpm dev:frontend

# Node Gateway only
make dev-gateway
pnpm dev:gateway

# Python Services only
make dev-python
pnpm dev:python
```

## 📁 Project Structure

```
├── apps/                    # Applications
│   ├── frontend/           # Next.js React app
│   ├── node-gateway/       # Node.js API gateway
│   └── python-services/    # Python AI services
├── packages/               # Shared packages
│   ├── ui/                # React UI components
│   ├── core/              # Business logic & types
│   └── configs/           # Shared configurations
├── db/                    # Database
│   ├── migrations/        # Schema migrations
│   └── seeds/            # Seed data
├── infra/                 # Infrastructure
│   ├── k8s/              # Kubernetes manifests
│   └── terraform/        # Terraform configurations
├── docs/                  # Documentation
└── scripts/              # Utility scripts
```

## 🛠️ Development

### Available Commands

```bash
# Development
make dev                  # Start all services
make dev-frontend        # Start frontend only
make dev-gateway         # Start gateway only
make dev-python          # Start Python services only

# Building
make build               # Build all packages
make build-frontend      # Build frontend only
make build-gateway       # Build gateway only

# Testing
make test                # Run all tests
make test-unit           # Run unit tests
make test-integration    # Run integration tests
make test-coverage       # Run tests with coverage

# Code Quality
make lint                # Run linting
make lint-fix            # Fix linting issues
make format              # Format code
make type-check          # TypeScript type checking

# Database
make db-migrate          # Run migrations
make db-status           # Check migration status
make db-setup            # Setup database

# Healthcare Compliance
make health-check        # Run compliance checks
make pre-commit          # Run pre-commit checks
make pre-deploy          # Run pre-deployment checks
```

### Environment Variables

Create `.env.local` files in each app directory:

#### Frontend (`apps/frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Node Gateway (`apps/node-gateway/.env.local`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vital_path
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

#### Python Services (`apps/python-services/.env.local`)
```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=postgresql://user:password@localhost:5432/vital_path
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
make test-unit
make test-integration
make test-coverage

# Run tests for specific app
pnpm --filter frontend test
pnpm --filter node-gateway test
```

## 🚀 Deployment

### Docker

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start specific service
docker-compose up frontend
docker-compose up node-gateway
docker-compose up python-services
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f infra/k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## 📊 Monitoring

- **Frontend**: Built-in Next.js analytics
- **Backend**: OpenTelemetry instrumentation
- **Database**: Supabase dashboard
- **Infrastructure**: Kubernetes metrics

## 🔒 Security

- HIPAA compliance scanning
- Medical data validation
- Security audit tools
- Dependency vulnerability scanning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Review

- Frontend changes: `@vital-path/frontend-team`
- Backend changes: `@vital-path/backend-team`
- Database changes: `@vital-path/database-team`
- Infrastructure changes: `@vital-path/devops-team`

## 📚 Documentation

- [Architecture Overview](docs/architecture/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)
- [Contributing Guidelines](CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the [documentation](docs/) for common questions
- Contact the team for urgent issues

---

**VITAL Path** - Transforming healthcare through intelligent AI agents