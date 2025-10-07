# System Prompt Generation - Hybrid Approach

## Overview

The agent creation system supports **two methods** for generating comprehensive system prompts:

1. **Template-Based Generation** (Fast, Free, Deterministic)
2. **AI-Optimized Generation** (Smart, Natural, Context-Aware)

Both methods compile all agent attributes into a complete system prompt that guides the agent's behavior.

---

## 🎯 When to Use Each Method

### Template-Based Generation

**Best for:**
- ✅ **Compliance-heavy agents** (Medical, Pharmaceutical, Regulatory)
- ✅ **Auditable prompts** that require consistency
- ✅ **Rapid prototyping** and iteration
- ✅ **Cost-sensitive scenarios** (no API costs)
- ✅ **Offline environments**

**Characteristics:**
- ⚡ **Instant** generation (< 100ms)
- 💰 **Free** (no API costs)
- 📏 **Predictable** structure every time
- 🔍 **Auditable** and transparent
- 📋 **Structured** markdown format

---

### AI-Optimized Generation

**Best for:**
- ✅ **Natural language flow** and readability
- ✅ **Context-aware optimization** based on agent tier/specialty
- ✅ **Removing redundancy** and improving clarity
- ✅ **Adaptive tone** matching the agent's role
- ✅ **Complex multi-domain agents** requiring nuanced prompts

**Characteristics:**
- 🤖 **AI-powered** using GPT-4o
- ⏱️ **2-10 seconds** generation time
- 💵 **$0.02-$0.05** per generation (varies by prompt complexity)
- 🎯 **Context-aware** and optimized
- 🌊 **Natural flowing** language

---

## 📋 What Gets Included

Both methods include all agent attributes:

### 1. Identity & Role
- Agent name and description
- Primary mission
- Value proposition
- Tier classification (1-3)

### 2. Organizational Context
- Business function
- Department
- Role within organization

### 3. Architecture & Reasoning
- Architecture pattern (REACTIVE, HYBRID, DELIBERATIVE, MULTI_AGENT)
- Reasoning method (DIRECT, COT, REACT, HYBRID, MULTI_PATH)
- Communication tone and style
- Complexity level

### 4. Capabilities
- All selected agent capabilities
- Medical capabilities (if applicable)
- Competencies and specializations

### 5. Medical Compliance (if applicable)
- Medical specialty
- FDA SaMD classification
- Active protocols (HIPAA, PHARMA, VERIFY)
- Medical accuracy threshold
- Medical capabilities with regulatory compliance

### 6. Safety & Compliance Rules
- **Prohibitions** (what the agent must NEVER do)
- **Mandatory Protections** (what the agent must ALWAYS do)
- **Regulatory Standards** (FDA, HIPAA, GxP, etc.)
- **Confidence Thresholds** (minimum confidence, escalation, defer to human)

### 7. Knowledge Domains
- All assigned knowledge domain access
- Specialized knowledge areas

### 8. Tools & Integrations
- Available tools with descriptions
- Integration capabilities

### 9. Behavioral Directives
- Response style
- Interaction patterns
- Output specifications

### 10. Success Criteria
- Tier-specific performance standards
- Accuracy thresholds
- Response time targets
- Compliance requirements

---

## 🔧 Implementation Details

### Template-Based Generation

**Function:** `generateCompleteSystemPrompt()`

**Location:** `src/features/chat/components/agent-creator.tsx` (lines 1526-1739)

**Process:**
1. Builds structured markdown sections from form data
2. Uses conditional logic to include/exclude sections
3. Formats with clear headers and bullet points
4. Updates `formData.systemPrompt` directly
5. Switches to Basic Info tab for review

**Example Output:**
```markdown
# AGENT IDENTITY

You are Clinical Trial Protocol Designer, Expert in designing phase I-IV clinical trial protocols

## Primary Mission
Design scientifically rigorous clinical trial protocols that meet regulatory standards

# ORGANIZATIONAL CONTEXT

- **Business Function**: Clinical Development
- **Department**: Clinical Operations
- **Role**: Protocol Designer

# ARCHITECTURE & REASONING

- **Architecture Pattern**: DELIBERATIVE
- **Reasoning Method**: COT
- **Communication Tone**: Professional, Evidence-Based
...
```

---

### AI-Optimized Generation

**Function:** `generateAISystemPrompt()`

**Location:** `src/features/chat/components/agent-creator.tsx` (lines 1741-1823)

**API Endpoint:** `POST /api/generate-system-prompt`

