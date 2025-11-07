# Knowledge Documents Schema - Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE_DOCUMENTS TABLE (107 Fields)                  │
│                                                                              │
│  Original Fields (22) + New Fields (85) = Total (107)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  CORE IDENTITY (4)   │
│  ──────────────────  │
│  • id (UUID)         │
│  • title ★           │
│  • abstract ★        │
│  • content           │
└──────────────────────┘
         │
         ├─────────────┬──────────────┬──────────────┬──────────────┐
         │             │              │              │              │
┌────────▼────────┐ ┌──▼──────────┐ ┌▼─────────────┐ ┌▼────────────┐
│ SOURCE &        │ │ DOCUMENT    │ │ ACCESS &     │ │ QUALITY &   │
│ PUBLICATION (6) │ │ PROPERTIES  │ │ RETRIEVAL(5) │ │ VETTING (8) │
│ ───────────────│ │ (4)         │ │ ────────────│ │ ───────────│
│ • firm ★        │ │ • file_type │ │ • url ★      │ │ • quality   │
│ • firm_id       │ │ • file_size │ │ • pdf_link   │ │   _score ★  │
│ • authors ★     │ │ • page_count│ │ • access     │ │ • credibility│
│ • publication   │ │ • word_count│ │   _type      │ │   _score ★  │
│   _date ★       │ │ • language  │ │ • paywall    │ │ • peer      │
│ • version       │ │             │ │   _status    │ │   _reviewed │
│ • edition       │ │             │ │ • download   │ │ • editorial │
│ • series_name   │ │             │ │   _date      │ │   _status   │
└─────────────────┘ └─────────────┘ │ • last       │ │ • citation  │
                                     │   _verified  │ │   _count    │
                                     └──────────────┘ │ • confidence│
                                                      │   _level    │
                                                      └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        TAXONOMY & CLASSIFICATION (8)                          │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ domain ★     │  │ report_type ★│  │ industry     │  │ geographic   │   │
│  │              │  │              │  │ _sectors ★   │  │ _scope ★     │   │
│  │ ai_ml        │  │ strategic    │  │              │  │              │   │
│  │ precision    │  │ research     │  │ [Healthcare] │  │ global       │   │
│  │ digital      │  │ case_study   │  │ [Pharma]     │  │ regional     │   │
│  └──────────────┘  └──────────────┘  │ [Tech]       │  │ country      │   │
│                                       └──────────────┘  └──────────────┘   │
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ target       │  │ practice     │  │ seniority    │  │ use_case     │   │
│  │ _audience ★  │  │ _areas ★     │  │ _level ★     │  │ _category ★  │   │
│  │              │  │              │  │              │  │              │   │
│  │ [C-Suite]    │  │ [AI]         │  │ c_suite      │  │ implementation│   │
│  │ [CIO]        │  │ [Digital     │  │ vp_level     │  │ framework    │   │
│  │ [VP]         │  │  Transform]  │  │ director     │  │ case_study   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            RAG / AI PIPELINE                                 │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    RAG-SPECIFIC FIELDS (6)                          │    │
│  │  ──────────────────────────────────────────────────────────────   │    │
│  │                                                                     │    │
│  │  rag_priority_weight (0-1) ────────┐                               │    │
│  │  embedding_model_version           │                               │    │
│  │  chunk_strategy                    ├──► RAG Ranking Formula        │    │
│  │  query_history_count               │                               │    │
│  │  last_retrieved_at                 │    = semantic_similarity*0.40 │    │
│  │  context_window_tokens             │    + quality_score*0.20       │    │
│  │                                     │    + credibility_score*0.15   │    │
│  │  quality_score (0-10) ─────────────┤    + freshness_score*0.15     │    │
│  │  credibility_score (0-10) ─────────┤    + rag_priority*0.10        │    │
│  │  freshness_score (0-10) ───────────┘                               │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │              DOCUMENT STRUCTURE (7) - For Chunking                 │    │
│  │  ──────────────────────────────────────────────────────────────   │    │
│  │                                                                     │    │
│  │  has_executive_summary    ─┐                                       │    │
│  │  has_table_of_contents     │                                       │    │
│  │  has_appendices            ├──► Smart Chunking Strategy            │    │
│  │  has_data_tables           │                                       │    │
│  │  has_charts_graphs         │     • Semantic (default)              │    │
│  │  section_count             │     • Fixed size                      │    │
│  │  document_structure (JSON) ┘     • Hybrid                          │    │
│  │                                  • Section-based                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUALITY CALCULATION ENGINE                            │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  INPUT FACTORS                    WEIGHTS              OUTPUT               │
│  ──────────────                   ───────              ──────               │
│                                                                              │
│  Firm Reputation Score    ──────► 30%  ─┐                                   │
│  (McKinsey=9.9, BCG=9.8)                │                                   │
│                                         │                                   │
│  Peer Review Status       ──────► 20%  ─┤                                   │
│  (true/false)                           │                                   │
│                                         ├──►  QUALITY_SCORE (0-10)          │
│  Citation Count           ──────► 15%  ─┤                                   │
│  (normalized)                           │                                   │
│                                         │                                   │
│  Data Richness Score      ──────► 20%  ─┤                                   │
│  (tables, charts, stats)                │                                   │
│                                         │                                   │
│  Freshness Score          ──────► 15%  ─┘                                   │
│  (age-based decay)                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      ENGAGEMENT & ANALYTICS (6)                              │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  view_count ───────┐                                                         │
│  download_count ───┤                                                         │
│  share_count ──────┼──► Popularity Metrics ──► Trending Dashboard           │
│  bookmark_count ───┤                                                         │
│  avg_read_time ────┤                                                         │
│  completion_rate ──┘                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE & GOVERNANCE (6)                               │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  data_classification ─────┐                                                  │
│  access_policy ───────────┤                                                  │
│  compliance_tags ─────────┼──► Access Control & Audit Trail                 │
│  retention_policy ────────┤                                                  │
│  contains_pii ────────────┤                                                  │
│  requires_consent ────────┘                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT QUALITY (5)                                  │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  readability_score (Flesch-Kincaid) ──┐                                     │
│  technical_complexity ────────────────┤                                     │
│  data_richness_score ─────────────────┼──► Content Filtering & Ranking     │
│  visual_content_ratio ────────────────┤                                     │
│  freshness_score ─────────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEMPORAL & CONTEXT (4)                                    │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  temporal_coverage ─────► retrospective / current / forward_looking         │
│  forecast_year ─────────► 2030, 2035 (for predictions)                      │
│  historical_period ─────► "2020-2024" (for retrospectives)                  │
│  is_time_sensitive ─────► Boolean flag                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROVENANCE & CITATION (7)                                 │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  doi ──────────────────────► Permanent academic identifier                  │
│  isbn ─────────────────────► Book identifier                                │
│  permanent_id ─────────────► Internal tracking ID                           │
│  citation_format ──────────► Pre-formatted citation                         │
│  related_document_ids ─────► Knowledge graph links                          │
│  supersedes_document_id ───► Version control (replaces)                     │
│  superseded_by_document_id ► Version control (replaced by)                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════

                            INDEX ARCHITECTURE

