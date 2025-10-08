#!/bin/bash

echo "🚀 VITAL Expert - Supabase Setup"
echo "================================="
echo ""

# Check if user has provided credentials
if [ $# -ne 2 ]; then
    echo "Usage: ./setup-supabase.sh <SUPABASE_URL> <SUPABASE_ANON_KEY>"
    echo ""
    echo "Example:"
    echo "./setup-supabase.sh https://abcdefgh.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo ""
    echo "To get your credentials:"
    echo "1. Go to https://supabase.com"
    echo "2. Select your project"
    echo "3. Go to Settings → API"
    echo "4. Copy Project URL and anon public key"
    exit 1
fi

SUPABASE_URL=$1
SUPABASE_ANON_KEY=$2

echo "📝 Updating Vercel environment variables..."
echo ""

# Update Vercel environment variables
echo "Setting NEXT_PUBLIC_SUPABASE_URL..."
vercel env add NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL" production

echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY" production

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Authentication → Settings"
echo "3. Set Site URL to your Vercel domain"
echo "4. Add redirect URL: https://your-domain.vercel.app/dashboard"
echo "5. Go to SQL Editor and run the supabase-setup.sql file"
echo "6. Deploy your app: vercel --prod"
echo ""
echo "🔗 Your Supabase project: $SUPABASE_URL"
echo ""
