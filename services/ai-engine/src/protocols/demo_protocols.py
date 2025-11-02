"""
PHARMA & VERIFY Protocol Demo Script
================================================================================
Demonstrates the pharmaceutical compliance framework with template integration
"""

import asyncio
import json
from protocols.protocol_manager import (
    ProtocolManager,
    DocumentType,
    RegulatoryRegion
)


async def demo_value_dossier_validation():
    """Demo: Value Dossier with PHARMA & VERIFY protocols"""
    print("\n" + "=" * 80)
    print("DEMO 1: VALUE DOSSIER VALIDATION")
    print("=" * 80)
    
    # Initialize protocol manager
    manager = ProtocolManager(
        enable_pharma=True,
        enable_verify=True,
        strict_mode=False
    )
    
    # Sample AI-generated value dossier excerpt
    response = """
    ## Clinical Value Proposition
    
    Product X demonstrates significant improvements in progression-free survival (PFS)
    compared to standard of care. In the pivotal Phase 3 trial (STUDY-001), the hazard 
    ratio for PFS was 0.68 (95% CI: 0.55-0.84, p<0.001), representing a 32% reduction
    in risk of progression or death.
    
    The safety profile shows manageable adverse events, with Grade 3/4 events occurring
    in 45% of patients vs 38% in the control arm. Most common AEs include fatigue (52%),
    nausea (38%), and diarrhea (35%).
    
    ## Economic Value Proposition
    
    Cost-effectiveness analysis demonstrates an ICER of $75,000 per QALY gained, which 
    falls below the commonly cited threshold of $100,000-$150,000 per QALY in the US.
    
    **Limitation:** Long-term real-world effectiveness data beyond 2 years is not yet
    available and requires continued monitoring.
    
    **Disclaimer:** This information is for payers and HTA bodies. Individual treatment
    decisions should be made by qualified healthcare professionals considering patient-
    specific factors.
    """
    
    # Context with citations
    context = {
        "user_id": "medical-writer-001",
        "organization_id": "pharma-company-xyz",
        "request_id": "vd-2025-001",
        "citations": [
            {
                "text": "STUDY-001 primary analysis",
                "source": "Clinical Study Report STUDY-001",
                "year": 2024
            },
            {
                "text": "Cost-effectiveness model",
                "source": "Health Economic Model v2.0",
                "year": 2024
            }
        ],
        "rag_context": {
            "documents": [
                {
                    "content": "hazard ratio 0.68, 95% CI 0.55-0.84",
                    "source": "CSR STUDY-001 Table 14.2.1"
                }
            ]
        },
        "confidence": 0.85
    }
    
    # Validate with Value Dossier template
    result = manager.validate_response(
        response=response,
        context=context,
        agent_type="market_access",
        template_id="value-dossier-v1"
    )
    
    # Print comprehensive report
    report = manager.generate_comprehensive_report(result)
    print(report)
    
    return result


async def demo_regulatory_submission():
    """Demo: Regulatory submission with strict compliance"""
    print("\n" + "=" * 80)
    print("DEMO 2: REGULATORY SUBMISSION VALIDATION (STRICT MODE)")
    print("=" * 80)
    
    manager = ProtocolManager(
        enable_pharma=True,
        enable_verify=True,
        strict_mode=True  # Strict for regulatory!
    )
    
    # Sample clinical summary excerpt (with issues for demo)
    response = """
    ## Efficacy Results
    
    The drug showed promising results in patients. Many patients experienced improvement
    in symptoms. The treatment was generally effective and well-tolerated.
    
    Side effects were typical for this class of medication and manageable.
    """
    
    context = {
        "user_id": "reg-affairs-002",
        "citations": [],  # NO CITATIONS - will fail
        "confidence": 0.4  # LOW CONFIDENCE - will fail
    }
    
    result = manager.validate_response(
        response=response,
        context=context,
        agent_type="regulatory",
        template_id="regulatory-submission-fda-nda"
    )
    
    report = manager.generate_comprehensive_report(result)
    print(report)
    
    print("\n⚠️  EXPECTED FAILURES:")
    print("   - Vague quantifiers ('many', 'generally')")
    print("   - No citations for efficacy claims")
    print("   - Low confidence score")
    print("   - Missing specific data (HR, CI, p-values)")
    
    return result


