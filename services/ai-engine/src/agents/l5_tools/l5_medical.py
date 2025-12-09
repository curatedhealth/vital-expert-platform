"""
VITAL Path AI Services - VITAL L5 Medical Tools

Unified medical/pharmaceutical data source tools.
Single file handles: FDA, ClinicalTrials, DrugBank, RxNorm, WHO ATC, 
SNOMED, EMA, Orange Book, FAERS.

Naming Convention:
- Class: MedicalL5Tool
- Factory: create_medical_tool(source)
- Logs: vital_l5_{source}_{action}
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import structlog

from .l5_base import L5BaseTool, ToolTier, L5Result

logger = structlog.get_logger()


class MedicalSource(Enum):
    """Medical data sources."""
    FDA_LABELS = "fda_labels"
    CLINICAL_TRIALS = "clinical_trials"
    DRUGBANK = "drugbank"
    RXNORM = "rxnorm"
    WHO_ATC = "who_atc"
    SNOMED = "snomed"
    EMA = "ema"
    ORANGE_BOOK = "orange_book"
    FAERS = "faers"


# Source configurations
MEDICAL_SOURCE_CONFIG = {
    MedicalSource.FDA_LABELS: {
        "base_url": "https://api.fda.gov/drug/label.json",
        "alt_url": "https://dailymed.nlm.nih.gov/dailymed/services/v2",
        "cache_ttl": 24,
        "requires_key": False,
    },
    MedicalSource.CLINICAL_TRIALS: {
        "base_url": "https://clinicaltrials.gov/api/v2",
        "cache_ttl": 6,
        "requires_key": False,
    },
    MedicalSource.DRUGBANK: {
        "base_url": "https://go.drugbank.com/api/v1",
        "cache_ttl": 168,
        "requires_key": True,
    },
    MedicalSource.RXNORM: {
        "base_url": "https://rxnav.nlm.nih.gov/REST",
        "cache_ttl": 168,
        "requires_key": False,
    },
    MedicalSource.WHO_ATC: {
        "base_url": "https://www.whocc.no/atc_ddd_index",
        "cache_ttl": 720,
        "requires_key": False,
    },
    MedicalSource.SNOMED: {
        "base_url": "https://browser.ihtsdotools.org/snowstorm/snomed-ct",
        "cache_ttl": 720,
        "requires_key": False,
    },
    MedicalSource.EMA: {
        "base_url": "https://www.ema.europa.eu/en",
        "cache_ttl": 24,
        "requires_key": False,
    },
    MedicalSource.ORANGE_BOOK: {
        "base_url": "https://api.fda.gov/drug/drugsfda.json",
        "cache_ttl": 24,
        "requires_key": False,
    },
    MedicalSource.FAERS: {
        "base_url": "https://api.fda.gov/drug/event.json",
        "cache_ttl": 6,
        "requires_key": False,
    },
}


@dataclass
class MedicalResult(L5Result):
    """Extended result for medical data."""
    drug_name: str = ""
    generic_name: str = ""
    manufacturer: str = ""
    approval_date: Optional[str] = None
    indication: str = ""
    warnings: str = ""
    interactions: List[str] = field(default_factory=list)


class MedicalL5Tool(L5BaseTool[MedicalResult]):
    """
    Unified medical data source tool.
    
    Supports multiple medical databases via source parameter.
    """
    
    def __init__(
        self,
        source: MedicalSource,
        api_key: Optional[str] = None,
        **kwargs
    ):
        config = MEDICAL_SOURCE_CONFIG[source]
        
        super().__init__(
            source_type=ToolTier(source.value),
            base_url=config["base_url"],
            api_key=api_key,
            cache_ttl_hours=config.get("cache_ttl", 24),
            **kwargs
        )
        
        self.source = source
        self.config = config
        
        # Source-specific handlers
        self._search_handlers = {
            MedicalSource.FDA_LABELS: self._search_fda,
            MedicalSource.CLINICAL_TRIALS: self._search_clinical_trials,
            MedicalSource.DRUGBANK: self._search_drugbank,
            MedicalSource.RXNORM: self._search_rxnorm,
            MedicalSource.WHO_ATC: self._search_who_atc,
            MedicalSource.SNOMED: self._search_snomed,
            MedicalSource.EMA: self._search_ema,
            MedicalSource.ORANGE_BOOK: self._search_orange_book,
            MedicalSource.FAERS: self._search_faers,
        }
    
    async def search(
        self,
        query: str,
        max_results: int = 20,
        **kwargs
    ) -> List[MedicalResult]:
        """Search medical data source."""
        self._log_search_start(query, max_results=max_results)
        
        cache_key = self._get_cache_key("search", query, max_results)
        cached = self._get_cached(cache_key)
        if cached:
            return cached
        
        try:
            handler = self._search_handlers.get(self.source)
            if not handler:
                return []
            
            results = await handler(query, max_results, **kwargs)
            self._set_cached(cache_key, results)
            self._log_search_complete(len(results))
            return results
            
        except Exception as e:
            self._log_error("search", e)
            return []
    
    async def get_by_id(
        self,
        item_id: str,
        **kwargs
    ) -> Optional[MedicalResult]:
        """Get item by ID."""
        results = await self.search(item_id, max_results=1, **kwargs)
        return results[0] if results else None
    
    # ==================== FDA Labels ====================
    async def _search_fda(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search FDA drug labels."""
        search_query = f'openfda.brand_name:"{query}" OR openfda.generic_name:"{query}"'
        
        data = await self._make_request(
            'GET',
            self.base_url,
            params={'search': search_query, 'limit': max_results}
        )
        
        if not data or 'results' not in data:
            return []
        
        results = []
        for item in data['results']:
            openfda = item.get('openfda', {})
            results.append(MedicalResult(
                id=openfda.get('spl_id', [''])[0] if openfda.get('spl_id') else '',
                title=self._first(openfda.get('brand_name', [])),
                content=item.get('description', [''])[0] if item.get('description') else '',
                source=self.source_name,
                url=f"https://dailymed.nlm.nih.gov/dailymed/search.cfm?query={query}",
                drug_name=self._first(openfda.get('brand_name', [])),
                generic_name=self._first(openfda.get('generic_name', [])),
                manufacturer=self._first(openfda.get('manufacturer_name', [])),
                indication=self._first(item.get('indications_and_usage', [])),
                warnings=self._first(item.get('warnings', [])),
            ))
        
        return results
    
    # ==================== Clinical Trials ====================
    async def _search_clinical_trials(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search ClinicalTrials.gov."""
        data = await self._make_request(
            'GET',
            f"{self.base_url}/studies",
            params={
                'query.term': query,
                'pageSize': max_results,
                'format': 'json',
            }
        )
        
        if not data or 'studies' not in data:
            return []
        
        results = []
        for study in data['studies']:
            protocol = study.get('protocolSection', {})
            id_module = protocol.get('identificationModule', {})
            desc_module = protocol.get('descriptionModule', {})
            
            nct_id = id_module.get('nctId', '')
            results.append(MedicalResult(
                id=nct_id,
                title=id_module.get('officialTitle', id_module.get('briefTitle', '')),
                content=desc_module.get('briefSummary', ''),
                source=self.source_name,
                url=f"https://clinicaltrials.gov/study/{nct_id}",
                metadata={
                    'status': protocol.get('statusModule', {}).get('overallStatus'),
                    'phase': protocol.get('designModule', {}).get('phases', []),
                    'conditions': protocol.get('conditionsModule', {}).get('conditions', []),
                }
            ))
        
        return results
    
    # ==================== DrugBank ====================
    async def _search_drugbank(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search DrugBank."""
        if not self.api_key:
            logger.warning("vital_l5_drugbank_no_api_key")
            return []
        
        data = await self._make_request(
            'GET',
            f"{self.base_url}/drugs",
            params={'q': query, 'per_page': max_results},
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        
        if not data:
            return []
        
        drugs = data.get('drugs', data if isinstance(data, list) else [])
        results = []
        
        for item in drugs:
            db_id = item.get('drugbank_id', item.get('id', ''))
            results.append(MedicalResult(
                id=db_id,
                title=item.get('name', ''),
                content=item.get('description', ''),
                source=self.source_name,
                url=f"https://go.drugbank.com/drugs/{db_id}",
                drug_name=item.get('name', ''),
                indication=item.get('indication', ''),
                metadata={
                    'type': item.get('type'),
                    'groups': item.get('groups', []),
                    'categories': item.get('categories', []),
                }
            ))
        
        return results
    
    # ==================== RxNorm ====================
    async def _search_rxnorm(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search RxNorm."""
        data = await self._make_request(
            'GET',
            f"{self.base_url}/drugs.json",
            params={'name': query}
        )
        
        if not data:
            return []
        
        results = []
        concept_groups = data.get('drugGroup', {}).get('conceptGroup', [])
        
        for group in concept_groups:
            for concept in group.get('conceptProperties', [])[:max_results]:
                rxcui = concept.get('rxcui', '')
                results.append(MedicalResult(
                    id=rxcui,
                    title=concept.get('name', ''),
                    content=concept.get('synonym', ''),
                    source=self.source_name,
                    url=f"https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm={rxcui}",
                    metadata={'term_type': concept.get('tty', '')}
                ))
        
        return results[:max_results]
    
    # ==================== WHO ATC ====================
    async def _search_who_atc(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search WHO ATC codes."""
        # ATC Level 1 codes (local data as WHO doesn't have REST API)
        ATC_LEVEL1 = {
            'A': 'Alimentary tract and metabolism',
            'B': 'Blood and blood forming organs',
            'C': 'Cardiovascular system',
            'D': 'Dermatologicals',
            'G': 'Genito-urinary system and sex hormones',
            'H': 'Systemic hormonal preparations',
            'J': 'Antiinfectives for systemic use',
            'L': 'Antineoplastic and immunomodulating agents',
            'M': 'Musculo-skeletal system',
            'N': 'Nervous system',
            'P': 'Antiparasitic products',
            'R': 'Respiratory system',
            'S': 'Sensory organs',
            'V': 'Various',
        }
        
        results = []
        query_upper = query.upper()
        query_lower = query.lower()
        
        for code, name in ATC_LEVEL1.items():
            if query_upper == code or query_lower in name.lower():
                results.append(MedicalResult(
                    id=code,
                    title=name,
                    content=f"ATC Level 1: {name}",
                    source=self.source_name,
                    url=f"https://www.whocc.no/atc_ddd_index/?code={code}",
                    metadata={'level': 1}
                ))
        
        return results[:max_results]
    
    # ==================== SNOMED ====================
    async def _search_snomed(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search SNOMED-CT."""
        branch = kwargs.get('branch', 'MAIN/2024-03-01')
        
        data = await self._make_request(
            'GET',
            f"{self.base_url}/browser/{branch}/descriptions",
            params={
                'term': query,
                'limit': max_results,
                'activeFilter': 'true',
            }
        )
        
        if not data or 'items' not in data:
            return []
        
        results = []
        for item in data['items']:
            concept = item.get('concept', {})
            concept_id = concept.get('conceptId', '')
            fsn = concept.get('fsn', {}).get('term', '')
            
            results.append(MedicalResult(
                id=concept_id,
                title=item.get('term', ''),
                content=fsn,
                source=self.source_name,
                url=f"https://browser.ihtsdotools.org/?perspective=full&conceptId1={concept_id}",
                metadata={
                    'semantic_tag': self._extract_semantic_tag(fsn),
                    'active': concept.get('active', True),
                }
            ))
        
        return results
    
    # ==================== EMA ====================
    async def _search_ema(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search EMA medicines."""
        data = await self._make_request(
            'GET',
            f"{self.base_url}/medicines/search",
            params={'search_api_fulltext': query}
        )
        
        # EMA doesn't have a clean JSON API, parse HTML
        if not data:
            return []
        
        text = data.get('_text', '')
        results = []
        
        import re
        pattern = r'<a[^>]*href="([^"]*medicines/human/EPAR/[^"]*)"[^>]*>([^<]+)</a>'
        matches = re.findall(pattern, text)
        
        for url, name in matches[:max_results]:
            if query.lower() in name.lower():
                full_url = f"https://www.ema.europa.eu{url}" if not url.startswith('http') else url
                results.append(MedicalResult(
                    id=url.split('/')[-1],
                    title=name.strip(),
                    content='',
                    source=self.source_name,
                    url=full_url,
                ))
        
        return results
    
    # ==================== Orange Book ====================
    async def _search_orange_book(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search FDA Orange Book."""
        search_query = f'openfda.brand_name:"{query}" OR openfda.generic_name:"{query}"'
        
        data = await self._make_request(
            'GET',
            self.base_url,
            params={'search': search_query, 'limit': max_results}
        )
        
        if not data or 'results' not in data:
            return []
        
        results = []
        for item in data['results']:
            openfda = item.get('openfda', {})
            app_num = item.get('application_number', '')
            
            for product in item.get('products', []):
                results.append(MedicalResult(
                    id=app_num,
                    title=self._first(openfda.get('brand_name', [])),
                    content=product.get('dosage_form', ''),
                    source=self.source_name,
                    url=f"https://www.accessdata.fda.gov/scripts/cder/ob/",
                    drug_name=self._first(openfda.get('brand_name', [])),
                    generic_name=self._first(openfda.get('generic_name', [])),
                    manufacturer=item.get('sponsor_name', ''),
                    metadata={
                        'application_number': app_num,
                        'te_code': product.get('te_code', ''),
                        'route': product.get('route', ''),
                    }
                ))
        
        return results[:max_results]
    
    # ==================== FAERS ====================
    async def _search_faers(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[MedicalResult]:
        """Search FDA Adverse Events."""
        serious_only = kwargs.get('serious_only', False)
        
        search_terms = [f'patient.drug.medicinalproduct:"{query}"']
        if serious_only:
            search_terms.append('serious:1')
        
        data = await self._make_request(
            'GET',
            self.base_url,
            params={
                'search': '+AND+'.join(search_terms),
                'limit': min(max_results, 100),
            }
        )
        
        if not data or 'results' not in data:
            return []
        
        results = []
        for item in data['results']:
            patient = item.get('patient', {})
            reactions = [r.get('reactionmeddrapt', '') for r in patient.get('reaction', [])]
            
            results.append(MedicalResult(
                id=item.get('safetyreportid', ''),
                title=f"FAERS Report: {item.get('safetyreportid', '')}",
                content='; '.join(reactions[:5]),
                source=self.source_name,
                url="https://www.fda.gov/drugs/questions-and-answers-fdas-adverse-event-reporting-system-faers",
                metadata={
                    'serious': item.get('serious', '0') == '1',
                    'death': item.get('seriousnessdeath', '0') == '1',
                    'receive_date': item.get('receivedate', ''),
                    'reactions': reactions,
                }
            ))
        
        return results
    
    # ==================== Helpers ====================
    def _first(self, lst: List[str]) -> str:
        """Get first item or empty string."""
        return lst[0] if lst else ""
    
    def _extract_semantic_tag(self, fsn: str) -> str:
        """Extract semantic tag from SNOMED FSN."""
        if '(' in fsn and fsn.endswith(')'):
            return fsn[fsn.rfind('(') + 1:-1]
        return ""


# ==================== Factory Function ====================
def create_medical_tool(
    source: str,
    api_key: Optional[str] = None,
    **kwargs
) -> MedicalL5Tool:
    """
    Factory function to create medical tool.
    
    Args:
        source: Source name (e.g., 'fda_labels', 'clinical_trials')
        api_key: API key if required
        **kwargs: Additional configuration
        
    Returns:
        Configured medical tool
    
    Example:
        tool = create_medical_tool('fda_labels')
        results = await tool.search('aspirin')
    """
    try:
        source_enum = MedicalSource(source.lower())
    except ValueError:
        raise ValueError(f"Unknown medical source: {source}. Valid: {[s.value for s in MedicalSource]}")
    
    return MedicalL5Tool(source=source_enum, api_key=api_key, **kwargs)
