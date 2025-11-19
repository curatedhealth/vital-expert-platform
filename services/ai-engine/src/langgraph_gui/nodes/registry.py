"""
Node registry with metadata for UI rendering
Defines all available nodes, their parameters, and visual properties
"""

from typing import Dict, Any, Optional
from .base import NodeType


NODE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    # ============================================================================
    # AGENTS
    # ============================================================================
    
    NodeType.MEDICAL: {
        "category": "Agents",
        "label": "Medical Research Agent",
        "description": "Research clinical trials, drug mechanisms, efficacy, safety data",
        "icon": "🏥",
        "color": "#3b82f6",
        "inputs": ["query", "context"],
        "outputs": ["findings", "sources", "confidence_score"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10,
                "description": "Maximum number of results to return"
            },
            "include_trials": {
                "type": "boolean",
                "label": "Include Clinical Trials",
                "default": True
            },
            "include_pubmed": {
                "type": "boolean",
                "label": "Include PubMed",
                "default": True
            }
        }
    },
    
    NodeType.DIGITAL_HEALTH: {
        "category": "Agents",
        "label": "Digital Health Agent",
        "description": "Research health tech innovations, digital therapeutics, AI/ML applications",
        "icon": "💻",
        "color": "#8b5cf6",
        "inputs": ["query", "context"],
        "outputs": ["findings", "sources", "confidence_score"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            },
            "include_arxiv": {
                "type": "boolean",
                "label": "Include arXiv",
                "default": True
            },
            "include_web": {
                "type": "boolean",
                "label": "Include Web Search",
                "default": True
            }
        }
    },
    
    NodeType.REGULATORY: {
        "category": "Agents",
        "label": "Regulatory Agent",
        "description": "Research FDA/EMA approvals, compliance, regulatory pathways",
        "icon": "⚖️",
        "color": "#ec4899",
        "inputs": ["query", "context"],
        "outputs": ["findings", "sources", "confidence_score"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            },
            "include_fda": {
                "type": "boolean",
                "label": "Include FDA Data",
                "default": True
            }
        }
    },
    
    NodeType.AGGREGATOR: {
        "category": "Agents",
        "label": "Aggregator Agent",
        "description": "Synthesize and combine findings from multiple agents",
        "icon": "🔄",
        "color": "#10b981",
        "inputs": ["medical_findings", "digital_findings", "regulatory_findings"],
        "outputs": ["aggregated_research", "summary"],
        "parameters": {
            "synthesis_method": {
                "type": "select",
                "label": "Synthesis Method",
                "default": "comprehensive",
                "options": ["comprehensive", "summary", "comparison"]
            }
        }
    },
    
    NodeType.COPYWRITER: {
        "category": "Agents",
        "label": "Copywriter Agent",
        "description": "Generate polished, professional reports from research data",
        "icon": "✍️",
        "color": "#f59e0b",
        "inputs": ["aggregated_research"],
        "outputs": ["final_report"],
        "parameters": {
            "format": {
                "type": "select",
                "label": "Report Format",
                "default": "comprehensive",
                "options": ["comprehensive", "executive_summary", "technical"]
            },
            "tone": {
                "type": "select",
                "label": "Tone",
                "default": "professional",
                "options": ["professional", "academic", "casual"]
            }
        }
    },
    
    NodeType.ORCHESTRATOR: {
        "category": "Agents",
        "label": "Orchestrator Agent",
        "description": "Plan research strategy and review quality",
        "icon": "🎯",
        "color": "#6366f1",
        "inputs": ["query"],
        "outputs": ["research_plan", "assigned_agents"],
        "parameters": {
            "max_iterations": {
                "type": "number",
                "label": "Max Iterations",
                "default": 2
            }
        }
    },
    
    # ============================================================================
    # TOOLS
    # ============================================================================
    
    NodeType.PUBMED: {
        "category": "Tools",
        "label": "PubMed Search",
        "description": "Search PubMed/MEDLINE for medical literature",
        "icon": "📚",
        "color": "#06b6d4",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            },
            "sort_by": {
                "type": "select",
                "label": "Sort By",
                "default": "relevance",
                "options": ["relevance", "date", "citations"]
            }
        }
    },
    
    NodeType.ARXIV: {
        "category": "Tools",
        "label": "arXiv Search",
        "description": "Search arXiv for research papers",
        "icon": "📄",
        "color": "#0891b2",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            },
            "category": {
                "type": "string",
                "label": "Category Filter",
                "default": ""
            }
        }
    },
    
    NodeType.CLINICAL_TRIALS: {
        "category": "Tools",
        "label": "Clinical Trials Search",
        "description": "Search ClinicalTrials.gov database",
        "icon": "🧪",
        "color": "#14b8a6",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            },
            "status": {
                "type": "select",
                "label": "Trial Status",
                "default": "all",
                "options": ["all", "recruiting", "completed", "active"]
            }
        }
    },
    
    NodeType.FDA: {
        "category": "Tools",
        "label": "FDA Search",
        "description": "Search FDA drug approvals and safety data",
        "icon": "💊",
        "color": "#22c55e",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 10
            }
        }
    },
    
    NodeType.WEB_SEARCH: {
        "category": "Tools",
        "label": "Web Search",
        "description": "Search the web using DuckDuckGo",
        "icon": "🌐",
        "color": "#84cc16",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "max_results": {
                "type": "number",
                "label": "Max Results",
                "default": 5
            }
        }
    },
    
    NodeType.SCRAPER: {
        "category": "Tools",
        "label": "Web Scraper",
        "description": "Scrape content from URLs",
        "icon": "🕷️",
        "color": "#a3e635",
        "inputs": ["urls"],
        "outputs": ["content"],
        "parameters": {
            "max_chars": {
                "type": "number",
                "label": "Max Characters",
                "default": 10000
            }
        }
    },
    
    # ============================================================================
    # DATA SOURCES
    # ============================================================================
    
    NodeType.RAG_SEARCH: {
        "category": "Data Sources",
        "label": "RAG Search",
        "description": "Search knowledge base using RAG",
        "icon": "🔍",
        "color": "#fbbf24",
        "inputs": ["query"],
        "outputs": ["results"],
        "parameters": {
            "top_k": {
                "type": "number",
                "label": "Top K Results",
                "default": 5
            }
        }
    },
    
    NodeType.RAG_ARCHIVE: {
        "category": "Data Sources",
        "label": "RAG Archive",
        "description": "Archive data to knowledge base",
        "icon": "💾",
        "color": "#f59e0b",
        "inputs": ["data", "metadata"],
        "outputs": ["status"],
        "parameters": {}
    },
    
    NodeType.CACHE_LOOKUP: {
        "category": "Data Sources",
        "label": "Cache Lookup",
        "description": "Check query cache for similar results",
        "icon": "⚡",
        "color": "#f97316",
        "inputs": ["query"],
        "outputs": ["cached_result", "cache_hit"],
        "parameters": {
            "similarity_threshold": {
                "type": "number",
                "label": "Similarity Threshold",
                "default": 0.85
            }
        }
    },
    
    # ============================================================================
    # CONTROL FLOW
    # ============================================================================
    
    NodeType.CONDITION: {
        "category": "Control Flow",
        "label": "Condition (If/Else)",
        "description": "Branch execution based on condition",
        "icon": "🔀",
        "color": "#64748b",
        "inputs": ["input"],
        "outputs": ["true", "false"],
        "parameters": {
            "condition": {
                "type": "string",
                "label": "Condition",
                "default": "len(input) > 0",
                "description": "Python expression (e.g., 'len(input) > 0')"
            }
        }
    },
    
    NodeType.LOOP: {
        "category": "Control Flow",
        "label": "Loop",
        "description": "Iterate over items or until condition",
        "icon": "🔁",
        "color": "#475569",
        "inputs": ["items"],
        "outputs": ["results"],
        "parameters": {
            "max_iterations": {
                "type": "number",
                "label": "Max Iterations",
                "default": 10
            },
            "break_condition": {
                "type": "string",
                "label": "Break Condition",
                "default": "",
                "description": "Optional break condition (Python expression)"
            }
        }
    },
    
    NodeType.PARALLEL: {
        "category": "Control Flow",
        "label": "Parallel Execution",
        "description": "Execute multiple branches concurrently",
        "icon": "⚡",
        "color": "#334155",
        "inputs": ["input"],
        "outputs": ["results"],
        "parameters": {
            "branch_count": {
                "type": "number",
                "label": "Number of Branches",
                "default": 2
            }
        }
    },
    
    NodeType.MERGE: {
        "category": "Control Flow",
        "label": "Merge",
        "description": "Combine outputs from multiple nodes",
        "icon": "🔗",
        "color": "#1e293b",
        "inputs": ["input1", "input2", "input3"],
        "outputs": ["merged"],
        "parameters": {
            "merge_strategy": {
                "type": "select",
                "label": "Merge Strategy",
                "default": "concatenate",
                "options": ["concatenate", "union", "intersection"]
            }
        }
    },
    
    # ============================================================================
    # I/O
    # ============================================================================
    
    NodeType.INPUT: {
        "category": "I/O",
        "label": "Input",
        "description": "Workflow input (user query)",
        "icon": "📥",
        "color": "#94a3b8",
        "inputs": [],
        "outputs": ["query", "context"],
        "parameters": {
            "default_value": {
                "type": "string",
                "label": "Default Value",
                "default": ""
            }
        }
    },
    
    NodeType.OUTPUT: {
        "category": "I/O",
        "label": "Output",
        "description": "Workflow output (final result)",
        "icon": "📤",
        "color": "#cbd5e1",
        "inputs": ["result"],
        "outputs": [],
        "parameters": {
            "format": {
                "type": "select",
                "label": "Output Format",
                "default": "json",
                "options": ["json", "text", "markdown"]
            }
        }
    },
    
    # ============================================================================
    # PANEL WORKFLOW NODES
    # ============================================================================
    
    NodeType.PANEL_INITIALIZE: {
        "category": "Panel Workflow",
        "label": "Initialize Panel",
        "description": "Initialize panel workflow and extract tasks",
        "icon": "🚀",
        "color": "#ec4899",
        "inputs": ["query", "tasks"],
        "outputs": ["initialized_state"],
        "parameters": {}
    },
    
    NodeType.PANEL_OPENING_STATEMENTS: {
        "category": "Panel Workflow",
        "label": "Opening Statements",
        "description": "Sequential opening statements from all experts",
        "icon": "🎤",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks"],
        "outputs": ["opening_statements"],
        "parameters": {}
    },
    
    NodeType.PANEL_DISCUSSION_ROUND: {
        "category": "Panel Workflow",
        "label": "Discussion Round",
        "description": "Moderated discussion round with expert responses",
        "icon": "💬",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks", "previous_discussion"],
        "outputs": ["dialogue_turns", "consensus_level"],
        "parameters": {
            "max_rounds": {
                "type": "number",
                "label": "Max Rounds",
                "default": 3
            }
        }
    },
    
    NodeType.PANEL_CONSENSUS_BUILDING: {
        "category": "Panel Workflow",
        "label": "Consensus Building",
        "description": "Calculate final consensus from expert positions",
        "icon": "🤝",
        "color": "#ec4899",
        "inputs": ["expert_positions"],
        "outputs": ["consensus_level", "consensus_statement"],
        "parameters": {
            "consensus_threshold": {
                "type": "number",
                "label": "Consensus Threshold",
                "default": 0.75
            }
        }
    },
    
    NodeType.PANEL_CONSENSUS_ASSESSMENT: {
        "category": "Panel Workflow",
        "label": "Consensus Assessment",
        "description": "Assess consensus level after discussion round and decide next steps",
        "icon": "📊",
        "color": "#ec4899",
        "inputs": ["dialogue_turns", "expert_positions"],
        "outputs": ["consensus_level", "next_action"],
        "parameters": {}
    },
    
    NodeType.PANEL_QNA: {
        "category": "Panel Workflow",
        "label": "Q&A Session",
        "description": "Question and answer session where moderator fields questions and experts respond",
        "icon": "❓",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks", "previous_discussion"],
        "outputs": ["qna_session", "dialogue_turns"],
        "parameters": {
            "num_questions": {
                "type": "number",
                "label": "Number of Questions",
                "default": 3
            }
        }
    },
    
    NodeType.PANEL_DOCUMENTATION: {
        "category": "Panel Workflow",
        "label": "Documentation",
        "description": "Generate final panel documentation and report",
        "icon": "📄",
        "color": "#ec4899",
        "inputs": ["panel_data"],
        "outputs": ["final_report"],
        "parameters": {}
    },
    
    NodeType.PANEL_OPENING_ROUND: {
        "category": "Panel Workflow",
        "label": "Opening Round",
        "description": "Initial perspectives from experts (Open Panel)",
        "icon": "🌟",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks"],
        "outputs": ["opening_statements"],
        "parameters": {}
    },
    
    NodeType.PANEL_FREE_DIALOGUE: {
        "category": "Panel Workflow",
        "label": "Free Dialogue",
        "description": "Free-form collaborative dialogue (Open Panel)",
        "icon": "🗣️",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks", "opening_statements"],
        "outputs": ["dialogue_turns"],
        "parameters": {
            "num_turns": {
                "type": "number",
                "label": "Number of Turns",
                "default": 3
            }
        }
    },
    
    NodeType.PANEL_THEME_CLUSTERING: {
        "category": "Panel Workflow",
        "label": "Theme Clustering",
        "description": "Identify themes and innovation clusters (Open Panel)",
        "icon": "🔍",
        "color": "#ec4899",
        "inputs": ["dialogue_turns"],
        "outputs": ["themes", "clusters"],
        "parameters": {}
    },
    
    NodeType.PANEL_FINAL_PERSPECTIVES: {
        "category": "Panel Workflow",
        "label": "Final Perspectives",
        "description": "Collect final perspectives from experts (Open Panel)",
        "icon": "🎯",
        "color": "#ec4899",
        "inputs": ["query", "expert_tasks", "themes"],
        "outputs": ["final_perspectives"],
        "parameters": {}
    },
    
    NodeType.PANEL_SYNTHESIS: {
        "category": "Panel Workflow",
        "label": "Synthesis",
        "description": "Generate final synthesis report (Open Panel)",
        "icon": "📊",
        "color": "#ec4899",
        "inputs": ["panel_data"],
        "outputs": ["final_report"],
        "parameters": {}
    }
}


def get_node_definition(node_type: NodeType) -> Optional[Dict[str, Any]]:
    """Get node definition by type"""
    return NODE_DEFINITIONS.get(node_type)


def get_nodes_by_category() -> Dict[str, list]:
    """Get all nodes grouped by category"""
    categories = {}
    for node_type, definition in NODE_DEFINITIONS.items():
        category = definition["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "type": node_type,
            **definition
        })
    return categories

