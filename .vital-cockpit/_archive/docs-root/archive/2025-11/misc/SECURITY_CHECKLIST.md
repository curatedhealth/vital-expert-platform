# Security Audit & Deployment Checklist

**VITAL Path AI Services - Production Deployment Security Guide**

Generated: November 2, 2025

---

## 🔒 SECURITY AUDIT RESULTS

**Status:** ❌ NOT PRODUCTION READY (6 critical issues)

**Summary:**
- Total Checks: 13
- Passed: 7
- Failed: 6
- Critical Issues: 6
- High Issues: 0
- Medium Issues: 5

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. Missing Environment Variables

All of these MUST be set for production:

#### **OPENAI_API_KEY**
```bash
# Generate at: https://platform.openai.com/api-keys
export OPENAI_API_KEY="sk-proj-..."
```

#### **SUPABASE_URL & SUPABASE_KEY**
```bash
# Get from Supabase project settings
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### **JWT_SECRET**
```bash
# Generate a strong secret (32+ characters)
export JWT_SECRET=$(openssl rand -base64 32)
```

#### **REDIS_URL**
```bash
# Use Upstash, Railway, or other Redis provider
export REDIS_URL="redis://default:password@host:port"
```

### 2. Admin Authentication Bypass

**Issue:** Development bypass is likely enabled

**Fix:**
```bash
export BYPASS_ADMIN_AUTH=false
```

**Verify:** Check `middleware/admin_auth.py` configuration

---

## 🟡 MEDIUM PRIORITY (Recommended)

### 1. Optional Environment Variables

#### **ADMIN_API_KEY**
```bash
# Generate for service-to-service authentication
export ADMIN_API_KEY=$(openssl rand -base64 48)
```

#### **TAVILY_API_KEY**
```bash
# Get from: https://tavily.com
export TAVILY_API_KEY="tvly-..."
```

#### **SENTRY_DSN** (Error Tracking)
```bash
# Get from: https://sentry.io
export SENTRY_DSN="https://...@sentry.io/..."
```

#### **ENVIRONMENT**
```bash
# Set deployment environment
export ENVIRONMENT="production"  # or "staging", "development"
```

### 2. Rate Limiting

**Issue:** Without Redis, rate limiting is not distributed

**Impact:** Multi-instance deployments won't share rate limit state

**Fix:** Configure Redis (see above)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Environment Configuration

- [ ] All CRITICAL environment variables set
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] BYPASS_ADMIN_AUTH=false
- [ ] Redis configured for distributed rate limiting
- [ ] Sentry configured for error tracking (optional)
- [ ] Environment name set (ENVIRONMENT=production)

### Security Hardening

- [ ] No hardcoded secrets in code
- [ ] .env files in .gitignore
- [ ] Admin API key generated and secured
- [ ] Rate limiting tested
- [ ] CORS configured properly
- [ ] HTTPS/TLS enabled

### Database Security

- [ ] Row Level Security (RLS) enabled on all tenant tables
- [ ] RLS policies verified for tenant isolation
- [ ] Database connection uses SSL
- [ ] Service role key kept secret
- [ ] Backup strategy configured

### API Security

- [ ] All endpoints use input validation (Pydantic models)
- [ ] Rate limiting active on expensive endpoints
- [ ] Authentication required on protected routes
- [ ] Error messages don't expose sensitive info
- [ ] Logging doesn't log secrets

### Monitoring & Alerting

- [ ] Performance monitoring active
- [ ] Error tracking configured (Sentry)
- [ ] Health check endpoint exposed
- [ ] Alert thresholds configured
- [ ] Incident response plan documented

### Testing

- [ ] All 66 unit tests passing
- [ ] Integration tests run successfully
- [ ] Load testing completed (optional)
- [ ] Security penetration testing (optional)
- [ ] Smoke tests on staging environment

### Dependencies

- [ ] Python packages audited (`pip-audit`)
- [ ] NPM packages audited (`npm audit`)
- [ ] No known critical vulnerabilities
- [ ] Dependencies pinned to specific versions

---

## 🛠️ HOW TO FIX CRITICAL ISSUES

### Step 1: Create .env File

Create `.env` in your deployment environment (DO NOT commit to git):

```bash
# ============================================================================
# VITAL PATH AI SERVICES - PRODUCTION ENVIRONMENT
# ============================================================================

# OpenAI API
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=YOUR_SERVICE_KEY_HERE

# Security
JWT_SECRET=YOUR_STRONG_SECRET_HERE_32_PLUS_CHARS
ADMIN_API_KEY=YOUR_ADMIN_KEY_HERE
BYPASS_ADMIN_AUTH=false

