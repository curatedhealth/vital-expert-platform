#!/bin/bash

# VITAL Expert Consultation Deployment Script
# This script handles the complete deployment of the expert consultation service

set -e  # Exit on any error

echo "🚀 Starting VITAL Expert Consultation Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="expert-consultation"
DOCKER_COMPOSE_FILE="docker-compose.expert-consultation.yml"
ENV_FILE=".env.production"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file not found: $ENV_FILE"
        print_status "Creating default environment file..."
        cp backend/python-ai-services/expert_consultation/env.production .env.production
        print_warning "Please update .env.production with your actual API keys and configuration"
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    print_success "Directories created"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if PostgreSQL is running
    if ! docker-compose -f $DOCKER_COMPOSE_FILE ps postgres | grep -q "Up"; then
        print_status "Starting PostgreSQL..."
        docker-compose -f $DOCKER_COMPOSE_FILE up -d postgres
        
        # Wait for PostgreSQL to be ready
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 10
    fi
    
    # Run migrations
    print_status "Executing database migrations..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U vital -d vital_expert_consultation -f /docker-entrypoint-initdb.d/20250118_expert_consultation_complete.sql
    
    print_success "Database migrations completed"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build the expert consultation service
    print_status "Building expert consultation service..."
    docker-compose -f $DOCKER_COMPOSE_FILE build expert-consultation
    
    # Start all services
    print_status "Starting all services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    print_success "Services started"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for expert consultation service
    print_status "Waiting for expert consultation service..."
    for i in {1..30}; do
        if curl -f http://localhost:8001/health > /dev/null 2>&1; then
            print_success "Expert consultation service is healthy"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Expert consultation service failed to become healthy"
            docker-compose -f $DOCKER_COMPOSE_FILE logs expert-consultation
            exit 1
        fi
        
        print_status "Waiting for service... ($i/30)"
        sleep 2
    done
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    for i in {1..10}; do
        if docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is healthy"
            break
        fi
        
        if [ $i -eq 10 ]; then
            print_error "Redis failed to become healthy"
            exit 1
        fi
        
        sleep 1
    done
}

# Run health checks
run_health_checks() {
    print_status "Running comprehensive health checks..."
    
    # Basic health check
    print_status "Running basic health check..."
    curl -f http://localhost:8001/health
    
    # Detailed health check
    print_status "Running detailed health check..."
    curl -f http://localhost:8001/health/detailed
    
    # Readiness check
    print_status "Running readiness check..."
    curl -f http://localhost:8001/health/ready
    
    # Liveness check
    print_status "Running liveness check..."
    curl -f http://localhost:8001/health/live
    
    print_success "All health checks passed"
}

# Test the service
test_service() {
    print_status "Testing the expert consultation service..."
    
    # Test mode recommendation
    print_status "Testing mode recommendation..."
    curl -X POST http://localhost:8001/expert/modes/recommend-mode \
        -H "Content-Type: application/json" \
        -d '{"query": "What are the regulatory requirements for Phase III oncology trials?", "user_id": "test_user"}'
    
    # Test session creation
    print_status "Testing session creation..."
    SESSION_RESPONSE=$(curl -s -X POST http://localhost:8001/expert/modes/sessions/start \
        -H "Content-Type: application/json" \
        -d '{"user_id": "test_user", "interaction_mode": "interactive", "agent_mode": "automatic"}')
    
    SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.session_id')
    
    if [ "$SESSION_ID" != "null" ] && [ "$SESSION_ID" != "" ]; then
        print_success "Session created successfully: $SESSION_ID"
        
        # Test query processing
        print_status "Testing query processing..."
        curl -X POST http://localhost:8001/expert/modes/sessions/$SESSION_ID/query \
            -H "Content-Type: application/json" \
            -d '{"query": "What are the key considerations for Phase III trial design?", "stream": false}'
        
        print_success "Query processing test completed"
    else
        print_warning "Session creation test failed, but service is running"
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    
    # Show running containers
    print_status "Running containers:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    
    # Show service URLs
    print_status "Service URLs:"
    echo "  Expert Consultation API: http://localhost:8001"
    echo "  Health Check: http://localhost:8001/health"
    echo "  API Documentation: http://localhost:8001/docs"
    echo "  Redis: localhost:6379"
    echo "  PostgreSQL: localhost:5432"
    
    echo ""
    
    # Show logs
    print_status "Recent logs:"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=10 expert-consultation
}

# Main deployment function
main() {
    echo "=========================================="
    echo "VITAL Expert Consultation Deployment"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    create_directories
    run_migrations
    deploy_services
    wait_for_services
    run_health_checks
    test_service
    show_status
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update your frontend to use the new API endpoints"
    echo "2. Configure your environment variables in .env.production"
    echo "3. Access the service at http://localhost:8001"
    echo "4. Monitor logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    echo ""
    print_status "To stop the services: docker-compose -f $DOCKER_COMPOSE_FILE down"
    print_status "To restart: docker-compose -f $DOCKER_COMPOSE_FILE restart"
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        print_status "Stopping services..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        print_success "Services restarted"
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f expert-consultation
        ;;
    "status")
        show_status
        ;;
    "test")
        test_service
        ;;
    *)
        main
        ;;
esac
