#!/usr/bin/env python3
"""
JTBD Value Mapping Script
Maps JTBDs to value categories and drivers based on intelligent keyword analysis

Value Categories (6):
- SMARTER: Enhanced decision-making, insights, intelligence
- FASTER: Improved speed, efficiency, time-to-value
- BETTER: Higher quality, accuracy, outcomes
- EFFICIENT: Optimized resource utilization, cost-effectiveness
- SAFER: Reduced risk, improved compliance, safety
- SCALABLE: Growth capability, adaptability

Value Drivers (13):
Internal (7): Cost Reduction, Decision Quality, Employee Experience, Knowledge Management,
              Operational Efficiency, Regulatory Compliance, Scientific Quality
External (6): Brand Reputation, Competitive Advantage, HCP Experience, Market Access,
              Patient Impact, Stakeholder Trust
"""

import os
import re
from supabase import create_client, Client

# Supabase connection
SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Keyword mapping for Value Categories
VALUE_CATEGORY_KEYWORDS = {
    "SMARTER": [
        "intelligence", "insight", "decision", "analyze", "analysis", "predict",
        "forecast", "assess", "evaluate", "intelligence", "strategy", "strategic",
        "optimize", "identify", "discover", "understand", "learn", "research"
    ],
    "FASTER": [
        "speed", "fast", "quick", "accelerate", "streamline", "automate", "automation",
        "efficient", "rapid", "timely", "real-time", "instant", "agile", "responsive",
        "reduce time", "shorten", "expedite"
    ],
    "BETTER": [
        "quality", "accurate", "accuracy", "improve", "enhance", "excellence",
        "outcome", "effective", "success", "best", "optimal", "superior", "precision"
    ],
    "EFFICIENT": [
        "cost", "resource", "budget", "optimize", "reduce", "minimize", "savings",
        "productivity", "utilization", "roi", "value", "economic", "efficient"
    ],
    "SAFER": [
        "safety", "safe", "risk", "compliance", "compliant", "regulatory", "secure",
        "protect", "monitor", "audit", "adverse", "pharmacovigilance", "pv"
    ],
    "SCALABLE": [
        "scale", "scalable", "growth", "expand", "adapt", "flexible", "enterprise",
        "global", "multi", "standard", "platform", "infrastructure"
    ]
}

# Keyword mapping for Value Drivers
VALUE_DRIVER_KEYWORDS = {
    # Internal drivers
    "COST_REDUCTION": [
        "cost", "savings", "reduce", "budget", "economic", "expense", "spend"
    ],
    "DECISION_QUALITY": [
        "decision", "judgment", "choice", "recommend", "advise", "strategy"
    ],
    "EMPLOYEE_EXPERIENCE": [
        "employee", "staff", "team", "workforce", "user", "experience", "satisfaction"
    ],
    "KNOWLEDGE_MANAGEMENT": [
        "knowledge", "document", "information", "content", "library", "repository",
        "training", "education", "learn"
    ],
    "OPERATIONAL_EFFICIENCY": [
        "operational", "process", "workflow", "streamline", "automate", "efficiency",
        "productivity", "throughput"
    ],
    "COMPLIANCE": [
        "compliance", "regulatory", "regulation", "audit", "gxp", "fda", "ema",
        "hipaa", "policy", "legal", "governance"
    ],
    "SCIENTIFIC_QUALITY": [
        "scientific", "evidence", "clinical", "research", "study", "trial",
        "publication", "peer-review", "data", "medical"
    ],
    # External drivers
    "BRAND_REPUTATION": [
        "brand", "reputation", "image", "perception", "public", "visibility"
    ],
    "COMPETITIVE_ADVANTAGE": [
        "competitive", "advantage", "differentiate", "market", "position", "leader"
    ],
    "HCP_EXPERIENCE": [
        "hcp", "physician", "doctor", "healthcare provider", "clinician", "kol",
        "prescriber", "specialist"
    ],
    "MARKET_ACCESS": [
        "market access", "payer", "formulary", "reimbursement", "coverage", "pricing",
        "heor", "value dossier", "hta"
    ],
    "PATIENT_IMPACT": [
        "patient", "consumer", "caregiver", "adherence", "outcome", "health",
        "therapy", "treatment"
    ],
    "STAKEHOLDER_TRUST": [
        "stakeholder", "trust", "relationship", "engagement", "partner", "collaborate"
    ]
}

def get_value_categories():
    """Fetch all value categories"""
    response = supabase.table("value_categories").select("*").execute()
    return {cat["code"]: cat for cat in response.data}

def get_value_drivers():
    """Fetch all value drivers"""
    response = supabase.table("value_drivers").select("*").execute()
    return {drv["code"]: drv for drv in response.data}

def get_jtbds():
    """Fetch all JTBDs"""
    response = supabase.table("jtbd").select("id, code, name, job_statement, complexity").execute()
    return response.data

def calculate_relevance(text: str, keywords: list) -> float:
    """Calculate relevance score based on keyword matches"""
    if not text:
        return 0.0
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if kw.lower() in text_lower)
    # Normalize to 0-1 range with a max of 5 matches giving 1.0
    return min(matches / 5, 1.0)

