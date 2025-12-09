#!/usr/bin/env python3
"""
Insert Commercial Organization data:
- 6 new departments from Part 2 JSON
- 58 roles (from SQL seed patterns + JSON)
- 194 personas from Personas JSON
"""
import json
import subprocess
import uuid
from datetime import datetime

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"
COMMERCIAL_FUNCTION_ID = "57170e7f-6969-447c-ba2d-bdada970db8b"

# All 11 Commercial departments (5 existing in Part 1 + 6 new in Part 2)
ALL_DEPARTMENTS = [
    # Part 1 departments (implied from SQL seed)
    {"name": "Commercial Leadership & Strategy", "slug": "commercial-leadership", "description": "Executive leadership and strategic planning for commercial operations"},
    {"name": "Commercial Operations", "slug": "commercial-operations", "description": "Sales operations, analytics, and commercial effectiveness"},
    {"name": "Field Sales Operations", "slug": "field-sales-operations", "description": "Territory management, field force deployment, and sales execution"},
    {"name": "Key Account Management", "slug": "key-account-management", "description": "Strategic account partnerships with IDNs, GPOs, and health systems"},
    {"name": "Specialty & Hospital Sales", "slug": "specialty-hospital-sales", "description": "Specialty pharmacy and hospital channel engagement"},
    # Part 2 new departments
    {"name": "Commercial Marketing", "slug": "commercial-marketing", "description": "Brand strategy, product marketing, digital engagement, and campaign execution"},
    {"name": "Business Development & Licensing", "slug": "business-development-licensing", "description": "M&A, licensing, partnerships, and competitive intelligence"},
    {"name": "Commercial Analytics & Insights", "slug": "commercial-analytics-insights", "description": "Sales forecasting, targeting, performance analytics, and business intelligence"},
    {"name": "Sales Training & Enablement", "slug": "sales-training-enablement", "description": "Product training, field enablement, compliance certification"},
    {"name": "Digital & Omnichannel Engagement", "slug": "digital-omnichannel-engagement", "description": "Omnichannel strategy, digital campaigns, remote sales, customer experience"},
    {"name": "Compliance & Commercial Operations", "slug": "compliance-commercial-ops", "description": "Promotional review, transparency reporting, commercial compliance oversight"},
]

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
            if result.stdout and "error" in result.stdout.lower() and '"code"' in result.stdout.lower():
                return None
            response = json.loads(result.stdout) if result.stdout.strip() else {}
            if isinstance(response, list) and response:
                return response[0]
            return response
        except:
            pass
    return None

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

def get_existing_departments():
    """Get existing department slugs"""
    data = api_get("org_departments?select=slug&limit=500")
    return set(d.get("slug", "") for d in data if d.get("slug"))

def get_existing_roles():
    """Get existing role slugs"""
    data = api_get("org_roles?select=slug&limit=500")
    return set(d.get("slug", "") for d in data if d.get("slug"))

def get_existing_personas():
    """Get existing persona slugs/unique_ids"""
    data = api_get("personas?select=unique_id&limit=500")
    return set(d.get("unique_id", "") for d in data if d.get("unique_id"))

def insert_departments():
    """Insert Commercial departments"""
    print("=" * 60)
    print("INSERTING COMMERCIAL DEPARTMENTS")
    print("=" * 60)

    existing = get_existing_departments()
    print(f"Existing departments: {len(existing)}")

    inserted = 0
    for dept in ALL_DEPARTMENTS:
        if dept["slug"] in existing:
            print(f"  → {dept['name']} (already exists)")
            continue

        data = {
            "name": dept["name"],
            "slug": dept["slug"],
            "description": dept["description"],
            "function_id": COMMERCIAL_FUNCTION_ID,
            "tenant_id": TENANT_ID,
            "operating_model": "centralized",
            "field_vs_office_mix": 50
        }

        result = api_post("org_departments", data)
        if result and "id" in result:
            print(f"  ✓ {dept['name']} (ID: {result['id'][:8]}...)")
            inserted += 1
        else:
            print(f"  ✗ {dept['name']} - FAILED")

    print(f"\nDepartments inserted: {inserted}")
    return inserted

def get_department_id_map():
    """Get mapping of department slug to ID"""
    data = api_get(f"org_departments?function_id=eq.{COMMERCIAL_FUNCTION_ID}&select=id,slug,name")
    return {d["slug"]: d["id"] for d in data if d.get("slug")}