# Redis (Rate Limiting & Caching)
REDIS_URL=redis://default:password@host:port

# Optional: Web Search
TAVILY_API_KEY=tvly-YOUR_KEY_HERE

# Optional: Error Tracking
SENTRY_DSN=https://...@sentry.io/...

# Optional: Environment Name
ENVIRONMENT=production

# Optional: Logging
LOG_LEVEL=INFO
```

### Step 2: Generate Secrets

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Admin API Key (48+ characters)
openssl rand -base64 48

# Generate random password
openssl rand -base64 24
```

### Step 3: Verify Configuration

Run security audit again:

```bash
cd services/ai-engine
python3 security_audit.py --full
```

Expected output: `✅ PRODUCTION READY`

### Step 4: Test Authentication

```python
# Test admin authentication
from middleware.admin_auth import AdminAuthConfig, print_config

print_config()
# Should show:
# - Bypass enabled: False
# - JWT secret configured: Yes
# - API key configured: Yes
```

### Step 5: Test Rate Limiting

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
# Expected: PONG

# Test rate limiting
curl -H "x-tenant-id: test-tenant" \
     http://localhost:8000/api/health \
     -v
# Check for X-RateLimit-* headers
```

---

## 🔐 SECRETS MANAGEMENT STRATEGY

### Development
- Use `.env.local` file (gitignored)
- Never commit secrets to version control
- Use different keys than production

### Staging
- Use environment variables in CI/CD
- Rotate keys monthly
- Use separate database/Redis instances

### Production
- Use secret management service (AWS Secrets Manager, GCP Secret Manager, etc.)
- Rotate keys quarterly
- Use separate infrastructure
- Enable audit logging

### Key Rotation Schedule

| Secret | Rotation Frequency | Method |
|--------|-------------------|--------|
| OPENAI_API_KEY | Quarterly | Manual |
| JWT_SECRET | Annually | Automated |
| ADMIN_API_KEY | Quarterly | Manual |
| Redis Password | Quarterly | Automated |
| Database Password | Annually | Automated |

---

## 🚨 INCIDENT RESPONSE

If secrets are compromised:

1. **Immediate:**
   - Revoke compromised keys
   - Generate new keys
   - Update environment variables
   - Restart services

2. **Short-term:**
   - Audit access logs
   - Notify affected users (if applicable)
   - Review security controls

3. **Long-term:**
   - Conduct post-mortem
   - Update security procedures
   - Implement additional controls

---

## 📊 SECURITY MONITORING

### Metrics to Track

- Failed authentication attempts
- Rate limit violations
- Unusual API access patterns
- Error rates by endpoint
- Cost anomalies
- Database query patterns

### Alert Thresholds

- **CRITICAL:** Failed auth > 10/minute
- **HIGH:** Error rate > 10%
- **MEDIUM:** Cost spike > 2x average
- **LOW:** Rate limit violations

### Review Schedule

- **Daily:** Security logs review
- **Weekly:** Access pattern analysis
- **Monthly:** Full security audit
- **Quarterly:** Penetration testing (recommended)

---

## ✅ FINAL PRODUCTION READINESS CHECKLIST

Before deploying to production, ALL items must be checked:

### Critical (Blocking)
- [ ] All 6 critical security issues resolved
- [ ] Security audit passes (0 critical/high issues)
- [ ] All unit tests passing (66/66)
- [ ] Integration tests passing
- [ ] Environment variables configured
- [ ] Secrets properly managed (not in code)
- [ ] RLS enabled on database
- [ ] Rate limiting working with Redis
- [ ] Admin auth bypass disabled

### Important (Should Have)
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Health checks working
- [ ] Documentation updated
- [ ] Backup strategy tested
- [ ] Rollback plan documented
- [ ] Load testing completed
- [ ] Security review completed

### Optional (Nice to Have)
- [ ] Sentry configured
- [ ] Custom alerting rules
- [ ] Performance optimization
- [ ] CDN configured
- [ ] Auto-scaling tested
- [ ] Disaster recovery tested

---

## 📞 SUPPORT & ESCALATION

If you encounter security issues during deployment:

1. **Stop deployment immediately**
2. **Do not expose credentials**
3. **Review this checklist**
4. **Run security audit again**
5. **Consult security team**

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Redis Security](https://redis.io/docs/management/security/)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

**Last Updated:** November 2, 2025  
**Next Review:** Before production deployment  
**Owner:** DevOps/Security Team

