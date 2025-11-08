#!/usr/bin/env python3
"""
Integration & E2E Test Runner
Tests all 4 modes end-to-end with real AI engine

Usage:
    python scripts/test_integration_e2e.py --mode all
    python scripts/test_integration_e2e.py --mode 1
    python scripts/test_integration_e2e.py --performance
"""

import asyncio
import json
import time
import httpx
import argparse
from typing import Dict, Any, List, Tuple
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

console = Console()

# Configuration
AI_ENGINE_URL = "http://localhost:8080"
TEST_TIMEOUT = 30.0

# Test data
TEST_QUERIES = {
    "mode1": {
        "query": "What are the FDA requirements for Class II medical devices?",
        "tenant_id": "test_tenant_integration",
        "user_id": "test_user_integration",
        "expected_keywords": ["FDA", "Class II", "510(k)", "medical device"]
    },
    "mode2": {
        "query": "Find recent clinical trials on AI-powered diagnostic tools for diabetes",
        "tenant_id": "test_tenant_integration",
        "user_id": "test_user_integration",
        "expected_keywords": ["clinical trial", "AI", "diagnostic", "diabetes"],
        "expected_tools": ["pubmed_search", "web_search"]
    },
    "mode3": {
        "query": "What are the key considerations for developing a mobile health app?",
        "conversation_id": "test_conv_integration",
        "tenant_id": "test_tenant_integration",
        "user_id": "test_user_integration",
        "expected_keywords": ["mobile health", "app", "development"]
    },
    "mode4": {
        "query": "Help me understand the regulatory pathway for an AI-based ECG monitor",
        "conversation_id": "test_conv_integration_auto",
        "tenant_id": "test_tenant_integration",
        "user_id": "test_user_integration",
        "expected_keywords": ["regulatory", "AI", "ECG", "monitor"],
        "expected_tools": ["fda_database"]
    }
}


class TestResults:
    """Track test results"""
    def __init__(self):
        self.passed = []
        self.failed = []
        self.performance = {}
        self.start_time = time.time()
    
    def add_pass(self, test_name: str, duration: float, details: Dict[str, Any] = None):
        self.passed.append({
            "name": test_name,
            "duration": duration,
            "details": details or {}
        })
    
    def add_fail(self, test_name: str, error: str, details: Dict[str, Any] = None):
        self.failed.append({
            "name": test_name,
            "error": error,
            "details": details or {}
        })
    
    def add_performance(self, metric_name: str, value: float):
        self.performance[metric_name] = value
    
    def summary(self) -> str:
        total = len(self.passed) + len(self.failed)
        pass_rate = (len(self.passed) / total * 100) if total > 0 else 0
        total_time = time.time() - self.start_time
        
        return f"""
╔══════════════════════════════════════════════════════════════╗
║               INTEGRATION TEST RESULTS                        ║
╚══════════════════════════════════════════════════════════════╝

📊 Summary:
   • Total Tests: {total}
   • Passed: {len(self.passed)} ✅
   • Failed: {len(self.failed)} ❌
   • Pass Rate: {pass_rate:.1f}%
   • Duration: {total_time:.2f}s

🎯 Performance Metrics:
{self._format_performance()}

{'✅ ALL TESTS PASSED' if len(self.failed) == 0 else '❌ SOME TESTS FAILED'}
"""
    
    def _format_performance(self) -> str:
        if not self.performance:
            return "   No performance data collected"
        
        lines = []
        for metric, value in self.performance.items():
            lines.append(f"   • {metric}: {value:.2f}ms")
        return "\n".join(lines)


