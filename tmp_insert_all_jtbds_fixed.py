#!/usr/bin/env python3
import json
import subprocess

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

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

FUNCTION_MAPPING = {
    "Medical Affairs": "Medical Affairs",
    "Market Access": "Market Access",
    "Commercial Organization": "Commercial",
    "Regulatory Affairs": "Regulatory",
    "Cross-Functional": "Cross-Functional"
}

def insert_jtbd(jtbd):
    """Insert a JTBD via REST API"""
    code = jtbd["code"]
    function = jtbd["function"]
    category = jtbd.get("category", "operational")
    
    job_category = CATEGORY_MAPPING.get(category, "operational")
    func_area = FUNCTION_MAPPING.get(function, function)
    
    # Use cross_functional_roles count for complexity
    cross_roles = len(jtbd.get("cross_functional_roles", []))
    complexity = "high" if cross_roles > 2 else "medium"
    
    # For MA codes 001-010, use ALT prefix to avoid conflict
    new_code = code
    if code.startswith("JTBD-MA-") and len(code.split("-")) == 3:
        num = code.split("-")[-1]
        if num.isdigit() and int(num) <= 10:
            new_code = f"JTBD-MA-ALT-{num}"
    
    # Use valid enum values: strategic_priority uses "high" or "standard" (not "medium")
    strategic_priority = "high" if "strategy" in category.lower() or "launch" in category.lower() else "standard"
    
    data = {
        "tenant_id": TENANT_ID,
        "code": new_code,
        "name": jtbd["name"],
        "description": jtbd["description"],
        "functional_area": func_area,
        "job_category": job_category,
        "complexity": complexity,
        "frequency": "weekly",
        "status": "active",
        "validation_score": 0.88,
        "jtbd_type": "strategic" if "strategy" in category.lower() else "operational",
        "work_pattern": "mixed",
        "strategic_priority": strategic_priority,
        "impact_level": "high" if cross_roles > 2 else "medium",
        "compliance_sensitivity": "high" if "compliance" in category.lower() or "regulatory" in function.lower() else "medium",
        "recommended_service_layer": "L2_panel" if cross_roles > 2 else "L1_expert"
    }
    
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"{URL}/rest/v1/jtbd",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates",
        "-d", json.dumps(data)
    ], capture_output=True, text=True)
    
    if result.returncode == 0 and ("error" not in result.stdout.lower() or result.stdout == ""):
        print(f"  ✓ {new_code}")
        return True
    else:
        print(f"  ✗ {new_code}: {result.stdout[:80] if result.stdout else 'no response'}")
        return False

def main():
    # Load JSON file
    with open("/Users/hichamnaim/Downloads/PHARMA_JTBD_ALL_FUNCTIONS_CROSS_MAPPED.json") as f:
        data = json.load(f)
    
    jtbds = data["jtbds"]
    print(f"=== Inserting {len(jtbds)} JTBDs (FIXED) ===\n")
    
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
