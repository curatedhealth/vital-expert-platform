# 🚀 Queue System Quick Start

## 3-Step Usage

### 1️⃣ Upload Sources
```
Navigate: /admin?view=knowledge-pipeline
Tab: "Configuration"
Action: Upload JSON file or add manually
Result: Sources appear in config
```

### 2️⃣ View Queue
```
Tab: "Queue (13)"
See: All sources with status, firm, type
Stats: 0/13 processed, 0K words
```

### 3️⃣ Execute
```
Option A: Click "Run All (13)" → Process all
Option B: Click ▶️ on one → Test individual
Option C: Enable "Dry Run" → Test without upload
```

---

## Key Benefits

| Feature | Before | After |
|---------|--------|-------|
| **Timeout** | All fail | Only 1 fails |
| **Progress** | Unknown | Real-time per source |
| **Recovery** | Start over | Retry only failed |
| **Control** | All or nothing | Individual or batch |
| **Visibility** | Black box | Full transparency |

---

## Button Reference

### Queue Tab Buttons

| Button | Location | Action |
|--------|----------|--------|
| `▶️ Run All (N)` | Top right | Process all pending sources |
| `▶️` (small) | Per source | Run this source only |
| `🔄` (retry) | Failed sources | Retry this source |
| `🗑️ Clear Queue` | Top right | Remove all sources |
| `🔘 Dry Run` | Config tab | Toggle test mode |

---

## Status Colors

```
📄 Gray   → Pending (ready to run)
⏳ Blue   → Processing (running now)
✅ Green  → Success (completed, words shown)
❌ Red    → Failed (error shown, can retry)
```

---

## Typical Workflow

```
1. Upload: genai_consulting_reports.json
   → 13 sources added to queue

2. Test One:
   → Enable "Dry Run"
   → Click ▶️ on BCG source
   → See "3,245 words" in ~12s
   → Confidence boost!

3. Run All:
   → Disable "Dry Run"
   → Click "Run All (13)"
   → Watch real-time progress
   → 11 success, 2 failed

4. Retry Failed:
   → Click 🔄 on 2 failed sources
   → Both retry automatically
   → Final: 13/13 success!

5. Results:
   → 95,342 total words extracted
   → Content in Supabase & Pinecone
   → Ready for RAG queries!
```

---

## Troubleshooting

**Q: Source stuck "Processing"?**  
A: Refresh page. If >3 mins, retry.

**Q: All sources failing?**  
A: Check network, verify SSL fix applied.

**Q: 0 words extracted?**  
A: Check error message, may need Playwright for JS sites.

**Q: Want to pause?**  
A: Refresh page. Completed sources are saved.

---

## Pro Tips

1. **Always test one first** → Validate before running all
2. **Use dry run** → Check quality without uploading
3. **Process in batches** → 10-20 at a time for safety
4. **Check errors** → Don't blindly retry, fix issues
5. **Prioritize important** → Run critical sources first

---

**That's it! Start with Configuration tab, switch to Queue tab, and run!** 🎉

*Your pipeline now has enterprise-grade reliability and control.*

