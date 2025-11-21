# VITAL AI Platform - Commands Cheatsheet

Quick reference for all common commands.

---

## 🏗️ Build & Development

```bash
# Navigate to app
cd apps/digital-health-startup

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Production build with webpack (for bundle analyzer)
npm run build -- --webpack

# Build with bundle analysis
ANALYZE=true npm run build -- --webpack

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Clean build artifacts
rm -rf .next
```

---

## 🧪 Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🗄️ Database

### Using psql (Command Line)

```bash
# Set password
export PGPASSWORD='flusd9fqEb4kkTJ1'

# Connect to database
psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

# Apply migration
cd supabase
psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f migrations/20251112000003_add_performance_indexes.sql

# Run single query
psql "postgresql://..." -c "SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%';"
```

### Useful SQL Queries

```sql
-- Check index count
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- List all indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- Check index usage
SELECT * FROM get_index_usage_stats() WHERE index_name LIKE 'idx_agents%';

-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM agents WHERE tenant_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 20;

-- Analyze tables (update statistics)
ANALYZE agents;
ANALYZE conversations;
ANALYZE messages;
```

---

## 📮 Postman

### Import

```bash
# Collection file location
VITAL_AI_Platform.postman_collection.json

# Environment file location
VITAL_AI_Platform.postman_environment.json
```

### In Postman UI

1. Import collection: **File → Import → Select JSON**
2. Import environment: **Environments → Import**
3. Select environment: **Top right dropdown → "VITAL AI - Development"**
4. Sign in: **Run "Authentication → Sign In"** (saves token)
5. Test endpoints: All requests use saved token automatically

---

## 🔍 Bundle Analysis

```bash
# Build with analyzer (opens browser)
cd apps/digital-health-startup
ANALYZE=true npm run build -- --webpack

# Manually open analyzer results
open .next/analyze/client.html
open .next/analyze/server.html

# Check bundle sizes in build output
npm run build | grep -A 20 "Route"
```

---

## 🔐 Environment Variables

### View Current Environment

```bash
# Show .env.local
cat apps/digital-health-startup/.env.local

# Check specific variable
grep SUPABASE_URL apps/digital-health-startup/.env.local
```

### Required Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=<your-jwt-secret>

# Backend (Python)
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=<your-jwt-secret>
REDIS_URL=redis://...
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Run tests
npm run test:e2e

# 4. Build
npm run build

# 5. Test production build locally
npm run start
# Then open http://localhost:3000
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🧹 Maintenance

```bash
# Clean all build artifacts
rm -rf .next out coverage dist build

# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update dependencies (be careful)
npm outdated
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

## 📊 Performance Monitoring

```bash
# Lighthouse audit
npm run lighthouse
# or manually: lighthouse http://localhost:3000

# Bundle size tracking
npm run build | grep "First Load JS"

# Check route sizes
npm run build | grep -A 50 "Route"
```

---

## 🐛 Debugging

```bash
# Enable debug logging
DEBUG=* npm run dev

# Node.js debugging
node --inspect-brk node_modules/.bin/next dev

# Check for common issues
npm run lint
npm run type-check

# View error logs
tail -f .next/server/logs/error.log

# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## 🔄 Git Operations (Common)

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: apply bundle optimization"

# Push to remote
git push origin main

# Create new branch
git checkout -b feature/bundle-optimization

# View recent commits
git log --oneline -10
```

---

## 📦 Package Management

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install -D package-name

# Remove package
npm uninstall package-name

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated
```

---

## 🎯 Quick Workflows

### Full Development Setup

```bash
cd apps/digital-health-startup
npm install
npm run dev
```

### Complete Testing Suite

```bash
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run build
```

### Deploy Checklist

```bash
npm run type-check &&
npm run lint &&
npm run test:e2e &&
npm run build &&
echo "✅ All checks passed!"
```

---

## 🔥 Common Issues & Fixes

### "Module not found"

```bash
rm -rf node_modules .next
npm install
npm run build
```

### "Port 3000 in use"

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### "Build fails"

```bash
# Clean everything
rm -rf .next node_modules
npm install
npm run build
```

### "Tests failing"

```bash
# Update Playwright browsers
npx playwright install

# Clear test cache
rm -rf test-results playwright-report

# Run specific test
npx playwright test auth.spec.ts
```

---

## 📝 Useful File Locations

```bash
# Configuration files
apps/digital-health-startup/next.config.js
apps/digital-health-startup/tsconfig.json
apps/digital-health-startup/playwright.config.ts

# Environment
apps/digital-health-startup/.env.local

# Database migrations
supabase/migrations/

# Tests
apps/digital-health-startup/e2e/

# Documentation
*.md files in root directory
```

---

## 🎨 Development Tools

```bash
# VS Code tasks
# Open: View → Command Palette → "Tasks: Run Task"

# Format on save (VS Code)
# Settings → "Format On Save" → Enable

# ESLint extension
# Install: code --install-extension dbaeumer.vscode-eslint

# Prettier extension
# Install: code --install-extension esbenp.prettier-vscode
```

---

## 💡 Pro Tips

### Use npm scripts efficiently

```bash
# Run multiple scripts
npm run lint && npm run type-check && npm run build

# Run in parallel (using npm-run-all)
npm install -D npm-run-all
npx run-p lint type-check
```

### Use environment-specific configs

```bash
# Development
npm run dev

# Staging
NODE_ENV=staging npm run build

# Production
NODE_ENV=production npm run build
```

### Quick database queries

```bash
# Save as alias in ~/.zshrc or ~/.bashrc
alias db-connect='PGPASSWORD="flusd9fqEb4kkTJ1" psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"'

# Then just run
db-connect
```

---

**Need more help?** See the comprehensive guides:
- [START_HERE.md](START_HERE.md)
- [QUICK_START.md](QUICK_START.md)
- [README_IMPLEMENTATION.md](README_IMPLEMENTATION.md)

**Last Updated:** 2025-11-12
