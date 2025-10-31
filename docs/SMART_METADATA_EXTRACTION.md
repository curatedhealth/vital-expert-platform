# Smart Metadata Extraction & File Renaming

## 📚 Overview

Automated metadata extraction and taxonomy-based file renaming system that intelligently extracts metadata from filenames and content, then optionally renames files according to a consistent taxonomy during upload.

## 🎯 Features

### 1. Smart Metadata Extraction

Automatically extracts comprehensive metadata from:

#### From Filename
- **Source Name** - FDA, EMA, McKinsey, Nature, etc.
- **Year** - Publication or document year (1900-2099)
- **Document Type** - Regulatory Guidance, Research Paper, etc.
- **Regulatory Body** - FDA, EMA, MHRA, etc.
- **Therapeutic Area** - Oncology, Cardiology, etc.
- **Clean Title** - Formatted title without metadata components

#### From Content
- **Author(s)** - Extracted from content patterns
- **Organization/Publisher** - Extracted from content
- **Summary/Abstract** - First 200 characters (via AI)
- **Keywords** - Extracted automatically (via AI)
- **Language** - Detected from content
- **Word Count** - Calculated automatically
- **Page Count** - Extracted if available

#### AI-Enhanced (Optional)
When enabled, uses OpenAI GPT-4o-mini to extract:
- Title
- Source name
- Year
- Document type
- Author
- Organization
- Regulatory body
- Therapeutic area
- Summary (first 200 chars)
- Keywords (array)

### 2. Taxonomy-Based File Renaming

Files are renamed according to a consistent taxonomy format:

**Default Template:** `{Source}_{Type}_{Year}_{Title}.{ext}`

**Example:**
- Original: `FDA_Regulations_2024_Final_v2.pdf`
- Renamed: `FDA_RegulatoryGuidance_2024_Food And Drug Administration Regulations.pdf`

**Components:**
- **Source** - Normalized source name (FDA, EMA, McKinsey, etc.)
- **Type** - Document type (RegulatoryGuidance, ResearchPaper, etc.)
- **Year** - Publication year
- **Title** - Clean, formatted title

## 🔧 Implementation

### Services Created

1. **`SmartMetadataExtractor`** (`lib/services/metadata/smart-metadata-extractor.ts`)
   - Extracts metadata from filenames and content
   - Pattern matching for common sources, types, etc.
   - Optional AI-enhanced extraction

2. **`FileRenamer`** (`lib/services/metadata/file-renamer.ts`)
   - Generates taxonomy-based filenames
   - Configurable templates
   - Sanitization and formatting

3. **`MetadataExtractionService`** (`lib/services/metadata/metadata-extraction-service.ts`)
   - Orchestrates extraction and renaming
   - Processes multiple files
   - Calculates confidence scores

### Integration

Integrated into the upload flow in `langchain-service.ts`:

```typescript
// Extract smart metadata
const extractionResult = await metadataExtractionService.processFile(
  file,
  content,
  {
    extractFromContent: true,
    renameFile: false, // Set to true to enable renaming
    domain: options.domain,
  }
);

// Use extracted metadata
const title = extractedMetadata.title || extractedMetadata.clean_title || file.name;
const sourceName = extractedMetadata.source_name;
const documentType = extractedMetadata.document_type;
// ... etc
```

## 📋 Taxonomy Patterns

### Source Patterns (Auto-Detected)

#### Regulatory Bodies
- FDA, EMA, WHO, NIH, NICE, MHRA, PMDA, Health Canada, TGA

#### Journals & Publications
- Nature, Science, JAMA, NEJM, Lancet, BMJ

#### Consultancies
- McKinsey, Deloitte, BCG, PwC, KPMG

#### Pharma Companies
- Pfizer, GSK, Novartis, Roche, Merck, J&J

#### Government Agencies
- CDC, CMS, HHS

### Document Type Patterns

