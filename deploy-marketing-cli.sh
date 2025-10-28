#!/bin/bash

# VITAL Marketing Site - Vercel CLI Deployment
# Deploys to www.vital.expert

set -e

echo "🚀 VITAL Marketing Site - CLI Deployment"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Navigate to app directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

echo "✅ Step 1: Login to Vercel"
vercel login

echo ""
echo "✅ Step 2: Deploy Marketing Site"
echo "  Project: vital-marketing-site"
echo "  Domain: www.vital.expert"
echo ""

# Deploy with specific project name and settings
vercel deploy \
  --name vital-marketing-site \
  --prod \
  --yes \
  --env NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY \
  --env NEXT_PUBLIC_APP_URL=https://www.vital.expert \
  --env NODE_ENV=production

echo ""
echo "✅ Step 3: Add Custom Domains"
echo ""

# Add domains (this may prompt for confirmation)
vercel domains add www.vital.expert --scope crossroads-catalysts-projects
vercel domains add vital.expert --scope crossroads-catalysts-projects

echo ""
echo "🎉 Marketing Site Deployed!"
echo ""
echo "📍 Next Steps:"
echo "  1. Configure DNS at your provider:"
echo "     A     @    76.76.21.21"
echo "     CNAME www  cname.vercel-dns.com"
echo ""
echo "  2. Test deployment:"
echo "     curl -I https://www.vital.expert"
echo ""
echo "  3. Run platform deployment script:"
echo "     ./deploy-platform-cli.sh"
echo ""
