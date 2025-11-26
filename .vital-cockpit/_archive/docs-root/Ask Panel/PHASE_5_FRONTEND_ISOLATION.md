# 🎨 Phase 5: Frontend Multi-Tenant Isolation
## Complete Implementation Guide - Dedicated Frontends & Branding

**Duration**: 5-7 days  
**Complexity**: Medium  
**Prerequisites**: Phase 4 complete (API layer)  
**Next Phase**: Phase 6 - Testing & Deployment

---

## 📋 Overview

Phase 5 implements dedicated frontend applications for each tenant with custom branding, theming, and complete data isolation. Each tenant gets their own Next.js application deployment.

### What You'll Build

```
┌─────────────────────────────────────────────────────────┐
│              MULTI-TENANT FRONTEND ARCHITECTURE         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tenant A               Tenant B               Tenant C│
│  ┌──────────┐          ┌──────────┐          ┌───────┐│
│  │ Next.js  │          │ Next.js  │          │Next.js││
│  │ App      │          │ App      │          │ App   ││
│  │          │          │          │          │       ││
│  │ Custom   │          │ Custom   │          │Custom ││
│  │ Branding │          │ Branding │          │Brand  ││
│  └────┬─────┘          └────┬─────┘          └───┬───┘│
│       │                     │                    │    │
│       └─────────────────────┴────────────────────┘    │
│                             ↓                         │
│                   ┌─────────────────┐                 │
│                   │  Shared Backend │                 │
│                   │  (Phase 4 API)  │                 │
│                   └─────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

### Phase 5 Components

**5.1** - Tenant Configuration System  
**5.2** - Tenant-Specific Next.js Apps  
**5.3** - API Client with X-Tenant-ID Injection  
**5.4** - Real-time Panel Streaming UI  
**5.5** - Custom Branding & Theming  

---

## PROMPT 5.1: Tenant Configuration System

```
TASK: Create tenant configuration management system

CONTEXT:
Each tenant needs custom configuration:
- Branding (logo, colors, fonts)
- Feature flags
- Usage limits
- Custom domain

LOCATION: apps/tenant-config/

CREATE FILES:

1. src/types/tenant-config.ts

```typescript
/**
 * Tenant Configuration Types
 */

export interface TenantBranding {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface TenantFeatures {
  structuredPanels: boolean;
  openPanels: boolean;
  socraticPanels: boolean;
  adversarialPanels: boolean;
  delphiPanels: boolean;
  hybridPanels: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  customAgents: boolean;
}

export interface TenantLimits {
  maxPanelsPerMonth: number;
  maxExpertsPerPanel: number;
  maxConcurrentPanels: number;
  maxTokensPerPanel: number;
}

export interface TenantConfig {
  tenantId: string;
  name: string;
  domain: string;
  branding: TenantBranding;
  features: TenantFeatures;
  limits: TenantLimits;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CONFIG: Omit<TenantConfig, 'tenantId' | 'name' | 'domain' | 'createdAt' | 'updatedAt'> = {
  branding: {
    logo: '/default-logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#0070f3',
    secondaryColor: '#1a1a1a',
    accentColor: '#ff4081',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  features: {
    structuredPanels: true,
    openPanels: true,
    socraticPanels: true,
    adversarialPanels: false,
    delphiPanels: false,
    hybridPanels: false,
    advancedAnalytics: false,
    apiAccess: false,
    customAgents: false
  },
  limits: {
    maxPanelsPerMonth: 100,
    maxExpertsPerPanel: 5,
    maxConcurrentPanels: 3,
    maxTokensPerPanel: 50000
  }
};
```

2. src/lib/tenant-config.ts

