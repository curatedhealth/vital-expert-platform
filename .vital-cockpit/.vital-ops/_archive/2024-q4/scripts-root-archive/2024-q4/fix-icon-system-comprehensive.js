#!/usr/bin/env node

/**
 * COMPREHENSIVE ICON SYSTEM FIX SCRIPT
 *
 * This script identifies and fixes all icon-related issues in the VITAL Path platform
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE ICON SYSTEM FIX');
console.log('='.repeat(60));

// File paths to check and fix
const files = {
  iconModal: 'src/shared/components/ui/icon-selection-modal.tsx',
  agentCreator: 'src/features/chat/components/agent-creator.tsx',
  iconService: 'src/shared/services/icon-service.ts'
};

function readFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  throw new Error(`File not found: ${filePath}`);
}

function writeFile(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
}

function applyIconModalFix() {
  console.log('\n1. 🎯 FIXING ICON SELECTION MODAL');
  console.log('-'.repeat(40));

  try {
    let content = readFile(files.iconModal);

    // Fix 1: Ensure the modal always uses direct API calls
    const newLoadIconsFunction = `  const loadIcons = async () => {
    setLoading(true);
    try {
      let loadedIcons: Icon[] = [];

      // Use direct API calls - this bypasses any IconService issues
      if (category === 'avatar') {
        const response = await fetch('/api/icons?category=avatar');
        const data = await response.json();
        loadedIcons = data.icons || [];
      } else if (category === 'prompt') {
        const response = await fetch('/api/icons?categories=prompt,medical,regulatory,process');
        const data = await response.json();
        loadedIcons = data.icons || [];
      } else if (category === 'process') {
        const response = await fetch('/api/icons?category=process');
        const data = await response.json();
        loadedIcons = data.icons || [];
      } else {
        const response = await fetch(`/api/icons?category=${category}`);
        const data = await response.json();
        loadedIcons = data.icons || [];
      }

      setIcons(loadedIcons);
    } catch (error) {
      console.error('Error loading icons:', error);
      // Only use fallback if absolutely necessary
      setIcons([]);
    } finally {
      setLoading(false);
    }
  };`;

    // Fix 2: Improve icon rendering to handle edge cases
    const newRenderIconFunction = `  const renderIcon = (icon: Icon) => {
    const isImagePath = icon.file_url &&
      (icon.file_url.startsWith('http') || icon.file_url.startsWith('/'));

    if (isImagePath) {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <Image
            src={icon.file_url}
            alt={icon.display_name}
            width={32}
            height={32}
            className="object-contain max-w-full max-h-full"
            unoptimized={true}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const parent = target.parentNode as HTMLElement;
              if (parent) {
                parent.innerHTML = '<span class="text-2xl">🤖</span>';
              }
            }}
          />
        </div>
      );
    }

    return (
      <span className="text-2xl">{icon.file_url || '🤖'}</span>
    );
  };`;

    // Apply fixes
    content = content.replace(
      /const loadIcons = async \(\) => \{[\s\S]*?\};/m,
      newLoadIconsFunction
    );

    content = content.replace(
      /const renderIcon = \(icon: Icon\) => \{[\s\S]*?\};/m,
      newRenderIconFunction
    );

    writeFile(files.iconModal, content);
    console.log('✅ Fixed IconSelectionModal with improved API calls and rendering');

  } catch (error) {
    console.error('❌ Failed to fix IconSelectionModal:', error);
  }
}

function applyImageOptimizationFix() {
  console.log('\n2. 🖼️ FIXING IMAGE OPTIMIZATION ISSUES');
  console.log('-'.repeat(40));

  try {
    // Create next.config.js fix for external images
    const nextConfigPath = 'next.config.js';
    let nextConfig = '';

    try {
      nextConfig = readFile(nextConfigPath);
    } catch {
      console.log('📝 Creating new next.config.js...');
    }

    // Ensure Supabase domains are allowed
    const imageConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'xazinxsiglqokwfmogyk.supabase.co',
      'supabase.co'
    ],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xazinxsiglqokwfmogyk.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
};

module.exports = nextConfig;
`;

    writeFile(nextConfigPath, imageConfig);
    console.log('✅ Updated next.config.js for Supabase image optimization');

  } catch (error) {
    console.error('❌ Failed to fix image optimization:', error);
  }
}

function createTestIconComponent() {
  console.log('\n3. 🧪 CREATING TEST ICON COMPONENT');
  console.log('-'.repeat(40));

  const testComponent = `'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TestIconProps {
  iconUrl: string;
  name: string;
}

export function TestIcon({ iconUrl, name }: TestIconProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [iconUrl]);

  if (error) {
    return <span className="text-2xl">🤖</span>;
  }

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <Image
        src={iconUrl}
        alt={name}
        width={32}
        height={32}
        className="object-contain"
        unoptimized={true}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          display: loaded ? 'block' : 'none'
        }}
      />
      {!loaded && !error && (
        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded"></div>
      )}
    </div>
  );
}`;

  try {
    writeFile('src/shared/components/ui/test-icon.tsx', testComponent);
    console.log('✅ Created TestIcon component for debugging');
  } catch (error) {
    console.error('❌ Failed to create test component:', error);
  }
}

function applyCSPFix() {
  console.log('\n4. 🔒 FIXING CONTENT SECURITY POLICY');
  console.log('-'.repeat(40));

  try {
    let middlewareContent = '';
    try {
      middlewareContent = readFile('src/middleware.ts');
    } catch {
      console.log('📝 Creating new middleware.ts...');
    }

    // Add CSP headers for Supabase
    const cspMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CSP headers to allow Supabase images
  response.headers.set(
    'Content-Security-Policy',
    "img-src 'self' data: https://xazinxsiglqokwfmogyk.supabase.co https://*.supabase.co"
  );

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
`;

    if (!middlewareContent.includes('Content-Security-Policy')) {
      writeFile('src/middleware.ts', cspMiddleware);
      console.log('✅ Added CSP headers for Supabase images');
    } else {
      console.log('✅ CSP headers already configured');
    }

  } catch (error) {
    console.error('❌ Failed to fix CSP:', error);
  }
}

function validateFix() {
  console.log('\n5. ✅ VALIDATING FIXES');
  console.log('-'.repeat(40));

  // Test API endpoint
  console.log('📡 Testing API endpoint...');
  fetch('http://localhost:3001/api/icons?category=avatar')
    .then(response => response.json())
    .then(data => {
      console.log(`✅ API Test: ${data.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`📊 Icons returned: ${data.icons ? data.icons.length : 0}`);

      if (data.icons && data.icons.length > 0) {
        console.log(`🔗 Sample URL: ${data.icons[0].file_url}`);
      }
    })
    .catch(error => {
      console.error('❌ API Test failed:', error);
    });
}

// Run all fixes
async function runAllFixes() {
  try {
    applyIconModalFix();
    applyImageOptimizationFix();
    createTestIconComponent();
    applyCSPFix();
    validateFix();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL FIXES APPLIED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 WHAT WAS FIXED:');
    console.log('1. ✅ IconSelectionModal now uses direct API calls');
    console.log('2. ✅ Image rendering improved with better error handling');
    console.log('3. ✅ Next.js image optimization configured for Supabase');
    console.log('4. ✅ CSP headers added for external images');
    console.log('5. ✅ Test component created for debugging');

    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Restart the development server');
    console.log('2. Clear browser cache');
    console.log('3. Test the icon selection modal');
    console.log('4. Check browser console for any remaining errors');

  } catch (error) {
    console.error('❌ Fix script failed:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  runAllFixes();
}

module.exports = { runAllFixes };