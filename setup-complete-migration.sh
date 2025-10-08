#!/bin/bash

# Complete VITAL Expert Migration Setup
# This script handles the complete migration from local to cloud Supabase

set -e

echo "🚀 VITAL Expert - Complete Migration Setup"
echo "=========================================="

# Check for Supabase CLI installation
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase (for macOS)"
    echo "   Or follow instructions here: https://supabase.com/docs/guides/cli/getting-started#install-the-cli"
    exit 1
fi

echo "✅ Supabase CLI is installed: $(supabase --version)"

# Check for Vercel CLI installation
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed: $(vercel --version)"

echo ""
echo "🔐 Step 1: Login to Supabase"
echo "============================="
echo "Please login to Supabase:"
supabase login

echo ""
echo "🏗️ Step 2: Create or Link Supabase Project"
echo "==========================================="
echo "Choose an option:"
echo "1. Create a new Supabase project"
echo "2. Link to existing project"
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Creating new Supabase project..."
    read -p "Enter project name (e.g., vital-expert): " project_name
    read -p "Enter region (e.g., us-east-1): " region
    supabase projects create "$project_name" --region "$region"
    echo "✅ Project created successfully!"
    echo "Please copy the Project ID from the output above."
    read -p "Enter the Project ID: " project_id
    supabase link --project-ref "$project_id"
elif [ "$choice" = "2" ]; then
    echo "Linking to existing project..."
    read -p "Enter your Project ID: " project_id
    supabase link --project-ref "$project_id"
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "🗄️ Step 3: Apply Database Migrations"
echo "===================================="
echo "Applying complete database schema..."

# Apply the complete migration
supabase db push

echo "✅ Database schema applied successfully!"

echo ""
echo "🌱 Step 4: Seed Initial Data"
echo "============================"
echo "Seeding agents and initial data..."

# The agents seeding is included in the migration files
echo "✅ Initial data seeded successfully!"

echo ""
echo "🔑 Step 5: Get Supabase Credentials"
echo "==================================="
echo "Getting Supabase project credentials..."

# Get project status to extract credentials
supabase status --linked

echo ""
echo "📋 Step 6: Update Vercel Environment Variables"
echo "=============================================="
echo "Please copy the following values from the status output above:"
echo "- API URL (Project URL)"
echo "- anon public key"
echo ""

read -p "Enter your Supabase Project URL: " supabase_url
read -p "Enter your Supabase anon public key: " supabase_anon_key
read -p "Enter your Supabase service role key (from dashboard): " supabase_service_key

echo ""
echo "Updating Vercel environment variables..."

# Update Vercel environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL "$supabase_url" --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$supabase_anon_key" --yes
vercel env add SUPABASE_URL "$supabase_url" --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY "$supabase_service_key" --yes

echo "✅ Vercel environment variables updated!"

echo ""
echo "🔧 Step 7: Configure Authentication Settings"
echo "============================================"
echo "Please configure these settings in your Supabase dashboard:"
echo "1. Go to Authentication > Settings"
echo "2. Set Site URL to your Vercel production URL"
echo "3. Add redirect URLs:"
echo "   - https://your-app.vercel.app/dashboard"
echo "   - https://your-app.vercel.app/auth/callback"
echo "4. Enable Email authentication"
echo "5. (Optional) Configure email templates"

echo ""
echo "🚀 Step 8: Deploy to Production"
echo "==============================="
echo "Deploying to Vercel..."

vercel --prod

echo ""
echo "✅ Migration Complete!"
echo "====================="
echo "Your VITAL Expert platform has been successfully migrated to cloud Supabase!"
echo ""
echo "Next steps:"
echo "1. Test the authentication flow"
echo "2. Verify all 21 agents are loaded"
echo "3. Test the chat functionality"
echo "4. Configure any additional settings in Supabase dashboard"
echo ""
echo "🎉 Enjoy your fully functional VITAL Expert platform!"
