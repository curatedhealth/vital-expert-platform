#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Adding Subdomain Entries to /etc/hosts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will add these entries to /etc/hosts:"
echo "  127.0.0.1 digital-health-startups.localhost"
echo "  127.0.0.1 pharma.localhost"
echo ""
echo "⚠️  You will be asked for your sudo password."
echo ""

# Check if entries already exist
if grep -q "digital-health-startups.localhost" /etc/hosts && grep -q "pharma.localhost" /etc/hosts; then
    echo "✅ Entries already exist in /etc/hosts!"
    echo ""
    grep "digital-health-startups.localhost" /etc/hosts
    grep "pharma.localhost" /etc/hosts
    echo ""
    echo "No changes needed."
    exit 0
fi

# Add entries
echo "Adding entries (requires sudo)..."
sudo sh -c 'echo "127.0.0.1 digital-health-startups.localhost" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 pharma.localhost" >> /etc/hosts'

echo ""
echo "✅ Successfully added entries to /etc/hosts!"
echo ""
echo "Verification:"
grep "digital-health-startups.localhost" /etc/hosts
grep "pharma.localhost" /etc/hosts
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Next: Run the testing script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ./scripts/setup-subdomain-testing.sh"
echo ""
