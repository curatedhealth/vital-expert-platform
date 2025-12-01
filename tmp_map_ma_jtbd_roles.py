#!/usr/bin/env python3
"""
Intelligent JTBD-to-Role mapping for Medical Affairs.
Uses domain-based matching for accurate role-JTBD relationships.
"""
import subprocess
import json
import re

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Domain-based JTBD codes for each role category
ROLE_JTBD_MAPPING = {
    # MSL / Field Medical roles
    "msl": {
        "patterns": ["msl", "medical science liaison", "field medical", "field team"],
        "jtbd_codes": [
            "JTBD-MA-FM001",  # KOL Engagement Plan
            "JTBD-MA-003",    # Engage KOLs
            "JTBD-MA-011",    # Build KOL Relationships
            "JTBD-MA-012",    # Document Field Insights
            "JTBD-MA-017",    # Attend Medical Conferences
            "JTBD-38781EC2",  # Engage and Educate KOLs
            "JTBD-E54342F2",  # Plan Territory Coverage
            "JTBD-MA-080",    # Map KOL Networks
            "JTBD-MA-076",    # Analyze MSL Performance
            "JTBD-MA-ALT-003", # Engage KOLs
        ],
        "importance": "critical",
        "frequency": "weekly"
    },

    # HEOR / Health Economics roles
    "heor": {
        "patterns": ["heor", "health economics", "economic", "outcomes research", "rwe", "real-world", "epidemiolog"],
        "jtbd_codes": [
            "JTBD-MA-031",    # Cost-Effectiveness Analysis
            "JTBD-MA-032",    # Budget Impact Analysis
            "JTBD-MA-040",    # Health Economics Models
            "JTBD-MA-034",    # Design RWE Studies
            "JTBD-MA-035",    # Analyze RWE Data
            "JTBD-MA-036",    # Manage Patient Registries
            "JTBD-MA-092",    # Analyze EHR/Claims Data
            "JTBD-MA-077",    # Measure Evidence Generation ROI
            "JTBD-MA-112",    # Value-Based Care
            "JTBD-MA-117",    # Patient-Reported Outcomes
        ],
        "importance": "critical",
        "frequency": "monthly"
    },

    # Publications roles
    "publications": {
        "patterns": ["publication", "medical writer", "manuscript", "scientific communication"],
        "jtbd_codes": [
            "JTBD-MA-025",    # Publications Strategy
            "JTBD-MA-026",    # Develop Manuscripts
            "JTBD-MA-033",    # Literature Reviews
            "JTBD-MA-030",    # Coordinate Authors
            "JTBD-40BF7A72",  # Support Publication Development
            "JTBD-MA-ALT-007", # Manage Publications Strategy
            "JTBD-MA-096",    # Manage Scientific Content
        ],
        "importance": "high",
        "frequency": "monthly"
    },

    # Medical Information roles
    "medical_info": {
        "patterns": ["medical info", "mi ", "information specialist", "information manager"],
        "jtbd_codes": [
            "JTBD-MA-001",    # Respond to MI Inquiries
            "JTBD-MA-ALT-001", # MI Inquiries (alt)
            "JTBD-799236F3",  # Respond to MI Inquiries
            "JTBD-MA-021",    # Standard Response Documents
            "JTBD-MA-023",    # Analyze Inquiry Trends
            "JTBD-MA-024",    # Manage Knowledge Base
            "JTBD-MA-016",    # Respond to HCP Requests
        ],
        "importance": "critical",
        "frequency": "daily"
    },

    # Medical Education roles
    "medical_education": {
        "patterns": ["medical education", "cme", "training", "trainer", "education manager", "education lead"],
        "jtbd_codes": [
            "JTBD-MA-014",    # Support Medical Education
            "JTBD-MA-072",    # Develop CME Programs
            "JTBD-MA-073",    # Evaluate Educational Impact
            "JTBD-MA-074",    # Manage Speaker Bureaus
            "JTBD-MA-ALT-005", # Medical Education Materials
            "JTBD-MA-ALT-010", # Train Field Medical Teams
            "JTBD-MA-047",    # Conduct Training Programs
        ],
        "importance": "high",
        "frequency": "monthly"
    },

    # Medical Affairs Leadership
    "leadership": {
        "patterns": ["vp ", "director", "chief medical", "cmo", "head of", "lead"],
        "jtbd_codes": [
            "JTBD-MA-085",    # Therapeutic Area Strategy
            "JTBD-MA-081",    # Global Product Launch
            "JTBD-MA-082",    # Product Lifecycle
            "JTBD-MA-120",    # MA Transformation
            "JTBD-MA-119",    # Scenario Planning
            "JTBD-MA-067",    # Regional Strategy
            "JTBD-MA-069",    # Global-Regional Alignment
            "JTBD-MA-102",    # Benchmark Performance
            "JTBD-MA-056",    # Manage Projects
            "JTBD-MA-015",    # Manage Advisory Boards
            "JTBD-MA-090",    # Scientific Advisory Boards
            "JTBD-MA-ALT-008", # Medical Input to Commercial
        ],
        "importance": "critical",
        "frequency": "weekly"
    },

    # Clinical Operations / Compliance
    "clinical_ops": {
        "patterns": ["clinical op", "compliance", "governance", "regulatory", "clinical trials"],
        "jtbd_codes": [
            "JTBD-MA-037",    # Support ISTs
            "JTBD-MA-013",    # Investigator-Initiated Studies
            "JTBD-MA-038",    # Site Monitoring
            "JTBD-MA-046",    # Develop SOPs
            "JTBD-MA-048",    # Monitor Compliance
            "JTBD-MA-049",    # Investigate Issues
            "JTBD-MA-050",    # Regulatory Inspections
            "JTBD-MA-100",    # Monitor Regulatory Landscape
            "JTBD-MA-022",    # Adverse Event Reporting
        ],
        "importance": "critical",
        "frequency": "weekly"
    },

    # Digital / Innovation roles
    "digital": {
        "patterns": ["digital", "innovation", "ai", "analytics", "automation", "data"],
        "jtbd_codes": [
            "JTBD-MA-054",    # Implement New Systems
            "JTBD-MA-055",    # Analytics Dashboards
            "JTBD-MA-057",    # AI/ML Opportunities
            "JTBD-MA-058",    # Implement Automation
            "JTBD-MA-059",    # Digital Therapeutics Strategy
            "JTBD-MA-078",    # Predictive Analytics
            "JTBD-MA-093",    # Apply Machine Learning
            "JTBD-MA-094",    # Apply NLP
            "JTBD-MA-095",    # Deploy AI Assistants
            "JTBD-MA-107",    # Foster Innovation
            "JTBD-MA-118",    # Automate MA Processes
            "JTBD-MA-110",    # Social Media Engagement
        ],
        "importance": "high",
        "frequency": "monthly"
    },

    # Patient Advocacy / Support
    "patient": {
        "patterns": ["patient", "advocacy", "support program"],
        "jtbd_codes": [
            "JTBD-MA-060",    # Patient Advocacy Orgs
            "JTBD-MA-061",    # Patient Education
            "JTBD-MA-062",    # Patient Insights
            "JTBD-MA-063",    # Patient Support Programs
            "JTBD-MA-114",    # Health Equity
            "JTBD-MA-113",    # Population Health
        ],
        "importance": "high",
        "frequency": "monthly"
    },

    # Scientific Affairs
    "scientific": {
        "patterns": ["scientific affair", "scientific manager", "scientific lead"],
        "jtbd_codes": [
            "JTBD-MA-MS002",  # Identify Evidence Gaps
            "JTBD-MA-ALT-004", # Generate Medical Evidence
            "JTBD-MA-002",    # Monitor Scientific Literature
            "JTBD-MA-ALT-002", # Monitor Literature (alt)
            "JTBD-MA-070",    # Scientific Platforms
            "JTBD-MA-051",    # Competitive Intelligence
            "JTBD-MA-052",    # Evaluate New TAs
            "JTBD-CE9321D9",  # Gather Medical Insights
            "JTBD-MA-101",    # Scan Environment
        ],
        "importance": "high",
        "frequency": "weekly"
    },

    # Generic Medical Affairs (fallback)
    "generic": {
        "patterns": ["medical affair"],
        "jtbd_codes": [
            "JTBD-MA-FM001",  # KOL Engagement
            "JTBD-MA-002",    # Monitor Literature
            "JTBD-MA-056",    # Manage Projects
            "JTBD-MA-053",    # Vendor Relationships
            "JTBD-MA-ALT-006", # Support Product Launch
            "JTBD-MA-108",    # Continuous Improvement
        ],
        "importance": "medium",
        "frequency": "monthly"
    }
}

