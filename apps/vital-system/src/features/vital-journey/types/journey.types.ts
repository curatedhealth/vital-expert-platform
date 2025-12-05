/**
 * VITAL Journey Types
 *
 * V - Value Discovery: Identify strategic value and pain points
 * I - Investigation & Ideation: Explore opportunities with ontology
 * T - Trials: Portfolio of experiments and rapid prototyping
 * A - Adoption & Acceleration: Solution deployment and scaling
 * L - Learning & Leadership: Iterate and lead through insights
 */

export type VitalPhase = "V" | "I" | "T" | "A" | "L";

export interface PhaseConfig {
  id: VitalPhase;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  objectives: string[];
  deliverables: string[];
  tools: string[];
}

export const VITAL_PHASES: Record<VitalPhase, PhaseConfig> = {
  V: {
    id: "V",
    title: "Value Discovery",
    subtitle: "Understand the strategic landscape",
    description:
      "Map organizational context, identify decision-makers, understand pain points, and quantify the value of faster, smarter decisions.",
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    icon: "Target",
    objectives: [
      "Identify key stakeholders and decision-makers",
      "Map current decision-making processes",
      "Quantify cost of delays and errors",
      "Define success metrics",
    ],
    deliverables: [
      "Stakeholder map",
      "Decision inventory",
      "Value hypothesis",
      "Success criteria",
    ],
    tools: ["Ontology Explorer", "Stakeholder Mapping", "Value Calculator"],
  },
  I: {
    id: "I",
    title: "Investigation & Ideation",
    subtitle: "Explore opportunities with the ontology",
    description:
      "Use the enterprise ontology to discover GenAI opportunities, map JTBDs to AI capabilities, and prioritize based on value and feasibility.",
    color: "#3B82F6",
    bgColor: "#3B82F620",
    icon: "Search",
    objectives: [
      "Map organization to ontology model",
      "Identify high-AI-potential JTBDs",
      "Score opportunities by value and feasibility",
      "Generate opportunity heat map",
    ],
    deliverables: [
      "Ontology mapping",
      "AI opportunity scores",
      "Prioritized opportunity list",
      "Connection analysis",
    ],
    tools: ["Ontology Explorer", "AI Scoring", "Heat Map Generator"],
  },
  T: {
    id: "T",
    title: "Trials & Testing",
    subtitle: "Rapid prototyping and proof of value",
    description:
      "Design and run experiments to validate AI opportunities, build quick prototypes, measure impact, and iterate based on feedback.",
    color: "#10B981",
    bgColor: "#10B98120",
    icon: "FlaskConical",
    objectives: [
      "Design experiment portfolio",
      "Build rapid prototypes",
      "Measure proof of value",
      "Gather user feedback",
    ],
    deliverables: [
      "Experiment designs",
      "Working prototypes",
      "Impact measurements",
      "Feedback synthesis",
    ],
    tools: ["Workflow Designer", "Agent Builder", "Analytics Dashboard"],
  },
  A: {
    id: "A",
    title: "Adoption & Acceleration",
    subtitle: "Deploy and scale successful solutions",
    description:
      "Roll out validated solutions, enable users, integrate with existing systems, and accelerate adoption across the organization.",
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    icon: "Rocket",
    objectives: [
      "Deploy proven solutions",
      "Train and enable users",
      "Integrate with existing workflows",
      "Measure adoption metrics",
    ],
    deliverables: [
      "Deployment plan",
      "Training materials",
      "Integration guides",
      "Adoption dashboard",
    ],
    tools: ["Solution Deployer", "Training Hub", "Integration Manager"],
  },
  L: {
    id: "L",
    title: "Learning & Leadership",
    subtitle: "Scale through continuous improvement",
    description:
      "Capture learnings, optimize based on data, expand to new areas, and establish thought leadership through demonstrated impact.",
    color: "#EC4899",
    bgColor: "#EC489920",
    icon: "GraduationCap",
    objectives: [
      "Measure business impact",
      "Capture and share learnings",
      "Identify expansion opportunities",
      "Build organizational capability",
    ],
    deliverables: [
      "Impact reports",
      "Best practices guide",
      "Expansion roadmap",
      "Capability matrix",
    ],
    tools: ["Impact Analytics", "Knowledge Base", "Roadmap Planner"],
  },
};

// Journey instance for a specific client engagement
export interface JourneyInstance {
  id: string;
  clientName: string;
  projectName: string;
  startDate: Date;
  currentPhase: VitalPhase;
  phases: {
    [K in VitalPhase]: PhaseStatus;
  };
  team: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseStatus {
  status: "not_started" | "in_progress" | "completed" | "blocked";
  startDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  notes: string[];
  artifacts: Artifact[];
  opportunities: Opportunity[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface Artifact {
  id: string;
  type: "document" | "diagram" | "report" | "prototype" | "data";
  name: string;
  description: string;
  url?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  jtbdId?: string;
  jtbdCode?: string;
  aiSuitability: number;
  valueCategory: string;
  valueDriver: string;
  estimatedImpact: string;
  complexity: "low" | "medium" | "high";
  priority: "quick_win" | "strategic" | "foundation" | "defer";
  status: "identified" | "validated" | "in_trial" | "adopted" | "scaled";
  linkedAgents?: string[];
}

// Value Driver categories from the ontology
export type ValueCategory = "SMARTER" | "FASTER" | "BETTER" | "EFFICIENT" | "SAFER" | "SCALABLE";

export interface ValueDriver {
  id: string;
  code: string;
  name: string;
  category: ValueCategory;
  description: string;
  impactWeight: number;
}

// For connecting to ontology data
export interface OntologyContext {
  selectedFunction?: string;
  selectedDepartments: string[];
  selectedRoles: string[];
  selectedJTBDs: string[];
  aiSuitabilityThreshold: number;
  valueFilters: ValueCategory[];
}
