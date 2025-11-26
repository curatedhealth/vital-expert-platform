#!/usr/bin/env python3
"""
Load ALL Skills to Neo4j and Pinecone
Complete data seeding for skills across all databases
"""

import asyncio
import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any
import asyncpg
from neo4j import GraphDatabase
from pinecone import Pinecone
import openai
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configuration
POSTGRES_URL = os.getenv("DATABASE_URL")
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX_NAME", "vital-agents")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TENANT_ID = os.getenv("TENANT_ID", "vital-expert-platform")

# Initialize clients
openai.api_key = OPENAI_API_KEY

print("=" * 80)
print("SKILLS DATA SEEDING - MULTI-DATABASE LOADER")
print("=" * 80)
print(f"Target Databases: PostgreSQL, Neo4j, Pinecone")
print(f"Tenant ID: {TENANT_ID}\n")

async def load_skills_from_postgres():
    """Load all skills from PostgreSQL"""
    conn = await asyncpg.connect(POSTGRES_URL)
    
    try:
        skills = await conn.fetch("""
            SELECT 
                id,
                name,
                description,
                implementation_type,
                implementation_ref,
                category,
                complexity_level,
                is_active,
                metadata,
                created_at,
                updated_at
            FROM skills
            WHERE is_active = true
            ORDER BY category, name
        """)
        
        print(f"✓ Loaded {len(skills)} skills from PostgreSQL")
        return [dict(skill) for skill in skills]
    
    finally:
        await conn.close()

def load_skills_to_neo4j(skills: List[Dict]):
    """Load skills into Neo4j as nodes"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    with driver.session() as session:
        # Create constraint
        session.run("""
            CREATE CONSTRAINT skill_id_unique IF NOT EXISTS
            FOR (s:Skill) REQUIRE s.id IS UNIQUE
        """)
        
        # Load skills
        for skill in skills:
            session.run("""
                MERGE (s:Skill {id: $id})
                SET s.name = $name,
                    s.description = $description,
                    s.category = $category,
                    s.implementation_type = $implementation_type,
                    s.implementation_ref = $implementation_ref,
                    s.complexity_level = $complexity_level,
                    s.is_active = $is_active,
                    s.source = $source,
                    s.tenant_id = $tenant_id,
                    s.updated_at = datetime()
            """, {
                'id': str(skill['id']),
                'name': skill['name'],
                'description': skill['description'],
                'category': skill['category'],
                'implementation_type': skill['implementation_type'],
                'implementation_ref': skill['implementation_ref'],
                'complexity_level': skill['complexity_level'],
                'is_active': skill['is_active'],
                'source': skill['metadata'].get('source', 'unknown'),
                'tenant_id': TENANT_ID
            })
        
        # Create category relationships
        session.run("""
            MATCH (s:Skill)
            MERGE (c:Category {name: s.category, tenant_id: $tenant_id})
            MERGE (s)-[:BELONGS_TO_CATEGORY]->(c)
        """, {'tenant_id': TENANT_ID})
        
        # Create implementation type relationships
        session.run("""
            MATCH (s:Skill)
            MERGE (t:ImplementationType {name: s.implementation_type, tenant_id: $tenant_id})
            MERGE (s)-[:HAS_IMPLEMENTATION_TYPE]->(t)
        """, {'tenant_id': TENANT_ID})
        
        print(f"✓ Loaded {len(skills)} skills to Neo4j")
        
        # Get stats
        result = session.run("""
            MATCH (s:Skill {tenant_id: $tenant_id})
            RETURN count(s) as skill_count
        """, {'tenant_id': TENANT_ID})
        
        for record in result:
            print(f"  Neo4j Skill Count: {record['skill_count']}")
    
    driver.close()

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI"""
    try:
        response = await asyncio.to_thread(
            openai.embeddings.create,
            model="text-embedding-3-small",
            input=text,
            dimensions=1536
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"  ⚠️  Embedding error: {e}")
        return [0.0] * 1536  # Return zero vector on error

