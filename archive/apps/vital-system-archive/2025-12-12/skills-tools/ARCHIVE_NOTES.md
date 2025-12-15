# Archive Notes - Skills & Tools

**Date**: December 12, 2025
**Asset**: Skills & Tools (Foundation Layer)
**Reason**: Deployment cleanup - superseded/deprecated files

---

## What's Archived

### Frontend Files
| File | Original Location | Reason |
|------|------------------|--------|
| `tool-registry.ts` | `features/chat/tools/` | Orphaned shim to non-existent legacy archive |

### Database - Skills
| File | Original Location | Reason |
|------|------------------|--------|
| `master_seed_all_skills.sql` | `database/data/skills/` | Superseded by `FINAL_seed_all_58_skills.sql` |
| `seed_all_vital_skills.sql` | `database/data/skills/` | Superseded by `FINAL_seed_all_58_skills.sql` |
| `seed_awesome_claude_skills.sql` | `database/data/skills/` | Superseded by `FINAL_seed_all_58_skills.sql` |

### Database - Tools
| File | Original Location | Reason |
|------|------------------|--------|
| `37_healthcare_pharma_oss_tools_part1.sql` | `database/migrations/seeds/tools/` | Superseded by `*_complete.sql` |
| `20251102_seed_all_tools.sql` | `database/migrations/seeds/tools/` | Old seed - replaced by numbered series |
| `20251102_seed_core_tools.sql` | `database/migrations/seeds/tools/` | Old seed - replaced by numbered series |
| `20251102_link_tools_to_agents.sql` | `database/migrations/seeds/tools/` | Old linking - superseded |
| `20251102_link_ai_tools_to_tasks.sql` | `database/migrations/seeds/tools/` | Old linking - superseded |
| `20251126_expand_tool_registry.sql` | `database/seeds/` | Old expansion - superseded |

---

## Canonical Files (Use These Instead)

### Skills
- `database/data/skills/FINAL_seed_all_58_skills.sql` - Primary skill seeding
- `database/data/skills/assign_skills_to_agents.sql` - Agent assignments
- `database/data/skills/assign_skills_by_agent_level.sql` - Level-based assignments
- `database/seeds/data/skills_from_folder.sql` - Additional 8 skills

### Tools
- `database/migrations/seeds/tools/02_foundation_tools.sql` - Foundation layer
- `database/migrations/seeds/tools/35_expand_tool_registry_30_new_tools.sql` - Extended registry
- `database/migrations/seeds/tools/36_academic_medical_literature_tools.sql` - Literature tools
- `database/migrations/seeds/tools/37_healthcare_pharma_oss_tools_complete.sql` - Complete OSS tools
- `database/migrations/seeds/tools/38_strategic_intelligence_tools.sql` - Strategic tools

### Frontend Tool Registry
- `apps/vital-system/src/lib/services/tool-registry-service.ts` - Primary service

---

## Restoration Instructions

If you need to restore any of these files:

```bash
# Example: Restore a file
cp apps/vital-system/_archive/2025-12-12/skills-tools/database/skills/master_seed_all_skills.sql database/data/skills/
```

**Warning**: These files were archived because they contain outdated data or duplicate functionality. Restoring them may cause conflicts with canonical files.

---

## Related Documentation

- Audit Report: `docs/audits/ASSET_1_SKILLS_TOOLS_AUDIT.md`
- Deployment Plan: `docs/architecture/DEPLOYMENT_READY_STRUCTURE.md`

---

*Archived as part of VITAL Platform deployment preparation*
