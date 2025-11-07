import os
from pinecone import Pinecone

# Load API key
api_key = os.getenv("PINECONE_API_KEY", "pcsk_7VECMV_MafiEHDW2ta2Pb1aBTMmygfYTRTJCeLoCJzd3Wk9wg3djAMdUVppZTpmaZEox9R")

# Initialize Pinecone
pc = Pinecone(api_key=api_key)

# Check RAG index
index_name = "vital-rag-production"
try:
    index = pc.Index(index_name)
    stats = index.describe_index_stats()
    
    print(f"✅ Pinecone Index: {index_name}")
    print(f"   Total vectors: {stats.total_vector_count}")
    print(f"   Dimension: {stats.dimension}")
    print(f"\n📂 Namespaces:")
    
    if hasattr(stats, 'namespaces') and stats.namespaces:
        for ns_name, ns_stats in stats.namespaces.items():
            print(f"   - {ns_name}: {ns_stats.vector_count} vectors")
    else:
        print("   ⚠️  No namespaces found or index is empty")
        
except Exception as e:
    print(f"❌ Error accessing Pinecone: {e}")
