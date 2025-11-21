#!/usr/bin/env python3
"""
Data Capture Template System for VITAL Platform
===============================================
Provides standardized templates for capturing persona data across
all business functions with automatic validation and normalization.

Author: VITAL Platform Orchestrator
Date: 2025-11-17
Version: 1.0.0
"""

import json
import csv
import yaml
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
import os

class BusinessFunction(Enum):
    """Standard business functions in VITAL platform"""
    MEDICAL_AFFAIRS = "medical-affairs"
    SALES = "sales"
    MARKETING = "marketing"
    PRODUCT = "product"
    ENGINEERING = "engineering"
    CUSTOMER_SUCCESS = "customer-success"
    OPERATIONS = "operations"
    FINANCE = "finance"
    HUMAN_RESOURCES = "human-resources"
    LEGAL = "legal"
    RESEARCH_DEVELOPMENT = "research-development"
    EXECUTIVE = "executive"

class SeniorityLevel(Enum):
    """Standard seniority levels"""
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    EXECUTIVE = "executive"

class Priority(Enum):
    """Standard priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class CoreProfile:
    """Core persona profile - required for all personas"""
    name: str
    slug: str
    title: str
    tagline: str = ""
    age: Optional[int] = None
    location: Optional[str] = None
    education_level: Optional[str] = None

@dataclass
class ProfessionalContext:
    """Professional context - required for all personas"""
    seniority_level: str
    years_of_experience: int
    years_in_current_role: Optional[int] = None
    years_in_function: Optional[int] = None
    years_in_industry: Optional[int] = None
    typical_organization_size: Optional[str] = None
    reporting_to: Optional[str] = None
    team_size: Optional[int] = None
    budget_authority: Optional[int] = None
    decision_making_style: Optional[str] = None

@dataclass
class PainPoint:
    """Structured pain point"""
    pain_point: str
    severity: str  # low, medium, high, critical
    frequency: str  # daily, weekly, monthly, quarterly, rarely
    impact_description: Optional[str] = None
    root_cause: Optional[str] = None

@dataclass
class Goal:
    """Structured goal"""
    goal: str
    priority: str  # low, medium, high, critical
    timeframe: str  # immediate, 3_months, 6_months, 12_months, ongoing
    success_criteria: Optional[str] = None
    progress_status: str = "not_started"  # not_started, in_progress, blocked, completed

@dataclass
class Challenge:
    """Structured challenge"""
    challenge: str
    impact_level: str  # low, medium, high, critical
    category: str  # technical, organizational, resource, external, other
    mitigation_strategy: Optional[str] = None
    is_addressed: bool = False

@dataclass
class Responsibility:
    """Structured responsibility"""
    responsibility: str
    time_allocation_percent: Optional[int] = None
    priority_level: str = "medium"  # low, medium, high, critical
    sequence_order: int = 1

@dataclass
class Tool:
    """Structured tool preference"""
    tool_name: str
    tool_category: str  # software, platform, framework, service, hardware, other
    proficiency_level: str = "intermediate"  # beginner, intermediate, advanced, expert
    usage_frequency: str = "weekly"  # daily, weekly, monthly, rarely
    is_preferred: bool = True

@dataclass
class WeekInLifeDay:
    """A day in the week in life"""
    day_of_week: str  # Monday, Tuesday, etc.
    typical_start_time: Optional[str] = None
    typical_end_time: Optional[str] = None
    meeting_load: str = "moderate"  # heavy, moderate, light
    focus_time_hours: int = 2
    typical_activities: List[str] = field(default_factory=list)
    key_priorities: List[str] = field(default_factory=list)
    collaboration_needs: List[str] = field(default_factory=list)

@dataclass
class InternalStakeholder:
    """Internal stakeholder relationship"""
    stakeholder_name: str
    stakeholder_role: str
    relationship_type: str  # reports_to, peer, direct_report, cross_functional
    interaction_frequency: str  # daily, weekly, monthly, quarterly
    collaboration_importance: str  # critical, high, medium, low
    typical_interactions: List[str] = field(default_factory=list)

@dataclass
class PersonaTemplate:
    """Complete persona template with all v5.0 extensions"""
    # Core identity
    core_profile: CoreProfile
    professional_context: ProfessionalContext

    # Business function and organization
    business_function: str
    department: str
    role_slug: str

    # Structured arrays (normalized)
    pain_points: List[PainPoint] = field(default_factory=list)
    goals: List[Goal] = field(default_factory=list)
    challenges: List[Challenge] = field(default_factory=list)
    responsibilities: List[Responsibility] = field(default_factory=list)
    preferred_tools: List[Tool] = field(default_factory=list)

    # v5.0 Extensions
    week_in_life: List[WeekInLifeDay] = field(default_factory=list)
    internal_stakeholders: List[InternalStakeholder] = field(default_factory=list)

    # Simple lists (TEXT[] in database)
    tags: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)

    # Additional metadata
    validation_status: str = "draft"  # draft, review, approved
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


class DataCaptureTemplateGenerator:
    """Generates and manages data capture templates for personas"""

    def __init__(self, business_function: BusinessFunction):
        """Initialize with specific business function"""
        self.business_function = business_function
        self.templates_dir = "/Users/hichamnaim/Downloads/Cursor/VITAL path/data_capture_templates"
        os.makedirs(self.templates_dir, exist_ok=True)

    def generate_blank_template(self) -> PersonaTemplate:
        """Generate a blank template with example data"""
        template = PersonaTemplate(
            core_profile=CoreProfile(
                name="[Full Name]",
                slug="[lowercase-hyphenated]",
                title="[Job Title]",
                tagline="[One-line description]",
                age=35,
                location="[City, State/Country]",
                education_level="[Bachelor's/Master's/PhD]"
            ),
            professional_context=ProfessionalContext(
                seniority_level="senior",
                years_of_experience=10,
                years_in_current_role=3,
                years_in_function=7,
                years_in_industry=10,
                typical_organization_size="large",
                reporting_to="[Title of supervisor]",
                team_size=25,
                budget_authority=1000000,
                decision_making_style="analytical"
            ),
            business_function=self.business_function.value,
            department=self.business_function.value,
            role_slug=f"{self.business_function.value}-leader",
            pain_points=[
                PainPoint(
                    pain_point="[Describe a key pain point]",
                    severity="high",
                    frequency="daily",
                    impact_description="[How this affects their work]",
                    root_cause="[Why this problem exists]"
                )
            ],
            goals=[
                Goal(
                    goal="[Describe a key goal]",
                    priority="high",
                    timeframe="6_months",
                    success_criteria="[How to measure success]",
                    progress_status="not_started"
                )
            ],
            challenges=[
                Challenge(
                    challenge="[Describe a key challenge]",
                    impact_level="high",
                    category="organizational",
                    mitigation_strategy="[How they address this]",
                    is_addressed=False
                )
            ],
            responsibilities=[
                Responsibility(
                    responsibility="[Key responsibility]",
                    time_allocation_percent=30,
                    priority_level="high",
                    sequence_order=1
                )
            ],
            preferred_tools=[
                Tool(
                    tool_name="[Tool/Platform name]",
                    tool_category="software",
                    proficiency_level="advanced",
                    usage_frequency="daily",
                    is_preferred=True
                )
            ],
            week_in_life=[
                WeekInLifeDay(
                    day_of_week="Monday",
                    typical_start_time="08:00",
                    typical_end_time="18:00",
                    meeting_load="heavy",
                    focus_time_hours=2,
                    typical_activities=["Team standup", "Strategy review"],
                    key_priorities=["Team alignment", "Planning"],
                    collaboration_needs=["Cross-functional sync"]
                )
            ],
            internal_stakeholders=[
                InternalStakeholder(
                    stakeholder_name="[Name or Role]",
                    stakeholder_role="[Their title]",
                    relationship_type="peer",
                    interaction_frequency="weekly",
                    collaboration_importance="high",
                    typical_interactions=["Status updates", "Joint planning"]
                )
            ],
            tags=["tag1", "tag2"],
            skills=["skill1", "skill2"]
        )

        return template

    def save_template_json(self, template: PersonaTemplate, filename: str = None):
        """Save template as JSON"""
        if not filename:
            filename = f"{self.business_function.value}_persona_template.json"

        filepath = os.path.join(self.templates_dir, filename)

        # Convert to dict with proper serialization
        template_dict = self._serialize_template(template)

        with open(filepath, 'w') as f:
            json.dump(template_dict, f, indent=2, default=str)

        print(f"✅ Template saved to: {filepath}")
        return filepath

    def save_template_yaml(self, template: PersonaTemplate, filename: str = None):
        """Save template as YAML for easier human editing"""
        if not filename:
            filename = f"{self.business_function.value}_persona_template.yaml"

        filepath = os.path.join(self.templates_dir, filename)

        template_dict = self._serialize_template(template)

        with open(filepath, 'w') as f:
            yaml.dump(template_dict, f, default_flow_style=False, sort_keys=False)

        print(f"✅ Template saved to: {filepath}")
        return filepath

    def save_template_csv(self, templates: List[PersonaTemplate], filename: str = None):
        """Save multiple templates as CSV"""
        if not filename:
            filename = f"{self.business_function.value}_personas.csv"

        filepath = os.path.join(self.templates_dir, filename)

        # Flatten templates for CSV
        rows = []
        for template in templates:
            row = self._flatten_template_for_csv(template)
            rows.append(row)

        if rows:
            with open(filepath, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows(rows)

            print(f"✅ CSV saved to: {filepath}")

        return filepath

    def _serialize_template(self, template: PersonaTemplate) -> Dict[str, Any]:
        """Serialize template to dictionary"""
        result = {
            'core_profile': asdict(template.core_profile),
            'professional_context': asdict(template.professional_context),
            'business_function': template.business_function,
            'department': template.department,
            'role_slug': template.role_slug,
            'pain_points': [asdict(pp) for pp in template.pain_points],
            'goals': [asdict(g) for g in template.goals],
            'challenges': [asdict(c) for c in template.challenges],
            'responsibilities': [asdict(r) for r in template.responsibilities],
            'preferred_tools': [asdict(t) for t in template.preferred_tools],
            'week_in_life': [asdict(w) for w in template.week_in_life],
            'internal_stakeholders': [asdict(s) for s in template.internal_stakeholders],
            'tags': template.tags,
            'skills': template.skills,
            'validation_status': template.validation_status,
            'created_at': template.created_at.isoformat(),
            'updated_at': template.updated_at.isoformat()
        }
        return result

    def _flatten_template_for_csv(self, template: PersonaTemplate) -> Dict[str, Any]:
        """Flatten template for CSV format"""
        row = {
            # Core profile
            'name': template.core_profile.name,
            'slug': template.core_profile.slug,
            'title': template.core_profile.title,
            'tagline': template.core_profile.tagline,
            'age': template.core_profile.age,
            'location': template.core_profile.location,
            'education_level': template.core_profile.education_level,

            # Professional context
            'seniority_level': template.professional_context.seniority_level,
            'years_of_experience': template.professional_context.years_of_experience,
            'team_size': template.professional_context.team_size,
            'budget_authority': template.professional_context.budget_authority,

            # Business function
            'business_function': template.business_function,
            'department': template.department,
            'role_slug': template.role_slug,

            # Flatten arrays to JSON strings for CSV
            'pain_points': json.dumps([asdict(pp) for pp in template.pain_points]),
            'goals': json.dumps([asdict(g) for g in template.goals]),
            'challenges': json.dumps([asdict(c) for c in template.challenges]),

            # Simple lists as comma-separated
            'tags': ','.join(template.tags),
            'skills': ','.join(template.skills),

            'validation_status': template.validation_status
        }
        return row

    def load_template_json(self, filepath: str) -> PersonaTemplate:
        """Load template from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)

        return self._deserialize_template(data)

    def load_template_yaml(self, filepath: str) -> PersonaTemplate:
        """Load template from YAML file"""
        with open(filepath, 'r') as f:
            data = yaml.safe_load(f)

        return self._deserialize_template(data)

    def _deserialize_template(self, data: Dict[str, Any]) -> PersonaTemplate:
        """Deserialize dictionary to PersonaTemplate"""
        template = PersonaTemplate(
            core_profile=CoreProfile(**data['core_profile']),
            professional_context=ProfessionalContext(**data['professional_context']),
            business_function=data['business_function'],
            department=data['department'],
            role_slug=data['role_slug'],
            pain_points=[PainPoint(**pp) for pp in data.get('pain_points', [])],
            goals=[Goal(**g) for g in data.get('goals', [])],
            challenges=[Challenge(**c) for c in data.get('challenges', [])],
            responsibilities=[Responsibility(**r) for r in data.get('responsibilities', [])],
            preferred_tools=[Tool(**t) for t in data.get('preferred_tools', [])],
            week_in_life=[WeekInLifeDay(**w) for w in data.get('week_in_life', [])],
            internal_stakeholders=[InternalStakeholder(**s) for s in data.get('internal_stakeholders', [])],
            tags=data.get('tags', []),
            skills=data.get('skills', []),
            validation_status=data.get('validation_status', 'draft')
        )

        return template

    def validate_template(self, template: PersonaTemplate) -> Dict[str, List[str]]:
        """Validate a template for completeness and correctness"""
        errors = []
        warnings = []

        # Required fields
        if not template.core_profile.name or template.core_profile.name.startswith('['):
            errors.append("Name is required and must not be a placeholder")

        if not template.core_profile.slug or template.core_profile.slug.startswith('['):
            errors.append("Slug is required and must not be a placeholder")

        # Validate enums
        valid_seniority = ['junior', 'mid', 'senior', 'executive']
        if template.professional_context.seniority_level not in valid_seniority:
            errors.append(f"Seniority level must be one of: {valid_seniority}")

        # Check for at least minimal data
        if not template.pain_points:
            warnings.append("No pain points defined")

        if not template.goals:
            warnings.append("No goals defined")

        # Validate pain points
        for i, pp in enumerate(template.pain_points):
            if pp.severity not in ['low', 'medium', 'high', 'critical']:
                errors.append(f"Pain point {i+1}: Invalid severity '{pp.severity}'")

        # Validate goals
        for i, goal in enumerate(template.goals):
            if goal.priority not in ['low', 'medium', 'high', 'critical']:
                errors.append(f"Goal {i+1}: Invalid priority '{goal.priority}'")

        return {
            'errors': errors,
            'warnings': warnings,
            'is_valid': len(errors) == 0
        }

    def generate_business_function_templates(self):
        """Generate template files for this business function"""
        # Generate blank template
        template = self.generate_blank_template()

        # Save in multiple formats
        json_file = self.save_template_json(template)
        yaml_file = self.save_template_yaml(template)

        # Create a README
        readme_path = os.path.join(self.templates_dir, f"{self.business_function.value}_README.md")
        readme_content = f"""# {self.business_function.value.title()} Persona Templates

## Overview
This directory contains templates for creating {self.business_function.value} personas.

## Files
- `{self.business_function.value}_persona_template.json` - JSON template (for programmatic use)
- `{self.business_function.value}_persona_template.yaml` - YAML template (for human editing)

## How to Use

### 1. Fill Out Template
Edit either the JSON or YAML file and replace placeholder values with actual data.

### 2. Validate
Run validation to ensure all required fields are complete:
```python
from data_capture_templates import DataCaptureTemplateGenerator

generator = DataCaptureTemplateGenerator(BusinessFunction.{self.business_function.name})
template = generator.load_template_json('your_filled_template.json')
validation = generator.validate_template(template)
```

### 3. Transform to SQL
Use the transformation pipeline to convert to SQL for database insertion.

## Field Descriptions

### Core Profile
- **name**: Full name of the persona
- **slug**: URL-friendly identifier (lowercase, hyphens)
- **title**: Job title
- **tagline**: One-line description

### Professional Context
- **seniority_level**: junior, mid, senior, or executive
- **years_of_experience**: Total years in profession
- **team_size**: Number of direct/indirect reports
- **budget_authority**: Budget control in USD

### Pain Points
- **severity**: low, medium, high, critical
- **frequency**: daily, weekly, monthly, quarterly, rarely

### Goals
- **priority**: low, medium, high, critical
- **timeframe**: immediate, 3_months, 6_months, 12_months, ongoing

## Validation Rules
- All enum fields must use valid values
- Required fields must not be placeholders
- At least one pain point and goal should be defined
"""

        with open(readme_path, 'w') as f:
            f.write(readme_content)

        print(f"\n✅ Templates generated for {self.business_function.value}")
        print(f"📁 Location: {self.templates_dir}")
        print(f"📄 Files created:")
        print(f"  • {os.path.basename(json_file)}")
        print(f"  • {os.path.basename(yaml_file)}")
        print(f"  • {os.path.basename(readme_path)}")


