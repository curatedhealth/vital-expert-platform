# Core Operational Scripts

Essential scripts for platform setup, deployment, and monitoring.

## Subdirectories

### setup/
Environment and service configuration scripts.

**Key scripts:**
- `setup-cloud-env.js` - Configure cloud environment
- `setup-env-from-local.sh` - Setup from local configuration
- `setup-supabase.ts` - Initialize Supabase
- `setup-super-admin.js` - Create super admin user

**Usage:**
```bash
# Setup complete environment
node setup/setup-cloud-env.js

# Create admin user
node setup/setup-super-admin.js
```

### deployment/
Automated deployment scripts.

**Key scripts:**
- `deploy-complete-mvp.js` - Full MVP deployment
- `docker-backend-start.sh` - Start backend in Docker
- `verify-phase*-deployment.sh` - Verify deployment phases

**Usage:**
```bash
# Deploy MVP
node deployment/deploy-complete-mvp.js

# Start Docker services
bash deployment/docker-backend-start.sh
```

### monitoring/
Health checks and system monitoring.

**Key scripts:**
- `backend-health-check.sh` - Backend health status
- `comprehensive-system-check.js` - Full system check
- `start-services.sh` / `stop-services.sh` - Service management

**Usage:**
```bash
# Check backend health
bash monitoring/backend-health-check.sh

# Full system check
node monitoring/comprehensive-system-check.js

# Manage services
bash monitoring/start-services.sh
bash monitoring/stop-services.sh
```

### knowledge/
Knowledge base and domain management.

### langchain/
LangChain utilities and configurations.

## Notes

- Run setup scripts once during initial configuration
- Use deployment scripts for CI/CD pipelines
- Monitor health checks in production
- Review logs in monitoring directory
