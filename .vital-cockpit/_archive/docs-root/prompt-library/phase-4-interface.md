# 🖥️ PHASE 4: USER INTERFACE PROMPTS

## PROMPT 4.1: Clinical Dashboard Components
```markdown
@workspace Create clinical dashboard UI components:

COMPONENTS NEEDED:

1. PatientTimeline
   - Visualize complete treatment journey
   - Interactive timeline with zoom/filter
   - Event categorization (diagnosis, treatment, labs)
   - Outcome markers and milestones
   - Export for EMR integration

2. ClinicalTrialMatcher
   - Patient eligibility screening interface
   - Side-by-side criteria comparison
   - Match scoring visualization
   - Trial site proximity mapping
   - One-click referral generation

3. EvidenceSynthesizer
   - Literature summary cards
   - Quality indicators (GRADE scores)
   - Citation management
   - Contradiction highlighting
   - Export to bibliography

4. RegulatoryTracker
   - Submission timeline Gantt chart
   - Milestone tracking with alerts
   - Document status dashboard
   - Review clock visualization
   - Interaction history

5. SafetyMonitor
   - Real-time adverse event dashboard
   - Signal detection alerts
   - Severity distribution charts
   - Causality assessment interface
   - DSMB reporting tools

6. DrugInteractionChecker
   - Visual interaction network
   - Severity color coding
   - Alternative suggestions
   - Evidence links
   - Clinical significance filters

For each component implement:
- HIPAA-compliant data display (PHI masking)
- Medical data visualization best practices
- Accessibility for clinical settings (WCAG 2.1)
- Export for EMR integration (HL7 FHIR)
- Audit trail for all actions
- Responsive design for tablets
- Offline capability with sync
- Print-friendly layouts
- Keyboard navigation

Use healthcare UI patterns:
- High contrast for clinical environments
- Large touch targets for tablet use (44x44px minimum)
- Quick actions for common tasks
- Clinical decision support indicators
- Error prevention for medical data
- Progressive disclosure for complex data
- Color-blind safe palettes
- Medical icon standards

Output as React TypeScript components:

```typescript
// Example structure for each component
interface PatientTimelineProps {
  patientId: string;
  dateRange: [Date, Date];
  eventTypes: EventType[];
  onEventClick: (event: TimelineEvent) => void;
  exportFormat: 'FHIR' | 'PDF' | 'CSV';
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({...}) => {
  // Component implementation with:
  // - Error boundaries for safety
  // - Loading states with skeletons
  // - Empty states with guidance
  // - Accessibility announcements
  // - Performance optimization (memo, lazy)
}
```

Include for each component:
- TypeScript interfaces
- Storybook stories with medical scenarios
- Jest/React Testing Library tests
- Accessibility tests (axe-core)
- Performance benchmarks
- Documentation with examples
- Figma design tokens integration
```

## PROMPT 4.2: Medical Workflow Builder
```markdown
@workspace Create visual workflow builder for clinical protocols:

FEATURES:
- Drag-and-drop protocol design interface
- Clinical decision trees with branching logic
- Conditional flows based on patient criteria
- Integration with clinical guidelines
- Validation against medical standards
- Version control and change tracking
- Collaborative editing with conflict resolution
- Simulation mode for testing
- Compliance checking

WORKFLOW TYPES TO SUPPORT:

1. Clinical Trial Protocols
   - Screening workflows
   - Treatment arms
   - Visit schedules
   - Dose escalation rules
   - Stopping criteria

2. Treatment Pathways
   - Diagnosis to treatment flows
   - Step therapy requirements
   - Alternative pathways
   - Outcome tracking

3. Diagnostic Algorithms
   - Test ordering sequences
   - Result interpretation rules
   - Differential diagnosis trees
   - Referral triggers

4. Regulatory Submission Flows
   - Document preparation chains
   - Review cycles
   - Approval gates
   - Post-approval requirements

5. Reimbursement Processes
   - Prior authorization flows
   - Appeals procedures
   - Documentation requirements
   - Denial management

Implement with:
```typescript
// Core workflow engine
interface WorkflowNode {
  id: string;
  type: 'decision' | 'action' | 'gateway' | 'event';
  data: {
    label: string;
    description: string;
    medicalCoding?: {
      system: 'ICD-10' | 'CPT' | 'SNOMED';
      code: string;
    };
    validationRules?: ValidationRule[];
    evidenceLinks?: Citation[];
  };
  position: { x: number; y: number };
  connections: Connection[];
}

interface WorkflowBuilder {
  nodes: WorkflowNode[];
  edges: Edge[];
  metadata: {
    version: string;
    author: string;
    reviewStatus: 'draft' | 'review' | 'approved';
    complianceChecks: ComplianceCheck[];
  };
}
```

Technical implementation:
- React Flow for visualization
- Zustand for state management
- BPMN 2.0 for standardization
- Yjs for real-time collaboration
- Version control with Git-like branching
- Validation engine with medical rules
- Export to:
  - BPMN XML
  - FHIR PlanDefinition
  - PDF documentation
  - Interactive web view

Include components:
- Node palette with medical activities
- Properties panel for configuration
- Validation panel with error messages
- Simulation controls
- Version history browser
- Collaboration indicators
- Comments and annotations
- Compliance check results
```

## PROMPT 4.3: Medical Query Interface
```markdown
@workspace Build natural language medical query interface:

REQUIREMENTS:
- Medical terminology autocomplete with synonyms
- Query templates for common medical questions
- Citation display with evidence quality indicators
- Confidence indicators for AI responses
- Export functionality for medical reports
- Voice input with medical vocabulary
- Multi-language support for global deployment
- Conversation history with PHI protection

QUERY TYPES TO HANDLE:

1. Clinical Evidence Queries
   - "What is the efficacy of [drug] for [condition]?"
   - "Compare [treatment A] vs [treatment B]"
   - "Latest guidelines for [disease]"
   
2. Drug Information Queries
   - "Dosing for [drug] in renal impairment"
   - "Interactions between [drug list]"
   - "Contraindications for [medication]"
   
3. Trial Design Queries
   - "Sample size for [endpoint] with [effect size]"
   - "Inclusion criteria for [condition] trials"
   - "FDA requirements for [indication]"
   
4. Diagnostic Queries
   - "Differential diagnosis for [symptoms]"
   - "Sensitivity/specificity of [test]"
   - "Workup for suspected [condition]"
   
5. Reimbursement Queries
   - "Coverage criteria for [procedure]"
   - "Prior auth requirements for [drug]"
   - "Appeal strategy for [denial reason]"

Implementation features:
```typescript
interface MedicalQueryInterface {
  // Autocomplete with medical terminology
  autocomplete: {
    medicalTerms: MedicalTerm[];
    abbreviations: Map<string, string>;
    synonyms: Map<string, string[]>;
    contextualSuggestions: (context: string) => Suggestion[];
  };
  