def insert_roles_from_json():
    """Insert roles from Part 2 JSON"""
    print("\n" + "=" * 60)
    print("INSERTING COMMERCIAL ROLES FROM JSON")
    print("=" * 60)

    # Load Part 2 JSON
    with open('/Users/hichamnaim/Downloads/COMMERCIAL_ORGANIZATION_ROLES_PART2_NORMALIZED.json', 'r') as f:
        json_data = json.load(f)

    roles = json_data.get("roles", [])
    print(f"Roles in Part 2 JSON: {len(roles)}")

    existing = get_existing_roles()
    dept_map = get_department_id_map()

    # Slugify department names
    dept_slug_map = {
        "Commercial Marketing": "commercial-marketing",
        "Business Development & Licensing": "business-development-licensing",
        "Commercial Analytics & Insights": "commercial-analytics-insights",
        "Sales Training & Enablement": "sales-training-enablement",
        "Digital & Omnichannel Engagement": "digital-omnichannel-engagement",
        "Compliance & Commercial Operations": "compliance-commercial-ops",
        "Commercial Leadership & Strategy": "commercial-leadership",
        "Commercial Operations": "commercial-operations",
        "Field Sales Operations": "field-sales-operations",
        "Key Account Management": "key-account-management",
        "Specialty & Hospital Sales": "specialty-hospital-sales"
    }

    inserted = 0
    for role in roles:
        core = role.get("core_info", {})
        slug = core.get("slug", "")

        if slug in existing:
            print(f"  → {core.get('name', 'Unknown')} (already exists)")
            continue

        # Get department ID
        dept_name = role.get("department", "")
        dept_slug = dept_slug_map.get(dept_name, "")
        dept_id = dept_map.get(dept_slug)

        if not dept_id:
            print(f"  ! Skipping {core.get('name')} - no department found for '{dept_name}'")
            continue

        # Map seniority_level
        seniority = core.get("seniority_level", "mid")
        if seniority not in ["entry", "mid", "senior", "executive", "c-suite"]:
            seniority = "senior" if "senior" in seniority.lower() else "mid"

        team = role.get("team_structure", {})
        experience = role.get("experience_requirements", {})
        budget = role.get("budget_authority", {})
        travel = role.get("travel_requirements", {})

        data = {
            "name": core.get("name", ""),
            "slug": slug,
            "description": core.get("description", ""),
            "function_id": COMMERCIAL_FUNCTION_ID,
            "department_id": dept_id,
            "tenant_id": TENANT_ID,
            "seniority_level": seniority,
            "leadership_level": core.get("leadership_level", "individual_contributor"),
            "reports_to_role_id": None,
            "geographic_scope": role.get("geographic_scope", {}).get("scope_type", "national"),
            "team_size_min": team.get("team_size_min", 1),
            "team_size_max": team.get("team_size_max", 10),
            "direct_reports_min": team.get("direct_reports_min", 0),
            "direct_reports_max": team.get("direct_reports_max", 5),
            "travel_percentage_min": travel.get("travel_percentage_min", 10),
            "travel_percentage_max": travel.get("travel_percentage_max", 30),
            "budget_min_usd": budget.get("budget_min_usd", 0),
            "budget_max_usd": budget.get("budget_max_usd", 100000),
            "years_experience_min": experience.get("years_total_min", 3),
            "years_experience_max": experience.get("years_total_max", 10),
        }

        result = api_post("org_roles", data)
        if result and "id" in result:
            print(f"  ✓ {core.get('name')} (ID: {result['id'][:8]}...)")
            inserted += 1
        else:
            print(f"  ✗ {core.get('name')} - FAILED")

    print(f"\nRoles inserted from JSON: {inserted}")
    return inserted

