#!/usr/bin/env python3
"""
Update Phase 2 & 3 JSON enrichment files with actual role_ids from database.

Usage:
1. Run query_phase2_role_ids.sql in Supabase SQL Editor
2. Run query_phase3_role_ids.sql in Supabase SQL Editor
3. Copy the JSON output from the queries
4. Run this script to update the enrichment files

This script will:
- Match roles by name and geographic scope
- Replace "TBD" placeholders with actual UUIDs
- Preserve all enrichment data
- Create backup files before updating
"""

import json
import os
from datetime import datetime
from typing import Dict, List

# File paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PHASE2_FILE = os.path.join(SCRIPT_DIR, "phase2_medical_information_enrichment.json")
PHASE3_FILE = os.path.join(SCRIPT_DIR, "phase3_scientific_communications_enrichment.json")


def load_json_file(file_path: str) -> Dict:
    """Load JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)


def save_json_file(file_path: str, data: Dict) -> None:
    """Save JSON file with pretty formatting."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✅ Updated: {file_path}")


def create_backup(file_path: str) -> None:
    """Create timestamped backup of file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{file_path}.backup_{timestamp}"

    with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
        dst.write(src.read())

    print(f"📦 Backup created: {backup_path}")


def normalize_role_name(name: str) -> str:
    """Normalize role name for matching."""
    return name.lower().strip()


def match_role(enrichment_role: Dict, db_roles: List[Dict]) -> str | None:
    """
    Match enrichment role to database role by name and geographic scope.

    Returns:
        role_id (UUID) if match found, None otherwise
    """
    target_name = normalize_role_name(enrichment_role['role_name'])
    target_scope = enrichment_role.get('geographic_scope', '').lower()

    for db_role in db_roles:
        # Handle both 'role_name' and 'name' column variations
        db_name = normalize_role_name(db_role.get('role_name') or db_role.get('name', ''))
        db_scope = db_role.get('geographic_scope', '').lower()

        # Exact match on name and scope
        if db_name == target_name and db_scope == target_scope:
            return db_role.get('role_id') or db_role.get('id')

        # Partial match if scope embedded in name
        if target_scope in db_name and target_name.replace(target_scope, '').strip() in db_name:
            return db_role.get('role_id') or db_role.get('id')

    return None


def update_phase2_role_ids(db_results: List[Dict]) -> None:
    """Update Phase 2 Medical Information enrichment file."""
    print("\n" + "="*60)
    print("PHASE 2: Medical Information Roles")
    print("="*60)

    # Create backup
    create_backup(PHASE2_FILE)

    # Load enrichment data
    enrichment = load_json_file(PHASE2_FILE)

    # Update metadata
    if 'metadata' in enrichment:
        # Get department_id from first matching db_role
        if db_results and 'department_id' in db_results[0]:
            enrichment['metadata']['department_id'] = db_results[0]['department_id']

    # Match and update role_ids
    matched = 0
    unmatched = []

    for role in enrichment.get('roles', []):
        if role.get('role_id') == 'TBD':
            role_id = match_role(role, db_results)

            if role_id:
                role['role_id'] = role_id
                matched += 1
                print(f"✅ Matched: {role['role_name']} → {role_id}")
            else:
                unmatched.append(role['role_name'])
                print(f"⚠️  Not found: {role['role_name']}")

    # Save updated file
    save_json_file(PHASE2_FILE, enrichment)

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Matched: {matched}")
    print(f"   Unmatched: {len(unmatched)}")
    if unmatched:
        print(f"   Missing roles: {', '.join(unmatched)}")


def update_phase3_role_ids(db_results: List[Dict]) -> None:
    """Update Phase 3 Scientific Communications enrichment file."""
    print("\n" + "="*60)
    print("PHASE 3: Scientific Communications Roles")
    print("="*60)

    # Create backup
    create_backup(PHASE3_FILE)

    # Load enrichment data
    enrichment = load_json_file(PHASE3_FILE)

    # Update metadata
    if 'metadata' in enrichment:
        # Get department_id from first matching db_role
        if db_results and 'department_id' in db_results[0]:
            enrichment['metadata']['department_id'] = db_results[0]['department_id']

    # Match and update role_ids
    matched = 0
    unmatched = []

    for role in enrichment.get('roles', []):
        if role.get('role_id') == 'TBD':
            role_id = match_role(role, db_results)

            if role_id:
                role['role_id'] = role_id
                matched += 1
                print(f"✅ Matched: {role['role_name']} → {role_id}")
            else:
                unmatched.append(role['role_name'])
                print(f"⚠️  Not found: {role['role_name']}")

    # Save updated file
    save_json_file(PHASE3_FILE, enrichment)

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Matched: {matched}")
    print(f"   Unmatched: {len(unmatched)}")
    if unmatched:
        print(f"   Missing roles: {', '.join(unmatched)}")


def main():
    """Main execution function."""
    print("="*60)
    print("Update Role IDs - Phase 2 & 3 Enrichment")
    print("="*60)

    # Instructions
    print("\n📋 Instructions:")
    print("1. Run query_phase2_role_ids.sql in Supabase SQL Editor")
    print("2. Copy the JSON output from the 'json_mapping' column")
    print("3. Paste it below when prompted")
    print("4. Repeat for Phase 3 query")
    print()

    # Phase 2 update
    print("\n" + "─"*60)
    print("PHASE 2: Medical Information")
    print("─"*60)
    response = input("\nPaste Phase 2 JSON results (or 'skip'): ").strip()

    if response and response.lower() != 'skip':
        try:
            # Parse JSON array from SQL output
            phase2_results = json.loads(response)
            if isinstance(phase2_results, dict):
                phase2_results = [phase2_results]

            update_phase2_role_ids(phase2_results)
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing Phase 2 JSON: {e}")
    else:
        print("⏭️  Skipping Phase 2")

    # Phase 3 update
    print("\n" + "─"*60)
    print("PHASE 3: Scientific Communications")
    print("─"*60)
    response = input("\nPaste Phase 3 JSON results (or 'skip'): ").strip()

    if response and response.lower() != 'skip':
        try:
            # Parse JSON array from SQL output
            phase3_results = json.loads(response)
            if isinstance(phase3_results, dict):
                phase3_results = [phase3_results]

            update_phase3_role_ids(phase3_results)
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing Phase 3 JSON: {e}")
    else:
        print("⏭️  Skipping Phase 3")

    print("\n" + "="*60)
    print("✅ Update Complete")
    print("="*60)


if __name__ == '__main__':
    main()
