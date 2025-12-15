#!/bin/bash

# Script to remove all agent copies from the database
# Usage: ./scripts/remove-agent-copies.sh

echo "🚀 Starting agent copy removal script..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the TypeScript script
npx tsx apps/digital-health-startup/scripts/remove-agent-copies.ts

echo ""
echo "✅ Done!"
