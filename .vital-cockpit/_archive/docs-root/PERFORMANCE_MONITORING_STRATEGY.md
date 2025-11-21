# Performance Monitoring & Continuous Optimization Strategy

## Overview

This document outlines strategies for monitoring performance in production and continuously optimizing based on real user data.

## Phase 1: Measurement & Baseline

### 1.1 Core Web Vitals Monitoring

#### Setup Web Vitals Tracking

Create `lib/analytics/web-vitals.ts`:

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Example: Send to custom endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

#### Integrate in App

Update `app/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/analytics/web-vitals';

export default function RootLayout({ children }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 1.2 React Query Performance Tracking

Monitor cache effectiveness:

```typescript
// lib/analytics/query-performance.ts
import { useQueryClient } from '@tanstack/react-query';

export function useQueryPerformance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      const stats = {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        activeQueries: queries.filter(q => q.observers.length > 0).length,
        cachedData: queries.filter(q => q.state.data !== undefined).length,
      };

      // Log or send to analytics
      console.log('Query Cache Stats:', stats);

      // Send to analytics
      fetch('/api/analytics/query-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [queryClient]);
}
```

### 1.3 Bundle Size Monitoring

Track bundle size over time:

```bash
# Add to package.json scripts
"analyze:ci": "ANALYZE=true npm run build && node scripts/bundle-size-report.js"
```

Create `scripts/bundle-size-report.js`:

```javascript
const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });

  return size;
}

const buildDir = path.join(__dirname, '../.next');
const totalSize = getDirectorySize(buildDir);

const report = {
  timestamp: new Date().toISOString(),
  totalSize: totalSize,
  totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
};

console.log('Bundle Size Report:', report);

// Save to file for tracking
fs.writeFileSync(
  path.join(__dirname, '../bundle-size-history.json'),
  JSON.stringify(report, null, 2)
);
```

## Phase 2: Real User Monitoring (RUM)

### 2.1 Setup Analytics Service

Options:
1. **Vercel Analytics** (if deploying to Vercel)
2. **Google Analytics 4**
3. **Plausible Analytics** (privacy-focused)
4. **Custom solution**

#### Example: Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2.2 Custom Event Tracking

Track user interactions:

```typescript
// lib/analytics/events.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Also send to custom endpoint
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, properties }),
    keepalive: true,
  });
}

// Usage in components
trackEvent('agent_selected', { agentId, agentName });
trackEvent('message_sent', { chatId, messageLength });
trackEvent('document_uploaded', { category, fileSize });
```

### 2.3 Performance API Tracking

Monitor real navigation and resource timing:

```typescript
// lib/analytics/performance-observer.ts
export function setupPerformanceObserver() {
  if (typeof window === 'undefined') return;

  // Navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  const metrics = {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
  };

  // Send to analytics
  fetch('/api/analytics/navigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
    keepalive: true,
  });

  // Observe resource loading
  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const resources = entries.map(entry => ({
      name: entry.name,
      type: entry.entryType,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize,
    }));

    // Send periodically
    if (resources.length > 0) {
      fetch('/api/analytics/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resources),
        keepalive: true,
      });
    }
  });

  resourceObserver.observe({ entryTypes: ['resource'] });
}
```

## Phase 3: Optimization Based on Data

### 3.1 Identify Slow Pages

Query analytics to find pages with poor performance:

```sql
-- Example query structure
SELECT
  page_path,
  AVG(lcp) as avg_lcp,
  AVG(fid) as avg_fid,
  AVG(cls) as avg_cls,
  COUNT(*) as views
FROM web_vitals
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY page_path
HAVING AVG(lcp) > 2500  -- Poor LCP threshold
ORDER BY avg_lcp DESC;
```

### 3.2 Identify Heavy Resources

Find largest resources being loaded:

```sql
SELECT
  resource_name,
  AVG(transfer_size) as avg_size,
  COUNT(*) as load_count
FROM resource_timing
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY resource_name
ORDER BY avg_size DESC
LIMIT 20;
```

### 3.3 Optimize Based on Findings

**Common Issues & Solutions:**

#### Issue 1: Large Bundle on Specific Page

**Detection:**
```javascript
// Bundle size > 300KB on page
```

**Solution:**
```typescript
// 1. Add route-specific code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});

// 2. Lazy load features
const FeatureModule = dynamic(() => import('./features/expensive'), {
  ssr: false,
});
```

#### Issue 2: Slow Initial Load

**Detection:**
```javascript
// TTFB > 1s or LCP > 2.5s
```

**Solution:**
```typescript
// 1. Implement static generation where possible
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

// 2. Add prefetching
<Link href="/slow-page" prefetch={true}>
  Navigate
</Link>

// 3. Optimize data fetching
export async function getServerSideProps() {
  // Parallel data fetching
  const [data1, data2] = await Promise.all([
    fetch1(),
    fetch2(),
  ]);

  return { props: { data1, data2 } };
}
```

#### Issue 3: High Cache Miss Rate

**Detection:**
```javascript
// React Query cache hit rate < 40%
```

**Solution:**
```typescript
// 1. Increase stale time for stable data
useQuery({
  queryKey: ['stable-data'],
  queryFn: fetchData,
  staleTime: 60 * 60 * 1000, // 1 hour
});

// 2. Implement prefetching
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: ['next-page'],
  queryFn: fetchNextPage,
});