def map_jtbd_to_categories(jtbd: dict, categories: dict) -> list:
    """Map a JTBD to value categories"""
    text = f"{jtbd.get('name', '')} {jtbd.get('job_statement', '')}"
    mappings = []

    scores = {}
    for code, keywords in VALUE_CATEGORY_KEYWORDS.items():
        score = calculate_relevance(text, keywords)
        if score > 0:
            scores[code] = score

    # Sort by score and take top 3
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]

    for i, (code, score) in enumerate(sorted_scores):
        if code in categories and score >= 0.2:  # Minimum threshold
            mappings.append({
                "jtbd_id": jtbd["id"],
                "category_id": categories[code]["id"],
                "category_name": categories[code]["name"],
                "relevance_score": round(score, 2),
                "is_primary": i == 0,
                "rationale": f"Keyword analysis based on JTBD name and job statement"
            })

    return mappings

def map_jtbd_to_drivers(jtbd: dict, drivers: dict) -> list:
    """Map a JTBD to value drivers"""
    text = f"{jtbd.get('name', '')} {jtbd.get('job_statement', '')}"
    mappings = []

    scores = {}
    for code, keywords in VALUE_DRIVER_KEYWORDS.items():
        score = calculate_relevance(text, keywords)
        if score > 0:
            scores[code] = score

    # Sort by score and take top 4
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:4]

    for code, score in sorted_scores:
        if code in drivers and score >= 0.2:
            # Determine confidence level based on score
            if score >= 0.8:
                confidence = "very_high"
            elif score >= 0.6:
                confidence = "high"
            elif score >= 0.4:
                confidence = "medium"
            else:
                confidence = "low"

            mappings.append({
                "jtbd_id": jtbd["id"],
                "driver_id": drivers[code]["id"],
                "driver_name": drivers[code]["name"],
                "impact_strength": round(score, 2),
                "confidence_level": confidence,
                "rationale": f"Keyword analysis based on JTBD name and job statement"
            })

    return mappings

def main():
    print("=" * 60)
    print("JTBD Value Mapping Script")
    print("=" * 60)

    # Fetch reference data
    print("\n1. Fetching reference data...")
    categories = get_value_categories()
    print(f"   Found {len(categories)} value categories")

    drivers = get_value_drivers()
    print(f"   Found {len(drivers)} value drivers")

    jtbds = get_jtbds()
    print(f"   Found {len(jtbds)} JTBDs")

    # Map JTBDs to categories
    print("\n2. Mapping JTBDs to value categories...")
    category_mappings = []
    for jtbd in jtbds:
        mappings = map_jtbd_to_categories(jtbd, categories)
        category_mappings.extend(mappings)

    print(f"   Generated {len(category_mappings)} JTBD-Category mappings")

    # Map JTBDs to drivers
    print("\n3. Mapping JTBDs to value drivers...")
    driver_mappings = []
    for jtbd in jtbds:
        mappings = map_jtbd_to_drivers(jtbd, drivers)
        driver_mappings.extend(mappings)

    print(f"   Generated {len(driver_mappings)} JTBD-Driver mappings")

    # Insert category mappings
    print("\n4. Inserting JTBD-Category mappings...")
    if category_mappings:
        # Insert in batches of 100
        batch_size = 100
        inserted_cat = 0
        for i in range(0, len(category_mappings), batch_size):
            batch = category_mappings[i:i + batch_size]
            try:
                response = supabase.table("jtbd_value_categories").upsert(
                    batch,
                    on_conflict="jtbd_id,category_id"
                ).execute()
                inserted_cat += len(batch)
                print(f"   Inserted batch {i//batch_size + 1}: {len(batch)} mappings")
            except Exception as e:
                print(f"   Error inserting batch: {e}")
        print(f"   Total category mappings inserted: {inserted_cat}")

    # Insert driver mappings
    print("\n5. Inserting JTBD-Driver mappings...")
    if driver_mappings:
        batch_size = 100
        inserted_drv = 0
        for i in range(0, len(driver_mappings), batch_size):
            batch = driver_mappings[i:i + batch_size]
            try:
                response = supabase.table("jtbd_value_drivers").upsert(
                    batch,
                    on_conflict="jtbd_id,driver_id"
                ).execute()
                inserted_drv += len(batch)
                print(f"   Inserted batch {i//batch_size + 1}: {len(batch)} mappings")
            except Exception as e:
                print(f"   Error inserting batch: {e}")
        print(f"   Total driver mappings inserted: {inserted_drv}")

    # Summary statistics
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"JTBDs processed: {len(jtbds)}")
    print(f"Category mappings created: {len(category_mappings)}")
    print(f"Driver mappings created: {len(driver_mappings)}")

    # Distribution by category
    print("\nCategory Distribution:")
    cat_dist = {}
    for m in category_mappings:
        name = m["category_name"]
        cat_dist[name] = cat_dist.get(name, 0) + 1
    for name, count in sorted(cat_dist.items(), key=lambda x: x[1], reverse=True):
        print(f"   {name}: {count}")

    # Distribution by driver
    print("\nDriver Distribution (top 10):")
    drv_dist = {}
    for m in driver_mappings:
        name = m["driver_name"]
        drv_dist[name] = drv_dist.get(name, 0) + 1
    for name, count in sorted(drv_dist.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"   {name}: {count}")

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)

if __name__ == "__main__":
    main()
