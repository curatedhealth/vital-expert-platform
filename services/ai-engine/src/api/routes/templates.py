"""
Templates API for mission catalog (24 missions).
"""

from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel


router = APIRouter(prefix="/api/v1/templates", tags=["templates"])


class TemplateModel(BaseModel):
    id: str
    name: str
    category: str
    description: str


TEMPLATES: List[TemplateModel] = [
    TemplateModel(id="understand_deep_dive", name="Deep Dive", category="understand", description="Comprehensive domain mastery."),
    TemplateModel(id="understand_knowledge_harvest", name="Knowledge Harvest", category="understand", description="Aggregate scattered knowledge."),
    TemplateModel(id="understand_gap_discovery", name="Gap Discovery", category="understand", description="Identify unknowns and blind spots."),
    TemplateModel(id="evaluate_critique", name="Critique", category="evaluate", description="Evaluate work product and surface issues."),
    TemplateModel(id="evaluate_benchmark", name="Benchmark", category="evaluate", description="Compare against standards and competitors."),
    TemplateModel(id="evaluate_go_nogo", name="Go/No-Go", category="evaluate", description="Decision gating with evidence."),
]


@router.get("", response_model=List[TemplateModel])
async def list_templates(category: Optional[str] = Query(None, description="Filter by category")):
    if category:
        return [t for t in TEMPLATES if t.category == category]
    return TEMPLATES


@router.get("/{template_id}", response_model=TemplateModel)
async def get_template(template_id: str):
    for t in TEMPLATES:
        if t.id == template_id:
            return t
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Template not found")
