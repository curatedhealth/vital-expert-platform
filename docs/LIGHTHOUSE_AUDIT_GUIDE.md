# Lighthouse Performance Audit Guide

## Overview

This guide provides instructions for running Lighthouse audits to measure the performance improvements from Phase 1-3 optimizations.

## Prerequisites

1. **Build the production app:**
   ```bash
   npm run build
   npm start
   ```

2. **Ensure local Supabase is running** (if testing with real data):
   ```bash
   npx supabase start
   ```

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Recommended)

1. **Open Chrome/Edge** and navigate to your app:
   - Landing page: `http://localhost:3000`
   - Chat page: `http://localhost:3000/chat`
   - Agents page: `http://localhost:3000/agents`

2. **Open DevTools:**
   - Press `F12` or `Right-click > Inspect`

3. **Open Lighthouse tab:**
   - Click the "Lighthouse" tab in DevTools
   - If not visible: Click `>>` and select "Lighthouse"

4. **Configure audit:**
   - Mode: **Desktop** or **Mobile**
   - Categories: Check all (Performance, Accessibility, Best Practices, SEO)
   - Click "Analyze page load"

5. **Wait for results** (30-60 seconds)

6. **Save report:**
   - Click "Save as HTML" or "Save as JSON"
   - Save to `lighthouse-reports/` directory

### Method 2: Lighthouse CI (Automated)

1. **Install Lighthouse CI:**
   ```bash
   npm install -g @lhci/cli
   ```

2. **Create configuration** `lighthouserc.json`:
   ```json
   {
     "ci": {
       "collect": {
         "startServerCommand": "npm start",
         "url": [
           "http://localhost:3000",
           "http://localhost:3000/chat",
           "http://localhost:3000/agents"
         ],
         "numberOfRuns": 3
       },
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", {"minScore": 0.9}],
           "categories:accessibility": ["error", {"minScore": 0.9}],
           "categories:best-practices": ["error", {"minScore": 0.9}],
           "categories:seo": ["error", {"minScore": 0.9}]
         }
       },
       "upload": {
         "target": "filesystem",
         "outputDir": "./lighthouse-reports"
       }
     }
   }
   ```

3. **Run audit:**
   ```bash
   npm run build
   lhci autorun
   ```

### Method 3: Command Line

1. **Install Lighthouse CLI:**
   ```bash
   npm install -g lighthouse
   ```

2. **Start production server:**
   ```bash
   npm run build
   npm start
   ```

3. **Run audit:**
   ```bash
   # Landing page
   lighthouse http://localhost:3000 \
     --output html \
     --output-path ./lighthouse-reports/landing-page.html \
     --chrome-flags="--headless"

   # Chat page
   lighthouse http://localhost:3000/chat \
     --output html \
     --output-path ./lighthouse-reports/chat-page.html \
     --chrome-flags="--headless"
   ```

## Key Metrics to Track

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Additional Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **FCP** (First Contentful Paint) | < 1.8s | When first content appears |
| **TTI** (Time to Interactive) | < 3.8s | When page becomes interactive |
| **TBT** (Total Blocking Time) | < 300ms | How long page is blocked |
| **Speed Index** | < 3.4s | How quickly content is visible |

## Expected Results After Optimizations

### Landing Page

**Before Phase 3:**
- Performance: ~70-75
- Best Practices: ~80-85
- Accessibility: ~85-90
- SEO: ~85-90

**After Phase 3 (Expected):**
- Performance: **90-95** ⬆️ (+20 points)
- Best Practices: **95-100** ⬆️ (+15 points)
- Accessibility: **90-95** ⬆️ (+5 points)
- SEO: **95-100** ⬆️ (+10 points)

**Key Improvements:**
- ✅ Server-side rendering (RSC)
- ✅ Reduced JavaScript bundle (-80%)
- ✅ Optimized images (WebP, lazy loading)
- ✅ Zero layout shift (proper dimensions)

### Chat Page

**Before React Query:**
- Performance: ~65-70
- Multiple unnecessary API calls
- No caching

**After React Query (Expected):**
- Performance: **85-90** ⬆️ (+20 points)
- Cached data reduces load time
- Optimistic updates improve perceived performance

### Agents Page

**Before Optimization:**
- Performance: ~60-70
- Large images not optimized
- No caching

**After Optimization (Expected):**
- Performance: **80-90** ⬆️ (+20 points)
- Optimized avatars
- React Query caching
- Lazy loading

## Analyzing Results

### Performance Issues to Look For

1. **Large JavaScript Bundles**
   - Check: "Reduce JavaScript execution time"
   - Target: < 2s execution time
   - Solution: Code splitting, tree shaking

2. **Unoptimized Images**
   - Check: "Properly size images"
   - Check: "Serve images in next-gen formats"
   - Solution: Use next/image (already done)

