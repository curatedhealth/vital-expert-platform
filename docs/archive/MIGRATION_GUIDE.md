# VITAL Path Monorepo Migration Guide

This guide helps you transition from the old project structure to the new monorepo architecture.

## 🎯 What Changed

### New Structure
```
├── apps/                    # Applications
│   ├── frontend/           # Next.js React app (moved from src/)
│   ├── node-gateway/       # Node.js API gateway (moved from backend/node-gateway/)
│   └── python-services/    # Python AI services (moved from backend/python-ai-services/ + src/)
├── packages/               # Shared packages
│   ├── ui/                # React UI components (moved from src/components/)
│   ├── core/              # Business logic & types (moved from src/shared/)
│   └── configs/           # Shared configurations (ESLint, Prettier, TypeScript)
├── db/                    # Database (consolidated from supabase/migrations/ + database/migrations/)
│   ├── migrations/        # All database migrations
│   └── seeds/            # Database seed data
└── infra/                 # Infrastructure (moved from k8s/ + terraform/)
```

### Key Improvements
- ✅ **Clear separation** of frontend, backend, and shared code
- ✅ **Monorepo workspace** with pnpm for efficient dependency management
- ✅ **Consolidated database** migrations in single location
- ✅ **Shared configuration** packages for consistency
- ✅ **Modern tooling** with ESLint, Prettier, TypeScript project references
- ✅ **CI/CD pipeline** with GitHub Actions
- ✅ **Docker support** for each service
- ✅ **Comprehensive documentation** and development guides

## 🚀 Migration Steps

### 1. Run the Migration Script
```bash
# Make the script executable
chmod +x scripts/migrate-to-monorepo.js

# Run the migration
node scripts/migrate-to-monorepo.js
```

### 2. Install Dependencies
```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install

# Or use the Makefile
make bootstrap
```

### 3. Update Your IDE
- **VS Code**: Install the "Monorepo Workspace" extension
- **WebStorm**: Open the root directory as a project
- **Vim/Neovim**: Update your LSP configuration for the new structure

### 4. Update Environment Variables
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

### 5. Test the Migration
```bash
# Test all services
make dev

# Test individual services
make dev-frontend
make dev-gateway
make dev-python

# Run tests
make test

# Check linting
make lint
```

## 🔧 Development Workflow

### Daily Development
```bash
# Start all services
make dev

# Or start specific services
make dev-frontend
make dev-gateway
make dev-python
```

### Building
```bash
# Build all packages
make build

# Build specific packages
make build-frontend
make build-gateway
```

### Testing
```bash
# Run all tests
make test

# Run specific test types
make test-unit
make test-integration
make test-coverage
```

### Code Quality
```bash
# Lint and fix
make lint-fix

# Format code
make format

# Type check
make type-check
```

## 📁 File Organization

### Frontend App (`apps/frontend/`)
- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/features/` - Feature-based organization
- `src/shared/` - Shared utilities and hooks
- `src/lib/` - Library code
- `src/types/` - TypeScript type definitions
- `public/` - Static assets
- `cypress/` - E2E tests

### Node Gateway (`apps/node-gateway/`)
- `src/` - Source code
- `src/routes/` - API routes
- `src/services/` - Business logic
- `src/middleware/` - Express middleware
- `src/websocket/` - WebSocket handling

### Python Services (`apps/python-services/`)
- `src/` - Python source code
- `src/orchestration/` - AI orchestration
- `src/services/` - Business services
- `src/analytics/` - Analytics and monitoring
- `src/ml/` - Machine learning models
- `requirements.txt` - Python dependencies
- `pyproject.toml` - Modern Python packaging

### Shared Packages (`packages/`)
- `ui/` - React UI components
- `core/` - Business logic and types
- `configs/` - Shared configurations

## 🐛 Troubleshooting

### Common Issues

#### Import Path Errors
If you see import path errors, update them to use the new structure:
```typescript
// Old
import { Button } from '@/components/ui/button'

// New (if using shared UI package)
import { Button } from '@vital-path/ui'

// Or keep local imports
import { Button } from '@/components/ui/button'
```

#### TypeScript Errors
Make sure each app has its own `tsconfig.json` that extends the root config:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Dependency Issues
If you have dependency conflicts:
```bash
# Clean install
rm -rf node_modules
pnpm install

# Or reset everything
make clean
make bootstrap
```

#### Database Migration Issues
If database migrations fail:
```bash
# Check migration status
make db-status

# Reset database (WARNING: This will delete all data)
supabase db reset

# Or run migrations manually
psql -f db/migrations/your_migration.sql
```

### Getting Help

1. Check the [main README](README.md) for detailed documentation
2. Look at the [architecture docs](docs/architecture/) for system design
3. Review the [API documentation](docs/api/) for service interfaces
4. Create an issue if you find a bug or need help

## ✅ Verification Checklist

- [ ] All services start without errors (`make dev`)
- [ ] All tests pass (`make test`)
- [ ] Linting passes (`make lint`)
- [ ] Type checking passes (`make type-check`)
- [ ] Database migrations work (`make db-migrate`)
- [ ] Docker builds work (`docker-compose build`)
- [ ] CI/CD pipeline passes (check GitHub Actions)

## 🎉 Next Steps

After successful migration:

1. **Update your team** on the new structure and workflows
2. **Set up monitoring** for the new services
3. **Configure deployment** pipelines for each service
4. **Update documentation** with any team-specific processes
5. **Train developers** on the new monorepo workflow

## 📚 Additional Resources

- [Monorepo Best Practices](https://monorepo.tools/)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [Next.js App Router](https://nextjs.org/docs/app)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Need help?** Create an issue or reach out to the team!