════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│                         B-TREE INDEXES (26)                                   │
│  For: Exact matches, range queries, sorting                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                               │
│  Quality & Ranking                   Temporal                                │
│  • quality_score DESC        ✓       • publication_date DESC        ✓       │
│  • credibility_score DESC    ✓       • last_verified_date DESC      ✓       │
│  • query_history_count DESC  ✓       • last_retrieved_at DESC       ✓       │
│                                                                               │
│  Classification                      RAG/AI                                  │
│  • firm                      ✓       • embedding_model_version       ✓       │
│  • report_type               ✓       • access_type                   ✓       │
│  • geographic_scope          ✓                                               │
│  • seniority_level           ✓       Composite                               │
│  • use_case_category         ✓       • firm + year + quality         ✓       │
│                                       • domain + freshness            ✓       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         GIN INDEXES (8)                                       │
│  For: JSONB array searches (contains, overlaps)                              │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                               │
│  • authors                   ✓       • target_audience               ✓       │
│  • industry_sectors          ✓       • practice_areas                ✓       │
│  • geographic_regions        ✓       • compliance_tags               ✓       │
│  • title (trigram)           ✓       • abstract (trigram)            ✓       │
│                                                                               │
│  Example Query:                                                               │
│  WHERE industry_sectors @> '["Healthcare"]'                                  │
│    AND target_audience @> '["C-Suite"]'                                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                      TRIGRAM INDEXES (2)                                      │
│  For: Fuzzy text search, partial matching                                    │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                               │
│  • title gin_trgm_ops        ✓   ─► Fuzzy search on titles                  │
│  • abstract gin_trgm_ops     ✓   ─► Fuzzy search on abstracts               │
│                                                                               │
│  Example Query:                                                               │
│  WHERE title ILIKE '%AI%Work%'  ← Uses trigram index                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                    VECTOR INDEX (1)                                           │
│  For: Semantic similarity search                                             │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                               │
│  • embedding (ivfflat)       ✓   ─► Cosine similarity on embeddings          │
│                                                                               │
│  Example Query:                                                               │
│  ORDER BY embedding <=> query_embedding LIMIT 10                             │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════

                         QUERY PATTERN EXAMPLES

════════════════════════════════════════════════════════════════════════════════

1. TOP QUALITY REPORTS
   ↓
   SELECT title, firm, quality_score
   FROM knowledge_documents
   WHERE quality_score > 9.0
   ORDER BY quality_score DESC
   LIMIT 10;
   ↓
   Uses: idx_knowledge_documents_quality_score (DESC)

2. C-SUITE AI CONTENT
   ↓
   SELECT title, firm, target_audience
   FROM knowledge_documents
   WHERE target_audience @> '["C-Suite"]'
     AND practice_areas @> '["AI"]'
   ORDER BY freshness_score DESC;
   ↓
   Uses: idx_knowledge_documents_target_audience_gin
         idx_knowledge_documents_practice_areas_gin

3. FIRM + YEAR + QUALITY
   ↓
   SELECT title, publication_year, quality_score
   FROM knowledge_documents
   WHERE firm = 'McKinsey & Company'
     AND publication_year = 2025
   ORDER BY quality_score DESC;
   ↓
   Uses: idx_knowledge_documents_firm_year_quality (Composite!)

4. FUZZY TITLE SEARCH
   ↓
   SELECT title, firm
   FROM knowledge_documents
   WHERE title ILIKE '%AI%Work%';
   ↓
   Uses: idx_knowledge_documents_title_trgm (Trigram!)

5. RAG SEMANTIC SEARCH
   ↓
   SELECT title, firm, quality_score
   FROM knowledge_documents
   ORDER BY embedding <=> $query_embedding
   LIMIT 10;
   ↓
   Uses: idx_knowledge_documents_embedding (Vector!)

════════════════════════════════════════════════════════════════════════════════

★ = Critical field for most queries
✓ = Indexed for performance

Total Fields: 107
Total Indexes: 38
Query Performance: Optimized for <100ms on millions of rows

