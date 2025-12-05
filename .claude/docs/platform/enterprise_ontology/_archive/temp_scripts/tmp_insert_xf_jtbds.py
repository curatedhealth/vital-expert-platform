#!/usr/bin/env python3
import json
import subprocess

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Cross-Functional JTBDs from JSON file
XF_JTBDS = [
    {
        "code": "JTBD-XF-001",
        "name": "Execute Integrated Product Launch",
        "description": "When launching a new product, I want to coordinate across Medical, Commercial, Market Access, and Regulatory teams so that we achieve a synchronized, successful launch.",
        "category": "Launch Excellence"
    },
    {
        "code": "JTBD-XF-002",
        "name": "Develop Integrated Evidence Plan",
        "description": "When planning evidence generation, I want to align Medical, HEOR, and Commercial needs so that studies deliver maximum value across stakeholders.",
        "category": "Evidence Strategy"
    },
    {
        "code": "JTBD-XF-003",
        "name": "Manage Lifecycle and Portfolio Strategy",
        "description": "When optimizing product portfolio, I want to align lifecycle strategies across functions so that we maximize long-term value.",
        "category": "Portfolio Strategy"
    },
    {
        "code": "JTBD-XF-004",
        "name": "Respond to Competitive Threats",
        "description": "When competitors launch new products, I want to coordinate a cross-functional response so that we protect market share and patient access.",
        "category": "Competitive Strategy"
    },
    {
        "code": "JTBD-XF-005",
        "name": "Prepare for Advisory Committee Meetings",
        "description": "When facing regulatory advisory committees, I want to prepare comprehensive presentations and responses so that we achieve favorable recommendations.",
        "category": "Regulatory Strategy"
    }
]

def insert_jtbd(jtbd):
    data = {
        "tenant_id": TENANT_ID,
        "code": jtbd["code"],
        "name": jtbd["name"],
        "description": jtbd["description"],
        "functional_area": "Cross-Functional",
        "job_category": "strategic",
        "complexity": "high",
        "frequency": "quarterly",
        "status": "active",
        "validation_score": 0.92,
        "jtbd_type": "strategic",
        "work_pattern": "mixed",
        "strategic_priority": "high",
        "impact_level": "high",
        "compliance_sensitivity": "high",
        "recommended_service_layer": "L2_panel"
    }
    
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"{URL}/rest/v1/jtbd",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=representation",
        "-d", json.dumps(data)
    ], capture_output=True, text=True)
    
    if result.returncode == 0 and "error" not in result.stdout.lower():
        try:
            response = json.loads(result.stdout)
            if response:
                return response[0].get("id") if isinstance(response, list) else response.get("id")
        except:
            pass
        print(f"  ✓ {jtbd['code']}")
        return None
    else:
        print(f"  ✗ {jtbd['code']}: {result.stdout[:80] if result.stdout else 'no response'}")
        return None

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

def get_jtbd_id(code):
    """Get JTBD ID by code"""
    result = subprocess.run([
        "curl", "-s",
        f"{URL}/rest/v1/jtbd?select=id&code=eq.{code}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}"
    ], capture_output=True, text=True)
    
    if result.returncode == 0 and result.stdout:
        try:
            data = json.loads(result.stdout)
            if data:
                return data[0].get("id")
        except:
            pass
    return None

def main():
    print("=== Inserting Cross-Functional JTBDs ===\n")
    
    for jtbd in XF_JTBDS:
        # Check if already exists
        existing_id = get_jtbd_id(jtbd["code"])
        if existing_id:
            print(f"  → {jtbd['code']} already exists (ID: {existing_id[:8]}...)")
            jtbd_id = existing_id
        else:
            jtbd_id = insert_jtbd(jtbd)
            if not jtbd_id:
                # Try to get ID after insert
                jtbd_id = get_jtbd_id(jtbd["code"])
        
        if jtbd_id:
            # Create ontology for this JTBD
            code = jtbd["code"]
            
            post_data("jtbd_kpis", {
                "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
                "kpi_code": f"KPI-{code}-01", "kpi_name": "Time to Completion",
                "kpi_description": "Average time from initiation to completion",
                "target_value": 100, "current_value": 65, "priority": "high",
                "sequence_order": 1, "is_primary": True
            })
            
            post_data("jtbd_kpis", {
                "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
                "kpi_code": f"KPI-{code}-02", "kpi_name": "Cross-Functional Alignment",
                "kpi_description": "Degree of alignment across functions",
                "target_value": 90, "current_value": 70, "priority": "high",
                "sequence_order": 2, "is_primary": False
            })
            
            post_data("jtbd_pain_points", {
                "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
                "issue": "Siloed functions cause delays and misalignment",
                "severity": "high", "pain_point_type": "process",
                "frequency": "always", "impact_description": "Reduces launch effectiveness"
            })
            
            post_data("jtbd_desired_outcomes", {
                "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
                "outcome": "Achieve cross-functional synchronization",
                "importance": 10, "outcome_type": "quality",
                "current_satisfaction": 4, "sequence_order": 1
            })
            
            post_data("jtbd_ai_suitability", {
                "jtbd_id": jtbd_id, "tenant_id": TENANT_ID,
                "rag_suitability": 0.88, "summary_suitability": 0.92,
                "generation_suitability": 0.80, "reasoning_suitability": 0.85,
                "automation_suitability": 0.60, "overall_ai_score": 0.81,
                "recommended_intervention": "augmentation",
                "assessment_notes": "AI excels at coordinating multi-team activities"
            })
            
            print(f"    → Ontology created for {code}")
    
    print("\n=== Done ===")

if __name__ == "__main__":
    main()
