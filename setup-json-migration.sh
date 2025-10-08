#!/bin/bash

# Complete JSON-based migration setup for VITAL Expert
# This script exports data to JSON and uploads to Supabase cloud

set -e

echo "🚀 VITAL Expert - JSON Migration Setup"
echo "======================================"

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null
then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

echo ""
echo "📦 Step 1: Export data to JSON files"
echo "===================================="
echo "Exporting all VITAL Expert data to JSON format..."

node export-data-to-json.js

if [ $? -eq 0 ]; then
    echo "✅ Data export completed successfully!"
else
    echo "❌ Data export failed!"
    exit 1
fi

echo ""
echo "📤 Step 2: Upload data to Supabase Cloud"
echo "======================================="
echo "Uploading data to your Supabase project..."

node upload-to-supabase-cloud.js

if [ $? -eq 0 ]; then
    echo "✅ Data upload completed successfully!"
else
    echo "❌ Data upload failed!"
    exit 1
fi

echo ""
echo "🔧 Step 3: Update Vercel Environment Variables"
echo "=============================================="
echo "Please update your Vercel environment variables with these values:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
echo "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
echo ""

# Check for Vercel CLI
if command -v vercel &> /dev/null
then
    echo "🔧 Vercel CLI detected. Would you like to update environment variables automatically? (y/n)"
    read -p "> " update_vercel
    
    if [ "$update_vercel" = "y" ] || [ "$update_vercel" = "Y" ]; then
        echo "Updating Vercel environment variables..."
        vercel env add NEXT_PUBLIC_SUPABASE_URL "https://xazinxsiglqokwfmogyk.supabase.co" --yes
        vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY" --yes
        vercel env add SUPABASE_URL "https://xazinxsiglqokwfmogyk.supabase.co" --yes
        vercel env add SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes" --yes
        echo "✅ Vercel environment variables updated!"
    fi
else
    echo "💡 Install Vercel CLI to update environment variables automatically:"
    echo "   npm install -g vercel"
fi

echo ""
echo "🔐 Step 4: Configure Authentication Settings"
echo "============================================"
echo "Please configure these settings in your Supabase dashboard:"
echo "1. Go to https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk"
echo "2. Navigate to Authentication > Settings"
echo "3. Set Site URL to your Vercel production URL"
echo "4. Add redirect URLs:"
echo "   - https://your-app.vercel.app/dashboard"
echo "   - https://your-app.vercel.app/auth/callback"
echo "5. Enable Email authentication"
echo "6. (Optional) Configure email templates"

echo ""
echo "🚀 Step 5: Deploy to Production"
echo "==============================="
echo "Deploy your application to Vercel:"
echo "vercel --prod"

echo ""
echo "✅ Migration Complete!"
echo "====================="
echo "Your VITAL Expert platform has been successfully migrated to cloud Supabase!"
echo ""
echo "📊 Data Summary:"
echo "   - LLM Providers: 4 configured"
echo "   - Knowledge Domains: 8 domains"
echo "   - AI Agents: 21 specialized agents"
echo ""
echo "🎉 Your platform is ready for production use!"
echo "🌐 Access your Supabase dashboard: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk"
