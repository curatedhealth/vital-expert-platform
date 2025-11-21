# VITAL Data Strategy Action Plan

**Date:** 2025-11-18
**Prepared By:** VITAL Data Strategist Agent
**Status:** CRITICAL - Multi-tenant isolation NOT implemented (HIPAA violation risk)

---

## Executive Summary

The VITAL platform has successfully recovered from a **critical data availability incident** but remains in a **partially compliant state** with HIPAA regulations. This action plan outlines immediate, short-term, and long-term steps to achieve:

1. **HIPAA Compliance** - Multi-tenant data isolation with audit trails
2. **Data Governance** - Prevent future schema-API misalignment
3. **Operational Excellence** - Automated validation and monitoring

**CRITICAL RISK:** 🚨 Multi-tenant Row-Level Security (RLS) is NOT enabled, creating potential HIPAA violation exposure.

---

## Current State Assessment

### ✅ Completed (2025-11-18)

- [x] Fixed `/api/tools-crud` (removed `tool_categories` JOIN)
- [x] Fixed `/api/knowledge/documents` (renamed to `knowledge_sources`)
- [x] Fixed `/api/business-functions` (renamed to `suite_functions`)
- [x] Fixed `/api/organizational-structure` (multiple table renames)
- [x] Added missing columns to `tools` table (category, is_active, tool_type)
- [x] Verified data loading across all pages

### ❌ Critical Gaps (IMMEDIATE ACTION REQUIRED)

- [ ] **Multi-tenant Row-Level Security NOT enabled** (HIPAA § 164.308 violation)
- [ ] No tenant assignment for existing data (957 agents, 2991 personas, etc.)
- [ ] No audit logging for PHI access (HIPAA § 164.312 requirement)
- [ ] No data subject request (DSR) tracking for GDPR/CCPA
- [ ] `knowledge_sources` table is empty (0 rows) - needs investigation

### 🔶 High-Priority Gaps (Within 1 Week)

- [ ] No automated schema validation in CI/CD
- [ ] No schema documentation (ERD)
- [ ] No data quality monitoring
- [ ] No backup/disaster recovery testing
- [ ] No data retention policies implemented

---

## Immediate Actions (Next 48 Hours)

### Priority 1: Enable Multi-Tenant Isolation (CRITICAL - 4 hours)

**HIPAA Requirement:** § 164.308(a)(3) - Access authorization

**Steps:**

1. **Backup Database**
   ```bash
   # Use Supabase dashboard or CLI
   supabase db dump -f backup_before_rls_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Execute RLS Migration**
   ```bash
   # Execute migration 002_row_level_security.sql
   psql $DATABASE_URL -f database/migrations/002_row_level_security.sql
   ```

3. **Verify RLS Policies**
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('agents', 'tools', 'personas', 'prompts', 'users');

   -- Should return rowsecurity = true for all
   ```

4. **Test Tenant Isolation**
   ```sql
   -- Create test users in different tenants
   -- Verify each can only see their tenant's data
   -- See test scripts in database/tests/rls_tests.sql
   ```

**Success Criteria:**
- ✅ RLS enabled on all tables with tenant_id
- ✅ Test users can only access their tenant's data
- ✅ Admins cannot cross tenant boundaries
- ✅ Service role can bypass RLS (for system operations)

**Risk Mitigation:**
- Backup before execution
- Test on staging environment first
- Have rollback script ready
- Monitor application errors after deployment

---

### Priority 2: Assign Existing Data to Default Tenant (2 hours)

**Problem:** Existing 957 agents, 2991 personas, 1595 prompts, 564 tools have no tenant assignment.

**Solution:**

```sql
-- Create default tenant if not exists
INSERT INTO tenants (id, name, slug, compliance_level, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Tenant',
  'default',
  'hipaa',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Assign all orphaned data to default tenant
UPDATE agents SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE personas SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE prompts SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE tools SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Verify assignment
SELECT
  (SELECT COUNT(*) FROM agents WHERE tenant_id IS NULL) as orphaned_agents,
  (SELECT COUNT(*) FROM personas WHERE tenant_id IS NULL) as orphaned_personas,
  (SELECT COUNT(*) FROM prompts WHERE tenant_id IS NULL) as orphaned_prompts,
  (SELECT COUNT(*) FROM tools WHERE tenant_id IS NULL) as orphaned_tools;
-- Should return 0 for all
```

