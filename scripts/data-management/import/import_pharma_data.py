#!/usr/bin/env python3
"""
Import Pharmaceutical Industry Data
===================================
Imports all pharmaceutical/market access data in correct order:
1. Tenant
2. Org Structure (Functions, Departments, Roles)
3. Personas
4. JTBDs
5. Agents (market access, medical affairs, marketing)

Usage:
    python3 import_pharma_data.py
"""

import json
import sys
import os
from typing import Dict, List, Any
import uuid

# Database connection parameters
DB_PASSWORD = 'flusd9fqEb4kkTJ1'
DB_HOST = 'db.bomltkhixeatxuoxmolq.supabase.co'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'

# File paths
BASE_PATH = '/Users/hichamnaim/Downloads/Cursor/VITAL path'
DATA_FILES = {
    'personas': f'{BASE_PATH}/data/persona_master_catalogue_20251108_204641.json',
    'jtbds': f'{BASE_PATH}/data/phase2_all_jtbds_20251108_211301.json',
    'ma_agents': f'{BASE_PATH}/docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json',
    'medical_agents': f'{BASE_PATH}/docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json',
    'marketing_agents': f'{BASE_PATH}/docs/MARKETING_AGENTS_30_ENHANCED.json',
    'pharma_org_sql': f'{BASE_PATH}/database/sql/seeds/01_pharma_organization.sql'
}

def escape_sql_string(value: str) -> str:
    """Escape single quotes in SQL strings"""
    if value is None:
        return 'NULL'
    return value.replace("'", "''")

def load_json_file(filepath: str) -> Any:
    """Load JSON file"""
    print(f"📖 Loading {os.path.basename(filepath)}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded {len(data) if isinstance(data, list) else 1} items")
        return data
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {filepath}: {e}")
        return None

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    return text.lower().replace(' ', '-').replace('&', 'and')

def generate_pharma_org_structure_sql(tenant_id: str) -> str:
    """Generate SQL for pharmaceutical organizational structure"""
    sql = []
    sql.append("-- ============================================")
    sql.append("-- PHARMACEUTICAL ORG STRUCTURE")
    sql.append("-- ============================================")
    sql.append("BEGIN;")
    sql.append("")

    # Functions
    functions = [
        {"name": "Market Access", "description": "Payer strategy, HEOR, pricing, reimbursement"},
        {"name": "Medical Affairs", "description": "MSLs, medical communications, clinical evidence"},
        {"name": "Regulatory", "description": "FDA submissions, compliance, labeling"},
        {"name": "Clinical", "description": "Clinical trials, protocol design, operations"},
        {"name": "Commercial", "description": "Marketing, sales, brand management"},
        {"name": "Research & Development", "description": "Drug discovery, preclinical, development"}
    ]

    for func in functions:
        slug = slugify(func['name'])
        sql.append(f"-- Function: {func['name']}")
        sql.append(f"INSERT INTO org_functions (id, tenant_id, name, slug, description, created_at)")
        sql.append(f"VALUES (gen_random_uuid(), '{tenant_id}', '{escape_sql_string(func['name'])}', '{slug}', '{escape_sql_string(func['description'])}', NOW())")
        sql.append(f"ON CONFLICT (tenant_id, name) DO UPDATE SET slug = EXCLUDED.slug, description = EXCLUDED.description;")
        sql.append("")

    # Departments
    departments = [
        {"name": "HEOR", "function": "Market Access", "description": "Health Economics & Outcomes Research"},
        {"name": "Payer Strategy", "function": "Market Access", "description": "Payer engagement and strategy"},
        {"name": "Pricing & Reimbursement", "function": "Market Access", "description": "Pricing strategy and reimbursement"},
        {"name": "Patient Access", "function": "Market Access", "description": "Patient support and access programs"},
        {"name": "Medical Science Liaisons", "function": "Medical Affairs", "description": "Field-based medical team"},
        {"name": "Medical Communications", "function": "Medical Affairs", "description": "Publications, congress, advisory boards"},
        {"name": "Clinical Operations", "function": "Clinical", "description": "Clinical trial execution"},
        {"name": "Biostatistics", "function": "Clinical", "description": "Statistical analysis and design"}
    ]

    for dept in departments:
        slug = slugify(dept['name'])
        sql.append(f"-- Department: {dept['name']}")
        sql.append(f"INSERT INTO org_departments (id, tenant_id, name, slug, description, created_at)")
        sql.append(f"VALUES (gen_random_uuid(), '{tenant_id}', '{escape_sql_string(dept['name'])}', '{slug}', '{escape_sql_string(dept['description'])}', NOW())")
        sql.append(f"ON CONFLICT (tenant_id, slug) DO UPDATE SET description = EXCLUDED.description;")
        sql.append("")

    # Roles
    roles = [
        {"name": "VP Market Access", "function": "Market Access", "seniority": "executive"},
        {"name": "Director HEOR", "function": "Market Access", "seniority": "senior"},
        {"name": "Market Access Manager", "function": "Market Access", "seniority": "mid"},
        {"name": "Pricing Manager", "function": "Market Access", "seniority": "mid"},
        {"name": "VP Medical Affairs", "function": "Medical Affairs", "seniority": "executive"},
        {"name": "Medical Director", "function": "Medical Affairs", "seniority": "senior"},
        {"name": "Medical Science Liaison", "function": "Medical Affairs", "seniority": "mid"},
        {"name": "Clinical Development Director", "function": "Clinical", "seniority": "senior"}
    ]

    for role in roles:
        slug = slugify(role['name'])
        sql.append(f"-- Role: {role['name']}")
        sql.append(f"INSERT INTO org_roles (id, tenant_id, name, slug, seniority_level, created_at)")
        sql.append(f"VALUES (gen_random_uuid(), '{tenant_id}', '{escape_sql_string(role['name'])}', '{slug}', '{role['seniority']}', NOW())")
        sql.append(f"ON CONFLICT (tenant_id, slug) DO UPDATE SET seniority_level = EXCLUDED.seniority_level;")
        sql.append("")

    sql.append("COMMIT;")
    sql.append("")
    sql.append("-- ✅ Pharmaceutical org structure created")
    sql.append("-- Verify with:")
    sql.append(f"-- SELECT COUNT(*) FROM org_functions WHERE tenant_id = '{tenant_id}';")
    sql.append(f"-- SELECT COUNT(*) FROM org_departments WHERE tenant_id = '{tenant_id}';")
    sql.append(f"-- SELECT COUNT(*) FROM org_roles WHERE tenant_id = '{tenant_id}';")

    return "\n".join(sql)

