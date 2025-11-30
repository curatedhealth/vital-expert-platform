#!/usr/bin/env python3
import json
import subprocess

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

FUNCTION_IDS = {
    "Medical Affairs": "06127088-4d52-40aa-88c9-93f4e79e085a",
    "Market Access": "b7fed05f-90b2-4c4a-a7a8-8346a3159127", 
    "Commercial": "b718e2d1-40c4-478c-9bbb-695b931ce1bb"
}

def post_data(endpoint, data):
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates",
        "-d", json.dumps(data)
    ], capture_output=True, text=True)
    return result.returncode == 0 and "error" not in result.stdout.lower()

def get_jtbds_by_pattern(pattern):
    """Get JTBDs by exact pattern"""
    result = subprocess.run([
        "curl", "-s",
        f"{URL}/rest/v1/jtbd?select=id,code,name,functional_area&code=like.{pattern}*&limit=50",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}"
    ], capture_output=True, text=True)
    
    if result.returncode == 0 and result.stdout:
        try:
            return json.loads(result.stdout)
        except:
            return []
    return []

def main():
    print("=== Creating Enterprise Ontology for ALL New JTBDs ===\n")
    
    # Get JTBDs by each pattern
    patterns = ["JTBD-MA-ALT-", "JTBD-MKA-", "JTBD-COM-", "JTBD-REG-", "JTBD-XF-"]
    all_jtbds = []
    
    for pat in patterns:
        jtbds = get_jtbds_by_pattern(pat)
        print(f"  {pat}*: {len(jtbds)} found")
        all_jtbds.extend(jtbds)
    
    print(f"\nTotal: {len(all_jtbds)} JTBDs to enrich\n")
    
    kpi_count = 0
    pain_count = 0
    outcome_count = 0
    ai_count = 0
    func_map_count = 0
    
    for jtbd in all_jtbds:
        jtbd_id = jtbd["id"]
        code = jtbd["code"]
        area = jtbd.get("functional_area", "Cross-Functional")
        
        # KPIs
        if post_data("jtbd_kpis", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "kpi_code": f"KPI-{code}-01", "kpi_name": "Time to Completion",
            "kpi_description": "Average time from initiation to completion",
            "target_value": 100, "current_value": 65, "priority": "high",
            "sequence_order": 1, "is_primary": True
        }): kpi_count += 1
        
        if post_data("jtbd_kpis", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "kpi_code": f"KPI-{code}-02", "kpi_name": "Quality Score",
            "kpi_description": "Quality rating based on stakeholder feedback",
            "target_value": 4.5, "current_value": 3.8, "priority": "high",
            "sequence_order": 2, "is_primary": False
        }): kpi_count += 1
        
        # Pain Points
        if post_data("jtbd_pain_points", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "issue": "Manual processes consume excessive time",
            "severity": "high", "pain_point_type": "process",
            "frequency": "always", "impact_description": "Delays deliverables"
        }): pain_count += 1
        
        # Desired Outcomes
        if post_data("jtbd_desired_outcomes", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "outcome": "Reduce time spent by 50% through AI assistance",
            "importance": 9, "outcome_type": "speed",
            "current_satisfaction": 4, "sequence_order": 1
        }): outcome_count += 1
        
        if post_data("jtbd_desired_outcomes", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "outcome": "Improve accuracy and consistency of outputs",
            "importance": 8, "outcome_type": "quality",
            "current_satisfaction": 5, "sequence_order": 2
        }): outcome_count += 1
        
        # AI Suitability
        if post_data("jtbd_ai_suitability", {
            "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
            "rag_suitability": 0.85, "summary_suitability": 0.90,
            "generation_suitability": 0.75, "reasoning_suitability": 0.80,
            "automation_suitability": 0.65, "overall_ai_score": 0.79,
            "recommended_intervention": "augmentation",
            "assessment_notes": "AI can significantly augment human decision-making"
        }): ai_count += 1
        
        # Function Mapping
        func_id = FUNCTION_IDS.get(area)
        if func_id:
            if post_data("jtbd_functions", {
                "jtbd_id": jtbd_id, "function_id": func_id,
                "function_name": area, "relevance_score": 0.95
            }): func_map_count += 1
        
        print(f"  ✓ {code}")
    
    print(f"\n=== Summary ===")
    print(f"KPIs created: {kpi_count}")
    print(f"Pain Points created: {pain_count}")
    print(f"Desired Outcomes created: {outcome_count}")
    print(f"AI Suitability created: {ai_count}")
    print(f"Function Mappings created: {func_map_count}")

if __name__ == "__main__":
    main()
