#!/usr/bin/env python3
"""
Insert 64 NEW JTBDs from PHARMA_JTBD_ALL_FUNCTIONS_EXTENDED.json
New patterns: JTBD-RND, JTBD-MFG, JTBD-FIN, JTBD-HR, JTBD-IT, JTBD-LEG, JTBD-COMM, JTBD-STRAT, JTBD-BI, JTBD-PROC, JTBD-FAC

Valid enum values discovered:
- job_category: analytical, operational, strategic
- functional_area: Clinical, Commercial, IT/Digital, Market Access, Medical Affairs, Operations, Quality, Regulatory, Research & Development
- strategic_priority: high, standard
- work_pattern: mixed, ad_hoc, project, routine
- impact_level: high, medium, low
- compliance_sensitivity: high, standard, low
"""
import json
import subprocess
import sys

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Valid functional_area enum mapping
FUNCTION_AREA_MAPPING = {
    "Research & Development": "Research & Development",
    "Manufacturing & Supply Chain": "Operations",
    "Finance & Accounting": "Operations",
    "Human Resources": "Operations",
    "Information Technology": "IT/Digital",
    "Legal & Compliance": "Regulatory",
    "Corporate Communications": "Commercial",
    "Strategic Planning": "Operations",
    "Business Intelligence & Analytics": "IT/Digital",
    "Procurement": "Operations",
    "Facilities & Workplace Services": "Operations",
    "Medical Affairs": "Medical Affairs",
    "Market Access": "Market Access",
    "Commercial Organization": "Commercial",
    "Regulatory Affairs": "Regulatory",
    "Cross-Functional": "Operations"
}

# Map JSON category to valid job_category enum (analytical, operational, strategic)
def get_job_category(category_str, func_name):
    """Map category to valid job_category enum value"""
    category_lower = (category_str or "").lower()
    func_lower = (func_name or "").lower()

    # Strategic indicators
    if any(kw in category_lower or kw in func_lower for kw in
           ["strategy", "strategic", "planning", "portfolio", "m&a", "corporate"]):
        return "strategic"

    # Analytical indicators
    if any(kw in category_lower or kw in func_lower for kw in
           ["analytics", "intelligence", "analysis", "research", "data", "insight", "forecast"]):
        return "analytical"

    # Default to operational
    return "operational"

def api_get(endpoint):
    """GET request to Supabase REST API"""
    result = subprocess.run([
        "curl", "-s", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}"
    ], capture_output=True, text=True)

    if result.returncode == 0 and result.stdout:
        try:
            return json.loads(result.stdout)
        except:
            return []
    return []

def api_post(endpoint, data, prefer_return=True):
    """POST request to Supabase REST API"""
    headers = [
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json"
    ]
    if prefer_return:
        headers.extend(["-H", "Prefer: return=representation"])
    else:
        headers.extend(["-H", "Prefer: resolution=merge-duplicates"])

    result = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{URL}/rest/v1/{endpoint}"] + headers + ["-d", json.dumps(data)],
        capture_output=True, text=True
    )

    if result.returncode == 0:
        try:
            if "error" in result.stdout.lower() and '"code"' in result.stdout.lower():
                print(f"    API Error: {result.stdout[:200]}")
                return None
            response = json.loads(result.stdout)
            if isinstance(response, list) and response:
                return response[0]
            return response
        except:
            pass
    return None

def get_existing_codes():
    """Get all existing JTBD codes from database"""
    data = api_get("jtbd?select=code&limit=1000")
    return set(d.get("code", "") for d in data if d.get("code"))

def insert_jtbd(jtbd_data):
    """Insert a single JTBD"""
    code = jtbd_data.get("code", "")
    func_name = jtbd_data.get("function", "Operations")
    category = jtbd_data.get("category", "")

    # Map function to valid enum
    functional_area = FUNCTION_AREA_MAPPING.get(func_name, "Operations")

    # Map category to valid job_category
    job_category = get_job_category(category, func_name)

    # Strategic priority based on function type
    strategic = func_name in ["Strategic Planning", "Regulatory Affairs", "Legal & Compliance"]
    strategic_priority = "high" if strategic else "standard"

    # Build job statement from description
    desc = jtbd_data.get("description", "")

    data = {
        "tenant_id": TENANT_ID,
        "code": code,
        "name": jtbd_data.get("name", ""),
        "description": desc,
        "job_statement": desc[:500] if desc else f"Perform {jtbd_data.get('name', '')}",
        "functional_area": functional_area,
        "job_category": job_category,  # Fixed: using valid enum value
        "complexity": "medium",
        "frequency": "monthly",
        "status": "active",
        "validation_score": 0.85,
        "jtbd_type": "strategic" if job_category == "strategic" else "operational",  # jtbd_type only: operational, strategic
        "work_pattern": "mixed",
        "strategic_priority": strategic_priority,
        "impact_level": "medium",
        "compliance_sensitivity": "medium",  # Valid: critical, high, medium (NOT standard)
        "recommended_service_layer": "L1_expert"
    }

    result = api_post("jtbd", data)
    if result and "id" in result:
        return result.get("id")
    return None

