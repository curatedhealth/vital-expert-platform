#!/usr/bin/env python3
"""
Create user_agents table in Supabase database
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))

from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("❌ DATABASE_URL not found in .env file")
    sys.exit(1)

print("🔄 Connecting to database...")
print(f"📡 Database: {db_url[:40]}...")

# Read SQL migration
sql_file = os.path.join(os.path.dirname(__file__), '..', 'sql', 'create_user_agents_table.sql')

with open(sql_file, 'r') as f:
    sql = f.read()

print("📝 SQL migration loaded")
print(f"📏 SQL size: {len(sql)} bytes")

try:
    # Connect to database
    conn = psycopg2.connect(db_url, sslmode='require')
    cur = conn.cursor()

    print("✅ Connected to database")
    print("🔄 Executing migration...")

    # Execute SQL
    cur.execute(sql)
    conn.commit()

    print("✅ Migration executed successfully!")

    # Verify table was created
    cur.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_agents'
    """)
    count = cur.fetchone()[0]

    if count > 0:
        print("✅ user_agents table created and verified!")

        # Check table structure
        cur.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user_agents'
            ORDER BY ordinal_position
        """)

        columns = cur.fetchall()
        print("\n📋 Table structure:")
        for col_name, col_type in columns:
            print(f"   - {col_name}: {col_type}")

    else:
        print("⚠️  Table not found after creation")

    cur.close()
    conn.close()

    print("\n✅ Migration completed successfully!")
    print("🎉 Frontend should now be able to fetch user agents")

except ImportError:
    print("❌ psycopg2-binary not installed")
    print("💡 Installing psycopg2-binary...")
    os.system("pip3 install psycopg2-binary")
    print("✅ psycopg2-binary installed. Please run the script again.")
    sys.exit(1)

except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
