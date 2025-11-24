#!/bin/bash
# lib/shell/common.sh - Common shell functions for VITAL ops scripts

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

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

# Validation functions
validate_environment() {
    local env=$1
    if [[ ! "$env" =~ ^(dev|development|staging|production|prod)$ ]]; then
        log_error "Invalid environment: $env"
        log_error "Must be one of: dev, development, staging, production, prod"
        exit 1
    fi
    log_info "Environment validated: $env"
}

validate_file_exists() {
    local file=$1
    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        exit 1
    fi
}

validate_directory_exists() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        log_error "Directory not found: $dir"
        exit 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Require command
require_command() {
    local cmd=$1
    if ! command_exists "$cmd"; then
        log_error "Required command not found: $cmd"
        log_error "Please install $cmd and try again"
        exit 1
    fi
}

# Confirm action
confirm_action() {
    local message=$1
    local default=${2:-n}
    
    if [ "$default" = "y" ]; then
        read -p "$message [Y/n]: " response
        response=${response:-y}
    else
        read -p "$message [y/N]: " response
        response=${response:-n}
    fi
    
    [[ "$response" =~ ^[Yy]$ ]]
}

# Get script directory
get_script_dir() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
}

# Get project root
get_project_root() {
    local script_dir=$(get_script_dir)
    echo "$(cd "$script_dir/../.." && pwd)"
}

# Load environment file
load_env_file() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        log_info "Loading environment from: $env_file"
        export $(grep -v '^#' "$env_file" | xargs)
        log_success "Environment loaded"
    else
        log_error "Environment file not found: $env_file"
        exit 1
    fi
}

# Check if running as root
check_not_root() {
    if [ "$EUID" -eq 0 ]; then
        log_error "This script should NOT be run as root"
        exit 1
    fi
}

# Wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    log_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            log_success "$service_name is ready!"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name failed to start within expected time"
    return 1
}

# Export all functions
export -f log_info log_success log_warning log_error
export -f validate_environment validate_file_exists validate_directory_exists
export -f command_exists require_command confirm_action
export -f get_script_dir get_project_root load_env_file
export -f check_not_root wait_for_service

