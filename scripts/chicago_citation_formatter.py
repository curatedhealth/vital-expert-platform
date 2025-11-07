#!/usr/bin/env python3
"""
Chicago-Style Citation Formatter
==================================

Formats citations in Chicago Manual of Style (17th Edition) format.
Supports multiple document types: articles, reports, books, web pages, etc.

Author: VITAL AI Platform
Date: 2025-11-06
Version: 1.0.0
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class ChicagoCitationFormatter:
    """Format citations in Chicago 17th Edition style."""
    
    @staticmethod
    def format(metadata: Dict[str, Any]) -> str:
        """
        Format a citation in Chicago style based on document type.
        
        Args:
            metadata: Document metadata dictionary
        
        Returns:
            Formatted citation string
        """
        try:
            # Determine document type
            doc_type = metadata.get('content_file_type') or metadata.get('file_type', 'web_page')
            report_type = metadata.get('report_type', '')
            
            # Route to appropriate formatter
            if doc_type == 'book' or 'book' in report_type.lower():
                return ChicagoCitationFormatter._format_book(metadata)
            elif doc_type == 'journal' or 'journal' in report_type.lower():
                return ChicagoCitationFormatter._format_journal_article(metadata)
            elif doc_type in ['article', 'report', 'white_paper', 'research_study']:
                return ChicagoCitationFormatter._format_report(metadata)
            else:
                return ChicagoCitationFormatter._format_web_page(metadata)
                
        except Exception as e:
            logger.error(f"Error formatting citation: {e}")
            # Fallback to simple format
            return ChicagoCitationFormatter._format_simple(metadata)
    
    @staticmethod
    def _format_authors(authors: List[str], invert_first: bool = True) -> str:
        """
        Format author list according to Chicago style.
        
        Args:
            authors: List of author names
            invert_first: Whether to invert first author (Last, First)
        
        Returns:
            Formatted author string
        """
        if not authors or len(authors) == 0:
            return ""
        
        # Handle string input (comma-separated)
        if isinstance(authors, str):
            authors = [a.strip() for a in authors.split(',') if a.strip()]
        
        # Single author
        if len(authors) == 1:
            author = authors[0]
            if invert_first and ',' not in author:
                # Invert: "John Smith" → "Smith, John"
                parts = author.split()
                if len(parts) >= 2:
                    return f"{parts[-1]}, {' '.join(parts[:-1])}"
            return author
        
        # Two authors
        if len(authors) == 2:
            first = authors[0]
            second = authors[1]
            if invert_first and ',' not in first:
                parts = first.split()
                if len(parts) >= 2:
                    first = f"{parts[-1]}, {' '.join(parts[:-1])}"
            return f"{first}, and {second}"
        
        # Three or more authors
        formatted = []
        for i, author in enumerate(authors[:3]):  # Use first 3 authors
            if i == 0 and invert_first and ',' not in author:
                parts = author.split()
                if len(parts) >= 2:
                    author = f"{parts[-1]}, {' '.join(parts[:-1])}"
            formatted.append(author)
        
        if len(authors) > 3:
            return f"{formatted[0]}, et al."
        else:
            return f"{formatted[0]}, {formatted[1]}, and {formatted[2]}"
    
    @staticmethod
    def _format_report(metadata: Dict[str, Any]) -> str:
        """
        Format citation for reports, white papers, and articles.
        
        Chicago Format:
        Author(s). "Title." Publisher/Firm, Publication Date. URL.
        
        Example:
        Boston Consulting Group. "AI at Work: Momentum Builds, but Gaps Remain." 
        BCG, January 15, 2025. https://www.bcg.com/publications/2025/ai-at-work.
        """
        parts = []
        
        # Authors or Firm
        authors = metadata.get('authors', [])
        firm = metadata.get('firm', '')
        
        if authors:
            author_str = ChicagoCitationFormatter._format_authors(authors)
            parts.append(author_str + ".")
        elif firm:
            parts.append(firm + ".")
        else:
            parts.append("Unknown Author.")
        
        # Title (in quotes)
        title = metadata.get('title', 'Untitled')
        parts.append(f'"{title}."')
        
        # Publisher/Organization
        publisher = firm or metadata.get('organization', '')
        if publisher:
            parts.append(publisher + ",")
        
        # Publication Date
        pub_date = ChicagoCitationFormatter._format_date(metadata)
        if pub_date:
            parts.append(pub_date + ".")
        
        # URL or DOI
        url = metadata.get('url') or metadata.get('source_url', '')
        doi = metadata.get('doi', '')
        if doi:
            parts.append(f"https://doi.org/{doi}.")
        elif url:
            parts.append(url + ".")
        
        return " ".join(parts)
    
    @staticmethod
    def _format_book(metadata: Dict[str, Any]) -> str:
        """
        Format citation for books.
        
        Chicago Format:
        Author(s). Title. Edition. Place: Publisher, Year.
        
        Example:
        Smith, John, and Jane Doe. Digital Health Innovation. 2nd ed. 
        Cambridge, MA: MIT Press, 2024.
        """
        parts = []
        
        # Authors
        authors = metadata.get('authors', [])
        if authors:
            author_str = ChicagoCitationFormatter._format_authors(authors, invert_first=True)
            parts.append(author_str + ".")
        else:
            firm = metadata.get('firm', 'Unknown Author')
            parts.append(firm + ".")
        
        # Title (italics represented by plain text)
        title = metadata.get('title', 'Untitled')
        parts.append(title + ".")
        
        # Edition
        edition = metadata.get('edition', '')
        if edition and edition != '1':
            if edition.isdigit():
                edition = f"{edition}th ed."
            parts.append(edition)
        
        # Place and Publisher
        publisher = metadata.get('publisher', metadata.get('firm', ''))
        place = metadata.get('publication_place', '')
        year = metadata.get('publication_year', '')
        
        pub_info = []
        if place:
            pub_info.append(place + ":")
        if publisher:
            pub_info.append(publisher + ",")
        if year:
            pub_info.append(str(year) + ".")
        
        if pub_info:
            parts.append(" ".join(pub_info))
        
        return " ".join(parts)
    
    @staticmethod
    def _format_journal_article(metadata: Dict[str, Any]) -> str:
        """
        Format citation for journal articles.
        
        Chicago Format:
        Author(s). "Title." Journal Name volume, no. issue (Year): pages. DOI.
        
        Example:
        Smith, John, and Jane Doe. "AI in Healthcare." Journal of Medical AI 15, 
        no. 3 (2024): 123-145. https://doi.org/10.1234/jmai.2024.15.3.123.
        """
        parts = []
        
        # Authors
        authors = metadata.get('authors', [])
        if authors:
            author_str = ChicagoCitationFormatter._format_authors(authors, invert_first=True)
            parts.append(author_str + ".")
        else:
            parts.append("Unknown Author.")
        
        # Title (in quotes)
        title = metadata.get('title', 'Untitled')
        parts.append(f'"{title}."')
        
        # Journal name (italics)
        journal = metadata.get('journal', metadata.get('series_name', ''))
        if journal:
            parts.append(journal)
        
        # Volume and issue
        volume = metadata.get('volume', '')
        issue = metadata.get('issue', '')
        year = metadata.get('publication_year', '')
        
        if volume:
            volume_str = str(volume)
            if issue:
                volume_str += f", no. {issue}"
            if year:
                volume_str += f" ({year}):"
            parts.append(volume_str)
        
        # Pages
        pages = metadata.get('pages', '')
        if pages:
            parts.append(pages + ".")
        
        # DOI or URL
        doi = metadata.get('doi', '')
        url = metadata.get('url', '')
        if doi:
            parts.append(f"https://doi.org/{doi}.")
        elif url:
            parts.append(url + ".")
        
        return " ".join(parts)
    
    @staticmethod
    def _format_web_page(metadata: Dict[str, Any]) -> str:
        """
        Format citation for web pages.
        
        Chicago Format:
        Author/Organization. "Title." Website Name. Publication Date. URL.
        
        Example:
        FDA. "Software as a Medical Device (SaMD): Clinical Evaluation." 
        U.S. Food and Drug Administration. December 8, 2017. 
        https://www.fda.gov/medical-devices/software-medical-device-samd.
        """
        parts = []
        
        # Author or Organization
        authors = metadata.get('authors', [])
        firm = metadata.get('firm', '')
        organization = metadata.get('organization', '')
        
        if authors:
            author_str = ChicagoCitationFormatter._format_authors(authors, invert_first=False)
            parts.append(author_str + ".")
        elif organization:
            parts.append(organization + ".")
        elif firm:
            parts.append(firm + ".")
        else:
            parts.append("Unknown Source.")
        
        # Title (in quotes)
        title = metadata.get('title', 'Untitled')
        parts.append(f'"{title}."')
        
        # Website name
        website = metadata.get('website_name', firm or organization or '')
        if website:
            parts.append(website + ".")
        
        # Publication/Access Date
        pub_date = ChicagoCitationFormatter._format_date(metadata)
        if pub_date:
            parts.append(pub_date + ".")
        else:
            # Use access date if no publication date
            access_date = metadata.get('download_date', '')
            if access_date:
                access_str = ChicagoCitationFormatter._format_date({'publication_date': access_date})
                parts.append(f"Accessed {access_str}.")
        
        # URL
        url = metadata.get('url') or metadata.get('source_url', '')
        if url:
            parts.append(url + ".")
        
        return " ".join(parts)
    
    @staticmethod
    def _format_simple(metadata: Dict[str, Any]) -> str:
        """
        Fallback simple format for any document.
        
        Format:
        Author/Firm. Title. Year. URL.
        """
        parts = []
        
        # Author/Firm
        authors = metadata.get('authors', [])
        firm = metadata.get('firm', '')
        if authors:
            if isinstance(authors, list):
                author_str = ", ".join(authors[:3])
            else:
                author_str = str(authors)
            parts.append(author_str + ".")
        elif firm:
            parts.append(firm + ".")
        
        # Title
        title = metadata.get('title', 'Untitled')
        parts.append(f'"{title}."')
        
        # Year
        year = metadata.get('publication_year', '')
        if year:
            parts.append(str(year) + ".")
        
        # URL
        url = metadata.get('url', '')
        if url:
            parts.append(url + ".")
        
        return " ".join(parts) if parts else "Unknown Citation"
    
    @staticmethod
    def _format_date(metadata: Dict[str, Any]) -> str:
        """
        Format publication date in Chicago style.
        
        Returns:
            Formatted date string (e.g., "January 15, 2025")
        """
        # Try publication_date first
        pub_date = metadata.get('publication_date')
        if pub_date:
            try:
                if isinstance(pub_date, str):
                    # Parse ISO format
                    date_obj = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                else:
                    date_obj = pub_date
                
                # Format as "Month Day, Year"
                return date_obj.strftime("%B %d, %Y")
            except:
                pass
        
        # Fallback to year and month
        year = metadata.get('publication_year', '')
        month = metadata.get('publication_month', '')
        
        if year and month:
            try:
                month_names = {
                    1: "January", 2: "February", 3: "March", 4: "April",
                    5: "May", 6: "June", 7: "July", 8: "August",
                    9: "September", 10: "October", 11: "November", 12: "December"
                }
                month_name = month_names.get(int(month), '')
                return f"{month_name} {year}"
            except:
                return str(year)
        elif year:
            return str(year)
        
        return ""


# ============================================================================
# CONVENIENCE FUNCTION
# ============================================================================

def format_citation(metadata: Dict[str, Any], style: str = "chicago") -> str:
    """
    Convenience function to format a citation.
    
    Args:
        metadata: Document metadata dictionary
        style: Citation style (default: "chicago")
    
    Returns:
        Formatted citation string
    """
    if style.lower() == "chicago":
        return ChicagoCitationFormatter.format(metadata)
    else:
        raise ValueError(f"Unsupported citation style: {style}")


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example 1: Report/White Paper
    report_metadata = {
        'firm': 'Boston Consulting Group',
        'title': 'AI at Work: Momentum Builds, but Gaps Remain',
        'publication_date': '2025-01-15',
        'publication_year': 2025,
        'publication_month': 1,
        'url': 'https://www.bcg.com/publications/2025/ai-at-work',
        'content_file_type': 'report'
    }
    
    # Example 2: Book
    book_metadata = {
        'authors': ['John Smith', 'Jane Doe'],
        'title': 'Digital Health Innovation',
        'edition': '2',
        'publication_place': 'Cambridge, MA',
        'publisher': 'MIT Press',
        'publication_year': 2024,
        'content_file_type': 'book'
    }
    
    # Example 3: Web Page
    web_metadata = {
        'organization': 'U.S. Food and Drug Administration',
        'firm': 'FDA',
        'title': 'Software as a Medical Device (SaMD): Clinical Evaluation',
        'website_name': 'U.S. Food and Drug Administration',
        'publication_date': '2017-12-08',
        'url': 'https://www.fda.gov/medical-devices/software-medical-device-samd',
        'content_file_type': 'web_page'
    }
    
    print("\n=== Chicago-Style Citations ===\n")
    
    print("Report/White Paper:")
    print(format_citation(report_metadata))
    print()
    
    print("Book:")
    print(format_citation(book_metadata))
    print()
    
    print("Web Page:")
    print(format_citation(web_metadata))
    print()

