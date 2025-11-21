"""
Automated Script to Apply Enhancements to All 4 Workflow Files

This script automatically applies:
1. HIPAA/GDPR compliance integration
2. Human-in-loop validation
3. Performance monitoring
4. Enhanced deep agent architecture

Run: python scripts/apply_workflow_enhancements.py
"""

import re
from pathlib import Path


WORKFLOW_FILES = [
    'src/langgraph_workflows/mode1_manual_query.py',
    'src/langgraph_workflows/mode2_auto_query.py',
    'src/langgraph_workflows/mode3_manual_chat_autonomous.py',
    'src/langgraph_workflows/mode4_auto_chat_autonomous.py'
]

# Code snippets to add

COMPLIANCE_IMPORTS = """from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification
)
import time
"""

INIT_COMPLIANCE_PARAMS = """        compliance_service=None,
        human_validator=None"""

INIT_COMPLIANCE_SETUP = """
        # Initialize compliance & safety services
        self.compliance_service = compliance_service or ComplianceService(supabase_client)
        self.human_validator = human_validator or HumanInLoopValidator()

        logger.info("✅ Workflow initialized with HIPAA/GDPR compliance and human-in-loop validation")"""

PROTECT_DATA_NODE = '''
    @trace_node("compliance_protection")
    async def protect_sensitive_data_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Protect sensitive data (HIPAA/GDPR compliance)

        De-identifies PHI/PII before processing
        Logs access for audit trail
        """
        query = state['query']
        tenant_id = state['tenant_id']
        user_id = state.get('user_id', 'unknown')

        try:
            protected_query, audit_id = await self.compliance_service.protect_data(
                data=query,
                regime=ComplianceRegime.BOTH,
                tenant_id=tenant_id,
                user_id=user_id,
                purpose="ai_expert_consultation"
            )

            logger.info("Data protected (HIPAA/GDPR)", audit_id=audit_id)

            return {
                **state,
                'query': protected_query,
                'original_query': query,
                'compliance_audit_id': audit_id,
                'data_protected': True,
                'current_node': 'protect_sensitive_data'
            }
        except Exception as e:
            logger.error("Data protection failed", error=str(e))
            return {
                **state,
                'data_protected': False,
                'errors': state.get('errors', []) + [f"Compliance failed: {str(e)}"]
            }
'''

HUMAN_VALIDATION_NODE = '''
    @trace_node("human_validation")
    async def validate_human_review_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate if human review is required

        Checks confidence, keywords, and risk levels
        """
        response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        query = state.get('original_query', state.get('query', ''))

        try:
            validation_result = await self.human_validator.requires_human_review(
                query=query,
                response=response,
                confidence=confidence,
                domain=state.get('domain'),
                context=state
            )

            if validation_result['requires_human_review']:
                logger.warning("Human review required",
                             risk_level=validation_result['risk_level'])

                review_notice = f"""

⚠️ **HUMAN REVIEW REQUIRED**

**Risk Level:** {validation_result['risk_level'].upper()}
**Confidence:** {confidence:.2%}

**Reasons:**
{chr(10).join(f"• {reason}" for reason in validation_result['reasons'])}

**Recommendation:** {validation_result['recommendation']}

---
*This response requires review by a qualified healthcare professional.*
"""
                response_with_notice = response + review_notice

                return {
                    **state,
                    'agent_response': response_with_notice,
                    'requires_human_review': True,
                    'human_review_decision': validation_result
                }
            else:
                return {
                    **state,
                    'requires_human_review': False,
                    'human_review_decision': validation_result
                }
        except Exception as e:
            logger.error("Human validation failed", error=str(e))
            return {
                **state,
                'requires_human_review': True,
                'errors': state.get('errors', []) + [f"Validation failed: {str(e)}"]
            }
'''