- **Regulatory Guidance** - guidance, guideline, regulation, regulatory guidance
- **Research Paper** - research, study, paper, publication, journal article
- **Clinical Protocol** - protocol, clinical protocol
- **Market Research Report** - market research, market report, market analysis
- **Government Regulation** - regulation, regulatory, fda regulation
- **Industry Standard** - standard, iso, ich guideline
- **Whitepaper** - whitepaper, white paper
- **Best Practice Guide** - best practice, best practice guide
- **Template** - template, form template
- **SOP** - sop, standard operating procedure
- **Clinical Trial** - clinical trial, trial protocol
- **Systematic Review** - systematic review, meta analysis
- **Case Study** - case study, case report

### Therapeutic Area Patterns

- Oncology, Cardiology, Neurology, Immunology, Infectious Disease, Endocrinology, Rheumatology, Respiratory, Dermatology, Gastroenterology

## ⚙️ Configuration

### Environment Variables

```env
# Enable AI-enhanced metadata extraction
ENABLE_AI_METADATA_EXTRACTION=true

# Enable automatic file renaming
ENABLE_AUTO_FILE_RENAMING=false  # Set to true to enable renaming
```

### Customization

You can customize the taxonomy patterns and renaming template:

```typescript
// Custom metadata extractor
const extractor = new SmartMetadataExtractor({
  useAI: true,
  taxonomy: {
    sourcePatterns: new Map([
      ['CustomSource', /custom-pattern/i],
      // Add more patterns
    ]),
  },
});

// Custom file renamer
const renamer = new FileRenamer({
  template: '{Year}_{Source}_{Title}',
  separator: '-',
  maxLength: {
    source: 20,
    type: 30,
    title: 100,
  },
});
```

## 📊 Metadata Confidence

The system calculates confidence scores for each extracted field:

- **High Confidence (0.9-1.0)** - Strong pattern match or AI extraction
- **Medium Confidence (0.7-0.9)** - Pattern match found
- **Low Confidence (0.5-0.7)** - Weak match or inference

Overall confidence is calculated as the average of all field confidences, with bonuses for key fields (source, year, type).

## 🔄 Workflow

1. **File Upload** - User uploads file
2. **Content Extraction** - Text extracted from file (PDF, DOCX, etc.)
3. **Metadata Extraction** - Extract metadata from filename and content
4. **AI Enhancement (Optional)** - Use AI to extract additional metadata
5. **File Renaming (Optional)** - Generate new filename based on taxonomy
6. **Storage** - Store document with enriched metadata
7. **Indexing** - Document indexed with metadata for better search

## 📈 Benefits

### Consistency
- All files follow consistent naming convention
- Easier to search and organize
- Better file management

### Discoverability
- Rich metadata enables better search
- Filters work more accurately
- Content is easier to categorize

### Automation
- No manual metadata entry required
- Reduced human error
- Faster upload process

### Intelligence
- AI-enhanced extraction catches nuances
- Pattern matching handles common cases
- Falls back gracefully when uncertain

## 🔍 Example

**Original File:**
```
FDA_Digital_Health_Guidance_2024_Final.pdf
```

**Extracted Metadata:**
```json
{
  "source_name": "FDA",
  "document_type": "Regulatory Guidance",
  "year": 2024,
  "clean_title": "Digital Health Guidance",
  "regulatory_body": "FDA",
  "geographic_scope": "US",
  "confidence": 0.92
}
```

**Renamed File (if enabled):**
```
FDA_RegulatoryGuidance_2024_Digital Health Guidance.pdf
```

## 🚀 Future Enhancements

- **Batch Processing** - Process multiple files in parallel
- **Learning System** - Learn from user corrections
- **Custom Taxonomies** - User-defined taxonomy patterns
- **Preview Before Rename** - Show preview before applying rename
- **Version Control** - Track renamed files and versions
- **Metadata Validation** - Validate extracted metadata before storage

