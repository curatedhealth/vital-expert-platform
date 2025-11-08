#!/usr/bin/env python3
"""
Digital Health JTBD Library Parser
Extracts personas and JTBDs from the comprehensive markdown document
Generates JSON and SQL files for database import
"""

import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# JTBD ID Mapping - Consistent Format
JTBD_ID_PREFIX_MAP = {
    # Pharma - Patient Solutions & Engagement
    "Patient Solutions Director": "DH_PHARMA_PATSOL",
    "Patient Experience Designer": "DH_PHARMA_PATEXP",
    "Patient Advocacy Lead": "DH_PHARMA_PATADV",
    
    # Pharma - Commercial & Market Access
    "Market Access Director": "DH_PHARMA_MKTACC",
    "Commercial Strategy Lead": "DH_PHARMA_COMSTRAT",
    "Digital Marketing Manager": "DH_PHARMA_DIGMKT",
    
    # Pharma - Technology & Digital Products
    "Chief Digital Officer (Pharma)": "DH_PHARMA_CDO",
    "Digital Health Product Manager": "DH_PHARMA_PRODMGR",
    "Data & Analytics Lead": "DH_PHARMA_DATAANL",
    "IT Infrastructure Lead": "DH_PHARMA_ITINFRA",
    
    # Pharma - Service & Experience Design
    "Service Design Director": "DH_PHARMA_SRVDES",
    "UX Research Lead": "DH_PHARMA_UXRES",
    "Behavioral Science Lead": "DH_PHARMA_BEHSCI",
    
    # Pharma - Medical Legal & Compliance
    "Medical Legal Director": "DH_PHARMA_MEDLEG",
    "Chief Compliance Officer": "DH_PHARMA_COMPLY",
    
    # Pharma - Pharmacovigilance & Drug Safety
    "Pharmacovigilance Director": "DH_PHARMA_PHARVIG",
    
    # Pharma - Real-World Evidence & Outcomes
    "Real-World Evidence Director": "DH_PHARMA_RWE",
    "Outcomes Research Manager": "DH_PHARMA_OUTCOME",
    
    # Pharma - Medical Writing & Communications
    "Medical Writing Director": "DH_PHARMA_MEDWRIT",
    
    # Pharma - Clinical Data Management & Biostatistics
    "Clinical Data Management Lead": "DH_PHARMA_CDM",
    "Biostatistics Director": "DH_PHARMA_BIOSTAT",
    
    # Pharma - Partnerships & Alliance Management
    "Digital Partnerships Director": "DH_PHARMA_PARTNER",
    
    # Pharma - Digital Adoption & Change Management
    "Digital Adoption Lead": "DH_PHARMA_ADOPT",
    
    # Pharma - Manufacturing & Supply Chain Digital
    "Digital Supply Chain Director": "DH_PHARMA_SUPPLY",
    
    # Pharma - Core Medical Affairs & Clinical
    "Medical Affairs Director": "DH_PHARMA_MEDAFF",
    "Clinical Development Lead": "DH_PHARMA_CLINDEV",
    "Regulatory Affairs Manager": "DH_PHARMA_REGAFF",
    "Medical Science Liaison (MSL)": "DH_PHARMA_MSL",
    "Commercial/Sales Leadership": "DH_PHARMA_SALES",
    
    # Payers
    "Chief Medical Officer (Payer)": "DH_PAYER_CMO",
    "Pharmacy Director": "DH_PAYER_PHARM",
    "Population Health Manager": "DH_PAYER_POPHLTH",
    "Quality/STAR Ratings Manager": "DH_PAYER_QUALITY",
    
    # Healthcare Providers
    "Frontline Physician": "DH_PROVIDER_PHYSIC",
    "Chief Medical Information Officer (CMIO)": "DH_PROVIDER_CMIO",
    "Nurse Manager/Chief Nursing Officer": "DH_PROVIDER_NURSE",
    "Quality/Safety Director": "DH_PROVIDER_QUALITY",
    
    # Digital Health Startups - Leadership
    "CTO/Technical Co-founder": "DH_STARTUP_CTO",
    "VP Customer Success": "DH_STARTUP_CS",
    "Growth Marketing Lead": "DH_STARTUP_GROWTH",
    "VC Partner/Investor": "DH_STARTUP_VC",
    "Clinical Advisory Board Chair": "DH_STARTUP_ADVISOR",
    
    # Digital Health Startups - Operations
    "Product Development Lead": "DH_STARTUP_PRODDEV",
    "Clinical Research Director (Startup)": "DH_STARTUP_CLINRES",
    "Quality & Regulatory Manager (Startup)": "DH_STARTUP_QRA",
    "Business Development Director (Startup)": "DH_STARTUP_BD",
    "Implementation Success Manager": "DH_STARTUP_IMPL",
    "Clinical Content Developer": "DH_STARTUP_CONTENT",
    "Reimbursement Strategy Lead": "DH_STARTUP_REIMB",
    "Data Science Lead (Startup)": "DH_STARTUP_DATASCI",
    "Security & Privacy Officer": "DH_STARTUP_SECURITY",
    
    # Digital Health Providers
    "Digital Therapeutics CEO": "DH_DTX_CEO",
    "Digital Biomarker Scientist": "DH_DTX_BIOSCI",
    "Virtual Care Platform CPO": "DH_VIRTUAL_CPO",
    "Digital Health Consultant": "DH_CONSULT_STRAT",
    "Health Tech Investor": "DH_INVEST_VC",
    "Healthcare API Platform Lead": "DH_API_PLATFORM",
    
    # Enabling Stakeholders
    "Regulatory Consultant": "DH_ENABLE_REGCON",
    "Clinical Operations Director": "DH_ENABLE_CLINOPS",
    "IT Director/CIO": "DH_ENABLE_CIO",
    "Brand Manager (Pharma)": "DH_ENABLE_BRAND",
    "Sales Leader (Digital Health)": "DH_ENABLE_SALES",
    
    # Digital Health Innovators
    "AI/ML Healthcare Researcher": "DH_INNOV_AIML",
    "Digital Clinical Trials Director": "DH_INNOV_DCT",
    "Patient Data Platform Architect": "DH_INNOV_DATAARCH",
    "Digital Health Policy Advisor": "DH_INNOV_POLICY",
}

