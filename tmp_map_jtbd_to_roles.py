#!/usr/bin/env python3
"""
Map JTBDs to Roles for Commercial, Medical Affairs, and Market Access functions.

Strategy:
1. Map JTBDs to roles within same functional area
2. Use keyword matching for relevance scoring
3. Each role gets mapped to 3-8 JTBDs based on relevance
4. Each JTBD can map to multiple roles
"""
import subprocess
import json
import re
from collections import defaultdict
import random

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

FUNCTIONS = {
    "Commercial": "57170e7f-6969-447c-ba2d-bdada970db8b",
    "Medical Affairs": "06127088-4d52-40aa-88c9-93f4e79e085a",
    "Market Access": "b7fed05f-90b2-4c4a-a7a8-8346a3159127"
}

# Keyword mappings for intelligent JTBD-role matching
ROLE_KEYWORDS = {
    # Commercial keywords
    "sales": ["revenue", "pipeline", "customer", "deal", "territory", "quota", "account"],
    "marketing": ["campaign", "brand", "launch", "promotion", "message", "content", "digital"],
    "analytics": ["data", "insight", "metrics", "forecast", "report", "analysis", "dashboard"],
    "operations": ["process", "efficiency", "optimize", "workflow", "system", "support"],
    "strategy": ["strategic", "planning", "growth", "market", "competitive", "business"],
    "customer": ["experience", "engagement", "relationship", "satisfaction", "service"],
    "training": ["education", "development", "onboarding", "learning", "certification"],

    # Medical Affairs keywords
    "medical": ["evidence", "scientific", "clinical", "research", "publication", "kol"],
    "msl": ["field", "engagement", "hcp", "physician", "education", "liaison"],
    "publications": ["manuscript", "abstract", "congress", "poster", "journal"],
    "compliance": ["regulatory", "legal", "adverse", "safety", "pharmacovigilance"],

    # Market Access keywords
    "pricing": ["price", "value", "cost", "reimbursement", "contract"],
    "heor": ["outcome", "economics", "model", "cost-effectiveness", "budget"],
    "payer": ["formulary", "coverage", "policy", "access", "negotiation"],
    "policy": ["government", "advocacy", "legislation", "stakeholder"]
}

def api_get(endpoint):
    result = subprocess.run([
        "curl", "-s", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}"
    ], capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        return data if isinstance(data, list) else []
    except:
        return []

def api_post(endpoint, data):
    result = subprocess.run([
        "curl", "-s", "-X", "POST", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=minimal,resolution=merge-duplicates",
        "-d", json.dumps(data)
    ], capture_output=True, text=True)
    return "error" not in result.stdout.lower() or '"code"' not in result.stdout.lower()

def calculate_relevance(role_name, jtbd_name, jtbd_desc):
    """Calculate relevance score between role and JTBD"""
    role_lower = role_name.lower()
    jtbd_text = f"{jtbd_name} {jtbd_desc or ''}".lower()

    score = 0.5  # Base score

    # Check keyword matches
    for category, keywords in ROLE_KEYWORDS.items():
        if category in role_lower:
            for kw in keywords:
                if kw in jtbd_text:
                    score += 0.1

    # Direct word overlap
    role_words = set(re.findall(r'\w+', role_lower))
    jtbd_words = set(re.findall(r'\w+', jtbd_text))
    overlap = len(role_words & jtbd_words)
    score += overlap * 0.05

    # Cap at 0.95
    return min(0.95, max(0.5, score))

def get_importance(score):
    """Map score to importance level"""
    if score >= 0.85:
        return "critical"
    elif score >= 0.7:
        return "high"
    elif score >= 0.6:
        return "medium"
    return "low"

def get_frequency(jtbd_name):
    """Estimate frequency based on JTBD name"""
    name_lower = jtbd_name.lower()
    if any(x in name_lower for x in ["daily", "routine", "monitor", "track"]):
        return "daily"
    elif any(x in name_lower for x in ["weekly", "report", "review"]):
        return "weekly"
    elif any(x in name_lower for x in ["monthly", "analysis", "plan"]):
        return "monthly"
    elif any(x in name_lower for x in ["quarterly", "strategy", "budget"]):
        return "quarterly"
    elif any(x in name_lower for x in ["annual", "yearly", "launch"]):
        return "annually"
    return "monthly"

