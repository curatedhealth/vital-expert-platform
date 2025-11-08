#!/usr/bin/env python3
"""
MCP-Based Notion-Supabase Batch Sync Script
Uses MCP commands via subprocess to sync data in manageable batches
"""

import json
import subprocess
import time
from typing import List, Dict

# Configuration
BATCH_SIZE = 20
AGENT_DATA_SOURCE = "e52a9be9-5c0b-49fa-b6cf-d0e222df6cc8"
TOOL_DATA_SOURCE = "5413fbf4-7a25-4b4f-910f-e205feffacd2"
PROMPT_DATA_SOURCE = "e0f04531-0e95-4702-934a-44e66fb99eec"

COLOR_MAP = {
    "#3B82F6": "#2196f3",
    "#10B981": "#4caf50",
    "#EF4444": "#f44336",
    "#8B5CF6": "#9c27b0",
    "#F59E0B": "#ff9800",
    "#06B6D4": "#00bcd4",
    "#EC4899": "#e91e63"
}

CATEGORY_MAP = {
    "specialized_knowledge": "Clinical Expert",
    "universal_task_subagent": "Technical Specialist",
    "multi_expert_orchestration": "Strategic Consultant",
    "process_automation": "Data Analyst",
    "autonomous_problem_solving": "Business Advisor",
    "deep_agent": "Strategic Consultant"
}

def map_color(color: str) -> str:
    """Map Supabase color to valid Notion color"""
    return COLOR_MAP.get(color, "#4caf50")

def map_category(category: str) -> str:
    """Map Supabase category to valid Notion category"""
    return CATEGORY_MAP.get(category, "General")

def truncate(text: str, max_length: int = 2000) -> str:
    """Truncate text to Notion field limits"""
    if not text:
        return ""
    return text[:max_length] if len(text) > max_length else text

def sync_agent_batch(offset: int, limit: int = BATCH_SIZE):
    """
    Sync a batch of agents from Supabase to Notion
    
    Usage:
    python batch_sync.py --batch 1  # Syncs agents 0-19
    python batch_sync.py --batch 2  # Syncs agents 20-39
    """
    print(f"\\n🚀 Syncing agents {offset} to {offset + limit}...")
    
    # Note: This is a template - actual MCP commands would be run via Cursor
    query = f"""
    SELECT id, name, title, description, system_prompt, 
           model, temperature, max_tokens, is_active, 
           agent_category, category_color
    FROM agents 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT {limit} OFFSET {offset};
    """
    
    print(f"📊 Query: {query}")
    print("\\n⚠️  Run this query in Cursor using:")
    print(f"   mcp_supabase_execute_sql(query=\"{query.strip()}\")")
    print("\\n   Then create pages in Notion using the pattern below:\\n")
    
    return query

def generate_notion_pages_command(agents: List[Dict]) -> str:
    """Generate MCP command to create Notion pages"""
    
    pages = []
    for agent in agents:
        page = {
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
                "Is Active": "__YES__"
            }
        }
        pages.append(page)
    
    command = {
        "parent": {"data_source_id": AGENT_DATA_SOURCE},
        "pages": pages
    }
    
    return json.dumps(command, indent=2)

def main():
    """Main execution"""
    print("=" * 60)
    print("🔄 MCP NOTION-SUPABASE BATCH SYNC")
    print("=" * 60)
    
    print("\\n📋 SYNC PLAN:")
    print("   - Total agents to sync: 341")
    print(f"   - Batch size: {BATCH_SIZE}")
    print(f"   - Number of batches: {341 // BATCH_SIZE + 1}")
    print("\\n   - Agent-tool relationships: 1,592")
    print("   - Agent-prompt relationships: 480")
    
    print("\\n" + "=" * 60)
    print("📝 EXECUTION INSTRUCTIONS")
    print("=" * 60)
    
    print("\\n**STEP 1: Run in Cursor**")
    print("   Copy the queries below and run them using MCP:")
    
    # Generate batch queries
    for batch_num in range(1, 6):  # First 5 batches as example
        offset = (batch_num - 1) * BATCH_SIZE + 10  # Starting after already synced
        print(f"\\n--- Batch {batch_num} (Agents {offset}-{offset + BATCH_SIZE - 1}) ---")
        sync_agent_batch(offset, BATCH_SIZE)
    
    print("\\n" + "=" * 60)
    print("\\n✅ After completing agent sync:")
    print("   1. Run relationship sync (see RELATIONSHIP_SYNC.md)")
    print("   2. Verify all data in Notion")
    print("   3. Test agent-tool-prompt connections")
    
    print("\\n💡 TIP: For large syncs, run batches incrementally")
    print("   to avoid rate limits and ensure quality.")
    print("\\n" + "=" * 60)

if __name__ == "__main__":
    main()

