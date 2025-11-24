# Personas UI Components Documentation

**Version**: 1.0.0  
**Date**: 2025-11-19  
**Status**: Production Ready

---

## 🎯 Overview

This document describes the reusable UI components for displaying and managing personas in the VITAL platform. These components are designed to be modular, reusable, and consistent across different views in the application.

---

## 📁 Component Structure

```
apps/vital-system/src/components/personas/
├── types.ts                    # Shared TypeScript types
├── PersonaCard.tsx            # Card component for grid view
├── PersonaListItem.tsx        # List item component for list view
├── PersonaStatsCards.tsx      # Statistics cards component
├── PersonaFilters.tsx         # Filtering component
└── index.ts                    # Barrel exports
```

---

## 🔧 Components

### 1. PersonaCard

**File**: `PersonaCard.tsx`  
**Purpose**: Displays a persona in a card format, suitable for grid layouts

**Props**:
```typescript
interface PersonaCardProps {
  persona: Persona;
  compact?: boolean;  // Optional: compact mode for smaller displays
  onClick?: (persona: Persona) => void;  // Optional: click handler
}
```

**Features**:
- Displays persona name, title, and tagline
- Shows organizational badges (role, department, function, seniority)
- Displays key information (years of experience, team size, geographic scope, salary)
- Shows key responsibilities count
- Displays tags (up to 3 visible, with overflow indicator)
- Supports compact mode for smaller displays
- Fully responsive design

**Usage**:
```tsx
import { PersonaCard } from '@/components/personas';

<PersonaCard 
  persona={persona} 
  compact={false}
  onClick={(p) => handlePersonaClick(p)}
/>
```

---

### 2. PersonaListItem

**File**: `PersonaListItem.tsx`  
**Purpose**: Displays a persona in a list item format, suitable for list views

**Props**:
```typescript
interface PersonaListItemProps {
  persona: Persona;
  onClick?: (persona: Persona) => void;  // Optional: click handler
}
```

**Features**:
- Horizontal layout optimized for list views
- Shows persona name, title, and tagline/one-liner
- Displays seniority badge inline
- Shows years of experience, function, and department
- Displays role and department badges on the right
- Truncates long text appropriately
- Fully responsive design

**Usage**:
```tsx
import { PersonaListItem } from '@/components/personas';

<PersonaListItem 
  persona={persona} 
  onClick={(p) => handlePersonaClick(p)}
/>
```

---

### 3. PersonaStatsCards

**File**: `PersonaStatsCards.tsx`  
**Purpose**: Displays statistics about personas in card format

**Props**:
```typescript
interface PersonaStatsCardsProps {
  stats: PersonaStats;
}
```

**Stats Structure**:
```typescript
interface PersonaStats {
  total: number;                    // Total number of personas
  byRole: Record<string, number>;   // Count by role slug
  byDepartment: Record<string, number>;  // Count by department slug
  byFunction: Record<string, number>;    // Count by function slug
  bySeniority: Record<string, number>;   // Count by seniority level
}
```

**Features**:
- Displays 5 stat cards:
  1. Total Personas
  2. Roles (count of unique roles)
  3. Departments (count of unique departments)
  4. Functions (count of unique functions)
  5. Seniority Levels (count of unique seniority levels)
- Color-coded cards for visual distinction
- Responsive grid layout (1 column mobile, 2 columns tablet, 5 columns desktop)

**Usage**:
```tsx
import { PersonaStatsCards } from '@/components/personas';

const stats = {
  total: 100,
  byRole: { 'medical-director': 15, 'clinical-researcher': 20 },
  byDepartment: { 'medical-affairs': 30, 'clinical-ops': 25 },
  byFunction: { 'medical': 35, 'commercial': 20 },
  bySeniority: { 'senior': 40, 'executive': 10 }
};

<PersonaStatsCards stats={stats} />
```

---

### 4. PersonaFilters

**File**: `PersonaFilters.tsx`  
**Purpose**: Provides filtering and search functionality for personas

**Props**:
```typescript
interface PersonaFiltersProps {
  filters: PersonaFiltersType;
  onFiltersChange: (filters: PersonaFiltersType) => void;
  personas: Persona[];  // All personas (for generating filter options)
  filteredCount: number;  // Number of personas after filtering
  totalCount: number;    // Total number of personas
}
```

**Filters Structure**:
```typescript
interface PersonaFiltersType {
  searchQuery: string;        // Text search query
  selectedRole: string;       // Selected role slug or 'all'
  selectedDepartment: string; // Selected department slug or 'all'
  selectedFunction: string;   // Selected function slug or 'all'
  selectedSeniority: string;  // Selected seniority level or 'all'
}
```

**Features**:
- Text search across multiple fields (name, title, tagline, role, function, tags)
- Dropdown filters for:
  - Role
  - Department
  - Function
  - Seniority Level
- Auto-generates filter options from persona data
- Reset filters button
- Shows filtered count vs total count
- Fully responsive design

**Usage**:
```tsx
import { PersonaFilters } from '@/components/personas';

const [filters, setFilters] = useState({
  searchQuery: '',
  selectedRole: 'all',
  selectedDepartment: 'all',
  selectedFunction: 'all',
  selectedSeniority: 'all',
});

<PersonaFilters
  filters={filters}
  onFiltersChange={setFilters}
  personas={allPersonas}
  filteredCount={filteredPersonas.length}
  totalCount={allPersonas.length}
/>
```

---

## 📊 Types

### Persona Interface

The complete `Persona` interface includes all fields from the database schema:

