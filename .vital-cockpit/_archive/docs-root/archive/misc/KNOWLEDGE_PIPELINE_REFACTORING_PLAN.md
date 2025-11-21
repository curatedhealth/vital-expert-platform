# 🏗️ Knowledge Pipeline Strategic Refactoring Plan

## 🎯 Objectives

1. **Reduce Code Duplication** - Consolidate repeated logic
2. **Faster Bug Fixes** - Fix once, deploy everywhere
3. **Faster Development** - Reusable components for new features
4. **Better Test Coverage** - Test shared services once
5. **Maintainability** - Clear separation of concerns

**Note:** RAG services are excluded from this refactoring (being worked on separately)

---

## 📊 Current Architecture Analysis

### Identified Duplication Areas

#### 1. **Scraping Logic** (3+ implementations)
- `scripts/knowledge-pipeline.py` - BasicWebScraper class
- `scripts/enhanced_web_scraper.py` - EnhancedWebScraper class
- `scripts/playwright_scraper_test.py` - Test scraper
- **Issue**: SSL handling, retry logic, user-agent management duplicated

#### 2. **Metadata Processing** (2 implementations)
- `scripts/metadata_auto_calculator.py` - Quality score calculation
- `scripts/comprehensive_metadata_mapper.py` - Schema mapping
- **Issue**: Similar score calculation logic, overlapping validation

#### 3. **Domain Management** (3+ locations)
- `features/knowledge/components/knowledge-uploader.tsx` - Domain fetching
- `features/knowledge/components/domain-multi-select.tsx` - Domain creation
- `components/admin/KnowledgePipelineConfig.tsx` - Domain mapping
- **Issue**: Domain queries duplicated, no shared cache

#### 4. **File Upload Logic** (2 implementations)
- `/api/knowledge/upload` - Manual upload
- `/api/pipeline/run-single` - Pipeline upload
- **Issue**: FormData parsing, validation, processing duplicated

#### 5. **Configuration Management** (Multiple files)
- `KnowledgePipelineConfig.tsx` - Frontend config
- `knowledge-pipeline.py` - Python config parsing
- **Issue**: Validation logic duplicated, no shared schema

---

## 🏗️ Proposed Refactored Architecture

### Layer 1: Core Services (Shared Utilities)

```
services/
├── scraping/
│   ├── base_scraper.py          # Abstract base class
│   ├── http_scraper.py          # HTTP-only scraping
│   ├── browser_scraper.py       # Playwright scraping
│   └── scraper_factory.py       # Auto-select appropriate scraper
│
├── metadata/
│   ├── schema.py                # Single source of truth for schema
│   ├── validators.py            # Reusable validation functions
│   ├── calculators.py           # Score calculation (quality, credibility, etc.)
│   └── mappers.py               # Source → Schema transformation
│
├── storage/
│   ├── domain_service.py        # Domain CRUD operations
│   ├── document_service.py      # Document CRUD operations
│   └── file_service.py          # File handling utilities
│
└── processing/
    ├── chunker.py               # Text chunking logic
    ├── formatter.py             # Content formatting
    └── validator.py             # Content validation
```

### Layer 2: Pipeline Components (Orchestration)

```
pipelines/
├── base_pipeline.py             # Abstract pipeline interface
├── upload_pipeline.py           # Manual upload workflow
├── scrape_pipeline.py           # Web scraping workflow
└── search_pipeline.py           # Search & import workflow
```

### Layer 3: API Layer (HTTP Endpoints)

```
api/
├── knowledge/
│   ├── upload/route.ts          # Uses upload_pipeline
│   ├── search/route.ts          # Uses search_pipeline
│   └── domains/route.ts         # Uses domain_service
│
└── pipeline/
    ├── run/route.ts             # Uses scrape_pipeline
    └── run-single/route.ts      # Uses scrape_pipeline (single)
```

### Layer 4: UI Components (Frontend)

```
features/knowledge/
├── hooks/
│   ├── useDomains.ts            # Shared domain hook
│   ├── useUpload.ts             # Shared upload logic
│   └── useMetadata.ts           # Shared metadata logic
│
├── components/
│   ├── domain-multi-select.tsx  # Reuses useDomains
│   ├── knowledge-uploader.tsx   # Reuses useUpload
│   └── metadata-form.tsx        # Reuses useMetadata
│
└── services/
    ├── domain-api.ts            # Domain API calls
    ├── upload-api.ts            # Upload API calls
    └── pipeline-api.ts          # Pipeline API calls
```

