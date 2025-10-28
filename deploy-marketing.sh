#!/bin/bash

# VITAL Marketing Site Deployment Script
# Deploys to Vercel for vital.expert

echo "🚀 VITAL Marketing Site Deployment"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "apps/digital-health-startup" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Deployment Configuration:"
echo "  Project: vital-marketing"
echo "  Root: apps/digital-health-startup"
echo "  Domain: vital.expert"
echo ""

# Navigate to app directory
cd apps/digital-health-startup

echo "✅ Step 1: Vercel Login"
echo "  Please log in to Vercel in your browser..."
vercel login

echo ""
echo "✅ Step 2: Deploy to Preview"
echo "  Creating preview deployment..."
vercel \
  --name vital-marketing \
  --yes

echo ""
echo "✅ Step 3: Set Environment Variables"
echo "  Adding environment variables..."

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<EOF
https://xazinxsiglqokwfmogyk.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
EOF

vercel env add NEXT_PUBLIC_APP_URL production <<EOF
https://vital.expert
EOF

vercel env add NODE_ENV production <<EOF
production
EOF

echo ""
echo "✅ Step 4: Deploy to Production"
echo "  Deploying to production..."
vercel --prod

echo ""
echo "✅ Step 5: Add Custom Domain"
echo "  Adding vital.expert domain..."
vercel domains add vital.expert
vercel domains add www.vital.expert

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📍 Next Steps:"
echo "  1. Configure DNS records at your DNS provider:"
echo "     A     @    76.76.21.21"
echo "     CNAME www  cname.vercel-dns.com"
echo ""
echo "  2. Wait for DNS propagation (10-30 minutes)"
echo ""
echo "  3. Visit https://vital.expert"
echo ""
