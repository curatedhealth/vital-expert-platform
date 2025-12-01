/**
 * Upload SVG Avatars to Supabase Storage
 *
 * This script:
 * 1. Reads all SVG files from public/assets/vital/avatars/
 * 2. Uploads them to Supabase storage bucket 'avatars'
 * 3. Inserts metadata records into the avatars table
 *
 * Prerequisites:
 * 1. Create 'avatars' storage bucket in Supabase dashboard (set to public)
 * 2. Run the 20251126_create_avatars_table.sql migration
 *
 * Usage:
 * pnpm tsx scripts/upload-svg-avatars.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(__dirname, '../apps/vital-system/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Avatar source directory
const AVATARS_DIR = path.join(__dirname, '../public/assets/vital/avatars');
const STORAGE_BUCKET = 'avatars';

// Persona type to recommended tier mapping
const PERSONA_TIER_MAP: Record<string, number> = {
  expert: 3,      // Expert-level avatars for Master/Expert agents
  foresight: 3,   // Strategic avatars for high-level agents
  medical: 2,     // Medical avatars for Specialist level
  pharma: 2,      // Pharma avatars for Specialist level
  startup: 1,     // Innovation avatars for Worker/Tool level
};

// Primary colors for each persona type (from SVG analysis)
const PERSONA_COLOR_MAP: Record<string, string> = {
  expert: '#9B5DE0',      // Purple
  foresight: '#00BBF9',   // Blue
  medical: '#00F5D4',     // Teal
  pharma: '#FEE440',      // Yellow
  startup: '#F15BB5',     // Pink
};

interface AvatarMetadata {
  filename: string;
  storagePath: string;
  publicUrl: string;
  personaType: string;
  businessFunction: string;
  variantNumber: number;
  displayName: string;
  primaryColor: string;
  recommendedTier: number;
}

/**
 * Parse filename to extract metadata
 * Format: vital_avatar_{persona}_{function}_{number}.svg
 */
function parseFilename(filename: string): AvatarMetadata | null {
  const match = filename.match(/^vital_avatar_(\w+)_(\w+_\w+)_(\d+)\.svg$/);
  if (!match) {
    console.warn(`Skipping file with unexpected format: ${filename}`);
    return null;
  }

  const [, persona, func, numStr] = match;
  const variantNumber = parseInt(numStr, 10);

  // Generate display name
  const personaLabel = persona.charAt(0).toUpperCase() + persona.slice(1);
  const funcLabel = func
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const storagePath = `${persona}/${func}/${filename}`;

  return {
    filename,
    storagePath,
    publicUrl: '', // Will be set after upload
    personaType: persona,
    businessFunction: func,
    variantNumber,
    displayName: `${personaLabel} ${funcLabel} ${variantNumber}`,
    primaryColor: PERSONA_COLOR_MAP[persona] || '#9B5DE0',
    recommendedTier: PERSONA_TIER_MAP[persona] || 2,
  };
}

/**
 * Upload a single SVG file to Supabase storage
 */
async function uploadAvatar(
  filePath: string,
  metadata: AvatarMetadata
): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(metadata.storagePath, fileBuffer, {
        contentType: 'image/svg+xml',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      // If bucket doesn't exist, give helpful error
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.error(`
ERROR: Storage bucket '${STORAGE_BUCKET}' not found.

Please create it in Supabase Dashboard:
1. Go to Storage > Create new bucket
2. Name: "${STORAGE_BUCKET}"
3. Public bucket: Yes
4. Save
        `);
        process.exit(1);
      }
      console.error(`Error uploading ${metadata.filename}:`, error.message);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(metadata.storagePath);

    return publicUrl;
  } catch (err) {
    console.error(`Error reading/uploading ${metadata.filename}:`, err);
    return null;
  }
}

// Track if avatars table exists
let avatarsTableExists: boolean | null = null;

/**
 * Check if avatars table exists
 */
async function checkAvatarsTable(): Promise<boolean> {
  if (avatarsTableExists !== null) return avatarsTableExists;

  const { error } = await supabase.from('avatars').select('id').limit(1);

  // If table doesn't exist, error will mention relation/table
  avatarsTableExists = !error || !error.message?.includes('relation') && !error.message?.includes('does not exist');
  return avatarsTableExists;
}

/**
 * Insert avatar metadata into database
 */
