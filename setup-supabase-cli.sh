#!/bin/bash

echo "🚀 VITAL Expert - Supabase CLI Setup"
echo "===================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed: $(supabase --version)"
echo ""

# Initialize Supabase project if not already done
if [ ! -d "supabase" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
    echo ""
fi

echo "🔐 Next steps to complete setup:"
echo ""
echo "1. Login to Supabase:"
echo "   supabase login"
echo "   (This will open a browser for authentication)"
echo ""
echo "2. Create a new project:"
echo "   supabase projects create vital-expert --region us-east-1"
echo "   (Replace 'vital-expert' with your preferred project name)"
echo ""
echo "3. Link to your project:"
echo "   supabase link --project-ref YOUR_PROJECT_ID"
echo "   (Get PROJECT_ID from the previous command output)"
echo ""
echo "4. Set up the database schema:"
echo "   supabase db push"
echo ""
echo "5. Generate TypeScript types:"
echo "   supabase gen types typescript --local > src/types/supabase.ts"
echo ""
echo "6. Update environment variables:"
echo "   supabase status"
echo "   (Copy the API URL and anon key to Vercel)"
echo ""
echo "7. Deploy to production:"
echo "   vercel --prod"
echo ""

# Check if user is already logged in
if supabase projects list &> /dev/null; then
    echo "✅ You're already logged in to Supabase!"
    echo ""
    echo "📋 Your current projects:"
    supabase projects list
    echo ""
    echo "To link to an existing project:"
    echo "supabase link --project-ref YOUR_PROJECT_ID"
else
    echo "🔑 Please login first:"
    echo "supabase login"
fi
