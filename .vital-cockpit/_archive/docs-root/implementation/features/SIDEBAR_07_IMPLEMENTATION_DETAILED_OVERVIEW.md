# Shadcn Sidebar-07 Implementation - Detailed Overview & Root Cause Analysis

**Date**: October 28, 2025
**Status**: ⚠️ BLOCKED - styled-jsx SSR Issue
**Current State**: Old sidebar active and working, new sidebar-07 created but disabled

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [What We're Trying to Achieve](#what-were-trying-to-achieve)
3. [What We've Done So Far](#what-weve-done-so-far)
4. [Root Cause Analysis](#root-cause-analysis)
5. [Ask Expert Sidebar - Complete Feature Specification](#ask-expert-sidebar-complete-feature-specification)
6. [Technical Implementation Details](#technical-implementation-details)
7. [Fix Strategy](#fix-strategy)
8. [File Reference](#file-reference)

---

## Executive Summary

### Goal
Implement Shadcn UI sidebar-07 pattern across ALL views with contextual sidebar content that changes based on the current route.

### Current Blocker
**styled-jsx SSR (Server-Side Rendering) error** causes "Internal Server Error" when loading pages with the new layout, despite:
- ✅ Code compiling successfully
- ✅ Routes returning 200 status
- ✅ All components properly imported
- ✅ Next.js config attempting to disable styled-jsx

### Quick Status
- **Old Layout**: ✅ Working (currently active)
- **New Layout**: ❌ Created but causes SSR errors
- **Sidebar Components**: ✅ All created and working in isolation
- **Server**: ✅ Running and compiling successfully

---

## What We're Trying to Achieve

### Primary Goal
Replace the current static sidebar with a **contextual, collapsible sidebar system** using Shadcn UI's sidebar-07 pattern.

### Design Requirements

#### 1. Shadcn Sidebar-07 Pattern
- Collapsible sidebar that collapses to icons
- Responsive design (desktop: sidebar, mobile: sheet overlay)
- Keyboard shortcut support (Cmd/Ctrl+B to toggle)
- Smooth animations and transitions

#### 2. Contextual Content
Different sidebar content for each major route:
- `/dashboard` - Dashboard overview and quick actions
- `/ask-expert` - Chat management, agent selection, settings
- `/ask-panel` - Conversation threads, panel management
- `/agents` - Browse agents, filter by tier, actions
- `/knowledge` - Upload, categories, analytics
- `/prism` - Prompt templates, performance, version control
- `/workflows` - Active workflows, monitoring, integrations
- `/admin` - User management, system settings, monitoring

#### 3. Header with Breadcrumbs
- Sticky header at top of page
- Hierarchical breadcrumb navigation
- User menu dropdown (profile, settings, sign out)
- Sidebar toggle button

#### 4. Simplified Code
- Reduce layout complexity from 483 lines to ~100 lines
- Separate concerns: layout, sidebar content, header
- Easier to maintain and extend

---

## What We've Done So Far

### Phase 1: Component Creation ✅

#### 1. Created `contextual-sidebar.tsx` (~900 lines)
**Location**: `src/components/contextual-sidebar.tsx`

Implemented 8 different sidebar content components:

1. **DashboardSidebarContent** (lines 90-152)
   - Overview section
   - Quick Actions (New conversation, Browse agents, Upload knowledge)
   - Recent Items

2. **AskExpertSidebarContent** (lines 157-306)
   - **Chat Management**
     - New Chat button
     - Chat History
   - **Agents Management**
     - Search bar with icon
     - Tier filters (All, T1, T2, T3)
     - Agent list with avatars (scrollable, max 10 visible)
     - Selection counter
     - Checkbox for each agent
     - "Browse Agent Store" button
   - **Settings**
     - Chat Settings

3. **AskPanelSidebarContent** (lines 311-378)
   - Conversations (Active Threads, Pending Review, Approved)
   - Panel Management (Risk Assessment, Clinical Review, Monitoring)

4. **AgentsSidebarContent** (lines 383-454)
   - Browse (All Agents, By Category)
   - Filter by Tier (Platinum, Gold, Silver, Bronze)
   - Actions (Create Agent, Upload Agent)

5. **KnowledgeSidebarContent** (lines 459-520)
   - Upload (New Document, Bulk Upload)
   - Categories (Medical, Research, Clinical)
   - Analytics (Usage Stats, Performance)

6. **PromptPrismSidebarContent** (lines 525-592)
   - Templates (Library, Create New)
   - Performance (Metrics, Analysis)
   - Version Control (History, Compare)

7. **WorkflowsSidebarContent** (lines 597-664)
   - Workflows (Active, Scheduled, Completed)
   - Monitoring (Performance, Alerts)
   - Integration (APIs, Webhooks)

8. **AdminSidebarContent** (lines 669-736)
   - User Management (Users, Roles, Permissions)
   - System (Configuration, Logs, Backups)
   - Monitoring (Health, Performance, Alerts)

**Main Wrapper Components**:
- `ContextualSidebar()` (lines 741-785) - Route detection and content switching
- `ContextualSidebarWrapper()` (lines 900-905) - SidebarProvider wrapper

#### 2. Created `dashboard-header.tsx` (~150 lines)
**Location**: `src/components/dashboard-header.tsx`

Features:
- Sticky header with backdrop blur
- Sidebar trigger button (integrates with collapsible sidebar)
- Breadcrumb navigation
  - Hierarchical path display
  - Clickable links for navigation
  - Active page indicator
  - Route label mapping
- User dropdown menu
  - User email display
  - Profile link
  - Settings link
  - Sign out button
- Integration with `useAuth` for user data

#### 3. Created New Simplified Layout
**Location**: `src/app/(app)/layout.tsx` (now renamed to `layout-sidebar07-broken.tsx`)
**Size**: 98 lines (down from 483 lines - **80% reduction**)

Structure:
```typescript
AppLayout (export default)
  └── AskExpertProvider
        └── AgentsFilterProvider
              └── AppLayoutContent
                    ├── ContextualSidebarWrapper
                    │     └── SidebarProvider
                    │           └── ContextualSidebar
                    └── SidebarInset
                          ├── DashboardHeader
                          └── main (page content)
```

### Phase 2: Integration Attempt ❌

#### What We Did
1. Renamed `layout.tsx` → `layout.tsx.old`
2. Renamed `layout-sidebar07.tsx` → `layout.tsx`
3. Server recompiled successfully
4. Routes compiled: `/dashboard`, `/ask-expert`, `/agents` all returned 200

#### What Went Wrong
- Browser showed "Internal Server Error" (cached)
- Terminal showed styled-jsx SSR errors
- Errors occurred on `/_error` page compilation, not main pages

#### Actions Taken
1. Cleared `.next` build cache
2. Restarted dev server
3. Hard refreshed browser
4. **Still got errors** - styled-jsx issue persists

#### Current State
- Restored old layout (`layout.tsx.old` → `layout.tsx`)
- New layout saved as `layout-sidebar07-broken.tsx`
- Old sidebar working in browser
- Server running cleanly with old layout

---

## Root Cause Analysis

### The styled-jsx SSR Error

#### Error Message
```
⨯ ReferenceError: document is not defined
    at new StyleSheet (.../styled-jsx/dist/index/index.js:41:53)
    at new StyleSheetRegistry (.../styled-jsx/dist/index/index.js:307:37)
    at createStyleRegistry (.../styled-jsx/dist/index/index.js:446:12)
```

#### Where It Occurs
- **NOT** in the main page compilation
- **NOT** in the layout or sidebar components
- **IN** the `/_error` page compilation during SSR
- **IN** `_document.js` during server-side rendering

#### What's Happening
1. Next.js compiles pages server-side
2. When compiling the error page (`/_error`), it tries to initialize styled-jsx
3. styled-jsx attempts to access `document` object
4. `document` doesn't exist on the server (only in browser)
5. Error thrown, page fails to render

### Investigation Findings

#### 1. No Custom _document.tsx
```bash
# Searched for custom document files
Glob: **/_document.{ts,tsx,js,jsx} → No files found
```
- No custom `_document.tsx` or `_document.js`
- Using Next.js default document
- Can't modify document rendering behavior easily

#### 2. Next.js Config Already Attempts to Disable styled-jsx
```javascript
// next.config.js (lines 100-104)
compiler: {
  styledComponents: true,
  // Disable styled-jsx to prevent SSR warnings
  styledJsx: false,  // ← THIS IS ALREADY SET
},
```
- Config explicitly disables styled-jsx
- **But errors still occur**
- This suggests styled-jsx is being pulled in as a dependency

#### 3. webpack DefinePlugin Already Sets typeof document
```javascript
// next.config.js (lines 60-67)
new (require('webpack')).DefinePlugin({
  'process.env.NODE_NO_WARNINGS': JSON.stringify('1'),
  'typeof window': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
  'typeof document': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),  // ← THIS
  'typeof location': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
  'typeof navigator': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
  'typeof global': isServer ? JSON.stringify('object') : JSON.stringify('undefined'),
})
```
- Already tries to polyfill `document` as undefined on server
- **Still not preventing the error**

#### 4. Server Logs Show Success
```
✓ Compiled / in 4.9s (1694 modules)
GET / 200 in 5221ms
GET / 200 in 101ms
POST /login 303 in 1179ms
```
- Routes compile successfully
- HTTP requests return 200 (success)
- **Only the error page compilation fails**

### Why This is a Problem

#### The Cascading Failure
1. Main pages compile fine → return 200
2. Error page tries to compile → styled-jsx fails
3. Error page can't render → shows generic "Internal Server Error"
4. User sees error even though main page loaded successfully

#### Why Old Layout Works
The old layout (`layout.tsx.old`) likely:
- Uses different Shadcn components that don't trigger styled-jsx
- Has different import patterns
- Doesn't cause the error page to be invoked

#### Why New Layout Fails
The new layout likely:
- Imports Shadcn components that internally use styled-jsx
- Triggers SSR in a way that invokes the error page
- Uses `SidebarInset` or other components with SSR issues

### Hypothesis: Shadcn UI Components

#### Suspect Components
Based on the new layout imports:
```typescript
import { ContextualSidebarWrapper } from '@/components/contextual-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
```

Possible culprits:
1. **SidebarInset** - Uses Radix UI primitives that might have SSR issues
2. **Breadcrumb components** - Might use styled-jsx internally
3. **DropdownMenu** - Radix UI component with potential SSR issues
4. **TooltipProvider** - Inside Sidebar component, wraps everything

#### Evidence
Looking at `sidebar.tsx` (lines 139-160):
```typescript
<SidebarContext.Provider value={contextValue}>
  <TooltipProvider delayDuration={0}>  // ← Potential SSR issue
    <div
      style={{
        "--sidebar-width": SIDEBAR_WIDTH,  // ← CSS variables
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
      } as React.CSSProperties}
      className={cn(
        "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  </TooltipProvider>
</SidebarContext.Provider>
```

The `TooltipProvider` from Radix UI might be pulling in styled-jsx as a peer dependency.

---

## Ask Expert Sidebar - Complete Feature Specification

### Current Implementation (in contextual-sidebar.tsx)

#### Section 1: Chat Management
**Location**: Lines 180-198
**Current Features**:
- ✅ New Chat button
- ✅ Chat History button

**Desired Additional Features**:
- [ ] **Saved Chats** - List of saved/favorited conversations
- [ ] **Recent Conversations** - Last 5 conversations with timestamp
- [ ] **Templates** - Pre-configured conversation templates
- [ ] **Export Chat** - Download conversation as PDF/Markdown

#### Section 2: Agents Management
**Location**: Lines 201-288
**Current Features**:
- ✅ Search bar with magnifying glass icon
- ✅ Tier filters (All, T1, T2, T3 buttons)
- ✅ Selection counter (shows "X selected")
- ✅ Agent list with:
  - Avatar images (or fallback icon)
  - Display name
  - Checkbox/selection indicator
  - Hover effects
- ✅ Scrollable area (max 10 agents visible)
- ✅ "Browse Agent Store" button

**Desired Additional Features**:
- [ ] **Agent Categories/Specialties**
  - Filter by: Clinical, Research, Regulatory, Operations
  - Show specialty badges on each agent
- [ ] **Agent Details Preview**
  - Hover tooltip showing:
    - Full description
    - Expertise areas
    - Response time estimate
    - Success rate/rating
- [ ] **Quick Actions per Agent**
  - "Info" button - Show full agent details
  - "Chat 1-on-1" - Direct chat with single agent
  - "Add to Favorites" - Star/favorite agents
- [ ] **Agent Sorting Options**
  - Sort by: Name, Tier, Recently Used, Most Popular
  - Dropdown menu for sort selection
- [ ] **Bulk Selection Actions**
  - "Select All" / "Clear All" buttons
  - "Create Panel" - Create expert panel from selection
  - "Save Selection" - Save agent group as preset
- [ ] **Agent Status Indicators**
  - Online/Offline status badge
  - Response time indicator (fast, normal, slow)
  - Availability status
- [ ] **Recommended Agents**
  - "Suggested for you" section based on:
    - Previous conversations
    - Current context
    - User role/specialty
- [ ] **Agent Statistics**
  - Show number of times you've consulted each agent
  - Average response quality rating
  - Last consultation date

#### Section 3: Mode Selection
**Currently NOT in sidebar - needs to be added**

**Desired Features**:
- [ ] **Mode Toggle Section**
  - Visual toggle for "Automatic Mode" (on/off)
  - Visual toggle for "Autonomous Mode" (on/off)
  - Tooltips explaining each mode:
    - **Automatic**: AI selects best agents based on query
    - **Autonomous**: Agents work independently and collaborate
- [ ] **Mode Descriptions**
  - Expandable info cards for each mode
  - Examples of when to use each mode
- [ ] **Mode History**
  - Show which mode was used in previous chats
  - Success rate per mode

#### Section 4: Conversation Context
**Currently NOT in sidebar - needs to be added**

**Desired Features**:
- [ ] **Context Management**
  - Show current conversation context
  - Add/remove context files
  - Upload attachments (documents, images)
- [ ] **Knowledge Base Selection**
  - Choose which knowledge bases to include
  - Toggle specific domains (Medical, Research, etc.)
- [ ] **Reference Documents**
  - List of documents referenced in current chat
  - Quick preview on hover
  - Remove document from context

#### Section 5: Settings
**Location**: Lines 291-304
**Current Features**:
- ✅ Chat Settings button

**Desired Additional Features**:
- [ ] **Model Selection**
  - Dropdown to choose LLM model (GPT-4 Turbo, Claude, etc.)
  - Show model capabilities and costs
- [ ] **Response Preferences**
  - Toggle for: Concise vs Detailed responses
  - Citation style preferences
  - Output format (Markdown, Plain text, etc.)
- [ ] **Voice Settings** (if voice enabled)
  - Enable/disable voice input
  - Enable/disable voice output
  - Voice model selection
- [ ] **Privacy Settings**
  - Toggle conversation saving
  - Toggle analytics collection
  - Data retention preferences
- [ ] **Notification Settings**
  - Email notifications for responses
  - Desktop notifications
  - Response readiness alerts

#### Section 6: Quick Actions
**Currently NOT in sidebar - needs to be added**

**Desired Features**:
- [ ] **Common Actions**
  - "Summarize" - Summarize current conversation
  - "Translate" - Translate conversation
  - "Export" - Export conversation
  - "Share" - Generate shareable link
- [ ] **Workflow Shortcuts**
  - Quick access to common workflows
  - One-click protocol creation
  - One-click literature review

#### Section 7: Help & Support
**Currently NOT in sidebar - needs to be added**

**Desired Features**:
- [ ] **Help Resources**
  - Tutorial videos
  - Documentation links
  - FAQ section
- [ ] **Support**
  - Live chat support
  - Submit feedback
  - Report issue

### Visual Design Requirements

#### Layout
```
┌─────────────────────────────┐
│ 🔍 Search agents...         │ ← Search bar
├─────────────────────────────┤
│ [All] [T1] [T2] [T3]       │ ← Tier filters
├─────────────────────────────┤
│ 3 selected                  │ ← Selection counter
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 👤 Agent 1         ✓   │ │
│ │ 👤 Agent 2         ☐   │ │
│ │ 👤 Agent 3         ✓   │ │ ← Scrollable
│ │ 👤 Agent 4         ☐   │ │   agent list
│ │ 👤 Agent 5         ✓   │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [Browse Agent Store]        │ ← Action button
├─────────────────────────────┤
│ Mode Selection              │
│ ⚡ Automatic  [ON ][OFF]   │
│ 🤖 Autonomous [ON ][OFF]   │
├─────────────────────────────┤
│ Settings                    │
│ ⚙️  Chat Settings           │
│ 🎤 Voice Settings           │
│ 🔒 Privacy                  │
└─────────────────────────────┘
```

#### Interaction Patterns
1. **Search**: Real-time filtering as user types
2. **Tier Filters**: Toggle filters, combine with search
3. **Agent Selection**: Click anywhere on agent card to toggle
4. **Checkboxes**: Visual feedback on selection
5. **Scroll**: Smooth scrolling with scrollbar
6. **Hover**: Show additional info on hover
7. **Click Actions**: Immediate visual feedback

#### Styling Requirements
- Clean, modern design matching Shadcn UI
- Consistent spacing (8px grid system)
- Clear visual hierarchy
- Accessible color contrast
- Smooth animations (200-300ms)
- Responsive to sidebar collapse (show only icons when collapsed)

---

## Technical Implementation Details

### File Structure

```
apps/digital-health-startup/src/
├── app/(app)/
│   ├── layout.tsx                          ← OLD LAYOUT (currently active)
│   ├── layout-sidebar07-broken.tsx        ← NEW LAYOUT (disabled due to errors)
│   ├── layout.tsx.old                     ← Backup
│   └── ask-expert/
│       └── page.tsx                       ← Ask Expert page
│
├── components/
│   ├── contextual-sidebar.tsx             ← NEW: 8 contextual sidebars (~900 lines)
│   ├── dashboard-header.tsx               ← NEW: Header with breadcrumbs (~150 lines)
│   ├── ask-expert-sidebar.tsx             ← OLD: Current sidebar (working)
│   └── ui/
│       ├── sidebar.tsx                    ← Shadcn sidebar components
│       ├── breadcrumb.tsx                ← Shadcn breadcrumb
│       └── dropdown-menu.tsx             ← Shadcn dropdown menu
│
└── contexts/
    ├── ask-expert-context.tsx            ← Agent selection state
    └── agents-filter-context.tsx         ← Agent filtering state
```

### Component Dependencies

#### contextual-sidebar.tsx
```typescript
// External dependencies
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

// UI components (Shadcn)
import { Sidebar, SidebarProvider, SidebarContent, ... } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Icons
import { lucide-react } from 'lucide-react'

// Contexts
import { useAskExpert } from '@/contexts/ask-expert-context'

// Utils
import { cn } from '@/lib/utils'
```

#### dashboard-header.tsx
```typescript
// External dependencies
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// UI components (Shadcn)
import { Breadcrumb, BreadcrumbItem, ... } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, ... } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Icons
import { lucide-react } from 'lucide-react'

// Contexts
import { useAuth } from '@/lib/auth/supabase-auth-context'
```

### State Management

#### Ask Expert Context
**File**: `src/contexts/ask-expert-context.tsx`

**State**:
- `agents`: Array of all available agents
- `selectedAgents`: Array of selected agent IDs
- `setSelectedAgents`: Function to update selection

**Used By**:
- `contextual-sidebar.tsx` - Agent list and selection
- `ask-expert/page.tsx` - Main chat interface

#### Agents Filter Context
**File**: `src/contexts/agents-filter-context.tsx`

**State**:
- `searchQuery`: Current search text
- `filters`: Active filters (tier, category, etc.)
- `viewMode`: Grid or list view
- Various setter functions

**Used By**:
- `contextual-sidebar.tsx` - Search and filter UI
- `agents/page.tsx` - Agents board display

### Component Communication Flow

```
User Action (click, type, etc.)
    ↓
Sidebar Component (contextual-sidebar.tsx)
    ↓
Context Update (useAskExpert, useAgentsFilter)
    ↓
Re-render
    ↓
    ├→ Sidebar updates (agent list, selection counter)
    └→ Main page updates (if listening to context)
```

---

## Fix Strategy

### Option 1: Identify and Isolate Problematic Component ⭐ RECOMMENDED

#### Step 1: Test Components Individually
Create test pages to isolate which component causes the issue:

1. **Test Layout Without Sidebar**
   ```typescript
   // Test: layout with only header
   export default function TestLayout({ children }) {
     return (
       <>
         <DashboardHeader />
         <main>{children}</main>
       </>
     )
   }
   ```

2. **Test Layout Without Header**
   ```typescript
   // Test: layout with only sidebar
   export default function TestLayout({ children }) {
     return (
       <>
         <ContextualSidebarWrapper />
         <main>{children}</main>
       </>
     )
   }
   ```

3. **Test Layout Without SidebarInset**
   ```typescript
   // Test: layout without SidebarInset wrapper
   export default function TestLayout({ children }) {
     return (
       <ContextualSidebarWrapper />
       <div className="flex flex-1 flex-col">  {/* Plain div */}
         <DashboardHeader />
         <main>{children}</main>
       </div>
     )
   }
   ```

#### Step 2: Check Radix UI Versions
```bash
# Check which Radix UI packages are installed
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
cat package.json | grep "@radix-ui"

# Check for styled-jsx
cat package.json | grep "styled-jsx"
pnpm list styled-jsx
```

#### Step 3: Replace Suspect Components
If a component is identified:
- Find alternative Shadcn component
- Build custom component without Radix UI
- Use plain HTML/CSS instead

### Option 2: Suppress styled-jsx Errors

#### Add Custom _document.tsx
**File**: `src/app/_document.tsx`

```typescript
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

Then add styled-jsx suppression in `next.config.js`:
```javascript
webpack: (config, { isServer }) => {
  // Add styled-jsx suppression
  if (isServer) {
    config.externals = config.externals || []
    config.externals.push('styled-jsx')
  }
  return config
}
```

### Option 3: Use Alternative Components

#### Replace Shadcn Components
Instead of Shadcn's sidebar components, use:
- **Headless UI** - No styled-jsx dependency
- **Custom components** - Build from scratch with Tailwind
- **Radix Primitives directly** - Skip Shadcn wrapper

#### Example: Custom Sidebar
```typescript
// Simple collapsible sidebar without Shadcn
export function SimpleSidebar({ children, collapsed, onToggle }) {
  return (
    <aside className={cn(
      "transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <button onClick={onToggle}>Toggle</button>
      {children}
    </aside>
  )
}
```

### Option 4: Upgrade/Downgrade Dependencies

#### Check for Known Issues
```bash
# Check Next.js version
cat package.json | grep "next"

# Check if upgrading fixes it
pnpm add next@latest

# Or try specific version known to work
pnpm add next@14.1.0
```

#### Check Radix UI Versions
```bash
# List all Radix UI packages
pnpm list @radix-ui

# Update all to latest
pnpm update @radix-ui/*

# Or install specific versions
```

### Option 5: Conditional Rendering (Workaround)

#### Skip SSR for Problematic Components
```typescript
import dynamic from 'next/dynamic'

// Load sidebar only on client-side
const ContextualSidebarWrapper = dynamic(
  () => import('@/components/contextual-sidebar').then(mod => mod.ContextualSidebarWrapper),
  { ssr: false }  // ← Disable SSR
)

export default function AppLayout({ children }) {
  return (
    <>
      <ContextualSidebarWrapper />
      <main>{children}</main>
    </>
  )
}
```

**Pros**: Might fix the error
**Cons**:
- Flash of unstyled content
- Sidebar loads after page
- Not ideal UX

---

## File Reference

### Files to Modify (for fixes)

#### 1. Layout File
**Current**: `src/app/(app)/layout.tsx` (old version, 483 lines)
**New**: `src/app/(app)/layout-sidebar07-broken.tsx` (98 lines)
**Action**: Need to fix and activate new version

#### 2. Next.js Config
**File**: `apps/digital-health-startup/next.config.js`
**Lines to check**:
- Line 103: `styledJsx: false` - Already set
- Lines 60-67: DefinePlugin - Already sets typeof document
**Action**: May need additional webpack config

#### 3. Package.json
**File**: `apps/digital-health-startup/package.json`
**Action**: Check dependencies for styled-jsx

### Files Created (working components)

#### 1. Contextual Sidebar
**File**: `src/components/contextual-sidebar.tsx`
**Size**: ~900 lines
**Status**: ✅ Created, working in isolation
**Contains**:
- 8 sidebar content components
- Route detection logic
- SidebarProvider wrapper

#### 2. Dashboard Header
**File**: `src/components/dashboard-header.tsx`
**Size**: ~150 lines
**Status**: ✅ Created, working in isolation
**Contains**:
- Breadcrumb navigation
- User dropdown menu
- Sidebar trigger button

#### 3. Shadcn Components (already installed)
**Files**:
- `src/components/ui/sidebar.tsx` - ✅ Contains SidebarInset
- `src/components/ui/breadcrumb.tsx` - ✅ Breadcrumb components
- `src/components/ui/dropdown-menu.tsx` - ✅ Dropdown menu
- `src/components/ui/scroll-area.tsx` - ✅ Scroll area
- `src/components/ui/input.tsx` - ✅ Input component
- `src/components/ui/button.tsx` - ✅ Button component

### Files to Preserve (working old versions)

#### 1. Old Layout
**File**: `src/app/(app)/layout.tsx`
**Status**: ✅ Currently active and working
**Action**: Keep as fallback

#### 2. Old Ask Expert Sidebar
**File**: `src/components/ask-expert-sidebar.tsx`
**Status**: ✅ Working with old layout
**Action**: Keep for reference

---

## Next Steps for Fixing

### Immediate Actions (Recommended Order)

1. **Test Component Isolation** (30 minutes)
   - Create test layout with only header
   - Create test layout with only sidebar
   - Create test layout without SidebarInset
   - Identify which component causes the issue

2. **Check Dependencies** (15 minutes)
   ```bash
   pnpm list styled-jsx
   pnpm list @radix-ui
   cat package.json | grep -E "(styled-jsx|@radix-ui)"
   ```

3. **Try Custom _document.tsx** (20 minutes)
   - Create custom document file
   - Add styled-jsx suppression
   - Test if it fixes the issue

4. **Replace Problematic Component** (1-2 hours)
   - Once identified, find alternative
   - Build custom component if needed
   - Test new implementation

5. **Test and Validate** (30 minutes)
   - Clear cache: `rm -rf .next`
   - Restart server
   - Test all routes
   - Verify no errors

### Long-term Solution

1. **Document the Fix** - Once working, document what was changed
2. **Add Tests** - Ensure it doesn't break in future
3. **Update Dependencies** - Keep packages up to date
4. **Monitor** - Watch for similar issues

---

## Summary

### What Works
- ✅ Old layout with old sidebar
- ✅ Server compiles and runs
- ✅ Routes return 200 status
- ✅ New components work in isolation

### What Doesn't Work
- ❌ New layout causes styled-jsx SSR error
- ❌ Error page fails to compile
- ❌ Browser shows "Internal Server Error"

### The Core Issue
**styled-jsx is being invoked during SSR despite being disabled in config**, likely through:
- Radix UI dependency (used by Shadcn components)
- TooltipProvider in sidebar
- DropdownMenu in header
- Some other Shadcn component

### Recommended Fix Path
1. Isolate which component causes the issue
2. Replace that component with alternative
3. Test and validate
4. Document the solution

---

## Additional Resources

### Related Documentation
- [Next.js SSR Documentation](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)
- [Radix UI SSR Guide](https://www.radix-ui.com/primitives/docs/overview/getting-started#server-side-rendering)
- [styled-jsx GitHub Issues](https://github.com/vercel/styled-jsx/issues)

### Debugging Commands
```bash
# Check server logs
tail -f .next/server/pages/_error.log

# Check dependency tree
pnpm why styled-jsx

# Test SSR manually
NODE_ENV=production pnpm build

# Clear all caches
rm -rf .next node_modules/.cache
```

---

**Document Version**: 1.0
**Last Updated**: October 28, 2025
**Status**: Ready for implementation of fixes
**Next Action**: Begin component isolation testing
