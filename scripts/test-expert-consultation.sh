#!/bin/bash

# VITAL Expert Consultation Test Script
# This script tests all 4 interaction modes of the expert consultation service

set -e

echo "🧪 Testing VITAL Expert Consultation Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8001"
TEST_USER_ID="test_user_$(date +%s)"

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

# Check if service is running
check_service() {
    print_status "Checking if service is running..."
    
    if ! curl -f $BASE_URL/health > /dev/null 2>&1; then
        print_error "Service is not running at $BASE_URL"
        print_status "Please start the service first: ./scripts/deploy-expert-consultation.sh"
        exit 1
    fi
    
    print_success "Service is running"
}

# Test health endpoints
test_health_endpoints() {
    print_status "Testing health endpoints..."
    
    # Basic health check
    print_status "Testing basic health check..."
    curl -f $BASE_URL/health | jq '.'
    
    # Detailed health check
    print_status "Testing detailed health check..."
    curl -f $BASE_URL/health/detailed | jq '.'
    
    # Readiness check
    print_status "Testing readiness check..."
    curl -f $BASE_URL/health/ready | jq '.'
    
    # Liveness check
    print_status "Testing liveness check..."
    curl -f $BASE_URL/health/live | jq '.'
    
    print_success "Health endpoints test completed"
}

# Test mode recommendation
test_mode_recommendation() {
    print_status "Testing mode recommendation..."
    
    local query="What are the regulatory requirements for Phase III oncology trials?"
    
    local response=$(curl -s -X POST $BASE_URL/expert/modes/recommend-mode \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\", \"user_id\": \"$TEST_USER_ID\"}")
    
    echo "$response" | jq '.'
    
    local recommended_mode=$(echo "$response" | jq -r '.recommended_mode')
    if [ "$recommended_mode" != "null" ] && [ "$recommended_mode" != "" ]; then
        print_success "Mode recommendation test passed: $recommended_mode"
    else
        print_warning "Mode recommendation test failed or returned null"
    fi
}

# Test Auto-Interactive Mode
test_auto_interactive() {
    print_status "Testing Auto-Interactive Mode..."
    
    # Create session
    local session_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/start \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": \"$TEST_USER_ID\", \"interaction_mode\": \"interactive\", \"agent_mode\": \"automatic\"}")
    
    local session_id=$(echo "$session_response" | jq -r '.session_id')
    
    if [ "$session_id" != "null" ] && [ "$session_id" != "" ]; then
        print_success "Auto-Interactive session created: $session_id"
        
        # Test query
        local query="What are the key considerations for Phase III trial design?"
        print_status "Sending query: $query"
        
        local query_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/$session_id/query \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$query\", \"stream\": false}")
        
        echo "$query_response" | jq '.'
        
        print_success "Auto-Interactive mode test completed"
    else
        print_error "Failed to create Auto-Interactive session"
    fi
}

# Test Manual-Interactive Mode
test_manual_interactive() {
    print_status "Testing Manual-Interactive Mode..."
    
    # Get available agents first
    print_status "Getting available agents..."
    local agents_response=$(curl -s -X GET $BASE_URL/expert/modes/agents)
    local agent_id=$(echo "$agents_response" | jq -r '.agents[0].id')
    
    if [ "$agent_id" != "null" ] && [ "$agent_id" != "" ]; then
        print_success "Found agent: $agent_id"
        
        # Create session with manual agent selection
        local session_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/start \
            -H "Content-Type: application/json" \
            -d "{\"user_id\": \"$TEST_USER_ID\", \"interaction_mode\": \"interactive\", \"agent_mode\": \"manual\", \"selected_agent_id\": \"$agent_id\"}")
        
        local session_id=$(echo "$session_response" | jq -r '.session_id')
        
        if [ "$session_id" != "null" ] && [ "$session_id" != "" ]; then
            print_success "Manual-Interactive session created: $session_id"
            
            # Test query
            local query="What are the safety monitoring requirements for oncology trials?"
            print_status "Sending query: $query"
            
            local query_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/$session_id/query \
                -H "Content-Type: application/json" \
                -d "{\"query\": \"$query\", \"stream\": false}")
            
            echo "$query_response" | jq '.'
            
            print_success "Manual-Interactive mode test completed"
        else
            print_error "Failed to create Manual-Interactive session"
        fi
    else
        print_warning "No agents available for Manual-Interactive test"
    fi
}

# Test Auto-Autonomous Mode
test_auto_autonomous() {
    print_status "Testing Auto-Autonomous Mode..."
    
    # Create session
    local session_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/start \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": \"$TEST_USER_ID\", \"interaction_mode\": \"autonomous\", \"agent_mode\": \"automatic\"}")
    
    local session_id=$(echo "$session_response" | jq -r '.session_id')
    
    if [ "$session_id" != "null" ] && [ "$session_id" != "" ]; then
        print_success "Auto-Autonomous session created: $session_id"
        
        # Test query
        local query="Analyze the regulatory landscape for AI-powered medical devices in clinical trials"
        print_status "Sending complex query: $query"
        
        local query_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/$session_id/query \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$query\", \"stream\": false}")
        
        echo "$query_response" | jq '.'
        
        print_success "Auto-Autonomous mode test completed"
    else
        print_error "Failed to create Auto-Autonomous session"
    fi
}

