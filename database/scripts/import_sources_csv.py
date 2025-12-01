"""
Import Sources from CSV with AI Categorization
Imports sources from Crossroads CSV and auto-categorizes uncategorized ones using OpenAI
Uses the 'sources' table (separate from organizations which is for clients)
"""

import os
import csv
import re
import time
from typing import Optional
from supabase import create_client
from openai import OpenAI

# Configuration
CSV_PATH = "/Users/hichamnaim/Downloads/Private & Shared 39/Crossroads Sources 833b61f5273f4b6ba1035c5df19e6b53_all.csv"

# Category mapping from CSV to our schema
CATEGORY_MAP = {
    'scholarly journals': 'journal',
    'scholarly journal': 'journal',
    'professional journals': 'journal',
    'professional sources': 'media',
    'news media': 'media',
    'academia': 'research',
    'accelerator': 'accelerator',
    'service providers': 'service_provider',
    'service provider': 'service_provider',
    'investors': 'investor',
    'venture capital': 'investor',
    'government': 'regulatory',
    'organizations': 'association',
    'medical society': 'association',
}

# Valid categories in our schema
VALID_CATEGORIES = [
    'regulatory', 'pharma', 'journal', 'consultancy', 'research',
    'standards', 'payer', 'provider', 'technology', 'association',
    'media', 'accelerator', 'investor', 'service_provider', 'nonprofit'
]


def generate_code(name: str) -> str:
    """Generate a short code from source name"""
    words = re.sub(r'[^\w\s]', '', name).split()

    if len(words) == 1:
        return words[0][:10].upper()
    elif len(words) == 2:
        return (words[0][:3] + words[1][:3]).upper()
    else:
        return ''.join(w[0] for w in words[:5]).upper()


def ai_categorize_batch(openai_client: OpenAI, organizations: list) -> dict:
    """Use AI to categorize a batch of uncategorized organizations"""

    org_list = "\n".join([
        f"- {org['name']}: {org.get('about', '')[:200]}"
        for org in organizations
    ])

    prompt = f"""Categorize each organization into ONE of these categories:
- regulatory (government agencies, health authorities)
- pharma (pharmaceutical/biotech companies)
- journal (scientific/medical journals)
- consultancy (consulting firms)
- research (universities, research institutions)
- standards (standards organizations like ISO, ICH)
- payer (insurance, healthcare payers)
- provider (hospitals, healthcare providers)
- technology (health tech, software companies)
- association (professional/trade associations)
- media (news, professional publications)
- accelerator (startup accelerators/incubators)
- investor (VC, investment firms)
- service_provider (CROs, CDMOs, service companies)
- nonprofit (nonprofits, foundations)

Organizations to categorize:
{org_list}

Return ONLY a JSON object mapping organization name to category, like:
{{"Organization Name": "category", ...}}"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    import json
    try:
        result = response.choices[0].message.content
        result = result.strip()
        if result.startswith('```'):
            result = re.sub(r'^```\w*\n?', '', result)
            result = re.sub(r'\n?```$', '', result)
        return json.loads(result)
    except Exception as e:
        print(f"   AI parse error: {e}")
        return {}


def main():
    # Load environment variables
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    openai_key = os.environ.get('OPENAI_API_KEY')

    if not all([supabase_url, supabase_key, openai_key]):
        print("Missing environment variables. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY")
        return

    supabase = create_client(supabase_url, supabase_key)
    openai_client = OpenAI(api_key=openai_key)

    print("=" * 60)
    print("SOURCES CSV IMPORT WITH AI CATEGORIZATION")
    print("=" * 60)

    # Get existing category IDs from source_categories table
    categories_result = supabase.table('source_categories').select('id, name').execute()
    category_ids = {cat['name']: cat['id'] for cat in categories_result.data}
    print(f"\nLoaded {len(category_ids)} categories from database")

    # Get existing sources to avoid duplicates
    existing_result = supabase.table('sources').select('code, name').execute()
    existing_codes = {src['code'] for src in existing_result.data}
    existing_names = {src['name'].lower() for src in existing_result.data}
    print(f"Found {len(existing_codes)} existing sources")

    # Read CSV
    organizations = []
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('\ufeffCompany Name') or row.get('Company Name', '').strip()
            if not name:
                continue

            org = {
                'name': name,
                'about': row.get('About', '').strip()[:2000],
                'website': row.get('Website', '').strip(),
                'csv_category': row.get('Source Category', '').strip().lower().strip('"'),
            }
            organizations.append(org)

    print(f"Read {len(organizations)} organizations from CSV")

    # Separate categorized and uncategorized
    categorized = []
    uncategorized = []

    for org in organizations:
        csv_cat = org['csv_category']
        if csv_cat and csv_cat in CATEGORY_MAP:
            org['category'] = CATEGORY_MAP[csv_cat]
            categorized.append(org)
        else:
            uncategorized.append(org)

    print(f"  - Pre-categorized: {len(categorized)}")
    print(f"  - Need AI categorization: {len(uncategorized)}")

    # AI categorize uncategorized in batches
    if uncategorized:
        print("\nAI Categorizing uncategorized organizations...")
        batch_size = 20

        for i in range(0, len(uncategorized), batch_size):
            batch = uncategorized[i:i+batch_size]
            print(f"  Processing batch {i//batch_size + 1}/{(len(uncategorized) + batch_size - 1)//batch_size}...")

            ai_results = ai_categorize_batch(openai_client, batch)

            for org in batch:
                ai_cat = ai_results.get(org['name'], 'technology')
                if ai_cat in VALID_CATEGORIES:
                    org['category'] = ai_cat
                else:
                    org['category'] = 'technology'

            time.sleep(0.5)

    # Merge all organizations
    all_orgs = categorized + uncategorized

    # Insert into database
    inserted = 0
    skipped_duplicate = 0
    skipped_no_category = 0

    print("\nInserting sources into database...")

    for src in all_orgs:
        name = src['name']
        code = generate_code(name)

        if code in existing_codes or name.lower() in existing_names:
            skipped_duplicate += 1
            continue

        category = src.get('category')
        if not category or category not in category_ids:
            skipped_no_category += 1
            continue

        # Ensure unique code
        base_code = code
        counter = 1
        while code in existing_codes:
            code = f"{base_code}{counter}"
            counter += 1

        source_data = {
            'code': code,
            'name': name,
            'category_id': category_ids[category],
            'website': src.get('website') or None,
            'about': src.get('about') or None,
            'authority_level': 5,
            'rag_priority_weight': 0.75,
            'is_active': True,
        }

        try:
            result = supabase.table('sources').insert(source_data).execute()
            existing_codes.add(code)
            existing_names.add(name.lower())
            inserted += 1

            if inserted % 50 == 0:
                print(f"  Inserted {inserted} sources...")

        except Exception as e:
            print(f"  Error inserting {name}: {str(e)[:50]}")

    # Summary
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    print(f"Total in CSV: {len(organizations)}")
    print(f"Inserted: {inserted}")
    print(f"Skipped (duplicate): {skipped_duplicate}")
    print(f"Skipped (no category): {skipped_no_category}")

    # Final count
    final_result = supabase.table('sources').select('id', count='exact').execute()
    print(f"\nTotal sources in database: {final_result.count}")


if __name__ == '__main__':
    main()
