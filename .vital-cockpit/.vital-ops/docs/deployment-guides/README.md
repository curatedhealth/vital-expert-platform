# VITAL Platform Deployment Documentation

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Production Ready

---

## Overview

This directory contains comprehensive deployment documentation for the VITAL Platform across multiple environments and platforms.

## Contents

### Railway Deployment
- **[Railway Guide](./railway/README.md)** - Complete Railway deployment documentation
- **[Railway Guides](./railway/guides/)** - Step-by-step Railway deployment guides
- **[Railway Troubleshooting](./railway/troubleshooting/)** - Common issues and solutions

### AI Engine Deployment
- **[AI Engine Deployment](./AI_ENGINE_DEPLOYMENT.md)** - Python FastAPI backend deployment

### General Deployment
- **[Production Checklist](./DEPLOYMENT_PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist
- **[Vercel Deployment](./VERCEL_DEPLOYMENT_STEPS.md)** - Frontend deployment on Vercel
- **[Unified Deployment Plan](./UNIFIED_DEPLOYMENT_PLAN.md)** - Complete deployment strategy

## Quick Start

### Railway (Backend)
```bash
cd services/ai-engine
railway link
railway up
```

### Vercel (Frontend)
```bash
vercel deploy --prod
```

## Environment Strategy

1. **Production** (`main` branch)
   - Domain: `vital-platform.com`
   - Database: Production Supabase
   - Vercel: Production project
   - Railway: Production AI Engine

2. **Pre-Production** (`develop` branch)
   - Domain: `dev.vital-platform.com`
   - Database: Staging Supabase
   - Vercel: Pre-production project

3. **Preview** (feature branches)
   - Domain: `*.vercel.app`
   - Database: Development Supabase
   - Vercel: Preview deployments

## Related Documentation

- [Backend Architecture](../06-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- [Frontend Architecture](../06-architecture/frontend/)
- [API Documentation](../10-api/API_DOCUMENTATION.md)
- [Operations Guide](../13-operations/)

---

**For detailed deployment instructions, see the specific guides in each directory.**
