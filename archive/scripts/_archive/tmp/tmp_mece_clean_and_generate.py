#!/usr/bin/env python3
"""
Clean delete ALL non-MECE personas and generate exactly 4 MECE personas per role
for Commercial, Medical Affairs, and Market Access.
"""
import json
import subprocess
import random
import time

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

FUNCTIONS = {
    "Commercial": {"id": "57170e7f-6969-447c-ba2d-bdada970db8b", "code": "COM"},
    "Medical Affairs": {"id": "06127088-4d52-40aa-88c9-93f4e79e085a", "code": "MA"},
    "Market Access": {"id": "b7fed05f-90b2-4c4a-a7a8-8346a3159127", "code": "MKA"}
}

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

FIRST_NAMES = ["James", "Maria", "David", "Sarah", "Michael", "Jennifer", "Robert", "Lisa",
               "William", "Emily", "John", "Amanda", "Daniel", "Rachel", "Christopher", "Michelle",
               "Andrew", "Stephanie", "Kevin", "Nicole", "Brian", "Jessica", "Steven", "Ashley"]

LAST_NAMES = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
              "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore"]

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
            print(f"    ERROR: {result.stdout[:200]}")
            return None
        try:
            response = json.loads(result.stdout)
            return response[0] if isinstance(response, list) and response else response
        except:
            return None
    return None

def api_delete(endpoint):
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

def delete_non_mece_personas():
    """Delete all personas where derived_archetype is NOT a MECE type"""
    print("=" * 70)
    print("STEP 1: DELETE NON-MECE PERSONAS")
    print("=" * 70)
    print()

    total_deleted = 0

    for func_name, func_data in FUNCTIONS.items():
        print(f"Processing {func_name}...")

        # Get all personas for this function
        personas = api_get(f"personas?function_area=eq.{func_name.replace(' ', '%20')}&select=id,derived_archetype&limit=2000")

        # Find non-MECE personas
        mece_types = ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]
        non_mece_ids = [p["id"] for p in personas if p.get("derived_archetype") not in mece_types]

        print(f"  Total personas: {len(personas)}")
        print(f"  Non-MECE to delete: {len(non_mece_ids)}")

        if not non_mece_ids:
            continue

        # Delete in batches of 100
        deleted = 0
        for i in range(0, len(non_mece_ids), 100):
            batch = non_mece_ids[i:i+100]
            ids_str = ",".join(f'"{id}"' for id in batch)
            result = api_delete(f"personas?id=in.({ids_str})")
            batch_deleted = len(result) if isinstance(result, list) else 0
            deleted += batch_deleted
            print(f"    Batch {i//100 + 1}: deleted {batch_deleted}")

        print(f"  Total deleted: {deleted}")
        total_deleted += deleted

    print()
    print(f"TOTAL DELETED: {total_deleted}")
    return total_deleted

def get_department_name(dept_id, cache):
    if not dept_id:
        return "Unknown"
    if dept_id not in cache:
        depts = api_get(f"org_departments?id=eq.{dept_id}&select=name")
        cache[dept_id] = depts[0].get("name", "Unknown") if depts else "Unknown"
    return cache[dept_id]

