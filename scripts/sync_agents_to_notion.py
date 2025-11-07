#!/usr/bin/env python3
"""
Sync all Supabase agents to Notion VITAL Expert Sync database.
Complete sync script for 358 agents with progress tracking.
"""

import os
import time
from typing import List, Dict, Any
from supabase import create_client, Client
from notion_client import Client as NotionClient

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xazinxsiglqokwfmogyk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_DATABASE_ID = "282345b0299e802ea9fae15204f4da89"

# Category mapping
CATEGORY_MAP = {
    "specialized_knowledge": "Technical Specialist",
    "deep_agent": "Strategic Consultant",
    "universal_task_subagent": "Data Analyst",
    "multi_expert_orchestration": "Strategic Consultant",
    "process_automation": "Business Advisor",
    "autonomous_problem_solving": "Strategic Consultant"
}

# Color mapping
COLOR_MAP = {
    "#3B82F6": "Blue",      # Specialized Knowledge
    "#F97316": "Orange",    # Process Automation
    "#10B981": "Green",     # Universal Task Subagents
    "#9333EA": "Purple",    # Deep Agents
    "#EF4444": "Red",       # Autonomous Problem-Solving
    "#06B6D4": "Blue"       # Multi-Expert Orchestration
}

# Tier mapping
TIER_MAP = {
    "1": "Basic",
    "2": "Professional",
    "3": "Enterprise"
}


def init_clients() -> tuple[Client, NotionClient]:
    """Initialize Supabase and Notion clients."""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    notion = NotionClient(auth=NOTION_TOKEN)
    return supabase, notion


def fetch_all_agents(supabase: Client) -> List[Dict[str, Any]]:
    """Fetch all agents from Supabase."""
    print("📊 Fetching agents from Supabase...")
    
    response = supabase.table("agents").select(
        "name, title, description, model, system_prompt, agent_category, "
        "category_color, is_active, rating, total_consultations, metadata"
    ).execute()
    
    agents = response.data
    print(f"✅ Fetched {len(agents)} agents from Supabase")
    return agents


def transform_agent_to_notion(agent: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Supabase agent to Notion page properties."""
    metadata = agent.get("metadata", {}) or {}
    
    # Extract tier
    tier_raw = str(metadata.get("tier", "Basic"))
    tier = TIER_MAP.get(tier_raw, tier_raw if tier_raw in ["Free", "Basic", "Professional", "Enterprise"] else "Basic")
    
    # Map category
    category = CATEGORY_MAP.get(agent.get("agent_category", ""), "Technical Specialist")
    
    # Map color
    color = COLOR_MAP.get(agent.get("category_color", ""), "Blue")
    
    # Icon (use emoji or default)
    icon = "🤖"  # Default icon
    
    # Is Active
    is_active = "__YES__" if agent.get("is_active", True) else "__NO__"
    
    # Lifecycle Stage
    lifecycle = "Active" if agent.get("is_active", True) else "Maintenance"
    
    # Create properties
    properties = {
        "Name": agent.get("name", ""),
        "Display Name": agent.get("title") or agent.get("name", ""),
        "Description": agent.get("description", "")[:2000],  # Notion limit
        "Model": agent.get("model", ""),
        "Category": category,
        "Color": color,
        "Icon": icon,
        "Is Active": is_active,
        "Is Featured": "__NO__",
        "Lifecycle Stage": lifecycle,
        "Tier": tier,
        "Success Rate": (agent.get("rating", 0) or 0) / 100 if agent.get("rating") else None,
        "Usage Count": agent.get("total_consultations", 0) or 0
    }
    
    # Add System Prompt if not too long
    system_prompt = agent.get("system_prompt", "")
    if system_prompt and len(system_prompt) <= 2000:
        properties["System Prompt"] = system_prompt[:2000]
    
    return properties


def create_notion_page(notion: NotionClient, properties: Dict[str, Any]) -> Dict[str, Any]:
    """Create a single page in Notion."""
    # Transform properties to Notion format
    notion_props = {}
    
    # Title field
    notion_props["Name"] = {"title": [{"text": {"content": properties.get("Name", "")[:2000]}}]}
    
    # Rich text fields
    for field in ["Display Name", "Description", "Model", "System Prompt", "Icon", "Role"]:
        if field in properties and properties[field]:
            notion_props[field] = {
                "rich_text": [{"text": {"content": str(properties[field])[:2000]}}]
            }
    
    # Select fields
    for field in ["Category", "Color", "Lifecycle Stage", "Tier"]:
        if field in properties and properties[field]:
            notion_props[field] = {"select": {"name": properties[field]}}
    
    # Checkbox fields
    for field in ["Is Active", "Is Featured"]:
        if field in properties:
            notion_props[field] = {"checkbox": properties[field] == "__YES__"}
    
    # Number fields
    if "Success Rate" in properties and properties["Success Rate"] is not None:
        notion_props["Success Rate"] = {"number": properties["Success Rate"]}
    
    if "Usage Count" in properties:
        notion_props["Usage Count"] = {"number": properties["Usage Count"]}
    
    # Create page
    response = notion.pages.create(
        parent={"database_id": NOTION_DATABASE_ID},
        properties=notion_props
    )
    
    return response


def sync_agents_to_notion(agents: List[Dict[str, Any]], notion: NotionClient, batch_size: int = 25):
    """Sync all agents to Notion in batches."""
    total = len(agents)
    synced = 0
    failed = 0
    
    print(f"\n🚀 Starting sync of {total} agents to Notion...")
    print(f"📦 Batch size: {batch_size}")
    print("=" * 80)
    
    for i, agent in enumerate(agents, 1):
        try:
            # Transform agent
            properties = transform_agent_to_notion(agent)
            
            # Create in Notion
            response = create_notion_page(notion, properties)
            
            synced += 1
            print(f"✅ [{i}/{total}] Synced: {agent.get('name', 'Unknown')}")
            
            # Rate limiting (3 requests/second)
            if i % 3 == 0:
                time.sleep(1)
            
            # Progress update every batch
            if i % batch_size == 0:
                progress = (i / total) * 100
                print(f"\n📊 Progress: {i}/{total} ({progress:.1f}%) | Success: {synced} | Failed: {failed}\n")
                
        except Exception as e:
            failed += 1
            print(f"❌ [{i}/{total}] Failed: {agent.get('name', 'Unknown')} | Error: {str(e)[:100]}")
            continue
    
    print("=" * 80)
    print(f"\n🎉 Sync complete!")
    print(f"✅ Successfully synced: {synced}/{total} agents ({(synced/total)*100:.1f}%)")
    print(f"❌ Failed: {failed} agents")
    
    return synced, failed


def main():
    """Main sync function."""
    print("🔄 Supabase → Notion Agent Sync")
    print("=" * 80)
    
    # Check environment variables
    if not SUPABASE_KEY:
        print("❌ Error: SUPABASE_SERVICE_KEY not set")
        return
    
    if not NOTION_TOKEN:
        print("❌ Error: NOTION_TOKEN not set")
        return
    
    try:
        # Initialize clients
        supabase, notion = init_clients()
        print("✅ Clients initialized")
        
        # Fetch agents
        agents = fetch_all_agents(supabase)
        
        # Sync to Notion
        synced, failed = sync_agents_to_notion(agents, notion)
        
        # Summary
        print("\n📋 Final Summary:")
        print(f"   Total agents: {len(agents)}")
        print(f"   Synced: {synced}")
        print(f"   Failed: {failed}")
        print(f"   Success rate: {(synced/len(agents))*100:.1f}%")
        
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()

