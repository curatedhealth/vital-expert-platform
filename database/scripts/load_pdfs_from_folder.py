"""
Load PDFs from RAG Docs Folder
Extracts text from PDFs and inserts into knowledge_documents table
Uses folder structure to determine domain (category)
"""

import os
import re
import hashlib
from pathlib import Path
from typing import Optional, Tuple
from supabase import create_client

# PDF extraction
try:
    from pypdf import PdfReader
except ImportError:
    print("pypdf not installed. Run: pip install pypdf")
    exit(1)

# Configuration
RAG_DOCS_PATH = "/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/rag docs"
BATCH_SIZE = 10  # Documents per batch insert
MIN_CONTENT_LENGTH = 100  # Skip PDFs with less content

# Domain mapping from folder names
DOMAIN_MAP = {
    'change management': 'Change Management',
    'coaching': 'Coaching',
    'design thinking': 'Design Thinking',
    'digital health': 'Digital Health',
    'futures thinking': 'Futures Thinking',
    'knowledge base': 'Knowledge Base',
    'layer 1 digital health foundations': 'Digital Health Foundations',
    'layer 2 law, regulations and compliance': 'Regulations & Compliance',
    'layer 3 practical use cases, leading practices and guidances': 'Use Cases & Best Practices',
    'extra material': 'Supplementary',
    'startups material': 'Startups',
}


def get_domain_from_path(file_path: str) -> str:
    """Extract domain from folder structure"""
    rel_path = file_path.replace(RAG_DOCS_PATH, '').lower()
    parts = rel_path.split(os.sep)

    for part in parts:
        part_clean = part.strip()
        if part_clean in DOMAIN_MAP:
            return DOMAIN_MAP[part_clean]

    return 'General'


def extract_pdf_text(pdf_path: str) -> Tuple[Optional[str], int]:
    """
    Extract text from PDF file
    Returns (text, page_count) or (None, 0) on failure
    """
    try:
        reader = PdfReader(pdf_path)
        page_count = len(reader.pages)

        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        full_text = '\n\n'.join(text_parts)

        # Clean up text
        full_text = re.sub(r'\s+', ' ', full_text)  # Normalize whitespace
        full_text = full_text.strip()

        return full_text, page_count

    except Exception as e:
        print(f"   Error reading PDF: {str(e)[:50]}")
        return None, 0


def get_title_from_filename(filename: str) -> str:
    """Clean title from filename"""
    title = os.path.splitext(filename)[0]
    # Remove common prefixes
    title = re.sub(r'^\d+[\.\-_\s]+', '', title)  # Remove leading numbers
    title = re.sub(r'_+', ' ', title)  # Replace underscores
    title = re.sub(r'\s+', ' ', title)  # Normalize spaces
    return title.strip()


def generate_doc_hash(file_path: str) -> str:
    """Generate unique hash for document deduplication"""
    return hashlib.md5(file_path.encode()).hexdigest()


def main():
    # Initialize Supabase
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not all([supabase_url, supabase_key]):
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        exit(1)

    supabase = create_client(supabase_url, supabase_key)

    print("=" * 60)
    print("PDF DOCUMENT LOADER")
    print("=" * 60)
    print(f"\nSource: {RAG_DOCS_PATH}")

    # Get existing document filenames to avoid duplicates
    existing_result = supabase.table('knowledge_documents')\
        .select('file_name')\
        .not_.is_('file_name', 'null')\
        .execute()
    existing_filenames = {doc['file_name'] for doc in existing_result.data}
    print(f"Existing documents with file_name: {len(existing_filenames)}")

    # Find all PDFs
    pdf_files = []
    for root, dirs, files in os.walk(RAG_DOCS_PATH):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))

    print(f"Found {len(pdf_files)} PDF files")

    # Process PDFs
    inserted = 0
    skipped_duplicate = 0
    skipped_empty = 0
    skipped_error = 0

    documents_to_insert = []

    for i, pdf_path in enumerate(pdf_files):
        filename = os.path.basename(pdf_path)

        # Check duplicate by filename
        if filename in existing_filenames:
            skipped_duplicate += 1
            continue

        # Extract text
        content, page_count = extract_pdf_text(pdf_path)

        if not content or len(content) < MIN_CONTENT_LENGTH:
            skipped_empty += 1
            continue

        # Get metadata
        title = get_title_from_filename(filename)
        domain = get_domain_from_path(pdf_path)

        # Get file size
        try:
            file_size = os.path.getsize(pdf_path)
        except:
            file_size = None

        # Create document record (using existing table columns)
        doc_data = {
            'title': title[:500],  # Limit title length
            'content': content[:100000],  # Limit content to 100K chars
            'domain': domain,
            'file_name': filename,
            'file_type': 'pdf',
            'file_size': file_size,
            'tags': [],
            'status': 'active'
        }

        documents_to_insert.append(doc_data)

        # Batch insert
        if len(documents_to_insert) >= BATCH_SIZE:
            try:
                result = supabase.table('knowledge_documents').insert(documents_to_insert).execute()
                inserted += len(result.data)
                print(f"  [{inserted}/{len(pdf_files) - skipped_duplicate}] Inserted {len(result.data)} documents...")

                # Add to existing filenames
                for doc in documents_to_insert:
                    existing_filenames.add(doc['file_name'])

            except Exception as e:
                skipped_error += len(documents_to_insert)
                print(f"  Batch insert error: {str(e)[:100]}")

            documents_to_insert = []

        # Progress every 50 files
        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(pdf_files)} files...")

    # Insert remaining
    if documents_to_insert:
        try:
            result = supabase.table('knowledge_documents').insert(documents_to_insert).execute()
            inserted += len(result.data)
        except Exception as e:
            skipped_error += len(documents_to_insert)
            print(f"  Final batch error: {str(e)[:100]}")

    # Summary
    print("\n" + "=" * 60)
    print("LOAD COMPLETE")
    print("=" * 60)
    print(f"Total PDFs found:     {len(pdf_files)}")
    print(f"Documents inserted:   {inserted}")
    print(f"Skipped (duplicate):  {skipped_duplicate}")
    print(f"Skipped (empty/short):{skipped_empty}")
    print(f"Skipped (error):      {skipped_error}")

    # Final count
    final_result = supabase.table('knowledge_documents').select('id', count='exact').execute()
    print(f"\nTotal documents in DB: {final_result.count}")


if __name__ == '__main__':
    main()
