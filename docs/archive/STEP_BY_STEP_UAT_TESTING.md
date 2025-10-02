# Step-by-Step UAT Testing Document
## Psoriasis Digital Health User Story - Screenshot Capture Guide

---

## 📋 **Pre-Testing Setup**

### **STEP 1: Environment Verification**
**Action:** Verify the development environment is ready
**Screenshots to Capture:**
1. **Screenshot 1A**: Terminal showing `npm run dev` command running successfully
image.png![alt text](<../../../Library/Group Containers/group.com.apple.notes/Accounts/CFAD6D97-9027-4DA4-A73E-A1140FEBE71F/Media/EE8AF9E6-2A61-4485-970E-3ED5D0B65845/1_AC1EBFB6-41CA-4AAC-945D-34700EA343EC/Pasted Graphic.png>)
2. **Screenshot 1B**: Browser showing `http://localhost:3000` homepage loading
![alt text](<Transform Your Team with Al-Powered.png>)

**Validation Points:**
- [x ] No error messages in terminal
- [x ] Homepage loads without console errors
- [ x] Navigation menu visible and functional

---

### **STEP 2: Initial System Check**
**Action:** Navigate to both main interfaces
**Screenshots to Capture:**
3. **Screenshot 2A**: Chat interface at `http://localhost:3000/chat` - full page
![alt text](<Pasted Graphic 3.png>)
The layout should allow to see the full chat page, ideally all 4 options should be displayed in one row.
4. **Screenshot 2B**: Metrics dashboard at `http://localhost:3000/metrics` - full page
![alt text](-.png)
Page not loading


**Validation Points:**
- [0] Chat interface displays properly with input field
- [0] Metrics dashboard shows system health indicators
- [x] No JavaScript errors in browser console (F12)
![alt text](<Pasted Graphic 5.png>)

---

## 🤖 **TEST SCENARIO 1: Automatic Agent Selection - Comprehensive Analysis**

### **STEP 3: Primary Test Query**
**Action:** Enter the comprehensive psoriasis query
**Query to Enter:**
```
I need to explore digital health interventions opportunities for patients with psoriasis in Europe. Can you help me understand the market landscape, regulatory requirements, and identify the most promising DTx solutions?
```

**Screenshots to Capture:**
5. **Screenshot 3A**: Chat interface with query entered (before sending)
![alt text](<Pasted Graphic 6.png>)

6. **Screenshot 3B**: System processing/thinking indicator (if visible)
![alt text](<Pasted Graphic 7.png>)

7. **Screenshot 3C**: Agent selection panel (if agents are displayed during processing)
![alt text](<Pasted Graphic 8.png>)

8. **Screenshot 3D**: Complete response - full conversation view
![alt text](<Pasted Graphic 9.png>)

9. **Screenshot 3E**: Agent panel showing which agents were selected
![alt text](<Pasted Graphic 10.png>)

10. **Screenshot 3F**: Artifacts panel (if any content generated)

**Validation Points to Document:**
- [ x] Query processes within 15 seconds
- [ x] Multiple agents selected (note which ones)
- [0 ] Response mentions "psoriasis" and "Europe"
- [ 0] Response includes market analysis content
- [ 0] Response includes regulatory information
- [ 0] Response mentions DTx or digital therapeutics
- [ 0] Professional healthcare tone maintained
- [ 0] Action items or recommendations provided

**Data to Record:**
- **Response Time:** _____ seconds
- **Agents Selected:** _____________________
- **Response Length:** _____ characters
- **Key Topics Covered:** _____________________

---

## 🎯 **TEST SCENARIO 2: Focused Digital Health Query**

### **STEP 4: Current Solutions Query**
**Action:** Test a more focused query
**Query to Enter:**
```
What are the current digital health solutions for psoriasis management available in European markets?
```

**Screenshots to Capture:**
11. **Screenshot 4A**: New query entered in chat
12. **Screenshot 4B**: Agent selection during processing
13. **Screenshot 4C**: Complete response showing current solutions
14. **Screenshot 4D**: Any visual elements (lists, bullets, formatting)

**Validation Points to Document:**
- [ ] Different agent selection than previous query
- [ ] Response focuses on existing solutions
- [ ] Mentions specific European markets
- [ ] Lists actual digital health products/apps
- [ ] Includes competitive analysis elements

**Data to Record:**
- **Response Time:** _____ seconds
- **Agents Selected:** _____________________
- **Solutions Mentioned:** _____________________

---

## 👤 **TEST SCENARIO 3: Manual Agent Selection**

### **STEP 5: Manual Selection Test**
**Action:** Test manual agent selection (if interface supports it)
**Query to Enter:**
```
What are the specific EMA guidelines for psoriasis digital therapeutics?
```

**Screenshots to Capture:**
15. **Screenshot 5A**: Manual agent selection interface (if available)
16. **Screenshot 5B**: Selecting "Regulatory Affairs Specialist" manually
17. **Screenshot 5C**: Query processing with manually selected agent
18. **Screenshot 5D**: Regulatory-focused response
19. **Screenshot 5E**: Agent attribution showing only selected agent

