# Quick UAT Testing Reference
## Screenshot Capture Checklist

---

## 🚀 **Ready to Start? Use This Quick Reference**

### **Essential Test Queries (Copy & Paste Ready):**

#### **Query 1 - Comprehensive Analysis:**
```
I need to explore digital health interventions opportunities for patients with psoriasis in Europe. Can you help me understand the market landscape, regulatory requirements, and identify the most promising DTx solutions?
```
📸 **Screenshots:** 3A-3F | ⏱️ **Expected:** <15s | 👥 **Expected Agents:** 3-4

---

#### **Query 2 - Current Solutions:**
```
What are the current digital health solutions for psoriasis management available in European markets?
```
📸 **Screenshots:** 4A-4D | ⏱️ **Expected:** <10s | 👥 **Expected Agents:** 2-3

---

#### **Query 3 - Regulatory Focus:**
```
What are the specific EMA guidelines for psoriasis digital therapeutics?
```
📸 **Screenshots:** 5A-5E | ⏱️ **Expected:** <8s | 👥 **Expected Agents:** 1 (Regulatory)

---

#### **Query 4 - RAG Test:**
```
What is the prevalence of psoriasis in Germany?
```
📸 **Screenshots:** 6A-6E | ⏱️ **Expected:** <5s | 📊 **Expected:** Statistical data

---

#### **Query 5 - Multi-Country:**
```
Compare the regulatory pathways for digital therapeutics in Germany, France, and the United Kingdom for psoriasis treatment.
```
📸 **Screenshots:** 7A-7E | ⏱️ **Expected:** <15s | 🌍 **Expected:** All 3 countries

---

#### **Query 6 - Performance Tests:**
**Short:** `Psoriasis prevalence Europe`
**Long:** `I need comprehensive analysis of digital health opportunities for psoriasis patients across European markets including regulatory frameworks, competitive landscape, clinical evidence requirements, reimbursement pathways, market access strategies, partnership opportunities, investment potential, and specific considerations for Germany, France, UK, Spain, Italy, Netherlands, and Scandinavian countries with focus on DTx solutions, mobile health applications, telemedicine platforms, AI-powered diagnosis tools, and patient engagement technologies.`

---

## 📸 **Screenshot Capture Schedule:**

### **URLs to Test:**
- `http://localhost:3000` (Homepage)
- `http://localhost:3000/chat` (Main Chat Interface)
- `http://localhost:3000/metrics` (Metrics Dashboard)

### **Screenshot List (52 Total):**
```
✅ 1A: Terminal - npm run dev
✅ 1B: Homepage loading
✅ 2A: Chat interface
✅ 2B: Metrics dashboard
✅ 3A-3F: Query 1 (6 shots)
✅ 4A-4D: Query 2 (4 shots)
✅ 5A-5E: Query 3 (5 shots)
✅ 6A-6E: Query 4 (5 shots)
✅ 7A-7E: Query 5 (5 shots)
✅ 8A-8D: Performance tests (4 shots)
✅ 9A-9F: Metrics review (6 shots)
✅ 10A-10E: Error handling (5 shots)
✅ 11A-11F: User journey (6 shots)
✅ 12A-12D: Final summary (4 shots)
```

---

## ⚡ **Critical Validation Points:**

### **For Each Query Response, Verify:**
- [ ] **Response Time:** Under expected threshold
- [ ] **Agent Selection:** Appropriate for query type
- [ ] **Content Quality:** Professional, healthcare-focused
- [ ] **European Context:** Geographic awareness shown
- [ ] **Psoriasis Focus:** Medical condition properly addressed
- [ ] **Action Items:** Practical recommendations provided

### **Technical Checks:**
- [ ] **No Console Errors:** F12 → Console clean
- [ ] **Responsive UI:** Interface adapts properly
- [ ] **Navigation Works:** All links/buttons functional
- [ ] **Loading States:** Proper feedback during processing
- [ ] **Data Persistence:** Conversation history maintained

---

## 🎯 **Success Criteria Quick Check:**

| Metric | Target | Actual | Status |
|--------|--------|---------|---------|
| Response Time | <15s | ___s | ☐ Pass ☐ Fail |
| Agent Accuracy | >90% | ___% | ☐ Pass ☐ Fail |
| Content Quality | Professional | ___ | ☐ Pass ☐ Fail |
| Error Rate | 0% | ___% | ☐ Pass ☐ Fail |
| UI Responsiveness | Smooth | ___ | ☐ Pass ☐ Fail |

---

## 📱 **Screenshot Organization:**

### **Folder Structure:**
```
UAT_Screenshots/
├── 01_Setup/          (1A, 1B)
├── 02_Interfaces/     (2A, 2B)
├── 03_Query1/         (3A-3F)
├── 04_Query2/         (4A-4D)
├── 05_Query3/         (5A-5E)
├── 06_Query4/         (6A-6E)
├── 07_Query5/         (7A-7E)
├── 08_Performance/    (8A-8D)
├── 09_Metrics/        (9A-9F)
├── 10_ErrorHandling/  (10A-10E)
├── 11_UserJourney/    (11A-11F)
└── 12_Summary/        (12A-12D)
```

### **Naming Convention:**
`UAT_[STEP][LETTER]_[DESCRIPTION].png`
Example: `UAT_03A_Query_Entered.png`

---

## ⏰ **Estimated Testing Time:**
- **Setup & Environment:** 5 minutes
- **Core Test Queries:** 15 minutes
- **Performance Tests:** 10 minutes
- **Error Handling:** 10 minutes
- **Documentation:** 10 minutes
- **Total:** ~50 minutes

---

## 🔄 **Testing Flow:**
1. **Start** → Verify environment (Screenshots 1A-2B)
2. **Execute** → Run all 5 main queries (Screenshots 3A-7E)
3. **Performance** → Test limits and speed (Screenshots 8A-8D)
4. **Monitor** → Check metrics dashboard (Screenshots 9A-9F)
5. **Edge Cases** → Test error handling (Screenshots 10A-10E)
6. **Journey** → Test realistic flow (Screenshots 11A-11F)
7. **Document** → Final summary (Screenshots 12A-12D)

---

## 📧 **Share Results:**
After capturing all screenshots, please share:
1. **Screenshot folder** (organized as above)
2. **Completed validation checklist**
3. **Performance timings** for each query
4. **Any issues or observations** encountered
5. **Overall assessment** of system readiness

**Ready to start testing! 🚀**