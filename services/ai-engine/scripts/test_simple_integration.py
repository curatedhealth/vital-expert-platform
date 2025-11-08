#!/usr/bin/env python3
"""
Simple Integration Test for VITAL AI Modes
Tests the actual endpoints with correct request format
"""

import httpx
import json
import time
import asyncio
from typing import Dict, Any

# Configuration
AI_ENGINE_URL = "http://localhost:8080"
TEST_TIMEOUT = 30.0

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


async def test_mode1():
    """Test Mode 1: Manual Interactive"""
    print(f"\n{Colors.BLUE}🧪 Testing Mode 1: Manual Interactive{Colors.RESET}")
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            # Use a default agent ID (FDA Regulatory Expert is commonly available)
            agent_id = "fda_regulatory_expert"
            print(f"  → Using agent: {agent_id}")
            
            # Test with SSE endpoint (streaming)
            print("  → Sending request to /api/mode1/manual...")
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode1/manual",
                json={
                    "agent_id": agent_id,
                    "message": "What are the FDA requirements for Class II medical devices?",
                    "enable_rag": True,
                    "enable_tools": False
                },
                timeout=TEST_TIMEOUT
            )
            
            duration = (time.time() - start) * 1000
            
            if response.status_code == 200:
                # For SSE, we just check it started
                print(f"  {Colors.GREEN}✅ Mode 1 passed ({duration:.0f}ms){Colors.RESET}")
                print(f"  → Response type: {response.headers.get('content-type')}")
                return True
            else:
                print(f"  {Colors.RED}❌ Mode 1 failed: HTTP {response.status_code}{Colors.RESET}")
                print(f"  → {response.text[:500]}")
                return False
                
    except Exception as e:
        duration = (time.time() - start) * 1000
        print(f"  {Colors.RED}❌ Mode 1 failed ({duration:.0f}ms): {e}{Colors.RESET}")
        import traceback
        print(f"  {Colors.RED}   {traceback.format_exc()[:500]}{Colors.RESET}")
        return False


async def test_mode2():
    """Test Mode 2: Automatic"""
    print(f"\n{Colors.BLUE}🧪 Testing Mode 2: Automatic{Colors.RESET}")
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            print("  → Sending request to /api/mode2/automatic...")
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode2/automatic",
                json={
                    "message": "Find recent research on AI-powered diagnostic tools",
                    "enable_rag": True,
                    "enable_tools": False
                },
                timeout=TEST_TIMEOUT
            )
            
            duration = (time.time() - start) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"  {Colors.GREEN}✅ Mode 2 passed ({duration:.0f}ms){Colors.RESET}")
                print(f"  → Response length: {len(data.get('response', ''))} chars")
                print(f"  → Agent selected: {data.get('metadata', {}).get('selected_agent_id')}")
                return True
            else:
                print(f"  {Colors.RED}❌ Mode 2 failed: HTTP {response.status_code}{Colors.RESET}")
                print(f"  → {response.text[:200]}")
                return False
                
    except Exception as e:
        duration = (time.time() - start) * 1000
        print(f"  {Colors.RED}❌ Mode 2 failed ({duration:.0f}ms): {e}{Colors.RESET}")
        return False


async def test_mode3():
    """Test Mode 3: Autonomous Automatic"""
    print(f"\n{Colors.BLUE}🧪 Testing Mode 3: Autonomous Automatic{Colors.RESET}")
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            print("  → Sending request to /api/mode3/autonomous-automatic...")
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode3/autonomous-automatic",
                json={
                    "message": "What are the key considerations for developing a mobile health app?",
                    "enable_rag": True,
                    "enable_tools": False
                },
                timeout=TEST_TIMEOUT
            )
            
            duration = (time.time() - start) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"  {Colors.GREEN}✅ Mode 3 passed ({duration:.0f}ms){Colors.RESET}")
                print(f"  → Response length: {len(data.get('response', ''))} chars")
                print(f"  → Agents used: {len(data.get('metadata', {}).get('agents_used', []))}")
                return True
            else:
                print(f"  {Colors.RED}❌ Mode 3 failed: HTTP {response.status_code}{Colors.RESET}")
                print(f"  → {response.text[:200]}")
                return False
                
    except Exception as e:
        duration = (time.time() - start) * 1000
        print(f"  {Colors.RED}❌ Mode 3 failed ({duration:.0f}ms): {e}{Colors.RESET}")
        return False


