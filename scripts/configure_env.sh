#!/bin/bash
# Quick Configuration Helper
# This script shows you what needs to be configured

cat << 'EOF'

╔══════════════════════════════════════════════════════════════╗
║           CONFIGURATION REQUIRED                             ║
╚══════════════════════════════════════════════════════════════╝

Your integration is ready, but you need to add credentials to .env

📋 WHAT YOU NEED:
══════════════════════════════════════════════════════════════

1. NOTION INTEGRATION TOKEN
   ────────────────────────────────────────────────────────
   ➤ Go to: https://www.notion.so/my-integrations
   ➤ Click: "+ New integration"
   ➤ Name: "VITAL Supabase Sync"
   ➤ Select: Your workspace
   ➤ Copy: Integration Token (starts with "secret_")

2. SUPABASE CREDENTIALS
   ────────────────────────────────────────────────────────
   ➤ Go to: https://supabase.com/dashboard
   ➤ Select: Your project
   ➤ Navigate: Settings → API
   ➤ Copy: 
      • URL (https://xxxxx.supabase.co)
      • Service role key (the longer key)

📝 HOW TO ADD TO .ENV:
══════════════════════════════════════════════════════════════

Option 1: Edit .env file directly
────────────────────────────────────────────────────────
$ nano .env
or
$ code .env  (if you have VS Code)

Then add these lines:

NOTION_TOKEN=secret_your_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here


Option 2: Use echo commands (quick method)
────────────────────────────────────────────────────────
$ echo "NOTION_TOKEN=secret_your_token_here" >> .env
$ echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
$ echo "SUPABASE_SERVICE_KEY=your_service_key_here" >> .env


🧪 AFTER CONFIGURATION:
══════════════════════════════════════════════════════════════

Test your setup:
$ python3 scripts/test_integration_connection.py

If all tests pass ✅, proceed to:
$ python3 scripts/create_notion_databases_from_supabase.py


📚 DETAILED GUIDES:
══════════════════════════════════════════════════════════════

• Full setup guide:     GET_STARTED.md
• Quick commands:       QUICK_REFERENCE.md
• Complete details:     INTEGRATION_COMPLETE.md

══════════════════════════════════════════════════════════════

EOF

