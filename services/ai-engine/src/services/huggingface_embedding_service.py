"""
HuggingFace Embedding Service

Free, fast, and efficient embedding models via HuggingFace Inference API or sentence-transformers

Cost Comparison:
- OpenAI text-embedding-3-large: $0.13 per 1M tokens
- HuggingFace (free tier): $0.00 per 1M tokens
- HuggingFace (pro): ~$0.001 per 1M tokens

That's 130x-1000x cheaper!
"""

from typing import List, Optional, Dict, Any, Union
import structlog
from sentence_transformers import SentenceTransformer
import numpy as np

logger = structlog.get_logger()

# Recommended HuggingFace Embedding Models (2025)
# Updated with top performers from MTEB leaderboard
HF_EMBEDDING_MODELS = {
    # Top recommendations for RAG
    'bge-base-en-v1.5': {
        'model_id': 'BAAI/bge-base-en-v1.5',
        'dimensions': 768,
        'quality': 'Very Good',
        'speed': 'Fast',
        'cost': 'FREE',
        'use_cases': ['RAG', 'General Purpose', 'Document Search'],
    },
    'bge-small-en-v1.5': {
        'model_id': 'BAAI/bge-small-en-v1.5',
        'dimensions': 384,
        'quality': 'Good',
        'speed': 'Very Fast',
        'cost': 'FREE',
        'use_cases': ['RAG', 'High Volume', 'Fast Processing'],
    },
    'bge-large-en-v1.5': {
        'model_id': 'BAAI/bge-large-en-v1.5',
        'dimensions': 1024,
        'quality': 'Excellent',
        'speed': 'Medium',
        'cost': 'FREE',
        'use_cases': ['RAG', 'High Quality', 'Best Results'],
    },
    'mxbai-embed-large-v1': {
        'model_id': 'mixedbread-ai/mxbai-embed-large-v1',
        'dimensions': 1024,
        'quality': 'Excellent',
        'speed': 'Medium',
        'cost': 'FREE',
        'mteb_score': 67.4,
        'use_cases': ['RAG', 'General Purpose', 'Top MTEB Performer'],
    },
    'e5-large-v2': {
        'model_id': 'intfloat/e5-large-v2',
        'dimensions': 1024,
        'quality': 'Excellent',
        'speed': 'Medium',
        'cost': 'FREE',
        'use_cases': ['RAG', 'Instruction-Tuned', 'Best for RAG'],
    },
    'all-MiniLM-L6-v2': {
        'model_id': 'sentence-transformers/all-MiniLM-L6-v2',
        'dimensions': 384,
        'quality': 'Good',
        'speed': 'Ultra Fast',
        'cost': 'FREE',
        'use_cases': ['RAG', 'Fast Processing', 'Lightweight'],
    },
    # Medical/Scientific specialized models
    'pubmedbert': {
        'model_id': 'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext',
        'dimensions': 768,
        'quality': 'Very Good (Medical)',
        'speed': 'Fast',
        'cost': 'FREE',
        'use_cases': ['Medical Literature', 'Scientific Papers', 'Biomedical'],
    },
    'biobert': {
        'model_id': 'dmis-lab/biobert-base-cased-v1.1',
        'dimensions': 768,
        'quality': 'Very Good (Biomedical)',
        'speed': 'Fast',
        'cost': 'FREE',
        'use_cases': ['Biomedical Literature', 'Clinical Research'],
    },
}

