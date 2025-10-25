/**
 * Unit Tests for RAG (Retrieval-Augmented Generation) System
 * Tests knowledge retrieval, document processing, and contextual enhancement
 */

// Mock RAG service interfaces (since the actual implementation may vary)
interface Document {
  id: string;
  title: string;
  content: string;
  metadata: {
    source: string;
    type: 'clinical-guideline' | 'fda-guidance' | 'research-paper' | 'medical-protocol';
    publishedDate: string;
    relevanceScore: number;
    medicalSpecialty?: string;
    regulatoryAuthority?: string;
  };
  embedding?: number[];
}

interface RAGQuery {
  query: string;
  context?: string;
  maxDocuments?: number;
  minRelevanceScore?: number;
  documentTypes?: string[];
  specialtyFilter?: string;
}

interface RAGResponse {
  documents: Document[];
  contextualSummary: string;
  confidence: number;
  totalDocuments: number;
  processingTime: number;
}

interface VectorStore {
  addDocument: (document: Document) => Promise<void>;
  searchSimilar: (query: string, limit?: number) => Promise<Document[]>;
  updateDocument: (id: string, document: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

// Mock implementations for testing
class MockVectorStore implements VectorStore {
  private documents: Document[] = [];

  async addDocument(document: Document): Promise<void> {
    this.documents.push(document);
  }

  async searchSimilar(query: string, limit: number = 10): Promise<Document[]> {
    // Simple mock search based on title/content matching
    const queryLower = query.toLowerCase();
    return this.documents
      .filter(doc =>
        doc.title.toLowerCase().includes(queryLower) ||
        doc.content.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => b.metadata.relevanceScore - a.metadata.relevanceScore)
      .slice(0, limit);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documents[index] = { ...this.documents[index], ...updates };
    }
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents = this.documents.filter(doc => doc.id !== id);
  }

  // Helper method for testing
  getDocumentCount(): number {
    return this.documents.length;
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }
}

class MockRAGService {
  constructor(private vectorStore: VectorStore) {}

  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();

    const documents = await this.vectorStore.searchSimilar(
      ragQuery.query,
      ragQuery.maxDocuments || 5
    );

    // Filter by relevance score
    const filteredDocs = documents.filter(
      doc => doc.metadata.relevanceScore >= (ragQuery.minRelevanceScore || 0.7)
    );

    // Filter by document types if specified
    const typedFilteredDocs = ragQuery.documentTypes?.length
      ? filteredDocs.filter(doc => ragQuery.documentTypes!.includes(doc.metadata.type))
      : filteredDocs;

    // Filter by specialty if specified
    const specialtyFilteredDocs = ragQuery.specialtyFilter
      ? typedFilteredDocs.filter(doc => doc.metadata.medicalSpecialty === ragQuery.specialtyFilter)
      : typedFilteredDocs;

    const processingTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(specialtyFilteredDocs, ragQuery.query);
    const contextualSummary = this.generateSummary(specialtyFilteredDocs, ragQuery.query);

    return {
      documents: specialtyFilteredDocs,
      contextualSummary,
      confidence,
      totalDocuments: specialtyFilteredDocs.length,
      processingTime,
    };
  }

  private calculateConfidence(documents: Document[], query: string): number {
    if (documents.length === 0) return 0;

    const avgRelevance = documents.reduce(
      (sum, doc) => sum + doc.metadata.relevanceScore, 0
    ) / documents.length;

    return Math.min(avgRelevance * 1.1, 1.0); // Boost slightly but cap at 1.0
  }

  private generateSummary(documents: Document[], query: string): string {
    if (documents.length === 0) {
      return "No relevant documents found for the query.";
    }

    const topDoc = documents[0];
    return `Based on ${documents.length} relevant document(s), primarily from ${topDoc.metadata.source}. Key finding: ${topDoc.content.substring(0, 100)}...`;
  }
}

