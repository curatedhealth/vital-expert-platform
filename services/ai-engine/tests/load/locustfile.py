"""
VITAL AI Engine Load Testing Suite
===================================

Load testing configuration targeting 100 concurrent users.

Usage:
    # Interactive mode with web UI:
    locust -f tests/load/locustfile.py --host=http://localhost:8000

    # Headless mode (CI/CD):
    locust -f tests/load/locustfile.py --host=http://localhost:8000 \
           --headless -u 100 -r 10 -t 300s --csv=load_test_results

    # Quick smoke test:
    locust -f tests/load/locustfile.py --host=http://localhost:8000 \
           --headless -u 10 -r 2 -t 30s

Performance Targets:
    - 100 concurrent users
    - P95 latency < 2s for health endpoints
    - P95 latency < 5s for agent selection
    - P95 latency < 30s for expert queries (with LLM)
    - Error rate < 1%
"""

import json
import os
import random
import uuid
from typing import Any, Dict, List, Optional

from locust import HttpUser, TaskSet, between, events, task
from locust.runners import MasterRunner, WorkerRunner


# =============================================================================
# Configuration
# =============================================================================

# Test tenant ID (canonical test tenant)
TEST_TENANT_ID = os.getenv("TEST_TENANT_ID", "00000000-0000-0000-0000-000000000001")

# Sample test data
SAMPLE_QUERIES = [
    "What are the FDA requirements for clinical trial design?",
    "How do I handle adverse event reporting in phase 3 trials?",
    "What are the key considerations for regulatory submission?",
    "Explain the difference between 505(b)(1) and 505(b)(2) pathways",
    "What are the GCP compliance requirements?",
    "How do I design a non-inferiority trial?",
    "What biomarkers are used in oncology trials?",
    "Explain the EMA centralized procedure",
    "What are the pharmacovigilance requirements in EU?",
    "How do I handle protocol deviations?",
]

SAMPLE_AGENT_IDS = [
    "c934e9bf-19e0-4952-a46e-a7460ae43418",  # Advanced Therapy Regulatory Expert
    "dad2f053-7d05-4aba-9f1e-bb0779921e1e",  # Regulatory Strategy Advisor
]


# =============================================================================
# Event Handlers for Metrics
# =============================================================================

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    """Initialize custom metrics tracking."""
    if isinstance(environment.runner, MasterRunner):
        print("Load test initialized on master node")
    elif isinstance(environment.runner, WorkerRunner):
        print("Load test initialized on worker node")


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, response, context, exception, **kwargs):
    """Track custom metrics per request."""
    if exception:
        print(f"Request failed: {name} - {exception}")


# =============================================================================
# Task Sets for Different User Behaviors
# =============================================================================

class HealthCheckTasks(TaskSet):
    """Tasks focused on health and status endpoints."""

    @task(10)
    def health_check(self):
        """Basic health check - most frequent."""
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    response.success()
                else:
                    response.failure(f"Unhealthy status: {data.get('status')}")
            else:
                response.failure(f"Status code: {response.status_code}")

    @task(3)
    def readiness_check(self):
        """Readiness probe."""
        self.client.get("/ready")

    @task(2)
    def rate_limit_status(self):
        """Check rate limiter status."""
        self.client.get("/api/rate-limit/status")


class AgentSelectionTasks(TaskSet):
    """Tasks for agent browsing and selection (Mode 2 agent selection)."""

    @task(5)
    def list_agents(self):
        """List available agents."""
        self.client.get(
            "/ask-expert/agents",
            headers={"x-tenant-id": TEST_TENANT_ID}
        )

    @task(3)
    def search_agents(self):
        """Search agents by query (GraphRAG fusion)."""
        query = random.choice(SAMPLE_QUERIES)
        self.client.post(
            "/ask-expert/agents/select",
            json={
                "query": query,
                "top_k": 5
            },
            headers={
                "x-tenant-id": TEST_TENANT_ID,
                "Content-Type": "application/json"
            }
        )

    @task(2)
    def get_agent_details(self):
        """Get specific agent details."""
        agent_id = random.choice(SAMPLE_AGENT_IDS)
        self.client.get(
            f"/ask-expert/agents/{agent_id}",
            headers={"x-tenant-id": TEST_TENANT_ID}
        )