def insert_basic_roles():
    """Insert basic Commercial roles for Part 1 (skeletal from SQL patterns)"""
    print("\n" + "=" * 60)
    print("INSERTING COMMERCIAL ROLES (BASIC - FROM SQL PATTERNS)")
    print("=" * 60)

    dept_map = get_department_id_map()
    existing = get_existing_roles()

    # Basic roles from Part 1 SQL patterns (roles 1-29)
    basic_roles = [
        {"name": "Chief Commercial Officer", "slug": "commercial-chief-commercial-officer", "dept": "commercial-leadership", "seniority": "c-suite"},
        {"name": "Senior Vice President, Commercial Operations", "slug": "commercial-svp-commercial-operations", "dept": "commercial-operations", "seniority": "executive"},
        {"name": "Vice President, Field Sales", "slug": "commercial-vp-field-sales", "dept": "field-sales-operations", "seniority": "executive"},
        {"name": "Vice President, Key Account Management", "slug": "commercial-vp-key-accounts", "dept": "key-account-management", "seniority": "executive"},
        {"name": "Vice President, Specialty Sales", "slug": "commercial-vp-specialty-sales", "dept": "specialty-hospital-sales", "seniority": "executive"},
        {"name": "Executive Director, National Accounts", "slug": "commercial-ed-national-accounts", "dept": "key-account-management", "seniority": "senior"},
        {"name": "Executive Director, Hospital Sales", "slug": "commercial-ed-hospital-sales", "dept": "specialty-hospital-sales", "seniority": "senior"},
        {"name": "Director, Sales Analytics", "slug": "commercial-dir-sales-analytics", "dept": "commercial-operations", "seniority": "senior"},
        {"name": "Director, Incentive Compensation", "slug": "commercial-dir-incentive-comp", "dept": "commercial-operations", "seniority": "senior"},
        {"name": "Director, Commercial Excellence", "slug": "commercial-dir-excellence", "dept": "commercial-operations", "seniority": "senior"},
        {"name": "Regional Sales Director, Northeast", "slug": "commercial-rsd-northeast", "dept": "field-sales-operations", "seniority": "senior"},
        {"name": "Regional Sales Director, Southeast", "slug": "commercial-rsd-southeast", "dept": "field-sales-operations", "seniority": "senior"},
        {"name": "Regional Sales Director, Central", "slug": "commercial-rsd-central", "dept": "field-sales-operations", "seniority": "senior"},
        {"name": "Regional Sales Director, West", "slug": "commercial-rsd-west", "dept": "field-sales-operations", "seniority": "senior"},
        {"name": "District Sales Manager", "slug": "commercial-dsm", "dept": "field-sales-operations", "seniority": "mid"},
        {"name": "Territory Sales Manager", "slug": "commercial-tsm", "dept": "field-sales-operations", "seniority": "mid"},
        {"name": "Senior Account Executive, IDN", "slug": "commercial-sae-idn", "dept": "key-account-management", "seniority": "mid"},
        {"name": "Account Executive, GPO", "slug": "commercial-ae-gpo", "dept": "key-account-management", "seniority": "mid"},
        {"name": "Hospital Account Manager", "slug": "commercial-ham", "dept": "specialty-hospital-sales", "seniority": "mid"},
        {"name": "Specialty Account Manager", "slug": "commercial-sam", "dept": "specialty-hospital-sales", "seniority": "mid"},
        {"name": "Sales Operations Analyst", "slug": "commercial-sales-ops-analyst", "dept": "commercial-operations", "seniority": "entry"},
        {"name": "CRM Administrator", "slug": "commercial-crm-admin", "dept": "commercial-operations", "seniority": "mid"},
        {"name": "Sales Data Analyst", "slug": "commercial-sales-data-analyst", "dept": "commercial-operations", "seniority": "mid"},
        {"name": "Territory Alignment Specialist", "slug": "commercial-territory-specialist", "dept": "commercial-operations", "seniority": "mid"},
        {"name": "Field Force Effectiveness Manager", "slug": "commercial-ffe-manager", "dept": "commercial-operations", "seniority": "senior"},
        {"name": "Pharmaceutical Sales Representative", "slug": "commercial-pharma-rep", "dept": "field-sales-operations", "seniority": "entry"},
        {"name": "Senior Sales Representative", "slug": "commercial-senior-rep", "dept": "field-sales-operations", "seniority": "mid"},
        {"name": "Specialty Sales Representative", "slug": "commercial-specialty-rep", "dept": "specialty-hospital-sales", "seniority": "mid"},
        {"name": "Oncology Account Specialist", "slug": "commercial-onco-specialist", "dept": "specialty-hospital-sales", "seniority": "mid"},
    ]

    inserted = 0
    for role in basic_roles:
        if role["slug"] in existing:
            print(f"  → {role['name']} (already exists)")
            continue

        dept_id = dept_map.get(role["dept"])
        if not dept_id:
            print(f"  ! Skipping {role['name']} - no department '{role['dept']}'")
            continue

        data = {
            "name": role["name"],
            "slug": role["slug"],
            "description": f"{role['name']} in Commercial Organization",
            "function_id": COMMERCIAL_FUNCTION_ID,
            "department_id": dept_id,
            "tenant_id": TENANT_ID,
            "seniority_level": role["seniority"],
            "leadership_level": "individual_contributor" if role["seniority"] in ["entry", "mid"] else "manager",
            "geographic_scope": "national",
        }

        result = api_post("org_roles", data)
        if result and "id" in result:
            print(f"  ✓ {role['name']} (ID: {result['id'][:8]}...)")
            inserted += 1
        else:
            print(f"  ✗ {role['name']} - FAILED")

    print(f"\nBasic roles inserted: {inserted}")
    return inserted