def create_ontology(jtbd_id, code):
    """Create enterprise ontology for a JTBD"""

    # KPIs (2 per JTBD)
    api_post("jtbd_kpis", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "kpi_code": f"KPI-{code}-01", "kpi_name": "Time to Completion",
        "kpi_description": "Average time from initiation to completion",
        "target_value": 100, "current_value": 65, "priority": "high",
        "sequence_order": 1, "is_primary": True
    }, prefer_return=False)

    api_post("jtbd_kpis", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "kpi_code": f"KPI-{code}-02", "kpi_name": "Quality Score",
        "kpi_description": "Quality rating based on stakeholder feedback",
        "target_value": 4.5, "current_value": 3.8, "priority": "high",
        "sequence_order": 2, "is_primary": False
    }, prefer_return=False)

    # Pain Point
    api_post("jtbd_pain_points", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "issue": "Manual processes consume excessive time and resources",
        "severity": "high", "pain_point_type": "process",
        "frequency": "always", "impact_description": "Delays deliverables and increases costs"
    }, prefer_return=False)

    # Desired Outcomes (2 per JTBD)
    api_post("jtbd_desired_outcomes", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "outcome": "Reduce time spent by 50% through AI assistance",
        "importance": 9, "outcome_type": "speed",
        "current_satisfaction": 4, "sequence_order": 1
    }, prefer_return=False)

    api_post("jtbd_desired_outcomes", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "outcome": "Improve accuracy and consistency of outputs",
        "importance": 8, "outcome_type": "quality",
        "current_satisfaction": 5, "sequence_order": 2
    }, prefer_return=False)

    # AI Suitability
    api_post("jtbd_ai_suitability", {
        "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
        "rag_score": 0.85, "summary_score": 0.90,
        "generation_score": 0.75, "reasoning_score": 0.80,
        "automation_score": 0.65, "overall_score": 0.79,
        "intervention_type_name": "augmentation",
        "rationale": "AI can significantly augment human decision-making in this domain"
    }, prefer_return=False)

def main():
    print("=" * 60)
    print("INSERTING 64 NEW JTBDs FROM EXTENDED JSON")
    print("=" * 60)
    print()

    # Get existing codes
    print("Fetching existing codes from database...")
    existing_codes = get_existing_codes()
    print(f"Existing JTBDs in database: {len(existing_codes)}")

    # Load JSON file
    print("Loading JSON file...")
    with open('/Users/hichamnaim/Downloads/PHARMA_JTBD_ALL_FUNCTIONS_EXTENDED.json', 'r') as f:
        json_data = json.load(f)

    all_jtbds = json_data.get("jtbds", [])
    print(f"Total JTBDs in JSON: {len(all_jtbds)}")

    # Filter new ones
    new_jtbds = [j for j in all_jtbds if j.get("code", "") not in existing_codes]
    print(f"New JTBDs to insert: {len(new_jtbds)}")
    print()

    if not new_jtbds:
        print("No new JTBDs to insert!")
        return

    # Insert JTBDs
    print("=" * 60)
    print("INSERTING JTBDs WITH ENTERPRISE ONTOLOGY")
    print("=" * 60)
    print()

    inserted = 0
    failed = 0

    for i, jtbd in enumerate(new_jtbds, 1):
        code = jtbd.get("code", "")
        name = jtbd.get("name", "")[:50]

        jtbd_id = insert_jtbd(jtbd)

        if jtbd_id:
            print(f"[{i:2d}/{len(new_jtbds)}] OK  {code}: {name}")
            create_ontology(jtbd_id, code)
            inserted += 1
        else:
            print(f"[{i:2d}/{len(new_jtbds)}] FAIL {code}: {name}")
            failed += 1

        # Progress indicator
        if i % 10 == 0:
            print(f"    ... progress: {i}/{len(new_jtbds)} ({100*i//len(new_jtbds)}%)")

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Inserted: {inserted}")
    print(f"Failed: {failed}")
    print(f"Total processed: {inserted + failed}")
    print()
    print(f"Expected final JTBD count: {len(existing_codes) + inserted}")

if __name__ == "__main__":
    main()
