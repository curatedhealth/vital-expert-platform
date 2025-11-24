# Batch Upload Guide - VITAL Path Platform

This guide explains how to use the batch upload functionality to efficiently add agents, capabilities, and prompts to your VITAL Path platform.

## Overview

The batch upload system allows administrators to:
- Upload multiple agents, capabilities, and prompts simultaneously
- Validate data before actual upload
- Handle duplicates and updates intelligently
- Maintain data integrity and relationships

## Data Structure Requirements

### Agents Batch Upload

```json
{
  "agents": [
    {
      "name": "agent-identifier",
      "display_name": "Human Readable Name",
      "description": "Agent description",
      "model": "gpt-4",
      "system_prompt": "System instructions...",
      "tier": 1,
      "priority": 100,
      "implementation_phase": 1,
      "domain_expertise": "medical",
      "medical_specialty": "Cardiology",
      "clinical_validation_status": "validated",
      "hipaa_compliant": true,
      "is_custom": true
    }
  ],
  "options": {
    "validate_only": false,
    "skip_duplicates": true,
    "update_existing": false
  }
}
```

### Capabilities Batch Upload

```json
{
  "capabilities": [
    {
      "name": "capability-identifier",
      "display_name": "Human Readable Name",
      "description": "Capability description",
      "category": "clinical",
      "domain": "medical",
      "complexity_level": "advanced",
      "quality_metrics": {
        "accuracy_target": "95%",
        "time_target": "30 minutes",
        "compliance_requirements": ["FDA", "HIPAA"]
      },
      "prerequisite_knowledge": ["Medical knowledge", "Regulations"],
      "validation_requirements": {
        "medical_review_required": true
      }
    }
  ],
  "options": {
    "validate_only": false,
    "skip_duplicates": true,
    "create_categories": true
  }
}
```

### Prompts Batch Upload

```json
{
  "prompts": [
    {
      "name": "prompt-identifier",
      "display_name": "Human Readable Name",
      "description": "Prompt description",
      "domain": "medical",
      "complexity_level": "moderate",
      "system_prompt": "You are an expert...",
      "user_prompt_template": "Please analyze: {input}",
      "input_schema": {
        "input": "string"
      },
      "output_schema": {
        "analysis": "string"
      },
      "success_criteria": {
        "description": "Analysis completed successfully"
      },
      "model_requirements": {
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 2000
      }
    }
  ],
  "options": {
    "validate_only": false,
    "link_capabilities": true,
    "validate_templates": true
  }
}
```

## API Endpoints

### POST /api/batch/agents
Upload multiple agents with healthcare compliance fields.

### POST /api/batch/capabilities
Upload multiple capabilities with validation requirements.

### POST /api/batch/prompts
Upload multiple prompts with template validation.

## Upload Options

### General Options
- `validate_only`: Perform validation without actually inserting data
- `skip_duplicates`: Skip items that already exist (default: true)
- `update_existing`: Update existing items instead of skipping

### Capability-Specific Options
- `create_categories`: Automatically create missing categories

### Prompt-Specific Options
- `link_capabilities`: Automatically link prerequisite capabilities
- `validate_templates`: Validate prompt template syntax

## Validation Rules

### Agent Validation
- `name`: Must be lowercase with hyphens (kebab-case)
- `display_name`: Required, max 255 characters
- `system_prompt`: Required, minimum 50 characters
- `tier`: Must be 1, 2, or 3
- `medical_accuracy_score`: If provided, must be 0-1
- `fda_samd_class`: If provided, must be '', 'I', 'IIa', 'IIb', or 'III'

### Capability Validation
- `name`: Must be lowercase with hyphens
- `complexity_level`: Must be 'basic', 'intermediate', 'advanced', or 'expert'
- `quality_metrics`: Required object with accuracy and time targets
- `domain`: Required field for categorization

### Prompt Validation
- `name`: Must be lowercase with hyphens
- `system_prompt`: Required, minimum 50 characters
- `user_prompt_template`: Required, minimum 20 characters
- Template syntax: Validates placeholder braces {variable}
- `input_schema` and `output_schema`: Required JSON objects

## Healthcare Compliance Fields

The system includes specialized fields for healthcare compliance:

### Medical Validation
- `medical_specialty`: Specialty area (e.g., "Cardiology", "Oncology")
- `clinical_validation_status`: "pending", "validated", "expired", "under_review"
- `medical_accuracy_score`: Measured accuracy (0-1 scale)
- `citation_accuracy`: Citation accuracy (0-1 scale)
- `hallucination_rate`: Error rate (0-1 scale)

### Regulatory Compliance
- `fda_samd_class`: FDA Software as Medical Device classification
- `hipaa_compliant`: HIPAA compliance status
- `pharma_enabled`: Pharmaceutical use cases enabled
- `verify_enabled`: Verification requirement for responses

### Performance Metrics
- `cost_per_query`: Average cost per interaction
- `average_latency_ms`: Response time in milliseconds
- `audit_trail`: JSON audit information

## Best Practices

### Data Preparation
1. **Validate JSON**: Ensure all JSON files are properly formatted
2. **Use Validation Mode**: Always test with `validate_only: true` first
3. **Incremental Uploads**: Start with small batches to test the process
4. **Backup Data**: Keep original data files as backups

### Naming Conventions
- Use kebab-case for identifiers (e.g., `clinical-trial-coordinator`)
- Use descriptive, clear names for display names
- Include domain expertise in agent names where relevant

### Error Handling
- Review validation errors carefully before re-uploading
- Check duplicate warnings if `skip_duplicates` is enabled
- Monitor compliance field requirements for healthcare agents

### Performance Optimization
- Upload in batches of 50-100 items for optimal performance
- Use `link_capabilities` for prompts to maintain relationships
- Enable `create_categories` for capabilities to auto-organize

## Troubleshooting

### Common Errors

**"Name must be lowercase with hyphens"**
- Fix: Use kebab-case naming (e.g., `my-agent-name`)

**"System prompt too short"**
- Fix: Ensure system prompts are at least 50 characters

**"Invalid device classification"**
- Fix: Use valid FDA device classes: '', 'I', 'IIa', 'IIb', 'III'

**"Template validation failed"**
- Fix: Check for unmatched braces in prompt templates

### Performance Issues
- Reduce batch size if uploads are timing out
- Check network connectivity for large uploads
- Review server logs for detailed error information

## Sample Files

Sample JSON files are available in the `/data/batch-uploads/` directory:
- `agents_batch.json` - Sample agents with healthcare compliance
- `capabilities_batch.json` - Sample capabilities with validation
- `prompts_batch.json` - Sample prompts with templates

## Security Considerations

- Batch upload is restricted to admin users only
- All uploads are logged for audit purposes
- Row Level Security (RLS) policies apply to uploaded data
- Healthcare compliance fields are validated for accuracy

## Support

For additional support with batch uploads:
1. Check the validation errors in the upload results
2. Review this documentation for data format requirements
3. Test with sample data files first
4. Contact your system administrator for access issues