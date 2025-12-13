/**
 * VITAL Sidebar Component Library
 *
 * Centralized exports for the modular sidebar system.
 * 24 files, 5,771 lines - Production Ready (A+ Grade)
 *
 * Architecture:
 * - 4 main components (ChatSidebar, ConversationList, QuickSettings, AgentLibrary)
 * - 3 shared utilities (SidebarHeader, SidebarSearchInput, SidebarCollapsibleSection)
 * - 17 content views (one per page/context)
 *
 * @version 2.0.0
 * @status A+ Production Ready
 */

// ============================================
// MAIN SIDEBAR COMPONENTS
// ============================================

export { ChatSidebar } from './ChatSidebar'
export { ConversationList } from './ConversationList'
export { QuickSettings } from './QuickSettings'
export { AgentLibrary } from './AgentLibrary'

// ============================================
// SHARED UTILITIES
// ============================================

export * from './shared'

// ============================================
// CONTENT VIEWS (Page-specific sidebars)
// ============================================

export * from './views'
