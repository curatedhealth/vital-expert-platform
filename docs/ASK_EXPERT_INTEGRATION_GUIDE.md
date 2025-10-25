# Ask Expert Enhanced Integration Guide

**Date:** January 25, 2025
**Purpose:** Step-by-step guide to deploy enhanced UI components
**Status:** ✅ Ready for deployment

---

## 📦 What's Being Deployed

You now have two versions of the Ask Expert page:

1. **Current (Original):** `src/app/(app)/ask-expert/page.tsx`
   - Basic dropdown mode selector
   - Simple agent selection dropdown
   - Works but lacks enhanced UX

2. **Enhanced (New):** `src/app/(app)/ask-expert/page-enhanced.tsx`
   - Interactive 5-mode decision tree
   - Rich expert agent cards with performance metrics
   - Setup/Chat tab-based flow
   - Mode-to-backend search strategy mapping

---

## 🚀 Deployment Options

### Option 1: Direct Replacement (Recommended for Production)

**When:** You're confident in the new UI and want to replace immediately

**Steps:**
```bash
# 1. Backup current page
mv src/app/(app)/ask-expert/page.tsx src/app/(app)/ask-expert/page-original-backup.tsx

# 2. Deploy enhanced version
mv src/app/(app)/ask-expert/page-enhanced.tsx src/app/(app)/ask-expert/page.tsx

# 3. Test
npm run dev
open http://localhost:3000/ask-expert

# 4. If issues, rollback
mv src/app/(app)/ask-expert/page-original-backup.tsx src/app/(app)/ask-expert/page.tsx
```

### Option 2: Feature Flag (Recommended for Staging)

**When:** You want to A/B test or gradually roll out

**Steps:**

1. Add environment variable:
```env
# .env.local
NEXT_PUBLIC_ENABLE_ENHANCED_ASK_EXPERT=true
```

2. Update `page.tsx`:
```typescript
// src/app/(app)/ask-expert/page.tsx
import { AskExpertPageOriginal } from './page-original';
import { AskExpertPageEnhanced } from './page-enhanced';

export default function AskExpertPage() {
  const useEnhanced = process.env.NEXT_PUBLIC_ENABLE_ENHANCED_ASK_EXPERT === 'true';

  return useEnhanced ? <AskExpertPageEnhanced /> : <AskExpertPageOriginal />;
}
```

3. Test both versions by toggling the flag

### Option 3: New Route (Recommended for Testing)

**When:** You want both versions available simultaneously

**Steps:**
```bash
# Keep original at /ask-expert
# Enhanced version at /ask-expert-v2

mv src/app/(app)/ask-expert/page-enhanced.tsx src/app/(app)/ask-expert-v2/page.tsx

# Access both:
# - Original: http://localhost:3000/ask-expert
# - Enhanced: http://localhost:3000/ask-expert-v2
```

---

## ✅ Pre-Deployment Checklist

### 1. Verify Component Files Exist

```bash
# Check new components
ls -la src/features/ask-expert/components/EnhancedModeSelector.tsx
ls -la src/features/ask-expert/components/ExpertAgentCard.tsx
ls -la src/features/ask-expert/components/index.ts

# Check enhanced page
ls -la src/app/(app)/ask-expert/page-enhanced.tsx
```

**Expected:** All files should exist

### 2. Install Dependencies

```bash
# Ensure Framer Motion is installed
npm list framer-motion

# If not installed:
npm install framer-motion
```

**Expected:** framer-motion@^11.x.x

### 3. TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected:** No errors related to new components

### 4. Build Test

```bash
npm run build
```

**Expected:** Build succeeds without errors

---

## 🧪 Testing Checklist

### Visual Testing

- [ ] **Mode Selector Displays**
  - [ ] All 5 modes visible in Cards view
  - [ ] Comparison table view works
  - [ ] Mode selection highlights correctly
  - [ ] Badges appear ("Most Popular", etc.)
  - [ ] Hover animations smooth (60 FPS)

- [ ] **Expert Cards Display**
  - [ ] Cards show in 3-column grid on desktop
  - [ ] 2-column on tablet, 1-column on mobile
  - [ ] Avatar displays with availability status
  - [ ] Performance metrics visible
  - [ ] Selection state highlights correctly
  - [ ] All 3 variants work (detailed, compact, minimal)

- [ ] **Tab Navigation**
  - [ ] Setup tab shows mode + expert selection
  - [ ] Chat tab disabled until expert selected
  - [ ] Tab switches automatically after expert selection
  - [ ] "Change" button returns to Setup tab

### Functional Testing

- [ ] **Mode Selection**
  - [ ] Clicking mode updates state
  - [ ] Selected mode persists during session
  - [ ] Mode affects backend API call (check network tab)

