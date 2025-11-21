#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/ingest_all_dh_workflows.sh --tenant <tenant-slug> [--folder <folder>] [--db-url <postgres-url>]

Arguments:
  --tenant   Required. Tenant slug (e.g. platform, digital-health-startup).
  --folder   Optional. Folder containing workflow JSON files (default: database/sql/workflows-dh-seeds).
  --db-url   Optional. Postgres URL (defaults to SUPABASE_DB_URL env var).

The script loops over every *.json file in the target folder (sorted) and calls
scripts/ingest_dh_workflow_supabase.sh for each file, ensuring idempotent ingestion.

Example:
  export SUPABASE_DB_URL="$(supabase status --output env | awk -F= '/SUPABASE_DB_URL/{print $2}')"
  ./scripts/ingest_all_dh_workflows.sh --tenant platform

EOF
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

TENANT_SLUG=""
FOLDER="database/sql/workflows-dh-seeds"
DB_URL="${SUPABASE_DB_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tenant)
      TENANT_SLUG="$2"; shift 2 ;;
    --folder)
      FOLDER="$2"; shift 2 ;;
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

if [[ ! -d "$FOLDER" ]]; then
  echo "Error: folder '$FOLDER' does not exist" >&2
  exit 1
fi

# Collect JSON files without relying on bash 4+ features (macOS compatibility)
JSON_FILES=()
while IFS= read -r file; do
  [[ -n "$file" ]] && JSON_FILES+=("$file")
done < <(find "$FOLDER" -maxdepth 1 -type f -name '*.json' | sort)

if [[ ${#JSON_FILES[@]} -eq 0 ]]; then
  echo "No JSON files found in '$FOLDER'. Nothing to ingest." >&2
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INGEST_SCRIPT="$SCRIPT_DIR/ingest_dh_workflow_supabase.sh"

if [[ ! -x "$INGEST_SCRIPT" ]]; then
  echo "Error: dependency script '$INGEST_SCRIPT' is missing or not executable." >&2
  exit 1
fi

for json_file in "${JSON_FILES[@]}"; do
  echo "Ingesting $(basename "$json_file") for tenant '$TENANT_SLUG'..."
  if [[ -n "$DB_URL" ]]; then
    "$INGEST_SCRIPT" --tenant "$TENANT_SLUG" --file "$json_file" --db-url "$DB_URL"
  else
    "$INGEST_SCRIPT" --tenant "$TENANT_SLUG" --file "$json_file"
  fi
done

echo "Completed ingestion for ${#JSON_FILES[@]} file(s) in '$FOLDER'."
