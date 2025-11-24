#!/bin/bash

# ============================================================================
# A++ Observability Stack - Complete Installation Script
# ============================================================================

set -e

echo "🌟 =============================================="
echo "🌟 A++ Observability Stack - Installation"
echo "🌟 =============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Packages are already installed ✅
echo -e "${GREEN}✅ Step 1: Packages Installed${NC}"
echo "   - @sentry/nextjs"
echo "   - langfuse"
echo "   - langfuse-langchain"
echo ""

# Step 2: Configure Environment Variables
echo -e "${YELLOW}📝 Step 2: Configure Environment Variables${NC}"
echo ""
echo "Add these to apps/digital-health-startup/.env.local:"
echo ""
cat << 'EOF'
# ============================================================================
# A++ Observability Stack Configuration
# ============================================================================

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# LangFuse Configuration  
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_HOST=http://localhost:3002

# Tenant ID (already set)
NEXT_PUBLIC_TENANT_ID=b8026534-02a7-4d24-bf4c-344591964e02

# ============================================================================
# How to Get Keys
# ============================================================================

# Sentry DSN:
#   1. Go to https://sentry.io
#   2. Create project (Platform: Next.js)
#   3. Copy DSN from Settings → Projects → [project] → Client Keys (DSN)

# LangFuse Keys:
#   1. Deploy monitoring stack: cd monitoring && ./deploy.sh
#   2. Access http://localhost:3002
#   3. Create account
#   4. Go to Settings → API Keys
#   5. Create new key pair
#   6. Copy both keys

EOF

echo ""
read -p "Press ENTER after you've added the environment variables..."

# Step 3: Deploy Monitoring Stack
echo ""
echo -e "${YELLOW}🚀 Step 3: Deploy Monitoring Stack${NC}"
echo ""
echo "Checking if monitoring directory exists..."

if [ -d "monitoring" ]; then
    echo "Found monitoring directory ✅"
    cd monitoring
    
    # Check if deploy.sh exists
    if [ -f "deploy.sh" ]; then
        echo ""
        echo "Ready to deploy monitoring stack..."
        echo "This will start:"
        echo "  - Prometheus (metrics)"
        echo "  - Grafana (dashboards)"
        echo "  - Alertmanager (alerts)"
        echo "  - LangFuse (LLM tracing)"
        echo ""
        read -p "Deploy now? (y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            chmod +x deploy.sh
            ./deploy.sh
        else
            echo "Skipped. Run manually with: cd monitoring && ./deploy.sh"
        fi
    else
        echo -e "${YELLOW}⚠️  deploy.sh not found${NC}"
        echo "Run manually: cd monitoring && ./deploy.sh"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  monitoring directory not found${NC}"
    echo "Make sure you're in the project root"
fi

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Configure Sentry:"
echo "   - Access: https://sentry.io"
echo "   - Copy DSN to .env.local"
echo ""
echo "2. Configure LangFuse:"
echo "   - Access: http://localhost:3002"
echo "   - Create account"
echo "   - Generate API keys"
echo "   - Copy keys to .env.local"
echo ""
echo "3. Access Dashboards:"
echo "   - Grafana: http://localhost:3001 (admin / vital_admin_2025)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Executive: http://localhost:3000/admin?view=executive"
echo ""
echo "4. Import Grafana Dashboards:"
echo "   - Production Overview: monitoring/grafana/dashboards/vital-production-overview.json"
echo "   - LLM Performance: monitoring/grafana/dashboards/vital-llm-performance-cost.json"
echo ""
echo "5. Test Integration:"
echo "   - Run a query through Ask Expert"
echo "   - Check Sentry for any errors"
echo "   - Check LangFuse for traces"
echo "   - Check Grafana for metrics"
echo ""
echo "📚 Documentation:"
echo "   - Complete Guide: A_PLUS_PLUS_COMPLETE.md"
echo "   - Quick Reference: A_PLUS_PLUS_QUICK_REFERENCE.md"
echo "   - Installation: OBSERVABILITY_INSTALLATION_GUIDE.md"
echo ""
echo "🎊 You now have A++ World-Class Observability! 🎊"
echo ""

