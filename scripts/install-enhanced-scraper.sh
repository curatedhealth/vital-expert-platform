#!/bin/bash
# Enhanced Scraper Installation Script
# Installs all dependencies for PDF parsing and enhanced scraping

echo "🚀 Installing Enhanced Web Scraper Dependencies"
echo "================================================"
echo ""

# Check Python version
echo "1️⃣  Checking Python version..."
python3 --version || { echo "❌ Python 3 not found. Please install Python 3.8+"; exit 1; }
echo "✅ Python 3 found"
echo ""

# Navigate to scripts directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "2️⃣  Installing core dependencies..."
pip3 install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✅ Core dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Test PDF libraries
echo "3️⃣  Testing PDF libraries..."
python3 -c "import PyPDF2, pdfplumber; print('✅ PDF libraries working')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ PDF support ready"
else
    echo "⚠️  PDF libraries need attention"
fi
echo ""

# Test enhanced scraper
echo "4️⃣  Testing enhanced scraper..."
python3 -c "from enhanced_web_scraper import EnhancedWebScraper; print('✅ Enhanced scraper loaded')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Enhanced scraper ready"
else
    echo "⚠️  Enhanced scraper has issues"
fi
echo ""

# Optional: Playwright
echo "5️⃣  Optional: Install Playwright? (for JavaScript rendering)"
echo "   This adds ~200MB and takes 2-3 minutes"
read -p "   Install Playwright? [y/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Installing Playwright..."
    pip3 install playwright
    echo "   Installing Chromium browser..."
    playwright install chromium
    echo "✅ Playwright installed"
else
    echo "⏭️  Skipping Playwright (you can install later)"
fi
echo ""

echo "================================================"
echo "🎉 Installation Complete!"
echo ""
echo "✅ Installed:"
echo "   - Core dependencies (aiohttp, BeautifulSoup)"
echo "   - PDF parsers (PyPDF2, pdfplumber)"
echo "   - Retry logic (backoff)"
echo "   - Enhanced headers"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   - Playwright (JavaScript rendering)"
fi
echo ""
echo "📚 Next Steps:"
echo "   1. Test with: python3 knowledge-pipeline.py --help"
echo "   2. Try test file: python3 knowledge-pipeline.py --config test-simple-scrape.json --dry-run"
echo "   3. Read guide: ENHANCED_SCRAPER_GUIDE.md"
echo ""
echo "🚀 Ready to scrape PDFs and dynamic content!"

