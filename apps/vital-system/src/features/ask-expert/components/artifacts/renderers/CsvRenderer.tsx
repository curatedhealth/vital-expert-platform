'use client';

/**
 * VITAL Platform - CsvRenderer Component
 *
 * Parses and renders CSV data as an interactive table with sorting,
 * search, pagination, and export capabilities.
 *
 * Features:
 * - Auto-detect delimiter (comma, semicolon, tab)
 * - Column sorting (ascending/descending)
 * - Global search filtering
 * - Pagination for large datasets
 * - Export to CSV/JSON
 * - Theme support (dark/light)
 *
 * Uses the same table design as TableRenderer for consistency.
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  ArrowDown,
  Search,
  Copy,
  Check,
  Download,
  Sun,
  Moon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export interface CsvRendererProps {
  /** CSV content string */
  content: string;
  /** Custom delimiter (auto-detected if not provided) */
  delimiter?: ',' | ';' | '\t' | '|';
  /** Whether first row is header (default: true) */
  hasHeader?: boolean;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Custom class names */
  className?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Rows per page (default: 25) */
  rowsPerPage?: number;
  /** Called when copy is clicked */
  onCopy?: () => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface ParsedCsv {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

// =============================================================================
// CSV PARSING
// =============================================================================

function detectDelimiter(content: string): ',' | ';' | '\t' | '|' {
  const firstLines = content.split('\n').slice(0, 5).join('\n');
  const delimiters: Array<',' | ';' | '\t' | '|'> = [',', ';', '\t', '|'];

  let bestDelimiter: ',' | ';' | '\t' | '|' = ',';
  let maxCount = 0;

  for (const d of delimiters) {
    const count = (firstLines.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  }

  return bestDelimiter;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = false;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCsv(content: string, delimiter?: string, hasHeader = true): ParsedCsv {
  const effectiveDelimiter = delimiter || detectDelimiter(content);
  const lines = content.trim().split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return { headers: [], rows: [], delimiter: effectiveDelimiter };
  }

  const parsedLines = lines.map(line => parseCsvLine(line, effectiveDelimiter));

  if (hasHeader) {
    const headers = parsedLines[0];
    const rows = parsedLines.slice(1);
    return { headers, rows, delimiter: effectiveDelimiter };
  }

  // Generate column headers (A, B, C, ...)
  const maxCols = Math.max(...parsedLines.map(row => row.length));
  const headers = Array.from({ length: maxCols }, (_, i) =>
    String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26)) : '')
  );

  return { headers, rows: parsedLines, delimiter: effectiveDelimiter };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CsvRenderer = memo(function CsvRenderer({
  content,
  delimiter,
  hasHeader = true,
  theme: initialTheme = 'dark',
  className,
  maxHeight = '500px',
  rowsPerPage = 25,
  onCopy,
}: CsvRendererProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse CSV
  const { headers, rows, delimiter: detectedDelimiter } = useMemo(
    () => parseCsv(content, delimiter, hasHeader),
    [content, delimiter, hasHeader]
  );

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row =>
      row.some(cell => cell.toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  // Sort filtered rows
  const sortedRows = useMemo(() => {
    if (sortColumn === null || sortDirection === null) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn] || '';
      const bVal = b[sortColumn] || '';

      // Try numeric comparison
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleSort = useCallback((colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colIndex);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy CSV:', err);
    }
  }, [content, onCopy]);

  const handleDownloadCsv = useCallback(() => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [content]);

  const handleDownloadJson = useCallback(() => {
    const jsonData = rows.map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [rows, headers]);

  // Error state
  if (headers.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          theme === 'dark'
            ? 'border-red-500/30 bg-red-500/10'
            : 'border-red-300 bg-red-50',
          className
        )}
      >
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">CSV Parse Error</span>
        </div>
        <p
          className={cn(
            'mt-2 text-sm',
            theme === 'dark' ? 'text-red-300' : 'text-red-600'
          )}
        >
          Could not parse CSV content. Please check the format.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        theme === 'dark' ? 'border-stone-700 bg-stone-900' : 'border-stone-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          theme === 'dark'
            ? 'bg-stone-800/50 border-stone-700'
            : 'bg-stone-50 border-stone-200'
        )}
      >
        {/* Title + Stats + Search */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              theme === 'dark'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-green-100 text-green-600'
            )}
          >
            CSV
          </span>
          <span
            className={cn(
              'text-xs',
              theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            {rows.length} rows × {headers.length} cols
          </span>

          {/* Search input */}
          <div className="relative">
            <Search
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3',
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              )}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pl-7 pr-2 py-1 text-xs rounded border w-32 focus:outline-none focus:ring-1 focus:ring-purple-500',
                theme === 'dark'
                  ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                  : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </TooltipContent>
            </Tooltip>

            {/* Download CSV */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadCsv}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Download CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download CSV</TooltipContent>
            </Tooltip>

            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Copy CSV"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {copied ? 'Copied!' : 'Copy'}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Table */}
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          <thead
            className={cn(
              'sticky top-0',
              theme === 'dark' ? 'bg-stone-800' : 'bg-stone-50'
            )}
          >
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(idx)}
                  className={cn(
                    'px-4 py-2 text-left font-medium cursor-pointer select-none',
                    'border-b',
                    theme === 'dark'
                      ? 'border-stone-700 text-stone-300 hover:bg-stone-700/50'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{header}</span>
                    {sortColumn === idx && sortDirection && (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-purple-500" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-purple-500" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={cn(
                  'border-b',
                  theme === 'dark'
                    ? 'border-stone-800 hover:bg-stone-800/50'
                    : 'border-stone-100 hover:bg-stone-50'
                )}
              >
                {headers.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-4 py-2',
                      theme === 'dark' ? 'text-stone-300' : 'text-stone-700'
                    )}
                  >
                    {row[colIdx] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 border-t',
            theme === 'dark'
              ? 'border-stone-700 bg-stone-800/30'
              : 'border-stone-200 bg-stone-50'
          )}
        >
          <span
            className={cn(
              'text-xs',
              theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            Page {currentPage} of {totalPages}
            {searchTerm && ` (${filteredRows.length} filtered)`}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={cn(
                'h-7 w-7',
                theme === 'dark'
                  ? 'text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30'
              )}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                'h-7 w-7',
                theme === 'dark'
                  ? 'text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30'
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                'h-7 w-7',
                theme === 'dark'
                  ? 'text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30'
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                'h-7 w-7',
                theme === 'dark'
                  ? 'text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30'
              )}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CsvRenderer;