describe('RAG System - Document Management', () => {
  let vectorStore: MockVectorStore;
  let ragService: MockRAGService;

  const sampleDocuments: Document[] = [
    {
      id: 'doc-1',
      title: 'FDA Digital Therapeutics Guidance 2022',
      content: 'Digital therapeutics (DTx) are evidence-based therapeutic interventions driven by high quality software programs to prevent, manage, or treat a medical disorder or disease.',
      metadata: {
        source: 'FDA.gov',
        type: 'fda-guidance',
        publishedDate: '2022-09-27',
        relevanceScore: 0.95,
        regulatoryAuthority: 'FDA',
      },
    },
    {
      id: 'doc-2',
      title: 'Clinical Evidence Requirements for Digital Health Tools',
      content: 'Randomized controlled trials remain the gold standard for demonstrating clinical efficacy of digital health interventions, with specific considerations for user engagement and real-world evidence.',
      metadata: {
        source: 'Journal of Medical Internet Research',
        type: 'research-paper',
        publishedDate: '2023-03-15',
        relevanceScore: 0.88,
        medicalSpecialty: 'Clinical Research',
      },
    },
    {
      id: 'doc-3',
      title: 'ISO 14155 Clinical Investigation of Medical Devices',
      content: 'ISO 14155 specifies general requirements for clinical investigation of medical devices for human subjects, including digital therapeutics and software as medical devices.',
      metadata: {
        source: 'ISO Standards',
        type: 'clinical-guideline',
        publishedDate: '2020-07-01',
        relevanceScore: 0.82,
        medicalSpecialty: 'Regulatory Affairs',
      },
    },
    {
      id: 'doc-4',
      title: 'EMA Guideline on Software as Medical Device',
      content: 'European Medicines Agency guidance on software as medical device (SaMD) classification and regulatory requirements under the Medical Device Regulation.',
      metadata: {
        source: 'EMA.europa.eu',
        type: 'fda-guidance',
        publishedDate: '2023-01-12',
        relevanceScore: 0.91,
        regulatoryAuthority: 'EMA',
        medicalSpecialty: 'Regulatory Affairs',
      },
    },
  ];

  beforeEach(() => {
    vectorStore = new MockVectorStore();
    ragService = new MockRAGService(vectorStore);
  });

  describe('Document Storage and Retrieval', () => {
    it('should add documents to vector store', async () => {
      await vectorStore.addDocument(sampleDocuments[0]);
      expect(vectorStore.getDocumentCount()).toBe(1);

      const docs = vectorStore.getDocuments();
      expect(docs[0].title).toBe('FDA Digital Therapeutics Guidance 2022');
    });

    it('should search documents by content similarity', async () => {
      // Add multiple documents
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }

      const results = await vectorStore.searchSimilar('digital therapeutics');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Digital Therapeutics');
    });

    it('should update existing documents', async () => {
      await vectorStore.addDocument(sampleDocuments[0]);

      await vectorStore.updateDocument('doc-1', {
        metadata: {
          ...sampleDocuments[0].metadata,
          relevanceScore: 0.99,
        },
      });

      const docs = vectorStore.getDocuments();
      expect(docs[0].metadata.relevanceScore).toBe(0.99);
    });

    it('should delete documents from store', async () => {
      await vectorStore.addDocument(sampleDocuments[0]);
      expect(vectorStore.getDocumentCount()).toBe(1);

      await vectorStore.deleteDocument('doc-1');
      expect(vectorStore.getDocumentCount()).toBe(0);
    });
  });

  describe('RAG Query Processing', () => {
    beforeEach(async () => {
      // Add all sample documents
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }
    });

    it('should process basic RAG queries', async () => {
      const query: RAGQuery = {
        query: 'digital therapeutics regulatory requirements',
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0.7);
      expect(response.contextualSummary).toContain('relevant document');
      expect(response.processingTime).toBeGreaterThan(0);
    });

    it('should filter by relevance score', async () => {
      const query: RAGQuery = {
        query: 'clinical trials',
        minRelevanceScore: 0.9,
      };

      const response = await ragService.query(query);

      response.documents.forEach(doc => {
        expect(doc.metadata.relevanceScore).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should filter by document type', async () => {
      const query: RAGQuery = {
        query: 'regulatory guidance',
        documentTypes: ['fda-guidance'],
      };

      const response = await ragService.query(query);

      response.documents.forEach(doc => {
        expect(doc.metadata.type).toBe('fda-guidance');
      });
    });

    it('should filter by medical specialty', async () => {
      const query: RAGQuery = {
        query: 'medical device regulation',
        specialtyFilter: 'Regulatory Affairs',
      };

      const response = await ragService.query(query);

      response.documents.forEach(doc => {
        expect(doc.metadata.medicalSpecialty).toBe('Regulatory Affairs');
      });
    });

    it('should limit number of returned documents', async () => {
      const query: RAGQuery = {
        query: 'medical',
        maxDocuments: 2,
      };

      const response = await ragService.query(query);
      expect(response.documents.length).toBeLessThanOrEqual(2);
    });

    it('should return empty results for irrelevant queries', async () => {
      const query: RAGQuery = {
        query: 'cooking recipes',
        minRelevanceScore: 0.8,
      };

      const response = await ragService.query(query);
      expect(response.documents.length).toBe(0);
      expect(response.confidence).toBe(0);
    });
  });

  describe('Healthcare-Specific RAG Features', () => {
    beforeEach(async () => {
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }
    });

    it('should prioritize FDA guidance documents', async () => {
      const query: RAGQuery = {
        query: 'software medical device',
        documentTypes: ['fda-guidance'],
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBeGreaterThan(0);
      response.documents.forEach(doc => {
        expect(doc.metadata.type).toBe('fda-guidance');
      });
    });

    it('should handle clinical research queries', async () => {
      const query: RAGQuery = {
        query: 'randomized controlled trials evidence',
        specialtyFilter: 'Clinical Research',
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBeGreaterThan(0);
      expect(response.contextualSummary).toContain('Clinical Research');
    });

    it('should process regulatory authority specific queries', async () => {
      // Test FDA-specific query
      const fdaQuery: RAGQuery = {
        query: 'digital therapeutics guidance',
      };

      const fdaResponse = await ragService.query(fdaQuery);
      const fdaDocs = fdaResponse.documents.filter(
        doc => doc.metadata.regulatoryAuthority === 'FDA'
      );
      expect(fdaDocs.length).toBeGreaterThan(0);

      // Test EMA-specific query
      const emaQuery: RAGQuery = {
        query: 'software medical device guideline',
      };

      const emaResponse = await ragService.query(emaQuery);
      const emaDocs = emaResponse.documents.filter(
        doc => doc.metadata.regulatoryAuthority === 'EMA'
      );
      expect(emaDocs.length).toBeGreaterThan(0);
    });

    it('should handle multi-specialty queries', async () => {
      const query: RAGQuery = {
        query: 'medical device clinical investigation',
      };

      const response = await ragService.query(query);

      // Should return documents from multiple specialties
      const specialties = new Set(
        response.documents
          .filter(doc => doc.metadata.medicalSpecialty)
          .map(doc => doc.metadata.medicalSpecialty)
      );

      expect(specialties.size).toBeGreaterThan(0);
    });
  });

  describe('RAG Performance and Quality', () => {
    beforeEach(async () => {
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }
    });

    it('should provide high confidence for relevant queries', async () => {
      const query: RAGQuery = {
        query: 'FDA digital therapeutics guidance',
        minRelevanceScore: 0.9,
      };

      const response = await ragService.query(query);
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should rank documents by relevance', async () => {
      const query: RAGQuery = {
        query: 'digital therapeutics',
        maxDocuments: 3,
      };

      const response = await ragService.query(query);

      // Check that documents are ranked by relevance score
      for (let i = 1; i < response.documents.length; i++) {
        expect(response.documents[i - 1].metadata.relevanceScore)
          .toBeGreaterThanOrEqual(response.documents[i].metadata.relevanceScore);
      }
    });

    it('should process queries within reasonable time', async () => {
      const query: RAGQuery = {
        query: 'medical device regulation compliance',
      };

      const response = await ragService.query(query);
      expect(response.processingTime).toBeLessThan(1000); // Less than 1 second
    });

    it('should generate contextual summaries', async () => {
      const query: RAGQuery = {
        query: 'clinical evidence requirements',
      };

      const response = await ragService.query(query);

      expect(response.contextualSummary).toBeTruthy();
      expect(response.contextualSummary.length).toBeGreaterThan(20);
      expect(response.contextualSummary).toContain('document');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty vector store gracefully', async () => {
      const emptyRagService = new MockRAGService(new MockVectorStore());

      const query: RAGQuery = {
        query: 'any query',
      };

      const response = await emptyRagService.query(query);

      expect(response.documents).toHaveLength(0);
      expect(response.confidence).toBe(0);
      expect(response.contextualSummary).toContain('No relevant documents');
    });

    it('should handle very specific queries with no matches', async () => {
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }

      const query: RAGQuery = {
        query: 'very specific obscure medical condition xyz123',
        minRelevanceScore: 0.95,
      };

      const response = await ragService.query(query);
      expect(response.documents).toHaveLength(0);
    });

    it('should handle malformed queries gracefully', async () => {
      const query: RAGQuery = {
        query: '', // Empty query
        maxDocuments: 0,
      };

      const response = await ragService.query(query);
      expect(response.documents).toHaveLength(0);
    });

    it('should handle document type filters with no matches', async () => {
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }

      const query: RAGQuery = {
        query: 'medical',
        documentTypes: ['nonexistent-type'],
      };

      const response = await ragService.query(query);
      expect(response.documents).toHaveLength(0);
    });
  });

  describe('RAG Integration with Healthcare Agents', () => {
    beforeEach(async () => {
      for (const doc of sampleDocuments) {
        await vectorStore.addDocument(doc);
      }
    });

    it('should support DTx expert agent queries', async () => {
      const query: RAGQuery = {
        query: 'digital therapeutics evidence requirements clinical validation',
        documentTypes: ['fda-guidance', 'clinical-guideline'],
        minRelevanceScore: 0.8,
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0.8);

      // Should return FDA guidance and clinical guidelines
      const docTypes = new Set(response.documents.map(doc => doc.metadata.type));
      expect(docTypes.has('fda-guidance') || docTypes.has('clinical-guideline')).toBe(true);
    });

    it('should support regulatory strategist queries', async () => {
      const query: RAGQuery = {
        query: 'FDA 510k pathway medical device software classification',
        specialtyFilter: 'Regulatory Affairs',
        minRelevanceScore: 0.85,
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBeGreaterThan(0);
      response.documents.forEach(doc => {
        if (doc.metadata.medicalSpecialty) {
          expect(doc.metadata.medicalSpecialty).toBe('Regulatory Affairs');
        }
      });
    });

    it('should support clinical trial designer queries', async () => {
      const query: RAGQuery = {
        query: 'clinical trial design randomized controlled trial medical devices',
        documentTypes: ['clinical-guideline', 'research-paper'],
        specialtyFilter: 'Clinical Research',
      };

      const response = await ragService.query(query);

      // Should prioritize clinical research documents
      const clinicalDocs = response.documents.filter(
        doc => doc.metadata.medicalSpecialty === 'Clinical Research' ||
               doc.content.toLowerCase().includes('clinical trial')
      );

      expect(clinicalDocs.length).toBeGreaterThan(0);
    });

    it('should provide citation-ready information', async () => {
      const query: RAGQuery = {
        query: 'FDA digital therapeutics guidance 2022',
        maxDocuments: 1,
      };

      const response = await ragService.query(query);

      expect(response.documents.length).toBe(1);
      const doc = response.documents[0];

      // Should have all necessary citation information
      expect(doc.title).toBeTruthy();
      expect(doc.metadata.source).toBeTruthy();
      expect(doc.metadata.publishedDate).toBeTruthy();
      expect(doc.metadata.type).toBeTruthy();
    });
  });
});