async def demo_template_search():
    """Demo: Search and retrieve templates"""
    print("\n" + "=" * 80)
    print("DEMO 3: TEMPLATE REGISTRY SEARCH")
    print("=" * 80)
    
    manager = ProtocolManager()
    
    # List all templates
    print("\n📚 ALL AVAILABLE TEMPLATES:")
    all_templates = manager.list_templates()
    for tid, name in all_templates.items():
        print(f"   • {tid}: {name}")
    
    # Search by document type
    print("\n🔍 SEARCH: Value/Market Access Documents")
    value_templates = manager.search_templates(
        document_type=DocumentType.VALUE_DOSSIER
    )
    for template in value_templates:
        print(f"\n   Template: {template.name}")
        print(f"   Purpose: {template.purpose}")
        print(f"   Audience: {', '.join(template.audience[:3])}")
        print(f"   Required SOPs: {', '.join(template.metrics['sops'])}")
    
    # Search regulatory submissions
    print("\n🔍 SEARCH: FDA Regulatory Submissions")
    reg_templates = manager.search_templates(
        regulatory_region=RegulatoryRegion.FDA_US
    )
    for template in reg_templates:
        print(f"\n   Template: {template.name}")
        print(f"   Region: {template.regulatory_region.value if template.regulatory_region else 'Global'}")
        print(f"   Compliance: {', '.join(template.compliance_protocols)}")
    
    # Get specific template details
    print("\n📋 TEMPLATE DETAILS: Value Dossier")
    vd_template = manager.get_template("value-dossier-v1")
    if vd_template:
        print(f"\n   PHARMA FRAMEWORK:")
        print(f"   • Purpose: {vd_template.purpose}")
        print(f"   • Hypotheses: {len(vd_template.hypotheses)} defined")
        print(f"   • Audience: {len(vd_template.audience)} stakeholder types")
        print(f"   • Requirements: {len(vd_template.requirements)} categories")
        print(f"   • Metrics: {len(vd_template.metrics['sops'])} SOPs linked")
        print(f"   • Actions: {len(vd_template.actions)} enabled")
        print(f"\n   STRUCTURE:")
        print(f"   • Sections: {len(vd_template.sections)}")
        for section in vd_template.sections:
            req_mark = "✓" if section['required'] else " "
            print(f"     [{req_mark}] {section['title']}")


async def demo_chain_of_thought_with_pharma():
    """Demo: Chain-of-Thought reasoning with PHARMA framework"""
    print("\n" + "=" * 80)
    print("DEMO 4: CHAIN-OF-THOUGHT WITH PHARMA FRAMEWORK")
    print("=" * 80)
    
    manager = ProtocolManager()
    
    # Get template
    template = manager.get_template("value-dossier-v1")
    
    print("\n🧠 AI AGENT: Using PHARMA Framework for Value Dossier")
    print("\nStep 1: PURPOSE - Define objective")
    print(f"   → {template.purpose}")
    
    print("\nStep 2: HYPOTHESES - State assumptions")
    for i, hyp in enumerate(template.hypotheses, 1):
        print(f"   {i}. {hyp}")
    
    print("\nStep 3: AUDIENCE - Identify stakeholders")
    for aud in template.audience[:3]:
        print(f"   • {aud}")
    
    print("\nStep 4: REQUIREMENTS - Check compliance needs")
    print(f"   • Regulatory: {', '.join(template.requirements['regulatory'])}")
    print(f"   • Data: {', '.join(template.requirements['data'][:2])}, ...")
    print(f"   • Compliance: {', '.join(template.requirements['compliance'])}")
    
    print("\nStep 5: METRICS - Apply SOPs")
    for sop in template.metrics['sops']:
        print(f"   ✓ {sop}")
    
    print("\nStep 6: ACTIONS - Enable next steps")
    for action in template.actions:
        print(f"   → {action}")
    
    print("\n💡 Result: Structured, compliant value dossier with clear audit trail")