def main():
    print("=" * 70)
    print("JTBD-TO-ROLE MAPPING GENERATOR")
    print("=" * 70)
    print()

    # Get existing mappings to avoid duplicates
    existing = api_get("jtbd_roles?select=jtbd_id,role_id&limit=10000")
    existing_pairs = set((e['jtbd_id'], e['role_id']) for e in existing if e.get('jtbd_id') and e.get('role_id'))
    print(f"Existing jtbd_roles mappings: {len(existing_pairs)}")

    # Get JTBDs
    jtbds = api_get("jtbd?select=id,code,name,description,functional_area&limit=1000")
    print(f"Total JTBDs: {len(jtbds)}")

    # Map functional_area to our target functions
    FUNC_AREA_MAP = {
        "Commercial": ["Commercial"],
        "Medical Affairs": ["Medical Affairs", "Clinical"],
        "Market Access": ["Market Access"]
    }

    total_created = 0
    total_skipped = 0

    for func_name, func_id in FUNCTIONS.items():
        print(f"\n{'='*60}")
        print(f"Processing {func_name}")
        print(f"{'='*60}")

        # Get roles for this function
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name,seniority_level&limit=500")
        print(f"Roles: {len(roles)}")

        # Get JTBDs for this functional area
        func_areas = FUNC_AREA_MAP.get(func_name, [func_name])
        func_jtbds = [j for j in jtbds if j.get('functional_area') in func_areas]
        print(f"JTBDs for this function: {len(func_jtbds)}")

        if not func_jtbds:
            print(f"  No JTBDs found for {func_name}, using general JTBDs")
            # Use a subset of general JTBDs
            func_jtbds = random.sample(jtbds, min(30, len(jtbds)))

        created = 0
        skipped = 0

        for i, role in enumerate(roles, 1):
            role_id = role['id']
            role_name = role['name']

            # Calculate relevance for each JTBD
            jtbd_scores = []
            for jtbd in func_jtbds:
                score = calculate_relevance(role_name, jtbd.get('name', ''), jtbd.get('description', ''))
                jtbd_scores.append((jtbd, score))

            # Sort by relevance and take top 3-6
            jtbd_scores.sort(key=lambda x: -x[1])
            num_jtbds = random.randint(3, min(6, len(jtbd_scores)))
            top_jtbds = jtbd_scores[:num_jtbds]

            for seq, (jtbd, score) in enumerate(top_jtbds, 1):
                jtbd_id = jtbd['id']

                # Skip if already exists
                if (jtbd_id, role_id) in existing_pairs:
                    skipped += 1
                    continue

                mapping = {
                    "jtbd_id": jtbd_id,
                    "role_id": role_id,
                    "role_name": role_name,
                    "relevance_score": round(score, 2),
                    "importance": get_importance(score),
                    "frequency": get_frequency(jtbd.get('name', '')),
                    "is_primary": seq == 1,
                    "mapping_source": "manual",
                    "sequence_order": seq,
                    "tenant_id": TENANT_ID
                }

                if api_post("jtbd_roles", mapping):
                    created += 1
                    existing_pairs.add((jtbd_id, role_id))

            if i % 50 == 0:
                print(f"  Progress: {i}/{len(roles)} roles processed, {created} mappings created")

        print(f"\n  Created: {created} new mappings")
        print(f"  Skipped: {skipped} (already exist)")
        total_created += created
        total_skipped += skipped

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total new mappings created: {total_created}")
    print(f"Total skipped (existing): {total_skipped}")

    # Verify
    print("\n--- Verification ---")
    final_count = api_get("jtbd_roles?select=id&limit=10000")
    print(f"Total jtbd_roles now: {len(final_count)}")

if __name__ == "__main__":
    main()
