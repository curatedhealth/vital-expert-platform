#!/usr/bin/env python3
import json
import subprocess

APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL = "https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID = "c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Test insert a single JTBD and check response
data = {
    "tenant_id": TENANT_ID,
    "code": "JTBD-TEST-DEBUG-001",
    "name": "Test Debug Insert",
    "description": "Testing insert functionality",
    "functional_area": "Medical Affairs",
    "job_category": "operational",
    "complexity": "medium",
    "frequency": "weekly",
    "status": "active",
    "validation_score": 0.88,
    "jtbd_type": "operational",
    "work_pattern": "mixed",
    "strategic_priority": "medium",
    "impact_level": "medium",
    "compliance_sensitivity": "medium",
    "recommended_service_layer": "L1_expert"
}

print("=== Testing Single JTBD Insert ===")
print(f"Data: {json.dumps(data, indent=2)}")
print()

result = subprocess.run([
    "curl", "-s", "-X", "POST",
    f"{URL}/rest/v1/jtbd",
    "-H", f"apikey: {APIKEY}",
    "-H", f"Authorization: Bearer {APIKEY}",
    "-H", "Content-Type: application/json",
    "-H", "Prefer: return=representation",
    "-d", json.dumps(data)
], capture_output=True, text=True)

print(f"Response: {result.stdout}")
print(f"Stderr: {result.stderr}")