**Location:** `src/app/api/generate-system-prompt/route.ts`

**Process:**
1. Prepares structured JSON payload with all agent data
2. Sends to OpenAI GPT-4o with system instructions
3. LLM generates optimized prompt
4. Returns prompt with metadata (tokens used, model)
5. Updates `formData.systemPrompt`
6. Switches to Basic Info tab for review

**API Request Format:**
```typescript
{
  agentData: {
    identity: { name, description, tier, primaryMission, valueProposition },
    organization: { businessFunction, department, role },
    architecture: { pattern, reasoningMethod, communicationTone, ... },
    capabilities: [...],
    medicalCompliance: { specialty, fdaClass, ... },
    safety: { prohibitions, mandatory_protections, ... },
    knowledgeDomains: [...],
    tools: [...]
  },
  mode: 'optimize' // or 'generate'
}
```

**API Response Format:**
```typescript
{
  systemPrompt: string,  // Generated prompt
  tokensUsed: number,    // Total tokens consumed
  model: string,         // Model used (e.g., 'gpt-4o')
  success: boolean
}
```

---

## 🔀 Hybrid Workflow

**Function:** `generateSystemPromptHybrid()`

**Location:** `src/features/chat/components/agent-creator.tsx` (lines 1825-1834)

**Workflow:**
1. User selects mode (Template or AI)
2. Clicks "Generate" button
3. System calls appropriate generation function
4. If AI fails, offers fallback to template
5. Result displayed in Basic Info tab
6. User can review and manually edit if needed

---

## 🎨 UI Components

### Mode Selection (Safety Tab)

Located at the end of the Safety tab before the footer.

**Features:**
- Radio button selection between modes
- Visual badges showing speed and cost
- Descriptive text explaining each method
- Dynamic button text based on selected mode
- Loading spinner during generation
- Disabled state while generating

**Visual Design:**
- Gradient background (purple to orange)
- Large Zap icon
- Clear mode cards with hover effects
- Green badge for "Fast • Free"
- Purple badge for "Smart • $0.02-0.05"

---

## 🚀 Usage Instructions

### For Users

1. **Fill in all agent attributes** across all tabs:
   - Basic Info
   - Organization
   - Capabilities
   - Prompt Starters
   - Knowledge
   - Tools
   - Models
   - Reasoning
   - Safety

2. **Navigate to Safety tab**

3. **Scroll to bottom** to find "Generate Complete System Prompt"

4. **Select generation mode:**
   - **Template-Based**: Instant, free, structured
   - **AI-Optimized**: Smart, natural, costs ~$0.03

5. **Click Generate button**

6. **Review the generated prompt** in Basic Info tab

7. **Manually edit** if needed (optional)

8. **Save the agent**

---

### For Developers

#### Adding Template Sections

Edit `generateCompleteSystemPrompt()` in `agent-creator.tsx`:

