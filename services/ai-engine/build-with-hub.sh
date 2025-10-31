#!/bin/bash
# Interactive Docker Build Cloud Script - Prompts for Docker Hub username

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

# Check if Docker Hub username is set
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo -e "${YELLOW}📋 Docker Hub username not set${NC}"
    echo ""
    echo "Please provide your Docker Hub username:"
    read -p "Docker Hub username: " DOCKERHUB_USERNAME
    echo ""
fi

# Check if logged in to Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub${NC}"
    echo "   Attempting to login..."
    echo ""
    if docker login; then
        echo -e "${GREEN}✅ Logged in to Docker Hub${NC}"
        echo ""
    else
        echo -e "${RED}❌ Docker login failed${NC}"
        echo "   Please run: docker login"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Already logged in to Docker Hub${NC}"
    echo ""
fi

# Configuration
IMAGE_NAME="${DOCKERHUB_USERNAME}/vital-ai-engine"
TAG="${1:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64}"

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

# Check for Docker Buildx
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}❌ Docker Buildx is not available${NC}"
    echo "   Please update Docker Desktop to latest version"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running and Buildx is available${NC}"
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
else
    echo -e "${YELLOW}⚠️  Cloud builder not found, using default builder${NC}"
    echo ""
    echo "   To enable Docker Build Cloud:"
    echo "   1. Open Docker Desktop"
    echo "   2. Go to Settings → Build Cloud"
    echo "   3. Sign in to Docker Hub (if not already)"
    echo "   4. Enable Build Cloud (7-day free trial)"
    echo ""
    echo -e "${YELLOW}   Continuing with local builder...${NC}"
    echo ""
fi

# Build using Buildx
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
echo ""

if docker buildx build \
    --builder "$BUILDER_NAME" \
    --platform "$PLATFORMS" \
    --tag "${IMAGE_NAME}:${TAG}" \
    --tag "${IMAGE_NAME}:latest" \
    --load \
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
    echo -e "${YELLOW}💡 To push to Docker Hub, run:${NC}"
    echo "   docker push ${IMAGE_NAME}:${TAG}"
    echo "   docker push ${IMAGE_NAME}:latest"
    echo ""
    echo -e "${BLUE}🚀 Or use the full build script with --push:${NC}"
    echo "   ./build-cloud.sh"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

