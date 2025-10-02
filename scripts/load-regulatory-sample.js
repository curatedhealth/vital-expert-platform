#!/usr/bin/env node

/**
 * Load Sample Regulatory Knowledge Documents
 *
 * This script creates sample regulatory documents in the knowledge base
 * for testing the RAG system with regulatory domain queries.
 */

const { createClient } = require('@supabase/supabase-js');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseKey || !openaiKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('   - OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openaiKey,
  modelName: 'text-embedding-ada-002',
});

// Sample regulatory documents
const regulatoryDocuments = [
  {
    title: 'FDA Digital Health Pre-Cert Program Overview',
    category: 'Regulatory',
    content: `
The FDA Digital Health Software Precertification (Pre-Cert) Program is a voluntary pilot program that aims to create a new regulatory approach for digital health technologies. The program focuses on the software developer or digital health technology developer, rather than on a specific software product.

Key Components:
1. Excellence Appraisal: Assessment of the organization's culture of quality and organizational excellence
2. Review Determination: Streamlined FDA review for software products from pre-certified companies
3. Real-World Performance: Monitoring of real-world performance once products reach the market

Pre-Cert Criteria:
- Patient Safety: Systems and processes to ensure patient safety
- Product Quality: Software design, development, and validation processes
- Clinical Responsibility: Processes for real-world evidence collection and monitoring
- Cybersecurity Responsibility: Security measures and incident response
- Proactive Culture: Commitment to continuous improvement

Benefits for Pre-Certified Companies:
- Streamlined premarket review process
- Reduced regulatory burden for lower-risk products
- Enhanced market access for innovative technologies
- Recognition as a trusted digital health developer

This program represents the FDA's adaptive approach to regulating software as a medical device (SaMD) in an evolving digital health landscape.
    `,
    domain: 'Regulatory',
    isGlobal: true,
  },
  {
    title: 'FDA Guidance on Clinical Decision Support Software',
    category: 'Regulatory',
    content: `
Clinical Decision Support Software (CDS) that meets the definition of a device under section 201(h) of the FD&C Act is subject to FDA oversight. However, the 21st Century Cures Act provides specific exclusions for certain CDS software functions.

CDS Software NOT Subject to FDA Oversight (Section 520(o)(1)):
1. Software that enables healthcare providers to independently review the basis for recommendations
2. Software that provides recommendations for prevention, diagnosis, or treatment
3. Software that provides clinical information to healthcare providers
4. Software that displays, analyzes, or prints medical information about a patient

Requirements for Exclusion:
- NOT intended to acquire, process, or analyze medical images or signals
- Displays the basis for recommendations (data sources, logic)
- Allows healthcare provider to independently review
- Clearly states it is NOT a substitute for professional medical judgment

CDS Software SUBJECT to FDA Oversight:
- Software that analyzes medical images or signals
- Software that does not disclose basis for recommendations
- Software intended to replace clinical judgment
- High-risk decision support systems

Examples:
✓ Excluded: Drug-drug interaction checkers with transparent logic
✓ Excluded: Clinical calculators showing formulas
✗ Regulated: Image analysis software for diagnostic purposes
✗ Regulated: Software providing treatment recommendations without showing reasoning

Healthcare providers should ensure CDS software they use complies with FDA guidelines and meets the exclusion criteria if claiming non-device status.
    `,
    domain: 'Regulatory',
    isGlobal: true,
  },
  {
    title: 'FDA 510(k) Pathway for Digital Health Products',
    category: 'Regulatory',
    content: `
The 510(k) premarket notification is the most common regulatory pathway for digital health products. It requires demonstration that a device is substantially equivalent to a legally marketed predicate device.

510(k) Process Overview:
1. Identify appropriate predicate device (legally marketed before May 28, 1976, or cleared through 510(k))
2. Demonstrate substantial equivalence in:
   - Intended use
   - Technological characteristics
   - Performance characteristics

Types of 510(k) Submissions:
1. Traditional 510(k): Standard submission with comparative data
2. Special 510(k): For modifications to company's own cleared device
3. Abbreviated 510(k): Uses FDA guidance documents or special controls

Key Requirements:
- Device description and specifications
- Indications for use statement
- Comparison to predicate device(s)
- Performance testing data
- Software documentation (if applicable)
- Cybersecurity documentation
- Labeling and instructions for use

Software-Specific Considerations:
- Software level of concern (minor, moderate, major)
- Software documentation per FDA guidance
- Verification and validation testing
- Cybersecurity risk management
- Interoperability testing
- User interface and usability testing

Timeline and Review:
- Standard review: 90 days (FDA goal)
- Additional information requests may extend timeline
- Interactive review possible through Q-Submissions

Common Reasons for Delays:
- Insufficient predicate comparison
- Inadequate performance testing
- Missing software documentation
- Cybersecurity gaps
- Usability issues

The 510(k) pathway offers a faster route to market compared to PMA, making it attractive for many digital health innovations that can establish substantial equivalence.
    `,
    domain: 'Regulatory',
    isGlobal: true,
  },
  {
    title: 'FDA Cybersecurity Requirements for Medical Devices',
    category: 'Regulatory',
    content: `
The FDA requires medical device manufacturers to address cybersecurity throughout the product lifecycle. This includes premarket submissions, postmarket management, and vulnerability disclosure.

Premarket Cybersecurity Documentation:
1. Cybersecurity Risk Management:
   - Threat modeling and risk assessment
   - Security requirements specification
   - Security architecture and design

2. Security Controls:
   - Authentication and authorization
   - Data encryption (at rest and in transit)
   - Secure communications
   - Software bill of materials (SBOM)

3. Testing and Validation:
   - Penetration testing results
   - Vulnerability scanning
   - Security testing protocols

FDA Guidance Documents:
- Content of Premarket Submissions for Management of Cybersecurity (2014, updated 2023)
- Postmarket Management of Cybersecurity in Medical Devices (2016)
- Software Bill of Materials guidance

Key Cybersecurity Controls:
✓ Unique device identification and authentication
✓ Secure software updates and patches
✓ Data protection and privacy
✓ Secure communications protocols
✓ Event logging and monitoring
✓ Vulnerability management process
✓ Coordinated disclosure policy

SBOM Requirements (New 2023):
- List of commercial, open-source, and off-the-shelf software components
- Version information for all components
- Supplier/originator information
- Dependency relationships
- Known vulnerabilities (CVEs)

Postmarket Cybersecurity:
- Routine updates and patches
- Vulnerability monitoring
- Incident response procedures
- FDA reporting for exploited vulnerabilities
- MedWatch reporting for adverse events

Best Practices:
1. Implement security by design principles
2. Follow NIST Cybersecurity Framework
3. Use secure coding practices
4. Maintain software bills of materials
5. Establish coordinated vulnerability disclosure
6. Plan for legacy device management

Medical device cybersecurity is a critical patient safety issue and regulatory requirement that must be addressed throughout the device lifecycle.
    `,
    domain: 'Regulatory',
    isGlobal: true,
  }
];

