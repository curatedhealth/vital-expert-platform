# Quick Start: Using the Connection Helper

## Basic Usage

### 1. Simple Query with Retry

```typescript
import { createClient } from '@/lib/supabase/client';
import { executeWithRetry } from '@/lib/supabase/connection-helper';

const supabase = createClient();

// Fetch data with automatic retry on SSL/connection errors
const result = await executeWithRetry(
  () => supabase.from('agents').select('*').eq('status', 'active')
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### 2. Using the Query Helper

```typescript
import { createClient } from '@/lib/supabase/client';
import { SupabaseQueryHelper } from '@/lib/supabase/connection-helper';

const supabase = createClient();
const helper = new SupabaseQueryHelper(supabase);

// SELECT
const agents = await helper.select('agents', {
  columns: 'id, name, description, status',
  filters: { status: 'active' },
  order: { column: 'name', ascending: true },
  limit: 20
});

// INSERT
const newAgent = await helper.insert('agents', {
  name: 'New Agent',
  status: 'active',
  description: 'Agent description'
});

// UPDATE
const updated = await helper.update('agents',
  { status: 'inactive' },
  { id: 'agent-id-here' }
);

// DELETE
await helper.delete('agents', { id: 'agent-id-here' });
```

### 3. Test Connection

```typescript
import { createClient } from '@/lib/supabase/client';
import { testConnection } from '@/lib/supabase/connection-helper';

const supabase = createClient();

const health = await testConnection(supabase);
console.log(`Connected: ${health.connected}`);
console.log(`Latency: ${health.latency}ms`);
if (!health.connected) {
  console.error(`Error: ${health.error}`);
}
```

### 4. Custom Retry Configuration

```typescript
import { executeWithRetry } from '@/lib/supabase/connection-helper';

// Custom retry settings
const result = await executeWithRetry(
  () => supabase.from('agents').select('*'),
  {
    maxRetries: 5,              // Try up to 5 times
    retryDelay: 2000,           // Wait 2 seconds between retries
    exponentialBackoff: true    // Double delay each retry (2s, 4s, 8s, etc.)
  }
);
```

## Common Patterns

### Fetching Agents in a Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { executeWithRetry } from '@/lib/supabase/connection-helper';

export function AgentList() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAgents() {
      const supabase = createClient();

      const result = await executeWithRetry(
        () => supabase
          .from('agents')
          .select('id, name, description, status')
          .eq('status', 'active')
          .order('name')
      );

      if (result.success) {
        setAgents(result.data || []);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
    }

    fetchAgents();
  }, []);

  if (loading) return <div>Loading agents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {agents.map(agent => (
        <li key={agent.id}>{agent.name}</li>
      ))}
    </ul>
  );
}
```

### API Route with Query Helper

```typescript
// app/api/my-agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseQueryHelper } from '@/lib/supabase/connection-helper';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: { headers: { 'X-Client-Info': 'my-api' } },
      db: { schema: 'public' }
    }
  );

  const helper = new SupabaseQueryHelper(supabase);

  const result = await helper.select('agents', {
    filters: { status: 'active' },
    order: { column: 'name', ascending: true }
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    agents: result.data,
    count: result.data?.length || 0
  });
}
```

### Server Action

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { executeWithRetry } from '@/lib/supabase/connection-helper';

export async function getActiveAgents() {
  const supabase = createClient();

  const result = await executeWithRetry(
    () => supabase
      .from('agents')
      .select('*')
      .eq('status', 'active')
  );

  return {
    success: result.success,
    agents: result.data || [],
    error: result.error?.message
  };
}
```

## Error Handling

### What Errors Are Automatically Retried?

The connection helper automatically retries these errors:
- ✅ SSL/TLS errors
- ✅ Connection timeouts (ETIMEDOUT)
- ✅ Connection reset (ECONNRESET)
- ✅ Connection refused (ECONNREFUSED)
- ✅ Socket hang up
- ✅ Network errors
- ✅ "Database is starting up" (PostgreSQL 57P03)
- ✅ "Too many connections" (PostgreSQL 53300)

### What Errors Are NOT Retried?

These errors fail immediately:
- ❌ Authentication errors
- ❌ Permission denied
- ❌ Invalid query syntax
- ❌ Table/column doesn't exist
- ❌ Data validation errors

### Custom Error Handling

```typescript
const result = await executeWithRetry(
  () => supabase.from('agents').select('*')
);

