/**
 * Seed Knowledge Base with FDA/EMA Regulatory Documents
 * This script populates the knowledge base with essential regulatory guidance
 */

const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Sample FDA/EMA regulatory documents
const REGULATORY_DOCUMENTS = [
  {
    title: 'FDA Digital Health Software Precertification (Pre-Cert) Program',
    domain: 'regulatory_affairs',
    category: 'fda-guidance',
    tags: ['digital health', 'software', 'precertification', 'fda'],
    content: `The FDA's Digital Health Software Precertification (Pre-Cert) Program is a voluntary pilot program that aims to develop a regulatory model that provides more streamlined and efficient regulatory oversight of software-based medical devices developed by manufacturers who have demonstrated a robust culture of quality and organizational excellence.

Key Components:
1. Excellence Appraisal: Evaluation of the organization's culture of quality and organizational excellence
2. Review Determination: Assessment to determine the appropriate level of premarket review based on risk
3. Streamlined Review: Expedited review processes for precertified developers
4. Real-World Performance: Ongoing monitoring of real-world performance data

The program focuses on evaluating the software developer/digital health technology developer, rather than the specific product, to determine what level of FDA premarket review would be required for the products they bring to market.

Eligibility Criteria:
- Demonstrated culture of quality and organizational excellence
- Commitment to real-world monitoring
- Robust software lifecycle processes
- Clinical safety and effectiveness validation

Benefits for Precertified Companies:
- Streamlined premarket review
- Reduced time to market
- Greater regulatory predictability
- Recognition of organizational excellence`,
  },
  {
    title: 'FDA Guidance: Clinical Decision Support Software',
    domain: 'regulatory_affairs',
    category: 'fda-guidance',
    tags: ['clinical decision support', 'cds', 'software', 'fda', '510k'],
    content: `The FDA provides guidance on Clinical Decision Support (CDS) software to clarify which CDS functions are considered device software functions under section 520(o)(1)(E) of the FD&C Act and are not subject to FDA enforcement.

CDS Functions NOT Regulated (Excluded):
1. Display, analyze, or print medical information for healthcare professionals (HCPs)
2. Support or provide recommendations to HCPs about prevention, diagnosis, or treatment
3. Enable HCPs to independently review the basis for recommendations
4. NOT intended to acquire, process, or analyze medical images

CDS Functions Regulated by FDA:
1. Intended for use in diagnosis or treatment without independent HCP review
2. Intended to acquire, process, or analyze medical images
3. Critical to safety where error could lead to serious harm
4. Replaces clinical judgment rather than informs it

Key Regulatory Pathways:
- 510(k): Premarket notification for moderate-risk devices
- De Novo: For novel low-to-moderate risk devices
- PMA: Premarket approval for high-risk devices

Documentation Requirements:
- Software design and development documentation
- Verification and validation testing
- Clinical performance testing (if applicable)
- Cybersecurity documentation
- Labeling and instructions for use`,
  },
  {
    title: 'EMA Guideline on Software as Medical Device (SaMD)',
    domain: 'regulatory_affairs',
    category: 'ema-guideline',
    tags: ['samd', 'medical device regulation', 'mdr', 'eu', 'software'],
    content: `The European Medicines Agency (EMA) provides comprehensive guidance on Software as a Medical Device (SaMD) under the Medical Device Regulation (MDR) 2017/745 and In Vitro Diagnostic Medical Device Regulation (IVDR) 2017/746.

Classification Criteria:
Rule 11 (MDR): Software intended to provide information used to make medical decisions is classified as:
- Class IIa: If decisions could cause serious deterioration of health or serious injury
- Class IIb: If decisions could cause death or irreversible deterioration
- Class III: If decisions could cause death and cannot be monitored

Key Requirements:
1. Clinical Evaluation: Demonstration of safety and performance through clinical data
2. Risk Management: ISO 14971 compliant risk management system
3. Software Lifecycle: IEC 62304 software lifecycle processes
4. Cybersecurity: ISO 27001 and ISO 81001-5-1 compliance
5. Quality Management: ISO 13485 certification required

Documentation Requirements:
- Technical Documentation per Annex II/III of MDR
- Clinical Evaluation Report (CER)
- Post-Market Surveillance Plan
- Post-Market Clinical Follow-up Plan
- Instructions for Use and Labeling

Conformity Assessment:
- Class I: Self-certification (except sterile or measuring function)
- Class IIa, IIb, III: Notified Body involvement required

CE Marking Requirements:
- Affixation of CE mark after conformity assessment
- Registration in EUDAMED database
- Unique Device Identification (UDI) assignment`,
  },
  {
    title: 'FDA 510(k) Submission Requirements for Medical Devices',
    domain: 'regulatory_affairs',
    category: 'fda-guidance',
    tags: ['510k', 'premarket', 'submission', 'substantial equivalence'],
    content: `The FDA 510(k) premarket notification is required for medical devices that are not exempt and not requiring premarket approval (PMA). The submission demonstrates substantial equivalence to a legally marketed predicate device.

Substantial Equivalence Criteria:
1. Same intended use as predicate device
2. Same technological characteristics OR
3. Different technological characteristics but:
   - Does not raise new safety/effectiveness questions
   - Demonstrates equivalent performance

Required Documentation:
1. Device Description:
   - Detailed specifications
   - Materials and components
   - Performance characteristics
   - Software documentation (if applicable)

2. Substantial Equivalence Discussion:
   - Predicate device identification
   - Comparison table
   - Differences justification

3. Performance Data:
   - Bench testing results
   - Biocompatibility testing (ISO 10993)
   - Software validation (IEC 62304)
   - Clinical data (if needed)

4. Labeling:
   - Proposed labels
   - Instructions for use
   - Patient information

Software-Specific Requirements (Level of Concern):
- Major Level: Extensive documentation, independent review
- Moderate Level: Standard documentation, validation testing
- Minor Level: Basic documentation, description of controls

Submission Types:
- Traditional 510(k): Standard submission
- Special 510(k): Design changes to legally marketed device
- Abbreviated 510(k): Uses FDA guidance documents or standards

Review Timeline:
- FDA goal: 90 days from receipt
- Average: 3-12 months depending on complexity`,
  },
  {
    title: 'ICH E6(R2) Good Clinical Practice Guidelines',
    domain: 'clinical_development',
    category: 'ich-guideline',
    tags: ['gcp', 'clinical trials', 'ich', 'quality', 'ethics'],
    content: `The International Council for Harmonisation (ICH) E6(R2) guideline provides a unified standard for Good Clinical Practice (GCP) in designing, conducting, recording, and reporting trials involving human subjects.

Core Principles:
1. Rights, safety, and wellbeing of trial subjects are paramount
2. Clinical trial design should be scientifically sound
3. Clinical trials should be conducted in accordance with ethical principles
4. Trial information should be recorded, handled, and stored appropriately
5. Confidentiality of trial subjects must be protected

Key Stakeholders and Responsibilities:
1. Sponsor:
   - Ensure trial is designed, conducted, and reported per protocol
   - Implement quality management system
   - Select qualified investigators
   - Provide monitoring and oversight

2. Investigator:
   - Conduct trial per GCP and protocol
   - Obtain informed consent
   - Report adverse events
   - Maintain essential documents

3. Institutional Review Board (IRB)/Ethics Committee:
   - Review and approve protocol
   - Monitor ongoing trials
   - Ensure subject protection

Essential Documents:
Before Trial:
- Protocol and amendments
- Investigator brochure
- IRB/IEC approval
- Informed consent forms
- Financial agreements

During Trial:
- Subject identification log
- Informed consents (signed)
- Source documents
- Adverse event reports
- Monitoring reports

After Trial:
- Final report
- Subject identification codes
- Audit certificates
- Document retention records

Quality Management:
- Risk-based approach to quality management
- Critical to quality factors identification
- Proportionate monitoring strategies
- Use of technology and systems (CTMS, EDC)

Regulatory Inspection Readiness:
- Document management and archiving
- Site readiness assessment
- Mock inspections and audits
- Training and SOPs compliance`,
  },
  {
    title: 'FDA Real-World Evidence Framework',
    domain: 'clinical_development',
    category: 'fda-guidance',
    tags: ['rwe', 'real-world data', 'rwd', 'pragmatic trials', 'observational studies'],
    content: `The FDA Real-World Evidence (RWE) Framework describes the agency's approach to evaluating real-world data (RWD) and real-world evidence to support regulatory decision-making.

Real-World Data Sources:
1. Electronic Health Records (EHRs)
2. Medical Claims and Billing Data
3. Patient Registries
4. Digital Health Technologies (wearables, sensors, apps)
5. Patient-Generated Health Data
6. Pragmatic Clinical Trials

Use Cases for RWE:
1. Post-market safety surveillance
2. New indication approval
3. Label expansions
4. Fulfillment of post-approval study requirements
5. Medical device innovation
6. Comparative effectiveness research

Data Quality Assessment:
- Relevancy: Data fit for the regulatory question
- Reliability: Data source trustworthiness
- Completeness: Sufficient data capture
- Consistency: Data standardization across sources
- Timeliness: Currency of data

Study Design Considerations:
1. Non-Interventional Studies:
   - Retrospective observational
   - Prospective observational
   - Registry studies

2. Pragmatic Clinical Trials:
   - Real-world setting
   - Diverse patient populations
   - Routine clinical practice interventions
   - Patient-centered outcomes

Regulatory Standards:
- NEST (National Evaluation System for health Technology)
- Sentinel System for safety monitoring
- CBER Biologics Effectiveness and Safety (BEST) Initiative
- CDRH National Evaluation System for health Technology

Best Practices:
- Pre-specify study protocol and analysis plan
- Use validated data elements and definitions
- Implement quality assurance processes
- Engage with FDA early in development
- Follow ISPOR-ISPE RWE framework`,
  },
  {
    title: 'EMA Post-Market Surveillance and Vigilance Requirements',
    domain: 'post_market_surveillance',
    category: 'ema-guideline',
    tags: ['vigilance', 'post-market', 'adverse events', 'mdr', 'incident reporting'],
    content: `The European Medicines Agency requires comprehensive post-market surveillance and vigilance activities under MDR 2017/745 to monitor device performance and safety after market placement.

Post-Market Surveillance (PMS) System:
1. Active Collection:
   - Proactive data gathering
   - Systematic examination of device experience
   - Literature review and database monitoring
   - Feedback from users and patients

2. Passive Collection:
   - Adverse event reports
   - Customer complaints
   - Field safety corrective actions
   - Trend analysis

Vigilance Reporting Timelines:
- Death or Serious Deterioration: Immediately (within 2 days of awareness)
- Serious Public Health Threat: Immediately
- Trend Reporting: As soon as identified
- Periodic Summary Reports: Per classification and risk

Required Reports:
1. Post-Market Surveillance Report:
   - Annual for Class I
   - Annual for Class IIa (unless exempted)
   - Annual or more frequent for Class IIb and III

2. Periodic Safety Update Report (PSUR):
   - Class IIb, III: At least annually
   - May be combined with PMS report

3. Summary of Safety and Clinical Performance (SSCP):
   - Class III and implantable devices
   - Available in EUDAMED for public access

EUDAMED Database Registration:
- Manufacturer registration
- Device registration (UDI)
- Certificate registration
- Clinical investigation registration
- Vigilance and PMS reporting
- Market surveillance activities

Field Safety Corrective Actions (FSCA):
- Field Safety Notices to users
- Notification to competent authorities
- Implementation tracking
- Effectiveness verification

Incident Investigation:
1. Root Cause Analysis
2. Risk Assessment
3. Corrective and Preventive Actions (CAPA)
4. Trend Analysis
5. Regulatory Notification

Documentation Requirements:
- Incident report forms
- Investigation reports
- Risk analysis updates
- Corrective action records
- Communication records`,
  },
  {
    title: 'FDA Cybersecurity in Medical Devices - Premarket Guidance',
    domain: 'regulatory_affairs',
    category: 'fda-guidance',
    tags: ['cybersecurity', 'software', 'premarket', 'risk management', 'sbom'],
    content: `The FDA provides guidance on cybersecurity considerations for medical devices to ensure patient safety and device functionality throughout the device lifecycle.

Premarket Submission Requirements:
1. Cybersecurity Risk Assessment:
   - Threat modeling
   - Vulnerability analysis
   - Exploitability assessment
   - Impact analysis

2. Security Architecture:
   - Secure design principles
   - Defense in depth
   - Least privilege access
   - Secure communications

3. Software Bill of Materials (SBOM):
   - List of commercial, open-source, off-the-shelf software components
   - Known vulnerabilities documentation
   - Update and patch management plan

Key Security Controls:
1. Authentication and Authorization:
   - Multi-factor authentication
   - Role-based access control
   - User account management
   - Session management

2. Data Protection:
   - Encryption at rest and in transit
   - Cryptographic key management
   - Secure data storage
   - Data integrity verification

3. Device Updates and Patches:
   - Validated update mechanism
   - Rollback capability
   - Version control
   - End-of-life support plan

4. Audit and Monitoring:
   - Security event logging
   - Anomaly detection
   - Incident response procedures
   - Forensics capability

Standards and Frameworks:
- NIST Cybersecurity Framework
- IEC 62443 (Industrial automation and control systems security)
- ISO/IEC 27001 (Information security management)
- ISO 81001-5-1 (Health software security)
- AAMI TIR57 (Principles for medical device security)

Testing Requirements:
- Penetration testing
- Vulnerability scanning
- Fuzz testing
- Code analysis (static and dynamic)
- Security configuration review

Post-Market Cybersecurity:
- Coordinated vulnerability disclosure program
- Vulnerability monitoring and assessment
- Timely patch deployment
- Communication with users about security updates`,
  },
  {
    title: 'Health Economics and Outcomes Research (HEOR) for Market Access',
    domain: 'health_economics',
    category: 'best-practice',
    tags: ['heor', 'market access', 'value assessment', 'reimbursement', 'hta'],
    content: `Health Economics and Outcomes Research (HEOR) provides evidence of a product's value to support reimbursement decisions, formulary placement, and market access strategies.

Key HEOR Study Types:
1. Cost-Effectiveness Analysis (CEA):
   - Compares costs and outcomes of interventions
   - Expressed as cost per QALY (Quality-Adjusted Life Year)
   - Decision threshold varies by country (e.g., £20k-30k/QALY UK)

2. Budget Impact Analysis (BIA):
   - Estimates financial impact on payer budget
   - Typically 1-5 year time horizon
   - Includes eligible population, uptake, costs, offsets

3. Cost-Utility Analysis (CUA):
   - Special type of CEA using utilities
   - Outcome measured in QALYs
   - Allows comparison across disease areas

4. Cost-Benefit Analysis (CBA):
   - Both costs and benefits in monetary terms
   - Net monetary benefit calculation
   - Return on investment analysis

Value Assessment Frameworks:
1. ICER (US):
   - Long-term value for money
   - Other benefits and contextual considerations
   - Potential budget impact and affordability

2. NICE (UK):
   - Cost per QALY threshold
   - Equity considerations
   - End of life criteria
   - Innovation and societal value

3. IQWiG (Germany):
   - Additional benefit assessment
   - Patient-relevant endpoints
   - Efficiency frontier analysis

4. HAS (France):
   - Medical benefit (SMR)
   - Improvement in medical benefit (ASMR)
   - Economic and public health impact

Data Requirements:
- Clinical efficacy/effectiveness data
- Resource utilization data
- Costs (direct medical, indirect, intangible)
- Health-related quality of life (HRQoL)
- Real-world evidence
- Patient preferences

Economic Model Components:
1. Population: Target patient population
2. Comparators: Current standard of care
3. Time Horizon: Lifetime or relevant period
4. Perspective: Payer, societal, or healthcare system
5. Discount Rate: Future costs and outcomes (typically 3-5%)
6. Sensitivity Analysis: Parameter uncertainty assessment

Best Practices:
- Follow jurisdiction-specific guidelines
- Use validated instruments (EQ-5D, SF-36)
- Conduct systematic literature reviews
- Perform robust sensitivity analyses
- Include diverse stakeholder perspectives
- Present value story clearly`,
  },
  {
    title: 'Digital Therapeutics (DTx) Evidence Generation and Validation',
    domain: 'digital_health',
    category: 'best-practice',
    tags: ['digital therapeutics', 'dtx', 'clinical validation', 'evidence', 'rct'],
    content: `Digital therapeutics (DTx) are evidence-based therapeutic interventions driven by software programs to prevent, manage, or treat medical disorders or diseases. Robust evidence generation is critical for regulatory approval and clinical adoption.

DTx Evidence Framework:
1. Technical Verification:
   - Software functionality testing
   - Performance validation
   - Usability testing
   - Interoperability verification
   - Security and privacy validation

2. Clinical Validation:
   - Proof of concept studies
   - Pilot feasibility studies
   - Randomized controlled trials (RCTs)
   - Real-world effectiveness studies
   - Long-term outcomes research

Study Design Considerations:
1. Primary Endpoints:
   - Clinical outcomes (e.g., HbA1c, symptom reduction)
   - Behavioral outcomes (e.g., adherence, engagement)
   - Patient-reported outcomes (PROs)
   - Healthcare utilization

2. Control Groups:
   - Standard of care
   - Sham/placebo digital intervention
   - Wait-list control
   - Usual care

3. Engagement Metrics:
   - App usage frequency
   - Session duration
   - Feature utilization
   - Completion rates
   - Drop-out analysis

Regulatory Pathways:
1. FDA:
   - 510(k) for moderate risk
   - De Novo for novel low-moderate risk
   - Enforcement discretion for low-risk wellness
   - Breakthrough designation for innovation

2. EU MDR:
   - Classification per Rule 11
   - CE marking requirements
   - Clinical evaluation per MEDDEV 2.7/1
   - Post-market surveillance

Validation Standards:
- Digital Therapeutics Alliance (DTA) Framework
- NICE Evidence Standards Framework for DHTs
- AMA DTx Certification
- ISO 13485 Quality Management
- IEC 62304 Software Lifecycle

Evidence Hierarchy:
Level 1: Systematic reviews and meta-analyses of RCTs
Level 2: Individual RCTs with narrow confidence intervals
Level 3: Cohort studies
Level 4: Case-control or case series
Level 5: Expert opinion

Real-World Evidence (RWE) Generation:
- Pragmatic trials in real-world settings
- Registry studies
- Observational cohort studies
- N-of-1 trials
- Continuous monitoring post-launch

Outcome Measurement:
1. Clinical Endpoints:
   - Disease-specific biomarkers
   - Symptom severity scores
   - Functional assessments
   - Quality of life measures

2. Economic Endpoints:
   - Healthcare cost reduction
   - Hospitalizations prevented
   - Emergency department visits
   - Medication adherence improvement

3. Patient Engagement:
   - User satisfaction scores
   - Net Promoter Score (NPS)
   - Retention rates
   - Feature usage analytics

Publication and Dissemination:
- Peer-reviewed publications in medical journals
- Conference presentations
- Evidence dossiers for payers
- Public registry listings (e.g., ClinicalTrials.gov)
- Real-world evidence reports`,
  },
];

