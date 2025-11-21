# Persona-Based AI Agent Designer

## Overview

The **Persona-Based AI Agent Designer** is an intelligent, guided workflow that helps users create role-specific agents by starting with organizational context and leveraging AI to suggest appropriate configurations.

**Key Innovation:** Instead of manually filling dozens of form fields, users select their organizational role and describe their intent. AI then generates a complete agent persona tailored to that specific role within the organization.

---

## 🎯 Design Philosophy

### Traditional Approach (Manual)
```
User → Fill 50+ fields manually → Hope configuration makes sense → Save
```
**Problems:**
- ❌ Overwhelming number of fields
- ❌ Unclear what values are appropriate
- ❌ No role-specific guidance
- ❌ High chance of misconfiguration

### Persona-Based Approach (AI-Guided)
```
User → Select Role → Describe Intent → AI Suggests Complete Persona → Review & Refine → Apply
```
**Benefits:**
- ✅ Role-aware suggestions
- ✅ Industry best practices built-in
- ✅ Consistent with existing patterns
- ✅ Fast, guided creation (< 2 minutes)

---

## 🚀 User Workflow

### Step 1: Organization Selection

**What:** Select the organizational context for the agent

**Fields:**
1. **Business Function** (e.g., Clinical Development, Regulatory Affairs, Commercial)
2. **Department** (filtered by function, e.g., Clinical Operations, Protocol Design)
3. **Role** (filtered by department, e.g., Protocol Designer, Medical Writer)

**Why This Order:**
- Function → Department → Role creates logical hierarchy
- Each selection narrows down options for the next
- Ensures agent fits into organizational structure
- Enables role-specific AI suggestions

**UI Features:**
- Cascading dropdowns (each dependent on previous selection)
- Disabled states until prerequisites are selected
- Clear labels and required field indicators

---

### Step 2: Intent Description

**What:** Describe what the agent should do

**Format:** Free-text description (recommended 2-4 sentences)

**Good Example:**
```
I need an agent that can design phase II-IV clinical trial protocols,
ensuring compliance with FDA and ICH-GCP guidelines. The agent should
provide evidence-based recommendations for endpoint selection, sample
size calculation, and statistical analysis plans. It should also flag
potential regulatory issues early in the protocol development process.
```

**What to Include:**
- **Primary tasks** (what the agent does)
- **Compliance requirements** (regulatory standards)
- **Key capabilities** (specific skills needed)
- **Expected outcomes** (what success looks like)

**UI Features:**
- Large textarea (200px height)
- Helpful placeholder with example
- Context reminder (shows selected org hierarchy)
- Tip text for guidance

---

### Step 3: AI-Generated Suggestions

**What:** Review and customize AI-generated persona

**AI Generates:**

#### Identity
- **Agent Name**: Professional, role-specific (e.g., "Clinical Trial Protocol Designer")
- **Description**: 1-2 sentences describing the agent
- **Tier**: 1 (Foundational), 2 (Specialist), or 3 (Expert) based on role complexity

#### Classification
- **Status**: Usually "active" for new agents
- **Priority**: 1-10 based on criticality (regulatory = high, support = medium)

#### Capabilities
- 5-8 specific capabilities based on role requirements
- Mix of domain-specific and general capabilities
- Industry best practices included

#### Architecture
- **Pattern**: REACTIVE (Tier 1), HYBRID (Tier 2), or DELIBERATIVE (Tier 3)
- **Reasoning Method**: DIRECT, COT (Chain of Thought), or REACT
- **Communication Tone**: Professional, Empathetic, Technical, etc.
- **Communication Style**: Concise, Detailed, Conversational, Formal, etc.

#### Mission & Value
- **Primary Mission**: Core purpose statement
- **Value Proposition**: Key benefit to users

#### Tools & Knowledge
- Suggested tools based on role
- Relevant knowledge domains

#### AI Reasoning
- Explanation of why these suggestions fit the role
- Displayed in blue info box for transparency

**User Actions:**
1. **Review all suggestions**
2. **Edit any field directly**
   - Change agent name
   - Adjust tier
   - Modify description
   - Add/remove capabilities
   - Refine mission/value statements
3. **Regenerate** if suggestions don't fit (returns to Step 2)
4. **Apply** to populate the main form

---

## 🏗️ Technical Architecture

### Frontend Components

**File:** `src/features/chat/components/agent-creator.tsx`

**Key State:**
```typescript
const [showPersonaWizard, setShowPersonaWizard] = useState(false);
const [personaWizardStep, setPersonaWizardStep] = useState<'organization' | 'intent' | 'suggestions'>('organization');
const [personaIntent, setPersonaIntent] = useState('');
const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
const [personaSuggestions, setPersonaSuggestions] = useState<any>(null);
```