```typescript
interface Persona {
  // Core Identity
  id: string;
  slug: string;
  name: string;
  title?: string;
  tagline?: string;
  one_liner?: string;
  
  // Classification
  archetype?: string;
  persona_type?: string;
  persona_number?: number;
  section?: string;
  segment?: string;
  
  // Organization Context
  organization_type?: string;
  typical_organization_size?: string;
  seniority_level?: string;
  
  // Organizational Links
  department_id?: string;
  department_slug?: string;
  function_id?: string;
  function_slug?: string;
  role_id?: string;
  role_slug?: string;
  
  // Experience & Seniority
  years_of_experience?: number;
  years_in_function?: number;
  years_in_industry?: number;
  years_in_current_role?: number;
  education_level?: string;
  
  // Responsibilities & Scope
  budget_authority?: string;
  key_responsibilities?: string[];
  geographic_scope?: string;
  team_size?: string;
  team_size_typical?: number;
  direct_reports?: number;
  reporting_to?: string;
  span_of_control?: string;
  
  // Work Style & Preferences
  technology_adoption?: string;
  risk_tolerance?: string;
  decision_making_style?: string;
  learning_style?: string;
  work_style?: string;
  work_style_preference?: string;
  work_arrangement?: string;
  location_type?: string;
  
  // Compensation
  salary_min_usd?: number;
  salary_median_usd?: number;
  salary_max_usd?: number;
  
  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## 🎨 Design Patterns

### Component Composition

All components follow a consistent design pattern:
- Use shadcn/ui components for base UI elements
- Support dark mode via Tailwind classes
- Responsive design with mobile-first approach
- Accessible with proper ARIA labels and semantic HTML

### State Management

The components are designed to be controlled components:
- Parent components manage state
- Components receive props and callbacks
- No internal state management (except for UI interactions)

### Filtering Logic

Filtering is implemented using `useMemo` for performance:
```typescript
const filteredPersonas = useMemo(() => {
  let filtered = [...personas];
  
  // Apply filters sequentially
  if (filters.searchQuery) { /* search logic */ }
  if (filters.selectedRole !== 'all') { /* role filter */ }
  // ... other filters
  
  return filtered;
}, [personas, filters]);
```

---

## 📱 Usage Examples

### Complete Personas Page

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  PersonaFilters,
  type Persona,
  type PersonaStats,
  type PersonaFiltersType,
} from '@/components/personas';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filters, setFilters] = useState<PersonaFiltersType>({
    searchQuery: '',
    selectedRole: 'all',
    selectedDepartment: 'all',
    selectedFunction: 'all',
    selectedSeniority: 'all',
  });
  const [stats, setStats] = useState<PersonaStats>({
    total: 0,
    byRole: {},
    byDepartment: {},
    byFunction: {},
    bySeniority: {},
  });

  // Memoized filtering
  const filteredPersonas = useMemo(() => {
    // Filtering logic
  }, [personas, filters]);

  return (
    <div>
      <PersonaStatsCards stats={stats} />
      <PersonaFilters
        filters={filters}
        onFiltersChange={setFilters}
        personas={personas}
        filteredCount={filteredPersonas.length}
        totalCount={stats.total}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonas.map((persona) => (
          <PersonaCard key={persona.id} persona={persona} />
        ))}
      </div>
    </div>
  );
}
```

### Using in Different Views

#### Admin Dashboard
```tsx
import { PersonaCard, PersonaStatsCards } from '@/components/personas';

// Show compact cards in admin view
<PersonaCard persona={persona} compact />
```

#### Search Results
```tsx
import { PersonaListItem } from '@/components/personas';

// Show list items in search results
{results.map(persona => (
  <PersonaListItem key={persona.id} persona={persona} />
))}
```

#### Analytics Dashboard
```tsx
import { PersonaStatsCards } from '@/components/personas';

// Show stats in analytics view
<PersonaStatsCards stats={analyticsStats} />
```

---

## 🔄 Integration with API

The components work with the `/api/personas` endpoint which returns:

```typescript
{
  success: true;
  personas: Persona[];
  count: number;
  limit: number;
  offset: number;
}
```

The API endpoint supports:
- Tenant filtering (automatic via auth)
- Pagination (`limit`, `offset`)
- Admin view all (`showAll=true`)

---

## ✅ Best Practices

1. **Always use memoization for filtering**: Use `useMemo` to avoid unnecessary re-renders
2. **Calculate stats from full dataset**: Stats should be calculated from all personas, not filtered ones
3. **Handle loading states**: Show loading indicators while fetching data
4. **Handle empty states**: Display appropriate messages when no personas match filters
5. **Accessibility**: Ensure all interactive elements are keyboard accessible
6. **Performance**: Use `compact` mode for large lists to improve performance

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Persona detail modal/drawer
- [ ] Export functionality (CSV, PDF)
- [ ] Bulk actions (select multiple personas)
- [ ] Advanced filtering (date ranges, salary ranges)
- [ ] Sorting options (by name, seniority, experience)
- [ ] Persona comparison view
- [ ] Persona analytics charts
- [ ] Persona templates/duplication

---

## 📝 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-11-19 | Initial component extraction and documentation | VITAL Platform Team |

---

## 🔗 Related Documentation

- [Persona Schema Reference](../strategy-docs/COMPLETE_PERSONA_SCHEMA_REFERENCE.md)
- [Persona Seeding Guide](./PERSONA_SEEDING_COMPLETE_GUIDE.md)
- [API Endpoints](../../09-api/DATA_VIEW_ENDPOINTS.md)

---

**Status**: ✅ PRODUCTION READY  
**Maintained By**: VITAL Platform Frontend Team