  // Query enhancement
  queryProcessor: {
    expandAbbreviations: (query: string) => string;
    identifyEntities: (query: string) => MedicalEntity[];
    suggestRelatedQueries: (query: string) => string[];
    detectQueryType: (query: string) => QueryCategory;
  };
  
  // Response formatting
  responseFormatter: {
    structureResponse: (raw: string) => FormattedResponse;
    extractCitations: (text: string) => Citation[];
    highlightConfidence: (text: string) => ConfidenceMarkedText;
    generateSummary: (response: string) => string;
  };
  
  // Export capabilities
  exportManager: {
    formats: ['PDF', 'DOCX', 'FHIR', 'HL7'];
    templates: Map<ExportType, Template>;
    pdfGenerator: (content: Content) => Blob;
    wordGenerator: (content: Content) => Blob;
  };
}
```

UI Components:
- Search bar with medical autocomplete
- Query history sidebar (PHI-safe)
- Template selector for common queries
- Response area with:
  - Structured answer sections
  - Evidence quality indicators
  - Confidence scoring
  - Citation list with links
  - Related queries suggestions
- Export toolbar
- Settings panel for preferences
- Feedback mechanism for accuracy

Include:
- Medical spell checking (Hunspell medical dictionary)
- Abbreviation expansion database
- Context preservation across queries
- Session management with encryption
- Collaborative features for care teams
- Mobile-responsive design
- Accessibility features (screen reader support)
- Performance optimization (query caching)
```