**Key Functions:**
```typescript
// Generate persona from AI
const generatePersonaSuggestions = async () => { ... }

// Apply suggestions to form
const applyPersonaSuggestions = () => { ... }

// Handle cascading dropdowns
const handleBusinessFunctionChange = (value: string) => { ... }
const handleDepartmentChange = (value: string) => { ... }
```

---

### Backend API

**Endpoint:** `POST /api/generate-persona`

**File:** `src/app/api/generate-persona/route.ts`

**Request Format:**
```typescript
{
  organization: {
    businessFunction: string,
    department: string,
    role: string
  },
  intent: string,
  existingAgents?: Array<{
    name: string,
    description: string,
    tier: number,
    capabilities: string[]
  }>
}
```

**Response Format:**
```typescript
{
  agentName: string,
  description: string,
  tier: 1 | 2 | 3,
  status: "active",
  priority: number,
  capabilities: string[],
  architecturePattern: "REACTIVE" | "HYBRID" | "DELIBERATIVE",
  reasoningMethod: "DIRECT" | "COT" | "REACT",
  communicationTone: string,
  communicationStyle: string,
  primaryMission: string,
  valueProposition: string,
  tools: string[],
  knowledgeDomains: string[],
  reasoning: string,
  _meta: {
    tokensUsed: number,
    model: string,
    generatedAt: string
  }
}
```

**AI Model:** GPT-4o with JSON response format

**Temperature:** 0.8 (slightly higher for creativity)

**Max Tokens:** 2000

---

## 🎨 UI/UX Design

### Visual Flow

```
┌─────────────────────────────────────────────┐
│  [1]━━━━━[2]━━━━━[3]   Step Indicator       │
│   •      •      ○                           │
│  Org   Intent Review                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                                             │
│  Step-specific content card                 │
│  (Organization / Intent / Suggestions)      │
│                                             │
│  [Cancel / Back]        [Next / Generate]   │
└─────────────────────────────────────────────┘
```

### Design Tokens