class HuggingFaceEmbeddingService:
    """HuggingFace embedding service using sentence-transformers"""

    def __init__(
        self,
        model_name: Optional[str] = None,
        use_api: bool = False,
        api_key: Optional[str] = None,
        device: Optional[str] = None,
    ):
        """
        Initialize HuggingFace embedding service

        Args:
            model_name: Name of the model to use (default: 'bge-base-en-v1.5')
            use_api: Whether to use HuggingFace Inference API (requires API key)
            api_key: HuggingFace API key (optional, only needed for API)
            device: Device to use ('cpu', 'cuda', 'mps') - auto-detects if None
        """
        self.use_api = use_api
        self.api_key = api_key

        # Determine model
        if model_name and model_name in HF_EMBEDDING_MODELS:
            self.model_name = model_name
        elif model_name:
            # Try using model_name directly
            self.model_name = model_name
            self.model_config = {
                'model_id': model_name,
                'dimensions': 768,  # Default
                'quality': 'Unknown',
            }
        else:
            # Default to best balance model
            self.model_name = 'bge-base-en-v1.5'

        if hasattr(self, 'model_config'):
            pass
        else:
            self.model_config = HF_EMBEDDING_MODELS[self.model_name]

        self.model_id = self.model_config['model_id']
        self.dimensions = self.model_config['dimensions']

        # Initialize model
        if use_api:
            logger.info("🌐 Using HuggingFace Inference API", model=self.model_id)
            # TODO: Implement API client if needed
            # For now, fall back to local model
            logger.warning("⚠️ HuggingFace API not yet implemented, using local model")
            use_api = False

        if not use_api:
            # Use sentence-transformers locally
            try:
                logger.info("🤗 Loading HuggingFace model locally", model=self.model_id)
                self.model = SentenceTransformer(self.model_id, device=device)
                logger.info("✅ HuggingFace model loaded", 
                          model=self.model_id,
                          dimensions=self.dimensions)
            except Exception as e:
                logger.error("❌ Failed to load HuggingFace model", 
                           error=str(e),
                           model=self.model_id)
                raise

    async def generate_embedding(
        self,
        text: str,
        normalize: bool = True
    ) -> List[float]:
        """
        Generate embedding for a single text

        Args:
            text: Text to embed
            normalize: Whether to normalize the embedding vector

        Returns:
            Embedding vector as list of floats
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        try:
            # Clean text
            cleaned_text = self._clean_text(text)

            # Generate embedding
            embedding = self.model.encode(
                cleaned_text,
                normalize_embeddings=normalize,
                show_progress_bar=False,
            )

            # Convert numpy array to list
            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()

            # Ensure it's a list of floats
            if not isinstance(embedding, list):
                embedding = [float(v) for v in embedding]

            return embedding

        except Exception as e:
            logger.error("❌ Failed to generate embedding", error=str(e))
            raise

    async def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
        normalize: bool = True,
        show_progress: bool = False
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch processing)

        Args:
            texts: List of texts to embed
            batch_size: Batch size for processing
            normalize: Whether to normalize embedding vectors
            show_progress: Whether to show progress bar

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        try:
            # Clean texts
            cleaned_texts = [self._clean_text(text) for text in texts]

            # Generate embeddings in batches
            embeddings = self.model.encode(
                cleaned_texts,
                batch_size=batch_size,
                normalize_embeddings=normalize,
                show_progress_bar=show_progress,
            )

            # Convert numpy array to list of lists
            if isinstance(embeddings, np.ndarray):
                embeddings = embeddings.tolist()

            # Ensure all are lists of floats
            result = []
            for emb in embeddings:
                if isinstance(emb, list):
                    result.append([float(v) for v in emb])
                else:
                    result.append([float(emb)])

            logger.info("✅ Generated batch embeddings",
                       count=len(result),
                       batch_size=batch_size)

            return result

        except Exception as e:
            logger.error("❌ Failed to generate batch embeddings", error=str(e))
            raise

    def get_dimensions(self) -> int:
        """Get embedding dimensions"""
        return self.dimensions

    def get_model_name(self) -> str:
        """Get model name"""
        return self.model_name

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'model_name': self.model_name,
            'model_id': self.model_id,
            'dimensions': self.dimensions,
            'config': self.model_config,
        }

    def _clean_text(self, text: str) -> str:
        """Clean text for embedding"""
        # Remove extra whitespace
        cleaned = ' '.join(text.split())
        
        # Truncate if too long (most models have max token limits)
        max_length = 512  # Conservative limit
        if len(cleaned) > max_length:
            cleaned = cleaned[:max_length]
        
        return cleaned

    def estimate_cost(self, texts: List[str]) -> Dict[str, Any]:
        """
        Estimate cost for generating embeddings

        Args:
            texts: List of texts to estimate cost for

        Returns:
            Cost estimation dictionary
        """
        # HuggingFace is FREE for local models
        total_chars = sum(len(text) for text in texts)
        estimated_tokens = total_chars // 4  # Rough estimate: 4 chars per token

        return {
            'provider': 'huggingface',
            'model': self.model_id,
            'total_texts': len(texts),
            'estimated_tokens': estimated_tokens,
            'cost_per_1m_tokens': 0.0,  # FREE!
            'estimated_cost': 0.0,  # FREE!
            'currency': 'USD',
        }


# Export singleton factory function
def create_huggingface_embedding_service(
    model_name: Optional[str] = None,
    use_api: bool = False,
    api_key: Optional[str] = None,
    device: Optional[str] = None,
) -> HuggingFaceEmbeddingService:
    """Create HuggingFace embedding service instance"""
    return HuggingFaceEmbeddingService(
        model_name=model_name,
        use_api=use_api,
        api_key=api_key,
        device=device,
    )

