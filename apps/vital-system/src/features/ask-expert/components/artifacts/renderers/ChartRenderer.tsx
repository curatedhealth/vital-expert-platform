'use client';

/**
 * VITAL Platform - ChartRenderer Component
 *
 * Dynamic chart rendering using Recharts library.
 * Supports multiple chart types with automatic data parsing.
 *
 * Features:
 * - Multiple chart types: line, bar, area, pie, radar
 * - Auto-detection of chart type from data
 * - Responsive sizing
 * - Interactive tooltips
 * - Export to PNG
 * - VITAL brand colors
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Download,
  BarChart3,
  LineChartIcon,
  PieChartIcon,
  AreaChartIcon,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// =============================================================================
// TYPES
// =============================================================================

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'auto';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartRendererProps {
  /** Chart data (JSON string or array) */
  content: string | ChartDataPoint[];
  /** Chart type (auto-detected if not specified) */
  chartType?: ChartType;
  /** Chart title */
  title?: string;
  /** Chart height */
  height?: number;
  /** Custom colors for data series */
  colors?: string[];
  /** Show legend */
  showLegend?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Custom class names */
  className?: string;
  /** Called when chart is regenerated */
  onRegenerate?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// VITAL brand color palette for charts
const CHART_COLORS = [
  '#9055E0', // Primary purple
  '#7C3AED', // Deep purple
  '#60A5FA', // Blue
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#F87171', // Red
  '#A78BFA', // Light purple
  '#38BDF8', // Sky blue
];

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  line: LineChartIcon,
  bar: BarChart3,
  area: AreaChartIcon,
  pie: PieChartIcon,
  radar: BarChart3, // No radar icon in lucide, use bar as fallback
  auto: BarChart3,
};

// =============================================================================
// DATA PARSING
// =============================================================================

function parseChartData(content: string | ChartDataPoint[]): {
  data: ChartDataPoint[];
  error: string | null;
} {
  if (Array.isArray(content)) {
    return { data: content, error: null };
  }

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return { data: parsed, error: null };
    }
    // Handle object with data property
    if (parsed.data && Array.isArray(parsed.data)) {
      return { data: parsed.data, error: null };
    }
    return { data: [], error: 'Invalid data format: expected array' };
  } catch (err) {
    return { data: [], error: `Failed to parse JSON: ${err}` };
  }
}

function detectChartType(data: ChartDataPoint[]): ChartType {
  if (data.length === 0) return 'bar';

  const firstItem = data[0];
  const keys = Object.keys(firstItem).filter((k) => k !== 'name');

  // If single numeric value per item, pie chart might be appropriate
  if (keys.length === 1 && data.length <= 10) {
    return 'pie';
  }

  // If many data points, line chart works well
  if (data.length > 10) {
    return 'line';
  }

  // Default to bar chart
  return 'bar';
}

function getDataKeys(data: ChartDataPoint[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0]).filter((k) => k !== 'name' && typeof data[0][k] === 'number');
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ChartRenderer = memo(function ChartRenderer({
  content,
  chartType = 'auto',
  title,
  height = 400,
  colors = CHART_COLORS,
  showLegend = true,
  showGrid = true,
  className,
  onRegenerate,
}: ChartRendererProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(chartType);

  // Parse data
  const { data, error } = useMemo(() => parseChartData(content), [content]);

  // Determine actual chart type
  const actualChartType = useMemo(() => {
    if (selectedChartType === 'auto') {
      return detectChartType(data);
    }
    return selectedChartType;
  }, [selectedChartType, data]);

  // Get data keys for multi-series charts
  const dataKeys = useMemo(() => getDataKeys(data), [data]);

  // Export chart as PNG
  const handleExport = useCallback(() => {
    if (!chartRef.current) return;

    // Find SVG element
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get SVG dimensions
    const svgRect = svg.getBoundingClientRect();
    canvas.width = svgRect.width * 2; // 2x for retina
    canvas.height = svgRect.height * 2;
    ctx.scale(2, 2);

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Draw to canvas
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Download
      const link = document.createElement('a');
      link.download = `${title || 'chart'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [title]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50',
          className
        )}
        style={{ height }}
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
            Regenerate Chart
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
        style={{ height }}
      >
        <BarChart3 className="h-10 w-10 text-stone-300 mb-3" />
        <p className="text-sm text-stone-500">No data to display</p>
      </div>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    switch (actualChartType) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0] || 'value'}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 150)}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: '#9ca3af' }}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend />}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  const ChartTypeIcon = CHART_TYPE_ICONS[actualChartType];

  return (
    <div className={cn('rounded-lg border border-stone-200 bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <ChartTypeIcon className="h-5 w-5 text-[var(--ae-accent-primary,#9055E0)]" />
          {title && (
            <h3 className="font-medium text-stone-800">{title}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type selector */}
          <Select
            value={selectedChartType}
            onValueChange={(value) => setSelectedChartType(value as ChartType)}
          >
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
              <SelectItem value="radar">Radar</SelectItem>
            </SelectContent>
          </Select>

          {/* Export button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default ChartRenderer;