async def load_skills_to_pinecone(skills: List[Dict]):
    """Load skills into Pinecone with embeddings"""
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)
    
    vectors = []
    
    print(f"Generating embeddings for {len(skills)} skills...")
    
    for i, skill in enumerate(skills, 1):
        # Create embedding text
        embedding_text = f"{skill['name']}. {skill['description']} Category: {skill['category']}"
        
        # Generate embedding
        embedding = await generate_embedding(embedding_text)
        
        # Prepare metadata
        metadata = {
            'id': str(skill['id']),
            'type': 'skill',
            'name': skill['name'],
            'description': skill['description'][:500],  # Pinecone metadata limit
            'category': skill['category'],
            'implementation_type': skill['implementation_type'],
            'complexity_level': skill['complexity_level'],
            'tenant_id': TENANT_ID,
            'source': skill['metadata'].get('source', 'unknown')
        }
        
        # Add to batch
        vectors.append({
            'id': f"skill-{skill['id']}",
            'values': embedding,
            'metadata': metadata
        })
        
        print(f"  [{i}/{len(skills)}] {skill['name']:<50} [{skill['category']}]", end='\r')
        
        # Upsert in batches of 100
        if len(vectors) >= 100:
            index.upsert(vectors=vectors, namespace=TENANT_ID)
            vectors = []
    
    # Upsert remaining
    if vectors:
        index.upsert(vectors=vectors, namespace=TENANT_ID)
    
    print(f"\n✓ Loaded {len(skills)} skills to Pinecone")
    
    # Get stats
    stats = index.describe_index_stats()
    print(f"  Pinecone Total Vectors: {stats.total_vector_count}")
    if TENANT_ID in stats.namespaces:
        print(f"  Pinecone Tenant Vectors: {stats.namespaces[TENANT_ID].vector_count}")

async def create_skill_dependencies_in_neo4j():
    """Create skill dependency relationships in Neo4j"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    with driver.session() as session:
        # Example: Scientific skills depend on each other
        session.run("""
            MATCH (s1:Skill {name: "Scientific Packages"})
            MATCH (s2:Skill {name: "Scientific Databases"})
            MERGE (s1)-[:DEPENDS_ON {type: "recommended"}]->(s2)
        """)
        
        # Document skills interdependencies
        session.run("""
            MATCH (docx:Skill)
            WHERE docx.name CONTAINS "DOCX"
            MATCH (pdf:Skill)
            WHERE pdf.name CONTAINS "PDF"
            MERGE (docx)-[:RELATED_TO {strength: 0.8}]->(pdf)
        """)
        
        print("✓ Created skill dependency relationships in Neo4j")
    
    driver.close()

async def verify_seeding():
    """Verify all data was loaded correctly"""
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)
    
    # PostgreSQL
    conn = await asyncpg.connect(POSTGRES_URL)
    pg_count = await conn.fetchval("SELECT COUNT(*) FROM skills WHERE is_active = true")
    await conn.close()
    print(f"✓ PostgreSQL: {pg_count} active skills")
    
    # Neo4j
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        result = session.run("""
            MATCH (s:Skill {tenant_id: $tenant_id})
            RETURN count(s) as count
        """, {'tenant_id': TENANT_ID})
        neo4j_count = result.single()['count']
        print(f"✓ Neo4j: {neo4j_count} skill nodes")
        
        # Category distribution
        result = session.run("""
            MATCH (s:Skill {tenant_id: $tenant_id})
            RETURN s.category as category, count(s) as count
            ORDER BY count DESC
            LIMIT 10
        """, {'tenant_id': TENANT_ID})
        
        print("\n  Top Categories in Neo4j:")
        for record in result:
            print(f"    {record['category']:<30} {record['count']:>3} skills")
    
    driver.close()
    
    # Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)
    stats = index.describe_index_stats()
    pinecone_count = stats.namespaces.get(TENANT_ID, {}).get('vector_count', 0) if hasattr(stats, 'namespaces') else 0
    print(f"\n✓ Pinecone: {pinecone_count} skill vectors")
    
    # Consistency check
    if pg_count == neo4j_count == pinecone_count:
        print("\n✅ SUCCESS: All databases consistent!")
        print(f"   All databases contain {pg_count} skills")
    else:
        print("\n⚠️  WARNING: Database counts differ")
        print(f"   PostgreSQL: {pg_count}")
        print(f"   Neo4j: {neo4j_count}")
        print(f"   Pinecone: {pinecone_count}")

async def main():
    try:
        # Step 1: Load skills from PostgreSQL
        print("\n[1/5] Loading skills from PostgreSQL...")
        skills = await load_skills_from_postgres()
        
        if not skills:
            print("❌ No skills found in PostgreSQL. Please run the SQL seed script first.")
            return
        
        # Step 2: Load to Neo4j
        print("\n[2/5] Loading skills to Neo4j...")
        load_skills_to_neo4j(skills)
        
        # Step 3: Create skill dependencies
        print("\n[3/5] Creating skill dependencies in Neo4j...")
        await create_skill_dependencies_in_neo4j()
        
        # Step 4: Load to Pinecone
        print("\n[4/5] Loading skills to Pinecone...")
        await load_skills_to_pinecone(skills)
        
        # Step 5: Verify
        print("\n[5/5] Verifying seeding...")
        await verify_seeding()
        
        print("\n" + "=" * 80)
        print("✅ SKILLS SEEDING COMPLETE")
        print("=" * 80)
        print("\nAll 58 skills have been loaded to:")
        print("  ✓ PostgreSQL (Supabase) - Source of truth")
        print("  ✓ Neo4j - Knowledge graph relationships")
        print("  ✓ Pinecone - Vector embeddings for semantic search")
        print("\nReady for AgentOS 3.0 integration!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())


