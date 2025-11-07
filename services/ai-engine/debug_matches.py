import os
from pinecone import Pinecone
import asyncio
from openai import AsyncOpenAI

# Initialize
api_key = "pcsk_7VECMV_MafiEHDW2ta2Pb1aBTMmygfYTRTJCeLoCJzd3Wk9wg3djAMdUVppZTpmaZEox9R"
openai_key = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=api_key)
index = pc.Index("vital-rag-production")

# Generate embedding for test query
async def test():
    client = AsyncOpenAI(api_key=openai_key)
    response = await client.embeddings.create(
        input="what if digital strategy for patients with adhd?",
        model="text-embedding-3-large"
    )
    query_embedding = response.data[0].embedding
    
    # Query Pinecone
    results = index.query(
        vector=query_embedding,
        top_k=5,
        include_metadata=True,
        namespace="digital-health"
    )
    
    print(f"✅ Found {len(results.matches)} matches")
    print("\n📋 First match details:")
    if results.matches:
        match = results.matches[0]
        print(f"   Score: {match.score}")
        print(f"   ID: {match.id}")
        print(f"   Metadata:")
        for key, value in match.metadata.items():
            val_preview = str(value)[:100] if len(str(value)) > 100 else str(value)
            print(f"      {key}: {val_preview}")
        
        # Check if chunk_id is empty
        chunk_id = match.metadata.get("chunk_id")
        print(f"\n🔍 chunk_id value: '{chunk_id}'")
        print(f"   Is None: {chunk_id is None}")
        print(f"   Is empty string: {chunk_id == ''}")
        print(f"   Truthiness: {bool(chunk_id)}")

asyncio.run(test())
