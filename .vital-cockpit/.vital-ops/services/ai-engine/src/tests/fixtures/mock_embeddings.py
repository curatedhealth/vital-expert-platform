"""Mock embeddings for testing"""

import numpy as np
from typing import List

# Standard OpenAI embedding dimension
EMBEDDING_DIMENSION = 1536

# Mock embedding vector (normalized)
MOCK_EMBEDDING_1536: List[float] = np.random.randn(EMBEDDING_DIMENSION).tolist()

# Mock embeddings for different texts
MOCK_EMBEDDINGS = {
    "regulatory_query": np.random.randn(EMBEDDING_DIMENSION).tolist(),
    "clinical_query": np.random.randn(EMBEDDING_DIMENSION).tolist(),
    "pharmacovig_query": np.random.randn(EMBEDDING_DIMENSION).tolist(),
}

