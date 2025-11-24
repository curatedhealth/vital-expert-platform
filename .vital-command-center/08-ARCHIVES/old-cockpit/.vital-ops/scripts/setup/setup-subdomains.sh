#!/bin/bash

# Setup script for VITAL subdomain-based multitenancy
# Adds subdomain entries to /etc/hosts for local development

echo "===================================="
echo "VITAL Subdomain Multitenancy Setup"
echo "===================================="
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run with sudo privileges"
  echo "Please run: sudo ./setup-subdomains.sh"
  exit 1
fi

echo "Adding subdomain entries to /etc/hosts..."
echo ""

# Backup /etc/hosts
cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up /etc/hosts"

# Check and add vital-system.localhost
if grep -q "vital-system.localhost" /etc/hosts; then
  echo "✅ vital-system.localhost already exists"
else
  echo "127.0.0.1   vital-system.localhost" >> /etc/hosts
  echo "✅ Added vital-system.localhost"
fi

# Check and add digital-health.localhost
if grep -q "digital-health.localhost" /etc/hosts; then
  echo "✅ digital-health.localhost already exists"
else
  echo "127.0.0.1   digital-health.localhost" >> /etc/hosts
  echo "✅ Added digital-health.localhost"
fi

# Check and add pharma.localhost (already exists but verify)
if grep -q "pharma.localhost" /etc/hosts; then
  echo "✅ pharma.localhost already exists"
else
  echo "127.0.0.1   pharma.localhost" >> /etc/hosts
  echo "✅ Added pharma.localhost"
fi

echo ""
echo "Flushing DNS cache..."

# Flush DNS cache (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
  dscacheutil -flushcache
  killall -HUP mDNSResponder
  echo "✅ DNS cache flushed"
fi

# Flush DNS cache (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if command -v systemd-resolve &> /dev/null; then
    systemd-resolve --flush-caches
    echo "✅ DNS cache flushed"
  else
    echo "⚠️  Could not flush DNS cache automatically"
  fi
fi

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo "===================================="
echo ""
echo "You can now access:"
echo "  • http://vital-system.localhost:3000"
echo "  • http://digital-health.localhost:3000"
echo "  • http://pharma.localhost:3000"
echo ""
echo "Start the dev server with:"
echo "  pnpm --filter @vital/vital-system dev"
echo ""
