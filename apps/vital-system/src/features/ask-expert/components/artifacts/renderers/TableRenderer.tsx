'use client';

/**
 * VITAL Platform - TableRenderer (Artifact Wrapper)
 *
 * Artifact-specific wrapper around VitalDataTable for tabular artifacts.
 * Adds data parsing, column inference, and artifact-specific features.
 *
 * ARCHITECTURE: Wraps VitalDataTable for core rendering
 * - VitalDataTable handles: sorting, search, CSV export, column rendering
 * - This wrapper adds: JSON/CSV parsing, column inference, type detection
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VitalDataTable } from '@/components/vital-ai-ui/data/VitalDataTable';
import { AlertCircle, TableIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableRendererProps {
  /** Table data (JSON string, CSV string, or array of objects) */
  content: string | Record<string, unknown>[];
  /** Column definitions (auto-inferred if not provided) */
  columns?: TableColumn[];
  /** Table title */
  title?: string;
  /** Enable search */
  searchable?: boolean;
  /** Enable export */
  exportable?: boolean;
  /** Max height before scrolling */
  maxHeight?: number;
  /** Show row count badge */
  showRowCount?: boolean;
  /** Custom class names */
  className?: string;
  /** Called when export is requested */
  onExport?: (data: Record<string, unknown>[]) => void;
  /** Called when regenerate is requested */
  onRegenerate?: () => void;
}

// =============================================================================
// DATA PARSING
// =============================================================================

function parseTableData(content: string | Record<string, unknown>[]): {
  data: Record<string, unknown>[];
  error: string | null;
} {
  // Already an array
  if (Array.isArray(content)) {
    return { data: content, error: null };
  }

  // Try JSON parsing first
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return { data: parsed, error: null };
    }
    // Handle object with data/rows property
    if (parsed.data && Array.isArray(parsed.data)) {
      return { data: parsed.data, error: null };
    }
    if (parsed.rows && Array.isArray(parsed.rows)) {
      return { data: parsed.rows, error: null };
    }
    return { data: [], error: 'Invalid JSON format: expected array or object with data/rows' };
  } catch {
    // Not JSON, try CSV parsing
    return parseCSV(content);
  }
}

function parseCSV(content: string): {
  data: Record<string, unknown>[];
  error: string | null;
} {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return { data: [], error: 'CSV must have at least header and one data row' };
  }

  try {
    // Parse header (handle quoted values)
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const data = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        const value = values[idx] || '';
        // Try to parse numbers
        const numValue = parseFloat(value);
        row[header] = !isNaN(numValue) && value.trim() !== '' ? numValue : value;
      });
      return row;
    });

    return { data, error: null };
  } catch (err) {
    return { data: [], error: `Failed to parse CSV: ${err}` };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function inferColumns(data: Record<string, unknown>[]): TableColumn[] {
  if (data.length === 0) return [];

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  return keys.map((key) => {
    const value = firstRow[key];
    const isNumeric = typeof value === 'number' ||
      (typeof value === 'string' && !isNaN(parseFloat(value)));

    return {
      key,
      label: formatColumnLabel(key),
      sortable: true,
      align: isNumeric ? 'right' as const : 'left' as const,
    };
  });
}

function formatColumnLabel(key: string): string {
  // Convert snake_case and camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// =============================================================================
// COMPONENT
// =============================================================================

export const TableRenderer = memo(function TableRenderer({
  content,
  columns: providedColumns,
  title,
  searchable = true,
  exportable = true,
  maxHeight = 400,
  showRowCount = true,
  className,
  onExport,
  onRegenerate,
}: TableRendererProps) {
  // Parse data
  const { data, error } = useMemo(() => parseTableData(content), [content]);

  // Infer or use provided columns
  const columns = useMemo(() => {
    if (providedColumns && providedColumns.length > 0) {
      return providedColumns;
    }
    return inferColumns(data);
  }, [providedColumns, data]);

  // Convert to VitalDataTable column format
  const vitalColumns = useMemo(() => {
    return columns.map((col) => ({
      key: col.key as keyof Record<string, unknown>,
      label: col.label,
      sortable: col.sortable ?? true,
      align: col.align,
      width: col.width,
    }));
  }, [columns]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50',
          className
        )}
        style={{ minHeight: maxHeight }}
      >
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-sm text-red-600 text-center">{error}</p>
        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Table
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-lg border border-stone-200 bg-stone-50',
          className
        )}
        style={{ minHeight: maxHeight }}
      >
        <TableIcon className="h-10 w-10 text-stone-300 mb-3" />
        <p className="text-sm text-stone-500">No data to display</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg overflow-hidden', className)}>
      <VitalDataTable
        data={data}
        columns={vitalColumns}
        title={title}
        searchable={searchable}
        exportable={exportable}
        maxHeight={maxHeight}
        showRowCount={showRowCount}
        onExport={onExport}
        emptyMessage="No data to display"
      />
    </div>
  );
});

export default TableRenderer;
