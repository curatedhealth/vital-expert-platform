"""
Playwright Browser Scraper - Bypasses 403 blocks using real browser
"""

import asyncio
import logging
from typing import Dict, Any
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def scrape_with_playwright(url: str) -> Dict[str, Any]:
    """Scrape using Playwright (real browser)"""
    try:
        async with async_playwright() as p:
            logger.info(f"🎭 Launching browser for: {url}")
            
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )
            
            page = await context.new_page()
            
            # Navigate and wait for content
            logger.info(f"📄 Loading page...")
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            # Get title
            title = await page.title()
            
            # Get main content
            content = await page.evaluate('''() => {
                // Remove unwanted elements
                document.querySelectorAll('script, style, nav, footer, aside, header').forEach(el => el.remove());
                
                // Try to find main content
                let main = document.querySelector('article') || 
                          document.querySelector('main') ||
                          document.querySelector('.pmc-article') ||
                          document.querySelector('.article') ||
                          document.body;
                
                return main.innerText;
            }''')
            
            await browser.close()
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'content': content,
                'word_count': len(content.split()),
                'scraper': 'playwright'
            }
    
    except Exception as e:
        logger.error(f"❌ Playwright error: {e}")
        return {
            'success': False,
            'url': url,
            'error': str(e),
            'content': None
        }

# Test
if __name__ == '__main__':
    async def test():
        # Test PMC
        urls = [
            'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9301261/',
            'https://arxiv.org/abs/2401.00001'
        ]
        
        for url in urls:
            print(f'\n🧪 Testing: {url}')
            result = await scrape_with_playwright(url)
            
            if result['success']:
                print(f'✅ Success!')
                print(f'   Title: {result["title"][:80]}')
                print(f'   Words: {result["word_count"]}')
                print(f'   Preview: {result["content"][:150]}...')
            else:
                print(f'❌ Failed: {result["error"]}')
    
    asyncio.run(test())