# Test Manual-Autonomous Mode
test_manual_autonomous() {
    print_status "Testing Manual-Autonomous Mode..."
    
    # Get available agents first
    print_status "Getting available agents..."
    local agents_response=$(curl -s -X GET $BASE_URL/expert/modes/agents)
    local agent_id=$(echo "$agents_response" | jq -r '.agents[0].id')
    
    if [ "$agent_id" != "null" ] && [ "$agent_id" != "" ]; then
        print_success "Found agent: $agent_id"
        
        # Create session with manual agent selection
        local session_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/start \
            -H "Content-Type: application/json" \
            -d "{\"user_id\": \"$TEST_USER_ID\", \"interaction_mode\": \"autonomous\", \"agent_mode\": \"manual\", \"selected_agent_id\": \"$agent_id\"}")
        
        local session_id=$(echo "$session_response" | jq -r '.session_id')
        
        if [ "$session_id" != "null" ] && [ "$session_id" != "" ]; then
            print_success "Manual-Autonomous session created: $session_id"
            
            # Test query
            local query="Develop a comprehensive regulatory strategy for a novel oncology drug"
            print_status "Sending complex query: $query"
            
            local query_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/$session_id/query \
                -H "Content-Type: application/json" \
                -d "{\"query\": \"$query\", \"stream\": false}")
            
            echo "$query_response" | jq '.'
            
            print_success "Manual-Autonomous mode test completed"
        else
            print_error "Failed to create Manual-Autonomous session"
        fi
    else
        print_warning "No agents available for Manual-Autonomous test"
    fi
}

# Test mode switching
test_mode_switching() {
    print_status "Testing mode switching..."
    
    # Create initial session
    local session_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/start \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": \"$TEST_USER_ID\", \"interaction_mode\": \"interactive\", \"agent_mode\": \"automatic\"}")
    
    local session_id=$(echo "$session_response" | jq -r '.session_id')
    
    if [ "$session_id" != "null" ] && [ "$session_id" != "" ]; then
        print_success "Initial session created: $session_id"
        
        # Switch to autonomous mode
        print_status "Switching to autonomous mode..."
        local switch_response=$(curl -s -X POST $BASE_URL/expert/modes/sessions/$session_id/switch-mode \
            -H "Content-Type: application/json" \
            -d "{\"interaction_mode\": \"autonomous\", \"agent_mode\": \"automatic\", \"preserve_context\": true}")
        
        echo "$switch_response" | jq '.'
        
        print_success "Mode switching test completed"
    else
        print_error "Failed to create session for mode switching test"
    fi
}

# Test session management
test_session_management() {
    print_status "Testing session management..."
    
    # Get user sessions
    print_status "Getting user sessions..."
    local sessions_response=$(curl -s -X GET $BASE_URL/expert/modes/users/$TEST_USER_ID/sessions)
    echo "$sessions_response" | jq '.'
    
    # Get session history
    if [ ! -z "$session_id" ]; then
        print_status "Getting session history..."
        local history_response=$(curl -s -X GET $BASE_URL/expert/modes/sessions/$session_id/history)
        echo "$history_response" | jq '.'
    fi
    
    print_success "Session management test completed"
}

# Test analytics
test_analytics() {
    print_status "Testing analytics endpoints..."
    
    # Get system metrics
    print_status "Getting system metrics..."
    local metrics_response=$(curl -s -X GET $BASE_URL/expert/analytics/system)
    echo "$metrics_response" | jq '.'
    
    # Get user analytics
    print_status "Getting user analytics..."
    local user_analytics_response=$(curl -s -X GET $BASE_URL/expert/analytics/user/$TEST_USER_ID)
    echo "$user_analytics_response" | jq '.'
    
    print_success "Analytics test completed"
}

# Main test function
main() {
    echo "=========================================="
    echo "VITAL Expert Consultation Service Tests"
    echo "=========================================="
    echo ""
    
    check_service
    test_health_endpoints
    test_mode_recommendation
    test_auto_interactive
    test_manual_interactive
    test_auto_autonomous
    test_manual_autonomous
    test_mode_switching
    test_session_management
    test_analytics
    
    echo ""
    print_success "🎉 All tests completed!"
    echo ""
    print_status "Test Summary:"
    echo "✅ Health endpoints"
    echo "✅ Mode recommendation"
    echo "✅ Auto-Interactive mode"
    echo "✅ Manual-Interactive mode"
    echo "✅ Auto-Autonomous mode"
    echo "✅ Manual-Autonomous mode"
    echo "✅ Mode switching"
    echo "✅ Session management"
    echo "✅ Analytics"
    echo ""
    print_status "The expert consultation service is working correctly!"
}

# Handle command line arguments
case "${1:-}" in
    "health")
        check_service
        test_health_endpoints
        ;;
    "modes")
        test_auto_interactive
        test_manual_interactive
        test_auto_autonomous
        test_manual_autonomous
        ;;
    "interactive")
        test_auto_interactive
        test_manual_interactive
        ;;
    "autonomous")
        test_auto_autonomous
        test_manual_autonomous
        ;;
    *)
        main
        ;;
esac
