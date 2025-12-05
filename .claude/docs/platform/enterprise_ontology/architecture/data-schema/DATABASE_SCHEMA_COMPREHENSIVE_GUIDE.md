# Database Schema - Comprehensive Developer Guide

**Database**: PostgreSQL 15 + Supabase
**Total Tables**: 85+
**Schema Version**: 2.0 (Comprehensive Schema)
**Last Migration**: `20251120000002_comprehensive_schema.sql`
**Last Updated**: 2025-11-22

---

## Executive Summary

The VITAL database is a **multi-tenant PostgreSQL database** with 85+ tables organized into 12 logical domains. It supports the entire VITAL platform including organizational structure, personas, JTBDs, agents, RAG infrastructure, and all services (Ask Expert, Ask Panel, etc.).

**Key Principles**:
- ✅ **Multi-Tenancy**: Every table has `tenant_id` with Row-Level Security (RLS)
- ✅ **Audit Trails**: `created_at`, `updated_at`, `created_by` on all tables
- ✅ **Soft Deletes**: `deleted_at` on critical tables
- ✅ **JSONB for Flexibility**: Metadata, settings, and complex nested data
- ✅ **Full-Text Search**: `tsvector` generated columns for searchable text
- ✅ **Vector Search**: pgvector extension for embeddings (1536 dimensions)

---

## Quick Reference

| Domain | Tables | Key Purpose |
|--------|--------|-------------|
| **Core** | 3 | Tenants, users, profiles |
| **Organization** | 12 | Functions, departments, roles, responsibilities |
| **Personas** | 25 | User personas + 24 junction tables |
| **JTBDs** | 8 | Jobs-to-be-done framework |
| **Agents** | 5 | AI expert agents + capabilities |
| **Ask Expert** | 2 | Sessions + messages |
| **Ask Panel** | 4 | Panel templates, sessions, messages |
| **RAG** | 3 | Knowledge documents, chunks, entities |
| **Skills** | 3 | Skills, capabilities, proficiency mapping |
| **Workflows** | 2 | LangGraph state machines |
| **Analytics** | 3 | Events, metrics, feedback |
| **Knowledge** | 4 | Knowledge domains, taxonomy |

---

## Related Documentation

- **Data Population Guide**: `DATA_POPULATION_GUIDE.md` - How to populate all tables with seed data
- **Schema Update Checklist**: `SCHEMA_UPDATE_CHECKLIST.md` - Workflow for schema changes
- **Gold Standard Schema**: `GOLD_STANDARD_SCHEMA.md` - Complete schema reference
- **Seed Files**: `vital-expert-data-schema/05-seeds/` - All seed SQL files (100+)
- **Migrations**: `supabase/migrations/` - All schema migrations

---

**Maintained By**: Database Architect, SQL/Supabase Specialist
**Questions?**: See [CATALOGUE.md](../../CATALOGUE.md)
**Last Updated**: 2025-11-22