async def test_mode4():
    """Test Mode 4: Autonomous Manual"""
    print(f"\n{Colors.BLUE}🧪 Testing Mode 4: Autonomous Manual{Colors.RESET}")
    start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            print("  → Sending request to /api/mode4/autonomous-manual...")
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode4/autonomous-manual",
                json={
                    "agent_id": "fda_regulatory_expert",  # Mode 4 requires agent_id
                    "message": "Help me understand the regulatory pathway for an AI-based ECG monitor",
                    "enable_rag": True,
                    "enable_tools": False
                },
                timeout=TEST_TIMEOUT
            )
            
            duration = (time.time() - start) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"  {Colors.GREEN}✅ Mode 4 passed ({duration:.0f}ms){Colors.RESET}")
                print(f"  → Response length: {len(data.get('response', ''))} chars")
                print(f"  → Agents proposed: {len(data.get('metadata', {}).get('proposed_agents', []))}")
                return True
            else:
                print(f"  {Colors.RED}❌ Mode 4 failed: HTTP {response.status_code}{Colors.RESET}")
                print(f"  → {response.text[:500]}")
                return False
                
    except Exception as e:
        duration = (time.time() - start) * 1000
        print(f"  {Colors.RED}❌ Mode 4 failed ({duration:.0f}ms): {e}{Colors.RESET}")
        return False


async def test_health():
    """Test health endpoint"""
    print(f"\n{Colors.BLUE}🏥 Checking AI Engine Health{Colors.RESET}")
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{AI_ENGINE_URL}/health")
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status')
                print(f"  {Colors.GREEN}✅ AI Engine healthy: {status}{Colors.RESET}")
                
                services = data.get('services', {})
                for service, service_status in services.items():
                    emoji = "✅" if service_status == "healthy" else "⚠️"
                    print(f"  {emoji} {service}: {service_status}")
                
                return True
            else:
                print(f"  {Colors.RED}❌ Health check failed: HTTP {response.status_code}{Colors.RESET}")
                return False
                
    except Exception as e:
        import traceback
        print(f"  {Colors.RED}❌ Cannot connect to AI Engine: {e}{Colors.RESET}")
        print(f"  {Colors.RED}   {traceback.format_exc()}{Colors.RESET}")
        return False


async def test_metrics():
    """Test metrics endpoint"""
    print(f"\n{Colors.BLUE}📊 Checking Prometheus Metrics{Colors.RESET}")
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{AI_ENGINE_URL}/metrics")
            
            if response.status_code == 200:
                metrics_text = response.text
                
                # Count key metrics
                workflow_metrics = metrics_text.count("vital_workflow")
                parallel_metrics = metrics_text.count("vital_parallel")
                rag_metrics = metrics_text.count("vital_rag")
                
                print(f"  {Colors.GREEN}✅ Metrics endpoint accessible{Colors.RESET}")
                print(f"  → Workflow metrics: {workflow_metrics}")
                print(f"  → Parallel metrics: {parallel_metrics}")
                print(f"  → RAG metrics: {rag_metrics}")
                
                return True
            else:
                print(f"  {Colors.RED}❌ Metrics check failed: HTTP {response.status_code}{Colors.RESET}")
                return False
                
    except Exception as e:
        print(f"  {Colors.RED}❌ Cannot access metrics: {e}{Colors.RESET}")
        return False


async def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║         VITAL AI - SIMPLE INTEGRATION TEST SUITE             ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    start_time = time.time()
    results = []
    
    # Pre-flight checks
    health_ok = await test_health()
    if not health_ok:
        print(f"\n{Colors.RED}❌ AI Engine is not healthy. Aborting tests.{Colors.RESET}\n")
        return
    
    metrics_ok = await test_metrics()
    
    # Run all mode tests
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}RUNNING MODE TESTS{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    
    results.append(("Mode 1", await test_mode1()))
    results.append(("Mode 2", await test_mode2()))
    results.append(("Mode 3", await test_mode3()))
    results.append(("Mode 4", await test_mode4()))
    
    # Summary
    total_time = time.time() - start_time
    passed = sum(1 for _, result in results if result)
    failed = len(results) - passed
    pass_rate = (passed / len(results) * 100) if results else 0
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"\n📊 Results:")
    print(f"   • Total Tests: {len(results)}")
    print(f"   • Passed: {passed} ✅")
    print(f"   • Failed: {failed} ❌")
    print(f"   • Pass Rate: {pass_rate:.1f}%")
    print(f"   • Duration: {total_time:.2f}s")
    
    print(f"\n📝 Detailed Results:")
    for name, result in results:
        status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if result else f"{Colors.RED}❌ FAIL{Colors.RESET}"
        print(f"   • {name}: {status}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}✅ ALL TESTS PASSED{Colors.RESET}\n")
        exit(0)
    else:
        print(f"\n{Colors.YELLOW}⚠️  SOME TESTS FAILED{Colors.RESET}\n")
        exit(1)


if __name__ == "__main__":
    asyncio.run(main())

