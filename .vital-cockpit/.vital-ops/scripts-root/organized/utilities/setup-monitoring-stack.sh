#!/bin/bash
# Setup Monitoring Stack
# Starts Prometheus, Grafana, and Alertmanager for production monitoring

set -e

echo "🚀 Setting up Monitoring Stack"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Navigate to monitoring directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MONITORING_DIR="$( cd "$SCRIPT_DIR/../monitoring" && pwd )"

if [ ! -d "$MONITORING_DIR" ]; then
    echo "❌ ERROR: Monitoring directory not found: $MONITORING_DIR"
    exit 1
fi

cd "$MONITORING_DIR"

echo "📁 Monitoring directory: $MONITORING_DIR"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: docker-compose.yml not found in monitoring directory"
    exit 1
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
echo "=================="

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus: Running (http://localhost:9090)"
else
    echo "❌ Prometheus: Not responding"
fi

# Check Grafana
if curl -s http://localhost:3002/api/health > /dev/null 2>&1 || curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Grafana: Running (http://localhost:3002)"
    echo "   Default credentials: admin / vital-path-2025"
else
    echo "❌ Grafana: Not responding"
fi

# Check Alertmanager (optional)
if curl -s http://localhost:9093/-/healthy > /dev/null 2>&1; then
    echo "✅ Alertmanager: Running (http://localhost:9093)"
else
    echo "⚠️  Alertmanager: Not started (optional)"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Access Grafana: http://localhost:3002"
echo "   - Username: admin"
echo "   - Password: vital-path-2025"
echo ""
echo "2. Access Prometheus: http://localhost:9090"
echo ""
echo "3. Verify metrics are being scraped:"
echo "   curl http://localhost:9090/api/v1/targets | jq"
echo ""
echo "4. Check if metrics are available:"
echo "   curl http://localhost:9090/api/v1/query?query=agent_search_total"
echo ""
echo "5. View dashboards:"
echo "   - Agent Operations: http://localhost:3002/d/agent-operations"
echo "   - RAG Operations: http://localhost:3002/d/rag-operations"
echo ""
echo "✅ Monitoring stack setup complete!"
echo ""

