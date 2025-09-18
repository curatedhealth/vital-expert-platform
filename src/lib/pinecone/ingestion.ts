import { v4 as uuidv4 } from 'uuid';
import { vitalIndex, getNamespace, SYSTEM_NAMESPACE, VectorMetadata } from './client';
import { generateEmbeddings } from './embeddings';
import { RecursiveCharacterTextSplitter, DocumentTypeSplitter } from './text-splitter';
import { createClient } from '@/lib/supabase/server';

interface DocumentMetadata {
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
}

interface IngestionResult {
  success: boolean;
  vectorIds: string[];
  documentId?: string;
  error?: string;
}

/**
 * Ingest a document into Pinecone vector database
 */
export async function ingestDocument(
  content: string,
  metadata: DocumentMetadata,
  isSystemDocument = false
): Promise<IngestionResult> {
  try {
    // Choose appropriate text splitter based on document type
    const splitter = getTextSplitter(metadata.documentType);

    // Split content into chunks
    const chunks = splitter.splitText(content);

    if (chunks.length === 0) {
      throw new Error('No content to index');
    }

    // Generate embeddings for all chunks
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await generateEmbeddings(texts);

    // Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, index) => {
      const vectorId = `${metadata.organizationId}_${uuidv4()}`;

      const vectorMetadata: VectorMetadata = {
        organizationId: metadata.organizationId,
        projectId: metadata.projectId,
        documentType: metadata.documentType,
        source: metadata.source,
        title: metadata.title,
        url: metadata.url,
        pageNumber: metadata.pageNumber,
        section: metadata.section,
        regulatoryBody: metadata.regulatoryBody,
        publicationDate: metadata.publicationDate,
        confidenceScore: metadata.confidenceScore || 1.0,
        text: chunk.content,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
      };

      return {
        id: vectorId,
        values: embeddings[index],
        metadata: vectorMetadata,
      };
    });

    // Determine namespace
    const namespace = isSystemDocument
      ? SYSTEM_NAMESPACE
      : getNamespace(metadata.organizationId);

    // Upsert vectors to Pinecone in batches
    const batchSize = 100;
    const vectorIds: string[] = [];

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);

      await vitalIndex.namespace(namespace).upsert(batch);

      vectorIds.push(...batch.map(v => v.id));
    }

    // Store document reference in Supabase
    let documentId: string | undefined;

    if (!isSystemDocument) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('documents')
        .insert({
          organization_id: metadata.organizationId,
          project_id: metadata.projectId,
          name: metadata.title,
          type: metadata.documentType,
          source: metadata.source,
          url: metadata.url,
          content: content,
          metadata: metadata,
          vector_ids: vectorIds,
          indexed_at: new Date().toISOString(),
          created_by: metadata.organizationId, // This should be the actual user ID
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing document in Supabase:', error);
        // Continue anyway - the vectors are already in Pinecone
      } else {
        documentId = data?.id;
      }
    }

    console.log(`Successfully indexed document: ${metadata.title} (${vectorIds.length} chunks)`);

    return {
      success: true,
      vectorIds,
      documentId,
    };

  } catch (error) {
    console.error('Error ingesting document:', error);
    return {
      success: false,
      vectorIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch ingestion for multiple documents
 */
export async function batchIngestDocuments(
  documents: Array<{
    content: string;
    metadata: DocumentMetadata;
    isSystemDocument?: boolean;
  }>
): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];

  // Process documents sequentially to avoid rate limits
  for (const doc of documents) {
    const result = await ingestDocument(
      doc.content,
      doc.metadata,
      doc.isSystemDocument
    );
    results.push(result);

    // Small delay between documents to be respectful to APIs
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Ingest regulatory guidance documents (system-wide)
 */
export async function ingestRegulatoryGuidance(): Promise<void> {
  const regulatoryDocs = [
    {
      title: 'FDA Digital Health Software Precertification Program',
      content: `The FDA Digital Health Software Precertification Program is a voluntary program that aims to provide a more streamlined approach to regulating software as medical devices (SaMD). The program focuses on the software developer rather than individual products, assessing the organization's culture of quality and organizational excellence.

Key principles of the program include:
1. Excellence: Demonstrating a culture of quality and organizational excellence
2. Patient Safety: Prioritizing patient safety in all aspects of development
3. Product Quality: Maintaining high standards for software development
4. Clinical Responsibility: Taking responsibility for clinical evaluation and post-market surveillance

The program is designed to reduce regulatory burden while maintaining patient safety for low to moderate risk devices. Precertified organizations may be eligible for streamlined premarket review and reduced post-market data collection requirements.

Eligibility criteria include:
- Demonstrated organizational excellence
- Quality management system
- Clinical evaluation capabilities
- Post-market surveillance and control procedures
- Real-world performance monitoring

Benefits for precertified organizations:
- Streamlined premarket submissions
- Reduced documentation requirements
- Faster time to market
- Iterative improvement pathways
- Enhanced market access`,
      url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/digital-health-software-precertification-pilot-program',
      regulatoryBody: 'FDA',
      publicationDate: '2024-01-01',
    },
    {
      title: 'EU MDR Requirements for Software as Medical Device',
      content: `The European Union Medical Device Regulation (EU MDR) 2017/745 establishes comprehensive requirements for software as medical devices (SaMD). The regulation came into full effect on May 26, 2021, replacing the previous Medical Device Directive.

Classification of Software as Medical Device:
- Class I: Low risk software with non-invasive monitoring
- Class IIa: Medium risk software for diagnosis and monitoring
- Class IIb: Medium-high risk software for critical diagnosis
- Class III: High risk software for life-threatening decisions

Key Requirements under EU MDR:
1. Conformity Assessment: Mandatory assessment by notified bodies for Class IIa and above
2. Clinical Evidence: Comprehensive clinical evaluation and post-market surveillance
3. Unique Device Identification (UDI): Required for all medical devices
4. Post-Market Surveillance: Continuous monitoring of device performance
5. Risk Management: ISO 14971 compliance for risk management

Documentation Requirements:
- Technical documentation (Annex II and III)
- Clinical evaluation report
- Post-market surveillance plan
- Risk management file
- Declaration of conformity

Quality Management System:
- ISO 13485 certification required
- Design controls and configuration management
- Software lifecycle processes (IEC 62304)
- Cybersecurity considerations (IEC 81001-5-1)

Market Access Requirements:
- CE marking mandatory for EU market
- Registration in EUDAMED database
- Authorized representative in EU for non-EU manufacturers
- Post-market surveillance and vigilance reporting`,
      url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R0745',
      regulatoryBody: 'EMA',
      publicationDate: '2024-01-01',
    },
  ];

  const ingestionPromises = regulatoryDocs.map(doc =>
    ingestDocument(
      doc.content,
      {
        organizationId: 'system',
        documentType: 'regulatory',
        source: doc.url,
        title: doc.title,
        url: doc.url,
        regulatoryBody: doc.regulatoryBody,
        publicationDate: doc.publicationDate,
      },
      true // isSystemDocument
    )
  );

  const results = await Promise.all(ingestionPromises);

  console.log('Regulatory guidance ingestion results:', results);
}

/**
 * Delete document from Pinecone and Supabase
 */
export async function deleteDocument(
  documentId: string,
  organizationId: string
): Promise<boolean> {
  try {
    // Get vector IDs from Supabase
    const supabaseClient = createClient();
    const { data: document, error } = await supabaseClient
      .from('documents')
      .select('vector_ids')
      .eq('id', documentId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !document) {
      throw new Error('Document not found');
    }

    // Delete vectors from Pinecone
    if (document.vector_ids && document.vector_ids.length > 0) {
      const namespace = getNamespace(organizationId);
      await vitalIndex.namespace(namespace).deleteMany(document.vector_ids);
    }

    // Delete document from Supabase
    const supabaseClient = createClient();
    const { error: deleteError } = await supabaseClient
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('organization_id', organizationId);

    if (deleteError) {
      throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

/**
 * Get appropriate text splitter for document type
 */
function getTextSplitter(documentType: string): RecursiveCharacterTextSplitter {
  switch (documentType) {
    case 'regulatory':
      return DocumentTypeSplitter.forRegulatory();
    case 'clinical':
      return DocumentTypeSplitter.forClinical();
    case 'market':
      return DocumentTypeSplitter.forMarketResearch();
    case 'internal':
      return DocumentTypeSplitter.forInternal();
    default:
      return new RecursiveCharacterTextSplitter();
  }
}