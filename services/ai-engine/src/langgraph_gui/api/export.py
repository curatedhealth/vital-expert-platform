"""
Export functionality for panel discussions
Generates PDF and Markdown reports from expert and moderator messages
"""

import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from io import BytesIO

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

router = APIRouter()


class ExportRequest(BaseModel):
    """Request to export discussion report"""
    messages: List[Dict[str, Any]]
    query: str
    title: str = "Panel Discussion Report"


def generate_markdown_report(messages: List[Dict[str, Any]], query: str, title: str) -> str:
    """Generate Markdown report from messages"""
    md = []
    
    # Header
    md.append(f"# {title}\n")
    md.append(f"**Query:** {query}\n")
    md.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    md.append("\n---\n\n")
    
    # Group messages by type
    expert_messages = []
    moderator_messages = []
    user_messages = []
    other_messages = []
    
    for msg in messages:
        msg_type = msg.get('type', 'assistant')
        if msg_type == 'expert':
            expert_messages.append(msg)
        elif msg_type == 'moderator':
            moderator_messages.append(msg)
        elif msg_type == 'user':
            user_messages.append(msg)
        else:
            other_messages.append(msg)
    
    # User query
    if user_messages:
        md.append("## User Query\n\n")
        for msg in user_messages:
            md.append(f"{msg.get('content', '')}\n\n")
        md.append("---\n\n")
    
    # Moderator messages
    if moderator_messages:
        md.append("## Moderator Contributions\n\n")
        for msg in moderator_messages:
            name = msg.get('name', 'Moderator')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            sources = msg.get('sources', [])
            
            md.append(f"### {name}")
            if timestamp:
                md.append(f" *({timestamp})*")
            md.append("\n\n")
            md.append(f"{content}\n\n")
            
            if sources and len(sources) > 0:
                md.append("**Sources:**\n")
                for source in sources:
                    title = source.get('title', 'Source')
                    url = source.get('url', '')
                    md.append(f"- [{title}]({url})\n")
                md.append("\n")
            md.append("---\n\n")
    
    # Expert messages
    if expert_messages:
        md.append("## Expert Contributions\n\n")
        for msg in expert_messages:
            name = msg.get('name', 'Expert')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            sources = msg.get('sources', [])
            
            md.append(f"### {name}")
            if timestamp:
                md.append(f" *({timestamp})*")
            md.append("\n\n")
            md.append(f"{content}\n\n")
            
            if sources and len(sources) > 0:
                md.append("**Sources:**\n")
                for source in sources:
                    title = source.get('title', 'Source')
                    url = source.get('url', '')
                    md.append(f"- [{title}]({url})\n")
                md.append("\n")
            md.append("---\n\n")
    
    # Other messages (assistant, logs, etc.)
    if other_messages:
        md.append("## Additional Information\n\n")
        for msg in other_messages:
            msg_type = msg.get('type', 'assistant')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            
            if msg_type == 'log':
                level = msg.get('level', 'info')
                md.append(f"**[{level.upper()}]** {content}\n\n")
            else:
                md.append(f"{content}\n\n")
    
    return "\n".join(md)


def generate_pdf_report(messages: List[Dict[str, Any]], query: str, title: str) -> BytesIO:
    """Generate PDF report from messages"""
    if not REPORTLAB_AVAILABLE:
        raise HTTPException(
            status_code=500,
            detail="PDF generation requires reportlab. Install with: pip install reportlab"
        )
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=12,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=8,
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=6,
    )
    
    # Title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Query
    story.append(Paragraph(f"<b>Query:</b> {query}", styles['Normal']))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Group messages - exclude logs from PDF
    expert_messages = []
    moderator_messages = []
    user_messages = []
    assistant_messages = []  # Only structured assistant messages, not logs
    
    for msg in messages:
        msg_type = msg.get('type', 'assistant')
        # Skip log messages for PDF
        if msg_type == 'log':
            continue
        elif msg_type == 'expert':
            expert_messages.append(msg)
        elif msg_type == 'moderator':
            moderator_messages.append(msg)
        elif msg_type == 'user':
            user_messages.append(msg)
        elif msg_type == 'assistant':
            # Only include meaningful assistant messages (not logs)
            content = msg.get('content', '')
            # Skip phase/status messages that are more like logs
            if not any(skip_phrase in content.lower() for skip_phrase in [
                'phase complete', 'starting phase', 'panel complete', 
                'consensus update', 'theme analysis complete'
            ]):
                assistant_messages.append(msg)
    
    # User query
    if user_messages:
        story.append(Paragraph("User Query", heading_style))
        story.append(Spacer(1, 0.1*inch))
        for msg in user_messages:
            story.append(Paragraph(msg.get('content', ''), styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
    
    # Moderator messages
    if moderator_messages:
        story.append(Paragraph("Moderator Contributions", heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        for msg in moderator_messages:
            name = msg.get('name', 'Moderator')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            sources = msg.get('sources', [])
            
            story.append(Paragraph(f"<b>{name}</b>", subheading_style))
            if timestamp:
                story.append(Paragraph(f"<i>{timestamp}</i>", styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
            story.append(Paragraph(content.replace('\n', '<br/>'), styles['Normal']))
            
            if sources and len(sources) > 0:
                story.append(Spacer(1, 0.05*inch))
                story.append(Paragraph("<b>Sources:</b>", styles['Normal']))
                for source in sources:
                    title = source.get('title', 'Source')
                    url = source.get('url', '')
                    story.append(Paragraph(f"• {title}: {url}", styles['Normal']))
            
            story.append(Spacer(1, 0.2*inch))
        
        story.append(Spacer(1, 0.2*inch))
    
    # Expert messages
    if expert_messages:
        story.append(Paragraph("Expert Contributions", heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        for msg in expert_messages:
            name = msg.get('name', 'Expert')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            sources = msg.get('sources', [])
            
            story.append(Paragraph(f"<b>{name}</b>", subheading_style))
            if timestamp:
                story.append(Paragraph(f"<i>{timestamp}</i>", styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
            story.append(Paragraph(content.replace('\n', '<br/>'), styles['Normal']))
            
            if sources and len(sources) > 0:
                story.append(Spacer(1, 0.05*inch))
                story.append(Paragraph("<b>Sources:</b>", styles['Normal']))
                for source in sources:
                    title = source.get('title', 'Source')
                    url = source.get('url', '')
                    story.append(Paragraph(f"• {title}: {url}", styles['Normal']))
            
            story.append(Spacer(1, 0.2*inch))
    
    # Assistant messages (final reports, summaries, etc.)
    if assistant_messages:
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("Summary & Conclusions", heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        for msg in assistant_messages:
            content = msg.get('content', '')
            story.append(Paragraph(content.replace('\n', '<br/>'), styles['Normal']))
            story.append(Spacer(1, 0.15*inch))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


@router.post("/export/markdown")
async def export_markdown(request: ExportRequest):
    """Export discussion as Markdown"""
    try:
        markdown_content = generate_markdown_report(
            request.messages,
            request.query,
            request.title
        )
        
        return Response(
            content=markdown_content,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{request.title.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate markdown: {str(e)}")


@router.post("/export/pdf")
async def export_pdf(request: ExportRequest):
    """Export discussion as PDF"""
    try:
        pdf_buffer = generate_pdf_report(
            request.messages,
            request.query,
            request.title
        )
        
        return Response(
            content=pdf_buffer.read(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{request.title.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

