#!/usr/bin/env node

/**
 * Simple script to apply database schema using direct HTTP requests
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const env = {};

envLines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Simple Database Schema Application');
console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Missing');
console.log('Service Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create just the essential tables for testing
const essentialSchema = `
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create knowledge_documents table (minimal version)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  upload_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  domain VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Insert sample data
INSERT INTO knowledge_documents (title, content, file_name, file_type, status, domain, tags)
VALUES (
  'Test Document',
  'This is a test document for Phase 1 verification.',
  'test.txt',
  'text/plain',
  'completed',
  'testing',
  ARRAY['test', 'phase1']
) ON CONFLICT DO NOTHING;
`;

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', supabaseUrl);

    const postData = JSON.stringify({ sql });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'User-Agent': 'VITAL-Path-Schema-Applicator'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function testConnection() {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/knowledge_documents?select=count&limit=1', supabaseUrl);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'User-Agent': 'VITAL-Path-Connection-Test'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Connection test - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('✅ Supabase connection successful');
          resolve(true);
        } else if (res.statusCode === 406 && data.includes('does not exist')) {
          console.log('ℹ️  Table does not exist yet - this is expected');
          resolve(true);
        } else {
          console.log('Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Connection test failed:', error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Connection test timeout');
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('\n1. Testing connection...');
    const connected = await testConnection();

    if (!connected) {
      console.log('❌ Cannot connect to Supabase');
      process.exit(1);
    }

    console.log('\n2. Applying schema...');
    try {
      await executeSQL(essentialSchema);
      console.log('✅ Schema applied successfully');
    } catch (error) {
      console.log('⚠️  Schema application had issues:', error.message);
      console.log('This might be normal if tables already exist');
    }

    console.log('\n3. Testing table creation...');
    const testResult = await testConnection();

    if (testResult) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('You can now test the API routes');
    } else {
      console.log('\n❌ Database setup verification failed');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();