def parse_yaml_block(content: str) -> Dict[str, Any]:
    """Parse a YAML-like block into a dictionary"""
    result = {}
    current_key = None
    current_value = []
    indent_stack = [(0, result)]
    
    for line in content.split('\n'):
        if not line.strip() or line.strip().startswith('#'):
            continue
            
        # Calculate indentation
        indent = len(line) - len(line.lstrip())
        line = line.strip()
        
        # Handle key-value pairs
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            if value:
                # Direct value
                try:
                    # Try to parse as number
                    if '/' in value:
                        result[key] = value
                    else:
                        result[key] = float(value) if '.' in value else int(value)
                except ValueError:
                    result[key] = value
            else:
                # Nested structure or list
                result[key] = {}
        elif line.startswith('-'):
            # List item
            item = line[1:].strip()
            if current_key:
                if not isinstance(result.get(current_key), list):
                    result[current_key] = []
                result[current_key].append(item)
    
    return result

def extract_persona_sections(content: str) -> List[Dict[str, Any]]:
    """Extract all persona sections from the markdown"""
    personas = []
    
    # Pattern to match persona sections - capture the entire YAML block
    persona_pattern = r'### Persona: (.+?)\n\n```yaml\n(.*?)```'
    
    matches = re.finditer(persona_pattern, content, re.DOTALL)
    
    for match in matches:
        persona_title = match.group(1).strip()
        yaml_content = match.group(2).strip()
        
        # Split into persona_profile and jobs_to_be_done sections
        profile_section = ""
        jobs_section = ""
        
        if 'jobs_to_be_done:' in yaml_content:
            parts = yaml_content.split('jobs_to_be_done:', 1)
            profile_section = parts[0].replace('persona_profile:', '').strip()
            jobs_section = parts[1].strip()
        else:
            profile_section = yaml_content.replace('persona_profile:', '').strip()
        
        # Parse profile (simplified - extract key fields)
        profile = {}
        for line in profile_section.split('\n'):
            line = line.strip()
            if ':' in line and not line.startswith('-'):
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                if value and not value.startswith('-'):
                    profile[key] = value
        
        # Extract jobs
        jobs = []
        if jobs_section:
            # Find all JTBD blocks
            jtbd_pattern = r'(JTBD-[A-Z]+-\d+):\s*\n\s*statement:\s*"(.+?)"\s*\n\s*frequency:\s*(.+?)\s*\n\s*importance:\s*(.+?)\s*\n\s*current_satisfaction:\s*(.+?)\s*\n\s*opportunity_score:\s*(.+?)\s*\n\s*success_metrics:\s*\n((?:\s*-\s*.+?\n)+)'
            
            jtbd_matches = re.finditer(jtbd_pattern, jobs_section, re.MULTILINE)
            
            for jtbd_match in jtbd_matches:
                jtbd_id = jtbd_match.group(1).strip()
                statement = jtbd_match.group(2).strip()
                frequency = jtbd_match.group(3).strip()
                importance = jtbd_match.group(4).strip()
                satisfaction = jtbd_match.group(5).strip()
                opportunity = jtbd_match.group(6).strip()
                metrics_text = jtbd_match.group(7).strip()
                
                # Parse success metrics
                metrics = []
                for metric_line in metrics_text.split('\n'):
                    metric = metric_line.strip()
                    if metric.startswith('-'):
                        metrics.append(metric[1:].strip())
                
                jtbd_data = {
                    'original_id': jtbd_id,
                    'statement': statement,
                    'frequency': frequency,
                    'importance': importance,
                    'current_satisfaction': satisfaction,
                    'opportunity_score': opportunity,
                    'success_metrics': metrics
                }
                jobs.append(jtbd_data)
        
        persona_data = {
            'title': persona_title,
            'profile': profile,
            'jobs': jobs
        }
        personas.append(persona_data)
    
    return personas

