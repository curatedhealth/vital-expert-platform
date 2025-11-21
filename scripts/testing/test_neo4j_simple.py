"""
Simple Neo4j Connection Test

Tests basic connectivity to Neo4j AuraDB with detailed error reporting.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Get credentials
uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

print("=" * 60)
print("NEO4J SIMPLE CONNECTION TEST")
print("=" * 60)
print(f"URI: {uri}")
print(f"User: {user}")
print(f"Password: {'*' * len(password) if password else 'NOT SET'}")
print("=" * 60)
print()

if not uri or not user or not password:
    print("❌ ERROR: Missing Neo4j credentials")
    print("Required: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD")
    sys.exit(1)

try:
    from neo4j import GraphDatabase
    import ssl
    import certifi

    print("1️⃣  Attempting connection...")
    print(f"   Original URI: {uri}")

    # For Neo4j Aura with SSL certificate issues on macOS,
    # convert neo4j+s:// to bolt+s:// and use certifi for SSL
    if uri.startswith("neo4j+s://"):
        # Extract hostname
        hostname = uri.replace("neo4j+s://", "")
        # Use bolt+s protocol (simpler, direct connection)
        bolt_uri = f"bolt+s://{hostname}:7687"
        print(f"   Using bolt protocol: {bolt_uri}")
    else:
        bolt_uri = uri

    # Create SSL context with certifi's CA bundle
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    # Connect with bolt protocol
    driver = GraphDatabase.driver(
        bolt_uri,
        auth=(user, password),
        max_connection_pool_size=50
    )

    print("2️⃣  Verifying connection...")

    with driver.session() as session:
        result = session.run("RETURN 1 as test")
        record = result.single()

        if record and record["test"] == 1:
            print("✅ Connection successful!")
            print()

            # Get some basic info
            print("3️⃣  Fetching database info...")
            result = session.run("CALL dbms.components() YIELD name, versions, edition")
            for record in result:
                print(f"   Database: {record['name']}")
                print(f"   Version: {record['versions'][0]}")
                print(f"   Edition: {record['edition']}")
            print()

            # Check if any agents exist
            print("4️⃣  Checking for existing agents...")
            result = session.run("MATCH (a:Agent) RETURN count(a) as count")
            record = result.single()
            agent_count = record["count"] if record else 0
            print(f"   Agents in database: {agent_count}")
            print()

            print("=" * 60)
            print("✅ ALL TESTS PASSED!")
            print("=" * 60)
            print()
            print("Neo4j AuraDB is ready for agent migration.")

    driver.close()
    sys.exit(0)

except Exception as e:
    print()
    print("=" * 60)
    print("❌ CONNECTION FAILED")
    print("=" * 60)
    print(f"Error: {str(e)}")
    print(f"Type: {type(e).__name__}")
    print()

    # Provide helpful troubleshooting
    print("Troubleshooting:")
    print("1. Verify Neo4j Aura instance is running")
    print("2. Check credentials are correct")
    print("3. Verify network connectivity")
    print("4. Check if IP is whitelisted in Neo4j Aura")
    print()

    import traceback
    print("Full traceback:")
    traceback.print_exc()

    sys.exit(1)
