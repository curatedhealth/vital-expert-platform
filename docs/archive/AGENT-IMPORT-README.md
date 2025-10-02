# Agent Import System

This document explains how to add new agents to the VITALpath platform using the JSON template system.

## Files

- `agent-template.json` - Template file with example agent structure and documentation
- `scripts/import-agents.js` - Script to import agents from JSON file to database

## How to Add New Agents

### Step 1: Prepare Your Agent Data

1. Copy the `agent-template.json` file to create your own agent data file (e.g., `my-agents.json`)
2. Edit the file to include your agents
3. Follow the template structure and field descriptions

### Step 2: Agent Data Structure

Each agent requires these fields:

#### Required Fields:
- `name` - Unique identifier (lowercase, hyphenated)
- `display_name` - Human-readable name
- `description` - Brief description of capabilities
- `system_prompt` - AI behavior instructions
- `model` - AI model to use (e.g., "gpt-4")

#### Optional Fields:
- `avatar` - Emoji or image path (default: "🤖")
- `color` - Hex color code (default: "#3B82F6")
- `capabilities` - Array of skills/abilities
- `rag_enabled` - Enable knowledge base search (default: true)
- `temperature` - AI creativity level 0.0-1.0 (default: 0.7)
- `max_tokens` - Response length limit (default: 2000)
- `knowledge_domains` - Areas of expertise
- `business_function` - Department/function served
- `role` - Professional title

#### Healthcare-Specific Fields:
- `medical_specialty` - Medical area of focus
- `clinical_validation_status` - Validation state
- `medical_accuracy_score` - Accuracy rating (0.0-1.0)
- `hipaa_compliant` - HIPAA compliance (default: false)
- `pharma_enabled` - Pharmaceutical protocols (default: false)
- `verify_enabled` - Medical verification (default: false)
- `fda_samd_class` - FDA device classification

### Step 3: Import Agents

Run the import script:

```bash
node scripts/import-agents.js your-agents.json
```

Example:
```bash
node scripts/import-agents.js agent-template.json
```

### Step 4: Verify Import

1. Check the script output for success messages
2. Visit the platform at http://localhost:3002/agents
3. Your new agents should appear in the agent list

## Example Agent

```json
{
  "name": "marketing-expert",
  "display_name": "Marketing Expert",
  "description": "Specialist in healthcare marketing and go-to-market strategies",
  "system_prompt": "You are a healthcare marketing expert with 15+ years of experience in medical device and pharmaceutical marketing...",
  "model": "gpt-4",
  "avatar": "📈",
  "color": "#10B981",
  "capabilities": [
    "Go-to-Market Strategy",
    "Brand Positioning",
    "Market Research",
    "Competitive Analysis"
  ],
  "rag_enabled": true,
  "temperature": 0.6,
  "max_tokens": 2000,
  "knowledge_domains": ["marketing", "business-strategy"],
  "business_function": "Marketing",
  "role": "Marketing Strategist"
}
```

## Tips

1. **Keep names unique** - Each agent needs a unique `name` field
2. **Write clear prompts** - The `system_prompt` defines how the agent behaves
3. **Test incrementally** - Import one agent first to test, then add more
4. **Use appropriate models** - "gpt-4" for complex tasks, "gpt-3.5-turbo" for simpler ones
5. **Set reasonable limits** - `max_tokens` between 1000-4000 is usually good

## Troubleshooting

### Import Fails
- Check JSON syntax (use a JSON validator)
- Ensure all required fields are present
- Verify database connection

### Agent Doesn't Appear
- Check the agent `status` is "active"
- Refresh the page or clear browser cache
- Check browser console for errors

### Agent Behaves Incorrectly
- Review the `system_prompt` for clarity
- Adjust `temperature` (lower = more focused)
- Verify `capabilities` match the prompt

## Support

If you encounter issues:
1. Check the import script output for error messages
2. Verify your JSON file format matches the template
3. Ensure all required fields are provided
4. Check the database connection and permissions