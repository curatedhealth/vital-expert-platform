#!/usr/bin/env python3
"""
Insert Commercial Organization roles using correct enum values.
"""
import json
import subprocess

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"
COMMERCIAL_FUNCTION_ID = "57170e7f-6969-447c-ba2d-bdada970db8b"

# Department ID mapping (from database)
DEPT_IDS = {
    "commercial-leadership": "942f1644-891e-40ae-bcf4-d3dc2ff46931",
    "commercial-operations": "5f344855-6924-426b-9d4b-a78d529f4f42",
    "compliance-commercial-ops": "488b99be-cf04-4063-ac6e-ae70f0de9860",
    "field-sales-operations": "0f3c12f6-f321-4b0a-b2b1-d50efc069ddb",
    "specialty-hospital-sales": "234b2599-5328-4b9c-9998-7e5ba677f054",
    "key-account-management": "f19dce60-34dc-4f6f-97e1-8732fddc9e2a",
    "customer-experience": "4fc2b9c2-c1ed-4c55-86d3-734ccb9be54f",
    "commercial-marketing": "21b1d35f-0cdc-446c-ab0d-52de003cc969",
    "business-development-licensing": "59f93463-0713-4d90-b742-f29123975c79",
    "commercial-analytics-insights": "5c988d6b-4a6f-41ff-bbfa-fd2a98d4beda",
    "sales-training-enablement": "f8e5f539-04c0-45e6-8b82-e55aa012a2e5",
    "digital-omnichannel-engagement": "86b8a7be-f794-4362-8518-d857e5509d1e",
}

def api_post(endpoint, data):
    """POST request to Supabase REST API"""
    result = subprocess.run([
        "curl", "-s", "-X", "POST", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=representation",
        "-d", json.dumps(data)
    ], capture_output=True, text=True)

    if result.returncode == 0 and result.stdout:
        if "error" in result.stdout.lower() and '"code"' in result.stdout.lower():
            return None, result.stdout
        try:
            response = json.loads(result.stdout)
            if isinstance(response, list) and response:
                return response[0], None
            return response, None
        except:
            return None, result.stdout
    return None, result.stderr

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

def get_existing_roles():
    """Get existing role slugs"""
    data = api_get("org_roles?select=slug&limit=500")
    return set(d.get("slug", "") for d in data if d.get("slug"))