- [ ] **Expert Selection**
  - [ ] Clicking expert card selects it
  - [ ] Only one expert can be selected at a time
  - [ ] Selected expert appears in header badge
  - [ ] Auto-switches to Chat tab

- [ ] **Chat Functionality**
  - [ ] Quick prompts populate input field
  - [ ] Send button works
  - [ ] Enter key sends message
  - [ ] Shift+Enter adds new line
  - [ ] Loading states appear during response
  - [ ] Streaming responses display correctly
  - [ ] Sources/citations render properly

### Responsive Design Testing

```bash
# Test on different screen sizes
# Desktop: 1920x1080
# Tablet: 768x1024
# Mobile: 375x667
```

- [ ] **Desktop (>1024px)**
  - [ ] 3-column expert card grid
  - [ ] Full mode selector visible
  - [ ] All tabs fit comfortably

- [ ] **Tablet (768-1024px)**
  - [ ] 2-column expert card grid
  - [ ] Mode selector adapts
  - [ ] Tab layout maintains

- [ ] **Mobile (<768px)**
  - [ ] 1-column expert card grid
  - [ ] Mode selector cards stack
  - [ ] Comparison table scrolls horizontally
  - [ ] Chat input doesn't overlap

### Performance Testing

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000/ask-expert --view
```

**Target Metrics:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 90+

### Accessibility Testing

- [ ] **Keyboard Navigation**
  - [ ] Tab through mode cards
  - [ ] Tab through expert cards
  - [ ] Enter key selects mode/expert
  - [ ] Esc closes dropdowns
  - [ ] Focus indicators visible

- [ ] **Screen Reader**
  - [ ] Mode descriptions read correctly
  - [ ] Expert card info announced
  - [ ] Chat messages readable
  - [ ] Loading states announced

- [ ] **Color Contrast**
  - [ ] Text on backgrounds meets WCAG AA
  - [ ] Badge colors readable
  - [ ] Link colors sufficient contrast

---

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```env
# Feature flags
NEXT_PUBLIC_ENABLE_ENHANCED_ASK_EXPERT=true

# Mode configuration
NEXT_PUBLIC_DEFAULT_MODE=mode-1-query-automatic

# Expert metrics (if using real data)
NEXT_PUBLIC_ENABLE_EXPERT_METRICS=true
```

### Mode Configuration

Edit `page-enhanced.tsx` if you need custom mode configs:

```typescript
// Customize search parameters per mode
const MODE_CONFIG = {
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_by_embedding',
    params: {
      domain_filter: null,
      max_results: 10,  // Increase for more sources
      similarity_threshold: 0.7  // Lower for more results
    }
  },
  // ... other modes
};
```

### Expert Metrics

Currently using **mock data**. To use real metrics:

1. Add helper function:
```typescript
// src/lib/services/expert-metrics.ts
export async function fetchExpertMetrics(agentId: string) {
  const { data } = await supabase
    .from('interaction_logs')
    .select(`
      response_time,
      success,
      user_ratings(rating)
    `)
    .eq('agent_id', agentId)
    .eq('interaction_type', 'ask_expert');

  return {
    responseTime: avg(data.map(d => d.response_time)),
    totalConsultations: data.length,
    satisfactionScore: avg(data.map(d => d.user_ratings?.rating ?? 0)),
    successRate: (data.filter(d => d.success).length / data.length) * 100,
    availability: determineAvailability(data)
  };
}
```

2. Use in page:
```typescript
const [agentMetrics, setAgentMetrics] = useState<Record<string, any>>({});

useEffect(() => {
  agents.forEach(async (agent) => {
    const metrics = await fetchExpertMetrics(agent.id);
    setAgentMetrics(prev => ({ ...prev, [agent.id]: metrics }));
  });
}, [agents]);

// In render:
<ExpertAgentCard
  agent={{ ...agent, ...agentMetrics[agent.id] }}
  // ... other props
/>
```

---

## 🐛 Troubleshooting

### Issue: Components don't render

**Check:**
```bash
# Ensure imports work
grep -r "from '@/features/ask-expert/components'" src/app/(app)/ask-expert/
```

**Fix:** Update import paths if needed

### Issue: Animations lag

**Check:** Browser DevTools Performance tab

**Fix:**
```typescript
// Reduce animation complexity
const variants = {
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2 } // Reduce from default
  }
};
```

### Issue: TypeScript errors

**Common Error:**
```
Property 'availability' does not exist on type 'Agent'
```

**Fix:** Extend Agent type:
```typescript
interface ExtendedAgent extends Agent {
  availability?: 'online' | 'busy' | 'offline';
  responseTime?: number;
  totalConsultations?: number;
  satisfactionScore?: number;
  successRate?: number;
}
```

### Issue: Mode selection doesn't affect backend

**Check:** Network tab in DevTools when sending message

**Expected:** `searchConfig` in request payload

**Fix:** Ensure MODE_CONFIG is correctly mapped

---

## 📊 Monitoring

### Key Metrics to Track

After deployment, monitor these metrics:

**Usage Metrics:**
```sql
-- Mode usage distribution
SELECT
  mode,
  COUNT(*) as usage_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM interaction_logs