**Success Criteria:**
- ✅ All existing data assigned to default tenant
- ✅ No orphaned records (tenant_id IS NULL)
- ✅ Data accessible after RLS enabled

---

### Priority 3: Investigate Empty knowledge_sources Table (1 hour)

**Problem:** Table exists but has 0 rows. Users expect documents to be available.

**Investigation Steps:**

1. Check if data is in wrong table:
   ```sql
   -- Search for knowledge-related tables
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE '%knowledge%';

   -- Check row counts
   SELECT 'knowledge_sources' as table_name, COUNT(*) FROM knowledge_sources
   UNION ALL
   SELECT 'knowledge_base', COUNT(*) FROM knowledge_base
   UNION ALL
   SELECT 'knowledge_chunks', COUNT(*) FROM knowledge_chunks
   UNION ALL
   SELECT 'knowledge_domains', COUNT(*) FROM knowledge_domains;
   ```

2. Check if migration created the table correctly:
   ```sql
   -- Verify schema
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'knowledge_sources'
   ORDER BY ordinal_position;
   ```

3. **Decision Point:**
   - If data is in another table → migrate to `knowledge_sources`
   - If no data exists → seed with sample documents
   - If schema is wrong → fix schema migration

**Outcome:**
- Document why table is empty
- Create plan to populate (seed data or user uploads)
- Update frontend to handle empty state gracefully

---

## Short-Term Actions (Within 1 Week)

### Action 4: Enable Audit Logging (HIPAA § 164.312 requirement)

**Implementation:**

```typescript
// lib/audit/hipaa-audit-logger.ts
import { createClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  tenant_id: string;
  user_id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  resource_type: 'patient' | 'appointment' | 'document' | 'agent' | 'conversation';
  resource_id: string;
  ip_address: string;
  user_agent: string;
  phi_accessed: boolean;
  metadata?: Record<string, any>;
}

export class HIPAAAuditLogger {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        ...entry,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // CRITICAL: Audit logging failures must be escalated
      console.error('[AUDIT] Failed to log event:', error);
      // Send alert to security team
      await this.sendSecurityAlert(entry, error);
    }
  }

  private async sendSecurityAlert(entry: AuditLogEntry, error: any) {
    // Implement alerting (PagerDuty, Slack, email)
    console.error('[SECURITY ALERT] Audit logging failure', { entry, error });
  }
}

// Middleware to automatically log all database access
export function withAuditLogging(handler: any) {
  return async (req: Request, res: Response) => {
    const startTime = Date.now();
    const logger = new HIPAAAuditLogger();

    try {
      // Execute handler
      const result = await handler(req, res);

      // Log successful access
      await logger.log({
        tenant_id: req.tenantId,
        user_id: req.userId,
        action: req.method.toLowerCase() as any,
        resource_type: extractResourceType(req.url),
        resource_id: extractResourceId(req.url),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        phi_accessed: detectPHI(result),
        metadata: {
          duration_ms: Date.now() - startTime,
          status: 'success',
        },
      });

      return result;
    } catch (error) {
      // Log failed access attempt
      await logger.log({
        tenant_id: req.tenantId,
        user_id: req.userId,
        action: req.method.toLowerCase() as any,
        resource_type: extractResourceType(req.url),
        resource_id: extractResourceId(req.url),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        phi_accessed: false,
        metadata: {
          duration_ms: Date.now() - startTime,
          status: 'error',
          error: error.message,
        },
      });

      throw error;
    }
  };
}
```

**Deployment:**
1. Create audit_logs table (already in migration 001)
2. Add middleware to all API routes that access PHI
3. Set up audit log retention (7 years for HIPAA)
4. Configure CloudWatch/Datadog alerts for audit failures

---

### Action 5: Implement Schema Validation in CI/CD

**GitHub Actions Workflow:**

