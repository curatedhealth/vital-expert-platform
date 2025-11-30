#!/usr/bin/env python3
"""
VITAL Platform - Persona Seeder (Existing Schema)
==================================================
Creates personas using the existing personas table structure.
Generates 4 MECE archetypes per role.

Usage:
    python3 seed_personas_existing_schema.py
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, List
import re

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# =============================================================================
# ARCHETYPE TEMPLATES (MECE Framework)
# =============================================================================

ARCHETYPE_TEMPLATES = {
    "AUTOMATOR": {
        "suffix": "Automator",
        "description_addon": "Highly tech-savvy professional who actively seeks AI and automation tools to maximize efficiency. Early adopter who experiments with new technologies and advocates for digital transformation.",
        "goals": ["Automate repetitive tasks", "Maximize efficiency through technology", "Stay ahead of AI trends", "Build scalable processes"],
        "challenges": ["Legacy systems resistance", "Data integration barriers", "Change management", "Tool proliferation"],
        "motivations": ["Efficiency gains", "Innovation recognition", "Technical mastery", "Future-proofing career"],
        "frustrations": ["Manual processes", "Outdated tools", "Slow adoption cycles", "Technical debt"],
        "daily_activities": ["Exploring new automation tools", "Building workflows", "Training others on technology", "Documenting processes", "Testing AI solutions"],
        "tools_used": ["AI assistants", "Automation platforms", "Data integration tools", "Advanced analytics"],
        "sample_quotes": [
            "There has to be a way to automate this.",
            "Let me show you how AI can handle that in seconds.",
            "Manual processes are just automation waiting to happen."
        ],
        "ai_maturity_level": 4,
        "tech_adoption_profile": "early_adopter"
    },
    "ORCHESTRATOR": {
        "suffix": "Orchestrator",
        "description_addon": "Strategic coordinator who excels at managing complex workflows and cross-functional initiatives. Focuses on optimizing team dynamics and ensuring seamless collaboration across departments.",
        "goals": ["Optimize team workflows", "Improve cross-functional collaboration", "Standardize processes", "Scale best practices"],
        "challenges": ["Stakeholder alignment", "Resource constraints", "Process complexity", "Communication gaps"],
        "motivations": ["Team success", "Process excellence", "Strategic impact", "Organizational recognition"],
        "frustrations": ["Siloed information", "Inconsistent processes", "Meeting overload", "Competing priorities"],
        "daily_activities": ["Coordinating cross-functional meetings", "Managing project timelines", "Aligning stakeholders", "Tracking deliverables", "Optimizing workflows"],
        "tools_used": ["Project management software", "Collaboration platforms", "Communication tools", "Workflow automation"],
        "sample_quotes": [
            "Let's get everyone aligned on this.",
            "We need a standardized process for this.",
            "How can we scale this across teams?"
        ],
        "ai_maturity_level": 3,
        "tech_adoption_profile": "early_majority"
    },
    "LEARNER": {
        "suffix": "Learner",
        "description_addon": "Curious professional eager to develop new skills and understand emerging technologies. Values continuous learning and seeks mentorship and training opportunities.",
        "goals": ["Develop new skills", "Understand AI capabilities", "Build expertise", "Advance career"],
        "challenges": ["Information overload", "Time for learning", "Skill gaps", "Keeping current"],
        "motivations": ["Professional growth", "Knowledge acquisition", "Career advancement", "Intellectual curiosity"],
        "frustrations": ["Limited training resources", "Fast-changing technology", "Learning curve", "Unclear career paths"],
        "daily_activities": ["Taking online courses", "Attending webinars", "Reading industry publications", "Seeking mentorship", "Experimenting with new tools"],
        "tools_used": ["Learning platforms", "Industry publications", "Mentorship programs", "Basic analytics tools"],
        "sample_quotes": [
            "Can you show me how that works?",
            "I'd love to learn more about this.",
            "What resources would you recommend?"
        ],
        "ai_maturity_level": 2,
        "tech_adoption_profile": "late_majority"
    },
    "SKEPTIC": {
        "suffix": "Skeptic",
        "description_addon": "Cautious professional who prioritizes proven methods and thorough validation. Values reliability over novelty and requires strong evidence before adopting new approaches.",
        "goals": ["Ensure quality and accuracy", "Maintain compliance", "Validate before adopting", "Protect patient safety"],
        "challenges": ["Pressure to adopt quickly", "Unproven technologies", "Risk assessment", "Maintaining standards"],
        "motivations": ["Quality assurance", "Risk mitigation", "Patient safety", "Professional integrity"],
        "frustrations": ["Rushed implementations", "Hype over substance", "Inadequate validation", "Compliance concerns"],
        "daily_activities": ["Reviewing documentation", "Validating data accuracy", "Assessing risks", "Ensuring compliance", "Quality checking deliverables"],
        "tools_used": ["Validated systems", "Documentation tools", "Quality management systems", "Compliance tracking"],
        "sample_quotes": [
            "What's the evidence for this approach?",
            "We need to validate this before proceeding.",
            "Has this been properly tested?"
        ],
        "ai_maturity_level": 1,
        "tech_adoption_profile": "laggard"
    }
}

# =============================================================================
# GXP CONTEXT BY SENIORITY
# =============================================================================

GXP_REQUIREMENTS_BY_SENIORITY = {
    "entry": ["GCP basics", "GVP awareness"],
    "mid": ["GCP", "GVP Module VI"],
    "senior": ["GCP E6", "GVP", "PhRMA Code"],
    "director": ["GCP", "GVP", "GMP awareness", "ICH Guidelines"],
    "executive": ["All GxP frameworks", "FDA/EMA regulations"],
    "c_suite": ["Enterprise GxP governance", "Global regulatory frameworks"]
}

THERAPEUTIC_AREAS = [
    "Oncology", "Immunology", "Neurology", "Cardiology", "Rare Diseases",
    "Infectious Diseases", "Respiratory", "Dermatology", "Endocrinology"
]

# =============================================================================
# API HELPERS
# =============================================================================

def supabase_request(method: str, table: str, data=None, params: str = "") -> dict:
    """Make a request to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if params:
        url += f"?{params}"

    try:
        if method == "GET":
            response = requests.get(url, headers=HEADERS)
        elif method == "POST":
            headers = {**HEADERS, "Prefer": "return=representation,resolution=merge-duplicates"}
            response = requests.post(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=HEADERS)
        else:
            return {"success": False, "error": f"Unknown method: {method}"}

        if response.status_code in [200, 201, 204]:
            if response.text:
                return {"success": True, "data": response.json()}
            return {"success": True, "data": []}
        else:
            return {"success": False, "error": response.text, "status": response.status_code}
    except Exception as e:
        return {"success": False, "error": str(e)}