def get_role_id_map():
    """Get mapping of role slug to ID"""
    data = api_get(f"org_roles?function_id=eq.{COMMERCIAL_FUNCTION_ID}&select=id,slug,name")
    return {d["slug"]: d["id"] for d in data if d.get("slug")}

def insert_personas():
    """Insert Commercial personas from JSON"""
    print("\n" + "=" * 60)
    print("INSERTING COMMERCIAL PERSONAS")
    print("=" * 60)

    # Load personas JSON
    with open('/Users/hichamnaim/Downloads/COMMERCIAL_ORG_224_PERSONAS_3_5_PER_ROLE (1).json', 'r') as f:
        json_data = json.load(f)

    personas = json_data.get("personas", [])
    print(f"Personas in JSON: {len(personas)}")

    existing = get_existing_personas()
    role_map = get_role_id_map()

    inserted = 0
    for i, persona in enumerate(personas, 1):
        name = persona.get("name", "")
        slug = persona.get("slug", "")
        unique_id = f"PERSONA-COM-{i:03d}"

        if unique_id in existing:
            print(f"  → {name} (already exists)")
            continue

        core = persona.get("core_profile", {})
        prof = persona.get("professional_context", {})
        exp = persona.get("experience", {})
        work = persona.get("work_context", {})

        # Map department to function_area
        dept = core.get("department", "Commercial")

        data = {
            "unique_id": unique_id,
            "persona_name": name,
            "persona_type": "Role-based",
            "title": persona.get("title", ""),
            "description": f"{persona.get('title', '')} persona for Commercial Organization",
            "department": dept,
            "function_area": "Commercial",
            "geographic_scope": "national",
            "age_range": core.get("age_range", "30-45"),
            "experience_level": core.get("seniority_level", "mid").title(),
            "education_level": core.get("education_level", "Bachelor's"),
            "tenant_id": TENANT_ID,
            "is_active": True,
            "goals": [g.get("goal", "") for g in persona.get("goals", [])[:4]],
            "challenges": [c.get("challenge", "") for c in persona.get("challenges", [])[:4]],
            "motivations": ["Commercial excellence", "Revenue growth", "Customer relationships"],
            "frustrations": [p.get("pain", "") for p in persona.get("pain_points", [])[:3]],
            "tools_used": [{"tool": t.get("tool", ""), "proficiency": t.get("proficiency", "Intermediate")} for t in persona.get("tools", [])[:5]],
            "daily_activities": [{"activity": r.get("task", ""), "percent": r.get("allocation", 20)} for r in persona.get("responsibilities", [])[:5]],
            "sample_quotes": [q.get("quote", "") for q in persona.get("quotes", [])[:3]],
            "data_quality_score": 0.85,
            "created_by": "Commercial Org Import"
        }

        result = api_post("personas", data)
        if result and "id" in result:
            if i % 20 == 0:
                print(f"  ... progress: {i}/{len(personas)} ({100*i//len(personas)}%)")
            inserted += 1
        else:
            print(f"  ✗ {name} - FAILED")

        # Rate limiting
        if i % 50 == 0:
            import time
            time.sleep(1)

    print(f"\nPersonas inserted: {inserted}")
    return inserted

def main():
    print("=" * 60)
    print("COMMERCIAL ORGANIZATION DATA IMPORT")
    print("=" * 60)
    print(f"Target Function ID: {COMMERCIAL_FUNCTION_ID}")
    print(f"Tenant ID: {TENANT_ID}")
    print()

    # Step 1: Insert departments
    dept_count = insert_departments()

    # Step 2: Insert basic roles from Part 1 patterns
    basic_role_count = insert_basic_roles()

    # Step 3: Insert roles from Part 2 JSON
    json_role_count = insert_roles_from_json()

    # Step 4: Insert personas
    persona_count = insert_personas()

    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    print(f"Departments inserted: {dept_count}")
    print(f"Basic roles inserted: {basic_role_count}")
    print(f"JSON roles inserted: {json_role_count}")
    print(f"Personas inserted: {persona_count}")

if __name__ == "__main__":
    main()