def generate_consistent_jtbd_id(persona_title: str, job_index: int, original_id: str) -> str:
    """Generate consistent JTBD ID using prefix mapping"""
    prefix = JTBD_ID_PREFIX_MAP.get(persona_title, "DH_GENERAL")
    
    # Extract job category from original ID if possible
    category_match = re.search(r'JTBD-([A-Z]+)-', original_id)
    category = category_match.group(1) if category_match else "JOB"
    
    # Format: DH_PHARMA_MEDAFF_PATSUP_001
    return f"{prefix}_{category}_{job_index+1:03d}"

def generate_json_output(personas: List[Dict[str, Any]], output_path: Path):
    """Generate JSON file with all personas and JTBDs"""
    output_data = {
        "metadata": {
            "source": "Digital Health JTBD Library Complete v1.0",
            "generated_at": datetime.now().isoformat(),
            "total_personas": len(personas),
            "total_jobs": sum(len(p['jobs']) for p in personas)
        },
        "personas": []
    }
    
    for persona in personas:
        persona_entry = {
            "persona_title": persona['title'],
            "profile": persona['profile'],
            "jobs_to_be_done": []
        }
        
        for idx, job in enumerate(persona['jobs']):
            jtbd_id = generate_consistent_jtbd_id(persona['title'], idx, job.get('original_id', ''))
            
            job_entry = {
                "jtbd_id": jtbd_id,
                "jtbd_code": jtbd_id,
                "unique_id": jtbd_id.lower(),
                "original_id": job.get('original_id', ''),
                "statement": job.get('statement', ''),
                "frequency": job.get('frequency', ''),
                "importance": job.get('importance', 0),
                "current_satisfaction": job.get('current_satisfaction', 0),
                "opportunity_score": job.get('opportunity_score', 0),
                "success_metrics": job.get('success_metrics', [])
            }
            persona_entry['jobs_to_be_done'].append(job_entry)
        
        output_data['personas'].append(persona_entry)
    
    # Write JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ JSON file generated: {output_path}")
    print(f"   - {output_data['metadata']['total_personas']} personas")
    print(f"   - {output_data['metadata']['total_jobs']} jobs")

