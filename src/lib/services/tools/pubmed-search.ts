import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

const PubMedSearchSchema = z.object({
  query: z.string().describe('Medical/scientific search query'),
  maxResults: z.number().optional().default(5),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional()
});

export class PubMedSearchTool extends Tool {
  name = 'pubmed_search';
  description = 'Search PubMed for peer-reviewed medical literature. Use for medical and scientific research questions.';
  
  schema = PubMedSearchSchema;
  
  private readonly BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  
  async _call(input: z.infer<typeof PubMedSearchSchema>): Promise<string> {
    try {
      // Step 1: Search for PMIDs
      const searchUrl = `${this.BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(input.query)}&retmax=${input.maxResults}&retmode=json`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.esearchresult?.idlist?.length) {
        return 'No PubMed articles found for this query';
      }
      
      // Step 2: Fetch article details
      const ids = searchData.esearchresult.idlist.join(',');
      const fetchUrl = `${this.BASE_URL}/efetch.fcgi?db=pubmed&id=${ids}&retmode=xml&rettype=abstract`;
      
      const fetchResponse = await fetch(fetchUrl);
      const xmlText = await fetchResponse.text();
      
      // Parse XML (simplified - in production use proper XML parser)
      const articles = this.parseArticles(xmlText);
      
      return this.formatArticles(articles);
    } catch (error) {
      console.error('PubMed search error:', error);
      return `PubMed search failed: ${error.message}`;
    }
  }
  
  private parseArticles(xml: string): any[] {
    // Simplified XML parsing - use proper XML parser in production
    const articles = [];
    const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    
    for (const articleXml of articleMatches) {
      const title = this.extractTag(articleXml, 'ArticleTitle');
      const abstract = this.extractTag(articleXml, 'AbstractText');
      const authors = this.extractAuthors(articleXml);
      const pmid = this.extractTag(articleXml, 'PMID');
      const year = this.extractTag(articleXml, 'Year');
      
      articles.push({
        pmid,
        title,
        abstract,
        authors,
        year,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      });
    }
    
    return articles;
  }
  
  private extractTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`));
    return match ? match[1].trim() : '';
  }
  
  private extractAuthors(xml: string): string[] {
    const authors = [];
    const authorMatches = xml.match(/<Author>[\s\S]*?<\/Author>/g) || [];
    
    for (const authorXml of authorMatches.slice(0, 3)) {
      const lastName = this.extractTag(authorXml, 'LastName');
      const foreName = this.extractTag(authorXml, 'ForeName');
      if (lastName) {
        authors.push(`${lastName} ${foreName}`.trim());
      }
    }
    
    return authors;
  }
  
  private formatArticles(articles: any[]): string {
    if (articles.length === 0) {
      return 'No articles found';
    }
    
    return articles.map((article, index) => {
      return `
Article ${index + 1}:
Title: ${article.title}
Authors: ${article.authors.join(', ')} ${article.authors.length > 3 ? 'et al.' : ''}
Year: ${article.year}
PMID: ${article.pmid}
URL: ${article.url}

Abstract:
${article.abstract || 'No abstract available'}
`;
    }).join('\n---\n');
  }
}
