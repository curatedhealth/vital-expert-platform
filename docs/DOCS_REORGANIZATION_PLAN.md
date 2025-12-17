# Documentation Reorganization Plan

**Date:** December 6, 2025  
**Purpose:** Clarify what stays in `/docs` vs moves to `/.claude/docs`

---

## Philosophy

| Location | Purpose | Audience |
|----------|---------|----------|
| `/docs` | **Public-facing** developer documentation | External developers, integrators, new team members |
| `/.claude/docs` | **Internal** comprehensive platform docs | Platform team, AI agents, architects |

---

## `/docs` Analysis & Recommendations

### ✅ KEEP in `/docs` (Public Developer Docs)

These are properly placed for external/developer consumption:

```
docs/
├── README.md                              ✅ KEEP - Entry point
├── api/
│   └── openapi.yaml                       ✅ KEEP - API reference
├── architecture/
│   ├── overview.md                        ✅ KEEP - Architecture intro
│   └── MODE_1_ASK_EXPERT.md               ⚠️ MOVE → /.claude/docs/services/ask-expert/
├── guides/
│   ├── getting-started.md                 ✅ KEEP - Onboarding
│   ├── development.md                     ✅ KEEP - Dev setup
│   ├── deployment.md                      ✅ KEEP - Deploy guide
│   ├── 01_technical_implementation.md     ✅ KEEP - Technical guide
│   └── 02_enterprise_ontology_guide.md    ✅ KEEP - Domain guide
└── platform/
    └── enterprise_ontology/
        └── README.md                      ✅ KEEP - Platform feature doc
```

### 🔄 MOVE to `/.claude/docs` (Internal Docs)

These are internal/historical and belong in the internal docs:

```
MOVE TO /.claude/docs/services/ask-expert/archive/:
  docs/ai-engine/
  ├── ASK_EXPERT_DEPLOYMENT_STATUS.md
  ├── DEPLOY_ASK_EXPERT_FIX.md
  ├── FINAL_REPORT.md
  ├── FRONTEND_BACKEND_CONNECTION.md
  ├── IMPLEMENTATION_SUMMARY.md
  ├── LANGCHAIN_UPGRADE_NOTES.md
  ├── MIGRATION_DEPLOYMENT_INSTRUCTIONS.md
  ├── MODE_3_4_FIXES.md
  ├── MODE_4_FIXES_COMPLETE.md
  ├── TEST_REPORT.md
  ├── WORKFLOW_ENHANCEMENTS_COMPLETION_SUMMARY.md
  └── WORKFLOW_GOLD_STANDARD_CROSSCHECK.md

MOVE TO /.claude/docs/operations/:
  docs/ai-engine/
  ├── DEPLOYMENT_GUIDE.md                  → operations/deployment/
  ├── RLS_DEPLOYMENT_GUIDE.md              → operations/security/
  ├── MULTI_LEVEL_PRIVACY_GUIDE.md         → operations/security/
  ├── MULTI_TENANT_STRATEGY.md             → operations/security/
  ├── PYTHON_SECURITY_UPDATE.md            → operations/security/
  ├── SSL_FIX_SUMMARY.md                   → operations/security/
  └── WORKFLOW_SERVICES_INTEGRATION_MAP.md → operations/integrations/

MOVE TO /.claude/docs/platform/agents/:
  docs/
  ├── AGENT_0S_BUSINESS_GUIDE.md           → platform/agents/
  └── AGENT_0S_VISUAL_GUIDE.md             → platform/agents/

MOVE TO /.claude/docs/platform/:
  docs/
  ├── cdc_pipeline_setup.md                → platform/data-loading/
  ├── L3_schema_assessment.md              → platform/enterprise_ontology/
  ├── ontology_gap_analysis.md             → platform/enterprise_ontology/
  └── pinecone_namespace_taxonomy.md       → platform/knowledge-graph/

MOVE TO /.claude/docs/architecture/:
  docs/architecture/
  └── MODE_1_ASK_EXPERT.md                 → services/ask-expert/archive/
```

---

## Recommended Final `/docs` Structure

After cleanup, `/docs` should be minimal and developer-focused:

```
docs/
├── README.md                    # Welcome & navigation
├── api/
│   └── openapi.yaml            # API specification
├── architecture/
│   └── overview.md             # High-level system architecture
├── guides/
│   ├── getting-started.md      # Quick start (15 min)
│   ├── development.md          # Local dev setup
│   ├── deployment.md           # Production deployment
│   ├── 01_technical_implementation.md
│   └── 02_enterprise_ontology_guide.md
└── platform/
    └── enterprise_ontology/
        └── README.md           # Feature documentation
```

**Total: ~10 files** - Clean, focused, developer-friendly

---

## Execution Commands

```bash
# Create target directories if needed
mkdir -p "/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/operations/deployment"
mkdir -p "/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/operations/security"
mkdir -p "/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/operations/integrations"

# Move ai-engine docs to ask-expert archive
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/docs/ai-engine"
mv ASK_EXPERT_DEPLOYMENT_STATUS.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv DEPLOY_ASK_EXPERT_FIX.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv FINAL_REPORT.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv FRONTEND_BACKEND_CONNECTION.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv IMPLEMENTATION_SUMMARY.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv LANGCHAIN_UPGRADE_NOTES.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv MIGRATION_DEPLOYMENT_INSTRUCTIONS.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv MODE_3_4_FIXES.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv MODE_4_FIXES_COMPLETE.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv TEST_REPORT.md "../../.claude/docs/services/ask-expert/archive/audits/"
mv WORKFLOW_ENHANCEMENTS_COMPLETION_SUMMARY.md "../../.claude/docs/services/ask-expert/archive/implementation/"
mv WORKFLOW_GOLD_STANDARD_CROSSCHECK.md "../../.claude/docs/services/ask-expert/archive/audits/"

# Move operations docs
mv DEPLOYMENT_GUIDE.md "../../.claude/docs/operations/deployment/"
mv RLS_DEPLOYMENT_GUIDE.md "../../.claude/docs/operations/security/"
mv MULTI_LEVEL_PRIVACY_GUIDE.md "../../.claude/docs/operations/security/"
mv MULTI_TENANT_STRATEGY.md "../../.claude/docs/operations/security/"
mv PYTHON_SECURITY_UPDATE.md "../../.claude/docs/operations/security/"
mv SSL_FIX_SUMMARY.md "../../.claude/docs/operations/security/"
mv WORKFLOW_SERVICES_INTEGRATION_MAP.md "../../.claude/docs/operations/integrations/"

# Move agent docs
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/docs"
mv AGENT_0S_BUSINESS_GUIDE.md "../.claude/docs/platform/agents/"
mv AGENT_0S_VISUAL_GUIDE.md "../.claude/docs/platform/agents/"

# Move platform docs
mv cdc_pipeline_setup.md "../.claude/docs/platform/data-loading/"
mv L3_schema_assessment.md "../.claude/docs/platform/enterprise_ontology/"
mv ontology_gap_analysis.md "../.claude/docs/platform/enterprise_ontology/"
mv pinecone_namespace_taxonomy.md "../.claude/docs/platform/knowledge-graph/"

# Move architecture mode doc
mv architecture/MODE_1_ASK_EXPERT.md "../.claude/docs/services/ask-expert/archive/v1-reference/"

# Remove empty ai-engine folder
rmdir ai-engine 2>/dev/null || echo "ai-engine not empty"
```

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Files in `/docs` | ~35 | ~10 |
| Purpose clarity | Mixed | Developer-focused |
| Internal docs in `/docs` | ~25 | 0 |

**Result:** Clean separation between public developer docs and internal platform documentation.











