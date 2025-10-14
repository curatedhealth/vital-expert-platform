import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const FDADatabaseSchema = z.object({
  query: z.string().describe("Search query for FDA database"),
  database: z.enum(["drugs", "devices", "510k"]).describe("Type of FDA database to search"),
  date_range: z.object({
    start: z.string().optional().describe("Start date in YYYY-MM-DD format"),
    end: z.string().optional().describe("End date in YYYY-MM-DD format")
  }).optional().describe("Optional date range filter"),
  limit: z.number().min(1).max(100).default(10).describe("Maximum number of results to return")
});

export const fdaDatabaseTool = new DynamicStructuredTool({
  name: "search_fda_database",
  description: "Search FDA approvals, 510(k) clearances, and medical device databases for regulatory information",
  schema: FDADatabaseSchema,
  func: async ({ query, database, date_range, limit = 10 }) => {
    try {
      console.log(`🔍 Searching FDA ${database} database for: ${query}`);
      
      // Mock implementation - in production, integrate with actual FDA APIs
      const mockResults = {
        drugs: [
          {
            name: "Digital Health Drug A",
            approval_date: "2024-01-15",
            indication: "Digital therapeutics for diabetes management",
            manufacturer: "Digital Health Pharma Inc.",
            ndc: "12345-678-90",
            fda_approval_number: "NDA-123456"
          },
          {
            name: "AI-Assisted Medication B",
            approval_date: "2024-02-20",
            indication: "AI-guided treatment optimization",
            manufacturer: "AI Medical Solutions",
            ndc: "23456-789-01",
            fda_approval_number: "NDA-234567"
          }
        ],
        devices: [
          {
            name: "Digital Health Monitor Device",
            clearance_date: "2024-01-10",
            device_class: "Class II",
            manufacturer: "Digital Health Devices LLC",
            k_number: "K240001",
            indication: "Continuous health monitoring using digital biomarkers"
          },
          {
            name: "AI Diagnostic Assistant",
            clearance_date: "2024-03-05",
            device_class: "Class II",
            manufacturer: "AI Diagnostics Corp",
            k_number: "K240002",
            indication: "AI-assisted diagnostic decision support"
          }
        ],
        "510k": [
          {
            name: "Digital Therapeutic Software",
            submission_date: "2024-01-20",
            clearance_date: "2024-02-15",
            manufacturer: "Digital Therapeutics Inc",
            k_number: "K240003",
            predicate_device: "K200001",
            indication: "Software-based digital therapeutic for mental health"
          }
        ]
      };
      
      // Filter results based on query
      const results = mockResults[database] || [];
      const filteredResults = results
        .filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.indication?.toLowerCase().includes(query.toLowerCase()) ||
          item.manufacturer.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);
      
      // Apply date range filter if provided
      let finalResults = filteredResults;
      if (date_range?.start || date_range?.end) {
        finalResults = filteredResults.filter(item => {
          const itemDate = item.approval_date || item.clearance_date || item.submission_date;
          if (!itemDate) return true;
          
          const itemDateObj = new Date(itemDate);
          const startDate = date_range.start ? new Date(date_range.start) : null;
          const endDate = date_range.end ? new Date(date_range.end) : null;
          
          if (startDate && itemDateObj < startDate) return false;
          if (endDate && itemDateObj > endDate) return false;
          
          return true;
        });
      }
      
      const response = {
        database,
        query,
        total_results: finalResults.length,
        results: finalResults,
        search_metadata: {
          searched_at: new Date().toISOString(),
          date_range_applied: !!date_range,
          limit_applied: limit
        }
      };
      
      console.log(`✅ Found ${finalResults.length} FDA ${database} results`);
      return JSON.stringify(response, null, 2);
      
    } catch (error) {
      console.error('❌ FDA database search failed:', error);
      return JSON.stringify({
        error: "Failed to search FDA database",
        message: error instanceof Error ? error.message : "Unknown error",
        database,
        query
      });
    }
  }
});

export default fdaDatabaseTool;