// Utility functions
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
}

async function generateEmbedding(text) {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, skipping embedding generation');
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error.message);
    return null;
  }
}

async function insertDocument(doc) {
  try {
    console.log(`📄 Inserting document: ${doc.title}`);

    // Insert knowledge document
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        title: doc.title,
        content: doc.content,
        domain: doc.domain,
        tags: doc.tags,
        status: 'processing',
        file_type: 'text/plain',
        metadata: {
          category: doc.category,
          source: 'regulatory_seed',
          imported_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (docError) {
      console.error(`❌ Failed to insert document: ${docError.message}`);
      return null;
    }

    console.log(`  ✓ Document inserted with ID: ${document.id}`);

    // Chunk the content
    const chunks = chunkText(doc.content, 1500, 300);
    console.log(`  📦 Created ${chunks.length} chunks`);

    // Process chunks and generate embeddings
    const chunkInserts = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  🔄 Processing chunk ${i + 1}/${chunks.length}...`);

      const embedding = await generateEmbedding(chunk);

      chunkInserts.push({
        document_id: document.id,
        chunk_index: i,
        content: chunk,
        embedding: embedding,
        metadata: {
          chunk_size: chunk.length,
          total_chunks: chunks.length,
        },
      });

      // Rate limiting: wait 100ms between embedding calls
      if (embedding && i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Insert all chunks
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (chunksError) {
      console.error(`❌ Failed to insert chunks: ${chunksError.message}`);
      return null;
    }

    // Update document status
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'completed',
        chunk_count: chunks.length,
        processed_at: new Date().toISOString(),
      })
      .eq('id', document.id);

    console.log(`  ✅ Document fully processed with ${chunks.length} chunks\n`);

    return document;

  } catch (error) {
    console.error(`❌ Error inserting document: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Regulatory Knowledge Base Seeding...\n');

  // Check connections
  console.log('🔍 Checking connections...');
  console.log(`  Supabase URL: ${supabaseUrl}`);
  console.log(`  OpenAI Configured: ${openai ? 'Yes' : 'No'}\n`);

  if (!openai) {
    console.log('⚠️  WARNING: OpenAI API key not configured.');
    console.log('   Documents will be inserted without embeddings.');
    console.log('   Set OPENAI_API_KEY environment variable to enable embeddings.\n');
  }

  // Verify knowledge_documents table exists
  const { error: tableError } = await supabase
    .from('knowledge_documents')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('❌ knowledge_documents table not found!');
    console.error('   Please run the database migrations first.');
    process.exit(1);
  }

  console.log('✅ Database connection verified\n');

  // Insert documents
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < REGULATORY_DOCUMENTS.length; i++) {
    const doc = REGULATORY_DOCUMENTS[i];
    console.log(`[${i + 1}/${REGULATORY_DOCUMENTS.length}] Processing: ${doc.title}`);

    const result = await insertDocument(doc);

    if (result) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully processed: ${successCount} documents`);
  console.log(`❌ Failed: ${failCount} documents`);
  console.log(`📚 Total documents: ${REGULATORY_DOCUMENTS.length}`);

  // Get final count
  const { count } = await supabase
    .from('knowledge_documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  console.log(`\n📦 Total completed documents in database: ${count}`);

  // Get chunk count
  const { count: chunkCount } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact', head: true });

  console.log(`🔗 Total chunks in database: ${chunkCount}`);

  console.log('\n✅ Knowledge base seeding completed!');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
