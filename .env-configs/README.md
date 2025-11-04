# 🔐 Environment Configuration Management

**Last Updated**: November 4, 2025  
**Purpose**: Centralized management of all environment files with secrets

⚠️ **CRITICAL**: This directory contains **SECRET KEYS** and is **GITIGNORED**

---

## 📁 Directory Structure

```
.env-configs/
├── root/                       # Root-level environment files
│   ├── .env                    # Main environment (dev/local)
│   ├── .env.local              # Local overrides
│   ├── .env.production         # Production config
│   └── .env.vercel             # Vercel deployment config
├── apps/                       # Application-specific configs
│   ├── digital-health-startup/
│   │   ├── .env.local          # Digital health app local config
│   │   └── .env.local.bak      # Backup
│   └── ask-panel/
│       └── .env.local          # Ask panel app local config
├── services/                   # Service-specific configs
│   ├── ai-engine/
│   │   ├── .env                # AI Engine main config
│   │   ├── .env.local          # AI Engine local overrides
│   │   ├── .env.bak            # AI Engine backup
│   │   └── .env.database       # Database-specific config
│   └── api-gateway/
│       └── .env                # API Gateway config
├── backups/                    # Historical backups
│   ├── .env.production.20251023 # Production backup (Oct 23)
│   └── .env.monitoring         # Monitoring config backup
├── templates/                  # Example templates (no secrets)
│   ├── .env.example            # Root example
│   ├── .env.ai-engine.example  # AI Engine example
│   ├── .env.ai-engine.template # AI Engine template
│   ├── .env.api-gateway.example # API Gateway example
│   └── .env.monitoring.example # Monitoring example
└── README.md                   # This file
```

---

## 🎯 Usage Guide

### Active Environment Files (Use These)

#### **Root Level**
```bash
# Development/Local
cp .env-configs/root/.env .env

# Local overrides
cp .env-configs/root/.env.local .env.local

# Production
cp .env-configs/root/.env.production .env.production

# Vercel deployment
cp .env-configs/root/.env.vercel .env.vercel
```

#### **Digital Health App**
```bash
cp .env-configs/apps/digital-health-startup/.env.local \
   apps/digital-health-startup/.env.local
```

#### **Ask Panel App**
```bash
cp .env-configs/apps/ask-panel/.env.local \
   apps/ask-panel/.env.local
```

#### **AI Engine Service**
```bash
# Main config
cp .env-configs/services/ai-engine/.env \
   services/ai-engine/.env

# Database config
cp .env-configs/services/ai-engine/.env.database \
   services/ai-engine/.env.database
```

#### **API Gateway Service**
```bash
cp .env-configs/services/api-gateway/.env \
   services/api-gateway/.env
```

---

## 🔄 Restore All Environment Files

Quick script to restore all environment files to their original locations:

```bash
#!/bin/bash
# restore-env-files.sh

# Root
cp .env-configs/root/.env .env
cp .env-configs/root/.env.local .env.local
cp .env-configs/root/.env.production .env.production
cp .env-configs/root/.env.vercel .env.vercel

# Apps
cp .env-configs/apps/digital-health-startup/.env.local \
   apps/digital-health-startup/.env.local
cp .env-configs/apps/ask-panel/.env.local \
   apps/ask-panel/.env.local

# Services
cp .env-configs/services/ai-engine/.env services/ai-engine/.env
cp .env-configs/services/ai-engine/.env.database services/ai-engine/.env.database
cp .env-configs/services/api-gateway/.env services/api-gateway/.env

echo "✅ All environment files restored"
```

---

## 📦 What's Included

### Root Environment Files (4 files)

**`.env`** (2.4KB)
- Main environment configuration
- Used for development/local

**`.env.local`** (3.8KB)
- Local overrides
- User-specific settings

**`.env.production`** (116B)
- Production-specific config
- Minimal overrides

**`.env.vercel`** (3.9KB)
- Vercel platform configuration
- Deployment-specific variables

---

### App Environment Files (3 files)

**`apps/digital-health-startup/.env.local`** (8KB)
- Digital health startup app config
- Supabase, API URLs, feature flags

**`apps/digital-health-startup/.env.local.bak`** (8KB)
- Backup of digital health config
- Restore point if needed

**`apps/ask-panel/.env.local`** (4KB)
- Ask Panel app configuration
- API endpoints, auth settings

---

### Service Environment Files (5 files)

**`services/ai-engine/.env`** (4KB)
- AI Engine main configuration
- OpenAI keys, Supabase, Redis, Pinecone

**`services/ai-engine/.env.local`** (0B)
- Empty local overrides file
- Can be populated if needed

**`services/ai-engine/.env.bak`** (4KB)
- Backup of AI Engine config
- Restore point

**`services/ai-engine/.env.database`** (4KB)
- Database-specific configuration
- Connection strings, pool settings

**`services/api-gateway/.env`** (4KB)
- API Gateway configuration
- Auth, CORS, rate limiting

---

### Templates (5 files)

**Purpose**: Example files **without secrets** for reference

- `.env.example` - Root template
- `.env.ai-engine.example` - AI Engine template
- `.env.ai-engine.template` - AI Engine template variant
- `.env.api-gateway.example` - API Gateway template
- `.env.monitoring.example` - Monitoring template

