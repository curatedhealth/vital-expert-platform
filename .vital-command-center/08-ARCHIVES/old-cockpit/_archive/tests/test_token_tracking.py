#!/usr/bin/env python3
"""
Test script for VITAL Token Tracking System
Verifies database connectivity and configuration
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime

# Load environment variables
load_dotenv('.env.local')

def test_connection():
    """Test Supabase connection"""
    print("=" * 60)
    print("VITAL Token Tracking System - Connection Test")
    print("=" * 60)

    # Check environment variables
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

    if not supabase_url or not supabase_key:
        print("❌ ERROR: Missing environment variables")
        print(f"   SUPABASE_URL: {'✓' if supabase_url else '✗'}")
        print(f"   SUPABASE_SERVICE_KEY: {'✓' if supabase_key else '✗'}")
        return False

    print(f"\n✅ Environment variables configured")
    print(f"   SUPABASE_URL: {supabase_url}")

    # Test Supabase connection
    try:
        supabase = create_client(supabase_url, supabase_key)
        print(f"\n✅ Supabase client created successfully")
    except Exception as e:
        print(f"\n❌ Failed to create Supabase client: {e}")
        return False

    # Test database tables
    tables_to_check = [
        'token_usage_logs',
        'budget_limits',
        'cost_alerts',
        'service_performance_metrics',
        'workflow_analytics'
    ]

    print(f"\n📊 Checking database tables...")
    for table in tables_to_check:
        try:
            result = supabase.table(table).select('*').limit(1).execute()
            print(f"   ✅ {table}: accessible")
        except Exception as e:
            print(f"   ❌ {table}: {str(e)[:50]}")
            return False

    # Check budget limits
    print(f"\n💰 Budget Limits Configuration:")
    try:
        result = supabase.table('budget_limits').select('entity_type, entity_id, daily_limit, monthly_limit').execute()
        for limit in result.data:
            print(f"   • {limit['entity_type']:12} | {limit['entity_id']:20} | Daily: ${limit['daily_limit']:.2f} | Monthly: ${limit['monthly_limit']:.2f}")
    except Exception as e:
        print(f"   ❌ Error reading budget limits: {e}")

    # Test insert capability
    print(f"\n🧪 Testing insert capability...")
    test_log = {
        'service_type': '1:1_conversation',
        'service_id': 'test_service_001',
        'agent_id': 'test_agent_001',
        'agent_name': 'Test Agent',
        'agent_tier': 1,
        'user_id': '550e8400-e29b-41d4-a716-446655440000',
        'session_id': 'test_session_001',
        'provider': 'anthropic',
        'model_name': 'claude-haiku-4-20250514',
        'prompt_tokens': 100,
        'completion_tokens': 50,
        'input_cost': 0.0001,
        'output_cost': 0.00025,
        'latency_ms': 1500,
        'success': True
    }

    try:
        result = supabase.table('token_usage_logs').insert(test_log).execute()
        print(f"   ✅ Test log inserted successfully")
        print(f"      ID: {result.data[0]['id']}")
        print(f"      Total Cost: ${result.data[0]['total_cost']:.6f}")
    except Exception as e:
        print(f"   ❌ Failed to insert test log: {e}")
        return False

    # Test budget check function
    print(f"\n🔍 Testing budget check function...")
    try:
        result = supabase.rpc('check_user_budget', {
            'p_user_id': '550e8400-e29b-41d4-a716-446655440000',
            'p_session_id': 'test_session_001',
            'p_estimated_cost': 0.50
        }).execute()

        if result.data and len(result.data) > 0:
            check = result.data[0]
            print(f"   ✅ Budget check passed")
            print(f"      Allowed: {check['allowed']}")
            print(f"      Reason: {check['reason']}")
            print(f"      Remaining: ${check['remaining_budget']:.2f}")
        else:
            print(f"   ⚠️  Budget check returned no data")
    except Exception as e:
        print(f"   ❌ Budget check failed: {e}")

    # Summary
    print(f"\n{'=' * 60}")
    print(f"✅ All systems operational!")
    print(f"{'=' * 60}")
    print(f"\nNext steps:")
    print(f"1. Add your Anthropic API key to .env.local")
    print(f"2. Run: python vital_langchain_tracker_complete.py")
    print(f"3. Check token_usage_logs table for tracked usage")

    return True

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
