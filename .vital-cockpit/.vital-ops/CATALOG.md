# VITAL Ops - Command & Tool Catalog

**Quick Reference Guide for All Operations**  
**Last Updated**: November 21, 2024  
**Version**: 2.0 (Post-Restructure)

---

## 🚀 Quick Start Commands

```bash
# Most Common Operations
./bin/setup-environment dev        # Setup development environment
./bin/start-services               # Start all services
./bin/deploy-production            # Deploy to production
./bin/run-migrations               # Run database migrations
./bin/health-check                 # Check system health
```

---

## 📂 Directory Quick Reference

| Directory | Purpose | Key Commands |
|-----------|---------|--------------|
| `bin/` | Executable shortcuts | `ls bin/` |
| `scripts/` | Automation scripts | See sections below |
| `infrastructure/` | IaC (Terraform, K8s) | `cd infrastructure/` |
| `services/` | Backend code | `cd services/ai-engine/` |
| `database/` | DB resources | `cd database/migrations/` |
| `config/` | Configurations | `cd config/environments/` |
| `docs/` | Documentation | `cd docs/runbooks/` |
| `tests/` | Test suites | `cd tests/integration/` |
| `tools/` | Custom tools | `cd tools/cli/` |
| `lib/` | Shared libraries | `source lib/shell/common.sh` |

---

## 🗄️ Database Operations

### Migrations
```bash
# Run migrations
./bin/run-migrations

# Rollback migration
./scripts/database/migrations/rollback.sh

# Check migration status
./scripts/database/migrations/status.sh
```

### Backups
```bash
# Create backup
./scripts/database/backups/create-backup.sh

# Restore backup
./scripts/database/backups/restore-backup.sh <backup-file>

# List backups
./scripts/database/backups/list-backups.sh
```

### Queries
```bash
# Diagnostic queries
cd database/queries/diagnostics/

# Analytics queries
cd database/queries/analytics/

# Common utilities
cd database/queries/utilities/
```

### Seeds
```bash
# Seed development data
./scripts/database/seeds/seed-dev.sh

# Seed staging data
./scripts/database/seeds/seed-staging.sh

# Seed production data (careful!)
./scripts/database/seeds/seed-production.sh
```

---

## 🚀 Deployment Operations

### Development
```bash
# Setup dev environment
./bin/setup-environment dev

# Deploy to dev
./scripts/deployment/dev/deploy.sh

# Rollback dev deployment
./scripts/deployment/rollback/rollback-dev.sh
```

### Staging
```bash
# Deploy to staging
./scripts/deployment/staging/deploy.sh

# Run smoke tests
./scripts/deployment/staging/smoke-test.sh

# Rollback staging
./scripts/deployment/rollback/rollback-staging.sh
```

### Production
```bash
# Deploy to production
./bin/deploy-production
# OR
./scripts/deployment/production/deploy.sh

# Rollback production
./scripts/deployment/rollback/rollback-production.sh

# Emergency rollback
./scripts/deployment/rollback/emergency-rollback.sh
```

---

## 🎛️ Service Management

### Start/Stop
```bash
# Start all services
./bin/start-services

# Stop all services
./scripts/services/stop-all.sh

# Restart services
./scripts/services/restart.sh

# Start specific service
./scripts/services/start-service.sh <service-name>
```

### Health Checks
```bash
# Check all services
./bin/health-check

# Check specific service
./scripts/services/health-check.sh <service-name>

# Continuous monitoring
./scripts/monitoring/health-check.sh --watch
```

---

## 📊 Monitoring & Observability

### Logs
```bash
# Collect logs
./scripts/monitoring/log-collector.sh

# View service logs
./scripts/monitoring/view-logs.sh <service-name>

# Search logs
./scripts/monitoring/search-logs.sh "error pattern"
```

### Metrics
```bash
# View metrics dashboard
open http://localhost:3000/grafana

# Export metrics
./scripts/monitoring/export-metrics.sh

# Check Prometheus
open http://localhost:9090
```

### Alerts
```bash
# View active alerts
./scripts/monitoring/alerting/view-alerts.sh

# Test alert
./scripts/monitoring/alerting/test-alert.sh

# Silence alert
./scripts/monitoring/alerting/silence-alert.sh <alert-name>
```

---

## 🧪 Testing Operations

### Integration Tests
```bash
# Run all integration tests
./scripts/testing/integration/run-all.sh

# Run specific test suite
./scripts/testing/integration/run-suite.sh <suite-name>
```

### End-to-End Tests
```bash
# Run E2E tests
./scripts/testing/e2e/run-e2e.sh

# Run E2E with UI
./scripts/testing/e2e/run-e2e-ui.sh
```

### Performance Tests
```bash
# Run load tests
./scripts/testing/performance/load-test.sh

# Run stress tests
./scripts/testing/performance/stress-test.sh

# Generate performance report
./scripts/testing/performance/generate-report.sh
```

---

## 🛠️ Data Management

### Import
```bash
# Import agents
./scripts/data-management/import/import-agents.sh <file>

# Import bulk data
./scripts/data-management/import/import-bulk.sh <directory>
```

### Export
```bash
# Export agents
./scripts/data-management/export/export-agents.sh

# Export all data
./scripts/data-management/export/export-all.sh
```

### Sync
```bash
# Sync data from staging to dev
./scripts/data-management/sync/sync-staging-to-dev.sh

# Sync data from production to staging
./scripts/data-management/sync/sync-prod-to-staging.sh
```