# 58 Commercial roles (Part 1: 1-29, Part 2: 30-58 but Part 2 only has 17)
# Using roles from both parts with correct structure
# Valid leadership_level values: individual_contributor, executive
COMMERCIAL_ROLES = [
    # Part 1 roles (1-29) - Commercial Leadership & Strategy + Operations
    {"name": "Chief Commercial Officer", "slug": "commercial-cco", "dept": "commercial-leadership", "seniority": "executive", "lead": "executive", "desc": "Executive leader responsible for all commercial operations, including field sales, marketing, business development, and commercial analytics."},
    {"name": "Senior Vice President, Commercial Operations", "slug": "commercial-svp-ops", "dept": "commercial-operations", "seniority": "executive", "lead": "executive", "desc": "Oversees sales operations, commercial analytics, incentive compensation, and CRM platforms."},
    {"name": "Vice President, Field Sales", "slug": "commercial-vp-field-sales", "dept": "field-sales-operations", "seniority": "executive", "lead": "executive", "desc": "Leads national field sales organization and drives revenue growth across territories."},
    {"name": "Vice President, Key Account Management", "slug": "commercial-vp-kam", "dept": "key-account-management", "seniority": "executive", "lead": "executive", "desc": "Manages strategic partnerships with IDNs, GPOs, and health systems."},
    {"name": "Vice President, Specialty Sales", "slug": "commercial-vp-specialty", "dept": "specialty-hospital-sales", "seniority": "executive", "lead": "executive", "desc": "Leads specialty pharmacy and hospital channel engagement strategies."},
    {"name": "Executive Director, National Accounts", "slug": "commercial-ed-national-accounts", "dept": "key-account-management", "seniority": "senior", "lead": "executive", "desc": "Directs national account strategy and major customer relationships."},
    {"name": "Executive Director, Hospital Sales", "slug": "commercial-ed-hospital-sales", "dept": "specialty-hospital-sales", "seniority": "senior", "lead": "executive", "desc": "Directs hospital sales strategy and institutional customer engagement."},
    {"name": "Director, Sales Analytics", "slug": "commercial-dir-sales-analytics", "dept": "commercial-operations", "seniority": "senior", "lead": "executive", "desc": "Leads sales analytics, forecasting, and performance reporting."},
    {"name": "Director, Incentive Compensation", "slug": "commercial-dir-ic", "dept": "commercial-operations", "seniority": "senior", "lead": "executive", "desc": "Designs and administers sales incentive compensation programs."},
    {"name": "Director, Commercial Excellence", "slug": "commercial-dir-excellence", "dept": "commercial-operations", "seniority": "senior", "lead": "executive", "desc": "Drives commercial effectiveness initiatives and best practices."},
    {"name": "Regional Sales Director, Northeast", "slug": "commercial-rsd-northeast", "dept": "field-sales-operations", "seniority": "senior", "lead": "executive", "desc": "Regional sales leadership for Northeast territory."},
    {"name": "Regional Sales Director, Southeast", "slug": "commercial-rsd-southeast", "dept": "field-sales-operations", "seniority": "senior", "lead": "executive", "desc": "Regional sales leadership for Southeast territory."},
    {"name": "Regional Sales Director, Central", "slug": "commercial-rsd-central", "dept": "field-sales-operations", "seniority": "senior", "lead": "executive", "desc": "Regional sales leadership for Central territory."},
    {"name": "Regional Sales Director, West", "slug": "commercial-rsd-west", "dept": "field-sales-operations", "seniority": "senior", "lead": "executive", "desc": "Regional sales leadership for Western territory."},
    {"name": "District Sales Manager", "slug": "commercial-dsm", "dept": "field-sales-operations", "seniority": "mid", "lead": "executive", "desc": "Manages district sales team and territory performance."},
    {"name": "Territory Sales Manager", "slug": "commercial-tsm", "dept": "field-sales-operations", "seniority": "mid", "lead": "executive", "desc": "Manages territory sales operations and representative teams."},
    {"name": "Senior Account Executive, IDN", "slug": "commercial-sae-idn", "dept": "key-account-management", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages strategic IDN account relationships and contracts."},
    {"name": "Account Executive, GPO", "slug": "commercial-ae-gpo", "dept": "key-account-management", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages GPO relationships and contract negotiations."},
    {"name": "Hospital Account Manager", "slug": "commercial-ham", "dept": "specialty-hospital-sales", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages hospital account relationships and formulary access."},
    {"name": "Specialty Account Manager", "slug": "commercial-sam", "dept": "specialty-hospital-sales", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages specialty pharmacy relationships and channel strategy."},
    {"name": "Sales Operations Analyst", "slug": "commercial-sales-ops-analyst", "dept": "commercial-operations", "seniority": "entry", "lead": "individual_contributor", "desc": "Analyzes sales data and supports operational reporting."},
    {"name": "CRM Administrator", "slug": "commercial-crm-admin", "dept": "commercial-operations", "seniority": "mid", "lead": "individual_contributor", "desc": "Administers CRM platform and sales force automation systems."},
    {"name": "Sales Data Analyst", "slug": "commercial-data-analyst", "dept": "commercial-operations", "seniority": "mid", "lead": "individual_contributor", "desc": "Analyzes sales performance data and generates insights."},
    {"name": "Territory Alignment Specialist", "slug": "commercial-territory-specialist", "dept": "commercial-operations", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages territory design and sales force alignment."},
    {"name": "Field Force Effectiveness Manager", "slug": "commercial-ffe-manager", "dept": "commercial-operations", "seniority": "senior", "lead": "executive", "desc": "Drives field force productivity and performance optimization."},
    {"name": "Pharmaceutical Sales Representative", "slug": "commercial-pharma-rep", "dept": "field-sales-operations", "seniority": "entry", "lead": "individual_contributor", "desc": "Promotes pharmaceutical products to healthcare professionals."},
    {"name": "Senior Sales Representative", "slug": "commercial-senior-rep", "dept": "field-sales-operations", "seniority": "mid", "lead": "individual_contributor", "desc": "Senior field representative with expanded territory responsibilities."},
    {"name": "Specialty Sales Representative", "slug": "commercial-specialty-rep", "dept": "specialty-hospital-sales", "seniority": "mid", "lead": "individual_contributor", "desc": "Promotes specialty products to specialists and institutions."},
    {"name": "Oncology Account Specialist", "slug": "commercial-onco-specialist", "dept": "specialty-hospital-sales", "seniority": "mid", "lead": "individual_contributor", "desc": "Oncology-focused account specialist managing cancer center relationships."},

    # Part 2 roles (30-58) - Marketing, BD, Analytics, Training, Digital, Compliance
    {"name": "Vice President, Commercial Marketing", "slug": "commercial-vp-marketing", "dept": "commercial-marketing", "seniority": "executive", "lead": "executive", "desc": "Leads brand strategy, product launches, and integrated marketing campaigns."},
    {"name": "Executive Director, Brand Marketing", "slug": "commercial-ed-brand", "dept": "commercial-marketing", "seniority": "senior", "lead": "executive", "desc": "Directs brand strategy and marketing execution for major product franchises."},
    {"name": "Director, Product Marketing", "slug": "commercial-dir-product-mktg", "dept": "commercial-marketing", "seniority": "senior", "lead": "executive", "desc": "Manages product marketing strategy and go-to-market execution."},
    {"name": "Senior Product Manager", "slug": "commercial-sr-pm", "dept": "commercial-marketing", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages product lifecycle and marketing initiatives."},
    {"name": "Marketing Operations Manager", "slug": "commercial-mktg-ops-mgr", "dept": "commercial-marketing", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages marketing operations, processes, and vendor relationships."},
    {"name": "Digital Marketing Specialist", "slug": "commercial-digital-mktg-spec", "dept": "commercial-marketing", "seniority": "mid", "lead": "individual_contributor", "desc": "Executes digital marketing campaigns and content strategy."},
    {"name": "Senior Vice President, Business Development", "slug": "commercial-svp-bd", "dept": "business-development-licensing", "seniority": "executive", "lead": "executive", "desc": "Leads M&A, licensing, and strategic partnership initiatives."},
    {"name": "Vice President, Corporate Development", "slug": "commercial-vp-corp-dev", "dept": "business-development-licensing", "seniority": "executive", "lead": "executive", "desc": "Drives corporate development strategy and transactions."},
    {"name": "Executive Director, Licensing & Partnerships", "slug": "commercial-ed-licensing", "dept": "business-development-licensing", "seniority": "senior", "lead": "executive", "desc": "Manages licensing agreements and strategic partnerships."},
    {"name": "Director, Business Development", "slug": "commercial-dir-bd", "dept": "business-development-licensing", "seniority": "senior", "lead": "executive", "desc": "Identifies and evaluates business development opportunities."},
    {"name": "Senior Manager, Competitive Intelligence", "slug": "commercial-sr-mgr-ci", "dept": "business-development-licensing", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages competitive intelligence and market analysis."},
    {"name": "Vice President, Commercial Analytics", "slug": "commercial-vp-analytics", "dept": "commercial-analytics-insights", "seniority": "executive", "lead": "executive", "desc": "Leads commercial analytics and business intelligence function."},
    {"name": "Executive Director, Sales Analytics", "slug": "commercial-ed-sales-analytics", "dept": "commercial-analytics-insights", "seniority": "senior", "lead": "executive", "desc": "Directs sales analytics, forecasting, and performance insights."},
    {"name": "Director, Market Intelligence", "slug": "commercial-dir-market-intel", "dept": "commercial-analytics-insights", "seniority": "senior", "lead": "executive", "desc": "Leads market intelligence and competitive analysis."},
    {"name": "Senior Analyst, Commercial Insights", "slug": "commercial-sr-analyst-insights", "dept": "commercial-analytics-insights", "seniority": "mid", "lead": "individual_contributor", "desc": "Analyzes commercial data and generates strategic insights."},
    {"name": "Forecasting Analyst", "slug": "commercial-forecasting-analyst", "dept": "commercial-analytics-insights", "seniority": "mid", "lead": "individual_contributor", "desc": "Develops sales forecasts and demand planning models."},
    {"name": "Business Intelligence Developer", "slug": "commercial-bi-developer", "dept": "commercial-analytics-insights", "seniority": "mid", "lead": "individual_contributor", "desc": "Develops BI dashboards and analytics solutions."},
    {"name": "Vice President, Sales Training & Development", "slug": "commercial-vp-training", "dept": "sales-training-enablement", "seniority": "executive", "lead": "executive", "desc": "Leads sales training, enablement, and development programs."},
    {"name": "Director, Sales Enablement", "slug": "commercial-dir-enablement", "dept": "sales-training-enablement", "seniority": "senior", "lead": "executive", "desc": "Directs sales enablement strategy and content development."},
    {"name": "Senior Training Manager", "slug": "commercial-sr-training-mgr", "dept": "sales-training-enablement", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages sales training programs and curriculum development."},
    {"name": "Product Trainer", "slug": "commercial-product-trainer", "dept": "sales-training-enablement", "seniority": "mid", "lead": "individual_contributor", "desc": "Delivers product and disease state training to field teams."},
    {"name": "Sales Certification Specialist", "slug": "commercial-cert-specialist", "dept": "sales-training-enablement", "seniority": "mid", "lead": "individual_contributor", "desc": "Manages compliance certification programs for sales teams."},
    {"name": "Vice President, Digital Commercial", "slug": "commercial-vp-digital", "dept": "digital-omnichannel-engagement", "seniority": "executive", "lead": "executive", "desc": "Leads digital and omnichannel commercial strategy."},
    {"name": "Director, Omnichannel Strategy", "slug": "commercial-dir-omnichannel", "dept": "digital-omnichannel-engagement", "seniority": "senior", "lead": "executive", "desc": "Directs omnichannel engagement and customer experience strategy."},
    {"name": "Director, Digital Engagement", "slug": "commercial-dir-digital-engage", "dept": "digital-omnichannel-engagement", "seniority": "senior", "lead": "executive", "desc": "Manages digital engagement platforms and remote selling capabilities."},
    {"name": "Senior Manager, Customer Experience", "slug": "commercial-sr-mgr-cx", "dept": "customer-experience", "seniority": "mid", "lead": "individual_contributor", "desc": "Optimizes customer experience across commercial touchpoints."},
    {"name": "Digital Engagement Specialist", "slug": "commercial-digital-engage-spec", "dept": "digital-omnichannel-engagement", "seniority": "mid", "lead": "individual_contributor", "desc": "Executes digital engagement programs and campaigns."},
    {"name": "Remote Engagement Representative", "slug": "commercial-remote-rep", "dept": "digital-omnichannel-engagement", "seniority": "entry", "lead": "individual_contributor", "desc": "Conducts remote sales and engagement with healthcare professionals."},
    {"name": "Vice President, Commercial Compliance", "slug": "commercial-vp-compliance", "dept": "compliance-commercial-ops", "seniority": "executive", "lead": "executive", "desc": "Leads commercial compliance and promotional review operations."},
]

def main():
    print("=" * 60)
    print("INSERTING COMMERCIAL ROLES")
    print("=" * 60)
    print(f"Total roles to insert: {len(COMMERCIAL_ROLES)}")
    print()

    existing = get_existing_roles()
    print(f"Existing roles: {len(existing)}")

    inserted = 0
    failed = 0

    for i, role in enumerate(COMMERCIAL_ROLES, 1):
        if role["slug"] in existing:
            print(f"[{i:2d}/{len(COMMERCIAL_ROLES)}] → {role['name'][:40]} (already exists)")
            continue

        dept_id = DEPT_IDS.get(role["dept"])
        if not dept_id:
            print(f"[{i:2d}/{len(COMMERCIAL_ROLES)}] ! {role['name'][:40]} - no dept '{role['dept']}'")
            failed += 1
            continue

        data = {
            "name": role["name"],
            "slug": role["slug"],
            "description": role["desc"],
            "function_id": COMMERCIAL_FUNCTION_ID,
            "department_id": dept_id,
            "tenant_id": TENANT_ID,
            "seniority_level": role["seniority"],
            "leadership_level": role["lead"],
            "geographic_scope": "regional",  # Valid enum value
        }

        result, err = api_post("org_roles", data)
        if result and "id" in result:
            print(f"[{i:2d}/{len(COMMERCIAL_ROLES)}] ✓ {role['name'][:40]}")
            inserted += 1
        else:
            print(f"[{i:2d}/{len(COMMERCIAL_ROLES)}] ✗ {role['name'][:40]} - {err[:60] if err else 'Unknown error'}")
            failed += 1

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Inserted: {inserted}")
    print(f"Failed: {failed}")
    print(f"Already existed: {len(COMMERCIAL_ROLES) - inserted - failed}")

if __name__ == "__main__":
    main()
