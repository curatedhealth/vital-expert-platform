# config/ - Configuration Files and Templates

**Configuration management for VITAL Platform operations.**

---

## Structure

```
config/
├── environments/         - Environment-specific configurations
│   ├── dev.env.template
│   ├── staging.env.template
│   └── prod.env.template
├── docker/              - Docker configurations (future)
├── kubernetes/          - K8s configurations (future)
└── monitoring/          - Monitoring configurations (future)
```

---

## Environment Configurations

### Templates

Environment configuration templates for different deployment stages:

- **dev.env.template** - Local development
- **staging.env.template** - Staging environment  
- **prod.env.template** - Production environment

### Usage

**For local development:**

```bash
# Copy template
cp config/environments/dev.env.template ../../.env

# Edit with your values
nano ../../.env

# Load environment
source ../../.env
```

**For deployment (Railway/Vercel):**

1. Use the appropriate template (staging/prod)
2. Set environment variables in Railway/Vercel dashboard
3. Use `${VARIABLE}` syntax for Railway-provided values

---

## Environment Variables

### Required Variables

#### Database
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)

#### Application
- `NODE_ENV` - Environment (development/staging/production)
- `PORT` - Server port
- `API_URL` - API base URL
- `FRONTEND_URL` - Frontend base URL

### Optional Variables

#### Monitoring
- `LANGCHAIN_TRACING_V2` - Enable LangChain tracing
- `LANGCHAIN_API_KEY` - LangSmith API key
- `LANGCHAIN_PROJECT` - LangSmith project name
- `SENTRY_DSN` - Sentry error tracking

#### Caching
- `REDIS_URL` - Redis connection string

#### Security
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session encryption secret

#### Feature Flags
- `ENABLE_DEBUG_LOGGING` - Enable debug logs
- `ENABLE_ANALYTICS` - Enable analytics
- `ENABLE_MONITORING` - Enable monitoring

---

## Configuration Validation

### Validate Configuration

```bash
# Validate environment config
../tools/validation/validate-config.sh

# Check required variables
../tools/validation/check-env-vars.sh

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

---

## Security Best Practices

### DO ✅

- Use templates for reference
- Store secrets in environment variables
- Use different secrets for each environment
- Rotate secrets regularly
- Use strong, randomly generated secrets

### DON'T ❌

- Commit .env files to git
- Share secrets in plaintext
- Use production secrets in development
- Hardcode secrets in code
- Reuse secrets across environments

---

## Generating Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate session secret
openssl rand -base64 32

# Generate strong password
openssl rand -base64 24
```

---

## Environment-Specific Notes

### Development
- Debug logging enabled
- Analytics disabled
- Monitoring optional
- Relaxed rate limits
- Local database

### Staging
- Debug logging enabled
- Analytics enabled
- Monitoring enabled
- Moderate rate limits
- Staging database (separate from prod)

### Production
- Debug logging disabled
- Analytics enabled
- Monitoring enabled
- Strict rate limits
- Production database
- Error tracking (Sentry)
- Performance monitoring

---

## Troubleshooting

### Missing Environment Variables

```bash
# Check what's set
env | grep -E "DATABASE|SUPABASE|OPENAI"

# Check what's missing
../tools/validation/check-env-vars.sh
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

### API Key Issues

```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Supabase
curl "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

---

## Related Documentation

- **Setup Guide**: `../docs/guides/setup-development.md`
- **Deployment**: `../docs/deployment-guides/`
- **Security**: `../../vital-expert-docs/07-integrations/security/`

---

**Last Updated**: November 21, 2024  
**Maintained By**: DevOps Team
