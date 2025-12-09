#!/usr/bin/env bash
set -euo pipefail

# Local E2E runner for Ask Expert
# - Backend API tests: pytest (marks e2e) under services/ai-engine
# - Frontend E2E: Playwright tests under apps/vital-system/tests/e2e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export ASK_EXPERT_BASE_URL="${ASK_EXPERT_BASE_URL:-http://localhost:8000}"
export BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Running backend API E2E..."
cd "$ROOT_DIR/services/ai-engine"
pytest src/tests/e2e -m "not slow" || exit 1

echo "Running frontend Playwright E2E..."
cd "$ROOT_DIR/apps/vital-system"
npm run test:e2e -- --project=chromium

echo "E2E runs completed."