WHERE interaction_type = 'ask_expert'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY mode
ORDER BY usage_count DESC;
```

**Performance Metrics:**
```sql
-- Average response times by mode
SELECT
  mode,
  AVG(response_time_ms) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time
FROM interaction_logs
WHERE interaction_type = 'ask_expert'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY mode;
```

**Satisfaction Metrics:**
```sql
-- User satisfaction by component
SELECT
  'mode_selector' as component,
  AVG(CASE WHEN user_action = 'mode_selected' THEN time_to_action_ms END) as avg_decision_time,
  COUNT(DISTINCT user_id) as unique_users
FROM user_events
WHERE event_type = 'ask_expert_interaction'
  AND created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT
  'expert_selector' as component,
  AVG(CASE WHEN user_action = 'expert_selected' THEN time_to_action_ms END),
  COUNT(DISTINCT user_id)
FROM user_events
WHERE event_type = 'ask_expert_interaction'
  AND created_at > NOW() - INTERVAL '7 days';
```

### Analytics Events

Add tracking:

```typescript
// src/lib/analytics.ts
export function trackModeSelection(mode: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Ask Expert - Mode Selected', {
      mode,
      timestamp: new Date().toISOString()
    });
  }
}

export function trackExpertSelection(agentId: string, agentName: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Ask Expert - Expert Selected', {
      agentId,
      agentName,
      timestamp: new Date().toISOString()
    });
  }
}
```

Use in page:
```typescript
const handleModeChange = (modeId: string) => {
  setState(prev => ({ ...prev, selectedMode: modeId }));
  trackModeSelection(modeId);
};

const handleAgentSelect = (agentId: string) => {
  const agent = agents.find(a => a.id === agentId);
  setState(prev => ({ ...prev, selectedAgent: agent || null }));
  trackExpertSelection(agentId, agent?.name || 'Unknown');
};
```

---

## 🎯 Success Criteria

### Week 1 Post-Deployment

- [ ] Zero critical bugs reported
- [ ] Performance metrics meet targets
- [ ] User feedback collected (10+ responses)
- [ ] Mode distribution matches expectations

### Month 1 Post-Deployment

- [ ] User satisfaction increased (target: 88-90%)
- [ ] Mode selection accuracy improved (target: 85-90%)
- [ ] Session duration increased (target: 10-12 min)
- [ ] Expert utilization improved (target: 72-75%)

### Quarter 1 (Full Enhancement Complete)

- [ ] All 7 UI components implemented
- [ ] User satisfaction 95%+
- [ ] Lighthouse score 98+
- [ ] WCAG 2.1 AA+ compliant

---

## 📞 Support

### Questions?

**Technical Issues:**
- Check troubleshooting section above
- Review component documentation in `ASK_EXPERT_ENHANCEMENTS_IMPLEMENTATION_STATUS.md`
- Check backend integration guide in `ASK_EXPERT_BACKEND_INTEGRATION.md`

**Feature Requests:**
- Review UI/UX Enhancement Guide for future phases
- Check implementation roadmap

**Bugs:**
- Create detailed reproduction steps
- Include browser/device info
- Attach screenshots/videos
- Check browser console for errors

---

## ✅ Final Deployment Steps

When ready to deploy to production:

1. **Run all tests:**
```bash
npm run test
npm run lint
npm run build
```

2. **Deploy to staging first:**
```bash
# Deploy to staging environment
vercel --prod --scope=staging
```

3. **Test on staging:**
- Run full testing checklist above
- Get stakeholder approval
- Monitor for 24-48 hours

4. **Deploy to production:**
```bash
# Deploy to production
vercel --prod
```

5. **Monitor production:**
- Watch error tracking (Sentry, etc.)
- Monitor performance (Lighthouse CI)
- Track analytics events
- Collect user feedback

6. **Iterate:**
- Address issues within 24 hours
- Plan Phase 3 enhancements
- Continue improving based on data

---

**Prepared By:** VITAL AI Assistant
**Date:** January 25, 2025
**Status:** ✅ Ready for Deployment
**Next Review:** February 1, 2025

*Good luck with the deployment! 🚀*
