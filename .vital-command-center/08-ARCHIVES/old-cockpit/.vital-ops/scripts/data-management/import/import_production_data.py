#!/usr/bin/env python3
"""
Import Production Data to Supabase
===================================
Imports agents, personas, and JTBDs from JSON files to Supabase database

Usage:
    python3 import_production_data.py --agents agents.json --personas personas.json --jtbds jtbds.json

Requirements:
    pip install supabase python-dotenv
"""

import os
import json
import argparse
from typing import Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://bomltkhixeatxuoxmolq.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'your-service-key-here')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def import_agents(file_path: str) -> int:
    """Import agents from JSON file"""
    print(f"\n📦 Importing agents from {file_path}...")

    with open(file_path, 'r') as f:
        agents = json.load(f)

    imported = 0
    errors = []

    for agent in agents:
        try:
            # Ensure required fields exist
            if 'id' not in agent or 'name' not in agent:
                errors.append(f"Agent missing required fields: {agent}")
                continue

            # Insert or upsert agent
            result = supabase.table('agents').upsert(agent, on_conflict='id').execute()
            imported += 1

            if imported % 50 == 0:
                print(f"  Imported {imported}/{len(agents)} agents...")

        except Exception as e:
            errors.append(f"Error importing agent {agent.get('name', 'unknown')}: {str(e)}")

    print(f"✅ Imported {imported} agents")
    if errors:
        print(f"⚠️  {len(errors)} errors:")
        for error in errors[:5]:  # Show first 5 errors
            print(f"  - {error}")

    return imported


def import_personas(file_path: str) -> int:
    """Import personas from JSON file"""
    print(f"\n📦 Importing personas from {file_path}...")

    with open(file_path, 'r') as f:
        personas = json.load(f)

    imported = 0
    errors = []

    for persona in personas:
        try:
            # Ensure required fields exist
            if 'id' not in persona or 'name' not in persona:
                errors.append(f"Persona missing required fields: {persona}")
                continue

            # Insert or upsert persona
            result = supabase.table('personas').upsert(persona, on_conflict='id').execute()
            imported += 1

            if imported % 50 == 0:
                print(f"  Imported {imported}/{len(personas)} personas...")

        except Exception as e:
            errors.append(f"Error importing persona {persona.get('name', 'unknown')}: {str(e)}")

    print(f"✅ Imported {imported} personas")
    if errors:
        print(f"⚠️  {len(errors)} errors:")
        for error in errors[:5]:
            print(f"  - {error}")

    return imported


def import_jtbds(file_path: str) -> int:
    """Import JTBDs from JSON file"""
    print(f"\n📦 Importing JTBDs from {file_path}...")

    with open(file_path, 'r') as f:
        jtbds = json.load(f)

    imported = 0
    errors = []

    for jtbd in jtbds:
        try:
            # Ensure required fields exist
            if 'id' not in jtbd or 'job_statement' not in jtbd:
                errors.append(f"JTBD missing required fields: {jtbd}")
                continue

            # Insert or upsert JTBD
            result = supabase.table('jobs_to_be_done').upsert(jtbd, on_conflict='id').execute()
            imported += 1

            if imported % 50 == 0:
                print(f"  Imported {imported}/{len(jtbds)} JTBDs...")

        except Exception as e:
            errors.append(f"Error importing JTBD {jtbd.get('job_statement', 'unknown')[:50]}: {str(e)}")

    print(f"✅ Imported {imported} JTBDs")
    if errors:
        print(f"⚠️  {len(errors)} errors:")
        for error in errors[:5]:
            print(f"  - {error}")

    return imported


def import_jtbd_persona_mappings(file_path: str) -> int:
    """Import JTBD-Persona mappings from JSON file"""
    print(f"\n📦 Importing JTBD-Persona mappings from {file_path}...")

    with open(file_path, 'r') as f:
        mappings = json.load(f)

    imported = 0
    errors = []

    for mapping in mappings:
        try:
            # Ensure required fields exist
            if 'jtbd_id' not in mapping or 'persona_id' not in mapping:
                errors.append(f"Mapping missing required fields: {mapping}")
                continue

            # Insert or upsert mapping
            result = supabase.table('jtbd_personas').upsert(mapping).execute()
            imported += 1

            if imported % 50 == 0:
                print(f"  Imported {imported}/{len(mappings)} mappings...")

        except Exception as e:
            errors.append(f"Error importing mapping: {str(e)}")

    print(f"✅ Imported {imported} JTBD-Persona mappings")
    if errors:
        print(f"⚠️  {len(errors)} errors:")
        for error in errors[:5]:
            print(f"  - {error}")

    return imported


def verify_import():
    """Verify imported data counts"""
    print("\n📊 Verifying import...")

    try:
        agents_count = supabase.table('agents').select('id', count='exact').execute()
        personas_count = supabase.table('personas').select('id', count='exact').execute()
        jtbds_count = supabase.table('jobs_to_be_done').select('id', count='exact').execute()

        print(f"\n✅ Current database counts:")
        print(f"  - Agents: {agents_count.count}")
        print(f"  - Personas: {personas_count.count}")
        print(f"  - JTBDs: {jtbds_count.count}")

        # Check expected counts
        if agents_count.count >= 254:
            print(f"  ✅ Agents: Expected 254, got {agents_count.count}")
        else:
            print(f"  ⚠️  Agents: Expected 254, got {agents_count.count}")

        if personas_count.count >= 335:
            print(f"  ✅ Personas: Expected 335, got {personas_count.count}")
        else:
            print(f"  ⚠️  Personas: Expected 335, got {personas_count.count}")

        if jtbds_count.count >= 338:
            print(f"  ✅ JTBDs: Expected 338, got {jtbds_count.count}")
        else:
            print(f"  ⚠️  JTBDs: Expected 338, got {jtbds_count.count}")

    except Exception as e:
        print(f"❌ Error verifying import: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description='Import production data to Supabase')
    parser.add_argument('--agents', help='Path to agents JSON file')
    parser.add_argument('--personas', help='Path to personas JSON file')
    parser.add_argument('--jtbds', help='Path to JTBDs JSON file')
    parser.add_argument('--mappings', help='Path to JTBD-Persona mappings JSON file')
    parser.add_argument('--verify-only', action='store_true', help='Only verify existing data')

    args = parser.parse_args()

    if args.verify_only:
        verify_import()
        return

    print("=" * 60)
    print("📦 VITAL.expert - Production Data Import")
    print("=" * 60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print("=" * 60)

    # Check if Supabase is accessible
    try:
        supabase.table('agents').select('id').limit(1).execute()
        print("✅ Supabase connection successful")
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        print("\nPlease check:")
        print("1. SUPABASE_URL is correct")
        print("2. SUPABASE_SERVICE_KEY is set (use service role key, not anon key)")
        print("3. Database is accessible")
        return

    # Import data
    total_imported = 0

    if args.agents:
        total_imported += import_agents(args.agents)

    if args.personas:
        total_imported += import_personas(args.personas)

    if args.jtbds:
        total_imported += import_jtbds(args.jtbds)

    if args.mappings:
        total_imported += import_jtbd_persona_mappings(args.mappings)

    if total_imported > 0:
        verify_import()
        print(f"\n🎉 Import complete! Total records imported: {total_imported}")
    else:
        print("\n⚠️  No data files specified. Use --help for usage.")


if __name__ == '__main__':
    main()