def generate_sql_output(personas: List[Dict[str, Any]], output_path: Path):
    """Generate SQL file for database import"""
    
    sql_lines = [
        "-- Digital Health JTBD Library - SQL Import",
        f"-- Generated: {datetime.now().isoformat()}",
        "-- Source: Digital Health JTBD Library Complete v1.0",
        "",
        "-- Insert JTBDs into jtbd_library table",
        "-- Note: Adjust column names to match your schema",
        "",
        "BEGIN;",
        ""
    ]
    
    total_jobs = 0
    
    for persona in personas:
        if not persona['jobs']:
            continue
            
        sql_lines.append(f"-- Persona: {persona['title']}")
        sql_lines.append(f"-- Profile: {persona['profile'].get('name', 'Unknown')} - {persona['profile'].get('title', '')}")
        sql_lines.append("")
        
        for idx, job in enumerate(persona['jobs']):
            jtbd_id = generate_consistent_jtbd_id(persona['title'], idx, job.get('original_id', ''))
            
            # Extract values
            statement = job.get('statement', '').replace("'", "''")  # Escape quotes
            frequency = job.get('frequency', 'Unknown')
            importance = job.get('importance', 0)
            
            # Parse importance if it's a string like "10/10"
            if isinstance(importance, str) and '/' in importance:
                importance = int(importance.split('/')[0])
            
            satisfaction = job.get('current_satisfaction', 0)
            if isinstance(satisfaction, str) and '/' in satisfaction:
                satisfaction = int(satisfaction.split('/')[0])
            
            opportunity_score = job.get('opportunity_score', 0)
            
            # Get success metrics as JSONB array
            success_metrics = job.get('success_metrics', [])
            if isinstance(success_metrics, dict):
                success_metrics = list(success_metrics.values())
            success_metrics_json = json.dumps(success_metrics).replace("'", "''")
            
            # Determine industry and function based on persona
            industry_id = "ind_dh"  # Default to Digital Health
            org_function = "NULL"
            
            if "Pharma" in persona['title'] or "Pharma" in persona.get('profile', {}).get('organization', ''):
                industry_id = "ind_pharma"
                
                # Determine function
                if any(x in persona['title'] for x in ['Medical Affairs', 'Clinical Development', 'MSL']):
                    org_function = "'Medical Affairs'"
                elif any(x in persona['title'] for x in ['Commercial', 'Sales', 'Market Access', 'Marketing']):
                    org_function = "'Commercial'"
                elif any(x in persona['title'] for x in ['Patient Solutions', 'Patient Experience', 'Patient Advocacy']):
                    org_function = "'Patient Solutions'"
                elif any(x in persona['title'] for x in ['Digital Officer', 'Product Manager', 'Data', 'IT']):
                    org_function = "'Technology & Innovation'"
                elif any(x in persona['title'] for x in ['Regulatory', 'Quality', 'Compliance', 'Legal']):
                    org_function = "'Regulatory & Compliance'"
            
            sql_lines.append(f"""INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    '{jtbd_id}',
    '{jtbd_id}',
    '{jtbd_id.lower()}',
    '{statement[:200] if len(statement) > 200 else statement}',
    'execute',
    '{statement}',
    {org_function},
    'Digital Health',
    '{persona['title']} - {persona['profile'].get('title', '')}',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    '{frequency}',
    {importance},
    {satisfaction},
    {opportunity_score},
    '{success_metrics_json}'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = '{industry_id}'),
    (SELECT id FROM public.org_functions WHERE org_function = {org_function} LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();
""")
            
            total_jobs += 1
    
    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append(f"-- Total JTBDs inserted/updated: {total_jobs}")
    
    # Write SQL file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ SQL file generated: {output_path}")
    print(f"   - {total_jobs} JTBD insert statements")

def main():
    """Main execution function"""
    print("=" * 80)
    print("Digital Health JTBD Library Parser")
    print("=" * 80)
    print()
    
    # Input file path
    input_file = Path("/Users/hichamnaim/Downloads/Private & Shared 30/Digital Health JTBD Library Complete.md")
    
    if not input_file.exists():
        print(f"❌ Error: Input file not found: {input_file}")
        return
    
    print(f"📖 Reading: {input_file.name}")
    
    # Read the markdown file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"✅ File loaded: {len(content):,} characters")
    print()
    
    # Extract personas
    print("🔍 Extracting personas and JTBDs...")
    personas = extract_persona_sections(content)
    
    total_jobs = sum(len(p['jobs']) for p in personas)
    print(f"✅ Extracted:")
    print(f"   - {len(personas)} personas")
    print(f"   - {total_jobs} jobs-to-be-done")
    print()
    
    # Generate output files
    output_dir = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/data")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_output = output_dir / f"dh_jtbd_library_{timestamp}.json"
    sql_output = output_dir / f"dh_jtbd_library_{timestamp}.sql"
    
    print("📝 Generating output files...")
    print()
    
    generate_json_output(personas, json_output)
    print()
    
    generate_sql_output(personas, sql_output)
    print()
    
    print("=" * 80)
    print("✨ SUCCESS! Files generated:")
    print(f"   📄 JSON: {json_output}")
    print(f"   📄 SQL:  {sql_output}")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Review the generated JSON file for accuracy")
    print("2. Adjust the SQL file column names if needed to match your schema")
    print("3. Run the SQL file against your Supabase database")
    print("4. Map JTBDs to personas using the jtbd_org_persona_mapping table")
    print()

if __name__ == "__main__":
    main()