// 3. Use longer cache for rarely-changing data
useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  staleTime: Infinity, // Never goes stale
  cacheTime: 24 * 60 * 60 * 1000, // 24 hours
});
```

#### Issue 4: Layout Shift Issues

**Detection:**
```javascript
// CLS > 0.1
```

**Solution:**
```typescript
// 1. Always specify image dimensions
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="..."
/>

// 2. Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// 3. Avoid inserting content above existing content
```

### 3.4 A/B Testing Performance Improvements

Test optimizations with a subset of users:

```typescript
// lib/experiments/performance-test.ts
export function isInExperiment(experimentName: string): boolean {
  if (typeof window === 'undefined') return false;

  // Use consistent hash based on user ID
  const userId = getUserId(); // From session/cookie
  const hash = hashCode(userId + experimentName);
  const bucket = Math.abs(hash) % 100;

  // 50/50 split
  return bucket < 50;
}

// Usage
const useNewOptimization = isInExperiment('new-caching-strategy');

if (useNewOptimization) {
  // New optimized approach
} else {
  // Current approach
}
```

Track results:

```typescript
trackEvent('page_load', {
  experiment: 'new-caching-strategy',
  variant: useNewOptimization ? 'optimized' : 'control',
  lcp: lcp,
  fid: fid,
});
```

## Phase 4: Continuous Monitoring Dashboard

### 4.1 Create Performance Dashboard

Build a simple dashboard to visualize metrics:

```typescript
// app/admin/performance/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

interface PerformanceMetrics {
  avg_lcp: number;
  avg_fid: number;
  avg_cls: number;
  p95_lcp: number;
  p95_fid: number;
}

export default function PerformanceDashboard() {
  const { data } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/performance-metrics');
      return response.json() as Promise<PerformanceMetrics>;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Largest Contentful Paint"
          value={data?.avg_lcp}
          threshold={2500}
          unit="ms"
        />
        <MetricCard
          title="First Input Delay"
          value={data?.avg_fid}
          threshold={100}
          unit="ms"
        />
        <MetricCard
          title="Cumulative Layout Shift"
          value={data?.avg_cls}
          threshold={0.1}
          unit=""
        />
      </div>

      {/* Add charts, trends, etc. */}
    </div>
  );
}

function MetricCard({ title, value, threshold, unit }) {
  const status = value <= threshold ? 'good' : 'poor';

  return (
    <div className={`p-4 border rounded-lg ${
      status === 'good' ? 'border-green-500' : 'border-red-500'
    }`}>
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-3xl font-bold">
        {value?.toFixed(0)}{unit}
      </p>
      <p className={`text-sm ${
        status === 'good' ? 'text-green-600' : 'text-red-600'
      }`}>
        {status === 'good' ? '✓ Good' : '✗ Needs Improvement'}
      </p>
    </div>
  );
}
```

### 4.2 Set Up Alerts

Monitor for performance degradation:

```typescript
// api/admin/check-performance/route.ts
export async function GET() {
  const metrics = await fetchLatestMetrics();

  const alerts = [];

  if (metrics.avg_lcp > 2500) {
    alerts.push({
      severity: 'high',
      metric: 'LCP',
      value: metrics.avg_lcp,
      threshold: 2500,
    });
  }

  if (metrics.avg_cls > 0.1) {
    alerts.push({
      severity: 'medium',
      metric: 'CLS',
      value: metrics.avg_cls,
      threshold: 0.1,
    });
  }

  if (alerts.length > 0) {
    // Send notification (email, Slack, etc.)
    await sendAlert(alerts);
  }

  return Response.json({ alerts });
}
```

## Phase 5: Automated Performance Testing

### 5.1 Lighthouse CI in GitHub Actions

Already documented in [LIGHTHOUSE_AUDIT_GUIDE.md](./LIGHTHOUSE_AUDIT_GUIDE.md)

### 5.2 Performance Budgets

Create `performance-budget.json`:

```json
{
  "budgets": [
    {
      "path": "/*",
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
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        }
      ]
    }
  ]
}
```

### 5.3 Bundle Size Tracking

Add to CI/CD:

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-bundle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: preactjs/compressed-size-action@v2
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

## Summary

### Monitoring Checklist

- [ ] Web Vitals tracking implemented
- [ ] React Query performance monitoring
- [ ] Bundle size tracking
- [ ] Real User Monitoring (RUM) setup
- [ ] Custom event tracking
- [ ] Performance dashboard created
- [ ] Alerts configured
- [ ] Lighthouse CI in GitHub Actions
- [ ] Performance budgets enforced
- [ ] Bundle size checks in CI/CD

### Optimization Process

1. **Collect Data**: Monitor for 1-2 weeks
2. **Analyze**: Identify bottlenecks and patterns
3. **Prioritize**: Focus on high-impact issues
4. **Optimize**: Implement improvements
5. **Test**: A/B test when possible
6. **Measure**: Verify improvements
7. **Repeat**: Continuous cycle

### Key Metrics to Track

- **Core Web Vitals**: LCP, FID, CLS
- **Custom Metrics**: TTFB, FCP, TTI
- **Business Metrics**: Conversion rate, engagement
- **Technical Metrics**: Cache hit rate, API response time
- **User Experience**: Error rate, success rate

**With proper monitoring and continuous optimization, performance improvements compound over time!**
