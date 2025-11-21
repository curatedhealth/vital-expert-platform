#!/bin/bash

echo "======================================"
echo "VITAL Subdomain Fix Script"
echo "======================================"
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run with sudo privileges"
  echo "Please run: sudo ./fix-subdomains.sh"
  exit 1
fi

echo "Checking current /etc/hosts entries..."
echo ""

# Check which entries are missing
MISSING=""
if ! grep -q "vital-system.localhost" /etc/hosts; then
  MISSING="$MISSING vital-system.localhost"
fi

if ! grep -q "digital-health.localhost" /etc/hosts; then
  MISSING="$MISSING digital-health.localhost"
fi

if [ -z "$MISSING" ]; then
  echo "✅ All subdomain entries already exist!"
  grep -E "(vital-system|digital-health|pharma)\.localhost" /etc/hosts
  exit 0
fi

# Backup /etc/hosts
cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up /etc/hosts"
echo ""

# Add missing entries
if echo "$MISSING" | grep -q "vital-system"; then
  echo "127.0.0.1   vital-system.localhost" >> /etc/hosts
  echo "✅ Added vital-system.localhost"
fi

if echo "$MISSING" | grep -q "digital-health"; then
  echo "127.0.0.1   digital-health.localhost" >> /etc/hosts
  echo "✅ Added digital-health.localhost"
fi

echo ""
echo "Current subdomain entries:"
grep -E "(vital-system|digital-health|pharma)\.localhost" /etc/hosts

echo ""
echo "Flushing DNS cache..."

# Flush DNS cache (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
  dscacheutil -flushcache
  killall -HUP mDNSResponder
  echo "✅ DNS cache flushed"
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "You can now access:"
echo "  • http://vital-system.localhost:3000"
echo "  • http://digital-health.localhost:3000"
echo "  • http://pharma.localhost:3000"
echo ""