# =============================================================================
# SEEDING FUNCTIONS
# =============================================================================

def fetch_roles() -> List[dict]:
    """Fetch all roles from database."""
    print("\n[1/3] Fetching roles from database...")

    result = supabase_request("GET", "org_roles",
        params="select=id,name,slug,description,seniority_level,geographic_scope,department_id,function_id")

    if result["success"]:
        roles = result["data"]
        print(f"      Found {len(roles)} roles")
        return roles
    else:
        print(f"      Error: {result.get('error')}")
        return []

def fetch_departments() -> Dict[str, str]:
    """Fetch department id->name mapping."""
    result = supabase_request("GET", "org_departments", params="select=id,name")
    if result["success"]:
        return {d["id"]: d["name"] for d in result["data"]}
    return {}

def create_personas(roles: List[dict], dept_map: Dict[str, str]) -> int:
    """Create personas for all roles with MECE archetypes."""
    print("\n[2/3] Creating personas (4 archetypes per role)...")

    total_created = 0
    batch_size = 50
    all_personas = []

    for role in roles:
        for archetype_key, archetype in ARCHETYPE_TEMPLATES.items():
            persona_id = str(uuid.uuid4())
            role_name = role["name"]
            role_slug = role["slug"]

            # Generate unique ID
            unique_id = f"P-{role_slug[:25].upper().replace('-', '')}-{archetype_key[:3]}"

            # Build persona name
            persona_name = f"{role_name} - {archetype['suffix']}"

            # Get department name
            dept_name = dept_map.get(role.get("department_id"), "Medical Affairs")

            # Get seniority for GxP requirements
            seniority = role.get("seniority_level", "mid")
            gxp_reqs = GXP_REQUIREMENTS_BY_SENIORITY.get(seniority, ["GCP"])

            # Select therapeutic area based on hash
            ta_index = hash(role_slug + archetype_key) % len(THERAPEUTIC_AREAS)
            therapeutic_area = THERAPEUTIC_AREAS[ta_index]

            # Build description
            role_desc = role.get("description", f"Professional in the {role_name} role")
            full_description = f"{role_desc} {archetype['description_addon']}"

            persona = {
                "id": persona_id,
                "unique_id": unique_id[:50],
                "persona_name": persona_name[:255],
                "persona_type": archetype_key,
                "source_role_id": role["id"],
                "title": role_name[:255],
                "description": full_description[:2000],
                "department": dept_name[:100],
                "function_area": "Medical Affairs",
                "geographic_scope": role.get("geographic_scope", "global"),
                "experience_level": seniority,
                "goals": archetype["goals"],
                "challenges": archetype["challenges"],
                "motivations": archetype["motivations"],
                "frustrations": archetype["frustrations"],
                "daily_activities": archetype["daily_activities"],
                "tools_used": archetype["tools_used"],
                "sample_quotes": archetype["sample_quotes"],
                "gxp_requirements": gxp_reqs,
                "therapeutic_areas": [therapeutic_area],
                "is_active": True,
                "communication_preferences": [],
                "skills": [],
                "competencies": [],
                "success_metrics": [],
                "typical_scenarios": [],
                "regulatory_context": []
            }

            all_personas.append(persona)

    # Insert in batches
    print(f"      Total personas to create: {len(all_personas)}")

    for i in range(0, len(all_personas), batch_size):
        batch = all_personas[i:i+batch_size]
        result = supabase_request("POST", "personas", batch)

        if result["success"]:
            total_created += len(batch)
            progress = (i + len(batch)) / len(all_personas) * 100
            print(f"      Progress: {progress:.1f}% ({total_created}/{len(all_personas)})")
        else:
            error_msg = result.get("error", "Unknown error")
            # Check for duplicate key error
            if "duplicate key" in error_msg.lower():
                print(f"      Batch {i//batch_size + 1}: Skipped (duplicates exist)")
            else:
                print(f"      Batch {i//batch_size + 1}: Error - {error_msg[:200]}")

    return total_created

