# Archive Directory

This directory contains archived code from the VITAL Platform codebase cleanup process.

## Archive Date: December 11, 2025

## Directory Structure

```
_archive/
├── 2025-12-11/
│   ├── python-files/           # Python code moved to services/ai-engine
│   │   ├── agents/            # Agent implementations (now in ai-engine)
│   │   ├── api/               # Python API (superseded by FastAPI in ai-engine)
│   │   ├── orchestration/     # Orchestration logic (now LangGraph in ai-engine)
│   │   ├── services/          # Service implementations
│   │   └── ...                # Other Python modules
│   │
│   ├── scripts-one-time-operations/    # Database setup scripts (already executed)
│   │   ├── assign-avatars-to-agents.ts
│   │   ├── check-prompts-schema.ts
│   │   ├── create-prompts-table.ts
│   │   ├── populate-display-names.ts
│   │   └── remove-agent-copies.ts
│   │
│   └── scripts-test-utilities/         # Test/debugging scripts (not for production)
│       ├── test-csv-parsing.ts
│       ├── test-langgraph-integration.ts
│       ├── test-mode1-e2e.ts
│       ├── test-monitoring.ts
│       └── test-prompt-api.ts
│
└── orphan-files-2025-12-11/    # Orphaned/superseded files
    ├── VitalAIOrchestrator.ts
    └── page.tsx (various)
```

## Reason for Archival

### Python Files (58 files)
- **Status**: Superseded
- **Reason**: Python backend code has been consolidated into `services/ai-engine/`
- **Impact**: None - functionality preserved in new location

### One-Time Operation Scripts (5 files)
- **Status**: Completed operations
- **Reason**: Database migration/setup scripts that have already been executed
- **Impact**: None - these scripts completed their purpose

### Test Utility Scripts (5 files)
- **Status**: Development utilities
- **Reason**: Ad-hoc test scripts not needed for production deployment
- **Impact**: None - proper test suites exist in `__tests__/` and `tests/`

### Orphan Files (3 files)
- **Status**: Superseded
- **Reason**: Earlier implementations replaced by current architecture
- **Impact**: None - functionality exists in current codebase

## Retained Production Scripts

The following scripts remain in `scripts/` for production use:

1. **validate-environment.ts** - Environment configuration validator (CI/CD)
2. **validate-schema-api-alignment.ts** - Schema-API alignment checker (CI/CD)

## Recovery

If you need to restore any archived files:

```bash
# Example: Restore a specific file
cp _archive/2025-12-11/scripts-one-time-operations/assign-avatars-to-agents.ts scripts/

# Example: Restore entire folder
cp -r _archive/2025-12-11/python-files/agents src/agents
```

## Cleanup Audit Details

- **Audit Date**: December 11, 2025
- **Audit Agents**:
  - `agent-vital-code-reviewer` (backend analysis)
  - `agent-frontend-ui-architect` (frontend analysis)
- **Files Reviewed**: 226+
- **Files Archived**: 68+
- **Files Deleted** (via git): 172+ (already shown as `D` in git status)