---

## 🔧 Refactoring Steps

### Phase 1: Core Services (Python Backend)

#### Step 1.1: Create Abstract Base Scraper
**File:** `services/ai-engine/src/services/scraping/base_scraper.py`

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging

class BaseScraper(ABC):
    """Abstract base class for all scrapers"""
    
    def __init__(self, timeout: int = 60, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries
        self.logger = logging.getLogger(self.__class__.__name__)
    
    @abstractmethod
    async def scrape(self, url: str, **kwargs) -> Dict[str, Any]:
        """Scrape content from URL"""
        pass
    
    @abstractmethod
    async def __aenter__(self):
        """Setup resources"""
        pass
    
    @abstractmethod
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup resources"""
        pass
    
    def _validate_url(self, url: str) -> bool:
        """Shared URL validation"""
        # Common validation logic
        pass
    
    def _get_user_agent(self) -> str:
        """Shared user agent logic"""
        # Common user agent rotation
        pass
```

#### Step 1.2: Create Scraper Factory
**File:** `services/ai-engine/src/services/scraping/scraper_factory.py`

```python
from typing import Optional
from .base_scraper import BaseScraper
from .http_scraper import HTTPScraper
from .browser_scraper import BrowserScraper

class ScraperFactory:
    """Factory to create appropriate scraper based on URL/requirements"""
    
    @staticmethod
    def create_scraper(
        url: str,
        use_browser: Optional[bool] = None,
        **kwargs
    ) -> BaseScraper:
        """
        Auto-select scraper or use specified one
        
        Args:
            url: URL to scrape
            use_browser: Force browser usage (None = auto-detect)
            **kwargs: Additional scraper options
        
        Returns:
            Appropriate scraper instance
        """
        # Auto-detect if browser needed
        if use_browser is None:
            use_browser = ScraperFactory._needs_browser(url)
        
        if use_browser:
            return BrowserScraper(**kwargs)
        else:
            return HTTPScraper(**kwargs)
    
    @staticmethod
    def _needs_browser(url: str) -> bool:
        """Detect if URL needs browser-based scraping"""
        protected_sites = [
            'ncbi.nlm.nih.gov',
            'pmc.ncbi.nlm.nih.gov',
            'doaj.org',
            'semanticscholar.org'
        ]
        return any(site in url for site in protected_sites)
```

#### Step 1.3: Create Unified Metadata Service
**File:** `services/ai-engine/src/services/metadata/metadata_service.py`

```python
from typing import Dict, Any
from .schema import MetadataSchema
from .validators import MetadataValidator
from .calculators import ScoreCalculator
from .mappers import MetadataMapper

class MetadataService:
    """Unified metadata processing service"""
    
    def __init__(self):
        self.schema = MetadataSchema()
        self.validator = MetadataValidator()
        self.calculator = ScoreCalculator()
        self.mapper = MetadataMapper()
    
    def process(
        self,
        raw_data: Dict[str, Any],
        content: str
    ) -> Dict[str, Any]:
        """
        Complete metadata processing pipeline
        
        1. Map source data to schema
        2. Calculate quality scores
        3. Validate completeness
        4. Return enriched metadata
        """
        # Map to schema
        metadata = self.mapper.map_to_schema(raw_data)
        
        # Calculate scores
        scores = self.calculator.calculate_all_scores(metadata, content)
        metadata.update(scores)
        
        # Validate
        validation_result = self.validator.validate(metadata)
        metadata['validation'] = validation_result
        
        return metadata
```

#### Step 1.4: Create Domain Service
**File:** `services/ai-engine/src/services/storage/domain_service.py`

```python
from typing import List, Dict, Any, Optional
from supabase import Client
import logging

class DomainService:
    """Centralized domain management service"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.logger = logging.getLogger(__name__)
        self._cache: Dict[str, Any] = {}
    
    async def get_all(
        self,
        active_only: bool = True,
        use_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all domains with caching"""
        cache_key = f"domains_active_{active_only}"
        
        if use_cache and cache_key in self._cache:
            return self._cache[cache_key]
        
        query = self.supabase.table('knowledge_domains_new').select('*')
        if active_only:
            query = query.eq('is_active', True)
        
        result = query.execute()
        self._cache[cache_key] = result.data
        return result.data
    
    async def create(
        self,
        name: str,
        slug: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create new domain"""
        # Auto-generate slug if not provided
        if not slug:
            slug = name.lower().replace(' ', '-').replace('_', '-')
        
        domain_data = {
            'domain_name': name,
            'slug': slug,
            'tier': kwargs.get('tier', 1),
            'domain_scope': kwargs.get('scope', 'user'),
            'access_policy': kwargs.get('access_policy', 'personal_draft'),
            'is_active': True,
            **kwargs
        }
        
        result = self.supabase.table('knowledge_domains_new')\
            .insert(domain_data)\
            .execute()
        
        # Invalidate cache
        self._cache.clear()
        
        return result.data[0] if result.data else None
    
    async def get_by_id(self, domain_id: str) -> Optional[Dict[str, Any]]:
        """Get domain by ID with caching"""
        cache_key = f"domain_{domain_id}"
        
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        result = self.supabase.table('knowledge_domains_new')\
            .select('*')\
            .eq('domain_id', domain_id)\
            .single()\
            .execute()
        
        self._cache[cache_key] = result.data
        return result.data
    
    def clear_cache(self):
        """Clear domain cache"""
        self._cache.clear()
```

### Phase 2: Pipeline Orchestration

#### Step 2.1: Create Base Pipeline
**File:** `services/ai-engine/src/pipelines/base_pipeline.py`

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import logging

class BasePipeline(ABC):
    """Abstract base class for all pipelines"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0
        }
    
    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the pipeline"""
        pass
    
    @abstractmethod
    async def validate_input(self, **kwargs) -> bool:
        """Validate pipeline input"""
        pass
    
    def log_progress(self, message: str, **kwargs):
        """Standardized progress logging"""
        self.logger.info(f"[{self.__class__.__name__}] {message}", extra=kwargs)
    
    def get_stats(self) -> Dict[str, int]:
        """Get pipeline statistics"""
        return self.stats.copy()
```

#### Step 2.2: Create Upload Pipeline
**File:** `services/ai-engine/src/pipelines/upload_pipeline.py`

```python
from .base_pipeline import BasePipeline
from services.metadata.metadata_service import MetadataService
from services.storage.domain_service import DomainService
from services.storage.document_service import DocumentService

class UploadPipeline(BasePipeline):
    """Pipeline for manual file uploads"""
    
    def __init__(
        self,
        metadata_service: MetadataService,
        domain_service: DomainService,
        document_service: DocumentService
    ):
        super().__init__()
        self.metadata = metadata_service
        self.domains = domain_service
        self.documents = document_service
    
    async def execute(
        self,
        file_content: str,
        file_name: str,
        domain_ids: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute upload pipeline
        
        1. Validate input
        2. Process metadata
        3. Store in multiple domains
        4. Return results
        """
        # Validate
        if not await self.validate_input(
            file_content=file_content,
            domain_ids=domain_ids
        ):
            return {'success': False, 'error': 'Invalid input'}
        
        # Process metadata
        metadata = self.metadata.process(
            raw_data={'filename': file_name, **kwargs},
            content=file_content
        )
        
        # Store in all selected domains
        results = []
        for domain_id in domain_ids:
            result = await self.documents.create(
                content=file_content,
                metadata=metadata,
                domain_id=domain_id
            )
            results.append(result)
            
            if result:
                self.stats['successful'] += 1
            else:
                self.stats['failed'] += 1
        
        self.stats['processed'] += 1
        
        return {
            'success': True,
            'documents': results,
            'stats': self.get_stats()
        }
    
    async def validate_input(self, **kwargs) -> bool:
        """Validate upload input"""
        file_content = kwargs.get('file_content', '')
        domain_ids = kwargs.get('domain_ids', [])
        
        if not file_content:
            self.logger.error("Empty file content")
            return False
        
        if not domain_ids:
            self.logger.error("No domains selected")
            return False
        
        # Verify domains exist
        for domain_id in domain_ids:
            domain = await self.domains.get_by_id(domain_id)
            if not domain:
                self.logger.error(f"Domain not found: {domain_id}")
                return False
        
        return True
```

### Phase 3: Frontend Refactoring

#### Step 3.1: Create Shared Hooks
**File:** `apps/digital-health-startup/src/features/knowledge/hooks/useDomains.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@vital/sdk/client';

interface Domain {
  domain_id: string;
  domain_name: string;
  slug: string;
  tier?: number;
  // ... other fields
}

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  
  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_domains_new')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('priority', { ascending: true });
      
      if (error) throw error;
      setDomains(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  const createDomain = useCallback(async (
    name: string,
    options?: Partial<Domain>
  ) => {
    try {
      const slug = options?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data, error } = await supabase
        .from('knowledge_domains_new')
        .insert({
          domain_name: name,
          slug,
          tier: options?.tier || 1,
          domain_scope: 'user',
          access_policy: 'personal_draft',
          is_active: true,
          ...options
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh domains
      await fetchDomains();
      
      return data;
    } catch (err) {
      throw err;
    }
  }, [supabase, fetchDomains]);
  
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);
  
  return {
    domains,
    loading,
    error,
    refetch: fetchDomains,
    createDomain
  };
}
```

#### Step 3.2: Create Upload Hook
**File:** `apps/digital-health-startup/src/features/knowledge/hooks/useUpload.ts`

```typescript
import { useState, useCallback } from 'react';

interface UploadOptions {
  domains: string[];
  isGlobal: boolean;
  embeddingModel: string;
  selectedAgents?: string[];
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('domains', JSON.stringify(options.domains));
      formData.append('isGlobal', options.isGlobal.toString());
      formData.append('embeddingModel', options.embeddingModel);
      
      if (options.selectedAgents) {
        formData.append('selectedAgents', JSON.stringify(options.selectedAgents));
      }
      
      setProgress(25);
      
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(75);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      setProgress(100);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);
  
  return {
    uploadFile,
    uploading,
    progress,
    error
  };
}
```

---

## 📈 Expected Benefits

### Metrics

| Metric | Before | After (Estimated) | Improvement |
|--------|--------|-------------------|-------------|
| Lines of Code | ~3,500 | ~2,000 | **-43%** |
| Duplicate Logic | ~40% | ~5% | **-88%** |
| Test Coverage | ~20% | ~80% | **+300%** |
| Bug Fix Time | 2-3 days | < 1 day | **-66%** |
| New Feature Time | 1-2 weeks | 2-3 days | **-75%** |

### Code Quality

- ✅ **Single Source of Truth**: Metadata schema in one place
- ✅ **DRY Principle**: No duplicated scraping/validation logic
- ✅ **Testability**: Each service testable in isolation
- ✅ **Maintainability**: Clear boundaries and responsibilities
- ✅ **Extensibility**: Easy to add new pipelines/scrapers

### Developer Experience

- ✅ **Faster Onboarding**: Clear architecture, well-documented
- ✅ **Easier Debugging**: Centralized logging, clear data flow
- ✅ **Confident Changes**: Tests prevent regressions
- ✅ **Reusable Components**: Import and use shared services

---

## 🚀 Implementation Plan

### Week 1: Core Services (Python)
- [ ] Create scraping services
- [ ] Create metadata services  
- [ ] Create storage services
- [ ] Write unit tests

### Week 2: Pipeline Orchestration
- [ ] Create base pipeline
- [ ] Refactor upload pipeline
- [ ] Refactor scrape pipeline
- [ ] Integration tests

### Week 3: Frontend Refactoring
- [ ] Create shared hooks
- [ ] Refactor components to use hooks
- [ ] Update API routes
- [ ] E2E tests

### Week 4: Migration & Testing
- [ ] Migrate existing code
- [ ] Update documentation
- [ ] Performance testing
- [ ] Deploy to production

---

## 🎯 Success Criteria

- ✅ All existing features work as before
- ✅ 80%+ test coverage
- ✅ 40%+ reduction in code duplication
- ✅ All pipelines use shared services
- ✅ Documentation updated
- ✅ No RAG service changes (per requirement)

---

## 📝 Notes

- **RAG Services**: Excluded from refactoring (being worked on separately)
- **Backward Compatibility**: Maintain existing API contracts
- **Incremental Migration**: Refactor one component at a time
- **Feature Freeze**: No new features during refactoring

---

**Status**: Ready for implementation  
**Priority**: High  
**Risk**: Low (incremental approach)

