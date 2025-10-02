'use client';

import { KnowledgeUploader } from '@/features/knowledge/components/knowledge-uploader';

export default function KnowledgeUploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Knowledge</h1>
        <p className="text-muted-foreground mt-2">
          Add documents and files to your knowledge base for AI agents to reference.
        </p>
      </div>

      <KnowledgeUploader onUploadComplete={() => {
        // Optional: Add success message or redirect
      }} />
    </div>
  );
}