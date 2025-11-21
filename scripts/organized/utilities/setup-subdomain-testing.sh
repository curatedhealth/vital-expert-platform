#!/bin/bash

# Multi-Tenant Subdomain Testing Setup Script
# This script helps you configure /etc/hosts and test subdomain routing

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Multi-Tenant Subdomain Testing Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if entries already exist in /etc/hosts
echo "📋 Step 1: Checking /etc/hosts for existing entries..."
echo ""

if grep -q "digital-health-startups.localhost" /etc/hosts && grep -q "pharma.localhost" /etc/hosts; then
    echo "✅ Subdomain entries already exist in /etc/hosts:"
    grep "digital-health-startups.localhost" /etc/hosts
    grep "pharma.localhost" /etc/hosts
    echo ""
else
    echo "⚠️  Subdomain entries NOT found in /etc/hosts"
    echo ""
    echo "You need to add these lines to /etc/hosts:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "127.0.0.1 digital-health-startups.localhost"
    echo "127.0.0.1 pharma.localhost"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Option 1: Manual Edit (Recommended)"
    echo "  sudo nano /etc/hosts"
    echo "  Add the lines above, save (Ctrl+X, Y, Enter)"
    echo ""
    echo "Option 2: Automatic (Run this command):"
    echo "  sudo sh -c 'echo \"127.0.0.1 digital-health-startups.localhost\" >> /etc/hosts && echo \"127.0.0.1 pharma.localhost\" >> /etc/hosts'"
    echo ""
    read -p "Press Enter after you've added the entries to /etc/hosts..."
fi

# Step 2: Verify entries
echo ""
echo "📋 Step 2: Verifying /etc/hosts entries..."
echo ""

if grep -q "digital-health-startups.localhost" /etc/hosts && grep -q "pharma.localhost" /etc/hosts; then
    echo "✅ Verified! Entries found:"
    echo ""
    grep "localhost" /etc/hosts | grep -E "digital-health-startups|pharma"
    echo ""
else
    echo "❌ ERROR: Entries still not found in /etc/hosts"
    echo "Please add them manually and run this script again."
    exit 1
fi

# Step 3: Check if dev server is running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Checking if dev server is running..."
echo ""

if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running on http://localhost:3000"
    echo ""
else
    echo "⚠️  Dev server is NOT running"
    echo ""
    echo "Start the dev server in a separate terminal:"
    echo "  cd \"$PWD/apps/digital-health-startup\""
    echo "  npm run dev"
    echo ""
    read -p "Press Enter after you've started the dev server..."
fi

# Step 4: Test DNS resolution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Testing DNS resolution..."
echo ""

echo "Testing localhost..."
if ping -c 1 localhost > /dev/null 2>&1; then
    echo "✅ localhost resolves correctly"
else
    echo "❌ localhost does not resolve"
fi

echo ""
echo "Testing digital-health-startups.localhost..."
if ping -c 1 digital-health-startups.localhost > /dev/null 2>&1; then
    echo "✅ digital-health-startups.localhost resolves to 127.0.0.1"
else
    echo "❌ digital-health-startups.localhost does not resolve"
    echo "   Make sure you added the entry to /etc/hosts"
fi

echo ""
echo "Testing pharma.localhost..."
if ping -c 1 pharma.localhost > /dev/null 2>&1; then
    echo "✅ pharma.localhost resolves to 127.0.0.1"
else
    echo "❌ pharma.localhost does not resolve"
    echo "   Make sure you added the entry to /etc/hosts"
fi

# Step 5: Test HTTP endpoints
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Testing HTTP endpoints and tenant detection..."
echo ""

