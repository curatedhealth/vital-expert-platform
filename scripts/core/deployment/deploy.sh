#!/bin/bash

# VITAL Path Deployment Script
# Automated deployment for healthcare AI platform

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
REGION="us-west-2"
SKIP_TERRAFORM="false"
SKIP_BUILD="false"
DRY_RUN="false"
FORCE="false"

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
    exit 1
}

# Function to show usage
usage() {
    cat << EOF
VITAL Path Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENVIRONMENT    Deployment environment (development|staging|production)
    -r, --region REGION             AWS region (default: us-west-2)
    --skip-terraform                Skip Terraform infrastructure deployment
    --skip-build                    Skip Docker image building
    --dry-run                       Show what would be deployed without executing
    --force                         Force deployment without confirmation
    -h, --help                      Show this help message

Examples:
    $0 -e staging
    $0 -e production -r us-east-1
    $0 -e development --skip-terraform
    $0 -e production --dry-run

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        --skip-terraform)
            SKIP_TERRAFORM="true"
            shift
            ;;
        --skip-build)
            SKIP_BUILD="true"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --force)
            FORCE="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            ;;
    esac
done

# Validate required parameters
if [[ -z "$ENVIRONMENT" ]]; then
    print_error "Environment is required. Use -e or --environment"
fi

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Environment must be one of: development, staging, production"
fi

print_status "Starting VITAL Path deployment for environment: $ENVIRONMENT"
print_status "Region: $REGION"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if required tools are installed
    local tools=("aws" "docker" "terraform" "kubectl" "helm")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
        fi
    done

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
    fi

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
    fi

    print_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    print_status "Loading environment configuration..."

    local env_file=".env.${ENVIRONMENT}"
    if [[ -f "$env_file" ]]; then
        set -a
        source "$env_file"
        set +a
        print_success "Environment variables loaded from $env_file"
    else
        print_warning "Environment file $env_file not found, using defaults"
    fi

    # Set default values if not provided
    export PROJECT_NAME=${PROJECT_NAME:-"vital-path"}
    export AWS_REGION=${AWS_REGION:-$REGION}
    export DATABASE_URL=${DATABASE_URL:-""}
    export SECRET_KEY=${SECRET_KEY:-$(openssl rand -hex 32)}

    # Validate required environment variables for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        local required_vars=(
            "POSTGRES_PASSWORD"
            "REDIS_AUTH_TOKEN"
            "SECRET_KEY"
        )

        for var in "${required_vars[@]}"; do
            if [[ -z "${!var:-}" ]]; then
                print_error "Required environment variable $var is not set for production deployment"
            fi
        done
    fi
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    if [[ "$SKIP_TERRAFORM" == "true" ]]; then
        print_warning "Skipping Terraform deployment"
        return
    fi

    print_status "Deploying infrastructure with Terraform..."

    cd infrastructure/terraform

    # Initialize Terraform
    terraform init \
        -backend-config="bucket=${PROJECT_NAME}-terraform-state-${ENVIRONMENT}" \
        -backend-config="key=infrastructure/${ENVIRONMENT}/terraform.tfstate" \
        -backend-config="region=$AWS_REGION"

    # Create workspace if it doesn't exist
    terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"

    # Plan deployment
    local plan_file="tfplan-${ENVIRONMENT}"
    terraform plan \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -var="postgres_password=${POSTGRES_PASSWORD:-$(openssl rand -base64 32)}" \
        -var="redis_auth_token=${REDIS_AUTH_TOKEN:-$(openssl rand -base64 32)}" \
        -out="$plan_file"

    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Dry run mode - showing planned changes only"
        terraform show "$plan_file"
        rm -f "$plan_file"
        cd ../..
        return
    fi

    # Confirm deployment
    if [[ "$FORCE" != "true" ]]; then
        echo
        read -p "Do you want to apply these changes? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
            print_warning "Deployment cancelled by user"
            rm -f "$plan_file"
            cd ../..
            exit 0
        fi
    fi

    # Apply changes
    terraform apply "$plan_file"
    rm -f "$plan_file"

    # Save outputs
    terraform output -json > "../../terraform-outputs-${ENVIRONMENT}.json"

    cd ../..
    print_success "Infrastructure deployment completed"
}

