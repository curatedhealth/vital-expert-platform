# Documents Library Tab - Comprehensive Metadata View

## 📚 Overview

A new "Documents Library" tab has been added to the Knowledge Management page, providing a comprehensive view of all documents with detailed metadata including Domain, Source Name, Clean File Name, Year, and many other useful fields.

## 🎯 Key Features

### Comprehensive Metadata Display
The library tab shows all documents with the following metadata fields:

#### Core Identification
- **Document Title** - Main document title
- **Clean File Name** - File name without extension/formatted for display
- **Domain** - Knowledge domain (e.g., regulatory_affairs, clinical)
- **Domain ID** - New architecture domain identifier

#### Source & Publication
- **Source Name** - Publisher/Organization (FDA, McKinsey, Nature, EMA, WHO, etc.)
- **Source URL** - Original source link
- **Year** - Publication or document year (auto-extracted from filename/date)
- **Publication Date** - Specific publication date (if available)
- **Author** - Document author(s)
- **Organization** - Publishing organization

#### Document Classification
- **Document Type** - Classification (Regulatory Guidance, Research Paper, Clinical Protocol, Market Research Report, etc.)
- **Language** - Document language
- **File Type** - PDF, DOCX, TXT, etc.
- **File Size** - In bytes (formatted display)
- **Page Count** - Number of pages (if available)
- **Chunk Count** - Number of RAG chunks

#### Healthcare/Pharma Specific
- **Regulatory Body** - FDA, EMA, MHRA, etc.
- **Therapeutic Area** - Oncology, Cardiology, etc.
- **Geographic Scope** - US, EU, Global, etc.

#### Access & Security
- **Access Policy** - public, enterprise_confidential, team_confidential, personal_draft
- **Priority Weight** - RAG priority (0-1)
- **Tags** - User-defined tags

#### Status & Processing
- **Status** - processing, completed, failed
- **Uploaded Date** - When document was uploaded
- **Processed Date** - When processing completed

## 🔍 Advanced Filtering

### Filter Options
1. **Search** - Full-text search across title, clean file name, source, author, and document type
2. **Domain** - Filter by knowledge domain
3. **Source** - Filter by source/organization (FDA, McKinsey, etc.)
4. **Year** - Filter by publication year
5. **Document Type** - Filter by document classification

### Sorting Options
- **Upload Date** (default)
- **Name** (alphabetical)
- **Source** (alphabetical)
- **Year** (chronological)
- **File Size** (smallest to largest)

Sort order can be toggled between Ascending and Descending.

## 📊 Table View

The documents are displayed in a comprehensive table with columns:
1. **Document** - Title, clean file name, and author
2. **Domain** - Domain badge
3. **Source** - Source organization with icon
4. **Year** - Publication year
5. **Type** - Document type badge
6. **File Info** - File type, size, pages, chunks
7. **Status** - Processing status badge
8. **Metadata** - Access policy, priority weight, regulatory body, tags
9. **Actions** - View and Download buttons

## 🔧 Implementation Details

### Files Created/Modified

1. **`docs/DOCUMENT_METADATA_SCHEMA.md`** - Comprehensive list of all recommended metadata fields
2. **`apps/digital-health-startup/src/features/knowledge/components/documents-library-view.tsx`** - Main component for the library view
3. **`apps/digital-health-startup/src/app/(app)/knowledge/page.tsx`** - Added library tab integration
4. **`apps/digital-health-startup/src/app/api/knowledge/documents/route.ts`** - Updated to return additional metadata fields
5. **`apps/digital-health-startup/src/components/sidebar-view-content.tsx`** - Added "Documents Library" link in sidebar

### Metadata Extraction

The component automatically extracts and enriches metadata from:
- **Database fields** - Direct fields from `knowledge_documents` table
- **Metadata JSONB** - Parsed from the `metadata` JSONB column
- **Filename patterns** - Intelligent extraction from filenames:
  - Source names (FDA, EMA, McKinsey, etc.)
  - Years (1900-2099 patterns)
  - Document types (from keywords in filename)
- **Date fields** - Year extraction from created_at or publication dates

### Smart Source Detection

The component can identify common sources from filenames:
- Regulatory: FDA, EMA, WHO, NIH
- Journals: Nature, Science, JAMA, NEJM, Lancet
- Consultancies: McKinsey, Deloitte, BCG, PwC
- Pharma: GSK, Pfizer, Novartis

## 📍 Access

Navigate to the Documents Library via:
1. **Sidebar**: Click "Documents Library" in the Knowledge Actions section
2. **URL**: `/knowledge?tab=library`

## 🎨 UI Features

- Responsive design - Works on mobile, tablet, and desktop
- Loading states - Shows loading spinner during data fetch
- Error handling - Displays error messages if fetch fails
- Empty states - Helpful messages when no documents match filters
- Badge indicators - Visual badges for status, access policy, document type
- Action buttons - Quick access to view and download documents

## 🔄 Future Enhancements

Potential improvements:
- Export to CSV/Excel
- Bulk actions (delete, tag, change access policy)
- Advanced search with filters combination
- Metadata editing directly in the table
- Document preview modal
- Tag management interface
- Metadata bulk import/export

