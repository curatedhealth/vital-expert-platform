#!/bin/bash

# Deploy Both VITAL Projects - Complete CLI Deployment
# This script deploys both marketing and platform in sequence

set -e

echo "🚀 VITAL Complete Deployment - CLI"
echo "==================================="
echo ""
echo "This script will deploy:"
echo "  1. Marketing Site (www.vital.expert)"
echo "  2. Platform App (*.vital.expert)"
echo ""
echo "Estimated time: 5-10 minutes"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phase 1: Marketing Site"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run marketing deployment
./deploy-marketing-cli.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phase 2: Platform App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait a moment
sleep 3

# Run platform deployment
./deploy-platform-cli.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Both Projects Deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Summary:"
echo ""
echo "  Marketing Site:"
echo "    ✓ Project: vital-marketing-site"
echo "    ✓ Domain: www.vital.expert"
echo "    ✓ Status: Check Vercel dashboard"
echo ""
echo "  Platform App:"
echo "    ✓ Project: vital-platform-app"
echo "    ✓ Domains: *.vital.expert, app.vital.expert"
echo "    ✓ Status: Check Vercel dashboard"
echo ""
echo "📍 DNS Configuration Required:"
echo ""
echo "  Add these records at your DNS provider:"
echo ""
echo "  Type    Name    Value"
echo "  A       @       76.76.21.21"
echo "  CNAME   www     cname.vercel-dns.com"
echo "  CNAME   *       cname.vercel-dns.com"
echo ""
echo "📍 Verify Deployments:"
echo ""
echo "  # Check Vercel projects"
echo "  vercel ls"
echo ""
echo "  # Test marketing site (after DNS)"
echo "  curl -I https://www.vital.expert"
echo ""
echo "  # Test platform app (after DNS)"
echo "  curl -I https://app.vital.expert"
echo ""
echo "🎉 Deployment Complete!"
echo ""
