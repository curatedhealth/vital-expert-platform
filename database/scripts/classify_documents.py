"""
Classify Documents: Link to Sources & Assign Document Types
Uses AI to:
1. Match documents to sources based on title/content
2. Classify document types (peer_review, guideline, white_paper, etc.)
"""

import os
import json
import time
from supabase import create_client
from openai import OpenAI

# Initialize clients
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
openai_key = os.environ.get('OPENAI_API_KEY')

if not all([supabase_url, supabase_key, openai_key]):
    print("Missing environment variables. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY")
    exit(1)

supabase = create_client(supabase_url, supabase_key)
openai_client = OpenAI(api_key=openai_key)

# Document types with descriptions for AI
DOCUMENT_TYPES = {
    'peer_review': 'Peer-reviewed scientific/medical research papers',
    'guideline': 'Official guidelines and recommendations from authorities',
    'directive': 'Regulatory directives and requirements',
    'standard': 'Industry standards and specifications',
    'systematic_review': 'Systematic reviews and meta-analyses',
    'report': 'Industry reports and analyses',
    'white_paper': 'White papers and technical documents',
    'case_study': 'Case studies and real-world examples',
    'technical_brief': 'Technical briefs and summaries',
    'point_of_view': 'Expert perspectives and opinions',
    'conference_readout': 'Conference presentations and summaries',
    'article': 'General articles and news coverage',
    'press_release': 'Press releases and announcements',
    'blog_post': 'Blog posts and informal content',
    'interview': 'Interviews and Q&A sessions',
    'newsletter': 'Newsletter content',
    'tutorial': 'How-to guides and tutorials',
    'training': 'Training materials and courses',
    'webinar': 'Webinar content and recordings',
    'transcript': 'Transcripts (podcasts, videos, meetings)',
    'data_sheet': 'Product data sheets and specifications',
    'patent': 'Patents and intellectual property',
    'clinical_trial': 'Clinical trial results and protocols',
    'fda_submission': 'FDA submissions (510k, PMA, etc.)',
    'other': 'Other/uncategorized'
}


def get_sources():
    """Get all sources with their names and codes"""
    result = supabase.table('sources').select('id, code, name, short_name').execute()
    return {src['id']: src for src in result.data}


def get_source_list_for_prompt(sources):
    """Create a compact source list for AI prompts"""
    source_list = []
    for src_id, src in sources.items():
        source_list.append(f"- {src['code']}: {src['name']}")
    return "\n".join(source_list[:100])  # Limit to 100 sources for prompt size


def get_document_types():
    """Get all document types with their IDs"""
    result = supabase.table('document_types').select('id, name').execute()
    return {dt['name']: dt['id'] for dt in result.data}


def classify_documents_batch(documents, sources, doc_types):
    """Use AI to classify a batch of documents"""

    source_list = get_source_list_for_prompt(sources)
    type_list = "\n".join([f"- {k}: {v}" for k, v in DOCUMENT_TYPES.items()])

    doc_summaries = []
    for doc in documents:
        title = doc.get('title', '')[:100]
        content_preview = (doc.get('content') or '')[:500]
        doc_summaries.append(f"ID: {doc['id']}\nTitle: {title}\nContent: {content_preview}...")

    prompt = f"""Analyze these documents and classify each one:

1. MATCH to a source organization (use the code, or "UNKNOWN" if no match)
2. CLASSIFY document type (use exact type name from list)

SOURCES (use the CODE):
{source_list}

DOCUMENT TYPES:
{type_list}

DOCUMENTS TO CLASSIFY:
{chr(10).join(doc_summaries)}

Return ONLY valid JSON array:
[
  {{"id": "doc-uuid", "source_code": "FDA", "doc_type": "guideline"}},
  ...
]

Rules:
- source_code: Use exact code from list, or "UNKNOWN"
- doc_type: Use exact type name from list
- Match sources by publisher name in title/content (e.g., "FDA guidance" -> FDA)
- Infer document type from content nature (research paper -> peer_review, official guidance -> guideline)"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        result = response.choices[0].message.content.strip()
        # Clean up JSON response
        if result.startswith('```'):
            result = result.split('\n', 1)[1]
            result = result.rsplit('```', 1)[0]

        return json.loads(result)
    except Exception as e:
        print(f"   AI error: {str(e)[:100]}")
        return []


def main():
    print("=" * 60)
    print("DOCUMENT CLASSIFICATION")
    print("=" * 60)

    # Load sources and document types
    sources = get_sources()
    source_by_code = {src['code']: src['id'] for src in sources.values()}
    print(f"\nLoaded {len(sources)} sources")

    doc_types = get_document_types()
    print(f"Loaded {len(doc_types)} document types")

    # Get documents without source_id or document_type_id
    result = supabase.table('knowledge_documents')\
        .select('id, title, content, source_id, document_type_id')\
        .limit(200)\
        .execute()

    documents = result.data
    print(f"Found {len(documents)} documents to process")

    # Filter to only unclassified documents
    unclassified = [d for d in documents if not d.get('source_id') or not d.get('document_type_id')]
    print(f"Unclassified: {len(unclassified)}")

    if not unclassified:
        print("All documents already classified!")
        return

    # Process in batches
    batch_size = 10
    updated_source = 0
    updated_type = 0

    print("\nClassifying documents...")

    for i in range(0, len(unclassified), batch_size):
        batch = unclassified[i:i+batch_size]
        print(f"  Processing batch {i//batch_size + 1}/{(len(unclassified) + batch_size - 1)//batch_size}...")

        classifications = classify_documents_batch(batch, sources, doc_types)

        for classification in classifications:
            doc_id = classification.get('id')
            source_code = classification.get('source_code')
            doc_type = classification.get('doc_type')

            if not doc_id:
                continue

            update_data = {}

            # Map source code to ID
            if source_code and source_code != 'UNKNOWN' and source_code in source_by_code:
                update_data['source_id'] = source_by_code[source_code]
                updated_source += 1

            # Map doc type to ID
            if doc_type and doc_type in doc_types:
                update_data['document_type_id'] = doc_types[doc_type]
                updated_type += 1

            if update_data:
                try:
                    supabase.table('knowledge_documents')\
                        .update(update_data)\
                        .eq('id', doc_id)\
                        .execute()
                except Exception as e:
                    print(f"   Error updating {doc_id}: {str(e)[:50]}")

        time.sleep(0.5)  # Rate limiting

    # Summary
    print("\n" + "=" * 60)
    print("CLASSIFICATION COMPLETE")
    print("=" * 60)
    print(f"Documents processed: {len(unclassified)}")
    print(f"Sources assigned: {updated_source}")
    print(f"Types assigned: {updated_type}")

    # Show breakdown by type
    print("\nDocuments by type:")
    type_stats = supabase.rpc('get_document_type_stats', {'p_tenant_id': None}).execute()
    if type_stats.data:
        for stat in type_stats.data[:10]:
            if stat['document_count'] > 0:
                print(f"  {stat['type_name']}: {stat['document_count']}")


if __name__ == '__main__':
    main()