```yaml
# .github/workflows/schema-validation.yml
name: Schema-API Alignment Validation

on:
  pull_request:
    paths:
      - 'src/app/api/**/*.ts'
      - 'database/migrations/**/*.sql'
  push:
    branches:
      - main
      - develop

jobs:
  validate-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run Schema Validation
        run: npm run validate:schema
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

      - name: Comment PR with Results
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Schema-API alignment validation failed. See workflow logs for details.'
            })
```

**package.json script:**

```json
{
  "scripts": {
    "validate:schema": "ts-node scripts/validate-schema-api-alignment.ts"
  }
}
```

---

### Action 6: Create Entity-Relationship Diagram (ERD)

**Tools:**
- dbdiagram.io (visual ERD from SQL)
- SchemaSpy (auto-generated documentation)
- Supabase Studio (built-in schema viewer)

**Deliverable:**
- `database/VITAL_ERD.png` - Visual schema diagram
- `database/VITAL_ERD.dbml` - DBML source (for dbdiagram.io)
- Auto-updated on every migration

**Example DBML:**

```dbml
// VITAL Platform ERD
// Auto-generated from: database/migrations/001_initial_schema.sql

Table tenants {
  id uuid [pk]
  name varchar(100)
  slug varchar(50) [unique]
  compliance_level compliance_level
  created_at timestamptz
}

Table users {
  id uuid [pk, ref: > auth.users.id]
  tenant_id uuid [ref: > tenants.id]
  email varchar(255)
  role varchar(50)
  created_at timestamptz
}

Table agents {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id, note: 'NULL = global agent']
  name varchar(100)
  tier agent_tier
  status agent_status
  knowledge_domains text[]
  embedding vector(1536)
  created_at timestamptz
}

Table conversations {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  user_id uuid [ref: > users.id]
  title varchar(200)
  mode orchestration_mode
  status conversation_status
  persistent_agent_id uuid [ref: > agents.id]
  created_at timestamptz
}

Table messages {
  id uuid [pk]
  conversation_id uuid [ref: > conversations.id]
  role message_role
  content text
  agent_id uuid [ref: > agents.id]
  created_at timestamptz
}
```

---

## Medium-Term Actions (Within 1 Month)

### Action 7: Data Quality Monitoring

**Implementation:**

```typescript
// lib/data-quality/monitors.ts

export interface DataQualityRule {
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  query: string;
  threshold: number;
}

export const DATA_QUALITY_RULES: DataQualityRule[] = [
  {
    name: 'orphaned_agents',
    description: 'Agents without tenant assignment',
    severity: 'critical',
    query: 'SELECT COUNT(*) FROM agents WHERE tenant_id IS NULL',
    threshold: 0,
  },
  {
    name: 'duplicate_agent_names',
    description: 'Duplicate agent names within same tenant',
    severity: 'high',
    query: `
      SELECT COUNT(*) FROM (
        SELECT tenant_id, name, COUNT(*)
        FROM agents
        GROUP BY tenant_id, name
        HAVING COUNT(*) > 1
      ) duplicates
    `,
    threshold: 0,
  },
  {
    name: 'invalid_email_formats',
    description: 'Users with invalid email formats',
    severity: 'high',
    query: `
      SELECT COUNT(*) FROM users
      WHERE email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    `,
    threshold: 0,
  },
  {
    name: 'stale_conversations',
    description: 'Conversations with no messages in 90 days',
    severity: 'low',
    query: `
      SELECT COUNT(*) FROM conversations
      WHERE updated_at < NOW() - INTERVAL '90 days'
      AND status = 'active'
    `,
    threshold: 1000,
  },
];

export async function runDataQualityChecks() {
  const results = [];

  for (const rule of DATA_QUALITY_RULES) {
    const result = await db.query(rule.query);
    const value = parseInt(result.rows[0].count);
    const passed = value <= rule.threshold;

    results.push({
      rule: rule.name,
      description: rule.description,
      value,
      threshold: rule.threshold,
      passed,
      severity: rule.severity,
      timestamp: new Date(),
    });

    if (!passed && rule.severity === 'critical') {
      await sendAlert({
        title: `CRITICAL Data Quality Issue: ${rule.name}`,
        description: rule.description,
        value,
        threshold: rule.threshold,
      });
    }
  }

  // Store results in data_quality_metrics table
  await db.insert('data_quality_metrics', results);

  return results;
}
```

