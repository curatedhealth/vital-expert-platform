import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const PubMedSchema = z.object({
  query: z.string().describe("Search query for PubMed database"),
  max_results: z.number().min(1).max(50).default(10).describe("Maximum number of results to return"),
  date_range: z.object({
    start: z.string().optional().describe("Start date in YYYY/MM/DD format"),
    end: z.string().optional().describe("End date in YYYY/MM/DD format")
  }).optional().describe("Optional date range filter"),
  article_type: z.enum(["clinical_trial", "review", "meta_analysis", "case_study", "all"]).default("all").describe("Type of article to search for"),
  sort_by: z.enum(["relevance", "date", "author", "journal"]).default("relevance").describe("Sort order for results")
});

export const pubmedTool = new DynamicStructuredTool({
  name: "search_pubmed",
  description: "Search PubMed/NCBI database for peer-reviewed medical literature and research papers",
  schema: PubMedSchema,
  func: async ({ query, max_results = 10, date_range, article_type = "all", sort_by = "relevance" }) => {
    try {
      console.log(`🔍 Searching PubMed for: ${query}`);
      
      // Mock implementation - in production, integrate with NCBI E-utilities API
      const mockResults = [
        {
          pmid: "12345678",
          title: "Digital Health Interventions for Diabetes Management: A Systematic Review",
          authors: ["Smith, J.", "Johnson, A.", "Brown, K."],
          journal: "Journal of Digital Health",
          publication_date: "2024-01-15",
          abstract: "This systematic review examines the effectiveness of digital health interventions in diabetes management, including mobile apps, wearable devices, and AI-powered monitoring systems.",
          article_type: "review",
          doi: "10.1234/jdh.2024.001",
          keywords: ["digital health", "diabetes", "mobile health", "artificial intelligence"],
          citation_count: 45,
          impact_factor: 8.2
        },
        {
          pmid: "12345679",
          title: "AI-Powered Clinical Decision Support Systems: A Meta-Analysis",
          authors: ["Wilson, M.", "Davis, R.", "Lee, S."],
          journal: "Artificial Intelligence in Medicine",
          publication_date: "2024-02-20",
          abstract: "Meta-analysis of 25 studies evaluating AI-powered clinical decision support systems across various medical specialties, showing significant improvements in diagnostic accuracy.",
          article_type: "meta_analysis",
          doi: "10.1234/aim.2024.002",
          keywords: ["artificial intelligence", "clinical decision support", "diagnostic accuracy", "meta-analysis"],
          citation_count: 32,
          impact_factor: 9.1
        },
        {
          pmid: "12345680",
          title: "Randomized Controlled Trial of Digital Therapeutics for Mental Health",
          authors: ["Garcia, P.", "Martinez, L.", "Taylor, B."],
          journal: "Digital Therapeutics",
          publication_date: "2024-03-10",
          abstract: "A 12-week randomized controlled trial comparing digital therapeutic interventions with traditional therapy for anxiety and depression, showing non-inferiority outcomes.",
          article_type: "clinical_trial",
          doi: "10.1234/dt.2024.003",
          keywords: ["digital therapeutics", "mental health", "randomized controlled trial", "anxiety", "depression"],
          citation_count: 18,
          impact_factor: 6.8
        },
        {
          pmid: "12345681",
          title: "Case Study: Implementation of AI in Hospital Workflow",
          authors: ["Chen, W.", "Anderson, K."],
          journal: "Healthcare Informatics",
          publication_date: "2024-01-25",
          abstract: "Case study of implementing AI-powered workflow optimization in a large hospital system, resulting in 30% reduction in administrative burden.",
          article_type: "case_study",
          doi: "10.1234/hi.2024.004",
          keywords: ["artificial intelligence", "hospital workflow", "implementation", "case study"],
          citation_count: 12,
          impact_factor: 5.5
        }
      ];
      
      // Filter results based on query
      let filteredResults = mockResults.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.abstract.toLowerCase().includes(query.toLowerCase()) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Filter by article type
      if (article_type !== "all") {
        filteredResults = filteredResults.filter(article => article.article_type === article_type);
      }
      
      // Apply date range filter if provided
      if (date_range?.start || date_range?.end) {
        filteredResults = filteredResults.filter(article => {
          const articleDate = new Date(article.publication_date);
          const startDate = date_range.start ? new Date(date_range.start) : null;
          const endDate = date_range.end ? new Date(date_range.end) : null;
          
          if (startDate && articleDate < startDate) return false;
          if (endDate && articleDate > endDate) return false;
          
          return true;
        });
      }
      
      // Sort results
      switch (sort_by) {
        case "date":
          filteredResults.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
          break;
        case "author":
          filteredResults.sort((a, b) => a.authors[0].localeCompare(b.authors[0]));
          break;
        case "journal":
          filteredResults.sort((a, b) => a.journal.localeCompare(b.journal));
          break;
        case "relevance":
        default:
          // Sort by citation count as a proxy for relevance
          filteredResults.sort((a, b) => b.citation_count - a.citation_count);
          break;
      }
      
      // Limit results
      const finalResults = filteredResults.slice(0, max_results);
      
      const response = {
        query,
        total_results: finalResults.length,
        results: finalResults,
        search_metadata: {
          searched_at: new Date().toISOString(),
          article_type_filter: article_type,
          sort_by,
          date_range_applied: !!date_range,
          max_results_applied: max_results
        }
      };
      
      console.log(`✅ Found ${finalResults.length} PubMed results`);
      return JSON.stringify(response, null, 2);
      
    } catch (error) {
      console.error('❌ PubMed search failed:', error);
      return JSON.stringify({
        error: "Failed to search PubMed database",
        message: error instanceof Error ? error.message : "Unknown error",
        query
      });
    }
  }
});

export default pubmedTool;
