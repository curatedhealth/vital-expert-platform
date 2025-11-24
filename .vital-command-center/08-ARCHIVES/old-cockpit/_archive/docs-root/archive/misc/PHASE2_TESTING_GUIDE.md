# 🧪 Phase 2 Integration Testing Guide

## Quick Start

```bash
# 1. Navigate to project
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/apps/digital-health-startup

# 2. Start development server
npm run dev

# 3. Open in browser
open http://localhost:3000/ask-expert
```

---

## Test Scenarios

### ✅ Test 1: Basic Token Streaming

**Steps**:
1. Navigate to Ask Expert page
2. Type a simple question: "What is machine learning?"
3. Submit

**Expected**:
- ✅ Progress bar appears at top
- ✅ "AI is thinking..." with animated dots
- ✅ Text streams character-by-character (30ms delay)
- ✅ Smooth animation, no jank
- ✅ Blinking cursor during streaming

**Pass Criteria**:
- Animation feels smooth (33 tokens/sec)
- No visual stuttering
- Cursor blinks smoothly

---

### ✅ Test 2: Progress Tracking

**Steps**:
1. Ask a longer question
2. Watch progress bar

**Expected**:
- ✅ Stage changes: thinking → streaming → complete
- ✅ Progress: 0% → 100%
- ✅ Token count increases
- ✅ TPS (tokens/second) shown
- ✅ Time estimate appears (~30s format)

**Pass Criteria**:
- Progress reaches 100%
- All stages visible
- Metrics update in real-time

---

### ✅ Test 3: Connection Quality

**Steps**:
1. Check connection quality in dev panel (bottom)
2. Observe latency, quality score

**Expected**:
- ✅ Quality: "excellent" or "good" (normal connection)
- ✅ Latency: < 100ms (excellent) or < 300ms (good)
- ✅ Uptime: ~100%

**Pass Criteria**:
- Connection quality displayed
- Latency tracked
- Updates every 5 seconds (heartbeat)

**To Test Poor Connection**:
- Throttle network in DevTools
- Verify banner appears
- Verify retry button works

---

### ✅ Test 4: Typing Indicators

**Steps**:
1. Ask a question
2. Observe during thinking/tool execution

**Expected**:
- ✅ "AI is thinking..." (thinking stage)
- ✅ "Executing tools..." (tool stage)
- ✅ Animated bouncing dots
- ✅ Disappears when streaming starts

**Pass Criteria**:
- Indicator shows context-aware message
- Smooth animations
- Proper timing

---

### ✅ Test 5: Time Estimation

**Steps**:
1. Ask a question that generates ~500 tokens
2. Watch time estimate

**Expected**:
- ✅ Shows after ~10 tokens received
- ✅ Format: "~45s" or "~1m 30s"
- ✅ Confidence level shown (30-100%)
- ✅ Counts down as streaming progresses

**Pass Criteria**:
- Estimate appears within 2-3 seconds
- Accuracy within 30% of actual time
- Updates smoothly

---

### ✅ Test 6: Performance Metrics (Dev Only)

**Steps**:
1. Ensure `NODE_ENV=development`
2. Ask a question
3. Check bottom dev panel

**Expected**:
- ✅ TTFT (Time to First Token) shown
- ✅ TPS (Tokens Per Second) updates
- ✅ Total tokens count
- ✅ Connection quality color-coded
- ✅ Latency in ms
- ✅ Uptime percentage

**Pass Criteria**:
- All 6 metrics visible
- Updates in real-time
- Accurate values

---

## Edge Cases

### 🧪 Test 7: Multiple Consecutive Messages

**Steps**:
1. Ask 3-4 questions in a row
2. Don't wait for completion

**Expected**:
- ✅ Previous message completes before new one
- ✅ Metrics reset between messages
- ✅ Progress bar resets
- ✅ No memory leaks

---

### 🧪 Test 8: Very Long Response

**Steps**:
1. Ask for a detailed explanation (generates >1000 tokens)
2. Watch full streaming

**Expected**:
- ✅ Smooth animation throughout
- ✅ No slowdown after 1000+ chars
- ✅ Backpressure handling works
- ✅ Performance stable

---

### 🧪 Test 9: Network Interruption

**Steps**:
1. Start asking a question
2. Disable network in DevTools
3. Re-enable after 3 seconds

**Expected**:
- ✅ Error banner appears
- ✅ "Connection lost" message
- ✅ Retry button available
- ✅ Reconnects automatically
- ✅ Metrics track downtime

---

### 🧪 Test 10: Rapid Input

**Steps**:
1. Type and submit very quickly (5 questions in 10 seconds)
2. Watch behavior