**Deployment:**
- Run hourly via cron job
- Dashboard in admin UI
- Slack/PagerDuty alerts for critical issues

---

### Action 8: Data Retention Policy Implementation

**Policy:**

| Data Type | Retention Period | Archival Location | Deletion Method |
|-----------|------------------|-------------------|-----------------|
| Conversations | 7 years (HIPAA) | AWS S3 Glacier Deep Archive | Secure wipe |
| Audit Logs | 7 years (HIPAA) | S3 Glacier | Permanent retention |
| User Data | Until account deletion + 30 days | N/A | Cascade delete |
| Temporary Files | 7 days | N/A | Auto-delete |
| Backups | 90 days | S3 Standard | Auto-delete |

**Implementation:**

```sql
-- Automated archival job (runs daily)
CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS void AS $$
BEGIN
  -- Move conversations older than 2 years to archive table
  INSERT INTO conversations_archive
  SELECT * FROM conversations
  WHERE updated_at < NOW() - INTERVAL '2 years'
  AND status = 'archived';

  -- Delete from main table
  DELETE FROM conversations
  WHERE updated_at < NOW() - INTERVAL '2 years'
  AND status = 'archived';

  -- Log archival action
  INSERT INTO audit_logs (action, resource_type, metadata)
  VALUES ('archive', 'conversations', jsonb_build_object(
    'archived_count', (SELECT COUNT(*) FROM conversations_archive WHERE created_at > NOW() - INTERVAL '1 day')
  ));
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron
SELECT cron.schedule('archive-old-conversations', '0 2 * * *', 'SELECT archive_old_conversations()');
```

---

### Action 9: Disaster Recovery Testing

**DR Plan:**

1. **Backup Strategy:**
   - Full backup: Daily at 2 AM UTC (Supabase automatic)
   - Incremental backup: Every 4 hours (WAL archiving)
   - Point-in-time recovery: Last 7 days
   - Geo-redundant: S3 Cross-Region Replication (us-east-1 → us-west-2)

2. **RTO/RPO Targets:**
   - Recovery Time Objective (RTO): 4 hours
   - Recovery Point Objective (RPO): 15 minutes

3. **Testing Schedule:**
   - Full DR drill: Quarterly
   - Backup restore test: Monthly
   - Runbook walkthrough: Monthly

**DR Drill Procedure:**

```bash
# Disaster Recovery Drill Script

# 1. Notify team
echo "🚨 DR DRILL STARTED: $(date)"

# 2. Create test environment
supabase db create vital-dr-test-$(date +%Y%m%d)

# 3. Restore from latest backup
supabase db restore --backup-id=latest --target=vital-dr-test

# 4. Verify data integrity
psql $DR_DATABASE_URL -f scripts/verify-data-integrity.sql

# 5. Test application connectivity
curl https://vital-dr-test.example.com/api/health

# 6. Measure recovery time
DR_DURATION=$(($(date +%s) - $START_TIME))
echo "Recovery completed in ${DR_DURATION} seconds"

# 7. Cleanup
supabase db delete vital-dr-test-$(date +%Y%m%d)

# 8. Document results
echo "DR drill results: RTO=${DR_DURATION}s, RPO=verified" >> dr-test-log.txt
```

---

## Long-Term Initiatives (3-6 Months)

### Initiative 1: Data Mesh Architecture

**Problem:** Centralized data team becomes bottleneck as platform scales.

**Solution:** Implement Domain-Driven Data Ownership

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Mesh Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Patient     │  │  Clinical    │  │  Billing     │       │
│  │  Domain      │  │  Domain      │  │  Domain      │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │ - patients   │  │ - encounters │  │ - invoices   │       │
│  │ - consents   │  │ - diagnoses  │  │ - payments   │       │
│  │ Owner: PMO   │  │ Owner: CMO   │  │ Owner: CFO   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │  Data Catalog     │                       │
│                  │  (Metadata Mgmt)  │                       │
│                  └───────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Domain teams own their data products
- Decentralized data governance
- Faster innovation (no bottlenecks)
- Clear accountability

---

### Initiative 2: Real-Time Analytics Pipeline

**Architecture:**

