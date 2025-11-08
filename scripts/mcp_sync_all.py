#!/usr/bin/env python3
"""
MCP-Based Complete Sync Script
Syncs all agents, tools, and prompts from Supabase to Notion using MCP
"""

import subprocess
import json
import time
from typing import List, Dict, Optional
from datetime import datetime

# Configuration
BATCH_SIZE = 20
AGENT_DATA_SOURCE = "e52a9be9-5c0b-49fa-b6cf-d0e222df6cc8"
TOOL_DATA_SOURCE = "5413fbf4-7a25-4b4f-910f-e205feffacd2"
PROMPT_DATA_SOURCE = "e0f04531-0e95-4702-934a-44e66fb99eec"

# Color and category mappings
COLOR_MAP = {
    "#3B82F6": "blue",
    "#10B981": "green",
    "#EF4444": "red",
    "#8B5CF6": "purple",
    "#F59E0B": "orange",
    "#06B6D4": "cyan",
    "#EC4899": "pink",
    "#9333EA": "purple",
    "#F97316": "orange"
}

CATEGORY_MAP = {
    "specialized_knowledge": "Clinical Expert",
    "universal_task_subagent": "Technical Specialist",
    "multi_expert_orchestration": "Strategic Consultant",
    "process_automation": "Data Analyst",
    "autonomous_problem_solving": "Business Advisor",
    "deep_agent": "Strategic Consultant"
}

def execute_mcp_supabase(query: str) -> Optional[List[Dict]]:
    """Execute Supabase query via MCP"""
    try:
        # Note: This is a template - actual MCP execution would be via Cursor's MCP interface
        # For now, we'll provide the command structure
        print(f"\n📊 Executing Supabase query...")
        print(f"Query: {query[:100]}...")
        
        # This would be executed via Cursor MCP
        # result = mcp_supabase_execute_sql(query=query)
        
        return None  # Placeholder
    except Exception as e:
        print(f"❌ Error executing query: {e}")
        return None

def execute_mcp_notion_create(parent_id: str, pages: List[Dict]) -> bool:
    """Create pages in Notion via MCP"""
    try:
        print(f"\n📝 Creating {len(pages)} pages in Notion...")
        
        # This would be executed via Cursor MCP
        # result = mcp_Notion_notion-create-pages(
        #     parent={"data_source_id": parent_id},
        #     pages=pages
        # )
        
        return True  # Placeholder
    except Exception as e:
        print(f"❌ Error creating pages: {e}")
        return False

def map_color(color: str) -> str:
    """Map Supabase color to Notion color"""
    return COLOR_MAP.get(color, "green")

def map_category(category: str) -> str:
    """Map Supabase category to Notion category"""
    return CATEGORY_MAP.get(category, "General")

def truncate(text: Optional[str], max_length: int = 2000) -> str:
    """Truncate text to Notion field limits"""
    if not text:
        return ""
    return text[:max_length] if len(text) > max_length else text

def format_agent_for_notion(agent: Dict) -> Dict:
    """Format agent data for Notion"""
    return {
        "properties": {
            "Name": agent.get("name", ""),
            "Display Name": agent.get("title") or agent.get("name", ""),
            "Description": truncate(agent.get("description", ""), 500),
            "System Prompt": truncate(agent.get("system_prompt", ""), 2000),
            "Model": agent.get("model", "gpt-4"),
            "Temperature": float(agent.get("temperature", 0.7)),
            "Max Tokens": int(agent.get("max_tokens", 2000)),
            "Category": map_category(agent.get("agent_category")),
            "Color": map_color(agent.get("category_color")),
            "Lifecycle Stage": "Active",
            "Is Active": "__YES__" if agent.get("is_active") else "__NO__"
        }
    }

def format_tool_for_notion(tool: Dict) -> Dict:
    """Format tool data for Notion"""
    capabilities = tool.get("capabilities", [])
    capabilities_str = ", ".join(capabilities) if capabilities else ""
    
    description = f"{tool.get('category', '')} - {capabilities_str}"
    
    return {
        "properties": {
            "Name": tool.get("name", ""),
            "Description": truncate(description, 500),
            "Tool Type": tool.get("tool_type", "ai_function"),
            "Configuration": truncate(tool.get("notes", ""), 500),
            "Is Active": "__YES__" if tool.get("is_active") else "__NO__"
        }
    }

