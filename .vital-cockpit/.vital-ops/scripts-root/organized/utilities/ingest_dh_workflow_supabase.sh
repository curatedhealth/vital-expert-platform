#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/ingest_dh_workflow_supabase.sh --tenant <tenant-slug> --file <path/to/workflow.json> [--db-url <postgres-url>]

Arguments:
  --tenant   Required. Tenant slug (e.g. platform, digital-health-startup).
  --file     Required. JSON file describing the workflow (matches dh_ingest_workflow schema).
  --db-url   Optional. Postgres URL. Defaults to SUPABASE_DB_URL env var if set.

Requirements:
  - Supabase CLI installed (used to retrieve credentials/keep workflow consistent).
  - psql available in PATH (ships with Supabase local stack or Postgres installation).
  - Environment variable SUPABASE_DB_URL exported, or pass --db-url explicitly.

The script:
  1. Base64-encodes the JSON payload.
  2. Runs SQL against the target database to set tenant context (app.tenant_id).
  3. Calls dh_ingest_workflow_by_slug to upsert the workflow.

Example:
  export SUPABASE_DB_URL="$(supabase status --output env | awk -F= '/SUPABASE_DB_URL/{print $2}')"
  ./scripts/ingest_dh_workflow_supabase.sh --tenant platform --file services/ai-engine/examples/UC_CD_001_ENDPOINT_SELECTION_VALIDATION.json

EOF
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

TENANT_SLUG=""
JSON_FILE=""
DB_URL="${SUPABASE_DB_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tenant)
      TENANT_SLUG="$2"; shift 2 ;;
    --file)
      JSON_FILE="$2"; shift 2 ;;
    --db-url)
      DB_URL="$2"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$TENANT_SLUG" ]]; then
  echo "Error: --tenant is required" >&2
  usage
  exit 1
fi

if [[ -z "$JSON_FILE" ]]; then
  echo "Error: --file is required" >&2
  usage
  exit 1
fi

if [[ ! -f "$JSON_FILE" ]]; then
  echo "Error: JSON file not found at $JSON_FILE" >&2
  exit 1
fi

if [[ -z "$DB_URL" ]]; then
  echo "Error: SUPABASE_DB_URL not set and --db-url not provided." >&2
  echo "Obtain it via Supabase CLI, e.g.:" >&2
  echo "  supabase status --output env | awk -F= '/SUPABASE_DB_URL/{print \\$2}'" >&2
  exit 1
fi

PSQL_CMD=()
if command -v psql >/dev/null 2>&1; then
  PSQL_CMD=(psql "$DB_URL")
else
  if command -v docker >/dev/null 2>&1; then
    DOCKER_DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep '^supabase_db' | head -n 1)
    if [[ -n "$DOCKER_DB_CONTAINER" ]]; then
      PSQL_CMD=(docker exec -i "$DOCKER_DB_CONTAINER" psql -U postgres -d postgres)
    fi
  fi

  if [[ ${#PSQL_CMD[@]} -eq 0 ]]; then
    echo "Error: neither local 'psql' nor a running 'supabase_db' docker container was found." >&2
    exit 1
  fi
fi

# Base64-encode JSON payload to avoid quoting issues during psql substitution
PAYLOAD_B64=$(python3 - "$JSON_FILE" <<'PY'
import base64, sys, json, pathlib
path = pathlib.Path(sys.argv[1])
data = path.read_bytes()
print(base64.b64encode(data).decode('ascii'))
PY
)

# Verify tenant exists to fail fast
TENANT_EXISTS=$("${PSQL_CMD[@]}" -Atqc "SELECT 1 FROM tenants WHERE slug = '$TENANT_SLUG' LIMIT 1;") || true
if [[ "$TENANT_EXISTS" != "1" ]]; then
  echo "Error: tenant slug '$TENANT_SLUG' not found in tenants table." >&2
  exit 1
fi

"${PSQL_CMD[@]}" <<SQL
\set ON_ERROR_STOP on
\set payload_b64 '$PAYLOAD_B64'
BEGIN;
DO \$\$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE slug = '${TENANT_SLUG}'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant slug % not found.', '${TENANT_SLUG}';
  END IF;

  PERFORM set_config('app.tenant_id', v_tenant_id::text, true);
END;
\$\$ LANGUAGE plpgsql;

SELECT dh_ingest_workflow_by_slug(
  '${TENANT_SLUG}',
  convert_from(decode(:'payload_b64', 'base64'), 'utf8')::jsonb
);
COMMIT;
SQL

echo "Ingestion complete for tenant '$TENANT_SLUG' using JSON file '$JSON_FILE'."
