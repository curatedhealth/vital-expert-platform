#!/usr/bin/env python3
"""Verify Commercial Organization ontology completeness"""
import json
import subprocess
from collections import Counter

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
COMMERCIAL_FUNCTION_ID = "57170e7f-6969-447c-ba2d-bdada970db8b"

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

def main():
    print("╔" + "═" * 62 + "╗")
    print("║     COMMERCIAL ORGANIZATION - ONTOLOGY VERIFICATION          ║")
    print("╚" + "═" * 62 + "╝")
    print()

    # L1: Function
    print("=== L1: Function ===")
    funcs = api_get(f"org_functions?id=eq.{COMMERCIAL_FUNCTION_ID}&select=name,slug")
    if funcs:
        print(f"  Name: {funcs[0].get('name')}")
        print(f"  Slug: {funcs[0].get('slug')}")
    print()

    # L2: Departments
    print("=== L2: Departments ===")
    depts = api_get(f"org_departments?function_id=eq.{COMMERCIAL_FUNCTION_ID}&select=id,name,slug")
    print(f"  Total Commercial departments: {len(depts)}")
    for d in depts:
        print(f"    • {d.get('name')}")
    print()

    # L3: Roles
    print("=== L3: Roles ===")
    roles = api_get(f"org_roles?function_id=eq.{COMMERCIAL_FUNCTION_ID}&select=id,name,seniority_level")
    print(f"  Total Commercial roles: {len(roles)}")
    seniorities = Counter(r.get('seniority_level') for r in roles)
    print("  By seniority level:")
    for level, count in sorted(seniorities.items()):
        print(f"    • {level}: {count} roles")
    print()

    # L4: Personas
    print("=== L4: Personas ===")
    personas = api_get("personas?function_area=eq.Commercial&select=id,department")
    print(f"  Total Commercial personas: {len(personas)}")
    if personas:
        depts_count = Counter(p.get('department') for p in personas)
        print("  By department:")
        for dept, count in sorted(depts_count.items(), key=lambda x: -x[1]):
            print(f"    • {dept}: {count}")
    print()

    # Summary
    print("╔" + "═" * 62 + "╗")
    print("║                         SUMMARY                              ║")
    print("╚" + "═" * 62 + "╝")
    print(f"  L1 Functions:   1")
    print(f"  L2 Departments: {len(depts)}")
    print(f"  L3 Roles:       {len(roles)}")
    print(f"  L4 Personas:    {len(personas)}")
    print()

    # Compare with other functions
    print("=== Comparison with Other Functions ===")

    # Medical Affairs
    ma_func_id = "06127088-4d52-40aa-88c9-93f4e79e085a"
    ma_depts = api_get(f"org_departments?function_id=eq.{ma_func_id}&select=id")
    ma_roles = api_get(f"org_roles?function_id=eq.{ma_func_id}&select=id")

    # Market Access
    mka_func_id = "b7fed05f-90b2-4c4a-a7a8-8346a3159127"
    mka_depts = api_get(f"org_departments?function_id=eq.{mka_func_id}&select=id")
    mka_roles = api_get(f"org_roles?function_id=eq.{mka_func_id}&select=id")

    print(f"  {'Function':<25} {'Depts':>8} {'Roles':>8}")
    print(f"  {'-'*25} {'-'*8} {'-'*8}")
    print(f"  {'Commercial':<25} {len(depts):>8} {len(roles):>8}")
    print(f"  {'Medical Affairs':<25} {len(ma_depts):>8} {len(ma_roles):>8}")
    print(f"  {'Market Access':<25} {len(mka_depts):>8} {len(mka_roles):>8}")

if __name__ == "__main__":
    main()
