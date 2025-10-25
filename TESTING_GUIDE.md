# Ask Expert UI/UX - Testing Guide

**Status:** ✅ Dev server running at http://localhost:3000
**Test URL:** http://localhost:3000/ask-expert/beta

---

## 🚀 Server Status

✅ **Dev Server Running**
- Local: http://localhost:3000
- Beta Page: http://localhost:3000/ask-expert/beta
- Original Page: http://localhost:3000/ask-expert (unchanged)

✅ **Dependencies Installed**
- react-syntax-highlighter
- remark-gfm
- react-markdown

✅ **TypeScript Verified**
- No errors in Ask Expert components

---

## 🧪 Step-by-Step Testing Workflow

### 1. Open the Beta Page

Navigate to: **http://localhost:3000/ask-expert/beta**

You should see:
- ✅ Page loads without errors
- ✅ Sidebar on the left (IntelligentSidebar)
- ✅ Main content area with tabs (Setup/Chat)
- ✅ "Ask VITAL Expert" header

---

### 2. Test Setup Tab - Mode Selection

**Component:** EnhancedModeSelector

**Actions:**
1. ✅ You should see 5 consultation modes displayed as cards
2. ✅ Each card should have:
   - Icon with gradient background
   - Mode name and description
   - Features list
   - "Best for" section
   - Response time estimate
   - Expert count
3. ✅ Click on different mode cards - should highlight selected
4. ✅ Toggle view button (top right) - switch between "Cards" and "Comparison"
5. ✅ In Comparison view, see all modes in a table

**Expected Modes:**
- 🟡 Quick Expert Consensus (mode-1-query-automatic)
- 🔵 Targeted Expert Query (mode-2-query-manual)
- 🟢 Interactive Expert Discussion (mode-3-chat-automatic)
- 🟣 Dedicated Expert Session (mode-4-chat-manual)
- 🔴 Autonomous Agent Workflow (mode-5-agent-autonomous)

---

### 3. Test Setup Tab - Agent Selection

**Component:** ExpertAgentCard

**Actions:**
1. ✅ Scroll down to see agent grid (3 columns)
2. ✅ Each agent card should display:
   - Avatar with gradient background
   - Name and specialty
   - Description
   - Expertise tags (badges)
   - Availability status with pulse (online/busy/offline)
   - Performance metrics:
     - Response time (~25 sec)
     - Total consultations (100+)
     - Satisfaction score (4.5-5.0 stars)
     - Success rate (85-100%)
3. ✅ Click on an agent card - should:
   - Highlight the selected agent
   - Show agent info in header
   - **Auto-switch to Chat tab**

---

### 4. Test Chat Tab - Message Input

**Component:** NextGenChatInput

**Actions:**
1. ✅ You should see the chat input at the bottom
2. ✅ Test the toolbar buttons:
   - 🎤 Voice input button (may request mic permission)
   - 📎 Attachment button
   - 💡 Suggestions indicator
3. ✅ Type a message (e.g., "What are the FDA 510(k) requirements?")
4. ✅ Watch token estimation update as you type
   - Green < 500 tokens
   - Yellow 500-1000 tokens
   - Red > 1000 tokens
5. ✅ See character count (e.g., "45/4000")
6. ✅ Click Send button or press Enter

---

### 5. Test Streaming Visualization

**Component:** AdvancedStreamingWindow

**Actions:**
1. ✅ After sending message, streaming window should appear
2. ✅ Watch workflow steps progress:
   - Step 1: "Context Retrieval" (0% → 100%)
   - Step 2: "Expert Analysis" (0% → 100%)
3. ✅ See status icons change:
   - ⏳ Pending (clock)
   - 🔄 Running (spinner)
   - ✅ Completed (check)
4. ✅ Watch "Live AI Reasoning" section:
   - 💭 Thought: "Analyzing user query..."
   - ⚡ Action: "Searching FDA database..."
   - 👁️ Observation: "Found 3 relevant predicates..."
5. ✅ See performance metrics update:
   - Tokens generated: increasing
   - Tokens/second: ~40-50
   - Elapsed time: counting up
6. ✅ Test pause/resume buttons (if visible)

