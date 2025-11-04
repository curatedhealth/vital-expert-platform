"""
LANGGRAPH END-TO-END TEST FOR MODE 1-4
Tests the full LangGraph workflows with all features
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from langgraph_workflows.mode1_interactive_auto_workflow import Mode1InteractiveAutoWorkflow
from langgraph_workflows.mode2_interactive_manual_workflow import Mode2InteractiveManualWorkflow
from langgraph_workflows.mode3_autonomous_auto_workflow import Mode3AutonomousAutoWorkflow
from langgraph_workflows.mode4_autonomous_manual_workflow import Mode4AutonomousManualWorkflow
from services.supabase_client import SupabaseClient


async def test_mode1_langgraph():
    """Test Mode 1: Interactive-Automatic with LangGraph"""
    print("\n" + "="*80)
    print("🧪 Testing Mode 1: Interactive-Automatic (LangGraph)")
    print("="*80)
    
    try:
        # Initialize Supabase client
        supabase_client = SupabaseClient()
        
        # Initialize workflow
        workflow = Mode1InteractiveAutoWorkflow(
            supabase_client=supabase_client
        )
        await workflow.initialize()
        print("✅ Mode 1 workflow initialized")
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id="00000000-0000-0000-0000-000000000000",  # Test tenant
            query="What are FDA IND requirements for Phase 1 clinical trials?",
            session_id=f"test_session_{datetime.now().timestamp()}",
            model="gpt-4",
            enable_rag=True,
            enable_tools=False,
            conversation_history=[]
        )
        
        print(f"\n📊 Mode 1 Results:")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Content length: {len(result.get('response', ''))}")
        print(f"   Sources: {len(result.get('sources', []))}")
        print(f"   Agent selected: {result.get('selected_agent_id', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 0)}")
        
        # Check for LangGraph-specific features
        if result.get('langgraph_trace'):
            print(f"   ✅ LangGraph trace captured")
            print(f"   Nodes executed: {result['langgraph_trace'].get('nodes_executed', [])}")
        
        if result.get('reasoning_steps'):
            print(f"   ✅ Reasoning: {len(result['reasoning_steps'])} steps")
        
        return True
        
    except Exception as e:
        print(f"❌ Mode 1 test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_mode2_langgraph():
    """Test Mode 2: Interactive-Manual with LangGraph"""
    print("\n" + "="*80)
    print("🧪 Testing Mode 2: Interactive-Manual (LangGraph)")
    print("="*80)
    
    try:
        supabase_client = SupabaseClient()
        
        workflow = Mode2InteractiveManualWorkflow(
            supabase_client=supabase_client
        )
        await workflow.initialize()
        print("✅ Mode 2 workflow initialized")
        
        result = await workflow.execute(
            tenant_id="00000000-0000-0000-0000-000000000000",
            agent_id="550e8400-e29b-41d4-a716-446655440000",  # Test agent ID
            query="Explain bioequivalence study requirements",
            session_id=f"test_session_{datetime.now().timestamp()}",
            model="gpt-4",
            enable_rag=True,
            enable_tools=True,
            conversation_history=[]
        )
        
        print(f"\n📊 Mode 2 Results:")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Content length: {len(result.get('response', ''))}")
        print(f"   Sources: {len(result.get('sources', []))}")
        print(f"   Agent used: {result.get('agent_id', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 0)}")
        
        if result.get('tool_calls'):
            print(f"   ✅ Tools called: {len(result['tool_calls'])}")
        
        if result.get('reasoning_steps'):
            print(f"   ✅ Reasoning: {len(result['reasoning_steps'])} steps")
        
        return True
        
    except Exception as e:
        print(f"❌ Mode 2 test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_mode3_langgraph():
    """Test Mode 3: Autonomous-Automatic with LangGraph"""
    print("\n" + "="*80)
    print("🧪 Testing Mode 3: Autonomous-Automatic (LangGraph)")
    print("="*80)
    
    try:
        supabase_client = SupabaseClient()
        
        workflow = Mode3AutonomousAutoWorkflow(
            supabase_client=supabase_client
        )
        await workflow.initialize()
        print("✅ Mode 3 workflow initialized")
        
        result = await workflow.execute(
            tenant_id="00000000-0000-0000-0000-000000000000",
            query="What are the complete regulatory requirements for bringing a new drug to market in the EU?",
            session_id=f"test_session_{datetime.now().timestamp()}",
            model="gpt-4",
            enable_rag=True,
            enable_tools=True,
            max_iterations=5,
            conversation_history=[]
        )
        
        print(f"\n📊 Mode 3 Results:")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Content length: {len(result.get('response', ''))}")
        print(f"   Sources: {len(result.get('sources', []))}")
        print(f"   Agent selected: {result.get('selected_agent_id', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 0)}")
        
        if result.get('autonomous_reasoning'):
            reasoning = result['autonomous_reasoning']
            print(f"   ✅ Autonomous reasoning:")
            print(f"      Iterations: {reasoning.get('iterations', 0)}")
            print(f"      Tools used: {reasoning.get('tools_used', [])}")
            print(f"      Strategy: {reasoning.get('strategy', 'N/A')}")
        
        if result.get('reasoning_steps'):
            print(f"   ✅ Reasoning: {len(result['reasoning_steps'])} steps")
        
        return True
        
    except Exception as e:
        print(f"❌ Mode 3 test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_mode4_langgraph():
    """Test Mode 4: Autonomous-Manual with LangGraph"""
    print("\n" + "="*80)
    print("🧪 Testing Mode 4: Autonomous-Manual (LangGraph)")
    print("="*80)
    
    try:
        supabase_client = SupabaseClient()
        
        workflow = Mode4AutonomousManualWorkflow(
            supabase_client=supabase_client
        )
        await workflow.initialize()
        print("✅ Mode 4 workflow initialized")
        
        result = await workflow.execute(
            tenant_id="00000000-0000-0000-0000-000000000000",
            agent_id="550e8400-e29b-41d4-a716-446655440000",
            query="Design a complete Phase 2 clinical trial protocol for a novel oncology drug",
            session_id=f"test_session_{datetime.now().timestamp()}",
            model="gpt-4",
            enable_rag=True,
            enable_tools=True,
            max_iterations=10,
            conversation_history=[]
        )
        
        print(f"\n📊 Mode 4 Results:")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Content length: {len(result.get('response', ''))}")
        print(f"   Sources: {len(result.get('sources', []))}")
        print(f"   Agent used: {result.get('agent_id', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 0)}")
        
        if result.get('autonomous_reasoning'):
            reasoning = result['autonomous_reasoning']
            print(f"   ✅ Autonomous reasoning:")
            print(f"      Iterations: {reasoning.get('iterations', 0)}")
            print(f"      Tools used: {reasoning.get('tools_used', [])}")
            print(f"      Final answer: {reasoning.get('final_answer_validated', False)}")
        
        if result.get('reasoning_steps'):
            print(f"   ✅ Reasoning: {len(result['reasoning_steps'])} steps")
        
        return True
        
    except Exception as e:
        print(f"❌ Mode 4 test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all LangGraph tests"""
    print("\n" + "="*80)
    print("🚀 LANGGRAPH END-TO-END TEST SUITE")
    print("Testing all 4 modes with full LangGraph workflows")
    print("="*80)
    
    results = {
        'mode1': False,
        'mode2': False,
        'mode3': False,
        'mode4': False
    }
    
    # Test each mode
    results['mode1'] = await test_mode1_langgraph()
    await asyncio.sleep(2)  # Brief pause between tests
    
    results['mode2'] = await test_mode2_langgraph()
    await asyncio.sleep(2)
    
    results['mode3'] = await test_mode3_langgraph()
    await asyncio.sleep(2)
    
    results['mode4'] = await test_mode4_langgraph()
    
    # Summary
    print("\n" + "="*80)
    print("📊 LANGGRAPH TEST SUMMARY")
    print("="*80)
    
    for mode, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  {mode.upper()}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*80)
    if all_passed:
        print("🎉 ALL LANGGRAPH TESTS PASSED!")
    else:
        print("⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE")
    print("="*80)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

