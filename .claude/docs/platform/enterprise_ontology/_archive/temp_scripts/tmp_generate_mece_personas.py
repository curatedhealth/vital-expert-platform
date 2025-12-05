#!/usr/bin/env python3
"""
Generate MECE personas (4 per role) for Commercial Organization.
MECE Framework:
  - AUTOMATOR: High AI Maturity + Low Work Complexity
  - ORCHESTRATOR: High AI Maturity + High Work Complexity
  - LEARNER: Low AI Maturity + Low Work Complexity
  - SKEPTIC: Low AI Maturity + High Work Complexity
"""
import json
import subprocess
import random
import time

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"
COMMERCIAL_FUNCTION_ID = "57170e7f-6969-447c-ba2d-bdada970db8b"

# MECE Persona Archetypes (scores on 0-1 scale)
MECE_ARCHETYPES = {
    "AUTOMATOR": {
        "suffix": "Automation Champion",
        "ai_maturity_score": 0.85,  # High AI maturity
        "work_complexity_score": 0.35,  # Low complexity
        "ai_readiness_score": 0.9,
        "goals": ["Automate repetitive tasks", "Maximize AI tool adoption", "Drive efficiency gains"],
        "challenges": ["Over-reliance on automation", "Change management resistance", "Integration complexity"],
        "motivations": ["Technology innovation", "Time savings", "Process optimization"],
        "frustrations": ["Manual workarounds", "Legacy system limitations", "Slow adoption by peers"],
        "preferred_service_layer": "L1_expert"
    },
    "ORCHESTRATOR": {
        "suffix": "Strategic AI Leader",
        "ai_maturity_score": 0.92,  # High AI maturity
        "work_complexity_score": 0.85,  # High complexity
        "ai_readiness_score": 0.95,
        "goals": ["Lead AI transformation", "Integrate AI across workflows", "Drive strategic AI initiatives"],
        "challenges": ["Balancing AI and human judgment", "Complex stakeholder alignment", "Enterprise-scale deployment"],
        "motivations": ["Competitive advantage", "Innovation leadership", "Business transformation"],
        "frustrations": ["Siloed AI initiatives", "Lack of executive buy-in", "Slow organizational change"],
        "preferred_service_layer": "L2_panel"
    },
    "LEARNER": {
        "suffix": "AI Explorer",
        "ai_maturity_score": 0.40,  # Low AI maturity
        "work_complexity_score": 0.30,  # Low complexity
        "ai_readiness_score": 0.5,
        "goals": ["Learn AI capabilities", "Build foundational skills", "Find quick wins"],
        "challenges": ["Learning curve anxiety", "Limited AI exposure", "Uncertainty about AI value"],
        "motivations": ["Career growth", "Skill development", "Staying relevant"],
        "frustrations": ["Information overload", "Lack of training resources", "Unclear use cases"],
        "preferred_service_layer": "L1_expert"
    },
    "SKEPTIC": {
        "suffix": "Cautious Evaluator",
        "ai_maturity_score": 0.35,  # Low AI maturity
        "work_complexity_score": 0.80,  # High complexity
        "ai_readiness_score": 0.35,
        "goals": ["Validate AI accuracy", "Ensure compliance", "Maintain control"],
        "challenges": ["Trust in AI outputs", "Regulatory uncertainty", "Quality assurance"],
        "motivations": ["Risk mitigation", "Proven results", "Regulatory compliance"],
        "frustrations": ["Black box AI", "Unverified outputs", "Lack of explainability"],
        "preferred_service_layer": "L2_panel"
    }
}

# Name banks for persona generation
FIRST_NAMES = ["James", "Maria", "David", "Sarah", "Michael", "Jennifer", "Robert", "Lisa",
               "William", "Emily", "John", "Amanda", "Daniel", "Rachel", "Christopher", "Michelle",
               "Andrew", "Stephanie", "Kevin", "Nicole", "Brian", "Jessica", "Steven", "Ashley",
               "Mark", "Elizabeth", "Paul", "Megan", "Thomas", "Lauren", "Jason", "Rebecca",
               "Eric", "Katherine", "Richard", "Christina", "Matthew", "Sandra", "Timothy", "Diana"]

LAST_NAMES = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
              "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
              "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez",
              "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
              "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams"]

def api_get(endpoint):
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

def api_post(endpoint, data):
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
            return None
        try:
            response = json.loads(result.stdout)
            return response[0] if isinstance(response, list) and response else response
        except:
            return None
    return None

def get_commercial_roles():
    """Get all Commercial roles with their departments"""
    roles = api_get(f"org_roles?function_id=eq.{COMMERCIAL_FUNCTION_ID}&select=id,name,slug,seniority_level,department_id")
    return roles