def sync_agents_batch(offset: int = 0, limit: int = BATCH_SIZE) -> Dict:
    """Sync a batch of agents"""
    print(f"\n{'='*60}")
    print(f"🤖 SYNCING AGENTS BATCH: {offset} to {offset + limit}")
    print(f"{'='*60}")
    
    query = f"""
    SELECT id, name, title, description, system_prompt, 
           model, temperature, max_tokens, is_active, 
           agent_category, category_color
    FROM agents 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT {limit} OFFSET {offset};
    """
    
    print(f"\n1️⃣ Query to execute in Cursor:")
    print(f"   mcp_supabase_execute_sql(query=\"\"\"{query.strip()}\"\"\")")
    
    return {
        "query": query,
        "parent_id": AGENT_DATA_SOURCE,
        "type": "agents",
        "offset": offset,
        "limit": limit
    }

def sync_tools_batch(offset: int = 0, limit: int = BATCH_SIZE) -> Dict:
    """Sync a batch of tools"""
    print(f"\n{'='*60}")
    print(f"🔧 SYNCING TOOLS BATCH: {offset} to {offset + limit}")
    print(f"{'='*60}")
    
    query = f"""
    SELECT id, name, category, tool_type, code, 
           capabilities, notes, is_active
    FROM dh_tool
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT {limit} OFFSET {offset};
    """
    
    print(f"\n1️⃣ Query to execute in Cursor:")
    print(f"   mcp_supabase_execute_sql(query=\"\"\"{query.strip()}\"\"\")")
    
    return {
        "query": query,
        "parent_id": TOOL_DATA_SOURCE,
        "type": "tools",
        "offset": offset,
        "limit": limit
    }

def generate_notion_create_command(data_type: str, items: List[Dict], parent_id: str) -> str:
    """Generate MCP command for creating Notion pages"""
    
    if data_type == "agents":
        pages = [format_agent_for_notion(item) for item in items]
    elif data_type == "tools":
        pages = [format_tool_for_notion(item) for item in items]
    else:
        return ""
    
    command = {
        "parent": {"data_source_id": parent_id},
        "pages": pages
    }
    
    return json.dumps(command, indent=2)

