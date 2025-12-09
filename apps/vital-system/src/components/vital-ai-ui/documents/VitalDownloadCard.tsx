'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  File,
  Loader2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type FileFormat = 'pdf' | 'csv' | 'xlsx' | 'json' | 'docx' | 'txt' | 'md';

interface DownloadOption {
  format: FileFormat;
  label: string;
  description?: string;
  size?: number;
  isRecommended?: boolean;
}

interface VitalDownloadCardProps {
  title: string;
  description?: string;
  options: DownloadOption[];
  onDownload: (format: FileFormat) => Promise<void>;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const formatIcons: Record<FileFormat, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  json: FileCode,
  docx: FileText,
  txt: FileText,
  md: FileText,
};

const formatColors: Record<FileFormat, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  csv: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  xlsx: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  json: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  txt: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  md: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * VitalDownloadCard - Export/download options component
 * 
 * Shows available download formats with one-click download.
 * Supports multiple export formats for generated content.
 */
export function VitalDownloadCard({
  title,
  description,
  options,
  onDownload,
  variant = 'default',
  className
}: VitalDownloadCardProps) {
  const [downloading, setDownloading] = useState<FileFormat | null>(null);
  const [completed, setCompleted] = useState<FileFormat[]>([]);

  const handleDownload = async (format: FileFormat) => {
    setDownloading(format);
    try {
      await onDownload(format);
      setCompleted(prev => [...prev, format]);
      setTimeout(() => {
        setCompleted(prev => prev.filter(f => f !== format));
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-muted-foreground">Export:</span>
        {options.map((option) => {
          const Icon = formatIcons[option.format];
          const isDownloading = downloading === option.format;
          const isCompleted = completed.includes(option.format);
          
          return (
            <Button
              key={option.format}
              variant="outline"
              size="sm"
              onClick={() => handleDownload(option.format)}
              disabled={isDownloading}
              className="h-7"
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <Icon className="h-3 w-3 mr-1" />
              )}
              {option.format.toUpperCase()}
            </Button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const Icon = formatIcons[option.format];
          const isDownloading = downloading === option.format;
          const isCompleted = completed.includes(option.format);
          
          return (
            <Button
              key={option.format}
              variant="outline"
              onClick={() => handleDownload(option.format)}
              disabled={isDownloading}
              className={cn(
                "flex items-center gap-2",
                isCompleted && "border-green-500"
              )}
            >
              <div className={cn("p-1 rounded", formatColors[option.format])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">
                  {option.label}
                </div>
                {option.size && (
                  <div className="text-xs text-muted-foreground">
                    {formatSize(option.size)}
                  </div>
                )}
              </div>
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
              ) : (
                <Download className="h-4 w-4 ml-2" />
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">{title}</h4>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        {options.map((option) => {
          const Icon = formatIcons[option.format];
          const isDownloading = downloading === option.format;
          const isCompleted = completed.includes(option.format);
          
          return (
            <div
              key={option.format}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                "hover:bg-muted/50",
                isCompleted && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
                option.isRecommended && !isCompleted && "border-primary/50 bg-primary/5"
              )}
            >
              <div className={cn("p-2 rounded", formatColors[option.format])}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  {option.isRecommended && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Recommended
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                )}
                {option.size && (
                  <span className="text-xs text-muted-foreground">
                    {formatSize(option.size)}
                  </span>
                )}
              </div>
              
              <Button
                variant={option.isRecommended ? "default" : "outline"}
                size="sm"
                onClick={() => handleDownload(option.format)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VitalDownloadCard;
