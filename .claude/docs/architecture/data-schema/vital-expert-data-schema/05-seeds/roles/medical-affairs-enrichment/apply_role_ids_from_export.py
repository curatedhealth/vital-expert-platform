#!/usr/bin/env python3
"""
Automatically update Phase 2 & 3 JSON files with actual role_ids from database export.

This script uses the Medical Affairs export file to replace "TBD" placeholders.
"""

import json
import os
from datetime import datetime
from typing import Dict, List

# File paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PHASE2_FILE = os.path.join(SCRIPT_DIR, "phase2_medical_information_enrichment.json")
PHASE3_FILE = os.path.join(SCRIPT_DIR, "phase3_scientific_communications_enrichment.json")

# Department IDs from export
MED_INFO_DEPT_ID = "2b320eab-1758-42d7-adfa-7f49c12cdf40"
SCI_COMM_DEPT_ID = "9871d82a-631a-4cf7-9a00-1ab838a45c3e"
FUNCTION_ID = "06127088-4d52-40aa-88c9-93f4e79e085a"

# Role mappings from database export
PHASE2_ROLE_MAP = {
    ("Global Medical Information Specialist", "global"): "TBD",  # Not found in export
    ("Regional Medical Information Specialist", "regional"): "10439276-39a3-488a-8c49-2531934fe511",
    ("Local Medical Information Specialist", "local"): "c15316a2-2b06-4d31-890a-86a3f056a68c",

    ("Global Medical Information Manager", "global"): "d2300d04-9ab9-4402-810d-c41281981047",
    ("Regional Medical Information Manager", "regional"): "99ef84bc-0e17-4b8e-9079-120bb9f5758c",
    ("Local Medical Information Manager", "local"): "87614dbc-ddde-4104-9959-18f33382bb84",

    ("Global MI Operations Lead", "global"): "e9e4728e-392f-494f-9b77-6392041b6c25",
    ("Regional MI Operations Lead", "regional"): "b129992d-31de-47d4-bf1c-ab4a8be7a5c7",
    ("Local MI Operations Lead", "local"): "e1a8d2a3-c0b8-4faf-981e-a6c8efdcfa04",

    ("Global Medical Info Associate", "global"): "702f6a9f-372c-49f6-8d4a-3efc8dec8902",
    ("Regional Medical Info Associate", "regional"): "1f7e4517-2e32-4108-b10c-8dc4bf1fa589",
    ("Local Medical Info Associate", "local"): "f9fdae17-b752-4211-8ba0-55b0b6423941",

    ("Global Medical Info Scientist", "global"): "4674cdd3-f12c-4b69-9f10-e8edd5138d14",
    ("Regional Medical Info Scientist", "regional"): "d969ac11-b1fc-4835-8f4c-3718e0aa5051",
    ("Local Medical Info Scientist", "local"): "7e076164-9acd-46cd-872d-1c4cdc980bda",
}

PHASE3_ROLE_MAP = {
    ("Global Scientific Communications Manager", "global"): "1ee591f8-81ed-40a6-b961-e5eebb58a8eb",
    ("Regional Scientific Communications Manager", "regional"): "1fd98496-d670-4199-9e13-87bbf813952f",
    ("Local Scientific Communications Manager", "local"): "5587884a-09bc-4377-992b-68ea30623d59",

    ("Global Medical Writer", "global"): "bd65ecaf-dfb5-4cc3-bec3-754e0c90dc3d",
    ("Regional Medical Writer", "regional"): "15cd4978-60e3-4a80-81aa-43e56216c540",
    ("Local Medical Writer", "local"): "6b09c934-6bcc-4ea0-90af-b616b5543cee",

    ("Global Publications Lead", "global"): "TBD",  # Not found in export
    ("Regional Publications Lead", "regional"): "TBD",  # Not found in export
    ("Local Publications Lead", "local"): "TBD",  # Not found in export

    ("Global Scientific Affairs Lead", "global"): "e30fbcd9-0c1e-4d54-9d2b-1d2b2b78b694",
    ("Regional Scientific Affairs Lead", "regional"): "2d851ef7-14eb-4202-8061-d40b5940b348",
    ("Local Scientific Affairs Lead", "local"): "d35eafc0-7003-4c69-a5d4-b160af0e6b23",

    ("Global Medical Communications Specialist", "global"): "d39afed7-6cf4-4146-8737-40b21738a795",
    ("Regional Medical Communications Specialist", "regional"): "3202b466-4f2e-4eba-8547-b88354bbc3c3",
    ("Local Medical Communications Specialist", "local"): "6cbddb0a-4ecc-4dad-9885-74072cc4dac0",
}