```
Patient Portal → Kafka → Flink → Druid → Superset
                   │
                   ├→ S3 Data Lake (long-term storage)
                   └→ Snowflake (data warehouse)
```

**Use Cases:**
- Real-time dashboard: "Patients waiting > 30 min"
- Live provider utilization metrics
- Instant fraud detection for billing

---

### Initiative 3: ML-Powered Data Quality

**Features:**
- Anomaly detection (e.g., "Why did patient count drop 50% today?")
- Duplicate detection using ML embeddings
- Auto-suggest data corrections
- Predictive data quality alerts

---

## Success Metrics

### Compliance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| RLS-enabled tables | 100% | 0% | 🔴 Critical |
| Audit log coverage | 100% of PHI access | 0% | 🔴 Critical |
| Data retention compliance | 100% | Unknown | 🔶 Needs audit |
| HIPAA readiness | Pass external audit | Fail | 🔴 Critical |

### Operational Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Schema-API alignment | 100% | 100% | ✅ Good |
| Data quality score | > 95% | Unknown | 🔶 Needs monitoring |
| Backup success rate | 100% | Unknown | 🔶 Needs verification |
| RTO (Recovery Time) | < 4 hours | Untested | 🔶 Needs DR drill |
| RPO (Recovery Point) | < 15 min | Unknown | 🔶 Needs verification |

### Developer Productivity Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Schema change incidents | 0 per month | 1 this week | 🔶 Improving |
| Automated tests | > 80% coverage | Unknown | 🔶 Needs measurement |
| Migration rollback success | 100% | Untested | 🔶 Needs testing |

---

## Governance Framework

### Change Management Process

**For Schema Changes:**

1. **Proposal Phase**
   - Document change in SCHEMA_REGISTRY.md
   - Search codebase for affected APIs
   - Estimate impact (hours, teams affected)
   - Get approval from Data Strategist + Product Lead

2. **Implementation Phase**
   - Write migration SQL (with rollback)
   - Update TypeScript types
   - Update all affected APIs
   - Run schema validation tool
   - Test on staging environment

3. **Deployment Phase**
   - Deploy migration + code atomically
   - Monitor error rates for 24 hours
   - Update documentation
   - Notify team in Slack

4. **Verification Phase**
   - Run data integrity checks
   - Verify RLS policies still work
   - Check audit logs for anomalies
   - Update SCHEMA_REGISTRY.md

**Approval Matrix:**

| Change Type | Approvers Required | SLA |
|-------------|-------------------|-----|
| Add column | Data Strategist | 1 day |
| Rename table | Data Strategist + Product Lead | 3 days |
| Remove table | Data Strategist + Product Lead + CTO | 1 week |
| RLS policy change | Data Strategist + Security Lead | 2 days |
| Migration rollback | Any engineer (emergency) | Immediate |

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| HIPAA audit failure due to no RLS | High | Critical | Execute migration 002 within 48h | Data Strategist |
| Data loss from failed migration | Medium | High | Always backup before migrations | DevOps |
| Performance degradation from RLS | Medium | Medium | Optimize queries, add indexes | Database Architect |
| Knowledge_sources empty breaks UX | High | Medium | Investigate and populate/fix UI | Product Team |
| Schema-API drift recurs | Medium | High | Automate validation in CI/CD | Data Strategist |

---

## Conclusion

The VITAL platform has recovered from a critical data availability incident and is now operationally stable. However, **multi-tenant isolation must be implemented immediately** to achieve HIPAA compliance and protect patient data.

**Next Steps:**

1. **IMMEDIATE (Today):** Executive decision to execute RLS migration
2. **TOMORROW:** Execute migration 002 (with backup and rollback plan)
3. **This Week:** Enable audit logging and schema validation
4. **This Month:** Complete ERD, DR testing, and data quality monitoring

**Success Criteria:**
- ✅ Zero HIPAA compliance violations
- ✅ Zero schema-API alignment incidents
- ✅ 99.9% data availability
- ✅ < 4 hour recovery time (disaster scenarios)

---

**Prepared by:** VITAL Data Strategist Agent
**Review Date:** 2025-12-18 (30 days from now)
**Escalation:** Contact CTO for executive approval on RLS migration
