#!/bin/bash
# Setup local tenant subdomains for development

echo "🔧 Setting up local tenant subdomains..."
echo ""
echo "This script will add the following entries to /etc/hosts:"
echo "  127.0.0.1 digital-health-startups.localhost"
echo "  127.0.0.1 pharma.localhost"
echo ""
echo "⚠️  This requires sudo/administrator privileges"
echo ""

# Check if entries already exist
if grep -q "digital-health-startups.localhost" /etc/hosts && grep -q "pharma.localhost" /etc/hosts; then
    echo "✅ Tenant subdomains already configured in /etc/hosts"
    exit 0
fi

# Add entries
echo "Adding tenant subdomains to /etc/hosts..."
sudo sh -c 'echo "" >> /etc/hosts'
sudo sh -c 'echo "# VITAL Platform - Local Tenant Subdomains" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 digital-health-startups.localhost" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 pharma.localhost" >> /etc/hosts'

echo ""
echo "✅ /etc/hosts updated successfully!"
echo ""
echo "🧪 You can now test tenant subdomains:"
echo "  http://localhost:3000 (Platform Tenant - Marketing)"
echo "  http://digital-health-startups.localhost:3000 (Tenant 1)"
echo "  http://pharma.localhost:3000 (Tenant 2)"
echo ""
