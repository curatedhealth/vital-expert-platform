#!/bin/bash
# Quick start script for Notion to Supabase sync

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   VITAL Expert System - Notion Sync Setup               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with the following variables:"
    echo "  NOTION_TOKEN=your_notion_token"
    echo "  SUPABASE_URL=your_supabase_url"
    echo "  SUPABASE_SERVICE_KEY=your_service_key"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$NOTION_TOKEN" ]; then
    echo "❌ Error: NOTION_TOKEN not set in .env"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL not set in .env"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ] && [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_KEY or SUPABASE_KEY not set in .env"
    exit 1
fi

echo "✓ Environment variables loaded"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check/install required packages
echo "📦 Checking Python dependencies..."
pip3 install -q python-dotenv requests supabase 2>/dev/null || {
    echo "Installing required packages..."
    pip3 install python-dotenv requests supabase
}
echo "✓ Dependencies installed"
echo ""

# Run database migration
echo "🗄️  Setting up database tables..."
echo "Please apply the migration file to your Supabase database:"
echo "  database/migrations/20250108_notion_sync_tables.sql"
echo ""
read -p "Have you applied the migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please apply the migration first, then run this script again"
    exit 1
fi

echo ""
echo "🚀 Starting Notion sync..."
echo ""

# Run the sync script
python3 scripts/sync_notion_to_supabase.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 For more information, see NOTION_SYNC_GUIDE.md"
echo ""

