#!/bin/bash
# Build and deploy Python AI Engine Docker image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🐳 Building VITAL AI Engine Docker Image${NC}"
echo ""

# Image name and tag
IMAGE_NAME="vital-ai-engine"
TAG="${1:-latest}"

# Clean up old containers and images
echo -e "${YELLOW}🧹 Cleaning up old containers and images...${NC}"
docker ps -a --filter "name=${IMAGE_NAME}" --format "{{.ID}}" | xargs -r docker rm -f 2>/dev/null || true
docker images "${IMAGE_NAME}:*" --format "{{.ID}}" | xargs -r docker rmi -f 2>/dev/null || true

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image: ${IMAGE_NAME}:${TAG}${NC}"
docker build \
    --tag "${IMAGE_NAME}:${TAG}" \
    --tag "${IMAGE_NAME}:latest" \
    --file "${SCRIPT_DIR}/Dockerfile" \
    "${SCRIPT_DIR}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully: ${IMAGE_NAME}:${TAG}${NC}"
    echo ""
    echo -e "${BLUE}📦 Image details:${NC}"
    docker images "${IMAGE_NAME}:${TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    echo ""
    echo -e "${BLUE}🚀 To run the container:${NC}"
    echo "  docker run -d --name ${IMAGE_NAME} -p 8000:8000 ${IMAGE_NAME}:${TAG}"
    echo ""
    echo -e "${BLUE}🐳 To use with docker-compose:${NC}"
    echo "  docker-compose up -d python-ai-services"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