def create_backup(file_path: str) -> None:
    """Create timestamped backup of file."""
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{file_path}.backup_{timestamp}"

    with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
        dst.write(src.read())

    print(f"📦 Backup created: {os.path.basename(backup_path)}")


def update_phase2():
    """Update Phase 2 Medical Information enrichment file."""
    print("\n" + "="*80)
    print("PHASE 2: Medical Information Services")
    print("="*80)

    # Create backup
    create_backup(PHASE2_FILE)

    # Load enrichment data
    with open(PHASE2_FILE, 'r') as f:
        data = json.load(f)

    # Update metadata
    if 'metadata' in data:
        data['metadata']['department_id'] = MED_INFO_DEPT_ID
        data['metadata']['function_id'] = FUNCTION_ID

    # Update role_ids
    matched = 0
    missing = []

    for role in data.get('roles', []):
        role_name = role.get('role_name', '')
        scope = role.get('geographic_scope', '')

        key = (role_name, scope)
        if key in PHASE2_ROLE_MAP:
            role_id = PHASE2_ROLE_MAP[key]
            role['role_id'] = role_id

            if role_id != "TBD":
                matched += 1
                print(f"✅ {role_name:50} → {role_id}")
            else:
                missing.append(role_name)
                print(f"⚠️  {role_name:50} → NOT FOUND IN DATABASE")
        else:
            missing.append(role_name)
            print(f"❌ {role_name:50} → NO MAPPING")

    # Save updated file
    with open(PHASE2_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n📊 Summary:")
    print(f"   Matched: {matched}")
    print(f"   Missing: {len(missing)}")
    if missing:
        print(f"   Roles not in database: {', '.join(missing)}")

    return matched, missing


def update_phase3():
    """Update Phase 3 Scientific Communications enrichment file."""
    print("\n" + "="*80)
    print("PHASE 3: Scientific Communications")
    print("="*80)

    # Create backup
    create_backup(PHASE3_FILE)

    # Load enrichment data
    with open(PHASE3_FILE, 'r') as f:
        data = json.load(f)

    # Update metadata
    if 'metadata' in data:
        data['metadata']['department_id'] = SCI_COMM_DEPT_ID
        data['metadata']['function_id'] = FUNCTION_ID

    # Update role_ids
    matched = 0
    missing = []

    for role in data.get('roles', []):
        role_name = role.get('role_name', '')
        scope = role.get('geographic_scope', '')

        key = (role_name, scope)
        if key in PHASE3_ROLE_MAP:
            role_id = PHASE3_ROLE_MAP[key]
            role['role_id'] = role_id

            if role_id != "TBD":
                matched += 1
                print(f"✅ {role_name:50} → {role_id}")
            else:
                missing.append(role_name)
                print(f"⚠️  {role_name:50} → NOT FOUND IN DATABASE")
        else:
            missing.append(role_name)
            print(f"❌ {role_name:50} → NO MAPPING")

    # Save updated file
    with open(PHASE3_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n📊 Summary:")
    print(f"   Matched: {matched}")
    print(f"   Missing: {len(missing)}")
    if missing:
        print(f"   Roles not in database: {', '.join(missing)}")

    return matched, missing


def main():
    """Main execution function."""
    print("="*80)
    print("Update Phase 2 & 3 Role IDs from Database Export")
    print("="*80)

    # Update Phase 2
    p2_matched, p2_missing = update_phase2()

    # Update Phase 3
    p3_matched, p3_missing = update_phase3()

    # Final summary
    print("\n" + "="*80)
    print("✅ UPDATE COMPLETE")
    print("="*80)
    print(f"Phase 2: {p2_matched}/15 roles matched ({len(p2_missing)} missing)")
    print(f"Phase 3: {p3_matched}/15 roles matched ({len(p3_missing)} missing)")
    print(f"Total:   {p2_matched + p3_matched}/30 roles updated")

    if p2_missing or p3_missing:
        print("\n⚠️  MISSING ROLES:")
        print("These roles were in enrichment files but not found in database export.")
        print("You may need to create these roles first, or remove them from enrichment.")
        print()
        if p2_missing:
            print("Phase 2 (Medical Information):")
            for role in p2_missing:
                print(f"  - {role}")
        if p3_missing:
            print("\nPhase 3 (Scientific Communications):")
            for role in p3_missing:
                print(f"  - {role}")


if __name__ == '__main__':
    main()
