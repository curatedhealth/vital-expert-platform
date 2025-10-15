#!/bin/bash

# VITAL Ask Expert Deployment Script
# This script deploys the Ask Expert service to production

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
REGISTRY="vital-path.azurecr.io"
SERVICE_NAME="ask-expert"
NAMESPACE="vital-production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required but not installed. Aborting."; exit 1; }
    command -v helm >/dev/null 2>&1 || { log_error "Helm is required but not installed. Aborting."; exit 1; }
    
    # Check if kubectl is configured
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "kubectl is not configured or cluster is not accessible. Aborting."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Build the image
    docker build -t ${REGISTRY}/${SERVICE_NAME}:${VERSION} \
        -f Dockerfile.ask-expert \
        --build-arg NODE_ENV=${ENVIRONMENT} \
        --build-arg VERSION=${VERSION} \
        .
    
    # Tag as latest if this is the latest version
    if [ "$VERSION" = "latest" ]; then
        docker tag ${REGISTRY}/${SERVICE_NAME}:${VERSION} ${REGISTRY}/${SERVICE_NAME}:latest
    fi
    
    log_success "Docker image built successfully"
}

# Push image to registry
push_image() {
    log_info "Pushing image to registry..."
    
    # Login to registry (assuming Azure Container Registry)
    az acr login --name vital-path
    
    # Push the image
    docker push ${REGISTRY}/${SERVICE_NAME}:${VERSION}
    
    if [ "$VERSION" = "latest" ]; then
        docker push ${REGISTRY}/${SERVICE_NAME}:latest
    fi
    
    log_success "Image pushed to registry successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run unit tests
    npm run test:jest:coverage
    
    # Run integration tests
    npm run test:integration
    
    # Run E2E tests
    npm run test:e2e
    
    log_success "All tests passed"
}

# Deploy to Kubernetes
deploy_to_k8s() {
    log_info "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/ask-expert/
    
    # Update deployment with new image
    kubectl set image deployment/${SERVICE_NAME} \
        ${SERVICE_NAME}=${REGISTRY}/${SERVICE_NAME}:${VERSION} \
        -n ${NAMESPACE}
    
    # Wait for rollout to complete
    kubectl rollout status deployment/${SERVICE_NAME} -n ${NAMESPACE} --timeout=300s
    
    log_success "Deployment completed successfully"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check if pods are running
    kubectl get pods -l app=${SERVICE_NAME} -n ${NAMESPACE}
    
    # Check service status
    kubectl get service ${SERVICE_NAME} -n ${NAMESPACE}
    
    # Check ingress
    kubectl get ingress ${SERVICE_NAME} -n ${NAMESPACE}
    
    # Run health check
    HEALTH_CHECK_URL="https://api.vital-path.com/health"
    if curl -f ${HEALTH_CHECK_URL} >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_warning "Health check failed - service may still be starting"
    fi
    
    log_success "Deployment verification completed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run migrations using the migration script
    npm run migrate
    
    log_success "Database migrations completed"
}

# Update configuration
update_config() {
    log_info "Updating configuration..."
    
    # Update environment variables
    kubectl create configmap ${SERVICE_NAME}-config \
        --from-env-file=.env.${ENVIRONMENT} \
        -n ${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Update secrets
    kubectl create secret generic ${SERVICE_NAME}-secrets \
        --from-env-file=.env.secrets \
        -n ${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Configuration updated"
}

# Cleanup old images
cleanup_images() {
    log_info "Cleaning up old images..."
    
    # Remove old images (keep last 5 versions)
    docker images ${REGISTRY}/${SERVICE_NAME} --format "table {{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | \
        sort -k2 -r | \
        tail -n +6 | \
        awk '{print $1}' | \
        xargs -r -I {} docker rmi ${REGISTRY}/${SERVICE_NAME}:{}
    
    log_success "Old images cleaned up"
}

# Main deployment function
main() {
    log_info "Starting VITAL Ask Expert deployment..."
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Version: ${VERSION}"
    log_info "Registry: ${REGISTRY}"
    log_info "Service: ${SERVICE_NAME}"
    log_info "Namespace: ${NAMESPACE}"
    
    # Run deployment steps
    check_prerequisites
    run_tests
    build_image
    push_image
    update_config
    run_migrations
    deploy_to_k8s
    verify_deployment
    cleanup_images
    
    log_success "VITAL Ask Expert deployment completed successfully!"
    log_info "Service URL: https://api.vital-path.com/ask-expert"
    log_info "API Documentation: https://docs.vital-path.com/ask-expert"
    log_info "User Guide: https://docs.vital-path.com/ask-expert/user-guide"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [ENVIRONMENT] [VERSION]"
        echo ""
        echo "Arguments:"
        echo "  ENVIRONMENT    Target environment (default: production)"
        echo "  VERSION        Version to deploy (default: latest)"
        echo ""
        echo "Examples:"
        echo "  $0 production v1.2.3"
        echo "  $0 staging latest"
        echo "  $0 production"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
