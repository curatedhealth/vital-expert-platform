#!/usr/bin/env python3
"""
Load Seed Data via Supabase REST API
Parses transformed SQL and loads data via REST API endpoints
"""

import json
import re
import requests
from pathlib import Path
from typing import Dict, List, Any

# Configuration
SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTQyNTQ5MiwiZXhwIjoyMDQ3MDAxNDkyfQ.w8YGAoJx42rFNIJ_qNR2oWHj0LTt8L0dPmaDnpUwLcI"

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

DIGITAL_HEALTH_STARTUP_TENANT_ID = "11111111-1111-1111-1111-111111111111"

def extract_insert_statements(sql_content: str, table_name: str) -> List[Dict[str, Any]]:
    """
    Extract INSERT statement data for a specific table from SQL content
    Very simplified parser - may need enhancement for complex SQL
    """
    # This is a simplified approach - for production, use proper SQL parser
    # For now, we'll manually create the data structures
    return []

def load_agents_manually():
    """
    Manually create foundation agents data and load via API
    """
    print("\n" + "=" * 80)
    print("📦 Loading Foundation Agents")
    print("=" * 80)

    agents = [
        {
            "tenant_id": DIGITAL_HEALTH_STARTUP_TENANT_ID,
            "code": "AGT-WORKFLOW-ORCHESTRATOR",
            "name": "Workflow Orchestration Agent",
            "unique_id": "AGT-WORKFLOW-ORCHESTRATOR",
            "agent_type": "ORCHESTRATOR",
            "framework": "langgraph",
            "description": "Master orchestrator that coordinates multi-agent workflows, manages task dependencies, and handles error recovery",
            "capabilities": ["Workflow planning and decomposition", "Agent task assignment", "Dependency management", "Error recovery and retry logic", "Progress tracking and reporting"],
            "autonomy_level": "SUPERVISED",
            "model_config": {
                "model": "gpt-4",
                "temperature": 0.2,
                "max_tokens": 4000
            },
            "tags": ["orchestration", "workflow", "coordination"],
            "status": "active",
            "metadata": {
                "domains": ["clinical_development", "regulatory_affairs", "medical_affairs"],
                "can_delegate_to": ["SPECIALIST", "EXECUTOR", "RETRIEVER"],
                "max_concurrent_tasks": 10,
                "retry_strategy": "exponential_backoff"
            }
        },
        {
            "tenant_id": DIGITAL_HEALTH_STARTUP_TENANT_ID,
            "code": "AGT-PROJECT-COORDINATOR",
            "name": "Project Coordination Agent",
            "unique_id": "AGT-PROJECT-COORDINATOR",
            "agent_type": "ORCHESTRATOR",
            "framework": "langgraph",
            "description": "Coordinates cross-functional project activities, manages stakeholder communications, and tracks deliverables",
            "capabilities": ["Project planning", "Stakeholder coordination", "Timeline management", "Resource allocation", "Status reporting"],
            "autonomy_level": "SUPERVISED",
            "model_config": {
                "model": "gpt-4",
                "temperature": 0.3,
                "max_tokens": 3000
            },
            "tags": ["project_management", "coordination", "stakeholder"],
            "status": "active",
            "metadata": {
                "domains": ["clinical_development", "regulatory_affairs", "medical_affairs", "commercial_strategy"],
                "notification_channels": ["email", "slack"],
                "escalation_enabled": True
            }
        }
    ]

    print(f"Prepared {len(agents)} agents to load")

    # Try to insert agents
    url = f"{SUPABASE_URL}/rest/v1/agents"

    for i, agent in enumerate(agents, 1):
        print(f"\n[{i}/{len(agents)}] Loading: {agent['name']}")
        print(f"  Code: {agent['code']}")
        print(f"  Type: {agent['agent_type']}")

        try:
            response = requests.post(
                url,
                headers=HEADERS,
                json=agent,
                timeout=30
            )

            if response.status_code in [200, 201]:
                print(f"  ✅ Success")
            else:
                print(f"  ❌ Failed: {response.status_code}")
                print(f"  Error: {response.text}")

        except Exception as e:
            print(f"  ❌ Exception: {e}")

    print("\n" + "=" * 80)

def verify_tenant_exists():
    """
    Verify digital-health-startup tenant exists
    """
    print("\n" + "=" * 80)
    print("🔍 Verifying Tenant")
    print("=" * 80)

    url = f"{SUPABASE_URL}/rest/v1/tenants?id=eq.{DIGITAL_HEALTH_STARTUP_TENANT_ID}"

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)

        if response.status_code == 200:
            tenants = response.json()
            if tenants:
                tenant = tenants[0]
                print(f"✅ Tenant found: {tenant.get('name')} ({tenant.get('slug')})")
                print(f"   ID: {tenant.get('id')}")
                print(f"   Status: {tenant.get('status')}")
                print(f"   Tier: {tenant.get('tier')}")
                return True
            else:
                print(f"❌ Tenant not found with ID: {DIGITAL_HEALTH_STARTUP_TENANT_ID}")
                return False
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    print("=" * 80)
    print("🚀 Seed Data Loader via REST API")
    print("=" * 80)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Target Tenant: {DIGITAL_HEALTH_STARTUP_TENANT_ID}")
    print()

    # Step 1: Verify tenant
    if not verify_tenant_exists():
        print("\n❌ Cannot proceed without tenant. Please create it first.")
        return

    # Step 2: Load foundation agents
    load_agents_manually()

    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print("\nThis script loaded a sample of foundation agents.")
    print("For complete data loading, please use Supabase Studio SQL Editor:")
    print(f"\n1. Go to: {SUPABASE_URL}/project/_/sql")
    print("2. Open each transformed SQL file from:")
    print("   /Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed")
    print("3. Copy/paste content and execute")
    print()

if __name__ == "__main__":
    main()