```typescript
/**
 * Tenant Configuration Loader
 */

import { TenantConfig, DEFAULT_CONFIG } from '../types/tenant-config';

// In production, load from database or environment
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  '11111111-1111-1111-1111-111111111111': {
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Acme Healthcare',
    domain: 'acme.vitalplatform.ai',
    branding: {
      logo: '/acme-logo.png',
      favicon: '/acme-favicon.ico',
      primaryColor: '#0052cc',
      secondaryColor: '#172b4d',
      accentColor: '#ff5630',
      fontFamily: 'Roboto, sans-serif'
    },
    features: {
      ...DEFAULT_CONFIG.features,
      adversarialPanels: true,
      delphiPanels: true
    },
    limits: {
      ...DEFAULT_CONFIG.limits,
      maxPanelsPerMonth: 500,
      maxExpertsPerPanel: 8
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export async function getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
  // In production, fetch from database
  return TENANT_CONFIGS[tenantId] || null;
}

export function getTenantIdFromDomain(domain: string): string | null {
  // Match domain to tenant ID
  // In production, query database
  for (const config of Object.values(TENANT_CONFIGS)) {
    if (config.domain === domain) {
      return config.tenantId;
    }
  }
  return null;
}
```

Implement tenant configuration system with branding and features.
```

---

## PROMPT 5.2: Tenant-Specific Next.js App

```
TASK: Create Next.js application with tenant isolation

CONTEXT:
Each tenant gets dedicated Next.js app with:
- Tenant ID injected in all API calls
- Custom branding applied
- Feature flags enforced

LOCATION: apps/tenant-app/

CREATE FILES:

1. src/app/layout.tsx

```typescript
/**
 * Root Layout with Tenant Theming
 */

import { getTenantConfig, getTenantIdFromDomain } from '@/lib/tenant-config';
import { TenantProvider } from '@/components/providers/tenant-provider';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get tenant ID from domain/environment
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 
                   getTenantIdFromDomain(process.env.VERCEL_URL || '');
  
  if (!tenantId) {
    throw new Error('Tenant ID not configured');
  }
  
  // Load tenant config
  const config = await getTenantConfig(tenantId);
  
  if (!config) {
    throw new Error(`Tenant config not found: ${tenantId}`);
  }
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={config.branding.favicon} />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary-color: ${config.branding.primaryColor};
              --secondary-color: ${config.branding.secondaryColor};
              --accent-color: ${config.branding.accentColor};
              --font-family: ${config.branding.fontFamily};
            }
            body {
              font-family: var(--font-family);
            }
            ${config.branding.customCSS || ''}
          `
        }} />
      </head>
      <body>
        <TenantProvider config={config}>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
```

2. src/components/providers/tenant-provider.tsx

```typescript
/**
 * Tenant Context Provider
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { TenantConfig } from '@/types/tenant-config';

interface TenantContextValue {
  config: TenantConfig;
  tenantId: string;
  hasFeature: (feature: keyof TenantConfig['features']) => boolean;
  withinLimit: (limit: keyof TenantConfig['limits'], current: number) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  config,
  children
}: {
  config: TenantConfig;
  children: ReactNode;
}) {
  const value: TenantContextValue = {
    config,
    tenantId: config.tenantId,
    hasFeature: (feature) => config.features[feature],
    withinLimit: (limit, current) => current < config.limits[limit]
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
```

3. src/lib/api-client.ts

```typescript
/**
 * API Client with Tenant ID Injection
 */

import { useTenant } from '@/components/providers/tenant-provider';

export class APIClient {
  private baseURL: string;
  private tenantId: string;
  
