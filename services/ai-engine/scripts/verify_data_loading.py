#!/usr/bin/env python3
"""
Verify Data Loading Status
Checks Pinecone, Neo4j, and PostgreSQL to verify all data is loaded correctly

Usage:
    python verify_data_loading.py

Environment Variables Required:
    PINECONE_API_KEY
    NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
    SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

import os
import sys
import asyncio
from typing import Dict, Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    import structlog
    from pinecone import Pinecone
    from neo4j import AsyncGraphDatabase
    from supabase import create_client
except ImportError as e:
    print(f"Error importing: {e}")
    print("Install: pip install structlog pinecone-client neo4j supabase")
    sys.exit(1)

logger = structlog.get_logger()


class DataLoadingVerifier:
    """Verify all data loading is complete"""
    
    def __init__(self):
        self.results = {
            'pinecone': {'status': 'unknown', 'details': {}},
            'neo4j': {'status': 'unknown', 'details': {}},
            'postgres': {'status': 'unknown', 'details': {}}
        }
    
    async def verify_pinecone(self):
        """Verify Pinecone data"""
        logger.info("Verifying Pinecone...")
        
        try:
            pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
            index_name = "vital-medical-agents"
            
            # Check if index exists
            indexes = [idx.name for idx in pc.list_indexes()]
            if index_name not in indexes:
                self.results['pinecone'] = {
                    'status': 'missing',
                    'details': {'error': f'Index {index_name} not found'}
                }
                return
            
            # Get index stats
            index = pc.Index(index_name)
            stats = index.describe_index_stats()
            
            vector_count = stats.get('total_vector_count', 0)
            
            self.results['pinecone'] = {
                'status': 'success' if vector_count > 0 else 'empty',
                'details': {
                    'index_name': index_name,
                    'total_vectors': vector_count,
                    'dimension': stats.get('dimension', 0),
                    'namespaces': stats.get('namespaces', {})
                }
            }
            
            logger.info(f"✅ Pinecone: {vector_count} vectors")
        
        except Exception as e:
            self.results['pinecone'] = {
                'status': 'error',
                'details': {'error': str(e)}
            }
            logger.error(f"❌ Pinecone verification failed: {e}")
    
    async def verify_neo4j(self):
        """Verify Neo4j data"""
        logger.info("Verifying Neo4j...")
        
        try:
            driver = AsyncGraphDatabase.driver(
                os.getenv('NEO4J_URI'),
                auth=(os.getenv('NEO4J_USER'), os.getenv('NEO4J_PASSWORD'))
            )
            
            async with driver.session() as session:
                # Count nodes
                result = await session.run("MATCH (a:Agent) RETURN count(a) AS count")
                agent_count = (await result.single())['count']
                
                result = await session.run("MATCH (s:Skill) RETURN count(s) AS count")
                skill_count = (await result.single())['count']
                
                result = await session.run("MATCH (t:Tool) RETURN count(t) AS count")
                tool_count = (await result.single())['count']
                
                # Count relationships
                result = await session.run("MATCH ()-[r]->() RETURN count(r) AS count")
                rel_count = (await result.single())['count']
                
                total_nodes = agent_count + skill_count + tool_count
                
                self.results['neo4j'] = {
                    'status': 'success' if total_nodes > 0 else 'empty',
                    'details': {
                        'agents': agent_count,
                        'skills': skill_count,
                        'tools': tool_count,
                        'total_nodes': total_nodes,
                        'total_relationships': rel_count
                    }
                }
                
                logger.info(f"✅ Neo4j: {total_nodes} nodes, {rel_count} relationships")
            
            await driver.close()
        
        except Exception as e:
            self.results['neo4j'] = {
                'status': 'error',
                'details': {'error': str(e)}
            }
            logger.error(f"❌ Neo4j verification failed: {e}")
    
    async def verify_postgres(self):
        """Verify PostgreSQL data"""
        logger.info("Verifying PostgreSQL...")
        
        try:
            supabase = create_client(
                os.getenv('SUPABASE_URL'),
                os.getenv('SUPABASE_SERVICE_KEY')
            )
            
            # Count agents
            agent_response = supabase.table("agents").select("id", count='exact').execute()
            agent_count = agent_response.count
            
            # Count skills
            skill_response = supabase.table("skills").select("id", count='exact').execute()
            skill_count = skill_response.count
            
            # Count KG node types
            node_types_response = supabase.table("kg_node_types").select("id", count='exact').execute()
            node_types_count = node_types_response.count
            
            # Count KG edge types
            edge_types_response = supabase.table("kg_edge_types").select("id", count='exact').execute()
            edge_types_count = edge_types_response.count
            
            # Count agent KG views
            kg_views_response = supabase.table("agent_kg_views").select("id", count='exact').execute()
            kg_views_count = kg_views_response.count
            
            self.results['postgres'] = {
                'status': 'success',
                'details': {
                    'agents': agent_count,
                    'skills': skill_count,
                    'kg_node_types': node_types_count,
                    'kg_edge_types': edge_types_count,
                    'agent_kg_views': kg_views_count
                }
            }
            
            logger.info(f"✅ PostgreSQL: {agent_count} agents, {skill_count} skills, {kg_views_count} KG views")
        
        except Exception as e:
            self.results['postgres'] = {
                'status': 'error',
                'details': {'error': str(e)}
            }
            logger.error(f"❌ PostgreSQL verification failed: {e}")
    
    def print_summary(self):
        """Print verification summary"""
        print("\n" + "="*80)
        print("📊 DATA LOADING VERIFICATION SUMMARY")
        print("="*80 + "\n")
        
        # Pinecone
        pc_status = self.results['pinecone']['status']
        pc_icon = '✅' if pc_status == 'success' else '❌' if pc_status == 'error' else '⚠️'
        print(f"{pc_icon} PINECONE ({pc_status.upper()})")
        if pc_status == 'success':
            details = self.results['pinecone']['details']
            print(f"   Index: {details.get('index_name')}")
            print(f"   Vectors: {details.get('total_vectors', 0)}")
            print(f"   Dimension: {details.get('dimension', 0)}")
        elif pc_status == 'error':
            print(f"   Error: {self.results['pinecone']['details'].get('error')}")
        print()
        
        # Neo4j
        neo4j_status = self.results['neo4j']['status']
        neo4j_icon = '✅' if neo4j_status == 'success' else '❌' if neo4j_status == 'error' else '⚠️'
        print(f"{neo4j_icon} NEO4J ({neo4j_status.upper()})")
        if neo4j_status == 'success':
            details = self.results['neo4j']['details']
            print(f"   Agents: {details.get('agents', 0)}")
            print(f"   Skills: {details.get('skills', 0)}")
            print(f"   Tools: {details.get('tools', 0)}")
            print(f"   Total Nodes: {details.get('total_nodes', 0)}")
            print(f"   Total Relationships: {details.get('total_relationships', 0)}")
        elif neo4j_status == 'error':
            print(f"   Error: {self.results['neo4j']['details'].get('error')}")
        print()
        
        # PostgreSQL
        pg_status = self.results['postgres']['status']
        pg_icon = '✅' if pg_status == 'success' else '❌'
        print(f"{pg_icon} POSTGRESQL ({pg_status.upper()})")
        if pg_status == 'success':
            details = self.results['postgres']['details']
            print(f"   Agents: {details.get('agents', 0)}")
            print(f"   Skills: {details.get('skills', 0)}")
            print(f"   KG Node Types: {details.get('kg_node_types', 0)}")
            print(f"   KG Edge Types: {details.get('kg_edge_types', 0)}")
            print(f"   Agent KG Views: {details.get('agent_kg_views', 0)}")
        elif pg_status == 'error':
            print(f"   Error: {self.results['postgres']['details'].get('error')}")
        print()
        
        # Overall status
        all_success = all(r['status'] == 'success' for r in self.results.values())
        print("="*80)
        if all_success:
            print("✅ ALL SYSTEMS OPERATIONAL - Data loading complete!")
        else:
            print("⚠️  SOME SYSTEMS NEED ATTENTION - Review errors above")
        print("="*80 + "\n")
    
    async def run(self):
        """Run all verifications"""
        logger.info("🔍 Starting data loading verification...")
        
        await asyncio.gather(
            self.verify_pinecone(),
            self.verify_neo4j(),
            self.verify_postgres()
        )
        
        self.print_summary()


def main():
    """Main entry point"""
    required_env_vars = [
        'PINECONE_API_KEY',
        'NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD',
        'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    verifier = DataLoadingVerifier()
    asyncio.run(verifier.run())


if __name__ == "__main__":
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.dev.ConsoleRenderer()
        ]
    )
    main()
