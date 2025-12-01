#!/usr/bin/env python3
"""
VITAL Platform - Organization Structure & Personas Seeder
=========================================================
Seeds: org_functions → org_departments → org_roles → personas (4 per role)

Usage:
    python3 seed_org_structure.py
"""

import requests
import json
import uuid
from datetime import datetime

# Supabase Configuration
SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# =============================================================================
# REFERENCE DATA: Business Functions (matching actual schema)
# =============================================================================
FUNCTIONS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Medical Affairs",
        "slug": "medical-affairs",
        "description": "Scientific and medical expertise bridging R&D and Commercial, ensuring evidence-based medicine and HCP engagement",
        "mission_statement": "To provide scientific leadership and medical expertise that advances patient care through evidence-based engagement with healthcare professionals",
        "regulatory_sensitivity": "high",
        "strategic_priority": 90
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Commercial",
        "slug": "commercial",
        "description": "Sales, marketing, and market access functions driving revenue and market presence",
        "mission_statement": "To maximize product value and patient access through strategic commercial excellence",
        "regulatory_sensitivity": "high",
        "strategic_priority": 95
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Research & Development",
        "slug": "research-development",
        "description": "Drug discovery, clinical development, and regulatory submissions",
        "mission_statement": "To discover and develop innovative medicines that transform patient lives",
        "regulatory_sensitivity": "high",
        "strategic_priority": 100
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Regulatory Affairs",
        "slug": "regulatory-affairs",
        "description": "Regulatory strategy, submissions, and compliance across global markets",
        "mission_statement": "To enable timely market access through regulatory excellence and compliance",
        "regulatory_sensitivity": "high",
        "strategic_priority": 85
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pharmacovigilance",
        "slug": "pharmacovigilance",
        "description": "Drug safety monitoring, adverse event reporting, and risk management",
        "mission_statement": "To protect patient safety through proactive risk management and pharmacovigilance",
        "regulatory_sensitivity": "high",
        "strategic_priority": 88
    }
]

# =============================================================================
# REFERENCE DATA: Departments (Medical Affairs Focus) - matching actual schema
# =============================================================================
DEPARTMENTS = [
    {
        "name": "Field Medical",
        "slug": "field-medical",
        "description": "Medical Science Liaisons and field-based medical teams engaging with KOLs and HCPs",
        "operating_model": "field",
        "field_vs_office_mix": 80,
        "typical_team_size_min": 5,
        "typical_team_size_max": 50,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Medical Information",
        "slug": "medical-information",
        "description": "Responds to unsolicited medical inquiries from HCPs and consumers with accurate, balanced information",
        "operating_model": "office",
        "field_vs_office_mix": 5,
        "typical_team_size_min": 3,
        "typical_team_size_max": 20,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Scientific Communications",
        "slug": "scientific-communications",
        "description": "Medical writing, publications planning, and scientific content development",
        "operating_model": "office",
        "field_vs_office_mix": 10,
        "typical_team_size_min": 5,
        "typical_team_size_max": 25,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Medical Education",
        "slug": "medical-education",
        "description": "Healthcare professional education programs, CME/CE activities, and scientific training",
        "operating_model": "hybrid",
        "field_vs_office_mix": 40,
        "typical_team_size_min": 3,
        "typical_team_size_max": 15,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Health Economics & Outcomes Research",
        "slug": "heor",
        "description": "Real-world evidence, health economics modeling, and outcomes research",
        "operating_model": "office",
        "field_vs_office_mix": 15,
        "typical_team_size_min": 3,
        "typical_team_size_max": 20,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Medical Strategy",
        "slug": "medical-strategy",
        "description": "Medical affairs strategy, planning, and cross-functional medical leadership",
        "operating_model": "hybrid",
        "field_vs_office_mix": 20,
        "typical_team_size_min": 2,
        "typical_team_size_max": 10,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Clinical Operations Support",
        "slug": "clinical-operations-support",
        "description": "Support for clinical trials, investigator-initiated studies, and medical monitoring",
        "operating_model": "hybrid",
        "field_vs_office_mix": 30,
        "typical_team_size_min": 3,
        "typical_team_size_max": 15,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Medical Governance",
        "slug": "medical-governance",
        "description": "Medical compliance, governance, and quality assurance",
        "operating_model": "office",
        "field_vs_office_mix": 10,
        "typical_team_size_min": 2,
        "typical_team_size_max": 10,
        "function_slug": "medical-affairs"
    },
    {
        "name": "Medical Affairs Leadership",
        "slug": "medical-affairs-leadership",
        "description": "Executive medical leadership including CMO office and VP-level positions",
        "operating_model": "hybrid",
        "field_vs_office_mix": 25,
        "typical_team_size_min": 3,
        "typical_team_size_max": 15,
        "function_slug": "medical-affairs"
    }
]

