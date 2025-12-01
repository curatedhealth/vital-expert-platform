#!/usr/bin/env python3
"""
Test the full AI Engine with LangGraph workflows
Tests all 4 modes with minimal dependencies
"""

import asyncio
import json
import aiohttp

API_BASE = "http://localhost:8001/api"

async def test_mode1():
    """Test Mode 1: Manual agent selection"""
    print("\n🧪 Testing Mode 1: Manual Interactive...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    payload = {
        "message": "What are the key requirements for FDA approval?",
        "agent_id": "regulatory_expert_001",
        "session_id": "test_session_001",
        "user_id": "test_user_001",
        "enable_rag": True,
        "enable_tools": False,
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{API_BASE}/mode1/manual",
                json=payload,
                headers={"x-tenant-id": "550e8400-e29b-41d4-a716-446655440000"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Mode 1 Success!")
                    print(f"   Agent ID: {result.get('agent_id')}")
                    print(f"   Content: {result.get('content', '')[:100]}...")
                    print(f"   Confidence: {result.get('confidence')}")
                    print(f"   Citations: {len(result.get('citations', []))}")
                    print(f"   Reasoning: {len(result.get('reasoning', []))}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Mode 1 Failed: {response.status}")
                    print(f"   Error: {error_text[:200]}")
                    return False
    except Exception as e:
        print(f"❌ Mode 1 Exception: {e}")
        return False

async def test_mode2():
    """Test Mode 2: Automatic agent selection"""
    print("\n🧪 Testing Mode 2: Automatic Agent Selection...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    payload = {
        "message": "How do clinical trials work?",
        "session_id": "test_session_002",
        "user_id": "test_user_001",
        "enable_rag": True,
        "enable_tools": False,
        "model": "gpt-4"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{API_BASE}/mode2/automatic",
                json=payload,
                headers={"x-tenant-id": "550e8400-e29b-41d4-a716-446655440000"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Mode 2 Success!")
                    print(f"   Content: {result.get('content', '')[:100]}...")
                    print(f"   Confidence: {result.get('confidence')}")
                    if result.get('agent_selection'):
                        print(f"   Selected Agent: {result['agent_selection'].get('agent_id')}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Mode 2 Failed: {response.status}")
                    print(f"   Error: {error_text[:200]}")
                    return False
    except Exception as e:
        print(f"❌ Mode 2 Exception: {e}")
        return False

async def test_mode3():
    """Test Mode 3: Autonomous + Automatic"""
    print("\n🧪 Testing Mode 3: Autonomous-Automatic...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    payload = {
        "message": "Research the latest FDA guidance on digital health",
        "session_id": "test_session_003",
        "user_id": "test_user_001",
        "enable_rag": True,
        "enable_tools": True,
        "model": "gpt-4",
        "max_iterations": 3
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{API_BASE}/mode3/autonomous-automatic",
                json=payload,
                headers={"x-tenant-id": "550e8400-e29b-41d4-a716-446655440000"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Mode 3 Success!")
                    print(f"   Content: {result.get('content', '')[:100]}...")
                    print(f"   Confidence: {result.get('confidence')}")
                    if result.get('autonomous_reasoning'):
                        print(f"   Iterations: {result['autonomous_reasoning'].get('iterations')}")
                        print(f"   Tools Used: {result['autonomous_reasoning'].get('tools_used', [])}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Mode 3 Failed: {response.status}")
                    print(f"   Error: {error_text[:200]}")
                    return False
    except Exception as e:
        print(f"❌ Mode 3 Exception: {e}")
        return False

async def test_mode4():
    """Test Mode 4: Autonomous + Manual"""
    print("\n🧪 Testing Mode 4: Autonomous-Manual...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    payload = {
        "message": "Create a comprehensive FDA submission strategy",
        "agent_id": "regulatory_expert_001",
        "session_id": "test_session_004",
        "user_id": "test_user_001",
        "enable_rag": True,
        "enable_tools": True,
        "model": "gpt-4",
        "max_iterations": 3
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{API_BASE}/mode4/autonomous-manual",
                json=payload,
                headers={"x-tenant-id": "550e8400-e29b-41d4-a716-446655440000"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Mode 4 Success!")
                    print(f"   Agent ID: {result.get('agent_id')}")
                    print(f"   Content: {result.get('content', '')[:100]}...")
                    print(f"   Confidence: {result.get('confidence')}")
                    if result.get('autonomous_reasoning'):
                        print(f"   Iterations: {result['autonomous_reasoning'].get('iterations')}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Mode 4 Failed: {response.status}")
                    print(f"   Error: {error_text[:200]}")
                    return False
    except Exception as e:
        print(f"❌ Mode 4 Exception: {e}")
        return False

async def main():
    """Run all tests"""
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🧪 Full AI Engine LangGraph Workflow Tests")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("")
    print("Testing on http://localhost:8001")
    print("")
    
    # Run tests
    results = {
        "mode1": await test_mode1(),
        "mode2": await test_mode2(),
        "mode3": await test_mode3(),
        "mode4": await test_mode4(),
    }
    
    # Summary
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 TEST SUMMARY")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    for mode, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  {mode.upper()}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    print(f"\n{passed}/{total} tests passed")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == "__main__":
    asyncio.run(main())

