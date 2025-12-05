#!/usr/bin/env python3
"""
Test script for Structured Panel Debate functionality

This script tests if the debate rounds are working correctly in the structured panel.
It sends a request to the ask-panel-enhanced streaming endpoint and checks for:
1. Initial responses from all agents
2. Debate round messages (moderator giving word to each expert)
3. Experts referencing each other in debate responses
"""

import asyncio
import json
import sys
from typing import List, Dict, Any

try:
    import httpx
except ImportError:
    print("❌ httpx not installed. Install with: pip install httpx")
    sys.exit(1)

# Configuration
AI_ENGINE_URL = "http://localhost:8000"
ENDPOINT = f"{AI_ENGINE_URL}/api/ask-panel-enhanced/stream"

# Test question
TEST_QUESTION = "How can the integration between the Analytics Consultant Specialist and Accountant Specialist improve the accuracy of financial projections in healthcare settings?"

# Default tenant ID
DEFAULT_TENANT_ID = "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"

# You'll need to replace these with actual agent IDs from your database
# For now, using placeholder IDs - you should replace these
PLACEHOLDER_AGENT_IDS = [
    "agent-1-placeholder",
    "agent-2-placeholder", 
    "agent-3-placeholder"
]


async def fetch_agents() -> List[str]:
    """Fetch available agent IDs from the API"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try the AI engine endpoint first
            response = await client.get(
                f"{AI_ENGINE_URL}/api/ask-panel-enhanced/agents",
                params={"limit": 10, "tenant_id": DEFAULT_TENANT_ID}
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    agent_ids = [agent.get("id") for agent in data if agent.get("id")]
                elif isinstance(data, dict) and "agents" in data:
                    agent_ids = [agent.get("id") for agent in data["agents"] if agent.get("id")]
                else:
                    agent_ids = []
                
                if agent_ids:
                    print(f"✅ Found {len(agent_ids)} agents")
                    return agent_ids[:5]  # Use first 5 agents
    except Exception as e:
        print(f"⚠️  Could not fetch agents: {e}")
    
    return []


async def test_structured_panel_debate(agent_ids: List[str]) -> Dict[str, Any]:
    """Test the structured panel debate functionality"""
    
    if not agent_ids:
        print("❌ No agent IDs available. Please check your database or update PLACEHOLDER_AGENT_IDS")
        return {"error": "No agents available"}
    
    print(f"\n🧪 Testing Structured Panel Debate")
    print(f"📋 Question: {TEST_QUESTION[:80]}...")
    print(f"👥 Agents: {len(agent_ids)} agents")
    print(f"🔗 Endpoint: {ENDPOINT}\n")
    
    request_body = {
        "question": TEST_QUESTION,
        "template_slug": "structured_panel",
        "selected_agent_ids": agent_ids,
        "tenant_id": DEFAULT_TENANT_ID,
        "enable_debate": True,
        "max_rounds": 2,  # Test with 2 rounds
        "require_consensus": False
    }
    
    print("📤 Sending request...")
    print(json.dumps(request_body, indent=2))
    print("\n" + "="*80 + "\n")
    
    results = {
        "initial_responses": [],
        "debate_rounds": [],
        "moderator_messages": [],
        "expert_references": [],
        "errors": []
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                ENDPOINT,
                json=request_body,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"❌ Error: HTTP {response.status_code}")
                    print(error_text.decode())
                    return {"error": f"HTTP {response.status_code}"}
                
                print("📥 Streaming responses...\n")
                
                buffer = ""
                message_count = 0
                current_round = 0
                
                async for chunk in response.aiter_text():
                    buffer += chunk
                    
                    # Process complete SSE messages
                    while "\n\n" in buffer:
                        message, buffer = buffer.split("\n\n", 1)
                        
                        if message.startswith("data: "):
                            try:
                                data = json.loads(message[6:])  # Remove "data: " prefix
                                message_count += 1
                                
                                event_type = data.get("type", "unknown")
                                node = data.get("node", "unknown")
                                event_data = data.get("data", {})
                                
                                # Print all events for debugging
                                if event_type == "message":
                                    role = event_data.get("role", "unknown")
                                    content = event_data.get("content", "")[:200]
                                    print(f"[{node}] {role}: {content}...")
                                    
                                    # Track initial responses
                                    if node == "initial_panel_responses" and role != "orchestrator":
                                        results["initial_responses"].append({
                                            "agent": role,
                                            "content_preview": content[:100]
                                        })
                                    
                                    # Track debate rounds
                                    if node == "panel_debate_round":
                                        if role == "orchestrator":
                                            results["moderator_messages"].append(content)
                                            if "Round" in content:
                                                current_round = int(content.split("Round")[1].split(":")[0].strip())
                                                results["debate_rounds"].append({
                                                    "round": current_round,
                                                    "messages": []
                                                })
                                        else:
                                            # Expert response in debate
                                            if results["debate_rounds"]:
                                                results["debate_rounds"][-1]["messages"].append({
                                                    "agent": role,
                                                    "content": content
                                                })
                                            
                                            # Check if expert references another expert
                                            content_lower = content.lower()
                                            for other_agent in agent_ids:
                                                # Simple check - look for agent names or "colleague", "expert", etc.
                                                if any(ref in content_lower for ref in ["agree with", "while", "building on", "colleague", "expert"]):
                                                    results["expert_references"].append({
                                                        "from": role,
                                                        "content_preview": content[:150]
                                                    })
                                
                                elif event_type == "complete":
                                    print(f"\n✅ Panel consultation complete!")
                                    print(f"📊 Total messages: {message_count}")
                                
                                elif event_type == "error":
                                    error_msg = event_data.get("error", "Unknown error")
                                    print(f"❌ Error: {error_msg}")
                                    results["errors"].append(error_msg)
                                    
                            except json.JSONDecodeError as e:
                                print(f"⚠️  Failed to parse JSON: {e}")
                                continue
                
                print("\n" + "="*80 + "\n")
                print("📊 TEST RESULTS:\n")
                
                print(f"✅ Initial Responses: {len(results['initial_responses'])}")
                print(f"💬 Debate Rounds: {len(results['debate_rounds'])}")
                print(f"🎤 Moderator Messages: {len(results['moderator_messages'])}")
                print(f"🔗 Expert References: {len(results['expert_references'])}")
                print(f"❌ Errors: {len(results['errors'])}")
                
                # Detailed analysis
                if results['debate_rounds']:
                    print("\n✅ DEBATE IS WORKING!")
                    print(f"   Found {len(results['debate_rounds'])} debate round(s)")
                    for round_data in results['debate_rounds']:
                        print(f"   Round {round_data['round']}: {len(round_data['messages'])} expert responses")
                else:
                    print("\n⚠️  NO DEBATE ROUNDS DETECTED")
                    print("   This could mean:")
                    print("   - Debate is disabled (enable_debate=False)")
                    print("   - Workflow is skipping debate")
                    print("   - No debate topics identified")
                
                if results['expert_references']:
                    print("\n✅ EXPERTS ARE REFERENCING EACH OTHER!")
                    for ref in results['expert_references'][:3]:
                        print(f"   - {ref['from']}: {ref['content_preview'][:80]}...")
                else:
                    print("\n⚠️  NO EXPERT REFERENCES DETECTED")
                    print("   Experts may not be engaging with each other's points")
                
                return results
                
    except httpx.TimeoutException:
        print("❌ Request timed out after 120 seconds")
        return {"error": "Timeout"}
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


async def main():
    """Main test function"""
    print("="*80)
    print("🧪 STRUCTURED PANEL DEBATE TEST")
    print("="*80)
    
    # Try to fetch agents
    agent_ids = await fetch_agents()
    
    if not agent_ids:
        print("\n⚠️  Could not fetch agents automatically.")
        print("   Please update the script with actual agent IDs from your database.")
        print("   You can find agent IDs by:")
        print("   1. Checking the Supabase 'agents' table")
        print("   2. Using the /api/agents endpoint")
        print("   3. Updating PLACEHOLDER_AGENT_IDS in this script")
        return
    
    # Run the test
    results = await test_structured_panel_debate(agent_ids)
    
    # Summary
    print("\n" + "="*80)
    if results.get("error"):
        print("❌ TEST FAILED")
    elif results.get("debate_rounds"):
        print("✅ TEST PASSED - Debate is working!")
    else:
        print("⚠️  TEST INCONCLUSIVE - No debate rounds detected")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())


