# 🚀 QUICK START GUIDE - Comprehensive Metadata System

## ⚡ 3-Minute Setup

### 1. Database (Already Applied!)
✅ Migration completed - 107 fields + 38 indexes ready

### 2. Python Pipeline Setup

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/scripts

# Install dependencies (if not already done)
pip install -r requirements.txt

# Test auto-calculator
python metadata_auto_calculator.py

# Test metadata mapper
python comprehensive_metadata_mapper.py
```

### 3. Frontend Access

**Knowledge Pipeline Configuration**:
```
http://localhost:3000/admin?view=knowledge-pipeline
```

**Analytics Dashboard** (needs mounting):
```typescript
// Add to your admin page routes:
import KnowledgeAnalyticsDashboard from '@/components/admin/KnowledgeAnalyticsDashboard';

// Render when view === 'analytics'
{view === 'analytics' && <KnowledgeAnalyticsDashboard />}
```

---

## 📝 Quick Usage Examples

### Example 1: Upload JSON with Comprehensive Metadata

```json
{
  "sources": [
    {
      "url": "https://www.bcg.com/report",
      "title": "AI in Healthcare 2025",
      "firm": "Boston Consulting Group",
      "publication_date": "2025-01-15",
      "publication_year": 2025,
      "publication_month": "Q1",
      "domain": "ai_ml_healthcare",
      "report_type": "strategic_insight",
      "industry_sectors": ["Healthcare", "Technology"],
      "target_audience": ["C-Suite", "CIO"],
      "practice_areas": ["AI", "Digital Transformation"],
      "tags": ["AI adoption", "healthcare"],
      "has_data_tables": true,
      "has_charts_graphs": true,
      "abstract": "BCG's analysis of AI adoption in healthcare..."
    }
  ]
}
```

### Example 2: Run Pipeline with Auto-Calculation

```bash
# Simple run (auto-calculates all scores)
python knowledge-pipeline.py --config sources.json

# With custom embedding model
python knowledge-pipeline.py \
  --config sources.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2

# Dry run to test metadata mapping
python knowledge-pipeline.py --config sources.json --dry-run
```

**Pipeline automatically calculates**:
- ✅ Quality Score (based on firm + content)
- ✅ Credibility Score
- ✅ Freshness Score (based on publication date)
- ✅ Readability Score (from content)
- ✅ Technical Complexity
- ✅ RAG Priority Weight (by firm tier)
- ✅ Data Richness Score

### Example 3: Query Analytics API

```bash
# Get 30-day analytics for all domains
curl http://localhost:3000/api/analytics/knowledge?range=30d&domain=all

# Get 7-day analytics for AI/ML domain
curl http://localhost:3000/api/analytics/knowledge?range=7d&domain=ai_ml_healthcare
```

---

## 🎯 Common Workflows

### Workflow 1: Add New Consulting Reports

1. **Prepare JSON** (use template: `comprehensive-knowledge-config-template.json`)
2. **Upload in UI** → `/admin?view=knowledge-pipeline`
3. **Review** → Auto-populated fields
4. **Export** → Download JSON
5. **Run Pipeline** → `python knowledge-pipeline.py --config exported.json`
6. **View Analytics** → Check quality scores and engagement

### Workflow 2: Manual Entry with Advanced Metadata

1. Navigate to `/admin?view=knowledge-pipeline`
2. Click "Add Source Manually"
3. Fill basic fields (URL, domain, description)
4. Click "Advanced Metadata" accordion
5. Fill 4 tabs:
   - **Publication**: Firm, authors, date, abstract
   - **Classification**: Industries, audiences, geographic scope
   - **Quality**: Override auto-scores if needed
   - **Structure**: Document features for RAG
6. Click "Add Source"
7. Export and run pipeline

### Workflow 3: Monitor Quality Trends

1. Navigate to `/admin/analytics` (after mounting dashboard)
2. Select time range (7d/30d/90d/all)
3. Filter by domain
4. Review:
   - Quality distribution chart
   - Top quality documents
   - Firm performance table
   - RAG retrieval patterns
   - Freshness trends

---

## 🔥 Power Features

### Auto-Calculated Scores

**Quality Score** (0-10):
```
= firm_reputation (30%)
+ peer_review (20%)
+ citations (15%)
+ data_richness (20%)
+ freshness (15%)
```

**Firm Reputation Presets**:
- McKinsey: 9.9, BCG: 9.8, Bain: 9.7
- Deloitte: 9.0, Gartner: 8.9
- Auto-set RAG priority by tier

**Freshness Score** (0-10):
- 0-3 months: 10.0
- 3-6 months: 9.0
- 6-12 months: 8.0
- 1-2 years: 6.0
- 2-3 years: 4.0
- 3-5 years: 2.0
- 5+ years: 1.0

### Smart Field Mapping

JSON imports automatically map:
```
pdf_link → url (if url missing)
firm → firm
topics → tags
title → description (if description missing)
year → publication_year
```

### RAG Optimization

**Priority Tiers**:
- Tier 1 (MBB): 0.98
- Tier 2 (Big 4, Gartner): 0.95
- Tier 3 (Others): 0.92
- Default: 0.90

**Retrieval Ranking**:
```javascript
final_score = 
  semantic_similarity * 0.40 +
  quality_score * 0.20 +
  credibility_score * 0.15 +
  freshness_score * 0.15 +
  rag_priority_weight * 0.10