echo "Testing Platform Tenant (localhost:3000)..."
PLATFORM_RESPONSE=$(curl -s -I http://localhost:3000 2>&1)
if echo "$PLATFORM_RESPONSE" | grep -q "HTTP"; then
    echo "✅ Platform tenant responds"
    if echo "$PLATFORM_RESPONSE" | grep -iq "x-tenant-id"; then
        TENANT_ID=$(echo "$PLATFORM_RESPONSE" | grep -i "x-tenant-id" | cut -d: -f2 | tr -d ' \r')
        METHOD=$(echo "$PLATFORM_RESPONSE" | grep -i "x-tenant-detection-method" | cut -d: -f2 | tr -d ' \r')
        echo "   Tenant ID: $TENANT_ID"
        echo "   Detection Method: $METHOD"
    else
        echo "   ⚠️  No x-tenant-id header found (middleware may not be working)"
    fi
else
    echo "❌ Platform tenant does not respond"
fi

echo ""
echo "Testing Digital Health Startups Tenant (digital-health-startups.localhost:3000)..."
DHS_RESPONSE=$(curl -s -I http://digital-health-startups.localhost:3000 2>&1)
if echo "$DHS_RESPONSE" | grep -q "HTTP"; then
    echo "✅ Digital Health Startups tenant responds"
    if echo "$DHS_RESPONSE" | grep -iq "x-tenant-id"; then
        TENANT_ID=$(echo "$DHS_RESPONSE" | grep -i "x-tenant-id" | cut -d: -f2 | tr -d ' \r')
        METHOD=$(echo "$DHS_RESPONSE" | grep -i "x-tenant-detection-method" | cut -d: -f2 | tr -d ' \r')
        echo "   Tenant ID: $TENANT_ID"
        echo "   Detection Method: $METHOD"
        
        if [ "$TENANT_ID" = "a2b50378-a21a-467b-ba4c-79ba93f64b2f" ]; then
            echo "   ✅ Correct tenant ID detected!"
        else
            echo "   ⚠️  Unexpected tenant ID (expected: a2b50378-a21a-467b-ba4c-79ba93f64b2f)"
        fi
    else
        echo "   ⚠️  No x-tenant-id header found (middleware may not be working)"
    fi
else
    echo "❌ Digital Health Startups tenant does not respond"
fi

echo ""
echo "Testing Pharma Tenant (pharma.localhost:3000)..."
PHARMA_RESPONSE=$(curl -s -I http://pharma.localhost:3000 2>&1)
if echo "$PHARMA_RESPONSE" | grep -q "HTTP"; then
    echo "✅ Pharma tenant responds"
    if echo "$PHARMA_RESPONSE" | grep -iq "x-tenant-id"; then
        TENANT_ID=$(echo "$PHARMA_RESPONSE" | grep -i "x-tenant-id" | cut -d: -f2 | tr -d ' \r')
        METHOD=$(echo "$PHARMA_RESPONSE" | grep -i "x-tenant-detection-method" | cut -d: -f2 | tr -d ' \r')
        echo "   Tenant ID: $TENANT_ID"
        echo "   Detection Method: $METHOD"
        
        if [ "$TENANT_ID" = "18c6b106-6f99-4b29-9608-b9a623af37c2" ]; then
            echo "   ✅ Correct tenant ID detected!"
        else
            echo "   ⚠️  Unexpected tenant ID (expected: 18c6b106-6f99-4b29-9608-b9a623af37c2)"
        fi
    else
        echo "   ⚠️  No x-tenant-id header found (middleware may not be working)"
    fi
else
    echo "❌ Pharma tenant does not respond"
fi

# Step 6: Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Next: Open in Browser"
echo ""
echo "  1. http://localhost:3000"
echo "     (Platform Tenant - Marketing Website)"
echo ""
echo "  2. http://digital-health-startups.localhost:3000"
echo "     (Digital Health Startups - Tenant 1)"
echo ""
echo "  3. http://pharma.localhost:3000"
echo "     (Pharma Companies - Tenant 2)"
echo ""
echo "In DevTools (F12):"
echo "  • Network tab → Check response headers for 'x-tenant-id'"
echo "  • Application tab → Cookies → Check 'tenant_id' cookie"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