**Colors:**
- Primary: `market-purple` (#6B46C1)
- Success: `green-500` (#22C55E)
- Info: `blue-50` (background), `blue-600` (text)
- Background: `purple-50` (context display)

**Components:**
- Rounded corners: `rounded-lg` (8px)
- Shadows: `shadow-xl` for elevated cards
- Spacing: Consistent 4-6 between elements
- Typography: Labels are bold, hints are `text-xs`

---

## 📊 Example Scenarios

### Scenario 1: Clinical Trial Protocol Designer

**Input:**
- **Function**: Clinical Development
- **Department**: Clinical Operations
- **Role**: Protocol Designer
- **Intent**: "Design phase II-IV clinical trial protocols ensuring FDA and ICH-GCP compliance, with evidence-based endpoint selection and sample size calculations."

**AI Output:**
```json
{
  "agentName": "Clinical Trial Protocol Designer",
  "description": "Expert in designing scientifically rigorous clinical trial protocols that meet regulatory standards and ensure patient safety.",
  "tier": 3,
  "priority": 9,
  "capabilities": [
    "Phase II-IV protocol design",
    "FDA/ICH-GCP compliance validation",
    "Statistical analysis plan development",
    "Endpoint selection and justification",
    "Sample size calculation",
    "Protocol feasibility assessment",
    "Risk-based monitoring strategies",
    "Safety outcome measures"
  ],
  "architecturePattern": "DELIBERATIVE",
  "reasoningMethod": "COT",
  "communicationTone": "Professional, Evidence-Based",
  "communicationStyle": "Detailed, Structured",
  "primaryMission": "Design scientifically robust clinical trial protocols that balance scientific rigor with operational feasibility while maintaining regulatory compliance.",
  "valueProposition": "Reduces protocol amendments by 40% through comprehensive upfront design and regulatory compliance checks.",
  "tools": ["Regulatory Database", "Statistical Calculator", "Protocol Template Library"],
  "knowledgeDomains": ["FDA Guidance Documents", "ICH-GCP Guidelines", "Statistical Methods"],
  "reasoning": "Tier 3 (Expert) assigned due to high complexity of clinical trial design requiring deep regulatory knowledge and statistical expertise. Deliberative architecture chosen for complex multi-step reasoning. COT (Chain of Thought) reasoning method for transparent decision-making in protocol design."
}
```

---

### Scenario 2: Patient Support Coordinator

**Input:**
- **Function**: Commercial
- **Department**: Patient Support
- **Role**: Support Coordinator
- **Intent**: "Provide empathetic guidance to patients navigating reimbursement and access programs."

**AI Output:**
```json
{
  "agentName": "Patient Access Navigator",
  "description": "Compassionate guide helping patients understand and access medication assistance programs.",
  "tier": 1,
  "priority": 5,
  "capabilities": [
    "Reimbursement program information",
    "Prior authorization guidance",
    "Copay assistance referrals",
    "Insurance verification",
    "Patient education"
  ],
  "architecturePattern": "REACTIVE",
  "reasoningMethod": "DIRECT",
  "communicationTone": "Empathetic, Supportive",
  "communicationStyle": "Conversational, Clear",
  "primaryMission": "Simplify the complex world of medication access and reimbursement for patients and caregivers.",
  "valueProposition": "Reduces patient dropout by 30% through proactive access support and clear guidance.",
  "tools": ["Insurance Verifier", "Program Database"],
  "knowledgeDomains": ["Patient Assistance Programs", "Insurance Coverage"],
  "reasoning": "Tier 1 (Foundational) for straightforward patient support tasks. Reactive architecture for quick response. Empathetic tone critical for patient-facing role."
}
```

---

## 🔄 Integration with Main Form

After applying suggestions, the user is taken to the main form with all fields pre-populated:

**Basic Info Tab:**
- ✅ Name
- ✅ Description
- ✅ Tier
- ✅ Status
- ✅ Priority

**Organization Tab:**
- ✅ Business Function
- ✅ Department
- ✅ Role

**Capabilities Tab:**
- ✅ Capabilities list

**Reasoning Tab:**
- ✅ Architecture Pattern
- ✅ Reasoning Method
- ✅ Communication Tone
- ✅ Communication Style
- ✅ Primary Mission
- ✅ Value Proposition

**Tools Tab:**
- ✅ Suggested tools

**Knowledge Tab:**
- ✅ Knowledge domains

**User then completes:**
- Prompt Starters (custom)
- Knowledge files/URLs (if needed)
- Models selection
- Medical Compliance (if applicable)
- Safety rules (if needed)
- Final system prompt generation

---

## 💡 Best Practices

### For Users

1. **Be Specific in Intent**
   - Include tasks, compliance needs, and expected outcomes
   - Mention specific regulations or standards
   - Describe the user audience

2. **Review All Suggestions**
   - Don't blindly accept AI output
   - Check capabilities match your needs
   - Verify tier assignment is appropriate

3. **Customize as Needed**
   - Edit names to match your terminology
   - Add domain-specific capabilities
   - Adjust tone/style to match culture

4. **Test After Creation**
   - Try sample queries with the agent
   - Verify behavior matches intent
   - Refine system prompt if needed

---

### For Administrators

1. **Monitor AI Costs**
   - Each persona generation costs ~$0.03-0.05
   - Set budgets if needed
   - Consider caching common personas

2. **Review Generated Agents**
   - Spot-check AI suggestions for accuracy
   - Ensure compliance requirements are met
   - Validate tier assignments

3. **Build Persona Library**
   - Save successful personas as templates
   - Create role-specific starting points
   - Share best practices across teams

4. **Gather Feedback**
   - Track which suggestions are accepted/rejected
   - Identify patterns in customizations
   - Improve system instructions based on feedback

---

## 🐛 Troubleshooting

### Issue: AI generates inappropriate tier

**Solution:** Manually adjust tier in Step 3 before applying. Consider refining intent description to emphasize complexity.

### Issue: Capabilities don't match role

**Solution:** Add/remove capabilities in Step 3. Use X button to remove, manually add by editing the list.

### Issue: API timeout or error

**Solution:** Check internet connection. Verify OpenAI API key is valid. Retry or use manual creation as fallback.

### Issue: Can't return to wizard after applying

**Solution:** Wizard is one-way. If you need to regenerate, create a new agent and use wizard again.

---

## 📈 Future Enhancements

### Planned Features
- [ ] **Persona Library**: Save and reuse common personas
- [ ] **Role Templates**: Pre-built templates for common roles
- [ ] **Batch Creation**: Create multiple agents from org chart
- [ ] **Version Comparison**: Compare AI suggestions across generations
- [ ] **Learning Mode**: AI learns from accepted/rejected suggestions
- [ ] **Export/Import**: Share personas across environments
- [ ] **A/B Testing**: Test different persona configurations

### Potential Improvements
- Multi-language support for global organizations
- Integration with HR systems for automatic role sync
- Persona versioning and change tracking
- Compliance validation before apply
- Role-based approval workflows

---

## 📞 Support

**Questions:**
- Technical: engineering@your-domain.com
- Product: product@your-domain.com

**Resources:**
- API Documentation: `/docs/SYSTEM_PROMPT_GENERATION.md`
- Setup Guide: `/docs/SYSTEM_PROMPT_SETUP.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-06
**Author:** Claude Code Assistant
