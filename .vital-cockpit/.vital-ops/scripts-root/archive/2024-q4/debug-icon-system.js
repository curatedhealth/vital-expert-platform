#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Comprehensive Icon System Diagnostic Script
console.log('🔍 COMPREHENSIVE ICON SYSTEM AUDIT');
console.log('='.repeat(60));

const supabase = createClient(
  'https://xazinxsiglqokwfmogyk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function runComprehensiveAudit() {
  console.log('\n1. 🗄️ DATABASE AUDIT');
  console.log('-'.repeat(30));

  try {
    // Check total icons
    const { data: allIcons, error: allError } = await supabase
      .from('icons')
      .select('*');

    if (allError) throw allError;

    console.log(`📋 Total icons in database: ${allIcons.length}`);

    // Check avatar icons
    const avatarIcons = allIcons.filter(icon => icon.category === 'avatar');
    console.log(`👤 Avatar icons: ${avatarIcons.length}`);

    // Check broken URLs
    const brokenIcons = allIcons.filter(icon =>
      icon.file_url && icon.file_url.includes('/Assets/Icons/')
    );
    console.log(`❌ Icons with broken /Assets/Icons/ URLs: ${brokenIcons.length}`);

    if (brokenIcons.length > 0) {
      console.log('\n🔍 Sample broken icons:');
      brokenIcons.slice(0, 3).forEach(icon => {
        console.log(`  - ${icon.name}: ${icon.file_url}`);
      });
    }

    // Check good URLs
    const goodIcons = allIcons.filter(icon =>
      icon.file_url && icon.file_url.startsWith('https://xazinxsiglqokwfmogyk.supabase.co')
    );
    console.log(`✅ Icons with correct Supabase URLs: ${goodIcons.length}`);

    if (goodIcons.length > 0) {
      console.log('\n🔍 Sample good icons:');
      goodIcons.slice(0, 3).forEach(icon => {
        console.log(`  - ${icon.name}: ${icon.file_url}`);
      });
    }

  } catch (error) {
    console.error('❌ Database audit failed:', error);
  }

  console.log('\n2. 🌐 API ENDPOINT AUDIT');
  console.log('-'.repeat(30));

  try {
    // Test avatar endpoint
    const avatarResponse = await fetch('http://localhost:3001/api/icons?category=avatar');
    const avatarData = await avatarResponse.json();

    console.log(`📡 Avatar API Status: ${avatarResponse.status}`);
    console.log(`📊 Avatar API Response: ${avatarData.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`👤 Avatar icons returned: ${avatarData.icons ? avatarData.icons.length : 0}`);

    if (avatarData.icons && avatarData.icons.length > 0) {
      const firstIcon = avatarData.icons[0];
      console.log(`🔍 First avatar icon: ${firstIcon.name}`);
      console.log(`🔗 First avatar URL: ${firstIcon.file_url}`);

      // Test if URL is accessible
      try {
        const urlTest = await fetch(firstIcon.file_url, { method: 'HEAD' });
        console.log(`🌐 URL accessibility: ${urlTest.status === 200 ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE'}`);
      } catch (urlError) {
        console.log(`🌐 URL accessibility: ❌ NETWORK ERROR`);
      }
    }

  } catch (error) {
    console.error('❌ API audit failed:', error);
  }

  console.log('\n3. 🔍 SOURCE CODE AUDIT');
  console.log('-'.repeat(30));

  // This will be run from Node.js, so we'll just log what to check
  console.log('📝 Manual checks needed:');
  console.log('  - Check IconSelectionModal loadIcons function');
  console.log('  - Check if modal is actually being opened');
  console.log('  - Check browser console for JavaScript errors');
  console.log('  - Check network tab for actual requests made');

  console.log('\n4. 🧪 FRONTEND SIMULATION');
  console.log('-'.repeat(30));

  try {
    // Simulate what the frontend should do
    const modalSimulation = await fetch('http://localhost:3001/api/icons?category=avatar');
    const modalData = await modalSimulation.json();

    console.log(`🎭 Modal simulation status: ${modalSimulation.status}`);
    console.log(`📦 Modal simulation data: ${modalData.icons ? modalData.icons.length : 0} icons`);

    if (modalData.icons && modalData.icons.length > 0) {
      const sampleIcons = modalData.icons.slice(0, 5);
      console.log('\n🎨 Sample icons that should display:');
      sampleIcons.forEach((icon, index) => {
        const isValidUrl = icon.file_url && (icon.file_url.startsWith('http') || icon.file_url.startsWith('/'));
        console.log(`  ${index + 1}. ${icon.display_name}`);
        console.log(`     URL: ${icon.file_url}`);
        console.log(`     Valid: ${isValidUrl ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ Frontend simulation failed:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT COMPLETE');
  console.log('='.repeat(60));

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Verify modal is actually opening and calling API');
  console.log('3. Check if IconSelectionModal is receiving data correctly');
  console.log('4. Verify image rendering logic in renderIcon function');
}

runComprehensiveAudit().catch(console.error);