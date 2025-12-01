#!/usr/bin/env python3
"""
Map AI Agents to Roles based on domain matching.
Creates agent_roles junction table entries linking agents to relevant roles.

Strategy:
1. Match agents to roles based on name/description keywords
2. Map by function area (Commercial, Medical Affairs, Market Access)
3. Each agent can serve multiple roles
4. Each role can have multiple agents
"""
import subprocess
import json
import re
import time
from collections import defaultdict

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Function IDs
FUNCTIONS = {
    "Commercial": "57170e7f-6969-447c-ba2d-bdada970db8b",
    "Medical Affairs": "06127088-4d52-40aa-88c9-93f4e79e085a",
    "Market Access": "b7fed05f-90b2-4c4a-a7a8-8346a3159127"
}

# Agent domain keywords for function matching
FUNCTION_KEYWORDS = {
    "Medical Affairs": [
        "medical", "clinical", "msl", "kol", "scientific", "publication",
        "evidence", "research", "pharmacovigilance", "safety", "adverse",
        "heor", "outcomes", "education", "congress", "manuscript", "trial"
    ],
    "Commercial": [
        "sales", "marketing", "commercial", "revenue", "customer", "account",
        "territory", "brand", "campaign", "digital", "analytics", "forecast",
        "crm", "pipeline", "quota", "promotion", "launch"
    ],
    "Market Access": [
        "access", "payer", "pricing", "reimbursement", "formulary", "value",
        "heor", "budget", "contract", "policy", "government", "coverage",
        "health economics", "cost-effective"
    ]
}

# Role category keywords for agent matching
ROLE_AGENT_MAPPING = {
    # Medical Affairs agents
    "msl": ["msl", "field medical", "liaison", "kol engagement", "hcp"],
    "medical_info": ["medical information", "inquiry", "medical writing"],
    "publications": ["publication", "manuscript", "scientific writing", "congress"],
    "clinical": ["clinical", "trial", "protocol", "investigator"],
    "heor": ["heor", "health economics", "outcomes", "rwe", "real-world"],
    "compliance": ["compliance", "regulatory", "safety", "adverse event"],

    # Commercial agents
    "sales": ["sales", "account", "territory", "quota", "revenue"],
    "marketing": ["marketing", "brand", "campaign", "digital", "content"],
    "analytics": ["analytics", "data", "insight", "forecast", "dashboard"],
    "customer": ["customer", "engagement", "experience", "service"],

    # Market Access agents
    "pricing": ["pricing", "value", "contracting", "rebate"],
    "payer": ["payer", "formulary", "coverage", "access"],
    "policy": ["policy", "government", "advocacy", "stakeholder"]
}

