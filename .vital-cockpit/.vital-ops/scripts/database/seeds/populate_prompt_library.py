#!/usr/bin/env python3
"""
Populate PROMPTS™ Framework - Suites and Sub-Suites
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# ============================================================================
# PROMPTS™ FRAMEWORK DATA
# ============================================================================

PROMPTS_SUITES = [
    {
        "suite_code": "RULES",
        "suite_name": "RULES™",
        "suite_full_name": "Regulatory Understanding & Legal Excellence Standards",
        "tagline": "Navigate Regulatory Excellence",
        "description": "Navigate complex regulatory landscapes with expert-level guidance on FDA, EMA, and global submissions.",
        "purpose": "Navigate complex regulatory landscapes with expert-level guidance on FDA, EMA, and global submissions.",
        "target_roles": [
            "Regulatory Affairs Managers",
            "Compliance Officers",
            "Quality Assurance Professionals"
        ],
        "coverage_areas": [
            "FDA pathways (510(k), PMA, De Novo, IND, NDA, BLA)",
            "European Medicines Agency (EMA) submissions",
            "Global regulatory authorities",
            "Regulatory strategy and planning",
            "Compliance and quality systems"
        ],
        "icon": "🏛️",
        "color": "#2563EB",
        "prompt_count": 200,
        "sort_order": 1
    },
    {
        "suite_code": "TRIALS",
        "suite_name": "TRIALS™",
        "suite_full_name": "Therapeutic Research & Investigation Analysis & Leadership Standards",
        "tagline": "Design Clinical Excellence",
        "description": "Design, execute, and analyze clinical trials with scientific rigor and regulatory compliance.",
        "purpose": "Design, execute, and analyze clinical trials with scientific rigor and regulatory compliance.",
        "target_roles": [
            "Clinical Research Associates",
            "Study Coordinators",
            "Biostatisticians",
            "Medical Directors"
        ],
        "coverage_areas": [
            "Study design and protocols",
            "Endpoint selection and validation",
            "Statistical analysis planning",
            "Clinical trial operations",
            "Patient recruitment and retention"
        ],
        "icon": "🔬",
        "color": "#7C3AED",
        "prompt_count": 180,
        "sort_order": 2
    },
    {
        "suite_code": "GUARD",
        "suite_name": "GUARD™",
        "suite_full_name": "Global Understanding & Assessment of Risk & Drug Safety",
        "tagline": "Safeguard Patient Safety",
        "description": "Ensure patient safety through comprehensive pharmacovigilance, risk management, and safety surveillance.",
        "purpose": "Ensure patient safety through comprehensive pharmacovigilance, risk management, and safety surveillance.",
        "target_roles": [
            "Drug Safety Associates",
            "Pharmacovigilance Managers",
            "Medical Safety Officers"
        ],
        "coverage_areas": [
            "Adverse event detection and reporting",
            "Safety signal detection and evaluation",
            "Risk management planning",
            "Pharmacovigilance systems",
            "Post-market surveillance"
        ],
        "icon": "🛡️",
        "color": "#DC2626",
        "prompt_count": 150,
        "sort_order": 3
    },
    {
        "suite_code": "VALUE",
        "suite_name": "VALUE™",
        "suite_full_name": "Value Assessment & Leadership Understanding & Economic Excellence",
        "tagline": "Demonstrate Market Value",
        "description": "Demonstrate product value, navigate payer landscapes, and optimize market access strategies.",
        "purpose": "Demonstrate product value, navigate payer landscapes, and optimize market access strategies.",
        "target_roles": [
            "Market Access Directors",
            "HEOR Analysts",
            "Pricing Strategists",
            "Payer Relations Managers"
        ],
        "coverage_areas": [
            "Health economics and outcomes research",
            "Pricing and reimbursement strategies",
            "Value dossier and evidence generation",
            "Payer engagement and contracting",
            "Health technology assessment"
        ],
        "icon": "💎",
        "color": "#059669",
        "prompt_count": 170,
        "sort_order": 4
    },
    {
        "suite_code": "BRIDGE",
        "suite_name": "BRIDGE™",
        "suite_full_name": "Building Relationships & Intelligence Development & Global Engagement",
        "tagline": "Build Strategic Relationships",
        "description": "Build and maintain strategic relationships with key opinion leaders, investigators, and healthcare stakeholders.",
        "purpose": "Build and maintain strategic relationships with key opinion leaders, investigators, and healthcare stakeholders.",
        "target_roles": [
            "Medical Science Liaisons",
            "Medical Affairs Directors",
            "KOL Managers"
        ],
        "coverage_areas": [
            "KOL identification and engagement",
            "Advisory board planning and execution",
            "Investigator initiated studies",
            "Speaker programs and training",
            "Medical information and inquiry response"
        ],
        "icon": "🌉",
        "color": "#EA580C",
        "prompt_count": 140,
        "sort_order": 5
    },
    {
        "suite_code": "PROOF",
        "suite_name": "PROOF™",
        "suite_full_name": "Professional Research & Outcomes Optimization & Framework",
        "tagline": "Master Your Outcomes",
        "description": "Generate, analyze, and synthesize clinical evidence to support product value and decision-making.",
        "purpose": "Generate, analyze, and synthesize clinical evidence to support product value and decision-making.",
        "target_roles": [
            "Clinical Data Analysts",
            "Evidence Synthesis Specialists",
            "Outcomes Researchers"
        ],
        "coverage_areas": [
            "Real-world evidence generation",
            "Systematic literature reviews and meta-analyses",
            "Evidence synthesis and gap analysis",
            "Data mining and advanced analytics",
            "Patient-reported outcomes analysis"
        ],
        "icon": "📊",
        "color": "#0891B2",
        "prompt_count": 160,
        "sort_order": 6
    },
    {
        "suite_code": "CRAFT",
        "suite_name": "CRAFT™",
        "suite_full_name": "Creative Regulatory & Academic Framework & Technical Excellence",
        "tagline": "Craft Compliant Content",
        "description": "Create clear, compelling, and compliant medical and scientific documents across all formats.",
        "purpose": "Create clear, compelling, and compliant medical and scientific documents across all formats.",
        "target_roles": [
            "Medical Writers",
            "Regulatory Writers",
            "Scientific Communications Specialists"
        ],
        "coverage_areas": [
            "Clinical study reports",
            "Regulatory submission documents",
            "Manuscripts and publications",
            "Abstracts and posters",
            "Patient education materials"
        ],
        "icon": "✍️",
        "color": "#9333EA",
        "prompt_count": 150,
        "sort_order": 7
    },
    {
        "suite_code": "SCOUT",
        "suite_name": "SCOUT™",
        "suite_full_name": "Strategic Competitive & Operational Understanding & Tactical Intelligence",
        "tagline": "Scout Competitive Intelligence",
        "description": "Gather, analyze, and act on competitive and market intelligence to inform strategic decisions.",
        "purpose": "Gather, analyze, and act on competitive and market intelligence to inform strategic decisions.",
        "target_roles": [
            "Competitive Intelligence Analysts",
            "Strategic Planning Managers",
            "Business Development"
        ],
        "coverage_areas": [
            "Competitive landscape analysis",
            "Pipeline intelligence and patent monitoring",
            "Market trends and forecasting",
            "SWOT analysis and strategic positioning",
            "Deal flow and partnership opportunities"
        ],
        "icon": "🔍",
        "color": "#65A30D",
        "prompt_count": 130,
        "sort_order": 8
    },
    {
        "suite_code": "PROJECT",
        "suite_name": "PROJECT™",
        "suite_full_name": "Planning Resources Objectives Justification Execution Control Tracking",
        "tagline": "Execute with Excellence",
        "description": "Plan, execute, and control complex life sciences projects with professional project management methodologies.",
        "purpose": "Plan, execute, and control complex life sciences projects with professional project management methodologies.",
        "target_roles": [
            "Project Managers",
            "Program Directors",
            "Clinical Operations Managers"
        ],
        "coverage_areas": [
            "Project planning and initiation",
            "Resource allocation and budgeting",
            "Timeline development and critical path",
            "Risk management and mitigation",
            "Stakeholder communication and reporting"
        ],
        "icon": "📋",
        "color": "#4F46E5",
        "prompt_count": 120,
        "sort_order": 9
    },
    {
        "suite_code": "FORGE",
        "suite_name": "FORGE™",
        "suite_full_name": "Foundation Optimization Regulatory Guidelines Engineering",
        "tagline": "Forge Digital Innovation",
        "description": "Navigate the unique challenges of digital health, digital therapeutics, and software as a medical device.",
        "purpose": "Navigate the unique challenges of digital health, digital therapeutics (DTx), and software as a medical device (SaMD).",
        "target_roles": [
            "Digital Health Developers",
            "DTx Clinical Teams",
            "SaMD Regulatory Specialists"
        ],
        "coverage_areas": [
            "Digital therapeutics development",
            "Software as a Medical Device pathways",
            "Digital biomarker validation",
            "Mobile health app development",
            "Clinical validation of digital health"
        ],
        "icon": "⚡",
        "color": "#F59E0B",
        "prompt_count": 140,
        "sort_order": 10
    }
]

SUB_SUITES = {
    "RULES": [
        {
            "sub_suite_code": "SUBMIT",
            "sub_suite_name": "SUBMIT",
            "sub_suite_full_name": "Strategic Understanding & Breakthrough Methodologies In Tactical Preparation",
            "description": "Complete regulatory submission guidance from strategy to approval",
            "purpose": "Guide regulatory submissions from strategy through approval",
            "sort_order": 1
        },
        {
            "sub_suite_code": "COMPLY",
            "sub_suite_name": "COMPLY",
            "sub_suite_full_name": "Comprehensive Oversight & Management Procedures Legal & Yield",
            "description": "Quality management systems and compliance assurance",
            "purpose": "Ensure compliance with quality management systems and regulatory requirements",
            "sort_order": 2
        },
        {
            "sub_suite_code": "PATHWAY",
            "sub_suite_name": "PATHWAY",
            "sub_suite_full_name": "Procedural Approval Tactics & Healthcare-Wide Authority Yield",
            "description": "Regulatory pathway determination and approval strategies",
            "purpose": "Determine optimal regulatory pathways and approval strategies",
            "sort_order": 3
        },
        {
            "sub_suite_code": "APPROVE",
            "sub_suite_name": "APPROVE",
            "sub_suite_full_name": "Authorization Process & Regulatory Operations & Validation Execution",
            "description": "Submission review process and approval strategies",
            "purpose": "Navigate submission review and approval processes",
            "sort_order": 4
        },
        {
            "sub_suite_code": "GLOBAL",
            "sub_suite_name": "GLOBAL",
            "sub_suite_full_name": "Geographical Operations & Broad Agencies Legal Standards",
            "description": "International regulatory harmonization and multi-market strategies",
            "purpose": "Manage international regulatory requirements and harmonization",
            "sort_order": 5
        }
    ],
    "TRIALS": [
        {
            "sub_suite_code": "DESIGN",
            "sub_suite_name": "DESIGN",
            "sub_suite_full_name": "Data Endpoints & Statistical Innovation Guidelines Networks",
            "description": "Comprehensive clinical trial protocol and methodology design",
            "purpose": "Design rigorous clinical trial protocols and methodologies",
            "sort_order": 1
        },
        {
            "sub_suite_code": "PROTOCOL",
            "sub_suite_name": "PROTOCOL",
            "sub_suite_full_name": "Procedures & Requirements & Objectives & Timelines & Operational Compliance Logistics",
            "description": "Detailed protocol development and regulatory compliance",
            "purpose": "Develop compliant and comprehensive clinical trial protocols",
            "sort_order": 2
        },
        {
            "sub_suite_code": "ENDPOINT",
            "sub_suite_name": "ENDPOINT",
            "sub_suite_full_name": "Evidence-Based Needs & Data Points & Operational Intelligence Network Targets",
            "description": "Clinical endpoint selection, validation, and measurement strategies",
            "purpose": "Select and validate appropriate clinical endpoints",
            "sort_order": 3
        },
        {
            "sub_suite_code": "ENROLL",
            "sub_suite_name": "ENROLL",
            "sub_suite_full_name": "Efficient Network Recruitment & Operations Leadership Logistics",
            "description": "Patient recruitment strategies and enrollment optimization",
            "purpose": "Optimize patient recruitment and enrollment processes",
            "sort_order": 4
        },
        {
            "sub_suite_code": "MONITOR",
            "sub_suite_name": "MONITOR",
            "sub_suite_full_name": "Medical Oversight & New Intelligence Tracking Operations Review",
            "description": "Clinical trial monitoring, safety surveillance, and data integrity",
            "purpose": "Monitor trials, ensure safety, and maintain data integrity",
            "sort_order": 5
        },
        {
            "sub_suite_code": "ANALYZE",
            "sub_suite_name": "ANALYZE",
            "sub_suite_full_name": "Assessment of New Analyses & Longitudinal & Year-over-year Zones & Evidence",
            "description": "Statistical analysis, data interpretation, and evidence synthesis",
            "purpose": "Analyze clinical data and synthesize evidence",
            "sort_order": 6
        }
    ],
    "GUARD": [
        {
            "sub_suite_code": "DETECT",
            "sub_suite_name": "DETECT",
            "sub_suite_full_name": "Drug Event Tracking & Emergency Case Triage",
            "description": "Adverse event detection, case processing, and safety signal identification",
            "purpose": "Detect and process adverse events and safety signals",
            "sort_order": 1
        },
        {
            "sub_suite_code": "SIGNAL",
            "sub_suite_name": "SIGNAL",
            "sub_suite_full_name": "Safety Intelligence & Global Network Adverse Event Logistics",
            "description": "Pharmacovigilance signal detection, evaluation, and management",
            "purpose": "Detect, evaluate, and manage pharmacovigilance signals",
            "sort_order": 2
        },
        {
            "sub_suite_code": "REPORT",
            "sub_suite_name": "REPORT",
            "sub_suite_full_name": "Risk Evaluation & Post-Market Oversight & Regulatory Transparency",
            "description": "Safety report generation (PSUR, PBRER, ICSRs)",
            "purpose": "Generate and submit safety reports to regulatory authorities",
            "sort_order": 3
        },
        {
            "sub_suite_code": "MANAGE",
            "sub_suite_name": "MANAGE",
            "sub_suite_full_name": "Medical Affairs & Nationwide Adverse Event Governance & Education",
            "description": "Risk management plan development and implementation",
            "purpose": "Develop and implement risk management plans",
            "sort_order": 4
        },
        {
            "sub_suite_code": "SURVEIL",
            "sub_suite_name": "SURVEIL",
            "sub_suite_full_name": "Safety Understanding & Real-world Vigilance & Evidence Intelligence Logistics",
            "description": "Post-market surveillance and real-world safety monitoring",
            "purpose": "Conduct post-market surveillance and monitor real-world safety",
            "sort_order": 5
        }
    ],
    "VALUE": [
        {
            "sub_suite_code": "PRICE",
            "sub_suite_name": "PRICE",
            "sub_suite_full_name": "Payer Reimbursement Intelligence & Cost-Effectiveness Excellence",
            "description": "Pricing strategy, value-based pricing, and market positioning",
            "purpose": "Develop pricing strategies and demonstrate value-based pricing",
            "sort_order": 1
        },
        {
            "sub_suite_code": "HEOR",
            "sub_suite_name": "HEOR",
            "sub_suite_full_name": "Health Economics & Outcomes Research",
            "description": "Cost-effectiveness analysis, budget impact modeling, QALYs/ICERs",
            "purpose": "Conduct health economics and outcomes research",
            "sort_order": 2
        },
        {
            "sub_suite_code": "DOSSIER",
            "sub_suite_name": "DOSSIER",
            "sub_suite_full_name": "Documentation of Strategic & Scientific Intelligence & Economic Research",
            "description": "Value dossier development for payer and HTA submissions",
            "purpose": "Develop comprehensive value dossiers for market access",
            "sort_order": 3
        },
        {
            "sub_suite_code": "ACCESS",
            "sub_suite_name": "ACCESS",
            "sub_suite_full_name": "Affordability & Coverage & Contracting & Economic Strategic Solutions",
            "description": "Market access strategy, payer negotiations, formulary positioning",
            "purpose": "Optimize market access and payer negotiations",
            "sort_order": 4
        },
        {
            "sub_suite_code": "EVIDENCE",
            "sub_suite_name": "EVIDENCE",
            "sub_suite_full_name": "Economic Validation & Insights & Data-Driven Excellence & Network Creation",
            "description": "Real-world evidence generation for value demonstration",
            "purpose": "Generate real-world evidence for value demonstration",
            "sort_order": 5
        }
    ],
    "BRIDGE": [
        {
            "sub_suite_code": "ENGAGE",
            "sub_suite_name": "ENGAGE",
            "sub_suite_full_name": "Expert Networks & Guidance & Advocacy & Global Excellence",
            "description": "KOL engagement strategies and relationship building",
            "purpose": "Engage key opinion leaders and build strategic relationships",
            "sort_order": 1
        },
        {
            "sub_suite_code": "ADVISORY",
            "sub_suite_name": "ADVISORY",
            "sub_suite_full_name": "Assessment & Development of Visionary Insights & Strategic Operations & Research Yield",
            "description": "Advisory board planning, execution, and insights capture",
            "purpose": "Plan and execute advisory boards for strategic insights",
            "sort_order": 2
        },
        {
            "sub_suite_code": "INFORM",
            "sub_suite_name": "INFORM",
            "sub_suite_full_name": "Intelligence & New Medical Facts & Operations & Research Management",
            "description": "Medical information services and inquiry response",
            "purpose": "Provide medical information and respond to inquiries",
            "sort_order": 3
        },
        {
            "sub_suite_code": "SPEAKER",
            "sub_suite_name": "SPEAKER",
            "sub_suite_full_name": "Strategic Presentations & Education & Academic Knowledge & Expert Resources",
            "description": "Speaker program development and scientific presentation training",
            "purpose": "Develop speaker programs and train presenters",
            "sort_order": 4
        },
        {
            "sub_suite_code": "INFLUENCE",
            "sub_suite_name": "INFLUENCE",
            "sub_suite_full_name": "Intelligence & New Findings & Leadership & Understanding & Evidence-Based Network Creation & Excellence",
            "description": "Thought leader development and scientific influence strategies",
            "purpose": "Develop thought leaders and scientific influence",
            "sort_order": 5
        }
    ],
    "PROOF": [
        {
            "sub_suite_code": "ANALYZE",
            "sub_suite_name": "ANALYZE",
            "sub_suite_full_name": "Assessment of New Analyses & Longitudinal & Year-over-year Zones & Evidence",
            "description": "Data analysis, statistical interpretation, and evidence evaluation",
            "purpose": "Analyze data and evaluate evidence",
            "sort_order": 1
        },
        {
            "sub_suite_code": "SYNTHESIZE",
            "sub_suite_name": "SYNTHESIZE",
            "sub_suite_full_name": "Systematic Yield & New Trends & Healthcare Evaluation & Strategic Intelligence & Zonal Evidence",
            "description": "Evidence synthesis, meta-analysis, and systematic reviews",
            "purpose": "Synthesize evidence through systematic reviews and meta-analyses",
            "sort_order": 2
        },
        {
            "sub_suite_code": "MEASURE",
            "sub_suite_name": "MEASURE",
            "sub_suite_full_name": "Medical Evidence & Assessment & Strategic Understanding & Research Excellence",
            "description": "Outcomes measurement, PRO development, and clinical endpoints",
            "purpose": "Measure outcomes and develop patient-reported outcome instruments",
            "sort_order": 3
        },
        {
            "sub_suite_code": "VALIDATE",
            "sub_suite_name": "VALIDATE",
            "sub_suite_full_name": "Value Assessment & Leadership Intelligence & Data Assurance & Technical Excellence",
            "description": "Data validation, quality assurance, and evidence standards",
            "purpose": "Validate data quality and ensure evidence standards",
            "sort_order": 4
        },
        {
            "sub_suite_code": "COMPARE",
            "sub_suite_name": "COMPARE",
            "sub_suite_full_name": "Competitive Operations & Market Positioning & Assessment & Research Excellence",
            "description": "Comparative effectiveness research and competitive intelligence",
            "purpose": "Conduct comparative effectiveness research",
            "sort_order": 5
        }
    ],
    "CRAFT": [
        {
            "sub_suite_code": "WRITE",
            "sub_suite_name": "WRITE",
            "sub_suite_full_name": "Written Research & Intelligence & Technical Excellence",
            "description": "Medical writing across clinical, regulatory, and scientific domains",
            "purpose": "Produce high-quality medical and scientific writing",
            "sort_order": 1
        },
        {
            "sub_suite_code": "PUBLISH",
            "sub_suite_name": "PUBLISH",
            "sub_suite_full_name": "Professional Understanding & Broad Literature Intelligence & Scientific Healthcare",
            "description": "Manuscript preparation, journal submission, and publication strategy",
            "purpose": "Prepare manuscripts and manage publication strategy",
            "sort_order": 2
        },
        {
            "sub_suite_code": "COMMUNICATE",
            "sub_suite_name": "COMMUNICATE",
            "sub_suite_full_name": "Clarity & Operations & Medical Messaging & Understanding & Network Intelligence & Communication & Adaptive Technical Excellence",
            "description": "Scientific communication strategies and stakeholder messaging",
            "purpose": "Communicate scientific information effectively",
            "sort_order": 3
        },
        {
            "sub_suite_code": "DOCUMENT",
            "sub_suite_name": "DOCUMENT",
            "sub_suite_full_name": "Development of Comprehensive & Understanding & Medical & Evidence-Based & New Technical Standards",
            "description": "Document creation, formatting, and compliance with regulatory standards",
            "purpose": "Create compliant regulatory and technical documents",
            "sort_order": 4
        },
        {
            "sub_suite_code": "TRANSLATE",
            "sub_suite_name": "TRANSLATE",
            "sub_suite_full_name": "Technical Research & Academic & New Scientific & Literature & Adaptive Translation Excellence",
            "description": "Plain language translation, patient materials, and health literacy",
            "purpose": "Translate complex medical information for diverse audiences",
            "sort_order": 5
        }
    ],
    "SCOUT": [
        {
            "sub_suite_code": "MONITOR",
            "sub_suite_name": "MONITOR",
            "sub_suite_full_name": "Market Oversight & New Intelligence & Tracking & Operations & Research",
            "description": "Competitive monitoring, market surveillance, and trend tracking",
            "purpose": "Monitor competitive markets and track trends",
            "sort_order": 1
        },
        {
            "sub_suite_code": "ASSESS",
            "sub_suite_name": "ASSESS",
            "sub_suite_full_name": "Analytics & Strategic & Scientific Evaluation & Strategic Solutions",
            "description": "Competitive assessment, SWOT analysis, and strategic evaluation",
            "purpose": "Assess competitive landscape and strategic position",
            "sort_order": 2
        },
        {
            "sub_suite_code": "FORECAST",
            "sub_suite_name": "FORECAST",
            "sub_suite_full_name": "Future Operations & Research & Economic & Competitive & Analysis & Strategic Trends",
            "description": "Market forecasting, pipeline analysis, and predictive modeling",
            "purpose": "Forecast market trends and pipeline developments",
            "sort_order": 3
        },
        {
            "sub_suite_code": "POSITION",
            "sub_suite_name": "POSITION",
            "sub_suite_full_name": "Positioning & Operational Strategic Intelligence & Operations & Network",
            "description": "Market positioning, differentiation strategies, and competitive advantage",
            "purpose": "Position products and develop competitive advantages",
            "sort_order": 4
        },
        {
            "sub_suite_code": "LANDSCAPE",
            "sub_suite_name": "LANDSCAPE",
            "sub_suite_full_name": "Leadership & Analytical & New Data & Strategic & Competitive & Assessment & Pipeline Excellence",
            "description": "Competitive landscape mapping, pipeline intelligence, and market dynamics",
            "purpose": "Map competitive landscapes and analyze pipelines",
            "sort_order": 5
        }
    ],
    "PROJECT": [
        {
            "sub_suite_code": "PLAN",
            "sub_suite_name": "PLAN",
            "sub_suite_full_name": "Project Logistics & Approval & Network",
            "description": "Project planning, charter development, and stakeholder alignment",
            "purpose": "Plan projects and align stakeholders",
            "sort_order": 1
        },
        {
            "sub_suite_code": "EXECUTE",
            "sub_suite_name": "EXECUTE",
            "sub_suite_full_name": "Execution & X-Functional Coordination & Effective & Control & Understanding & Technical Excellence",
            "description": "Project execution, team coordination, and delivery management",
            "purpose": "Execute projects and coordinate cross-functional teams",
            "sort_order": 2
        },
        {
            "sub_suite_code": "CONTROL",
            "sub_suite_name": "CONTROL",
            "sub_suite_full_name": "Coordination & Operations & New Tracking & Resources & Oversight & Logistics",
            "description": "Project monitoring, control, and performance tracking",
            "purpose": "Monitor and control project performance",
            "sort_order": 3
        },
        {
            "sub_suite_code": "DELIVER",
            "sub_suite_name": "DELIVER",
            "sub_suite_full_name": "Development & Execution & Leadership & Insights & Validation & Evidence & Research",
            "description": "Project delivery, quality assurance, and outcomes validation",
            "purpose": "Deliver projects with quality assurance",
            "sort_order": 4
        },
        {
            "sub_suite_code": "CLOSE",
            "sub_suite_name": "CLOSE",
            "sub_suite_full_name": "Completion & Lessons & Operations & Strategic Excellence",
            "description": "Project closeout, documentation, and continuous improvement",
            "purpose": "Close projects and capture lessons learned",
            "sort_order": 5
        }
    ],
    "FORGE": [
        {
            "sub_suite_code": "DEVELOP",
            "sub_suite_name": "DEVELOP",
            "sub_suite_full_name": "Digital Excellence & Validation & Evidence & Lifecycle & Optimization & Platform",
            "description": "Digital health product development and lifecycle management",
            "purpose": "Develop digital health products and manage lifecycles",
            "sort_order": 1
        },
        {
            "sub_suite_code": "VALIDATE",
            "sub_suite_name": "VALIDATE",
            "sub_suite_full_name": "Validation & Assessment & Longitudinal Intelligence & Data & Assurance & Technical Excellence",
            "description": "Clinical validation, V3 framework, and digital biomarker validation",
            "purpose": "Validate digital health interventions clinically",
            "sort_order": 2
        },
        {
            "sub_suite_code": "REGULATE",
            "sub_suite_name": "REGULATE",
            "sub_suite_full_name": "Regulatory Excellence & Guidelines & Understanding & Legal & Assurance & Technical Excellence",
            "description": "FDA/EMA digital health pathways, SaMD classification, and compliance",
            "purpose": "Navigate digital health regulatory pathways",
            "sort_order": 3
        },
        {
            "sub_suite_code": "INNOVATE",
            "sub_suite_name": "INNOVATE",
            "sub_suite_full_name": "Intelligence & New Networks & Operations & Validation & Assurance & Technical Excellence",
            "description": "Digital innovation, AI/ML in healthcare, and emerging technologies",
            "purpose": "Innovate with emerging digital health technologies",
            "sort_order": 4
        },
        {
            "sub_suite_code": "IMPLEMENT",
            "sub_suite_name": "IMPLEMENT",
            "sub_suite_full_name": "Implementation & Multiplatform & Pilot & Lifecycle & Evidence & Medical & Excellence & New Technical Standards",
            "description": "Digital health implementation, integration, and user adoption",
            "purpose": "Implement and integrate digital health solutions",
            "sort_order": 5
        }
    ]
}

# ============================================================================
# POPULATION FUNCTIONS
# ============================================================================

def populate_prompt_library():
    """Populate the PROMPTS™ Framework suites and sub-suites"""

    print("=" * 80)
    print("POPULATING PROMPTS™ FRAMEWORK - SUITES AND SUB-SUITES")
    print("=" * 80)

    # Initialize Supabase client
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )

    # Step 1: Insert Suites
    print("\n[1/2] Inserting Prompt Suites...")
    suite_ids = {}

    for suite_data in PROMPTS_SUITES:
        try:
            # Check if suite already exists
            existing = supabase.table('prompt_suites').select('id').eq('suite_code', suite_data['suite_code']).execute()

            if existing.data and len(existing.data) > 0:
                # Update existing
                suite_id = existing.data[0]['id']
                supabase.table('prompt_suites').update(suite_data).eq('id', suite_id).execute()
                print(f"  ✅ Updated: {suite_data['suite_name']}")
            else:
                # Insert new
                result = supabase.table('prompt_suites').insert(suite_data).execute()
                suite_id = result.data[0]['id']
                print(f"  ✅ Created: {suite_data['suite_name']}")

            suite_ids[suite_data['suite_code']] = suite_id

        except Exception as e:
            print(f"  ❌ Error with {suite_data['suite_name']}: {str(e)}")

    # Step 2: Insert Sub-Suites
    print("\n[2/2] Inserting Prompt Sub-Suites...")
    subsuite_count = 0

    for suite_code, sub_suites in SUB_SUITES.items():
        suite_id = suite_ids.get(suite_code)

        if not suite_id:
            print(f"  ⚠️  Skipping {suite_code} - suite not found")
            continue

        for sub_suite_data in sub_suites:
            try:
                # Add suite_id to sub_suite data
                sub_suite_data['suite_id'] = suite_id

                # Check if sub-suite already exists
                existing = supabase.table('prompt_sub_suites').select('id').eq('suite_id', suite_id).eq('sub_suite_code', sub_suite_data['sub_suite_code']).execute()

                if existing.data and len(existing.data) > 0:
                    # Update existing
                    sub_suite_id = existing.data[0]['id']
                    supabase.table('prompt_sub_suites').update(sub_suite_data).eq('id', sub_suite_id).execute()
                else:
                    # Insert new
                    supabase.table('prompt_sub_suites').insert(sub_suite_data).execute()
                    subsuite_count += 1

            except Exception as e:
                print(f"  ❌ Error with {suite_code}/{sub_suite_data['sub_suite_code']}: {str(e)}")

    print(f"\n  ✅ Processed {subsuite_count} sub-suites across {len(suite_ids)} suites")

    # Summary
    print("\n" + "=" * 80)
    print("✅ PROMPTS™ FRAMEWORK POPULATION COMPLETE")
    print("=" * 80)
    print(f"\n  Suites Created: {len(suite_ids)}")
    print(f"  Sub-Suites Created: {subsuite_count}")
    print("\n  Next Steps:")
    print("  1. Run the database update script to load enhanced agent prompts")
    print("  2. Create additional prompts for each sub-suite")
    print("\n" + "=" * 80)

if __name__ == '__main__':
    populate_prompt_library()