**These are safe to commit** (no secrets)

---

### Backups (2 files)

**`.env.production.20251023`**
- Production backup from October 23, 2025
- Restore point for production config

**`.env.monitoring`**
- Infrastructure monitoring config
- Historical backup

---

## 🔐 Security Best Practices

### ✅ DO:
1. ✅ Keep `.env-configs/` in `.gitignore`
2. ✅ Backup regularly to secure location
3. ✅ Use different keys for dev/staging/prod
4. ✅ Rotate secrets periodically
5. ✅ Use templates (`.env.example`) for documentation
6. ✅ Store production secrets in platform (Railway, Vercel)

### ❌ DON'T:
1. ❌ Commit `.env-configs/` to git
2. ❌ Share `.env` files via email/Slack
3. ❌ Use production keys in development
4. ❌ Hardcode secrets in source code
5. ❌ Leave backup files in public directories

---

## 🔄 Backup Strategy

### Manual Backup
```bash
# Create timestamped backup
DATE=$(date +%Y%m%d_%H%M%S)
cp -r .env-configs .env-configs-backup-$DATE
echo "Backup created: .env-configs-backup-$DATE"
```

### Restore from Backup
```bash
# List available backups
ls -d .env-configs-backup-* | sort -r

# Restore specific backup
cp -r .env-configs-backup-20251104_103000/* .env-configs/
```

---

## 📊 File Inventory

| Location | Files | Total Size |
|----------|-------|------------|
| **Root** | 4 | ~10KB |
| **Apps** | 3 | ~20KB |
| **Services** | 5 | ~16KB |
| **Templates** | 5 | ~23KB |
| **Backups** | 2 | ~4KB |
| **Total** | **19** | **~73KB** |

---

## 🎯 Common Scenarios

### New Developer Onboarding
```bash
# 1. Copy templates
cp .env-configs/templates/.env.example .env

# 2. Get secrets from team lead (secure method)
# 3. Update .env with real secrets

# 4. Restore all configs
bash restore-env-files.sh
```

### Environment Sync
```bash
# Sync from Railway
railway variables --json > .env-configs/services/ai-engine/.env.railway

# Sync from Vercel
vercel env pull .env-configs/root/.env.vercel
```

### Key Rotation
```bash
# 1. Backup current configs
cp -r .env-configs .env-configs-backup-$(date +%Y%m%d)

# 2. Update keys in .env-configs/
# 3. Test locally
# 4. Deploy to platforms
# 5. Verify all services work
```

---

## 🔍 Finding Specific Keys

### Search for a specific key
```bash
# Find which files contain a key
grep -r "OPENAI_API_KEY" .env-configs/

# Find all API keys
grep -r "_API_KEY" .env-configs/

# Find all database URLs
grep -r "DATABASE_URL" .env-configs/
```

### List all keys in a file
```bash
# Extract all variable names
grep "^[A-Z]" .env-configs/root/.env | cut -d= -f1 | sort
```

---

## 🚨 Emergency Procedures

### Lost/Exposed Keys
1. **Immediately** rotate all exposed keys
2. Update `.env-configs/` with new keys
3. Deploy to all environments
4. Check logs for unauthorized access
5. Document incident

### Accidental Git Commit
```bash
# Remove from git history (DANGEROUS - coordinate with team)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (ONLY if coordinated)
# git push origin --force --all
```

**Better**: Use GitHub's secret scanning and rotate exposed keys

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Verify all `.env` files are in `.gitignore`
- [ ] Check for accidentally committed secrets
- [ ] Review access logs

### Monthly
- [ ] Backup `.env-configs/` to secure location
- [ ] Review and remove unused keys
- [ ] Update templates with new keys

### Quarterly
- [ ] Rotate critical secrets
- [ ] Audit who has access
- [ ] Update security documentation

---

## ⚠️ Important Notes

1. **`.env-configs/` is GITIGNORED**
   - Never commit this directory
   - Verified in `.gitignore`

2. **Templates are safe**
   - Example files can be committed
   - No real secrets in templates

3. **Platform secrets**
   - Railway: Managed in dashboard
   - Vercel: Managed in dashboard
   - Don't duplicate unnecessarily

4. **Backup strategy**
   - Keep secure offline backups
   - Use password manager for critical keys
   - Document key ownership

---

## 🎉 Benefits of This Organization

✅ **Centralized** - All env files in one place  
✅ **Organized** - Clear structure by component  
✅ **Secure** - Gitignored, documented security practices  
✅ **Backed up** - Historical versions preserved  
✅ **Documented** - Templates and examples available  
✅ **Easy restore** - Single script to restore all files  

---

## 📞 Support

**Questions about keys?**
- Check templates first
- Ask team lead for production secrets
- Never share secrets via insecure channels

**Lost access?**
- Use backup files from `.env-configs/backups/`
- Check platform dashboards (Railway, Vercel)
- Contact infrastructure team

---

**Last Organized**: November 4, 2025  
**Total Files**: 19  
**Security Level**: 🔐 High  
**Status**: ✅ Clean and organized

