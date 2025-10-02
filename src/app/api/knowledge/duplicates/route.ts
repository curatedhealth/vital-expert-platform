import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { areDocumentsDuplicate } from '@/lib/document-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all documents with basic metadata (using available columns)
    const { data: documents, error } = await supabase
      .from('knowledge_sources')
      .select(`
        id,
        name,
        title,
        file_path,
        file_size,
        mime_type,
        domain,
        created_at,
        is_public
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        success: true,
        duplicates: [],
        total: 0,
        message: 'No documents found'
      });
    }
    // Find duplicates
    const duplicates = [];
    const processed = new Set<string>();

    for (let i = 0; i < documents.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      if (processed.has(documents[i].id)) continue;

      // eslint-disable-next-line security/detect-object-injection
      const doc1 = documents[i];
      const group = [doc1];

      for (let j = i + 1; j < documents.length; j++) {
        // eslint-disable-next-line security/detect-object-injection
        if (processed.has(documents[j].id)) continue;

        // eslint-disable-next-line security/detect-object-injection
        const doc2 = documents[j];

        const duplicateCheck = areDocumentsDuplicate(
          {
            hash: '', // Hash not available in current schema
            name: doc1.name,
            size: doc1.file_size,
            title: doc1.title
          },
          {
            hash: '', // Hash not available in current schema
            name: doc2.name,
            size: doc2.file_size,
            title: doc2.title
          }
        );

        if (duplicateCheck.isDuplicate) {
          group.push(doc2);
          processed.add(doc2.id);
        }
      }

      if (group.length > 1) {
        duplicates.push({
          reason: 'unknown', // Will be determined by first duplicate check
          group: group.map(doc => ({
            id: doc.id,
            name: doc.name,
            title: doc.title,
            size: doc.file_size,
            domain: doc.domain,
            uploadedAt: doc.created_at,
            isGlobal: doc.is_public,
            hash: null
          }))
        });

        // Set the reason based on the first duplicate check
        if (duplicates.length > 0) {
          const lastGroup = duplicates[duplicates.length - 1];
          if (lastGroup.group.length > 1) {
            const checkResult = areDocumentsDuplicate(
              {
                hash: '',
                name: lastGroup.group[0].name,
                size: lastGroup.group[0].size,
                title: lastGroup.group[0].title
              },
              {
                hash: '',
                name: lastGroup.group[1].name,
                size: lastGroup.group[1].size,
                title: lastGroup.group[1].title
              }
            );
            lastGroup.reason = checkResult.reason;
          }
        }

        processed.add(doc1.id);
      }
    }

    const totalDuplicateDocuments = duplicates.reduce((sum, group) => sum + group.group.length, 0);
    return NextResponse.json({
      success: true,
      duplicates,
      duplicateGroups: duplicates.length,
      totalDuplicateDocuments,
      totalDocuments: documents.length,
      duplicatePercentage: Math.round((totalDuplicateDocuments / documents.length) * 100)
    });

  } catch (error) {
    console.error('Duplicate detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'keep-oldest'; // 'keep-oldest', 'keep-newest', 'keep-largest'

    // Get duplicates first
    const duplicatesResponse = await GET(request);
    const duplicatesData = await duplicatesResponse.json();

    if (!duplicatesData.success || duplicatesData.duplicates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found to remove',
        removed: 0
      });
    }

    const toRemove = [];

    for (const duplicateGroup of duplicatesData.duplicates) {
      const group = duplicateGroup.group;
      if (group.length <= 1) continue;

      // Determine which document to keep
      let keepIndex = 0;

      switch (mode) {
        case 'keep-newest':
          keepIndex = group.reduce((newest: number, doc: unknown, index: number) => {
            // eslint-disable-next-line security/detect-object-injection
            return new Date(doc.uploadedAt) > new Date(group[newest].uploadedAt) ? index : newest;
          }, 0);
          break;
        case 'keep-largest':
          keepIndex = group.reduce((largest: number, doc: unknown, index: number) => {
            // eslint-disable-next-line security/detect-object-injection
            return doc.size > group[largest].size ? index : largest;
          }, 0);
          break;
        case 'keep-oldest':
        default:
          keepIndex = group.reduce((oldest: number, doc: unknown, index: number) => {
            // eslint-disable-next-line security/detect-object-injection
            return new Date(doc.uploadedAt) < new Date(group[oldest].uploadedAt) ? index : oldest;
          }, 0);
          break;
      }

      // Mark all others for removal
      for (let i = 0; i < group.length; i++) {
        if (i !== keepIndex) {
          // eslint-disable-next-line security/detect-object-injection
          toRemove.push(group[i].id);
        }
      }
    }

    `);

    if (toRemove.length > 0) {
      // Remove from document_chunks first
      const { error: chunksError } = await supabase
        .from('document_chunks')
        .delete()
        .in('knowledge_source_id', toRemove);

      if (chunksError) {
        console.warn('Error removing chunks:', chunksError);
      }

      // Remove from knowledge_sources
      const { error: sourcesError } = await supabase
        .from('knowledge_sources')
        .delete()
        .in('id', toRemove);

      if (sourcesError) {
        throw new Error(`Failed to remove duplicates: ${sourcesError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      removed: toRemove.length,
      mode,
      message: `Successfully removed ${toRemove.length} duplicate documents using strategy: ${mode}`
    });

  } catch (error) {
    console.error('Duplicate removal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}