**Expected**:
- ✅ Only one active stream at a time
- ✅ Queues properly
- ✅ No UI breaks
- ✅ All messages eventually appear

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| **TTFT** | < 500ms | Dev panel bottom |
| **TPS** | 30-50 | Dev panel bottom |
| **Animation FPS** | 60fps | Visual smoothness |
| **Token Delay** | 30ms | Consistent timing |
| **Progress Update** | < 100ms | Visual lag test |
| **Memory Usage** | < 50MB | Chrome DevTools |

### How to Measure

```javascript
// In browser console:
// 1. Memory
performance.memory.usedJSHeapSize / 1024 / 1024; // MB

// 2. FPS (visual)
// Open Chrome DevTools → Performance tab → Record

// 3. TTFT (automatic in dev panel)
```

---

## Browser Testing

### Required Browsers

- [x] Chrome (latest)
- [x] Safari (latest)
- [x] Firefox (latest)
- [x] Edge (latest)

### Mobile Testing

- [x] iOS Safari
- [x] Android Chrome

---

## Debugging

### Enable Verbose Logging

```typescript
// Add to page-refactored.tsx (temporarily)
useEffect(() => {
  console.log('[Phase 2] Streaming state:', {
    isStreaming: tokenStreaming.isStreaming,
    progress: streamingProgress.percentComplete,
    quality: connectionQuality.quality,
    ttft: performanceMetrics.timeToFirstToken,
  });
}, [tokenStreaming, streamingProgress, connectionQuality, performanceMetrics]);
```

### Check Network Tab

1. Open DevTools → Network
2. Look for SSE connections
3. Verify events received
4. Check timing

### React DevTools

1. Install React DevTools extension
2. Check component re-renders
3. Verify state updates
4. Profile performance

---

## Common Issues

### Issue 1: Animation Not Smooth

**Symptoms**: Jittery text
**Fix**: 
- Check FPS in DevTools
- Verify `delayBetweenTokens: 30`
- Disable browser extensions

### Issue 2: Progress Bar Stuck

**Symptoms**: 0% forever
**Fix**:
- Check `streamingProgress.recordToken()` is called
- Verify events firing in console
- Check expected token count

### Issue 3: No Time Estimate

**Symptoms**: Time not showing
**Fix**:
- Need at least 10 tokens received
- Check confidence > 30%
- Verify `expectedTotalTokens` set

### Issue 4: High Memory Usage

**Symptoms**: > 100MB heap
**Fix**:
- Check for memory leaks in `useEffect`
- Verify cleanup functions run
- Clear message history after 50 messages

---

## Success Criteria

### Must Pass (Critical)

- [ ] ✅ All token streaming works smoothly
- [ ] ✅ Progress bar reaches 100%
- [ ] ✅ Zero console errors from Phase 2 code
- [ ] ✅ No memory leaks after 10 messages
- [ ] ✅ Works in Chrome, Safari, Firefox

### Should Pass (Important)

- [ ] ✅ Time estimates accurate within 30%
- [ ] ✅ Connection quality tracked correctly
- [ ] ✅ Typing indicators show/hide properly
- [ ] ✅ Dev metrics all update
- [ ] ✅ Mobile responsive

### Nice to Have

- [ ] ✅ Animation 60fps constant
- [ ] ✅ TTFT < 300ms
- [ ] ✅ Works offline (graceful degradation)
- [ ] ✅ Accessibility perfect

---

## Report Template

```markdown
## Test Report

**Date**: [Date]
**Tester**: [Name]
**Browser**: [Chrome/Safari/Firefox/Edge]
**Version**: [Browser version]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| Token Streaming | ✅/❌ | |
| Progress Tracking | ✅/❌ | |
| Connection Quality | ✅/❌ | |
| Typing Indicators | ✅/❌ | |
| Time Estimation | ✅/❌ | |
| Performance Metrics | ✅/❌ | |
| Edge Cases | ✅/❌ | |

### Performance Metrics

- TTFT: ___ ms
- TPS: ___ tokens/sec
- Memory: ___ MB
- FPS: ___ fps

### Issues Found

1. [Description]
   - Severity: Critical/Major/Minor
   - Steps to reproduce:
   - Expected:
   - Actual:

### Overall Assessment

✅ PASS / ❌ FAIL / ⚠️ NEEDS WORK

### Recommendations

[Your feedback here]
```

---

## Next Steps After Testing

1. ✅ All tests pass → Deploy to staging
2. ⚠️ Minor issues → Fix and retest
3. ❌ Major issues → Debug and iterate

---

**Ready to test?** Run the server and start with Test 1! 🚀