def generate_all_mece_personas():
    """Generate 4 MECE personas per role for all functions"""
    print()
    print("=" * 70)
    print("STEP 2: GENERATE MECE PERSONAS (4 per role)")
    print("=" * 70)
    print()

    total_inserted = 0
    total_skipped = 0
    total_failed = 0

    dept_cache = {}

    for func_name, func_data in FUNCTIONS.items():
        func_id = func_data["id"]
        func_code = func_data["code"]

        print(f"=== {func_name} ===")

        # Get roles
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id,name,seniority_level,department_id&limit=500")
        print(f"Roles: {len(roles)}")

        # Get existing MECE personas
        existing = api_get(f"personas?function_area=eq.{func_name.replace(' ', '%20')}&derived_archetype=in.(AUTOMATOR,ORCHESTRATOR,LEARNER,SKEPTIC)&select=unique_id&limit=2000")
        existing_ids = set(p.get("unique_id", "") for p in existing if p.get("unique_id"))
        print(f"Existing MECE: {len(existing_ids)}")

        inserted = 0
        skipped = 0
        failed = 0

        for i, role in enumerate(roles, 1):
            role_id = role["id"]
            role_name = role["name"]
            dept_id = role.get("department_id")
            dept_name = get_department_name(dept_id, dept_cache)
            seniority = role.get("seniority_level", "mid")

            for arch_key, arch in MECE_ARCHETYPES.items():
                unique_id = f"PERSONA-{func_code}-MECE-{role_id[:8]}-{arch_key[:3]}"

                if unique_id in existing_ids:
                    skipped += 1
                    continue

                # Generate persona data
                seniority_map = {"entry": "Entry Level", "mid": "Mid-Level", "senior": "Senior",
                               "director": "Director", "executive": "Executive", "c_suite": "C-Suite"}
                age_map = {"entry": "22-28", "mid": "28-38", "senior": "35-45",
                          "director": "40-50", "executive": "45-55", "c_suite": "50-60"}

                persona = {
                    "unique_id": unique_id,
                    "persona_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "persona_type": "MECE-Role-based",
                    "title": f"{role_name} - {arch['suffix']}",
                    "description": f"{arch_key} persona for {role_name}: {arch['suffix']}",
                    "department": dept_name,
                    "function_area": func_name,
                    "geographic_scope": "regional",
                    "age_range": age_map.get(seniority, "30-40"),
                    "experience_level": seniority_map.get(seniority, "Mid-Level"),
                    "education_level": "Bachelor's" if seniority in ["entry", "mid"] else "MBA",
                    "tenant_id": TENANT_ID,
                    "is_active": True,
                    "goals": arch["goals"],
                    "challenges": arch["challenges"],
                    "motivations": arch["motivations"],
                    "frustrations": arch["frustrations"],
                    "ai_readiness_score": arch["ai_readiness_score"],
                    "work_complexity_score": arch["work_complexity_score"],
                    "derived_archetype": arch_key,
                    "preferred_service_layer": arch["preferred_service_layer"],
                    "source_role_id": role_id,
                    "data_quality_score": 0.85,
                    "created_by": "MECE Generator v2"
                }

                result = api_post("personas", persona)
                if result and "id" in result:
                    inserted += 1
                    existing_ids.add(unique_id)
                else:
                    failed += 1

            if i % 25 == 0:
                print(f"  Progress: {i}/{len(roles)} ({100*i//len(roles)}%) - inserted: {inserted}")

        print(f"  Inserted: {inserted}, Skipped: {skipped}, Failed: {failed}")
        total_inserted += inserted
        total_skipped += skipped
        total_failed += failed
        print()

    print(f"TOTAL: Inserted {total_inserted}, Skipped {total_skipped}, Failed {total_failed}")
    return total_inserted

def verify_results():
    """Verify final state"""
    print()
    print("=" * 70)
    print("STEP 3: VERIFICATION")
    print("=" * 70)
    print()

    mece_types = ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]
    all_good = True

    for func_name, func_data in FUNCTIONS.items():
        func_id = func_data["id"]

        # Get role count
        roles = api_get(f"org_roles?function_id=eq.{func_id}&select=id&limit=500")
        role_count = len(roles)

        # Get persona count
        personas = api_get(f"personas?function_area=eq.{func_name.replace(' ', '%20')}&select=id,derived_archetype&limit=2000")

        mece_count = sum(1 for p in personas if p.get("derived_archetype") in mece_types)
        non_mece_count = len(personas) - mece_count
        expected = role_count * 4

        status = "✅" if mece_count == expected and non_mece_count == 0 else "❌"
        if status == "❌":
            all_good = False

        print(f"{func_name}:")
        print(f"  Roles: {role_count}")
        print(f"  MECE Personas: {mece_count} / {expected} expected")
        print(f"  Non-MECE (should be 0): {non_mece_count}")
        print(f"  Ratio: {mece_count/role_count:.1f} per role")
        print(f"  Status: {status}")
        print()

    return all_good

def main():
    print("=" * 70)
    print("MECE PERSONA MANAGER - CLEAN AND GENERATE")
    print("=" * 70)
    print()

    # Step 1: Delete non-MECE
    delete_non_mece_personas()

    time.sleep(1)

    # Step 2: Generate MECE
    generate_all_mece_personas()

    time.sleep(1)

    # Step 3: Verify
    success = verify_results()

    print("=" * 70)
    print("COMPLETE!" if success else "SOME ISSUES - CHECK LOGS")
    print("=" * 70)

if __name__ == "__main__":
    main()