# Build and push Docker images
build_and_push_images() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        print_warning "Skipping Docker image build"
        return
    fi

    print_status "Building and pushing Docker images..."

    local registry_url=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
    local image_tag="${ENVIRONMENT}-$(git rev-parse --short HEAD)"

    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$registry_url"

    # Build images
    local images=(
        "vital-path-main:Dockerfile"
        "vital-path-api-gateway:Dockerfile.api-gateway-enhanced"
        "vital-path-clinical-validator:Dockerfile.clinical-validator"
        "vital-path-security-compliance:Dockerfile.security-compliance"
        "vital-path-monitoring:Dockerfile.monitoring"
        "vital-path-worker:Dockerfile.worker"
    )

    for image_config in "${images[@]}"; do
        local image_name=$(echo "$image_config" | cut -d: -f1)
        local dockerfile=$(echo "$image_config" | cut -d: -f2)

        print_status "Building $image_name..."

        # Create ECR repository if it doesn't exist
        aws ecr describe-repositories --repository-names "$image_name" --region "$AWS_REGION" 2>/dev/null || \
        aws ecr create-repository --repository-name "$image_name" --region "$AWS_REGION" &>/dev/null

        # Build and tag image
        docker build -f "$dockerfile" -t "$image_name:$image_tag" .
        docker tag "$image_name:$image_tag" "$registry_url/$image_name:$image_tag"
        docker tag "$image_name:$image_tag" "$registry_url/$image_name:latest"

        if [[ "$DRY_RUN" != "true" ]]; then
            # Push images
            docker push "$registry_url/$image_name:$image_tag"
            docker push "$registry_url/$image_name:latest"
        fi

        print_success "Built and pushed $image_name"
    done

    # Export image tag for Kubernetes deployment
    export IMAGE_TAG="$image_tag"
    export REGISTRY_URL="$registry_url"
}

# Configure kubectl
configure_kubectl() {
    print_status "Configuring kubectl..."

    local cluster_name="${PROJECT_NAME}-${ENVIRONMENT}-eks"
    aws eks update-kubeconfig --region "$AWS_REGION" --name "$cluster_name"

    # Verify connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Failed to connect to Kubernetes cluster"
    fi

    print_success "kubectl configured successfully"
}

# Deploy Kubernetes resources
deploy_kubernetes() {
    print_status "Deploying to Kubernetes..."

    # Create namespace
    kubectl create namespace vital-path --dry-run=client -o yaml | kubectl apply -f -

    # Apply Kubernetes manifests
    local k8s_dir="infrastructure/k8s"

    if [[ -d "$k8s_dir" ]]; then
        # Replace environment variables in manifests
        find "$k8s_dir" -name "*.yaml" -exec envsubst < {} \; | kubectl apply -f -
    fi

    # Deploy with Helm if charts exist
    local helm_dir="infrastructure/helm"
    if [[ -d "$helm_dir" ]]; then
        helm upgrade --install vital-path "$helm_dir" \
            --namespace vital-path \
            --set environment="$ENVIRONMENT" \
            --set image.tag="$IMAGE_TAG" \
            --set registry.url="$REGISTRY_URL" \
            --wait --timeout=10m
    fi

    print_success "Kubernetes deployment completed"
}

# Run post-deployment tests
run_post_deployment_tests() {
    print_status "Running post-deployment tests..."

    # Health check
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if kubectl get pods -n vital-path --field-selector=status.phase=Running | grep -q "vital-path"; then
            print_success "Application pods are running"
            break
        fi

        print_status "Waiting for pods to be ready... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        print_error "Timeout waiting for pods to be ready"
    fi

    # Run smoke tests
    if [[ -f "tests/smoke-tests.sh" ]]; then
        bash tests/smoke-tests.sh "$ENVIRONMENT"
    fi

    print_success "Post-deployment tests completed"
}

# Cleanup function
cleanup() {
    print_status "Performing cleanup..."

    # Remove temporary files
    rm -f "terraform-outputs-${ENVIRONMENT}.json"

    # Clean up Docker images
    docker system prune -f

    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    # Set trap for cleanup on exit
    trap cleanup EXIT

    print_status "VITAL Path Deployment Started"
    print_status "Environment: $ENVIRONMENT"
    print_status "Region: $REGION"
    print_status "Dry Run: $DRY_RUN"

    check_prerequisites
    load_environment

    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "=== DRY RUN MODE - No changes will be made ==="
    fi

    deploy_infrastructure
    build_and_push_images
    configure_kubectl
    deploy_kubernetes
    run_post_deployment_tests

    print_success "VITAL Path deployment completed successfully!"

    # Show important endpoints
    print_status "Important endpoints:"
    if [[ -f "terraform-outputs-${ENVIRONMENT}.json" ]]; then
        local app_url=$(jq -r '.application_urls.value.main_app' "terraform-outputs-${ENVIRONMENT}.json")
        local api_url=$(jq -r '.application_urls.value.api_gateway' "terraform-outputs-${ENVIRONMENT}.json")
        local monitoring_url=$(jq -r '.application_urls.value.monitoring' "terraform-outputs-${ENVIRONMENT}.json")

        echo "  Application: $app_url"
        echo "  API Gateway: $api_url"
        echo "  Monitoring: $monitoring_url"
    fi

    print_status "Deployment logs can be found in the GitHub Actions workflow"
}

# Run main function
main "$@"