# =============================================================================
# REFERENCE DATA: Roles by Department
# =============================================================================
ROLES_BY_DEPARTMENT = {
    "DEPT-FIELD-MED": [
        # MSL Track
        {"name": "Medical Science Liaison", "slug": "msl", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Senior Medical Science Liaison", "slug": "senior-msl", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Field Team Lead", "slug": "field-team-lead", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "MSL Manager", "slug": "msl-manager", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Field Medical Director", "slug": "field-medical-director", "seniority": "director", "geo_scopes": ["global", "regional", "local"]},
    ],
    "DEPT-MED-INFO": [
        {"name": "Medical Information Associate", "slug": "mi-associate", "seniority": "entry", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Information Specialist", "slug": "mi-specialist", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Information Scientist", "slug": "mi-scientist", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Information Manager", "slug": "mi-manager", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "MI Operations Lead", "slug": "mi-ops-lead", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Communications Specialist", "slug": "med-comms-specialist", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
    ],
    "DEPT-SCI-COMM": [
        {"name": "Medical Writer", "slug": "medical-writer", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Senior Medical Writer", "slug": "senior-medical-writer", "seniority": "senior", "geo_scopes": ["global", "regional"]},
        {"name": "Publication Planner", "slug": "publication-planner", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Publications Manager", "slug": "publications-manager", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Publications Lead", "slug": "publications-lead", "seniority": "senior", "geo_scopes": ["global", "regional"]},
        {"name": "Scientific Communications Manager", "slug": "sci-comms-manager", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
    ],
    "DEPT-MED-ED": [
        {"name": "Scientific Trainer", "slug": "scientific-trainer", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Education Specialist", "slug": "med-ed-specialist", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Education Strategist", "slug": "med-ed-strategist", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Education Manager", "slug": "med-ed-manager", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Digital Medical Education Lead", "slug": "digital-med-ed-lead", "seniority": "senior", "geo_scopes": ["global", "regional"]},
    ],
    "DEPT-HEOR": [
        {"name": "Health Economist", "slug": "health-economist", "seniority": "mid", "geo_scopes": ["global", "regional"]},
        {"name": "Economic Modeler", "slug": "economic-modeler", "seniority": "senior", "geo_scopes": ["global", "regional"]},
        {"name": "Real-World Evidence Analyst", "slug": "rwe-analyst", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Real-World Evidence Lead", "slug": "rwe-lead", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "HEOR Project Manager", "slug": "heor-pm", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "HEOR Director", "slug": "heor-director", "seniority": "director", "geo_scopes": ["global", "regional"]},
    ],
    "DEPT-CLIN-OPS": [
        {"name": "Clinical Operations Analyst", "slug": "clin-ops-analyst", "seniority": "entry", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Clinical Operations Liaison", "slug": "clin-ops-liaison", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Liaison Clinical Trials", "slug": "med-liaison-ct", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "IIS Coordinator", "slug": "iis-coordinator", "seniority": "mid", "geo_scopes": ["global", "regional"]},
    ],
    "DEPT-MED-GOV": [
        {"name": "Medical Compliance Specialist", "slug": "med-compliance-specialist", "seniority": "mid", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Governance Officer", "slug": "med-governance-officer", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Medical Excellence Lead", "slug": "med-excellence-lead", "seniority": "senior", "geo_scopes": ["global", "regional", "local"]},
    ],
    "DEPT-MED-LEAD": [
        {"name": "Medical Director", "slug": "medical-director", "seniority": "director", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Senior Medical Director", "slug": "senior-medical-director", "seniority": "director", "geo_scopes": ["global", "regional"]},
        {"name": "VP Medical Affairs", "slug": "vp-medical-affairs", "seniority": "executive", "geo_scopes": ["global", "regional", "local"]},
        {"name": "Chief Medical Officer", "slug": "cmo", "seniority": "c_suite", "geo_scopes": ["global", "regional", "local"]},
    ],
}

# =============================================================================
# ROLE ENRICHMENT DATA
# =============================================================================
ROLE_ENRICHMENT = {
    "msl": {
        "description": "Serves as a scientific expert and trusted advisor to key opinion leaders, providing balanced, evidence-based information on therapeutic areas and clinical data.",
        "years_experience_min": 3, "years_experience_max": 8,
        "travel_percentage_min": 50, "travel_percentage_max": 70,
        "typical_education_level": "PharmD, PhD, or MD",
        "gxp_critical": True, "gxp_types": ["GCP", "GVP"],
        "hcp_facing": True, "patient_facing": False, "safety_critical": True,
        "work_location_model": "field",
        "role_kpis": ["Tier 1 KOL interactions (100-120/year)", "Field insights submitted (24/year)", "Scientific presentation quality (4.5/5.0)", "Congress attendance (4-6/year)"],
        "clinical_competencies": ["Clinical data interpretation", "Scientific communication", "KOL relationship management", "Evidence-based medicine"],
        "technical_skills": ["Veeva CRM", "Medical Insights Platform", "Literature databases", "Slide libraries"],
        "soft_skills": ["Presentation skills", "Relationship building", "Active listening", "Adaptability"],
        "top_responsibilities": ["Build KOL relationships", "Provide scientific information", "Report field insights", "Support IITs", "Deliver congress presentations", "Report adverse events"],
        "regulatory_frameworks": ["ICH GCP E6", "PhRMA Code", "Sunshine Act", "GVP Module VI"],
    },
    "senior-msl": {
        "description": "Expert Medical Science Liaison with advanced therapeutic area knowledge, peer mentoring responsibilities, and strategic KOL engagement.",
        "years_experience_min": 5, "years_experience_max": 12,
        "travel_percentage_min": 55, "travel_percentage_max": 75,
        "typical_education_level": "PharmD, PhD, or MD",
        "gxp_critical": True, "gxp_types": ["GCP", "GVP"],
        "hcp_facing": True, "patient_facing": False, "safety_critical": True,
        "work_location_model": "field",
        "role_kpis": ["Tier 1 KOL interactions (120-150/year)", "High-value insights (30/year)", "Mentee performance", "Strategic initiative leadership"],
        "clinical_competencies": ["Advanced clinical data interpretation", "Therapeutic area expertise", "Strategic thinking", "Mentoring"],
        "technical_skills": ["Veeva CRM", "Medical Insights Platform", "Advisory board planning"],
        "soft_skills": ["Leadership", "Coaching", "Strategic communication", "Conflict resolution"],
        "top_responsibilities": ["Lead strategic KOL engagements", "Mentor junior MSLs", "Drive therapeutic area strategy", "Lead advisory boards", "Represent at congresses"],
        "regulatory_frameworks": ["ICH GCP E6", "PhRMA Code", "Sunshine Act", "GVP Module VI"],
    },
    "mi-specialist": {
        "description": "Provides accurate, balanced scientific and medical information in response to unsolicited inquiries from healthcare professionals and consumers.",
        "years_experience_min": 2, "years_experience_max": 5,
        "travel_percentage_min": 0, "travel_percentage_max": 10,
        "typical_education_level": "PharmD or PhD",
        "gxp_critical": True, "gxp_types": ["GVP"],
        "hcp_facing": True, "patient_facing": True, "safety_critical": True,
        "work_location_model": "remote",
        "role_kpis": ["Response time (24-48 hours)", "Quality score (4.5/5.0)", "Inquiry volume (200-300/year)", "Accuracy rate (>98%)"],
        "clinical_competencies": ["Drug information", "Literature review", "Medical writing", "Pharmacovigilance"],
        "technical_skills": ["MI response systems", "Safety databases", "Literature databases", "CRM systems"],
        "soft_skills": ["Attention to detail", "Time management", "Written communication", "Empathy"],
        "top_responsibilities": ["Respond to medical inquiries", "Maintain response templates", "Identify safety signals", "Document AEs", "Quality reviews"],
        "regulatory_frameworks": ["FDA Promotional Guidelines", "GVP Module VI", "HIPAA"],
    },
    "medical-writer": {
        "description": "Creates clear, accurate, and compliant scientific documents including manuscripts, abstracts, posters, and regulatory submissions.",
        "years_experience_min": 2, "years_experience_max": 7,
        "travel_percentage_min": 5, "travel_percentage_max": 15,
        "typical_education_level": "PhD or PharmD",
        "gxp_critical": True, "gxp_types": ["GCP"],
        "hcp_facing": False, "patient_facing": False, "safety_critical": False,
        "work_location_model": "hybrid",
        "role_kpis": ["Documents delivered on time", "First-pass approval rate", "Publication acceptance rate", "Compliance score"],
        "clinical_competencies": ["Scientific writing", "Data visualization", "Statistical interpretation", "Regulatory writing"],
        "technical_skills": ["Document management systems", "Reference managers", "Statistical software", "Graphics tools"],
        "soft_skills": ["Attention to detail", "Project management", "Collaboration", "Deadline management"],
        "top_responsibilities": ["Write manuscripts", "Create congress materials", "Develop regulatory documents", "Review data accuracy", "Coordinate with authors"],
        "regulatory_frameworks": ["ICMJE Guidelines", "GPP3", "FDA labeling requirements"],
    },
    "medical-director": {
        "description": "Provides medical leadership and strategic direction for therapeutic area, including medical strategy, publication planning, and cross-functional collaboration.",
        "years_experience_min": 10, "years_experience_max": 20,
        "travel_percentage_min": 20, "travel_percentage_max": 40,
        "typical_education_level": "MD or PhD with clinical experience",
        "gxp_critical": True, "gxp_types": ["GCP", "GVP"],
        "hcp_facing": True, "patient_facing": False, "safety_critical": True,
        "work_location_model": "hybrid",
        "role_kpis": ["Medical strategy execution (90%)", "Publication plan delivery (8-12/year)", "Budget variance (<5%)", "Team engagement (>80%)"],
        "clinical_competencies": ["Medical strategy", "Clinical development oversight", "Regulatory interactions", "Publication planning"],
        "technical_skills": ["Budget management", "Strategic planning tools", "Portfolio management"],
        "soft_skills": ["Leadership", "Cross-functional collaboration", "Executive communication", "Decision making"],
        "top_responsibilities": ["Set medical strategy", "Lead cross-functional teams", "Manage budgets", "Engage with regulators", "Represent at advisory boards"],
        "regulatory_frameworks": ["All FDA regulations", "ICH guidelines", "PhRMA Code", "Global compliance"],
    },
    "cmo": {
        "description": "Chief Medical Officer providing executive medical leadership, strategic direction, and external medical representation for the organization.",
        "years_experience_min": 15, "years_experience_max": 30,
        "travel_percentage_min": 30, "travel_percentage_max": 50,
        "typical_education_level": "MD with board certification",
        "gxp_critical": True, "gxp_types": ["GCP", "GVP", "GMP"],
        "hcp_facing": True, "patient_facing": False, "safety_critical": True,
        "work_location_model": "hybrid",
        "role_kpis": ["Portfolio medical strategy", "Regulatory approvals", "Pipeline advancement", "Organization medical reputation"],
        "clinical_competencies": ["Executive medical leadership", "Regulatory strategy", "Clinical development", "Medical governance"],
        "technical_skills": ["Board presentations", "Investor communications", "Portfolio strategy"],
        "soft_skills": ["Executive presence", "Strategic vision", "Stakeholder management", "Crisis leadership"],
        "top_responsibilities": ["Set medical vision", "Lead medical organization", "Board/investor engagement", "Regulatory interactions", "External medical voice"],
        "regulatory_frameworks": ["FDA", "EMA", "PMDA", "Global regulatory frameworks"],
    },
}

# Default enrichment for roles without specific data
DEFAULT_ENRICHMENT = {
    "entry": {
        "years_experience_min": 0, "years_experience_max": 2,
        "travel_percentage_min": 5, "travel_percentage_max": 15,
        "typical_education_level": "Bachelor's or PharmD",
    },
    "mid": {
        "years_experience_min": 2, "years_experience_max": 5,
        "travel_percentage_min": 10, "travel_percentage_max": 25,
        "typical_education_level": "PharmD or Master's",
    },
    "senior": {
        "years_experience_min": 5, "years_experience_max": 10,
        "travel_percentage_min": 15, "travel_percentage_max": 35,
        "typical_education_level": "PharmD, PhD, or MD",
    },
    "director": {
        "years_experience_min": 10, "years_experience_max": 18,
        "travel_percentage_min": 20, "travel_percentage_max": 40,
        "typical_education_level": "PhD or MD",
    },
    "executive": {
        "years_experience_min": 15, "years_experience_max": 25,
        "travel_percentage_min": 25, "travel_percentage_max": 45,
        "typical_education_level": "MD with board certification",
    },
    "c_suite": {
        "years_experience_min": 20, "years_experience_max": 35,
        "travel_percentage_min": 30, "travel_percentage_max": 50,
        "typical_education_level": "MD with extensive experience",
    },
}

# =============================================================================
# PERSONA ARCHETYPE TEMPLATES
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
        "tech_adoption": "early_adopter",
        "tools_proficiency": "expert"
    },
    "ORCHESTRATOR": {
        "suffix": "Orchestrator",
        "description_addon": "Strategic coordinator who excels at managing complex workflows and cross-functional initiatives. Focuses on optimizing team dynamics and ensuring seamless collaboration across departments.",
        "goals": ["Optimize team workflows", "Improve cross-functional collaboration", "Standardize processes", "Scale best practices"],
        "challenges": ["Stakeholder alignment", "Resource constraints", "Process complexity", "Communication gaps"],
        "motivations": ["Team success", "Process excellence", "Strategic impact", "Organizational recognition"],
        "frustrations": ["Siloed information", "Inconsistent processes", "Meeting overload", "Competing priorities"],
        "ai_maturity_level": 3,
        "tech_adoption": "early_majority",
        "tools_proficiency": "advanced"
    },
    "LEARNER": {
        "suffix": "Learner",
        "description_addon": "Curious professional eager to develop new skills and understand emerging technologies. Values continuous learning and seeks mentorship and training opportunities.",
        "goals": ["Develop new skills", "Understand AI capabilities", "Build expertise", "Advance career"],
        "challenges": ["Information overload", "Time for learning", "Skill gaps", "Keeping current"],
        "motivations": ["Professional growth", "Knowledge acquisition", "Career advancement", "Intellectual curiosity"],
        "frustrations": ["Limited training resources", "Fast-changing technology", "Learning curve", "Unclear career paths"],
        "ai_maturity_level": 2,
        "tech_adoption": "late_majority",
        "tools_proficiency": "intermediate"
    },
    "SKEPTIC": {
        "suffix": "Skeptic",
        "description_addon": "Cautious professional who prioritizes proven methods and thorough validation. Values reliability over novelty and requires strong evidence before adopting new approaches.",
        "goals": ["Ensure quality and accuracy", "Maintain compliance", "Validate before adopting", "Protect patient safety"],
        "challenges": ["Pressure to adopt quickly", "Unproven technologies", "Risk assessment", "Maintaining standards"],
        "motivations": ["Quality assurance", "Risk mitigation", "Patient safety", "Professional integrity"],
        "frustrations": ["Rushed implementations", "Hype over substance", "Inadequate validation", "Compliance concerns"],
        "ai_maturity_level": 1,
        "tech_adoption": "laggard",
        "tools_proficiency": "basic"
    }
}

# =============================================================================
# API HELPER FUNCTIONS
# =============================================================================
def supabase_insert(table: str, data: list) -> dict:
    """Insert data into Supabase table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=HEADERS, json=data)
    if response.status_code in [200, 201]:
        return {"success": True, "data": response.json(), "count": len(data)}
    else:
        return {"success": False, "error": response.text, "status": response.status_code}

def supabase_upsert(table: str, data: list) -> dict:
    """Upsert data into Supabase table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"}
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        return {"success": True, "data": response.json(), "count": len(data)}
    else:
        return {"success": False, "error": response.text, "status": response.status_code}

# =============================================================================
# SEEDING FUNCTIONS
# =============================================================================
def seed_functions():
    """Seed org_functions table."""
    print("\n📦 Seeding org_functions...")
    result = supabase_upsert("org_functions", FUNCTIONS)
    if result["success"]:
        print(f"   ✅ Inserted {result['count']} functions")
    else:
        print(f"   ❌ Error: {result['error']}")
    return result

def seed_departments(function_slug_map: dict):
    """Seed org_departments table."""
    print("\n📦 Seeding org_departments...")

    departments_data = []
    for dept in DEPARTMENTS:
        func_id = function_slug_map.get(dept["function_slug"])
        if func_id:
            departments_data.append({
                "id": str(uuid.uuid4()),
                "name": dept["name"],
                "slug": dept["slug"],
                "description": dept["description"],
                "function_id": func_id,
                "operating_model": dept["operating_model"],
                "field_vs_office_mix": dept["field_vs_office_mix"],
                "typical_team_size_min": dept["typical_team_size_min"],
                "typical_team_size_max": dept["typical_team_size_max"]
            })

    result = supabase_upsert("org_departments", departments_data)
    if result["success"]:
        print(f"   ✅ Inserted {result['count']} departments")
    else:
        print(f"   ❌ Error: {result['error']}")
    return result

def seed_roles(department_slug_map: dict, function_slug_map: dict):
    """Seed org_roles table."""
    print("\n📦 Seeding org_roles...")

    # Map department slugs from ROLES_BY_DEPARTMENT keys
    dept_key_to_slug = {
        "DEPT-FIELD-MED": "field-medical",
        "DEPT-MED-INFO": "medical-information",
        "DEPT-SCI-COMM": "scientific-communications",
        "DEPT-MED-ED": "medical-education",
        "DEPT-HEOR": "heor",
        "DEPT-MED-STRAT": "medical-strategy",
        "DEPT-CLIN-OPS": "clinical-operations-support",
        "DEPT-MED-GOV": "medical-governance",
        "DEPT-MED-LEAD": "medical-affairs-leadership",
    }

    roles_data = []
    role_map = {}  # For tracking created roles

    func_id = function_slug_map.get("medical-affairs")

    for dept_key, roles in ROLES_BY_DEPARTMENT.items():
        dept_slug = dept_key_to_slug.get(dept_key)
        dept_id = department_slug_map.get(dept_slug)

        if not dept_id:
            print(f"   ⚠️ Department not found: {dept_key} -> {dept_slug}")
            continue

        for role in roles:
            for geo_scope in role["geo_scopes"]:
                # Create unique slug
                role_slug = f"{geo_scope}-{role['slug']}"
                full_name = f"{geo_scope.title()} {role['name']}"
                role_id = str(uuid.uuid4())

                # Get enrichment data
                enrichment = ROLE_ENRICHMENT.get(role["slug"], {})
                default = DEFAULT_ENRICHMENT.get(role["seniority"], {})

                # Determine role_category (enum values: field, office, hybrid)
                if "field" in dept_key.lower() or role["slug"] in ["msl", "senior-msl"]:
                    role_category = "field"
                elif "hybrid" in dept_key_to_slug.get(dept_key, ""):
                    role_category = "hybrid"
                else:
                    role_category = "office"

                role_data = {
                    "id": role_id,
                    "name": full_name,
                    "slug": role_slug,
                    "description": enrichment.get("description", f"Responsible for {role['name'].lower()} activities within Medical Affairs at the {geo_scope} level."),
                    "role_type": "medical",
                    "role_category": role_category,
                    "function_id": func_id,
                    "department_id": dept_id,
                    "seniority_level": role["seniority"],
                    "leadership_level": "people_manager" if "manager" in role["slug"] or "director" in role["slug"] or "lead" in role["slug"] else "individual_contributor",
                    "geographic_scope": geo_scope,
                    "years_experience_min": enrichment.get("years_experience_min", default.get("years_experience_min", 2)),
                    "years_experience_max": enrichment.get("years_experience_max", default.get("years_experience_max", 8)),
                    "travel_percentage_min": enrichment.get("travel_percentage_min", default.get("travel_percentage_min", 10)),
                    "travel_percentage_max": enrichment.get("travel_percentage_max", default.get("travel_percentage_max", 30)),
                    "typical_education_level": enrichment.get("typical_education_level", default.get("typical_education_level", "PharmD or PhD")),
                    "gxp_critical": enrichment.get("gxp_critical", True),
                    "gxp_types": enrichment.get("gxp_types", ["GCP"]),
                    "hcp_facing": enrichment.get("hcp_facing", True),
                    "patient_facing": enrichment.get("patient_facing", False),
                    "safety_critical": enrichment.get("safety_critical", True),
                    "work_location_model": enrichment.get("work_location_model", "hybrid"),
                    # JSONB fields
                    "role_kpis": json.dumps(enrichment.get("role_kpis", [])),
                    "clinical_competencies": json.dumps(enrichment.get("clinical_competencies", [])),
                    "technical_skills": json.dumps(enrichment.get("technical_skills", [])),
                    "soft_skills": json.dumps(enrichment.get("soft_skills", [])),
                    "top_responsibilities": json.dumps(enrichment.get("top_responsibilities", [])),
                }

                roles_data.append(role_data)
                role_map[role_slug] = {**role_data, "id": role_id}

    # Insert in batches of 50
    batch_size = 50
    total_inserted = 0
    for i in range(0, len(roles_data), batch_size):
        batch = roles_data[i:i+batch_size]
        result = supabase_upsert("org_roles", batch)
        if result["success"]:
            total_inserted += len(batch)
            print(f"   ✅ Batch {i//batch_size + 1}: Inserted {len(batch)} roles")
        else:
            print(f"   ❌ Batch {i//batch_size + 1} Error: {result['error']}")
            # Print first error details
            if i == 0:
                print(f"      Sample data: {json.dumps(batch[0], indent=2)[:500]}")

    print(f"   📊 Total roles created: {total_inserted}")
    return role_map

def seed_personas(role_map: dict):
    """Seed personas table - 4 archetypes per role."""
    print("\n📦 Seeding personas (4 per role)...")

    personas_data = []

    for role_slug, role_data in role_map.items():
        for archetype_key, archetype in ARCHETYPE_TEMPLATES.items():
            # Generate persona name
            base_name = role_data["name"]
            persona_name = f"{base_name} - {archetype['suffix']}"

            # Create unique_id from role slug and archetype
            unique_id = f"PERSONA-{role_slug.upper().replace('-', '_')}-{archetype_key[:3]}"

            # Get description, handling the json.dumps from role_data
            role_desc = role_data.get("description", "")
            if isinstance(role_desc, str) and role_desc.startswith('"'):
                role_desc = json.loads(role_desc)

            persona_data = {
                "id": str(uuid.uuid4()),
                "unique_id": unique_id,
                "persona_name": persona_name,
                "persona_type": archetype_key,
                "source_role_id": role_data["id"],
                "title": role_data["name"],
                "description": f"{role_desc} {archetype['description_addon']}",
                "department": "Medical Affairs",
                "function_area": "Medical Affairs",
                "geographic_scope": role_data.get("geographic_scope", "global"),
                "experience_level": role_data.get("seniority_level", "mid"),
                # JSONB fields
                "goals": json.dumps(archetype["goals"]),
                "challenges": json.dumps(archetype["challenges"]),
                "motivations": json.dumps(archetype["motivations"]),
                "frustrations": json.dumps(archetype["frustrations"]),
                "daily_activities": json.dumps([]),
                "tools_used": json.dumps([]),
                "skills": json.dumps([]),
                "competencies": json.dumps([]),
                "is_active": True
            }

            personas_data.append(persona_data)

    # Insert in batches
    batch_size = 50
    total_inserted = 0
    for i in range(0, len(personas_data), batch_size):
        batch = personas_data[i:i+batch_size]
        result = supabase_upsert("personas", batch)
        if result["success"]:
            total_inserted += len(batch)
            print(f"   ✅ Batch {i//batch_size + 1}: Inserted {len(batch)} personas")
        else:
            print(f"   ❌ Batch {i//batch_size + 1} Error: {result['error']}")
            if i == 0:
                print(f"      Sample data: {json.dumps(batch[0], indent=2)[:500]}")

    print(f"   📊 Total personas created: {total_inserted}")
    return personas_data

# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    print("=" * 60)
    print("VITAL Platform - Organization Structure Seeder")
    print("=" * 60)
    print(f"\nTarget: {SUPABASE_URL}")
    print(f"Started: {datetime.now().isoformat()}")

    # Step 1: Seed Functions
    func_result = seed_functions()
    if not func_result["success"]:
        print("\n❌ Failed to seed functions. Aborting.")
        return

    # Build function slug->id map from FUNCTIONS data
    function_slug_map = {f["slug"]: f["id"] for f in FUNCTIONS}
    print(f"\n🔍 Function map: {list(function_slug_map.keys())}")

    # Step 2: Seed Departments
    dept_result = seed_departments(function_slug_map)
    if not dept_result["success"]:
        print("\n⚠️ Department seeding had issues, attempting to continue...")

    # Build department slug->id map (query to get IDs)
    print("\n🔍 Fetching department IDs...")
    dept_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/org_departments?select=id,slug",
        headers=HEADERS
    )
    if dept_response.status_code == 200:
        departments = dept_response.json()
        department_slug_map = {d["slug"]: d["id"] for d in departments}
        print(f"   Found {len(department_slug_map)} departments: {list(department_slug_map.keys())}")
    else:
        print(f"   ❌ Could not fetch departments: {dept_response.text}")
        department_slug_map = {}

    # Step 3: Seed Roles
    role_map = seed_roles(department_slug_map, function_slug_map)

    # Step 4: Seed Personas (4 per role)
    if role_map:
        personas = seed_personas(role_map)
        persona_count = len(role_map) * 4
    else:
        persona_count = 0

    # Summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   • Functions: {len(FUNCTIONS)}")
    print(f"   • Departments: {len(DEPARTMENTS)}")
    print(f"   • Roles: {len(role_map) if role_map else 0}")
    print(f"   • Personas: {persona_count}")
    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
