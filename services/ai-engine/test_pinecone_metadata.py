import os
from pinecone import Pinecone

# Initialize Pinecone
api_key = "pcsk_7VECMV_MafiEHDW2ta2Pb1aBTMmygfYTRTJCeLoCJzd3Wk9wg3djAMdUVppZTpmaZEox9R"
pc = Pinecone(api_key=api_key)
index = pc.Index("vital-rag-production")

# Query digital-health namespace to see what metadata vectors have
print("🔍 Checking metadata in digital-health namespace...")
try:
    results = index.query(
        vector=[0.1] * 3072,  # Dummy vector
        top_k=5,
        include_metadata=True,
        namespace="digital-health"
    )
    
    if results.matches:
        print(f"\n✅ Found {len(results.matches)} vectors")
        print("\n📋 Sample metadata from first vector:")
        first_match = results.matches[0]
        print(f"   ID: {first_match.id}")
        print(f"   Score: {first_match.score}")
        print(f"   Metadata keys: {list(first_match.metadata.keys()) if first_match.metadata else 'None'}")
        if first_match.metadata:
            for key, value in list(first_match.metadata.items())[:10]:
                print(f"      - {key}: {value}")
    else:
        print("❌ No vectors found in namespace")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Try without any filter
print("\n\n🔍 Checking regulatory-affairs namespace...")
try:
    results = index.query(
        vector=[0.1] * 3072,
        top_k=3,
        include_metadata=True,
        namespace="regulatory-affairs"
    )
    
    if results.matches:
        print(f"✅ Found {len(results.matches)} vectors")
        print(f"   Metadata keys: {list(results.matches[0].metadata.keys()) if results.matches[0].metadata else 'None'}")
    else:
        print("❌ No vectors found")
        
except Exception as e:
    print(f"❌ Error: {e}")