async def demo_verify_anti_hallucination():
    """Demo: VERIFY protocol catching hallucinations"""
    print("\n" + "=" * 80)
    print("DEMO 5: VERIFY ANTI-HALLUCINATION DETECTION")
    print("=" * 80)
    
    manager = ProtocolManager(enable_verify=True, strict_mode=True)
    
    # Response with hallucination markers
    bad_response = """
    Based on my general knowledge, I think this drug is probably effective for most 
    patients. Everyone knows that this class of drugs works well. The FDA approved it
    recently, so it must be safe. I believe the efficacy rate is around 80% or so.
    """
    
    print("\n❌ TESTING RESPONSE WITH HALLUCINATION MARKERS:")
    print(bad_response)
    
    result = manager.validate_response(
        response=bad_response,
        context={"citations": [], "confidence": 0.3},
        agent_type="medical"
    )
    
    print("\n🚨 VERIFY PROTOCOL VIOLATIONS DETECTED:")
    if result.verify_result:
        for violation in result.verify_result.violations:
            print(f"   [{violation.severity.upper()}] {violation.component}: {violation.message}")
        
        for warning in result.verify_result.warnings:
            print(f"   [WARN] {warning}")
    
    print(f"\n📊 Confidence Score: {result.verify_result.confidence_score:.2%}")
    print(f"✅ Status: {'BLOCKED' if not result.verify_result.is_verified else 'PASSED'}")
    
    # Now show good response
    print("\n" + "-" * 80)
    print("\n✅ TESTING RESPONSE WITHOUT HALLUCINATIONS:")
    
    good_response = """
    According to the FDA-approved label (Reference ID: 4567890, approved March 2024),
    this drug demonstrated a response rate of 78% (95% CI: 71-84%, p<0.001) in the 
    pivotal Phase 3 trial (STUDY-001, n=456 patients).
    
    **Confidence Level: HIGH** - Based on Level 1 evidence (RCT)
    **Source: FDA Drug Approval Package, March 2024**
    
    **Limitation:** Long-term safety data beyond 24 months is limited. Continued 
    monitoring recommended.
    
    **Disclaimer:** Individual treatment decisions require consultation with qualified
    healthcare professionals.
    """
    
    print(good_response)
    
    result2 = manager.validate_response(
        response=good_response,
        context={
            "citations": [
                {"text": "FDA label 2024", "source": "FDA.gov", "year": 2024},
                {"text": "STUDY-001", "source": "NEJM 2024", "year": 2024}
            ],
            "confidence": 0.92
        },
        agent_type="medical"
    )
    
    print(f"\n📊 Confidence Score: {result2.verify_result.confidence_score:.2%}")
    print(f"✅ Status: {'VERIFIED' if result2.verify_result.is_verified else 'FAILED'}")


async def main():
    """Run all demos"""
    print("\n" + "=" * 80)
    print("PHARMA & VERIFY PROTOCOL DEMONSTRATION")
    print("Pharmaceutical AI Compliance Framework")
    print("=" * 80)
    
    # Run demos
    await demo_value_dossier_validation()
    await demo_regulatory_submission()
    await demo_template_search()
    await demo_chain_of_thought_with_pharma()
    await demo_verify_anti_hallucination()
    
    print("\n" + "=" * 80)
    print("✅ ALL DEMOS COMPLETE")
    print("=" * 80)
    print("\n📚 Key Takeaways:")
    print("   1. PHARMA Protocol ensures pharmaceutical-grade precision and compliance")
    print("   2. VERIFY Protocol prevents AI hallucinations and requires evidence")
    print("   3. Template Registry provides SOP-linked document frameworks")
    print("   4. Chain-of-Thought reasoning structured by PHARMA framework")
    print("   5. Comprehensive audit trails for regulatory compliance (21 CFR Part 11)")
    print("\n🎯 Ready for integration with AI Engine Mode 1-4 workflows!")


if __name__ == "__main__":
    asyncio.run(main())

