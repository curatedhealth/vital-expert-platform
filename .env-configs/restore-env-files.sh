#!/bin/bash

# restore-env-files.sh
# Restore all environment files from .env-configs/ to their original locations

set -e

echo "🔐 Restoring Environment Files"
echo "=============================="
echo ""

# Check if .env-configs exists
if [ ! -d ".env-configs" ]; then
    echo "❌ Error: .env-configs/ directory not found"
    echo "Please ensure you're in the project root directory"
    exit 1
fi

echo "📁 Restoring root environment files..."
cp .env-configs/root/.env .env 2>/dev/null && echo "  ✅ .env" || echo "  ⚠️  .env not found in configs"
cp .env-configs/root/.env.local .env.local 2>/dev/null && echo "  ✅ .env.local" || echo "  ⚠️  .env.local not found in configs"
cp .env-configs/root/.env.production .env.production 2>/dev/null && echo "  ✅ .env.production" || echo "  ⚠️  .env.production not found in configs"
cp .env-configs/root/.env.vercel .env.vercel 2>/dev/null && echo "  ✅ .env.vercel" || echo "  ⚠️  .env.vercel not found in configs"

echo ""
echo "📱 Restoring app environment files..."
cp .env-configs/apps/digital-health-startup/.env.local apps/digital-health-startup/.env.local 2>/dev/null && echo "  ✅ digital-health-startup/.env.local" || echo "  ⚠️  digital-health-startup/.env.local not found"
cp .env-configs/apps/ask-panel/.env.local apps/ask-panel/.env.local 2>/dev/null && echo "  ✅ ask-panel/.env.local" || echo "  ⚠️  ask-panel/.env.local not found"

echo ""
echo "⚙️  Restoring service environment files..."
cp .env-configs/services/ai-engine/.env services/ai-engine/.env 2>/dev/null && echo "  ✅ ai-engine/.env" || echo "  ⚠️  ai-engine/.env not found"
cp .env-configs/services/ai-engine/.env.database services/ai-engine/.env.database 2>/dev/null && echo "  ✅ ai-engine/.env.database" || echo "  ⚠️  ai-engine/.env.database not found"
cp .env-configs/services/api-gateway/.env services/api-gateway/.env 2>/dev/null && echo "  ✅ api-gateway/.env" || echo "  ⚠️  api-gateway/.env not found"

echo ""
echo "✅ Environment file restoration complete!"
echo ""
echo "📝 Note: Make sure these files are in .gitignore"
echo "🔐 Never commit these files to git"

