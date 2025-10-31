# Document Metadata Schema - Comprehensive List

## 📋 Recommended Metadata Fields for Knowledge Documents

### Core Identification
- ✅ **Domain** - Knowledge domain (regulatory_affairs, clinical, etc.)
- ✅ **Domain ID** - New architecture domain identifier
- ✅ **File Name** - Original uploaded filename
- ✅ **Clean File Name** - File name without extension/path (e.g., "FDA_Regulations_2024")
- ✅ **Title** - Document title (extracted or user-provided)

### Source & Publication
- ✅ **Source Name** - Publisher/Organization (FDA, McKinsey, Nature, EMA, WHO, etc.)
- ✅ **Source URL** - Original source link
- ✅ **Year/Publication Date** - Publication or document date
- ✅ **Author(s)** - Document author(s)
- ✅ **Organization** - Publishing organization
- ✅ **DOI/ISBN** - For academic papers/reports
- ✅ **Journal/Publication** - Journal name (for papers)

### Document Classification
- ✅ **Document Type** - Type classification:
  - Regulatory Guidance
  - Research Paper
  - Clinical Protocol
  - Market Research Report
  - Company Report
  - Government Regulation
  - Industry Standard
  - Best Practice Guide
  - Template
  - Internal Document
- ✅ **Language** - Document language (en, fr, de, etc.)
- ✅ **Category** - Additional categorization
- ✅ **Tags** - User-defined tags

### Healthcare/Pharma Specific
- ✅ **Regulatory Body** - FDA, EMA, MHRA, PMDA, etc.
- ✅ **Therapeutic Area** - Oncology, Cardiology, Neurology, etc.
- ✅ **Product/Drug Name** - Related product(s)
- ✅ **Indication** - Medical indication
- ✅ **Phase** - Development phase (Pre-clinical, Phase I/II/III, Post-market)
- ✅ **Geographic Scope** - US, EU, Global, etc.

### Technical Metadata
- ✅ **File Type** - PDF, DOCX, TXT, etc.
- ✅ **File Size** - In bytes
- ✅ **Page Count** - Number of pages (if applicable)
- ✅ **Word Count** - Document word count
- ✅ **Chunk Count** - Number of RAG chunks
- ✅ **Embedding Model** - Model used for embeddings
- ✅ **Processing Status** - pending, processing, completed, failed

### Content & Quality
- ✅ **Summary/Abstract** - Document summary
- ✅ **Keywords** - Extracted or user-provided keywords
- ✅ **Content Preview** - First 500 characters
- ✅ **Quality Score** - Document quality rating (0-1)

### Access & Security
- ✅ **Access Policy** - public, enterprise_confidential, team_confidential, personal_draft
- ✅ **Priority Weight** - RAG priority (0-1)
- ✅ **Regulatory Exposure** - High, Medium, Low
- ✅ **PII Sensitivity** - High, Medium, Low, None
- ✅ **Domain Scope** - global, enterprise, user

### Ownership & Audit
- ✅ **Uploaded By** - User who uploaded
- ✅ **Organization ID** - Organization owner
- ✅ **Owner User ID** - Individual owner (if user-scoped)
- ✅ **Created At** - Upload timestamp
- ✅ **Updated At** - Last update timestamp
- ✅ **Processed At** - Processing completion time
- ✅ **Last Accessed** - Last access timestamp (for analytics)

### Version Control
- ✅ **Version** - Document version number
- ✅ **Is Latest** - Is this the latest version
- ✅ **Parent Version ID** - Link to previous version

### Compliance & Validation
- ✅ **Validation Status** - pending, validated, failed
- ✅ **Evidence Level** - A, B, C, D (for clinical evidence)
- ✅ **Review Date** - Last review date
- ✅ **Reviewer** - Person who reviewed
- ✅ **Expiration Date** - If document has expiration

### Search & Discovery
- ✅ **Searchable Content** - Full-text searchable content
- ✅ **Metadata Extract** - Extracted metadata (JSONB)
- ✅ **Entity Extraction** - Named entities (people, organizations, drugs, etc.)

---

## 🎯 Implementation Priority

### Phase 1: Essential (Current)
- Domain
- File Name
- Title
- Status
- Created At
- File Size
- Chunk Count

### Phase 2: High Value (Recommended Next)
- Source Name
- Year/Publication Date
- Clean File Name
- Document Type
- Access Policy
- Priority Weight

### Phase 3: Enhanced (Future)
- Author(s)
- Therapeutic Area
- Regulatory Body
- Summary
- Keywords
- Quality Score

### Phase 4: Advanced (Optional)
- DOI/ISBN
- Product/Drug Name
- Geographic Scope
- Version Control
- Review/Validation

