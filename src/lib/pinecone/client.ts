import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
let pinecone: Pinecone | null = null;
let vitalIndex: any = null;

try {
  // Only initialize if API key is available
  if (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== 'demo-key') {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws',
    });

    // Get the VITALpath index
    vitalIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'vitalpath-knowledge-base');
  }
} catch (error) {
  console.warn('Pinecone initialization failed:', error);
  console.warn('Running in demo mode without Pinecone integration');
  // Set to null to ensure demo mode
  pinecone = null;
  vitalIndex = null;
}

// Index configuration for initial setup
export const INDEX_CONFIG = {
  dimension: 1536, // OpenAI embedding dimension
  metric: 'cosine' as const,
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
};

// Vector metadata interface
export interface VectorMetadata {
  organizationId: string;
  projectId?: string;
  documentType: 'regulatory' | 'clinical' | 'market' | 'internal';
  source: string;
  title: string;
  url?: string;
  pageNumber?: number;
  section?: string;
  regulatoryBody?: string;
  publicationDate?: string;
  confidenceScore?: number;
  text: string;
  chunkIndex: number;
  totalChunks: number;
}

// Search filters for different namespaces
export interface SearchFilters {
  organizationId?: string;
  projectId?: string;
  documentType?: string[];
  regulatoryBody?: string[];
  publicationDate?: {
    start?: string;
    end?: string;
  };
}

// Utility function to create namespace for organization
export const getNamespace = (organizationId: string) => `org_${organizationId}`;

// System namespace for public regulatory documents
export const SYSTEM_NAMESPACE = 'system';

export { pinecone, vitalIndex };

// PineconeService class for RAG functionality
export class PineconeService {
  private index: any;

  constructor() {
    this.index = vitalIndex;
  }

  async searchSimilar(
    query: string,
    options: {
      topK?: number;
      filter?: any;
      includeMetadata?: boolean;
      namespace?: string;
    } = {}
  ) {
    const { topK = 5, filter, includeMetadata = true, namespace = SYSTEM_NAMESPACE } = options;

    try {
      // If Pinecone is not available, return mock data
      if (!this.index) {
        console.log('Using mock data for RAG search');
        return this.getMockData();
      }

      // For now, return mock data since we don't have embeddings set up
      // In a real implementation, this would:
      // 1. Generate embeddings for the query using OpenAI
      // 2. Search Pinecone with those embeddings
      // 3. Return the results
      return this.getMockData();
    } catch (error) {
      console.error('Pinecone search error:', error);
      return this.getMockData();
    }
  }

  private getMockData() {
    return [
        {
          id: 'doc1',
          score: 0.95,
          pageContent: 'FDA Digital Therapeutics Guidance: Digital therapeutics (DTx) are evidence-based therapeutic interventions driven by high quality software programs to prevent, manage, or treat a medical disorder or disease.',
          metadata: {
            title: 'FDA Digital Therapeutics Guidance Document',
            source: 'FDA.gov',
            document_type: 'regulation',
            phase: 'regulatory',
            score: 0.95,
            page_number: 1,
            section: 'Introduction'
          }
        },
        {
          id: 'doc2',
          score: 0.87,
          pageContent: 'FDA Software as Medical Device (SaMD) requirements include software classification, quality management systems, clinical evaluation, and cybersecurity considerations.',
          metadata: {
            title: 'FDA SaMD Guidance',
            source: 'FDA.gov',
            document_type: 'regulation',
            phase: 'regulatory',
            score: 0.87,
            page_number: 3,
            section: 'Requirements'
          }
        }
      ];
  }
}