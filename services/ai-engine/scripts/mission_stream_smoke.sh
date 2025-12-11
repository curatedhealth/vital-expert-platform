#!/usr/bin/env bash
# Minimal smoke script for /api/missions/stream (Modes 3/4).
# Usage: ./services/ai-engine/scripts/mission_stream_smoke.sh 3 "your goal"

MODE=${1:-3}
GOAL=${2:-"Test autonomous mission"}

curl -N -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -X POST \
  -d "{\"mode\": ${MODE}, \"goal\": \"${GOAL}\", \"expert_id\": \"regulatory\"}" \
  http://localhost:8000/api/missions/stream
