'use client';

import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface BatchUploadPanelProps {
  title?: string;
  description?: string;
  endpoint?: string;
  acceptedFormats?: string[];
  maxFileSize?: number;
}

export default function BatchUploadPanel({
  title = "Batch Upload",
  description = "Upload multiple files or data in batch",
  endpoint = "/api/upload/batch",
  acceptedFormats = ['.csv', '.json', '.xlsx'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: BatchUploadPanelProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFiles: FileList | null) => {
    setFiles(selectedFiles);
    setError('');
    setResults([]);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        setResults(result.results || [result]);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Accepted formats: {acceptedFormats.join(', ')} (Max {Math.round(maxFileSize / 1024 / 1024)}MB each)
            </p>
          </div>

          {files && files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-1">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">
                      ({Math.round(file.size / 1024)}KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !files || files.length === 0}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <Label>Upload Results</Label>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Alert key={index} variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <AlertDescription>
                      {result.success
                        ? `File ${index + 1}: ${result.message || 'Upload successful'}`
                        : `File ${index + 1}: ${result.error || 'Upload failed'}`
                      }
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}