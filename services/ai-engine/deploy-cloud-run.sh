#!/bin/bash
# Google Cloud Run Deployment Script for VITAL AI Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}☁️  Google Cloud Run - VITAL AI Engine${NC}"
echo "=============================================="
echo ""

# Configuration
SERVICE_NAME="${SERVICE_NAME:-vital-ai-engine}"
REGION="${REGION:-us-central1}"
IMAGE_NAME="${DOCKERHUB_USERNAME:-your-username}/vital-ai-engine:latest"
PROJECT_ID="${GCP_PROJECT_ID:-}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK is not installed${NC}"
    echo ""
    echo "   Install:"
    echo "   macOS: brew install google-cloud-sdk"
    echo "   Or: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ Google Cloud SDK is installed${NC}"
echo ""

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not authenticated with Google Cloud${NC}"
    echo "   Attempting to login..."
    gcloud auth login || {
        echo -e "${RED}❌ Google Cloud login failed${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✅ Authenticated with Google Cloud${NC}"
echo ""

# Get or set project
if [ -z "$PROJECT_ID" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$CURRENT_PROJECT" ]; then
        echo -e "${YELLOW}⚠️  No GCP project set${NC}"
        echo "   Please set project:"
        echo "   export GCP_PROJECT_ID=your-project-id"
        echo "   gcloud config set project \$GCP_PROJECT_ID"
        exit 1
    fi
    PROJECT_ID="$CURRENT_PROJECT"
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   Project: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Image: $IMAGE_NAME"
echo ""

# Verify image exists (if using Docker Hub)
if [[ "$IMAGE_NAME" == *"docker.io"* ]] || [[ "$IMAGE_NAME" == *"/"* ]]; then
    echo -e "${YELLOW}📦 Verifying Docker image exists...${NC}"
    if docker manifest inspect "$IMAGE_NAME" &> /dev/null; then
        echo -e "${GREEN}✅ Docker image found${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify Docker image${NC}"
        echo "   Continuing anyway..."
    fi
    echo ""
fi

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com --project="$PROJECT_ID" || true
gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID" || true
echo ""

# Build environment variables from .env.local if it exists
ENV_VARS=""

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}📋 Loading environment variables from .env.local...${NC}"
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [ -z "$key" ] && continue
        
        # Remove quotes from value
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        if [ -n "$ENV_VARS" ]; then
            ENV_VARS="${ENV_VARS},"
        fi
        ENV_VARS="${ENV_VARS}${key}=${value}"
    done < <(grep -v '^#' .env.local | grep '=')
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  No .env.local file found${NC}"
    echo "   Environment variables must be set manually or via --set-env-vars"
    echo ""
fi

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
echo ""

DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0"

# Add environment variables if available
if [ -n "$ENV_VARS" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --set-env-vars $ENV_VARS"
fi

echo -e "${BLUE}Running:${NC} $DEPLOY_CMD"
echo ""

if eval "$DEPLOY_CMD"; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
      --platform managed \
      --region "$REGION" \
      --format="value(status.url)")
    
    echo -e "${BLUE}🌐 Service URL:${NC} $SERVICE_URL"
    echo ""
    echo -e "${BLUE}🧪 Test health endpoint:${NC}"
    echo "   curl $SERVICE_URL/health"
    echo ""
    echo -e "${BLUE}📊 View logs:${NC}"
    echo "   gcloud run services logs read $SERVICE_NAME --region $REGION"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "   1. Test: curl $SERVICE_URL/health"
    echo "   2. Update frontend .env.local with: AI_ENGINE_URL=$SERVICE_URL"
    echo "   3. Monitor: https://console.cloud.google.com/run"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

