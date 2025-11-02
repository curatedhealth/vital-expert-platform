#!/bin/bash

# Ask Panel - Quick Deployment Script
# Usage: ./deploy.sh [vercel|docker|test]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Environment variables (set these in .env.local or pass them in)
: ${NEXT_PUBLIC_SUPABASE_URL:="https://xazinxsiglqokwfmogyk.supabase.co"}
: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"}
: ${NEXT_PUBLIC_API_URL:="https://vital-expert-preprod.vercel.app/api"}

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Ask Panel - Deployment Tool           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "@vital/ask-panel" package.json; then
    print_error "Please run this script from the apps/ask-panel directory"
    exit 1
fi

print_success "Found Ask Panel project"

# Deployment type
DEPLOY_TYPE=${1:-"help"}

case $DEPLOY_TYPE in
    "vercel")
        print_info "Deploying to Vercel..."
        echo ""
        
        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        print_success "Vercel CLI found"
        
        # Login check
        print_info "Checking Vercel authentication..."
        if ! vercel whoami &> /dev/null; then
            print_warning "Not logged in to Vercel. Opening login..."
            vercel login
        fi
        
        print_success "Authenticated with Vercel"
        
        # Build check
        print_info "Running build check..."
        pnpm build
        
        print_success "Build successful"
        
        # Deploy
        print_info "Deploying to production..."
        vercel --prod
        
        echo ""
        print_success "Deployment complete!"
        print_warning "Don't forget to set environment variables in Vercel Dashboard:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - NEXT_PUBLIC_API_URL"
        ;;
        
    "docker")
        print_info "Building Docker image..."
        echo ""
        
        # Build Docker image
        docker build -t ask-panel:latest .
        
        print_success "Docker image built successfully"
        
        print_info "To run the container:"
        echo ""
        echo "  docker run -p 3002:3002 \\"
        echo "    -e NEXT_PUBLIC_SUPABASE_URL=\"$NEXT_PUBLIC_SUPABASE_URL\" \\"
        echo "    -e NEXT_PUBLIC_SUPABASE_ANON_KEY=\"$NEXT_PUBLIC_SUPABASE_ANON_KEY\" \\"
        echo "    -e NEXT_PUBLIC_API_URL=\"$NEXT_PUBLIC_API_URL\" \\"
        echo "    ask-panel:latest"
        echo ""
        
        read -p "Do you want to run the container now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker run -p 3002:3002 \
                -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
                -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
                -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
                ask-panel:latest
        fi
        ;;
        
    "test")
        print_info "Running local development server..."
        echo ""
        
        # Kill existing processes on port 3002
        print_info "Checking for existing processes on port 3002..."
        if lsof -ti:3002 > /dev/null 2>&1; then
            print_warning "Port 3002 is in use. Killing existing processes..."
            lsof -ti:3002 | xargs kill -9
            sleep 2
        fi
        
        print_success "Port 3002 is free"
        
        # Start dev server
        print_info "Starting development server on http://localhost:3002"
        echo ""
        echo -e "${GREEN}Press Ctrl+C to stop${NC}"
        echo ""
        
        NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        pnpm dev
        ;;
        
    "build")
        print_info "Building production bundle..."
        echo ""
        
        NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        pnpm build
        
        print_success "Build complete!"
        print_info "Build artifacts are in .next/ directory"
        ;;
        
    "clean")
        print_info "Cleaning build artifacts..."
        rm -rf .next
        rm -rf node_modules/.cache
        print_success "Clean complete!"
        ;;
        
    *)
        echo -e "${YELLOW}Usage:${NC} ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  vercel    Deploy to Vercel (production)"
        echo "  docker    Build and optionally run Docker image"
        echo "  test      Start local development server"
        echo "  build     Build production bundle locally"
        echo "  clean     Clean build artifacts"
        echo ""
        echo "Examples:"
        echo "  ./deploy.sh vercel    # Deploy to Vercel"
        echo "  ./deploy.sh test      # Run dev server"
        echo "  ./deploy.sh docker    # Build Docker image"
        echo ""
        exit 0
        ;;
esac

