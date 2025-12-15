#!/usr/bin/env python3
"""
MECE Persona Manager for all three functions:
1. Delete non-MECE (original) personas
2. Generate MECE personas (4 per role) for Medical Affairs and Market Access
3. Verify 4 personas per role across all functions

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
import sys

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Function IDs
FUNCTIONS = {
    "Commercial": "57170e7f-6969-447c-ba2d-bdada970db8b",
    "Medical Affairs": "06127088-4d52-40aa-88c9-93f4e79e085a",
    "Market Access": "b7fed05f-90b2-4c4a-a7a8-8346a3159127"
}

# MECE Persona Archetypes (scores on 0-1 scale)
MECE_ARCHETYPES = {
    "AUTOMATOR": {
        "suffix": "Automation Champion",
        "ai_readiness_score": 0.9,
        "work_complexity_score": 0.35,
        "goals": ["Automate repetitive tasks", "Maximize AI tool adoption", "Drive efficiency gains"],
        "challenges": ["Over-reliance on automation", "Change management resistance", "Integration complexity"],
        "motivations": ["Technology innovation", "Time savings", "Process optimization"],
        "frustrations": ["Manual workarounds", "Legacy system limitations", "Slow adoption by peers"],
        "preferred_service_layer": "L1_expert"
    },
    "ORCHESTRATOR": {
        "suffix": "Strategic AI Leader",
        "ai_readiness_score": 0.95,
        "work_complexity_score": 0.85,
        "goals": ["Lead AI transformation", "Integrate AI across workflows", "Drive strategic AI initiatives"],
        "challenges": ["Balancing AI and human judgment", "Complex stakeholder alignment", "Enterprise-scale deployment"],
        "motivations": ["Competitive advantage", "Innovation leadership", "Business transformation"],
        "frustrations": ["Siloed AI initiatives", "Lack of executive buy-in", "Slow organizational change"],
        "preferred_service_layer": "L2_panel"
    },
    "LEARNER": {
        "suffix": "AI Explorer",
        "ai_readiness_score": 0.5,
        "work_complexity_score": 0.30,
        "goals": ["Learn AI capabilities", "Build foundational skills", "Find quick wins"],
        "challenges": ["Learning curve anxiety", "Limited AI exposure", "Uncertainty about AI value"],
        "motivations": ["Career growth", "Skill development", "Staying relevant"],
        "frustrations": ["Information overload", "Lack of training resources", "Unclear use cases"],
        "preferred_service_layer": "L1_expert"
    },
    "SKEPTIC": {
        "suffix": "Cautious Evaluator",
        "ai_readiness_score": 0.35,
        "work_complexity_score": 0.80,
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
            return None
        try:
            response = json.loads(result.stdout)
            return response[0] if isinstance(response, list) and response else response
        except:
            return None
    return None

def api_delete(endpoint):
    """DELETE request to Supabase REST API"""
    result = subprocess.run([
        "curl", "-s", "-X", "DELETE", f"{URL}/rest/v1/{endpoint}",
        "-H", f"apikey: {APIKEY}",
        "-H", f"Authorization: Bearer {APIKEY}",
        "-H", "Prefer: return=representation"
    ], capture_output=True, text=True)
    if result.returncode == 0 and result.stdout:
        try:
            return json.loads(result.stdout)
        except:
            return []
    return []

def get_current_state():
    """Get current persona counts by function and type"""
    print("=" * 70)
    print("CURRENT STATE ANALYSIS")
    print("=" * 70)
    print()

    state = {}
    mece_types = ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]

    for func_name, func_id in FUNCTIONS.items():
        print(f"=== {func_name} ===")

        # Get roles count
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name")

        # Get personas
        personas = api_get(f"personas?function_area=eq.{func_name}&select=id,unique_id,derived_archetype")

        mece_count = sum(1 for p in personas if p.get("derived_archetype") in mece_types)
        original_count = len(personas) - mece_count

        state[func_name] = {
            "function_id": func_id,
            "roles": roles,
            "role_count": len(roles),
            "total_personas": len(personas),
            "mece_personas": mece_count,
            "original_personas": original_count,
            "personas": personas
        }

        print(f"  Roles: {len(roles)}")
        print(f"  Total Personas: {len(personas)}")
        print(f"  MECE Personas: {mece_count}")
        print(f"  Original (to delete): {original_count}")
        print(f"  Target: {len(roles) * 4} (4 per role)")
        print()

    return state

def delete_non_mece_personas(state):
    """Delete all non-MECE personas"""
    print("=" * 70)
    print("DELETING NON-MECE PERSONAS")
    print("=" * 70)
    print()

    mece_types = ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]
    total_deleted = 0

    for func_name, data in state.items():
        original_ids = [p["id"] for p in data["personas"]
                       if p.get("derived_archetype") not in mece_types]

        if not original_ids:
            print(f"{func_name}: No original personas to delete")
            continue

        print(f"{func_name}: Deleting {len(original_ids)} original personas...")

        # Delete in batches of 50
        deleted = 0
        for i in range(0, len(original_ids), 50):
            batch = original_ids[i:i+50]
            ids_str = ",".join(f'"{id}"' for id in batch)
            result = api_delete(f"personas?id=in.({ids_str})")
            deleted += len(result) if isinstance(result, list) else 0

        print(f"  Deleted: {deleted}")
        total_deleted += deleted

    print()
    print(f"Total deleted: {total_deleted}")
    return total_deleted

def get_department_name(dept_id, dept_cache):
    """Get department name from cache or API"""
    if dept_id not in dept_cache:
        depts = api_get(f"org_departments?id=eq.{dept_id}&select=name")
        dept_cache[dept_id] = depts[0].get("name", "Unknown") if depts else "Unknown"
    return dept_cache[dept_id]

def generate_persona_name():
    """Generate a unique persona name"""
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def create_mece_persona(role, archetype_key, archetype, func_name, dept_name, func_code):
    """Create a single MECE persona for a role"""
    name = generate_persona_name()
    unique_id = f"PERSONA-{func_code}-MECE-{role['id'][:8]}-{archetype_key[:3]}"

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
        "description": f"{archetype_key} persona for {role['name']}: {archetype['suffix']} with {'high' if archetype['ai_readiness_score'] > 0.6 else 'low'} AI readiness and {'high' if archetype['work_complexity_score'] > 0.6 else 'low'} work complexity.",
        "department": dept_name,
        "function_area": func_name,
        "geographic_scope": "regional",
        "age_range": age_range,
        "experience_level": experience_level,
        "education_level": "Bachelor's" if role.get("seniority_level") in ["entry", "mid"] else "MBA",
        "tenant_id": TENANT_ID,
        "is_active": True,
        "goals": archetype["goals"],
        "challenges": archetype["challenges"],
        "motivations": archetype["motivations"],
        "frustrations": archetype["frustrations"],
        "ai_readiness_score": archetype["ai_readiness_score"],
        "work_complexity_score": archetype["work_complexity_score"],
        "derived_archetype": archetype_key,
        "preferred_service_layer": archetype["preferred_service_layer"],
        "source_role_id": role["id"],
        "data_quality_score": 0.85,
        "created_by": "MECE Persona Generator"
    }

    return persona

def generate_mece_personas_for_function(func_name, func_id, func_code):
    """Generate 4 MECE personas per role for a function"""
    print(f"=== Generating MECE personas for {func_name} ===")

    # Get roles
    roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name,slug,seniority_level,department_id")
    print(f"Found {len(roles)} roles")

    # Get existing MECE persona unique_ids
    existing = api_get(f"personas?function_area=eq.{func_name}&derived_archetype=in.(AUTOMATOR,ORCHESTRATOR,LEARNER,SKEPTIC)&select=unique_id")
    existing_ids = set(p.get("unique_id", "") for p in existing if p.get("unique_id"))
    print(f"Existing MECE personas: {len(existing_ids)}")

    dept_cache = {}
    inserted = 0
    skipped = 0
    failed = 0

    for i, role in enumerate(roles, 1):
        role_id = role["id"]
        role_name = role["name"]
        dept_id = role.get("department_id")
        dept_name = get_department_name(dept_id, dept_cache) if dept_id else func_name

        for archetype_key, archetype in MECE_ARCHETYPES.items():
            unique_id = f"PERSONA-{func_code}-MECE-{role_id[:8]}-{archetype_key[:3]}"

            if unique_id in existing_ids:
                skipped += 1
                continue

            persona = create_mece_persona(role, archetype_key, archetype, func_name, dept_name, func_code)
            result = api_post("personas", persona)

            if result and "id" in result:
                inserted += 1
                existing_ids.add(unique_id)
            else:
                failed += 1

        if i % 20 == 0:
            print(f"  Progress: {i}/{len(roles)} roles ({100*i//len(roles)}%) - inserted: {inserted}")

    print(f"  Inserted: {inserted}, Skipped: {skipped}, Failed: {failed}")
    return inserted, skipped, failed

def verify_final_state():
    """Verify final state - 4 MECE personas per role"""
    print()
    print("=" * 70)
    print("FINAL VERIFICATION")
    print("=" * 70)
    print()

    mece_types = ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]
    all_good = True

    for func_name, func_id in FUNCTIONS.items():
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id")
        personas = api_get(f"personas?function_area=eq.{func_name}&select=id,derived_archetype")

        mece_count = sum(1 for p in personas if p.get("derived_archetype") in mece_types)
        non_mece_count = len(personas) - mece_count
        expected = len(roles) * 4

        status = "✅" if mece_count == expected and non_mece_count == 0 else "❌"
        if mece_count != expected or non_mece_count > 0:
            all_good = False

        print(f"{func_name}:")
        print(f"  Roles: {len(roles)}")
        print(f"  MECE Personas: {mece_count} (expected: {expected})")
        print(f"  Non-MECE Personas: {non_mece_count} (expected: 0)")
        print(f"  Ratio: {mece_count/len(roles):.1f} per role")
        print(f"  Status: {status}")
        print()

    return all_good

def main():
    print("=" * 70)
    print("MECE PERSONA MANAGER - ALL FUNCTIONS")
    print("=" * 70)
    print()

    # Step 1: Analyze current state
    state = get_current_state()

    # Step 2: Delete non-MECE personas
    print()
    delete_non_mece_personas(state)

    # Step 3: Generate MECE personas for each function
    print()
    print("=" * 70)
    print("GENERATING MECE PERSONAS (4 PER ROLE)")
    print("=" * 70)
    print()

    func_codes = {
        "Commercial": "COM",
        "Medical Affairs": "MA",
        "Market Access": "MKA"
    }

    for func_name, func_id in FUNCTIONS.items():
        generate_mece_personas_for_function(func_name, func_id, func_codes[func_name])
        print()
        time.sleep(0.5)

    # Step 4: Verify final state
    success = verify_final_state()

    print("=" * 70)
    print("COMPLETE" if success else "SOME ISSUES DETECTED")
    print("=" * 70)

if __name__ == "__main__":
    main()
