#!/usr/bin/env python3
"""
VITAL Python AI Engine - Framework Endpoints Test Script
Tests all 3 framework endpoints (LangGraph, AutoGen, CrewAI)
"""

import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_header(title: str):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def print_test(name: str, passed: bool, details: str = ""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")
    if details:
        print(f"         {details}")

def test_health_check():
    """Test basic health check"""
    print_header("🏥 Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        passed = response.status_code == 200
        print_test("Health endpoint", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Health endpoint", False, f"Error: {e}")
        return False

def test_frameworks_info():
    """Test frameworks info endpoint"""
    print_header("ℹ️  Frameworks Info")
    
    try:
        response = requests.get(f"{BASE_URL}/frameworks/info", timeout=5)
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            print_test("Frameworks info endpoint", True)
            print("\n📦 Available Frameworks:")
            for framework in data.get('frameworks', []):
                print(f"   - {framework['name']} ({framework['id']})")
                print(f"     Version: {framework['version']}")
                print(f"     Best for: {', '.join(framework['bestFor'])}")
                if 'fork' in framework:
                    print(f"     🔗 Fork: {framework['fork']}")
                print()
            return True
        else:
            print_test("Frameworks info endpoint", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Frameworks info endpoint", False, f"Error: {e}")
        return False

def test_autogen_endpoint():
    """Test AutoGen framework endpoint (YOUR FORK!)"""
    print_header("🤖 AutoGen Framework Test (CuratedHealth Fork)")
    
    payload = {
        "workflow": {
            "framework": "autogen",
            "mode": "conversational",
            "agents": [
                {
                    "id": "expert1",
                    "role": "Healthcare CEO",
                    "systemPrompt": "You are a Healthcare CEO. Provide strategic business guidance.",
                    "model": "gpt-4o",
                    "temperature": 0.7,
                    "maxTokens": 500
                },
                {
                    "id": "expert2",
                    "role": "Healthcare CFO",
                    "systemPrompt": "You are a Healthcare CFO. Provide financial analysis.",
                    "model": "gpt-4o",
                    "temperature": 0.7,
                    "maxTokens": 500
                }
            ],
            "maxRounds": 3,
            "requireConsensus": False
        },
        "input": {
            "message": "What are the top 3 priorities for our healthcare organization this quarter?"
        },
        "metadata": {
            "source": "test-script"
        }
    }
    
    try:
        print("📤 Sending request to AutoGen endpoint...")
        print(f"   Agents: {len(payload['workflow']['agents'])}")
        print(f"   Mode: {payload['workflow']['mode']}")
        print()
        
        response = requests.post(
            f"{BASE_URL}/frameworks/autogen/execute",
            json=payload,
            timeout=30
        )
        
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            print_test("AutoGen execution", True)
            print(f"\n📊 Results:")
            print(f"   Framework: {data.get('framework', 'unknown')}")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Duration: {data.get('metadata', {}).get('duration', 0):.2f}s")
            print(f"   Agents: {len(data.get('metadata', {}).get('agentsInvolved', []))}")
            
            if 'outputs' in data and 'messages' in data['outputs']:
                print(f"   Messages: {len(data['outputs']['messages'])}")
            
            print("\n✅ Your CuratedHealth AutoGen fork is working!")
            return True
        else:
            print_test("AutoGen execution", False, f"Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"         Error: {error_data.get('error', 'Unknown error')}")
            except:
                pass
            return False
            
    except requests.exceptions.Timeout:
        print_test("AutoGen execution", False, "Timeout (30s) - this is normal for first run")
        print("         AutoGen might be initializing. Try running the test again.")
        return False
    except Exception as e:
        print_test("AutoGen execution", False, f"Error: {e}")
        return False

def test_langgraph_endpoint():
    """Test LangGraph framework endpoint"""
    print_header("🔄 LangGraph Framework Test")
    
    payload = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": [
                {
                    "id": "agent1",
                    "role": "Researcher",
                    "systemPrompt": "You are a research assistant.",
                    "model": "gpt-4o",
                    "temperature": 0.5,
                    "maxTokens": 300
                }
            ],
            "checkpoints": True
        },
        "input": {
            "message": "What are the benefits of LangGraph for workflow orchestration?"
        },
        "metadata": {
            "source": "test-script"
        }
    }
    
    try:
        print("📤 Sending request to LangGraph endpoint...")
        response = requests.post(
            f"{BASE_URL}/frameworks/langgraph/execute",
            json=payload,
            timeout=20
        )
        
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            print_test("LangGraph execution", True)
            print(f"\n📊 Results:")
            print(f"   Framework: {data.get('framework', 'unknown')}")
            print(f"   Success: {data.get('success', False)}")
            return True
        else:
            print_test("LangGraph execution", False, f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        print_test("LangGraph execution", False, f"Error: {e}")
        return False

def test_crewai_endpoint():
    """Test CrewAI framework endpoint"""
    print_header("👥 CrewAI Framework Test")
    
    payload = {
        "workflow": {
            "framework": "crewai",
            "mode": "hierarchical",
            "agents": [
                {
                    "id": "manager",
                    "role": "Project Manager",
                    "goal": "Coordinate the team effectively",
                    "backstory": "Experienced project manager",
                    "systemPrompt": "You are a project manager.",
                    "model": "gpt-4o",
                    "allowDelegation": True
                }
            ]
        },
        "input": {
            "message": "Create a project plan for a new feature"
        },
        "metadata": {
            "source": "test-script"
        }
    }
    
    try:
        print("📤 Sending request to CrewAI endpoint...")
        response = requests.post(
            f"{BASE_URL}/frameworks/crewai/execute",
            json=payload,
            timeout=20
        )
        
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            print_test("CrewAI execution", True)
            print(f"\n📊 Results:")
            print(f"   Framework: {data.get('framework', 'unknown')}")
            print(f"   Success: {data.get('success', False)}")
            return True
        else:
            print_test("CrewAI execution", False, f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        print_test("CrewAI execution", False, f"Error: {e}")
        return False

def main():
    print("\n╔══════════════════════════════════════════════════════════════════╗")
    print("║                                                                  ║")
    print("║     🧪 VITAL Python AI Engine - Framework Tests                 ║")
    print("║                                                                  ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    
    print(f"\n🎯 Testing endpoints at: {BASE_URL}")
    print("   Make sure the Python AI Engine is running!")
    print()
    
    results = {}
    
    # Run tests
    results['health'] = test_health_check()
    results['info'] = test_frameworks_info()
    results['autogen'] = test_autogen_endpoint()
    results['langgraph'] = test_langgraph_endpoint()
    results['crewai'] = test_crewai_endpoint()
    
    # Summary
    print_header("📊 Test Summary")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()
    
    if passed == total:
        print("🎉 All tests passed! Your Python AI Engine is ready!")
        print("   ✅ LangGraph is working")
        print("   ✅ AutoGen (YOUR FORK) is working")
        print("   ✅ CrewAI is working")
        print()
        print("🚀 You can now use the shared orchestrator in your frontend!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print()
        print("💡 Common issues:")
        print("   1. Python AI Engine not running (run: ./deploy-frameworks.sh)")
        print("   2. Dependencies not installed (check langgraph-requirements.txt)")
        print("   3. OpenAI API key not set (check .env)")
        print("   4. Port 8000 already in use")
        return 1

if __name__ == "__main__":
    sys.exit(main())

