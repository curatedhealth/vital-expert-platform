#!/usr/bin/env python3
"""
Setup agent_roles junction table and map agents to roles.
"""
import subprocess
import json
import re
import time
from collections import defaultdict

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

FUNCTIONS = {
    "Commercial": "57170e7f-6969-447c-ba2d-bdada970db8b",
    "Medical Affairs": "06127088-4d52-40aa-88c9-93f4e79e085a",
    "Market Access": "b7fed05f-90b2-4c4a-a7a8-8346a3159127"
}

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

def api_get(endpoint, retries=3):
    for attempt in range(retries):
        try:
            full_url = f"{URL}/rest/v1/{endpoint}"
            result = subprocess.run([
                "curl", "-s", full_url,
                "-H", f"apikey: {APIKEY}",
                "-H", f"Authorization: Bearer {APIKEY}"
            ], capture_output=True, text=True, timeout=60)

            if result.returncode == 0 and result.stdout:
                try:
                    data = json.loads(result.stdout)
                    if isinstance(data, list):
                        return data
                    if isinstance(data, dict):
                        if "code" in data:
                            print(f"  API error: {data.get('message', 'Unknown')}")
                            return None
                        return [data]  # Single object
                except json.JSONDecodeError as je:
                    print(f"  JSON parse error: {je}")
                    print(f"  Response: {result.stdout[:200]}")
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
        if attempt < retries - 1:
            time.sleep(2)
    return []

def api_post(endpoint, data, retries=3):
    for attempt in range(retries):
        try:
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
        except Exception:
            pass
        if attempt < retries - 1:
            time.sleep(0.5)
    return False

def run_sql(sql):
    """Run SQL via Supabase SQL endpoint (using rpc if available) or direct psql"""
    # Try direct psql via pooler
    try:
        result = subprocess.run([
            "psql",
            "postgresql://postgres.bomltkhixeatxuoxmolq:flusd9fqEb4kkTJ1@aws-0-us-west-1.pooler.supabase.com:6543/postgres",
            "-c", sql
        ], capture_output=True, text=True, timeout=60, env={"PGPASSWORD": "flusd9fqEb4kkTJ1"})
        return result.returncode == 0
    except Exception as e:
        print(f"SQL execution failed: {e}")
        return False

def detect_function(agent_name, agent_desc=""):
    text = f"{agent_name} {agent_desc or ''}".lower()
    scores = {}
    for func, keywords in FUNCTION_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[func] = score
    best_func = max(scores.items(), key=lambda x: x[1])
    if best_func[1] > 0:
        return best_func[0]
    return None

def calculate_relevance(agent_name, role_name, agent_desc=""):
    agent_text = f"{agent_name} {agent_desc or ''}".lower()
    role_lower = role_name.lower()
    score = 0.5

    # Word overlap scoring
    agent_words = set(re.findall(r'\w+', agent_text))
    role_words = set(re.findall(r'\w+', role_lower))
    overlap = len(agent_words & role_words)
    score += overlap * 0.08

    return min(0.95, max(0.5, score))

def check_table_exists():
    """Check if agent_roles table exists"""
    result = api_get("agent_roles?select=id&limit=1")
    return result is not None  # None means error (table doesn't exist)

def create_agent_roles_table():
    """Create the agent_roles table using REST API"""
    print("Creating agent_roles junction table...")

    sql = """
    CREATE TABLE IF NOT EXISTS public.agent_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
        relevance_score NUMERIC(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
        is_primary BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        use_case TEXT,
        tenant_id UUID REFERENCES public.tenants(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by TEXT DEFAULT 'system',
        UNIQUE (agent_id, role_id)
    );

    CREATE INDEX IF NOT EXISTS idx_agent_roles_agent_id ON public.agent_roles(agent_id);
    CREATE INDEX IF NOT EXISTS idx_agent_roles_role_id ON public.agent_roles(role_id);
    CREATE INDEX IF NOT EXISTS idx_agent_roles_tenant_id ON public.agent_roles(tenant_id);

    ALTER TABLE public.agent_roles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Service role bypass for agent_roles" ON public.agent_roles;
    CREATE POLICY "Service role bypass for agent_roles"
        ON public.agent_roles FOR ALL TO service_role
        USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Authenticated users can read agent_roles" ON public.agent_roles;
    CREATE POLICY "Authenticated users can read agent_roles"
        ON public.agent_roles FOR SELECT TO authenticated
        USING (is_active = TRUE);

    GRANT SELECT ON public.agent_roles TO authenticated;
    GRANT ALL ON public.agent_roles TO service_role;
    """

    if run_sql(sql):
        print("  Table created successfully")
        return True
    else:
        print("  Could not create table via psql, will try alternative...")
        return False