**Validation Points to Document:**
- [ ] Manual selection overrides automatic selection
- [ ] Response focuses purely on regulatory content
- [ ] Mentions EMA specifically
- [ ] Includes specific guidelines or requirements
- [ ] No market or clinical content mixed in
- [ ] Professional regulatory language used

**Data to Record:**
- **Manual Selection Available:** Yes/No
- **Selected Agent:** _____________________
- **Response Focus:** _____________________

---

## 📚 **TEST SCENARIO 4: RAG Integration Test**

### **STEP 6: Data-Specific Query**
**Action:** Test RAG system with fact-based query
**Query to Enter:**
```
What is the prevalence of psoriasis in Germany?
```

**Screenshots to Capture:**
20. **Screenshot 6A**: Fact-based query entered
21. **Screenshot 6B**: RAG processing indicator (if visible)
22. **Screenshot 6C**: Response with statistical data
23. **Screenshot 6D**: Source attribution (if shown)
24. **Screenshot 6E**: Any additional context provided

**Validation Points to Document:**
- [ ] Response includes specific prevalence data
- [ ] Mentions Germany specifically
- [ ] Provides numerical statistics
- [ ] Includes source attribution
- [ ] Agent selected appropriately for data query
- [ ] Response is factual, not speculative

**Data to Record:**
- **Prevalence Data Provided:** _____________________
- **Sources Mentioned:** _____________________
- **Agent Selected:** _____________________

---

## 🔧 **TEST SCENARIO 5: Complex Multi-Country Query**

### **STEP 7: Geographic Complexity Test**
**Action:** Test handling of multiple European countries
**Query to Enter:**
```
Compare the regulatory pathways for digital therapeutics in Germany, France, and the United Kingdom for psoriasis treatment.
```

**Screenshots to Capture:**
25. **Screenshot 7A**: Complex multi-country query
26. **Screenshot 7B**: Processing multiple geographic contexts
27. **Screenshot 7C**: Comparative analysis response
28. **Screenshot 7D**: Country-specific information display
29. **Screenshot 7E**: Any structured formatting (tables, lists)

**Validation Points to Document:**
- [ ] All three countries addressed
- [ ] Country-specific regulatory information
- [ ] Comparative analysis provided
- [ ] Mentions DiGA (Germany), specific frameworks
- [ ] Post-Brexit UK considerations addressed
- [ ] Response well-structured and organized

**Data to Record:**
- **Countries Covered:** _____________________
- **Regulatory Frameworks Mentioned:** _____________________
- **Comparison Quality:** _____________________

---

## ⚡ **TEST SCENARIO 6: Performance and Error Testing**

### **STEP 8: Performance Validation**
**Action:** Test system performance and limits
**Queries to Test:**
1. **Short Query:** `Psoriasis prevalence Europe`
2. **Very Long Query:** `[Create a 500+ word query about psoriasis digital health opportunities, regulatory landscapes, market dynamics, competitive analysis, clinical evidence requirements, reimbursement pathways, patient outcomes, technology integration, partnership opportunities, and investment potential across European markets including Germany, France, UK, Spain, Italy, Netherlands, and Scandinavia]`

**Screenshots to Capture:**
30. **Screenshot 8A**: Short query response time
31. **Screenshot 8B**: Long query processing
32. **Screenshot 8C**: Long query response handling
33. **Screenshot 8D**: System performance during processing

**Validation Points to Document:**
- [ ] Short queries respond quickly (< 5 seconds)
- [ ] Long queries handle gracefully (< 20 seconds)
- [ ] No timeout errors
- [ ] System remains responsive
- [ ] Quality maintained regardless of query length

---

## 📊 **TEST SCENARIO 7: Metrics Dashboard Validation**

### **STEP 9: Metrics Review**
**Action:** Review system metrics after all tests
**Screenshots to Capture:**
34. **Screenshot 9A**: Metrics dashboard overview
35. **Screenshot 9B**: System health indicators
36. **Screenshot 9C**: Performance metrics
37. **Screenshot 9D**: Alert status (if any)
38. **Screenshot 9E**: Usage statistics
39. **Screenshot 9F**: Agent utilization metrics

**Validation Points to Document:**
- [ ] All tests tracked in metrics
- [ ] Response times logged correctly
- [ ] Agent selection patterns visible
- [ ] No critical alerts generated
- [ ] System health remains green
- [ ] Performance trends within acceptable ranges

---

## 🔍 **TEST SCENARIO 8: Edge Cases and Error Handling**

### **STEP 10: Error Handling Test**
**Action:** Test system robustness
**Test Cases:**
1. **Empty Query:** Submit empty message
2. **Special Characters:** `What about ψ (psoriasis) in 🇪🇺 Europe? #DTx @EMA`
3. **Non-Medical Query:** `What's the weather like today?`
4. **Nonsense Query:** `Asdfgh qwerty psoriasis zxcvbn`

