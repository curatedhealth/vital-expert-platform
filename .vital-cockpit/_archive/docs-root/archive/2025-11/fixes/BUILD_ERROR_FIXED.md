# Build Error Fix: Module not found 'cluster'

## Problem

Next.js was trying to bundle `prom-client` (which uses Node.js `cluster` module) for the browser because:
- `structured-logger.ts` was importing `prometheus-exporter.ts`  
- `structured-logger.ts` is used by `conversations-service.ts`
- `conversations-service.ts` is imported by `use-conversations.ts` (React hook - client component)
- Next.js/Turbopack statically analyzes imports even for dynamic imports

## Solution (Dev Build Fix)

### 1. Disabled Client-Side Prometheus Export
**File**: `apps/digital-health-startup/src/lib/services/observability/structured-logger.ts`

- Removed the dynamic import of `prometheus-exporter` from the logging method
- Prometheus metrics are now only exported from server-only API routes (`/api/metrics`, `/api/analytics/agents`)
- Client-side code no longer tries to import prom-client
- Logging still works on client (console output), just without Prometheus export

### 2. Updated Next.js Configuration
**File**: `apps/digital-health-startup/next.config.js`

- Added `prom-client` to `serverExternalPackages` (excludes from client bundle)
- Added webpack configuration to exclude `cluster` module from client bundle
- Added `webpack.IgnorePlugin` to ignore `prom-client` in client bundle
- This ensures Node.js modules are never bundled for browser

## Files Modified

1. `apps/digital-health-startup/src/lib/services/observability/structured-logger.ts`
   - Removed client-side Prometheus export call
   - Added comment explaining server-only nature
   - TODO added for future re-enablement

2. `apps/digital-health-startup/next.config.js`
   - Added `prom-client` to `serverExternalPackages`
   - Added webpack configuration to exclude Node.js modules
   - Added `IgnorePlugin` for `prom-client` in client bundle

## Impact

- ✅ **Dev build works** - No more "Can't resolve 'cluster'" error
- ✅ **Client-side logging works** - Console output still functions
- ✅ **Server-side Prometheus metrics work** - API routes can still export metrics
- ⚠️ **Client-side code no longer exports to Prometheus** (acceptable trade-off for dev)

## Architecture Notes

- Prometheus metrics are still collected and exported
- Metrics are recorded via **server-only** API routes:
  - `/api/metrics` - Main metrics endpoint
  - `/api/analytics/agents` - Agent analytics endpoint
- Client-side structured logging still works (console output)
- This maintains functionality while fixing the build error

## Testing

```bash
# Dev server should start without errors
cd apps/digital-health-startup
npm run dev
```

## Future Improvement

When Next.js/Turbopack better supports server-only dynamic imports:
- Re-enable client-side Prometheus export in structured logger
- Use proper server-only module conventions (`.server.ts` extension)
- Or create a separate client-safe logger that doesn't import Prometheus

---

**Status**: ✅ Dev Build Error Fixed  
**Date**: January 29, 2025
