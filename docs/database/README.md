# Digital Health Workflow Seeds

Place all Digital Health workflow JSON payloads in this directory. Each file
should follow the structure described in `services/ai-engine/DIGITAL_HEALTH_DATA_ARCHITECTURE.md`
and can be generated from the working examples under
`services/ai-engine/examples/`.

## Ingestion

1. Make sure the database migrations introducing the `dh_*` tables and
   functions have been applied.
2. Export your Supabase Postgres connection string (or pass `--db-url`):

   ```bash
   export SUPABASE_DB_URL="$(supabase status --output env | awk -F= '/SUPABASE_DB_URL/{print $2}')"
   ```

3. Run the batch ingestion script, specifying the tenant slug and optional
   folder (defaults to this directory):

   ```bash
   ./scripts/ingest_all_dh_workflows.sh --tenant platform
   ```

   To ingest a single file, use:

   ```bash
   ./scripts/ingest_dh_workflow_supabase.sh \
     --tenant platform \
     --file database/sql/workflows-dh-seeds/UC_CD_001_ENDPOINT_SELECTION_VALIDATION.json
   ```

The ingestion is idempotent—running the scripts multiple times updates existing
records without duplicating data. Alternatively, you can execute the SQL seed
directly with psql:

```sql
\i database/sql/workflows-dh-seeds/seed_workflows.sql
```

Edit the tenant slug at the top of `seed_workflows.sql` before running.

## Enhanced JSON schema

The file `TEMPLATE_ENHANCED_WORKFLOW.json` contains the recommended structure
covering multi-tenancy, compliance, governance, and automation metadata. Use it
as a starting point when authoring new workflow payloads—the ingestion function
maps these fields into the new columns introduced by the
`20251101120500_enhance_digital_health_workflows.sql` migration.
