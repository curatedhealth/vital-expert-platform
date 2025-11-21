# 🎯 Knowledge Pipeline - Quick Reference Card

## ⚡ Quick Access

### Navigate to Knowledge Pipeline
```
Method 1: Admin → Sidebar → AI Resources → Knowledge Pipeline
Method 2: Direct URL → /admin?view=knowledge-pipeline
Method 3: Top Nav → Admin → Sidebar → Knowledge Pipeline
```

---

## 🚀 Quick Actions

### Upload & Run (2 Steps)
1. **Upload JSON** → Click file upload area
2. **Run Pipeline** → Click big blue "Run Pipeline" button
✅ Done!

### Test First (3 Steps)
1. **Upload JSON** → Import sources
2. **Enable Dry Run** → Toggle ON
3. **Run Pipeline** → Click button
✅ Safe test!

---

## 📦 Input File Format

### Minimal JSON
```json
{
  "sources": [
    {
      "url": "https://example.com/report.pdf",
      "domain": "ai_ml_healthcare",
      "firm": "McKinsey"
    }
  ]
}
```

### With Metadata
```json
{
  "sources": [
    {
      "url": "https://example.com/report.pdf",
      "domain": "ai_ml_healthcare",
      "firm": "McKinsey",
      "report_type": "industry_report",
      "publication_date": "2024-11-01",
      "tags": ["AI", "healthcare", "strategy"],
      "priority": "high"
    }
  ]
}
```

---

## 🎯 30 Healthcare Domains

### Tier 1 (Core) - 15 Domains
- Regulatory Affairs
- Clinical Development
- Pharmacovigilance
- Quality Assurance
- Medical Affairs
- Drug Safety
- Clinical Operations
- Medical Writing
- Biostatistics
- Data Management
- Translational Medicine
- Market Access
- Labeling & Advertising
- Post-Market Surveillance
- Patient Engagement

### Tier 2 (Specialized) - 10 Domains
- Scientific Publications
- Nonclinical Sciences
- Risk Management
- Submissions & Filings
- Health Economics
- Medical Devices
- Bioinformatics
- Companion Diagnostics
- Regulatory Intelligence
- Lifecycle Management

### Tier 3 (Emerging) - 5 Domains
- Digital Health
- Precision Medicine
- AI/ML in Healthcare
- Telemedicine
- Sustainability

---

## 🎨 UI Elements

### Status Colors
- 🔵 **Blue** = Ready / Info
- 🟢 **Green** = Success
- 🔴 **Red** = Error
- 🟠 **Orange** = Warning

### Button States
- ▶️ **Run Pipeline** = Ready to execute
- ⏳ **Running...** = Executing (disabled)
- ✅ **Success** = Completed successfully
- ❌ **Error** = Failed (retry available)

---

## 🔧 Common Tasks

### Add Single Source
1. Scroll to "Add Source Manually"
2. Fill in URL and domain
3. Add tags (comma-separated)
4. Click "Add Source"

### Export Configuration
1. Click "Export JSON" button
2. Save file to disk
3. Share with team or backup

### Remove Source
1. Find source in list
2. Click trash icon (🗑️)
3. Confirm removal

### View Results
1. Wait for pipeline completion
2. Click "View Output Log" (expandable)
3. Review scraped content and stats

---

## 📊 Pipeline Modes

### Full Execution (Default)
- Scrapes content ✅
- Processes metadata ✅
- Uploads to Supabase ✅
- Uploads to Pinecone ✅
- Generates report ✅

### Dry Run Mode
- Scrapes content ✅
- Processes metadata ✅
- Uploads to Supabase ❌
- Uploads to Pinecone ❌
- Generates report ✅

---

## 🐛 Troubleshooting

### "No sources configured"
**Fix**: Upload JSON or add sources manually

### "Pipeline execution failed"
**Fix**: Check output log for details, verify URLs are accessible

### "Python not available"
**Fix**: Install Python 3.8+ and dependencies:
```bash
cd scripts
pip install -r requirements.txt
```

### "Timeout error"
**Fix**: Reduce number of sources or increase timeout in API route

### File upload does nothing
**Fix**: Check console for errors, verify JSON format

---

## 📚 Key Documentation

### Getting Started
- `QUICK_START_GUIDE.md` - 5-minute setup
- `KNOWLEDGE_PIPELINE_COMPLETE_SYSTEM_SUMMARY.md` - Full overview

### Configuration
- `scripts/JSON_STRUCTURE_GUIDE.md` - Input format
- `scripts/COMPREHENSIVE_METADATA_GUIDE.md` - All fields

### Development
- `scripts/KNOWLEDGE_PIPELINE_README.md` - Pipeline details
- `tests/TESTING_GUIDE.md` - Running tests

---

## ⚙️ Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Optional
```bash
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment
```

---

## 🎯 Best Practices

### 1. Start Small
Test with 2-3 sources before scaling up

### 2. Use Dry Run
Always test new configurations with dry run first

### 3. Monitor Logs
Check output logs for warnings or issues

### 4. Backup Configs
Export JSON configurations regularly

### 5. Review Metadata
Verify quality scores and metadata accuracy

---

## 📞 Support & Resources

### Documentation Location
`/Users/hichamnaim/Downloads/Cursor/VITAL path/`

### Key Files
- Python script: `scripts/knowledge-pipeline.py`
- Frontend: `apps/.../components/admin/KnowledgePipelineConfig.tsx`
- API: `apps/.../app/api/pipeline/run/route.ts`

### Testing
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
./scripts/run-tests.sh
```

---

## ⚡ Keyboard Shortcuts

### Navigation
- `Ctrl/Cmd + K` → Quick search
- `Esc` → Close modals
- `Enter` → Submit forms

### Actions
- Click "Run Pipeline" → Execute
- Click tag → Remove tag
- Click source → View details

---

## 🎉 Success Indicators

### ✅ Ready to Run
- Blue card visible
- Source count shown
- Button enabled

### ⏳ Running
- Spinner animation
- Button disabled
- "Running..." text

### ✅ Success
- Green alert shown
- Output log available
- Stats displayed

### ❌ Error
- Red alert shown
- Error message displayed
- Retry available

---

## 🔢 Quick Stats

**Total Features**: 50+  
**Metadata Fields**: 107  
**Supported Domains**: 30  
**File Formats**: 3 (JSON, CSV, MD)  
**Embedding Models**: 10+  
**Test Coverage**: 85%  
**Documentation**: 14 guides  

---

## 🏆 System Capabilities

✅ Scrape any web content  
✅ Process PDFs automatically  
✅ Auto-calculate 85+ metadata fields  
✅ Support 30 healthcare domains  
✅ Handle hundreds of sources  
✅ Real-time execution feedback  
✅ Export/import configurations  
✅ Analytics and insights  
✅ Production-ready security  
✅ Comprehensive error handling  

---

## 📱 Where to Find It

### Sidebar (Always Visible)
```
Admin Sidebar
└── 🤖 AI Resources
    └── 🗄️ Knowledge Pipeline  ← HERE!
```

### Direct Access
```
URL: /admin?view=knowledge-pipeline
```

### Top Navigation
```
Header Bar → Admin → Sidebar → Knowledge Pipeline
```

---

*Quick Reference v1.0 - November 5, 2025*  
*For complete documentation, see KNOWLEDGE_PIPELINE_COMPLETE_SYSTEM_SUMMARY.md*