async function loadRegulatoryData() {
  console.log('📚 Loading Regulatory Knowledge Documents\n');

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  for (const doc of regulatoryDocuments) {
    try {
      console.log(`📄 Processing: ${doc.title}`);

      // Get default tenant ID first
      const { data: tenant } = await supabase
        .from('rag_tenants')
        .select('id')
        .eq('domain', 'default.vitalpath.com')
        .single();

      if (!tenant) {
        console.error(`   ❌ Default tenant not found\n`);
        continue;
      }

      // Check if document already exists
      const { data: existing } = await supabase
        .from('rag_knowledge_sources')
        .select('id')
        .eq('title', doc.title)
        .single();

      if (existing) {
        console.log(`   ⏭️  Already exists, skipping\n`);
        continue;
      }

      // Create document record
      const { data: docRecord, error: docError } = await supabase
        .from('rag_knowledge_sources')
        .insert([{
          tenant_id: tenant.id,
          name: doc.title,
          title: doc.title,
          description: `Regulatory guidance document: ${doc.title}`,
          source_type: 'system_document',
          domain: 'regulatory_compliance',
          medical_specialty: 'Regulatory Affairs',
          therapeutic_area: 'Digital Health',
          processing_status: 'completed',
          tags: ['regulatory', 'fda', 'digital-health'],
          metadata: {
            source: 'sample_regulatory_data',
            created_by: 'system',
            category: doc.category
          }
        }])
        .select()
        .single();

      if (docError) {
        console.error(`   ❌ Error creating document: ${docError.message}\n`);
        continue;
      }

      // Split content into chunks
      const chunks = await textSplitter.createDocuments([doc.content.trim()]);
      console.log(`   📑 Created ${chunks.length} chunks`);

      // Process chunks and create embeddings
      let chunkCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkText = chunk.pageContent;

        // Generate embedding
        const embedding = await embeddings.embedQuery(chunkText);

        // Store chunk with embedding
        const { error: chunkError } = await supabase
          .from('rag_knowledge_chunks')
          .insert([{
            source_id: docRecord.id,
            content: chunkText,
            embedding: embedding,
            chunk_index: i,
            content_type: 'text',
            word_count: chunkText.split(/\s+/).length,
            medical_context: {
              category: doc.category,
              domain: doc.domain
            },
            regulatory_context: {
              source: 'FDA',
              document_type: 'guidance'
            }
          }]);

        if (chunkError) {
          console.error(`   ❌ Error storing chunk ${i}: ${chunkError.message}`);
        } else {
          chunkCount++;
        }
      }

      console.log(`   ✅ Stored ${chunkCount} chunks with embeddings\n`);

    } catch (error) {
      console.error(`   ❌ Error processing document: ${error.message}\n`);
    }
  }

  console.log('🎉 Regulatory knowledge loading complete!\n');
  console.log('You can now:');
  console.log('1. Edit agents to add "Regulatory" knowledge domain');
  console.log('2. Chat with agents and ask regulatory questions');
  console.log('3. See inline citations from these regulatory documents\n');
}

loadRegulatoryData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});