'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  FileText, 
  Image as ImageIcon, 
  File,
  FileCode,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';

type DocumentType = 'pdf' | 'image' | 'text' | 'code' | 'spreadsheet' | 'unknown';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  url?: string;
  previewUrl?: string;
  mimeType?: string;
  pages?: number;
  metadata?: Record<string, unknown>;
}

interface VitalDocumentPreviewProps {
  document: Document;
  onDownload?: (doc: Document) => void;
  onOpenExternal?: (doc: Document) => void;
  variant?: 'card' | 'inline' | 'thumbnail';
  showMetadata?: boolean;
  className?: string;
}

const typeIcons: Record<DocumentType, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: ImageIcon,
  text: FileText,
  code: FileCode,
  spreadsheet: FileSpreadsheet,
  unknown: File,
};

const typeColors: Record<DocumentType, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  image: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  code: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  spreadsheet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  unknown: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

/**
 * VitalDocumentPreview - Document preview component
 * 
 * Shows document cards with preview, metadata, and actions.
 * Supports multiple document types.
 */
export function VitalDocumentPreview({
  document,
  onDownload,
  onOpenExternal,
  variant = 'card',
  showMetadata = false,
  className
}: VitalDocumentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const Icon = typeIcons[document.type];
  const colors = typeColors[document.type];
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  if (variant === 'thumbnail') {
    return (
      <div 
        className={cn(
          "relative group cursor-pointer rounded-lg overflow-hidden border",
          "w-24 h-24 flex items-center justify-center bg-muted",
          className
        )}
        onClick={() => setIsPreviewOpen(true)}
      >
        {document.previewUrl && document.type === 'image' ? (
          <img 
            src={document.previewUrl} 
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-8 w-8 text-muted-foreground" />
        )}
        
        <div className={cn(
          "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100",
          "flex items-center justify-center transition-opacity"
        )}>
          <Eye className="h-6 w-6 text-white" />
        </div>
        
        <PreviewDialog 
          document={document}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          zoom={zoom}
          onZoomChange={setZoom}
          onDownload={onDownload}
        />
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",
        className
      )}>
        <div className={cn("p-2 rounded", colors)}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{document.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(document.size)}
            {document.pages && ` · ${document.pages} pages`}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onDownload && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onDownload(document)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <PreviewDialog 
          document={document}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          zoom={zoom}
          onZoomChange={setZoom}
          onDownload={onDownload}
        />
      </div>
    );
  }
  
  // Card variant (default)
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden bg-background",
      className
    )}>
      {/* Preview area */}
      <div 
        className="relative h-32 bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => setIsPreviewOpen(true)}
      >
        {document.previewUrl && document.type === 'image' ? (
          <img 
            src={document.previewUrl} 
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-12 w-12 text-muted-foreground" />
        )}
        
        <div className={cn(
          "absolute inset-0 bg-black/50 opacity-0 hover:opacity-100",
          "flex items-center justify-center transition-opacity"
        )}>
          <Eye className="h-8 w-8 text-white" />
        </div>
        
        <Badge className={cn("absolute top-2 right-2", colors)}>
          {document.type.toUpperCase()}
        </Badge>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h4 className="font-medium text-sm truncate" title={document.name}>
          {document.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {formatSize(document.size)}
            {document.pages && ` · ${document.pages} pages`}
          </span>
          
          <div className="flex items-center gap-1">
            {onDownload && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onDownload(document)}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            )}
            {onOpenExternal && document.url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onOpenExternal(document)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {showMetadata && document.metadata && (
          <div className="mt-2 pt-2 border-t space-y-1">
            {Object.entries(document.metadata).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{key}</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <PreviewDialog 
        document={document}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={onDownload}
      />
    </div>
  );
}

/**
 * PreviewDialog - Full-screen document preview
 */
function PreviewDialog({
  document,
  isOpen,
  onClose,
  zoom,
  onZoomChange,
  onDownload
}: {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onDownload?: (doc: Document) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate">{document.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onZoomChange(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {onDownload && (
                <Button
                  variant="outline"
                  onClick={() => onDownload(document)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-muted rounded-lg flex items-center justify-center">
          {document.previewUrl ? (
            document.type === 'image' ? (
              <img 
                src={document.previewUrl} 
                alt={document.name}
                style={{ transform: `scale(${zoom / 100})` }}
                className="transition-transform"
              />
            ) : document.type === 'pdf' ? (
              <iframe
                src={document.previewUrl}
                className="w-full h-full"
                title={document.name}
              />
            ) : (
              <div className="text-muted-foreground">
                Preview not available for this file type
              </div>
            )
          ) : (
            <div className="text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * VitalDocumentList - Grid of document previews
 */
export function VitalDocumentList({
  documents,
  onDownload,
  onOpenExternal,
  columns = 4,
  className
}: {
  documents: Document[];
  onDownload?: (doc: Document) => void;
  onOpenExternal?: (doc: Document) => void;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  
  return (
    <div className={cn(
      "grid gap-4",
      `sm:grid-cols-2 md:${colClasses[Math.min(columns, 3) as 3]} lg:${colClasses[columns]}`,
      className
    )}>
      {documents.map((doc) => (
        <VitalDocumentPreview
          key={doc.id}
          document={doc}
          onDownload={onDownload}
          onOpenExternal={onOpenExternal}
        />
      ))}
    </div>
  );
}

export default VitalDocumentPreview;