---

### 6. Test Message Display

**Component:** EnhancedMessageDisplay

**Actions:**
1. ✅ After streaming completes, see formatted message
2. ✅ Verify markdown rendering:
   - Headers (## Regulatory Requirements)
   - Lists (1. 2. 3.)
   - Bold text (**Predicate Device**)
   - Code blocks with syntax highlighting
3. ✅ Test inline citations:
   - Click [1] or [2] in message
   - Should scroll to source at bottom
4. ✅ Expand "Show Reasoning" section:
   - See 3 reasoning steps
   - Analysis → Synthesis → Recommendation
5. ✅ Expand "Show Sources" section:
   - See 2 source cards
   - Each with title, URL, excerpt, similarity score
6. ✅ Test message actions (hover over message):
   - 📋 Copy button
   - 🔄 Regenerate button
   - 👍👎 Feedback buttons
   - ✏️ Edit button
7. ✅ Verify token usage display at bottom

---

### 7. Test Document Generator

**Component:** InlineDocumentGenerator

**Actions:**
1. ✅ Click "Show Document Generator" button
2. ✅ See document generator panel appear
3. ✅ Switch between "Template" and "Preview" tabs
4. ✅ In Template tab:
   - See 6 document templates in grid
   - Each with icon, name, description, time estimate
5. ✅ Select a template (e.g., "Regulatory Submission Summary")
6. ✅ Choose export format:
   - PDF
   - DOCX
   - XLSX
   - Markdown
7. ✅ Click "Generate Document" button
8. ✅ Watch generation progress:
   - Step 1: Analyzing conversation
   - Step 2: Extracting key points
   - Step 3: Formatting document
   - Step 4: Finalizing
9. ✅ Switch to Preview tab:
   - See document metadata
   - Pages, word count, file size
10. ✅ Click "Download" button (mock download)

**Templates Available:**
- 📄 Regulatory Submission Summary
- 🔬 Clinical Protocol
- 📊 Market Analysis Report
- ⚠️ Risk Assessment
- 📝 Executive Summary
- 📚 Training Material

---

### 8. Test Sidebar

**Component:** IntelligentSidebar

**Actions:**
1. ✅ Look at left sidebar
2. ✅ Test tabs:
   - 📋 Recent - see conversation list
   - ⭐ Bookmarked - see bookmarked conversations
   - 📊 Stats - see session statistics
3. ✅ In Recent tab:
   - See conversations grouped by time
     - Today
     - Yesterday
     - This Week
     - Older
   - Each conversation shows:
     - Title
     - Preview text
     - Agent name
     - Message count
     - Tags
4. ✅ Test search bar:
   - Type to filter conversations
   - Results update in real-time
5. ✅ Test mode filter dropdown:
   - Filter by consultation mode
6. ✅ Test conversation actions (hover):
   - ⭐ Bookmark
   - 🔗 Share
   - 🗑️ Delete
7. ✅ In Stats tab, verify:
   - Total conversations count
   - Total messages count
   - Total duration (formatted: "5h 10m")
   - Most used mode
   - Most contacted agent
8. ✅ Click "New Conversation" button:
   - Should reset to Setup tab

---

### 9. Test Voice Input (Optional)

**Component:** NextGenChatInput (Voice Feature)

**Actions:**
1. ✅ Click microphone button in input area
2. ✅ Browser requests microphone permission - allow
3. ✅ See recording indicator:
   - Red pulsing circle
   - "Listening..." text
4. ✅ Speak into microphone
5. ✅ See transcription appear in input field
6. ✅ Click microphone again to stop

**Note:** Voice input uses browser Web Speech API and may not work in all browsers.

---

### 10. Test File Attachments (Optional)

**Component:** NextGenChatInput (Attachment Feature)

**Actions:**
1. ✅ Click attachment button (📎)
2. ✅ Select a file (image, PDF, or document)
3. ✅ See upload progress bar
4. ✅ See file preview appear below input
5. ✅ Click X to remove attachment

**Supported Files:**
- Images: JPEG, PNG, GIF, WebP (max 10MB)
- Documents: PDF (max 10MB)

---

## 📱 Responsive Design Testing

### Desktop (1920x1080)
1. ✅ Sidebar visible
2. ✅ Agent grid: 3 columns
3. ✅ Mode cards: 2-3 per row
4. ✅ All features accessible

### Laptop (1366x768)
1. ✅ Sidebar visible
2. ✅ Agent grid: 2-3 columns
3. ✅ Mode cards: 2 per row

### Tablet (768x1024)
1. ✅ Sidebar may collapse to icon
2. ✅ Agent grid: 2 columns
3. ✅ Mode cards: 1-2 per row

### Mobile (375x667)
1. ✅ Sidebar hidden (hamburger menu)
2. ✅ Agent grid: 1 column
3. ✅ Mode cards: 1 per row
4. ✅ Input toolbar responsive

**Test by resizing browser window or using Chrome DevTools device mode**

---

## 🐛 Common Issues & Solutions

### Issue: Page doesn't load
**Solution:**
- Check browser console (F12)
- Verify dev server is running
- Refresh page (Cmd/Ctrl + Shift + R)

### Issue: Components not rendering
**Solution:**
- Check browser console for import errors
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Verify all dependencies installed

### Issue: Styles look broken
**Solution:**
- Check if Tailwind CSS is working
- Verify shadcn/ui components installed
- Hard refresh browser

### Issue: Voice input not working
**Solution:**
- Check browser compatibility (Chrome/Edge work best)
- Ensure microphone permission granted
- Try HTTPS instead of HTTP (some browsers require)

### Issue: Streaming doesn't work
**Solution:**
- This is expected - streaming is simulated
- Real streaming requires backend SSE implementation

---

## ✅ Success Checklist

### Minimum Viable
- [ ] Page loads without errors
- [ ] All 7 components render
- [ ] Mode selection works
- [ ] Agent selection works
- [ ] Can send a message
- [ ] Message displays with formatting
- [ ] No console errors

### Full Feature
- [ ] Streaming window shows workflow
- [ ] Reasoning steps display
- [ ] Citations are clickable
- [ ] Sources expand correctly
- [ ] Document generator opens
- [ ] Sidebar search works
- [ ] Voice input works (if browser supports)
- [ ] File attachments work
- [ ] Responsive on mobile

---

## 📊 Expected Behavior Summary

| Feature | Expected Behavior |
|---------|-------------------|
| **Page Load** | Loads in 1-2 seconds, no errors |
| **Mode Selection** | Highlights selected, smooth animations |
| **Agent Cards** | Show metrics, pulse animation if online |
| **Auto Tab Switch** | Switches to Chat after agent selection |
| **Message Send** | Triggers streaming visualization |
| **Streaming** | Shows 2 workflow steps, reasoning, metrics |
| **Message Display** | Markdown + syntax highlighting + citations |
| **Document Gen** | 6 templates, 4 formats, progress tracking |
| **Sidebar** | Search filters, tabs work, stats display |
| **Voice Input** | Records and transcribes (if supported) |
| **Attachments** | Upload with progress, preview |

---

## 🎯 Performance Expectations

- **Initial Load:** < 2 seconds
- **Component Render:** < 100ms
- **Smooth Animations:** 60fps
- **Streaming Simulation:** ~4-5 seconds total
- **No Memory Leaks:** Can use for extended sessions

---

## 📞 Getting Help

If you encounter issues:

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Note the component/file causing error

2. **Check Dev Server Output**
   - Look for compilation errors
   - Check for missing dependencies

3. **Verify Files**
   ```bash
   ls -lh src/features/ask-expert/components/
   ls -lh src/app/\(app\)/ask-expert/beta/
   ```

4. **Re-install Dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **Clear Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 🎉 Success!

If all tests pass, you have successfully deployed the Ask Expert UI/UX enhancements!

**Next Steps:**
1. Gather user feedback
2. Monitor performance
3. Plan backend integration (Phase 4)
4. Deploy to staging
5. Production rollout

---

**Test URL:** http://localhost:3000/ask-expert/beta
**Status:** Server running, ready to test
**Last Updated:** January 25, 2025

Happy testing! 🚀