```typescript
// Add new section
if (formData.newField) {
  prompt += `# NEW SECTION\n\n`;
  prompt += `${formData.newField}\n\n`;
}
```

#### Modifying AI Instructions

Edit the system instruction in `/api/generate-system-prompt/route.ts`:

```typescript
const systemInstruction = `You are an expert at crafting system prompts...

Your task is to...

Requirements:
1. ...
2. ...

The prompt should be:
- ...
- ...
`;
```

#### Changing AI Model

In `/api/generate-system-prompt/route.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o', // Change to 'gpt-3.5-turbo', 'gpt-4-turbo-preview', etc.
  messages: [...],
  temperature: 0.7, // Adjust creativity (0.0-2.0)
  max_tokens: 3000, // Adjust max length
});
```

---

## 📊 Performance Comparison

| Metric | Template-Based | AI-Optimized |
|--------|---------------|--------------|
| **Speed** | < 100ms | 2-10 seconds |
| **Cost** | $0.00 | $0.02-$0.05 |
| **Consistency** | 100% same output | ~95% similar |
| **Readability** | Good (structured) | Excellent (natural) |
| **Compliance** | Excellent (explicit) | Good (inferred) |
| **Customization** | Template-limited | Highly adaptive |
| **Offline** | ✅ Yes | ❌ No |
| **Auditable** | ✅ Yes | ⚠️ Requires review |

---

## 🔒 Security & Compliance

### Template-Based
- ✅ **No external API calls** - all processing local
- ✅ **No data leaves the system**
- ✅ **Fully auditable** - deterministic output
- ✅ **Compliant by design** - follows strict structure

### AI-Optimized
- ⚠️ **Sends data to OpenAI** - review privacy policy
- ⚠️ **Non-deterministic** - output varies slightly
- ⚠️ **Requires review** - ensure compliance before use
- ✅ **Encrypted in transit** - HTTPS communication
- ✅ **Fallback available** - template-based if fails

**Recommendation for Regulated Industries:**
- Use **Template-Based** for production agents
- Use **AI-Optimized** for prototyping and internal agents
- **Always review** AI-generated prompts before deployment

---

## 🐛 Error Handling

### AI Generation Failures

**Possible Errors:**
1. **OpenAI API key missing or invalid**
   - Error: "OpenAI API key is invalid or missing"
   - Solution: Set `OPENAI_API_KEY` in `.env.local`

2. **API quota exceeded**
   - Error: "OpenAI API quota exceeded"
   - Solution: Check billing at platform.openai.com

3. **Network timeout**
   - Error: "Failed to generate AI-optimized prompt"
   - Solution: Check internet connection, retry

**Fallback Behavior:**
- System prompts user to use template-based generation
- No data loss - all form data preserved
- User can retry or switch modes

---

## 💡 Best Practices

### Template-Based
1. ✅ **Fill all relevant fields** - empty fields are skipped
2. ✅ **Use clear, specific capability names**
3. ✅ **Define explicit safety rules** in metadata
4. ✅ **Review generated prompt** - ensure no gaps
5. ✅ **Iterate and refine** - template improves with feedback

### AI-Optimized
1. ✅ **Provide context-rich descriptions** - helps AI understand intent
2. ✅ **Be specific with constraints** - clear prohibitions/protections
3. ✅ **Review output carefully** - ensure no hallucinations
4. ✅ **Compare with template version** - validate completeness
5. ✅ **Test with actual use cases** - verify behavior matches

---

## 📝 Example Scenarios

### Scenario 1: Medical Device Agent (High Compliance)

**Recommended:** Template-Based

**Reasoning:**
- Requires strict regulatory compliance
- Must be auditable for FDA submissions
- Consistency is critical
- No room for AI hallucinations

**Workflow:**
1. Fill all compliance fields carefully
2. Select Template-Based mode
3. Generate prompt instantly
4. Review for completeness
5. Save and document for audit trail

---

### Scenario 2: Internal HR Assistant (Low Risk)

**Recommended:** AI-Optimized

**Reasoning:**
- Natural language more user-friendly
- Low regulatory requirements
- Can benefit from adaptive tone
- Cost is acceptable for better UX

**Workflow:**
1. Fill key fields (name, description, capabilities)
2. Select AI-Optimized mode
3. Wait 5-10 seconds for generation
4. Review for appropriateness
5. Save and deploy

---

### Scenario 3: Research Analysis Agent (Mixed)

**Recommended:** Hybrid (Template first, then AI refine)

**Reasoning:**
- Needs structure from template
- Benefits from natural language flow
- Can iterate on both versions
- Compare outputs for best result

**Workflow:**
1. Generate template-based version
2. Save as backup
3. Generate AI-optimized version
4. Compare both versions
5. Manually combine best elements
6. Save final version

---

## 🔄 Future Enhancements

### Planned Features
- [ ] **Batch generation** for multiple agents
- [ ] **Version comparison** UI for side-by-side review
- [ ] **Prompt templates library** for common agent types
- [ ] **A/B testing** framework for prompt effectiveness
- [ ] **Claude/Gemini support** as alternative to OpenAI
- [ ] **Local LLM option** for air-gapped environments
- [ ] **Prompt optimization suggestions** based on agent performance
- [ ] **Export to PDF** with formatting

---

## 🤝 Contributing

To improve prompt generation:

1. **Template improvements**: Edit `generateCompleteSystemPrompt()`
2. **AI instruction improvements**: Edit `/api/generate-system-prompt/route.ts`
3. **UI enhancements**: Edit Safety tab generation section
4. **Add new sections**: Update both template and AI functions
5. **Test thoroughly**: Verify with various agent configurations

---

## 📞 Support

**Issues:**
- GitHub: [Create Issue](https://github.com/your-repo/issues)
- Documentation: [View Docs](https://docs.your-domain.com)

**Questions:**
- Technical: engineering@your-domain.com
- Compliance: compliance@your-domain.com

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** 2025-10-06
**Version:** 1.0.0
**Author:** Claude Code Assistant
