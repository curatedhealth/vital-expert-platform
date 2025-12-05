#!/usr/bin/env python3
import json
import subprocess
import urllib.parse

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Function mapping
FUNCTION_MAPPING = {
    "Medical Affairs": {"id": "06127088-4d52-40aa-88c9-93f4e79e085a", "area": "Medical Affairs"},
    "Market Access": {"id": "b7fed05f-90b2-4c4a-a7a8-8346a3159127", "area": "Market Access"},
    "Commercial Organization": {"id": "b718e2d1-40c4-478c-9bbb-695b931ce1bb", "area": "Commercial"},
    "Regulatory Affairs": {"id": None, "area": "Regulatory"},  # May need to look up
    "Cross-Functional": {"id": None, "area": "Cross-Functional"}
}

# Category to job_category mapping (valid enum values)
CATEGORY_MAPPING = {
    "Medical Information": "operational",
    "Scientific Intelligence": "analytical",
    "Scientific Engagement": "collaborative",
    "Evidence Generation": "technical",
    "Medical Education": "creative",
    "Launch Excellence": "strategic",
    "Publications": "creative",
    "Cross-Functional Support": "collaborative",
    "Regulatory Support": "operational",
    "Training & Development": "operational",
    "Value & Evidence": "analytical",
    "Pricing & Reimbursement": "strategic",
    "Payer Relations": "collaborative",
    "HTA & Evidence": "analytical",
    "Health Economics": "analytical",
    "Patient Access": "operational",
    "Policy & Government Affairs": "strategic",
    "Trade & Distribution": "operational",
    "Marketing Strategy": "strategic",
    "Sales Operations": "operational",
    "Key Account Management": "collaborative",
    "Digital Engagement": "technical",
    "Customer Experience": "collaborative",
    "Analytics & Insights": "analytical",
    "Sales Enablement": "operational",
    "Compliance": "operational",
    "Business Development": "strategic",
    "Regulatory Strategy": "strategic",
    "Submissions": "operational",
    "CMC Regulatory": "technical",
    "Regulatory Intelligence": "analytical",
    "Labeling": "operational",
    "Health Authority Relations": "collaborative",
    "Post-Marketing": "operational",
    "Systems & Operations": "administrative",
    "Global Expansion": "strategic",
    "Evidence Strategy": "strategic",
    "Portfolio Strategy": "strategic",
    "Competitive Strategy": "strategic"
}

def insert_jtbd(jtbd):
    """Insert a JTBD via REST API"""
    code = jtbd["code"]
    function = jtbd["function"]
    category = jtbd.get("category", "operational")
    
    # Map to valid enum values
    job_category = CATEGORY_MAPPING.get(category, "operational")
    func_info = FUNCTION_MAPPING.get(function, {"area": function})
    
    # Determine complexity based on cross-functional involvement
    cross_roles = len(jtbd.get("cross_functional_roles", []))
    complexity = "high" if cross_roles > 2 else "medium"
    
    # Build JTBD data - using NEW code pattern to avoid conflicts
    new_code = code  # Keep original code for MKA, COM, REG, XF
    if code.startswith("JTBD-MA-") and int(code.split("-")[-1]) <= 10:
        # For MA codes 001-010, use ALT prefix to avoid conflict with existing
        new_code = f"JTBD-MA-ALT-{code.split('-')[-1]}"
    
    data = {
        "tenant_id": TENANT_ID,
        "code": new_code,
        "name": jtbd["name"],
        "description": jtbd["description"],
        "functional_area": func_info["area"],
        "job_category": job_category,
        "complexity": complexity,
        "frequency": "weekly",
        "status": "active",
        "validation_score": 0.88,
        "jtbd_type": "strategic" if "strategy" in category.lower() or "launch" in category.lower() else "operational",
        "work_pattern": "mixed",
        "strategic_priority": "high" if "strategy" in category.lower() or "launch" in category.lower() else "medium",
        "impact_level": "high" if cross_roles > 2 else "medium",
        "compliance_sensitivity": "high" if "compliance" in category.lower() or "regulatory" in function.lower() else "medium",
        "recommended_service_layer": "L2_panel" if cross_roles > 2 else "L1_expert"
    }
    
    # Prepare curl command
    json_data = json.dumps(data)
    
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"{URL}/rest/v1/jtbd",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates",
        "-d", json_data
    ], capture_output=True, text=True)
    
    if result.returncode == 0 and ("error" not in result.stdout.lower() or result.stdout == ""):
        print(f"  ✓ {new_code}: {jtbd['name'][:50]}...")
        return True
    else:
        print(f"  ✗ {new_code}: {result.stdout[:100] if result.stdout else result.stderr[:100]}")
        return False

def main():
    # Load JSON file
    with open("/Users/hichamnaim/Downloads/PHARMA_JTBD_ALL_FUNCTIONS_CROSS_MAPPED.json") as f:
        data = json.load(f)
    
    jtbds = data["jtbds"]
    print(f"=== Inserting {len(jtbds)} JTBDs from Cross-Mapped JSON ===\n")
    
    # Group by function
    by_function = {}
    for jtbd in jtbds:
        func = jtbd["function"]
        if func not in by_function:
            by_function[func] = []
        by_function[func].append(jtbd)
    
    success = 0
    failed = 0
    
    for func, func_jtbds in by_function.items():
        print(f"\n--- {func} ({len(func_jtbds)} JTBDs) ---")
        for jtbd in func_jtbds:
            if insert_jtbd(jtbd):
                success += 1
            else:
                failed += 1
    
    print(f"\n=== Summary ===")
    print(f"Inserted: {success}")
    print(f"Failed: {failed}")
    print(f"Total: {len(jtbds)}")

if __name__ == "__main__":
    main()