def main():
    """Main execution"""
    print("=" * 70)
    print("🚀 MCP COMPLETE SYNC SCRIPT")
    print("=" * 70)
    
    print("\n📋 OVERVIEW:")
    print("   This script helps you sync all data from Supabase to Notion")
    print("   using MCP (Model Context Protocol) via Cursor.")
    print("\n   Since MCP calls must be executed in Cursor, this script")
    print("   generates the exact commands for you to copy-paste.")
    
    print("\n" + "=" * 70)
    print("📊 CURRENT STATUS")
    print("=" * 70)
    
    stats = {
        "agents": {"total": 351, "synced": 10, "remaining": 341},
        "tools": {"total": 150, "synced": 15, "remaining": 135},
        "prompts": {"total": 3561, "synced": 10, "remaining": 3551}
    }
    
    for name, data in stats.items():
        print(f"\n{name.upper()}:")
        print(f"   Total: {data['total']}")
        print(f"   Synced: {data['synced']}")
        print(f"   Remaining: {data['remaining']}")
        print(f"   Progress: {(data['synced'] / data['total'] * 100):.1f}%")
    
    print("\n" + "=" * 70)
    print("🎯 SYNC PLAN")
    print("=" * 70)
    
    print("\nThis script will generate batch commands for:")
    print(f"   • {stats['agents']['remaining']} agents ({(stats['agents']['remaining'] // BATCH_SIZE) + 1} batches)")
    print(f"   • {stats['tools']['remaining']} tools ({(stats['tools']['remaining'] // BATCH_SIZE) + 1} batches)")
    
    print("\n" + "=" * 70)
    print("🔄 EXECUTION INSTRUCTIONS")
    print("=" * 70)
    
    print("\n**HOW TO USE THIS SCRIPT:**")
    print("\n1. Run this script: python3 scripts/mcp_sync_all.py")
    print("2. Copy each generated query")
    print("3. Execute in Cursor using MCP")
    print("4. Come back for next batch")
    
    print("\n" + "=" * 70)
    print("📦 BATCH COMMANDS - AGENTS")
    print("=" * 70)
    
    # Generate first 5 agent batches as examples
    print("\n**AGENT BATCHES (Next 5 batches):**\n")
    
    for batch_num in range(5):
        offset = 10 + (batch_num * BATCH_SIZE)  # Start after already synced
        batch_info = sync_agents_batch(offset, BATCH_SIZE)
        print(f"\n2️⃣ After getting results, create pages:")
        print(f"   mcp_Notion_notion-create-pages({{")
        print(f"     parent: {{data_source_id: \"{AGENT_DATA_SOURCE}\"}},")
        print(f"     pages: [/* map your query results using format_agent_for_notion */]")
        print(f"   }})")
        
        if batch_num < 4:
            print(f"\n{'─'*60}\n")
    
    print("\n" + "=" * 70)
    print("📦 BATCH COMMANDS - TOOLS")
    print("=" * 70)
    
    print("\n**TOOL BATCHES (Next 3 batches):**\n")
    
    for batch_num in range(3):
        offset = 15 + (batch_num * BATCH_SIZE)  # Start after already synced
        batch_info = sync_tools_batch(offset, BATCH_SIZE)
        print(f"\n2️⃣ After getting results, create pages:")
        print(f"   mcp_Notion_notion-create-pages({{")
        print(f"     parent: {{data_source_id: \"{TOOL_DATA_SOURCE}\"}},")
        print(f"     pages: [/* map your query results using format_tool_for_notion */]")
        print(f"   }})")
        
        if batch_num < 2:
            print(f"\n{'─'*60}\n")
    
    print("\n" + "=" * 70)
    print("📝 HELPER FUNCTIONS")
    print("=" * 70)
    
    print("\n**FORMAT AGENT FOR NOTION:**")
    print("""
def format_agent(agent):
    return {
        "properties": {
            "Name": agent["name"],
            "Display Name": agent.get("title") or agent["name"],
            "Description": agent.get("description", "")[:500],
            "System Prompt": agent.get("system_prompt", "")[:2000],
            "Model": agent.get("model", "gpt-4"),
            "Temperature": float(agent.get("temperature", 0.7)),
            "Max Tokens": int(agent.get("max_tokens", 2000)),
            "Category": map_category(agent.get("agent_category")),
            "Color": map_color(agent.get("category_color")),
            "Lifecycle Stage": "Active",
            "Is Active": "__YES__"
        }
    }
    """)
    
    print("\n**FORMAT TOOL FOR NOTION:**")
    print("""
def format_tool(tool):
    capabilities = tool.get("capabilities", [])
    capabilities_str = ", ".join(capabilities) if capabilities else ""
    description = f"{tool.get('category', '')} - {capabilities_str}"
    
    return {
        "properties": {
            "Name": tool["name"],
            "Description": description[:500],
            "Tool Type": tool.get("tool_type", "ai_function"),
            "Configuration": tool.get("notes", "")[:500],
            "Is Active": "__YES__"
        }
    }
    """)
    
    print("\n" + "=" * 70)
    print("✅ NEXT STEPS")
    print("=" * 70)
    
    print("\n1. **Start with Agents Batch 1** (offset 10)")
    print("   - Copy the query above")
    print("   - Execute in Cursor MCP")
    print("   - Map results and create pages")
    
    print("\n2. **Continue with remaining batches**")
    print("   - Repeat for each batch")
    print("   - Track progress")
    
    print("\n3. **Sync Tools**")
    print("   - Use same pattern for tools")
    
    print("\n4. **Sync Relationships**")
    print("   - After agents and tools are synced")
    print("   - Link agents to tools and prompts")
    
    print("\n" + "=" * 70)
    print("📊 PROGRESS TRACKING")
    print("=" * 70)
    
    print("\nUpdate this as you complete batches:")
    print("""
# Progress Log
Agents:  [X][X][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]  10/351 (3%)
Tools:   [X][ ][ ][ ][ ][ ][ ][ ]  15/150 (10%)
Prompts: [ ][ ][ ][ ][ ][ ][ ][ ]  10/3561 (0.3%)

# Next Action: Agents Batch 3 (offset 10)
    """)
    
    print("\n" + "=" * 70)
    print("🎊 READY TO SYNC!")
    print("=" * 70)
    
    print("\nCopy the commands above and execute them in Cursor.")
    print("Good luck with your sync! 🚀")
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()

