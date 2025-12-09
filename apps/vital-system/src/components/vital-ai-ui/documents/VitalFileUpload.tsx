'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  File,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface VitalFileUploadProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * VitalFileUpload - File upload component with drag & drop
 * 
 * Supports multiple files, progress tracking, and validation.
 * Reusable across all services.
 */
export function VitalFileUpload({
  accept,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,
  disabled = false,
  multiple = true,
  className
}: VitalFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File too large. Max size: ${formatSize(maxSize)}`;
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        return `File type not accepted. Accepted: ${accept}`;
      }
    }
    
    return null;
  }, [accept, maxSize]);

  const addFiles = useCallback((newFiles: File[]) => {
    const filesToAdd = multiple 
      ? newFiles.slice(0, maxFiles - files.length)
      : newFiles.slice(0, 1);
    
    const newFileItems: FileWithProgress[] = filesToAdd.map((file) => {
      const error = validateFile(file);
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      };
    });
    
    setFiles(prev => multiple ? [...prev, ...newFileItems] : newFileItems);
  }, [files.length, maxFiles, multiple, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [disabled, addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selectedFiles);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // Update all pending to uploading
    setFiles(prev => prev.map(f => 
      f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
    ));

    try {
      // Simulate progress for demo (replace with actual upload logic)
      for (const fileItem of pendingFiles) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 50 } : f
        ));
      }

      await onUpload(pendingFiles.map(f => f.file));

      // Mark all as success
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f
      ));
    } catch (error) {
      // Mark all as error
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: 'Upload failed' } 
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  }, []);

  const hasFiles = files.length > 0;
  const hasPending = files.some(f => f.status === 'pending');
  const hasCompleted = files.some(f => f.status === 'success');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !isDragging && "hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "p-3 rounded-full",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {accept && <span>Accepted: {accept} · </span>}
            Max size: {formatSize(maxSize)}
            {multiple && ` · Max ${maxFiles} files`}
          </div>
        </div>
      </div>

      {/* File list */}
      {hasFiles && (
        <div className="space-y-2">
          {files.map((fileItem) => {
            const Icon = getFileIcon(fileItem.file.type);
            
            return (
              <div
                key={fileItem.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  fileItem.status === 'error' && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
                  fileItem.status === 'success' && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                )}
              >
                <div className="p-2 rounded bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(fileItem.file.size)}</span>
                    {fileItem.error && (
                      <span className="text-red-600">{fileItem.error}</span>
                    )}
                  </div>
                  
                  {fileItem.status === 'uploading' && (
                    <Progress value={fileItem.progress} className="h-1 mt-2" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {fileItem.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {fileItem.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={fileItem.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {hasFiles && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex gap-2">
            {hasCompleted && (
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
            {hasPending && (
              <Button 
                size="sm" 
                onClick={uploadFiles}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {files.filter(f => f.status === 'pending').length} Files
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VitalFileUpload;