if (!result.success) {
  const error = result.error;

  // Check error type
  if (error.message.includes('permission denied')) {
    console.error('Authentication error:', error);
  } else if (error.message.includes('does not exist')) {
    console.error('Schema error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Testing

### Run the Connection Test

```bash
cd /Users/amine/Desktop/vitaal2/apps/vital-system
node test-connection.js
```

Expected output:
```
🎉 All critical tests passed! Database connection is working correctly.

Next steps:
1. SSL certificates are properly configured
2. Agents can be fetched successfully
3. Your application should now work without SSL errors
```

### In-App Health Check

```typescript
import { createClient } from '@/lib/supabase/client';
import { testConnection } from '@/lib/supabase/connection-helper';

async function checkDatabaseHealth() {
  const supabase = createClient();
  const health = await testConnection(supabase);

  return {
    status: health.connected ? 'healthy' : 'unhealthy',
    latency: health.latency,
    error: health.error
  };
}

// Use in a health check endpoint
export async function GET() {
  const health = await checkDatabaseHealth();
  return Response.json(health);
}
```

## Debugging

### Enable Retry Logging

The connection helper automatically logs retry attempts:

```
[Supabase] Retryable error on attempt 1/3. Retrying in 1000ms...
{ error: 'SSL connection error' }

[Supabase] Retryable error on attempt 2/3. Retrying in 2000ms...
{ error: 'ECONNRESET' }

[Supabase] Connection successful on attempt 3
```

### Check Environment Variables

```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Database URL includes SSL:',
  process.env.DATABASE_URL?.includes('sslmode=require')
);
```

## Best Practices

1. **Always use executeWithRetry for critical queries**
   ```typescript
   // ✅ Good
   const result = await executeWithRetry(() => supabase.from('agents').select('*'));

   // ❌ Avoid (no retry on connection errors)
   const { data, error } = await supabase.from('agents').select('*');
   ```

2. **Use SupabaseQueryHelper for CRUD operations**
   ```typescript
   // ✅ Good - built-in retry
   const helper = new SupabaseQueryHelper(supabase);
   const result = await helper.select('agents', { filters: { status: 'active' } });

   // ❌ Avoid - more verbose, no retry
   const { data, error } = await supabase.from('agents').select('*').eq('status', 'active');
   if (error) { /* handle error */ }
   ```

3. **Check result.success before using data**
   ```typescript
   // ✅ Good
   const result = await executeWithRetry(() => query);
   if (result.success) {
     console.log(result.data);
   } else {
     console.error(result.error);
   }

   // ❌ Avoid - might use null data
   const result = await executeWithRetry(() => query);
   console.log(result.data); // Could be null!
   ```

4. **Test connection on app startup**
   ```typescript
   // pages/_app.tsx or app/layout.tsx
   import { testConnection } from '@/lib/supabase/connection-helper';
   import { createClient } from '@/lib/supabase/client';

   useEffect(() => {
     async function verifyConnection() {
       const supabase = createClient();
       const health = await testConnection(supabase);

       if (!health.connected) {
         console.error('Database connection failed:', health.error);
         // Show user a warning banner
       }
     }

     verifyConnection();
   }, []);
   ```

## Need Help?

If you're still experiencing issues:

1. Run the test script: `node test-connection.js`
2. Check the `DATABASE_CONNECTION_FIXES.md` for detailed troubleshooting
3. Verify your `.env.local` includes `?sslmode=require` in database URLs
4. Check Supabase dashboard for any service issues

---

**Quick Reference Created:** 2025-12-03
**Status:** ✅ Ready to Use
