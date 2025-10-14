import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const ClinicalTrialsSchema = z.object({
  query: z.string().describe("Search query for clinical trials"),
  max_results: z.number().min(1).max(50).default(10).describe("Maximum number of results to return"),
  status: z.enum(["recruiting", "active", "completed", "suspended", "terminated", "all"]).default("all").describe("Trial status filter"),
  phase: z.enum(["phase_1", "phase_2", "phase_3", "phase_4", "all"]).default("all").describe("Trial phase filter"),
  study_type: z.enum(["interventional", "observational", "expanded_access", "all"]).default("all").describe("Type of study"),
  date_range: z.object({
    start: z.string().optional().describe("Start date in YYYY-MM-DD format"),
    end: z.string().optional().describe("End date in YYYY-MM-DD format")
  }).optional().describe("Optional date range filter")
});

export const clinicalTrialsTool = new DynamicStructuredTool({
  name: "search_clinical_trials",
  description: "Search ClinicalTrials.gov database for ongoing and completed clinical trials",
  schema: ClinicalTrialsSchema,
  func: async ({ query, max_results = 10, status = "all", phase = "all", study_type = "all", date_range }) => {
    try {
      console.log(`🔍 Searching ClinicalTrials.gov for: ${query}`);
      
      // Mock implementation - in production, integrate with ClinicalTrials.gov API
      const mockResults = [
        {
          nct_id: "NCT12345678",
          title: "Digital Therapeutic Intervention for Type 2 Diabetes Management",
          status: "recruiting",
          phase: "phase_3",
          study_type: "interventional",
          start_date: "2024-01-15",
          completion_date: "2025-12-31",
          primary_purpose: "treatment",
          intervention_type: "device",
          condition: "Type 2 Diabetes",
          eligibility_criteria: "Adults aged 18-75 with Type 2 diabetes, HbA1c 7-10%",
          primary_outcome: "Change in HbA1c from baseline to 6 months",
          secondary_outcomes: ["Quality of life measures", "Medication adherence", "Weight management"],
          locations: ["United States", "Canada", "United Kingdom"],
          sponsor: "Digital Health Solutions Inc",
          principal_investigator: "Dr. Sarah Johnson",
          contact_info: "sarah.johnson@digitalhealth.com",
          description: "A randomized controlled trial evaluating the efficacy of a digital therapeutic app combined with continuous glucose monitoring for diabetes management."
        },
        {
          nct_id: "NCT12345679",
          title: "AI-Powered Diagnostic Tool for Early Cancer Detection",
          status: "active",
          phase: "phase_2",
          study_type: "interventional",
          start_date: "2023-09-01",
          completion_date: "2024-12-31",
          primary_purpose: "diagnostic",
          intervention_type: "device",
          condition: "Early Cancer Detection",
          eligibility_criteria: "Adults aged 40+ with family history of cancer or high-risk factors",
          primary_outcome: "Sensitivity and specificity of AI diagnostic tool",
          secondary_outcomes: ["False positive rate", "Time to diagnosis", "Patient satisfaction"],
          locations: ["United States", "Germany", "Japan"],
          sponsor: "AI Medical Technologies",
          principal_investigator: "Dr. Michael Chen",
          contact_info: "michael.chen@aimedical.com",
          description: "Phase 2 study evaluating an AI-powered imaging tool for early detection of various cancer types using machine learning algorithms."
        },
        {
          nct_id: "NCT12345680",
          title: "Wearable Device for Mental Health Monitoring and Intervention",
          status: "completed",
          phase: "phase_2",
          study_type: "interventional",
          start_date: "2023-03-01",
          completion_date: "2024-02-28",
          primary_purpose: "treatment",
          intervention_type: "device",
          condition: "Depression, Anxiety",
          eligibility_criteria: "Adults aged 18-65 with mild to moderate depression or anxiety",
          primary_outcome: "Change in PHQ-9 and GAD-7 scores from baseline to 12 weeks",
          secondary_outcomes: ["Sleep quality", "Stress levels", "Medication adherence"],
          locations: ["United States", "Australia"],
          sponsor: "Mental Health Innovations",
          principal_investigator: "Dr. Emily Rodriguez",
          contact_info: "emily.rodriguez@mhi.com",
          description: "Completed study evaluating a wearable device that monitors physiological markers and provides real-time mental health interventions."
        },
        {
          nct_id: "NCT12345681",
          title: "Digital Health Platform for Chronic Disease Management",
          status: "recruiting",
          phase: "phase_1",
          study_type: "interventional",
          start_date: "2024-06-01",
          completion_date: "2025-05-31",
          primary_purpose: "treatment",
          intervention_type: "other",
          condition: "Chronic Disease Management",
          eligibility_criteria: "Adults with one or more chronic conditions (diabetes, hypertension, heart disease)",
          primary_outcome: "Platform usability and patient engagement metrics",
          secondary_outcomes: ["Health outcomes", "Healthcare utilization", "Cost effectiveness"],
          locations: ["United States"],
          sponsor: "Chronic Care Solutions",
          principal_investigator: "Dr. Robert Kim",
          contact_info: "robert.kim@chroniccare.com",
          description: "Phase 1 study testing a comprehensive digital health platform that integrates multiple chronic disease management tools and connects patients with healthcare providers."
        },
        {
          nct_id: "NCT12345682",
          title: "Telemedicine and AI Integration for Rural Healthcare",
          status: "active",
          phase: "phase_3",
          study_type: "observational",
          start_date: "2023-12-01",
          completion_date: "2025-11-30",
          primary_purpose: "health_services_research",
          intervention_type: "other",
          condition: "General Healthcare Access",
          eligibility_criteria: "Patients in rural areas with limited access to healthcare",
          primary_outcome: "Healthcare access and quality metrics",
          secondary_outcomes: ["Patient satisfaction", "Provider efficiency", "Cost savings"],
          locations: ["United States", "Canada"],
          sponsor: "Rural Health Initiative",
          principal_investigator: "Dr. Lisa Thompson",
          contact_info: "lisa.thompson@ruralhealth.org",
          description: "Observational study examining the impact of integrating telemedicine and AI tools in rural healthcare settings to improve access and outcomes."
        }
      ];
      
      // Filter results based on query
      let filteredResults = mockResults.filter(trial => 
        trial.title.toLowerCase().includes(query.toLowerCase()) ||
        trial.condition.toLowerCase().includes(query.toLowerCase()) ||
        trial.description.toLowerCase().includes(query.toLowerCase()) ||
        trial.primary_outcome.toLowerCase().includes(query.toLowerCase())
      );
      
      // Filter by status
      if (status !== "all") {
        filteredResults = filteredResults.filter(trial => trial.status === status);
      }
      
      // Filter by phase
      if (phase !== "all") {
        filteredResults = filteredResults.filter(trial => trial.phase === phase);
      }
      
      // Filter by study type
      if (study_type !== "all") {
        filteredResults = filteredResults.filter(trial => trial.study_type === study_type);
      }
      
      // Apply date range filter if provided
      if (date_range?.start || date_range?.end) {
        filteredResults = filteredResults.filter(trial => {
          const trialStartDate = new Date(trial.start_date);
          const startDate = date_range.start ? new Date(date_range.start) : null;
          const endDate = date_range.end ? new Date(date_range.end) : null;
          
          if (startDate && trialStartDate < startDate) return false;
          if (endDate && trialStartDate > endDate) return false;
          
          return true;
        });
      }
      
      // Limit results
      const finalResults = filteredResults.slice(0, max_results);
      
      const response = {
        query,
        total_results: finalResults.length,
        results: finalResults,
        search_metadata: {
          searched_at: new Date().toISOString(),
          status_filter: status,
          phase_filter: phase,
          study_type_filter: study_type,
          date_range_applied: !!date_range,
          max_results_applied: max_results
        }
      };
      
      console.log(`✅ Found ${finalResults.length} clinical trial results`);
      return JSON.stringify(response, null, 2);
      
    } catch (error) {
      console.error('❌ Clinical trials search failed:', error);
      return JSON.stringify({
        error: "Failed to search ClinicalTrials.gov database",
        message: error instanceof Error ? error.message : "Unknown error",
        query
      });
    }
  }
});

export default clinicalTrialsTool;