def api_get(endpoint, retries=3):
    """GET request with retries"""
    for attempt in range(retries):
        result = subprocess.run([
            "curl", "-s", f"{URL}/rest/v1/{endpoint}",
            "-H", f"apikey: {APIKEY}",
            "-H", f"Authorization: Bearer {APIKEY}"
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0 and result.stdout:
            try:
                data = json.loads(result.stdout)
                if isinstance(data, list):
                    return data
                return []
            except json.JSONDecodeError:
                pass

        if attempt < retries - 1:
            time.sleep(1)
    return []

def api_post(endpoint, data, retries=3):
    """POST request with retries"""
    for attempt in range(retries):
        result = subprocess.run([
            "curl", "-s", "-X", "POST", f"{URL}/rest/v1/{endpoint}",
            "-H", f"apikey: {APIKEY}",
            "-H", f"Authorization: Bearer {APIKEY}",
            "-H", "Content-Type: application/json",
            "-H", "Prefer: return=minimal,resolution=merge-duplicates",
            "-d", json.dumps(data)
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            if "error" not in result.stdout.lower() or '"code"' not in result.stdout.lower():
                return True

        if attempt < retries - 1:
            time.sleep(0.5)
    return False

def detect_function(agent_name, agent_desc=""):
    """Detect which function an agent belongs to"""
    text = f"{agent_name} {agent_desc or ''}".lower()

    scores = {}
    for func, keywords in FUNCTION_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[func] = score

    # Return function with highest score (or None if no match)
    best_func = max(scores.items(), key=lambda x: x[1])
    if best_func[1] > 0:
        return best_func[0]
    return None

def calculate_relevance(agent_name, role_name, agent_desc=""):
    """Calculate relevance score between agent and role"""
    agent_text = f"{agent_name} {agent_desc or ''}".lower()
    role_lower = role_name.lower()

    score = 0.5  # Base score

    # Check role category keywords
    for category, keywords in ROLE_AGENT_MAPPING.items():
        # Check if role belongs to this category
        if any(kw in role_lower for kw in keywords):
            # Check if agent has matching keywords
            for kw in keywords:
                if kw in agent_text:
                    score += 0.15

    # Direct word overlap
    agent_words = set(re.findall(r'\w+', agent_text))
    role_words = set(re.findall(r'\w+', role_lower))
    overlap = len(agent_words & role_words)
    score += overlap * 0.05

    return min(0.95, max(0.5, score))

def main():
    print("=" * 70)
    print("AI AGENT TO ROLE MAPPING")
    print("=" * 70)
    print()

    # Check if agent_roles table exists
    print("Checking for agent_roles junction table...")
    existing = api_get("agent_roles?select=agent_id,role_id&limit=1")

    table_exists = True
    if not existing and existing != []:
        print("  agent_roles table might not exist - will try to create mappings anyway")
        table_exists = False
    else:
        print(f"  Table exists, found {len(existing)} existing mappings")

    # Get all agents
    print("\nFetching agents...")
    agents = api_get("agents?select=id,name,description,status,tier,knowledge_domains&limit=1000")
    if not agents:
        print("  ERROR: Could not fetch agents. Exiting.")
        return

    active_agents = [a for a in agents if a.get('status') == 'active']
    print(f"  Total agents: {len(agents)}")
    print(f"  Active agents: {len(active_agents)}")

    # Categorize agents by function
    agent_functions = defaultdict(list)
    uncategorized = []

    for agent in active_agents:
        func = detect_function(agent.get('name', ''), agent.get('description', ''))
        if func:
            agent_functions[func].append(agent)
        else:
            uncategorized.append(agent)

    print("\nAgents by function:")
    for func, agents_list in sorted(agent_functions.items()):
        print(f"  {func}: {len(agents_list)}")
    print(f"  Uncategorized: {len(uncategorized)}")

    # Get existing mappings
    existing_mappings = api_get("agent_roles?select=agent_id,role_id&limit=10000")
    existing_pairs = set()
    if existing_mappings:
        existing_pairs = set((m['agent_id'], m['role_id']) for m in existing_mappings
                            if m.get('agent_id') and m.get('role_id'))
    print(f"\nExisting agent-role mappings: {len(existing_pairs)}")

    # Create mappings for each function
    print("\n" + "=" * 70)
    print("CREATING AGENT-ROLE MAPPINGS")
    print("=" * 70)

    total_created = 0
    total_skipped = 0

    for func_name, func_id in FUNCTIONS.items():
        print(f"\n=== {func_name} ===")

        # Get roles for this function
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name,seniority_level&limit=500")
        print(f"Roles: {len(roles)}")

        # Get agents for this function
        func_agents = agent_functions.get(func_name, [])
        print(f"Matched agents: {len(func_agents)}")

        if not func_agents:
            # Use uncategorized agents as fallback
            func_agents = uncategorized[:20]  # Take first 20
            print(f"Using {len(func_agents)} uncategorized agents as fallback")

        created = 0
        skipped = 0

        for role in roles:
            role_id = role['id']
            role_name = role['name']

            # Score each agent for this role
            agent_scores = []
            for agent in func_agents:
                score = calculate_relevance(
                    agent.get('name', ''),
                    role_name,
                    agent.get('description', '')
                )
                agent_scores.append((agent, score))

            # Take top 3-5 agents per role
            agent_scores.sort(key=lambda x: -x[1])
            top_agents = agent_scores[:min(5, len(agent_scores))]

            for seq, (agent, score) in enumerate(top_agents, 1):
                agent_id = agent['id']

                if (agent_id, role_id) in existing_pairs:
                    skipped += 1
                    continue

                mapping = {
                    "agent_id": agent_id,
                    "role_id": role_id,
                    "relevance_score": round(score, 2),
                    "is_primary": seq == 1,
                    "is_active": True,
                    "tenant_id": TENANT_ID
                }

                if api_post("agent_roles", mapping):
                    created += 1
                    existing_pairs.add((agent_id, role_id))

        print(f"  Created: {created} new mappings")
        print(f"  Skipped: {skipped} (already exist)")
        total_created += created
        total_skipped += skipped

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total new mappings created: {total_created}")
    print(f"Total skipped (existing): {total_skipped}")

    # Verification
    print("\n--- Verification ---")
    final_count = api_get("agent_roles?select=id&limit=10000")
    if final_count:
        print(f"Total agent_roles now: {len(final_count)}")
    else:
        print("Could not verify final count")

if __name__ == "__main__":
    main()