def main():
    print("=" * 60)
    print("📦 PHARMACEUTICAL DATA IMPORT")
    print("=" * 60)
    print()

    # Check if files exist
    print("🔍 Checking data files...")
    missing_files = []
    for key, filepath in DATA_FILES.items():
        if not os.path.exists(filepath):
            missing_files.append(f"  ❌ {key}: {filepath}")
        else:
            size = os.path.getsize(filepath) / 1024  # KB
            print(f"  ✅ {key}: {size:.1f} KB")

    if missing_files:
        print("\n❌ Missing files:")
        for f in missing_files:
            print(f)
        print("\nPlease ensure all files exist before running import.")
        sys.exit(1)

    print()
    print("=" * 60)
    print("STEP 1: Create Tenant")
    print("=" * 60)
    print()
    print("📝 SQL file created: scripts/create_pharma_tenant.sql")
    print("👉 Run this SQL in Supabase Dashboard first!")
    print("   Then get the tenant_id and update this script.")
    print()

    # For now, use placeholder - user will replace with actual tenant_id
    tenant_id_pharma = "REPLACE_WITH_PHARMA_TENANT_ID"

    print("=" * 60)
    print("STEP 2: Generate Org Structure SQL")
    print("=" * 60)
    print()

    org_sql = generate_pharma_org_structure_sql(tenant_id_pharma)
    org_sql_file = f"{BASE_PATH}/scripts/pharma_org_structure.sql"

    with open(org_sql_file, 'w', encoding='utf-8') as f:
        f.write(org_sql)

    print(f"✅ Generated: {org_sql_file}")
    print(f"📊 Created:")
    print(f"   - 6 Functions")
    print(f"   - 8 Departments")
    print(f"   - 8 Roles")
    print()

    print("=" * 60)
    print("STEP 3: Load Data Files")
    print("=" * 60)
    print()

    # Load personas
    personas = load_json_file(DATA_FILES['personas'])

    # Load JTBDs
    jtbds = load_json_file(DATA_FILES['jtbds'])

    # Load agents
    ma_agents = load_json_file(DATA_FILES['ma_agents'])
    medical_agents = load_json_file(DATA_FILES['medical_agents'])
    marketing_agents = load_json_file(DATA_FILES['marketing_agents'])

    print()
    print("=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print()
    print("1. Run scripts/create_pharma_tenant.sql in Supabase Dashboard")
    print("2. Get the tenant_id from the result")
    print("3. Update this script with actual tenant_id")
    print("4. Run scripts/pharma_org_structure.sql")
    print("5. Transform and import personas")
    print("6. Transform and import JTBDs")
    print("7. Transform and import agents")
    print()
    print("📁 Data Summary:")
    if personas:
        print(f"   - Personas: {len(personas)}")
    if jtbds:
        print(f"   - JTBDs: {len(jtbds)}")
    if ma_agents:
        print(f"   - Market Access Agents: {len(ma_agents)}")
    if medical_agents:
        print(f"   - Medical Affairs Agents: {len(medical_agents)}")
    if marketing_agents:
        print(f"   - Marketing Agents: {len(marketing_agents)}")

    total_agents = 0
    if ma_agents:
        total_agents += len(ma_agents)
    if medical_agents:
        total_agents += len(medical_agents)
    if marketing_agents:
        total_agents += len(marketing_agents)

    print(f"   - TOTAL AGENTS: {total_agents}")
    print()
    print("✅ Preparation complete!")

if __name__ == '__main__':
    main()
