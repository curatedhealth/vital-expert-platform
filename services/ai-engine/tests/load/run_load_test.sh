#!/bin/bash
# =============================================================================
# VITAL AI Engine Load Testing Runner
# =============================================================================
#
# Usage:
#   ./run_load_test.sh smoke        # Quick 30s test with 10 users
#   ./run_load_test.sh standard     # Standard 5min test with 100 users
#   ./run_load_test.sh stress       # Stress test pushing to 200 users
#   ./run_load_test.sh web          # Start Locust web UI (default)
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_ENGINE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOST="${HOST:-http://localhost:8000}"
RESULTS_DIR="$AI_ENGINE_DIR/tests/load/results"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Activate virtual environment
source "$AI_ENGINE_DIR/.venv/bin/activate"

# Parse command
MODE="${1:-web}"

echo "=============================================="
echo "VITAL AI Engine Load Testing"
echo "=============================================="
echo "Host: $HOST"
echo "Mode: $MODE"
echo "Results: $RESULTS_DIR"
echo "=============================================="

case "$MODE" in
    smoke)
        echo "Running SMOKE test (10 users, 30s)..."
        locust -f "$SCRIPT_DIR/locustfile.py" \
            --host="$HOST" \
            --headless \
            -u 10 \
            -r 2 \
            -t 30s \
            --csv="$RESULTS_DIR/smoke_$(date +%Y%m%d_%H%M%S)" \
            --html="$RESULTS_DIR/smoke_$(date +%Y%m%d_%H%M%S).html"
        ;;

    standard)
        echo "Running STANDARD test (100 users, 5min)..."
        locust -f "$SCRIPT_DIR/locustfile.py" \
            --host="$HOST" \
            --headless \
            -u 100 \
            -r 10 \
            -t 300s \
            --csv="$RESULTS_DIR/standard_$(date +%Y%m%d_%H%M%S)" \
            --html="$RESULTS_DIR/standard_$(date +%Y%m%d_%H%M%S).html"
        ;;

    stress)
        echo "Running STRESS test (200 users, 10min)..."
        locust -f "$SCRIPT_DIR/locustfile.py" \
            --host="$HOST" \
            --headless \
            -u 200 \
            -r 20 \
            -t 600s \
            --csv="$RESULTS_DIR/stress_$(date +%Y%m%d_%H%M%S)" \
            --html="$RESULTS_DIR/stress_$(date +%Y%m%d_%H%M%S).html"
        ;;

    web|*)
        echo "Starting Locust Web UI..."
        echo "Open http://localhost:8089 in your browser"
        locust -f "$SCRIPT_DIR/locustfile.py" --host="$HOST"
        ;;
esac

echo ""
echo "Load test complete!"
echo "Results saved to: $RESULTS_DIR"
