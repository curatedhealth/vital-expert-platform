#!/usr/bin/env python3
"""
Test script to verify Notion and Supabase connections
"""

import os
import sys
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def test_notion_connection():
    """Test Notion API connection"""
    print("\n" + "="*70)
    print("TESTING NOTION CONNECTION")
    print("="*70)
    
    token = os.getenv('NOTION_TOKEN')
    
    if not token:
        print("❌ NOTION_TOKEN not found in .env")
        return False
    
    print(f"✓ Found NOTION_TOKEN: {token[:20]}...")
    
    # Test API connection
    headers = {
        'Authorization': f'Bearer {token}',
        'Notion-Version': '2022-06-28'
    }
    
    try:
        response = requests.get('https://api.notion.com/v1/users/me', headers=headers)
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Connected to Notion!")
            print(f"   Bot Name: {user.get('name', 'Unknown')}")
            print(f"   Bot ID: {user.get('id', 'Unknown')}")
            return True
        else:
            print(f"❌ Failed to connect: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
        return False


def test_supabase_connection():
    """Test Supabase connection"""
    print("\n" + "="*70)
    print("TESTING SUPABASE CONNECTION")
    print("="*70)
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
    
    if not url:
        print("❌ SUPABASE_URL not found in .env")
        return False
    
    if not key:
        print("❌ SUPABASE_SERVICE_KEY not found in .env")
        return False
    
    print(f"✓ Found SUPABASE_URL: {url}")
    print(f"✓ Found SUPABASE_SERVICE_KEY: {key[:20]}...")
    
    try:
        from supabase import create_client
        
        client = create_client(url, key)
        
        # Test query
        result = client.table('agents').select('id, name').limit(1).execute()
        
        print(f"✅ Connected to Supabase!")
        print(f"   Database: {url.split('//')[1].split('.')[0]}")
        
        if result.data:
            print(f"   Test query successful: Found {len(result.data)} agent(s)")
        else:
            print(f"   Test query successful: No agents found (empty table)")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
        return False


def test_notion_search():
    """Test Notion search functionality"""
    print("\n" + "="*70)
    print("TESTING NOTION SEARCH")
    print("="*70)
    
    token = os.getenv('NOTION_TOKEN')
    
    if not token:
        print("❌ NOTION_TOKEN not found")
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
    }
    
    try:
        # Search for databases
        response = requests.post(
            'https://api.notion.com/v1/search',
            headers=headers,
            json={
                'filter': {'property': 'object', 'value': 'database'},
                'page_size': 10
            }
        )
        
        if response.status_code == 200:
            results = response.json().get('results', [])
            print(f"✅ Search successful!")
            print(f"   Found {len(results)} database(s) in your workspace:")
            
            for db in results[:5]:
                title = ''.join([t.get('plain_text', '') for t in db.get('title', [])])
                print(f"   • {title or 'Untitled'} ({db['id']})")
            
            if len(results) > 5:
                print(f"   ... and {len(results) - 5} more")
            
            return True
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Search error: {str(e)}")
        return False


def check_files():
    """Check if required files exist"""
    print("\n" + "="*70)
    print("CHECKING REQUIRED FILES")
    print("="*70)
    
    files = {
        'scripts/create_notion_databases_from_supabase.py': 'Database Creator Script',
        'scripts/sync_bidirectional.py': 'Bidirectional Sync Script',
        'INTEGRATION_COMPLETE.md': 'Integration Summary',
        'QUICK_REFERENCE.md': 'Quick Reference Card',
        'README_NOTION_INTEGRATION.md': 'Main README'
    }
    
    all_exist = True
    
    for file, description in files.items():
        if os.path.exists(file):
            size = os.path.getsize(file) / 1024
            print(f"✅ {description}")
            print(f"   {file} ({size:.1f} KB)")
        else:
            print(f"❌ {description}")
            print(f"   {file} (NOT FOUND)")
            all_exist = False
    
    return all_exist


def main():
    """Run all tests"""
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║   VITAL Expert - Integration Connection Test            ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    results = {
        'Files': check_files(),
        'Notion': test_notion_connection(),
        'Supabase': test_supabase_connection(),
        'Notion Search': test_notion_search()
    }
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20s} {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*70)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\nYou're ready to proceed with:")
        print("  1. python scripts/create_notion_databases_from_supabase.py")
        print("  2. Share databases with integration in Notion")
        print("  3. python scripts/sync_bidirectional.py to-notion")
    else:
        print("⚠️  SOME TESTS FAILED")
        print("\nPlease fix the issues above before proceeding.")
        print("Check .env file and ensure all credentials are set correctly.")
    print("="*70 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())