**Screenshots to Capture:**
40. **Screenshot 10A**: Empty query handling
41. **Screenshot 10B**: Special characters processing
42. **Screenshot 10C**: Non-medical query response
43. **Screenshot 10D**: Nonsense query handling
44. **Screenshot 10E**: Error messages (if any)

**Validation Points to Document:**
- [ ] Empty queries handled gracefully
- [ ] Special characters don't break system
- [ ] Non-medical queries redirected appropriately
- [ ] Nonsense queries handled professionally
- [ ] Appropriate error messages shown
- [ ] System recovers from errors

---

## 🎮 **TEST SCENARIO 9: User Experience Flow**

### **STEP 11: Complete User Journey**
**Action:** Simulate realistic user behavior
**Journey Steps:**
1. Start with broad question
2. Ask follow-up questions
3. Request specific details
4. Switch between topics
5. Return to previous topic

**Sample Flow:**
```
Query 1: "I'm interested in psoriasis digital health opportunities in Europe"
[Wait for response]
Query 2: "Tell me more about the German market specifically"
[Wait for response]
Query 3: "What about France and the UK?"
[Wait for response]
Query 4: "Let's go back to Germany - what are the specific DiGA requirements?"
```

**Screenshots to Capture:**
45. **Screenshot 11A**: Conversation flow - Query 1 & Response
46. **Screenshot 11B**: Conversation flow - Query 2 & Response
47. **Screenshot 11C**: Conversation flow - Query 3 & Response
48. **Screenshot 11D**: Conversation flow - Query 4 & Response
49. **Screenshot 11E**: Complete conversation history
50. **Screenshot 11F**: Context awareness demonstration

**Validation Points to Document:**
- [ ] Context maintained across queries
- [ ] Follow-up questions understood
- [ ] Conversation flows naturally
- [ ] Previous context referenced when relevant
- [ ] Topic transitions handled smoothly
- [ ] User intent correctly interpreted

---

## 📝 **Final Documentation**

### **STEP 12: Complete Test Summary**
**Action:** Document overall findings
**Screenshots to Capture:**
51. **Screenshot 12A**: Final metrics dashboard state
52. **Screenshot 12B**: Complete conversation history
53. **Screenshot 12C**: Browser console (F12) - check for errors
54. **Screenshot 12D**: Terminal output final state

**Summary Data to Record:**
- **Total Test Duration:** _____ minutes
- **Total Queries Tested:** _____
- **Successful Responses:** _____
- **Failed Responses:** _____
- **Average Response Time:** _____ seconds
- **Agents Most Frequently Selected:** _____________________
- **Overall System Stability:** Excellent/Good/Fair/Poor

---

## 📊 **Screenshot Organization Template**

### **Naming Convention:**
- `UAT_01A_Environment_Setup.png`
- `UAT_03B_Agent_Processing.png`
- `UAT_06C_RAG_Response.png`
- etc.

### **Required Screenshot Metadata:**
For each screenshot, document:
- **Time Stamp:** When captured
- **Test Scenario:** Which test this relates to
- **Browser Used:** Chrome/Firefox/Safari/Edge
- **Screen Resolution:** e.g., 1920x1080
- **Key Observations:** What to look for in the screenshot
- **Validation Status:** Pass/Fail/Needs Review

---

## ✅ **Validation Summary Template**

### **Test Results Summary:**
```
TEST SCENARIO 1: Automatic Agent Selection
Status: [ ] Pass [ ] Fail [ ] Needs Review
Key Issues: _____________________
Screenshot References: UAT_03A through UAT_03F

TEST SCENARIO 2: Focused Digital Health Query
Status: [ ] Pass [ ] Fail [ ] Needs Review
Key Issues: _____________________
Screenshot References: UAT_04A through UAT_04D

[Continue for all scenarios...]
```

### **Critical Issues Log:**
- **Issue #1:** Description, Severity (Critical/High/Medium/Low), Screenshot Reference
- **Issue #2:** Description, Severity, Screenshot Reference
- etc.

### **Recommendations:**
- **Immediate Actions:** What needs to be fixed before go-live
- **Future Enhancements:** What could be improved
- **Performance Optimizations:** What could be faster

---

## 🔄 **Review Process**

### **For Each Screenshot:**
1. **Verify all elements are visible**
2. **Check for UI consistency**
3. **Validate data accuracy**
4. **Confirm professional appearance**
5. **Note any anomalies**

### **Overall Assessment Criteria:**
- **Functionality:** Does it work as expected?
- **Performance:** Is it fast enough?
- **Usability:** Is it easy to use?
- **Accuracy:** Is the information correct?
- **Professional:** Does it look/feel professional for healthcare?

---

**📧 After completing all tests, please share the screenshots and validation results for comprehensive review and analysis.**