async def check_health() -> bool:
    """Check if AI engine is healthy"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{AI_ENGINE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                console.print(f"✅ AI Engine healthy: {data.get('status')}")
                return True
            else:
                console.print(f"❌ AI Engine unhealthy: {response.status_code}")
                return False
    except Exception as e:
        console.print(f"❌ Cannot connect to AI Engine: {e}")
        return False


async def test_mode1_manual(results: TestResults) -> None:
    """Test Mode 1: Manual RAG"""
    test_name = "Mode 1: Manual RAG"
    console.print(f"\n🧪 Testing {test_name}...")
    
    test_data = TEST_QUERIES["mode1"]
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode1/manual",
                json={
                    "query": test_data["query"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": True,
                    "enable_rag": True,
                    "enable_tools": False
                }
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code != 200:
                results.add_fail(test_name, f"HTTP {response.status_code}: {response.text}")
                return
            
            data = response.json()
            
            # Validate response structure
            assert "response" in data, "Missing 'response' field"
            assert "metadata" in data, "Missing 'metadata' field"
            assert len(data["response"]) > 0, "Empty response"
            
            # Check for expected keywords
            response_lower = data["response"].lower()
            found_keywords = [kw for kw in test_data["expected_keywords"] if kw.lower() in response_lower]
            
            # Extract performance metrics
            metadata = data.get("metadata", {})
            if "parallel_tier1_duration" in metadata:
                results.add_performance("Mode1_Tier1_Duration", metadata["parallel_tier1_duration"])
            if "parallel_tier2_duration" in metadata:
                results.add_performance("Mode1_Tier2_Duration", metadata["parallel_tier2_duration"])
            
            results.add_performance("Mode1_Total_Duration", duration)
            
            details = {
                "response_length": len(data["response"]),
                "keywords_found": len(found_keywords),
                "total_keywords": len(test_data["expected_keywords"]),
                "duration_ms": duration
            }
            
            results.add_pass(test_name, duration, details)
            console.print(f"✅ {test_name} passed ({duration:.0f}ms)")
            
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        results.add_fail(test_name, str(e), {"duration_ms": duration})
        console.print(f"❌ {test_name} failed: {e}")


async def test_mode2_automatic(results: TestResults) -> None:
    """Test Mode 2: Automatic with Tools"""
    test_name = "Mode 2: Automatic (Tools)"
    console.print(f"\n🧪 Testing {test_name}...")
    
    test_data = TEST_QUERIES["mode2"]
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode2/automatic",
                json={
                    "query": test_data["query"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": True,
                    "enable_rag": True,
                    "enable_tools": True
                }
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code != 200:
                results.add_fail(test_name, f"HTTP {response.status_code}: {response.text}")
                return
            
            data = response.json()
            
            # Validate response
            assert "response" in data, "Missing 'response' field"
            assert "metadata" in data, "Missing 'metadata' field"
            
            # Extract performance metrics
            metadata = data.get("metadata", {})
            if "parallel_tier1_duration" in metadata:
                results.add_performance("Mode2_Tier1_Duration", metadata["parallel_tier1_duration"])
            if "parallel_tier2_duration" in metadata:
                results.add_performance("Mode2_Tier2_Duration", metadata["parallel_tier2_duration"])
            
            results.add_performance("Mode2_Total_Duration", duration)
            
            details = {
                "response_length": len(data["response"]),
                "duration_ms": duration
            }
            
            results.add_pass(test_name, duration, details)
            console.print(f"✅ {test_name} passed ({duration:.0f}ms)")
            
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        results.add_fail(test_name, str(e), {"duration_ms": duration})
        console.print(f"❌ {test_name} failed: {e}")


async def test_mode3_chat_manual(results: TestResults) -> None:
    """Test Mode 3: Chat Manual"""
    test_name = "Mode 3: Chat Manual"
    console.print(f"\n🧪 Testing {test_name}...")
    
    test_data = TEST_QUERIES["mode3"]
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode3/chat-manual",
                json={
                    "query": test_data["query"],
                    "conversation_id": test_data["conversation_id"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": True,
                    "enable_rag": True,
                    "enable_tools": False
                }
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code != 200:
                results.add_fail(test_name, f"HTTP {response.status_code}: {response.text}")
                return
            
            data = response.json()
            
            # Validate response
            assert "response" in data, "Missing 'response' field"
            assert "metadata" in data, "Missing 'metadata' field"
            
            # Extract performance metrics
            metadata = data.get("metadata", {})
            if "parallel_tier1_duration" in metadata:
                results.add_performance("Mode3_Tier1_Duration", metadata["parallel_tier1_duration"])
            if "parallel_tier2_duration" in metadata:
                results.add_performance("Mode3_Tier2_Duration", metadata["parallel_tier2_duration"])
            
            results.add_performance("Mode3_Total_Duration", duration)
            
            details = {
                "response_length": len(data["response"]),
                "duration_ms": duration
            }
            
            results.add_pass(test_name, duration, details)
            console.print(f"✅ {test_name} passed ({duration:.0f}ms)")
            
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        results.add_fail(test_name, str(e), {"duration_ms": duration})
        console.print(f"❌ {test_name} failed: {e}")


async def test_mode4_chat_automatic(results: TestResults) -> None:
    """Test Mode 4: Chat Automatic"""
    test_name = "Mode 4: Chat Automatic"
    console.print(f"\n🧪 Testing {test_name}...")
    
    test_data = TEST_QUERIES["mode4"]
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/mode4/chat-automatic",
                json={
                    "query": test_data["query"],
                    "conversation_id": test_data["conversation_id"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": True,
                    "enable_rag": True,
                    "enable_tools": True
                }
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code != 200:
                results.add_fail(test_name, f"HTTP {response.status_code}: {response.text}")
                return
            
            data = response.json()
            
            # Validate response
            assert "response" in data, "Missing 'response' field"
            assert "metadata" in data, "Missing 'metadata' field"
            
            # Extract performance metrics
            metadata = data.get("metadata", {})
            if "parallel_tier1_duration" in metadata:
                results.add_performance("Mode4_Tier1_Duration", metadata["parallel_tier1_duration"])
            if "parallel_tier2_duration" in metadata:
                results.add_performance("Mode4_Tier2_Duration", metadata["parallel_tier2_duration"])
            
            results.add_performance("Mode4_Total_Duration", duration)
            
            details = {
                "response_length": len(data["response"]),
                "duration_ms": duration
            }
            
            results.add_pass(test_name, duration, details)
            console.print(f"✅ {test_name} passed ({duration:.0f}ms)")
            
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        results.add_fail(test_name, str(e), {"duration_ms": duration})
        console.print(f"❌ {test_name} failed: {e}")


async def test_performance_comparison(results: TestResults) -> None:
    """Compare parallel vs sequential performance"""
    test_name = "Performance: Parallel vs Sequential"
    console.print(f"\n🧪 Testing {test_name}...")
    
    test_data = TEST_QUERIES["mode1"]
    
    try:
        async with httpx.AsyncClient(timeout=TEST_TIMEOUT) as client:
            # Test with parallel enabled
            start = time.time()
            response_parallel = await client.post(
                f"{AI_ENGINE_URL}/api/mode1/manual",
                json={
                    "query": test_data["query"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": True,
                    "enable_rag": True,
                    "enable_tools": False
                }
            )
            parallel_duration = (time.time() - start) * 1000
            
            # Test with parallel disabled
            start = time.time()
            response_sequential = await client.post(
                f"{AI_ENGINE_URL}/api/mode1/manual",
                json={
                    "query": test_data["query"],
                    "tenant_id": test_data["tenant_id"],
                    "user_id": test_data["user_id"],
                    "enable_parallel": False,
                    "enable_rag": True,
                    "enable_tools": False
                }
            )
            sequential_duration = (time.time() - start) * 1000
            
            # Calculate improvement
            improvement = ((sequential_duration - parallel_duration) / sequential_duration) * 100
            
            results.add_performance("Parallel_Duration", parallel_duration)
            results.add_performance("Sequential_Duration", sequential_duration)
            results.add_performance("Performance_Improvement_%", improvement)
            
            details = {
                "parallel_ms": parallel_duration,
                "sequential_ms": sequential_duration,
                "improvement_percent": improvement,
                "meets_target": improvement >= 30.0
            }
            
            if improvement >= 30.0:
                results.add_pass(test_name, parallel_duration, details)
                console.print(f"✅ {test_name} passed ({improvement:.1f}% improvement)")
            else:
                results.add_fail(test_name, f"Only {improvement:.1f}% improvement (target: 30%)", details)
                console.print(f"⚠️  {test_name}: {improvement:.1f}% improvement (target: 30%)")
            
    except Exception as e:
        results.add_fail(test_name, str(e))
        console.print(f"❌ {test_name} failed: {e}")


async def test_metrics_collection(results: TestResults) -> None:
    """Test that Prometheus metrics are being collected"""
    test_name = "Metrics Collection"
    console.print(f"\n🧪 Testing {test_name}...")
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{AI_ENGINE_URL}/metrics")
            
            if response.status_code != 200:
                results.add_fail(test_name, f"HTTP {response.status_code}")
                return
            
            metrics_text = response.text
            
            # Check for key metrics
            required_metrics = [
                "vital_workflow_duration_seconds",
                "vital_parallel_tier1_duration_seconds",
                "vital_parallel_tier2_duration_seconds",
                "vital_rag_requests_total",
                "vital_llm_tokens_total"
            ]
            
            found_metrics = []
            missing_metrics = []
            
            for metric in required_metrics:
                if metric in metrics_text:
                    found_metrics.append(metric)
                else:
                    missing_metrics.append(metric)
            
            details = {
                "total_metrics": len(required_metrics),
                "found": len(found_metrics),
                "missing": missing_metrics
            }
            
            if len(missing_metrics) == 0:
                results.add_pass(test_name, 0, details)
                console.print(f"✅ {test_name} passed (all metrics found)")
            else:
                results.add_fail(test_name, f"Missing metrics: {missing_metrics}", details)
                console.print(f"⚠️  {test_name}: Missing {len(missing_metrics)} metrics")
            
    except Exception as e:
        results.add_fail(test_name, str(e))
        console.print(f"❌ {test_name} failed: {e}")


async def run_all_tests(mode: str = "all", include_performance: bool = True) -> TestResults:
    """Run all integration tests"""
    results = TestResults()
    
    # Check health first
    console.print("\n🏥 Checking AI Engine health...")
    if not await check_health():
        console.print("❌ AI Engine is not healthy. Aborting tests.")
        return results
    
    # Run mode tests
    if mode in ["all", "1"]:
        await test_mode1_manual(results)
    
    if mode in ["all", "2"]:
        await test_mode2_automatic(results)
    
    if mode in ["all", "3"]:
        await test_mode3_chat_manual(results)
    
    if mode in ["all", "4"]:
        await test_mode4_chat_automatic(results)
    
    # Run performance tests
    if include_performance and mode == "all":
        await test_performance_comparison(results)
        await test_metrics_collection(results)
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Integration & E2E Test Runner")
    parser.add_argument(
        "--mode",
        choices=["all", "1", "2", "3", "4"],
        default="all",
        help="Which mode to test (default: all)"
    )
    parser.add_argument(
        "--performance",
        action="store_true",
        help="Include performance comparison tests"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON"
    )
    
    args = parser.parse_args()
    
    console.print("""
╔══════════════════════════════════════════════════════════════╗
║         VITAL AI - INTEGRATION & E2E TEST SUITE              ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    # Run tests
    results = asyncio.run(run_all_tests(
        mode=args.mode,
        include_performance=args.performance or args.mode == "all"
    ))
    
    # Print results
    if args.json:
        output = {
            "passed": results.passed,
            "failed": results.failed,
            "performance": results.performance,
            "summary": {
                "total": len(results.passed) + len(results.failed),
                "passed": len(results.passed),
                "failed": len(results.failed),
                "pass_rate": (len(results.passed) / (len(results.passed) + len(results.failed)) * 100) if (len(results.passed) + len(results.failed)) > 0 else 0
            }
        }
        print(json.dumps(output, indent=2))
    else:
        console.print(results.summary())
    
    # Exit code
    exit(0 if len(results.failed) == 0 else 1)


if __name__ == "__main__":
    main()

