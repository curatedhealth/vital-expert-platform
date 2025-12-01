#!/usr/bin/env python3
"""
VITAL Platform - Normalized Ontology Seeder
============================================
Seeds reference tables and creates personas with proper junction table relationships.
Following Zero JSONB Policy for enterprise ontology.

Usage:
    python3 seed_normalized_ontology.py
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
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

def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:100]

# =============================================================================
# REFERENCE DATA - GOALS
# =============================================================================

REF_GOALS = [
    # Efficiency Goals
    {"name": "Automate repetitive tasks", "goal_category": "efficiency", "description": "Leverage technology to automate manual, time-consuming tasks"},
    {"name": "Maximize efficiency through technology", "goal_category": "efficiency", "description": "Use digital tools to streamline workflows and reduce time waste"},
    {"name": "Reduce administrative burden", "goal_category": "efficiency", "description": "Minimize non-value-added administrative activities"},
    {"name": "Optimize team workflows", "goal_category": "efficiency", "description": "Improve team processes for better throughput"},
    {"name": "Standardize processes", "goal_category": "efficiency", "description": "Create consistent, repeatable processes across the organization"},

    # Growth Goals
    {"name": "Develop new skills", "goal_category": "growth", "description": "Acquire competencies for career advancement"},
    {"name": "Build expertise", "goal_category": "growth", "description": "Deepen knowledge in specialized areas"},
    {"name": "Advance career", "goal_category": "growth", "description": "Progress to higher-level positions"},
    {"name": "Stay ahead of AI trends", "goal_category": "growth", "description": "Maintain current knowledge of AI developments"},
    {"name": "Build scalable processes", "goal_category": "growth", "description": "Create systems that can grow with the organization"},

    # Quality Goals
    {"name": "Ensure quality and accuracy", "goal_category": "quality", "description": "Maintain high standards in all deliverables"},
    {"name": "Maintain compliance", "goal_category": "compliance", "description": "Adhere to regulatory requirements and internal policies"},
    {"name": "Protect patient safety", "goal_category": "quality", "description": "Prioritize patient welfare in all decisions"},
    {"name": "Validate before adopting", "goal_category": "quality", "description": "Thoroughly test new approaches before implementation"},

    # Collaboration Goals
    {"name": "Improve cross-functional collaboration", "goal_category": "collaboration", "description": "Work effectively across departmental boundaries"},
    {"name": "Scale best practices", "goal_category": "collaboration", "description": "Share successful approaches across teams"},
    {"name": "Build KOL relationships", "goal_category": "collaboration", "description": "Establish trusted partnerships with key opinion leaders"},
    {"name": "Strengthen stakeholder engagement", "goal_category": "collaboration", "description": "Improve relationships with internal and external stakeholders"},

    # Innovation Goals
    {"name": "Drive innovation", "goal_category": "innovation", "description": "Introduce new ideas and approaches"},
    {"name": "Future-proof career", "goal_category": "innovation", "description": "Prepare for evolving industry requirements"},
    {"name": "Understand AI capabilities", "goal_category": "innovation", "description": "Learn what AI can and cannot do effectively"},
]

# =============================================================================
# REFERENCE DATA - CHALLENGES
# =============================================================================

REF_CHALLENGES = [
    # Technology Challenges
    {"name": "Legacy systems resistance", "challenge_category": "technology", "severity_level": "high", "description": "Difficulty integrating with outdated systems"},
    {"name": "Data integration barriers", "challenge_category": "technology", "severity_level": "high", "description": "Challenges connecting disparate data sources"},
    {"name": "Tool proliferation", "challenge_category": "technology", "severity_level": "medium", "description": "Too many tools creating confusion and inefficiency"},
    {"name": "Fast-changing technology", "challenge_category": "technology", "severity_level": "medium", "description": "Difficulty keeping pace with technological changes"},
    {"name": "Technical debt", "challenge_category": "technology", "severity_level": "high", "description": "Accumulated technical shortcuts impeding progress"},

    # Organizational Challenges
    {"name": "Change management", "challenge_category": "organizational", "severity_level": "high", "description": "Resistance to organizational changes"},
    {"name": "Stakeholder alignment", "challenge_category": "organizational", "severity_level": "high", "description": "Getting diverse stakeholders to agree"},
    {"name": "Resource constraints", "challenge_category": "organizational", "severity_level": "high", "description": "Limited budget, people, or time"},
    {"name": "Siloed information", "challenge_category": "organizational", "severity_level": "high", "description": "Information trapped in departmental silos"},
    {"name": "Competing priorities", "challenge_category": "organizational", "severity_level": "high", "description": "Multiple urgent demands requiring prioritization"},

    # Process Challenges
    {"name": "Process complexity", "challenge_category": "process", "severity_level": "medium", "description": "Overly complicated workflows"},
    {"name": "Inconsistent processes", "challenge_category": "process", "severity_level": "medium", "description": "Lack of standardization across teams"},
    {"name": "Manual processes", "challenge_category": "process", "severity_level": "medium", "description": "Reliance on labor-intensive manual work"},
    {"name": "Slow adoption cycles", "challenge_category": "process", "severity_level": "medium", "description": "Long timelines to implement new approaches"},

    # Learning Challenges
    {"name": "Information overload", "challenge_category": "learning", "severity_level": "medium", "description": "Too much information to process effectively"},
    {"name": "Time for learning", "challenge_category": "learning", "severity_level": "medium", "description": "Insufficient time allocated for skill development"},
    {"name": "Skill gaps", "challenge_category": "learning", "severity_level": "high", "description": "Missing competencies needed for the role"},
    {"name": "Unclear career paths", "challenge_category": "learning", "severity_level": "medium", "description": "Lack of visibility into advancement opportunities"},
    {"name": "Limited training resources", "challenge_category": "learning", "severity_level": "medium", "description": "Insufficient access to learning materials"},

    # Compliance Challenges
    {"name": "Pressure to adopt quickly", "challenge_category": "compliance", "severity_level": "high", "description": "Business urgency conflicting with due diligence"},
    {"name": "Unproven technologies", "challenge_category": "compliance", "severity_level": "high", "description": "Expectations to use untested solutions"},
    {"name": "Risk assessment difficulty", "challenge_category": "compliance", "severity_level": "high", "description": "Challenges evaluating potential risks"},
    {"name": "Compliance concerns", "challenge_category": "compliance", "severity_level": "critical", "description": "Regulatory compliance requirements adding complexity"},
    {"name": "Rushed implementations", "challenge_category": "compliance", "severity_level": "high", "description": "Inadequate time for proper validation"},

    # Communication Challenges
    {"name": "Communication gaps", "challenge_category": "communication", "severity_level": "medium", "description": "Breakdowns in information flow"},
    {"name": "Meeting overload", "challenge_category": "communication", "severity_level": "medium", "description": "Excessive time spent in meetings"},
]

# =============================================================================
# REFERENCE DATA - MOTIVATIONS
# =============================================================================

REF_MOTIVATIONS = [
    # Intrinsic Motivations
    {"name": "Efficiency gains", "motivation_type": "intrinsic", "description": "Satisfaction from improving processes"},
    {"name": "Technical mastery", "motivation_type": "intrinsic", "description": "Drive to excel at technical skills"},
    {"name": "Intellectual curiosity", "motivation_type": "intrinsic", "description": "Desire to understand how things work"},
    {"name": "Knowledge acquisition", "motivation_type": "intrinsic", "description": "Joy of learning new things"},
    {"name": "Quality assurance", "motivation_type": "intrinsic", "description": "Pride in producing excellent work"},
    {"name": "Professional integrity", "motivation_type": "intrinsic", "description": "Commitment to ethical standards"},

    # Extrinsic Motivations
    {"name": "Innovation recognition", "motivation_type": "extrinsic", "description": "Recognition for innovative contributions"},
    {"name": "Organizational recognition", "motivation_type": "extrinsic", "description": "Acknowledgment from leadership"},
    {"name": "Team success", "motivation_type": "extrinsic", "description": "Achieving goals as a team"},
    {"name": "Process excellence", "motivation_type": "extrinsic", "description": "Building best-in-class processes"},

    # Career Motivations
    {"name": "Professional growth", "motivation_type": "career", "description": "Advancing in one's profession"},
    {"name": "Career advancement", "motivation_type": "career", "description": "Moving to higher positions"},
    {"name": "Future-proofing career", "motivation_type": "career", "description": "Building skills for future demands"},

    # Impact Motivations
    {"name": "Patient safety", "motivation_type": "impact", "description": "Protecting and improving patient outcomes"},
    {"name": "Risk mitigation", "motivation_type": "impact", "description": "Preventing negative outcomes"},
    {"name": "Strategic impact", "motivation_type": "impact", "description": "Making meaningful business contributions"},
]

# =============================================================================
# REFERENCE DATA - FRUSTRATIONS
# =============================================================================

REF_FRUSTRATIONS = [
    # Process Frustrations
    {"name": "Manual processes", "frustration_category": "process", "impact_level": "high", "description": "Having to do things manually that could be automated"},
    {"name": "Outdated tools", "frustration_category": "process", "impact_level": "high", "description": "Working with obsolete technology"},
    {"name": "Inconsistent processes", "frustration_category": "process", "impact_level": "medium", "description": "Different teams doing things differently"},

    # Technology Frustrations
    {"name": "Slow adoption cycles", "frustration_category": "technology", "impact_level": "medium", "description": "Long wait times for new technology approval"},
    {"name": "Technical debt", "frustration_category": "technology", "impact_level": "high", "description": "Dealing with poorly designed legacy systems"},
    {"name": "Learning curve", "frustration_category": "technology", "impact_level": "medium", "description": "Time required to learn new systems"},

    # Communication Frustrations
    {"name": "Siloed information", "frustration_category": "communication", "impact_level": "high", "description": "Difficulty accessing information across departments"},
    {"name": "Meeting overload", "frustration_category": "communication", "impact_level": "medium", "description": "Too many meetings reducing productive time"},
    {"name": "Competing priorities", "frustration_category": "communication", "impact_level": "high", "description": "Unclear direction on what matters most"},

    # Compliance Frustrations
    {"name": "Rushed implementations", "frustration_category": "compliance", "impact_level": "critical", "description": "Pressure to deploy without proper validation"},
    {"name": "Hype over substance", "frustration_category": "compliance", "impact_level": "medium", "description": "New technologies promised without evidence"},
    {"name": "Inadequate validation", "frustration_category": "compliance", "impact_level": "critical", "description": "Insufficient testing before deployment"},
    {"name": "Compliance concerns", "frustration_category": "compliance", "impact_level": "critical", "description": "Worry about regulatory non-compliance"},

    # Resource Frustrations
    {"name": "Limited training resources", "frustration_category": "resource", "impact_level": "medium", "description": "Not enough learning opportunities"},
    {"name": "Resource constraints", "frustration_category": "resource", "impact_level": "high", "description": "Insufficient budget or headcount"},
]

# =============================================================================
# REFERENCE DATA - GXP TYPES
# =============================================================================

REF_GXP_TYPES = [
    {"code": "GCP", "name": "Good Clinical Practice", "description": "Standards for clinical trials involving human subjects", "regulatory_body": "ICH"},
    {"code": "GVP", "name": "Good Pharmacovigilance Practice", "description": "Standards for drug safety monitoring and reporting", "regulatory_body": "EMA/FDA"},
    {"code": "GMP", "name": "Good Manufacturing Practice", "description": "Standards for pharmaceutical manufacturing", "regulatory_body": "FDA/EMA"},
    {"code": "GLP", "name": "Good Laboratory Practice", "description": "Standards for non-clinical laboratory studies", "regulatory_body": "OECD"},
    {"code": "GDP", "name": "Good Distribution Practice", "description": "Standards for pharmaceutical distribution", "regulatory_body": "EMA"},
    {"code": "GDocP", "name": "Good Documentation Practice", "description": "Standards for pharmaceutical documentation", "regulatory_body": "Various"},
]

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
        "ai_maturity_level": 3,
        "tech_adoption_profile": "early_majority"
    },
    "LEARNER": {
        "suffix": "Learner",
        "description_addon": "Curious professional eager to develop new skills and understand emerging technologies. Values continuous learning and seeks mentorship and training opportunities.",
        "goals": ["Develop new skills", "Understand AI capabilities", "Build expertise", "Advance career"],
        "challenges": ["Information overload", "Time for learning", "Skill gaps", "Unclear career paths"],
        "motivations": ["Professional growth", "Knowledge acquisition", "Career advancement", "Intellectual curiosity"],
        "frustrations": ["Limited training resources", "Fast-changing technology", "Learning curve", "Skill gaps"],
        "ai_maturity_level": 2,
        "tech_adoption_profile": "late_majority"
    },
    "SKEPTIC": {
        "suffix": "Skeptic",
        "description_addon": "Cautious professional who prioritizes proven methods and thorough validation. Values reliability over novelty and requires strong evidence before adopting new approaches.",
        "goals": ["Ensure quality and accuracy", "Maintain compliance", "Validate before adopting", "Protect patient safety"],
        "challenges": ["Pressure to adopt quickly", "Unproven technologies", "Risk assessment difficulty", "Compliance concerns"],
        "motivations": ["Quality assurance", "Risk mitigation", "Patient safety", "Professional integrity"],
        "frustrations": ["Rushed implementations", "Hype over substance", "Inadequate validation", "Compliance concerns"],
        "ai_maturity_level": 1,
        "tech_adoption_profile": "laggard"
    }
}

# =============================================================================
# API HELPERS
# =============================================================================

def supabase_request(method: str, table: str, data: Optional[List] = None, params: str = "") -> dict:
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

def batch_insert(table: str, data: List[dict], batch_size: int = 100) -> int:
    """Insert data in batches and return count of successful inserts."""
    total = 0
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        result = supabase_request("POST", table, batch)
        if result["success"]:
            total += len(batch)
        else:
            print(f"      Batch {i//batch_size + 1} error: {result.get('error', 'Unknown')[:200]}")
    return total

# =============================================================================
# SEEDING FUNCTIONS
# =============================================================================

def seed_reference_tables() -> Dict[str, Dict[str, str]]:
    """Seed all reference tables and return slug->id maps."""
    print("\n" + "=" * 60)
    print("SEEDING REFERENCE TABLES")
    print("=" * 60)

    maps = {}

    # Seed Goals
    print("\n[1/6] Seeding ref_goals...")
    goals_data = [{"id": str(uuid.uuid4()), "name": g["name"], "slug": slugify(g["name"]),
                   "description": g.get("description"), "goal_category": g.get("goal_category")}
                  for g in REF_GOALS]
    count = batch_insert("ref_goals", goals_data)
    maps["goals"] = {g["slug"]: g["id"] for g in goals_data}
    print(f"      Inserted {count}/{len(goals_data)} goals")

    # Seed Challenges
    print("\n[2/6] Seeding ref_challenges...")
    challenges_data = [{"id": str(uuid.uuid4()), "name": c["name"], "slug": slugify(c["name"]),
                        "description": c.get("description"), "challenge_category": c.get("challenge_category"),
                        "severity_level": c.get("severity_level")}
                       for c in REF_CHALLENGES]
    count = batch_insert("ref_challenges", challenges_data)
    maps["challenges"] = {c["slug"]: c["id"] for c in challenges_data}
    print(f"      Inserted {count}/{len(challenges_data)} challenges")

    # Seed Motivations
    print("\n[3/6] Seeding ref_motivations...")
    motivations_data = [{"id": str(uuid.uuid4()), "name": m["name"], "slug": slugify(m["name"]),
                         "description": m.get("description"), "motivation_type": m.get("motivation_type")}
                        for m in REF_MOTIVATIONS]
    count = batch_insert("ref_motivations", motivations_data)
    maps["motivations"] = {m["slug"]: m["id"] for m in motivations_data}
    print(f"      Inserted {count}/{len(motivations_data)} motivations")

    # Seed Frustrations
    print("\n[4/6] Seeding ref_frustrations...")
    frustrations_data = [{"id": str(uuid.uuid4()), "name": f["name"], "slug": slugify(f["name"]),
                          "description": f.get("description"), "frustration_category": f.get("frustration_category"),
                          "impact_level": f.get("impact_level")}
                         for f in REF_FRUSTRATIONS]
    count = batch_insert("ref_frustrations", frustrations_data)
    maps["frustrations"] = {f["slug"]: f["id"] for f in frustrations_data}
    print(f"      Inserted {count}/{len(frustrations_data)} frustrations")

    # Seed GxP Types
    print("\n[5/6] Seeding ref_gxp_types...")
    gxp_data = [{"id": str(uuid.uuid4()), "code": g["code"], "name": g["name"],
                 "description": g.get("description"), "regulatory_body": g.get("regulatory_body")}
                for g in REF_GXP_TYPES]
    count = batch_insert("ref_gxp_types", gxp_data)
    maps["gxp_types"] = {g["code"]: g["id"] for g in gxp_data}
    print(f"      Inserted {count}/{len(gxp_data)} GxP types")

    print("\n[6/6] Fetching existing reference data for junction tables...")
    # Query back the actual IDs from DB in case of upserts
    for table, key in [("ref_goals", "slug"), ("ref_challenges", "slug"),
                       ("ref_motivations", "slug"), ("ref_frustrations", "slug"),
                       ("ref_gxp_types", "code")]:
        result = supabase_request("GET", table, params=f"select=id,{key}")
        if result["success"]:
            map_name = table.replace("ref_", "") + ("" if key == "code" else "")
            if table == "ref_gxp_types":
                maps["gxp_types"] = {r["code"]: r["id"] for r in result["data"]}
            else:
                maps[table.replace("ref_", "")] = {r[key]: r["id"] for r in result["data"]}

    return maps

def fetch_existing_roles() -> List[dict]:
    """Fetch all existing roles from the database."""
    print("\n[INFO] Fetching existing roles...")

    result = supabase_request("GET", "org_roles",
                              params="select=id,name,slug,description,seniority_level,geographic_scope,department_id")

    if result["success"]:
        roles = result["data"]
        print(f"      Found {len(roles)} roles")
        return roles
    else:
        print(f"      Error fetching roles: {result.get('error')}")
        return []

def create_personas_normalized(roles: List[dict], ref_maps: Dict[str, Dict[str, str]]) -> int:
    """Create personas with normalized junction table entries."""
    print("\n" + "=" * 60)
    print("CREATING NORMALIZED PERSONAS")
    print("=" * 60)

    total_personas = 0
    total_junctions = {"goals": 0, "challenges": 0, "motivations": 0, "frustrations": 0}

    # Process in batches
    batch_size = 50

    for batch_idx in range(0, len(roles), batch_size):
        batch_roles = roles[batch_idx:batch_idx + batch_size]

        personas_batch = []
        goals_junctions = []
        challenges_junctions = []
        motivations_junctions = []
        frustrations_junctions = []

        for role in batch_roles:
            for archetype_key, archetype in ARCHETYPE_TEMPLATES.items():
                persona_id = str(uuid.uuid4())

                # Build persona name
                role_name = role["name"]
                persona_name = f"{role_name} - {archetype['suffix']}"
                unique_id = f"PERSONA-{role['slug'].upper().replace('-', '_')[:30]}-{archetype_key[:3]}"

                # Build description
                role_desc = role.get("description", f"Professional in the {role_name} role")
                full_description = f"{role_desc} {archetype['description_addon']}"

                # Create persona record (without JSONB arrays)
                persona = {
                    "id": persona_id,
                    "unique_id": unique_id[:50],
                    "persona_name": persona_name[:255],
                    "persona_type": archetype_key,
                    "source_role_id": role["id"],
                    "title": role_name[:255],
                    "description": full_description[:2000],
                    "department": "Medical Affairs",
                    "function_area": "Medical Affairs",
                    "geographic_scope": role.get("geographic_scope", "global"),
                    "experience_level": role.get("seniority_level", "mid"),
                    "is_active": True,
                    # Empty arrays for legacy compatibility
                    "goals": [],
                    "challenges": [],
                    "motivations": [],
                    "frustrations": [],
                    "daily_activities": [],
                    "tools_used": [],
                    "skills": [],
                    "competencies": []
                }
                personas_batch.append(persona)

                # Create junction entries for goals
                for idx, goal_name in enumerate(archetype["goals"]):
                    goal_slug = slugify(goal_name)
                    goal_id = ref_maps.get("goals", {}).get(goal_slug)
                    if goal_id:
                        goals_junctions.append({
                            "id": str(uuid.uuid4()),
                            "persona_id": persona_id,
                            "goal_id": goal_id,
                            "priority_order": idx,
                            "importance_weight": 1.0 - (idx * 0.1)
                        })

                # Create junction entries for challenges
                for idx, challenge_name in enumerate(archetype["challenges"]):
                    challenge_slug = slugify(challenge_name)
                    challenge_id = ref_maps.get("challenges", {}).get(challenge_slug)
                    if challenge_id:
                        challenges_junctions.append({
                            "id": str(uuid.uuid4()),
                            "persona_id": persona_id,
                            "challenge_id": challenge_id,
                            "priority_order": idx
                        })

                # Create junction entries for motivations
                for idx, motivation_name in enumerate(archetype["motivations"]):
                    motivation_slug = slugify(motivation_name)
                    motivation_id = ref_maps.get("motivations", {}).get(motivation_slug)
                    if motivation_id:
                        motivations_junctions.append({
                            "id": str(uuid.uuid4()),
                            "persona_id": persona_id,
                            "motivation_id": motivation_id,
                            "priority_order": idx,
                            "strength_level": "high" if idx == 0 else "medium"
                        })

                # Create junction entries for frustrations
                for idx, frustration_name in enumerate(archetype["frustrations"]):
                    frustration_slug = slugify(frustration_name)
                    frustration_id = ref_maps.get("frustrations", {}).get(frustration_slug)
                    if frustration_id:
                        frustrations_junctions.append({
                            "id": str(uuid.uuid4()),
                            "persona_id": persona_id,
                            "frustration_id": frustration_id,
                            "priority_order": idx,
                            "frequency": "often" if idx == 0 else "sometimes"
                        })

        # Insert personas batch
        result = supabase_request("POST", "personas", personas_batch)
        if result["success"]:
            total_personas += len(personas_batch)
            print(f"   Batch {batch_idx//batch_size + 1}: Created {len(personas_batch)} personas")
        else:
            print(f"   Batch {batch_idx//batch_size + 1}: Error - {result.get('error', '')[:200]}")
            continue  # Skip junctions if personas failed

        # Insert junction tables
        if goals_junctions:
            count = batch_insert("persona_goals", goals_junctions)
            total_junctions["goals"] += count

        if challenges_junctions:
            count = batch_insert("persona_challenges", challenges_junctions)
            total_junctions["challenges"] += count

        if motivations_junctions:
            count = batch_insert("persona_motivations", motivations_junctions)
            total_junctions["motivations"] += count

        if frustrations_junctions:
            count = batch_insert("persona_frustrations", frustrations_junctions)
            total_junctions["frustrations"] += count

    print(f"\n   Total personas created: {total_personas}")
    print(f"   Junction records: goals={total_junctions['goals']}, challenges={total_junctions['challenges']}, "
          f"motivations={total_junctions['motivations']}, frustrations={total_junctions['frustrations']}")

    return total_personas

def clear_existing_personas():
    """Clear existing personas to avoid duplicates."""
    print("\n[INFO] Clearing existing persona data...")

    # Clear junction tables first (due to FK constraints)
    for table in ["persona_goals", "persona_challenges", "persona_motivations", "persona_frustrations"]:
        result = supabase_request("DELETE", table, params="id=neq.00000000-0000-0000-0000-000000000000")
        if result["success"]:
            print(f"      Cleared {table}")
        else:
            print(f"      Note: {table} may not exist yet or is empty")

    # Don't clear personas - we'll upsert them

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("VITAL Platform - Normalized Ontology Seeder")
    print("=" * 60)
    print(f"\nTarget: {SUPABASE_URL}")
    print(f"Started: {datetime.now().isoformat()}")

    # Step 1: Seed reference tables
    ref_maps = seed_reference_tables()

    # Step 2: Fetch existing roles
    roles = fetch_existing_roles()
    if not roles:
        print("\nNo roles found. Cannot create personas without roles.")
        return

    # Step 3: Clear existing junction data
    clear_existing_personas()

    # Step 4: Create personas with normalized data
    persona_count = create_personas_normalized(roles, ref_maps)

    # Summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE")
    print("=" * 60)
    print(f"\nSummary:")
    print(f"   Reference Goals: {len(ref_maps.get('goals', {}))}")
    print(f"   Reference Challenges: {len(ref_maps.get('challenges', {}))}")
    print(f"   Reference Motivations: {len(ref_maps.get('motivations', {}))}")
    print(f"   Reference Frustrations: {len(ref_maps.get('frustrations', {}))}")
    print(f"   Reference GxP Types: {len(ref_maps.get('gxp_types', {}))}")
    print(f"   Roles processed: {len(roles)}")
    print(f"   Personas created: {persona_count} (4 archetypes × {len(roles)} roles)")
    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
