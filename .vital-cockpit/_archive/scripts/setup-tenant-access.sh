#!/bin/bash
# =============================================================================
# Setup Digital Health Startup Tenant Access
# =============================================================================
# This script adds the subdomain to /etc/hosts for local tenant testing
# Run: chmod +x setup-tenant-access.sh && ./setup-tenant-access.sh
# =============================================================================

set -e

echo "=================================================="
echo "Digital Health Startup Tenant - Access Setup"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Tenant configuration
TENANT_SUBDOMAIN="digital-health-startup"
HOSTS_ENTRY="127.0.0.1  ${TENANT_SUBDOMAIN}.localhost"

echo "Step 1: Checking if hosts entry already exists..."
if grep -q "${TENANT_SUBDOMAIN}.localhost" /etc/hosts 2>/dev/null; then
    echo -e "${GREEN}✅ Hosts entry already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Hosts entry not found. Adding...${NC}"
    echo ""
    echo "This requires sudo permission to modify /etc/hosts"
    echo "You'll be prompted for your password."
    echo ""

    # Add to hosts file
    echo "${HOSTS_ENTRY}" | sudo tee -a /etc/hosts > /dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully added hosts entry${NC}"
    else
        echo -e "${RED}❌ Failed to add hosts entry${NC}"
        exit 1
    fi
fi

echo ""
echo "Step 2: Verifying hosts configuration..."
if ping -c 1 ${TENANT_SUBDOMAIN}.localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Hosts entry is working (pings 127.0.0.1)${NC}"
else
    echo -e "${YELLOW}⚠️  Ping failed, but entry exists${NC}"
fi

echo ""
echo "Step 3: Checking dev server status..."
if curl -s "http://localhost:3001" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev server is running on port 3001${NC}"
else
    echo -e "${RED}❌ Dev server is NOT running on port 3001${NC}"
    echo "   Run: cd apps/digital-health-startup && npm run dev"
    exit 1
fi

echo ""
echo "Step 4: Testing tenant detection..."
TENANT_HEADER=$(curl -s -I "http://${TENANT_SUBDOMAIN}.localhost:3001/" 2>/dev/null | grep -i "x-tenant-detection-method" | cut -d: -f2 | tr -d '[:space:]')

if [ ! -z "$TENANT_HEADER" ]; then
    if [ "$TENANT_HEADER" = "subdomain" ]; then
        echo -e "${GREEN}✅ Tenant detected via subdomain!${NC}"
    else
        echo -e "${YELLOW}⚠️  Tenant detection method: ${TENANT_HEADER}${NC}"
        echo "   Expected: subdomain"
    fi
else
    echo -e "${YELLOW}⚠️  Could not verify tenant detection${NC}"
    echo "   (This is normal if tenant migration hasn't been run)"
fi

echo ""
echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo -e "${GREEN}Access your tenant at:${NC}"
echo "  http://${TENANT_SUBDOMAIN}.localhost:3001"
echo ""
echo -e "${GREEN}Alternative access methods:${NC}"
echo "  1. HTTP Header: -H \"x-tenant-id: <UUID>\""
echo "  2. Cookie: document.cookie = \"tenant_id=<UUID>\""
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open browser: http://${TENANT_SUBDOMAIN}.localhost:3001"
echo "  2. Check DevTools Console for tenant logs"
echo "  3. Verify agent access (should see 254+ agents)"
echo ""
echo -e "${GREEN}Documentation:${NC}"
echo "  See: TENANT_ACCESS_GUIDE.md"
echo ""
echo "=================================================="