---

## 🏗️ Infrastructure Management

### Terraform
```bash
# Plan infrastructure changes
cd infrastructure/terraform/environments/<env>
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy
```

### Kubernetes
```bash
# Apply K8s manifests
kubectl apply -k infrastructure/kubernetes/overlays/<env>

# View deployments
kubectl get deployments

# View pods
kubectl get pods

# View logs
kubectl logs <pod-name>
```

### Docker
```bash
# Start with Docker Compose
cd infrastructure/docker
docker-compose up -d

# View running containers
docker-compose ps

# Stop services
docker-compose down
```

---

## 🔧 Utilities & Tools

### Cleanup
```bash
# Cleanup old logs
./scripts/utilities/cleanup/cleanup-logs.sh

# Cleanup old backups
./scripts/utilities/cleanup/cleanup-backups.sh

# Cleanup Docker images
./scripts/utilities/cleanup/cleanup-docker.sh
```

### Validation
```bash
# Validate configuration
./scripts/utilities/validation/validate-config.sh

# Validate database schema
./scripts/utilities/validation/validate-schema.sh

# Validate environment
./scripts/utilities/validation/validate-environment.sh
```

### Transformers
```bash
# Transform data format
./scripts/utilities/transformers/transform-data.sh <input> <output>

# Convert JSON to SQL
./scripts/utilities/transformers/json-to-sql.js <file>
```

---

## 🔐 Security & Compliance

### Compliance Checks
```bash
# Run compliance scan
./tools/compliance/scan.sh

# Generate compliance report
./tools/compliance/generate-report.sh
```

### Security Scans
```bash
# Run security scan
./scripts/utilities/security-scan.sh

# Check vulnerabilities
./scripts/utilities/check-vulnerabilities.sh
```

---

## 📚 Documentation

### Runbooks
- **Deployment**: `docs/runbooks/deployment.md`
- **Incident Response**: `docs/runbooks/incident-response.md`
- **Rollback**: `docs/runbooks/rollback.md`
- **Disaster Recovery**: `docs/runbooks/disaster-recovery.md`

### Guides
- **Setup Development**: `docs/guides/setup-development.md`
- **Deploy Production**: `docs/guides/deploy-production.md`
- **Database Migrations**: `docs/guides/database-migrations.md`
- **Monitoring Setup**: `docs/guides/monitoring-setup.md`

### Architecture
- **Infrastructure**: `docs/architecture/infrastructure.md`
- **Services**: `docs/architecture/services.md`
- **Data Flow**: `docs/architecture/data-flow.md`

### Troubleshooting
- **Services**: `docs/troubleshooting/services.md`
- **Database**: `docs/troubleshooting/database.md`
- **Deployment**: `docs/troubleshooting/deployment.md`

---

## 🎯 Common Workflows

### New Feature Deployment
```bash
1. ./bin/setup-environment dev
2. # Develop feature
3. ./scripts/testing/integration/run-all.sh
4. ./scripts/deployment/staging/deploy.sh
5. ./scripts/deployment/staging/smoke-test.sh
6. ./bin/deploy-production
```

### Database Migration
```bash
1. # Create migration file in database/migrations/pending/
2. ./scripts/database/migrations/validate.sh
3. ./scripts/deployment/dev/deploy.sh
4. ./scripts/database/migrations/test.sh
5. ./bin/run-migrations
```

### Incident Response
```bash
1. ./bin/health-check
2. ./scripts/monitoring/view-logs.sh <service>
3. # Follow docs/runbooks/incident-response.md
4. ./scripts/deployment/rollback/emergency-rollback.sh (if needed)
```

### Performance Investigation
```bash
1. ./scripts/monitoring/export-metrics.sh
2. ./scripts/testing/performance/load-test.sh
3. # Analyze results
4. ./tools/monitoring/generate-performance-report.sh
```

---

## 🤖 AI Agent Quick Reference

### For Setup Tasks
```
Query: "Setup development environment"
Command: ./bin/setup-environment dev
Location: bin/setup-environment
```

### For Deployment
```
Query: "Deploy to production"
Command: ./bin/deploy-production
Location: bin/deploy-production
Docs: docs/runbooks/deployment.md
```

### For Database Operations
```
Query: "Run database migrations"
Command: ./bin/run-migrations
Location: bin/run-migrations
Docs: docs/guides/database-migrations.md
```

### For Monitoring
```
Query: "Check system health"
Command: ./bin/health-check
Location: bin/health-check
```

### For Troubleshooting
```
Query: "Service is down"
Docs: docs/troubleshooting/services.md
Runbook: docs/runbooks/incident-response.md
```

---

## 📞 Emergency Contacts

### Quick Actions
- **Rollback Production**: `./scripts/deployment/rollback/emergency-rollback.sh`
- **Stop All Services**: `./scripts/services/stop-all.sh`
- **Create Backup**: `./scripts/database/backups/create-backup.sh`
- **View Logs**: `./scripts/monitoring/view-logs.sh all`

### Documentation
- **Incident Response**: `docs/runbooks/incident-response.md`
- **Disaster Recovery**: `docs/runbooks/disaster-recovery.md`

---

## 🔄 Updates

To update this catalog:
```bash
# Catalog is auto-generated from directory structure
./tools/cli/vital-ops catalog --update
```

---

**For detailed documentation on any command, see the respective README.md in each directory.**

**For operational procedures, see `docs/runbooks/`**

**For troubleshooting, see `docs/troubleshooting/`**