class InteractiveQueryTasks(TaskSet):
    """Tasks for Mode 1/2 interactive queries (lightweight, non-streaming)."""

    def on_start(self):
        """Generate unique session ID for this user."""
        self.session_id = str(uuid.uuid4())

    @task(5)
    def mode1_interactive_query(self):
        """Mode 1: Manual agent selection, interactive chat."""
        agent_id = random.choice(SAMPLE_AGENT_IDS)
        query = random.choice(SAMPLE_QUERIES)

        # Non-streaming endpoint for load testing
        with self.client.post(
            "/api/expert/query",
            json={
                "mode": 1,
                "agent_id": agent_id,
                "message": query,
                "session_id": self.session_id,
                "enable_rag": False  # Faster for load testing
            },
            headers={
                "x-tenant-id": TEST_TENANT_ID,
                "Content-Type": "application/json"
            },
            timeout=30,
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Error: {response.status_code}")

    @task(3)
    def mode2_auto_select_query(self):
        """Mode 2: Automatic agent selection, interactive chat."""
        query = random.choice(SAMPLE_QUERIES)

        with self.client.post(
            "/api/expert/query",
            json={
                "mode": 2,
                "message": query,
                "session_id": self.session_id,
                "enable_rag": False
            },
            headers={
                "x-tenant-id": TEST_TENANT_ID,
                "Content-Type": "application/json"
            },
            timeout=30,
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Error: {response.status_code}")


class AutonomousMissionTasks(TaskSet):
    """Tasks for Mode 3/4 autonomous missions (heavier operations)."""

    def on_start(self):
        """Setup for mission tasks."""
        self.session_id = str(uuid.uuid4())

    @task(2)
    def list_mission_templates(self):
        """Get available mission templates."""
        self.client.get(
            "/ask-expert/v2/missions/templates",
            headers={"x-tenant-id": TEST_TENANT_ID}
        )

    @task(1)
    def create_mission(self):
        """Create a new mission (lightweight check, not full execution)."""
        # This creates a mission but doesn't stream the full execution
        # which would be too slow for load testing
        with self.client.post(
            "/ask-expert/v2/missions",
            json={
                "goal": random.choice(SAMPLE_QUERIES),
                "template_id": "generic",
                "session_id": self.session_id
            },
            headers={
                "x-tenant-id": TEST_TENANT_ID,
                "Content-Type": "application/json"
            },
            timeout=60,
            catch_response=True
        ) as response:
            if response.status_code in [200, 201, 202]:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Error: {response.status_code}")


# =============================================================================
# User Classes with Different Behaviors
# =============================================================================

class HealthMonitor(HttpUser):
    """
    Simulates monitoring/health check traffic.

    - Very frequent requests
    - Very short wait times
    - Only health endpoints
    """
    weight = 2  # 20% of users
    tasks = [HealthCheckTasks]
    wait_time = between(0.5, 2)


class CasualBrowser(HttpUser):
    """
    Simulates users browsing agents without querying.

    - Moderate request frequency
    - Medium wait times
    - Agent listing and search
    """
    weight = 3  # 30% of users
    tasks = [AgentSelectionTasks]
    wait_time = between(2, 5)


class InteractiveUser(HttpUser):
    """
    Simulates users doing Mode 1/2 interactive queries.

    - Lower frequency (queries take time to compose)
    - Longer wait times (reading responses)
    - Mix of agent selection and queries
    """
    weight = 4  # 40% of users
    tasks = [AgentSelectionTasks, InteractiveQueryTasks]
    wait_time = between(5, 15)


class PowerUser(HttpUser):
    """
    Simulates power users doing autonomous missions.

    - Lowest frequency (missions are complex)
    - Longest wait times (missions take time)
    - Full workflow including missions
    """
    weight = 1  # 10% of users
    tasks = [AgentSelectionTasks, InteractiveQueryTasks, AutonomousMissionTasks]
    wait_time = between(10, 30)


# =============================================================================
# Custom Load Test Shapes (Optional)
# =============================================================================

class StagesShape:
    """
    Custom load shape for staged testing.

    Stages:
    1. Warm-up: 10 users for 30s
    2. Ramp-up: 10 -> 50 users over 60s
    3. Sustained: 50 users for 120s
    4. Peak: 50 -> 100 users over 60s
    5. Sustained peak: 100 users for 120s
    6. Cool-down: 100 -> 10 users over 60s
    """
    stages = [
        {"duration": 30, "users": 10, "spawn_rate": 1},    # Warm-up
        {"duration": 60, "users": 50, "spawn_rate": 2},    # Ramp-up
        {"duration": 120, "users": 50, "spawn_rate": 2},   # Sustained
        {"duration": 60, "users": 100, "spawn_rate": 2},   # Peak ramp
        {"duration": 120, "users": 100, "spawn_rate": 2},  # Sustained peak
        {"duration": 60, "users": 10, "spawn_rate": 2},    # Cool-down
    ]

    def tick(self):
        """Return current (user_count, spawn_rate) or None to stop."""
        run_time = self.get_run_time()

        for stage in self.stages:
            run_time -= stage["duration"]
            if run_time < 0:
                return (stage["users"], stage["spawn_rate"])

        return None  # Test complete


# =============================================================================
# Assertions for CI/CD
# =============================================================================

@events.quitting.add_listener
def check_fail_ratio(environment, **kwargs):
    """
    Check if failure ratio is acceptable for CI/CD.

    Fails the test if:
    - Error rate > 1%
    - No requests were made
    """
    if environment.stats.total.fail_ratio > 0.01:
        print(f"FAIL: Error rate {environment.stats.total.fail_ratio:.2%} exceeds 1%")
        environment.process_exit_code = 1
    elif environment.stats.total.num_requests == 0:
        print("FAIL: No requests were made")
        environment.process_exit_code = 1
    else:
        print(f"PASS: Error rate {environment.stats.total.fail_ratio:.2%}")


@events.quitting.add_listener
def check_response_times(environment, **kwargs):
    """
    Check if response times meet SLA.

    Targets:
    - Health endpoints: P95 < 2000ms
    - Agent selection: P95 < 5000ms
    - Expert queries: P95 < 30000ms
    """
    for entry in environment.stats.entries.values():
        name = entry.name
        p95 = entry.get_response_time_percentile(0.95)

        if "health" in name.lower() or "ready" in name.lower():
            if p95 and p95 > 2000:
                print(f"WARN: {name} P95 latency {p95:.0f}ms exceeds 2000ms target")
        elif "agent" in name.lower():
            if p95 and p95 > 5000:
                print(f"WARN: {name} P95 latency {p95:.0f}ms exceeds 5000ms target")
        elif "expert" in name.lower() or "mission" in name.lower():
            if p95 and p95 > 30000:
                print(f"WARN: {name} P95 latency {p95:.0f}ms exceeds 30000ms target")