def generate_all_business_function_templates():
    """Generate templates for all business functions"""
    print("🚀 Generating templates for all business functions...")

    for function in BusinessFunction:
        print(f"\n📋 Generating for {function.value}...")
        generator = DataCaptureTemplateGenerator(function)
        generator.generate_business_function_templates()

    print("\n✅ All templates generated successfully!")


def main():
    """Main execution"""
    # Generate templates for all business functions
    generate_all_business_function_templates()

    # Example: Create a specific persona
    print("\n" + "="*60)
    print("EXAMPLE: Creating a Sales persona")
    print("="*60)

    generator = DataCaptureTemplateGenerator(BusinessFunction.SALES)

    # Create a sales persona
    sales_persona = PersonaTemplate(
        core_profile=CoreProfile(
            name="Michael Thompson",
            slug="michael-thompson-enterprise-sales",
            title="Enterprise Sales Director",
            tagline="Driving enterprise healthcare transformation through strategic partnerships",
            age=42,
            location="Chicago, IL",
            education_level="MBA"
        ),
        professional_context=ProfessionalContext(
            seniority_level="senior",
            years_of_experience=18,
            years_in_current_role=3,
            years_in_function=12,
            years_in_industry=18,
            typical_organization_size="enterprise",
            reporting_to="VP of Sales",
            team_size=15,
            budget_authority=5000000,
            decision_making_style="relationship-driven"
        ),
        business_function="sales",
        department="sales",
        role_slug="enterprise-sales-director",
        pain_points=[
            PainPoint(
                pain_point="Long sales cycles with healthcare enterprises",
                severity="high",
                frequency="daily",
                impact_description="Delays revenue recognition and increases CAC",
                root_cause="Complex stakeholder landscape and regulatory requirements"
            ),
            PainPoint(
                pain_point="Difficulty demonstrating ROI to clinical stakeholders",
                severity="high",
                frequency="weekly",
                impact_description="Stalls deals at critical decision points",
                root_cause="Gap between business and clinical value propositions"
            )
        ],
        goals=[
            Goal(
                goal="Increase enterprise deal velocity by 30%",
                priority="critical",
                timeframe="6_months",
                success_criteria="Average deal cycle reduced from 9 to 6 months",
                progress_status="in_progress"
            ),
            Goal(
                goal="Build strategic partnerships with top 5 health systems",
                priority="high",
                timeframe="12_months",
                success_criteria="Signed partnerships generating $10M+ ARR each",
                progress_status="not_started"
            )
        ],
        tags=["enterprise-sales", "healthcare", "strategic-accounts"],
        skills=["negotiation", "relationship-building", "healthcare-compliance", "solution-selling"]
    )

    # Validate
    validation = generator.validate_template(sales_persona)
    print(f"\n✅ Validation: {'PASSED' if validation['is_valid'] else 'FAILED'}")
    if validation['errors']:
        print("❌ Errors:", validation['errors'])
    if validation['warnings']:
        print("⚠️  Warnings:", validation['warnings'])

    # Save example
    example_file = generator.save_template_json(sales_persona, "sales_example_michael_thompson.json")
    print(f"\n✅ Example persona saved to: {example_file}")


if __name__ == "__main__":
    main()