import { createClient } from '@supabase/supabase-js';

export class SQLExecutor {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async executeSQL(sql: string): Promise<{ data?: any; error?: any }> {
    // First try using the built-in SQL execution
    try {
      const { data, error } = await this.supabase.rpc('exec_sql', { sql });
      if (!error) {
        return { data };
      }
    } catch (firstAttemptError) {
      // Continue to alternative methods
    }

    // Try alternative execution via direct REST API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql })
      });

      if (response.ok) {
        const data = await response.json();
        return { data };
      } else {
        const errorText = await response.text();
        return { error: { message: errorText } };
      }
    } catch (secondAttemptError) {
      // Final fallback: try to parse and execute statement by statement
      return this.executeStatements(sql);
    }
  }

  private async executeStatements(sql: string): Promise<{ data?: any; error?: any }> {
    const statements = this.parseSQLStatements(sql);
    const results = [];

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Try to execute individual statements using table operations where possible
          const result = await this.executeIndividualStatement(statement);
          results.push(result);
        } catch (error) {
          return { error: { message: `Failed to execute: ${statement.substring(0, 50)}... - ${error}` } };
        }
      }
    }

    return { data: results };
  }

  private parseSQLStatements(sql: string): string[] {
    // Simple SQL statement parser - splits on semicolons but handles some edge cases
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const char = sql[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar && sql[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
        current += char;
      } else if (!inString && char === ';') {
        if (current.trim()) {
          statements.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements.filter(stmt =>
      stmt.length > 0 &&
      !stmt.startsWith('--') &&
      !stmt.startsWith('/*') &&
      stmt.toLowerCase() !== 'commit' &&
      stmt.toLowerCase() !== 'begin'
    );
  }

  private async executeIndividualStatement(statement: string): Promise<unknown> {
    const trimmed = statement.trim().toLowerCase();

    // Handle CREATE TABLE statements
    if (trimmed.startsWith('create table')) {
      return this.executeRawSQL(statement);
    }

    // Handle ALTER TABLE statements
    if (trimmed.startsWith('alter table')) {
      return this.executeRawSQL(statement);
    }

    // Handle CREATE INDEX statements
    if (trimmed.startsWith('create index') || trimmed.startsWith('create unique index')) {
      return this.executeRawSQL(statement);
    }

    // Handle COMMENT statements
    if (trimmed.startsWith('comment on')) {
      return this.executeRawSQL(statement);
    }

    // Handle CREATE TRIGGER statements
    if (trimmed.startsWith('create trigger')) {
      return this.executeRawSQL(statement);
    }

    // Handle CREATE FUNCTION statements
    if (trimmed.startsWith('create function') || trimmed.startsWith('create or replace function')) {
      return this.executeRawSQL(statement);
    }

    // Handle ENABLE ROW LEVEL SECURITY
    if (trimmed.includes('enable row level security')) {
      return this.executeRawSQL(statement);
    }

    // Handle CREATE POLICY statements
    if (trimmed.startsWith('create policy')) {
      return this.executeRawSQL(statement);
    }

    // Default: try raw SQL execution
    return this.executeRawSQL(statement);
  }

  private async executeRawSQL(statement: string): Promise<unknown> {
    // Use the Supabase client's underlying fetch capability
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({ sql: statement })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    try {
      return await response.json();
    } catch {
      return { success: true };
    }
  }
}

export function createSQLExecutor(supabaseUrl?: string, supabaseKey?: string): SQLExecutor {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required');
  }

  return new SQLExecutor(url, key);
}