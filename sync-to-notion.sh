#!/bin/bash

# Notion Sync Script
# Run this after granting integration access to all databases

cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

echo "🔍 Verifying database access..."
echo ""
node scripts/verify-all-databases.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Do all databases show ✅ in Notion column? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "❌ Please grant integration access first:"
    echo ""
    echo "Visit each database URL and:"
    echo "1. Click ••• (three dots)"
    echo "2. Click 'Connections'"
    echo "3. Add 'Vital Expert Sync'"
    echo ""
    echo "Then run this script again: ./sync-to-notion.sh"
    exit 1
fi

echo ""
echo "🚀 Starting sync process..."
echo ""

# Sync capabilities first (small table, 5 records)
echo "📊 Syncing capabilities (5 records)..."
node scripts/sync-supabase-to-notion.js --table=capabilities

if [ $? -eq 0 ]; then
    echo "✅ Capabilities synced successfully!"
    echo ""

    # Sync agents (main table, 254 records)
    echo "📊 Syncing agents (254 records)..."
    echo "⏳ This may take 2-3 minutes..."
    node scripts/sync-supabase-to-notion.js --table=agents

    if [ $? -eq 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 Sync Complete!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "✅ 5 capabilities synced to Notion"
        echo "✅ 254 agents synced to Notion"
        echo ""
        echo "🌐 View your data in Notion:"
        echo "   Capabilities: https://www.notion.so/c5240705aeb741aba5244e07addc9b6c"
        echo "   Agents: https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c"
        echo ""
    else
        echo "❌ Agent sync failed. Check the error messages above."
        exit 1
    fi
else
    echo "❌ Capabilities sync failed. Check the error messages above."
    exit 1
fi