  constructor(baseURL: string, tenantId: string) {
    this.baseURL = baseURL;
    this.tenantId = tenantId;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async createPanel(data: CreatePanelRequest): Promise<PanelResponse> {
    return this.request<PanelResponse>('/api/v1/panels', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async getPanel(panelId: string): Promise<PanelResponse> {
    return this.request<PanelResponse>(`/api/v1/panels/${panelId}`);
  }
  
  async listPanels(params?: ListPanelsParams): Promise<PanelListResponse> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PanelListResponse>(`/api/v1/panels?${query}`);
  }
  
  streamPanel(panelId: string): EventSource {
    const url = `${this.baseURL}/api/v1/panels/${panelId}/stream`;
    const eventSource = new EventSource(url, {
      withCredentials: true
    });
    
    // Add tenant header via custom implementation
    // Note: EventSource doesn't support custom headers directly
    // In production, include tenant ID in URL or use WebSocket
    
    return eventSource;
  }
}

export function useAPIClient() {
  const { tenantId } = useTenant();
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return new APIClient(baseURL, tenantId);
}
```

Implement Next.js app with tenant isolation and API client.
```

---

## PROMPT 5.3: Real-time Panel Streaming UI

```
TASK: Create React component for real-time panel streaming

CONTEXT:
Display panel discussion as it happens using SSE.
Show experts speaking, consensus building, final recommendation.

LOCATION: apps/tenant-app/src/components/

CREATE FILE: panel-stream.tsx

```typescript
/**
 * Panel Stream Component - Real-time discussion viewer
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAPIClient } from '@/lib/api-client';

interface Message {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string;
  round: number;
}

interface ConsensusUpdate {
  level: number;
  confidence: number;
}

interface PanelStreamProps {
  panelId: string;
  onComplete?: (recommendation: string) => void;
}

export function PanelStream({ panelId, onComplete }: PanelStreamProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [consensus, setConsensus] = useState<ConsensusUpdate | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = useAPIClient();
  
  useEffect(() => {
    const eventSource = apiClient.streamPanel(panelId);
    
    eventSource.addEventListener('expert_speaking', (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    });
    
    eventSource.addEventListener('consensus_update', (event) => {
      const data = JSON.parse(event.data);
      setConsensus(data);
    });
    
    eventSource.addEventListener('panel_complete', (event) => {
      const data = JSON.parse(event.data);
      setRecommendation(data.recommendation);
      setIsComplete(true);
      onComplete?.(data.recommendation);
      eventSource.close();
    });
    
    eventSource.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      setError(data.message);
      eventSource.close();
    });
    
    return () => eventSource.close();
  }, [panelId]);
  
  return (
    <div className="panel-stream">
      {/* Consensus Meter */}
      {consensus && (
        <div className="consensus-meter">
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{ width: `${consensus.level * 100}%` }}
            />
          </div>
          <span>Consensus: {Math.round(consensus.level * 100)}%</span>
        </div>
      )}
      
      {/* Discussion Messages */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            <div className="message-header">
              <strong>{msg.agentName}</strong>
              <span className="round-badge">Round {msg.round}</span>
            </div>
            <p className="message-content">{msg.content}</p>
            <time className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </time>
          </div>
        ))}
      </div>
      
      {/* Final Recommendation */}
      {isComplete && (
        <div className="recommendation">
          <h3>Final Recommendation</h3>
          <p>{recommendation}</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
```

Implement real-time streaming UI with SSE integration.
```

---

## ✅ Phase 5 Checklist

**Tenant Configuration** (5.1):
- [ ] Configuration types defined
- [ ] Configuration loader
- [ ] Domain-to-tenant mapping
- [ ] Feature flags system

**Next.js App** (5.2):
- [ ] Root layout with theming
- [ ] Tenant provider
- [ ] API client with X-Tenant-ID
- [ ] Environment configuration

**Streaming UI** (5.3):
- [ ] Real-time message display
- [ ] Consensus meter
- [ ] Expert avatars
- [ ] Recommendation display

**Branding** (5.4):
- [ ] Custom CSS injection
- [ ] Logo and favicon
- [ ] Color scheme
- [ ] Font family

---

## 🧪 Validation

```bash
# Build tenant app
cd apps/tenant-app
npm run build

# Run development
npm run dev

# Visit in browser
open http://localhost:3000

# Test with different tenant IDs
NEXT_PUBLIC_TENANT_ID=11111111-1111-1111-1111-111111111111 npm run dev
```

---

**Phase 5 Complete** ✅ | **Next**: Phase 6 - Testing & Deployment
