# config/ - Configuration Files

All configuration files organized by environment and service.

## Structure

```
config/
├── environments/    - Environment-specific configs (.env files)
├── services/        - Service configuration files
└── monitoring/      - Monitoring configurations
```

## Environment Configurations (`environments/`)

```bash
config/environments/
├── .env.dev.example          - Development config template
├── .env.staging.example      - Staging config template
└── .env.production.example   - Production config template
```

**Important**: Never commit actual `.env` files with secrets!

### Usage

```bash
# Copy example and customize
cp config/environments/.env.dev.example .env.dev

# Source in scripts
source config/environments/.env.dev
```

## Service Configurations (`services/`)

Service-specific YAML/JSON configs:

```
services/
├── ai-engine.yaml        - AI engine configuration
├── api-gateway.yaml      - API gateway configuration
└── database.yaml         - Database configuration
```

## Monitoring Configurations (`monitoring/`)

```
monitoring/
├── prometheus.yml              - Prometheus configuration
├── grafana-dashboards/         - Grafana dashboard JSONs
└── alertmanager.yml            - Alert manager rules
```

## Best Practices

- Use `.example` files for templates
- Document all configuration options
- Separate by environment (dev/staging/prod)
- Never commit secrets
- Use environment variables for sensitive data
- Validate configs before deployment