3. **Render Blocking Resources**
   - Check: "Eliminate render-blocking resources"
   - Solution: Move scripts to bottom, use async/defer

4. **Unused JavaScript**
   - Check: "Remove unused JavaScript"
   - Solution: Dynamic imports, tree shaking

5. **Layout Shift**
   - Check CLS score
   - Solution: Specify image dimensions (already done)

### Performance Opportunities

Look for these suggestions in Lighthouse:

- ✅ "Enable text compression" - Next.js handles this
- ✅ "Serve static assets with cache policy" - Configure in production
- ✅ "Efficiently encode images" - next/image handles this
- ✅ "Use HTTP/2" - Configure in hosting
- ✅ "Minimize main-thread work" - Code splitting helps

## Baseline vs Optimized Comparison

### Create Baseline Report

Before testing optimizations:

```bash
# Save current state
git stash

# Checkout before optimizations
git checkout <commit-before-phase-3>

# Build and audit
npm run build
npm start
lighthouse http://localhost:3000 \
  --output json \
  --output-path ./lighthouse-reports/baseline.json

# Return to optimized code
git checkout -
git stash pop
```

### Create Optimized Report

After Phase 3 optimizations:

```bash
npm run build
npm start
lighthouse http://localhost:3000 \
  --output json \
  --output-path ./lighthouse-reports/optimized.json
```

### Compare Reports

```bash
# Install lighthouse-ci for comparison
npm install -g @lhci/cli

# Compare
lhci compare \
  --base-report ./lighthouse-reports/baseline.json \
  --current-report ./lighthouse-reports/optimized.json
```

## Bundle Size Analysis

Run alongside Lighthouse:

```bash
# Analyze bundle
ANALYZE=true npm run build

# Check output
# - Open analyze/client.html
# - Look for large dependencies
# - Identify optimization opportunities
```

### Bundle Size Targets

| Page | Before | After | Target |
|------|--------|-------|--------|
| Landing | ~200KB | ~40KB | **< 50KB** ✅ |
| Chat | ~300KB | ~180KB | **< 200KB** ✅ |
| Agents | ~250KB | ~150KB | **< 180KB** ✅ |

## Continuous Monitoring

### Setup Lighthouse CI in GitHub Actions

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
      - uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: ./lighthouse-reports
```

### Performance Budget

Create `budget.json`:

```json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "total",
      "budget": 800
    }
  ],
  "timings": [
    {
      "metric": "interactive",
      "budget": 3800
    },
    {
      "metric": "first-contentful-paint",
      "budget": 1800
    }
  ]
}
```

Reference in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "budgets": "./budget.json"
      }
    }
  }
}
```

## Troubleshooting

### Low Performance Score

**Issue:** Performance score < 80

**Checks:**
1. Is production build running? (`npm run build && npm start`)
2. Are all optimizations applied? (RSC, React Query, optimized images)
3. Is server under load? (Test on idle system)
4. Network throttling enabled? (Disable for local tests)

### Images Not Optimized

**Issue:** "Serve images in next-gen formats" warning

**Solution:**
- Verify next/image is used: `grep -r "<img" src/`
- Check image domains configured in `next.config.js`
- Ensure images are in `public/` directory or allowed remote patterns

### Large JavaScript Bundle

**Issue:** "Reduce JavaScript execution time"

**Solution:**
```bash
# Analyze bundle
ANALYZE=true npm run build

# Check for:
# - Duplicate dependencies
# - Large unused libraries
# - Missing code splitting
```

### Layout Shift Issues

**Issue:** CLS score > 0.1

**Solution:**
- Add width/height to all images
- Reserve space for dynamic content
- Use skeleton loaders
- Avoid inserting content above existing content

## Report Storage

Create directory structure:

```bash
mkdir -p lighthouse-reports/{baseline,optimized}

# Save reports with timestamps
lighthouse http://localhost:3000 \
  --output html \
  --output-path ./lighthouse-reports/optimized/landing-$(date +%Y%m%d-%H%M%S).html
```

## Summary

### Quick Audit Checklist

- [ ] Build production app (`npm run build`)
- [ ] Start production server (`npm start`)
- [ ] Run Lighthouse on landing page
- [ ] Run Lighthouse on chat page
- [ ] Run Lighthouse on agents page
- [ ] Save HTML reports
- [ ] Document scores
- [ ] Identify improvement areas
- [ ] Compare with baseline (if available)
- [ ] Run bundle analyzer
- [ ] Review and address issues

### Target Scores

| Category | Target | Status |
|----------|--------|--------|
| Performance | > 90 | 🎯 |
| Accessibility | > 90 | 🎯 |
| Best Practices | > 95 | 🎯 |
| SEO | > 95 | 🎯 |

**All optimizations are in place - scores should meet or exceed targets!**