def api_get(endpoint):
    result = subprocess.run([
        "curl", "-s", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}"
    ], capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
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

def classify_role(role_name):
    """Classify a role into a category based on patterns"""
    role_lower = role_name.lower()

    # Check each category
    for category, config in ROLE_JTBD_MAPPING.items():
        for pattern in config["patterns"]:
            if pattern in role_lower:
                return category

    # Default fallback
    return "generic"

def main():
    print("=" * 70)
    print("MEDICAL AFFAIRS JTBD-TO-ROLE INTELLIGENT MAPPING")
    print("=" * 70)

    # Get existing mappings
    existing = api_get("jtbd_roles?select=jtbd_id,role_id&limit=10000")
    existing_pairs = set((e['jtbd_id'], e['role_id']) for e in existing if e.get('jtbd_id') and e.get('role_id'))
    print(f"\nExisting mappings: {len(existing_pairs)}")

    # Get Medical Affairs JTBDs
    ma_jtbds = api_get("jtbd?functional_area=eq.Medical%20Affairs&select=id,code,name&limit=500")
    jtbd_by_code = {j['code']: j for j in ma_jtbds}
    print(f"Medical Affairs JTBDs: {len(ma_jtbds)}")

    # Get Medical Affairs roles
    ma_roles = api_get("org_roles?function_id=eq.06127088-4d52-40aa-88c9-93f4e79e085a&select=id,name,seniority_level&limit=500")
    print(f"Medical Affairs Roles: {len(ma_roles)}")

    # Count by category
    category_counts = {}
    for role in ma_roles:
        cat = classify_role(role['name'])
        category_counts[cat] = category_counts.get(cat, 0) + 1

    print("\nRoles by category:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"  • {cat}: {count}")

    # Create mappings
    print("\n" + "=" * 70)
    print("CREATING MAPPINGS")
    print("=" * 70)

    created = 0
    skipped = 0
    missing_jtbds = set()

    for role in ma_roles:
        role_id = role['id']
        role_name = role['name']
        category = classify_role(role_name)
        config = ROLE_JTBD_MAPPING[category]

        jtbd_codes = config["jtbd_codes"]
        importance = config["importance"]
        frequency = config["frequency"]

        # Adjust importance based on seniority
        seniority = role.get('seniority_level', 'mid')
        if seniority in ['director', 'executive', 'c_suite']:
            importance = "critical"
        elif seniority == 'senior':
            importance = max(importance, "high")

        for seq, code in enumerate(jtbd_codes, 1):
            jtbd = jtbd_by_code.get(code)
            if not jtbd:
                missing_jtbds.add(code)
                continue

            jtbd_id = jtbd['id']

            # Skip if exists
            if (jtbd_id, role_id) in existing_pairs:
                skipped += 1
                continue

            # Calculate relevance based on position in list
            relevance = round(0.95 - (seq - 1) * 0.05, 2)
            relevance = max(0.6, relevance)

            mapping = {
                "jtbd_id": jtbd_id,
                "role_id": role_id,
                "role_name": role_name,
                "relevance_score": relevance,
                "importance": importance,
                "frequency": frequency,
                "is_primary": seq == 1,
                "mapping_source": "manual",
                "sequence_order": seq,
                "tenant_id": TENANT_ID
            }

            if api_post("jtbd_roles", mapping):
                created += 1
                existing_pairs.add((jtbd_id, role_id))

    print(f"\nCreated: {created} new mappings")
    print(f"Skipped: {skipped} (already exist)")

    if missing_jtbds:
        print(f"\nMissing JTBD codes (not found): {len(missing_jtbds)}")
        for code in sorted(missing_jtbds)[:10]:
            print(f"  • {code}")

    # Verification
    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)

    final = api_get("jtbd_roles?select=role_id&limit=10000")
    role_ids_mapped = set(r['role_id'] for r in final if r.get('role_id'))
    ma_role_ids = set(r['id'] for r in ma_roles)

    mapped_ma_roles = role_ids_mapped & ma_role_ids
    print(f"\nMedical Affairs roles with JTBD mappings: {len(mapped_ma_roles)}/{len(ma_roles)}")
    print(f"Coverage: {100*len(mapped_ma_roles)//len(ma_roles)}%")

if __name__ == "__main__":
    main()
