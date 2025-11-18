#!/usr/bin/env python3
"""
Execute all RA use case SQL files using Supabase Python client
Requires: pip install supabase
"""

import os
import sys
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase-py not installed")
    print("Please install it: pip install supabase")
    sys.exit(1)

# Supabase credentials
SUPABASE_URL = "https://xazinxsiglqokwfmogyk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"

# SQL files to execute
SQL_FILES = [
    "UC_RA_001.sql",
    "UC_RA_002.sql",
    "UC_RA_003.sql",
    "UC_RA_004.sql",
    "UC_RA_005.sql",
    "UC_RA_006.sql",
    "UC_RA_007.sql",
    "UC_RA_008.sql",
    "UC_RA_009.sql",
    "UC_RA_010.sql",
]

def main():
    print("")
    print("=========================================")
    print("  REGULATORY AFFAIRS USE CASES")
    print("  Seeding All 10 Use Cases")
    print("=========================================")
    print("")
    
    # Get script directory
    script_dir = Path(__file__).parent
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    success_count = 0
    failed_count = 0
    
    for sql_file in SQL_FILES:
        filepath = script_dir / sql_file
        print(f"📁 Executing: {sql_file}")
        
        try:
            # Read SQL file
            with open(filepath, 'r') as f:
                sql_content = f.read()
            
            # Execute SQL via RPC
            result = supabase.rpc('exec_sql', {'query': sql_content}).execute()
            
            print(f"✅ {sql_file.replace('.sql', '')} completed")
            success_count += 1
        except Exception as e:
            print(f"❌ {sql_file.replace('.sql', '')} failed")
            print(f"   Error: {str(e)}")
            failed_count += 1
        
        print("")
    
    print("=========================================")
    print("  EXECUTION SUMMARY")
    print("=========================================")
    print(f"✅ Successful: {success_count}/10")
    print(f"❌ Failed: {failed_count}/10")
    print("=========================================")
    
    if failed_count == 0:
        print("")
        print("🎉 All 10 Regulatory Affairs use cases seeded successfully!")
        print("")

if __name__ == '__main__':
    main()