def get_existing_personas():
    """Get existing persona unique_ids"""
    personas = api_get("personas?function_area=eq.Commercial&select=unique_id")
    return set(p.get("unique_id", "") for p in personas if p.get("unique_id"))

def get_department_name(dept_id, dept_cache):
    """Get department name from cache or API"""
    if dept_id not in dept_cache:
        depts = api_get(f"org_departments?id=eq.{dept_id}&select=name")
        dept_cache[dept_id] = depts[0].get("name", "Commercial") if depts else "Commercial"
    return dept_cache[dept_id]

def generate_persona_name():
    """Generate a unique persona name"""
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def create_mece_persona(role, archetype_key, archetype, persona_num, dept_name):
    """Create a single MECE persona for a role"""
    name = generate_persona_name()
    unique_id = f"PERSONA-COM-MECE-{role['id'][:8]}-{archetype_key[:3]}"

    # Map seniority to experience level
    seniority_map = {
        "entry": "Entry Level",
        "mid": "Mid-Level",
        "senior": "Senior",
        "director": "Director",
        "executive": "Executive",
        "c_suite": "C-Suite"
    }
    experience_level = seniority_map.get(role.get("seniority_level", "mid"), "Mid-Level")

    # Age range based on seniority
    age_ranges = {
        "entry": "22-28",
        "mid": "28-38",
        "senior": "35-45",
        "director": "40-50",
        "executive": "45-55",
        "c_suite": "50-60"
    }
    age_range = age_ranges.get(role.get("seniority_level", "mid"), "30-40")

    persona = {
        "unique_id": unique_id,
        "persona_name": name,
        "persona_type": "MECE-Role-based",
        "title": f"{role['name']} - {archetype['suffix']}",
        "description": f"{archetype_key} persona for {role['name']}: {archetype['suffix']} with {'high' if archetype['ai_maturity_score'] > 60 else 'low'} AI maturity and {'high' if archetype['work_complexity_score'] > 60 else 'low'} work complexity.",
        "department": dept_name,
        "function_area": "Commercial",
        "geographic_scope": "regional",
        "age_range": age_range,
        "experience_level": experience_level,
        "education_level": "Bachelor's" if role.get("seniority_level") in ["entry", "mid"] else "MBA",
        "tenant_id": TENANT_ID,
        "is_active": True,
        "goals": archetype["goals"],
        "challenges": [c.get("challenge") if isinstance(c, dict) else c for c in archetype["challenges"]],
        "motivations": archetype["motivations"],
        "frustrations": archetype["frustrations"],
        "ai_readiness_score": archetype["ai_readiness_score"],
        "work_complexity_score": archetype["work_complexity_score"],
        # Note: ai_maturity_score doesn't exist in schema, using ai_readiness_score instead
        "derived_archetype": archetype_key,
        "preferred_service_layer": archetype["preferred_service_layer"],
        "source_role_id": role["id"],
        "data_quality_score": 0.85,
        "created_by": "MECE Persona Generator"
    }

    return persona

def main():
    print("=" * 70)
    print("MECE PERSONA GENERATOR - 4 PERSONAS PER ROLE")
    print("=" * 70)
    print()

    # Get roles and existing personas
    roles = get_commercial_roles()
    existing_ids = get_existing_personas()

    print(f"Commercial roles: {len(roles)}")
    print(f"Existing personas: {len(existing_ids)}")
    print(f"Target personas: {len(roles) * 4}")
    print(f"Personas to generate: {len(roles) * 4 - len(existing_ids)}")
    print()

    # Department cache
    dept_cache = {}

    # Generate personas for each role
    inserted = 0
    skipped = 0
    failed = 0

    for i, role in enumerate(roles, 1):
        role_id = role["id"]
        role_name = role["name"]
        dept_id = role.get("department_id")
        dept_name = get_department_name(dept_id, dept_cache) if dept_id else "Commercial"

        print(f"[{i:3d}/{len(roles)}] {role_name[:40]}")

        for archetype_key, archetype in MECE_ARCHETYPES.items():
            unique_id = f"PERSONA-COM-MECE-{role_id[:8]}-{archetype_key[:3]}"

            if unique_id in existing_ids:
                skipped += 1
                continue

            persona = create_mece_persona(role, archetype_key, archetype, i, dept_name)
            result = api_post("personas", persona)

            if result and "id" in result:
                inserted += 1
                existing_ids.add(unique_id)
            else:
                failed += 1

        # Progress and rate limiting
        if i % 20 == 0:
            print(f"    ... progress: {i}/{len(roles)} ({100*i//len(roles)}%) - inserted: {inserted}")
            time.sleep(0.5)

    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Roles processed: {len(roles)}")
    print(f"Personas inserted: {inserted}")
    print(f"Personas skipped (existing): {skipped}")
    print(f"Personas failed: {failed}")
    print(f"Expected total: {len(roles) * 4}")

if __name__ == "__main__":
    main()