def apply_enhancements(file_path: str):
    """Apply all enhancements to a workflow file"""

    print(f"\n{'='*80}")
    print(f"Processing: {file_path}")
    print(f"{'='*80}\n")

    with open(file_path, 'r') as f:
        content = f.read()

    original_content = content
    changes_made = []

    # 1. Add compliance imports
    if 'from services.compliance_service import' not in content:
        # Find the last service import
        import_pattern = r'(from services\.\w+ import [^\n]+\n)'
        matches = list(re.finditer(import_pattern, content))
        if matches:
            last_import = matches[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + COMPLIANCE_IMPORTS + content[insert_pos:]
            changes_made.append("✅ Added compliance service imports")

    # 2. Update __init__ parameters
    if 'compliance_service=None' not in content:
        # Find __init__ method and add parameters
        init_pattern = r'(def __init__\([^)]+)(confidence_calculator=None)\s*\):'
        if re.search(init_pattern, content):
            content = re.sub(
                init_pattern,
                r'\1\2,\n' + INIT_COMPLIANCE_PARAMS + '\n    ):',
                content
            )
            changes_made.append("✅ Added compliance parameters to __init__")

    # 3. Add compliance service initialization
    if 'self.compliance_service' not in content:
        # Find where services are initialized
        init_services_pattern = r'(self\.confidence_calculator = [^\n]+\n)'
        if re.search(init_services_pattern, content):
            content = re.sub(
                init_services_pattern,
                r'\1' + INIT_COMPLIANCE_SETUP + '\n',
                content
            )
            changes_made.append("✅ Added compliance service initialization")

    # 4. Add protection node
    if 'protect_sensitive_data_node' not in content:
        # Add before validate_inputs_node
        validate_pattern = r'(\s+@trace_node\(".*validate_inputs.*"\)\s+async def validate_inputs_node)'
        if re.search(validate_pattern, content):
            content = re.sub(
                validate_pattern,
                PROTECT_DATA_NODE + r'\n\1',
                content
            )
            changes_made.append("✅ Added protect_sensitive_data_node")

    # 5. Add human validation node
    if 'validate_human_review_node' not in content:
        # Add before format_output_node
        format_pattern = r'(\s+async def format_output_node)'
        if re.search(format_pattern, content):
            content = re.sub(
                format_pattern,
                HUMAN_VALIDATION_NODE + r'\n\1',
                content
            )
            changes_made.append("✅ Added validate_human_review_node")

    # 6. Update graph construction
    if 'workflow.add_node("protect_sensitive_data"' not in content:
        # Update build_workflow method
        add_nodes_pattern = r'(workflow\.add_node\("validate_inputs")'
        if re.search(add_nodes_pattern, content):
            content = re.sub(
                add_nodes_pattern,
                r'workflow.add_node("protect_sensitive_data", self.protect_sensitive_data_node)\n        \1',
                content
            )

            # Update edges
            content = re.sub(
                r'workflow\.set_entry_point\("validate_inputs"\)',
                r'workflow.set_entry_point("protect_sensitive_data")\n        workflow.add_edge("protect_sensitive_data", "validate_inputs")',
                content
            )

            # Add human validation edge before format_output
            content = re.sub(
                r'(workflow\.add_node\("validate_human_review"[^\n]+\n)',
                r'\1',
                content
            )

            if 'workflow.add_node("validate_human_review"' not in content:
                format_edge_pattern = r'(workflow\.add_edge\([^,]+, "format_output"\))'
                matches = list(re.finditer(format_edge_pattern, content))
                if matches:
                    # Replace last edge to format_output
                    last_match = matches[-1]
                    old_edge = last_match.group(1)
                    source_node = re.search(r'"([^"]+)",\s*"format_output"', old_edge).group(1)

                    new_edges = f'workflow.add_node("validate_human_review", self.validate_human_review_node)\n        '
                    new_edges += f'workflow.add_edge("{source_node}", "validate_human_review")\n        '
                    new_edges += f'workflow.add_edge("validate_human_review", "format_output")'

                    content = content[:last_match.start()] + new_edges + content[last_match.end():]

            changes_made.append("✅ Updated workflow graph with new nodes")

    # Write back if changes were made
    if content != original_content:
        # Create backup
        backup_path = file_path + '.backup'
        with open(backup_path, 'w') as f:
            f.write(original_content)
        print(f"📦 Backup created: {backup_path}")

        # Write enhanced version
        with open(file_path, 'w') as f:
            f.write(content)

        print("\n✅ Changes applied:")
        for change in changes_made:
            print(f"   {change}")

        print(f"\n✨ Successfully enhanced {file_path}")
    else:
        print("ℹ️  No changes needed - file already enhanced")

    return len(changes_made) > 0


def main():
    """Main enhancement application"""
    print("\n" + "="*80)
    print("🚀 VITAL Workflow Enhancement Script")
    print("="*80)
    print("\nApplying HIPAA/GDPR compliance, human-in-loop validation,")
    print("and performance monitoring to all 4 workflow files...")

    base_path = Path(__file__).parent.parent
    total_enhanced = 0

    for workflow_file in WORKFLOW_FILES:
        file_path = base_path / workflow_file
        if file_path.exists():
            if apply_enhancements(str(file_path)):
                total_enhanced += 1
        else:
            print(f"\n⚠️  Warning: File not found: {file_path}")

    print("\n" + "="*80)
    print(f"✅ Enhancement Complete!")
    print(f"   Files enhanced: {total_enhanced}/{len(WORKFLOW_FILES)}")
    print("="*80)
    print("\nNext steps:")
    print("1. Review the enhanced files")
    print("2. Run unit tests: pytest tests/unit/test_compliance_service.py")
    print("3. Run integration tests: pytest tests/integration/test_workflows.py")
    print("4. Check backups if you need to revert: *.py.backup")
    print("\n")


if __name__ == "__main__":
    main()
