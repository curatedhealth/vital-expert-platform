#!/bin/bash

# Script to apply user_panels table migration via Supabase CLI

set -e

echo "🚀 Applying user_panels table migration..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not logged in to Supabase. Please run:"
    echo "   supabase login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Project not linked. Please run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "You can find your project ref in your Supabase dashboard URL:"
    echo "   https://supabase.com/dashboard/project/YOUR_PROJECT_REF"
    echo ""
    read -p "Do you want to link now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your project ref: " PROJECT_REF
        supabase link --project-ref "$PROJECT_REF"
    else
        echo "Please link your project first, then run this script again."
        exit 1
    fi
fi

echo "✅ Project linked"
echo ""

# Push migrations
echo "📤 Pushing migrations to remote database..."
supabase db push

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "You can now save panels in the Designer. Try it out!"