def main():
    print("=" * 70)
    print("AGENT TO ROLE MAPPING - SETUP AND POPULATE")
    print("=" * 70)
    print()

    # Step 1: Check/Create table
    print("Step 1: Checking agent_roles table...")
    if not check_table_exists():
        print("  Table doesn't exist. Creating...")
        create_agent_roles_table()
        time.sleep(2)  # Wait for schema cache to update
    else:
        print("  Table exists!")

    # Step 2: Get agents - fetch all and filter in Python
    print("\nStep 2: Fetching agents...")
    all_agents = api_get("agents?select=id,name,description,status&limit=1000")

    if not all_agents:
        print("  Trying without limit...")
        all_agents = api_get("agents?select=id,name,description,status")

    if not all_agents:
        print("  No agents found. Exiting.")
        return

    print(f"  Total agents fetched: {len(all_agents)}")

    # Filter to active agents
    agents = [a for a in all_agents if a.get('status') == 'active']
    print(f"  Active agents: {len(agents)}")

    # Categorize by function
    agent_functions = defaultdict(list)
    uncategorized = []

    for agent in agents:
        func = detect_function(agent.get('name', ''), agent.get('description', ''))
        if func:
            agent_functions[func].append(agent)
        else:
            uncategorized.append(agent)

    print("\n  Agents by function:")
    for func, a_list in sorted(agent_functions.items()):
        print(f"    {func}: {len(a_list)}")
    print(f"    Uncategorized: {len(uncategorized)}")

    # Step 3: Get existing mappings
    print("\nStep 3: Checking existing mappings...")
    existing = api_get("agent_roles?select=agent_id,role_id&limit=10000")
    existing_pairs = set()
    if existing:
        existing_pairs = set((m['agent_id'], m['role_id']) for m in existing
                            if m.get('agent_id') and m.get('role_id'))
        print(f"  Existing mappings: {len(existing_pairs)}")
    else:
        print("  No existing mappings (or table still doesn't exist)")
        # Try to insert a test record to verify table access
        test = api_post("agent_roles", {
            "agent_id": agents[0]['id'],
            "role_id": "00000000-0000-0000-0000-000000000000",  # Will fail
            "tenant_id": TENANT_ID
        })
        print(f"  Table access test: {'accessible' if not test else 'created test'}")

    # Step 4: Create mappings
    print("\n" + "=" * 70)
    print("CREATING AGENT-ROLE MAPPINGS")
    print("=" * 70)

    total_created = 0
    total_skipped = 0

    for func_name, func_id in FUNCTIONS.items():
        print(f"\n=== {func_name} ===")

        # Get roles
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name&limit=500")
        if not roles:
            print(f"  No roles found for {func_name}")
            continue
        print(f"  Roles: {len(roles)}")

        # Get matching agents
        func_agents = agent_functions.get(func_name, [])
        if not func_agents:
            func_agents = uncategorized[:30]
        print(f"  Agents: {len(func_agents)}")

        created = 0
        skipped = 0

        for role in roles:
            role_id = role['id']
            role_name = role['name']

            # Score agents for this role
            scores = [(a, calculate_relevance(a.get('name',''), role_name, a.get('description','')))
                     for a in func_agents]
            scores.sort(key=lambda x: -x[1])

            # Take top 3-5 agents
            top = scores[:min(5, len(scores))]

            for seq, (agent, score) in enumerate(top, 1):
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

        print(f"  Created: {created}")
        print(f"  Skipped: {skipped}")
        total_created += created
        total_skipped += skipped

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total created: {total_created}")
    print(f"Total skipped: {total_skipped}")

    # Verify
    final = api_get("agent_roles?select=id&limit=10000")
    if final:
        print(f"Total agent_roles: {len(final)}")

if __name__ == "__main__":
    main()
