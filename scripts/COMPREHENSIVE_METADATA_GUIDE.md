# Comprehensive Metadata Guide for Knowledge Documents

## Overview

This guide provides detailed documentation for all metadata fields available in the `knowledge_documents` table. These fields have been designed to support:

- **RAG (Retrieval-Augmented Generation)** optimization
- **Quality assessment** and vetting
- **Strategic consulting** knowledge management
- **Compliance** and data governance
- **Usage analytics** and engagement tracking

---

## Table of Contents

1. [Core Descriptive Metadata](#1-core-descriptive-metadata)
2. [Source & Publication Details](#2-source--publication-details)
3. [Document Properties](#3-document-properties)
4. [Access & Retrieval](#4-access--retrieval)
5. [Quality, Vetting, & Provenance](#5-quality-vetting--provenance)
6. [Taxonomy & Classification](#6-taxonomy--classification)
7. [Temporal & Context Metadata](#7-temporal--context-metadata)
8. [Document Structure](#8-document-structure)
9. [RAG/AI-Specific Metadata](#9-ragai-specific-metadata)
10. [Provenance & Citation](#10-provenance--citation)
11. [Data Classification & Compliance](#11-data-classification--compliance)
12. [Engagement & Usage Tracking](#12-engagement--usage-tracking)
13. [Content Quality Indicators](#13-content-quality-indicators)

---

## 1. Core Descriptive Metadata

### `title` (VARCHAR, REQUIRED)
- **Description**: Exact title of the report, article, or publication
- **Purpose**: Primary identifier and search field
- **Example**: `"AI at Work: Momentum Builds, but Gaps Remain"`
- **Indexed**: Yes (with trigram for fuzzy search)

### `abstract` (TEXT)
- **Description**: Executive summary or abstract for quick preview
- **Purpose**: RAG context, search snippets, quick understanding
- **Length**: 100-500 words recommended
- **Example**: `"BCG's 2025 analysis of AI adoption in the workplace..."`
- **Indexed**: Yes (trigram for full-text search)

### `report_type` (TEXT)
- **Description**: Type/category of the report
- **Allowed Values**: 
  - `strategic_insight` - High-level strategy perspectives
  - `research_study` - Data-driven research reports
  - `point_of_view` - Opinion/thought leadership pieces
  - `case_study` - Real-world implementation examples
  - `white_paper` - Technical deep-dives
  - `infographic` - Visual data presentations
  - `market_report` - Market analysis and trends
  - `trend_analysis` - Industry trend forecasts
  - `framework` - Methodology/framework guides
  - `implementation_guide` - How-to guides
  - `other` - Other types
- **Purpose**: Content filtering and categorization
- **Indexed**: Yes

### `page_count` (INTEGER)
- **Description**: Total number of pages or slides
- **Purpose**: Estimate reading time, chunking strategy
- **Example**: `45`

### `word_count` (INTEGER)
- **Description**: Total word count
- **Purpose**: Content length estimation, reading time calculation
- **Example**: `12500`

---

## 2. Source & Publication Details

### `firm` (TEXT)
- **Description**: Consulting firm or organization name
- **Purpose**: Source credibility, filtering by firm
- **Example**: `"Boston Consulting Group"`
- **Indexed**: Yes (with composite index: firm + year + quality)

### `firm_id` (UUID, FOREIGN KEY)
- **Description**: Reference to the `firms` table
- **Purpose**: Normalized firm data with reputation scores
- **Example**: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`

### `authors` (JSONB ARRAY)
- **Description**: Individual authors/contributors
- **Format**: `[{"name": "François Candelon", "role": "Senior Partner"}, ...]`
- **Purpose**: Attribution, author expertise tracking
- **Indexed**: Yes (GIN index for array search)

### `publication_date` (DATE)
- **Description**: Full publication date (YYYY-MM-DD)
- **Purpose**: Precise dating, freshness calculation
- **Example**: `"2025-01-15"`
- **Indexed**: Yes (DESC for recent-first sorting)

### `publication_year` (INTEGER)
- **Description**: Publication year (legacy compatibility)
- **Example**: `2025`
- **Indexed**: Yes (composite with month)

### `publication_month` (TEXT)
- **Description**: Month or quarter of publication
- **Allowed Values**: `"Q1"`, `"Q2"`, `"Q3"`, `"Q4"`, or `"January"`, `"February"`, etc.
- **Purpose**: Quarterly/monthly filtering
- **Example**: `"Q1"`

### `version` (TEXT)
- **Description**: Document version
- **Example**: `"1.0"`, `"2.0"`, `"revised"`
- **Purpose**: Version tracking, change management

### `edition` (TEXT)
- **Description**: Edition information
- **Example**: `"2025 Edition"`, `"3rd Edition"`
- **Purpose**: Series tracking

### `series_name` (TEXT)
- **Description**: Report series name
- **Example**: `"BCG AI Insights Series"`
- **Purpose**: Group related reports

---

## 3. Document Properties

### `file_type` (VARCHAR)
- **Description**: Original file format
- **Allowed Values**: `pdf`, `html`, `docx`, `xlsx`, `pptx`, `md`, etc.
- **Example**: `"pdf"`

### `content_file_type` (TEXT)
- **Description**: Content format (may differ from file_type after processing)
- **Example**: `"html"` (for scraped HTML content saved as text)

### `file_size` (INTEGER)
- **Description**: File size in bytes
- **Purpose**: Storage management, download time estimation
- **Example**: `5242880` (5 MB)

### `language_code` (TEXT)
- **Description**: ISO 639-1 language code
- **Default**: `"en"`
- **Purpose**: Multi-language support, NLP processing
- **Example**: `"en"`, `"fr"`, `"es"`, `"de"`

---

## 4. Access & Retrieval

### `url` / `source_url` (TEXT)
- **Description**: Original web URL or landing page
- **Purpose**: Source verification, link tracking
- **Example**: `"https://www.bcg.com/publications/2025/..."`

### `pdf_link` (TEXT)
- **Description**: Direct PDF download link
- **Purpose**: Direct file access
- **Example**: `"https://www.mckinsey.com/~/media/...pdf"`

### `direct_download` (BOOLEAN)
- **Description**: Whether direct download is available
- **Default**: `false`
- **Purpose**: Automation feasibility

### `access_type` (TEXT)
- **Description**: Access level required
- **Allowed Values**: `public`, `paid`, `registration_required`, `restricted`, `gated`, `freemium`
- **Default**: `"public"`
- **Purpose**: Access control, pipeline planning
- **Indexed**: Yes

### `registration_required` (BOOLEAN)
- **Description**: Whether user registration is needed
- **Default**: `false`

### `paywall_status` (TEXT)
- **Description**: Paywall information
- **Allowed Values**: `free`, `paid`, `freemium`, `trial_available`, `subscription`
- **Default**: `"free"`

### `download_date` (TIMESTAMP WITH TIME ZONE)
- **Description**: When the document was downloaded/scraped
- **Purpose**: Audit trail, freshness tracking
- **Example**: `"2025-11-05T10:30:00Z"`

### `last_verified_date` (TIMESTAMP WITH TIME ZONE)
- **Description**: Last time URL/content was verified as accessible
- **Purpose**: Link rot detection, maintenance scheduling
- **Indexed**: Yes

---

## 5. Quality, Vetting, & Provenance

### `quality_score` (NUMERIC, 0-10)
- **Description**: Overall quality rating (manual or automated)
- **Calculation**: Weighted average of:
  - Firm reputation (30%)
  - Peer review status (20%)
  - Citation count (15%)
  - Data richness (20%)
  - Freshness (15%)
- **Purpose**: RAG prioritization, filtering
- **Example**: `9.5`
- **Indexed**: Yes (DESC for quality-first sorting)

### `credibility_score` (NUMERIC, 0-10)
- **Description**: Source credibility rating
- **Factors**: Firm reputation, peer review, editorial process
- **Purpose**: Trust scoring for RAG results
- **Example**: `9.8`
- **Indexed**: Yes (DESC)

### `peer_reviewed` (BOOLEAN)
- **Description**: Whether the document underwent peer review
- **Default**: `false`
- **Purpose**: Quality indicator, academic credibility

### `editorial_review_status` (TEXT)
- **Description**: Current review/approval status
- **Allowed Values**: `draft`, `in_review`, `reviewed`, `approved`, `published`, `archived`
- **Default**: `"draft"`
- **Purpose**: Workflow tracking, quality control

### `last_reviewed_date` (TIMESTAMP)
- **Description**: When the document was last manually reviewed
- **Purpose**: Audit trail, review cycle tracking

### `reviewed_by_user_id` (UUID)
- **Description**: User who performed the last review
- **Purpose**: Accountability, quality tracking

### `confidence_level` (TEXT)
- **Description**: Confidence in metadata accuracy
- **Allowed Values**: `high`, `medium`, `low`, `unverified`
- **Default**: `"medium"`
- **Purpose**: Auto-generated metadata quality indicator

### `citation_count` (INTEGER)
- **Description**: Number of times cited (if trackable)
- **Default**: `0`
- **Purpose**: Impact measurement, quality indicator

---

## 6. Taxonomy & Classification

### `domain` (VARCHAR)
- **Description**: Primary knowledge domain
- **Example**: `"ai_ml_healthcare"`, `"precision_medicine"`
- **Purpose**: Domain-based filtering, namespace routing

### `category` (TEXT)
- **Description**: Document category
- **Example**: `"consulting_reports"`, `"academic_papers"`

### `tags` (TEXT ARRAY)
- **Description**: Free-form tags
- **Example**: `["AI adoption", "generative AI", "workforce"]`
- **Purpose**: Flexible categorization, search

### `topics` (JSONB ARRAY)
- **Description**: Structured topic taxonomy
- **Format**: Can be simple array or objects with hierarchy
- **Example**: `["AI adoption", "workforce transformation"]`
- **Indexed**: Yes (already exists)

### `industry_sectors` (JSONB ARRAY)
- **Description**: Industries covered in the report
- **Example**: `["Healthcare", "Technology", "Financial Services"]`
- **Purpose**: Industry-specific filtering
- **Indexed**: Yes (GIN)

### `geographic_scope` (TEXT)
- **Description**: Geographic coverage
- **Allowed Values**: `global`, `regional`, `country_specific`, `local`, `multi_regional`
- **Purpose**: Geography-based filtering
- **Indexed**: Yes

### `geographic_regions` (JSONB ARRAY)
- **Description**: Specific regions/countries covered
- **Example**: `["North America", "Europe", "Asia Pacific"]`
- **Indexed**: Yes (GIN)

### `target_audience` (JSONB ARRAY)
- **Description**: Intended audience/personas
- **Example**: `["C-Suite", "CIO", "CTO", "VP Digital Transformation"]`
- **Purpose**: Persona-based filtering
- **Indexed**: Yes (GIN)

### `practice_areas` (JSONB ARRAY)
- **Description**: Consulting practice areas
- **Example**: `["Artificial Intelligence", "Digital Transformation", "Workforce Strategy"]`
- **Purpose**: Practice-specific filtering
- **Indexed**: Yes (GIN)

### `seniority_level` (TEXT)
- **Description**: Target seniority level
- **Allowed Values**: `c_suite`, `vp_level`, `director`, `manager`, `analyst`, `specialist`, `all_levels`
- **Purpose**: Audience targeting
- **Indexed**: Yes

### `use_case_category` (TEXT)
- **Description**: Primary use case type
- **Allowed Values**: `implementation`, `framework`, `case_study`, `market_analysis`, `trends`, `best_practices`, `thought_leadership`, `research`
- **Indexed**: Yes

---

## 7. Temporal & Context Metadata

### `temporal_coverage` (TEXT)
- **Description**: Temporal focus of content
- **Allowed Values**: `retrospective`, `current`, `forward_looking`, `forecast`, `historical`, `real_time`
- **Purpose**: Time-based filtering

### `forecast_year` (INTEGER)
- **Description**: Target year for forecasts/predictions
- **Example**: `2030`
- **Purpose**: Future-looking content tracking

### `historical_period` (TEXT)
- **Description**: Historical period covered
- **Example**: `"2020-2024"`, `"2010-2020"`
- **Purpose**: Retrospective analysis tracking

### `is_time_sensitive` (BOOLEAN)
- **Description**: Whether content becomes outdated quickly
- **Default**: `false`
- **Purpose**: Freshness prioritization, archival planning

---

## 8. Document Structure

### `has_executive_summary` (BOOLEAN)
- **Description**: Whether document includes an executive summary
- **Default**: `false`
- **Purpose**: Chunking strategy, quick access

### `has_table_of_contents` (BOOLEAN)
- **Description**: Whether TOC is present
- **Default**: `false`
- **Purpose**: Structure-aware chunking

### `has_appendices` (BOOLEAN)
- **Description**: Whether appendices are included
- **Default**: `false`

### `has_data_tables` (BOOLEAN)
- **Description**: Whether data tables are present
- **Default**: `false`
- **Purpose**: Data extraction planning

### `has_charts_graphs` (BOOLEAN)
- **Description**: Whether visual data is present
- **Default**: `false`
- **Purpose**: Multimodal processing

### `section_count` (INTEGER)
- **Description**: Number of major sections
- **Purpose**: Complexity estimation

### `document_structure` (JSONB)
- **Description**: Structured TOC with page numbers
- **Format**:
```json
{
  "sections": [
    {"title": "Executive Summary", "page": 1},
    {"title": "Introduction", "page": 5}
  ]
}
```
- **Purpose**: Structure-aware RAG, targeted retrieval

---

## 9. RAG/AI-Specific Metadata

### `priority` (VARCHAR)
- **Description**: Simple priority level (legacy field)
- **Values**: `high`, `medium`, `low`

### `rag_priority_weight` (NUMERIC, 0-1)
- **Description**: Boost factor for RAG retrieval
- **Range**: 0.0 to 1.0 (higher = more priority)
- **Default**: `0.9`
- **Purpose**: Relevance score boosting
- **Example**: `0.95` for tier-1 consulting firms

### `embedding_model_version` (TEXT)
- **Description**: Which embedding model was used
- **Example**: `"sentence-transformers/all-MiniLM-L6-v2"`
- **Purpose**: Model tracking, re-embedding planning
- **Indexed**: Yes

### `chunk_strategy` (TEXT)
- **Description**: Chunking strategy used
- **Allowed Values**: `semantic`, `fixed_size`, `hybrid`, `paragraph`, `sentence`, `section_based`
- **Default**: `"semantic"`
- **Purpose**: RAG pipeline documentation

### `context_window_tokens` (INTEGER)
- **Description**: Estimated tokens for full document context
- **Example**: `8192`, `16384`
- **Purpose**: LLM context planning

### `summarization_available` (BOOLEAN)
- **Description**: Whether summary embedding exists
- **Default**: `false`
- **Purpose**: Quick summary retrieval

### `query_history_count` (INTEGER)
- **Description**: Number of times retrieved in RAG queries
- **Default**: `0`
- **Purpose**: Popularity metric, cache optimization
- **Indexed**: Yes (DESC)

### `last_retrieved_at` (TIMESTAMP)
- **Description**: Most recent RAG retrieval timestamp
- **Purpose**: Usage analytics, cache management
- **Indexed**: Yes (DESC)

---

## 10. Provenance & Citation

### `doi` (TEXT)
- **Description**: Digital Object Identifier
- **Example**: `"10.1234/mckinsey.2024.genai.pharma"`
- **Purpose**: Permanent citation, academic linking

### `isbn` (TEXT)
- **Description**: ISBN for published books/reports
- **Example**: `"978-1-234567-89-0"`

### `permanent_id` (TEXT)
- **Description**: Internal permanent identifier
- **Example**: `"BCG-2025-AI-WORK-001"`
- **Purpose**: Internal tracking, versioning

### `citation_format` (TEXT)
- **Description**: Pre-formatted citation
- **Format**: APA, MLA, Chicago, etc.
- **Example**: `"Candelon, F., et al. (2025). AI at Work. BCG."`
- **Purpose**: Easy citation, attribution

### `related_document_ids` (JSONB ARRAY)
- **Description**: Array of related document UUIDs
- **Format**: `["uuid1", "uuid2", ...]`
- **Purpose**: Knowledge graph, recommendation
- **Indexed**: Yes (GIN)

### `supersedes_document_id` (UUID)
- **Description**: UUID of document this replaces
- **Purpose**: Version tracking, archival

### `superseded_by_document_id` (UUID)
- **Description**: UUID of newer version
- **Purpose**: Version forwarding, archival

---

## 11. Data Classification & Compliance

### `access_policy` (ENUM)
- **Description**: Access control level
- **Values**: `public`, `internal`, `restricted`, `confidential`
- **Default**: `"public"`

### `data_classification` (TEXT)
- **Description**: Data sensitivity classification
- **Allowed Values**: `public`, `internal`, `confidential`, `restricted`, `highly_restricted`
- **Purpose**: Compliance, access control

### `retention_policy` (TEXT)
- **Description**: How long to retain
- **Example**: `"permanent"`, `"7 years"`, `"until superseded"`
- **Purpose**: Compliance, storage management

### `compliance_tags` (JSONB ARRAY)
- **Description**: Applicable compliance frameworks
- **Example**: `["HIPAA", "GDPR", "SOC2", "FDA Guidance"]`
- **Purpose**: Compliance tracking, filtering
- **Indexed**: Yes (GIN)

### `pii_sensitivity` (ENUM)
- **Description**: PII sensitivity level
- **Values**: `Low`, `Medium`, `High`
- **Default**: `"Low"`

### `regulatory_exposure` (ENUM)
- **Description**: Regulatory risk level
- **Values**: `Low`, `Medium`, `High`
- **Default**: `"Medium"`

### `contains_pii` (BOOLEAN)
- **Description**: Whether document contains PII
- **Default**: `false`
- **Purpose**: Data protection, access control

### `requires_consent` (BOOLEAN)
- **Description**: Whether user consent is needed for processing
- **Default**: `false`
- **Purpose**: GDPR compliance

---

## 12. Engagement & Usage Tracking

### `view_count` (INTEGER)
- **Description**: Number of times viewed
- **Default**: `0`
- **Purpose**: Popularity tracking

### `download_count` (INTEGER)
- **Description**: Number of times downloaded
- **Default**: `0`

### `share_count` (INTEGER)
- **Description**: Number of times shared
- **Default**: `0`

### `bookmark_count` (INTEGER)
- **Description**: Number of users who bookmarked
- **Default**: `0`

### `average_read_time_seconds` (INTEGER)
- **Description**: Average time spent reading
- **Purpose**: Engagement analytics

### `completion_rate` (NUMERIC, 0-1)
- **Description**: Percentage of users who read to end
- **Range**: 0.0 to 1.0
- **Purpose**: Content quality indicator

---

## 13. Content Quality Indicators

### `readability_score` (NUMERIC)
- **Description**: Flesch-Kincaid or similar readability score
- **Range**: Typically 0-100 (higher = easier to read)
- **Purpose**: Audience matching, accessibility

### `technical_complexity` (TEXT)
- **Description**: Content complexity level
- **Allowed Values**: `beginner`, `intermediate`, `advanced`, `expert`, `mixed`
- **Purpose**: Audience targeting, difficulty filtering

### `data_richness_score` (NUMERIC, 0-10)
- **Description**: Quantitative data density
- **Calculation**: Based on tables, charts, statistics
- **Purpose**: Data-driven filtering, quality indicator

### `visual_content_ratio` (NUMERIC, 0-1)
- **Description**: Percentage of content that is visual (charts/images)
- **Range**: 0.0 to 1.0
- **Purpose**: Visual content detection

### `freshness_score` (NUMERIC, 0-10)
- **Description**: How current/relevant the content is
- **Calculation**: Auto-calculated based on:
  - Publication date
  - Last update date
  - Topic relevance decay
  - Citation recency
- **Purpose**: RAG prioritization, archival decisions
- **Indexed**: Yes (composite with domain)

---

## Usage Examples

### Example 1: High-Quality Strategic Report

```json
{
  "title": "AI at Work: Momentum Builds, but Gaps Remain",
  "abstract": "BCG's 2025 analysis...",
  "quality_score": 9.5,
  "credibility_score": 9.8,
  "firm": "Boston Consulting Group",
  "publication_date": "2025-01-15",
  "rag_priority_weight": 0.95,
  "report_type": "strategic_insight",
  "target_audience": ["C-Suite", "CIO", "CTO"],
  "freshness_score": 10.0,
  "technical_complexity": "advanced"
}
```

### Example 2: Technical Research Study

```json
{
  "title": "Generative AI in Pharma and Medtech",
  "report_type": "research_study",
  "peer_reviewed": true,
  "quality_score": 9.8,
  "has_data_tables": true,
  "has_charts_graphs": true,
  "data_richness_score": 9.2,
  "technical_complexity": "expert",
  "practice_areas": ["Drug Discovery", "Clinical Development"]
}
```

---

## Best Practices

### For Data Ingestion
1. **Always populate**: `title`, `firm`, `publication_date`, `quality_score`, `credibility_score`
2. **Auto-calculate when possible**: `freshness_score`, `readability_score`, `word_count`
3. **Use controlled vocabularies**: Stick to allowed values for enum fields
4. **Index JSONB fields**: For array fields that will be frequently queried

### For RAG Optimization
1. Set appropriate `rag_priority_weight` based on firm reputation
2. Use `quality_score` and `freshness_score` in ranking algorithms
3. Track `query_history_count` for popularity-based boosting
4. Use `document_structure` for targeted section retrieval

### For Quality Management
1. Regular review cycles: Update `last_reviewed_date`
2. Monitor `last_verified_date` for link rot
3. Track `citation_count` for impact measurement
4. Use `editorial_review_status` for workflow management

### For Compliance
1. Always set `data_classification` and `access_policy`
2. Tag with relevant `compliance_tags`
3. Set `retention_policy` per organizational requirements
4. Track PII with `contains_pii` and `pii_sensitivity`

---

## Database Performance Tips

1. **Use composite indexes** for common query patterns:
   - `(firm, publication_year DESC, quality_score DESC)`
   - `(domain, freshness_score DESC)`

2. **GIN indexes for JSONB arrays** enable fast array searches:
   - `authors`, `industry_sectors`, `target_audience`, `practice_areas`

3. **Trigram indexes** for fuzzy text search:
   - `title`, `abstract`

4. **Timestamp indexes** for temporal queries:
   - `publication_date DESC`, `last_retrieved_at DESC`

---

## Related Documentation

- [JSON Structure Guide](./JSON_STRUCTURE_GUIDE.md)
- [Knowledge Pipeline README](./KNOWLEDGE_PIPELINE_README.md)
- [RAG Integration Guide](./RAG_INTEGRATION_GUIDE.md)
- [Embedding Models Guide](./EMBEDDING_MODELS_GUIDE.md)

---

*Last Updated: 2025-11-05*
*Version: 1.0.0*

