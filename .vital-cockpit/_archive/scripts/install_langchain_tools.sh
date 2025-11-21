#!/bin/bash
# 📦 Install LangChain Tools Dependencies
# Date: November 3, 2025

set -e  # Exit on error

echo "🚀 Installing LangChain Tools for VITAL AI Engine..."
echo ""

# Navigate to AI engine directory
cd "$(dirname "$0")/../services/ai-engine"

echo "📦 Step 1: Installing Core LangChain..."
pip install --upgrade pip
pip install langchain==0.1.0
pip install langchain-community==0.0.20
pip install langchain-experimental==0.0.50
pip install langchain-core==0.1.10
echo "✅ Core LangChain installed"
echo ""

echo "📦 Step 2: Installing Code Execution Tools..."
pip install playwright==1.40.0
playwright install chromium
pip install sqlalchemy==2.0.23
pip install psycopg2-binary==2.9.9
echo "✅ Code execution tools installed"
echo ""

echo "📦 Step 3: Installing Productivity Tools..."
pip install google-auth==2.25.2
pip install google-auth-oauthlib==1.2.0
pip install google-auth-httplib2==0.2.0
pip install google-api-python-client==2.111.0
pip install slack-sdk==3.26.1
echo "✅ Productivity tools installed"
echo ""

echo "📦 Step 4: Installing Document Processing Tools..."
pip install pandas==2.1.4
pip install pypdf==3.17.4
pip install python-docx==1.1.0
pip install openpyxl==3.1.2
echo "✅ Document processing tools installed"
echo ""

echo "📦 Step 5: Installing Research Tools..."
pip install wikipedia==1.4.0
pip install exa-py==1.0.6
pip install wolframalpha==5.0.0
echo "✅ Research tools installed"
echo ""

echo "📦 Step 6: Installing API & HTTP Tools..."
pip install requests==2.31.0
pip install httpx==0.25.2
pip install aiohttp==3.9.1
echo "✅ API tools installed"
echo ""

echo "📦 Step 7: Updating requirements.txt..."
pip freeze | grep -E "langchain|playwright|google-|slack-|wikipedia|exa-py|wolframalpha" >> requirements.txt
sort -u requirements.txt -o requirements.txt
echo "✅ requirements.txt updated"
echo ""

echo "🎉 All LangChain tools installed successfully!"
echo ""
echo "📊 Installation Summary:"
echo "  ✅ Core LangChain"
echo "  ✅ Code Execution (Python REPL, SQL, PlayWright)"
echo "  ✅ Productivity (Gmail, Slack, Calendar, Drive)"
echo "  ✅ Document Processing (PDF, DOCX, Excel)"
echo "  ✅ Research (Wikipedia, Exa, Wolfram)"
echo "  ✅ API Tools (Requests, HTTP)"
echo ""
echo "🚀 Next Step: Run the database migration:"
echo "   psql -d your_database -f database/sql/migrations/add_langchain_tools_support.sql"

