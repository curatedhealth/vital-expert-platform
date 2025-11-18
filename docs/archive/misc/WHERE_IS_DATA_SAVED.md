# 📁 Where Downloaded Data is Saved

## 📍 Default Location

When you run the Knowledge Pipeline, the scraped data is saved to:

```
/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/
```

---

## 📂 Directory Structure

The pipeline organizes content by **domain** (category):

```
scripts/knowledge/
├── healthcare/
│   └── Sharing Digital Health Educational Resources in a One-Stop Shop Portal_unknown.md
├── ai_ml_adoption/
├── ai_ml_business/
├── ai_ml_business_value/
├── ai_ml_enterprise/
├── ai_ml_implementation/
├── ai_ml_scaling/
├── ai_ml_technology/
├── ai_ml_tmt/
├── ai_ml_workplace/
├── imported/
└── pipeline_report_20251107_163114.md  (execution reports)
```

---

## 📄 File Format

Each scraped document is saved as a **Markdown (.md)** file with:

### Filename Format
```
{Title}_{content_hash}.md
```

Example:
```
Sharing Digital Health Educational Resources in a One-Stop Shop Portal_unknown.md
```

### File Contents
Each file contains:
1. **Metadata** (at the top in YAML format)
2. **Full text content** (scraped from the source)

Example:
```markdown
---
title: "Sharing Digital Health Educational Resources..."
url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10949124/"
domain: healthcare
quality_score: 5.05
credibility_score: 5.6
freshness_score: 5.0
word_count: 9892
---

# Full Content Here
...
```

---

## 📊 Pipeline Reports

After each run, a **report** is generated:

```
scripts/knowledge/pipeline_report_20251107_163114.md
```

**Contains:**
- Execution summary (duration, success rate)
- Content statistics (domains, documents, words)
- Upload results
- Failed URLs (if any)

---

## 🗂️ View Downloaded Files

### Option 1: Finder (macOS)
```bash
open "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/"
```

### Option 2: Terminal
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
ls -la
```

### Option 3: VS Code / Cursor
```bash
# Open the knowledge folder in your editor
code "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
```

---

## 🔍 Find Your Latest Files

### Most recent healthcare content:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
ls -lat healthcare/
```

### Most recent pipeline report:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
ls -lat pipeline_report_*.md | head -1
```

### Count total files:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
find . -name "*.md" -type f | wc -l
```

---

## 💾 Where Data is Also Stored

### 1. Local Files (Markdown)
**Location:** `scripts/knowledge/`
**Purpose:** Local backup, review, version control

### 2. Supabase Database
**Table:** `knowledge_documents`
**Purpose:** Structured metadata, searchable, relational
**View:** https://supabase.com → Your Project → Table Editor

### 3. Pinecone Vector Database
**Index:** `vital-knowledge`
**Purpose:** Vector embeddings for RAG/semantic search
**View:** https://app.pinecone.io → Your Index

---

## ⚙️ Change Output Directory

If you want to save to a different location, you can:

### Option 1: Update API Route
Edit `/apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts`:

```typescript
// Line 76 - Add output-dir parameter:
let command = `python3 "${pythonScript}" --config "${configPath}" --output-dir "/your/custom/path"`;
```

### Option 2: Run Python Directly
```bash
cd scripts
python3 knowledge-pipeline.py \
  --config your-config.json \
  --output-dir /your/custom/path
```

---

## 📈 Current Data Status

Based on your latest run:

**Location:** `/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/healthcare/`

**Latest File:**
- Name: `Sharing Digital Health Educational Resources in a One-Stop Shop Portal_unknown.md`
- Size: 69 KB
- Words: 9,892
- Created: Nov 7, 17:31

**Latest Report:**
- File: `pipeline_report_20251107_163114.md`
- Duration: 5.77 seconds
- Success: ✅ 1 document processed

---

## 🚀 Quick Access Commands

### Open knowledge folder:
```bash
open "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/"
```

### View latest healthcare document:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/healthcare"
ls -t | head -1 | xargs cat
```

### View latest pipeline report:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
ls -t pipeline_report_*.md | head -1 | xargs cat
```

### Count total words extracted:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge"
find . -name "*.md" -not -name "pipeline_report_*" -exec wc -w {} + | tail -1
```

---

## 🎯 Summary

**Downloaded data is saved to:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/
```

**Organized by domain:**
- `healthcare/` - Medical/health articles
- `ai_ml_*` - AI/ML related content
- `imported/` - Search imports

**File format:**
- Markdown (.md)
- Includes metadata + full content
- Named by title + hash

**Also uploaded to:**
- ✅ Supabase (metadata + content)
- ✅ Pinecone (vector embeddings)

---

**To view your downloaded files, run:**
```bash
open "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge/"
```