def verify_results():
    """Verify the seeding results."""
    print("\n[3/3] Verifying results...")

    result = supabase_request("GET", "personas", params="select=id,persona_type")
    if result["success"]:
        personas = result["data"]
        total = len(personas)

        # Count by archetype
        by_type = {}
        for p in personas:
            ptype = p.get("persona_type", "UNKNOWN")
            by_type[ptype] = by_type.get(ptype, 0) + 1

        print(f"      Total personas: {total}")
        print(f"      By archetype:")
        for ptype, count in sorted(by_type.items()):
            print(f"         {ptype}: {count}")

        return total
    return 0

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("VITAL Platform - Persona Seeder")
    print("=" * 60)
    print(f"\nTarget: {SUPABASE_URL}")
    print(f"Started: {datetime.now().isoformat()}")

    # Fetch roles
    roles = fetch_roles()
    if not roles:
        print("\nERROR: No roles found. Cannot create personas.")
        return

    # Fetch departments for mapping
    dept_map = fetch_departments()

    # Create personas
    created = create_personas(roles, dept_map)

    # Verify
    final_count = verify_results()

    # Summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE")
    print("=" * 60)
    print(f"\nSummary:")
    print(f"   Roles processed: {len(roles)}")
    print(f"   Personas created: {created}")
    print(f"   Total in database: {final_count}")
    print(f"   Expected: {len(roles) * 4} (4 archetypes x {len(roles)} roles)")
    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