async function insertAvatarRecord(metadata: AvatarMetadata): Promise<boolean> {
  // Skip if table doesn't exist
  if (!(await checkAvatarsTable())) {
    return true; // Return true to not count as error
  }

  try {
    const { error } = await supabase.from('avatars').upsert(
      {
        filename: metadata.filename,
        storage_path: metadata.storagePath,
        public_url: metadata.publicUrl,
        persona_type: metadata.personaType,
        business_function: metadata.businessFunction,
        variant_number: metadata.variantNumber,
        display_name: metadata.displayName,
        primary_color: metadata.primaryColor,
        recommended_tier: metadata.recommendedTier,
        is_active: true,
      },
      {
        onConflict: 'filename',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      // If table doesn't exist, just skip
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        avatarsTableExists = false;
        return true;
      }
      console.error(`Error inserting ${metadata.filename}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error inserting ${metadata.filename}:`, err);
    return false;
  }
}

/**
 * Main upload function
 */
async function uploadAllAvatars() {
  console.log('='.repeat(60));
  console.log('SVG Avatar Upload Script');
  console.log('='.repeat(60));
  console.log(`\nSource directory: ${AVATARS_DIR}`);
  console.log(`Storage bucket: ${STORAGE_BUCKET}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log();

  // Check if source directory exists
  if (!fs.existsSync(AVATARS_DIR)) {
    console.error(`Source directory not found: ${AVATARS_DIR}`);
    process.exit(1);
  }

  // Get all SVG files
  const files = fs.readdirSync(AVATARS_DIR).filter((f) => f.endsWith('.svg'));
  console.log(`Found ${files.length} SVG files to upload\n`);

  if (files.length === 0) {
    console.log('No SVG files found. Exiting.');
    return;
  }

  // Process files
  let uploaded = 0;
  let inserted = 0;
  let errors = 0;

  // Process in batches to avoid rate limiting
  const BATCH_SIZE = 20;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}...`
    );

    await Promise.all(
      batch.map(async (filename) => {
        const metadata = parseFilename(filename);
        if (!metadata) {
          errors++;
          return;
        }

        const filePath = path.join(AVATARS_DIR, filename);

        // Upload to storage
        const publicUrl = await uploadAvatar(filePath, metadata);
        if (!publicUrl) {
          errors++;
          return;
        }
        uploaded++;
        metadata.publicUrl = publicUrl;

        // Insert into database
        const success = await insertAvatarRecord(metadata);
        if (success) {
          inserted++;
        } else {
          errors++;
        }
      })
    );

    // Small delay between batches
    if (i + BATCH_SIZE < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Upload Complete');
  console.log('='.repeat(60));
  console.log(`Files processed: ${files.length}`);
  console.log(`Uploaded to storage: ${uploaded}`);
  console.log(`Inserted to database: ${inserted}`);
  console.log(`Errors: ${errors}`);
  console.log();

  if (errors === 0) {
    console.log('SUCCESS! All avatars uploaded and recorded.');
  } else {
    console.log(
      `WARNING: ${errors} errors occurred. Check logs above for details.`
    );
  }
}

/**
 * Verify upload by checking counts
 */
async function verifyUpload() {
  console.log('\n--- Verification ---');

  // Check if avatars table exists
  if (!avatarsTableExists) {
    console.log('\nNOTE: Avatars table does not exist in database.');
    console.log('Files were uploaded to storage only.');
    console.log('To populate the database, run:');
    console.log('  npx supabase db push');
    console.log('Then re-run this script to insert metadata.\n');
  } else {
    // Count records in database
    const { count, error } = await supabase
      .from('avatars')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('Could not verify database records:', error.message);
    } else {
      console.log(`Database records: ${count}`);
    }

    // Sample query by category
    const { data: sample } = await supabase
      .from('avatars')
      .select('persona_type, business_function')
      .limit(5);

    if (sample && sample.length > 0) {
      console.log('\nSample records:');
      sample.forEach((r) => {
        console.log(`  - ${r.persona_type} / ${r.business_function}`);
      });
    }
  }

  // Verify storage
  console.log('\n--- Storage Verification ---');
  const { data: files, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('expert/analytics_insights', { limit: 5 });

  if (storageError) {
    console.log('Could not verify storage:', storageError.message);
  } else {
    console.log(`Sample files in storage: ${files?.length || 0}`);
    files?.slice(0, 3).forEach((f) => {
      console.log(`  - ${f.name}`);
    });
  }
}

/**
 * Create storage bucket if it doesn't exist
 */
async function ensureBucketExists() {
  console.log('Checking storage bucket...');

  // List existing buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return false;
  }

  const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);

  if (bucketExists) {
    console.log(`Bucket '${STORAGE_BUCKET}' already exists.`);
    return true;
  }

  // Create the bucket
  console.log(`Creating bucket '${STORAGE_BUCKET}'...`);
  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 1024 * 1024, // 1MB max for SVGs
    allowedMimeTypes: ['image/svg+xml'],
  });

  if (createError) {
    console.error('Error creating bucket:', createError.message);
    return false;
  }

  console.log(`Bucket '${STORAGE_BUCKET}' created successfully!`);
  return true;
}

// Run the upload
async function main() {
  // First ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('\nFailed to setup storage bucket. Please create it manually in Supabase Dashboard.');
    process.exit(1);
  }

  await uploadAllAvatars();
  await verifyUpload();
}

main().catch(console.error);
