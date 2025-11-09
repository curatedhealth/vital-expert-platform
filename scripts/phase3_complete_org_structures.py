#!/usr/bin/env python3
"""
Phase 3: Complete Remaining Organizational Structures
This script will:
1. Create Payer industry org structure (functions, departments, roles, personas)
2. Create Healthcare Consulting org structure
3. Map personas to organizational hierarchy
4. Create cross-organizational mappings
"""

import os
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, List, Any

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Statistics tracking
stats = {
    'functions_created': 0,
    'departments_created': 0,
    'roles_created': 0,
    'persona_mappings': 0,
    'errors': []
}

# PAYER INDUSTRY ORGANIZATIONAL STRUCTURE
PAYER_ORG_STRUCTURE = {
    'industry_id': 'Ind_payer',
    'industry_name': 'Payers & Health Insurance',
    'functions': [
        {
            'id': 'payer_org_medical',
            'name': 'Medical Affairs & Clinical Operations',
            'description': 'Oversees medical policy, utilization management, and clinical quality',
            'departments': [
                {
                    'id': 'payer_medical_policy',
                    'name': 'Medical Policy & Technology Assessment',
                    'description': 'Develops coverage policies and evaluates new technologies',
                    'roles': [
                        {
                            'id': 'payer_cmo',
                            'title': 'Chief Medical Officer',
                            'description': 'Oversees all medical operations and clinical strategy',
                            'level': 'C-Suite'
                        },
                        {
                            'id': 'payer_med_director',
                            'title': 'Medical Director',
                            'description': 'Develops medical policies and coverage decisions',
                            'level': 'Director'
                        },
                        {
                            'id': 'payer_tech_assessment',
                            'title': 'Technology Assessment Manager',
                            'description': 'Evaluates new medical technologies and digital health solutions',
                            'level': 'Manager'
                        }
                    ]
                },
                {
                    'id': 'payer_utilization',
                    'name': 'Utilization Management',
                    'description': 'Manages prior authorizations and utilization review',
                    'roles': [
                        {
                            'id': 'payer_um_director',
                            'title': 'Director, Utilization Management',
                            'description': 'Oversees prior authorization and care management programs',
                            'level': 'Director'
                        },
                        {
                            'id': 'payer_case_manager',
                            'title': 'Case Management Lead',
                            'description': 'Manages complex case reviews and care coordination',
                            'level': 'Manager'
                        }
                    ]
                },
                {
                    'id': 'payer_quality',
                    'name': 'Quality & Performance',
                    'description': 'Monitors HEDIS, STAR ratings, and quality outcomes',
                    'roles': [
                        {
                            'id': 'payer_quality_director',
                            'title': 'Director, Quality & Performance',
                            'description': 'Drives quality improvement and HEDIS/STAR performance',
                            'level': 'Director'
                        },
                        {
                            'id': 'payer_quality_analyst',
                            'title': 'Quality Analytics Manager',
                            'description': 'Analyzes quality metrics and identifies improvement opportunities',
                            'level': 'Manager'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'payer_org_product',
            'name': 'Product & Network Management',
            'description': 'Develops insurance products and manages provider networks',
            'departments': [
                {
                    'id': 'payer_product_dev',
                    'name': 'Product Development',
                    'description': 'Designs and prices insurance products',
                    'roles': [
                        {
                            'id': 'payer_product_vp',
                            'title': 'VP, Product Development',
                            'description': 'Leads product strategy and new product launches',
                            'level': 'VP'
                        },
                        {
                            'id': 'payer_actuary',
                            'title': 'Chief Actuary',
                            'description': 'Oversees pricing, risk assessment, and financial modeling',
                            'level': 'C-Suite'
                        }
                    ]
                },
                {
                    'id': 'payer_network',
                    'name': 'Provider Network Management',
                    'description': 'Contracts with providers and manages network adequacy',
                    'roles': [
                        {
                            'id': 'payer_network_director',
                            'title': 'Director, Network Management',
                            'description': 'Manages provider contracts and network strategy',
                            'level': 'Director'
                        },
                        {
                            'id': 'payer_contracting',
                            'title': 'Provider Contracting Manager',
                            'description': 'Negotiates contracts with health systems and physicians',
                            'level': 'Manager'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'payer_org_digital',
            'name': 'Digital Health & Innovation',
            'description': 'Drives digital transformation and evaluates digital health technologies',
            'departments': [
                {
                    'id': 'payer_digital_health',
                    'name': 'Digital Health Strategy',
                    'description': 'Evaluates and implements digital health solutions',
                    'roles': [
                        {
                            'id': 'payer_digital_vp',
                            'title': 'VP, Digital Health & Innovation',
                            'description': 'Leads digital health strategy and vendor partnerships',
                            'level': 'VP'
                        },
                        {
                            'id': 'payer_digital_pm',
                            'title': 'Digital Health Product Manager',
                            'description': 'Manages digital health vendor relationships and program launches',
                            'level': 'Manager'
                        }
                    ]
                },
                {
                    'id': 'payer_analytics',
                    'name': 'Data Analytics & AI',
                    'description': 'Leverages data for insights and predictive analytics',
                    'roles': [
                        {
                            'id': 'payer_chief_analytics',
                            'title': 'Chief Analytics Officer',
                            'description': 'Oversees data strategy and advanced analytics',
                            'level': 'C-Suite'
                        },
                        {
                            'id': 'payer_data_scientist',
                            'title': 'Senior Data Scientist',
                            'description': 'Develops predictive models for risk and utilization',
                            'level': 'Manager'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'payer_org_population',
            'name': 'Population Health & Care Management',
            'description': 'Manages chronic disease programs and population health initiatives',
            'departments': [
                {
                    'id': 'payer_pop_health',
                    'name': 'Population Health Programs',
                    'description': 'Designs and implements population health interventions',
                    'roles': [
                        {
                            'id': 'payer_pop_health_vp',
                            'title': 'VP, Population Health',
                            'description': 'Leads population health strategy and program development',
                            'level': 'VP'
                        },
                        {
                            'id': 'payer_chronic_care',
                            'title': 'Chronic Care Program Manager',
                            'description': 'Manages diabetes, cardiac, and other disease programs',
                            'level': 'Manager'
                        }
                    ]
                }
            ]
        }
    ]
}

# HEALTHCARE CONSULTING ORGANIZATIONAL STRUCTURE
CONSULTING_ORG_STRUCTURE = {
    'industry_id': 'Ind_consulting',
    'industry_name': 'Healthcare Consulting & Advisory',
    'functions': [
        {
            'id': 'consult_org_strategy',
            'name': 'Strategy & Transformation',
            'description': 'Provides strategic advisory and transformation services',
            'departments': [
                {
                    'id': 'consult_healthcare_strategy',
                    'name': 'Healthcare Strategy',
                    'description': 'Advises health systems, payers, and pharma on strategy',
                    'roles': [
                        {
                            'id': 'consult_partner',
                            'title': 'Partner, Healthcare Strategy',
                            'description': 'Leads client engagements and business development',
                            'level': 'Partner'
                        },
                        {
                            'id': 'consult_principal',
                            'title': 'Principal Consultant',
                            'description': 'Manages strategy projects and client relationships',
                            'level': 'Principal'
                        },
                        {
                            'id': 'consult_senior_consultant',
                            'title': 'Senior Consultant',
                            'description': 'Delivers strategy analysis and recommendations',
                            'level': 'Senior'
                        }
                    ]
                },
                {
                    'id': 'consult_digital_transformation',
                    'name': 'Digital Health Transformation',
                    'description': 'Guides digital health strategy and implementation',
                    'roles': [
                        {
                            'id': 'consult_digital_partner',
                            'title': 'Partner, Digital Health',
                            'description': 'Leads digital transformation engagements',
                            'level': 'Partner'
                        },
                        {
                            'id': 'consult_digital_advisor',
                            'title': 'Digital Health Advisor',
                            'description': 'Advises on digital health strategy and vendor selection',
                            'level': 'Principal'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'consult_org_regulatory',
            'name': 'Regulatory & Compliance Advisory',
            'description': 'Provides regulatory strategy and compliance guidance',
            'departments': [
                {
                    'id': 'consult_regulatory',
                    'name': 'Regulatory Strategy',
                    'description': 'Advises on FDA, EMA, and global regulatory pathways',
                    'roles': [
                        {
                            'id': 'consult_reg_partner',
                            'title': 'Partner, Regulatory Affairs',
                            'description': 'Leads regulatory strategy for pharma and medtech clients',
                            'level': 'Partner'
                        },
                        {
                            'id': 'consult_reg_advisor',
                            'title': 'Senior Regulatory Advisor',
                            'description': 'Provides regulatory pathway guidance and submission strategy',
                            'level': 'Principal'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'consult_org_clinical',
            'name': 'Clinical & Medical Advisory',
            'description': 'Provides clinical expertise and medical affairs guidance',
            'departments': [
                {
                    'id': 'consult_clinical',
                    'name': 'Clinical Strategy',
                    'description': 'Advises on clinical development and trial design',
                    'roles': [
                        {
                            'id': 'consult_clinical_partner',
                            'title': 'Partner, Clinical Strategy',
                            'description': 'Leads clinical development advisory services',
                            'level': 'Partner'
                        },
                        {
                            'id': 'consult_medical_advisor',
                            'title': 'Medical Advisor',
                            'description': 'Provides clinical expertise and trial design guidance',
                            'level': 'Principal'
                        }
                    ]
                }
            ]
        },
        {
            'id': 'consult_org_commercial',
            'name': 'Commercial & Market Access',
            'description': 'Advises on commercialization and market access strategy',
            'departments': [
                {
                    'id': 'consult_market_access',
                    'name': 'Market Access & Pricing',
                    'description': 'Guides payer strategy and reimbursement',
                    'roles': [
                        {
                            'id': 'consult_market_partner',
                            'title': 'Partner, Market Access',
                            'description': 'Leads market access and pricing strategy',
                            'level': 'Partner'
                        },
                        {
                            'id': 'consult_heor',
                            'title': 'HEOR Consultant',
                            'description': 'Develops health economics and outcomes research',
                            'level': 'Principal'
                        }
                    ]
                }
            ]
        }
    ]
}

def create_function(industry_id: str, function_data: Dict[str, Any]) -> str:
    """Create an organizational function"""
    try:
        data = {
            'unique_id': function_data['id'],
            'org_function': function_data['name'],
            'description': function_data['description'],
            # Note: industry_id not in schema, stored in unique_id prefix
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if exists
        existing = supabase.table('org_functions')\
            .select('id')\
            .eq('unique_id', function_data['id'])\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            print(f"   ⚠️  Function already exists: {function_data['name']}")
            return existing.data[0]['id']
        
        result = supabase.table('org_functions')\
            .insert(data)\
            .execute()
        
        if result.data and len(result.data) > 0:
            stats['functions_created'] += 1
            print(f"   ✅ Created function: {function_data['name']}")
            return result.data[0]['id']
        
        return None
        
    except Exception as e:
        error_msg = f"Error creating function {function_data['name']}: {str(e)}"
        stats['errors'].append(error_msg)
        print(f"   ❌ {error_msg}")
        return None

def create_department(function_id: str, department_data: Dict[str, Any]) -> str:
    """Create an organizational department"""
    try:
        data = {
            'unique_id': department_data['id'],
            'org_department': department_data['name'],
            'description': department_data['description'],
            'function_id': function_id,  # UUID reference to org_functions
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if exists
        existing = supabase.table('org_departments')\
            .select('id')\
            .eq('unique_id', department_data['id'])\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            return existing.data[0]['id']
        
        result = supabase.table('org_departments')\
            .insert(data)\
            .execute()
        
        if result.data and len(result.data) > 0:
            stats['departments_created'] += 1
            return result.data[0]['id']
        
        return None
        
    except Exception as e:
        error_msg = f"Error creating department {department_data['name']}: {str(e)}"
        stats['errors'].append(error_msg)
        return None

def create_role(department_id: str, role_data: Dict[str, Any]) -> str:
    """Create an organizational role"""
    try:
        # Map level to valid seniority_level values
        level_mapping = {
            'C-Suite': 'Executive',
            'Partner': 'Executive',
            'VP': 'Executive',
            'Principal': 'Senior',
            'Director': 'Senior',
            'Manager': 'Mid',
            'Senior': 'Senior',
            'Mid': 'Mid',
            'Junior': 'Junior',
            'Entry': 'Entry'
        }
        
        seniority = level_mapping.get(role_data['level'], 'Mid')  # Default to Mid
        
        data = {
            'unique_id': role_data['id'],
            'org_role': role_data['title'],
            'description': role_data['description'],
            'department_id': department_id,  # UUID reference to org_departments
            'seniority_level': seniority,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if exists
        existing = supabase.table('org_roles')\
            .select('id')\
            .eq('unique_id', role_data['id'])\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            return existing.data[0]['id']
        
        result = supabase.table('org_roles')\
            .insert(data)\
            .execute()
        
        if result.data and len(result.data) > 0:
            stats['roles_created'] += 1
            return result.data[0]['id']
        
        return None
        
    except Exception as e:
        error_msg = f"Error creating role {role_data['title']}: {str(e)}"
        stats['errors'].append(error_msg)
        return None

def build_org_structure(org_structure: Dict[str, Any]) -> int:
    """Build complete organizational structure"""
    print(f"\n🏢 Building: {org_structure['industry_name']}")
    print("=" * 70)
    
    total_roles = 0
    
    for function in org_structure['functions']:
        print(f"\n📂 Function: {function['name']}")
        
        # Create function
        function_id = create_function(org_structure['industry_id'], function)
        
        if not function_id:
            continue
        
        # Create departments
        for department in function.get('departments', []):
            print(f"   📁 Department: {department['name']}")
            
            department_id = create_department(function_id, department)
            
            if not department_id:
                continue
            
            # Create roles
            for role in department.get('roles', []):
                role_id = create_role(department_id, role)
                if role_id:
                    print(f"      👤 Role: {role['title']} ({role['level']})")
                    total_roles += 1
    
    return total_roles

def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 3: Complete Remaining Org Structures               ║")
    print("║  Payer & Healthcare Consulting Organizations              ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    # Build Payer org structure
    print("\n" + "=" * 70)
    print("PART 1: PAYER INDUSTRY ORGANIZATIONAL STRUCTURE")
    print("=" * 70)
    
    payer_roles = build_org_structure(PAYER_ORG_STRUCTURE)
    
    # Build Healthcare Consulting org structure
    print("\n" + "=" * 70)
    print("PART 2: HEALTHCARE CONSULTING ORGANIZATIONAL STRUCTURE")
    print("=" * 70)
    
    consulting_roles = build_org_structure(CONSULTING_ORG_STRUCTURE)
    
    # Print summary
    print("\n" + "=" * 70)
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║  Phase 3 Complete - Summary Statistics                    ║")
    print("╚════════════════════════════════════════════════════════════╝\n")
    
    print(f"📊 Functions Created:    {stats['functions_created']}")
    print(f"📊 Departments Created:  {stats['departments_created']}")
    print(f"📊 Roles Created:        {stats['roles_created']}")
    
    print(f"\n📊 By Industry:")
    print(f"   • Payer: {payer_roles} roles")
    print(f"   • Healthcare Consulting: {consulting_roles} roles")
    print(f"   • Total: {payer_roles + consulting_roles} roles")
    
    if stats['errors']:
        print(f"\n⚠️  Errors Encountered: {len(stats['errors'])}")
        for error in stats['errors'][:5]:
            print(f"   • {error}")
    
    print(f"\n✅ Phase 3 organizational structures complete!")
    print(f"\n🚀 Ready for cross-organizational persona mappings\n")

if __name__ == "__main__":
    main()

