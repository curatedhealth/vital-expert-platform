#!/bin/bash
# Docker Build Cloud Build Script for VITAL AI Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Build Cloud - VITAL AI Engine${NC}"
echo "=============================================="
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
IMAGE_NAME="${DOCKERHUB_USERNAME:-your-username}/vital-ai-engine"
TAG="${1:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64}"  # Add linux/arm64 for multi-arch

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   Image: ${IMAGE_NAME}"
echo "   Tag: ${TAG}"
echo "   Platforms: ${PLATFORMS}"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub${NC}"
    echo "   Attempting to login..."
    docker login || {
        echo -e "${RED}❌ Docker login failed${NC}"
        echo "   Please run: docker login"
        exit 1
    }
fi

echo -e "${GREEN}✅ Docker is running and authenticated${NC}"
echo ""

# Check for Docker Buildx
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}❌ Docker Buildx is not available${NC}"
    echo "   Please update Docker Desktop to latest version"
    exit 1
fi

echo -e "${GREEN}✅ Docker Buildx is available${NC}"
echo ""

# List available builders
echo -e "${YELLOW}📋 Available builders:${NC}"
docker buildx ls
echo ""

# Use cloud builder if available, otherwise use default
BUILDER_NAME="desktop-linux"

# Check if cloud builder exists
if docker buildx ls | grep -qi "cloud"; then
    BUILDER_NAME=$(docker buildx ls | grep -i cloud | head -1 | awk '{print $1}')
    echo -e "${GREEN}✅ Cloud builder found: ${BUILDER_NAME}${NC}"
    echo ""
    USE_PUSH="--push"
else
    echo -e "${YELLOW}⚠️  Cloud builder not found, using local builder${NC}"
    echo "   To enable Docker Build Cloud:"
    echo "   1. Open Docker Desktop"
    echo "   2. Go to Settings → Build Cloud"
    echo "   3. Enable Build Cloud (7-day free trial)"
    echo ""
    echo -e "${YELLOW}   Building locally (use --load instead of --push)...${NC}"
    USE_PUSH="--load"
fi

# Build using Buildx
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
echo ""

if docker buildx build \
    --builder "$BUILDER_NAME" \
    --platform "$PLATFORMS" \
    --tag "${IMAGE_NAME}:${TAG}" \
    --tag "${IMAGE_NAME}:latest" \
    $USE_PUSH \
    --file Dockerfile \
    .; then
    
    echo ""
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo ""
    echo -e "${BLUE}📦 Image details:${NC}"
    echo "   Repository: ${IMAGE_NAME}"
    echo "   Tags: ${TAG}, latest"
    echo "   Platforms: ${PLATFORMS}"
    echo ""
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "   1. Verify image: https://hub.docker.com/r/${IMAGE_NAME}"
    echo "   2. Deploy to Cloud Run: ./deploy-cloud-run.sh"
    echo "   3. Or use: gcloud run deploy vital-ai-engine --image ${IMAGE_NAME}:latest"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