```

---

## 📊 Key Metrics to Track

### Dashboard KPIs
1. **Average Quality Score** → Target: > 8.0
2. **% Excellent Content** (9-10) → Target: > 30%
3. **Recent Content Ratio** (< 3 months) → Target: > 20%
4. **Total Engagement** → Views + Downloads
5. **RAG Retrieval Rate** → Query history count

### Firm Benchmarks
- McKinsey/BCG/Bain → Avg Quality: 9.5+
- Deloitte/PwC/EY → Avg Quality: 8.5+
- Others → Avg Quality: 7.0+

---

## 🐛 Troubleshooting

### Issue: Auto-calculation not working
**Solution**: Check that content is being scraped successfully
```python
# Test metadata enrichment directly
from metadata_auto_calculator import enrich_metadata

metadata = {"firm": "BCG", "publication_date": "2025-01-15"}
content = "Your scraped content here..."
enriched = enrich_metadata(metadata, content)
print(enriched['quality_score'])  # Should show calculated score
```

### Issue: Frontend form not showing
**Solution**: Check import path
```typescript
import AdvancedMetadataForm from '@/components/admin/AdvancedMetadataForm';
```

### Issue: Analytics API returning errors
**Solution**: Verify Supabase connection
```typescript
// Check environment variables
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## 📚 Documentation Quick Links

**Located in**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/`

| Document | Purpose | Lines |
|----------|---------|-------|
| `COMPREHENSIVE_METADATA_GUIDE.md` | Field reference | 850+ |
| `comprehensive-knowledge-config-template.json` | JSON template | 365 |
| `SCHEMA_VISUAL_OVERVIEW.md` | Visual diagrams | 500 |
| `COMPREHENSIVE_SYSTEM_IMPLEMENTATION_COMPLETE.md` | Full summary | 450 |

---

## ✅ Health Check

Run these checks to verify everything is working:

```bash
# 1. Test Python modules
python -c "from metadata_auto_calculator import enrich_metadata; print('✅ Auto-calculator OK')"
python -c "from comprehensive_metadata_mapper import map_source_to_metadata; print('✅ Mapper OK')"

# 2. Check database
# Run this SQL in Supabase:
SELECT COUNT(*) FROM knowledge_documents; -- Should return count
SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'knowledge_documents'; -- Should return 38+

# 3. Test frontend
# Navigate to: http://localhost:3000/admin?view=knowledge-pipeline
# You should see: Upload section + Manual add form + Advanced metadata form

# 4. Test analytics API
curl http://localhost:3000/api/analytics/knowledge?range=7d&domain=all
# Should return JSON with metrics
```

---

## 🎉 You're Ready!

Your comprehensive metadata system is now **fully operational**!

**Quick Start Checklist**:
- ✅ Database with 107 fields and 38 indexes
- ✅ Python pipeline with auto-calculation
- ✅ Frontend with advanced metadata form
- ✅ Analytics dashboard (needs mounting)
- ✅ REST API endpoint
- ✅ Complete documentation

**Start Using**:
1. Go to `/admin?view=knowledge-pipeline`
2. Upload your JSON file
3. Run the pipeline
4. View analytics
5. Monitor quality trends!

---

*For detailed documentation, see `COMPREHENSIVE_METADATA_GUIDE.md`*  
*For implementation details, see `COMPREHENSIVE_SYSTEM_IMPLEMENTATION_COMPLETE.md`*  
*For visual overview, see `SCHEMA_VISUAL_OVERVIEW.md`*
